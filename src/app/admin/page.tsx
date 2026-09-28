'use client';

export const runtime = 'edge';

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
  AlertCircle
} from 'lucide-react';
import { HardwareDevice, DepositStatus } from '@/lib/types';

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
  const [hardware, setHardware] = useState<HardwareDevice[]>([]);
  const [statements, setStatements] = useState<MerchantStatement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin');
      const data = await res.json();
      if (data.success) {
        setKpis(data.kpis);
        setHardware(data.hardware_devices || []);
        setStatements(data.merchant_statements || []);
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
              <span className="text-xs text-slate-500 font-semibold">FolloEat v4.1 Enterprise</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Fatturazione B2B & Registro Hardware Sunmi
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetSeed}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Ripristina Dati Seed</span>
          </button>

          <a
            href="/api/admin?format=csv"
            className="px-4 py-2 rounded-xl bg-follo-blue hover:bg-follo-blue-dark text-white text-xs font-bold shadow-md flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Esporta CSV Fatturazione</span>
          </a>
        </div>
      </div>

      {feedbackMsg && (
        <div className="max-w-7xl mx-auto mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="max-w-7xl mx-auto mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* KPI 1: Transacted */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Volume Transato
          </span>
          <div className="text-xl font-black text-slate-900">
            €{kpis?.total_transacted.toFixed(2) || '0.00'}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">
            {kpis?.orders_count || 0} ordini completati
          </span>
        </div>

        {/* KPI 2: Carta vs Contanti */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Carta vs Contanti
          </span>
          <div className="text-xs font-black text-slate-800 space-y-0.5">
            <div className="text-follo-blue">Carta: €{kpis?.card_volume.toFixed(2) || '0.00'}</div>
            <div className="text-amber-600">Contanti: €{kpis?.cash_volume.toFixed(2) || '0.00'}</div>
          </div>
        </div>

        {/* KPI 3: Commissioni FolloEat 8% */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-follo-blue uppercase tracking-wider block">
            Commissioni 8%
          </span>
          <div className="text-xl font-black text-follo-blue">
            €{kpis?.folloeat_commissions_8pct.toFixed(2) || '0.00'}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">
            Netto venduto food
          </span>
        </div>

        {/* KPI 4: Platform Fee €0.15 */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Platform Fee (€0,15)
          </span>
          <div className="text-xl font-black text-slate-900">
            €{kpis?.platform_fee_015.toFixed(2) || '0.00'}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">
            Carico 100% cliente
          </span>
        </div>

        {/* KPI 5: Radar Tavoli Fee */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-follo-sand uppercase tracking-wider block">
            Fee Tavoli (€0,50)
          </span>
          <div className="text-xl font-black text-follo-sand">
            €{kpis?.table_fees_050.toFixed(2) || '0.00'}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">
            {kpis?.confirmed_seats || 0} coperti 2° turno
          </span>
        </div>

        {/* KPI 6: Margine Totale FolloEat */}
        <div className="p-4 bg-slate-900 text-white rounded-3xl shadow-md space-y-1">
          <span className="text-[11px] font-bold text-follo-sand uppercase tracking-wider block">
            Ricavi Piattaforma
          </span>
          <div className="text-xl font-black text-emerald-400">
            €{kpis?.total_platform_revenue.toFixed(2) || '0.00'}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">
            Canoni + Comm. + Fee
          </span>
        </div>
      </div>

      {/* Main Content: Prospetto B2B & Registro Hardware */}
      <div className="max-w-7xl mx-auto mt-8 space-y-8">
        {/* Table 1: Prospetto Analitico Mensile B2B */}
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

        {/* Table 2: Registro Hardware Sunmi V2s */}
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
      </div>
    </div>
  );
}
