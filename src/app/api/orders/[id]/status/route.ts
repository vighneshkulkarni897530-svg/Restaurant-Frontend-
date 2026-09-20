import { NextResponse } from 'next/server';
import { getServerStore } from '@/lib/serverStore';
import { updateCloudOrderStatus } from '@/lib/cloudOrdersStore';

const getBackendUrl = () => process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5000';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    const store = getServerStore();

    // 1. Try Express backend
    try {
      const backendRes = await fetch(`${getBackendUrl()}/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': req.headers.get('authorization') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        const idx = store.orders.findIndex((o) => o.id === id || o.orderNumber === id);
        if (idx !== -1 && data.order) {
          store.orders[idx] = data.order;
        }
        if (data.order && body.status) {
          await updateCloudOrderStatus(id, body.status);
        }
        return NextResponse.json(data);
      }
    } catch {
      // Backend offline
    }

    // 2. Update cloud store & serverStore
    if (body.status) {
      const updated = await updateCloudOrderStatus(id, body.status);
      if (updated) {
        return NextResponse.json({ success: true, order: updated });
      }
    }

    const target = store.orders.find((o) => o.id === id || o.orderNumber === id);
    if (target) {
      if (body.status) target.status = body.status;
      target.updatedAt = new Date().toISOString();
      return NextResponse.json({ success: true, order: target });
    }

    return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
