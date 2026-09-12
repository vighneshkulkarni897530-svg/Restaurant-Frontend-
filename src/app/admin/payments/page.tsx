'use client';

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Banknote,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Payment } from '../../../types';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadPayments = async () => {
    try {
      const res = await api.listPayments();
      if (res.payments) setPayments(res.payments);
    } catch (e) {
      console.error('Error loading payments:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleMarkPaid = async (orderId: string) => {
    try {
      await api.markPaymentReceived(orderId);
      loadPayments();
    } catch (e) {
      console.error('Error marking payment received', e);
    }
  };

  const totalCollected = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = payments.filter((p) => {
    if (methodFilter === 'online' && p.provider === 'CASH') return false;
    if (methodFilter === 'cash' && p.provider !== 'CASH') return false;
    if (methodFilter === 'pending' && p.status !== 'PENDING') return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchOrder = p.order?.orderNumber?.toLowerCase().includes(q);
      const matchTable = p.order?.table?.tableNumber?.toLowerCase().includes(q);
      const matchPayId = p.providerPaymentId?.toLowerCase().includes(q);
      return matchOrder || matchTable || matchPayId;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-amber-400" />
            <span>Payment Transactions & Revenue Settlements</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Reconcile online Razorpay payments, UPI QR transactions, and cash collections at dining tables.
          </p>
        </div>

        <button
          onClick={loadPayments}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors self-start sm:self-auto"
        >
          Refresh Logs
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Settled Revenue</span>
          <div className="text-2xl sm:text-3xl font-black text-white gold-gradient-text mt-2">
            ₹{totalCollected.toFixed(2)}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">Successfully collected & verified</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Table Collections</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
            ₹{pendingAmount.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cash to be collected at table</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Transactions</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">
            {payments.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Processed orders recorded</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'online', label: 'Online / Razorpay' },
            { id: 'cash', label: 'Cash at Table' },
            { id: 'pending', label: 'Pending Settlement' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMethodFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                methodFilter === tab.id
                  ? 'gold-gradient-bg text-slate-950 shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order #, table..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto rounded-2xl glass-panel border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Order & Table</th>
              <th className="p-4">Payment Method</th>
              <th className="p-4">Transaction Ref</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Timestamp</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredPayments.map((p) => {
              const isPaid = p.status === 'COMPLETED';
              const dateStr = new Date(p.createdAt).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white">{p.order?.orderNumber || 'N/A'}</div>
                    <div className="text-[11px] text-amber-400 font-semibold">
                      Table {p.order?.table?.tableNumber || '?'} ({p.order?.table?.section || 'Main'})
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {p.provider === 'CASH' ? (
                        <Banknote className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <CreditCard className="w-4 h-4 text-amber-400" />
                      )}
                      <span className="font-semibold text-slate-200">
                        {p.paymentMethod || p.provider}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 font-mono text-[11px] text-slate-400">
                    {p.providerPaymentId || p.providerOrderId || '—'}
                  </td>

                  <td className="p-4 font-extrabold text-sm text-white">
                    ₹{p.amount.toFixed(2)}
                  </td>

                  <td className="p-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        isPaid
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td className="p-4 text-slate-400 text-[11px]">{dateStr}</td>

                  <td className="p-4 text-right">
                    {!isPaid && p.orderId && (
                      <button
                        onClick={() => handleMarkPaid(p.orderId)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors shadow"
                      >
                        Mark Settled
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredPayments.length === 0 && (
          <div className="p-12 text-center text-xs text-slate-500">
            No payment records found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}
