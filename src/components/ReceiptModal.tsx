'use client';

import React from 'react';
import { Printer, X, FileText, CheckCircle } from 'lucide-react';
import { Order } from '../types';

interface ReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  type?: 'KOT' | 'BILL';
}

export default function ReceiptModal({ order, isOpen, onClose, type = 'BILL' }: ReceiptModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const isKOT = type === 'KOT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in no-print">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl">
        {/* Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">
              {isKOT ? 'Kitchen Order Ticket (KOT)' : 'Customer Tax Invoice'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div
          id="printable-receipt"
          className="my-4 p-5 rounded-xl bg-white text-slate-900 font-mono text-xs shadow-inner border border-slate-300"
        >
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-400">
            <h2 className="text-sm font-bold tracking-wider uppercase">Govinda's Restaurant & Dining</h2>
            <p className="text-[10px] text-slate-600">Pure Veg Gourmet & QR Table Service</p>
            <p className="text-[10px] text-slate-600">Plot 108, Govinda Complex, Mumbai</p>
            <p className="text-[10px] text-slate-600">GSTIN: 27AABCG1234F1Z5</p>

            <div className="mt-2 py-1 bg-slate-100 rounded font-bold text-slate-800">
              {isKOT ? '*** KITCHEN ORDER TICKET ***' : '*** TAX INVOICE ***'}
            </div>
          </div>

          {/* Metadata */}
          <div className="py-2.5 border-b border-dashed border-slate-400 flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between">
              <span>Order #: {order.orderNumber}</span>
              <span className="font-bold">TABLE: {order.table?.tableNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-slate-600 text-[10px]">
              <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
              <span>Time: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span>Customer: {order.customerName || 'Guest'}</span>
              <span>Section: {order.table?.section || 'Main Dining'}</span>
            </div>
            {order.notes && (
              <div className="mt-1 p-1 bg-amber-50 rounded text-amber-900 text-[10px] font-semibold border border-amber-200">
                Notes: {order.notes}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="py-2.5 border-b border-dashed border-slate-400">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-300 text-[10px] uppercase text-slate-600">
                  <th className="py-1">Item</th>
                  <th className="py-1 text-center">Qty</th>
                  {!isKOT && <th className="py-1 text-right">Price</th>}
                  {!isKOT && <th className="py-1 text-right">Total</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="py-1">
                    <td className="py-1 font-medium">{item.name}</td>
                    <td className="py-1 text-center font-bold">x{item.quantity}</td>
                    {!isKOT && <td className="py-1 text-right">₹{item.unitPrice.toFixed(2)}</td>}
                    {!isKOT && <td className="py-1 text-right font-semibold">₹{item.itemTotal.toFixed(2)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bill Totals (Bill Only) */}
          {!isKOT && (
            <div className="pt-2.5 flex flex-col gap-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[10px]">
                <span>CGST (2.5%) + SGST (2.5%):</span>
                <span>₹{order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[10px]">
                <span>Service Charge (2.5%):</span>
                <span>₹{order.serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-400 font-bold text-sm text-slate-900">
                <span>GRAND TOTAL:</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] mt-1 pt-1 border-t border-dashed border-slate-300">
                <span>Payment Status:</span>
                <span className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {order.paymentStatus} ({order.payment?.paymentMethod || 'Cash/Card'})
                </span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 pt-2 text-center text-[10px] text-slate-500 border-t border-dashed border-slate-300">
            <p>Thank you for dining with us!</p>
            <p className="text-[9px] text-slate-400">Powered by Hotel QR Ordering System</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-xl gold-gradient-bg text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print {isKOT ? 'KOT' : 'Receipt'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
