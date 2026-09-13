'use client';

import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Download,
  Printer,
  ExternalLink,
  X,
  Copy,
  Check,
  Sparkles,
  Wifi,
  Smartphone,
  Globe,
  Settings,
} from 'lucide-react';
import { Table } from '../types';

interface QRCardModalProps {
  table: Table | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCardModal({ table, isOpen, onClose }: QRCardModalProps) {
  const [customHost, setCustomHost] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showAdvancedHost, setShowAdvancedHost] = useState(false);

  // Initialize host from window.location
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      // If accessed via localhost, suggest LAN IP if available
      setCustomHost((prev) => prev || currentOrigin);
    }
  }, [isOpen]);

  // Compute final menu URL based on customHost and table qrToken
  const activeOrigin = customHost.trim().replace(/\/$/, '') || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const menuUrl = table ? `${activeOrigin}/menu?table=${table.qrToken}` : '';

  useEffect(() => {
    if (table && menuUrl) {
      import('qrcode')
        .then((QRCodeModule) => {
          const QRCode = QRCodeModule.default || QRCodeModule;
          QRCode.toDataURL(menuUrl, {
            width: 600,
            margin: 2,
            color: {
              dark: '#0f172a',
              light: '#ffffff',
            },
            errorCorrectionLevel: 'H',
          })
            .then((url: string) => {
              setQrDataUrl(url);
            })
            .catch((err: any) => console.error('QR generation error:', err));
        })
        .catch((err: any) => console.error('Failed to load qrcode module:', err));
    }
  }, [table, menuUrl]);

  if (!isOpen || !table) return null;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in no-print overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700/80 p-5 sm:p-7 shadow-2xl my-auto">
        {/* Modal Controls */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Table QR Stand Generator</h3>
              <p className="text-[11px] text-slate-400">Scannable from any phone camera on your network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server IP / Host Configuration for Mobile Access */}
        <div className="mt-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Mobile Phone Access Target URL</span>
            </span>
            <button
              type="button"
              onClick={() => setShowAdvancedHost(!showAdvancedHost)}
              className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              <span>{showAdvancedHost ? 'Hide Settings' : 'Change Host IP'}</span>
            </button>
          </div>

          {showAdvancedHost ? (
            <div className="space-y-2 pt-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customHost}
                  onChange={(e) => setCustomHost(e.target.value)}
                  placeholder="e.g. http://192.168.1.5:3000 or http://10.230.94.1:3000"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <span className="text-slate-400 py-0.5">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => setCustomHost('http://10.230.94.1:3000')}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-mono"
                >
                  Wi-Fi (10.230.94.1:3000)
                </button>
                <button
                  type="button"
                  onClick={() => setCustomHost('http://192.168.137.1:3000')}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-mono"
                >
                  Hotspot (192.168.137.1:3000)
                </button>
                {typeof window !== 'undefined' && (
                  <button
                    type="button"
                    onClick={() => setCustomHost(window.location.origin)}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono"
                  >
                    Current Host ({window.location.host})
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>QR Destination: <strong className="text-white font-mono">{menuUrl}</strong></span>
            </p>
          )}
        </div>

        {/* Printable Branded Acrylic Stand Preview */}
        <div
          id="printable-receipt"
          className="my-3 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 text-center shadow-2xl flex flex-col items-center"
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
          <div className="mt-3.5 px-6 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-sm tracking-wider shadow-lg shadow-amber-500/30">
            TABLE {table.tableNumber} • {table.section}
          </div>

          {/* QR Code Container */}
          <div className="mt-4 p-3.5 rounded-2xl bg-white shadow-2xl border-4 border-slate-800 flex items-center justify-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code Table ${table.tableNumber}`}
                className="w-44 h-44 sm:w-52 sm:h-52"
              />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">
                Generating QR...
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-3.5 text-xs text-slate-300 font-medium space-y-1">
            <p>1. Open Phone Camera or QR Scanner</p>
            <p>2. Scan Code to Browse Gourmet Menu</p>
            <p>3. Customize & Pay at Your Table</p>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <Wifi className="w-3 h-3 text-amber-400" />
            <span>Complimentary WiFi: <strong className="text-amber-400">Govindas_Guest_WiFi</strong></span>
          </div>
        </div>

        {/* Quick URL Box */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <input
            type="text"
            readOnly
            value={menuUrl}
            className="flex-1 bg-transparent text-slate-400 truncate outline-none px-1 font-mono text-[11px]"
          />
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-800">
          <a
            href={menuUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-amber-400" />
            <span>Open Menu in Browser</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
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
