'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import ReceiptModal from '../../components/ReceiptModal';
import { api, subscribeToLocalOrderEvents } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { playSound } from '../../lib/audio';
import { Order, OrderStatus } from '../../types';

export default function KitchenKDSPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // Default to all so previous orders remain visible after restart
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
        const cleanOrders = res.orders.filter(
          (o: Order) =>
            !o.id?.startsWith('ord_demo_') &&
            o.orderNumber !== 'ORD-1001' &&
            o.orderNumber !== 'ORD-1002'
        );
        setOrders(cleanOrders);
      }
    } catch (e) {
      console.error('Failed to load kitchen orders:', e);
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
      console.log('⚡ Kitchen KDS received new order event:', newOrder.orderNumber);
      playSound('new_order');
      setOrders((prev) => {
        const filtered = prev.filter((o) => o.id !== newOrder.id);
        return [newOrder, ...filtered];
      });
    };

    const handleStatusUpdate = (updatedOrder: Order) => {
      if (!updatedOrder) return;
      console.log('⚡ Kitchen KDS received status update:', updatedOrder.orderNumber, updatedOrder.status);
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
      console.error('Failed to update kitchen status:', e);
    }
  };

  const openPrint = (order: Order, type: 'KOT' | 'BILL') => {
    setActiveReceiptOrder(order);
    setReceiptType(type);
    setIsReceiptOpen(true);
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'active') {
      if (!['NEW', 'ACCEPTED', 'PREPARING', 'READY'].includes(order.status)) {
        return false;
      }
    } else if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }

    if (selectedTable !== 'all' && order.table?.tableNumber !== selectedTable) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchCustomer = order.customerName?.toLowerCase().includes(q);
      const matchItem = order.items?.some((i) => i.name.toLowerCase().includes(q));
      if (!matchNum && !matchCustomer && !matchItem) return false;
    }

    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse';
      case 'ACCEPTED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'PREPARING':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'READY':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'SERVED':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'COMPLETED':
        return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
      case 'CANCELLED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getElapsedTime = (createdAt: string) => {
    const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins === 1) return '1 min ago';
    return `${mins} mins ago`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400/50 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                Kitchen Display System (KDS)
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Live Sync
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Govinda's Kitchen • Real-time order preparation & chef fulfillment
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadOrders(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            Refresh
          </button>
          <Link
            href="/admin/login"
            className="px-3.5 py-2 rounded-xl gold-gradient-bg text-slate-950 text-xs font-bold shadow-md hover:scale-105 transition-transform"
          >
            Admin Panel
          </Link>
        </div>
      </header>

      {/* Filter Toolbar */}
      <section className="mt-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'active', 'NEW', 'ACCEPTED', 'PREPARING', 'READY'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${statusFilter === filter
                  ? 'gold-gradient-bg text-slate-950 border-amber-400 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
            >
              {filter === 'all' ? 'All Orders' : filter === 'active' ? 'Active Kitchen' : filter}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search order or dish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </section>

      {/* Tickets Grid */}
      <main className="mt-6 flex-1">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-3xl bg-slate-900/30 border border-slate-800/60">
            <Utensils className="w-12 h-12 text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-200">No Orders in Kitchen Queue</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              All placed customer table orders will appear here in real-time with sound alerts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map((order) => {
              const elapsedMinutes = Math.floor(
                (Date.now() - new Date(order.createdAt).getTime()) / 60000
              );
              const isUrgent = elapsedMinutes > 20 && ['NEW', 'ACCEPTED', 'PREPARING'].includes(order.status);

              return (
                <div
                  key={order.id}
                  className={`rounded-2xl flex flex-col justify-between border bg-slate-900/90 shadow-lg overflow-hidden transition-all ${isUrgent
                      ? 'border-rose-500/60 shadow-rose-500/10'
                      : order.status === 'NEW'
                        ? 'border-amber-500/60 shadow-amber-500/10'
                        : 'border-slate-800'
                    }`}
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-slate-800 flex items-start justify-between bg-slate-950/40">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-amber-400">
                          {order.orderNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-semibold mt-1">
                        Table {order.table?.tableNumber || '01'}{' '}
                        <span className="text-slate-500 font-normal">
                          ({order.table?.section || 'Main Dining'})
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{getElapsedTime(order.createdAt)}</span>
                      </div>
                      <button
                        onClick={() => openPrint(order, 'KOT')}
                        className="mt-1 flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 hover:text-white"
                        title="Print Kitchen Order Ticket"
                      >
                        <Printer className="w-3 h-3" />
                        KOT
                      </button>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="p-4 space-y-2 flex-1">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between text-xs py-1 border-b border-slate-800/40 last:border-0"
                      >
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[11px] shrink-0">
                            {item.quantity}x
                          </span>
                          <div>
                            <span className="font-semibold text-slate-100">{item.name}</span>
                            {item.specialInstructions && (
                              <p className="text-[10px] text-amber-400 font-medium mt-0.5">
                                Note: {item.specialInstructions}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {order.notes && (
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 mt-2">
                        <span className="font-bold">Table Request:</span> {order.notes}
                      </div>
                    )}
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex gap-2">
                    {order.status === 'NEW' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'ACCEPTED')}
                        className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-transform active:scale-95"
                      >
                        Accept Order
                      </button>
                    )}
                    {order.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                        className="flex-1 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-transform active:scale-95"
                      >
                        Start Cooking
                      </button>
                    )}
                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'READY')}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-transform active:scale-95"
                      >
                        Mark Ready for Table
                      </button>
                    )}
                    {order.status === 'READY' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'SERVED')}
                        className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-transform active:scale-95"
                      >
                        Delivered to Table
                      </button>
                    )}
                    {['SERVED', 'COMPLETED', 'CANCELLED'].includes(order.status) && (
                      <div className="w-full text-center text-xs text-slate-500 font-semibold py-1">
                        Completed
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Printable Receipt/KOT Modal */}
      {isReceiptOpen && activeReceiptOrder && (
        <ReceiptModal
          order={activeReceiptOrder}
          type={receiptType}
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
        />
      )}
    </div>
  );
}
