'use client';

import React, { useState } from 'react';
import {
  X,
  Calendar,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Merchant, Reservation } from '@/lib/types';

interface FastSeatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchant: Merchant | null;
  onSuccess: (reservation: Reservation) => void;
}

const RADAR_SLOTS = [
  '21:30',
  '21:45',
  '22:00',
  '22:15',
  '22:30'
];

export default function FastSeatingModal({
  isOpen,
  onClose,
  merchant,
  onSuccess
}: FastSeatingModalProps) {
  const [partySize, setPartySize] = useState(2);
  const [selectedSlot, setSelectedSlot] = useState(RADAR_SLOTS[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !merchant) return null;

  const totalFee = Number((partySize * 0.50).toFixed(2));

  const handleBookTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Inserisci nome e numero di cellulare.');
      return;
    }

    setIsLoading(true);

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const reservationTime = `${todayStr}T${selectedSlot}:00Z`;

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: merchant.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          party_size: partySize,
          reservation_time: reservationTime
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Errore nella prenotazione tavolo');
      }

      onSuccess(data.reservation);
      onClose();
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold shadow-inner">
            <Sparkles className="w-6 h-6 text-follo-sand" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-follo-sand uppercase tracking-wider">
              Radar Tavoli • 2° Turno
            </span>
            <h3 className="text-lg font-black text-slate-900">{merchant.name}</h3>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleBookTable} className="space-y-4">
          {/* Party size */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Numero di Coperti
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 8].map(size => (
                <button
                  type="button"
                  key={size}
                  onClick={() => setPartySize(size)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    partySize === size
                      ? 'bg-follo-slate text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Orario 2° Turno (Post-21:30)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {RADAR_SLOTS.map(slot => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    selectedSlot === slot
                      ? 'bg-follo-blue text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{slot}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nome e Cognome *
            </label>
            <input
              type="text"
              required
              placeholder="Es. Roberto Neri"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-follo-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Cellulare (per conferma SMS) *
            </label>
            <input
              type="tel"
              required
              placeholder="Es. +39 333 9876543"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-follo-blue"
            />
          </div>

          {/* Pricing detail */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-amber-950 block">Servizio Fast Seating FolloEat</span>
              <span className="text-[11px] text-amber-800">€0,50 per ciascun coperto confermato (2° Turno)</span>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-amber-950">€{totalFee.toFixed(2)}</span>
            </div>
          </div>

          {/* Anti No-Show Policy Notice (Master Spec v4.1 Section 4) */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong>Politica Anti No-Show:</strong> Riceverai un promemoria WhatsApp/SMS 2 ore prima dell&apos;orario per confermare con 1 click o liberare il tavolo per altri clienti del litorale.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-follo-slate hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            {isLoading ? 'Conferma in corso...' : `Prenota Tavolo Subito (${partySize} persone)`}
          </button>
        </form>
      </div>
    </div>
  );
}
