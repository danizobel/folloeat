# folloeat. (v4.1 Definitiva)
> Piattaforma SaaS Iperlocale di Food Delivery, Asporto e Prenotazione Tavoli a Follonica (GR) e litorale maremmano.

---

## 🌊 Missione & Business Model v4.1

FolloEat tutela i margini degli esercenti locali contro le commissioni del 25-35% dei colossi del delivery (Just Eat, Deliveroo), offrendo commissioni all'**8%**, incassi diretti su conto merchant e applicazione territoriale ad alte prestazioni:

- **Setup una tantum**: €199,00 (onboarding, digitalizzazione menu, inserimento 14 allergeni UE Reg. 1169/2011, kit vetrofanie).
- **Canone Software SaaS**: €29,00 / mese (unificato per piani SMART e PRO).
- **Deposito Cauzionale Sunmi V2s**: €150,00 deposito infruttifero vincolato, rimborsabile al 100% alla cessazione o riscattabile a saldo (opzione dilazione in 3 rate da €50,00).
- **Starter Kit Consumabili**: 3 rotoli termici 58mm inclusi.
- **Commissione Cibo**: 8% sul netto venduto.
- **Digital Platform Fee Cliente**: €0,15 a transazione addebitata direttamente all'utente al checkout (*"Contributo Digitale & Ristorazione Follonichese"*). Costo per il locale: €0,00.
- **Fast Seating / Radar Tavoli**: €0,50 a coperto confermato per il 2° turno post-21:30.
- **Notifiche Broadcast Sponsorizzate**: €19,00 invio singolo / €59,00 bundle 4 invii al mese (max 1 notifica al giorno su tutta la piattaforma).
- **Connettività & Manleva Legale**: Wi-Fi 2.4 GHz a carico dell'esercente. FolloEat è puro fornitore tecnologico SaaS con manleva totale al 100% per logistica, rider, infortuni INAIL, codice della strada e igiene HACCP.
- **Pagamenti & Zero Escrow**: Pre-autorizzazione Stripe con Auth & Capture (timeout di svincolo automatico a 5 minuti). Pagamenti in contanti (Cash on Delivery) incassati al 100% dall'esercente con conguaglio a fine mese.

---

## 🛠️ Stack Tecnologico & Architettura

- **Frontend**: Next.js 15 (App Router, React 19, TypeScript, Tailwind CSS, Lucide React, Leaflet per OpenStreetMap).
- **Runtime & Edge**: Cloudflare Pages / Workers runtime (`wrangler.toml`, D1 Database, KV Cache).
- **Database**: Cloudflare D1 (SQLite distribuito) con adapter isomorfico per sviluppo locale senza dipendenze native.
- **State & Panic System**: Cloudflare KV per Snooze ordini (30/60 min) e ritardi cucina (+20/+30 min).
- **Brand Colors**:
  - Primario Mare: `#0284C7` (`follo-blue`)
  - Rosso Maremmano / CTA: `#EF4444` (`follo-red`)
  - Dark Slate testi: `#0F172A` (`follo-slate`)
  - Sabbia Dorata / Rating: `#F59E0B` (`follo-sand`)
  - Sfondo Neutro: `#F8FAFC` (`follo-bg`)

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
L'applicazione sarà attiva su [http://localhost:3000](http://localhost:3000).

### 3. Build di Produzione
```bash
npm run build
npm start
```

---

## 📍 Mappatura Rotte & Funzionalità

### 🛍️ Client & Customer Experience
- `/`: Homepage mobile-first con logo `folloeat.`, selettore di quartiere (Centro, Senzuno, Pratoranieri, Cassarello, Sotto l'Ombrellone con selezione Lido balneare), switch Card / Mappa Leaflet, cassetto menu con allergeni UE e 18+, Carrello & Checkout Etico (coupon `FOLLO5`, platform fee €0,15, scelta carta vs contanti con resto esatto), e dock navigation a 5 tab.
- `/api/places/follonica`: Discovery engine con bounding box (lat 42.9100 a 42.9450, lng 10.7300 a 10.7850), fallback Overpass OSM e cross-reference D1.
- `/api/orders`: Creazione comanda, validazione contanti, verifica 18+ e gestione pre-autorizzazione.
- `/api/reservations`: Fast Seating Radar Tavoli per il 2° turno post-21:30 (€0,50 a persona).

### 🖨️ Terminale Ristoratore (Sunmi V2s & Tablet)
- `/merchant/[slug]`:
  - `pizzeria-da-michele`: Pizzeria Da Michele & Figli (Senzuno)
  - `maremma-smash-burger`: Maremma Smash Burger (Centro Storico)
  - `bagno-florida`: Bagno Florida Ristorante sul Mare (Pratoranieri)
- **Allarme sonoro loop continuo** ad alto volume tramite Web Audio API, che si arresta unicamente alla pressione di "Accetta Ordine" o "Rifiuta".
- **Payload Stampante Termica 58mm**: Generazione scontrino 32 colonne ESC/POS per Sunmi V2s.
- **Tasto Panico / "Siamo Pieni"**: Snooze 30/60m e ritardo cucina +20/+30m su Cloudflare KV.
- **Anti-Ingorgo Forno**: Blocco automatico dello slot al superamento della capienza ogni 15 minuti.

### 🛡️ Master Console Superadmin & Fatturazione
- `/admin`:
  - **KPIs Piattaforma**: Volume transato, scomposizione carta vs contanti, commissioni 8%, platform fee €0,15, fee coperti €0,50, canoni SaaS €29.
  - **Registro Hardware Sunmi**: Matricola seriale, stato cauzione (€150,00 - HELD, REFUNDED, REDEEMED).
  - **Prospetto B2B Mensile**: Calcolo esatto a conguaglio di fine mese per ciascun esercente.
  - **Esportazione CSV**: File pronto per la trascrizione nelle fatture elettroniche aziendali.
  - **Seed Automatico**: `/api/seed` per il ripristino istantaneo dei dati reali di Follonica.

---

## ☁️ Deploy Automatico & Auto-Migrazione SQL

Il progetto integra un **motore di auto-migrazione SQL a 3 livelli**, garantendo che appena deployato i comandi SQL vengano eseguiti **in totale autonomia senza alcun intervento manuale**:

1. **Livello 1 (Hook NPM / Deploy Automati)**:
   - Al lancio di `npm install` su qualsiasi piattaforma (Cloudflare Pages, Vercel, Docker), lo script `postinstall` esegue automaticamente `node scripts/auto-migrate.mjs`.
   - Al lancio della build (`npm run build` o `npm run pages:build`), lo script `prebuild` riesegue e convalida la migrazione D1.

2. **Livello 2 (Auto-Healing Runtime Serverless)**:
   - In `src/lib/db.ts`, la funzione `ensureDatabaseInitialized()` intercetta qualsiasi prima chiamata API o visita alla piattaforma: se le 7 tabelle relazionali non sono presenti nel database Cloudflare D1 (`env.DB`), esegue istantaneamente `d1.exec(D1_SCHEMA_SQL)` e inserisce automaticamente i 3 ristoranti partner, il registro terminali Sunmi e il menu maremmano.

3. **Livello 3 (Comandi Deploy con 1 Click)**:
   - Deploy su Cloudflare Pages con auto-migrazione:
   ```bash
   npm run deploy
   ```
   - Deploy con migrazione forzata su D1 remoto di produzione:
   ```bash
   npm run deploy:prod
   ```
   - In alternativa, se colleghi la repository Git a Cloudflare Pages: imposta semplicemente il build command a `npm run pages:build` e output directory `.vercel/output/static`. All'atto del deploy Git, la migrazione e l'inizializzazione del database avverranno automaticamente!

