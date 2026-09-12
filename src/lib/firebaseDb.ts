import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Order, WaiterCall, MenuItem, Table } from '../types';

/**
 * Real-time Firestore Sync helper for Govinda's Restaurant
 */

export const firebaseDb = {
  // Sync Order to Firestore
  async saveOrder(order: Order): Promise<boolean> {
    if (!isFirebaseConfigured) return false;
    try {
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
    if (!isFirebaseConfigured) return false;
    try {
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

  // Real-time listener for an individual order (e.g. for customer tracking page)
  listenToOrder(orderId: string, onUpdate: (order: Order) => void): Unsubscribe | null {
    if (!isFirebaseConfigured) return null;
    try {
      const orderRef = doc(db, 'orders', orderId);
      return onSnapshot(orderRef, (snapshot) => {
        if (snapshot.exists()) {
          onUpdate(snapshot.data() as Order);
        }
      });
    } catch (error) {
      console.warn('[Firestore] Failed to listen to order:', error);
      return null;
    }
  },

  // Real-time listener for active orders on Kitchen Display / KDS
  listenToActiveOrders(onUpdate: (orders: Order[]) => void): Unsubscribe | null {
    if (!isFirebaseConfigured) return null;
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('status', 'in', ['NEW', 'ACCEPTED', 'PREPARING', 'READY'])
      );
      return onSnapshot(q, (snapshot) => {
        const list: Order[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Order);
        });
        onUpdate(list);
      });
    } catch (error) {
      console.warn('[Firestore] Failed to listen to active orders:', error);
      return null;
    }
  },

  // Sync Table Assistance Call
  async saveWaiterCall(call: WaiterCall): Promise<boolean> {
    if (!isFirebaseConfigured) return false;
    try {
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

  // Real-time listener for pending table waiter calls
  listenToPendingCalls(onUpdate: (calls: WaiterCall[]) => void): Unsubscribe | null {
    if (!isFirebaseConfigured) return null;
    try {
      const callsRef = collection(db, 'waiter_calls');
      const q = query(callsRef, where('status', '==', 'PENDING'));
      return onSnapshot(q, (snapshot) => {
        const list: WaiterCall[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as WaiterCall);
        });
        onUpdate(list);
      });
    } catch (error) {
      console.warn('[Firestore] Failed to listen to waiter calls:', error);
      return null;
    }
  },

  // Sync menu catalog backup
  async backupMenuCatalog(items: MenuItem[]): Promise<number> {
    if (!isFirebaseConfigured) return 0;
    try {
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
