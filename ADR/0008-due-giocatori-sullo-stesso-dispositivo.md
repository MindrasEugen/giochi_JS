# ADR 0008 — Due giocatori sullo stesso dispositivo

- **Stato:** accettata
- **Data:** 2026-11-04
- **Commit:** `d75f327` (Tappa 9), Tappa 10

## Contesto

L'utente vuole la modalità 2 giocatori in tutti i giochi che lo permettono, compresi quelli già scritti. Il progetto è un sito statico, senza server ([ADR 0001](0001-javascript-senza-framework-ne-build.md)). In molti giochi (carte, battaglia navale, impiccato con la parola scelta da un giocatore) una parte deve restare **nascosta** all'avversario. Collegamenti: [PLAN/18-tappa-09-fondamenta.md](../PLAN/18-tappa-09-fondamenta.md), [PLAN/19-tappa-10-due-giocatori-esistenti.md](../PLAN/19-tappa-10-due-giocatori-esistenti.md).

## Decisione

- "2 giocatori" vuol dire due persone sullo **stesso dispositivo**, a turno o sulla stessa tastiera (per gli arcade).
- Quando c'è qualcosa di nascosto, tra un turno e l'altro compare una schermata che copre il gioco: "Passa il dispositivo a <nome>", con un pulsante "Sono pronto". Le carte del giocatore di turno si mostrano solo dopo il clic.
- Questa schermata, la scelta della modalità e i nomi dei giocatori stanno in `js/giocatori.js`, uguali in tutti i giochi.
- Nei giochi con il banco (Sette e mezzo, Blackjack…) a 2 giocatori non c'è il banco del computer: uno dei due giocatori fa il banco e i ruoli si scambiano a ogni mano. È una richiesta dell'utente del 2026-11-04 ([PLAN/34-tappa-10-1-banco-a-due-giocatori.md](../PLAN/34-tappa-10-1-banco-a-due-giocatori.md)).
- I solitari, Campo minato e Sudoku restano a 1 giocatore. Raddoppia e Volo hanno una "sfida" a turni (stessa sequenza, vince il punteggio più alto).

## Conseguenze

- Non serve nessun server, il sito resta statico e gratuito su Render.
- Non si può giocare da due telefoni diversi: questa possibilità resta in [PLAN/90-fuori-mvp.md](../PLAN/90-fuori-mvp.md).
- Il segreto è "di fiducia": chi gioca può guardare lo schermo dell'altro, come succede con le carte vere al tavolo.
