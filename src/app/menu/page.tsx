'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  Flame,
  ShoppingBag,
  SlidersHorizontal,
  Leaf,
  Drumstick,
  ArrowRight,
  AlertCircle,
  QrCode,
  UtensilsCrossed,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import FoodItemCard from '../../components/FoodItemCard';
import { useCart } from '../../context/CartContext';
import { api } from '../../lib/api';
import { Category, MenuItem } from '../../types';

function MenuContent() {
  const searchParams = useSearchParams();
  const tableToken = searchParams.get('table');

  const { table, setTable, setHotel, itemCount, grandTotal } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [chefSpecialsOnly, setChefSpecialsOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tableError, setTableError] = useState('');

  // 1. Resolve Table from QR Token
  useEffect(() => {
    const resolveTable = async () => {
      if (tableToken) {
        try {
          const res = await api.getTableByQR(tableToken);
          if (res.success && res.table) {
            setTable(res.table);
            if (res.hotel) setHotel(res.hotel);
            setTableError('');
          } else {
            setTable(null);
            setTableError(res.message || 'Invalid or expired table QR code.');
          }
        } catch (err: any) {
          console.error('Failed to resolve table QR:', err);
          setTable(null);
          setTableError(err.message || 'Invalid or expired table QR code.');
        }
      }
    };

    resolveTable();
  }, [tableToken, setTable, setHotel]);

  // 2. Fetch Categories & Menu Items
  useEffect(() => {
    const loadMenu = async () => {
      setIsLoading(true);
      try {
        const [catRes, itemRes, settingsRes] = await Promise.all([
          api.getCategories(),
          api.getMenuItems({
            categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
            search: searchQuery.trim() || undefined,
            isVeg: vegFilter === 'VEG' ? 'true' : vegFilter === 'NON_VEG' ? 'false' : undefined,
            availableOnly: false,
          }),
          api.getHotelSettings().catch(() => ({ settings: null })),
        ]);

        if (catRes.categories) setCategories(catRes.categories);
        if (itemRes.items) {
          let items = itemRes.items;
          if (chefSpecialsOnly) {
            items = items.filter((i: MenuItem) => i.isChefSpecial);
          }
          setMenuItems(items);
        }
        if (settingsRes?.settings) setHotel(settingsRes.settings);
      } catch (err) {
        console.error('Error fetching menu items:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(loadMenu, 150);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, vegFilter, chefSpecialsOnly, setHotel]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-28">
      <Navbar />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Table Notice or Missing Table Warning */}
        {tableError ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{tableError} You can still browse the menu.</span>
            </div>
            <Link
              href="/scan"
              className="px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 font-semibold"
            >
              Select Table
            </Link>
          </div>
        ) : !table ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 shrink-0 text-amber-400" />
              <span>No dining table selected. Please scan your table QR code to place orders.</span>
            </div>
            <Link
              href="/scan"
              className="px-3.5 py-1.5 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs shadow-md"
            >
              Select Table
            </Link>
          </div>
        ) : null}

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gourmet dishes, pizzas, desserts, cocktails..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
            />
          </div>

          {/* Diet Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setVegFilter('ALL')}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all border shrink-0 ${
                vegFilter === 'ALL'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              All Items
            </button>

            <button
              onClick={() => setVegFilter(vegFilter === 'VEG' ? 'ALL' : 'VEG')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all border shrink-0 ${
                vegFilter === 'VEG'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>Veg Only</span>
            </button>

            <button
              onClick={() => setVegFilter(vegFilter === 'NON_VEG' ? 'ALL' : 'NON_VEG')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all border shrink-0 ${
                vegFilter === 'NON_VEG'
                  ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-rose-500/40'
              }`}
            >
              <Drumstick className="w-3.5 h-3.5" />
              <span>Non-Veg</span>
            </button>

            <button
              onClick={() => setChefSpecialsOnly(!chefSpecialsOnly)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all border shrink-0 ${
                chefSpecialsOnly
                  ? 'bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-500/20'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-purple-500/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Chef's Choice</span>
            </button>
          </div>
        </div>

        {/* Categories Horizontal Scroll Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-slate-800 border-amber-500 text-amber-300 shadow-lg'
                : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Categories
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-slate-800 border-amber-500 text-amber-300 shadow-lg'
                    : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{cat.name}</span>
                {cat._count?.menuItems !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950 text-slate-400">
                    {cat._count.menuItems}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Menu Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : menuItems.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
              <UtensilsCrossed className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">No dishes found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Try adjusting your search query or removing active filters to view other delicious items.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
            {menuItems.map((item) => (
              <FoodItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>

      {/* Sticky Bottom Floating Cart Bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-xl mx-auto animate-slide-up">
          <Link
            href="/cart"
            className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl gold-gradient-bg text-slate-950 shadow-2xl shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-sm shadow-md">
                {itemCount}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-900/80">
                  Your Order • Table {table?.tableNumber || '?'}
                </span>
                <span className="text-base font-black">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black bg-slate-950 text-white px-4 py-2.5 rounded-xl shadow-md">
              <span>View Cart</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading Gourmet Menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}
