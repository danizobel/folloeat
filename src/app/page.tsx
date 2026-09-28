'use client';

export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import InteractiveMap from '@/components/InteractiveMap';
import MenuDrawer from '@/components/MenuDrawer';
import CartCheckoutModal from '@/components/CartCheckoutModal';
import FastSeatingModal from '@/components/FastSeatingModal';
import BottomDockNav, { NavTab } from '@/components/BottomDockNav';
import Footer from '@/components/Footer';
import Logo from '@/components/Logo';
import {
  Merchant,
  MenuItem,
  OrderItem,
  Order,
  Reservation,
  SponsoredNotification,
  FOLLONICA_ZONES
} from '@/lib/types';
import {
  Search,
  Map,
  List,
  Sparkles,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Send,
  Building2,
  HelpCircle,
  ExternalLink,
  Store,
  DollarSign,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  // State
  const [selectedZone, setSelectedZone] = useState<string>('TUTTI');
  const [selectedLido, setSelectedLido] = useState<string>('Bagno Florida');
  const [umbrellaRef, setUmbrellaRef] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Data
  const [places, setPlaces] = useState<Merchant[]>([]);
  const [notifications, setNotifications] = useState<SponsoredNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected Place & Menu Drawer
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [merchantMenu, setMerchantMenu] = useState<MenuItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Cart & Checkout
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);

  // Fast Seating Modal
  const [fastSeatingMerchant, setFastSeatingMerchant] = useState<Merchant | null>(null);
  const [isFastSeatingOpen, setIsFastSeatingOpen] = useState(false);
  const [lastReservation, setLastReservation] = useState<Reservation | null>(null);

  // Lead Generation Feedback Toast for Non-Partner Places
  const [signalSuccessMessage, setSignalSuccessMessage] = useState<string | null>(null);

  // Fetch places from /api/places/follonica
  const fetchPlaces = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedZone) params.set('zone', selectedZone);
      if (searchQuery) params.set('query', searchQuery);

      const res = await fetch(`/api/places/follonica?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPlaces(data.places || []);
      }
    } catch (e) {
      console.error('Error fetching places:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      // Ignored
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [selectedZone]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Handle Search Input submit / debounce
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlaces();
  };

  // Open Menu Drawer for a Merchant
  const handleOpenMenu = async (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    try {
      const res = await fetch(`/api/merchant/${merchant.slug}`);
      const data = await res.json();
      if (data.success) {
        setMerchantMenu(data.menu || []);
        setIsMenuOpen(true);
      }
    } catch {
      setIsMenuOpen(true);
    }
  };

  // Signal non-partner place to FolloEat
  const handleSignalPlace = (place: Merchant) => {
    setSignalSuccessMessage(
      `Grazie! Abbiamo registrato la segnalazione per "${place.name}". Il nostro team commerciale di Follonica contatterà l'esercente.`
    );
    setTimeout(() => {
      setSignalSuccessMessage(null);
    }, 5000);
  };

  // Cart operations
  const handleAddToCart = (dishItem: OrderItem) => {
    setCartItems(prev => {
      const idx = prev.findIndex(item => item.id === dishItem.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += dishItem.quantity;
        return copy;
      }
      return [...prev, dishItem];
    });
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems(prev => {
      return prev
        .map(item => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[];
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Fast Seating
  const handleOpenReservation = (merchant: Merchant) => {
    setFastSeatingMerchant(merchant);
    setIsFastSeatingOpen(true);
  };

  return (
    <div className="min-h-screen pb-24 pt-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Fixed Header */}
      <Header
        selectedZone={selectedZone}
        onSelectZone={setSelectedZone}
        selectedLido={selectedLido}
        onSelectLido={(lido, umbrella) => {
          setSelectedLido(lido);
          setUmbrellaRef(umbrella);
        }}
        notifications={notifications}
      />

      {/* Signal Success Feedback Alert */}
      {signalSuccessMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
          <p className="text-xs font-semibold leading-relaxed">{signalSuccessMessage}</p>
        </div>
      )}

      {/* Tab Content 1: PROFILE / B2B SAAS MODEL DETAILS */}
      {activeTab === 'profile' ? (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <Logo className="text-3xl" />
              <div className="border-l border-slate-300 pl-3">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                  Modello SaaS & Specifiche Iperlocali v4.1
                </h2>
                <p className="text-xs md:text-sm text-slate-500">
                  Condizioni economiche ufficiali, manleva contrattuale e architettura di Follonica (GR)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-follo-blue block mb-1">SETUP UNA TANTUM</span>
                <p className="text-slate-700 font-semibold text-base mb-1">€199,00</p>
                <p className="text-slate-500">Onboarding merchant, digitalizzazione menu, inserimento 14 allergeni UE e kit vetrofanie territoriali.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-follo-blue block mb-1">CANONE MENSILE SAAS</span>
                <p className="text-slate-700 font-semibold text-base mb-1">€29,00 / mese</p>
                <p className="text-slate-500">Unificato per entrambi i piani PRO e SMART. Accesso alla piattaforma, Cloudflare Edge & D1 Database.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-follo-blue block mb-1">DEPOSITO CAUZIONALE HARDWARE</span>
                <p className="text-slate-700 font-semibold text-base mb-1">€150,00 (Sunmi V2s)</p>
                <p className="text-slate-500">Deposito cauzionale infruttifero vincolato. Rimborsabile al 100% alla cessazione o riscattabile a saldo per riscatto proprietario.</p>
                <div className="mt-2 p-2 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 font-medium">
                  <strong>Opzione dilazione 3 quote da €50:</strong>
                  <br />• Mese 1: €249,00 (€199 setup + €50 cauzione)
                  <br />• Mese 2: €79,00 (€29 SaaS + €50 cauzione)
                  <br />• Mese 3: €79,00 (€29 SaaS + €50 cauzione)
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-follo-blue block mb-1">STARTER KIT CONSUMABILI</span>
                <p className="text-slate-700 font-semibold text-base mb-1">3 Rotoli Termici 58mm</p>
                <p className="text-slate-500">Inclusi alla consegna del Sunmi V2s (1 inserito nel terminale + 2 di scorta). Il riassortimento successivo è a cura e spese del ristoratore.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-follo-blue block mb-1">COMMISSIONE CIBO ETICA</span>
                <p className="text-slate-700 font-semibold text-base mb-1">8% sul venduto netto</p>
                <p className="text-slate-500">Contro il 25-35% dei colossi del delivery. Nessun intermediario sui pagamenti: incassi diretti su conto merchant.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-follo-blue block mb-1">DIGITAL PLATFORM FEE</span>
                <p className="text-slate-700 font-semibold text-base mb-1">€0,15 a carico cliente</p>
                <p className="text-slate-500">"Contributo Digitale & Ristorazione Follonichese" addebitato trasparente al checkout. Costo per il locale: €0,00.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 md:col-span-2">
                <span className="font-bold text-follo-blue block mb-1">RADAR TAVOLI / FAST SEATING</span>
                <p className="text-slate-700 font-semibold text-base mb-1">€0,50 a coperto confermato</p>
                <p className="text-slate-500">Sblocco 2° turno serale post-21:30 per riempire tavoli last-minute a rotazione rapida.</p>
              </div>
            </div>

            {/* Legal Waiver Disclaimers */}
            <div className="mt-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <ShieldAlert className="w-4 h-4 text-follo-sand" />
                Manleva Legale & Qualifica SaaS
              </div>
              <p className="leading-relaxed">
                FolloEat opera esclusivamente quale fornitore tecnologico SaaS e declina ogni responsabilità (manleva totale al 100%) per logistica dell'esercente, contratti e sicurezza rider, infortuni INAIL, codice della strada e igiene alimentare HACCP (catena del caldo/freddo).
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/merchant/pizzeria-da-michele"
                className="px-4 py-2.5 bg-follo-blue hover:bg-follo-blue-dark text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
              >
                <Store className="w-4 h-4" />
                Apri Dashboard Terminale Sunmi (Merchant)
              </Link>
              <Link
                href="/admin"
                className="px-4 py-2.5 bg-follo-slate hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-follo-sand" />
                Apri Master Console Superadmin (Fatturazione B2B)
              </Link>
            </div>
          </div>
        </div>
      ) : activeTab === 'tables' ? (
        /* Tab Content 2: RADAR TAVOLI DEDICATED VIEW */
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-6 text-white shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-100 mb-1">
              <Sparkles className="w-4 h-4" /> Radar Tavoli Follonica
            </div>
            <h2 className="text-2xl font-black">Coperti Last-Minute • 2° Turno (Post-21:30)</h2>
            <p className="text-xs text-amber-100 mt-1 max-w-xl">
              Prenota all'istante i tavoli liberati nei migliori ristoranti del litorale con prenotazione confermata a soli €0,50 a persona.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {places.filter(p => p.is_partner === 1).map(p => (
              <div
                key={p.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-follo-sand transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Sbloccato 2° Turno
                  </span>
                  <span className="text-xs font-bold text-slate-500">Post-21:30</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-follo-red" />
                  {p.address}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Fee: €0,50 / coperto</span>
                  <button
                    onClick={() => handleOpenReservation(p)}
                    className="px-3.5 py-1.5 bg-follo-slate hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Prenota Tavolo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Tab Content 3: HOME / DISCOVERY / MAPPA */
        <div className="space-y-6">
          {/* Hero Banner with delivery guarantee and beach order */}
          <div className="relative overflow-hidden bg-gradient-to-r from-sky-600 via-sky-700 to-follo-blue rounded-3xl p-6 md:p-8 text-white shadow-lg">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5 text-follo-sand" /> Piattaforma Etica Iperlocale
              </span>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
                Il vero cibo di Follonica, a casa tua o sotto l'ombrellone.
              </h1>
              <p className="text-xs md:text-sm text-sky-100 mt-2 leading-relaxed">
                Tuteliamo i margini dei ristoratori follonichesi con commissioni all'8% e incassi diretti. Consegna garantita in tutto il golfo.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="mt-5 flex gap-2 max-w-lg">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cerca pizza, burger di Chianina, pesce fresco..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white text-slate-900 text-xs md:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white shadow-md"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-follo-red hover:bg-follo-red-dark text-white font-bold text-xs md:text-sm shadow-md transition-colors"
                >
                  Cerca
                </button>
              </form>
            </div>

            {/* Background decorative circles */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
          </div>

          {/* Controls Bar: View Switch (Cards vs Map) & Results Count */}
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs font-bold text-slate-700">
              Locali trovati a Follonica: <span className="text-follo-blue font-black">{places.length}</span>
              {selectedZone !== 'TUTTI' && (
                <span className="text-slate-500 font-normal"> (Filtro: {selectedZone})</span>
              )}
            </div>

            {/* Smooth View Switcher */}
            <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1 shadow-inner">
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white text-follo-blue shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-4 h-4" />
                <span>Card</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-follo-blue shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Map className="w-4 h-4" />
                <span>Mappa</span>
              </button>
            </div>
          </div>

          {/* VIEW: INTERACTIVE LEAFLET MAP */}
          {viewMode === 'map' ? (
            <div className="h-[520px] w-full animate-in fade-in">
              <InteractiveMap
                places={places}
                selectedPlace={selectedMerchant}
                onSelectPlace={handleOpenMenu}
                onSignalPlace={handleSignalPlace}
              />
            </div>
          ) : (
            /* VIEW: CARDS LIST */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {places.map((place) => {
                const isPartner = place.is_partner === 1;

                return (
                  <div
                    key={place.id}
                    className={`rounded-3xl overflow-hidden bg-white border transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md ${
                      isPartner
                        ? 'border-slate-200 hover:border-follo-blue'
                        : 'border-slate-200/80 bg-slate-50/50'
                    }`}
                  >
                    <div>
                      {/* Image / Banner */}
                      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                        {place.hero_image ? (
                          <img
                            src={place.hero_image}
                            alt={place.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-200 text-4xl">
                            🍴
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          {isPartner ? (
                            <span className="px-2.5 py-1 rounded-full bg-follo-blue text-white text-[10px] font-black tracking-wider uppercase shadow-md flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Partner Ufficiale
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-slate-800/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                              Locale Censito
                            </span>
                          )}
                        </div>

                        {place.distance_km !== undefined && (
                          <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold">
                            {place.distance_km} km da centro
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[11px] font-bold text-follo-blue uppercase tracking-wider">
                            {place.category}
                          </span>
                          {place.rating && (
                            <span className="text-xs font-black text-amber-500 flex items-center gap-0.5">
                              ★ {place.rating}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-black text-slate-900 line-clamp-1">{place.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 line-clamp-1">
                          <MapPin className="w-3.5 h-3.5 text-follo-red shrink-0" />
                          {place.address}
                        </p>

                        {/* If Partner: show delivery meta & preview */}
                        {isPartner ? (
                          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" /> {place.delivery_time_est || '25-35 min'}
                            </span>
                            <span>•</span>
                            <span>Min. €{place.min_order?.toFixed(2) || '10.00'}</span>
                          </div>
                        ) : (
                          <div className="mt-3 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 leading-relaxed">
                            Attività reale sul territorio. Non ancora abilitata agli ordini diretti con terminale Sunmi.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom CTA Action */}
                    <div className="p-5 pt-0">
                      {isPartner ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenMenu(place)}
                            className="flex-1 py-2.5 px-3 rounded-2xl bg-follo-blue hover:bg-follo-blue-dark text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span>Vedi Menu & Ordina</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenReservation(place)}
                            title="Radar Tavoli"
                            className="py-2.5 px-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition-colors flex items-center justify-center"
                          >
                            Tavolo
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSignalPlace(place)}
                          className="w-full py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5 text-follo-red" />
                          <span>Segnala a questo locale di attivarsi</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Territorial & Legal Footer */}
      <Footer />

      {/* Menu Drawer Modal */}
      {isMenuOpen && selectedMerchant && (
        <MenuDrawer
          merchant={selectedMerchant}
          menu={merchantMenu}
          onClose={() => setIsMenuOpen(false)}
          onAddToCart={(item) => {
            handleAddToCart(item);
            setIsCartOpen(true);
          }}
          onOpenReservationModal={(m) => {
            setIsMenuOpen(false);
            handleOpenReservation(m);
          }}
        />
      )}

      {/* Cart & Checkout Modal */}
      <CartCheckoutModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        merchantId={selectedMerchant?.id || places[0]?.id || ''}
        merchantName={selectedMerchant?.name || 'Locale FolloEat'}
        zone={selectedZone}
        pickupPoint={selectedZone === 'Spiaggia' ? `${selectedLido} ${umbrellaRef ? `(#${umbrellaRef})` : ''}` : undefined}
        onUpdateQuantity={handleUpdateCartQuantity}
        onClearCart={handleClearCart}
        onOrderSuccess={(order) => {
          setLastCreatedOrder(order);
        }}
      />

      {/* Fast Seating Radar Tavoli Modal */}
      <FastSeatingModal
        isOpen={isFastSeatingOpen}
        onClose={() => setIsFastSeatingOpen(false)}
        merchant={fastSeatingMerchant}
        onSuccess={(res) => {
          setLastReservation(res);
        }}
      />

      {/* Order Confirmation Banner Toast */}
      {lastCreatedOrder && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:max-w-md z-40 bg-slate-900 text-white p-4 rounded-3xl shadow-2xl border border-slate-800 animate-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-400">Ordine Inviato con Successo</span>
                <h4 className="font-bold text-sm text-white">{lastCreatedOrder.id}</h4>
              </div>
            </div>
            <button
              onClick={() => setLastCreatedOrder(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            La comanda è stata trasmessa al terminale Sunmi del ristorante. Totale: €{lastCreatedOrder.total_order_amount.toFixed(2)} ({lastCreatedOrder.payment_method === 'CARD' ? 'Carta pre-autorizzata' : 'Contanti alla consegna'}).
          </p>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
            <Link
              href={`/order/${lastCreatedOrder.id}`}
              className="w-full py-2 rounded-xl bg-follo-blue hover:bg-follo-blue-dark text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Apri Tracciamento Ordine Live</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Fixed Bottom Dock Nav */}
      <BottomDockNav
        activeTab={activeTab}
        onTabChange={(t) => {
          setActiveTab(t);
          if (t === 'home') setViewMode('cards');
          if (t === 'search') setViewMode('map');
        }}
        cartCount={cartItems.reduce((sum, i) => sum + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />
    </div>
  );
}
