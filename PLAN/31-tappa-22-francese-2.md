# Tappa 22 — Mazzo francese: Poker heads-up, Scala 40, Ramino, Burraco

Ultima modifica: 2026-11-05

## Obiettivo

I giochi di carte francesi più complessi.

## Attività

- [x] Poker Texas Hold'em heads-up: contro il PC o 2 giocatori con "Passa il dispositivo", puntate finte, valutazione delle mani (primo passo, CSS di Codex)
- [x] Scala 40 e Ramino: combinazioni (scale e tris), apertura, jolly (passo 2)
- [x] Burraco: a 2 contro il PC, pozzetti, burraco pulito e sporco (passo 3; anche 2 persone)

## Come verificare

- Test con Node: valutazione delle mani del poker in tutte le categorie, validità di scale e tris.
- jsdom e screenshot.

## Esito

La tappa è divisa in tre passi, con un commit ciascuno.

- **Passo 1 — Poker heads-up** (`poker/`): valutazione della migliore mano di 5 carte su 7 in tutte le categorie, bui 5/10, giri di puntata con vedi, rilancio (minimo, piatto, tutto) e lascia, tutto dentro con restituzione delle fiches non coperte, piatto diviso. Il PC stima la forza della propria mano simulando 250 volte le carte che non vede. Test: `node poker/test-poker.js`, `node poker/test-pagina.js`. Controllo negli screenshot fatto.
- **Passo 2 — Scala 40 e Ramino** (`scala40/`, `ramino/`): motore comune delle combinazioni `js/combinazioni.js` (scale e tris con jolly, asso basso o alto, punti, ricerca delle combinazioni migliori), motore di partita `js/ramino.js` con le due varianti, pagina condivisa `js/ramino-pagina.js` e CSS `css/ramino.css` (Codex, tre giri). Jolly disegnato in CSS (non c'è un'immagine). Test: `node js/test-combinazioni.js`, `node js/test-ramino.js`, `node js/test-ramino-pagine.js`.
- **Passo 3 — Burraco** (`burraco/`): stesso motore delle combinazioni con le regole del Burraco (pinella come matta o carta normale, carte uguali senza limite di semi, niente tris di 2), pozzetto in diretta o con lo scarto, burraco pulito e sporco, chiusura e conteggio. Test: `node burraco/test-burraco.js`, `node burraco/test-pagina.js`.
- I passi 2 e 3 sono nello stesso commit, perché condividono `js/combinazioni.js`, `css/ramino.css` e la home.

## Decisioni prese

- **Due giocatori** in Scala 40, Ramino e Burraco (contro il PC o due persone che si passano il dispositivo): le partite a 3–6 sono fuori da questa tappa.
- **Scala 40:** 13 carte, apertura 40, scarto preso solo dopo aver aperto e da usare subito, divieto di scartare una carta che attacca, chiusura in mano anche sotto i 40, uscita a 101. Niente recupero del jolly.
- **Ramino:** 13 carte invece delle 8 indicate come più diffuse da Wikipedia (variante citata dalla stessa voce): con 8 carte e apertura a 50 i PC spesso non aprivano mai. Apertura 50, scarto preso anche per aprire, punti arrotondati alla decina, uscita a 200.
- **Burraco:** si attacca solo alle proprie combinazioni, punti F.I.Bur. (pulito 200, sporco 100, chiusura 100, pozzetto non preso −100), uscita a 1005. Solo burraco pulito e sporco (niente semipulito).
- **Sicurezze contro le mani infinite** (trovate con le simulazioni PC contro PC): in Scala 40 e Ramino la mano si chiude al terzo esaurimento del tallone e ognuno paga le sue carte; nel Burraco la mano si chiude dopo 10 turni senza pescate dal tallone, e dopo il pozzetto bisogna tenere una carta normale (e due senza burraco) per non restare bloccati.
- **Poker:** 500 fiches a testa, bui fissi 5/10, rilanci a tre misure (minimo, quanto il piatto, tutto) per tenere pochi pulsanti sul telefono. La partita finisce quando un giocatore resta senza fiches. In due si passa il dispositivo prima di ogni scelta.

## Problemi aperti

—
