# Tappa 16 — Arcade: Blocchi, Invasione, Volo, Labirinto

Ultima modifica: 2026-11-05

## Obiettivo

Completare la categoria Arcade con giochi ispirati a classici famosi, ma con nome e aspetto originali ([ADR 0009](../ADR/0009-nomi-e-grafica-originali-per-i-giochi-famosi.md)).

## Attività

- [x] Blocchi (genere "blocchi che cadono"): le righe complete si cancellano, livelli; 2 giocatori con due campi affiancati
- [x] Invasione (genere "sparatutto a ondate"): ondate di nemici disegnati da zero, scudi, record
- [x] Volo (genere "flappy"): 1 giocatore, o 2 a turni con la stessa sequenza di ostacoli
- [x] Labirinto (genere "mangia i puntini"): labirinto, guardiani e personaggio originali
- [x] Pulsanti touch, pausa, riavvio e integrazione nella home
- [x] Screenshot e prova interattiva nel browser e sul telefono

## Come verificare

- Test con Node della rotazione dei pezzi e delle righe complete di Blocchi.
- Screenshot e prova nel browser vero.

## Esito

Quattro giochi implementati e collegati alla home, che raggiunge 22 giochi. Logica senza DOM, canvas nella palette del progetto e controller condiviso. Test con Node per le quattro logiche e per il caricamento e ciclo di vita delle sette pagine arcade.

## Decisioni prese

- Blocchi usa un sacco di sette forme: in due entrambi ricevono la stessa sequenza, su campi indipendenti. Vince chi resta in gioco; nessuna penalità aggiunta al campo avversario.
- Invasione ricostruisce gli scudi a ogni ondata. Gli scudi assorbono sia colpi nemici sia colpi del giocatore.
- Volo conserva il seme tra i due turni e attende un avvio esplicito prima del secondo. I record personali non vengono aggiornati nelle sfide.
- Labirinto usa una mappa originale generata con seme fisso, corridoi connessi, tre vite e cristalli che durano sette secondi.
- Nessuna nuova dipendenza, asset esterno o modifica allo stack.

## Problemi aperti

Controllo nel browser del 2026-11-04 (Chrome, server locale, vedi `audit/2026-11-04-progetto-check.md`): pagine caricate senza errori in console né risorse mancanti, nessuno scorrimento orizzontale a 375px, partite avviate con tasti e clic senza errori. Prova su telefono eseguita dall'utente il 2026-11-05 sulla maggior parte dei giochi: funzionano. I comandi touch risultano un po' scomodi: si sistemeranno nella fase APK a fine progetto (vedi [Fuori MVP](90-fuori-mvp.md)). Nessun push: viene gestito dall'utente.
