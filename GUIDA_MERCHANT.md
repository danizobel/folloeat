# FolloEat v4.1 — Manuale Operativo Esercente & Gestione Terminale Sunmi V2s

> **Guida Ufficiale per Ristoratori, Pizzerie, Stabilimenti Balneari e Staff di Sala/Cucina**  
> Città di Follonica (GR) — Piattaforma FolloEat v4.1

---

## Indice dei Contenuti
1. [Introduzione al Servizio & Filosofia FolloEat](#1-introduzione-al-servizio--filosofia-folloeat)
2. [Guida all'Uso del Terminale Hardware Sunmi V2s](#2-guida-alluso-del-terminale-hardware-sunmi-v2s)
3. [Gestione degli Ordini: Il Ciclo di Vita Completo](#3-gestione-degli-ordini-il-ciclo-di-vita-completo)
4. [Stampa Termica Scontrini 58mm & Sostituzione Rotoli](#4-stampa-termica-scontrini-58mm--sostituzione-rotoli)
5. [Consegne Speciali: Spiaggia & Numero Ombrellone](#5-consegne-speciali-spiaggia--numero-ombrellone)
6. [Sicurezza: Verifica del PIN a 4 Cifre & Obbligo 18+ Alcolici](#6-sicurezza-verifica-del-pin-a-4-cifre--obbligo-18-alcolici)
7. [Ordini con Pagamento in Contanti alla Consegna](#7-ordini-con-pagamento-in-contanti-alla-consegna)
8. [Prenotazione Tavoli Rapida ("Fast Seating")](#8-prenotazione-tavoli-rapida-fast-seating)
9. [Panic Button: Snooze 30 Minuti & Ritardo Cucina](#9-panic-button-snooze-30-minuti--ritardo-cucina)
10. [HACCP, Trasporto Cibo & Manleva di Responsabilità Legale](#10-haccp-trasporto-cibo--manleva-di-responsabilit-legale)
11. [FAQ & Assistenza Rapida Locale](#11-faq--assistenza-rapida-locale)

---

## 1. Introduzione al Servizio & Filosofia FolloEat

Benvenuto nella rete partner di **FolloEat**, l'infrastruttura tecnologica iperlocale dedicata alla ristorazione e al turismo balneare di Follonica.

### I Principi del Tuo Contratto:
- **Incasso Diretto al 100%**: Gli incassi dei pagamenti con carta non transitano su conti terzi ma vengono accreditati direttamente sul tuo conto Stripe Connect / IBAN aziendale.
- **Commissione Chiara**: 8% sul valore dei piatti venduti online + € 0,15 di fee piattaforma.
- **Canone Software**: € 29,00/mese + IVA (comprensivo di manutenzione software, supporto locale a Follonica e aggiornamenti).
- **Indipendenza dei Rider**: FolloEat non impone né fornisce fattorini. Le consegne sono gestite dal tuo personale o dai tuoi rider di fiducia, mantenendo il controllo totale sulla qualità del servizio al cliente finale.

---

## 2. Guida all'Uso del Terminale Hardware Sunmi V2s

Il tuo locale è equipaggiato con un terminale professionale **Sunmi V2s** dotato di connessione dati 4G/Wi-Fi e stampante termica ad alta velocità da 58mm.

### Avvio e Configurazione Giornaliera (Inizio Turno):
1. **Accensione**: Tieni premuto il pulsante di accensione sul lato destro per 3 secondi.
2. **Accesso alla Console**: Il terminale apre automaticamente l'applicazione FolloEat con la schermata del tuo locale:
   `https://folloeat.it/merchant/[tuo-locale]`
3. **Attivazione Allarme Sonoro (OBBLIGATORIO)**:
   - Al primo accesso, tocca il pulsante arancione **"Attiva Suoneria Comande"** sullo schermo.
   - Questa operazione è indispensabile per sbloccare l'audio del browser: il terminale emetterà un breve trillo di conferma e la spia diventerà verde con dicitura **"Audio Attivo"**.
4. **Alimentazione**: Mantieni il dispositivo collegato al suo cavo USB-C originale durante l'orario di punta per garantire massima operatività.

---

## 3. Gestione degli Ordini: Il Ciclo di Vita Completo

Quando un cliente a Follonica invia un ordine, il sistema applica la tecnologia **5-Minute Pre-Auth Hold**:

```
[Cliente Invia Ordine]
       │
       ▼ (Plafond carta bloccato per 5 min)
[Allarme Continuo Sunmi V2s] ◄─── Suona in loop ad alto volume!
       │
   ┌───┴────────────────────────┐
   ▼                            ▼
[ACCETTA (+15/20/30 min)]     [RIFIUTA]
   │                            │
   ▼                            ▼
Transazione Catturata        Plafond sbloccato a costo 0
Scontrino stampato           Cliente avvisato con SMS
In preparazione...
   │
   ▼
[AFFIDA AL RIDER] ──► Rider parte con scontrino e termobox
   │
   ▼
[CONSEGNA CONCLUSA] ◄── Inserimento PIN a 4 cifre del cliente
```

### Azione 1: Accettazione Ordine (Entro 5 minuti)
- Il terminale suona con un allarme acustico ininterrotto.
- Tocca il tempo di preparazione stimato: **"Accetta (15 min)"**, **"20 min"** o **"30 min"**.
- Nel momento in cui accetti:
  - La carta del cliente viene addebitata definitivamente.
  - L'allarme si spegne.
  - Viene inviata la comanda alla cucina con stampa dello scontrino termico.

### Azione 2: Rifiuto dell'Ordine
- Se il locale è saturo o un ingrediente fondamentale è esaurito, tocca **"Rifiuta Ordine"**.
- La pre-autorizzazione sulla carta del cliente decade istantaneamente a **costo zero** (nessuna commissione bancaria applicata a tuo carico).

### Azione 3: Affidamento al Rider
- Quando la comanda è pronta e confezionata nella busta sigillata, tocca **"Affida al Rider"**.
- Lo stato dell'ordine passa a `DELIVERING` e la mappa del cliente si aggiorna informandolo che il cibo è in arrivo.

### Azione 4: Chiusura Consegna con PIN
- Quando il fattorino rientra (o inserisce il PIN direttamente sul terminale), tocca **"Consegna Conclusa"** e convalida l'ordine con il **PIN a 4 cifre** fornito dal cliente.

---

## 4. Stampa Termica Scontrini 58mm & Sostituzione Rotoli

La stampante termica non usa inchiostro: sfrutta carta termica termosensibile standard da **58 mm di larghezza**.

### Come Sostituire il Rotolo di Carta Termica:
1. Tira verso l'alto la levetta arancione situata nella parte superiore del Sunmi V2s per sbloccare lo sportellino.
2. Rimuovi l'anima di plastica del rotolo terminato.
3. Inserisci il nuovo rotolo da 58mm avendo cura che **la carta si svolga da sotto verso l'alto** (la faccia lucida termosensibile deve essere rivolta verso la testina di stampa).
4. Fai fuoriuscire circa 2 centimetri di carta dallo sportello.
5. Richiudi lo sportello premendo con decisione sui due lati fino a sentire un netto "click".
6. Strappa la carta in eccesso tirandola verso la lama dentata.
7. Tocca **"Scontrino 58mm"** su un ordine precedente per fare una stampa di prova.

*Nota di fornitura*: Il terminale viene consegnato con 3 rotoli inclusi. I rotoli di ricambio sono reperibili presso qualsiasi fornitore per registratori di cassa o cartoleria di Follonica (misura: 58mm x 40mm carta termica per POS).

---

## 5. Consegne Speciali: Spiaggia & Numero Ombrellone

FolloEat è la prima piattaforma a Follonica integrata per la **Beach Delivery** diretta sotto l'ombrellone lungo tutto il Golfo (da Pratoranieri a Senzuno, fino a Torre Mozza).

### Come Riconoscere un Ordine in Spiaggia:
Sullo schermo del Sunmi e sullo scontrino termico vedrai evidenziato:
- **Destinazione**: es. `Bagno Florida`, `Bagno Cerboli`, `Spiaggia Libera Pratoranieri`.
- **Numero Ombrellone**: es. `Ombrellone #42 - Fila 3`.
- **Punto d'Incontro Alternativo**: se la spiaggia è libera o non custodita, il cliente indicherà *"Accesso Spiaggia Via Romagna"* o punto di ritiro pedonale.

### Raccomandazioni Operative per i Rider in Spiaggia:
- Fornire al rider borse termiche rigide resistenti alla sabbia.
- Comunicare al rider di presentarsi al camminamento dello stabilimento o all'accesso stabilito e chiamare il cliente con il tasto di chiamata rapida telefonica presente nella schermata se l'ombrellone non è individuabile a vista.

---

## 6. Sicurezza: Verifica del PIN a 4 Cifre & Obbligo 18+ Alcolici

### Il PIN a 4 Cifre di Consegna (Anti-Truffa)
Per proteggere il tuo ristorante da clienti che dichiarano falsamente di non aver ricevuto l'ordine:
1. Su ogni ordine delivery compare un codice numerico univoco (es. `PIN: 5912`).
2. Lo stesso codice è presente sul cellulare del cliente nella schermata di stato.
3. **Il fattorino deve richiedere il codice a voce prima di cedere la busta del cibo.**
4. L'ordine può essere chiuso sul terminale solo a conferma del PIN.

### Avviso Obbligatorio Alcolici 18+ (Legge 125/2001 e Legge 189/2012)
Se l'ordine include birre, vini, cocktail o superalcolici:
- Lo scontrino termico stampa in grassetto l'avviso:  
  `*** CONTIENE ALCOLICI - RICHIESTO DOCUMENTO 18+ ***`
- Il fattorino/rider ha l'**obbligo giuridico inderogabile** di accertare la maggiore età del ricevente prima della consegna di bevande alcoliche.
- In caso di cliente minorenne o rifiuto di esibire il documento d'identità, le bevande alcoliche **non devono essere consegnate** e devono essere riportate al locale.

---

## 7. Ordini con Pagamento in Contanti alla Consegna

FolloEat supporta sia il pagamento con carta di credito sia i **Contanti alla Consegna (COD)** per massimizzare gli ordini della clientela locale.

### Gestione del Resto:
- Quando un ordine è pagato in contanti, lo scontrino riporta:
  - `METODO: CONTANTI ALLA CONSEGNA`
  - `IMPORTO TOTALE DA RISCUOTERE: € 28,50`
  - *(Se specificato dal cliente)*: `BANCONOTA CLIENTE: € 50,00` → `RESTO DA PORTARE: € 21,50`
- Il rider deve partire equipaggiato con il borsello con il resto esatto già preparato dal cassiere del locale.
- **Conguaglio Commissioni FolloEat**: La commissione dell'8% sugli ordini contanti non può essere trattenuta alla fonte da Stripe. Viene registrata nel tuo estratto conto di fine mese e conguagliata nella fattura B2B mensile o tramite compensazione sugli incassi carta.

---

## 8. Prenotazione Tavoli Rapida ("Fast Seating")

FolloEat consente ai clienti di riservare un tavolo nel tuo locale per il **2° turno serale (ore 21:30 - 22:30)** o per il pranzo.

### Regole Operative del Servizio Tavoli:
- Il cliente corrisponde alla piattaforma una fee di prenotazione (€ 0,50 a persona).
- **Regola dei 15 Minuti**: Il tavolo viene riservato per un massimo di 15 minuti oltre l'orario prenotato. Trascorsi i 15 minuti di ritardo senza preavviso telefonico da parte del cliente, il tavolo si intende liberato e riassegnabile ai clienti in attesa.
- Il nominativo e il numero di coperti compaiono direttamente nella scheda **"Tavoli"** del tuo terminale Sunmi V2s.

---

## 9. Panic Button: Snooze 30 Minuti & Ritardo Cucina

Nei momenti di massimo affollamento (es. sabato sera di luglio/agosto con sala piena), non è necessario spegnere il terminale o staccare la spina.

### Utilizzo del Pannello Emergenza ("Panic Controls"):
In cima alla schermata del terminale trovi due pulsanti di controllo rapido:

1. **"Snooze 30 Minuti" (Pausa Ordini)**:
   - Blocca temporaneamente la possibilità di effettuare nuovi ordini sul tuo menù per i successivi 30 minuti.
   - Il locale **rimane visibile** sulla mappa e nella guida di Follonica, ma i clienti vedranno l'etichetta *"Cucina al completo — Nuovi ordini disponibili tra XX minuti"*.
   - Il conteggio riparte automaticamente al termine dei 30 minuti, oppure puoi toccare **"Riapri Ora"** in qualsiasi istante.
2. **"Ritardo Cucina (+20 min / +30 min)"**:
   - Se la cucina è sotto pressione ma vuoi comunque accettare ordini, attiva il ritardo cucina.
   - Il sistema incrementa automaticamente il tempo di consegna stimato mostrato ai clienti prima del checkout da 30 a 50-60 minuti, evitando lamentele e telefonate di sollecito.

---

## 10. HACCP, Trasporto Cibo & Manleva di Responsabilità Legale

In conformità ai termini di servizio FolloEat v4.1 e alla normativa vigente:

1. **Responsabilità della Preparazione (HACCP)**:
   - Il ristorante garantisce che tutte le pietanze sono preparate in locali conformi al Regolamento CE 852/2004 e alle normative sanitarie della Regione Toscana (ASL Toscana Sud-Est).
2. **Allergeni (Regolamento UE 1169/2011)**:
   - È cura esclusiva dell'esercente comunicare a FolloEat la presenza esatta dei 14 allergeni per ciascun piatto del menù e rispondere tempestivamente alle note scritte inserite dal cliente nell'ordine.
3. **Trasporto Termico**:
   - I cibi caldi devono essere trasportati a una temperatura non inferiore a **+65°C** all'interno di borse termiche coibentate.
   - I cibi freddi e deperibili (es. sushi, tartare, dolci con crema) devono viaggiare a temperatura non superiore a **+4°C**.
4. **Manleva Legale FolloEat**:
   - FolloEat funge unicamente da mediatore informatico e fornitore del software di ordinazione.
   - FolloEat non è responsabile di controversie sulla qualità del cibo, temperature di consegna, intossicazioni alimentari, incidenti stradali occorsi ai rider dell'esercente o violazioni amministrative per somministrazione di alcolici a minori.

---

## 11. FAQ & Assistenza Rapida Locale

**D: La carta termica esce bianca ma non si legge nulla.**  
*R: Il rotolo è stato inserito al contrario. Apri lo sportello e gira il rotolo in modo che la superficie lucida sia a contatto con la testina termica.*

**D: Il terminale non squilla quando arriva un nuovo ordine.**  
*R: Controlla che il volume laterale sia al massimo e tocca il tasto arancione "Attiva Suoneria Comande" sullo schermo per sbloccare l'audio del browser.*

**D: Un cliente non si presenta al punto d'incontro in spiaggia.**  
*R: Tocca l'icona del telefono verde accanto al nome del cliente sullo scontrino/schermo per chiamarlo direttamente. Se il cliente non risponde entro 10 minuti dal secondo tentativo, il rider è autorizzato a rientrare e l'importo dell'ordine carta rimane comunque accreditato al locale.*

**D: Chi chiamo per assistenza urgente su un terminale rotto a Follonica?**  
*R: Contatta il team operativo FolloEat Follonica tramite il canale WhatsApp dedicato riservato ai ristoratori partner (attivo 7 giorni su 7).*
