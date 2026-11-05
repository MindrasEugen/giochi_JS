# Fuori MVP

Ultima modifica: 2026-11-05

Idee non incluse in questo lavoro, da valutare in futuro:

- Togliere il codice ripetuto tra avvio e "Nuova partita" in impiccato, sasso carta forbici e sette e mezzo (una sola funzione `iniziaPartita()`).
- Rinominare `il_impiccato/doc/` in `dati/` (contiene la lista delle parole, non documentazione).
- Tema chiaro/scuro.
- Salvataggio dei punteggi con `localStorage` per i giochi delle Tappe 1–8 (i giochi arcade nuovi salvano il record già con `arcade.js`).
- Partite a 2 giocatori online, su due dispositivi diversi: serve un server (per esempio con WebSocket), fuori da questo progetto statico ([ADR 0008](../ADR/0008-due-giocatori-sullo-stesso-dispositivo.md)).
- Briscola a 4 e Scopone con più giocatori umani su dispositivi diversi, per lo stesso motivo.
- README per il portfolio GitHub e pubblicazione (per esempio GitHub Pages).
- La consegna `indovina_il_numero/esercizio_1.md` resta com'è (testo dell'esercizio, non codice).
- **Fase APK a fine progetto:** impacchettare la raccolta in un'app Android per giocare a schermo intero (Android Studio è disponibile). I comandi touch e lo schermo intero vengono anticipati nelle Tappe 25–27 (decisione dell'utente del 2026-11-05). La scelta dello strumento di impacchettamento andrà in un ADR.
- Spostare Forza 4, Memory, Campo minato, Raddoppia e Sudoku su `css/gioco.css` (creato nella Tappa 13, [ADR 0010](../ADR/0010-css-comune-delle-pagine-di-gioco.md)), togliendo le regole ripetute dai loro `style.css`.
