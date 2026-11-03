# Tappa 4 — CSS migliorato per tutti i giochi

Ultima modifica: 2026-11-03

## Obiettivo

Dare a tutti i giochi un aspetto curato e coerente, seguendo lo schema P.A.L.E.T.T.E., con CSS scritto a mano (nessun framework come Tailwind o Bootstrap).

## Attività

- [ ] `css/comune.css`: palette in variabili CSS, font, pulsanti, focus visibile, contenitore centrato, link "Tutti i giochi" ([ADR 0003](../ADR/0003-css-comune-piu-css-del-gioco.md))
- [ ] Ogni gioco collega `css/comune.css` e poi il proprio `style.css`, che contiene solo ciò che è specifico del gioco
- [ ] Impiccato: tastiera e disegno affiancati, lettere usate più leggibili
- [ ] Indovina il numero: form ordinato, messaggi colorati (alto/basso/vinto)
- [ ] Sasso carta forbici: stile completo (oggi c'è solo il colore di sfondo), pulsanti grandi, punteggio in evidenza
- [ ] Sette e mezzo: si tiene il tema "tavolo verde" e lo si porta sulle variabili comuni
- [ ] Tris: griglia centrata, simboli X e O di colori diversi, celle che si evidenziano al passaggio del mouse
- [ ] Contrasto dei testi almeno AA, pagine utilizzabili da telefono

## Come verificare

- Aprire i 5 giochi e la home: stessa famiglia di colori, font e pulsanti.
- Con il tasto Tab si vede sempre dove si trova il focus.
- F12 → modalità dispositivo a 375 px: nessuno scorrimento orizzontale, niente sovrapposizioni.
- I giochi funzionano ancora come prima (una partita completa per gioco).

## Esito

—

## Decisioni prese

—

## Problemi aperti

—
