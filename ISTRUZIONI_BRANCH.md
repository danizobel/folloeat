# FolloEat v4.1 — Istruzioni Ufficiali Branch & Credenziali SuperAdmin

> **STATO VERSIONE: VERSIONE UFFICIALE DEFINITIVA v4.1 (PRONTA PER IL RILASCIO)**  
> **BRANCH:** `main`  
> **DATA & ORA COMMIT/PUSH:** Aggiornamento Ufficiale Finale completato.  
> *Questa è la versione ufficiale definitiva del progetto FolloEat pronta per il lancio a Follonica.*

---

## 🔐 1. Credenziali di Accesso Riservate SuperAdmin

La Console Amministrativa Centrale è protetta da un gate di autenticazione riservato per impedire l'accesso pubblico non autorizzato.

- **URL di Accesso:**  
  - Locale: `http://localhost:3000/admin`  
  - Produzione: `https://folloeat.it/admin` (o dominio collegato su Cloudflare Pages)

- **Credenziali Ufficiali SuperAdmin:**
  - **Identificativo SuperAdmin:** `admin@folloeat.it` (oppure `superadmin`)
  - **Master Password:** `FolloEat2026!`
  - **PIN Rapido di Accesso Alternativo:** `58022` *(CAP della Città di Follonica)*

- **Funzionalità di Sessione:**  
  Una volta effettuato l'accesso con la Master Password o con il PIN `58022`, la sessione viene memorizzata in modo persistente nel browser. Per disconnettersi è sufficiente cliccare sull'icona rossa di logout in alto a destra nella testata dell'admin.

---

## 🧭 2. Guida Generale al Funzionamento della Piattaforma

FolloEat è la prima piattaforma digitale etica iperlocale progettata specificamente per il litorale di Follonica (GR), collegando clienti, residenti, turisti in spiaggia e ristoratori locali.

### A. La Gerarchia a 3 Livelli (Marketplace Follonica):
1. 🥇 **Livello 1: Spotlight Gold**  
   - Primo posto garantito in cima alla lista con corona dorata, bagliore e badge oro.
   - Ordinazione completa in-app (delivery & asporto) e prenotazione tavoli rapida.
   - Esempio attivo: *Pizzeria Da Michele & Figli* (Senzuno).
2. 🥈 **Livello 2: Partner Accreditato**  
   - Locale partner contrattualizzato con terminale Sunmi V2s in cucina/cassa.
   - Ordinazione in-app delivery con scontrino termico automatico e radar tavoli 2° turno post-21:30.
   - Esempi attivi: *Da Poldo Food & Love* (Centro) e *Bagno Florida* (Pratoranieri - Beach Delivery).
3. 🥉 **Livello 3: Directory Comunale (Gratuito / Non Accreditato)**  
   - Censimento di pubblica utilità delle attività gastronomiche di Follonica.
   - Nessun carrello in-app; presenta solo il pulsante *"Chiama il Locale"* (`tel:+39...`) per contattare direttamente il ristorante.
   - Esempi censiti: *Osteria Nascosta*, *Pizzeria Piccolo Mondo*, *Pasticceria Peggi*, *Il Piccolo Lord Pub*, *Bagno Balena*, *Trattoria Il Sottomarino*, *Chiosco Il Boschetto*.

### B. Onboarding Progressivo degli Esercenti (Da Domani):
All'interno della Console SuperAdmin (`/admin`):
- **Nuovo Locale (`+ Nuovo Esercente`)**: Modale guidato per inserire ragione sociale, indirizzo a Follonica, telefono, matricola Sunmi V2s e opzioni alimentari (Senza Glutine, Vegano, Senza Lattosio).
- **Promozione in 1 Click**: Nella tabella degli esercenti, puoi cliccare su **"Accredita Partner"** per abilitare subito un locale della Directory alla ricezione ordini, oppure **"Rendi Spotlight"** per promuoverlo al livello massimo.
- **Aggiunta Piatti (`+ Piatto`)**: Puoi inserire in pochi secondi i piatti nel menù di ciascun ristorante accreditato con prezzo, ingredienti, allergeni e avviso alcolici 18+.

### C. Consegne Sotto l'Ombrellone & PIN di Sicurezza:
- I bagnanti possono ordinare direttamente sotto l'ombrellone selezionando il proprio stabilimento balneare (Bagno Florida, Bagno Balena, Pratoranieri, Senzuno, Centro) e indicando il *Numero Ombrellone / Fila*.
- Ad ogni ordine delivery viene generato un **PIN di sicurezza a 4 cifre** (es. `4821`): il rider deve chiedere il PIN al cliente alla consegna prima di cedere la busta, eliminando contestazioni e truffe.

### D. Terminale Sunmi V2s (`/merchant/[slug]`):
- Allarme acustico in loop continuo (Web Audio API) che suona ad alto volume e non si arresta fino all'accettazione o rifiuto da parte dell'operatore.
- Stampa automatica su carta termica 58mm (ESC/POS) con indicazione di PIN, ombrellone, allergeni e avviso controllo documento per bevande alcoliche.
- Tasto Panico: *"Snooze 30 Minuti"* e *"Ritardo Cucina (+20m / +30m)"*.

---

## 📋 3. Specifiche Economiche, Fiscali & Contrattuali

- **Zero Escrow (Incasso Diretto Esercente)**: Pagamenti carta gestiti via Stripe Connect; i fondi del cibo vanno direttamente sul conto bancario del ristorante.
- **5-Minute Pre-Auth Hold**: Blocco preventivo plafond; addebito definitivo solo se il locale accetta entro 5 minuti sul Sunmi, altrimenti svincolo automatico a costo zero.
- **Commissioni**: 8% sul cibo + € 0,15 platform fee a carico del cliente.
- **Canone Software**: € 29,00 / mese + IVA.
- **Setup Iniziale**: € 199,00 + IVA una tantum.
- **Deposito Cauzionale Sunmi V2s**: € 150,00 esente IVA ex art. 15 D.P.R. 633/72 (vincolato e tracciato come `HELD`, `REFUNDED`, `REDEEMED`).
- **Fatturazione Elettronica B2B SDI**: La piattaforma genera il prospetto contabile esatto di fine mese (scaricabile in CSV) per emettere manualmente le fatture elettroniche su Aruba, Fatture in Cloud, TeamSystem o altro gestionale.
- **Manleva Totale 100%**: FolloEat è puro fornitore software; manleva totale per logistica rider, codice della strada e igiene alimentare HACCP.

---

## 📑 4. Documentazione di Riferimento del Progetto

| File | Percorso | Contenuto |
|---|---|---|
| **Master Specification** | [`master.md`](file:///c:/Users/dz94/Desktop/folloeat/master.md) | Tutti i 6 capitoli integrali della specifica ufficiale v4.1 |
| **Guida SuperAdmin** | [`GUIDA_SUPERADMIN.md`](file:///c:/Users/dz94/Desktop/folloeat/GUIDA_SUPERADMIN.md) | Manuale operativo amministratore, procedure SDI e gestione hardware |
| **Guida Esercenti & Staff** | [`GUIDA_MERCHANT.md`](file:///c:/Users/dz94/Desktop/folloeat/GUIDA_MERCHANT.md) | Manuale per il locale, uso del Sunmi V2s, cambio rotoli e consegne spiaggia |
| **README Tecnico** | [`README.md`](file:///c:/Users/dz94/Desktop/folloeat/README.md) | Architettura, stack Next.js 15, rotte e script di deploy |

---

## ⚡ 5. Comandi di Esecuzione & Deploy

```bash
# Sviluppo Locale
npm run dev

# Compilazione di Produzione (Convalidata con 0 errori)
npm run build

# Avvio Server Produzione
npm start
```
