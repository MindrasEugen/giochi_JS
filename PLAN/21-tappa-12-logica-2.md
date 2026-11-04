# Tappa 12 — Logica: Raddoppia (tipo 2048) e Sudoku

Ultima modifica: 2026-11-04

## Obiettivo

Completare la categoria Logica.

## Attività

- [x] Raddoppia: griglia 4×4 di tessere che si sommano scorrendo (frecce o swipe), punteggio e record; 2 giocatori a sfida con la stessa sequenza di tessere, vince il punteggio più alto
- [x] Sudoku: generatore con soluzione unica, 3 difficoltà, evidenziazione di riga, colonna e riquadro, note a matita, controllo degli errori
- [x] Design dei due giochi (Codex)

## Come verificare

- Test con Node: le tessere si uniscono correttamente in tutte le direzioni; un risolutore indipendente conferma che ogni sudoku generato ha una sola soluzione.
- jsdom e screenshot.

## Esito

Codice e test scritti da Claude, design da Codex, controllo finale di Claude.

File creati:
- `raddoppia/`: `funzioni.js`, `main.js`, `index.html`, `style.css`, `test-raddoppia.js`.
  - Logica: `scorriRiga` (unione una sola volta per mossa), `muovi` nelle 4 direzioni (senza cambiare la griglia passata), `aggiungiTessera` (2 nove volte su 10, altrimenti 4), `puoMuovere`, `haObiettivo`, generatore casuale ripetibile (`generatore(seme)`).
  - Pagina: frecce, WASD, scorrimento del dito e 4 pulsanti a croce; animazioni per la tessera nuova e per quella unita; il messaggio "Hai fatto 2048!" compare una volta sola; record salvato.
  - Sfida a 2: i due giocatori ricevono le tessere nello stesso ordine (stesso seme). Se il primo ricomincia il turno riceve un seme nuovo, così non può rigiocare la stessa sequenza. Nel tabellone, durante la sfida, il secondo riquadro mostra la tessera più alta.
- `sudoku/`: `funzioni.js`, `main.js`, `index.html`, `style.css`, `test-sudoku.js`.
  - Logica: le 20 caselle collegate a ogni casella, `candidati`, `conflitti`, `contaSoluzioni` e `risolvi` con backtracking che parte dalla casella più vincolata.
  - Generatore: parte da una griglia completa casuale e toglie numeri controllando che la soluzione resti unica. Facile ha 40 indizi, Medio 32, Difficile 26.
  - Pagina:
    - selezione della casella con evidenziazione di riga, colonna, riquadro e numeri uguali;
    - tastierino 1–9 e tastiera (frecce, Canc, N per le note, Ctrl+Z);
    - note a matita, che spariscono dalle caselle collegate quando metti quel numero;
    - Annulla e Controlla, conflitti in rosso, tempo e record per difficoltà.
- `home.js`: Raddoppia e Sudoku nella categoria Logica (10 giochi in tutto).

Verifica eseguita:
- `node raddoppia/test-raddoppia.js`: 24 controlli passati. Comprendono 8 casi di riga, tra cui 2 2 2 2 → 4 4 e 4 4 8 → 8 8, le 4 direzioni, la mossa che non sposta niente, la fine partita, le probabilità del 4 (201 su 2000), il generatore ripetibile e una partita casuale intera.
- `node sudoku/test-sudoku.js`: 17 controlli passati. Comprendono un sudoku noto molto difficile risolto, e 15 sudoku generati (5 per difficoltà) con soluzione unica secondo un risolutore indipendente scritto in modo diverso, con il numero esatto di indizi, generati in 2–11 ms.
- jsdom, 30 controlli passati:
  - Raddoppia: tastiera, pulsanti, scorrimento del dito, animazioni, 2048, fine partita; nella sfida a 2 il giocatore 2 riceve le stesse tessere del giocatore 1 anche dopo 3 mosse uguali;
  - Sudoku: indizi bloccati, evidenziazioni, conflitto, cancella, note, Ctrl+Z, Controlla, frecce, completamento, difficoltà;
  - home: 10 giochi.
  - Un controllo di Raddoppia ("fine dopo ogni mossa") è debole perché dipende dalla tessera casuale. La fine partita è comunque verificata direttamente.
- Screenshot guardati da Claude: la scala dei colori di Raddoppia (da 2 a oltre 2048) e i pulsanti a croce; nel Sudoku conflitti, caselle sbagliate, note e tastierino a 375 px. Nessuno scorrimento orizzontale.
- Codex e il sub-agente hanno calcolato i contrasti: tutti tra 5,04:1 e 14,84:1 (AA).

## Decisioni prese

- Raddoppia è il nome originale del genere "2048" ([ADR 0009](../ADR/0009-nomi-e-grafica-originali-per-i-giochi-famosi.md)).
- La sfida a 2 di Raddoppia è "a turni con le stesse tessere", perché due persone non possono giocare insieme sulla stessa griglia ([ADR 0008](../ADR/0008-due-giocatori-sullo-stesso-dispositivo.md)).
- Il Sudoku resta a 1 giocatore; la difficoltà dipende solo dal numero di indizi, non dalle tecniche di soluzione necessarie.
- Nella casella selezionata del Sudoku il numero resta scuro anche se è in conflitto: il rosso su sfondo oro non arriverebbe al contrasto AA. Il conflitto resta visibile nelle altre caselle coinvolte.
- Tolto il BOM che Codex aveva messo all'inizio dei due CSS, perché nessun altro file del progetto ce l'ha.

## Problemi aperti

- I tasti numerici del Sudoku su un telefono da 375 px sono larghi circa 35 px (alti 44): 9 tasti in una riga non permettono di più.
- La difficoltà del Sudoku si basa sul numero di indizi: un sudoku "facile" può richiedere a volte un ragionamento più lungo del previsto.
- Prova a occhio nel browser vero (animazioni, scorrimento del dito su telefono): la fa l'utente.
