# Tappa 27.4 — Schermo intero: logica e parole

Ultima modifica: 2026-11-06

## Obiettivo

Forza 4, Memory, Campo minato, Raddoppia, Sudoku, Cinque lettere, più la riscrittura mobile-first di `css/gioco.css`. Lo spostamento di questi giochi su `css/gioco.css` resta [fuori MVP](90-fuori-mvp.md) (vedi Decisioni prese). Stesso metodo della [Tappa 27.1](39-tappa-27-1-carte-italiane.md); le attività di dettaglio si scrivono all'inizio della sotto-tappa, dopo aver guardato i giochi a 375px.

## Attività

- [x] Guardati i 6 giochi a 375×667: pagine alte 944-1325px, gioco a 382-456px dall'alto
- [x] `data-pannello` (link, titolo o intestazione, sottotitolo, modalità, regole; in Cinque lettere anche la legenda degli indizi), `js/tavola.js` e `css/tavola.css` sulle 6 pagine
- [x] Forza 4: il computer aspetta con il pannello aperto (come nella 27.3). Memory, Campo minato, Sudoku: il tempo si ferma con il pannello aperto e riparte alla chiusura. Raddoppia: frecce sullo schermo nascoste (si gioca scorrendo), opzione «Mostra i pulsanti sullo schermo» nel pannello
- [x] Test: `js/test-tavolo-pannello.js` esteso (Forza 4, tempo di Memory, Campo minato, Sudoku)
- [x] CSS (Codex, un giro): i 6 `style.css` e la riscrittura mobile-first di `css/gioco.css` (tolta l'ultima media query `max-width` delle pagine di gioco)
- [x] Verifiche nel browser (375×667, 390×844) e confronto degli stili a 600/900/1280px (e a 375/599px per i giochi storici con `css/gioco.css`)
- [x] Prova su telefono (utente): «tutto ok» (2026-11-06)

## Come verificare

Vedi [Tappa 27](38-tappa-27-schermo-intero-tutti.md#come-verificare).

## Esito

- **JavaScript (Claude):** `forza_4/main.js` (computer in attesa con `dopoPannello()` e contatore `partita`), `memory/main.js`, `campo_minato/main.js`, `sudoku/main.js` (tempo fermo con il pannello aperto), `raddoppia/main.js` (opzione per le frecce).
- **HTML:** le 6 pagine con `data-pannello`, `js/tavola.js` e `css/tavola.css`.
- **CSS (Codex, un giro, circa 3 minuti):** `forza_4/style.css`, `memory/style.css`, `campo_minato/style.css`, `raddoppia/style.css`, `sudoku/style.css`, `cinque_lettere/style.css`, `css/gioco.css`. Le 5 pagine senza `css/gioco.css` ricevevano dai ripristini di `css/tavola.css` alcuni valori di `css/gioco.css` sugli schermi larghi (per esempio Campo minato largo 868px invece di 900px): Codex li ha riportati ai valori di prima nei loro `style.css`, partendo dall'elenco esatto delle differenze.
- **Verifiche:** `node scripts/check.js`: 58 suite, 0 controlli falliti. A 375×667 Forza 4, Memory, Campo minato, Raddoppia e Sudoku stanno in uno schermo (gioco a 112px dall'alto, prima a 382-456px); Cinque lettere 716px (prima 1325px), Memory grande in due 745px. Raddoppia: lo scorrimento del dito muove le tessere senza far scorrere la pagina. Nessuno scorrimento orizzontale; a 390×844 tutte senza scorrimento. Da 600px in su stili calcolati uguali al commit precedente nei 6 giochi e negli altri con `css/gioco.css` (Dama, Tris); i giochi storici uguali anche a 375 e 599px.

## Decisioni prese

- Lo spostamento di Forza 4, Memory, Campo minato, Raddoppia e Sudoku su `css/gioco.css` non si fa qui: è un riordino del CSS che non cambia nulla per chi gioca e renderebbe più difficile verificare che sul computer le pagine restino identiche. Resta in [Fuori MVP](90-fuori-mvp.md).

## Problemi aperti

- Cinque lettere (716px) e Memory con la griglia grande (745px) scorrono di poco a 375×667.
