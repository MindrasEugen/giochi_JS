# Tappa 5 — Tris: riordino del codice e menu di difficoltà

Ultima modifica: 2026-11-03

## Obiettivo

Preparare il Tris alla modalità impossibile: separare la logica dalla pagina e aggiungere un menu (`select`) per scegliere la difficoltà quando si gioca contro il PC.

## Attività

- [ ] `funzioni.js` lavora su un array di 9 caselle passato come parametro, non più sulle variabili globali di `main.js` ([ADR 0005](../ADR/0005-logica-del-tris-separata-dalla-pagina.md))
- [ ] `main.js` tiene lo stato della partita, aggiorna la pagina e chiama le funzioni di `funzioni.js`
- [ ] Nuovo `select` "Difficoltà": Facile, Media, Impossibile ([ADR 0004](../ADR/0004-livelli-di-difficolta-del-tris.md))
- [ ] Il `select` della difficoltà è attivo solo nella modalità "Un giocatore"
- [ ] Facile: mossa a caso. Media: la logica di oggi (vince se può, altrimenti blocca, altrimenti a caso)
- [ ] Cambiare difficoltà fa ricominciare la partita (come già succede cambiando modalità)

## Come verificare

- Due giocatori: si gioca come prima, il menu della difficoltà è disattivato.
- Un giocatore, Facile: il PC a volte non blocca un tris già pronto.
- Un giocatore, Media: il PC blocca sempre un tris pronto e chiude il suo quando può.
- Vittorie, pareggi, punteggio e "Azzera il punteggio" funzionano come prima.

## Esito

—

## Decisioni prese

—

## Problemi aperti

—
