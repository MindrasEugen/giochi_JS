# Tappa 29 — App Android: schermo intero, tasto indietro, icona

Ultima modifica: 2026-11-06

## Obiettivo

Far sembrare la raccolta una vera app sul telefono: niente barre di sistema, il tasto «indietro» di Android che si comporta come ci si aspetta, icona e schermata di avvio originali.

## Attività

- [x] Schermo intero immersivo in `MainActivity.java`: barra di stato e barra di navigazione nascoste, riappaiono per poco scorrendo dal bordo e si nascondono di nuovo; lo spazio della fotocamera resta libero (lo gestisce Capacitor)
- [x] Orientamento: verticale bloccato per ora (`android:screenOrientation="portrait"`); l'orizzontale per alcuni giochi scelti dall'utente passa alla [Tappa 29.1](47-tappa-29-1-orizzontale.md)
- [x] Tasto indietro di Android: `MainActivity` chiede alla pagina `window.indietroApp()` (`js/indietro.js`, incluso nelle 50 pagine dei giochi): chiude il pannello della tavola; con una finestra dei giocatori aperta non fa nulla (va completata); da un gioco torna alla home; dalla home l'app va in secondo piano
- [x] Nell'app il pulsante «Schermo intero» del pannello non compare (`js/tavola.js` riconosce Capacitor)
- [x] Icona e schermata di avvio originali: asterisco dorato del marchio su fondo verde, da `scripts/icona-app.svg`; `scripts/genera-icone.mjs` produce le 26 immagini con Chrome senza finestra
- [x] Test del tasto indietro e del pulsante «Schermo intero» in `js/test-tavola.js`

## Come verificare

- Sull'emulatore (Android Studio): nessuna barra di sistema, il tasto indietro chiude il pannello, poi torna alla home, poi esce; l'icona compare nel menu delle app.
- Record e opzioni (`localStorage`) restano dopo aver chiuso e riaperto l'app.
- `node scripts/check.js` OK.

## Esito

- **Creati:** `js/indietro.js`, `scripts/icona-app.svg`, `scripts/genera-icone.mjs`. **Modificati:** `android/app/src/main/java/it/giochijs/app/MainActivity.java`, `AndroidManifest.xml` (verticale), `res/values/styles.xml` (schermata di avvio da Android 12), `res/values/ic_launcher_background.xml`, le icone e le schermate di avvio in `res/`, `js/tavola.js`, `js/test-tavola.js`, le 50 pagine dei giochi (una riga: `js/indietro.js`).
- **Verifiche sull'emulatore Pixel 6 (Android 13):** nessuna barra di sistema (Android mostra la prima volta il suo avviso «Visualizzazione a schermo intero»); in Scopa il tasto indietro chiude le regole, poi torna alla home, poi l'app va in secondo piano; nessun pulsante «Schermo intero» nel pannello; schermata di avvio verde con l'asterisco; icona nel cassetto delle app; un dato in `localStorage` resta dopo la chiusura forzata e la riapertura. `node scripts/check.js`: 58 suite, 0 controlli falliti.

## Decisioni prese

- Verticale per ora, orizzontale solo per alcuni giochi in una tappa a parte (scelta dell'utente): col telefono girato le pagine ricevono il layout da computer (tutti i CSS guardano solo la larghezza) e il gioco finisce sotto la prima schermata.
- Tasto indietro gestito in `MainActivity` con una funzione della pagina, senza il plugin `@capacitor/app`: una dipendenza in meno e la logica resta in un file JavaScript provato con i test (ADR 0013).
- Con una finestra dei giocatori aperta il tasto indietro non fa nulla: quelle finestre (parola segreta, «passa il telefono») non hanno un «annulla» e chiuderle bloccherebbe la partita.
- Dalla home l'app va in secondo piano (`moveTaskToBack`) invece di chiudersi: è quello che fanno le app di sistema da Android 12.

## Problemi aperti

- `localStorage` viene scritto su disco dalla WebView con qualche secondo di ritardo: se l'app viene chiusa di forza subito dopo un record, il record si perde (con 15 secondi di attesa resta). Nell'uso normale non dovrebbe succedere.
- Nel cassetto delle app il nome si legge tagliato («Giochi di un…»), come tutti i nomi lunghi. Se l'utente vuole, si può dare all'icona un nome più corto lasciando «Giochi di una volta» come nome dell'app.
