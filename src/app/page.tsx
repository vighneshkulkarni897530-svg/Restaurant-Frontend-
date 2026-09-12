'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  QrCode,
  UtensilsCrossed,
  Sparkles,
  ShieldCheck,
  ChefHat,
  ArrowRight,
  Clock,
  CreditCard,
  BellRing,
  Smartphone,
} from 'lucide-react';
import { api } from '../lib/api';
import { Table, HotelSetting } from '../types';

export default function HomePage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [hotel, setHotel] = useState<HotelSetting | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsRes, tablesRes] = await Promise.all([
          api.getHotelSettings().catch(() => ({ settings: null })),
          api.listTables().catch(() => ({ tables: [] })),
        ]);

        if (settingsRes.settings) setHotel(settingsRes.settings);
        if (tablesRes.tables) setTables(tablesRes.tables);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="w-full glass-panel border-b border-slate-800/80 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gold-gradient-bg p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center text-slate-950 font-bold">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg text-white">
                {hotel?.hotelName || "Govinda's Restaurant"}
              </h1>
              <p className="text-[11px] text-amber-300/80">QR Table Ordering System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/demo"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl gold-gradient-bg text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 hover:scale-105 transition-transform"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>⚡ 1-Click Demo Login</span>
            </Link>

            <Link
              href="/admin/login"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Staff Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-10">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/40 p-8 sm:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Contactless Dining Experience</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Scan, Order & Savor <br />
              <span className="gold-gradient-text">Directly from Your Table</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-light">
              Every dining table is assigned a unique cryptographic QR code. Simply scan with your smartphone camera to browse our gourmet menu, customize dishes, pay seamlessly, and track kitchen preparation in real-time.
            </p>

            {/* Quick Action CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/scan"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl gold-gradient-bg text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all"
              >
                <QrCode className="w-5 h-5" />
                <span>Simulate QR Scan</span>
              </Link>

              <Link
                href="/admin/demo"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-bold text-sm transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>⚡ 1-Click Demo Login</span>
              </Link>

              <Link
                href="/menu"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm transition-all hover:border-slate-500"
              >
                <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                <span>Browse Menu</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Live Table Selection Grid (For Simulation & Testing) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Select a Table to Dine (Simulation)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  {tables.length} Tables Active
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                In a real hotel, customers scan physical QR code standees on these tables. Click any table to test its customer experience:
              </p>
            </div>

            <Link
              href="/scan"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Open QR Scanner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {tables.map((t) => (
              <Link
                key={t.id}
                href={`/menu?table=${t.qrToken}`}
                className="group relative p-4 rounded-2xl glass-card border border-slate-800 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900 group-hover:bg-amber-500/20 border border-slate-700 group-hover:border-amber-500/40 flex items-center justify-center text-amber-400 mb-2 transition-colors">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="font-extrabold text-sm text-white group-hover:text-amber-300">
                  Table {t.tableNumber}
                </div>
                <div className="text-[11px] text-slate-400 truncate w-full mt-0.5">
                  {t.section}
                </div>
                <div className="mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Cap: {t.capacity} Guests
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Key Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800/80">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Automatic Table Resolution</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Secure QR tokens automatically identify table number and restaurant section without asking customers to manually type numbers.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ChefHat className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Live Kitchen Display (KDS)</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Orders appear on the chef's dashboard instantly via Socket.IO with audio chimes, preparation timers, and printable Kitchen Order Tickets.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Instant Online & Cash Payments</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Supports seamless online checkout via Razorpay, UPI QR codes, Cards, and traditional Cash at Table settlements.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>© 2026 {hotel?.hotelName || "Govinda's Restaurant & Dining"}. All rights reserved.</p>
        <p className="text-[11px] mt-1 text-slate-600">Contactless QR Table Ordering System</p>
      </footer>
    </div>
  );
}
