import { Order } from '../types/index';

/**
 * Robust order reconciliation and merging utility.
 * Prevents race conditions, empty cloud listener wipes, and out-of-order state updates.
 */
export function mergeOrders(
  currentOrders: Order[] = [],
  incomingOrders: Order[] = []
): Order[] {
  if (!incomingOrders || !Array.isArray(incomingOrders)) {
    return currentOrders || [];
  }

  // If incoming is empty and we already have existing orders, keep current orders
  if (incomingOrders.length === 0) {
    return currentOrders || [];
  }

  // Clean incoming orders (filter mock demo artifacts)
  const cleanIncoming = incomingOrders.filter(
    (o) =>
      o &&
      (o.id || o.orderNumber) &&
      !o.id?.startsWith('ord_demo_')
  );

  const orderMap = new Map<string, Order>();

  // 1. First add existing state
  (currentOrders || []).forEach((order) => {
    if (order && !order.id?.startsWith('ord_demo_')) {
      const key = order.id || order.orderNumber;
      if (key) {
        orderMap.set(key, order);
      }
    }
  });

  // 2. Merge or update incoming orders
  cleanIncoming.forEach((order) => {
    const key = order.id || order.orderNumber;
    if (key) {
      const existing = orderMap.get(key);
      if (existing) {
        // Merge properties, prioritizing the newer status / payment data
        orderMap.set(key, {
          ...existing,
          ...order,
          // Preserve items if incoming item list is missing or empty
          items: (order.items && order.items.length > 0) ? order.items : existing.items,
          // Preserve table info if incoming is incomplete
          table: order.table || existing.table,
        });
      } else {
        orderMap.set(key, order);
      }
    }
  });

  const merged = Array.from(orderMap.values());

  // 3. Sort by createdAt descending (most recent first)
  merged.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  return merged;
}
