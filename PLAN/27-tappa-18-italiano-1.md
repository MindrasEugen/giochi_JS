# Tappa 18 — Mazzo italiano: Briscola, Scopa, Asso piglia tutto, Rubamazzetto

Ultima modifica: 2026-11-04

## Obiettivo

I primi giochi con il mazzo italiano, con le immagini delle carte già presenti.

## Attività

- [x] Briscola a 2 (contro il PC o 2 giocatori) e a 4 in coppie (con giocatori PC)
- [x] Scopa: prese per somma, scope, conteggio dei punti (carte, denari, settebello, primiera)
- [x] Asso piglia tutto
- [x] Rubamazzetto
- [x] Avversario PC con una strategia semplice ma sensata per ogni gioco
- [x] Test della logica e smazzate complete tramite i controller con DOM simulato
- [ ] Screenshot e prova interattiva nel browser, anche su telefono

## Come verificare

- Test con Node del calcolo dei punti: primiera, prese possibili della scopa.
- jsdom: partite complete PC contro PC; screenshot.

## Esito

Quattro giochi disponibili dalla home, che raggiunge 27 giochi. Riutilizzate le immagini del mazzo italiano. Aggiunti `js/prese-italiane.js`, `js/carte-italiane-pagina.js` e `css/carte-italiane.css`, senza dipendenze aggiuntive.

Test: 300 smazzate di Briscola a due/quattro e 600 smazzate di Scopa, Asso piglia tutto e Rubamazzetto. Controllati conservazione delle 40 carte, 120 punti della Briscola, distribuzioni, primiera, prese alternative, furti e ultima scopa. I controller completano le partite nei modi PC e due persone, oltre alla Briscola in coppie; testati anche riservatezza delle mani e callback PC dopo un riavvio.

## Decisioni prese

- Una partita è una smazzata completa, con risultato e dettaglio finale. Nessun limite di tempo o puntata.
- Briscola: pesca dal vincitore, carta di briscola per ultima, coppie alternate e mani dei PC sempre coperte. Il PC valuta solo la propria mano e le carte pubbliche.
- Scopa: priorità alla carta uguale, niente scopa sull'ultima giocata, resti all'ultimo che prende. Tre re iniziali portano a una nuova distribuzione.
- Asso piglia tutto: se c'è un asso in tavola si prende quello; altrimenti si raccoglie il tavolo. La pulizia con l'asso vale una scopa, eccetto sull'ultima giocata. Variante esplicitata nella pagina.
- Rubamazzetto: nessuna somma, una carta uguale oppure furto del mazzetto con la stessa carta in cima. Se entrambe le azioni sono possibili, si sceglie.
- Le mani vengono coperte prima di aprire il passaggio del dispositivo. I timer PC vengono cancellati e invalidati al riavvio.

Riferimenti: [Briscola Modiano](https://www.modiano.it/it/gioco/briscola/), [Scopa Modiano](https://www.modiano.it/it/gioco/scopa/), [Asso piglia tutto SNAI](https://www.snai.it/giochi-di-carte/come-si-gioca), [Rubamazzo Treccani](https://www.treccani.it/vocabolario/rubamazzo/).

## Problemi aperti

Controllo nel browser del 2026-11-04 (Chrome, server locale, vedi `audit/2026-11-04-progetto-check.md`): pagine caricate senza errori in console né risorse mancanti, nessuno scorrimento orizzontale a 375px; una smazzata completa contro il PC giocata in automatico in tutti e quattro i giochi, senza errori. Resta da fare la prova su un telefono vero (touch, passaggio del dispositivo, mani coperte in due e in coppia). Tappa raccolta nel commit `57bc737`; i push restano a cura dell'utente.
