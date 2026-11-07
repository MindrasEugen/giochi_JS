# Tappa 32 — Solitari: suggerimento e avviso quando non ci sono più mosse

Ultima modifica: 2026-11-07

## Obiettivo

Richiesta dell'utente: nei solitari serve un **suggerimento** per chi si blocca e un **messaggio** che avvisi quando non ci sono più mosse possibili.

Vale per tutti i 10 solitari: Klondike, FreeCell, Spider, Piramide, Golf, TriPeaks, Yukon, Scorpione, Orologio, Le tredici. Usano già la stessa pagina (`js/solitario-pagina.js`) e le stesse funzioni delle regole (`puoPrendere`, `puoPosare`, `sposta`, `clicMazzo`), quindi basta un solo aiutante comune, senza toccare le regole dei singoli giochi.

Oggi l'avviso esiste solo in 4 giochi (Piramide, Golf, TriPeaks, Orologio), che hanno già un controllo esatto `bloccata()`. Negli altri 6 la partita può restare ferma senza che il gioco lo dica.

## Come funziona l'aiutante (nuovo file `js/solitario-aiuto.js`)

- **Elenco delle mosse:** per ogni pila e ogni carta che si può prendere, prova tutte le destinazioni dove si può posare; in più il clic sul mazzo, se c'è. Scarta le mosse inutili (per esempio spostare una colonna intera in una colonna vuota, o riprendere una carta dalla base).
- **Cosa vuol dire "fare progressi":** una carta in più sulle basi (o una scala completata), una carta coperta che si scopre, una carta in meno sul tavolo.
- **Ricerca in avanti:** prova le mosse su una copia della partita, con il giro completo del mazzo a ogni passo, entro un limite di posizioni e di tempo. Il **suggerimento** è la prima mossa della strada più corta che porta a un progresso.
- **Nessuna mossa utile:** solo quando la ricerca ha guardato tutte le posizioni raggiungibili senza trovare progressi (vedi Decisioni prese: all'inizio il limite era di 3 mosse).

## Attività

- [x] `js/solitario-aiuto.js`: elenco delle mosse, misura dei progressi, ricerca, funzioni `suggerisci(motore, stato)` e `bloccato(motore, stato)`. Solo logica, senza pagina, provabile con node.
- [x] **Pulsante «Suggerimento»** accanto ad «Annulla» nei 10 `index.html`. Al tocco:
  - si illuminano per circa 3 secondi la carta (o le carte) da spostare e la pila di destinazione;
  - un messaggio spiega la mossa, per esempio «Sposta il 7♥ sull'8♣» oppure «Gira una carta dal mazzo»;
  - se non c'è niente da suggerire: «Nessuna mossa utile: annulla qualche mossa o inizia una nuova partita».
- [x] **Avviso automatico** dopo ogni mossa, per i 6 solitari senza controllo esatto: se l'aiutante non trova più mosse utili, compare il riquadro «Nessuna mossa utile». La partita **non** si chiude: Annulla resta attivo per tornare indietro. Per Spider e Scorpione l'avviso non compare finché ci sono carte da distribuire dal mazzo.
- [x] I 4 solitari con il controllo esatto restano come sono (la partita si chiude con «Nessuna mossa possibile»). Al messaggio si aggiunge l'invito a iniziare una nuova partita.
- [x] **CSS** (Codex, come le altre tappe di design): carta e pila suggerite ben visibili ma diverse dalla carta selezionata; quattro pulsanti nella riga delle azioni anche a 375px; riquadro dell'avviso. Mobile-first, solo variabili del design system.
- [x] **Regole:** una riga sul suggerimento nelle regole dei 10 giochi; riga dei solitari nel `README.md`.
- [x] **Test** (`js/test-solitari-aiuto.js`): partite costruite a mano per ogni gioco con una mossa utile nota (il suggerimento deve trovarla), partite senza mosse utili (l'aiutante deve dirlo), Klondike con la carta utile in fondo al mazzo (suggerimento «gira dal mazzo»), Spider con mazzo pieno (mai bloccato); il suggerimento applicato non deve mai dare una mossa non valida; tempo della ricerca misurato su partite vere (obiettivo: sotto i 50 ms).
- [x] Prova nel browser (412×880, 375×667, schermo largo) e nuovo APK
- [x] Prova sul telefono (utente): «il pulsante l'ho provato in diversi giochi e funziona bene, ed è anche abbastanza visibile»
- [x] ADR 0014: aiutante comune con ricerca in avanti, invece di un suggerimento scritto gioco per gioco.

## Come verificare

- `node scripts/check.js`: tutte le suite OK, compresa quella nuova.
- Nel browser, in ogni solitario: il suggerimento illumina una mossa valida e, seguendolo, la mossa riesce.
- Una partita bloccata (preparata dalla console) mostra l'avviso; Annulla funziona ancora.
- Sul telefono i quattro pulsanti stanno su una riga e le carte suggerite si vedono bene.

## Esito

- **Creati:** `js/solitario-aiuto.js` (aiutante), `js/test-solitari-aiuto.js`, `ADR/0014-aiutante-comune-dei-solitari.md`.
- **Modificati:** `js/solitario-pagina.js` (pulsante, evidenza per 3 secondi, avviso dopo ogni mossa, all'annulla e alla nuova partita; invito alla nuova partita nei 4 giochi con il controllo esatto), i 10 `index.html` (script, pulsante, riga delle regole), `README.md`, `ADR/README.md`; CSS di Codex in `css/solitario.css` (carta e pila suggerite in blu con un leggero pulsare, avviso arancione) e `css/tavola.css` (quattro pulsanti su una riga sul telefono).
- **Prove su partite casuali (15 per gioco, seguendo sempre il suggerimento):** nessun suggerimento non valido; tempo medio da 0 a 21 ms, massimo circa 250 ms (il limite).
- **Avvisi sbagliati:** confrontati con una ricerca 20 volte più grande su 60 partite (Klondike, Yukon, Le tredici, Scorpione, FreeCell, Spider): 0 avvisi sbagliati su 34.
- **Verifiche:** `node scripts/check.js`: 59 suite, 0 controlli falliti. Nel browser (Chrome headless) in tutti e 10 i giochi: il suggerimento illumina carte e destinazione e si spegne dopo 3 secondi, il messaggio descrive la mossa; Klondike senza mosse utili mostra l'avviso e il pulsante Annulla non chiude la partita; a 375×667 quattro pulsanti su una riga senza testo tagliato; da 600px in su pulsanti con le stesse misure del commit precedente; nessun errore nella console.
- **APK** rigenerato.

## Decisioni prese

- Un solo aiutante comune per tutti i solitari: le regole dei giochi restano dove sono, l'aiutante usa le loro funzioni. Un gioco nuovo avrà il suggerimento senza lavoro in più.
- Prima versione con 3 mosse di profondità: più di metà degli avvisi erano sbagliati (la via d'uscita era più lunga). Poi 6 mosse: in Klondike ancora 4 avvisi sbagliati su 7. Decisione finale: nessun limite di profondità, solo di posizioni (20.000) e di tempo (250 ms dopo ogni mossa, 800 ms al tocco del pulsante). L'avviso compare solo se la ricerca ha guardato tutto; se il tempo finisce prima, niente avviso e il suggerimento dice «Non trovo un suggerimento in poco tempo» (ADR 0014).
- Pesi del progresso: carta sulla base 4, carta scoperta 2, colonna o cella libera 1. Con pesi uguali, scoprire una carta occupando una colonna vuota contava zero e Klondike risultava bloccato quando non lo era.
- L'avviso automatico non chiude la partita (Annulla resta attivo); i 4 giochi con il controllo esatto restano come prima.
- Suggerimenti senza limiti e senza penalità.

## Problemi aperti

- Manca la prova sul telefono con l'APK nuovo (utente).
- Sul telefono il riquadro dell'avviso sta sotto i pulsanti e può restare fuori dallo schermo; lo stesso testo compare comunque nella riga dei messaggi sopra i pulsanti.
- I suggerimenti portano al prossimo progresso, non alla vittoria: seguendoli sempre non si vincono tutte le partite (con le partite di prova: Klondike 3 su 15, TriPeaks 8 su 15, FreeCell 0 su 15).
