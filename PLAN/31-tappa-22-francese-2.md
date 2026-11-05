# Tappa 22 — Mazzo francese: Poker heads-up, Scala 40, Ramino, Burraco

Ultima modifica: 2026-11-05

## Obiettivo

I giochi di carte francesi più complessi.

## Attività

- [x] Poker Texas Hold'em heads-up: contro il PC o 2 giocatori con "Passa il dispositivo", puntate finte, valutazione delle mani (primo passo, CSS di Codex)
- [ ] Scala 40 e Ramino: combinazioni (scale e tris), apertura, jolly
- [ ] Burraco: a 2 contro il PC, pozzetti, burraco pulito e sporco

## Come verificare

- Test con Node: valutazione delle mani del poker in tutte le categorie, validità di scale e tris.
- jsdom e screenshot.

## Esito

La tappa è divisa in tre passi, con un commit ciascuno.

- **Passo 1 — Poker heads-up** (`poker/`): valutazione della migliore mano di 5 carte su 7 in tutte le categorie, bui 5/10, giri di puntata con vedi, rilancio (minimo, piatto, tutto) e lascia, tutto dentro con restituzione delle fiches non coperte, piatto diviso. Il PC stima la forza della propria mano simulando 250 volte le carte che non vede. Test: `node poker/test-poker.js`, `node poker/test-pagina.js`. Controllo negli screenshot fatto.

## Decisioni prese

- **Poker:** 500 fiches a testa, bui fissi 5/10, rilanci a tre misure (minimo, quanto il piatto, tutto) per tenere pochi pulsanti sul telefono. La partita finisce quando un giocatore resta senza fiches. In due si passa il dispositivo prima di ogni scelta.

## Problemi aperti

—
