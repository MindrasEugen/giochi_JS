# Tappa 14 — Da tavolo: Ludo e Scacchi

Ultima modifica: 2026-11-04

## Obiettivo

Completare la categoria Da tavolo.

## Attività

- [x] Ludo / Non t'arrabbiare: da 2 a 4 giocatori, ognuno umano o PC, dado animato
- [x] Scacchi: tutte le regole (arrocco, presa en passant, promozione, scacco matto, stallo, patta per ripetizione e per le 50 mosse); 2 giocatori o contro il PC (minimax con alfa-beta, profondità in base alla difficoltà)
- [x] Design dei due giochi (Codex, con `css/gioco.css` per le parti comuni)

## Come verificare

- Scacchi: test con Node del numero di mosse possibili (perft) su posizioni note, confrontato con i valori pubblicati.
- jsdom e screenshot.

## Esito

Codice e test scritti da Claude, design da Codex, controllo finale di Claude.

File creati:
- `scacchi/`: `funzioni.js`, `main.js`, `index.html`, `style.css`, `test-scacchi.js`.
  - Logica: posizione da FEN, mosse pseudo-legali e legali, `attaccata`, arrocco (diritti, case libere, re non sotto scacco e non di passaggio su case attaccate), en passant, promozione nei 4 pezzi, `situazione` (scacco matto, stallo, 50 mosse, tripla ripetizione, materiale insufficiente), notazione algebrica con disambiguazione, `perft`.
  - Computer: negamax con potatura alfa-beta e tabelle di posizione; prova per prime le prese più vantaggiose. Facile metà delle volte gioca a caso, poi Media a 2 mosse e Difficile a 3.
  - Pagina:
    - destinazioni e prese evidenziate, re sotto scacco, ultima mossa;
    - scelta del pezzo nella promozione;
    - elenco delle mosse in notazione italiana (R, D, T, A, C);
    - pezzi catturati;
    - "Annulla mossa" (contro il computer toglie anche la sua risposta) e "Gira la scacchiera".
- `ludo/`: `funzioni.js`, `main.js`, `index.html`, `style.css`, `test-ludo.js`.
  - Logica: percorso di 52 caselle con le colonne di arrivo, partenze a 13 caselle di distanza, 8 caselle sicure, uscita con il 6, il 6 che fa ritirare (non più di 3 volte di fila), la mangiata che rimanda in base, l'arrivo con il tiro esatto.
  - Computer: dà un punteggio a ogni mossa (mangiare, arrivare, uscire, mettersi al sicuro, allontanarsi dal pericolo).
  - Pagina: tabellone 15 × 15 generato dal codice; da 2 a 4 giocatori, ogni colore giocato da una persona o dal computer; dado animato e pedine mobili evidenziate.
- `home.js`: Scacchi e Ludo nella categoria Da tavolo (15 giochi in tutto).

Verifica eseguita:
- `node scacchi/test-scacchi.js`: 36 controlli passati, tra cui **17 valori perft uguali a quelli pubblicati** (chessprogramming.org):
  - posizione iniziale fino a profondità 4 (197.281);
  - "Kiwipete" fino a 3 (97.862);
  - posizioni 3, 4 e 5.

  Poi: matto, stallo, materiale insufficiente, 50 mosse, tripla ripetizione, en passant (anche "una mossa dopo non si può più"), arrocco (anche attraverso case attaccate, sotto scacco, dopo aver mosso la torre), le 4 promozioni, la disambiguazione, il PC che mangia e dà matto. La mossa del Difficile richiede circa 0,3 s e il Media vince 6 partite su 6 contro il Facile.
- `node ludo/test-ludo.js`: 21 controlli passati:
  - tabellone: percorso collegato e senza caselle doppie, colonne di arrivo accanto all'ultima casella comune;
  - regole: uscita, 6, terzo 6, mangiata, caselle sicure, arrivo esatto;
  - 200 partite intere che finiscono tutte, con il PC che ne vince 182 contro chi muove a caso.
- jsdom, 25 controlli passati:
  - Scacchi: selezione, risposta del computer, annulla, matto dell'imbecille a 2 giocatori con notazione italiana, promozione a cavallo, arrocco, scacchiera girata;
  - Ludo: tabellone, dado, uscita con il 6, i tre computer che giocano da soli, turno passato senza mosse, 2 giocatori, vittoria;
  - home con 15 giochi.
- Screenshot guardati da Claude a 375 e 820 px durante il gioco: donna con destinazioni e presa, promozione, Ludo con pedine mobili e due pedine nella stessa casella.
- CSS: nessun `!important`, nessun colore scritto a mano, nessuna media query `max-width` (mobile-first), nessun BOM. Il sub-agente ha corretto la posizione di due pedine nella stessa casella.

## Decisioni prese

- Scacchi: contro il computer giochi con il bianco. Profondità 1, 2 e 3: il gioco risponde in meno di mezzo secondo anche sui telefoni; è un avversario discreto, non un motore da torneo.
- Scacchi: l'elenco delle mosse usa le lettere italiane dei pezzi; il motore lavora con quelle inglesi standard (K, Q, R, B, N), che servono anche ai test perft.
- Ludo: caselle sicure = le 4 partenze e le 4 stelle; con 2 giocatori si usano due colori opposti (rosso e giallo); non ci sono "blocchi" di due pedine.
- Ludo: da 2 a 4 colori, ognuno umano o computer; senza informazioni nascoste non serve la schermata "Passa il dispositivo" ([ADR 0008](../ADR/0008-due-giocatori-sullo-stesso-dispositivo.md)).

## Problemi aperti

- Scacchi su telefono: caselle di circa 40 px (sotto i 44 consigliati) e pezzi catturati piuttosto grandi quando sono molti.
- Ludo su telefono: quando 3 o 4 pedine sono nella stessa casella diventano piccole (circa 9 px), anche se restano cliccabili.
- Prova a occhio nel browser vero: la fa l'utente.
