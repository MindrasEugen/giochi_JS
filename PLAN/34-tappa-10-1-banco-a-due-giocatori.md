# Tappa 10.1 — Sette e mezzo: a 2 giocatori uno dei due fa il banco

Ultima modifica: 2026-11-04

## Obiettivo

Correzione chiesta dall'utente alla [Tappa 10](19-tappa-10-due-giocatori-esistenti.md): "nel 7 e mezzo, quando si gioca in due, il banco deve essere eliminato e uno dei due giocatori deve prendere il posto del banco". Nella Tappa 10 i due giocatori giocavano contro un banco del computer.

## Attività

- [x] A 2 giocatori niente banco del computer: un giocatore gioca, l'altro fa il banco e pesca a mano, decidendo da solo quando stare
- [x] I ruoli si scambiano a ogni mano; si contano le mani vinte (tabellina `.punteggi-due`)
- [x] Tolto il terzo riquadro (giocatore 2) aggiunto nella Tappa 10
- [x] Regole scritte aggiornate
- [x] Design: il banco torna affiancato al giocatore su desktop (Codex)

## Come verificare

- jsdom: mani a 2 giocatori con tutti gli esiti (il banco vince ai punti, il banco sballa, parità al banco, il giocatore sballa), scambio dei ruoli, ritorno a 1 giocatore con il banco del computer.
- Screenshot a 375 e 900 px durante il turno del banco.

## Esito

- `sette_e_mezzo/main.js` riscritto per la parte a 2 giocatori. A 1 giocatore non cambia niente: il banco del computer pesca finché raggiunge o supera il giocatore.
- A 2 giocatori:
  - tocca al giocatore, poi "Stai" passa al banco umano;
  - il banco usa "Pesca" e "Stai" come il giocatore;
  - vince chi ha più punti e a parità vince il banco;
  - chi sballa perde subito.
- `sette_e_mezzo/index.html`: tolto il riquadro del giocatore 2; il titolo del banco diventa "Banco: <nome>"; aggiunta la tabellina delle mani vinte; regole aggiornate.

Verifica eseguita:
- jsdom, 15 controlli passati, ripetuti 3 volte. Comprendono il banco umano che non pesca da solo, i quattro esiti, lo scambio dei ruoli e il ritorno a 1 giocatore.
- I test di Sette e mezzo delle tappe precedenti (modalità a 1 giocatore) passano.
- Screenshot a 375 e 900 px durante il turno del banco: su desktop giocatore e banco affiancati, su telefono uno sotto l'altro.
- Codex: in `sette_e_mezzo/style.css` tolte le regole del riquadro del giocatore 2 e convertiti in variabili gli ultimi colori scritti a mano (pillole dei messaggi). Il colore delle pillole cambia di poco, il contrasto resta AA.

## Decisioni prese

- Nei giochi con il banco, a 2 giocatori uno dei due fa il banco e i ruoli si scambiano a ogni mano. La regola vale anche per i giochi futuri, come il Blackjack della [Tappa 21](30-tappa-21-francese-1.md) ([ADR 0008](../ADR/0008-due-giocatori-sullo-stesso-dispositivo.md)).
- Sostituisce la scelta della Tappa 10, in cui il banco del computer giocava contro entrambi.
- Le carte restano scoperte, come nella versione a 1 giocatore.

## Problemi aperti

Nessuno. (Il riquadro del banco che andava a tutta larghezza su desktop è stato sistemato da Codex.)
