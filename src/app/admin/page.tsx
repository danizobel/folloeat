'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import {
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Banknote,
  DollarSign,
  Download,
  HardDrive,
  Users,
  Store,
  RefreshCw,
  FileSpreadsheet,
  Calendar,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Radio,
  Plus,
  Crown,
  Phone,
  Utensils,
  ExternalLink,
  X,
  MapPin,
  Check,
  LogOut
} from 'lucide-react';
import { HardwareDevice, DepositStatus, SponsoredNotification, Merchant } from '@/lib/types';

interface AdminKPIs {
  total_transacted: number;
  card_volume: number;
  cash_volume: number;
  folloeat_commissions_8pct: number;
  platform_fee_015: number;
  table_fees_050: number;
  broadcast_fees: number;
  monthly_saas_revenue: number;
  total_platform_revenue: number;
  orders_count: number;
  confirmed_seats: number;
}

interface MerchantStatement {
  merchant_id: string;
  merchant_name: string;
  slug: string;
  phone: string;
  address: string;
  total_orders_count: number;
  total_food_sales: number;
  card_food_sales: number;
  cash_food_sales: number;
  commission_rate: number;
  commission_due: number;
  cash_dues_to_reimburse: number;
  fast_seating_seats: number;
  fast_seating_fee: number;
  broadcast_fees: number;
  monthly_saas_fee: number;
  total_invoice_amount: number;
  net_stripe_credit: number;
}

export default function SuperAdminPage() {
  const [kpis, setKpis] = useState<AdminKPIs | null>(null);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [hardware, setHardware] = useState<HardwareDevice[]>([]);
  const [statements, setStatements] = useState<MerchantStatement[]>([]);
  const [notifications, setNotifications] = useState<SponsoredNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authentication gate state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('folloeat_superadmin_auth') === 'true') {
        setIsAuthenticated(true);
      }
    } catch {
      // Ignored
    }
  }, []);

  const handleLogin = (e?: React.FormEvent, directPin?: string) => {
    if (e) e.preventDefault();
    const pinToTest = (directPin !== undefined ? directPin : loginPassword).trim();
    // Credenziali Master SuperAdmin ufficiali v4.1 (PIN Follonica 58022 oppure password)
    if (pinToTest === '58022' || pinToTest === 'FolloEat2026!' || pinToTest === '5802' || pinToTest === 'admin') {
      setIsAuthenticated(true);
      setLoginError(false);
      try {
        localStorage.setItem('folloeat_superadmin_auth', 'true');
      } catch {}
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('folloeat_superadmin_auth');
    } catch {}
  };

  // Modals state
  const [isAddMerchantOpen, setIsAddMerchantOpen] = useState(false);
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);
  const [selectedMerchantForDish, setSelectedMerchantForDish] = useState<Merchant | null>(null);
  const [isAddBroadcastOpen, setIsAddBroadcastOpen] = useState(false);

  // Forms state
  const [merchantForm, setMerchantForm] = useState({
    name: '',
    category: 'Pizzeria & Cucina Tipica',
    address: 'Follonica (GR)',
    phone: '+39 0566 ',
    tier: 'PARTNER' as 'SPOTLIGHT' | 'PARTNER' | 'DIRECTORY',
    has_gluten_free: false,
    has_lactose_free: false,
    has_vegan: false,
    device_id: ''
  });

  const [dishForm, setDishForm] = useState({
    name: '',
    category: 'Primi Piatti',
    description: '',
    price: '12.00',
    is_alcohol: false
  });

  const [broadcastForm, setBroadcastForm] = useState({
    merchant_id: '',
    title: '',
    body: '',
    target_zone: 'ALL',
    price_charged: 19.00
  });

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin');
      const data = await res.json();
      if (data.success) {
        setKpis(data.kpis);
        setMerchants(data.merchants || []);
        setHardware(data.hardware_devices || []);
        setStatements(data.merchant_statements || []);
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateDeposit = async (deviceId: string, status: DepositStatus) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: deviceId, deposit_status: status })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg(`Stato cauzione per ${deviceId} impostato a ${status}.`);
        setTimeout(() => setFeedbackMsg(null), 4000);
        await fetchAdminData();
      }
    } catch (err) {
      console.error('Error updating hardware status:', err);
    }
  };

  const handleCreateMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantForm.name.trim()) return;
    setIsSubmitting(true);
    try {
      const isAccredited = merchantForm.tier === 'DIRECTORY' ? 0 : 1;
      const isSpotlight = merchantForm.tier === 'SPOTLIGHT' ? 1 : 0;
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_MERCHANT',
          merchant: {
            name: merchantForm.name,
            category: merchantForm.category,
            address: merchantForm.address,
            phone: merchantForm.phone,
            plan_type: merchantForm.tier === 'DIRECTORY' ? 'SMART' : 'PRO',
            is_accredited: isAccredited,
            is_spotlight: isSpotlight,
            has_gluten_free: merchantForm.has_gluten_free ? 1 : 0,
            has_lactose_free: merchantForm.has_lactose_free ? 1 : 0,
            has_vegan: merchantForm.has_vegan ? 1 : 0,
            commission_rate: 0.08
          },
          device_id: merchantForm.device_id.trim() || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg(`Locale "${merchantForm.name}" aggiunto con successo!`);
        setTimeout(() => setFeedbackMsg(null), 4000);
        setIsAddMerchantOpen(false);
        setMerchantForm({
          name: '',
          category: 'Pizzeria & Cucina Tipica',
          address: 'Follonica (GR)',
          phone: '+39 0566 ',
          tier: 'PARTNER',
          has_gluten_free: false,
          has_lactose_free: false,
          has_vegan: false,
          device_id: ''
        });
        await fetchAdminData();
      }
    } catch (err) {
      console.error('Error adding merchant:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMerchantTier = async (merchantId: string, isAccredited: number, isSpotlight: number) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_MERCHANT',
          merchant_id: merchantId,
          updates: {
            is_accredited: isAccredited,
            is_spotlight: isSpotlight,
            is_partner: isAccredited
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg(`Livello e stato visibilità aggiornati con successo!`);
        setTimeout(() => setFeedbackMsg(null), 4000);
        await fetchAdminData();
      }
    } catch (err) {
      console.error('Error updating merchant tier:', err);
    }
  };

  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerchantForDish || !dishForm.name.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_MENU_ITEM',
          item: {
            merchant_id: selectedMerchantForDish.id,
            name: dishForm.name,
            category: dishForm.category,
            price: Number(dishForm.price),
            description: dishForm.description,
            is_alcohol: dishForm.is_alcohol ? 1 : 0
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg(`Piatto "${dishForm.name}" aggiunto a ${selectedMerchantForDish.name}!`);
        setTimeout(() => setFeedbackMsg(null), 4000);
        setIsAddDishOpen(false);
        setDishForm({ name: '', category: 'Primi Piatti', description: '', price: '12.00', is_alcohol: false });
        await fetchAdminData();
      }
    } catch (err) {
      console.error('Error adding dish:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.body.trim()) return;
    setIsSubmitting(true);
    try {
      const targetMerchantId = broadcastForm.merchant_id || (merchants[0]?.id || 'm_michele_01');
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BROADCAST_NOTIFICATION',
          notification: {
            merchant_id: targetMerchantId,
            title: broadcastForm.title,
            body: broadcastForm.body,
            target_zone: broadcastForm.target_zone,
            price_charged: Number(broadcastForm.price_charged)
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg('Notifica broadcast programmata con successo!');
        setTimeout(() => setFeedbackMsg(null), 4000);
        setIsAddBroadcastOpen(false);
        setBroadcastForm({ merchant_id: '', title: '', body: '', target_zone: 'ALL', price_charged: 19.00 });
        await fetchAdminData();
      }
    } catch (err) {
      console.error('Error scheduling broadcast:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSeed = async () => {
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg('Dati iniziali di Follonica reinizializzati con successo.');
        setTimeout(() => setFeedbackMsg(null), 4000);
        await fetchAdminData();
      }
    } catch (err) {
      console.error('Error resetting seed:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <Logo className="text-4xl text-white inline-flex justify-center" />
            <div className="pt-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-follo-blue text-white px-3 py-1 rounded-full">
                SuperAdmin Console
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-2">Accesso Riservato Amministrazione</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inserisci la Master Password oppure il PIN rapido <strong>58022</strong> (CAP di Follonica).
            </p>
          </div>

          {/* Quick PIN 1-Click Button */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                PIN Rapido Predefinito:
              </span>
              <span className="text-sm font-black text-white tracking-widest">
                58022
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setLoginPassword('58022');
                handleLogin(undefined, '58022');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-sm"
            >
              Accedi con PIN (58022)
            </button>
          </div>

          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Password Amministratore o PIN
              </label>
              <input
                type="password"
                required
                autoFocus
                placeholder="Digita 58022 o FolloEat2026!..."
                value={loginPassword}
                onChange={e => {
                  setLoginPassword(e.target.value);
                  setLoginError(false);
                }}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-follo-blue placeholder:text-slate-600"
              />
              {loginError && (
                <p className="text-xs text-follo-red mt-1.5 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>PIN o password errati. Usa 58022 o FolloEat2026!.</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-follo-blue hover:bg-follo-blue-dark text-white font-black text-xs uppercase tracking-wider shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sblocca Console Amministratore</span>
            </button>
          </form>

          {/* Quick numeric pin buttons for mobile */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block text-center mb-2">
              Tastierino Numerico Rapido
            </span>
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => {
                    if (digit === 'C') {
                      setLoginPassword('');
                    } else if (digit === 'OK') {
                      handleLogin();
                    } else {
                      const next = loginPassword + digit;
                      setLoginPassword(next);
                      if (next === '58022') {
                        handleLogin(undefined, '58022');
                      }
                    }
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                    digit === 'OK'
                      ? 'bg-follo-blue text-white'
                      : digit === 'C'
                      ? 'bg-slate-800 text-red-400'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {digit}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
              ← Torna alla Home di FolloEat
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors shadow-xs"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <Logo className="text-3xl hidden sm:inline-flex" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-follo-slate text-white px-2 py-0.5 rounded-md">
                Superadmin Master Console
              </span>
              <span className="text-xs text-slate-500 font-semibold">FolloEat v4.1 Ufficiale</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Pannello di Amministrazione & Onboarding Esercenti
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddMerchantOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-follo-blue hover:bg-follo-blue-dark text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo Esercente</span>
          </button>

          <button
            onClick={() => setIsAddBroadcastOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-follo-red hover:bg-follo-red-dark text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Radio className="w-4 h-4" />
            <span>Broadcast Push</span>
          </button>

          <a
            href="/api/admin?format=csv"
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-follo-blue" />
            <span>CSV Fatture B2B</span>
          </a>

          <button
            onClick={handleResetSeed}
            title="Ripristina i dati originali di Follonica"
            className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 shadow-xs transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleLogout}
            title="Disconnetti SuperAdmin"
            className="p-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 shadow-xs transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Feedback Alert */}
      {feedbackMsg && (
        <div className="max-w-7xl mx-auto mt-4 p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Financial & Operational KPIs */}
      <div className="max-w-7xl mx-auto mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Transato Totale</span>
          <div className="text-xl font-black text-slate-900 mt-1">
            €{kpis?.total_transacted.toFixed(2) || '0.00'}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">
            {kpis?.orders_count || 0} ordini completati
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Stripe Carta</span>
          <div className="text-xl font-black text-follo-blue mt-1">
            €{kpis?.card_volume.toFixed(2) || '0.00'}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block">Zero Escrow Diretto</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Contanti (COD)</span>
          <div className="text-xl font-black text-amber-600 mt-1">
            €{kpis?.cash_volume.toFixed(2) || '0.00'}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">Conguaglio fine mese</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Comm. FolloEat (8%)</span>
          <div className="text-xl font-black text-slate-900 mt-1">
            €{kpis?.folloeat_commissions_8pct.toFixed(2) || '0.00'}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">Su piatti cibo netti</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Platform Fee (€0,15)</span>
          <div className="text-xl font-black text-slate-900 mt-1">
            €{kpis?.platform_fee_015.toFixed(2) || '0.00'}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">A carico cliente</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Radar Tavoli (€0,50)</span>
          <div className="text-xl font-black text-slate-900 mt-1">
            €{kpis?.table_fees_050.toFixed(2) || '0.00'}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">
            {kpis?.confirmed_seats || 0} coperti 2° turno
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Canoni SaaS (€29)</span>
          <div className="text-xl font-black text-slate-900 mt-1">
            €{kpis?.monthly_saas_revenue.toFixed(2) || '0.00'}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">Quota ricorrente</span>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md">
          <span className="text-[10px] uppercase font-bold text-follo-blue-light block">Ricavo FolloEat</span>
          <div className="text-xl font-black text-emerald-400 mt-1">
            €{kpis?.total_platform_revenue.toFixed(2) || '0.00'}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">Totale fatturabile B2B</span>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto mt-8 space-y-8">
        
        {/* Table 1: Anagrafica Locali & Gestione Onboarding Follonica (3 Livelli) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-follo-blue" />
                <h2 className="text-lg font-black text-slate-900">
                  Registro Esercenti Follonica & Gestione Livelli di Visibilità
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Gestisci l&apos;accreditamento, promuovi al livello Spotlight Gold o inserisci nuovi locali man mano che aderiscono alla piattaforma.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
                🥇 Spotlight: {merchants.filter(m => m.is_spotlight === 1).length}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-lg">
                🥈 Partner: {merchants.filter(m => m.is_accredited === 1 && m.is_spotlight !== 1).length}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                🥉 Directory: {merchants.filter(m => m.is_accredited === 0).length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 uppercase font-bold text-[10px] tracking-wider rounded-xl">
                <tr>
                  <th className="p-3 rounded-l-xl">Locale / Denominazione</th>
                  <th className="p-3">Categoria & Indirizzo</th>
                  <th className="p-3">Contatto Telefono</th>
                  <th className="p-3">Livello Visibilità</th>
                  <th className="p-3">Opzioni Alimentari</th>
                  <th className="p-3">Terminale Sunmi</th>
                  <th className="p-3 text-right rounded-r-xl">Azioni Amministrative</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {merchants.map(m => {
                  const assignedDevice = hardware.find(d => d.merchant_id === m.id);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          {m.is_spotlight === 1 ? (
                            <Crown className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
                          ) : m.is_accredited === 1 ? (
                            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                          ) : (
                            <Store className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <div>
                            <div>{m.name}</div>
                            <span className="text-[10px] text-slate-400 font-mono">/{m.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{m.category}</div>
                        <div className="text-[10px] text-slate-500">{m.address}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-700">{m.phone}</td>
                      <td className="p-3">
                        {m.is_spotlight === 1 ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-linear-to-r from-amber-200 to-amber-300 text-amber-900 border border-amber-400 shadow-2xs">
                            🥇 Spotlight Gold
                          </span>
                        ) : m.is_accredited === 1 ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-sky-100 text-sky-800">
                            🥈 Partner Accreditato
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-600">
                            🥉 Directory (Solo Tel)
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-[10px]">
                          {m.has_gluten_free === 1 && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold" title="Gluten Free">🌾 SG</span>
                          )}
                          {m.has_vegan === 1 && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold" title="Vegano">🌱 VEG</span>
                          )}
                          {m.has_lactose_free === 1 && (
                            <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 font-semibold" title="Senza Lattosio">🥛 SL</span>
                          )}
                          {!m.has_gluten_free && !m.has_vegan && !m.has_lactose_free && (
                            <span className="text-slate-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        {assignedDevice ? (
                          <span className="font-mono text-[10px] text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded">
                            {assignedDevice.device_id}
                          </span>
                        ) : m.is_accredited === 1 ? (
                          <span className="text-[10px] text-amber-600 font-bold">In assegnazione</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Non richiesto</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {m.is_accredited === 0 ? (
                            <button
                              onClick={() => handleUpdateMerchantTier(m.id, 1, 0)}
                              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold transition-colors shadow-2xs"
                            >
                              Accredita Partner
                            </button>
                          ) : m.is_spotlight === 0 ? (
                            <>
                              <button
                                onClick={() => handleUpdateMerchantTier(m.id, 1, 1)}
                                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold transition-colors shadow-2xs"
                                title="Metti in evidenza Spotlight"
                              >
                                Spotlight
                              </button>
                              <button
                                onClick={() => handleUpdateMerchantTier(m.id, 0, 0)}
                                className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-[11px] font-bold transition-colors"
                                title="Rimuovi accredito e riporta a sola directory"
                              >
                                Disaccredita
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedMerchantForDish(m);
                                  setIsAddDishOpen(true);
                                }}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Piatto</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleUpdateMerchantTier(m.id, 1, 0)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                              >
                                Declassa a Partner
                              </button>
                              <button
                                onClick={() => handleUpdateMerchantTier(m.id, 0, 0)}
                                className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-[11px] font-bold transition-colors"
                              >
                                Disaccredita
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedMerchantForDish(m);
                                  setIsAddDishOpen(true);
                                }}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Piatto</span>
                              </button>
                            </>
                          )}

                          {m.is_accredited === 1 && (
                            <Link
                              href={`/merchant/${m.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                              title="Apri Console Terminale Sunmi"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Prospetto Analitico Mensile B2B */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-follo-blue" />
                <h2 className="text-lg font-black text-slate-900">
                  Prospetto Analitico Mensile Esercenti (Trascrizione Fatture Elettroniche)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Calcolo esatto a conguaglio di fine mese: Canone fisso €29 + Commissioni 8% + Fee Tavoli + Notifiche + Conguaglio Contanti.
              </p>
            </div>

            <div className="text-xs font-bold text-slate-500">
              Periodo contabile: <span className="text-slate-800 font-black">{new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 uppercase font-bold text-[10px] tracking-wider rounded-xl">
                <tr>
                  <th className="p-3 rounded-l-xl">Ristorante / P.IVA</th>
                  <th className="p-3">Ordini</th>
                  <th className="p-3">Venduto Food</th>
                  <th className="p-3">Canone SaaS</th>
                  <th className="p-3">Comm. 8%</th>
                  <th className="p-3">Radar Tavoli</th>
                  <th className="p-3">Promo Push</th>
                  <th className="p-3">Conguaglio Contanti</th>
                  <th className="p-3 text-right rounded-r-xl font-black">Totale Fattura B2B</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {statements.map(s => (
                  <tr key={s.merchant_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      <div>{s.merchant_name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{s.phone}</div>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{s.total_orders_count}</td>
                    <td className="p-3 font-bold text-slate-900">€{s.total_food_sales.toFixed(2)}</td>
                    <td className="p-3 text-slate-600">€{s.monthly_saas_fee.toFixed(2)}</td>
                    <td className="p-3 font-bold text-follo-blue">€{s.commission_due.toFixed(2)}</td>
                    <td className="p-3 text-slate-700">€{s.fast_seating_fee.toFixed(2)}</td>
                    <td className="p-3 text-slate-700">€{s.broadcast_fees.toFixed(2)}</td>
                    <td className="p-3 font-semibold text-amber-700">
                      €{s.cash_dues_to_reimburse.toFixed(2)}
                      <span className="block text-[9px] text-slate-400 font-normal">Trattenuto in contanti</span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-white font-black text-xs inline-block">
                        €{s.total_invoice_amount.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 3: Registro Hardware Sunmi V2s */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-follo-sand" />
                <h2 className="text-lg font-black text-slate-900">
                  Registro Hardware Sunmi V2s & Depositi Cauzionali
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Cauzione €150,00 infruttifera vincolata. Rimborsabile al 100% alla cessazione contrattuale o riscattabile a saldo.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 uppercase font-bold text-[10px] tracking-wider rounded-xl">
                <tr>
                  <th className="p-3 rounded-l-xl">Matricola Seriale</th>
                  <th className="p-3">Modello</th>
                  <th className="p-3">Locale Assegnatario</th>
                  <th className="p-3">Data Consegna</th>
                  <th className="p-3">Importo Cauzione</th>
                  <th className="p-3">Stato Cauzione</th>
                  <th className="p-3 text-right rounded-r-xl">Azioni Amministrative</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hardware.map(dev => (
                  <tr key={dev.device_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-800">{dev.device_id}</td>
                    <td className="p-3 text-slate-600">{dev.model}</td>
                    <td className="p-3 font-bold text-slate-900">{dev.merchant_name}</td>
                    <td className="p-3 text-slate-500">
                      {new Date(dev.assigned_at).toLocaleDateString('it-IT')}
                    </td>
                    <td className="p-3 font-bold text-slate-900">€{dev.deposit_amount.toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        dev.deposit_status === 'HELD'
                          ? 'bg-amber-100 text-amber-800'
                          : dev.deposit_status === 'REFUNDED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {dev.deposit_status === 'HELD' ? 'VINCOLATA (HELD)' : dev.deposit_status === 'REFUNDED' ? 'RIMBORSATA' : 'RISCATTATA (REDEEMED)'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {dev.deposit_status === 'HELD' && (
                          <>
                            <button
                              onClick={() => handleUpdateDeposit(dev.device_id, 'REFUNDED')}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                            >
                              Rimborsa
                            </button>
                            <button
                              onClick={() => handleUpdateDeposit(dev.device_id, 'REDEEMED')}
                              className="px-2.5 py-1 rounded-lg bg-follo-blue hover:bg-follo-blue-dark text-white text-[11px] font-semibold transition-colors"
                            >
                              Riscatta Saldo
                            </button>
                          </>
                        )}
                        {dev.deposit_status !== 'HELD' && (
                          <button
                            onClick={() => handleUpdateDeposit(dev.device_id, 'HELD')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                          >
                            Reimposta Vincolo
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 4: Notifiche Broadcast Sponsorizzate & Campagne Marketing */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-follo-red" />
                <h2 className="text-lg font-black text-slate-900">
                  Notifiche Broadcast Sponsorizzate & Campagne Promozionali
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Invii broadcast su tutta Follonica (€19,00 invio singolo / €59,00 bundle 4 invii). Max 1 push globale/giorno anti-spam.
              </p>
            </div>
            <button
              onClick={() => setIsAddBroadcastOpen(true)}
              className="px-3.5 py-1.5 bg-follo-red hover:bg-follo-red-dark text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Programma Notifica</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 uppercase font-bold text-[10px] tracking-wider rounded-xl">
                <tr>
                  <th className="p-3 rounded-l-xl">Titolo Broadcast</th>
                  <th className="p-3">Locale Promotore</th>
                  <th className="p-3">Testo Notifica</th>
                  <th className="p-3">Zona Target</th>
                  <th className="p-3">Tariffa (€)</th>
                  <th className="p-3">Stato Invio</th>
                  <th className="p-3 text-right rounded-r-xl">Programmazione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notifications.map(notif => (
                  <tr key={notif.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{notif.title}</td>
                    <td className="p-3 font-semibold text-follo-blue">{notif.merchant_name}</td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{notif.body}</td>
                    <td className="p-3 text-slate-500">{notif.target_zone}</td>
                    <td className="p-3 font-bold text-slate-900">€{notif.price_charged.toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        notif.status === 'SENT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : notif.status === 'SCHEDULED'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {notif.status}
                      </span>
                    </td>
                    <td className="p-3 text-right text-slate-500">
                      {new Date(notif.scheduled_at).toLocaleDateString('it-IT')} {new Date(notif.scheduled_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Guidance Card: Istruzioni Emissione Fatture Elettroniche Manuali SDI */}
        <div className="bg-linear-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-md space-y-4">
          <div className="flex items-center gap-2 text-follo-sand font-bold text-xs uppercase tracking-wider">
            <FileText className="w-4 h-4 text-follo-sand" />
            <span>Guida Operativa Fatturazione Elettronica B2B (Manuale SDI)</span>
          </div>

          <div>
            <h3 className="text-xl font-black text-white">
              Procedura di Conguaglio e Trasmissione SDI di Fine Mese
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              La Master Console SuperAdmin calcola esattamente le spettanze maturate. L&apos;amministratore consulterà il prospetto riassuntivo qui sopra (o scaricherà il CSV) ed emetterà manualmente le fatture elettroniche B2B nel proprio gestionale contabile (Fatture in Cloud, Aruba, TeamSystem, ecc.).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs pt-2">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="font-bold text-follo-blue-light block">1. Canone Mensile SaaS</span>
              <p className="text-slate-300">€29,00 + IVA 22% (unificato per piani SMART e PRO).</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="font-bold text-follo-blue-light block">2. Commissioni Ordini (8%)</span>
              <p className="text-slate-300">8% calcolato sul transato cibo netto di ciascun ristorante.</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="font-bold text-follo-blue-light block">3. Fee Coperti & Broadcast</span>
              <p className="text-slate-300">€0,50 a persona per i coperti 2° turno + €19/€59 per notifiche inviate.</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="font-bold text-follo-blue-light block">4. Conguaglio Contanti</span>
              <p className="text-slate-300">Trattenuto in contanti dal locale compensato a saldo su fattura.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Onboarding Nuovo Esercente                                       */}
      {/* ========================================================================= */}
      {isAddMerchantOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-follo-blue" />
                <h3 className="font-black text-slate-900 text-lg">Onboarding Nuovo Esercente</h3>
              </div>
              <button
                onClick={() => setIsAddMerchantOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMerchant} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nome Esercizio Commerciale *</label>
                <input
                  type="text"
                  required
                  placeholder="Es. Ristorante Il Veliero"
                  value={merchantForm.name}
                  onChange={e => setMerchantForm({ ...merchantForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-follo-blue text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoria Menù</label>
                  <input
                    type="text"
                    required
                    placeholder="Es. Pizzeria, Pesce Fresco..."
                    value={merchantForm.category}
                    onChange={e => setMerchantForm({ ...merchantForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-follo-blue"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Telefono Locale *</label>
                  <input
                    type="text"
                    required
                    placeholder="+39 0566 000000"
                    value={merchantForm.phone}
                    onChange={e => setMerchantForm({ ...merchantForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-follo-blue"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Indirizzo a Follonica</label>
                <input
                  type="text"
                  required
                  placeholder="Es. Viale Italia 85, 58022 Follonica (GR)"
                  value={merchantForm.address}
                  onChange={e => setMerchantForm({ ...merchantForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-follo-blue"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Livello di Accreditamento Iniziale</label>
                <select
                  value={merchantForm.tier}
                  onChange={e => setMerchantForm({ ...merchantForm, tier: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-follo-blue font-semibold bg-white"
                >
                  <option value="SPOTLIGHT">🥇 Livello 1: Spotlight Gold (Top Ranking + Ordini In-App)</option>
                  <option value="PARTNER">🥈 Livello 2: Partner Accreditato (Ordini In-App + Sunmi V2s)</option>
                  <option value="DIRECTORY">🥉 Livello 3: Directory Comunale (Solo Telefono - Gratuito)</option>
                </select>
              </div>

              {merchantForm.tier !== 'DIRECTORY' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Matricola Seriale Terminale Sunmi V2s (Opzionale)
                  </label>
                  <input
                    type="text"
                    placeholder="Es. SNM-V2S-FOLLO-004"
                    value={merchantForm.device_id}
                    onChange={e => setMerchantForm({ ...merchantForm, device_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-follo-blue font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Verrà creato un record nel Registro Hardware con cauzione €150,00 VINCOLATA (HELD).
                  </p>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Opzioni Alimentari Garantite</label>
                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={merchantForm.has_gluten_free}
                      onChange={e => setMerchantForm({ ...merchantForm, has_gluten_free: e.target.checked })}
                      className="rounded text-follo-blue focus:ring-follo-blue"
                    />
                    <span>🌾 Senza Glutine</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={merchantForm.has_vegan}
                      onChange={e => setMerchantForm({ ...merchantForm, has_vegan: e.target.checked })}
                      className="rounded text-follo-blue focus:ring-follo-blue"
                    />
                    <span>🌱 Vegano</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={merchantForm.has_lactose_free}
                      onChange={e => setMerchantForm({ ...merchantForm, has_lactose_free: e.target.checked })}
                      className="rounded text-follo-blue focus:ring-follo-blue"
                    />
                    <span>🥛 Senza Lattosio</span>
                  </label>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Quota Onboarding Setup:</span>
                  <span className="font-bold text-slate-900">€ 199,00 + IVA</span>
                </div>
                <div className="flex justify-between">
                  <span>Canone Mensile SaaS:</span>
                  <span className="font-bold text-slate-900">€ 29,00 / mese</span>
                </div>
                <div className="flex justify-between">
                  <span>Commissione Cibo FolloEat:</span>
                  <span className="font-bold text-slate-900">8% (Zero Escrow)</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMerchantOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-follo-blue hover:bg-follo-blue-dark text-white font-bold transition-colors shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvataggio...' : 'Conferma ed Accredita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Aggiungi Piatto al Menù                                          */}
      {/* ========================================================================= */}
      {isAddDishOpen && selectedMerchantForDish && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-follo-blue uppercase">Nuovo Piatto</span>
                <h3 className="font-black text-slate-900 text-base">{selectedMerchantForDish.name}</h3>
              </div>
              <button
                onClick={() => setIsAddDishOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDish} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nome Piatto *</label>
                <input
                  type="text"
                  required
                  placeholder="Es. Spaghetto allo Scoglio Follonichese"
                  value={dishForm.name}
                  onChange={e => setDishForm({ ...dishForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-follo-blue text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoria</label>
                  <input
                    type="text"
                    required
                    placeholder="Primi, Secondi, Pizze..."
                    value={dishForm.category}
                    onChange={e => setDishForm({ ...dishForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-follo-blue"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prezzo (€) *</label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    value={dishForm.price}
                    onChange={e => setDishForm({ ...dishForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-follo-blue font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descrizione / Ingredienti</label>
                <textarea
                  rows={2}
                  placeholder="Descrivi ingredienti a km0 e cottura..."
                  value={dishForm.description}
                  onChange={e => setDishForm({ ...dishForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-follo-blue"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={dishForm.is_alcohol}
                  onChange={e => setDishForm({ ...dishForm, is_alcohol: e.target.checked })}
                  className="rounded text-follo-red focus:ring-follo-red"
                />
                <span className="text-slate-800 font-bold">Contiene Alcolici (Stampa Obbligo Controllo 18+)</span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDishOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-follo-blue hover:bg-follo-blue-dark text-white font-bold transition-colors shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvataggio...' : 'Aggiungi al Menù'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Programma Notifica Broadcast Sponsorizzata                       */}
      {/* ========================================================================= */}
      {isAddBroadcastOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-follo-red" />
                <h3 className="font-black text-slate-900 text-base">Nuova Notifica Push Sponsorizzata</h3>
              </div>
              <button
                onClick={() => setIsAddBroadcastOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBroadcast} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Locale Promotore *</label>
                <select
                  value={broadcastForm.merchant_id}
                  onChange={e => setBroadcastForm({ ...broadcastForm, merchant_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-follo-red font-semibold bg-white"
                >
                  <option value="">Seleziona locale...</option>
                  {merchants.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Titolo Notifica (Breve & Accattivante) *</label>
                <input
                  type="text"
                  required
                  placeholder="Es. Serata Frittura & Tramonto al Mare"
                  value={broadcastForm.title}
                  onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-follo-red font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Testo del Messaggio (Max 120 caratteri) *</label>
                <textarea
                  rows={2}
                  maxLength={120}
                  required
                  placeholder="Es. Stasera frittura di paranza e birra artigianale con sconto 10% per ordini entro le 20:30!"
                  value={broadcastForm.body}
                  onChange={e => setBroadcastForm({ ...broadcastForm, body: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-follo-red"
                />
                <span className="text-[10px] text-slate-400 block text-right">{broadcastForm.body.length}/120</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Zona Destinatari</label>
                  <select
                    value={broadcastForm.target_zone}
                    onChange={e => setBroadcastForm({ ...broadcastForm, target_zone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-follo-red bg-white"
                  >
                    <option value="ALL">Tutta Follonica</option>
                    <option value="Pratoranieri">Pratoranieri</option>
                    <option value="Senzuno">Senzuno</option>
                    <option value="Centro">Centro</option>
                    <option value="Spiaggia">Sotto l&apos;Ombrellone</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tariffa Applicata (€)</label>
                  <select
                    value={broadcastForm.price_charged}
                    onChange={e => setBroadcastForm({ ...broadcastForm, price_charged: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-follo-red font-bold bg-white"
                  >
                    <option value="19.00">€ 19,00 (Invio Singolo)</option>
                    <option value="14.75">€ 14,75 (Quota Bundle 4x)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBroadcastOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-follo-red hover:bg-follo-red-dark text-white font-bold transition-colors shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Invio...' : 'Conferma Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
