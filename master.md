# FolloEat — Master Specification & Istruzioni Tecnico-Operative (v4.1 Definitiva)

**Single Source of Truth (SSOT) & Briefing Master per lo Sviluppo Software**  
**Destinato a**: Project Antigravity, Next.js / TypeScript Engineers  
**Target Stack**: Cloudflare Workers / Pages (TypeScript) + Cloudflare D1 (SQLite) + Cloudflare KV + Next.js 15 (App Router, Tailwind CSS, Lucide Icons, Leaflet / OpenStreetMap).

---

## 1. Visione di Business & Modello Economico Etico

FolloEat è l'ecosistema SaaS iperlocale ad alta sostenibilità economica per ristoranti, pizzerie, pub, gastronomie e stabilimenti balneari di Follonica (GR) e fascia costiera limitrofa. Nasce per tutelare i margini degli esercenti locali contro le commissioni del 25-35% dei colossi stranieri (Just Eat, Deliveroo, Glovo), offrendo a residenti, giovani e turisti un'app veloce, trasparente e radicata sul territorio.

### 1.1. Filosofia Economica: "Ristoratore al Centro"

- **Margini Protetti**: Commissione equa all'**8%** (o 7% su volumi garantiti), consentendo al locale di trattenere il 92-93% dell'incasso netto sui piatti.
- **Zero Escrow & Flusso Diretto (Stripe Connect)**: Gli incassi con carta finiscono istantaneamente sul conto merchant dell'esercente (o contanti/POS alla consegna). FolloEat non fa da cassa di transito (zero oneri PSD2) e fattura canone e commissioni a fine mese con addebito automatico (Stripe Billing / SEPA SDD).
- **Vincolo Mono-Merchant per Singola Transazione**: Poiché ogni ristorante dispone del proprio conto merchant dedicato (Stripe Connect Diretto) e la pre-autorizzazione fondi (Auth & Capture) dialoga direttamente con la cassa del singolo locale senza passare da conti di transito o escrow di FolloEat, ogni singolo checkout/transazione è strettamente vincolato a un **UNICO ristorante alla volta**.
- **Digital Platform Fee Etica (€0,15)**: Micro-fee trasparente di €0,15 addebitata direttamente al cliente finale al checkout (*"Contributo Digitale & Ristorazione Follonichese"*). Costo per il ristoratore: €0,00. Ricavo FolloEat: Su 6.000 ordini/mese genera €900,00 netti/mese di cassa pulita e ricorrente.
- **Pagamenti in Contanti alla Consegna (Cash on Delivery)**: I clienti possono pagare in contanti al rider. L'esercente incassa il 100% dell'importo; FolloEat registra la transazione (`payment_method = 'CASH'`) e addebita la commissione dell'8% e la platform fee di €0,15 nel conguaglio/addebito di fine mese.

### 1.2. Gerarchia di Visibilità & Livelli Esercente

- **Livello 1 - SPONSORIZZATI (Spotlight Premium a €49/mese o Broadcast attivo)**: Posizionamento prioritario in cima alla lista e sulla mappa con badge dorato 'Sponsorizzato', cornice evidenziata e pin mappa maggiorato/dorato.
- **Livello 2 - ACCREDITATI / PARTNER FOLLOEAT (Piano SMART o PRO)**: Visibili nella sezione 'Consigliati da FolloEat'. Scheda interattiva completa con ordinazione digitale istantanea, prenotazione tavolo Fast Seating, menu completo con allergeni e opzioni alimentari (Gluten Free, Vegano, Vegetariano, Senza Lattosio), tracking ordine, coupon FOLLO5 e accumulo FolloPoints.
- **Livello 3 - NON ACCREDITATI / DIRECTORY DIRETTA**: Inseriti a titolo informativo senza ordini o prenotazioni in-app. La scheda mostra unicamente informazioni base (Nome, Indirizzo/Mappa e Pulsante Chiamata Telefonica diretta).

---

## 2. Nuova Struttura Economica & Condizioni Contrattuali (v4.1)

Nella versione 4.1 il modello di pricing è stato semplificato e unificato per azzerare le barriere d'ingresso dei ristoratori:

| Parametro Contrattuale | PIANO PRO (Terminale Sunmi in Comodato d'Uso) | PIANO SMART (BYOD - Dispositivo Proprio) |
| --- | --- | --- |
| **Costo Setup Una Tantum** | €199,00 | €199,00 |
| **Deposito Cauzionale Hardware** | €150,00 rimborsabile (Cauzione Sunmi V2s) | €0,00 |
| **Hardware Fornito** | Terminale Android Sunmi touch con stampante comande 58mm integrata in comodato d'uso (con clausola di riscatto) | Nessuno (si usa tablet/iPad, smartphone o PC cassa già presente) |
| **Setup Software & Menu** | Caricamento menu, varianti, allergeni, test comande e kit vetrofanie | Configurazione account, caricamento menu, ottimizzazione PWA e kit vetrofanie |
| **Canone Software Mensile** | €29,00 / mese | €29,00 / mese |
| **Commissione Ordine** | 8% (o 7%) sul netto cibo | 8% (o 7%) sul netto cibo |
| **Digital Platform Fee (Cliente)** | €0,15 a transazione (incassati da FolloEat) | €0,15 a transazione (incassati da FolloEat) |
| **Prenotazione Tavoli (Fast Seating)**| €0,50 a coperto / prenotazione confermata (2° turno post-21:30) | €0,50 a coperto / prenotazione confermata (2° turno post-21:30) |
| **Eco-Packaging Fee (Opzionale)** | €0,25 a ordine per materiali ecologici | €0,25 a ordine per materiali ecologici |
| **Notifiche Push Sponsorizzate (Broadcast)** | €19,00 invio singolo / €59,00 bundle (4 invii/mese). Max 1 push/giorno globale platform-wide anti-spam. | €19,00 invio singolo / €59,00 bundle (4 invii/mese). Max 1 push/giorno globale platform-wide anti-spam. |
| **Ricezione Comande** | Allarme loop ad alto volume + Stampa automatica su carta termica 58mm | Dashboard Web/PWA con Web Audio API continuo fino ad accettazione |

### 2.1. Clausola Cauzione & Riscatto Hardware Sunmi

- **Natura del Deposito Infruttifero**: Il deposito cauzionale di €150,00 ha natura di deposito cauzionale infruttifero, esente da qualsiasi maturazione di interessi legali o di altra natura per tutta la durata del contratto. Viene versato alla consegna del Sunmi V2s collaudato, che include uno starter kit iniziale di collaudo con 1 rotolino già inserito + 2 rotolini di scorta (totale 3 rotoli); il successivo approvvigionamento ordinario dei rotoli termici 58 mm è a cura e spese esclusive del comodatario.
- **Durata del Vincolo & Restituzione**: Il deposito cauzionale non viene restituito dopo un anno o su base periodica, ma rimane vincolato a garanzia dell'hardware per l'intera durata del rapporto contrattuale. Verrà restituito al 100% unicamente ed esclusivamente alla cessazione definitiva del contratto (per disdetta o recesso), previa verifica dell'integrità e del perfetto funzionamento del terminale Sunmi V2s, inclusi caricabatterie e accessori.
- **Opzione di Riscatto Proprietario**: In alternativa alla restituzione, in qualsiasi momento o a fine accordo, l'esercente può scegliere di convertire integralmente i €150,00 di cauzione a saldo definitivo per l'acquisto e il riscatto di proprietà dell'hardware, continuando successivamente a corrispondere unicamente il canone SaaS ordinario di €29,00/mese.
- **Opzione Pagamento Dilazionato della Cauzione (Rateizzazione in 3 Mesi)**: A discrezione commerciale, la cauzione di €150,00 può essere versata in 3 quote mensili da €50,00:
  - Mese 1 (Attivazione): €199,00 setup + €50,00 prima quota cauzione = €249,00.
  - Mese 2: €29,00 canone + €50,00 seconda quota cauzione.
  - Mese 3: €29,00 canone + €50,00 saldo finale cauzione (totale €150,00 coperti).
  - Dal Mese 4 in poi: Solo canone ordinario €29,00/mese.

### 2.2. Connettività Hardware & Responsabilità Legale/HACCP

- **Connettività Hardware**: L'onere della connettività Internet (Wi-Fi stabile 2.4 GHz) è a carico esclusivo dell'esercente. FolloEat non fornisce né supporta schede SIM M2M.
- **Responsabilità Legale, Logistica e HACCP**: Clausola blindata di pura fornitura SaaS. FolloEat agisce esclusivamente come fornitore tecnologico indipendente. La gestione e il rapporto di lavoro con i fattorini/rider, la sicurezza sul lavoro (INAIL), la copertura assicurativa RC verso terzi, il rispetto del codice della strada e tutti gli adempimenti igienico-sanitari e HACCP (mantenimento catena del freddo/caldo nel trasporto alimenti) sono a carico e responsabilità civile e penale al 100% dell'esercente.

### 2.3. Algoritmo di Visibilità & Ordinamento Piattaforma

- **Ordinamento Multilivello**: L'algoritmo organizza i locali per garantire massima priorità agli esercenti con Spotlight o Broadcast attivo (**Livello 1**), seguiti dai locali accreditati Partner FolloEat con schede interattive per ordini e prenotazioni (**Livello 2**), e infine la directory informativa dei locali non accreditati con sola chiamata telefonica diretta (**Livello 3**).

---

## 3. Brand Identity Ufficiale & UI System

- **Logotipo**: `folloeat.` (tutto minuscolo, kerning compatto a -6px, punto terminale integrato).
- **Colori Istituzionali di Follonica & Territorio Maremmano**:
  - **Blu Mare Golfo**: `#0284C7` (gradiente `#0369A1`) — Colore primario del mare di Follonica (`follo-blue`).
  - **Rosso Maremmano**: `#EF4444` (gradiente `#DC2626`) — Ispirato ai colori storici della Maremma / Grifone; impiegato per `eat.`, pulsanti d'azione (CTA) e allerte sonore (`follo-red`).
  - **Dark Slate**: `#0F172A` — Per testi, icone e sfondi squircle (`follo-slate`).
  - **Sabbia Dorata / Oro**: `#F59E0B` — Per rating, badge e locali Spotlight (`follo-sand`).
  - **Bianco Puro / Neutri**: `#FFFFFF` / `#F8FAFC` (`follo-bg`).

---

## 4. Esperienza Utente (UX/UI) & Dinamiche Iperlocali Follonica

- **Guest Flow a Frizione Zero**: Ordine e prenotazione completabili in 30 secondi con soli Nome e Cellulare (per tracking e PIN di consegna a 4 cifre).
- **Registrazione Facoltativa & Vantaggi**:
  - **Coupon FOLLO5 (-5%)**: Sconto 5% sul carrello al primo ordine, assorbito al 100% da FolloEat mediante decurtazione della propria commissione. Protetto da impronta hardware univoca (`device_fingerprint`).
  - **FolloPoints**: 1 punto ogni 1 € speso per sbloccare voucher sconto (es. 100 punti = €2 di sconto).
  - **Re-order "Il Mio Solito" a 1-Tap**: Riordino istantaneo dei piatti frequenti direttamente dall'home screen.
- **Dock Navigation & Geolocalizzazione a Doppio Raggio**:
  - Dock bar inferiore: `[Home]` - `[Cerca]` - `[Ordina]` (accesso rapido catalogo piatti) - `[Tavoli / Radar]` - `[Profilo]`.
  - **Consegna Urbana per Quartieri**: Centro Storico / Via Roma, Senzuno, Pratoranieri, Cassarello, San Luigi, Campi Alti, Zona 167.
  - **Consegna "Sotto l'Ombrellone" & Pick-up Point**: Stabilimenti balneari (Ausonia, Cerboli, Florida, Nettuno, Africa, Tartana con n° ombrellone) o spiagge libere con landmark ufficiali (La Colonia, Tony's, Foce Pecora, Dune) con coordinate GPS per il rider. Negli stabilimenti balneari e spiagge libere, oltre all'indicazione dell'ombrellone o coordinate GPS, l'app predispone punti di incontro designati / Pick-up Point ufficiali all'ingresso dello stabilimento/reception/chiosco per evitare blocchi o divieti d'accesso ai rider.
  - **Slot Limiter Pomeridiano**: Prenotazione programmata dal mare con scaglioni di 15 min per saturazione comande.
- **Carrello di Gruppo & Split Conto**: Link WhatsApp condivisibile con calcolo automatico quota alla romana.
- **Flusso Pagamenti Auth & Capture (Stripe)**: Al momento del checkout l'importo viene pre-autorizzato (hold dei fondi). La cattura dell'importo scatta unicamente all'accettazione della comanda da parte del ristoratore. Se l'ordine viene rifiutato o non accettato entro il timeout di 5 minuti, l'hold decade automaticamente senza commissioni di transazione né oneri di rimborso per FolloEat o l'esercente.
- **Esperienza Multi-Ordine Multi-Ristorante Fluida**: L'utente può ordinare da più ristoranti diversi nella stessa sessione d'uso dell'app (es. pizze da una pizzeria e dessert da una gelateria), ma il sistema gestisce i carrelli come transazioni separate e sequenziali. L'utente completa e pre-autorizza la prima transazione per il ristorante A, dopodiché può procedere a confermare e pre-autorizzare la seconda transazione per il ristorante B, mantenendo flussi finanziari, tempi di preparazione, ricevute e rider del tutto indipendenti e puliti.
- **Pulsante 'Panico / Siamo Pieni' (Snooze Comande)**: Controllo real-time accessibile da Sunmi e PWA per bloccare nuove comande per 30/60 minuti o incrementare il tempo di attesa stimato (+20/+30 min), con propagazione istantanea via Cloudflare KV.
- **Disclaimer Note Aggiuntive**: Indicazione vincolante al checkout secondo cui richieste di modifiche o ingredienti extra inseriti a mano nelle note non saranno vincolanti e potranno comportare addebito extra alla consegna.
- **SMS di Backup / Fallback Emergenza**: Se un ordine non viene accettato a schermo entro 3 minuti, invio automatico di SMS transazionale al titolare del locale per segnalare la comanda pendente.
- **Gestione Contanti alla Consegna**: In caso di pagamento in contanti al rider, l'esercente trattiene l'intero importo. Le spettanze FolloEat (8% + €0,15) vengono contabilizzate nel saldo debitorio del locale e saldate tramite l'addebito automatico di fine mese.
- **Minimo d'Ordine & Spese di Consegna Personalizzabili**: Ogni esercente può definire autonomamente un minimo d'ordine e tariffe di consegna differenziate per quartiere/zona, trattenendone il 100% dell'incasso.
- **Mancata Consegna / Cliente Irreperibile**: Gestione con timer di 5 minuti e tracciamento dei tentativi di chiamata. Scaduto il tempo, l'ordine viene annullato con addebito confermato per i pagamenti con carta (Auth & Capture) a tutela del cibo e del ristoratore.
- **Sistema di Recensioni & Valutazioni Automatiche Post-Esperienza**:
  - **Timing Invio Notifiche**: Notifica push o SMS/WhatsApp automatizzato inviato 30-45 minuti dopo la consegna dell'ordine (delivery/asporto) oppure 90-120 minuti dopo l'orario di prenotazione tavolo.
  - **Rating a Frizione Zero (1-Tap)**: Valutazione rapida su scala 1-5 stelle con badge selezionabili (es. 'Cibo caldo', 'Puntualità', 'Servizio al tavolo') e campo commento opzionale.
  - **Gamification & Reward**: Accredito immediato di +10 FolloPoints all'utente al completamento della recensione.
- **Anti No-Show Tavoli**: Invio automatico di un messaggio WhatsApp/SMS 2 ore prima dell'orario di prenotazione con link a 1 click per confermare o disdire. In caso di mancata conferma entro 45 min o disdetta, il tavolo viene riaperto istantaneamente sul Radar Tavoli Last-Minute.
- **Chiusura Ferie & Giorni di Riposo**: Modulo dedicato nel pannello esercente per impostare giorno di chiusura settimanale ricorrente e intervalli ferie/chiusura stagionale straordinaria (con blocco automatico del carrello e badge esplicito sull'app).
- **Gestione 14 Allergeni Obbligatori (Reg. UE 1169/2011)**: Configurazione obbligatoria a checklist dei 14 allergeni ufficiali su ogni pietanza, con badge grafici standardizzati ben visibili nel menu prima dell'aggiunta al carrello.
- **Tracking Consegna Semplificato a Costo Zero (Zero App Rider)**: Quando la cucina imposta lo stato su 'In consegna', il cliente visualizza una progress bar dinamica 'In arrivo (stima 10-15 min)' con pulsante diretto 'Contatta il locale', eliminando la necessità di app GPS invasive sui telefoni personali dei fattorini.
- **Eco-Opt-in Posate e Tovaglioli Monouso**: Checkbox nel carrello deselezionata di default ('Richiedi posate e tovaglioli monouso') in conformità con le direttive green contro lo spreco di plastica.
- **Gestione Alcolici & Divieto ai Minori (Check Età 18+)**: Flag `is_alcohol` sui prodotti alcolici che attiva un popup obbligatorio di conferma maggiore età al checkout e fa stampare in grassetto sulla comanda del rider *"Verificare documento d'identità"*.
- **Fasce Orarie Differenziate per Categoria**: Possibilità di associare a ogni categoria di piatti orari di disponibilità indipendenti (es. Cucina chiude alle 22:30, Pizzeria/Bar alle 00:00), evitando comande fuori orario per reparti chiusi.
- **Resto Esatto per Contanti alla Consegna**: Se l'utente seleziona 'Cash on Delivery', appare un campo obbligatorio per indicare il taglio della banconota con cui pagherà (es. 50€), stampato poi sulla comanda per permettere al rider di portare il resto esatto.
- **Soglia Massima Comande Contemporanee (Anti-Ingorgo)**: Limitatore di capienza per fascia oraria impostabile dall'esercente (es. max 6 ordini ogni slot di 15 minuti). A slot saturato, l'app disabilita l'orario e propone in automatico lo scaglione successivo.
- **Reputazione Locale Verificata**: Recensioni legate esclusivamente a ordini o prenotazioni effettivamente consumati per garantire zero recensioni fake.
- **Centro Notifiche Utente & Tabellone 'Offerte & News dai Locali'**: Icona campana nell'header con badge numerico delle notifiche non lette (Inbox in-app). Le notifiche broadcast e promozionali inviate dai locali rimangono consultabili come card promozionali interattive con link diretto al menù o alla prenotazione del tavolo.
- **Filtri Alimentari Avanzati in UI**: Integrazione di filtri rapidi d'interfaccia ('Senza Glutine / Gluten Free', 'Vegano / Vegetariano', 'Senza Lattosio') per evidenziare immediatamente i locali accreditati dotati di opzioni alimentari e preparazioni dedicate.

---

## 5. Schema D1 Database & Specifiche Tabelle Aggiornate (v4.1)

```sql
-- Tabella Esercenti con gestione Setup 199€, Canone 29€ e Cauzione 150€
CREATE TABLE IF NOT EXISTS merchants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan_type TEXT CHECK(plan_type IN ('SMART', 'PRO')) DEFAULT 'SMART',
  setup_fee_paid REAL DEFAULT 199.00,
  hardware_deposit REAL DEFAULT 0.00, -- 150.00 se piano PRO
  monthly_saas_fee REAL DEFAULT 29.00,
  commission_rate REAL DEFAULT 0.08,
  stripe_account_id TEXT,
  stripe_customer_id TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  emergency_phone TEXT,
  snooze_until DATETIME,
  prep_delay_minutes INTEGER DEFAULT 0,
  weekly_off_day INTEGER, -- 0=Domenica, 1=Lunedì, ecc.
  vacation_start DATE,
  vacation_end DATE,
  max_orders_per_slot INTEGER DEFAULT 10,
  is_accredited INTEGER DEFAULT 1, -- 1=Accreditato con ordine online, 0=Solo directory/telefono
  is_spotlight INTEGER DEFAULT 0, -- 1=Sponsorizzato in evidenza in cima
  has_gluten_free INTEGER DEFAULT 0,
  has_lactose_free INTEGER DEFAULT 0,
  has_vegan INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Hardware Devices (Sunmi)
CREATE TABLE IF NOT EXISTS hardware_devices (
  device_id TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL REFERENCES merchants(id),
  model TEXT DEFAULT 'Sunmi V2s',
  deposit_amount REAL DEFAULT 150.00,
  deposit_status TEXT CHECK(deposit_status IN ('HELD', 'REFUNDED', 'REDEEMED')) DEFAULT 'HELD',
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Ordini con tracciamento Pre-Autorizzazione Stripe
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL REFERENCES merchants(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  total_amount REAL NOT NULL,
  payment_method TEXT CHECK(payment_method IN ('CARD', 'CASH')) DEFAULT 'CARD',
  stripe_payment_intent_id TEXT,
  capture_status TEXT CHECK(capture_status IN ('AUTHORIZED', 'CAPTURED', 'CANCELLED', 'EXPIRED')) DEFAULT 'AUTHORIZED',
  status TEXT DEFAULT 'PENDING',
  cutlery_requested INTEGER DEFAULT 0,
  cash_change_from REAL,
  delivery_address TEXT,
  delivery_zone TEXT,
  umbrella_number TEXT,
  pickup_point TEXT,
  customer_notes TEXT,
  has_alcohol INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Prenotazioni Tavoli con Sistema Anti No-Show
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL REFERENCES merchants(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  party_size INTEGER NOT NULL,
  reservation_time DATETIME NOT NULL,
  confirmation_status TEXT CHECK(confirmation_status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'NO_SHOW')) DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Piatti Menu con Gestione Allergeni (Reg. UE 1169/2011)
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL REFERENCES merchants(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Pizze',
  price REAL NOT NULL,
  allergens TEXT, -- JSON array (es. ["gluten", "crustaceans", "peanuts"])
  is_available INTEGER DEFAULT 1,
  is_alcohol INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Recensioni & Valutazioni Post-Esperienza
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL REFERENCES merchants(id),
  order_id TEXT REFERENCES orders(id),
  reservation_id TEXT,
  customer_phone TEXT NOT NULL,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
  tags TEXT, -- JSON array dei badge
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Notifiche Push Sponsorizzate / Broadcast Marketing
CREATE TABLE IF NOT EXISTS sponsored_notifications (
  id TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL REFERENCES merchants(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_zone TEXT DEFAULT 'ALL',
  scheduled_at DATETIME NOT NULL,
  sent_at DATETIME,
  price_charged REAL DEFAULT 19.00,
  clicks_count INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('DRAFT', 'SCHEDULED', 'SENT', 'CANCELLED')) DEFAULT 'SCHEDULED',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. Console SuperAdmin & Automazione Fatturazione Fine Mese

La Master Console SuperAdmin consente:

- **Riconciliazione Automatica**: Calcolo automatico a fine mese solare delle competenze: canone mensile fisso (€29,00/mese) + commissioni 8% sul transato cibo + fee tavoli (€0,50/tavolo) + broadcast sponsorizzati.
- **Addebito Automatico (Stripe Billing / SEPA SDD)**: Trigger automatico senza gestione manuale di insoluti o solleciti.
- **Monitoraggio Depositi Cauzionali**: Tracciamento dello stato cauzioni (€150,00) su terminali Sunmi e gestione rimborsi o riscatti.
- **Reportistica Fatturazione & Calcolo Competenze (Invio Manuale)**: La dashboard SuperAdmin NON invia fatture elettroniche automatiche tramite API SDI. La dashboard serve unicamente come strumento di calcolo e riepilogo contabile chiaro ed esatto (canone fisso 29€, totale commissioni 8% su ordini digitali e ordini contanti, fee tavoli 0,50€/coperto, platform fee). L'amministratore consulterà il prospetto riassuntivo dalla propria console ed emetterà/trasmetterà manualmente le fatture elettroniche B2B tramite il proprio software di fatturazione.
- **Gestione & Approvazione Broadcast Sponsorizzati**: Monitoraggio, approvazione e rendicontazione delle notifiche push sponsorizzate e dei relativi costi per la contabilizzazione nel conguaglio mensile.
