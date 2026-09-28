'use client';

import React from 'react';
import Link from 'next/link';
import Logo from './Logo';
import {
  ShieldCheck,
  MapPin,
  UtensilsCrossed,
  Printer,
  Compass,
  HeartHandshake,
  CheckCircle2,
  FileText,
  CreditCard,
  Building2,
  PhoneCall
} from 'lucide-react';
import { FOLLONICA_ZONES, FOLLONICA_BEACH_CLUBS } from '@/lib/types';

export default function Footer() {
  return (
    <footer className="bg-follo-slate text-white pt-14 pb-24 md:pb-12 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand & Territorial Mission */}
          <div className="space-y-4">
            <Logo className="text-3xl text-white" />
            <p className="text-slate-400 text-xs leading-relaxed">
              La piattaforma SaaS iperlocale etica per Follonica (GR) e il litorale maremmano. Tuteliamo i margini dei ristoratori locali con commissioni all&apos;8%, pagamenti diretti su conto merchant e consegna programmata anche sotto l&apos;ombrellone.
            </p>
            <div className="pt-2 flex flex-col gap-1.5 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> 8% Commissione Etica (vs 35% multinazionali)
              </span>
              <span className="flex items-center gap-1.5 text-follo-blue-light font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> €0.15 Contributo Digitale Follonichese
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terminale Sunmi V2s con allarme continuo
              </span>
            </div>
          </div>

          {/* Column 2: Quartieri & Spiagge Coperte */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-follo-coral" /> Zone & Stabilimenti Coperti
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              {FOLLONICA_ZONES.map(z => (
                <li key={z.id} className="flex items-center justify-between">
                  <span className="hover:text-white transition-colors cursor-pointer">{z.name}</span>
                  <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">58022</span>
                </li>
              ))}
              <li className="pt-2 border-t border-slate-800">
                <span className="text-follo-coral-light font-bold block mb-1">
                  10 Punti Ritiro Spiaggia Ufficiali:
                </span>
                <span className="text-[11px] text-slate-400 leading-tight block">
                  Bagno Florida, Cerboli, Aloha, Ausonia, Nettuno, La Pineta, Tartana, Il Sole, Eden Park, Golfo Beach.
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Portali & Strumenti */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Compass className="w-4 h-4 text-follo-blue-light" /> Accessi Rapidi
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-white flex items-center gap-2 transition-colors">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ordina Food & Beverage</span>
                </Link>
              </li>
              <li>
                <Link href="/merchant/pizzeria-da-michele" className="hover:text-white flex items-center gap-2 transition-colors">
                  <Printer className="w-3.5 h-3.5 text-follo-coral" />
                  <span>Terminale Sunmi V2s Esercente (Live)</span>
                </Link>
              </li>
              <li>
                <Link href="/order/ord-101" className="hover:text-white flex items-center gap-2 transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tracciamento Ordine Live (#ORD-101)</span>
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white flex items-center gap-2 transition-colors">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Superadmin Console & Fatturazione B2B</span>
                </Link>
              </li>
              <li>
                <a href="/api/seed" className="hover:text-white flex items-center gap-2 transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5 text-follo-blue" />
                  <span>Endpoint Auto-Migrazione & Healthcheck</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Trasparenza B2B & Prezzi */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" /> Modello Economico B2B
            </h3>
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between items-center">
                <span>Setup Una Tantum:</span>
                <span className="font-bold text-white">€199,00</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Canone Software SaaS:</span>
                <span className="font-bold text-white">€29,00 / mese</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Cauzione Sunmi V2s:</span>
                <span className="font-bold text-emerald-400">€150,00 (Resa a termine)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Commissione Transato:</span>
                <span className="font-bold text-follo-coral-light">8% fisso</span>
              </div>
              <div className="pt-2 border-t border-slate-700 text-[11px] text-slate-400">
                Opzione dilazionata in 3 rate: <br />
                <span className="font-bold text-white">1° mese: €249</span> | <span className="font-bold text-white">2° & 3° mese: €79</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full Legal Disclaimer & Exemption Clause */}
        <div className="pt-8 border-t border-slate-800 text-[11px] text-slate-400 space-y-3 leading-relaxed">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-follo-blue-light shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">Clausola Legale di Esonero Responsabilità (Piattaforma SaaS Tecnologica Pura):</strong>
              <p className="mt-1 text-slate-400">
                FolloEat opera esclusivamente quale fornitore di infrastruttura software e tecnologica per la ricezione telematica degli ordini e la prenotazione rapida dei tavoli. La logistica, il trasporto, il rispetto della catena del freddo e delle normative igienico-sanitarie HACCP, la conformità al Codice della Strada da parte del personale di consegna (rider terzi convenzionati o dipendenti diretti del ristoratore) e la copertura assicurativa INAIL ricadono interamente e sotto la diretta responsabilità dell&apos;esercente partner convenzionato. FolloEat non assume obblighi di custodia vettoriale né di datore di lavoro.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800 text-slate-500 text-[11px]">
            <span>
              © {new Date().getFullYear()} FolloEat. Piattaforma iperlocale Follonica (GR) - v4.1 Definitiva.
            </span>
            <div className="flex items-center gap-4">
              <span>Reg. UE 1169/2011 (14 Allergeni)</span>
              <span>•</span>
              <span>Stripe Connect Custom Auth & Capture</span>
              <span>•</span>
              <span>D1 Serverless SQL Ready</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
