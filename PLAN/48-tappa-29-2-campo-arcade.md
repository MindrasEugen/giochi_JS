# Tappa 29.2 — Arcade: campo di gioco grande quanto lo schermo

Ultima modifica: 2026-11-06

## Obiettivo

Richiesta dell'utente dopo la prova dell'APK: negli arcade il campo occupa circa metà dello schermo e deve occuparne la maggior parte. Misure a 412×880 (schermo dell'app): Serpente 44%, Invasione 41%, Labirinto 39%, Blocchi 39%, Mattoncini 38%, Volo 35%, Ping pong 27%. Causa: i campi sono larghi o quadrati, il telefono in verticale è alto e stretto, quindi la larghezza decide l'altezza del campo e sotto resta spazio vuoto. Il CSS da solo non basta: sul telefono serve un campo di forma verticale. Obiettivo: almeno il 70% dell'altezza dello schermo. Sugli schermi larghi (da 600px) i giochi restano identici.

## Attività

- [ ] Forma del campo scelta all'avvio della partita in base allo schermo (telefono in verticale o schermo largo), in `js/arcade-pagina.js`; la partita in corso non cambia forma
- [ ] Serpente: griglia 20×34 invece di 20×20
- [ ] Labirinto: labirinto generato 13×23 (verticale) invece di 19×17
- [ ] Ping pong: campo girato, la tua racchetta in basso e quella del computer in alto; in due, metà bassa e metà alta dello schermo
- [ ] Mattoncini, Invasione, Volo: campo più alto (circa 600×1000), stessa larghezza; varchi, mattoni e nemici restano uguali, cambia lo spazio da percorrere
- [ ] Blocchi da soli: un solo campo senza lo spazio vuoto ai lati, alto quanto lo schermo; in due restano i due campi affiancati (guadagno limitato)
- [ ] Il campo cresce fino allo spazio libero tra tabellone e pulsanti; CSS (Codex)
- [ ] Record: decidere se tenere un record separato per il campo del telefono (la difficoltà cambia)
- [ ] Test della logica con le nuove misure; verifiche nel browser (412×880, 375×667) e sull'emulatore; confronto degli schermi larghi
- [ ] Prova su telefono (utente)

## Come verificare

- A 412×880 e 375×667 il campo di ogni arcade occupa almeno il 70% dell'altezza, senza scorrimento.
- Da 600px in su stili e misure uguali al commit precedente.
- `node scripts/check.js` OK.

## Esito

—

## Decisioni prese

—

## Problemi aperti

—
