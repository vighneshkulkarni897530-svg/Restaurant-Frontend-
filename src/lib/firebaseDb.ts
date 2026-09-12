import type { Unsubscribe } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Order, WaiterCall, MenuItem, Table } from '../types';

/**
 * Real-time Firestore Sync helper for Govinda's Restaurant
 */

export const firebaseDb = {
  // Sync Order to Firestore
  async saveOrder(order: Order): Promise<boolean> {
    if (!isFirebaseConfigured || !db) return false;
    try {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const orderRef = doc(db, 'orders', order.id);
      await setDoc(
        orderRef,
        {
          ...order,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
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
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.warn('[Firestore] Failed to update order status:', error);
      return false;
    }
  },

  // Real-time listener for an individual order
  listenToOrder(orderId: string, onUpdate: (order: Order) => void): (() => void) | null {
    if (!isFirebaseConfigured || !db) return null;
    let unsub: Unsubscribe | null = null;
    import('firebase/firestore').then(({ doc, onSnapshot }) => {
      if (!db) return;
      const orderRef = doc(db, 'orders', orderId);
      unsub = onSnapshot(orderRef, (snapshot) => {
        if (snapshot.exists()) {
          onUpdate(snapshot.data() as Order);
        }
      });
    }).catch((error) => {
      console.warn('[Firestore] Failed to listen to order:', error);
    });

    return () => {
      if (unsub) unsub();
    };
  },

  // Real-time listener for active orders on Kitchen Display / KDS
  listenToActiveOrders(onUpdate: (orders: Order[]) => void): (() => void) | null {
    if (!isFirebaseConfigured || !db) return null;
    let unsub: Unsubscribe | null = null;
    import('firebase/firestore').then(({ collection, query, where, onSnapshot }) => {
      if (!db) return;
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('status', 'in', ['NEW', 'ACCEPTED', 'PREPARING', 'READY'])
      );
      unsub = onSnapshot(q, (snapshot) => {
        const list: Order[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Order);
        });
        onUpdate(list);
      });
    }).catch((error) => {
      console.warn('[Firestore] Failed to listen to active orders:', error);
    });

    return () => {
      if (unsub) unsub();
    };
  },

  // Sync Table Assistance Call
  async saveWaiterCall(call: WaiterCall): Promise<boolean> {
    if (!isFirebaseConfigured || !db) return false;
    try {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const callRef = doc(db, 'waiter_calls', call.id);
      await setDoc(
        callRef,
        {
          ...call,
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

  // Sync menu catalog backup
  async backupMenuCatalog(items: MenuItem[]): Promise<number> {
    if (!isFirebaseConfigured || !db) return 0;
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      let count = 0;
      for (const item of items) {
        const itemRef = doc(db, 'menu_items', item.id);
        await setDoc(itemRef, item, { merge: true });
        count++;
      }
      return count;
    } catch (error) {
      console.warn('[Firestore] Failed to backup menu:', error);
      return 0;
    }
  },
};
