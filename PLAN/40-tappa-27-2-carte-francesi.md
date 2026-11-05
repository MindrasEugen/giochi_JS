# Tappa 27.2 — Schermo intero: giochi con il mazzo francese

Ultima modifica: 2026-11-05

## Obiettivo

Blackjack, Guerra, Cambio colore, Poker, Scala 40, Ramino, Burraco. Da valutare all'inizio se servono le carte semplificate dei solitari: oggi a 375px le carte di Scala 40 e Burraco sono larghe 26-56px. Stesso metodo della [Tappa 27.1](39-tappa-27-1-carte-italiane.md); le attività di dettaglio si scrivono all'inizio della sotto-tappa, dopo aver guardato i giochi a 375px.

## Attività

- [x] Guardati i 7 giochi a 375×667: pagine alte 1068-1646px; carte in mano di Scala 40, Ramino e Burraco larghe 40px, combinazioni 26-34px; Blackjack, Guerra e Poker 60-64px; in Cambio colore tre file di dorsi degli avversari
- [x] `data-pannello`, `js/tavola.js` e `css/tavola.css` sulle 7 pagine
- [x] Scala 40, Ramino, Burraco: sul telefono carte scoperte semplificate (come nei solitari), con l'opzione del pannello «Carte con le immagini anche quando sono piccole»; mano in griglia (`--colonne`, al massimo 7 per riga)
- [x] Carta semplificata spostata da `js/solitario-pagina.js` a `js/carte.js` (`Carte.semplice`), per usarla in tutti i giochi; `Carte.colonne` per le colonne della mano
- [x] `Tavola.telefono()` ed evento `tavola:schermo` in `js/tavola.js` (le pagine ridisegnano le carte quando lo schermo cambia)
- [x] Cambio colore: colonne della mano; Poker, Cambio colore, Scala 40, Ramino, Burraco: il PC aspetta con il pannello aperto; Guerra: il gioco automatico si ferma aprendo il pannello
- [x] Test: `js/test-carte-francesi-tavola.js` (carte semplificate, opzione, colonne, PC fermo), `js/test-tavola.js` (telefono, evento)
- [x] CSS (Codex): carte semplificate in Scala 40/Ramino/Burraco, Poker, Blackjack, Guerra con carte più grandi, Cambio colore con avversari compatti
- [x] Verifiche nel browser (375×667, 390×844) e confronto delle misure a 600/900/1280px
- [x] Prova su telefono (utente): via alla tappa successiva («procedi», 2026-11-05)

## Come verificare

Vedi [Tappa 27](38-tappa-27-schermo-intero-tutti.md#come-verificare).

## Esito

- **JavaScript (Claude):** `js/carte.js` ha ora `Carte.semplice` (spostata da `js/solitario-pagina.js`) e `Carte.colonne`; `js/tavola.js` ha `Tavola.telefono()` e l'evento `tavola:schermo`. `js/ramino-pagina.js` (Scala 40 e Ramino) e `burraco/main.js`: carte scoperte semplificate sul telefono, opzione per le immagini, `--colonne` sulla mano, PC fermo con il pannello aperto. `poker/main.js` e `cambio_colore/main.js`: PC fermo con il pannello aperto (Cambio colore anche `--colonne`). `guerra/main.js`: il gioco automatico si ferma aprendo il pannello. Blackjack non ha attese del PC.
- **HTML:** le 7 pagine hanno `data-pannello` su intestazione, modalità, regole e fonti, più `js/tavola.js` e `css/tavola.css`.
- **CSS (Codex, due giri):** `css/ramino.css`, `burraco/style.css`, `poker/style.css`, `blackjack/style.css`, `guerra/style.css`, `cambio_colore/style.css`. Il primo giro andava bene sul telefono ma cambiava le misure sugli schermi larghi (mano di Scala 40 da 60 a 88px, dorsi di Cambio colore larghi 286px): sistemato al secondo giro con l'elenco esatto delle differenze. Ritocco di Claude: in `css/tavola.css` torna `min-width: auto` sui pulsanti delle azioni dai 600px (valore di prima della Tappa 25).
- **Verifiche:** `node scripts/check.js`: 57 suite, 0 controlli falliti (nuova `js/test-carte-francesi-tavola.js`). A 375×667: Blackjack e Guerra senza scorrimento (carte 80 e 96px), Poker 726px (carte tue 84px, comuni 60px su una riga), Scala 40 e Ramino 746px (mano 44px semplificata, combinazioni 36px), Burraco 827px, Cambio colore 849px (avversari in pastiglie); nessuno scorrimento orizzontale anche a 390×844. Opzione immagini e passaggio telefono/schermo largo provati nel browser. A 600, 900 e 1280px stili calcolati uguali a prima in tutti i 7 giochi.

## Decisioni prese

- Carte semplificate (valore e seme grandi) solo dove le carte sono tante e strette: mano e combinazioni di Scala 40, Ramino e Burraco. In Blackjack, Guerra e Poker le carte sono poche: restano le immagini, più grandi. Il jolly resta disegnato come oggi; le carte coperte restano immagini.

## Problemi aperti

- Restano più alte dello schermo (a 375×667): Burraco (827px, oltre 950 con le combinazioni sul tavolo), Cambio colore (849px), Scala 40 con le combinazioni (circa 830px): si scorre per arrivare ai pulsanti.
- In Guerra, durante una guerra, le carte sovrapposte mostrano solo l'angolo.
