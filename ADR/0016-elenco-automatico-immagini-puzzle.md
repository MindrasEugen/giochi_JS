# ADR 0016 — Elenco automatico delle immagini del Puzzle scorrevole

- **Stato:** accettata (sostituisce la parte sull'elenco delle immagini dell'[ADR 0015](0015-puzzle-scorrevole-suggerimento-e-immagini.md))
- **Data:** 2026-11-09
- **Commit:** — (Tappa 35)

## Contesto

Nell'[ADR 0015](0015-puzzle-scorrevole-suggerimento-e-immagini.md) l'elenco delle immagini era scritto a mano in `puzzle_scorrevole/funzioni.js`, perché il browser non può leggere il contenuto di una cartella. L'utente aggiunge immagini da solo (12 il 2026-11-09) e ha chiesto che basti copiarle nella cartella. Collegamento: [PLAN/53-tappa-35-puzzle-scorrevole.md](../PLAN/53-tappa-35-puzzle-scorrevole.md).

## Decisione

- Lo script `scripts/elenco-immagini.js` legge `puzzle_scorrevole/immagini/` sul PC e scrive `puzzle_scorrevole/immagini.js` (costante `IMMAGINI_PUZZLE`), caricato dalla pagina prima di `funzioni.js`.
- Nome di ogni immagine: il `<title>` dell'SVG; se manca, il nome del file senza numero iniziale e trattini.
- Lo script gira con `pnpm immagini` e, da solo, con `pnpm build` e `pnpm sync` (prima della copia in `www/`). Riscrive il file solo se l'elenco è cambiato.
- `immagini.js` è nel repository: il sito funziona anche senza passare da pnpm.
- Il test del puzzle confronta `immagini.js` con la cartella e, se non corrispondono, chiede di avviare `pnpm immagini`.

## Conseguenze

- Per l'app basta copiare le immagini e fare `pnpm sync`. Per il sito (senza build) serve `pnpm immagini` prima del commit; `node scripts/check.js` avvisa se lo si dimentica.
- `node scripts/check.js` non scrive file: segnala soltanto. Il file generato non va modificato a mano.
- Un file in più nella cartella del gioco (`immagini.js`) e uno script in `scripts/`.
