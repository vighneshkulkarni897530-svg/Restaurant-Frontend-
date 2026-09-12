'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Minus, Sparkles, Flame, Clock, EyeOff } from 'lucide-react';
import { MenuItem } from '../types';
import { useCart } from '../context/CartContext';

interface FoodItemCardProps {
  item: MenuItem;
}

export default function FoodItemCard({ item }: FoodItemCardProps) {
  const { cart, addItem, removeItem } = useCart();

  const cartItem = cart.find((i) => i.menuItem.id === item.id);
  const currentQuantity = cartItem?.quantity || 0;

  return (
    <div className={`relative flex flex-col justify-between rounded-2xl glass-card overflow-hidden border transition-all duration-300 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5 group ${
      !item.isAvailable ? 'opacity-60 grayscale' : ''
    }`}>
      {/* Top Media & Tags */}
      <div>
        <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-900">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
              <span>No image available</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

          {/* Veg / Non-Veg Indicator Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-700/60 shadow-lg">
            <span
              className={`w-2.5 h-2.5 rounded-full border-2 ${
                item.isVeg
                  ? 'border-emerald-500 bg-emerald-500'
                  : 'border-rose-500 bg-rose-500'
              }`}
            />
            <span className="text-[10px] font-bold tracking-wide uppercase text-slate-200">
              {item.isVeg ? 'Veg' : 'Non-Veg'}
            </span>
          </div>

          {/* Chef Special Badge */}
          {item.isChefSpecial && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 text-[10px] font-extrabold shadow-lg shadow-amber-500/30 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Chef's Choice</span>
            </div>
          )}

          {/* Prep Time & Spicy Level Pills */}
          <div className="absolute bottom-2.5 left-3 flex items-center gap-2">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/90 text-slate-300 text-[11px] font-medium border border-slate-800">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{item.preparationTimeMin || 15}m</span>
            </span>

            {item.spicyLevel > 0 && (
              <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-slate-900/90 text-orange-400 text-[11px] font-medium border border-slate-800">
                <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
                <span className="text-[10px]">{item.spicyLevel === 1 ? 'Mild' : item.spicyLevel === 2 ? 'Medium' : 'Spicy'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Content Details */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-sm sm:text-base text-white tracking-tight leading-snug group-hover:text-amber-300 transition-colors">
              {item.name}
            </h3>
          </div>

          {item.description && (
            <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed font-light">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* Pricing & Cart Action Bar */}
      <div className="p-4 pt-0 flex items-center justify-between mt-2 border-t border-slate-800/60 pt-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 font-medium uppercase">Price</span>
          <span className="text-base font-extrabold text-amber-400">
            ₹{item.price.toFixed(2)}
          </span>
        </div>

        {item.isAvailable ? (
          <div>
            {currentQuantity === 0 ? (
              <button
                onClick={() => addItem(item, 1)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>ADD</span>
              </button>
            ) : (
              <div className="flex items-center rounded-xl bg-slate-800 border border-amber-500/40 p-1 shadow-inner">
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-700 text-amber-400 flex items-center justify-center transition-colors active:scale-90"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-white">
                  {currentQuantity}
                </span>
                <button
                  onClick={() => addItem(item, 1)}
                  className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition-colors active:scale-90"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            <EyeOff className="w-3.5 h-3.5" />
            <span>Sold Out</span>
          </div>
        )}
      </div>
    </div>
  );
}
