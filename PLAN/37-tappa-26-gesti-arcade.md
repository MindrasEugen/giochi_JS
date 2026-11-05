# Tappa 26 — Gesti touch negli arcade

Ultima modifica: 2026-11-05

## Obiettivo

Negli arcade i comandi sul telefono diventano gesti sul campo, al posto dei pulsanti (che restano disponibili con l'opzione nascosta della [Tappa 25](36-tappa-25-schermo-intero.md)). Layout a schermo intero esteso a tutti e 7 gli arcade.

## Attività

- [ ] Riconoscimento dei gesti comune in `js/arcade-pagina.js`: scorrimento (direzione), tocco, trascinamento
- [ ] Serpente e Labirinto: scorrere nella direzione
- [ ] Ping pong e Mattoncini: trascinare la racchetta (Mattoncini: tocco per lanciare la pallina)
- [ ] Blocchi: scorrere a destra/sinistra per spostare, tocco per ruotare, scorrere giù per far cadere
- [ ] Invasione: trascinare per muoversi, sparo automatico
- [ ] Volo: tocco per salire
- [ ] 2 giocatori sullo stesso telefono (Serpente, Ping pong, Blocchi, Volo): schermo diviso a metà, ognuno usa i gesti nella sua metà
- [ ] Suggerimento al primo avvio di ogni arcade ("scorri per girare" ecc.), mostrato una volta sola (`localStorage`)
- [ ] Layout della Tappa 25 sugli altri 6 arcade; CSS (Codex)
- [ ] Test automatici dei gesti (scorrimenti simulati con eventi pointer)

## Come verificare

- `node js/test-arcade.js` e `node js/test-arcade-pagine.js` OK, compresi i gesti simulati.
- Nel browser a 375px con emulazione touch: ogni arcade si gioca solo con i gesti; in 2 giocatori le due metà non si disturbano.
- Prova su telefono (utente): comodità dei gesti in ogni arcade.

## Esito

—

## Decisioni prese

—

## Problemi aperti

—
