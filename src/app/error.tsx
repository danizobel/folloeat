'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home } from 'lucide-react';
import Logo from '@/components/Logo';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled runtime error in FolloEat:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <Logo className="text-4xl justify-center inline-flex" />
        <div className="space-y-2">
          <h1 className="text-xl font-black text-slate-900">Si è verificato un errore</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Abbiamo riscontrato un problema nel caricamento dei dati di Follonica. Puoi provare a ricaricare.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-5 py-3 rounded-2xl bg-follo-blue hover:bg-follo-blue-dark text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Riprova</span>
          </button>
          <Link
            href="/"
            className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
