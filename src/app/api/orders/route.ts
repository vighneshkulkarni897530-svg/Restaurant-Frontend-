import { NextResponse } from 'next/server';
import { getServerStore, ServerOrder } from '@/lib/serverStore';

export async function GET(req: Request) {
  const store = getServerStore();
  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get('status');
  const tableIdParam = searchParams.get('tableId');

  let filtered = [...store.orders];

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

    store.orders.unshift(createdOrder);

    return NextResponse.json({ success: true, order: createdOrder });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
