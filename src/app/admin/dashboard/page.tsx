'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Grid,
  ChefHat,
  ArrowRight,
  Clock,
  CheckCircle2,
  Sparkles,
  UtensilsCrossed,
  BellRing,
  QrCode,
  Users,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const res = await api.getDashboardOverview();
      if (res.success) {
        setStats(res.stats);
        setRecentOrders(res.recentOrders || []);
      }
    } catch (e) {
      console.error('Failed to load dashboard stats:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Executive Operations Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Welcome back, <span className="text-amber-400 font-bold">{user?.name || 'Manager'}</span>. Real-time overview of orders, kitchen stations, and table occupancy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gold-gradient-bg text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
          >
            <ChefHat className="w-4 h-4" />
            <span>Open Kitchen KDS</span>
          </Link>

          <Link
            href="/admin/tables"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Manage Table QRs</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Today's Revenue */}
        <div className="p-5 rounded-2xl glass-card border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Revenue</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-white gold-gradient-text">
              ₹{stats?.todayRevenue ? stats.todayRevenue.toFixed(2) : '0.00'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Settled online & table payments</span>
            </p>
          </div>
        </div>

        {/* Today's Total Orders */}
        <div className="p-5 rounded-2xl glass-card border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-white">
              {stats?.todayOrdersCount ?? 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {stats?.activeOrdersCount ?? 0} orders currently active in flow
            </p>
          </div>
        </div>

        {/* Table Occupancy */}
        <div className="p-5 rounded-2xl glass-card border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Table Occupancy</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Grid className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-white">
              {stats?.occupiedTables ?? 0} <span className="text-sm font-normal text-slate-400">/ {stats?.totalTables ?? 10}</span>
            </div>
            <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
              {stats?.tableOccupancyRate ?? 0}% dining capacity utilized
            </p>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="p-5 rounded-2xl glass-card border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Order Value</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-white">
              ₹{stats?.averageOrderValue ? stats.averageOrderValue.toFixed(2) : '0.00'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Average ticket per guest order</p>
          </div>
        </div>
      </div>

      {/* Order Status Breakdown Bar */}
      <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Current Kitchen & Dining Pipeline
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
            <span className="text-[11px] font-bold text-amber-400 block">NEW ALERTS</span>
            <span className="text-xl font-black text-white">{stats?.statusCounts?.NEW ?? 0}</span>
          </div>

          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center">
            <span className="text-[11px] font-bold text-blue-400 block">ACCEPTED</span>
            <span className="text-xl font-black text-white">{stats?.statusCounts?.ACCEPTED ?? 0}</span>
          </div>

          <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-center">
            <span className="text-[11px] font-bold text-orange-400 block">PREPARING</span>
            <span className="text-xl font-black text-white">{stats?.statusCounts?.PREPARING ?? 0}</span>
          </div>

          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-center">
            <span className="text-[11px] font-bold text-purple-400 block">READY</span>
            <span className="text-xl font-black text-white">{stats?.statusCounts?.READY ?? 0}</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <span className="text-[11px] font-bold text-emerald-400 block">SERVED</span>
            <span className="text-xl font-black text-white">{stats?.statusCounts?.SERVED ?? 0}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 text-center">
            <span className="text-[11px] font-bold text-slate-400 block">COMPLETED</span>
            <span className="text-xl font-black text-white">{stats?.statusCounts?.COMPLETED ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Live Orders Feed</h2>
            <p className="text-xs text-slate-400">Incoming QR orders from dining tables</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>View All Orders in KDS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="p-5 rounded-2xl glass-card border border-slate-800 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-extrabold text-xs">
                      Table {order.table?.tableNumber || '?'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{order.orderNumber}</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    order.status === 'NEW'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                      : order.status === 'PREPARING'
                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                      : order.status === 'READY'
                      ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="text-xs text-slate-300 flex justify-between">
                      <span className="truncate max-w-[180px]">{item.name}</span>
                      <span className="font-bold text-amber-400">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total: <strong className="text-white">₹{order.total?.toFixed(2)}</strong></span>
                <Link
                  href="/admin/orders"
                  className="text-amber-400 hover:text-amber-300 font-semibold"
                >
                  Manage →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
