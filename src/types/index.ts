export type Role = 'ADMIN' | 'STAFF' | 'CHEF' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Table {
  id: string;
  tableNumber: string;
  qrToken: string;
  capacity: number;
  section: string;
  status: 'ACTIVE' | 'OCCUPIED' | 'RESERVED' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  orders?: Order[];
  waiterCalls?: WaiterCall[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  _count?: {
    menuItems: number;
  };
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isVeg: boolean;
  isAvailable: boolean;
  isChefSpecial: boolean;
  spicyLevel: number; // 0: None, 1: Mild, 2: Medium, 3: Hot
  preparationTimeMin: number;
  calories?: number;
  sortOrder: number;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export type OrderStatus = 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
  specialInstructions?: string;
  menuItem?: MenuItem;
}

export interface Payment {
  id: string;
  orderId: string;
  provider: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  paymentMethod?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableId: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  table?: {
    id: string;
    tableNumber: string;
    section: string;
    qrToken?: string;
  };
  items: OrderItem[];
  payment?: Payment;
}

export interface WaiterCall {
  id: string;
  tableId: string;
  requestType: 'CALL_WAITER' | 'WATER_REFILL' | 'CLEAN_TABLE' | 'REQUEST_BILL';
  status: 'PENDING' | 'ATTENDED';
  notes?: string;
  createdAt: string;
  table?: {
    tableNumber: string;
    section: string;
  };
}

export interface HotelSetting {
  id: string;
  hotelName: string;
  tagline: string;
  logoUrl?: string;
  address: string;
  phone: string;
  email: string;
  currencySymbol: string;
  taxRatePercent: number;
  serviceChargePercent: number;
  wifiSsid: string;
  wifiPassword: string;
  enableOnlinePayment: boolean;
  enableCashPayment: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}
