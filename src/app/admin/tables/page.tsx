'use client';

import React, { useEffect, useState } from 'react';
import {
  Grid,
  Plus,
  QrCode,
  Edit2,
  Trash2,
  RefreshCw,
  ExternalLink,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  X,
} from 'lucide-react';
import QRCardModal from '../../../components/QRCardModal';
import { api } from '../../../lib/api';
import { Table } from '../../../types';

export default function AdminTablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeQRTable, setActiveQRTable] = useState<Table | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Add / Edit Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [section, setSection] = useState('Indoor Bistro');
  const [status, setStatus] = useState('ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadTables = async () => {
    try {
      const res = await api.listTables();
      if (res.tables) setTables(res.tables);
    } catch (e) {
      console.error('Error loading tables:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleOpenAdd = () => {
    setEditingTable(null);
    setTableNumber('');
    setCapacity('4');
    setSection('Indoor Bistro');
    setStatus('ACTIVE');
    setErrorMessage('');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (table: Table) => {
    setEditingTable(table);
    setTableNumber(table.tableNumber);
    setCapacity(table.capacity.toString());
    setSection(table.section);
    setStatus(table.status);
    setErrorMessage('');
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (editingTable) {
        await api.updateTable(editingTable.id, {
          tableNumber,
          capacity: parseInt(capacity) || 4,
          section,
          status,
        });
      } else {
        await api.createTable({
          tableNumber,
          capacity: parseInt(capacity) || 4,
          section,
          status,
        });
      }
      setIsFormModalOpen(false);
      loadTables();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save table.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerateQR = async (table: Table) => {
    if (!confirm(`Are you sure you want to regenerate QR code for Table ${table.tableNumber}? Existing printed QR standees will become invalid.`)) {
      return;
    }
    try {
      await api.regenerateQR(table.id);
      loadTables();
    } catch (e) {
      console.error('Failed to regenerate QR token', e);
    }
  };

  const handleDelete = async (table: Table) => {
    if (!confirm(`Delete Table ${table.tableNumber}? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteTable(table.id);
      loadTables();
    } catch (e) {
      console.error('Failed to delete table', e);
    }
  };

  const handleOpenQRStandee = (table: Table) => {
    setActiveQRTable(table);
    setIsQRModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Grid className="w-7 h-7 text-amber-400" />
            <span>Table Management & QR Code Standees</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Assign unique QR codes to dining tables, generate printable acrylic display cards, and monitor live occupancy.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gold-gradient-bg text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Dining Table</span>
        </button>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {tables.map((table) => {
          const isOccupied = table.status === 'OCCUPIED';
          const isInactive = table.status === 'INACTIVE';
          const activeOrder = table.orders && table.orders.length > 0 ? table.orders[0] : null;

          return (
            <div
              key={table.id}
              className={`p-5 rounded-3xl glass-card border transition-all flex flex-col justify-between gap-4 ${
                isOccupied
                  ? 'border-amber-500/60 shadow-lg shadow-amber-500/5 bg-slate-900/90'
                  : isInactive
                  ? 'border-slate-800 opacity-60'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Top */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-700 text-amber-400 flex items-center justify-center font-black text-base shadow">
                      {table.tableNumber}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white">Table {table.tableNumber}</h3>
                      <p className="text-[11px] text-slate-400">{table.section}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      isOccupied
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                        : isInactive
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {table.status}
                  </span>
                </div>

                {/* Capacity & Live Order details */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>Capacity:</span>
                    </span>
                    <span className="font-semibold text-white">{table.capacity} Guests</span>
                  </div>

                  {activeOrder && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                      <div className="flex justify-between font-bold text-[11px]">
                        <span>Active: {activeOrder.orderNumber}</span>
                        <span>₹{activeOrder.total?.toFixed(2)}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Status: <strong className="text-white">{activeOrder.status}</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Table Action Bar */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => handleOpenQRStandee(table)}
                  className="w-full py-2 rounded-xl gold-gradient-bg text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Generate QR Standee</span>
                </button>

                <div className="flex items-center justify-between gap-1 pt-1">
                  <a
                    href={`/menu?table=${table.qrToken}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Test Customer Menu"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Test</span>
                  </a>

                  <button
                    onClick={() => handleRegenerateQR(table)}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Regenerate QR Token"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset QR</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(table)}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-sky-400 text-xs font-semibold transition-colors"
                    title="Edit Table"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(table)}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 text-xs font-semibold transition-colors"
                    title="Delete Table"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Standee Card Modal */}
      {isQRModalOpen && activeQRTable && (
        <QRCardModal
          table={activeQRTable}
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
        />
      )}

      {/* Add / Edit Table Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">
                {editingTable ? `Edit Table ${editingTable.tableNumber}` : 'Add New Dining Table'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Table Number / Identifier</label>
                <input
                  type="text"
                  required
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. 11, VIP-1, T-12"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Guest Capacity</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="ACTIVE">ACTIVE (Available)</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="RESERVED">RESERVED</option>
                    <option value="INACTIVE">INACTIVE (Disabled)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Dining Area / Section</label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="Indoor Bistro">Indoor Bistro</option>
                  <option value="Garden Terrace">Garden Terrace</option>
                  <option value="Rooftop Lounge">Rooftop Lounge</option>
                  <option value="VIP Gazebo">VIP Gazebo</option>
                  <option value="Poolside Cabana">Poolside Cabana</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl gold-gradient-bg text-slate-950 text-xs font-black shadow-lg"
                >
                  {isSubmitting ? 'Saving...' : editingTable ? 'Update Table' : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
