'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UtensilsCrossed,
  Lock,
  Mail,
  ShieldCheck,
  ChefHat,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Zap,
  Users,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@royalpalms.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await api.login({ email, password });
      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await api.login({ email: demoEmail, password: demoPass });
      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to login with demo account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gold-gradient-bg text-slate-950 shadow-xl shadow-amber-500/20 font-black mb-2">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Govinda's Restaurant & Dining
          </h1>
          <p className="text-xs text-amber-300/80 font-medium uppercase tracking-wider">
            Staff & Kitchen Management Portal
          </p>
        </div>

        {/* 1-Click Instant Demo Login Master Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border-2 border-amber-500/50 shadow-2xl shadow-amber-500/10 text-center space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-black uppercase tracking-wider">
            <Zap className="w-4 h-4 fill-amber-400" />
            <span>Instant Demo Access (No Typing Needed)</span>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleQuickDemoLogin('admin@govindas.com', 'admin123')}
            className="w-full py-3.5 rounded-2xl gold-gradient-bg text-slate-950 text-sm font-black shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Signing in...' : '1-Click Master Demo Login (Admin)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-400">
            <span>Or test specific role:</span>
            <button
              onClick={() => handleQuickDemoLogin('chef@govindas.com', 'chef123')}
              className="text-emerald-400 hover:text-emerald-300 font-bold underline"
            >
              Chef
            </button>
            <span>•</span>
            <button
              onClick={() => handleQuickDemoLogin('waiter@govindas.com', 'waiter123')}
              className="text-purple-400 hover:text-purple-300 font-bold underline"
            >
              Server
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white">Manual Sign In</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 font-medium">
              Email / Password
            </span>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Staff Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@royalpalms.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <span>Signing in...</span> : <span>Sign In</span>}
            </button>
          </form>
        </div>

        {/* Back to Customer Front */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1"
          >
            <span>← Back to Customer Dining Front</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
