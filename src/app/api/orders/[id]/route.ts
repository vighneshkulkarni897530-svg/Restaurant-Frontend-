import { NextResponse } from 'next/server';
import { getServerStore } from '@/lib/serverStore';

const getBackendUrl = () => process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5000';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const store = getServerStore();
  const id = params.id;

  // 1. Try Express backend
  try {
    const backendRes = await fetch(`${getBackendUrl()}/api/orders/${id}`, {
      headers: {
        'Authorization': req.headers.get('authorization') || '',
      },
      cache: 'no-store',
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data);
    }
  } catch {
    // Backend offline
  }

  // 2. Fallback to serverStore
  const found = store.orders.find((o) => o.id === id || o.orderNumber === id);
  if (!found) {
    return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, order: found, hotel: store.settings });
}
