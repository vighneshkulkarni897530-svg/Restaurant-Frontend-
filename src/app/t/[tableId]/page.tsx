'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  QrCode,
  UtensilsCrossed,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { api } from '../../../lib/api';
import Navbar from '../../../components/Navbar';

export default function TableLandingPage() {
  const params = useParams();
  const router = useRouter();
  const tableParam = params?.tableId as string;

  const { setTable, setHotel } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [resolvedTableNumber, setResolvedTableNumber] = useState<string>('');

  useEffect(() => {
    if (!tableParam) {
      setErrorMessage('Invalid table QR code. No table identifier specified.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const resolveAndRedirect = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const res = await api.getTableByQR(tableParam);

        if (!isMounted) return;

        if (res.success && res.table) {
          if (res.table.status === 'INACTIVE') {
            setErrorMessage('This dining table is currently disabled by hotel management.');
            setIsLoading(false);
            return;
          }

          // Hydrate CartContext & localStorage
          setTable(res.table);
          if (res.hotel) setHotel(res.hotel);
          setResolvedTableNumber(res.table.tableNumber);

          // Seamless instant redirect to the digital menu with verified table token
          const tokenToUse = res.table.qrToken || tableParam;
          router.replace(`/menu?table=${encodeURIComponent(tokenToUse)}`);
        } else {
          setErrorMessage(res.message || 'This table is not available. Please verify your QR code.');
          setIsLoading(false);
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Failed to resolve table from QR:', err);
        setErrorMessage(
          err.message || 'Unable to connect to the restaurant server. Please try again or ask your server.'
        );
        setIsLoading(false);
      }
    };

    resolveAndRedirect();

    return () => {
      isMounted = false;
    };
  }, [tableParam, router, setTable, setHotel]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-amber-500/30 text-center shadow-2xl flex flex-col items-center max-w-sm w-full animate-fade-in">
          <div className="w-16 h-16 rounded-2xl gold-gradient-bg flex items-center justify-center text-slate-950 mb-4 shadow-lg shadow-amber-500/30">
            <UtensilsCrossed className="w-8 h-8" />
          </div>

          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Govinda's Restaurant & Dining</span>
          </div>

          <h2 className="text-xl font-black text-white mt-1">Connecting to Your Table...</h2>
          <p className="text-xs text-slate-400 mt-1.5 font-light">
            {resolvedTableNumber ? `Loading Table ${resolvedTableNumber} Menu...` : 'Validating table QR code...'}
          </p>

          <div className="mt-6 flex items-center gap-2 text-amber-400 text-xs font-semibold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Opening digital menu</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="p-8 rounded-3xl bg-slate-900 border border-rose-500/30 shadow-2xl flex flex-col items-center w-full">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-white">Table QR Issue</h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {errorMessage || 'This table is not available. Please verify the QR code with your server.'}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full">
            <Link
              href="/menu"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gold-gradient-bg text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Browse Menu Anyway</span>
            </Link>

            <Link
              href="/scan"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Scan Another Table</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
