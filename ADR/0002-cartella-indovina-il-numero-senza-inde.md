# ADR 0002 — Indovina il numero: file spostati fuori da `inde/`

- **Stato:** proposta
- **Data:** 2026-11-03
- **Commit:** — (Tappa 2)

## Contesto

Gli altri giochi hanno i file direttamente nella loro cartella (`tris/index.html`). Indovina il numero ha invece un livello in più, `indovina_il_numero/inde/index.html`, e il nome `inde` sembra un refuso. Con la home (Tappa 3) i percorsi diventerebbero disomogenei. Collegamento: [PLAN/11-tappa-02-bug.md](../PLAN/11-tappa-02-bug.md).

## Decisione

Spostare `index.html`, `main.js`, `style.css` ed `esercizio_1.md` in `indovina_il_numero/` ed eliminare la cartella `inde/` vuota.

## Conseguenze

- Tutti i giochi hanno la stessa struttura: `<gioco>/index.html`.
- Eventuali segnalibri o link esterni a `inde/index.html` smettono di funzionare.
