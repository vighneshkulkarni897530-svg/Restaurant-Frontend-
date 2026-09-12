'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  QrCode,
  ArrowLeft,
  Sparkles,
  Camera,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { api } from '../../lib/api';
import { Table } from '../../types';

export default function ScanPage() {
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  useEffect(() => {
    const loadTables = async () => {
      try {
        const res = await api.listTables();
        if (res.tables) {
          setTables(res.tables);
          if (res.tables.length > 0) {
            setSelectedTable(res.tables[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load tables:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTables();
  }, []);

  const handleSimulateScan = (table: Table) => {
    router.push(`/menu?table=${table.qrToken}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>

        {/* Interactive Scanner Simulator Card */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/30 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-3">
            <Camera className="w-3.5 h-3.5" />
            <span>Table QR Code Scanner</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Scan Table Standee QR
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md font-light">
            In our restaurant, point your mobile camera at the wooden stand on your table. You can simulate the scan below:
          </p>

          {/* Scanner Viewport Simulation Graphic */}
          <div className="my-6 relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-slate-900 border-2 border-dashed border-amber-500/50 flex flex-col items-center justify-center p-6 shadow-inner overflow-hidden">
            {/* Animated Laser Beam */}
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse shadow-lg shadow-amber-500/50" />

            <div className="w-24 h-24 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
              <QrCode className="w-14 h-14 animate-pulse" />
            </div>

            {selectedTable ? (
              <div className="text-xs font-bold text-white">
                Detected: <span className="text-amber-400">Table {selectedTable.tableNumber}</span>
                <p className="text-[10px] text-slate-400 font-normal">{selectedTable.section}</p>
              </div>
            ) : (
              <span className="text-xs text-slate-500">Searching for QR code...</span>
            )}

            {selectedTable && (
              <button
                onClick={() => handleSimulateScan(selectedTable)}
                className="mt-3 px-4 py-1.5 rounded-xl gold-gradient-bg text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span>Launch Table Menu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Table Selector Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">All Restaurant Tables</h2>
              <p className="text-xs text-slate-400">Click any table to open its assigned customer digital menu</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {tables.map((table) => {
              const isSelected = selectedTable?.id === table.id;
              return (
                <div
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/10'
                      : 'glass-card border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-sm">
                      {table.tableNumber}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Table {table.tableNumber}</h4>
                      <p className="text-[11px] text-slate-400">{table.section} • {table.capacity} Seats</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSimulateScan(table);
                    }}
                    className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-transform hover:scale-105 shadow-md shadow-amber-500/20"
                    title={`Scan Table ${table.tableNumber}`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
