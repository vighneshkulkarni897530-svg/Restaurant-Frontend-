import { NextResponse } from 'next/server';
import { getServerStore } from '@/lib/serverStore';

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  const store = getServerStore();
  const token = params.token;
  const match =
    store.tables.find(
      (t) =>
        t.qrToken.toLowerCase() === token.toLowerCase() ||
        t.id.toLowerCase() === token.toLowerCase() ||
        t.tableNumber.toLowerCase() === token.toLowerCase()
    ) || store.tables[0];

  return NextResponse.json({
    success: true,
    table: match,
    hotel: store.settings,
  });
}
