'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  Zap,
  ZapOff,
  SwitchCamera,
  AlertCircle,
  Smartphone,
  Eye,
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
  const [detectedTableInfo, setDetectedTableInfo] = useState<Table | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  // 1. Fetch available dining tables
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

  // Enumerate camera devices if supported
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          setAvailableCameras(videoInputs);
        })
        .catch((err) => console.warn('Camera enumeration error:', err));
    }
  }, []);

  // 2. Parse decoded QR string into a valid table token or matched Table
  const resolveTableFromQR = useCallback((qrText: string): { token: string; matchedTable: Table | null } => {
    const raw = qrText.trim();
    let targetToken = raw;
    let matched: Table | null = null;

    // A. Check if raw text is a full URL
    try {
      if (raw.startsWith('http://') || raw.startsWith('https://') || raw.includes('/menu') || raw.includes('?')) {
        const urlObj = new URL(raw, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
        const queryTable = urlObj.searchParams.get('table') || urlObj.searchParams.get('token') || urlObj.searchParams.get('t');
        if (queryTable) {
          targetToken = queryTable;
        } else if (urlObj.pathname.includes('/tables/qr/')) {
          targetToken = urlObj.pathname.split('/tables/qr/')[1]?.split('/')[0] || raw;
        } else if (urlObj.pathname.includes('/menu/')) {
          targetToken = urlObj.pathname.split('/menu/')[1]?.split('/')[0] || raw;
        }
      }
    } catch {
      // Fallback regex parsing if URL constructor fails
      const tableMatch = raw.match(/[?&]table=([a-zA-Z0-9_-]+)/) || raw.match(/table=([a-zA-Z0-9_-]+)/);
      if (tableMatch && tableMatch[1]) {
        targetToken = tableMatch[1];
      }
    }

    // B. Match targetToken against loaded tables
    const exactMatch = tables.find(
      (t) =>
        t.qrToken.toLowerCase() === targetToken.toLowerCase() ||
        t.id.toLowerCase() === targetToken.toLowerCase() ||
        t.tableNumber.toLowerCase() === targetToken.toLowerCase() ||
        `table ${t.tableNumber.toLowerCase()}` === targetToken.toLowerCase()
    );

    if (exactMatch) {
      matched = exactMatch;
      targetToken = exactMatch.qrToken;
    } else {
      // Check partial match if user scanned just a table number
      const numMatch = targetToken.replace(/[^0-9]/g, '');
      if (numMatch) {
        const paddedNum = numMatch.padStart(2, '0');
        const byNum = tables.find((t) => t.tableNumber === numMatch || t.tableNumber === paddedNum);
        if (byNum) {
          matched = byNum;
          targetToken = byNum.qrToken;
        }
      }
    }

    return { token: targetToken, matchedTable: matched };
  }, [tables]);

  // 3. Handle a successfully decoded QR code
  const handleDecodedQR = useCallback((qrText: string) => {
    if (!qrText || !isScanningRef.current) return;
    
    isScanningRef.current = false;
    setScannedCode(qrText);
    playSound('beep');

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    const { token, matchedTable } = resolveTableFromQR(qrText);
    if (matchedTable) {
      setDetectedTableInfo(matchedTable);
    }

    // Stop active camera
    stopCamera();

    // Redirect to menu with table token
    setTimeout(() => {
      router.push(`/menu?table=${encodeURIComponent(token)}`);
    }, 600);
  }, [resolveTableFromQR, router]);

  // 4. Frame Scanner Loop
  const scanLoop = useCallback(async () => {
    if (!isScanningRef.current) return;

    const video = videoRef.current;
    if (video && video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0 && video.videoHeight > 0) {
      const now = performance.now();
      // Scan every 80ms to avoid UI stutter and save battery
      if (now - lastScanTimeRef.current > 80) {
        lastScanTimeRef.current = now;

        // Strategy A: Native BarcodeDetector (Supported in Android Chrome, Desktop Chrome, Edge, Safari 17+)
        let detected = false;
        if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
          try {
            const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
            const barcodes = await barcodeDetector.detect(video);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              detected = true;
              handleDecodedQR(barcodes[0].rawValue);
              return;
            }
          } catch {
            // BarcodeDetector not available or errored, fallback to jsQR
          }
        }

        // Strategy B: Software jsQR with Canvas extraction
        if (!detected) {
          let canvas = canvasRef.current;
          if (!canvas) {
            canvas = document.createElement('canvas');
            canvasRef.current = canvas;
          }

          // Use scaled-down frame for ultra fast JS processing (max 640 width)
          const scale = Math.min(1, 640 / video.videoWidth);
          canvas.width = Math.floor(video.videoWidth * scale);
          canvas.height = Math.floor(video.videoHeight * scale);

          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth',
            });

            if (code && code.data) {
              handleDecodedQR(code.data);
              return;
            }
          }
        }
      }
    }

    if (isScanningRef.current) {
      animationFrameRef.current = requestAnimationFrame(scanLoop);
    }
  }, [handleDecodedQR]);

  // 5. Start Live Camera
  const startCamera = async (overrideFacingMode?: 'environment' | 'user') => {
    setCameraError('');
    setScannedCode('');
    setDetectedTableInfo(null);
    setIsCameraActive(true);
    isScanningRef.current = true;

    const targetMode = overrideFacingMode || facingMode;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported on this browser/device.');
      }

      // Stop any existing stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }

      let stream: MediaStream | null = null;

      // Try environment camera first
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: targetMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch {
        // Fallback to basic video constraint if ideal constraints fail
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: targetMode },
          });
        } catch {
          // Ultimate fallback to any available video input
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
        }
      }

      if (stream) {
        mediaStreamRef.current = stream;

        // Check if torch/flashlight is supported
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const capabilities = (videoTrack.getCapabilities && videoTrack.getCapabilities()) as any;
          if (capabilities && capabilities.torch) {
            setHasTorch(true);
          } else {
            setHasTorch(false);
          }
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.muted = true;

          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play().then(() => {
                isScanningRef.current = true;
                animationFrameRef.current = requestAnimationFrame(scanLoop);
              }).catch((e) => console.warn('Video play error:', e));
            }
          };
        }
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      isScanningRef.current = false;
      setIsCameraActive(false);
      setCameraError(
        err.message?.includes('Permission') || err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera permissions in your browser or select your table below.'
          : 'Unable to start camera. You can upload a photo of your QR standee or choose a table below.'
      );
    }
  };

  // 6. Stop Camera
  const stopCamera = () => {
    isScanningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsTorchOn(false);
  };

  // 7. Toggle Torch / Flashlight
  const toggleTorch = async () => {
    if (!mediaStreamRef.current) return;
    const track = mediaStreamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !isTorchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setIsTorchOn(nextState);
      } catch (err) {
        console.warn('Failed to toggle torch:', err);
      }
    }
  };

  // 8. Flip Camera (Front / Back)
  const flipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isCameraActive) {
      startCamera(nextMode);
    }
  };

  // 9. Upload & Decode QR Image File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCameraError('');
    setScannedCode('');
    setDetectedTableInfo(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        // Strategy A: Native BarcodeDetector
        if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
          try {
            const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
            const barcodes = await barcodeDetector.detect(img);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              isScanningRef.current = true;
              handleDecodedQR(barcodes[0].rawValue);
              return;
            }
          } catch {
            // fallback
          }
        }

        // Strategy B: Canvas + jsQR with adaptive downscaling
        const maxDim = 1200;
        let scale = 1;
        if (img.width > maxDim || img.height > maxDim) {
          scale = Math.min(maxDim / img.width, maxDim / img.height);
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(img.width * scale);
        canvas.height = Math.floor(img.height * scale);
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });

          if (code && code.data) {
            isScanningRef.current = true;
            handleDecodedQR(code.data);
          } else {
            // Try at original native scale if downscale didn't hit
            if (scale !== 1) {
              const fullCanvas = document.createElement('canvas');
              fullCanvas.width = img.width;
              fullCanvas.height = img.height;
              const fullCtx = fullCanvas.getContext('2d');
              if (fullCtx) {
                fullCtx.drawImage(img, 0, 0);
                const fullData = fullCtx.getImageData(0, 0, img.width, img.height);
                const fullCode = jsQR(fullData.data, fullData.width, fullData.height, {
                  inversionAttempts: 'attemptBoth',
                });
                if (fullCode && fullCode.data) {
                  isScanningRef.current = true;
                  handleDecodedQR(fullCode.data);
                  return;
                }
              }
            }
            setCameraError('No readable QR code found in this image. Please ensure the QR code is clear and well-lit.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input value so same file can be selected again
    e.target.value = '';
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // 10. Simulate Direct Table Selection
  const handleSimulateScan = (table: Table) => {
    stopCamera();
    playSound('beep');
    router.push(`/menu?table=${table.qrToken}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Building className="w-3.5 h-3.5 text-amber-400" />
            <span>Govinda's Dining Smart Table Scanner</span>
          </div>
        </div>

        {/* Interactive Scanner Card */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/30 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-3">
            <Camera className="w-4 h-4 text-amber-400" />
            <span>Live Camera & Image QR Scanner</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Scan Table Standee QR Code
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-md font-light">
            Point your camera at any Govinda's table acrylic standee, upload a photo, or choose your dining table below:
          </p>

          {/* Scanner Control Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
            {!isCameraActive ? (
              <button
                onClick={() => startCamera()}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Start Live Camera Scanner</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={stopCamera}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 font-bold text-xs transition-colors"
                >
                  Stop Camera
                </button>

                {availableCameras.length > 1 && (
                  <button
                    onClick={flipCamera}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-colors"
                    title="Flip Camera (Front/Back)"
                  >
                    <SwitchCamera className="w-4 h-4 text-amber-400" />
                  </button>
                )}

                {hasTorch && (
                  <button
                    onClick={toggleTorch}
                    className={`p-2.5 rounded-xl border font-bold text-xs transition-colors ${
                      isTorchOn
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                    }`}
                    title={isTorchOn ? 'Turn Flashlight Off' : 'Turn Flashlight On'}
                  >
                    {isTorchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4 text-amber-400" />}
                  </button>
                )}
              </div>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-2 transition-colors shadow-sm"
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

          {/* Camera Error Message */}
          {cameraError && (
            <div className="mt-3.5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs max-w-md flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p>{cameraError}</p>
            </div>
          )}

          {/* Success Banner on QR Detection */}
          {scannedCode && (
            <div className="mt-4 px-5 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-3 shadow-lg shadow-emerald-500/10 animate-bounce">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div className="text-left">
                <div>QR Code Detected!</div>
                <div className="text-[11px] font-normal text-emerald-200">
                  {detectedTableInfo ? `Opening Table ${detectedTableInfo.tableNumber} (${detectedTableInfo.section}) menu...` : 'Redirecting to your digital table menu...'}
                </div>
              </div>
            </div>
          )}

          {/* Scanner Viewport with Viewfinder Overlay */}
          <div className="my-6 relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl bg-slate-900/90 border-2 border-dashed border-amber-500/40 flex flex-col items-center justify-center p-6 shadow-inner overflow-hidden">
            {/* Live Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover rounded-3xl transition-opacity duration-300 ${
                isCameraActive ? 'opacity-100 z-0' : 'opacity-0 -z-10'
              }`}
            />

            {/* Viewfinder Target Framing Box */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 border border-amber-500/30 rounded-2xl flex items-center justify-center z-10 pointer-events-none">
              {/* Corner Reticles */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-xl" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-xl" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-xl" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-xl" />

              {/* Animated Laser Scanning Beam */}
              {isCameraActive && (
                <div className="absolute left-2 right-2 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-lg shadow-amber-400/80 animate-pulse z-20" />
              )}

              {!isCameraActive && (
                <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-1 z-10">
                  <QrCode className="w-12 h-12 animate-pulse" />
                </div>
              )}
            </div>

            {/* Active Status Badge */}
            <div className="mt-3 text-xs font-bold text-white z-10 bg-slate-950/85 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-md">
              {isCameraActive ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Scanning for Table QR Code...</span>
                </span>
              ) : selectedTable ? (
                <div>
                  Selected: <span className="text-amber-400">Table {selectedTable.tableNumber}</span>
                  <span className="text-[10px] text-slate-400 font-normal ml-1">({selectedTable.section})</span>
                </div>
              ) : (
                <span className="text-slate-400">Point at Table QR Standee</span>
              )}
            </div>

            {/* 1-Click Launch Menu CTA */}
            {selectedTable && !isCameraActive && (
              <button
                onClick={() => handleSimulateScan(selectedTable)}
                className="mt-3 px-4 py-1.5 rounded-xl gold-gradient-bg text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 z-10"
              >
                <span>Launch Table {selectedTable.tableNumber} Menu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Table Selector Grid (Manual 1-Click Fallback) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Select Table Directly</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                  {tables.length} Tables Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">Click any dining table to instantly open its assigned digital menu:</p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {tables.map((table) => {
                const isSelected = selectedTable?.id === table.id;
                return (
                  <div
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/10'
                        : 'glass-card border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-sm shadow-inner">
                        {table.tableNumber}
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-sm text-white">Table {table.tableNumber}</h4>
                        <p className="text-[11px] text-slate-400">{table.section} • {table.capacity} Seats</p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSimulateScan(table);
                      }}
                      className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-transform hover:scale-105 active:scale-95 shadow-md shadow-amber-500/20"
                      title={`Open Table ${table.tableNumber} Menu`}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
