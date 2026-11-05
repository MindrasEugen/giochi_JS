# Tappa 27.3 — Schermo intero: giochi da tavolo

Ultima modifica: 2026-11-05

## Obiettivo

Dama, Filetto, Battaglia navale, Ludo, Scacchi: scacchiera o tabellone grande quanto lo schermo. Stesso metodo della [Tappa 27.1](39-tappa-27-1-carte-italiane.md); le attività di dettaglio si scrivono all'inizio della sotto-tappa, dopo aver guardato i giochi a 375px.

## Attività

- [x] Guardati i 5 giochi a 375×667: pagine alte 1054-1245px, scacchiera 325px che parte a 451-661px dall'alto; in Battaglia navale durante la partita le due griglie una sotto l'altra (1172px)
- [x] `data-pannello` (link, titolo, sottotitolo, modalità o configurazione di Ludo, regole; in Scacchi anche l'elenco delle mosse), `js/tavola.js` e `css/tavola.css` sulle 5 pagine
- [x] Il computer aspetta con il pannello aperto (Dama, Filetto, Scacchi, Battaglia navale, Ludo); una nuova partita iniziata dal pannello annulla la mossa in attesa (contatore `partita`)
- [x] Test: `js/test-tavolo-pannello.js` (Dama, Filetto, Scacchi)
- [x] CSS (Codex): segnapunti in una riga, tabellone a tutta larghezza, Ludo con dado accanto al messaggio, Battaglia navale con la propria flotta piccola durante la partita
- [x] Verifiche nel browser (375×667, 390×844) e confronto degli stili a 600/900/1280px
- [x] Prova su telefono (utente): «tutto okay» (2026-11-05)

## Come verificare

Vedi [Tappa 27](38-tappa-27-schermo-intero-tutti.md#come-verificare).

## Esito

- **JavaScript (Claude):** `dama/main.js`, `filetto/main.js`, `scacchi/main.js`, `battaglia_navale/main.js`, `ludo/main.js`: le mosse del computer passano da `dopoPannello()` (aspettano la chiusura del pannello); il contatore `partita` scarta una mossa rimasta in attesa se nel frattempo è iniziata una nuova partita (la modalità si cambia dal pannello).
- **HTML:** le 5 pagine hanno `data-pannello` su link, titolo, sottotitolo, modalità (Ludo: configurazione dei giocatori), regole e, in Scacchi, sull'elenco delle mosse; più `js/tavola.js` e `css/tavola.css`.
- **CSS (Codex, un giro):** nuova sezione in `css/tavola.css` per il segnapunti di `css/gioco.css` (una riga sola, messaggi e azioni compatti: servirà anche alla Tappa 27.4), più `dama/style.css`, `filetto/style.css`, `ludo/style.css`, `battaglia_navale/style.css`, `scacchi/style.css`. Ritocchi di Claude: margine della scacchiera della Dama sugli schermi larghi (Codex lo riportava a `auto` invece di `var(--spazio-4)`), e `gap: normal` sul contenitore dai 600px in `css/tavola.css` (regola della Tappa 25 rimasta attiva, senza effetto visibile).
- **Verifiche:** `node scripts/check.js`: 58 suite, 0 controlli falliti (nuova `js/test-tavolo-pannello.js`). A 375×667 Dama, Filetto, Ludo e Scacchi stanno in uno schermo (scacchiera 359px a 112px dall'alto, prima 325px a 451-560px); Battaglia navale 713px in disposizione e 791px in partita (prima 885 e 1172), con la propria flotta piccola (162px) sopra la griglia nemica a tutta larghezza. A 390×844 tutte senza scorrimento. Nessuno scorrimento orizzontale. Da 600px in su stili calcolati uguali al commit precedente in tutti e 5 i giochi.

## Decisioni prese

—

## Problemi aperti

- Battaglia navale durante la partita resta alta 791px a 375×667: per vedere «Nuova partita» si scorre un poco.
