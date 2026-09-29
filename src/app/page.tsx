'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import InteractiveMap from '@/components/InteractiveMap';
import MenuDrawer from '@/components/MenuDrawer';
import CartCheckoutModal from '@/components/CartCheckoutModal';
import FastSeatingModal from '@/components/FastSeatingModal';
import UserAuthModal from '@/components/UserAuthModal';
import UserProfileModal from '@/components/UserProfileModal';
import BottomDockNav, { NavTab } from '@/components/BottomDockNav';
import InstallPwaBanner from '@/components/InstallPwaBanner';
import Footer from '@/components/Footer';
import Logo from '@/components/Logo';
import {
  Merchant,
  MenuItem,
  OrderItem,
  Order,
  Reservation,
  SponsoredNotification,
  DietaryFilter,
  UserProfile
} from '@/lib/types';
import { isMerchantOpenNow } from '@/lib/opening-hours';
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
  Store,
  Phone,
  RotateCcw,
  Tag,
  AlertTriangle,
  Flame,
  Leaf,
  Wheat,
  Milk,
  X,
  Bell,
  UtensilsCrossed,
  Umbrella,
  Star,
  User as UserIcon,
  Navigation
} from 'lucide-react';
import Link from 'next/link';

const FOOD_CATEGORIES = [
  { id: 'ALL', name: 'Tutto il Golfo', icon: '🍽️' },
  { id: 'PIZZA', name: 'Pizze Veraci', icon: '🍕' },
  { id: 'PESCE', name: 'Pesce & Fritture', icon: '🐟' },
  { id: 'SCHIACCIATE', name: 'Schiacciate & Panini', icon: '🥪' },
  { id: 'CARNE', name: 'Burger & Chianina', icon: '🥩' },
  { id: 'DOLCI', name: 'Gelato & Dessert', icon: '🍨' }
];

export default function HomePage() {
  // State
  const [selectedZone, setSelectedZone] = useState<string>('TUTTI');
  const [selectedLido, setSelectedLido] = useState<string>('Bagno Florida');
  const [umbrellaRef, setUmbrellaRef] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFilter>('ALL');

  // Customer Authentication & Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Data
  const [places, setPlaces] = useState<Merchant[]>([]);
  const [notifications, setNotifications] = useState<SponsoredNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Time & "Aperto Ora" Filter State
  const [isOpenNowFilter, setIsOpenNowFilter] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Periodically refresh current time every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Selected Place & Menu Drawer
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [merchantMenu, setMerchantMenu] = useState<MenuItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Cart & Checkout
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [cartMerchant, setCartMerchant] = useState<Merchant | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);

  // Multi-Merchant Conflict Modal
  const [merchantConflict, setMerchantConflict] = useState<{
    isOpen: boolean;
    pendingMerchant: Merchant | null;
    pendingDish?: OrderItem;
  }>({
    isOpen: false,
    pendingMerchant: null
  });

  // Fast Seating Modal
  const [fastSeatingMerchant, setFastSeatingMerchant] = useState<Merchant | null>(null);
  const [isFastSeatingOpen, setIsFastSeatingOpen] = useState(false);
  const [lastReservation, setLastReservation] = useState<Reservation | null>(null);

  // Lead Generation Feedback Toast
  const [signalSuccessMessage, setSignalSuccessMessage] = useState<string | null>(null);

  // 1-Tap "Il Mio Solito" Re-order state
  const [usualOrder, setUsualOrder] = useState<{
    merchant: Merchant;
    items: OrderItem[];
    dateStr: string;
  } | null>(null);

  // Map view footer toggle state to prevent map overlapping
  const [showFooterInMap, setShowFooterInMap] = useState(false);

  // Load user session & "Il Mio Solito" on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('folloeat_user_session');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      const savedOrder = localStorage.getItem('folloeat_usual_order');
      if (savedOrder) {
        setUsualOrder(JSON.parse(savedOrder));
      }
    } catch {
      // Ignored
    }
  }, []);

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
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [selectedZone]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Handle Search Input submit
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

  // Cart operations with Mono-Merchant Enforcement (Master v4.1 Section 1.1)
  const handleAddToCart = (dishItem: OrderItem) => {
    if (cartItems.length > 0 && cartMerchant && selectedMerchant && cartMerchant.id !== selectedMerchant.id) {
      setMerchantConflict({
        isOpen: true,
        pendingMerchant: selectedMerchant,
        pendingDish: dishItem
      });
      return;
    }

    if (!cartMerchant && selectedMerchant) {
      setCartMerchant(selectedMerchant);
    }

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

  const handleResolveConflictSwitch = () => {
    if (merchantConflict.pendingMerchant && merchantConflict.pendingDish) {
      setCartMerchant(merchantConflict.pendingMerchant);
      setCartItems([merchantConflict.pendingDish]);
    }
    setMerchantConflict({ isOpen: false, pendingMerchant: null });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems(prev => {
      const updated = prev
        .map(item => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[];

      if (updated.length === 0) {
        setCartMerchant(null);
      }
      return updated;
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
    setCartMerchant(null);
  };

  // Re-order "Il Mio Solito"
  const handleApplyUsualOrder = () => {
    if (!usualOrder) return;
    setCartMerchant(usualOrder.merchant);
    setSelectedMerchant(usualOrder.merchant);
    setCartItems(usualOrder.items);
    setIsCartOpen(true);
  };

  // Save successful order as "Il Mio Solito"
  const handleOrderSuccess = (order: Order) => {
    setLastCreatedOrder(order);
    if (cartMerchant && cartItems.length > 0) {
      const usualData = {
        merchant: cartMerchant,
        items: cartItems,
        dateStr: new Date().toLocaleDateString('it-IT')
      };
      setUsualOrder(usualData);
      try {
        localStorage.setItem('folloeat_usual_order', JSON.stringify(usualData));
      } catch {}
    }

    // Award FolloPoints to logged in user
    if (currentUser) {
      const earned = Math.floor(order.total_order_amount);
      const updatedUser: UserProfile = {
        ...currentUser,
        points: (currentUser.points || 0) + earned
      };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('folloeat_user_session', JSON.stringify(updatedUser));
      } catch {}
    }
  };

  // Fast Seating
  const handleOpenReservation = (merchant: Merchant) => {
    setFastSeatingMerchant(merchant);
    setIsFastSeatingOpen(true);
  };

  // Count of currently open venues
  const openNowCount = React.useMemo(() => {
    return places.filter(p => isMerchantOpenNow(p, currentTime).isOpen).length;
  }, [places, currentTime]);

  // Filtered places according to category, dietary options, open now status, and search
  const filteredPlaces = places.filter(place => {
    // Open Now Filter
    if (isOpenNowFilter) {
      const openStatus = isMerchantOpenNow(place, currentTime);
      if (!openStatus.isOpen) return false;
    }

    // Dietary filter
    if (dietaryFilter === 'GLUTEN_FREE' && place.has_gluten_free !== 1) return false;
    if (dietaryFilter === 'VEGAN' && place.has_vegan !== 1) return false;
    if (dietaryFilter === 'LACTOSE_FREE' && place.has_lactose_free !== 1) return false;

    // Category filter
    if (selectedCategory !== 'ALL') {
      const cat = (place.category || '').toLowerCase();
      const name = place.name.toLowerCase();
      if (selectedCategory === 'PIZZA' && !cat.includes('pizz') && !name.includes('pizz')) return false;
      if (selectedCategory === 'PESCE' && !cat.includes('pesce') && !cat.includes('mare') && !name.includes('pesce') && !name.includes('porto')) return false;
      if (selectedCategory === 'SCHIACCIATE' && !cat.includes('schiacc') && !cat.includes('panin') && !cat.includes('bar')) return false;
      if (selectedCategory === 'CARNE' && !cat.includes('burger') && !cat.includes('chianina') && !cat.includes('carne')) return false;
      if (selectedCategory === 'DOLCI' && !cat.includes('gelat') && !cat.includes('pasticc')) return false;
    }

    return true;
  });

  const cartTotalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen pt-[calc(4.5rem+env(safe-area-inset-top,0px))] pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] px-4 md:px-8 max-w-7xl mx-auto font-sans">
      {/* Fixed Top Bar Navigation */}
      <Header
        selectedZone={selectedZone}
        onSelectZone={setSelectedZone}
        selectedLido={selectedLido}
        onSelectLido={(lido, umbrella) => {
          setSelectedLido(lido);
          setUmbrellaRef(umbrella);
        }}
        notifications={notifications}
        user={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => {
          if (currentUser) {
            setIsProfileModalOpen(true);
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Signal Success Feedback Alert */}
      {signalSuccessMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
          <p className="text-xs font-semibold leading-relaxed">{signalSuccessMessage}</p>
        </div>
      )}

      {/* Fast Seating Confirmed Reservation Card (Anti No-Show) */}
      {lastReservation && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[94%] bg-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-2xl border border-amber-400/40 animate-in fade-in slide-in-from-top-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm">
                🍽️
              </span>
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Tavolo Confermato • Fast Seating
                </span>
                <h4 className="font-black text-sm text-white">{lastReservation.merchant_name}</h4>
              </div>
            </div>
            <button
              onClick={() => setLastReservation(null)}
              className="p-1 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Coperti Riservati</span>
              <span className="font-bold text-amber-300">{lastReservation.party_size} persone</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Orario 2° Turno</span>
              <span className="font-bold text-white">{lastReservation.reservation_time}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-relaxed">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Politica Anti No-Show:</strong> Riceverai un promemoria SMS/WhatsApp 2 ore prima per confermare con 1 tap o riaprire il tavolo sul radar.
            </span>
          </p>
        </div>
      )}

      {/* PWA App Installation Prompt for Mobile/Desktop */}
      <InstallPwaBanner />

      {/* TAB CONTENT: RADAR TAVOLI */}
      {activeTab === 'tables' ? (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-6 md:p-8 text-white shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-100 mb-1">
              <Sparkles className="w-4 h-4" /> Radar Tavoli Follonica
            </div>
            <h2 className="text-2xl md:text-3xl font-black">Coperti Last-Minute · 2° Turno (Post-21:30)</h2>
            <p className="text-xs md:text-sm text-amber-100 mt-2 max-w-xl leading-relaxed">
              Trova e prenota istantaneamente i tavoli liberati nei ristoranti più amati del litorale a soli €0,50 a coperto. Zero attese e conferma immediata.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {places.filter(p => p.is_accredited === 1 || p.is_partner === 1).length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl">
                  🍽️
                </div>
                <h3 className="font-bold text-base text-slate-900">Nessun Tavolo Last-Minute Attivo al Momento</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  I coperti 2° turno post-21:30 vengono sbloccati dai ristoratori man mano che sono accreditati sulla piattaforma. Puoi accreditare qualsiasi ristorante dal pannello SuperAdmin.
                </p>
                <div className="pt-2">
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-follo-slate text-white text-xs font-bold shadow-xs hover:bg-slate-800 transition-colors"
                  >
                    <span>Apri Console SuperAdmin (PIN 58022)</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              places.filter(p => p.is_accredited === 1 || p.is_partner === 1).map(p => (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-amber-400 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
                        Sblocco 2° Turno
                      </span>
                      <span className="text-xs font-bold text-slate-500">Dalle ore 21:30</span>
                    </div>
                    <h3 className="font-black text-slate-900 text-base">{p.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-follo-red shrink-0" />
                      {p.address}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">Coperto: €0,50 / pax</span>
                    <button
                      onClick={() => handleOpenReservation(p)}
                      className="px-4 py-2 bg-follo-slate hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      Prenota Tavolo
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : activeTab === 'search' ? (
        /* TAB CONTENT: RICERCA DEDICATA */
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">
              Cerca nel Golfo di Follonica
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Cerca tra pizzerie veraci, fritture di paranza, schiacciate toscane e ristoranti sul lungomare
            </p>

            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Es. Pizza Margherita, Spaghetto allo Scoglio, Focaccia..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-follo-blue bg-slate-50 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-follo-blue hover:bg-follo-blue-dark text-white font-bold text-sm shadow-md transition-colors"
              >
                Cerca
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPlaces.map((place) => (
              <div key={place.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-base text-slate-900">{place.name}</h3>
                <p className="text-xs text-slate-500">{place.address}</p>
                <button
                  onClick={() => handleOpenMenu(place)}
                  className="w-full py-2 bg-follo-blue text-white rounded-xl text-xs font-bold"
                >
                  Vedi Menù
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* MAIN VIEW: DISCOVERY HOME & CATALOG */
        <div className="space-y-6">
          {/* Tuscan Coastal Hero Showcase Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-sky-900 via-sky-800 to-sky-700 rounded-3xl p-6 md:p-10 text-white shadow-xl">
            <div className="relative z-10 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs text-sky-200 mb-3">
                <span>Commissione etica 8%</span>
                <span aria-hidden="true">·</span>
                <span>Consegna anche all&apos;ombrellone</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-300 font-bold">Coupon FOLLO5 (-5%)</span>
              </div>

              <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight text-white">
                Il vero cibo di Follonica, a casa tua o sotto l&apos;ombrellone.
              </h1>
              
              <p className="text-xs md:text-sm text-sky-100 mt-2.5 leading-relaxed max-w-xl">
                Ordina direttamente dai migliori ristoratori locali. Incasso immediato sul conto del locale, rider del territorio e consegna garantita nei quartieri e sulle spiagge.
              </p>

              {/* Integrated Search Input */}
              <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-lg">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cerca pizza verace, pesce fresco, smash burger..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white text-slate-900 text-xs md:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-md"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-follo-red hover:bg-follo-red-dark text-white font-bold text-xs md:text-sm shadow-md transition-all whitespace-nowrap"
                >
                  Cerca Piatti
                </button>
              </form>
            </div>

            {/* Coastal aesthetic ambient lighting circles */}
            <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
            <div className="absolute right-20 top-0 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none"></div>
          </div>

          {/* 1-Tap "Il Mio Solito" Quick Re-order Bar */}
          {usualOrder && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 shadow-xs flex items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg shrink-0 shadow-xs">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">
                    Riordina &quot;Il Mio Solito&quot; in 1-Click
                  </span>
                  <p className="text-xs text-slate-700 font-medium">
                    Da <strong>{usualOrder.merchant.name}</strong> · {usualOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleApplyUsualOrder}
                className="px-4 py-2 rounded-xl bg-follo-red hover:bg-follo-red-dark text-white text-xs font-black shadow-md shrink-0 flex items-center gap-1.5 transition-all"
              >
                <span>Ordina Subito</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Food Category Quick Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {FOOD_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-follo-blue text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Dietary Filters, "Aperto Ora" & View Switcher (Cards vs Interactive Map) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            {/* Filters Group */}
            <div className="flex flex-wrap items-center gap-2">
              {/* "Aperto Ora" Live Filter Button */}
              <button
                onClick={() => setIsOpenNowFilter(!isOpenNowFilter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  isOpenNowFilter
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/40'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title={isOpenNowFilter ? "Disattiva filtro per mostrare tutti i ristoranti" : "Filtra per mostrare solo i ristoranti attualmente aperti"}
              >
                <span className={`w-2 h-2 rounded-full ${isOpenNowFilter ? 'bg-white animate-pulse' : 'bg-emerald-500'}`} />
                <span>Aperto ora</span>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  isOpenNowFilter ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800'
                }`}>
                  {openNowCount}
                </span>
              </button>

              <div className="h-5 w-[1px] bg-slate-200 hidden sm:block"></div>

              {/* Dietary Tabs */}
              <button
                onClick={() => setDietaryFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  dietaryFilter === 'ALL'
                    ? 'bg-follo-slate text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Tutti ({places.length})
              </button>
              <button
                onClick={() => setDietaryFilter('GLUTEN_FREE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  dietaryFilter === 'GLUTEN_FREE'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Wheat className="w-3.5 h-3.5 text-amber-500" />
                <span>Senza Glutine</span>
              </button>
              <button
                onClick={() => setDietaryFilter('VEGAN')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  dietaryFilter === 'VEGAN'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                <span>Vegano</span>
              </button>
              <button
                onClick={() => setDietaryFilter('LACTOSE_FREE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  dietaryFilter === 'LACTOSE_FREE'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Milk className="w-3.5 h-3.5 text-sky-500" />
                <span>Senza Lattosio</span>
              </button>
            </div>

            {/* View Mode Toggle: Card vs Map */}
            <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-2xl self-start sm:self-auto shadow-inner">
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white text-follo-blue shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-4 h-4" />
                <span>Lista Card</span>
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
                <span>Mappa Interattiva</span>
              </button>
            </div>
          </div>

          {/* VIEW: INTERACTIVE MAP (LEAFLET WITH FULL CONTROLS & FULLSCREEN) */}
          {viewMode === 'map' ? (
            <div className="space-y-4 mb-6 animate-in fade-in">
              {/* Map Context Bar */}
              <div className="bg-gradient-to-r from-sky-600 via-follo-blue to-follo-blue-dark rounded-3xl p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 text-xl shadow-inner">
                    🗺️
                  </div>
                  <div>
                    <h3 className="font-black text-base text-white">Mappa Georeferenziata del Golfo di Follonica</h3>
                    <p className="text-xs text-sky-100">
                      {filteredPlaces.length} locali censiti con coordinate GPS esatte. Usa i filtri rapidi, tocca i pin per ordinare o usa ⛶ per lo schermo intero.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    onClick={() => setViewMode('cards')}
                    className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Torna alla Lista</span>
                  </button>
                </div>
              </div>

              {/* Map Frame: Optimized responsive viewport height without scroll or footer intrusion */}
              <div className="relative isolate z-10 h-[calc(100vh-14.5rem)] min-h-[520px] max-h-[820px] w-full rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100">
                <InteractiveMap
                  places={filteredPlaces}
                  selectedPlace={selectedMerchant}
                  onSelectPlace={handleOpenMenu}
                  onSignalPlace={handleSignalPlace}
                />
              </div>

              {/* Map Bottom Helper & Clean Footer Disclosure */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-1 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-semibold text-slate-700">Mappa attiva a pieno schermo</span>
                  <span className="hidden sm:inline text-slate-400">· Nessuna sovrapposizione con il footer</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFooterInMap(!showFooterInMap)}
                    className="text-follo-blue hover:text-follo-blue-dark font-bold hover:underline cursor-pointer"
                  >
                    {showFooterInMap ? 'Nascondi Informazioni Legali & B2B' : 'Mostra Note Legali & Info B2B'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className="text-slate-600 hover:text-slate-900 font-bold hover:underline cursor-pointer"
                  >
                    Visualizza Griglia Locali
                  </button>
                </div>
              </div>

              {showFooterInMap && (
                <div className="mt-8 mb-6 animate-in fade-in">
                  <Footer />
                </div>
              )}
            </div>
          ) : (
            /* VIEW: RESTAURANT CARDS GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlaces.map((place) => {
                const isSpotlight = place.is_spotlight === 1;
                const isAccredited = place.is_accredited === 1 || place.is_partner === 1;

                return (
                  <div
                    key={place.id}
                    className={`rounded-3xl overflow-hidden bg-white border transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md ${
                      isSpotlight
                        ? 'border-2 border-amber-400 bg-gradient-to-b from-amber-50/20 to-white shadow-amber-500/10'
                        : isAccredited
                        ? 'border-slate-200 hover:border-follo-blue'
                        : 'border-slate-200 bg-slate-50/40'
                    }`}
                  >
                    <div>
                      {/* Image Frame with resilient fallback */}
                      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                        {place.hero_image ? (
                          <img
                            src={place.hero_image}
                            alt={place.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 p-4 text-center">
                            <span className="text-4xl mb-1">🍴</span>
                            <span className="text-xs font-bold text-slate-700">{place.name}</span>
                            <span className="text-[10px] text-slate-400">{place.category}</span>
                          </div>
                        )}

                        {/* Top Badge: 3-Tier Marketplace Hierarchy */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                          {isSpotlight ? (
                            <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                              👑 Spotlight Premium
                            </span>
                          ) : isAccredited ? (
                            <span className="px-2.5 py-1 rounded-xl bg-follo-blue text-white text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Consigliato FolloEat
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                              Attività di Follonica
                            </span>
                          )}
                        </div>

                        {place.distance_km !== undefined && (
                          <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold">
                            {place.distance_km} km da centro
                          </span>
                        )}
                      </div>

                      {/* Card Content & Clean Unboxed Metadata */}
                      <div className="p-5">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[11px] font-bold text-follo-blue uppercase tracking-wider">
                            {place.category}
                          </span>
                          {place.rating && (
                            <span className="text-xs font-black text-amber-500 flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {place.rating}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-black text-slate-900 line-clamp-1">{place.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 line-clamp-1">
                          <MapPin className="w-3.5 h-3.5 text-follo-red shrink-0" />
                          {place.address}
                        </p>

                        {/* Live Operational Hours Badge */}
                        {(() => {
                          const openStatus = isMerchantOpenNow(place, currentTime);
                          return (
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border flex items-center gap-1 ${openStatus.badgeClass}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${openStatus.badgeDotClass}`} />
                                <span>{openStatus.statusLabel}</span>
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">
                                {openStatus.nextTransition}
                              </span>
                            </div>
                          );
                        })()}

                        {/* Dietary Option Tags */}
                        {isAccredited && (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {place.has_gluten_free === 1 && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                                🌾 Gluten Free
                              </span>
                            )}
                            {place.has_vegan === 1 && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                                🌱 Vegano
                              </span>
                            )}
                            {place.has_lactose_free === 1 && (
                              <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 text-[10px] font-bold border border-sky-200">
                                🥛 Senza Lattosio
                              </span>
                            )}
                          </div>
                        )}

                        {/* Delivery Meta or Directory note */}
                        {isAccredited ? (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                            <span className="flex items-center gap-1 text-slate-700 font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-400" /> {place.delivery_time_est || '25-35 min'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>Min. €{place.min_order?.toFixed(2) || '12.00'}</span>
                            <span aria-hidden="true">·</span>
                            <span>Consegna al lido</span>
                          </div>
                        ) : (
                          <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                            Scheda censita. Chiama direttamente per ordinare al telefono o prenotare.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom CTA Action Buttons */}
                    <div className="p-5 pt-0">
                      {isAccredited ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenMenu(place)}
                            className="flex-1 py-2.5 px-3 rounded-2xl bg-follo-blue hover:bg-follo-blue-dark text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span>Vedi Menù & Ordina</span>
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
                        <div className="space-y-2">
                          <a
                            href={`tel:${place.phone}`}
                            className="w-full py-2.5 px-3 rounded-2xl bg-follo-slate hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                          >
                            <Phone className="w-3.5 h-3.5 text-follo-sand" />
                            <span>Chiama Locale ({place.phone})</span>
                          </a>
                          <button
                            onClick={() => handleSignalPlace(place)}
                            className="w-full py-1.5 px-3 text-[11px] text-slate-500 hover:text-slate-700 font-medium transition-colors text-center block"
                          >
                            Segnala a FolloEat di attivare gli ordini online
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Territorial & Legal Footer: rendered when in card mode or non-home tabs to prevent map overlap */}
      {(viewMode === 'cards' || activeTab !== 'home') && (
        <div className="mt-14 mb-8">
          <Footer />
        </div>
      )}

      {/* User Login & Registration Modal */}
      <UserAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(loggedUser) => {
          setCurrentUser(loggedUser);
          setIsAuthModalOpen(false);
        }}
      />

      {/* User Profile Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={currentUser}
          onLogout={() => {
            setCurrentUser(null);
            try {
              localStorage.removeItem('folloeat_user_session');
            } catch {}
          }}
          onUpdateUser={(updated) => setCurrentUser(updated)}
        />
      )}

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
        merchantId={cartMerchant?.id || selectedMerchant?.id || places[0]?.id || ''}
        merchantName={cartMerchant?.name || selectedMerchant?.name || 'Locale FolloEat'}
        zone={selectedZone}
        pickupPoint={selectedZone === 'Spiaggia' ? `${selectedLido} ${umbrellaRef ? `(#${umbrellaRef})` : ''}` : undefined}
        onUpdateQuantity={handleUpdateCartQuantity}
        onClearCart={handleClearCart}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Fast Seating Radar Tavoli Modal */}
      {isFastSeatingOpen && fastSeatingMerchant && (
        <FastSeatingModal
          isOpen={isFastSeatingOpen}
          onClose={() => setIsFastSeatingOpen(false)}
          merchant={fastSeatingMerchant}
          onSuccess={(res: Reservation) => {
            setLastReservation(res);
          }}
        />
      )}

      {/* Multi-Merchant Conflict Resolution Modal */}
      {merchantConflict.isOpen && merchantConflict.pendingMerchant && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Cambio Ristorante nel Carrello
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                A tutela dei ristoratori locali, ogni locale su FolloEat ha un conto merchant autonomo Stripe Connect.
                Nel carrello hai già piatti di <strong>{cartMerchant?.name}</strong>.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                onClick={handleResolveConflictSwitch}
                className="w-full py-2.5 px-4 rounded-xl bg-follo-blue hover:bg-follo-blue-dark text-white text-xs font-bold transition-colors shadow-xs"
              >
                Svuota carrello e ordina da {merchantConflict.pendingMerchant.name}
              </button>
              <button
                onClick={() => setMerchantConflict({ isOpen: false, pendingMerchant: null })}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Mantieni carrello attuale ({cartMerchant?.name})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Dock Navigation */}
      <BottomDockNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'profile') {
            if (currentUser) {
              setIsProfileModalOpen(true);
            } else {
              setIsAuthModalOpen(true);
            }
          } else {
            setActiveTab(tab);
          }
        }}
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
      />
    </div>
  );
}
