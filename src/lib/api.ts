const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('hotel_admin_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.statusText}`);
  }

  return data;
}

export const api = {
  // Table
  getTableByQR: (token: string) => fetchApi(`/tables/qr/${token}`),
  listTables: () => fetchApi('/tables'),
  createTable: (data: any) => fetchApi('/tables', { method: 'POST', body: JSON.stringify(data) }),
  updateTable: (id: string, data: any) => fetchApi(`/tables/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTable: (id: string) => fetchApi(`/tables/${id}`, { method: 'DELETE' }),
  regenerateQR: (id: string) => fetchApi(`/tables/${id}/regenerate-qr`, { method: 'POST' }),
  getTableQRCode: (id: string) => fetchApi(`/tables/${id}/qr-code`),

  // Menu
  getCategories: (includeInactive = false) => fetchApi(`/menu/categories?includeInactive=${includeInactive}`),
  createCategory: (data: any) => fetchApi('/menu/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: any) => fetchApi(`/menu/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCategory: (id: string) => fetchApi(`/menu/categories/${id}`, { method: 'DELETE' }),

  getMenuItems: (params: { categoryId?: string; search?: string; isVeg?: string; availableOnly?: boolean }) => {
    const query = new URLSearchParams();
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.search) query.append('search', params.search);
    if (params.isVeg) query.append('isVeg', params.isVeg);
    if (params.availableOnly) query.append('availableOnly', 'true');
    return fetchApi(`/menu/items?${query.toString()}`);
  },
  createMenuItem: (data: any) => fetchApi('/menu/items', { method: 'POST', body: JSON.stringify(data) }),
  updateMenuItem: (id: string, data: any) => fetchApi(`/menu/items/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteMenuItem: (id: string) => fetchApi(`/menu/items/${id}`, { method: 'DELETE' }),
  toggleItemStock: (id: string) => fetchApi(`/menu/items/${id}/toggle-stock`, { method: 'PATCH' }),

  // Orders
  createOrder: (data: any) => fetchApi('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getOrderById: (id: string) => fetchApi(`/orders/${id}`),
  listOrders: (params: { status?: string; tableId?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.tableId) query.append('tableId', params.tableId);
    return fetchApi(`/orders?${query.toString()}`);
  },
  updateOrderStatus: (id: string, status: string) => fetchApi(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  markPaymentReceived: (id: string) => fetchApi(`/orders/${id}/mark-paid`, { method: 'PATCH' }),

  // Payment
  createRazorpayOrder: (amount: number, receipt?: string) => fetchApi('/payments/create-razorpay-order', { method: 'POST', body: JSON.stringify({ amount, receipt }) }),
  verifyPayment: (data: any) => fetchApi('/payments/verify', { method: 'POST', body: JSON.stringify(data) }),
  listPayments: () => fetchApi('/payments'),

  // Waiter Call
  callWaiter: (data: { tableId?: string; qrToken?: string; requestType: string; notes?: string }) => fetchApi('/waiter/call', { method: 'POST', body: JSON.stringify(data) }),
  listPendingWaiterCalls: () => fetchApi('/waiter/pending'),
  attendWaiterCall: (id: string) => fetchApi(`/waiter/${id}/attend`, { method: 'PATCH' }),

  // Reports
  getDashboardOverview: () => fetchApi('/reports/overview'),
  getSalesReport: () => fetchApi('/reports/sales'),

  // Settings
  getHotelSettings: () => fetchApi('/settings'),
  updateHotelSettings: (data: any) => fetchApi('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Auth
  login: (credentials: { email: string; password: string }) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => fetchApi('/auth/me'),
  listStaff: () => fetchApi('/auth/staff'),
  createStaff: (data: any) => fetchApi('/auth/staff', { method: 'POST', body: JSON.stringify(data) }),
};
