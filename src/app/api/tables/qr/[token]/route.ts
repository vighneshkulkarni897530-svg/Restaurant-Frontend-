import { NextResponse } from 'next/server';
import { getServerStore } from '@/lib/serverStore';

const getBackendUrl = () => process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5000';

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  const store = getServerStore();
  const token = params.token;

  try {
    const backendRes = await fetch(`${getBackendUrl()}/api/tables/qr/${token}`, {
      cache: 'no-store',
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data);
    }
  } catch {
    // Backend offline
  }

  const match = store.tables.find(
    (t) =>
      t.qrToken.toLowerCase() === token.toLowerCase() ||
      t.id.toLowerCase() === token.toLowerCase() ||
      t.tableNumber.toLowerCase() === token.toLowerCase()
  );

  if (!match) {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired table QR code.' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    table: match,
    hotel: store.settings,
  });
}
