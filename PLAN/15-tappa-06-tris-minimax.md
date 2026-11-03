# Tappa 6 — Tris: modalità impossibile con minimax

Ultima modifica: 2026-11-03

## Obiettivo

Con la difficoltà "Impossibile" il PC gioca in modo perfetto: non perde mai. Si usa l'algoritmo **minimax**: il PC prova in anticipo tutte le partite possibili e sceglie la mossa migliore supponendo che anche il giocatore giochi al meglio.

## Attività

- [x] Funzione `minimax(caselle, simbolo, profondita)` in `funzioni.js`: punteggio `10 − profondità` se vince O, `profondità − 10` se vince X, 0 per il pareggio; la profondità premia le vittorie più rapide e ritarda le sconfitte
- [x] Funzione `mossaMigliore(caselle)` che usa `minimax` e restituisce l'indice della casella
- [x] Collegare "Impossibile" a `mossaMigliore`
- [x] Commenti in italiano semplice che spiegano l'algoritmo
- [x] Script di prova `tris/test-minimax.js` (si avvia con `node`) che gioca tutte le partite possibili del giocatore contro il PC e controlla che il PC non perda mai

## Come verificare

- `node tris/test-minimax.js` → nessuna sconfitta del PC su tutte le partite possibili.
- Nel browser, a difficoltà Impossibile: provando a vincere si arriva al massimo al pareggio.
- La mossa del PC è immediata (il tris ha poche posizioni possibili, non serve ottimizzare).

## Esito

Lavoro fatto da Claude.

- `tris/funzioni.js`:
  - `minimax(caselle, simbolo, profondita)` prova ogni mossa e la annulla subito, quindi lavora su un solo array;
  - `mossaMigliore(caselle)` lavora su una copia della griglia e sceglie la casella con il punteggio più alto;
  - `mossaPC` usa `mossaMigliore` con la difficoltà `'impossibile'`;
  - i commenti spiegano l'algoritmo in italiano semplice.
- `tris/index.html`: nuova opzione "Impossibile" e regola aggiornata ("al massimo puoi pareggiare").
- `tris/test-minimax.js`: prova esaustiva da avviare con `node tris/test-minimax.js`.

Verifica eseguita:
- `node tris/test-minimax.js`: X gioca tutte le sequenze possibili, 569 partite in 58 ms. **Vittorie di X: 0**, vittorie del PC 386, pareggi 183. Passano anche 4 posizioni campione: vince invece di bloccare, blocca, risponde all'angolo con il centro, si difende dagli angoli opposti con un lato.
- Controlli indipendenti (script nella cartella temporanea, non nel progetto):
  - con il PC Media al posto di Impossibile lo stesso giro trova 3040 sconfitte, quindi il test sa riconoscerle;
  - un risolutore scritto da zero conferma che `mossaMigliore` sceglie la mossa ottima in tutte le 2097 posizioni raggiungibili con O di turno.
- Pagina (jsdom): il menu ha Facile, Media e Impossibile; in 200 partite casuali contro Impossibile X vince 0 volte; la mossa del PC più lenta richiede 44 ms; nessun errore JavaScript.

## Decisioni prese

- Niente potatura alfa-beta: il tris è piccolo e la mossa è comunque immediata ([ADR 0004](../ADR/0004-livelli-di-difficolta-del-tris.md)).
- A parità di punteggio `mossaMigliore` sceglie la prima casella libera, quindi contro Impossibile il PC gioca sempre allo stesso modo. È voluto: il risultato è prevedibile e il test resta ripetibile.
- Lo script di prova sta nel progetto (`tris/test-minimax.js`) perché fa parte della verifica della tappa. Non viene caricato dalla pagina.

## Problemi aperti

- Prova a occhio nel browser vero: la fa l'utente.
