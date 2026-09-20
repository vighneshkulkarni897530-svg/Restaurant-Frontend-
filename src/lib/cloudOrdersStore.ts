import { ServerOrder, getServerStore } from './serverStore';

// Dedicated cloud storage object for Govinda's Restaurant orders on Vercel / serverless
const CLOUD_STORE_ID = 'ff808181a09d98f701a0bd3a61014d7e';
const CLOUD_API_URL = `https://api.restful-api.dev/objects/${CLOUD_STORE_ID}`;

export async function fetchCloudOrders(): Promise<ServerOrder[]> {
  try {
    const res = await fetch(CLOUD_API_URL, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.data?.orders && Array.isArray(data.data.orders)) {
        return data.data.orders;
      }
    }
  } catch (err) {
    console.warn('[CloudStore] Failed to fetch cloud orders:', err);
  }

  // Fallback to local serverStore
  const localStore = getServerStore();
  return localStore.orders;
}

export async function saveCloudOrder(newOrder: ServerOrder): Promise<ServerOrder[]> {
  const localStore = getServerStore();
  localStore.orders.unshift(newOrder);

  try {
    const currentOrders = await fetchCloudOrders();
    const updated = [newOrder, ...currentOrders.filter((o) => o.id !== newOrder.id && o.orderNumber !== newOrder.orderNumber)];

    // Keep most recent 100 orders
    const trimmed = updated.slice(0, 100);

    await fetch(CLOUD_API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Govindas_Orders_Store',
        data: {
          orders: trimmed,
          lastUpdated: new Date().toISOString(),
        },
      }),
    });

    return trimmed;
  } catch (err) {
    console.warn('[CloudStore] Failed to sync order to cloud:', err);
    return localStore.orders;
  }
}

export async function updateCloudOrderStatus(orderId: string, status: string): Promise<ServerOrder | null> {
  const localStore = getServerStore();
  const localTarget = localStore.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
  if (localTarget) {
    localTarget.status = status as any;
    localTarget.updatedAt = new Date().toISOString();
  }

  try {
    const currentOrders = await fetchCloudOrders();
    let updatedOrder: ServerOrder | null = null;

    const updated = currentOrders.map((o) => {
      if (o.id === orderId || o.orderNumber === orderId) {
        updatedOrder = {
          ...o,
          status: status as any,
          updatedAt: new Date().toISOString(),
        };
        return updatedOrder;
      }
      return o;
    });

    if (updatedOrder) {
      await fetch(CLOUD_API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Govindas_Orders_Store',
          data: {
            orders: updated,
            lastUpdated: new Date().toISOString(),
          },
        }),
      });
      return updatedOrder;
    }
  } catch (err) {
    console.warn('[CloudStore] Failed to update order in cloud:', err);
  }

  return localTarget || null;
}

export async function markCloudOrderPaid(orderId: string): Promise<ServerOrder | null> {
  const localStore = getServerStore();
  const localTarget = localStore.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
  if (localTarget) {
    localTarget.paymentStatus = 'PAID';
    if (localTarget.payment) {
      localTarget.payment.status = 'COMPLETED';
    }
    localTarget.updatedAt = new Date().toISOString();
  }

  try {
    const currentOrders = await fetchCloudOrders();
    let updatedOrder: ServerOrder | null = null;

    const updated = currentOrders.map((o) => {
      if (o.id === orderId || o.orderNumber === orderId) {
        updatedOrder = {
          ...o,
          paymentStatus: 'PAID',
          payment: o.payment ? { ...o.payment, status: 'COMPLETED' } : undefined,
          updatedAt: new Date().toISOString(),
        };
        return updatedOrder;
      }
      return o;
    });

    if (updatedOrder) {
      await fetch(CLOUD_API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Govindas_Orders_Store',
          data: {
            orders: updated,
            lastUpdated: new Date().toISOString(),
          },
        }),
      });
      return updatedOrder;
    }
  } catch (err) {
    console.warn('[CloudStore] Failed to mark order paid in cloud:', err);
  }

  return localTarget || null;
}
