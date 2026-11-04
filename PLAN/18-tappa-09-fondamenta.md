# Tappa 9 — Fondamenta per la nuova raccolta

Ultima modifica: 2026-11-04

## Obiettivo

Preparare il progetto a passare da 5 a circa 49 giochi: una home a categorie e un piccolo insieme di script condivisi, così ogni gioco nuovo non riscrive da zero mazzi, carte, turni e animazioni.

## Attività

- [x] Home a categorie (Classici, Mazzo italiano, Mazzo francese, Solitari, Arcade, Logica, Da tavolo, Parole) con una casella di ricerca e l'etichetta "2 giocatori" sulle schede ([ADR 0007](../ADR/0007-home-a-categorie-e-una-cartella-per-gioco.md))
- [x] Cartella `js/` con script condivisi caricati con `<script>` classici, senza moduli ([ADR 0006](../ADR/0006-script-condivisi-in-js-senza-moduli.md)):
  - [x] `mazzo.js`: mazzo italiano da 40 e francese da 52, mescolamento
  - [x] `carte.js`: percorso dell'immagine di ogni carta (italiana o francese) e del dorso, in `carte/`
  - [x] `giocatori.js`: scelta tra 1 e 2 giocatori, nomi, turno e schermata "Passa il dispositivo" per le carte coperte ([ADR 0008](../ADR/0008-due-giocatori-sullo-stesso-dispositivo.md))
  - [x] `arcade.js`: ciclo di gioco con `requestAnimationFrame`, tasti, pausa e record in `localStorage`
- [x] Immagini delle carte in `carte/`: l'utente ha aggiunto le 52 carte francesi più `back.png`; Claude ha spostato lì anche le 40 carte italiane più `dorso.png`, prima in `sette_e_mezzo/pic/` (`git mv`), e aggiornato il percorso in `sette_e_mezzo/main.js`
- [x] `css/carte.css` e `css/giocatori.css` (finestre dei 2 giocatori) per tavolo, mano, carte coperte e animazione di distribuzione, condiviso dai giochi di carte
- [x] Test con Node delle funzioni pure di `mazzo.js`: 40 e 52 carte, nessun doppione, il mescolamento non perde carte

## Come verificare

- Home: i 5 giochi attuali nelle loro categorie, la ricerca filtra le schede, nessuno scorrimento orizzontale a 375 px.
- `node js/test-mazzo.js` passa.
- Sette e mezzo funziona con le immagini nella nuova cartella (già verificato: le 40 carte generate dal codice trovano tutte il loro file e lo screenshot mostra la carta). Dopo il push si ricontrollano tutti gli indirizzi del sito su Render.

## Esito

Codice scritto da Claude, design da Codex (due giri), controllo finale di Claude.

File creati o modificati:
- `js/mazzo.js` (oggetto `Mazzo`): mazzo italiano e francese, `mescola` (Fisher-Yates, non modifica l'originale), `pesca`, `distribuisci`, `colore`, `nome` ("donna di cuori"), `uguali`.
- `js/carte.js` (oggetto `Carte`): percorso di immagini e dorsi in `carte/`, `crea()` per l'elemento `<img class="carta">`, con un alt generico per le carte coperte, e `aVentaglio()` per la mano a ventaglio.
- `js/giocatori.js` (oggetto `Giocatori`): `passaDispositivo`, `chiediSegreto` (campo nascosto con pulsante Mostra), `chiediNomi` (salvati in `localStorage`), `annuncia`. Il focus resta dentro la finestra e torna dove era alla chiusura.
- `js/arcade.js` (oggetto `Arcade`): ciclo a passo fisso, tasti, pausa automatica quando si cambia scheda, record, `adattaCanvas`.
- `js/test-mazzo.js`: prova con Node.
- `home.js` più `index.html`: home a categorie disegnata da un unico array, con ricerca che non distingue maiuscole e accenti.
- `anteprima-componenti.html`: pagina di servizio, non collegata dalla home, che mostra carte, ventaglio, pila, tavolo e finestre.
- Codex: `css/home.css` riscritto, `css/carte.css` e `css/giocatori.css` nuovi.
- `carte/`: le 52 carte francesi aggiunte dall'utente e le 40 italiane spostate da `sette_e_mezzo/pic/`. Sette e mezzo ora usa `Mazzo` e `Carte`.

Verifica eseguita:
- `node js/test-mazzo.js`: 18 controlli passati. Tra questi: 40 e 52 carte senza doppioni, mescolamento uniforme su 20.000 prove (tutte le 24 permutazioni di 4 carte, tra 764 e 891 uscite ciascuna, attese 833), le 92 immagini e i 2 dorsi esistono, passo fisso dell'arcade.
- jsdom, 25 controlli passati:
  - home: 5 schede in 4 categorie, link esistenti, ricerca;
  - finestre dei 2 giocatori: apertura, focus, valore restituito, controllo dell'input, salvataggio dei nomi, dati rovinati;
  - Sette e mezzo: punteggio uguale alla somma delle carte mostrate.
- Rieseguiti i test delle tappe precedenti: Tris, minimax e i tre giochi della Tappa 8. Il vecchio test di Sette e mezzo è stato aggiornato al nuovo formato delle carte.
- Screenshot (guardati da Claude) a 1100 px e a 375 px:
  - la home e l'anteprima non scorrono in orizzontale;
  - il ventaglio è simmetrico e 10 carte stanno nei 375 px;
  - la finestra "Parola segreta" si vede sopra il resto della pagina sfocato.
- Codex ha controllato che non ci siano `!important` né colori scritti a mano: si usano solo le variabili di `comune.css`.

## Decisioni prese

- Script condivisi in `js/`, un oggetto globale per script, nessun modulo ([ADR 0006](../ADR/0006-script-condivisi-in-js-senza-moduli.md)).
- Home disegnata da un array in `home.js` ([ADR 0007](../ADR/0007-home-a-categorie-e-una-cartella-per-gioco.md)). Categorie dei giochi attuali: Classici (Sasso carta forbici, Indovina il numero), Mazzo italiano (Sette e mezzo), Da tavolo (Tris), Parole (Impiccato). Le categorie vuote non si mostrano.
- Immagini di tutte le carte in un'unica cartella `carte/`, scelta dall'utente. Le carte francesi sono immagini, non disegni in CSS.
- Il ventaglio usa `--i` e `--n`, impostate da `Carte.aVentaglio()`, perché il CSS da solo non sa quante carte ci sono nella mano.
- Il design è affidato a Codex, il codice lo scrive Claude, come ha chiesto l'utente.

## Problemi aperti

- La carta selezionata della mano a ventaglio si solleva di circa 28 px invece di 14, perché si sommano il sollevamento dell'immagine e quello del ventaglio. Da ritoccare quando la mano verrà usata in un gioco (Tappa 18).
- `css/carte.css` ha qualche riga vuota prima della chiusura di `@media` e `@keyframes`. È solo formattazione.
- La home con circa 49 giochi si potrà vedere solo man mano che i giochi arrivano.
