'use client';

import React, { useEffect, useState } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  Receipt,
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  UtensilsCrossed,
  CreditCard,
  Banknote,
  X,
  Eye,
  FileText,
  User,
  Phone,
  ArrowUpDown,
  Sparkles,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import ReceiptModal from '../../../components/ReceiptModal';
import { api, subscribeToLocalOrderEvents } from '../../../lib/api';
import { getSocket } from '../../../lib/socket';
import { playSound } from '../../../lib/audio';
import { firebaseDb } from '../../../lib/firebaseDb';
import { Order, OrderStatus } from '../../../types';
import { mergeOrders } from '../../../lib/orderSync';

export default function OrderDetailsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all'); // Default to All Orders so new orders are instantly visible
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const loadOrders = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await api.listOrders({
        status: statusFilter === 'all' ? undefined : statusFilter,
        tableId: tableFilter === 'all' ? undefined : tableFilter,
      });
      if (res.orders && Array.isArray(res.orders)) {
        const cleanOrders = res.orders.filter(
          (o: Order) => !o.id?.startsWith('ord_demo_')
        );

        // Background sync to Firestore
        cleanOrders.forEach((o: Order) => {
          firebaseDb.saveOrder(o).catch(() => {});
        });

        setOrders((prev) => mergeOrders(prev, cleanOrders));
      }
    } catch (e) {
      console.error('Failed to load order details:', e);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const handleResetAllOrders = async () => {
    if (
      !window.confirm(
        '⚠️ Reset System: Are you sure you want to remove ALL orders and start fresh from ORD-1001?\n\nThis will clear all orders, database records, and reset table statuses to Available.'
      )
    ) {
      return;
    }
    setIsLoading(true);
    try {
      setOrders([]);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hotel_mock_orders', JSON.stringify([]));
        localStorage.removeItem('hotel_current_order_id');
      }
      await api.clearAllOrders();
      await firebaseDb.clearAllOrders();
      playSound('success');
      setOrders([]);
      await loadOrders(false);
    } catch (e) {
      console.error('Failed to reset orders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(true);

    const interval = setInterval(() => {
      loadOrders(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [statusFilter, tableFilter]);

  // Real-Time Firebase Firestore, Socket & Cross-Tab Listener
  useEffect(() => {
    const unsubFirestore = firebaseDb.listenToAllOrders((firestoreOrders) => {
      if (firestoreOrders && Array.isArray(firestoreOrders) && firestoreOrders.length > 0) {
        const cleanOrders = firestoreOrders.filter(
          (o: Order) => !o.id?.startsWith('ord_demo_')
        );
        setOrders((prev) => mergeOrders(prev, cleanOrders));
        setIsLoading(false);
      }
    });

    const socket = getSocket();
    socket.emit('join_admin');

    const handleEvent = (data?: any) => {
      if (data && (data.id || data.orderNumber)) {
        setOrders((prev) => mergeOrders(prev, [data]));
      } else {
        loadOrders(false);
      }
    };

    socket.on('order:new', handleEvent);
    socket.on('order:status_updated', handleEvent);

    const unsubscribeLocal = subscribeToLocalOrderEvents((event, data) => {
      if (data && (data.id || data.orderNumber)) {
        setOrders((prev) => mergeOrders(prev, [data]));
      } else {
        loadOrders(false);
      }
    });

    return () => {
      if (unsubFirestore) unsubFirestore();
      socket.off('order:new', handleEvent);
      socket.off('order:status_updated', handleEvent);
      unsubscribeLocal();
    };
  }, []);

  const handleOpenReceipt = (order: Order) => {
    setSelectedReceiptOrder(order);
    setIsReceiptOpen(true);
  };

  const handleOpenDetailModal = (order: Order) => {
    setSelectedDetailOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleExportCSV = () => {
    if (orders.length === 0) return;
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'Order Number,Table,Customer Name,Phone,Items,Subtotal,Tax,Service Charge,Grand Total,Payment Status,Payment Method,Order Status,Date Time\n';

    filteredOrders.forEach((o) => {
      const itemsList = o.items.map((i) => `${i.name} (x${i.quantity})`).join(' | ');
      const dateStr = new Date(o.createdAt).toLocaleString();
      csv += `"${o.orderNumber}","Table ${o.table?.tableNumber || 'N/A'} - ${o.table?.section || ''}","${o.customerName || 'Guest'}","${o.customerPhone || ''}","${itemsList}",${o.subtotal},${o.tax},${o.serviceCharge},${o.total},"${o.paymentStatus}","${o.payment?.paymentMethod || o.payment?.provider || ''}","${o.status}","${dateStr}"\n`;
    });

    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `Govindas_Orders_${statusFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Search
  const filteredOrders = orders.filter((o) => {
    if (paymentFilter !== 'all' && o.paymentStatus !== paymentFilter) {
      return false;
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customerName?.toLowerCase().includes(q);
      const matchPhone = o.customerPhone?.toLowerCase().includes(q);
      const matchTable = o.table?.tableNumber.toLowerCase().includes(q);
      const matchItem = o.items.some((i) => i.name.toLowerCase().includes(q));
      return matchNum || matchName || matchPhone || matchTable || matchItem;
    }

    return true;
  });

  // Calculate stats for current view
  const totalRevenue = filteredOrders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.total, 0);

  const completedCount = filteredOrders.filter((o) => o.status === 'COMPLETED').length;
  const avgBill = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

  const tableList = Array.from(new Set(orders.map((o) => o.table?.tableNumber).filter(Boolean))).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ClipboardList className="w-7 h-7 text-amber-400" />
            <span>Order Details & Completed Orders</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete tabular register of customer dining orders, item breakdowns, bill settlements, and receipts.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => loadOrders(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleResetAllOrders}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-semibold transition-colors"
            title="Wipe all orders from database & start fresh from ORD-1001"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset Orders</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gold-gradient-bg text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Table CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-card border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Filtered Orders</span>
          <div className="text-2xl font-black text-white mt-1">{filteredOrders.length}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">{completedCount} Marked Completed</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Settled Revenue</span>
          <div className="text-2xl font-black text-white gold-gradient-text mt-1">₹{totalRevenue.toFixed(2)}</div>
          <p className="text-[10px] text-emerald-400 mt-0.5">Paid order revenue</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Order Size</span>
          <div className="text-2xl font-black text-white mt-1">₹{avgBill.toFixed(2)}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Per dining table ticket</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active View</span>
          <div className="text-base font-extrabold text-amber-400 mt-1 uppercase truncate">
            {statusFilter === 'all' ? 'All Orders History' : `${statusFilter} Orders`}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Showing in table below</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-slate-800">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'NEW,ACCEPTED,PREPARING,READY', label: 'Active Pipeline' },
            { id: 'SERVED', label: 'Served at Table' },
            { id: 'COMPLETED', label: 'Completed Orders' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${statusFilter === tab.id
                  ? 'gold-gradient-bg text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Table Filter */}
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Tables</option>
            {tableList.map((t) => (
              <option key={t} value={t}>
                Table {t}
              </option>
            ))}
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Payments</option>
            <option value="PAID">PAID</option>
            <option value="PENDING">PENDING</option>
          </select>

          {/* Search Box */}
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order #, dish, customer..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Comprehensive Orders Table Form */}
      <div className="overflow-x-auto rounded-3xl glass-panel border border-slate-800 shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/95 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Order # & Time</th>
              <th className="p-4">Table</th>
              <th className="p-4">Customer</th>
              <th className="p-4 min-w-[220px]">Dishes & Items</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredOrders.map((order) => {
              const isCompleted = order.status === 'COMPLETED';
              const isPaid = order.paymentStatus === 'PAID';
              const dateStr = new Date(order.createdAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              });
              const timeStr = new Date(order.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <tr
                  key={order.id}
                  onClick={() => handleOpenDetailModal(order)}
                  className="hover:bg-slate-900/60 transition-colors cursor-pointer"
                >
                  {/* Order Number & Timestamp */}
                  <td className="p-4">
                    <div className="font-extrabold text-white text-xs flex items-center gap-1.5">
                      <span className="text-amber-400">#</span>
                      <span>{order.orderNumber}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{dateStr} • {timeStr}</span>
                    </div>
                  </td>

                  {/* Table Badge */}
                  <td className="p-4">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold text-xs">
                      <span>Table {order.table?.tableNumber || '?'}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{order.table?.section || 'Dining'}</p>
                  </td>

                  {/* Customer Info */}
                  <td className="p-4">
                    <div className="font-bold text-slate-200">{order.customerName || 'Guest Diner'}</div>
                    {order.customerPhone && (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-2.5 h-2.5 text-slate-500" />
                        <span>{order.customerPhone}</span>
                      </div>
                    )}
                  </td>

                  {/* Items Ordered */}
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                      {order.items.slice(0, 3).map((item) => (
                        <span
                          key={item.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-medium"
                        >
                          <span className="font-bold text-amber-400">x{item.quantity}</span>
                          <span className="truncate max-w-[120px]">{item.name}</span>
                        </span>
                      ))}

                      {order.items.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-400">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>

                    {order.notes && (
                      <p className="text-[10px] text-amber-300/80 italic mt-1 truncate max-w-xs">
                        Note: {order.notes}
                      </p>
                    )}
                  </td>

                  {/* Total Bill Amount */}
                  <td className="p-4">
                    <div className="font-black text-sm text-white">
                      ₹{order.total.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Sub: ₹{order.subtotal.toFixed(2)}
                    </div>
                  </td>

                  {/* Payment Details */}
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${isPaid
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                    >
                      {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{order.paymentStatus}</span>
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 capitalize">
                      {order.payment?.paymentMethod || order.payment?.provider || 'Cash/Online'}
                    </p>
                  </td>

                  {/* Order Status */}
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${order.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : order.status === 'SERVED'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : order.status === 'PREPARING'
                              ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                              : order.status === 'READY'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                : order.status === 'CANCELLED'
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                    >
                      {order.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetailModal(order);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition-colors"
                        title="View Full Itemized Breakdown"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenReceipt(order);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-semibold transition-colors"
                        title="Print Customer Bill Receipt"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden lg:inline">Bill</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredOrders.length === 0 && !isLoading && (
          <div className="py-16 text-center text-xs text-slate-500">
            No orders found matching the selected filters.
          </div>
        )}
      </div>

      {/* Itemized Order Detail Modal */}
      {isDetailModalOpen && selectedDetailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-7 shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-base text-white">
                    Order #{selectedDetailOrder.orderNumber}
                  </h3>
                  <p className="text-[11px] text-amber-300 font-semibold">
                    Table {selectedDetailOrder.table?.tableNumber} • {selectedDetailOrder.table?.section}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Timestamp Bar */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Customer:</span>
                <span className="font-bold text-white">{selectedDetailOrder.customerName || 'Guest'}</span>
                {selectedDetailOrder.customerPhone && (
                  <span className="text-slate-400 text-[10px] block">{selectedDetailOrder.customerPhone}</span>
                )}
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Placed At:</span>
                <span className="font-medium text-slate-200">
                  {new Date(selectedDetailOrder.createdAt).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* Notes if any */}
            {selectedDetailOrder.notes && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                <strong>Kitchen Instructions:</strong> {selectedDetailOrder.notes}
              </div>
            )}

            {/* Complete Itemized List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Itemized Dishes ({selectedDetailOrder.items.length})
              </h4>
              {selectedDetailOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-extrabold flex items-center justify-center text-[11px]">
                      {item.quantity}x
                    </span>
                    <div>
                      <span className="font-bold text-white">{item.name}</span>
                      {item.specialInstructions && (
                        <p className="text-[10px] text-amber-400/90 italic">↳ {item.specialInstructions}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white">₹{item.itemTotal.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-500 block">₹{item.unitPrice.toFixed(2)} each</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-3 border-t border-slate-800 space-y-1 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="text-slate-200 font-semibold">₹{selectedDetailOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Taxes & GST (5%):</span>
                <span>₹{selectedDetailOrder.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Service Charge (2.5%):</span>
                <span>₹{selectedDetailOrder.serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 text-base font-black text-white">
                <span>Total Amount:</span>
                <span className="gold-gradient-text text-lg">₹{selectedDetailOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-800">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${selectedDetailOrder.paymentStatus === 'PAID'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                {selectedDetailOrder.paymentStatus} ({selectedDetailOrder.payment?.paymentMethod || 'Cash/Online'})
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenReceipt(selectedDetailOrder);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl gold-gradient-bg text-slate-950 text-xs font-black shadow-lg"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Bill Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bill Receipt Modal */}
      {isReceiptOpen && selectedReceiptOrder && (
        <ReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          order={selectedReceiptOrder}
          type="BILL"
        />
      )}
    </div>
  );
}
