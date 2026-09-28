'use client';

export const runtime = 'edge';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import {
  Bell,
  BellOff,
  Printer,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Flame,
  Volume2,
  VolumeX,
  Phone,
  MapPin,
  RefreshCw,
  Sliders,
  ShieldAlert,
  ChevronLeft,
  X,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import { Order, Merchant, OrderItem, OrderStatus } from '@/lib/types';
import { generateSunmi58mmThermalReceipt } from '@/lib/thermal-printer';
import { orderAlarm } from '@/lib/audio-alarm';

export default function MerchantTerminalPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  // Merchant & Orders state
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [antiIngorgo, setAntiIngorgo] = useState<{
    current_orders_in_slot: number;
    max_orders_per_slot: number;
    is_slot_blocked: boolean;
  }>({
    current_orders_in_slot: 0,
    max_orders_per_slot: 10,
    is_slot_blocked: false
  });
  const [isLoading, setIsLoading] = useState(true);

  // Audio alarm state
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);

  // Thermal Print Modal
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);
  const [printReceiptText, setPrintReceiptText] = useState<string>('');
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  // Panic button controls
  const [isUpdatingPanic, setIsUpdatingPanic] = useState(false);

  const fetchMerchantData = async () => {
    try {
      const res = await fetch(`/api/merchant/${slug}`);
      const data = await res.json();
      if (data.success) {
        setMerchant(data.merchant);
        setOrders(data.orders || []);
        if (data.anti_ingorgo) {
          setAntiIngorgo(data.anti_ingorgo);
        }

        // Check if there are pending orders requiring audio alarm
        const pendingCount = (data.orders || []).filter((o: Order) => o.status === 'PENDING').length;
        if (pendingCount > 0 && isAudioEnabled) {
          orderAlarm?.start();
          setIsAlarmActive(true);
        } else if (pendingCount === 0) {
          orderAlarm?.stop();
          setIsAlarmActive(false);
        }
      }
    } catch (err) {
      console.error('Error fetching merchant data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchantData();
    const interval = setInterval(fetchMerchantData, 5000); // 5s live polling
    return () => {
      clearInterval(interval);
      orderAlarm?.stop();
    };
  }, [slug, isAudioEnabled]);

  // Unlock Web Audio context with merchant gesture
  const enableAudio = () => {
    setIsAudioEnabled(true);
    // Trigger short chime to unlock context
    orderAlarm?.start();
    setTimeout(() => {
      const pendingCount = orders.filter(o => o.status === 'PENDING').length;
      if (pendingCount === 0) {
        orderAlarm?.stop();
        setIsAlarmActive(false);
      }
    }, 400);
  };

  // Order Actions: Accept, Reject, Delivering, Completed
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        // Stop sound immediately
        orderAlarm?.stop();
        setIsAlarmActive(false);

        // Refresh list
        await fetchMerchantData();

        // If accepted, immediately prompt thermal print
        if (newStatus === 'ACCEPTED' && data.order) {
          handleOpenThermalPrint(data.order);
        }
      }
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  // Panic button handlers (Snooze & Kitchen Delay)
  const handlePanicAction = async (action: 'SNOOZE' | 'CANCEL_SNOOZE' | 'SET_DELAY' | 'RESET_DELAY', durationMinutes = 30) => {
    setIsUpdatingPanic(true);
    try {
      const res = await fetch(`/api/merchant/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          duration_minutes: durationMinutes,
          delay_minutes: durationMinutes
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchMerchantData();
      }
    } catch (err) {
      console.error('Error updating panic status:', err);
    } finally {
      setIsUpdatingPanic(false);
    }
  };

  // Open thermal print modal
  const handleOpenThermalPrint = (order: Order) => {
    setSelectedOrderForPrint(order);
    const receipt = generateSunmi58mmThermalReceipt(order);
    setPrintReceiptText(receipt);
  };

  const handleCopyReceipt = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(printReceiptText);
      setCopiedReceipt(true);
      setTimeout(() => setCopiedReceipt(false), 2500);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const acceptedOrders = orders.filter(o => o.status === 'ACCEPTED' || o.status === 'DELIVERING');
  const pastOrders = orders.filter(o => o.status === 'COMPLETED' || o.status === 'CANCELLED');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Top Header / Bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <Logo className="text-2xl hidden sm:inline-flex" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-follo-blue text-white px-2 py-0.5 rounded-md">
                Terminale Sunmi V2s
              </span>
              <span className="text-xs text-slate-400">Firmware 58mm Termica</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white mt-1">
              {merchant?.name || 'Caricamento Terminale...'}
            </h1>
          </div>
        </div>

        {/* Audio Toggle & Merchant Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {!isAudioEnabled ? (
            <button
              onClick={enableAudio}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg animate-pulse"
            >
              <Volume2 className="w-4 h-4" />
              <span>Attiva Suoneria Comande</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-semibold">
              <Volume2 className="w-4 h-4" />
              <span>Audio Attivo</span>
              {isAlarmActive && (
                <span className="w-2 h-2 rounded-full bg-follo-red animate-ping ml-1"></span>
              )}
            </div>
          )}

          {/* Quick switch between partner restaurants */}
          <select
            value={slug}
            onChange={(e) => router.push(`/merchant/${e.target.value}`)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none focus:ring-2 focus:ring-follo-blue"
          >
            <option value="pizzeria-da-michele">Pizzeria Da Michele & Figli</option>
            <option value="da-poldo">Da Poldo Food & Love</option>
            <option value="bagno-florida">Bagno Florida Ristorante</option>
          </select>

          <button
            onClick={fetchMerchantData}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
            title="Aggiorna ora"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Control Panel (Panic & Anti-Ingorgo) + Orders Streams */}
      <div className="max-w-7xl mx-auto mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Panic Button & Anti-Ingorgo Monitor */}
        <div className="lg:col-span-1 space-y-6">
          {/* Tasto Panico / "Siamo Pieni" */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-follo-red font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-follo-red" />
              <span>Pannello Emergenza Cucina</span>
            </div>

            <div>
              <h3 className="font-black text-white text-base">Tasto Panico "Siamo Pieni"</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Propaga all'istante su Cloudflare KV il blocco ordini o il ritardo di preparazione.
              </p>
            </div>

            {/* Snooze Switch */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">Snooze Totale Ordini:</span>
                {merchant?.snooze_until ? (
                  <span className="text-[11px] font-bold text-follo-red bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                    ATTIVO fino alle {new Date(merchant.snooze_until).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    RICEZIONE APERTA
                  </span>
                )}
              </div>

              {merchant?.snooze_until ? (
                <button
                  disabled={isUpdatingPanic}
                  onClick={() => handlePanicAction('CANCEL_SNOOZE')}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                >
                  Riapri Ricezione Ordini Ora
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    disabled={isUpdatingPanic}
                    onClick={() => handlePanicAction('SNOOZE', 30)}
                    className="flex-1 py-2 rounded-xl bg-follo-red hover:bg-red-700 text-white font-bold text-xs transition-colors"
                  >
                    Pausa 30 min
                  </button>
                  <button
                    disabled={isUpdatingPanic}
                    onClick={() => handlePanicAction('SNOOZE', 60)}
                    className="flex-1 py-2 rounded-xl bg-follo-red-dark hover:bg-red-800 text-white font-bold text-xs transition-colors"
                  >
                    Pausa 60 min
                  </button>
                </div>
              )}
            </div>

            {/* Kitchen Delay Modifier */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">Ritardo Cucina Aggiuntivo:</span>
                <span className="text-xs font-black text-amber-400">
                  +{merchant?.prep_delay_minutes || 0} min
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  disabled={isUpdatingPanic}
                  onClick={() => handlePanicAction('RESET_DELAY')}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    merchant?.prep_delay_minutes === 0
                      ? 'bg-follo-blue text-white border-follo-blue'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  +0 min
                </button>
                <button
                  disabled={isUpdatingPanic}
                  onClick={() => handlePanicAction('SET_DELAY', 20)}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    merchant?.prep_delay_minutes === 20
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  +20 min
                </button>
                <button
                  disabled={isUpdatingPanic}
                  onClick={() => handlePanicAction('SET_DELAY', 30)}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    merchant?.prep_delay_minutes === 30
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  +30 min
                </button>
              </div>
            </div>
          </div>

          {/* Anti-Ingorgo Forno Slot Threshold Monitor */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-follo-sand font-bold text-xs uppercase tracking-wider">
              <Flame className="w-4 h-4 text-follo-sand" />
              <span>Anti-Ingorgo Forno</span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">Carico slot 15 min:</span>
              <span className="text-base font-black text-white">
                {antiIngorgo.current_orders_in_slot} / {antiIngorgo.max_orders_per_slot} ordini
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  antiIngorgo.is_slot_blocked
                    ? 'bg-follo-red'
                    : antiIngorgo.current_orders_in_slot >= antiIngorgo.max_orders_per_slot * 0.7
                    ? 'bg-amber-500'
                    : 'bg-follo-blue'
                }`}
                style={{
                  width: `${Math.min(100, (antiIngorgo.current_orders_in_slot / antiIngorgo.max_orders_per_slot) * 100)}%`
                }}
              />
            </div>

            {antiIngorgo.is_slot_blocked ? (
              <div className="p-2.5 bg-red-950/70 border border-red-800 rounded-xl text-[11px] text-red-300 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-follo-red" />
                <span>Slot orario bloccato automaticamente per salvaguardia della cottura.</span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">
                Capienza regolare. Gli ordini vengono distribuiti automaticamente a scaglioni.
              </p>
            )}
          </div>
        </div>

        {/* Right 3 Columns: Real-Time Order Stream */}
        <div className="lg:col-span-3 space-y-6">
          {/* Section 1: PENDING ORDERS (Allarme sonoro attivo) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-follo-red animate-ping"></span>
                <h2 className="text-lg font-black text-white">
                  Nuove Comande in Arrivo ({pendingOrders.length})
                </h2>
              </div>
              {pendingOrders.length > 0 && isAlarmActive && (
                <span className="text-xs font-bold text-follo-red animate-pulse flex items-center gap-1">
                  <Volume2 className="w-4 h-4" /> ALLARME SONORO ATTIVO
                </span>
              )}
            </div>

            {pendingOrders.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 text-center text-slate-500">
                <CheckCircle className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-sm font-semibold">Nessuna nuova comanda in attesa.</p>
                <p className="text-xs text-slate-600 mt-1">Il terminale emetterà un allarme sonoro immediato all'arrivo di nuovi ordini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingOrders.map(order => {
                  let items: OrderItem[] = [];
                  try {
                    items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : [];
                  } catch {
                    items = [];
                  }

                  const hasAlcohol = items.some(i => i.is_alcohol);

                  return (
                    <div
                      key={order.id}
                      className="p-5 rounded-3xl bg-slate-900 border-2 border-follo-red shadow-xl space-y-4 relative overflow-hidden animate-pulse-subtle"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black text-follo-red">{order.id}</span>
                          <h3 className="text-base font-black text-white">{order.customer_name}</h3>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-red-950 text-follo-red border border-follo-red/40 text-[11px] font-black uppercase">
                          IN ATTESA
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div className="space-y-1 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{order.customer_phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold text-white">
                          <MapPin className="w-3.5 h-3.5 text-follo-red" />
                          <span>{order.pickup_point ? `Spiaggia: ${order.pickup_point}` : order.delivery_address}</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                        {items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-white">{it.quantity}x {it.name}</span>
                              {it.allergens && it.allergens.length > 0 && (
                                <div className="text-[10px] text-amber-400">
                                  Allergeni: {it.allergens.join(', ')}
                                </div>
                              )}
                            </div>
                            <span className="text-slate-400">€{(it.price * it.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* 18+ Warning Banner */}
                      {hasAlcohol && (
                        <div className="p-2.5 rounded-xl bg-red-950 border border-follo-red text-follo-red text-xs font-bold flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 shrink-0" />
                          <span>ATTENZIONE: VERIFICARE DOCUMENTO IDENTITÀ 18+</span>
                        </div>
                      )}

                      {/* Payment details */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                        <div>
                          {order.payment_method === 'CARD' ? (
                            <span className="text-emerald-400 font-bold">CARTA (Auth Stripe)</span>
                          ) : (
                            <span className="text-amber-400 font-bold">
                              CONTANTI (Resto per €{order.cash_change_from || order.total_order_amount})
                            </span>
                          )}
                        </div>
                        <div className="text-base font-black text-white">
                          €{order.total_order_amount.toFixed(2)}
                        </div>
                      </div>

                      {/* Action Buttons: Accetta (Arresta Allarme) o Rifiuta */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'ACCEPTED')}
                          className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Accetta Ordine (Stampa)</span>
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}
                          className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-red-900 text-slate-300 hover:text-white font-bold text-xs transition-colors flex items-center justify-center"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: ACCEPTED / IN PREPARATION ORDERS */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-black text-white">
              Comande Accettate & In Consegna ({acceptedOrders.length})
            </h2>

            {acceptedOrders.length === 0 ? (
              <p className="text-xs text-slate-500">Nessuna comanda attualmente in preparazione.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {acceptedOrders.map(order => (
                  <div
                    key={order.id}
                    className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">{order.id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                        {order.status}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <h4 className="font-bold text-white text-base">{order.customer_name}</h4>
                      <span className="font-black text-white">€{order.total_order_amount.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <p className="text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-follo-red" />
                        {order.pickup_point || order.delivery_address}
                      </p>
                      {order.delivery_pin && (
                        <span className="text-[11px] font-black text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                          PIN: {order.delivery_pin}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleOpenThermalPrint(order)}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5 text-follo-blue" />
                        <span>Scontrino 58mm</span>
                      </button>
                      {order.status === 'ACCEPTED' ? (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERING')}
                          className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors"
                        >
                          Affida al Rider
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                        >
                          Consegna Conclusa
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* 58mm Thermal Printer Preview Modal (Sunmi V2s) */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setSelectedOrderForPrint(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-follo-blue/20 text-follo-blue flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Scontrino Stampante Termica 58mm</h3>
                <p className="text-xs text-slate-400">Formattato ESC/POS a 32 colonne per Sunmi V2s</p>
              </div>
            </div>

            {/* Simulated 58mm Thermal Paper Roll */}
            <div className="p-4 bg-amber-50 text-slate-900 rounded-2xl shadow-inner font-mono text-[11px] leading-tight overflow-x-auto whitespace-pre selection:bg-amber-200 max-h-[360px] overflow-y-auto border border-amber-200">
              {printReceiptText}
            </div>

            {/* Actions: Direct Print or Copy text */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCopyReceipt}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedReceipt ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copiato negli Appunti!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copia Testo ESC/POS</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBrowserPrint}
                className="flex-1 py-2.5 rounded-xl bg-follo-blue hover:bg-follo-blue-dark text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Stampa Termica</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
