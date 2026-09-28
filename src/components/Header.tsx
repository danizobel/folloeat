'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import {
  MapPin,
  Bell,
  Sun,
  ShieldCheck,
  Store,
  Umbrella,
  X,
  ChevronDown,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { FOLLONICA_ZONES, FOLLONICA_BEACH_CLUBS, SponsoredNotification } from '@/lib/types';

interface HeaderProps {
  selectedZone: string;
  onSelectZone: (zone: string) => void;
  selectedLido?: string;
  onSelectLido?: (lido: string, umbrellaNumber: string) => void;
  notifications: SponsoredNotification[];
}

export default function Header({
  selectedZone,
  onSelectZone,
  selectedLido,
  onSelectLido,
  notifications
}: HeaderProps) {
  const [showBeachModal, setShowBeachModal] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [tempLido, setTempLido] = useState(selectedLido || 'Bagno Florida');
  const [umbrellaNum, setUmbrellaNum] = useState('');
  const [zoneDropdownOpen, setZoneDropdownOpen] = useState(false);

  const activeZoneObj = FOLLONICA_ZONES.find(z => z.id === selectedZone) || FOLLONICA_ZONES[0];

  const handleZoneChange = (zoneId: string) => {
    setZoneDropdownOpen(false);
    if (zoneId === 'Spiaggia') {
      setShowBeachModal(true);
    } else {
      onSelectZone(zoneId);
    }
  };

  const handleConfirmBeach = () => {
    if (onSelectLido) {
      onSelectLido(tempLido, umbrellaNum);
    }
    onSelectZone('Spiaggia');
    setShowBeachModal(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 z-40 px-4 md:px-8 flex items-center justify-between shadow-xs">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-baseline group hover:opacity-90 transition-opacity">
            <Logo className="text-2xl md:text-3xl" />
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-follo-blue bg-follo-blue-light/70 px-2 py-0.5 rounded-full border border-follo-blue/20">
            Follonica v4.1
          </span>
        </div>

        {/* Zone & Beach Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setZoneDropdownOpen(!zoneDropdownOpen)}
            className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/70 border border-slate-200 transition-colors text-xs md:text-sm font-semibold text-slate-800"
          >
            {activeZoneObj.id === 'Spiaggia' ? (
              <Umbrella className="w-4 h-4 text-follo-blue animate-bounce" />
            ) : (
              <MapPin className="w-4 h-4 text-follo-red" />
            )}
            <span className="max-w-[130px] md:max-w-[190px] truncate">
              {activeZoneObj.id === 'Spiaggia' && selectedLido
                ? `${selectedLido} ${umbrellaNum ? `(#${umbrellaNum})` : ''}`
                : activeZoneObj.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {zoneDropdownOpen && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Seleziona Zona o Spiaggia
              </div>
              {FOLLONICA_ZONES.map(z => (
                <button
                  key={z.id}
                  onClick={() => handleZoneChange(z.id)}
                  className={`w-full text-left px-3.5 py-2 text-xs md:text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    selectedZone === z.id ? 'text-follo-blue font-bold bg-follo-blue-light/30' : 'text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {z.isBeach ? '🏖️' : '📍'} {z.name}
                  </span>
                  {selectedZone === z.id && <CheckCircle2 className="w-4 h-4 text-follo-blue" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Actions: Notifications, Terminal link, Admin Link */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Notifications Button */}
          <button
            onClick={() => setShowNotifDrawer(true)}
            className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            title="Promozioni locali"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-follo-red ring-2 ring-white"></span>
            )}
          </button>

          {/* Quick links to Ristoratore Terminal & Admin */}
          <Link
            href="/merchant/pizzeria-da-michele"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-follo-blue hover:bg-slate-100 transition-colors border border-slate-200"
          >
            <Store className="w-3.5 h-3.5 text-follo-blue" />
            <span>Terminale Sunmi</span>
          </Link>

          <Link
            href="/admin"
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-follo-slate text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-follo-sand" />
            <span>Admin</span>
          </Link>
        </div>
      </header>

      {/* Sotto l'Ombrellone Beach Selector Modal */}
      {showBeachModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowBeachModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl shadow-inner">
                🏖️
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delivery Sotto l'Ombrellone</h3>
                <p className="text-xs text-slate-500">I ristoranti consegnano direttamente al tuo lettino</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Seleziona Stabilimento Balneare o Spiaggia
                </label>
                <select
                  value={tempLido}
                  onChange={(e) => setTempLido(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-follo-blue"
                >
                  {FOLLONICA_BEACH_CLUBS.map((club) => (
                    <option key={club.id} value={club.name}>
                      {club.name} ({club.zone} - {club.address})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Numero Ombrellone o Riferimento
                </label>
                <input
                  type="text"
                  placeholder="Es. Ombrellone 42, Fila 3 o Vicino Chiosco"
                  value={umbrellaNum}
                  onChange={(e) => setUmbrellaNum(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-follo-blue placeholder:text-slate-400"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-2.5">
                <Sun className="w-4 h-4 text-follo-blue shrink-0 mt-0.5" />
                <p className="text-xs text-blue-900 leading-relaxed">
                  Il rider o lo staff consegnerà il cibo caldo direttamente all'ingresso dello stabilimento o al tuo ombrellone.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBeachModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBeach}
                  className="flex-1 py-2.5 rounded-xl bg-follo-blue text-sm font-semibold text-white hover:bg-follo-blue-dark shadow-md"
                >
                  Conferma Spiaggia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Local Promotions Drawer */}
      {showNotifDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-follo-sand" />
                  <h3 className="font-bold text-slate-900">Promozioni & Novità Follonica</h3>
                </div>
                <button
                  onClick={() => setShowNotifDrawer(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">
                    Nessuna notifica promozionale al momento.
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-xs"
                    >
                      <div className="flex items-center justify-between text-[11px] text-amber-700 font-bold mb-1">
                        <span>{n.merchant_name}</span>
                        <span>{new Date(n.scheduled_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{n.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{n.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400">
                FolloEat rispetta la tua quiete: max 1 notifica al giorno garantita su tutto il territorio.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
