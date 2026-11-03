# ADR 0005 — Tris: logica su un array di caselle, separata dalla pagina

- **Stato:** proposta
- **Data:** 2026-11-03
- **Commit:** — (Tappa 5)

## Contesto

`funzioni.js` usa variabili definite in `main.js` (`celle`, `messaggi`, `partitaFinita`, …) e legge lo stato del gioco direttamente dal testo dei bottoni. Funziona, ma i due file dipendono l'uno dall'altro in modo nascosto. Il minimax ha bisogno di "provare" migliaia di mosse senza toccare la pagina. Collegamento: [PLAN/14-tappa-05-tris-difficolta.md](../PLAN/14-tappa-05-tris-difficolta.md).

## Decisione

- Lo stato della griglia è un array di 9 valori (`'X'`, `'O'` o `''`).
- `funzioni.js` contiene solo funzioni che ricevono l'array come parametro e restituiscono un risultato (vincitore, mossa del PC), senza leggere o modificare il DOM.
- `main.js` tiene lo stato, gestisce i clic e aggiorna la pagina a partire dall'array.

## Conseguenze

- Le funzioni di logica si possono provare da Node, senza browser (vedi Tappa 6).
- Il minimax lavora su copie dell'array, senza far "lampeggiare" la griglia.
- Serve riscrivere buona parte dei due file del Tris.
