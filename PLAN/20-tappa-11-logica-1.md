# Tappa 11 — Logica: Forza 4, Memory, Campo minato

Ultima modifica: 2026-11-04

## Obiettivo

I primi tre giochi di logica.

## Attività

- [x] Forza 4: 2 giocatori o contro il PC (Facile / Media / Difficile; Difficile con minimax e potatura alfa-beta a profondità limitata); le pedine cadono con un'animazione e la riga vincente viene evidenziata
- [x] Memory: 1 giocatore (tempo e mosse) o 2 giocatori a turni (chi trova una coppia rigioca), 3 dimensioni di griglia, simboli emoji
- [x] Campo minato: 3 livelli; la prima casella è sempre sicura; bandierina con il tasto destro o con la pressione lunga sul telefono; apertura a cascata
- [x] Design dei tre giochi (Codex, due giri)

## Come verificare

- Test con Node della logica: vincitore di Forza 4 in tutte le direzioni, apertura a cascata, prima mossa sicura.
- In 50 partite il PC Difficile di Forza 4 batte sempre il PC Facile.
- jsdom: partite complete; screenshot a 375 px e desktop.

## Esito

Codice e test scritti da Claude, design da Codex (due giri), controllo finale di Claude.

File creati:
- `forza_4/`: `funzioni.js`, `main.js`, `index.html`, `style.css`, `test-forza4.js`.
  - Logica: griglia di 42 caselle, 69 "finestre" di 4 caselle, `quattroInFila`, `valuta`, minimax con potatura alfa-beta (6 mosse in anticipo, colonne centrali per prime).
  - PC: Facile a caso; Media vince se può e blocca la vittoria immediata dell'avversario; Difficile usa il minimax.
  - Pagina: 7 colonne-pulsante, caduta animata (`--caduta`), riga vincente evidenziata, tasti 1–7. A ogni nuova partita comincia l'altro giocatore; contro il computer tu sei il rosso.
- `memory/`: `funzioni.js` (`nuovaPartita`, `scopri`, `copriDiverse`, `finita`), `main.js`, `index.html`, `style.css`, `test-memory.js`. Tre dimensioni (6, 8 e 12 coppie), carte che si girano in 3D. Da soli ci sono mosse, tempo e record per dimensione; in due chi trova una coppia gioca ancora.
- `campo_minato/`: `funzioni.js` (`crea`, `piazzaMine`, `apri` a cascata, `apriIntorno`, `bandiera`), `main.js`, `index.html`, `style.css`, `test-campo-minato.js`.
  - Livelli: 9×9 con 10 mine, 16×16 con 40, 16×24 con 75. Le mine si piazzano al primo clic, lontano dalla casella scelta.
  - Bandiera con il tasto destro, con la pressione lunga sul telefono o con il pulsante "🚩 Bandiera".
  - A fine partita persa si vedono tutte le mine e le bandiere sbagliate. Il record del tempo è salvato per livello.
- `home.js`: nuova categoria Logica con i tre giochi.

Verifica eseguita:
- `node forza_4/test-forza4.js`: 17 controlli passati. Tra questi la vittoria nelle 4 direzioni, le 69 finestre tutte diverse e il pareggio. Il PC Difficile batte il Facile in 50 partite su 50 (circa 4,6 s in tutto) e la sua prima mossa richiede 14 ms.
- `node memory/test-memory.js`: 13 controlli passati.
- `node campo_minato/test-campo-minato.js`: 15 controlli passati. Comprende la prima apertura sicura in 600 partite, la cascata, la sconfitta, le bandiere e l'apertura rapida con bandiera giusta e sbagliata.
- jsdom, 37 controlli passati: partite complete dei tre giochi in tutte le modalità, compresi il turno del PC, la colonna piena, i tasti 1–7, le coppie a 2 giocatori, la vittoria e la sconfitta al Campo minato, e la home con 8 giochi.
- Screenshot guardati da Claude a 375 e 900 px durante una partita:
  - Forza 4: vittoria con le 4 pedine evidenziate;
  - Memory: coppia trovata e turno del giocatore 2;
  - Campo minato: caselle chiuse e aperte distinguibili, bandiera, livello Difficile che scorre solo dentro il riquadro.
- Codex: nessun `!important` né colore scritto a mano; contrasti dei numeri del Campo minato tra 5,85:1 e 14,84:1.

## Decisioni prese

- Forza 4: il PC Difficile guarda 6 mosse avanti, con le colonne centrali per prime e la potatura alfa-beta. È abbastanza forte da non perdere mai contro il Facile e risponde subito; non è un giocatore perfetto, perché il gioco perfetto richiederebbe di esplorare tutta la partita.
- Forza 4: la pedina rossa va sempre al giocatore 1 (o a te contro il computer), e chi comincia si alterna a ogni partita.
- Campo minato: il livello Difficile è 16×24 invece del classico 16×30, per stare meglio sugli schermi; su telefono il campo scorre dentro il suo riquadro.
- Campo minato: resta a 1 giocatore, come previsto dal piano ([ADR 0008](../ADR/0008-due-giocatori-sullo-stesso-dispositivo.md)).
- Il design dei giochi nuovi è affidato a Codex, il codice lo scrive Claude, come ha chiesto l'utente.

## Problemi aperti

- Le caselle del Campo minato su telefono sono di 32 px, sotto i 44 px consigliati per il tocco: è il compromesso per far stare il campo sullo schermo.
- Contenitore, tabellone, messaggi e regole sono stilati in modo quasi uguale nei tre `style.css`: si potrebbero spostare in un CSS comune dei giochi.
- Prova a occhio nel browser vero (animazione di caduta, rotazione delle carte, anteprima della pedina al passaggio del mouse): la fa l'utente.
