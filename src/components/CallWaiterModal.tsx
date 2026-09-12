'use client';

import React, { useState } from 'react';
import { BellRing, X, GlassWater, Sparkles, Receipt, CheckCircle, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';
import { playSound } from '../lib/audio';

interface CallWaiterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CallWaiterModal({ isOpen, onClose }: CallWaiterModalProps) {
  const { table } = useCart();
  const [selectedType, setSelectedType] = useState<'CALL_WAITER' | 'WATER_REFILL' | 'CLEAN_TABLE' | 'REQUEST_BILL'>('CALL_WAITER');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const requestOptions = [
    {
      id: 'CALL_WAITER',
      label: 'Call Waiter to Table',
      desc: 'Need assistance or have questions',
      icon: BellRing,
      color: 'text-amber-400',
    },
    {
      id: 'WATER_REFILL',
      label: 'Drinking Water Refill',
      desc: 'Request chilled / room temperature water',
      icon: GlassWater,
      color: 'text-sky-400',
    },
    {
      id: 'CLEAN_TABLE',
      label: 'Clean Table & Cutlery',
      desc: 'Request extra spoons, forks or napkins',
      icon: Sparkles,
      color: 'text-emerald-400',
    },
    {
      id: 'REQUEST_BILL',
      label: 'Request Final Bill',
      desc: 'Ready to settle payments and conclude',
      icon: Receipt,
      color: 'text-purple-400',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!table) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.callWaiter({
        tableId: table.id,
        qrToken: table.qrToken,
        requestType: selectedType,
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        playSound('waiter_bell');
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          onClose();
        }, 2200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to alert staff. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl glass-panel border border-slate-700/80 bg-slate-900/95 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Table Service Assistance</h3>
              <p className="text-xs text-amber-300/80">Table {table?.tableNumber || 'Current Table'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Staff Alerted!</h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xs">
              A server has been notified on their dashboard and will arrive at Table {table?.tableNumber} shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">How can we assist you?</label>
              <div className="grid grid-cols-1 gap-2">
                {requestOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedType === opt.id;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setSelectedType(opt.id as any)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className={`p-2 rounded-lg bg-slate-900 border border-slate-700 ${opt.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white">{opt.label}</div>
                        <div className="text-[11px] text-slate-400 truncate">{opt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Optional Notes for Server</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please bring extra tissue and glasses"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition-colors"
                maxLength={100}
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl gold-gradient-bg text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isSubmitting ? 'Notifying...' : 'Notify Staff'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
