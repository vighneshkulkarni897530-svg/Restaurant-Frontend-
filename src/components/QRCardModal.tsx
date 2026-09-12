'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Printer, ExternalLink, X, Copy, Check, Sparkles } from 'lucide-react';
import { Table } from '../types';

interface QRCardModalProps {
  table: Table | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCardModal({ table, isOpen, onClose }: QRCardModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (table) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const menuUrl = `${origin}/menu?table=${table.qrToken}`;

      QRCode.toDataURL(menuUrl, {
        width: 600,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      }).then((url) => {
        setQrDataUrl(url);
      });
    }
  }, [table]);

  if (!isOpen || !table) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const menuUrl = `${origin}/menu?table=${table.qrToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `Table_${table.tableNumber}_QR_Code.png`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in no-print">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl">
        {/* Modal Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Table QR Stand Generator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Branded Acrylic Stand Preview */}
        <div
          id="printable-receipt"
          className="my-5 p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 text-center shadow-2xl flex flex-col items-center"
        >
          {/* Hotel Top Banner */}
          <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-xs tracking-widest uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Govinda's Restaurant & Dining</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            CONTACTLESS DINING
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Scan to View Digital Menu & Place Order</p>

          {/* Table Badge */}
          <div className="mt-4 px-6 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-sm tracking-wider shadow-lg shadow-amber-500/30">
            TABLE {table.tableNumber} • {table.section}
          </div>

          {/* QR Code Container */}
          <div className="mt-5 p-4 rounded-2xl bg-white shadow-2xl border-4 border-slate-800 flex items-center justify-center">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt={`QR Code Table ${table.tableNumber}`} className="w-48 h-48 sm:w-56 sm:h-56" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                Generating QR...
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 text-xs text-slate-300 font-medium space-y-1">
            <p>1. Open Phone Camera or QR Scanner</p>
            <p>2. Scan Code to Browse Gourmet Menu</p>
            <p>3. Customize & Pay at Your Table</p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
            Complimentary High-Speed WiFi: <span className="text-amber-400 font-semibold">Govindas_Guest_WiFi</span>
          </div>
        </div>

        {/* Quick URL Box */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <input
            type="text"
            readOnly
            value={menuUrl}
            className="flex-1 bg-transparent text-slate-400 truncate outline-none px-1"
          />
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <a
            href={menuUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-amber-400" />
            <span>Test Customer Menu</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Download PNG</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl gold-gradient-bg text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Stand Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
