import { NextResponse } from 'next/server';
import { getServerStore } from '@/lib/serverStore';

const getBackendUrl = () => process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5000';

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  const store = getServerStore();
  const token = params.token;

  // 1. Try Express backend if available
  try {
    const backendRes = await fetch(`${getBackendUrl()}/api/tables/qr/${token}`, {
      cache: 'no-store',
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data.table) {
        return NextResponse.json(data);
      }
    }
  } catch {
    // Backend offline
  }

  // 2. Exact match in server store
  let match = store.tables.find(
    (t) =>
      t.qrToken.toLowerCase() === token.toLowerCase() ||
      t.id.toLowerCase() === token.toLowerCase() ||
      t.tableNumber.toLowerCase() === token.toLowerCase()
  );

  // 3. Smart fallback: Extract table number from token string (e.g. tbl_palms_01_a9f1 -> "01")
  if (!match) {
    const digits = token.match(/\d+/);
    const tableNum = digits ? digits[0].padStart(2, '0') : '01';
    match = store.tables.find(
      (t) => t.tableNumber === tableNum || parseInt(t.tableNumber) === parseInt(tableNum)
    );

    if (!match) {
      match = {
        id: `tbl_${token}`,
        tableNumber: tableNum,
        capacity: 4,
        section: 'Main Dining Area',
        qrToken: token,
        status: 'ACTIVE',
      };
      store.tables.push(match);
    }
  }

  return NextResponse.json({
    success: true,
    table: match,
    hotel: store.settings,
  });
}
