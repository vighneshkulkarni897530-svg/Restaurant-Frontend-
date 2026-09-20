import type { Unsubscribe } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Order, WaiterCall, MenuItem } from '../types';

/**
 * Real-time Firestore Sync helper for TableTap / Govinda's Restaurant
 * Ensures live multi-device synchronization across customer mobile phones,
 * Kitchen Display System (KDS), and Admin/Cashier dashboards.
 */

function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = sanitizeForFirestore(value);
    }
  }
  return result;
}

export const firebaseDb = {
  // Sync Order to Firestore
  async saveOrder(order: Order): Promise<boolean> {
    if (!isFirebaseConfigured || !db) return false;
    try {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const orderId = order.id || order.orderNumber;
      if (!orderId) return false;
      const orderRef = doc(db, 'orders', orderId);
      const cleanData = sanitizeForFirestore(order);
      await setDoc(
        orderRef,
        {
          ...cleanData,
          updatedAt: serverTimestamp(),
          syncedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      console.log('[Firestore] Order successfully synchronized to cloud:', orderId);
      return true;
    } catch (error) {
      console.warn('[Firestore] Failed to save order:', error);
      return false;
    }
  },

  // Update Order Status in Firestore
  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    if (!isFirebaseConfigured || !db) return false;
    try {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const orderRef = doc(db, 'orders', orderId);
      await setDoc(
        orderRef,
        {
          status,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      console.log('[Firestore] Order status updated in cloud:', orderId, status);
      return true;
    } catch (error) {
      console.warn('[Firestore] Failed to update order status:', error);
      return false;
    }
  },

  // Mark Order Paid in Firestore
  async markOrderPaid(orderId: string): Promise<boolean> {
    if (!isFirebaseConfigured || !db) return false;
    try {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const orderRef = doc(db, 'orders', orderId);
      await setDoc(
        orderRef,
        {
          paymentStatus: 'PAID',
          'payment.status': 'COMPLETED',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      console.log('[Firestore] Order marked paid in cloud:', orderId);
      return true;
    } catch (error) {
      console.warn('[Firestore] Failed to mark order paid:', error);
      return false;
    }
  },

  // Clear all orders in Firestore
  async clearAllOrders(): Promise<boolean> {
    if (!isFirebaseConfigured || !db) return false;
    const firestore = db;
    try {
      const { collection, getDocs, deleteDoc } = await import('firebase/firestore');
      const ordersRef = collection(firestore, 'orders');
      const snapshot = await getDocs(ordersRef);
      const deletePromises: Promise<void>[] = [];
      snapshot.forEach((d) => {
        deletePromises.push(deleteDoc(d.ref));
      });
      await Promise.all(deletePromises);
      console.log(`[Firestore] Deleted ${deletePromises.length} cloud order(s).`);
      return true;
    } catch (error) {
      console.warn('[Firestore] Failed to clear cloud orders:', error);
      return false;
    }
  },

  // Real-time listener for an individual order (Customer order tracking page)
  listenToOrder(orderId: string, onUpdate: (order: Order) => void): (() => void) | null {
    if (!isFirebaseConfigured || !db) return null;
    let unsub: Unsubscribe | null = null;
    let isCancelled = false;

    import('firebase/firestore')
      .then(({ doc, onSnapshot }) => {
        if (!db || isCancelled) return;
        const orderRef = doc(db, 'orders', orderId);
        unsub = onSnapshot(
          orderRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              onUpdate(data as Order);
            }
          },
          (err) => {
            console.warn('[Firestore] Order listener notice:', err);
          }
        );
      })
      .catch((error) => {
        console.warn('[Firestore] Failed to attach order listener:', error);
      });

    return () => {
      isCancelled = true;
      if (unsub) unsub();
    };
  },

  // Real-time listener for all orders (Admin / Manager dashboard)
  listenToAllOrders(onUpdate: (orders: Order[]) => void): (() => void) | null {
    if (!isFirebaseConfigured || !db) return null;
    let unsub: Unsubscribe | null = null;
    let isCancelled = false;

    import('firebase/firestore')
      .then(({ collection, onSnapshot }) => {
        if (!db || isCancelled) return;
        const ordersRef = collection(db, 'orders');
        unsub = onSnapshot(
          ordersRef,
          (snapshot) => {
            const list: Order[] = [];
            snapshot.forEach((d) => {
              const item = d.data() as Order;
              if (item && item.id) {
                list.push(item);
              }
            });
            // Sort descending by createdAt
            list.sort((a, b) => {
              const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return timeB - timeA;
            });
            onUpdate(list);
          },
          (err) => {
            console.warn('[Firestore] All orders listener notice:', err);
          }
        );
      })
      .catch((error) => {
        console.warn('[Firestore] Failed to attach all orders listener:', error);
      });

    return () => {
      isCancelled = true;
      if (unsub) unsub();
    };
  },

  // Real-time listener for active kitchen orders (KDS)
  listenToActiveOrders(onUpdate: (orders: Order[]) => void): (() => void) | null {
    if (!isFirebaseConfigured || !db) return null;
    let unsub: Unsubscribe | null = null;
    let isCancelled = false;

    import('firebase/firestore')
      .then(({ collection, query, where, onSnapshot }) => {
        if (!db || isCancelled) return;
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('status', 'in', ['NEW', 'ACCEPTED', 'PREPARING', 'READY'])
        );
        unsub = onSnapshot(
          q,
          (snapshot) => {
            const list: Order[] = [];
            snapshot.forEach((d) => {
              const item = d.data() as Order;
              if (item && item.id) {
                list.push(item);
              }
            });
            list.sort((a, b) => {
              const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return timeB - timeA;
            });
            onUpdate(list);
          },
          (err) => {
            console.warn('[Firestore] Active orders listener notice:', err);
          }
        );
      })
      .catch((error) => {
        console.warn('[Firestore] Failed to attach active orders listener:', error);
      });

    return () => {
      isCancelled = true;
      if (unsub) unsub();
    };
  },

  // Sync Table Assistance Call
  async saveWaiterCall(call: WaiterCall): Promise<boolean> {
    if (!isFirebaseConfigured || !db) return false;
    try {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const callId = call.id || `call_${Date.now()}`;
      const callRef = doc(db, 'waiter_calls', callId);
      const cleanData = sanitizeForFirestore(call);
      await setDoc(
        callRef,
        {
          ...cleanData,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return true;
    } catch (error) {
      console.warn('[Firestore] Failed to save waiter call:', error);
      return false;
    }
  },

  // Listen to pending waiter calls
  listenToPendingWaiterCalls(onUpdate: (calls: WaiterCall[]) => void): (() => void) | null {
    if (!isFirebaseConfigured || !db) return null;
    let unsub: Unsubscribe | null = null;
    let isCancelled = false;

    import('firebase/firestore')
      .then(({ collection, query, where, onSnapshot }) => {
        if (!db || isCancelled) return;
        const callsRef = collection(db, 'waiter_calls');
        const q = query(callsRef, where('status', '==', 'PENDING'));
        unsub = onSnapshot(
          q,
          (snapshot) => {
            const list: WaiterCall[] = [];
            snapshot.forEach((d) => {
              list.push(d.data() as WaiterCall);
            });
            onUpdate(list);
          },
          (err) => {
            console.warn('[Firestore] Waiter calls listener notice:', err);
          }
        );
      })
      .catch((error) => {
        console.warn('[Firestore] Failed to listen to waiter calls:', error);
      });

    return () => {
      isCancelled = true;
      if (unsub) unsub();
    };
  },

  // Attend / resolve waiter call
  async attendWaiterCall(callId: string): Promise<boolean> {
    if (!isFirebaseConfigured || !db) return false;
    try {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const callRef = doc(db, 'waiter_calls', callId);
      await setDoc(
        callRef,
        {
          status: 'RESOLVED',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return true;
    } catch (error) {
      console.warn('[Firestore] Failed to attend waiter call:', error);
      return false;
    }
  },

  // Sync menu catalog backup
  async backupMenuCatalog(items: MenuItem[]): Promise<number> {
    if (!isFirebaseConfigured || !db) return 0;
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      let count = 0;
      for (const item of items) {
        const itemRef = doc(db, 'menu_items', item.id);
        const cleanItem = sanitizeForFirestore(item);
        await setDoc(itemRef, cleanItem, { merge: true });
        count++;
      }
      return count;
    } catch (error) {
      console.warn('[Firestore] Failed to backup menu:', error);
      return 0;
    }
  },
};
