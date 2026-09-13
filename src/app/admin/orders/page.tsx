'use client';

import React, { useEffect, useState } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Sparkles,
  Utensils,
  Receipt,
  Printer,
  Search,
  Filter,
  AlertCircle,
  XCircle,
  Check,
  Flame,
  ArrowRight,
} from 'lucide-react';
import ReceiptModal from '../../../components/ReceiptModal';
import { api, subscribeToLocalOrderEvents } from '../../../lib/api';
import { getSocket } from '../../../lib/socket';
import { playSound } from '../../../lib/audio';
import { Order, OrderStatus } from '../../../types';

export default function AdminOrdersKDSPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  const [receiptType, setReceiptType] = useState<'KOT' | 'BILL'>('KOT');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initial Orders Fetch and Auto-Refresh
  const loadOrders = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await api.listOrders();
      if (res.orders) {
        setOrders(res.orders);
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(true);

    // Periodic auto-sync interval every 4s
    const interval = setInterval(() => {
      loadOrders(false);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // 2. Real-Time Socket.IO & Cross-Tab Listener
  useEffect(() => {
    // A. Socket.IO
    const socket = getSocket();
    socket.emit('join_admin');

    const handleNewOrder = (newOrder: Order) => {
      if (!newOrder) return;
      console.log('⚡ KDS received new order event:', newOrder.orderNumber);
      playSound('new_order');
      setOrders((prev) => {
        const filtered = prev.filter((o) => o.id !== newOrder.id);
        return [newOrder, ...filtered];
      });
    };

    const handleStatusUpdate = (updatedOrder: Order) => {
      if (!updatedOrder) return;
      console.log('⚡ KDS received status update:', updatedOrder.orderNumber, updatedOrder.status);
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
    };

    socket.on('order:new', handleNewOrder);
    socket.on('order:status_updated', handleStatusUpdate);

    // B. Local Cross-Tab Events
    const unsubscribeLocal = subscribeToLocalOrderEvents((event, data) => {
      if (event === 'order:new' && data) {
        handleNewOrder(data);
      } else if (event === 'order:status_updated' && data) {
        handleStatusUpdate(data);
      }
    });

    return () => {
      socket.off('order:new', handleNewOrder);
      socket.off('order:status_updated', handleStatusUpdate);
      unsubscribeLocal();
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success && res.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? res.order : o))
        );
        playSound('status_update');
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const openPrint = (order: Order, type: 'KOT' | 'BILL') => {
    setActiveReceiptOrder(order);
    setReceiptType(type);
    setIsReceiptOpen(true);
  };

  // Filter Orders
  const filteredOrders = orders.filter((o) => {
    if (selectedTable !== 'all' && o.table?.tableNumber !== selectedTable) {
      return false;
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchOrder = o.orderNumber.toLowerCase().includes(query);
      const matchCustomer = o.customerName?.toLowerCase().includes(query);
      const matchTable = o.table?.tableNumber.toLowerCase().includes(query);
      if (!matchOrder && !matchCustomer && !matchTable) return false;
    }

    if (statusFilter === 'active') {
      return ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED'].includes(o.status);
    } else if (statusFilter === 'completed') {
      return o.status === 'COMPLETED';
    } else if (statusFilter === 'cancelled') {
      return o.status === 'CANCELLED';
    }

    return true;
  });

  // Group by Pipeline Stages
  const newOrders = filteredOrders.filter((o) => ['NEW', 'ACCEPTED'].includes(o.status));
  const preparingOrders = filteredOrders.filter((o) => o.status === 'PREPARING');
  const readyOrders = filteredOrders.filter((o) => o.status === 'READY');
  const servedOrders = filteredOrders.filter((o) => ['SERVED', 'COMPLETED'].includes(o.status));

  const tableNumbers = Array.from(new Set(orders.map((o) => o.table?.tableNumber).filter(Boolean))).sort();

  return (
    <div className="space-y-6">
      {/* Top Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ChefHat className="w-7 h-7 text-amber-400" />
            <span>Kitchen Display System (KDS) & Order Kanban</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-station order fulfillment. Status changes sync immediately with customer table screens.
          </p>
        </div>

        {/* Action Controls & Sound State */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadOrders(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Refresh Orders
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-slate-800">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'active', label: 'Active Pipeline', count: orders.filter((o) => ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED'].includes(o.status)).length },
            { id: 'all', label: 'All Orders', count: orders.length },
            { id: 'completed', label: 'Completed', count: orders.filter((o) => o.status === 'COMPLETED').length },
            { id: 'cancelled', label: 'Cancelled', count: orders.filter((o) => o.status === 'CANCELLED').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'gold-gradient-bg text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === tab.id ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Table & Search Selectors */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Table Filter */}
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Tables</option>
            {tableNumbers.map((t) => (
              <option key={t} value={t}>
                Table {t}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order #, table..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* 4-Column KDS Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Column 1: New Orders & Alerts */}
        <div className="space-y-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <h3 className="font-extrabold text-xs tracking-wider uppercase text-amber-400">
                1. New Alerts ({newOrders.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {newOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
                onPrint={openPrint}
              />
            ))}
            {newOrders.length === 0 && <EmptyColumnText text="No new order alerts" />}
          </div>
        </div>

        {/* Column 2: Cooking in Kitchen */}
        <div className="space-y-4">
          <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <h3 className="font-extrabold text-xs tracking-wider uppercase text-orange-400">
                2. In Kitchen ({preparingOrders.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {preparingOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
                onPrint={openPrint}
              />
            ))}
            {preparingOrders.length === 0 && <EmptyColumnText text="No dishes currently cooking" />}
          </div>
        </div>

        {/* Column 3: Ready for Serving */}
        <div className="space-y-4">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="font-extrabold text-xs tracking-wider uppercase text-purple-400">
                3. Ready to Serve ({readyOrders.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {readyOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
                onPrint={openPrint}
              />
            ))}
            {readyOrders.length === 0 && <EmptyColumnText text="No plated orders awaiting pickup" />}
          </div>
        </div>

        {/* Column 4: Served & Completed */}
        <div className="space-y-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-extrabold text-xs tracking-wider uppercase text-emerald-400">
                4. Served / Completed ({servedOrders.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {servedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
                onPrint={openPrint}
              />
            ))}
            {servedOrders.length === 0 && <EmptyColumnText text="No served orders in this filter" />}
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {isReceiptOpen && activeReceiptOrder && (
        <ReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          order={activeReceiptOrder}
          type={receiptType}
        />
      )}
    </div>
  );
}

// Subcomponent: Individual KDS Kanban Card
function OrderCard({
  order,
  onUpdateStatus,
  onPrint,
}: {
  order: Order;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onPrint: (order: Order, type: 'KOT' | 'BILL') => void;
}) {
  const timeFormatted = new Date(order.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="p-4 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3 shadow-xl">
      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-black text-xs">
              Table {order.table?.tableNumber || '?'}
            </span>
            <span className="text-[11px] font-mono text-slate-400">{order.orderNumber}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{timeFormatted}</span>
          </div>
        </div>

        {/* Customer & Payment Badge */}
        <div className="flex items-center justify-between mt-2 text-[11px]">
          <span className="text-slate-300 font-medium truncate max-w-[120px]">
            {order.customerName || 'Guest Diner'}
          </span>
          <span
            className={`font-extrabold px-2 py-0.5 rounded-md ${
              order.paymentStatus === 'PAID'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            {order.paymentStatus} ({order.payment?.provider === 'CASH' ? 'Cash' : 'Online'})
          </span>
        </div>

        {/* Notes Alert if any */}
        {order.notes && (
          <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
            <strong>Note:</strong> {order.notes}
          </div>
        )}

        {/* Item List */}
        <div className="mt-3 space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between text-xs py-1 border-b border-slate-800/40 last:border-0">
              <div className="flex items-start gap-2">
                <span className="font-black text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-[11px]">
                  x{item.quantity}
                </span>
                <div>
                  <span className="font-semibold text-white">{item.name}</span>
                  {item.specialInstructions && (
                    <p className="text-[10px] text-amber-400/90 italic">
                      ↳ {item.specialInstructions}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="pt-3 border-t border-slate-800 space-y-2">
        {/* Status Transition Control */}
        <div className="flex items-center gap-1.5">
          {order.status === 'NEW' && (
            <>
              <button
                onClick={() => onUpdateStatus(order.id, 'ACCEPTED')}
                className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
              >
                Accept Order
              </button>
              <button
                onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
                className="px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-xs font-semibold"
                title="Reject / Cancel"
              >
                Reject
              </button>
            </>
          )}

          {order.status === 'ACCEPTED' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'PREPARING')}
              className="w-full py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Start Cooking</span>
            </button>
          )}

          {order.status === 'PREPARING' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'READY')}
              className="w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mark Plated & Ready</span>
            </button>
          )}

          {order.status === 'READY' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'SERVED')}
              className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Mark Served to Table</span>
            </button>
          )}

          {order.status === 'SERVED' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
              className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Complete Order Session</span>
            </button>
          )}
        </div>

        {/* Print Buttons (KOT / Bill) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPrint(order, 'KOT')}
            className="flex-1 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1"
          >
            <Printer className="w-3 h-3 text-amber-400" />
            <span>Print KOT</span>
          </button>

          <button
            onClick={() => onPrint(order, 'BILL')}
            className="flex-1 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1"
          >
            <Receipt className="w-3 h-3 text-emerald-400" />
            <span>Print Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyColumnText({ text }: { text: string }) {
  return (
    <div className="py-12 border border-dashed border-slate-800/80 rounded-2xl text-center text-xs text-slate-500">
      {text}
    </div>
  );
}
