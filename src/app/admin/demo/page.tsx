'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { Sparkles, UtensilsCrossed } from 'lucide-react';

export default function AutoDemoLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const res = await api.login({
          email: 'admin@govindas.com',
          password: 'admin123',
        });

        if (res.success && res.token && res.user) {
          login(res.token, res.user);
          router.push('/admin/dashboard');
        } else {
          router.push('/admin/login');
        }
      } catch (err) {
        console.error('Auto demo login failed:', err);
        router.push('/admin/login');
      }
    };

    autoLogin();
  }, [login, router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl gold-gradient-bg text-slate-950 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/30 animate-bounce">
          <UtensilsCrossed className="w-8 h-8" />
        </div>
        <div className="flex items-center justify-center gap-2 text-amber-400 font-extrabold text-sm">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>Authenticating Master Demo Session...</span>
        </div>
        <p className="text-xs text-slate-400">Redirecting to Operations Dashboard in a moment.</p>
      </div>
    </div>
  );
}
