'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, Table, HotelSetting } from '../types';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

interface CartContextType {
  cart: CartItem[];
  table: Table | null;
  hotel: HotelSetting | null;
  setTable: (table: Table | null) => void;
  setHotel: (hotel: HotelSetting | null) => void;
  addItem: (item: MenuItem, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateInstructions: (itemId: string, instructions: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  taxAmount: number;
  serviceChargeAmount: number;
  grandTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [table, setTableState] = useState<Table | null>(null);
  const [hotel, setHotel] = useState<HotelSetting | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('hotel_qr_cart');
      const savedTable = localStorage.getItem('hotel_qr_table');
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedTable) setTableState(JSON.parse(savedTable));
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('hotel_qr_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }, [cart]);

  const setTable = (t: Table | null) => {
    setTableState(t);
    if (t) {
      localStorage.setItem('hotel_qr_table', JSON.stringify(t));
    } else {
      localStorage.removeItem('hotel_qr_table');
    }
  };

  const addItem = (item: MenuItem, qty = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.menuItem.id === item.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += qty;
        return next;
      } else {
        return [...prev, { menuItem: item, quantity: qty }];
      }
    });
  };

  const removeItem = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItem.id === itemId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((i) => i.menuItem.id !== itemId);
      }
      return prev.map((i) => (i.menuItem.id === itemId ? { ...i, quantity: i.quantity - 1 } : i));
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.menuItem.id !== itemId));
    } else {
      setCart((prev) => prev.map((i) => (i.menuItem.id === itemId ? { ...i, quantity } : i)));
    }
  };

  const updateInstructions = (itemId: string, instructions: string) => {
    setCart((prev) =>
      prev.map((i) => (i.menuItem.id === itemId ? { ...i, specialInstructions: instructions } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('hotel_qr_cart');
  };

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  const taxRate = hotel?.taxRatePercent ?? 5.0;
  const serviceRate = hotel?.serviceChargePercent ?? 2.5;

  const taxAmount = parseFloat(((subtotal * taxRate) / 100).toFixed(2));
  const serviceChargeAmount = parseFloat(((subtotal * serviceRate) / 100).toFixed(2));
  const grandTotal = parseFloat((subtotal + taxAmount + serviceChargeAmount).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        cart,
        table,
        hotel,
        setTable,
        setHotel,
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
