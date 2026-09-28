'use client';

export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ChefHat,
  Bike,
  Sparkles,
  ChevronLeft,
  Star,
  Umbrella,
  Receipt,
  AlertCircle
} from 'lucide-react';
import { Order, OrderItem } from '@/lib/types';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Review state
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      } else {
        setErrorMsg(data.error || 'Ordine non trovato');
      }
    } catch (err) {
      setErrorMsg('Impossibile recuperare lo stato dell\'ordine');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 4000); // 4s polling
    return () => clearInterval(interval);
  }, [orderId]);

  let items: OrderItem[] = [];
  if (order?.items_json) {
    try {
      items = JSON.parse(order.items_json);
    } catch {
      items = [];
    }
  }

  // Stepper calculations
  const steps = [
    { key: 'PENDING', label: 'Trasmesso', desc: 'Inviato al terminale Sunmi', icon: Clock },
    { key: 'ACCEPTED', label: 'In Preparazione', desc: 'Accettato in cucina', icon: ChefHat },
    { key: 'DELIVERING', label: 'In Consegna', desc: 'Rider in viaggio', icon: Bike },
    { key: 'COMPLETED', label: 'Consegnato', desc: 'Buon appetito!', icon: CheckCircle2 }
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'ACCEPTED': return 1;
      case 'DELIVERING': return 2;
      case 'COMPLETED': return 3;
      default: return 0;
    }
  };

  const currentStep = order ? getStepIndex(order.status) : 0;
  const isCancelled = order?.status === 'CANCELLED';

  const handleSendReview = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      {/* Top Header */}
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shadow-xs sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <Logo className="text-2xl" />
        </div>
        <span className="text-xs font-bold text-slate-500">
          Tracking Ordine Live
        </span>
      </header>

      <main className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        {isLoading ? (
          <div className="text-center py-20 text-slate-400">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-follo-blue" />
            <p className="text-xs font-bold">Caricamento stato dell'ordine...</p>
          </div>
        ) : errorMsg || !order ? (
          <div className="p-6 bg-white rounded-3xl border border-red-200 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Ordine non trovato</h3>
            <p className="text-xs text-slate-500">{errorMsg || 'Verifica il codice ordine.'}</p>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-follo-blue text-white rounded-xl text-xs font-bold"
            >
              Torna alla Home
            </Link>
          </div>
        ) : (
          <>
            {/* Status Card & Stepper */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-follo-blue uppercase tracking-wider block">
                    {order.merchant_name}
                  </span>
                  <h1 className="text-xl font-black text-slate-900 mt-0.5">
                    Ordine #{order.id}
                  </h1>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  isCancelled
                    ? 'bg-red-100 text-red-700'
                    : order.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-follo-blue-light text-follo-blue animate-pulse'
                }`}>
                  {isCancelled ? 'ANNULLATO' : order.status}
                </span>
              </div>

              {/* Stepper */}
              {!isCancelled ? (
                <div className="relative pt-2">
                  <div className="grid grid-cols-4 gap-2">
                    {steps.map((st, i) => {
                      const IconComp = st.icon;
                      const isActive = i <= currentStep;
                      const isCurrent = i === currentStep;

                      return (
                        <div key={st.key} className="flex flex-col items-center text-center">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                              isCurrent
                                ? 'bg-follo-blue text-white ring-4 ring-follo-blue-light shadow-md'
                                : isActive
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            <IconComp className="w-5 h-5" />
                          </div>
                          <span className={`text-[11px] font-bold mt-2 ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                            {st.label}
                          </span>
                          <span className="text-[9px] text-slate-400 hidden sm:block">
                            {st.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs">
                  Questo ordine è stato annullato dal locale. L'eventuale pre-autorizzazione Stripe è stata svincolata a costo zero.
                </div>
              )}

              {/* PIN di Consegna & Tracking */}
              {order.delivery_pin && (
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">
                      PIN Di Consegna Rider
                    </span>
                    <span className="text-xs text-amber-700">
                      Mostra o comunica questo PIN al rider per convalidare il ritiro
                    </span>
                  </div>
                  <div className="text-2xl font-black tracking-widest text-amber-900 bg-white px-3.5 py-1.5 rounded-xl border border-amber-300 shadow-xs">
                    {order.delivery_pin}
                  </div>
                </div>
              )}

              {/* Status specific notices */}
              {order.status === 'DELIVERING' && (
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Bike className="w-5 h-5 text-follo-blue animate-bounce" />
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        Rider in arrivo (stima 10-15 min)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Il fattorino ha preso in carico la comanda e si sta dirigendo al tuo indirizzo
                      </span>
                    </div>
                  </div>
                  <a
                    href={`tel:${order.customer_phone}`}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center gap-1.5 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-follo-blue" />
                    <span>Contatta</span>
                  </a>
                </div>
              )}

              {/* Destination Point */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs">
                {order.pickup_point ? (
                  <Umbrella className="w-5 h-5 text-follo-blue shrink-0 mt-0.5" />
                ) : (
                  <MapPin className="w-5 h-5 text-follo-red shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold text-slate-900 block">
                    {order.pickup_point ? 'Consegna Sotto l\'Ombrellone' : 'Indirizzo di Consegna'}
                  </span>
                  <span className="text-slate-600">
                    {order.pickup_point || order.delivery_address || 'Ritiro al locale'}
                  </span>
                  {order.notes && (
                    <div className="mt-1 text-slate-500 italic">
                      Note: &quot;{order.notes}&quot;
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items Summary Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-follo-blue" />
                <h3 className="font-bold text-sm text-slate-900">Riepilogo Pietanze</h3>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {items.map((it, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">
                        {it.quantity}x {it.name}
                      </div>
                      {it.allergens && it.allergens.length > 0 && (
                        <div className="text-[10px] text-amber-700 font-medium">
                          Allergeni: {it.allergens.join(', ')}
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-slate-800">
                      €{(it.price * it.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Totals */}
              <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotale Cibo</span>
                  <span>€{order.total_food_amount.toFixed(2)}</span>
                </div>
                {order.discount_amount && order.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon FOLLO5 (-5%)</span>
                    <span>-€{order.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-follo-blue font-medium">
                  <span>Contributo Digitale & Ristorazione Follonichese</span>
                  <span>€{order.platform_fee.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                  <span>Totale Pagato / Da Pagare</span>
                  <span>€{order.total_order_amount.toFixed(2)}</span>
                </div>
                <div className="text-[11px] text-slate-500 text-right">
                  Metodo: {order.payment_method === 'CARD' ? 'Carta di Credito (Stripe Auth&Capture)' : `Contanti alla consegna (Resto per €${order.cash_change_from || order.total_order_amount})`}
                </div>
              </div>

              {/* FolloPoints earned notification */}
              <div className="p-3 bg-linear-to-r from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Sparkles className="w-4 h-4 text-follo-sand" /> FolloPoints accumulati con questo ordine:
                </span>
                <span className="font-black text-amber-900 text-sm">
                  +{order.follo_points_earned || Math.floor(order.total_food_amount)} Punti
                </span>
              </div>
            </div>

            {/* Leave a Review section */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-follo-sand" />
                  <h3 className="font-bold text-sm text-slate-900">Valuta la tua esperienza</h3>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  +10 FolloPoints
                </span>
              </div>

              {reviewSubmitted ? (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Grazie per la tua recensione certificata FolloEat! +10 FolloPoints accreditati!</span>
                </div>
              ) : (
                <form onSubmit={handleSendReview} className="space-y-3">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(st => (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setRating(st)}
                        className={`p-1.5 rounded-lg text-lg transition-transform ${
                          st <= rating ? 'text-amber-500 scale-110' : 'text-slate-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {['Cibo caldissimo', 'Puntualità perfetta', 'Servizio al tavolo', 'Gusto maremmano', 'Rider cortese'].map(b => (
                      <span
                        key={b}
                        className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer border border-slate-200 transition-colors"
                      >
                        {b}
                      </span>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Racconta cosa ti è piaciuto della pizza o della consegna..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-follo-blue placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-follo-slate hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    Invia Recensione (+10 Punti)
                  </button>
                </form>
              )}
            </div>

          </>
        )}
      </main>
    </div>
  );
}
