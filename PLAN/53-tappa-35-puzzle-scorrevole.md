# Tappa 35 — Puzzle scorrevole: nuovo gioco di logica

Ultima modifica: 2026-11-09

## Obiettivo

Richiesta dell'utente: aggiungere alla raccolta un **puzzle scorrevole** per un giocatore. Una griglia quadrata contiene un'immagine divisa in tasselli, con un tassello mancante. Si fanno scorrere nello spazio vuoto i tasselli vicini finché l'immagine torna intera. Il gioco va nella categoria **logica**, insieme a Sudoku e Campo minato (scheda 🖼️, solo 1 giocatore).

## Regole (dalla descrizione dell'utente)

- **Immagini:** salvate nel progetto, in `puzzle_scorrevole/immagini/`. A ogni nuova partita se ne sceglie una a caso, diversa da quella appena giocata quando ce n'è più di una. Il browser non può leggere il contenuto di una cartella: l'elenco dei file lo scrive lo script `scripts/elenco-immagini.js` in `puzzle_scorrevole/immagini.js` (vedi Esito).
- **Livelli:** 3×3 (facile), 4×4 (medio), 5×5 (difficile). Si scelgono prima di iniziare. Il tassello mancante è quello in basso a destra.
- **Mescolamento:** si parte dal puzzle risolto e si fanno mosse legali a caso (80 per il 3×3, 200 per il 4×4, 400 per il 5×5), senza annullare subito la mossa appena fatta. Così la partita è sempre risolvibile. Se alla fine il puzzle è ancora risolto, si mescola di nuovo.
- **Mosse:** tocchi o clicchi un tassello vicino allo spazio vuoto e lui ci scivola dentro. Con la tastiera, le frecce muovono il tassello verso lo spazio vuoto.
- **Contatori:** mosse e tempo. Il tempo parte alla prima mossa.
- **Suggerimenti:** un pulsante, al massimo tre per partita, con il numero che resta («Suggerimento (3)», poi 2, poi 1). A zero si disattiva. Il suggerimento evidenzia il tassello da muovere per avvicinarsi alla soluzione.
- **Anteprima:** un pulsante mostra in piccolo l'immagine finale.
- **Vittoria:** compare il tassello mancante, si vede l'immagine intera, poi il riepilogo con mosse, tempo e suggerimenti usati e il pulsante «Nuova partita».

## Come si sceglie il suggerimento

- **3×3:** ricerca completa (IDA*, una variante di A* che usa poca memoria, con distanza di Manhattan e conflitti lineari). Il suggerimento è sempre la prima mossa di una soluzione più corta possibile.
- **4×4 e 5×5:** una soluzione più corta possibile è troppo lenta da calcolare su un telefono. Si usa una ricerca A* pesata (vedi Esito), fermata dopo un numero massimo di posizioni esaminate; se non trova la soluzione entro il limite, si ripercorre all'indietro la storia della partita fino al puzzle risolto. Il suggerimento avvicina alla soluzione ma non è sempre il più corto.

## Attività

- [x] **Immagini:** 6 illustrazioni originali in SVG disegnate da Claude (paesaggi e scene colorate, con dettagli diversi in ogni zona per orientarsi), in `puzzle_scorrevole/immagini/`.
- [x] **Logica** (`puzzle_scorrevole/funzioni.js`, oggetto `Puzzle`): griglia risolta, mosse legali, mossa di un tassello, mescolamento con un generatore di numeri casuali passato da fuori (come Meteore), controllo della vittoria, scelta dell'immagine senza ripetere l'ultima, calcolo del suggerimento.
- [x] **Pagina** (`puzzle_scorrevole/index.html`, `puzzle_scorrevole/main.js`): scelta del livello, griglia di pulsanti con la parte d'immagine giusta (`background-image` e `background-position`), contatori di mosse e tempo, pulsanti Suggerimento, Anteprima e Nuova partita, tastiera, riepilogo finale, regole.
- [x] **Stile** (`puzzle_scorrevole/style.css`): delegato a codex-worker, mobile-first, solo variabili del design system: griglia quadrata che sta nello schermo del telefono, scivolamento dei tasselli, tassello suggerito evidenziato, anteprima piccola, immagine intera alla vittoria.
- [x] **Home e testi:** voce in `home.js` (logica, 1 giocatore), totale da 51 a 52 in `index.html`, `README.md` e `scripts/test-interfacce.js`.
- [x] **Test** (`puzzle_scorrevole/test-puzzle.js`): mosse solo vicino allo spazio vuoto, mescolamento sempre risolvibile e mai già risolto, vittoria riconosciuta, tempo che parte alla prima mossa, tre suggerimenti al massimo, suggerimento esatto sul 3×3 e suggerimento che porta davvero alla soluzione (seguendo solo i suggerimenti) su posizioni facili del 4×4 e 5×5, immagine diversa dalla precedente.
- [x] Prova nel browser (412×880, 375×667, schermo largo) e nuovo APK.
- [x] Prova sul telefono (utente), con le 18 immagini e l'elenco automatico. Esito (2026-11-09): «tutto okay».

## Come verificare

- `node scripts/check.js`: tutte le suite OK, compresa quella nuova.
- Nel browser: la home mostra Puzzle scorrevole tra i giochi di logica e il totale 52; i tre livelli partono mescolati; il contatore delle mosse sale, il tempo parte alla prima mossa; il suggerimento evidenzia un tassello mobile e il pulsante scende da 3 a 0; l'anteprima si apre e si chiude; alla vittoria compare l'immagine intera con il riepilogo; nessun errore nella console, nessuno scorrimento sul telefono.
- Sul telefono (utente): tasselli comodi da toccare anche nel 5×5, suggerimento ben visibile.

## Esito

- **Creati:** `puzzle_scorrevole/funzioni.js` (logica, oggetto `Puzzle`), `main.js` (pagina), `index.html`, `style.css` (Codex), `test-puzzle.js`, le 6 immagini in `puzzle_scorrevole/immagini/` (lago, faro, mongolfiere, barriera, città, bosco), [ADR 0015](../ADR/0015-puzzle-scorrevole-suggerimento-e-immagini.md).
- **Modificati:** `home.js` (voce 🖼️ tra i giochi di logica), `index.html` e `README.md` (52 giochi), `scripts/test-interfacce.js` (52 giochi).
- **Suggerimento:** 3×3 esatto (IDA*); 4×4 con A* pesato ×3 (al massimo 60.000 posizioni), 5×5 ×5 (30.000), senza rimettere indietro il tassello appena mosso; riserva: la storia della partita all'indietro, saltando i giri a vuoto. Tempi sul PC: al massimo circa 30 ms (4×4) e 150 ms (5×5).
- **Vittoria:** il riepilogo prende il posto dei pulsanti Suggerimento e Anteprima, così la griglia non cambia misura; la griglia mostra l'immagine intera come sfondo e i tasselli sfumano (niente righe tra i tasselli).
- **Immagini dell'utente:** il 2026-11-09 l'utente ha aggiunto 12 illustrazioni SVG quadrate (da `01-montagne-al-tramonto.svg` a `12-paesaggio-vulcanico.svg`), controllate (nessuno script o collegamento esterno) e messe nell'elenco con il nome del loro titolo: 18 immagini in tutto. Nuovo test: ogni immagine della cartella deve stare nell'elenco.
- **Elenco automatico** (richiesta dell'utente): `scripts/elenco-immagini.js` scrive `puzzle_scorrevole/immagini.js` leggendo la cartella; nome dal `<title>` dell'SVG o dal nome del file. Gira con `pnpm immagini`, `pnpm build` e `pnpm sync`. Alle 6 immagini di Claude aggiunto il `<title>`. Il test confronta l'elenco con la cartella; provato con un'immagine finta senza titolo («Prova temporanea»), poi tolta. [ADR 0016](../ADR/0016-elenco-automatico-immagini-puzzle.md).
- **Codex (CSS):** tre giri da 1-3 minuti, sempre solo `style.css`. Difetti visti da Claude nelle schermate e sistemati nei giri successivi: griglia piccola sul telefono (267 px con 130 px vuoti sotto) che si rimpiccioliva alla vittoria, anteprima sopra il tempo, messaggio di vittoria a sinistra, righe chiare tra i tasselli nell'immagine completa.
- **Verifiche:** `node scripts/check.js`: 61 suite, 0 controlli falliti (la nuova suite controlla anche, con una visita di tutte le 181.440 posizioni del 3×3, che il suggerimento sia sempre esatto). Chrome headless: a 375×667 griglia di 359 px e pagina senza scorrimento, anche alla vittoria; a 375×600 griglia di 344 px; a 412×880 griglia di 396 px; schermo largo come gli altri giochi di logica. Nessun `@media max-width`.
- **APK:** `android/app/build/outputs/apk/debug/app-debug.apk` rigenerato (`pnpm sync` e `gradlew assembleDebug`). Il file `android/local.properties` non c'era più: il percorso dell'SDK è stato passato con `ANDROID_HOME` solo per il comando.

## Decisioni prese

- **Immagini in SVG preparate da Claude** (scelta dell'utente, 2026-11-09): nel progetto non c'erano immagini adatte; l'SVG resta nitido a ogni dimensione della griglia, pesa poco e funziona offline nell'app. Altre immagini si aggiungono copiando il file nella cartella (elenco automatico, [ADR 0016](../ADR/0016-elenco-automatico-immagini-puzzle.md)).
- **Suggerimento a ricerca** (esatto sul 3×3, A* pesato con riserva sul 4×4 e 5×5): la soluzione più corta sul 4×4 e 5×5 è troppo lenta da calcolare sul telefono; vedi [ADR 0015](../ADR/0015-puzzle-scorrevole-suggerimento-e-immagini.md).
- **Nessun record:** la richiesta non lo prevedeva; mosse, tempo e suggerimenti usati compaiono nel riepilogo finale.

## Problemi aperti

- Nessuno.
