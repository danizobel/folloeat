'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  User,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  ShoppingBag,
  Calendar,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Store,
  Building2,
  ExternalLink,
  Award
} from 'lucide-react';
import { UserProfile, Order, Reservation } from '@/lib/types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onLogout: () => void;
  onUpdateUser: (updated: UserProfile) => void;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  user,
  onLogout,
  onUpdateUser
}: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ORDERS' | 'RESERVATIONS'>('OVERVIEW');
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(user.address);
  const [tempZone, setTempZone] = useState(user.zone);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch user orders and reservations
    async function loadUserData() {
      try {
        const resOrders = await fetch('/api/orders');
        const dataOrders = await resOrders.json();
        if (dataOrders.success && dataOrders.orders) {
          // Filter by customer phone if matched or show recent
          const matched = dataOrders.orders.filter(
            (o: Order) => o.customer_phone === user.phone || o.customer_name?.toLowerCase() === user.name.toLowerCase()
          );
          setOrders(matched.length > 0 ? matched : dataOrders.orders.slice(0, 3));
        }

        const resRes = await fetch('/api/reservations');
        const dataRes = await resRes.json();
        if (dataRes.success && dataRes.reservations) {
          setReservations(dataRes.reservations.slice(0, 3));
        }
      } catch (err) {
        console.error('Error loading user history:', err);
      }
    }

    loadUserData();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSaveAddress = () => {
    const updated: UserProfile = {
      ...user,
      address: tempAddress,
      zone: tempZone
    };
    try {
      localStorage.setItem('folloeat_user_session', JSON.stringify(updated));
    } catch {}
    onUpdateUser(updated);
    setIsEditingAddress(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-follo-blue flex items-center justify-center font-black text-xl shadow-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 leading-tight">
                  {user.name}
                </h2>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  ⭐ {user.points} FolloPoints
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {user.phone} · Follonica ({user.zone})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-100 p-1 rounded-xl my-4 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'OVERVIEW' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Il Mio Account
          </button>
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'ORDERS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ordini ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('RESERVATIONS')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'RESERVATIONS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tavoli ({reservations.length})
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="overflow-y-auto space-y-4 flex-1 pr-1">
          {activeTab === 'OVERVIEW' && (
            <>
              {/* FolloPoints Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100 block">
                    Programma Fedeltà Iperlocale
                  </span>
                  <div className="text-2xl font-black mt-0.5">
                    {user.points} Punti
                  </div>
                  <p className="text-[11px] text-amber-100 mt-1">
                    Accumula 1 punto per ogni € speso nei ristoranti di Follonica.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl">
                  🎁
                </div>
              </div>

              {/* Delivery Address Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-follo-red" />
                    Indirizzo di Consegna Predefinito
                  </span>
                  {!isEditingAddress ? (
                    <button
                      onClick={() => setIsEditingAddress(true)}
                      className="text-xs text-follo-blue font-bold hover:underline"
                    >
                      Modifica
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveAddress}
                      className="text-xs text-emerald-600 font-bold hover:underline"
                    >
                      Salva
                    </button>
                  )}
                </div>

                {!isEditingAddress ? (
                  <div className="text-xs text-slate-600">
                    <p className="font-semibold text-slate-900">{user.address || 'Nessun indirizzo specificato'}</p>
                    <p className="text-slate-500 mt-0.5">Zona: {user.zone} {user.umbrella_ref ? `· ${user.umbrella_ref}` : ''}</p>
                  </div>
                ) : (
                  <div className="space-y-2 mt-2">
                    <input
                      type="text"
                      value={tempAddress}
                      onChange={(e) => setTempAddress(e.target.value)}
                      placeholder="Indirizzo (es. Via Roma 15)"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                    <input
                      type="text"
                      value={tempZone}
                      onChange={(e) => setTempZone(e.target.value)}
                      placeholder="Zona / Stabilimento"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Quick links to Developer & Merchant consoles */}
              <div className="p-3 bg-slate-100/80 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Accessi Gestionali Piattaforma:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/merchant/pizzeria-da-michele"
                    onClick={onClose}
                    className="p-2.5 rounded-xl bg-white hover:bg-sky-50 text-slate-800 border border-slate-200 hover:border-follo-blue text-xs font-semibold flex items-center gap-2 transition-colors"
                  >
                    <Store className="w-4 h-4 text-follo-blue shrink-0" />
                    <span className="truncate">Terminale Sunmi</span>
                  </Link>
                  <Link
                    href="/admin"
                    onClick={onClose}
                    className="p-2.5 rounded-xl bg-follo-slate hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
                  >
                    <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">Console Admin</span>
                  </Link>
                </div>
              </div>
            </>
          )}

          {activeTab === 'ORDERS' && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Nessun ordine effettuato finora.
                </div>
              ) : (
                orders.map((ord) => (
                  <Link
                    key={ord.id}
                    href={`/order/${ord.id}`}
                    onClick={onClose}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50/60 border border-slate-200 hover:border-follo-blue block transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-follo-blue">
                        #{ord.id} · {ord.merchant_name}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        ord.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : ord.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-sky-100 text-follo-blue'
                      }`}>
                        {ord.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
                      <span>Totale: €{ord.total_order_amount?.toFixed(2)}</span>
                      <span className="flex items-center gap-1 text-follo-blue font-semibold">
                        Traccia Ordine Live <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {activeTab === 'RESERVATIONS' && (
            <div className="space-y-3">
              {reservations.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Nessuna prenotazione attiva.
                </div>
              ) : (
                reservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">
                        {res.merchant_name}
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                        {res.confirmation_status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Tavolo per {res.party_size} persone · Fast Seating 2° Turno
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer with Logout */}
        <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Disconnetti Account</span>
          </button>

          <span className="text-[11px] text-slate-400">
            FolloEat Follonica v4.1
          </span>
        </div>
      </div>
    </div>
  );
}
