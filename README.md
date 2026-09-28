# FolloEat v4.1 — Piattaforma Iperlocale Follonica (GR)

> **Piattaforma SaaS di Food Delivery, Asporto, Beach Delivery e Prenotazione Tavoli a Follonica (GR)**  
> Implementazione conforme al documento: *FolloEat — Master Specification & Istruzioni Tecnico-Operative (v4.1 Definitiva)*

[![Next.js 15](https://img.shields.io/badge/Next.js-15.1.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Cloudflare D1](https://img.shields.io/badge/Database-Cloudflare%20D1%20(SQLite)-orange?style=flat-square&logo=cloudflare)](https://developers.cloudflare.com/d1/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Sunmi V2s](https://img.shields.io/badge/Hardware-Sunmi%20V2s%2058mm-green?style=flat-square)](https://www.sunmi.com/)

---

## 📚 Documentazione Ufficiale & Manuali Operativi

| Documento | Destinatario | Descrizione |
|---|---|---|
| [**`master.md`**](file:///c:/Users/dz94/Desktop/folloeat/master.md) | Architettura & Business | Master Specification integrale v4.1 con tutti i 6 capitoli tecnici, fiscali e legali |
| [**`GUIDA_SUPERADMIN.md`**](file:///c:/Users/dz94/Desktop/folloeat/GUIDA_SUPERADMIN.md) | SuperAdmin / Gestore | Manuale operativo per onboarding, fatturazione elettronica manuale SDI (Aruba/Fatture in Cloud), gestione hardware Sunmi e broadcast sponsorizzati |
| [**`GUIDA_MERCHANT.md`**](file:///c:/Users/dz94/Desktop/folloeat/GUIDA_MERCHANT.md) | Esercente / Staff / Rider | Guida pratica per l'uso del terminale Sunmi V2s, allarme sonoro, gestione scontrini 58mm, PIN anti-frode e consegne all'ombrellone |

---

## 🌊 Missione & Parametri Economici v4.1

FolloEat tutela i margini degli esercenti locali di Follonica contro le commissioni del 25-35% delle multinazionali del delivery (Just Eat, Deliveroo, Glovo), offrendo commissioni etiche all'**8%**, incassi diretti su conto merchant e un'applicazione territoriale ad alte prestazioni:

- **Setup Iniziale Una Tantum**: **€ 199,00 + IVA** (onboarding, digitalizzazione menu, inserimento 14 allergeni UE Reg. 1169/2011, sessione di formazione e kit vetrofanie).
- **Canone Software SaaS**: **€ 29,00 / mese + IVA** (unificato per tutti i locali partner).
- **Deposito Cauzionale Terminale Sunmi V2s**: **€ 150,00** deposito infruttifero vincolato ex art. 15 D.P.R. 633/72, rimborsabile al 100% alla cessazione contrattuale o riscattabile a saldo (opzione dilazione in 3 rate mensili da € 50,00).
- **Starter Kit Consumabili**: 3 rotoli termici da 58mm inclusi alla consegna del terminale.
- **Commissione Cibo**: **8%** sul netto delle pietanze vendute online.
- **Digital Platform Fee Cliente**: **€ 0,15** a transazione addebitata direttamente all'utente al checkout (*"Contributo Digitale & Ristorazione Follonichese"*). Costo per il locale: € 0,00.
- **Fast Seating / Radar Tavoli**: **€ 0,50** a coperto confermato per il 2° turno serale (post-21:30) o pranzo. Tavolo riservato per 15 minuti.
- **Notifiche Broadcast Sponsorizzate**: **€ 19,00** invio singolo / **€ 59,00** bundle 4 invii al mese (max 1 notifica globale al giorno su tutta la piattaforma per rispetto anti-spam).
- **Incasso Diretto (Zero Escrow)**: I fondi dei pagamenti con carta vanno direttamente sul conto Stripe Connect dell'esercente. FolloEat non trattiene i soldi del cibo.
- **5-Minute Pre-Auth Hold**: Blocco preventivo del plafond sulla carta del cliente; addebito effettivo solo se il locale accetta l'ordine entro 5 minuti, altrimenti svincolo automatico a costo zero (Void).
- **Connettività & Manleva Legale**: SIM 4G o Wi-Fi 2.4 GHz a carico dell'esercente. FolloEat è puro fornitore di infrastruttura digitale SaaS con **manleva totale al 100%** per logistica, rider, infortuni INAIL, codice della strada e rispetto della catena termica e normative sanitarie HACCP.

---

## 🏛️ Gerarchia a 3 Livelli del Marketplace

Per mappare l'intero tessuto gastronomico di Follonica senza penalizzare gli abbonati, la piattaforma organizza i locali in tre livelli:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🥇 LIVELLO 1: SPOTLIGHT GOLD                                            │
│ Top ranking garantito, badge dorato, glow dorato, Pin Oro con Corona    │
│ Ordinazione in-app delivery/asporto + Prenotazione Tavoli               │
├─────────────────────────────────────────────────────────────────────────┤
│ 🥈 LIVELLO 2: PARTNER ACCREDITATO                                       │
│ Termometro ordini, carrello in-app, ricezione su Sunmi V2s, Pin Blu     │
│ Gestione ordini delivery/asporto + Fast Seating tavoli                  │
├─────────────────────────────────────────────────────────────────────────┤
│ 🥉 LIVELLO 3: DIRECTORY COMUNALE (NON ACCREDITATO)                      │
│ Censimento di pubblica utilità delle attività di Follonica, Pin Grigio  │
│ Nessun carrello in-app, solo tasto "Chiama il Locale" (tel:+39...)      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🏖️ Dinamiche Iperlocali Follonica

1. **Beach Delivery ("Sotto l'Ombrellone")**:
   - Mappatura geolocalizzata dei principali stabilimenti e spiagge del Golfo: Bagno Florida, Bagno Balena, Pratoranieri, Senzuno, Centro, Spiagge Libere.
   - Campo obbligatorio *"Numero Ombrellone / Fila"* e punto di incontro pedonale sul lungomare.
2. **PIN di Sicurezza a 4 Cifre**:
   - Codice numerico generato per ogni consegna delivery.
   - Visualizzato dal cliente e stampato sullo scontrino Sunmi del locale.
   - Il rider deve richiedere il codice al cliente prima di consegnare la busta.
3. **Avviso Obbligatorio Alcolici 18+**:
   - Flag automatico `has_alcohol` se l'ordine contiene bevande alcoliche.
   - Scontrino Sunmi con avviso obbligo controllo documento d'identità ex Legge 125/2001.
4. **Filtri Dietetici Iperlocali**:
   - Filtro rapido a pillole sulla Homepage: `Tutti`, `🌾 Senza Glutine`, `🌱 Vegano`, `🥛 Senza Lattosio`.
5. **Transazione Mono-Merchant & Carrello Protetto**:
   - Ogni carrello è rigorosamente vincolato a un singolo ristorante (a tutela dell'incasso diretto Stripe Connect). Se l'utente tenta di aggiungere piatti di un altro locale, compare un modal di conferma per svuotare il carrello precedente.
6. **"Il Mio Solito" (Re-Order in 1 Tap)**:
   - Memorizzazione in `localStorage` dell'ultimo ordine effettuato per riordinarlo istantaneamente con un click.

---

## 🛠️ Stack Tecnologico

- **Framework**: Next.js 15.1.4 (App Router, React 19, TypeScript).
- **Stile**: Tailwind CSS personalizzato con palette ufficiale FolloEat (`follo-blue`, `follo-red`, `follo-slate`, `follo-sand`).
- **Mappe**: Leaflet & OpenStreetMap con layer personalizzato e pin colorati per i 3 livelli.
- **Database & Storage**: Cloudflare D1 (SQLite distribuito) con migrazione automatica e fallback isomorfico edge.
- **Panic System & Cache**: Cloudflare KV per Snooze ordini (30 min) e ritardo cucina (+20/+30 min).
- **Allarme Hardware**: Web Audio API oscillator loop continuo ad alto volume per il terminale Sunmi.
- **Stampa Ricevute**: Formattatore 32 colonne ESC/POS ottimizzato per rotoli termici 58mm.

---

## 🚀 Avvio Rapido & Sviluppo Locale

### 1. Installazione Dipendenze
```bash
npm install
```

### 2. Avvio Server di Sviluppo
```bash
npm run dev
```
Apri il browser su [http://localhost:3000](http://localhost:3000).

### 3. Build di Produzione & Typecheck
```bash
npm run build
```

---

## 📍 Mappatura Rotte

### 🛍️ Client & Customer Experience
- `/`: Homepage con selettore quartiere (Centro, Senzuno, Pratoranieri, Sotto l'Ombrellone), visualizzazione Mappa Leaflet interattiva a 3 livelli, filtri dietetici, lista locali con badge Spotlight e carrello.
- `/order/[id]`: Schermata di tracking in tempo reale con **PIN a 4 cifre**, barra di avanzamento (`PENDING` -> `ACCEPTED` -> `DELIVERING` -> `COMPLETED`), punti fedeltà FolloPoints e pulsanti recensione rapida (+10 punti).
- `/api/places/follonica`: Discovery engine con bounding box su Follonica (lat 42.9100 a 42.9450, lng 10.7300 a 10.7850) e cross-reference D1.
- `/api/orders`: Endpoint creazione comande, gestione pre-autorizzazioni Stripe, contanti con resto esatto e codice PIN.
- `/api/reservations`: Fast Seating prenotazione tavoli 2° turno post-21:30 (€0,50 a coperto).

### 🖨️ Terminale Esercente Sunmi V2s
- `/merchant/[slug]`:
  - `pizzeria-da-michele`: Pizzeria Da Michele & Figli (Livello 1 - Spotlight Gold)
  - `da-poldo`: Da Poldo Food & Love (Livello 2 - Partner Accreditato)
  - `bagno-florida`: Bagno Florida Ristorante sul Mare (Livello 2 - Beach Delivery)
  - *Funzionalità*: Allarme sonoro loop ad alto volume, accettazione con tempo stimato (+15/20/30m), pulsante "Affida al Rider", chiusura con PIN, stampa scontrino termico 58mm, Panic Button "Snooze 30 Minuti" e "Ritardo Cucina".

### 🛡️ Master Console SuperAdmin & Amministrazione
- `/admin`:
  - **KPI Finanziari**: Totale transato, volumi carta vs contanti, commissioni FolloEat 8%, platform fee €0,15, fee tavoli €0,50, canoni SaaS €29/mese.
  - **Registro Hardware Sunmi V2s**: Matricole seriali, assegnazione locali, stato depositi cauzionali (€150,00: `HELD`, `REFUNDED`, `REDEEMED`).
  - **Notifiche Push Sponsorizzate**: Tabella broadcast programmati ed eseguiti (€19,00 singolo / €59,00 bundle).
  - **Prospetto Fiscale B2B & SDI**: Calcolo esatto per conguaglio mensile e diciture obbligatorie per emissione fattura elettronica su Aruba, Fatture in Cloud, TeamSystem.
  - **Ripristino Dati Seed**: Tasto per re-inizializzare istantaneamente il database locale con i dati autentici di Follonica.
