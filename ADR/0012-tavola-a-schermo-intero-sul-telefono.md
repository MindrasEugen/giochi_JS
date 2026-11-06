# ADR 0012 — Tavola a schermo intero sul telefono, contenuti in un pannello sopra il gioco

- **Stato:** accettata
- **Data:** 2026-11-05
- **Commit:** — (Tappa 25)

## Contesto

Provando i giochi sul telefono, l'utente ha trovato scomodi i pulsanti degli arcade e piccole le carte dei solitari: a 375px intestazione, modalità, tabellone e regole lasciavano poco spazio alla tavola. L'utente ha chiesto la tavola a schermo intero, con regole e resto raggiungibili da collegamenti, e i gesti al posto dei pulsanti. Collegamenti: [PLAN/36-tappa-25-schermo-intero.md](../PLAN/36-tappa-25-schermo-intero.md), [PLAN/37-tappa-26-gesti-arcade.md](../PLAN/37-tappa-26-gesti-arcade.md).

## Decisione

- **Un modulo comune, `js/tavola.js`:** sotto i 600px aggiunge in cima alla pagina una barra sottile (← Giochi, nome del gioco, Regole, ⋯) e sposta in un **pannello sopra il gioco** gli elementi della pagina segnati con l'attributo `data-pannello` (intestazione, modalità, regole, fonti). Dai 600px in su li rimette al loro posto: sul computer la pagina resta com'era.
- **Pannello, non pagine separate** (scelta dell'utente): cambiando pagina la partita in corso si perderebbe. Gli elementi vengono spostati, non copiati, così i loro eventi (per esempio il selettore della modalità) continuano a funzionare.
- **Pausa:** il pannello emette `tavola:aperta` e `tavola:chiusa` su `document`; gli arcade vanno in pausa, i solitari fermano il tempo. Nei giochi con i PC (dalla Tappa 27.1) le mosse dei PC passano da `Tavola.quandoChiuso()` e aspettano la chiusura del pannello. Nei giochi da tavolo (Tappa 27.3) un contatore `partita` scarta la mossa in attesa se intanto è iniziata una nuova partita. Nei giochi a tempo (Memory, Campo minato, Sudoku, Tappa 27.4) il tempo si ferma.
- **Gesti negli arcade (Tappa 26):** un unico sistema in `js/arcade-pagina.js` (`config.gesti`: scorrimento, tocco, pressione, trascinamento, tasto tenuto) sostituisce `config.scorri` e `config.puntatore`. Ogni dito ha la sua metà del campo per tutto il gesto, così in due sullo stesso telefono (Serpente, Ping pong, Blocchi) si gioca insieme senza disturbarsi. Il suggerimento dei gesti sta nel velo di inizio partita, non in un avviso mostrato una volta sola ([PLAN/37-tappa-26-gesti-arcade.md](../PLAN/37-tappa-26-gesti-arcade.md)).
- **Campo degli arcade grande quanto lo schermo (Tappa 29.2):** sul telefono `js/arcade-pagina.js` misura l'altezza libera tra tabellone e pulsanti e ogni arcade sceglie a ogni nuova partita un campo di forma verticale (`config.forma`): più righe per Serpente e Labirinto, campo più alto per Mattoncini, Invasione e Volo, campo stretto per Blocchi da soli, Ping pong ruotato di 90 gradi. Il campo occupa il 71-79% dello schermo invece del 27-44%. Sugli schermi larghi i giochi restano identici ([PLAN/48-tappa-29-2-campo-arcade.md](../PLAN/48-tappa-29-2-campo-arcade.md)).
- **Niente tastiera del telefono sopra il gioco (Tappa 27.5):** dove esiste già una tastiera sullo schermo (Impiccato) il campo di testo è nascosto sul telefono e il JavaScript non gli dà il fuoco (`Tavola.telefono()`), perché il fuoco aprirebbe la tastiera del telefono e coprirebbe metà della tavola. Il campo resta sugli schermi larghi. In Indovina il numero il campo invece serve e resta ([PLAN/43-tappa-27-5-storici.md](../PLAN/43-tappa-27-5-storici.md)).
- **Opzioni ricordate nel browser:** `Tavola.opzione()` aggiunge una casella al pannello (con `localStorage`). Le usano "Mostra i pulsanti sullo schermo" (arcade con gesti, spenta di default) e "Carte con le immagini anche quando sono piccole" (solitari; dalla Tappa 27.2 anche Scala 40, Ramino e Burraco).
- **Carte semplificate condivise (Tappa 27.2):** la carta francese semplificata sta in `js/carte.js` (`Carte.semplice`), usata dai solitari e da Scala 40, Ramino e Burraco sul telefono. `Tavola.telefono()` dice se lo schermo è stretto; l'evento `tavola:schermo` avvisa le pagine quando si passa da telefono a schermo largo, così ridisegnano le carte ([PLAN/40-tappa-27-2-carte-francesi.md](../PLAN/40-tappa-27-2-carte-francesi.md)).
- **Spostamento in JavaScript invece che solo in CSS:** nascondere gli elementi con il CSS sul telefono e farli riapparire sugli schermi larghi avrebbe richiesto media query `max-width` o di conoscere il `display` di ogni elemento, contro la regola mobile-first del progetto.
- **Schermo intero vero** (Fullscreen API) solo come pulsante nel pannello, dove il browser lo permette; nell'APK sarà sempre attivo.

## Conseguenze

- Per portare un gioco al nuovo layout basta aggiungere `data-pannello` agli elementi, `js/tavola.js` e `css/tavola.css` (Tappa 27 per i giochi rimasti).
- Il pannello rende inerte il resto della pagina come le finestre di `js/giocatori.js`; la finestra dei nomi, aperta dal pannello, gli sta sopra (z-index più alto).
- Chi usa la tastiera sul telefono (raro) trova regole e modalità nel pannello invece che nella pagina.
- Un telefono in orizzontale largo più di 600px riceve il layout del computer.
- `css/tavola.css` non fissa la larghezza massima del contenitore sugli schermi larghi: resta quella del CSS di ogni famiglia (correzione della Tappa 27.1, [PLAN/39-tappa-27-1-carte-italiane.md](../PLAN/39-tappa-27-1-carte-italiane.md)).
- Test con un DOM finto: `js/test-tavola.js`; il rendering va comunque verificato nel browser e sul telefono.
