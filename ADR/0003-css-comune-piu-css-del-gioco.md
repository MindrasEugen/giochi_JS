# ADR 0003 — Un CSS comune con le variabili più un CSS per gioco

- **Stato:** accettata
- **Data:** 2026-11-03
- **Commit:** `a775431` (Tappa 3), Tappa 4

## Contesto

Oggi ogni gioco ha colori, font e pulsanti diversi: `bisque`, `antiquewhite`, `azure`, tavolo verde. Sasso carta forbici e Tris non hanno quasi stile. Con una home che li unisce, serve un aspetto coerente, ma ogni gioco deve poter mantenere un carattere proprio (per esempio il tavolo verde di Sette e mezzo). Collegamenti: [PLAN/12-tappa-03-home.md](../PLAN/12-tappa-03-home.md), [PLAN/13-tappa-04-css.md](../PLAN/13-tappa-04-css.md).

## Decisione

- `css/comune.css` contiene la palette in variabili CSS (`--colore-primario`, …) e gli stili di base: reset, font, contenitore, pulsanti, focus visibile, link alla home.
- La home usa `css/home.css`, nella stessa cartella.
- Ogni gioco collega prima `../css/comune.css` e poi il proprio `style.css`, che contiene solo le regole specifiche del gioco e usa le variabili comuni.
- Il CSS è scritto a mano seguendo lo schema P.A.L.E.T.T.E., senza librerie.

## Conseguenze

- Per cambiare un colore in tutti i giochi basta modificare una variabile in un solo punto.
- Ogni pagina carica un file CSS in più.
- I giochi non sono più del tutto indipendenti: se si copia una cartella da sola, va copiato anche `css/comune.css`.
