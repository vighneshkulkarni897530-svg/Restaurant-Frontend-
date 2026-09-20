'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Sparkles,
  Utensils,
  Receipt,
  BellRing,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  QrCode,
  ShieldCheck,
  Check,
  Flame,
} from 'lucide-react';
import Navbar from '../../../components/Navbar';
import ReceiptModal from '../../../components/ReceiptModal';
import CallWaiterModal from '../../../components/CallWaiterModal';
import PaymentModal from '../../../components/PaymentModal';
import { api, subscribeToLocalOrderEvents } from '../../../lib/api';
import { getSocket } from '../../../lib/socket';
import { playSound } from '../../../lib/audio';
import { firebaseDb } from '../../../lib/firebaseDb';
import { Order, OrderStatus } from '../../../types';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [error, setError] = useState('');

  // 1. Initial Fetch and Periodic Refresh Helper
  const refreshOrder = async (isInitial = false) => {
    try {
      const res = await api.getOrderById(orderId);
      if (res.success && res.order) {
        setOrder((prev) => {
          if (prev && prev.status !== res.order.status) {
            console.log('⚡ Order status changed via sync:', prev.status, '->', res.order.status);
            playSound('status_update');
          }
          return res.order;
        });
        setError('');
      } else if (isInitial) {
        setError('Order not found.');
      }
    } catch (err: any) {
      if (isInitial) {
        setError(err.message || 'Failed to load order.');
      }
    } finally {
      if (isInitial) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!orderId) return;
    refreshOrder(true);

    // 2. Failsafe auto-poll interval every 3 seconds
    const interval = setInterval(() => {
      refreshOrder(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId]);

  // 3. Real-Time Multi-Source Listeners (Firebase Firestore + Socket.IO + Local Cross-Tab)
  useEffect(() => {
    if (!orderId) return;

    // A. Real-Time Firebase Cloud Firestore listener
    const unsubFirestore = firebaseDb.listenToOrder(orderId, (updatedOrder) => {
      if (updatedOrder) {
        setOrder((prev) => {
          if (prev && prev.status !== updatedOrder.status) {
            console.log('⚡ Live Firestore order update received:', prev.status, '->', updatedOrder.status);
            playSound('status_update');
          }
          return updatedOrder;
        });
        setIsLoading(false);
      }
    });

    // B. Socket.IO Listener
    const socket = getSocket();
    socket.emit('join_order', orderId);

    const handleStatusUpdate = (updatedOrder: Order) => {
      if (updatedOrder && (updatedOrder.id === orderId || updatedOrder.orderNumber === orderId)) {
        console.log('⚡ Received live order status update via socket:', updatedOrder.status);
        setOrder(updatedOrder);
        playSound('status_update');
      }
    };

    socket.on('order:status_updated', handleStatusUpdate);

    // C. Local Cross-Tab Event Listener (BroadcastChannel / CustomEvent / Storage)
    const unsubscribeLocal = subscribeToLocalOrderEvents((event, data) => {
      if (event === 'order:status_updated' && data && (data.id === orderId || data.orderNumber === orderId)) {
        console.log('⚡ Received live order status update via local channel:', data.status);
        setOrder(data);
        playSound('status_update');
      }
    });

    return () => {
      if (unsubFirestore) unsubFirestore();
      socket.off('order:status_updated', handleStatusUpdate);
      unsubscribeLocal();
    };
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mb-4" />
        <p className="text-sm text-slate-300 font-medium">Connecting to Kitchen Display...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
          <h2 className="text-lg font-bold">Order Not Found</h2>
          <p className="text-xs text-slate-400 mt-1">{error || 'This order could not be located.'}</p>
          <Link
            href="/menu"
            className="mt-4 px-4 py-2 rounded-xl gold-gradient-bg text-slate-950 text-xs font-bold"
          >
            Go to Menu
          </Link>
        </div>
      </div>
    );
  }

  const steps: { key: OrderStatus; label: string; desc: string; icon: any }[] = [
    { key: 'NEW', label: 'Order Received', desc: 'Sent to Kitchen Display', icon: Clock },
    { key: 'ACCEPTED', label: 'Accepted', desc: 'Acknowledged by Chef', icon: CheckCircle2 },
    { key: 'PREPARING', label: 'Cooking & Plating', desc: 'Preparing freshly at station', icon: ChefHat },
    { key: 'READY', label: 'Ready for Table', desc: 'Awaiting server pickup', icon: Sparkles },
    { key: 'SERVED', label: 'Served', desc: 'Delivered to your table', icon: Utensils },
    { key: 'COMPLETED', label: 'Completed', desc: 'Dining session completed', icon: Check },
  ];

  const statusOrder: OrderStatus[] = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'];
  const currentStepIndex = statusOrder.indexOf(order.status as OrderStatus);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16">
      <Navbar />

      <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Top Status Header */}
        <div className="p-6 rounded-3xl glass-panel border border-amber-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Table & Order Number */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-3">
            <span>TABLE {order.table?.tableNumber || 'N/A'}</span>
            <span>•</span>
            <span>{order.orderNumber}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isCancelled ? (
              <span className="text-rose-400">Order Cancelled</span>
            ) : order.status === 'SERVED' || order.status === 'COMPLETED' ? (
              <span className="text-emerald-400">Bon Appétit! Enjoy Your Meal</span>
            ) : (
              <span>Your Food is Being Prepared</span>
            )}
          </h1>

          <p className="text-xs text-slate-300 mt-1.5 font-light">
            Live updates directly synced with our Kitchen Display System
          </p>

          {/* Live Status Badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-extrabold text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Status: {order.status}</span>
          </div>
        </div>

        {/* Real-time Order Progress Stepper */}
        {!isCancelled && (
          <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 text-center">
              Preparation Progress
            </h2>

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              {/* Connector line for desktop */}
              <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-slate-800 -z-0">
                <div
                  className="h-full gold-gradient-bg transition-all duration-700"
                  style={{
                    width: `${Math.min(100, Math.max(0, (currentStepIndex / (steps.length - 1)) * 100))}%`,
                  }}
                />
              </div>

              {steps.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;
                const Icon = step.icon;

                return (
                  <div
                    key={step.key}
                    className="relative z-10 flex sm:flex-col items-center gap-3 sm:gap-2 sm:text-center flex-1"
                  >
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all ${
                        isCurrent
                          ? 'gold-gradient-bg text-slate-950 shadow-lg shadow-amber-500/40 ring-4 ring-amber-500/20 scale-110'
                          : isPassed
                          ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                          : 'bg-slate-900 border border-slate-800 text-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex flex-col sm:items-center">
                      <span
                        className={`text-xs font-bold ${
                          isCurrent ? 'text-amber-400' : isPassed ? 'text-white' : 'text-slate-500'
                        }`}
                      >
                        {step.label}
                      </span>
                      <span className="text-[10px] text-slate-400 hidden sm:inline max-w-[100px]">
                        {step.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Details & Summary */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white">Ordered Items ({order.items.length})</h3>
            <button
              onClick={() => setIsReceiptOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Receipt className="w-3.5 h-3.5 text-amber-400" />
              <span>View & Print Bill</span>
            </button>
          </div>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-1 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-extrabold text-amber-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                    x{item.quantity}
                  </span>
                  <div>
                    <span className="font-medium text-white">{item.name}</span>
                    {item.specialInstructions && (
                      <p className="text-[10px] text-slate-400 italic">
                        Note: {item.specialInstructions}
                      </p>
                    )}
                  </div>
                </div>
                <span className="font-bold text-slate-300">₹{item.itemTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-slate-200">₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>Taxes & GST:</span>
              <span>₹{order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>Service Charge:</span>
              <span>₹{order.serviceCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800 text-base font-extrabold text-white">
              <span>{order.paymentStatus === 'PAID' ? 'Total Paid:' : 'Total Amount:'}</span>
              <span className="gold-gradient-text text-lg">₹{order.total.toFixed(2)}</span>
            </div>

            {/* Payment Status Badge / Pay Button */}
            <div className="pt-2">
              {order.paymentStatus === 'PAID' ? (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">
                      Payment Verified & Settled
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {order.payment?.paymentMethod || 'Online / Card'}
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span>Payment: Pending Settlement</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Cash / Online</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full py-2.5 rounded-xl gold-gradient-bg text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>💳 Pay Bill Online via UPI / Card (₹{order.total.toFixed(2)})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Assistance Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Link
            href={order.table?.qrToken ? `/menu?table=${order.table.qrToken}` : '/menu'}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all"
          >
            <Utensils className="w-4 h-4 text-amber-400" />
            <span>Order More Items</span>
          </Link>

          <button
            onClick={() => setIsWaiterModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all"
          >
            <BellRing className="w-4 h-4 text-amber-400" />
            <span>Call Waiter to Table</span>
          </button>
        </div>
      </main>

      {/* Bill Receipt Modal */}
      {isReceiptOpen && (
        <ReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          order={order}
          type="BILL"
        />
      )}

      {/* Waiter Assistance Modal */}
      {isWaiterModalOpen && (
        <CallWaiterModal
          isOpen={isWaiterModalOpen}
          onClose={() => setIsWaiterModalOpen(false)}
        />
      )}

      {/* Online Bill Payment Modal */}
      {isPaymentModalOpen && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          amount={order.total}
          customerName={order.customerName || 'Guest Diner'}
          customerPhone={order.customerPhone || ''}
          orderNumber={order.orderNumber}
          orderId={order.id}
          onPaymentSuccess={(paymentData) => {
            setOrder((prev) =>
              prev
                ? {
                    ...prev,
                    paymentStatus: 'PAID',
                    payment: {
                      ...(prev.payment as any),
                      status: 'COMPLETED',
                      paymentMethod: paymentData.paymentMethod,
                      providerPaymentId: paymentData.razorpayPaymentId,
                    },
                  }
                : null
            );
            setIsPaymentModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
