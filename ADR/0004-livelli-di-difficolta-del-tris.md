# ADR 0004 — Tris: tre livelli di difficoltà, Impossibile con minimax

- **Stato:** proposta
- **Data:** 2026-11-03
- **Commit:** — (Tappe 5 e 6)

## Contesto

Oggi il PC del Tris ha un solo comportamento: chiude il suo tris se può, altrimenti blocca quello del giocatore, altrimenti gioca a caso. Si vuole un menu di difficoltà, con una modalità in cui il PC non perde mai. Collegamenti: [PLAN/14-tappa-05-tris-difficolta.md](../PLAN/14-tappa-05-tris-difficolta.md), [PLAN/15-tappa-06-tris-minimax.md](../PLAN/15-tappa-06-tris-minimax.md).

## Decisione

Un `select` "Difficoltà", attivo solo nella modalità "Un giocatore", con tre livelli:

| Livello | Comportamento del PC |
|---|---|
| Facile | mossa a caso tra le caselle libere |
| Media | la logica di oggi: vince se può, altrimenti blocca, altrimenti a caso |
| Impossibile | **minimax**: esplora tutte le partite possibili e sceglie la mossa migliore |

Il minimax assegna +10 alla vittoria di O, −10 alla vittoria di X e 0 al pareggio, e usa la profondità per preferire le vittorie più rapide. Non serve l'ottimizzazione alfa-beta, perché il tris ha al massimo 9! (circa 360.000) sequenze di mosse e la risposta è comunque immediata. Il giocatore è sempre X e comincia sempre lui.

## Conseguenze

- Il livello Impossibile si può solo pareggiare. È voluto, ed è il comportamento atteso dal tris giocato perfettamente.
- Si aggiunge uno script di prova eseguito con Node per dimostrare che il PC non perde mai.
- Cambiare difficoltà fa ricominciare la partita e azzera il punteggio, come già succede cambiando modalità.
