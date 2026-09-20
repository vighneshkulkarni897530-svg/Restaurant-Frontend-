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
  Monitor,
  Flame,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Table } from '../types';
import { api } from '../lib/api';
import {
  getAppBaseUrl,
  buildTableQRUrl,
  sanitizeHostUrl,
  isPrivateIp,
  CLOUD_PROD_URL,
} from '../lib/urlUtils';

interface QRCardModalProps {
  table: Table | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCardModal({ table, isOpen, onClose }: QRCardModalProps) {
  const [customHost, setCustomHost] = useState<string>(CLOUD_PROD_URL);
  const [detectedIps, setDetectedIps] = useState<{ name: string; ip: string; isWifi?: boolean; isHotspot?: boolean }[]>([]);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const currentPort = typeof window !== 'undefined' && window.location.port ? window.location.port : '3000';

  // Initialize destination host on modal open
  useEffect(() => {
    if (!isOpen) return;

    // Default to the robust cloud/production URL so ANY phone on ANY network can scan immediately
    const prodUrl = getAppBaseUrl();
    setCustomHost(prodUrl);

    // Discover local Wi-Fi interfaces for optional LAN testing
    const detectIp = async () => {
      try {
        const res = await api.getNetworkIp();
        const validLanIfaces = (res.interfaces || []).filter(
          (iface: any) => iface.ip && isPrivateIp(iface.ip)
        );
        setDetectedIps(validLanIfaces);
      } catch (err) {
        console.warn('[QRModal] Local IP discovery notice:', err);
      }
    };

    detectIp();
  }, [isOpen]);

  // Compute clean host & robust table URL
  const activeOrigin = sanitizeHostUrl(customHost || getAppBaseUrl());
  const menuUrl = table ? buildTableQRUrl(table, activeOrigin) : '';

  // Generate crisp QR code whenever table or menuUrl changes
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

  const isLiveHttps = activeOrigin.startsWith('https://');
  const isLanSelected = isPrivateIp(activeOrigin.replace(/^https?:\/\//, '').split(':')[0]);

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
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Table QR Stand Generator</h3>
              <p className="text-[11px] text-slate-400">Scannable from any smartphone camera or QR reader</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Address Selector */}
        <div className="mt-3.5 p-3.5 rounded-2xl bg-slate-950/90 border border-amber-500/30 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Target QR Mode</span>
            </span>
            {isLiveHttps ? (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Global Cloud QR (Recommended)</span>
              </span>
            ) : isLanSelected ? (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1">
                <Smartphone className="w-3 h-3" />
                <span>Local Wi-Fi Network</span>
              </span>
            ) : (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300 font-semibold">
                Localhost
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {/* 1. Production Cloud Button (DEFAULT) */}
            <button
              type="button"
              onClick={() => setCustomHost(CLOUD_PROD_URL)}
              className={`px-3 py-2 rounded-xl text-[11px] transition-all border flex items-center gap-1.5 ${
                activeOrigin === CLOUD_PROD_URL
                  ? 'gold-gradient-bg text-slate-950 border-amber-400 shadow-md shadow-amber-500/25 font-bold'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-400/60'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>🌐 Global Cloud QR (Vercel)</span>
              {activeOrigin === CLOUD_PROD_URL && (
                <span className="text-[9px] px-1.5 py-0.2 bg-slate-950 text-amber-400 rounded font-black">
                  ACTIVE
                </span>
              )}
            </button>

            {/* 2. Local Wi-Fi IP Button */}
            {detectedIps.map((iface) => {
              const lanHost = `http://${iface.ip}:${currentPort}`;
              const isSelected = activeOrigin === lanHost;
              return (
                <button
                  key={iface.ip}
                  type="button"
                  onClick={() => setCustomHost(lanHost)}
                  className={`px-3 py-2 rounded-xl text-[11px] transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? 'gold-gradient-bg text-slate-950 border-amber-400 shadow-md shadow-amber-500/25 font-bold'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-400/60'
                  }`}
                >
                  <Wifi className="w-3.5 h-3.5 text-amber-400" />
                  <span>📶 Local Wi-Fi ({iface.ip}:{currentPort})</span>
                  {isSelected && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-slate-950 text-amber-400 rounded font-black">
                      ACTIVE
                    </span>
                  )}
                </button>
              );
            })}

            {/* 3. Localhost Button */}
            {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
              <button
                type="button"
                onClick={() => setCustomHost(window.location.origin)}
                className={`px-3 py-2 rounded-xl text-[11px] transition-all border flex items-center gap-1.5 ${
                  activeOrigin === window.location.origin
                    ? 'gold-gradient-bg text-slate-950 border-amber-400 shadow-md shadow-amber-500/25 font-bold'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-400/60'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>💻 Localhost Browser</span>
                {activeOrigin === window.location.origin && (
                  <span className="text-[9px] px-1.5 py-0.2 bg-slate-950 text-amber-400 rounded font-black">
                    ACTIVE
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Active URL confirmation */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">
                QR encodes: <strong className="text-amber-400 font-mono">{menuUrl}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded font-semibold shrink-0"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Printable Branded Acrylic Stand Preview */}
        <div
          id="printable-receipt"
          className="my-3.5 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 text-center shadow-2xl flex flex-col items-center"
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
