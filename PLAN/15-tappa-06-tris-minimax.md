# Tappa 6 — Tris: modalità impossibile con minimax

Ultima modifica: 2026-11-03

## Obiettivo

Con la difficoltà "Impossibile" il PC gioca in modo perfetto: non perde mai. Si usa l'algoritmo **minimax**: il PC prova in anticipo tutte le partite possibili e sceglie la mossa migliore supponendo che anche il giocatore giochi al meglio.

## Attività

- [ ] Funzione `minimax(caselle, simbolo, profondita)` in `funzioni.js`: punteggio +10 se vince O, −10 se vince X, 0 per il pareggio; la profondità premia le vittorie più rapide e ritarda le sconfitte
- [ ] Funzione `mossaMigliore(caselle)` che usa `minimax` e restituisce l'indice della casella
- [ ] Collegare "Impossibile" a `mossaMigliore`
- [ ] Commenti in italiano semplice che spiegano l'algoritmo
- [ ] Script di prova `tris/test-minimax.js` (si avvia con `node`) che gioca tutte le partite possibili del giocatore contro il PC e controlla che il PC non perda mai

## Come verificare

- `node tris/test-minimax.js` → nessuna sconfitta del PC su tutte le partite possibili.
- Nel browser, a difficoltà Impossibile: provando a vincere si arriva al massimo al pareggio.
- La mossa del PC è immediata (il tris ha poche posizioni possibili, non serve ottimizzare).

## Esito

—

## Decisioni prese

—

## Problemi aperti

—
