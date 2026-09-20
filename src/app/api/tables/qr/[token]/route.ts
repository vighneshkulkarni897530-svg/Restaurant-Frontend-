import { NextResponse } from 'next/server';
import { getServerStore } from '@/lib/serverStore';

const getBackendUrl = () => process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5000';

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  const store = getServerStore();
  const token = params.token;

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'QR token is required' },
      { status: 400 }
    );
  }

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
    } else if (backendRes.status === 404) {
      const data = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, message: data.message || 'Invalid or inactive table QR code.' },
        { status: 404 }
      );
    }
  } catch {
    // Backend offline / Next.js standalone mode
  }

  // 2. Exact or normalized match in server store
  const padded = token.padStart(2, '0');
  let match = store.tables.find(
    (t) =>
      t.qrToken.toLowerCase() === token.toLowerCase() ||
      t.id.toLowerCase() === token.toLowerCase() ||
      t.tableNumber.toLowerCase() === token.toLowerCase() ||
      t.tableNumber.toLowerCase() === padded.toLowerCase()
  );

  if (!match) {
    return NextResponse.json(
      { success: false, message: 'Invalid or inactive table QR code.' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    table: match,
    hotel: store.settings,
  });
}
