# FolloEat v4.1 — Guida Operativa SuperAdmin

> **Documento Riservato ad Uso Interno**  
> Piattaforma Iperlocale di Food Delivery & Tavoli — Follonica (GR)  
> Versione Specifica: v4.1 Definitiva

---

## Indice dei Contenuti
1. [Panoramica Architetturale & Ruolo del SuperAdmin](#1-panoramica-architetturale--ruolo-del-superadmin)
2. [Procedura di Onboarding Esercente](#2-procedura-di-onboarding-esercente)
3. [Flotta Hardware Sunmi V2s & Depositi Cauzionali](#3-flotta-hardware-sunmi-v2s--depositi-cauzionali)
4. [Protocollo Fiscale & Fatturazione Elettronica SDI (Fine Mese)](#4-protocollo-fiscale--fatturazione-elettronica-sdi-fine-mese)
5. [Gestione Gerarchia a 3 Livelli (Spotlight, Partner, Directory)](#5-gestione-gerarchia-a-3-livelli-spotlight-partner-directory)
6. [Notifiche Push Sponsorizzate (Monetizzazione Extra)](#6-notifiche-push-sponsorizzate-monetizzazione-extra)
7. [Monitoraggio Ordini, PIN di Sicurezza & Risoluzione Dispute](#7-monitoraggio-ordini-pin-di-sicurezza--risoluzione-dispute)
8. [Manleva Legale, HACCP & Responsabilità Rider](#8-manleva-legale-haccp--responsabilit-rider)
9. [Checklist Giornaliera & Contatti di Emergenza](#9-checklist-giornaliera--contatti-di-emergenza)

---

## 1. Panoramica Architetturale & Ruolo del SuperAdmin

FolloEat non è un'azienda di logistica né un datore di lavoro per rider. È un **fornitore di infrastruttura digitale iperlocale** (SaaS + Marketplace) per la città di Follonica.

### I Tre Pilastri Fondamentali:
1. **Zero Escrow (Incasso Diretto Esercente)**:
   - I pagamenti con carta passano tramite **Stripe Connect Custom/Standard**. I fondi del cibo (€ lordo) vanno **direttamente sul conto bancario dell'esercente** entro 2-3 giorni lavorativi.
   - FolloEat non trattiene i soldi del cibo.
   - All'esercente viene trattenuta l'**Application Fee dell'8% + 0,15€** lato piattaforma in tempo reale al momento della cattura.
2. **5-Minute Pre-Auth Hold (Pre-Autorizzazione)**:
   - Al checkout del cliente, il plafond sulla carta viene bloccato (Pre-Authorization).
   - L'esercente ha 5 minuti per accettare o rifiutare sul terminale Sunmi V2s.
   - Se accetta, la transazione viene "catturata" (Capture). Se l'esercente rifiuta o non risponde entro 5 minuti, la pre-autorizzazione decade automaticamente (Void) a costo zero e senza commissioni di storno.
3. **Flotta Terminali Termici Sunmi V2s**:
   - Ogni locale partner riceve un terminale 4G con stampante termica 58mm integrata.
   - Il terminale suona in loop ad alto volume fino all'accettazione manuale da parte del personale.

---

## 2. Procedura di Onboarding Esercente

Quando un nuovo ristorante, pizzeria o stabilimento balneare di Follonica decide di aderire a FolloEat, il SuperAdmin deve seguire la seguente procedura standard:

### Fase 1: Raccolta Dati Contrattuali & Amministrativi
Raccogliere via email/modulo contrattuale:
- Ragione Sociale completa e Indirizzo della sede legale e operativa.
- Partita IVA e Codice Fiscale.
- Codice Destinatario SDI (7 caratteri) oppure indirizzo PEC per fattura elettronica.
- Coordinate bancarie (IBAN) del titolare o della società.
- Numero di telefono referente operativo (per notifiche WhatsApp d'emergenza).
- Logo e fotografie dei piatti in alta definizione (1:1 o 16:9).
- Menù completo con prezzi IVA inclusa e tabella allergeni (Regolamento UE 1169/2011).

### Fase 2: Incasso Attivazione & Deposito Hardware
Prima della consegna del terminale Sunmi, riscuotere:
- **Costo di Setup Iniziale**: **€ 199,00 + IVA** (comprende caricamento menù, configurazione SEO locale, materiale vetrofanie FolloEat, sessione di formazione personale di 45 min).
- **Deposito Cauzionale Terminale Sunmi V2s**: **€ 150,00 esente IVA ex art. 15 D.P.R. 633/72**.
  - *Opzione Rateizzazione concordata*: 3 rate mensili da € 50,00 addebitate nei primi 3 mesi di attività.

### Fase 3: Creazione Account & Terminale nella Console SuperAdmin
Accedere alla Console SuperAdmin (`/admin`):
1. **Creazione Nuovo Esercente**:
   - Cliccare sul pulsante blu in alto a destra **"Nuovo Esercente"** (`+`).
   - Nel modulo guidato inserire:
     - *Nome Locale* (es. `Ristorante Il Veliero`).
     - *Categoria Menù* (es. `Specialità di Mare & Friggitoria`).
     - *Telefono Locale* (es. `+39 0566 220000`).
     - *Indirizzo Follonica* (es. `Viale Italia 85, Follonica`).
     - *Livello Iniziale*: scegliere tra `Spotlight Gold`, `Partner Accreditato` o `Directory Comunale`.
     - *Matricola Seriale Sunmi V2s*: inserire il seriale dell'etichetta posteriore (es. `SNM-V2S-FOLLO-004`). Il sistema lo registra automaticamente con deposito vincolato `HELD` (€150).
     - *Opzioni Alimentari*: spuntare se applicabile Senza Glutine, Vegano, Senza Lattosio.
   - Cliccare su **"Conferma ed Accredita"**: il locale è istantaneamente attivo nel database e visibile sulla mappa di Follonica!
2. **Promozione dei Locali Esistenti (Onboarding Progressivo)**:
   - Nella tabella **"Registro Esercenti Follonica"** sono presenti tutti i ristoranti della città.
   - Per ogni locale della Directory basta cliccare sul pulsante blu **"Accredita Partner"** per abilitare istantaneamente il carrello, la ricezione ordini e la prenotazione tavoli.
   - Cliccare su **"Rendi Spotlight"** per assegnare il ranking #1, il badge oro con corona e il glow dorato.
   - Cliccare su **"➕ Piatto"** per aggiungere in pochi secondi le portate principali al menù del ristorante appena contrattualizzato.
3. **Consegna Terminale all'Esercente**:
   - Inserire la SIM 4G dati nel Sunmi V2s e verificare l'accesso a `folloeat.it/merchant/[slug]`.
   - Consegnare all'esercente la confezione con caricatore USB-C e **3 rotoli di carta termica da 58mm**.

---

## 3. Flotta Hardware Sunmi V2s & Depositi Cauzionali

I terminali Sunmi V2s sono strumenti da lavoro concessi in comodato d'uso oneroso con deposito cauzionale.

### Tabella Stati Deposito Cauzionale
| Stato | Significato | Azione SuperAdmin |
|---|---|---|
| `HELD` | Deposito di € 150,00 attivo e custodito | Nessuna azione. Il terminale è regolarmente in uso. |
| `REFUNDED` | Locale cessato, terminale restituito integro | Restituzione bonifico €150 entro 5 giorni lavorativi previa perizia hardware. |
| `REDEEMED` | Terminale smarrito, rubato o danneggiato irreparabilmente | Incameramento della cauzione a titolo di risarcimento acquisto nuovo hardware. |

### Configurazione Operativa del Terminale Sunmi V2s:
1. Accendere il Sunmi V2s e connetterlo al Wi-Fi del locale oppure alla SIM 4G dedicata.
2. Aprire l'applicazione Chrome/Browser e navigare su:  
   `https://folloeat.it/merchant/[slug-locale]`
3. Attivare il permesso audio nel browser cliccando sullo schermo al primo avvio (indispensabile per l'allarme sonoro Web Audio API).
4. Impostare la luminosità al 70% e disattivare lo standby automatico ("Schermo sempre attivo durante la carica").
5. Inserire il rotolo di carta termica da 58mm con la linguetta verso l'alto (chiudere con decisione lo sportellino fino al "click").

---

## 4. Protocollo Fiscale & Fatturazione Elettronica SDI (Fine Mese)

FolloEat **NON** emette scontrino per le pietanze vendute ai clienti (lo scontrino fiscale/corrispettivo telematico del cibo è a cura esclusiva dell'esercente tramite il proprio registratore di cassa telematico RT).

FolloEat emette verso l'esercente esclusivamente **Fattura Elettronica B2B** per i servizi di intermediazione e software erogati.

### Ciclo di Fatturazione Mensile (Entro il 5 del mese successivo)
1. **Estrazione Report Dati**:
   - Dalla Console SuperAdmin (`/admin`), aprire il pannello **Report Fiscale & SDI**.
   - Scaricare o visualizzare il riepilogo mensile per ciascun esercente:
     - Totale ordini completati.
     - Volume transato lordo (€).
     - **Commissione FolloEat (8% su pietanze)** maturata nel mese.
     - **Canone Software Mensile (€ 29,00 + IVA)**.
     - Eventuali acquisti di **Notifiche Push Sponsorizzate (€ 19,00 o € 59,00 + IVA)**.
     - Eventuali penali o rate del terminale.
2. **Generazione Fattura Elettronica su Piattaforma SDI**:
   - Accedere al proprio software di fatturazione (es. *Fatture in Cloud*, *Aruba Fatturazione Elettronica*, *TeamSystem* o *Poliweb*).
   - Creare nuova fattura B2B intestata alla Partita IVA dell'esercente.
   - **Linee di Dettaglio Obbligatorie**:
     1. *"Canone Piattaforma FolloEat SaaS - Mese [Mese/Anno]"* → Prezzo unitario: € 29,00 — Aliquota IVA: **22%**.
     2. *"Commissioni di intermediazione vendite online (8% su volato lordo € [Totale])"* → Prezzo: € [Calcolato] — Aliquota IVA: **22%**.
     3. *(Se applicabile)* *"Campagna Notifica Push Broadcast del [Data]"* → Prezzo: € 19,00 — Aliquota IVA: **22%**.
3. **Modalità di Pagamento & Chiusura Partita**:
   - Poiché le commissioni (8% + 0,15€) vengono già trattenute in tempo reale come Application Fee via Stripe Connect, sulla fattura va riportata la dicitura:
     > *"Corrispettivo già trattenuto in tempo reale tramite gateway di pagamento Stripe Connect. Fattura emessa ai soli fini dell'adempimento fiscale ex D.Lgs. 127/2015. Saldo a pagare: € [solo eventuale canone SaaS €29 + IVA non addebitato via SDD/carta]."*
   - Inviare la fattura al Sistema di Interscambio (SDI) dell'Agenzia delle Entrate.

---

## 5. Gestione Gerarchia a 3 Livelli (Spotlight, Partner, Directory)

Per garantire la massima copertura della città di Follonica tutelando al contempo gli esercenti paganti, FolloEat adotta una struttura a tre livelli:

```
[LIVELLO 1: SPOTLIGHT GOLD]  --> Pin Oro con Corona, Top Ranking, Badge Dorato, In-App Order + Booking
[LIVELLO 2: PARTNER ACCREDITATO] --> Pin Blu, In-App Delivery & Asporto, Prenotazione Tavoli
[LIVELLO 3: DIRECTORY COMUNALE]  --> Pin Grigio, Nessun Carrello, Solo Chiamata Telefonica ("tel:")
```

### Regole di Assegnazione nella Console Admin:
- **Livello 1 (Spotlight)**: Riservato ai locali che pagano il piano Premium o l'upgrade Spotlight. Impostare `is_accredited = 1` e `is_spotlight = 1`.
- **Livello 2 (Partner Accreditato)**: Ristoranti contrattualizzati standard con terminale Sunmi. Impostare `is_accredited = 1` e `is_spotlight = 0`.
- **Livello 3 (Directory Non Accreditata)**: Censimento di pubblica utilità di tutte le attività gastronomiche di Follonica. Impostare `is_accredited = 0` e `is_spotlight = 0`.  
  *Nota*: La piattaforma disabilita automaticamente il carrello per questi locali, mostrando unicamente il tasto *"Chiama il Locale"* (`tel:+39...`).

---

## 6. Notifiche Push Sponsorizzate (Monetizzazione Extra)

Gli esercenti accreditati possono acquistare notifiche broadcast geolocalizzate per inviare promozioni a tutti gli utenti registrati o attivi a Follonica.

### Listino Prezzi Sponsorizzazioni:
- **1 Notifica Singola**: **€ 19,00 + IVA**
- **Bundle 4 Notifiche (Mensile)**: **€ 59,00 + IVA** (€ 14,75 cad.)

### Flusso di Pubblicazione:
1. L'esercente richiede la notifica indicando data, orario desiderato (es. venerdì ore 18:30) e testo promozionale (max 120 caratteri, es. *"Stasera al Bagno Florida frittura di paranza e dj set! -10% per ordini entro le 20:00"*).
2. Il SuperAdmin accede a `/admin` → sezione **Broadcast Notifiche Sponsorizzate**.
3. Compila il modulo con:
   - Esercente selezionato.
   - Titolo della notifica.
   - Testo accattivante.
   - Link di atterraggio (pagina del locale o menù).
   - Data e orario di invio.
4. Clicca su **Programma Notifica**. La notifica verrà inviata tramite Web Push / PWA all'orario stabilito.

---

## 7. Monitoraggio Ordini, PIN di Sicurezza & Risoluzione Dispute

### Il PIN a 4 Cifre di Consegna (Anti-Frode)
Ogni ordine delivery genera un codice PIN univoco a 4 cifre (es. `4821`):
1. Il cliente vede il PIN sulla schermata di tracciamento (`/order/[id]`).
2. Lo scontrino del Sunmi stampa il PIN chiaramente evidenziato.
3. Il rider o il fattorino del locale **deve chiedere il PIN al cliente** al momento della consegna (particolarmente cruciale per le consegne in spiaggia agli ombrelloni di Pratoranieri, Senzuno e Centro).
4. L'esercente inserisce il PIN sul terminale Sunmi per contrassegnare l'ordine come `COMPLETED`.

### Gestione Rifiuto Ordine o Mancata Risposta:
- Se l'esercente rifiuta l'ordine sul Sunmi (o non risponde entro 5 minuti):
  - Il sistema annulla istantaneamente il blocco plafond (Stripe Void).
  - Il cliente riceve un SMS/notifica di scuse con invito a ordinare presso un altro locale consigliato.
  - Nessuna commissione viene addebitata.

### Gestione Reclami sul Cibo o Ritardo:
- **Ritardo Consegna**: Il SuperAdmin può verificare dal log se l'ordine è stato accettato e quando è stato passato a `DELIVERING`.
- **Qualità / Allergeni / Mancanza di un piatto**: L'esercente è contrattualmente l'unico responsabile della conformità dell'ordine. Il SuperAdmin indirizza il cliente al numero telefonico diretto del ristorante.

---

## 8. Manleva Legale, HACCP & Responsabilità Rider

Nel contratto standard FolloEat v4.1 è sancito in maniera inoppugnabile che:
1. **Autonomia dei Rider**: FolloEat non fornisce fattorini né stipula contratti di lavoro con rider. I rider sono dipendenti o collaboratori autonomi ingaggiati direttamente dai singoli ristoranti.
2. **HACCP & Sicurezza Alimentare**: La conservazione, il confezionamento termico, le temperature di trasporto e la conformità igienico-sanitaria (Regolamento CE 852/2004) ricadono al 100% sull'esercente.
3. **Divieto Alcolici ai Minori (Legge 125/2001 & Legge 189/2012)**:
   - Se un ordine contiene alcolici, lo scontrino Sunmi stampa a caratteri grandi l'avviso di controllo documento d'identità.
   - Il personale addetto alla consegna è l'unico responsabile della verifica della maggiore età alla consegna.

---

## 9. Checklist Giornaliera & Contatti di Emergenza

### Routine Quotidiana SuperAdmin (15 minuti al giorno):
- [ ] **Ore 11:30 (Pre-Pranzo)**: Controllo stato terminali Sunmi (verificare che i terminali dei partner aperti a pranzo risultino online).
- [ ] **Ore 18:30 (Pre-Cena)**: Verifica programmazione notifiche push sponsorizzate serali.
- [ ] **Ore 23:00 (Fine Servizio)**: Monitoraggio ordini rimasti aperti o con PIN pendente e verifica alert di sistema.

### Contatti di Assistenza Tecnica Hardware:
- **Supporto Hardware Sunmi**: Portale Partner Sunmi / Assistenza Garanzia 24 Mesi.
- **Supporto Piattaforma & Cloud**: Cloudflare D1 Dashboard & Stripe Connect Dashboard.
