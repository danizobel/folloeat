'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Share2, PlusSquare, Sparkles, Smartphone } from 'lucide-react';

export default function InstallPwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // Check if dismissed previously in session or localStorage
    try {
      const dismissed = localStorage.getItem('folloeat_pwa_banner_dismissed');
      if (dismissed === 'true') {
        return;
      }
    } catch {}

    // Check if running as installed standalone PWA
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    setIsDismissed(false);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Android / Desktop Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsDismissed(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowIOSInstructions(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('folloeat_pwa_banner_dismissed', 'true');
    } catch {}
  };

  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <>
      <div className="relative mb-4 bg-gradient-to-r from-sky-950 via-slate-900 to-sky-900 text-white p-3 sm:p-4 rounded-2xl border border-sky-800/80 shadow-lg flex items-center justify-between gap-3 animate-in fade-in">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-follo-blue text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md">
            f.
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-white">Installa l&apos;App FolloEat</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 uppercase">
                Veloce & Off-line
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              Accesso rapido a ordini, comande e consegna sotto l&apos;ombrellone.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 bg-follo-red hover:bg-follo-red-dark text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Installa</span>
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Chiudi avviso installazione"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Installation Popover */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-follo-blue" />
                <h3 className="font-black text-sm text-slate-900">Come installare su iPhone/iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-7 h-7 rounded-xl bg-follo-blue/10 text-follo-blue flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <p>
                  Tocca l&apos;icona <strong>Condividi</strong> (<Share2 className="w-3.5 h-3.5 inline text-follo-blue" />) nella barra in basso di Safari.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-7 h-7 rounded-xl bg-follo-blue/10 text-follo-blue flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <p>
                  Scorri e seleziona <strong>&quot;Aggiungi alla schermata Home&quot;</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-follo-blue" />).
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full py-2.5 rounded-xl bg-follo-blue text-white font-bold text-xs shadow-md transition-colors"
            >
              Ho capito
            </button>
          </div>
        </div>
      )}
    </>
  );
}
