'use client';

import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <Logo className="text-4xl justify-center inline-flex" />
        <div className="space-y-2">
          <div className="text-6xl font-black text-slate-900 tracking-tight">404</div>
          <h1 className="text-xl font-black text-slate-800">Pagina Non Trovata</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            La pagina o il ristorante cercato sul litorale di Follonica non è disponibile o è stato spostato.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-3 rounded-2xl bg-follo-blue hover:bg-follo-blue-dark text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Torna alla Home</span>
          </Link>
          <Link
            href="/admin"
            className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>SuperAdmin Console</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
