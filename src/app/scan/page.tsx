'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import {
  QrCode,
  ArrowLeft,
  Sparkles,
  Camera,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Building,
  Upload,
  RefreshCw,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { api } from '../../lib/api';
import { Table } from '../../types';
import { playSound } from '../../lib/audio';

export default function ScanPage() {
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scannedCode, setScannedCode] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleDecodedQR = (qrText: string) => {
    if (!qrText) return;
    setScannedCode(qrText);
    playSound('beep');

    // Parse table token from URL or text
    let targetToken = qrText.trim();
    if (qrText.includes('table=')) {
      const match = qrText.match(/table=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        targetToken = match[1];
      }
    } else if (qrText.includes('/menu/')) {
      const parts = qrText.split('/menu/');
      if (parts[1]) targetToken = parts[1];
    }

    stopCamera();
    setTimeout(() => {
      router.push(`/menu?table=${targetToken}`);
    }, 400);
  };

  const scanFrame = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      let canvas = canvasRef.current;
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvasRef.current = canvas;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleDecodedQR(code.data);
          return; // Stop scanning once found
        }
      }
    }

    if (isCameraActive) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }
  };

  const startCamera = async () => {
    setCameraError('');
    setScannedCode('');
    setIsCameraActive(true);
    setIsScanning(true);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          animationFrameRef.current = requestAnimationFrame(scanFrame);
        }
      } else {
        setCameraError('Camera access not supported on this browser.');
        setIsCameraActive(false);
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError('Camera permission denied or device camera unavailable. You can upload a QR image or select a table below.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsScanning(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleDecodedQR(code.data);
          } else {
            setCameraError('No valid QR code found in the uploaded image.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleSimulateScan = (table: Table) => {
    stopCamera();
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
            <span>Real-time QR Code Scanner</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Scan Table Standee QR
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md font-light">
            Point your camera at any Table QR standee, upload a photo, or choose your table below:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
            {!isCameraActive ? (
              <button
                onClick={startCamera}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-transform hover:scale-105"
              >
                <Camera className="w-4 h-4" />
                <span>Start Live Camera Scanner</span>
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-xs"
              >
                Close Camera
              </button>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Upload QR Image</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {cameraError && (
            <p className="text-xs text-rose-400 mt-3 bg-rose-500/10 px-3.5 py-1.5 rounded-xl border border-rose-500/20 max-w-md">
              {cameraError}
            </p>
          )}

          {scannedCode && (
            <div className="mt-3 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
              <CheckCircle className="w-4 h-4" />
              <span>QR Code Detected! Redirecting to menu...</span>
            </div>
          )}

          {/* Scanner Viewport Simulation / Live Camera Graphic */}
          <div className="my-6 relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-slate-900 border-2 border-dashed border-amber-500/50 flex flex-col items-center justify-center p-6 shadow-inner overflow-hidden">
            {isCameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover rounded-3xl"
              />
            ) : null}

            {/* Animated Laser Beam */}
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse shadow-lg shadow-amber-500/50 z-10" />

            {!isCameraActive && (
              <div className="w-24 h-24 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 z-10">
                <QrCode className="w-14 h-14 animate-pulse" />
              </div>
            )}

            {selectedTable ? (
              <div className="text-xs font-bold text-white z-10 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                Selected: <span className="text-amber-400">Table {selectedTable.tableNumber}</span>
                <p className="text-[10px] text-slate-400 font-normal">{selectedTable.section}</p>
              </div>
            ) : (
              <span className="text-xs text-slate-500 z-10">Searching for QR code...</span>
            )}

            {selectedTable && !isCameraActive && (
              <button
                onClick={() => handleSimulateScan(selectedTable)}
                className="mt-3 px-4 py-1.5 rounded-xl gold-gradient-bg text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 z-10"
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
