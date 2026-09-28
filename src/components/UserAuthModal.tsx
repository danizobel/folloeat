'use client';

import React, { useState } from 'react';
import { X, Phone, User, MapPin, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react';
import { UserProfile, FOLLONICA_ZONES } from '@/lib/types';
import Logo from './Logo';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

const DEMO_PROFILES: UserProfile[] = [
  {
    id: 'user_marco_01',
    name: 'Marco Rossi',
    phone: '+39 347 8899123',
    email: 'marco.rossi@gmail.com',
    address: 'Via Roma 42',
    zone: 'Centro',
    points: 85,
    favorite_places: ['m_michele_01', 'm_poldo_02'],
    registered_at: '2026-06-15T10:00:00Z'
  },
  {
    id: 'user_elena_02',
    name: 'Elena Bianchi',
    phone: '+39 333 4567890',
    email: 'elena.b@outlook.it',
    address: 'Viale Italia 210 (Bagno Florida)',
    zone: 'Spiaggia',
    umbrella_ref: 'Ombrellone 24 - Fila 3',
    points: 40,
    favorite_places: ['m_florida_03'],
    registered_at: '2026-07-01T14:30:00Z'
  }
];

export default function UserAuthModal({
  isOpen,
  onClose,
  onLoginSuccess
}: UserAuthModalProps) {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [zone, setZone] = useState('Centro');
  const [umbrellaRef, setUmbrellaRef] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('5802');
  const [inputOtp, setInputOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickLogin = (demo: UserProfile) => {
    try {
      localStorage.setItem('folloeat_user_session', JSON.stringify(demo));
    } catch {}
    onLoginSuccess(demo);
    onClose();
  };

  const handleSubmitPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMsg('Inserisci un numero di cellulare valido');
      return;
    }
    setErrorMsg(null);
    setOtpStep(true);
    setInputOtp('5802'); // Prefill easy OTP for smooth testing
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputOtp.trim() !== '5802' && inputOtp.trim() !== '1234') {
      setErrorMsg('Codice OTP non valido. Inserisci 5802.');
      return;
    }

    const existingUserStr = typeof window !== 'undefined' ? localStorage.getItem('folloeat_user_session') : null;
    let user: UserProfile;

    if (existingUserStr) {
      try {
        const parsed = JSON.parse(existingUserStr);
        user = { ...parsed, phone: phone || parsed.phone };
      } catch {
        user = createNewProfile();
      }
    } else {
      user = createNewProfile();
    }

    try {
      localStorage.setItem('folloeat_user_session', JSON.stringify(user));
    } catch {}

    onLoginSuccess(user);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMsg('Nome e cellulare sono obbligatori per le consegne a Follonica');
      return;
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || 'Follonica (GR)',
      zone,
      umbrella_ref: umbrellaRef.trim() || undefined,
      points: 25, // Bonus benvenuto +25 punti
      favorite_places: [],
      registered_at: new Date().toISOString()
    };

    try {
      localStorage.setItem('folloeat_user_session', JSON.stringify(newUser));
    } catch {}

    onLoginSuccess(newUser);
    onClose();
  };

  function createNewProfile(): UserProfile {
    return {
      id: `usr_${Date.now()}`,
      name: name.trim() || 'Cliente Follonica',
      phone: phone.trim() || '+39 340 0000000',
      email: email.trim() || undefined,
      address: address.trim() || 'Follonica',
      zone: zone || 'Centro',
      points: 25,
      favorite_places: [],
      registered_at: new Date().toISOString()
    };
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Chiudi"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="mb-6 text-center">
          <Logo className="text-3xl inline-flex justify-center" />
          <h2 className="text-xl font-black text-slate-900 mt-2">
            {otpStep ? 'Verifica il tuo Numero' : mode === 'LOGIN' ? 'Accedi a FolloEat' : 'Crea il tuo Profilo'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ordini diretti, sconti FolloPoints e consegna sotto l'ombrellone
          </p>
        </div>

        {/* Tab Switcher (Accedi / Registrati) */}
        {!otpStep && (
          <div className="flex bg-slate-100 p-1 rounded-xl mb-5 text-xs font-semibold">
            <button
              onClick={() => { setMode('LOGIN'); setErrorMsg(null); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'LOGIN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Accedi con Cellulare
            </button>
            <button
              onClick={() => { setMode('REGISTER'); setErrorMsg(null); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'REGISTER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nuovo Utente
            </button>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* MODE: LOGIN (Step 1: Phone) */}
        {mode === 'LOGIN' && !otpStep && (
          <form onSubmit={handleSubmitPhone} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Numero di Cellulare
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="+39 347 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-follo-blue focus:bg-white"
                />
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                Ti invieremo un codice SMS per tracciare i tuoi ordini in tempo reale.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-follo-blue hover:bg-follo-blue-dark text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Continua</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Access (1-Tap for Instant Testing) */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                Oppure accedi con 1-Click con profilo di prova:
              </span>
              <div className="space-y-2">
                {DEMO_PROFILES.map(demo => (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleQuickLogin(demo)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200 hover:border-follo-blue transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-follo-blue">
                        {demo.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {demo.zone} · {demo.address} · ⭐ {demo.points} pt
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-follo-blue bg-sky-100 px-2 py-0.5 rounded-md">
                      Accedi
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* MODE: LOGIN (Step 2: OTP Verification) */}
        {otpStep && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs text-sky-900 flex items-start gap-2">
              <KeyRound className="w-4 h-4 text-follo-blue shrink-0 mt-0.5" />
              <div>
                Codice di sicurezza inviato al <strong>{phone}</strong>.
                <div className="font-semibold mt-0.5 text-follo-blue">Codice automatico di test: 5802</div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Codice OTP (4 Cifre)
              </label>
              <input
                type="text"
                maxLength={4}
                required
                autoFocus
                placeholder="5802"
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value)}
                className="w-full text-center tracking-widest text-xl font-bold py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-follo-blue focus:bg-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOtpStep(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Indietro
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-follo-blue hover:bg-follo-blue-dark text-white font-bold text-xs shadow-md transition-colors"
              >
                Verifica & Accedi
              </button>
            </div>
          </form>
        )}

        {/* MODE: REGISTER (New Customer) */}
        {mode === 'REGISTER' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nome e Cognome *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Es. Marco Rossi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-follo-blue focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Cellulare per Conferma Comande *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="+39 347 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-follo-blue focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Quartiere di Follonica
              </label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-follo-blue"
              >
                {FOLLONICA_ZONES.filter(z => z.id !== 'TUTTI').map(z => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Indirizzo di Consegna / Stabilimento
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Es. Via Roma 15 o Bagno Florida"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-follo-blue focus:bg-white"
                />
              </div>
            </div>

            {zone === 'Spiaggia' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Riferimento Ombrellone
                </label>
                <input
                  type="text"
                  placeholder="Es. Ombrellone 12 - 2a Fila"
                  value={umbrellaRef}
                  onChange={(e) => setUmbrellaRef(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-follo-blue"
                />
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Registrandoti ricevi subito <strong>+25 FolloPoints</strong> e il coupon <strong>FOLLO5</strong> (-5%).</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-follo-blue hover:bg-follo-blue-dark text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Crea Account & Salva</span>
            </button>
          </form>
        )}

        {/* Security badge */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>I tuoi dati sono protetti e usati solo per il recapito comande</span>
        </div>
      </div>
    </div>
  );
}
