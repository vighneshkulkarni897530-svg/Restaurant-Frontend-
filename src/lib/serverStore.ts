import {
  DEMO_CATEGORIES,
  DEMO_MENU_ITEMS,
  DEMO_TABLES,
  DEMO_SETTINGS,
} from './api';

export interface ServerOrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
  specialInstructions?: string | null;
}

export interface ServerPayment {
  id: string;
  orderId: string;
  provider: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

export interface ServerOrder {
  id: string;
  orderNumber: string;
  tableId: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
  status: 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  table: any;
  items: ServerOrderItem[];
  payment?: ServerPayment;
}

export interface ServerStore {
  categories: any[];
  menuItems: any[];
  tables: any[];
  settings: any;
  orders: ServerOrder[];
}

const globalForStore = globalThis as unknown as {
  serverStore?: ServerStore;
};

export function getServerStore(): ServerStore {
  if (!globalForStore.serverStore) {
    globalForStore.serverStore = {
      categories: JSON.parse(JSON.stringify(DEMO_CATEGORIES)),
      menuItems: JSON.parse(JSON.stringify(DEMO_MENU_ITEMS)),
      tables: JSON.parse(JSON.stringify(DEMO_TABLES)),
      settings: JSON.parse(JSON.stringify(DEMO_SETTINGS)),
      orders: [
        {
          id: 'ord_demo_1001',
          orderNumber: 'ORD-1001',
          tableId: 'tbl_palms_02_b8e2',
          customerName: 'Aarav Patel',
          customerPhone: '+91 98765 43210',
          notes: 'Extra spicy, less oil please.',
          status: 'PREPARING',
          paymentStatus: 'PAID',
          subtotal: 950,
          tax: 47.5,
          serviceCharge: 23.75,
          total: 1021.25,
          createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
          table: DEMO_TABLES[1],
          items: [
            {
              id: 'item_01',
              orderId: 'ord_demo_1001',
              menuItemId: 'item_01',
              name: 'Truffle Butter Glazed Paneer Steak',
              quantity: 1,
              unitPrice: 490,
              itemTotal: 490,
              specialInstructions: 'Extra truffle glaze',
            },
            {
              id: 'item_03',
              orderId: 'ord_demo_1001',
              menuItemId: 'item_03',
              name: 'Royal Awadhi Dum Biryani',
              quantity: 1,
              unitPrice: 460,
              itemTotal: 460,
              specialInstructions: 'With raita',
            },
          ],
          payment: {
            id: 'pay_demo_1001',
            orderId: 'ord_demo_1001',
            provider: 'ONLINE_RAZORPAY',
            amount: 1021.25,
            status: 'COMPLETED',
            paymentMethod: 'UPI (GPay)',
            createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
          },
        },
      ],
    };
  }

  return globalForStore.serverStore;
}
