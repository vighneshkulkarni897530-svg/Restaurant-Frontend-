'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UtensilsCrossed,
  ShoppingBag,
  BellRing,
  QrCode,
  ShieldCheck,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import CallWaiterModal from './CallWaiterModal';

export default function Navbar() {
  const { table, hotel, itemCount, grandTotal } = useCart();
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const pathname = usePathname();

  const isCustomerPage = !pathname?.startsWith('/admin');

  if (!isCustomerPage) return null;

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link href={table ? `/menu?table=${table.qrToken}` : '/menu'} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl gold-gradient-bg p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform flex items-center justify-center text-slate-950 font-bold">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                {hotel?.hotelName || "Govinda's Dining"}
                <Sparkles className="w-3.5 h-3.5 text-amber-400 inline" />
              </h1>
              <p className="text-[11px] text-amber-300/80 font-medium">QR Table Service</p>
            </div>
          </Link>

          {/* Right Navigation & Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Table Badge */}
            {table ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Table {table.tableNumber}</span>
                <span className="hidden sm:inline text-slate-400 text-[10px]">({table.section})</span>
              </div>
            ) : (
              <Link
                href="/scan"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>Select Table</span>
              </Link>
            )}

            {/* Call Waiter Button */}
            {table && (
              <button
                onClick={() => setIsWaiterModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all hover:scale-105"
                title="Call Waiter for Assistance"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Call Waiter</span>
              </button>
            )}

            {/* Cart Link & Floating Summary */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-transform hover:scale-105 shadow-md shadow-amber-500/20"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-950 text-amber-400 text-[11px] font-bold">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Staff / Admin Quick Access */}
            <Link
              href="/admin/demo"
              className="flex items-center gap-1 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700/60 transition-colors"
              title="Staff & Kitchen Portal (1-Click Demo Access)"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline text-[11px] font-semibold">Staff Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Waiter Assistance Modal */}
      {isWaiterModalOpen && (
        <CallWaiterModal isOpen={isWaiterModalOpen} onClose={() => setIsWaiterModalOpen(false)} />
      )}
    </>
  );
}
