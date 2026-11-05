# Tappa 21 — Mazzo francese: Blackjack, Guerra, Cambio colore

Ultima modifica: 2026-11-05

## Obiettivo

I primi giochi con il mazzo francese, con le immagini in `carte/` (nomi `seme-valore.png`, per esempio `hearts-q.png`, e dorso `back.png`).

## Attività

- [x] Blackjack: contro il banco del computer oppure in 2 giocatori con uno dei due che fa il banco (i ruoli si scambiano a ogni mano, [Tappa 10.1](34-tappa-10-1-banco-a-due-giocatori.md)); raddoppio, divisione, puntate con fiches finte
- [x] Guerra: 2 giocatori o contro il PC
- [x] Cambio colore (genere "Uno"): mazzo proprio con quattro colori e carte speciali disegnate da zero, da 2 a 4 giocatori (umani o PC)
- [x] CSS delle tre pagine (Codex, circa un minuto; secondo giro per le carte non giocabili di Cambio colore, viste spente e confuse nello screenshot)
- [x] Prova su telefono (utente, 2026-11-05: tutto a posto)

## Come verificare

- Test dei motori: `node blackjack/test-blackjack.js` (valore della mano con gli assi, blackjack 3 a 2, raddoppio, divisione, banco umano), `node guerra/test-guerra.js`, `node cambio_colore/test-cambio-colore.js` (regole delle carte speciali).
- DOM simulato, partite complete con i pulsanti in tutte le modalità: `node js/test-carte-francesi-pagine.js`.
- Browser e screenshot.

## Esito

Tre giochi nuovi dalla home, che arriva a 36 giochi: cartelle `blackjack/`, `guerra/`, `cambio_colore/`, ognuna con motore, pagina propria e test. Blackjack e Guerra usano le immagini del mazzo francese; Cambio colore ha carte disegnate in HTML e CSS.

## Decisioni prese

- **Blackjack:** due mazzi, rimescolati quando stanno per finire; 200 fiches, puntate da 10, 20 o 50 (così il 3 a 2 del blackjack è sempre un numero intero). Contro il PC il banco pesca fino a 17 e sta su ogni 17. In due uno dei giocatori fa il banco e decide lui quando pescare, paga con le sue fiches e i ruoli si scambiano a ogni mano (come nel Sette e mezzo). Niente assicurazione, una sola divisione, 21 dopo una divisione non è blackjack. Tutte le carte sono scoperte tranne la seconda del banco, quindi in due non serve passare il dispositivo.
- **Guerra:** tre carte coperte nella guerra; le carte vinte vanno in fondo al mazzo in ordine casuale; la partita finisce dopo 300 battaglie (vince chi ha più carte), perché altrimenti può durare all'infinito. C'è il pulsante «Gioca fino alla fine».
- **Cambio colore:** nome, colori (corallo, sole, menta, notte), simboli e nomi delle carte originali ([ADR 0009](../ADR/0009-nomi-e-grafica-originali-per-i-giochi-famosi.md)). Il Cambio + 4 si gioca solo senza carte del colore richiesto; niente accumulo di Pesca 2; la carta pescata si può giocare subito se valida, altrimenti il turno passa da solo. Una partita = una mano; nessun punteggio. Da 2 a 4 giocatori, anche due persone con due PC; in due persone si passa il dispositivo.

## Problemi aperti

- Prova su telefono eseguita dall'utente il 2026-11-05: passata.
- Controllo visivo fatto da Claude negli screenshot (Blackjack con carta del banco coperta, Guerra dopo una guerra, Cambio colore con carte giocabili evidenziate). Regole `.link-home` aggiunte da Codex senza richiesta e duplicate di css/comune.css: tolte.
