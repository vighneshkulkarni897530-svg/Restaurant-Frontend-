'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Utensils,
  CreditCard,
  Banknote,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  FileText,
  User,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useCart } from '../../context/CartContext';
import { api } from '../../lib/api';
import { playSound } from '../../lib/audio';

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    table,
    hotel,
    addItem,
    removeItem,
    updateQuantity,
    updateInstructions,
    clearCart,
    itemCount,
    subtotal,
    taxAmount,
    serviceChargeAmount,
    grandTotal,
  } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE_RAZORPAY' | 'CASH'>('ONLINE_RAZORPAY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load saved guest details
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('hotel_guest_name');
      const savedPhone = localStorage.getItem('hotel_guest_phone');
      if (savedName) setCustomerName(savedName);
      if (savedPhone) setCustomerPhone(savedPhone);
    }
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!table) {
      setErrorMessage('Please select or scan a dining table QR before placing an order.');
      return;
    }

    const cleanName = customerName.trim();
    if (!cleanName || cleanName.length < 2) {
      setErrorMessage('Please enter your full Name (at least 2 characters) before ordering.');
      return;
    }

    const cleanPhone = customerPhone.trim().replace(/[\s-]/g, '');
    const phoneRegex = /^[+]?[0-9]{10,13}$/;
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      setErrorMessage('Please enter a valid 10-digit Mobile Number before ordering.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('hotel_guest_name', cleanName);
        localStorage.setItem('hotel_guest_phone', cleanPhone);
      }

      // 1. Prepare Order Payload with complete item details and financial breakdown
      const orderPayload = {
        qrToken: table.qrToken,
        tableId: table.id,
        customerName: cleanName,
        customerPhone: cleanPhone,
        notes: orderNotes.trim() || undefined,
        paymentMethod: paymentMethod,
        items: cart.map((i) => ({
          menuItemId: i.menuItem.id,
          name: i.menuItem.name,
          unitPrice: i.menuItem.price,
          itemTotal: i.menuItem.price * i.quantity,
          quantity: i.quantity,
          specialInstructions: i.specialInstructions,
        })),
        subtotal,
        tax: taxAmount,
        serviceCharge: serviceChargeAmount,
        total: grandTotal,
      };

      const res = await api.createOrder(orderPayload);

      if (res.success && res.order) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('hotel_current_order_id', res.order.id);
        }

        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#6366f1'],
        });

        playSound('success');
        clearCart();
        router.push(`/order/${res.order.id}`);
      } else {
        setErrorMessage(res.message || 'Failed to place order.');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto w-full px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-4 shadow-xl">
            <ShoppingBag className="w-10 h-10 text-amber-500/40" />
          </div>
          <h2 className="text-xl font-bold text-white">Your Cart is Empty</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Explore our chef's gourmet selection and add dishes to your cart.
          </p>
          <Link
            href={table ? `/menu?table=${table.qrToken}` : '/menu'}
            className="mt-6 flex items-center gap-2 px-6 py-3 rounded-2xl gold-gradient-bg text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform"
          >
            <Utensils className="w-4 h-4" />
            <span>Browse Digital Menu</span>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Back Link & Header */}
        <div className="flex items-center justify-between">
          <Link
            href={table ? `/menu?table=${table.qrToken}` : '/menu'}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </Link>

          <button
            onClick={clearCart}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>

        {/* Table Banner */}
        {table ? (
          <div className="p-4 rounded-2xl glass-panel border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                {table.tableNumber}
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Ordering for Table {table.tableNumber}</h3>
                <p className="text-[11px] text-slate-400">{table.section} Area</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Verified Dine-In
            </span>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>No table chosen. Please select your table before ordering.</span>
            </div>
            <Link
              href="/scan"
              className="px-3 py-1 rounded-lg gold-gradient-bg text-slate-950 font-bold text-xs"
            >
              Select Table
            </Link>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cart Items List */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Review Items ({itemCount})</h2>
            </div>

            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.menuItem.id}
                  className="p-4 rounded-2xl glass-card border border-slate-800 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                        {item.menuItem.imageUrl ? (
                          <img
                            src={item.menuItem.imageUrl}
                            alt={item.menuItem.name}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full border ${
                              item.menuItem.isVeg
                                ? 'border-emerald-400 bg-emerald-400'
                                : 'border-rose-400 bg-rose-400'
                            }`}
                          />
                          <h4 className="font-bold text-sm text-white">{item.menuItem.name}</h4>
                        </div>
                        <p className="text-xs text-amber-400 font-semibold mt-0.5">
                          ₹{item.menuItem.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>

                    {/* Quantity Modifiers */}
                    <div className="flex items-center rounded-xl bg-slate-900 border border-slate-700 p-1">
                      <button
                        type="button"
                        onClick={() => removeItem(item.menuItem.id)}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => addItem(item.menuItem, 1)}
                        className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  </div>

                  {/* Special Cooking Instructions for Item */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <input
                      type="text"
                      value={item.specialInstructions || ''}
                      onChange={(e) => updateInstructions(item.menuItem.id, e.target.value)}
                      placeholder="Special instructions (e.g., less oil, extra cheese, no onion)"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-amber-400 transition-colors"
                      maxLength={80}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* General Order Notes */}
            <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Overall Kitchen Note</span>
              </label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Any special requests for the chef or server regarding preparation or serving..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition-colors resize-none"
                rows={2}
                maxLength={150}
              />
            </div>
          </div>

          {/* Checkout & Bill Summary Column */}
          <form onSubmit={handleCheckout} className="space-y-4">
            {/* Customer Contact - Compulsory */}
            <div className="p-4 rounded-2xl glass-card border border-amber-500/30 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span>Guest Details</span>
                  <span className="text-[10px] text-amber-400 font-extrabold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                    Compulsory
                  </span>
                </h3>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-400" /> Full Name <span className="text-rose-400 font-bold">*</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Required</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Vikram Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-400" /> Mobile Number <span className="text-rose-400 font-bold">*</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Required for E-Bill</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-slate-400 pointer-events-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={customerPhone.replace('+91', '').trim()}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setCustomerPhone(val);
                    }}
                    placeholder="9876543210"
                    className="w-full pl-11 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Select Payment Mode
              </h3>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ONLINE_RAZORPAY')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'ONLINE_RAZORPAY'
                      ? 'bg-amber-500/10 border-amber-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-700 text-amber-400">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Online / UPI / Razorpay</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold">
                        Instant
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">GPay, PhonePe, Paytm, Cards, NetBanking</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'CASH'
                      ? 'bg-amber-500/10 border-amber-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-white">Pay at Table / Cash</div>
                    <div className="text-[10px] text-slate-400">Pay the server after dining</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-2.5 text-xs">
              <h3 className="font-bold text-white pb-2 border-b border-slate-800">
                Payment Summary
              </h3>

              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({itemCount} items):</span>
                <span className="text-white font-medium">₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Taxes & GST ({hotel?.taxRatePercent ?? 5}%):</span>
                <span className="text-slate-300">₹{taxAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Restaurant Service ({hotel?.serviceChargePercent ?? 2.5}%):</span>
                <span className="text-slate-300">₹{serviceChargeAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-800 text-base font-extrabold text-white">
                <span>Total Amount:</span>
                <span className="gold-gradient-text text-lg">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={isSubmitting || !table}
              className="w-full py-3.5 rounded-2xl gold-gradient-bg text-slate-950 text-sm font-black shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Placing Order...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Place Order • ₹{grandTotal.toFixed(2)}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
