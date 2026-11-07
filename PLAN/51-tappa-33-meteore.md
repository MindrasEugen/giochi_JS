# Tappa 33 — Meteore: nuovo gioco arcade nello spazio

Ultima modifica: 2026-11-07

## Obiettivo

Richiesta dell'utente: aggiungere alla sala arcade un gioco nello spazio con una navicella e un campo di rocce che si spezzano quando le colpisci (il genere dei vecchi giochi a meteoriti delle sale giochi). Nome scelto da Claude: **Meteore** (☄️). Grafica e testi originali, con i colori del design system, come gli altri arcade.

Il gioco usa la base comune degli arcade (`js/arcade.js`, `js/arcade-pagina.js`, `css/arcade.css`): canvas, tabellone, pausa, record, gesti sul telefono. Si gioca da soli (come Invasione e Mattoncini), con il record personale.

## Regole proposte

- La navicella **ruota** a sinistra e a destra, **accelera** in avanti e **spara**. Nello spazio non c'è attrito: continua a scivolare e rallenta solo di pochissimo.
- Chi esce da un bordo rientra dal lato opposto: navicella, colpi e rocce.
- Le rocce sono di tre misure: una **grande** colpita si spezza in due **medie**, una media in due **piccole**, una piccola sparisce. I pezzi sono più veloci.
- **Punti:** grande 20, media 50, piccola 100.
- **Ondate:** la prima ha 4 rocce grandi; ogni ondata una in più (fino a 11) e un po' più veloci. Ripulito lo schermo, dopo una breve pausa arriva l'ondata successiva. Ondate infinite: la partita finisce quando finiscono le vite.
- **Vite:** 3, e una in più ogni 10.000 punti. Se una roccia tocca la navicella perdi una vita; la navicella riappare al centro ed è intoccabile per 2 secondi (lampeggia).
- Al massimo 4 colpi in volo; ogni colpo dura poco meno di un secondo.

## Comandi

- **Tastiera:** ← → o A/D per ruotare, ↑ o W per accelerare, Spazio per sparare (tenuto premuto: sparo continuo con una cadenza fissa).
- **Pulsanti sullo schermo:** Sinistra, Spinta, Spara, Destra (sul telefono si mostrano dal menu ⋯, come negli altri arcade).
- **Gesti sul telefono:** con il dito appoggiato sul campo la navicella si gira verso il dito e spara di continuo; se il dito è lontano dalla navicella (più di un terzo del campo) accelera anche verso di lui. Da verificare nella prova sul telefono.

## Attività

- [x] **Logica** (`meteore/funzioni.js`, oggetto `Meteore`): stato della partita, movimento senza attrito, rientro dai bordi, rocce con forma irregolare fissa, spaccatura in pezzi, colpi, collisioni (cerchi), punti, ondate, vite, vita extra, invulnerabilità dopo una vita persa.
- [x] **Pagina** (`meteore/index.html`, `meteore/main.js`): struttura come Mattoncini, con `ArcadePagina.avvia`; disegno a linee della navicella (con la fiamma quando accelera), delle rocce e dei colpi; tabellone con Punti, Vite, Ondata, Record; regole e comandi.
- [x] **Campo sul telefono:** come gli altri arcade della Tappa 29.2, il campo si allunga in verticale fino allo spazio libero.
- [x] **Stile:** il campo è un canvas, quindi `meteore/style.css` resta il file con il solo commento comune. Se servisse un ritocco CSS (per esempio quattro pulsanti su una riga a 375px), lo fa codex-worker.
- [x] **Home e testi:** voce in `home.js` (categoria arcade, solo 1 giocatore), totale dei giochi da 50 a 51 in `index.html` e `README.md`.
- [x] **Test** (`meteore/test-meteore.js`): rientro dai bordi, rotazione e spinta senza attrito, spaccatura grande → 2 medie → 2 piccole → niente, punti per misura, massimo 4 colpi, durata dei colpi, vita persa e invulnerabilità, vita extra a 10.000, ondata successiva con una roccia in più, fine partita a 0 vite, nessuna roccia che nasce sopra la navicella.
- [x] Controllo dei test comuni (`js/test-arcade-pagine.js`, `scripts/test-interfacce.js`) e della lista dei file copiati per l'app (`scripts/build-www.js`).
- [x] Prova nel browser (412×880, 375×667 e schermo largo) e nuovo APK.
- [ ] Prova sul telefono (utente): gesti, pulsanti dal menu ⋯, velocità del gioco.

## Come verificare

- `node scripts/check.js`: tutte le suite OK, compresa quella nuova.
- Nel browser: la home mostra Meteore tra gli arcade e il totale 51; nella partita le rocce si spezzano, i punti sono giusti, la navicella rientra dai bordi, dopo l'ultima roccia arriva l'ondata nuova; nessun errore nella console, nessuno scorrimento sul telefono.
- Sul telefono (utente): gesti comodi, pulsanti dal menu ⋯ funzionanti.

## Esito

- **Creati:** `meteore/funzioni.js` (logica), `meteore/main.js` (pagina e disegno), `meteore/index.html`, `meteore/style.css` (solo il commento comune), `meteore/test-meteore.js`.
- **Modificati:** `home.js` (voce ☄️ tra gli arcade), `index.html` e `README.md` (51 giochi, riga della sala arcade), `scripts/test-interfacce.js` (51 giochi), `js/test-arcade-pagine.js` (Meteore tra le pagine arcade, con il controllo del dito: mira in coordinate del campo e sparo finché il dito resta appoggiato).
- **Numeri scelti:** rocce di raggio 40 / 23 / 12 con contorno irregolare di 10 punti; velocità delle rocce 38 + 6 per ondata (fino alla 10), ×1,45 per le medie e ×1,9 per le piccole; navicella di raggio 15, rotazione 4,2 rad/s (7 con il dito), spinta 270, velocità massima 360, freno del 25% al secondo; colpi a 480 più la velocità della navicella, durata 0,9 s, uno ogni 0,22 s; dito «lontano» oltre un terzo del lato corto del campo (200 unità); pausa tra le ondate 1,5 s; le rocce nascono sui bordi ad almeno 150 unità dalla navicella.
- **Verifiche:** `node scripts/check.js`: 60 suite, 0 controlli falliti. Nel browser (Chrome headless) a 412×880, 375×667 e 1280×900: rocce delle tre misure, navicella con la fiamma, colpi, punti e tabellone «Ondata 1», nessun errore nella console, nessuno scorrimento sul telefono (sullo schermo largo la pagina scorre come gli altri arcade). I quattro pulsanti, mostrati, stanno su una riga anche a 375px (324 px): nessun CSS da aggiungere, quindi nessun lavoro per codex-worker.
- **Ritocco dopo le schermate:** navicella da raggio 12 a 15 e colpi più grandi, perché sul telefono il campo è rimpicciolito e la navicella si vedeva poco.
- **APK:** `android/app/build/outputs/apk/debug/app-debug.apk` rigenerato (`pnpm sync` e `gradlew assembleDebug`).

## Decisioni prese

- Nome **Meteore** e grafica originale: niente nome, look o suoni del gioco del 1979 a cui si ispira il genere.
- Solo 1 giocatore, con record personale, come Invasione e Mattoncini.
- Logica senza `Math.random` fisso: `Meteore.crea(altezza, caso)` riceve il generatore di numeri casuali, così i test usano sempre le stesse rocce.
- Il dito sul campo usa i gesti comuni (`trascina` per la mira, `tieni: 'Space'` per lo sparo): nessuna modifica a `js/arcade-pagina.js`. Quando il dito si alza, lo sparo tenuto si spegne e la pagina toglie anche la mira.
- Niente astronave nemica e niente salto nell'iperspazio in questa tappa (vedi [Fuori MVP](90-fuori-mvp.md)).

## Problemi aperti

- La [Tappa 32](50-tappa-32-solitari-aiuto.md) aspetta ancora la prova sul telefono: le due prove si possono fare con lo stesso APK nuovo.
