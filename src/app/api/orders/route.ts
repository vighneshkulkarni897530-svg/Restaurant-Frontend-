import { NextResponse } from 'next/server';
import { getServerStore, ServerOrder } from '@/lib/serverStore';
import { fetchCloudOrders, saveCloudOrder } from '@/lib/cloudOrdersStore';

const getBackendUrl = () => process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5000';

export async function GET(req: Request) {
  const store = getServerStore();
  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get('status');
  const tableIdParam = searchParams.get('tableId');

  // 1. Try forwarding to Express backend first (when running locally or connected to Render backend)
  try {
    const urlObj = new URL(req.url);
    const backendRes = await fetch(`${getBackendUrl()}/api/orders${urlObj.search}`, {
      headers: {
        'Authorization': req.headers.get('authorization') || '',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data.orders && Array.isArray(data.orders)) {
        store.orders = data.orders;
      }
      return NextResponse.json(data);
    }
  } catch {
    // Express backend unavailable (e.g. running standalone on Vercel)
  }

  // 2. Fetch persistent cloud orders (synced across all Vercel instances, phones, and computers)
  const cloudOrders = await fetchCloudOrders();
  let filtered = [...cloudOrders];

  if (statusParam && statusParam !== 'all') {
    const statuses = statusParam.split(',');
    filtered = filtered.filter((o) => statuses.includes(o.status));
  }

  if (tableIdParam && tableIdParam !== 'all') {
    filtered = filtered.filter((o) => o.tableId === tableIdParam);
  }

  return NextResponse.json({ success: true, orders: filtered });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const store = getServerStore();

    if (!body.customerName || typeof body.customerName !== 'string' || body.customerName.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Customer Name is compulsory (minimum 2 characters).' },
        { status: 400 }
      );
    }
    if (!body.customerPhone || typeof body.customerPhone !== 'string' || body.customerPhone.trim().replace(/[\s-]/g, '').length < 10) {
      return NextResponse.json(
        { success: false, message: 'Customer Mobile Number is compulsory (10 digits).' },
        { status: 400 }
      );
    }

    // 1. Attempt to forward order directly to Express Backend (if running locally or on Render)
    try {
      const backendRes = await fetch(`${getBackendUrl()}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (backendRes.ok) {
        const backendData = await backendRes.json();
        if (backendData.order) {
          await saveCloudOrder(backendData.order);
        }
        return NextResponse.json(backendData, { status: 201 });
      }
    } catch {
      // Express backend unavailable, proceed to cloud sync
    }

    // 2. Generate and resolve order for Cloud & ServerStore persistence
    const newOrderNum = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const tableObj =
      store.tables.find((t) => t.id === body.tableId || t.qrToken === body.qrToken) ||
      store.tables[0];

    let computedSubtotal = 0;
    const resolvedItems = (body.items || []).map((it: any, idx: number) => {
      const menuItem = store.menuItems.find((m) => m.id === it.menuItemId);
      const name = it.name || menuItem?.name || 'Gourmet Dish';
      const unitPrice =
        typeof it.unitPrice === 'number'
          ? it.unitPrice
          : menuItem?.price || 0;
      const quantity = Math.max(1, parseInt(it.quantity) || 1);
      const itemTotal =
        typeof it.itemTotal === 'number'
          ? it.itemTotal
          : unitPrice * quantity;

      computedSubtotal += itemTotal;

      return {
        id: `oi_${Date.now()}_${idx}`,
        orderId: `ord_live_${Date.now()}`,
        menuItemId: it.menuItemId || (menuItem ? menuItem.id : `item_${idx}`),
        name,
        quantity,
        unitPrice,
        itemTotal,
        specialInstructions: it.specialInstructions || null,
      };
    });

    const subtotal =
      typeof body.subtotal === 'number' && body.subtotal > 0
        ? body.subtotal
        : computedSubtotal;
    const tax =
      typeof body.tax === 'number' && body.tax > 0
        ? body.tax
        : parseFloat(((subtotal * 5.0) / 100).toFixed(2));
    const serviceCharge =
      typeof body.serviceCharge === 'number' && body.serviceCharge > 0
        ? body.serviceCharge
        : parseFloat(((subtotal * 2.5) / 100).toFixed(2));
    const total =
      typeof body.total === 'number' && body.total > 0
        ? body.total
        : parseFloat((subtotal + tax + serviceCharge).toFixed(2));

    const createdOrder: ServerOrder = {
      id: `ord_live_${Date.now()}`,
      orderNumber: newOrderNum,
      tableId: body.tableId || tableObj.id,
      customerName: body.customerName || 'Dining Guest',
      customerPhone: body.customerPhone || '',
      notes: body.notes || '',
      status: 'NEW',
      paymentStatus: body.paymentMethod === 'CASH' ? 'PENDING' : 'PAID',
      subtotal,
      tax,
      serviceCharge,
      total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      table: tableObj,
      items: resolvedItems,
      payment: {
        id: `pay_live_${Date.now()}`,
        orderId: `ord_live_${Date.now()}`,
        provider: body.paymentMethod === 'CASH' ? 'CASH' : 'ONLINE_RAZORPAY',
        amount: total,
        status: body.paymentMethod === 'CASH' ? 'PENDING' : 'COMPLETED',
        paymentMethod: body.paymentMethod === 'CASH' ? 'Cash at Table' : 'UPI / Online Card',
        createdAt: new Date().toISOString(),
      },
    };

    // Save to persistent cloud store so ALL phones, laptops, and Vercel instances see this order immediately!
    await saveCloudOrder(createdOrder);

    // Update table occupancy in local store
    if (tableObj) {
      tableObj.status = 'OCCUPIED';
    }

    return NextResponse.json({ success: true, order: createdOrder }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}

export async function DELETE() {
  const store = getServerStore();
  store.orders = [];

  // 1. Forward to Express backend
  try {
    await fetch(`${getBackendUrl()}/api/orders/clear`, { method: 'DELETE' });
  } catch {}

  // 2. Clear cloud store
  try {
    const CLOUD_STORE_ID = 'ff808181a09d98f701a0bd3a61014d7e';
    const CLOUD_API_URL = `https://api.restful-api.dev/objects/${CLOUD_STORE_ID}`;
    await fetch(CLOUD_API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Govindas_Orders_Store',
        data: { orders: [], lastUpdated: new Date().toISOString() },
      }),
    });
  } catch {}

  return NextResponse.json({ success: true, message: 'All orders cleared' });
}
