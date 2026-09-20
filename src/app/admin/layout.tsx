'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ChefHat,
  Grid,
  Menu,
  CreditCard,
  BarChart3,
  Users,
  Settings,
  LogOut,
  BellRing,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Layers,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { playSound } from '../../lib/audio';
import { firebaseDb } from '../../lib/firebaseDb';
import { WaiterCall } from '../../types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout, isAuthenticated, isLoading } = useAuth();

  const [pendingCalls, setPendingCalls] = useState<WaiterCall[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  // Protect Admin Routes
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [isLoading, isAuthenticated, isLoginPage, router]);

  // Real-time Waiter & Order Alerts in Admin Shell
  useEffect(() => {
    if (isLoginPage) return;

    // Load initial pending waiter calls
    const loadCalls = async () => {
      try {
        const res = await api.listPendingWaiterCalls();
        if (res.calls) setPendingCalls(res.calls);
      } catch (e) {}
    };

    loadCalls();

    // Firebase Cloud Firestore live listener for table assistance calls
    const unsubCalls = firebaseDb.listenToPendingWaiterCalls((calls) => {
      if (calls && Array.isArray(calls) && calls.length > 0) {
        setPendingCalls((prev) => {
          if (calls.length > prev.length && soundEnabled) {
            playSound('waiter_bell');
          }
          const map = new Map<string, WaiterCall>();
          prev.forEach((c) => { if (c.id) map.set(c.id, c); });
          calls.forEach((c) => { if (c.id) map.set(c.id, c); });
          return Array.from(map.values());
        });
      }
    });

    const socket = getSocket();
    socket.emit('join_admin');

    const handleNewOrder = () => {
      if (soundEnabled) playSound('new_order');
    };

    const handleWaiterCall = (call: WaiterCall) => {
      if (soundEnabled) playSound('waiter_bell');
      setPendingCalls((prev) => [call, ...prev]);
    };

    socket.on('order:new', handleNewOrder);
    socket.on('waiter:call', handleWaiterCall);

    return () => {
      if (unsubCalls) unsubCalls();
      socket.off('order:new', handleNewOrder);
      socket.off('waiter:call', handleWaiterCall);
    };
  }, [isLoginPage, soundEnabled]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { label: 'Overview Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Live Orders & KDS', href: '/admin/orders', icon: ChefHat, badge: 'Live' },
    { label: 'Order Details', href: '/admin/order-details', icon: ClipboardList, badge: 'Table' },
    { label: 'Table Management', href: '/admin/tables', icon: Grid },
    { label: 'Menu Catalog', href: '/admin/menu', icon: UtensilsCrossed },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Payment Logs', href: '/admin/payments', icon: CreditCard },
    { label: 'Sales & Reports', href: '/admin/reports', icon: BarChart3, adminOnly: true },
    { label: 'Staff Accounts', href: '/admin/staff', icon: Users, adminOnly: true },
    { label: 'Hotel Settings', href: '/admin/settings', icon: Settings, adminOnly: true },
  ];

  const handleAttendCall = async (id: string) => {
    try {
      await api.attendWaiterCall(id);
      setPendingCalls((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation for Desktop */}
      <aside className="w-full md:w-64 glass-panel border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-800">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl gold-gradient-bg flex items-center justify-center text-slate-950 font-black">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-white tracking-tight">Govinda's Dining</h2>
                <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                  Staff & Operations Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Current User Role Pill */}
          {user && (
            <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{user.name}</div>
                  <div className="text-[10px] text-amber-400 font-medium capitalize">{user.role}</div>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Online" />
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="mt-5 space-y-1">
            {navItems.map((item) => {
              if (item.adminOnly && user?.role !== 'ADMIN') return null;
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'gold-gradient-bg text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-extrabold animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Utility Controls */}
        <div className="pt-4 border-t border-slate-800 space-y-2 mt-6">
          {/* Audio Chime Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
          >
            <div className="flex items-center gap-2">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span>Kitchen Alerts Audio</span>
            </div>
            <span className={`text-[10px] font-bold ${soundEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
              {soundEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Customer View Link */}
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span>Customer Front</span>
            </div>
          </Link>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Notification Bar for Pending Table Assistance Calls */}
        {pendingCalls.length > 0 && (
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-4 py-2.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2 text-xs font-black">
              <BellRing className="w-4 h-4 animate-bounce" />
              <span>{pendingCalls.length} Table Assistance Request(s) Pending!</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {pendingCalls.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950 text-white text-[11px] font-bold shadow"
                >
                  <span className="text-amber-400">Table {c.table?.tableNumber}:</span>
                  <span className="capitalize">{c.requestType.replace('_', ' ').toLowerCase()}</span>
                  <button
                    onClick={() => handleAttendCall(c.id)}
                    className="ml-1 text-[10px] px-2 py-0.5 rounded bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-extrabold"
                  >
                    Attended
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
