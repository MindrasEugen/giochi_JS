# Tappa 5 — Tris: riordino del codice e menu di difficoltà

Ultima modifica: 2026-11-03

## Obiettivo

Preparare il Tris alla modalità impossibile: separare la logica dalla pagina e aggiungere un menu (`select`) per scegliere la difficoltà quando si gioca contro il PC.

## Attività

- [x] `funzioni.js` lavora su un array di 9 caselle passato come parametro, non più sulle variabili globali di `main.js` ([ADR 0005](../ADR/0005-logica-del-tris-separata-dalla-pagina.md))
- [x] `main.js` tiene lo stato della partita, aggiorna la pagina e chiama le funzioni di `funzioni.js`
- [x] Nuovo `select` "Difficoltà": Facile, Media, Impossibile ([ADR 0004](../ADR/0004-livelli-di-difficolta-del-tris.md))
- [x] Il `select` della difficoltà è attivo solo nella modalità "Un giocatore"
- [x] Facile: mossa a caso. Media: la logica di oggi (vince se può, altrimenti blocca, altrimenti a caso)
- [x] Cambiare difficoltà fa ricominciare la partita (come già succede cambiando modalità)

## Come verificare

- Due giocatori: si gioca come prima, il menu della difficoltà è disattivato.
- Un giocatore, Facile: il PC a volte non blocca un tris già pronto.
- Un giocatore, Media: il PC blocca sempre un tris pronto e chiude il suo quando può.
- Vittorie, pareggi, punteggio e "Azzera il punteggio" funzionano come prima.

## Esito

Lavoro fatto da Claude.

- `tris/funzioni.js` è riscritto con funzioni pure su un array di 9 caselle: `trovaVincitore`, `grigliaPiena`, `caselleVuote`, `mossaCasuale`, `cercaMossa`, `mossaMedia` e `mossaPC(caselle, difficolta)`. Le funzioni non usano il DOM. In fondo al file c'è un `module.exports` protetto da `typeof module`, che serve solo a Node.
- `tris/main.js` tiene lo stato (`caselle`, `giocatoreCorrente`, `partitaFinita`, vittorie) e ridisegna la griglia con `disegnaGriglia()`. L'attributo `data-simbolo` provvisorio della Tappa 4 ora viene impostato qui.
- `tris/index.html` ha il menu "Difficoltà" (Facile, Media; Media è quella predefinita), una regola in più e le opzioni in un contenitore `.opzioni`.
- `tris/style.css` contiene il layout delle opzioni e lo stato disattivato del menu.

Verifica eseguita (Node + jsdom, 20 controlli passati):
- logica: vincitore, griglia piena, `cercaMossa` anche con una riga già bloccata; Media vince invece di bloccare e blocca il tris di X; Facile non blocca in 249 casi su 300 e sceglie solo caselle libere;
- pagina:
  - il menu è disattivato in Due giocatori e attivo contro il PC;
  - vittoria con punteggio, pareggio, casella occupata non modificabile, nessuna mossa dopo la fine;
  - "Nuova partita", "Azzera il punteggio" e il cambio di difficoltà fanno ricominciare;
  - partita completa contro il PC;
  - nessun errore JavaScript.
- Screenshot a 375 e 800 px: il menu va a capo su mobile ed è grigio quando è disattivato.

## Decisioni prese

- Logica separata dalla pagina ([ADR 0005](../ADR/0005-logica-del-tris-separata-dalla-pagina.md)).
- Media è la difficoltà predefinita, perché corrisponde al comportamento del PC prima di questa tappa.
- Per usare le funzioni da Node si usa `module.exports` con un controllo, non `type="module"`, che non funziona con `file://` ([ADR 0001](../ADR/0001-javascript-senza-framework-ne-build.md)).

## Problemi aperti

Nessuno.
