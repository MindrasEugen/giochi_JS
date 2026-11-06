# Tappa 26 — Gesti touch negli arcade

Ultima modifica: 2026-11-06

## Obiettivo

Negli arcade i comandi sul telefono diventano gesti sul campo, al posto dei pulsanti (che restano disponibili con l'opzione nascosta della [Tappa 25](36-tappa-25-schermo-intero.md)). Layout a schermo intero esteso a tutti e 7 gli arcade.

## Attività

- [x] Riconoscimento dei gesti comune in `js/arcade-pagina.js` (`config.gesti`): scorrimento (direzione, ripetuto a ogni soglia), tocco, pressione immediata, trascinamento, tasto tenuto finché il dito è sul campo; più dita insieme, ognuna con la sua metà del campo. Sostituisce `config.scorri` e `config.puntatore`
- [x] Serpente e Labirinto: scorrere nella direzione
- [x] Ping pong e Mattoncini: trascinare la racchetta (Mattoncini: appoggiare il dito lancia la pallina, come prima)
- [x] Blocchi: scorrere a destra/sinistra per spostare di una colonna, tocco per ruotare, scorrere giù per far cadere (una volta per gesto)
- [x] Invasione: trascinare per muoversi, sparo automatico finché il dito resta sul campo
- [x] Volo: tocco per salire (subito, alla pressione)
- [x] 2 giocatori sullo stesso telefono (Serpente, Ping pong, Blocchi): schermo diviso a metà, ognuno usa i gesti nella sua metà. Volo in due è a turni: non serve dividere lo schermo
- [x] Suggerimento dei gesti: sul telefono il velo «Pronto a giocare?» spiega i gesti (`istruzioniGesti`) a ogni nuova partita, invece di un suggerimento mostrato una volta sola (vedi Decisioni prese)
- [x] Layout della Tappa 25 sugli altri 6 arcade: `data-pannello`, `js/tavola.js`, `css/tavola.css`; regole aggiornate con i gesti
- [x] CSS (Codex, un giro, circa 1 minuto): tabellone degli arcade sul telefono senza etichette tagliate con i puntini
- [x] Test automatici dei gesti (eventi pointer simulati) in `js/test-arcade-pagine.js`, per tutti e 7 gli arcade
- [x] Verifiche nel browser (375×667, 390×844) e confronto degli stili a 600/900/1280px
- [x] Prova su telefono (utente): «perfetto, procedi» (2026-11-06)

## Come verificare

- `node js/test-arcade.js` e `node js/test-arcade-pagine.js` OK, compresi i gesti simulati.
- Nel browser a 375px con emulazione touch: ogni arcade si gioca solo con i gesti; in 2 giocatori le due metà non si disturbano.
- Prova su telefono (utente): comodità dei gesti in ogni arcade.

## Esito

- **JavaScript (Claude):** `js/arcade-pagina.js` (gesti comuni, istruzioni dei gesti nel velo sul telefono), i `main.js` dei 7 arcade (`gesti` e `istruzioniGesti`). Test: `js/test-arcade-pagine.js` controlla per ogni arcade avvio con un tocco, pausa con il pannello, ripresa, e i gesti propri del gioco (scorrimento a «L», colonna per soglia e caduta una volta per gesto in Blocchi, sparo finché resta un dito in Invasione, battito alla pressione in Volo, due dita nelle due metà in Serpente, Ping pong e Blocchi).
- **HTML:** i 6 arcade senza pannello ora hanno `data-pannello`, `js/tavola.js` e `css/tavola.css`; regole aggiornate con i gesti in tutti.
- **CSS (Codex):** `css/tavola.css`, tabellone del telefono con etichette e valori a capo tra le parole invece dei puntini; da 600px in su ripristini.
- **Verifiche:** `node scripts/check.js`: 58 suite, 0 controlli falliti. Gesti provati in Chrome con eventi pointer veri: Blocchi (sposta, ruota, fa cadere), Ping pong in due (due dita, racchette indipendenti), Invasione (si muove e spara da sola). A 375×667 e 390×844 i 7 arcade senza scorrimento, tabellone alto 49px, nessun testo tagliato. Da 600px in su stili uguali al commit precedente, salvo le regole più lunghe.

## Decisioni prese

- Suggerimento dei gesti nel velo di inizio partita, non in un avviso mostrato una volta sola con `localStorage`: il velo c'è già a ogni partita, non copre il gioco mentre si gioca e non serve ricordare nulla nel browser. Se i pulsanti sono mostrati dal pannello, il velo torna alle istruzioni con i tasti.
- Volo in due giocatori non divide lo schermo: la sfida è a turni, uno dopo l'altro.
- Un unico sistema di gesti (`config.gesti`) per tutti gli arcade, al posto di `config.scorri` (Serpente) e `config.puntatore` (trascinamento solo con un dito e solo contro il computer): così Ping pong in due funziona con due dita insieme (ADR 0012).

## Problemi aperti

- Blocchi da soli sul telefono: il campo è piccolo (caselle di circa 12px), perché il disegno da 720px lascia spazio per due campi. L'utente non lo ha segnalato come problema.
- Testo del tabellone piccolo (etichette circa 10,5px, valori circa 12,6px): non segnalato come problema.
