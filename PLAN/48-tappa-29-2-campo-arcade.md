# Tappa 29.2 — Arcade: campo di gioco grande quanto lo schermo

Ultima modifica: 2026-11-06

## Obiettivo

Richiesta dell'utente dopo la prova dell'APK: negli arcade il campo occupa circa metà dello schermo e deve occuparne la maggior parte. Misure a 412×880 (schermo dell'app): Serpente 44%, Invasione 41%, Labirinto 39%, Blocchi 39%, Mattoncini 38%, Volo 35%, Ping pong 27%. Causa: i campi sono larghi o quadrati, il telefono in verticale è alto e stretto, quindi la larghezza decide l'altezza del campo e sotto resta spazio vuoto. Il CSS da solo non basta: sul telefono serve un campo di forma verticale. Obiettivo: almeno il 70% dell'altezza dello schermo. Sugli schermi larghi (da 600px) i giochi restano identici.

## Attività

- [x] Forma del campo scelta a ogni nuova partita in `js/arcade-pagina.js` (`config.forma({ telefono, rapporto, due })`): `spazio()` misura l'altezza libera tra il tabellone e i pulsanti, `dimensiona()` allarga il campo fino a riempirla; la partita in corso non cambia forma (si adatta solo la misura sullo schermo)
- [x] Serpente: 20 colonne e righe fino allo spazio libero (20×34 a 412×880, 20×27 a 375×667)
- [x] Labirinto: labirinto generato di 13 colonne e righe dispari (13×23 a 412×880), energie e guardiani negli angoli calcolati dalle misure
- [x] Ping pong: campo girato, la tua racchetta in basso e quella dell'avversario in alto; in due, metà bassa e metà alta. La logica resta 720×440: ruotano solo disegno e tocchi
- [x] Mattoncini, Invasione, Volo: larghezza 600 e altezza fino allo spazio libero (massimo 1100, Volo 1000); racchetta, navetta, base e scudi misurati dal fondo, varchi di Volo su tutta l'altezza
- [x] Blocchi da soli: canvas di 280×640 intorno all'unico campo; in due restano i due campi affiancati
- [x] Il campo cresce fino allo spazio libero: fatto in JavaScript con la misura vera, senza CSS nuovo (vedi Decisioni prese)
- [x] Record unico (scelta dell'utente)
- [x] Test della logica con le nuove misure (Serpente, Labirinto, Mattoncini, Invasione, Volo); verifiche nel browser (412×880, 375×667) e sull'emulatore; confronto degli schermi larghi
- [ ] Prova su telefono (utente)

## Come verificare

- A 412×880 e 375×667 il campo di ogni arcade occupa almeno il 70% dell'altezza, senza scorrimento.
- Da 600px in su stili e misure uguali al commit precedente.
- `node scripts/check.js` OK.

## Esito

- **Modificati:** `js/arcade-pagina.js`; logica e pagina di Serpente (`serpente/funzioni.js`, `main.js`), Labirinto, Mattoncini, Invasione, Volo; `blocchi/main.js`; `ping_pong/main.js` e regole in `ping_pong/index.html`; test di Serpente, Labirinto, Mattoncini, Invasione, Volo.
- **Misure del campo sull'altezza dello schermo**, prima → dopo, a 412×880: Serpente 44% → 78%, Labirinto 39% → 77%, Ping pong 27% → 71%, Mattoncini 38% → 79%, Blocchi 39% → 79%, Invasione 41% → 79%, Volo 35% → 73%. A 375×667 tutti tra il 71% e il 72%. Nessuna pagina scorre.
- **Verifiche:** `node scripts/check.js`: 58 suite, 0 controlli falliti. Nel browser: Ping pong in due con due dita (racchetta bassa e alta indipendenti), Mattoncini e Serpente giocati con i gesti. Nell'app sull'emulatore Pixel 6: Ping pong girato, campo al 73%. Da 600px in su stili e misure uguali al commit precedente (cambia solo il testo delle regole di Ping pong).

## Decisioni prese

- La forma del campo dipende dallo spazio libero misurato sul telefono, non da misure fisse: così si adatta a ogni schermo (ADR 0012).
- Il campo viene allargato da `js/arcade-pagina.js` con la misura vera dello spazio libero, invece che con regole CSS: il CSS non può sapere quanto spazio resta sotto il tabellone su ogni telefono. Per questo nella tappa non è servito un giro di Codex.
- Ping pong girato con una rotazione del disegno e dei tocchi, senza cambiare la logica (resta provata dai test di sempre).
- Record unico per telefono e schermo largo (scelta dell'utente), anche se nei campi più alti la difficoltà cambia.

## Problemi aperti

- Prova su telefono dell'utente da fare.
- ~~Mattoncini: troppa strada fino alla racchetta~~: sistemato su richiesta dell'utente («ridurrei un po' la distanza, ma di poco»): nel campo alto i mattoni scendono di un quarto dell'altezza in più (95 unità con il campo di 900, circa 90px a 412×880); schermi larghi identici. Invasione: l'utente non ha chiesto modifiche.
- In Ping pong girato i pulsanti sullo schermo (se mostrati dal menu ⋯) «Su» e «Giù» muovono la racchetta a sinistra e a destra.
