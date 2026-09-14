import { NextResponse } from 'next/server';
import { getServerStore } from '@/lib/serverStore';

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  const store = getServerStore();
  const token = params.token;
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
