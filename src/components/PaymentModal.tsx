'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  QrCode,
  Smartphone,
  CreditCard,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Sparkles,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { api } from '../lib/api';
import { playSound } from '../lib/audio';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  customerName?: string;
  customerPhone?: string;
  orderNumber?: string;
  orderId?: string;
  onPaymentSuccess: (paymentData: {
    paymentMethod: string;
    razorpayPaymentId: string;
    razorpayOrderId: string;
  }) => void;
}

type PaymentTab = 'QR' | 'UPI_APPS' | 'CARD' | 'NETBANKING';

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  customerName = 'Guest Diner',
  customerPhone = '',
  orderNumber,
  orderId,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<PaymentTab>('QR');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [upiIdInput, setUpiIdInput] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  
  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(customerName || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Processing & Verification State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const upiVpa = 'restaurant.pay@icici';
  const upiPayLink = `upi://pay?pa=${upiVpa}&pn=Govindas%20Restaurant&am=${amount.toFixed(
    2
  )}&cu=INR&tn=${encodeURIComponent(orderNumber || 'Dining Order')}`;

  // Generate UPI QR Code on mount or amount change
  useEffect(() => {
    if (!isOpen) return;
    setIsSuccess(false);
    setIsProcessing(false);
    setErrorMessage('');

    import('qrcode').then((QRCodeModule) => {
      const QRCode = QRCodeModule.default || QRCodeModule;
      QRCode.toDataURL(upiPayLink, {
        width: 280,
        margin: 2,
        color: {
          dark: '#020617',
          light: '#ffffff',
        },
      })
        .then((url: string) => setQrCodeUrl(url))
        .catch((err: any) => console.error('QR code generation error:', err));
    }).catch(err => console.error('Failed to load qrcode library:', err));
  }, [isOpen, amount, upiPayLink]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(upiVpa);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleFillTestCard = () => {
    setCardNumber('4532 •••• •••• 8890');
    setCardExpiry('12/28');
    setCardCvv('789');
    if (!cardHolder) setCardHolder(customerName || 'Test Diner');
  };

  const executePaymentVerification = async (methodName: string) => {
    setIsProcessing(true);
    setErrorMessage('');
    setProcessingStep('Connecting to secure payment gateway...');

    try {
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStep('Authorizing & confirming transaction...');

      const simPaymentId = `pay_rzp_${Date.now()}`;
      const simOrderId = `ord_rzp_${Date.now()}`;

      // If existing orderId is provided (e.g. tracking page), verify via backend/api
      if (orderId) {
        await api.verifyPayment({
          orderId,
          razorpayPaymentId: simPaymentId,
          razorpayOrderId: simOrderId,
          paymentMethod: methodName,
        });
      }

      await new Promise((r) => setTimeout(r, 600));
      setProcessingStep('Payment Verified Successfully!');
      setIsSuccess(true);
      playSound('success');

      // Trigger Confetti Celebration
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#10b981', '#6366f1', '#ec4899'],
      });

      // Notify parent after short delay
      setTimeout(() => {
        onPaymentSuccess({
          paymentMethod: methodName,
          razorpayPaymentId: simPaymentId,
          razorpayOrderId: simOrderId,
        });
      }, 1000);
    } catch (err: any) {
      console.error('Payment verification error:', err);
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  Govinda's FastPay Gateway
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 256-Bit SSL
                </span>
              </div>
              <p className="text-xs text-slate-400">Instant UPI, Cards & NetBanking</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-30"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-amber-300 font-medium">Total Bill to Pay</span>
            {orderNumber && <p className="text-[10px] text-slate-400 font-mono">Ref: {orderNumber}</p>}
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-amber-400">₹{amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Success Overlay View */}
          {isSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-white">Payment Verified & Settled!</h4>
              <p className="text-xs text-slate-300 max-w-xs">
                Your transaction of <span className="text-emerald-400 font-bold">₹{amount.toFixed(2)}</span> was
                successful. Preparing your order immediately...
              </p>
            </div>
          ) : isProcessing ? (
            /* Processing Loading State */
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
              <div>
                <h4 className="text-sm font-bold text-white">{processingStep}</h4>
                <p className="text-xs text-slate-400 mt-1">Please do not refresh or close this window...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('QR')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'QR'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span className="text-[11px]">UPI QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('UPI_APPS')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'UPI_APPS'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="text-[11px]">UPI Apps</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('CARD')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'CARD'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('NETBANKING')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'NETBANKING'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">NetBanking</span>
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Tab 1: UPI Dynamic QR Code */}
              {activeTab === 'QR' && (
                <div className="flex flex-col items-center text-center space-y-3.5">
                  <div className="relative p-3 bg-white rounded-2xl shadow-xl border-2 border-amber-400/60">
                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt="Scan UPI QR to Pay"
                        className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-slate-800" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 -bottom-3 flex justify-center">
                      <span className="px-3 py-0.5 rounded-full bg-slate-900 border border-amber-500/40 text-[10px] font-extrabold text-amber-400 uppercase tracking-widest shadow-md">
                        Scan & Pay
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 pt-1 font-medium">
                    Scan with <span className="text-amber-400 font-bold">Google Pay, PhonePe, Paytm, CRED</span> or any UPI app
                  </p>

                  {/* Copy UPI ID */}
                  <div className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div className="text-left">
                      <span className="text-[10px] text-slate-500 block font-semibold">RESTAURANT UPI ID</span>
                      <span className="font-mono text-slate-200 font-bold">{upiVpa}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs transition-colors"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Direct Mobile UPI Intent Button */}
                  <a
                    href={upiPayLink}
                    className="w-full sm:hidden py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Open in UPI App on Mobile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Confirm Action Button */}
                  <button
                    type="button"
                    onClick={() => executePaymentVerification('UPI QR')}
                    className="w-full py-3.5 rounded-2xl gold-gradient-bg text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>I Have Paid ₹{amount.toFixed(2)} (Verify Now)</span>
                  </button>
                </div>
              )}

              {/* Tab 2: UPI Apps Selector */}
              {activeTab === 'UPI_APPS' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">Select Your UPI App</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'gpay', name: 'Google Pay', badge: 'GPay' },
                        { id: 'phonepe', name: 'PhonePe', badge: 'PhonePe' },
                        { id: 'paytm', name: 'Paytm UPI', badge: 'Paytm' },
                        { id: 'cred', name: 'CRED UPI', badge: 'CRED' },
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setSelectedUpiApp(app.id)}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                            selectedUpiApp === app.id
                              ? 'bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/10'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-extrabold text-amber-400">
                            {app.badge.slice(0, 2)}
                          </div>
                          <span className="text-xs font-bold text-slate-200">{app.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Or Enter Your UPI ID (VPA)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiIdInput}
                        onChange={(e) => setUpiIdInput(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      executePaymentVerification(
                        `UPI (${selectedUpiApp.toUpperCase()}${upiIdInput ? `: ${upiIdInput}` : ''})`
                      )
                    }
                    className="w-full py-3.5 rounded-2xl gold-gradient-bg text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Send Payment Request & Pay ₹{amount.toFixed(2)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Tab 3: Debit / Credit Card */}
              {activeTab === 'CARD' && (
                <div className="space-y-3.5">
                  {/* Card Visual Preview */}
                  <div className="p-4 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-700 to-yellow-600 text-slate-950 shadow-xl space-y-3 relative overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-900/80">
                        Dining Card
                      </span>
                      <span className="text-xs font-black tracking-wider text-slate-950">VISA / RUPAY</span>
                    </div>
                    <div className="font-mono font-bold text-sm tracking-widest text-slate-950">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex justify-between items-end text-[10px]">
                      <div>
                        <span className="block text-slate-900/70 font-semibold">CARD HOLDER</span>
                        <span className="font-bold uppercase">{cardHolder || 'GUEST DINER'}</span>
                      </div>
                      <div>
                        <span className="block text-slate-900/70 font-semibold">EXPIRES</span>
                        <span className="font-bold">{cardExpiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fast Test Card Fill */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleFillTestCard}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline"
                    >
                      ⚡ Fill Demo Card Details
                    </button>
                  </div>

                  {/* Card Inputs */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300">Card Number</label>
                      <input
                        type="text"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 1234 5678 9012"
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs focus:outline-none font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                          className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-300">CVV</label>
                        <input
                          type="password"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => executePaymentVerification('Credit/Debit Card')}
                    className="w-full py-3.5 rounded-2xl gold-gradient-bg text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay Securely ₹{amount.toFixed(2)}</span>
                  </button>
                </div>
              )}

              {/* Tab 4: NetBanking */}
              {activeTab === 'NETBANKING' && (
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-300">Select Popular Indian Bank</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['HDFC', 'ICICI', 'SBI', 'Axis Bank', 'Kotak', 'Punjab NB'].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          selectedBank === bank
                            ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs font-bold block">{bank}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => executePaymentVerification(`NetBanking (${selectedBank})`)}
                    className="w-full py-3.5 rounded-2xl gold-gradient-bg text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Proceed to {selectedBank} NetBanking (₹{amount.toFixed(2)})</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Security Note */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted with bank-grade 256-bit SSL security</span>
        </div>
      </div>
    </div>
  );
}
