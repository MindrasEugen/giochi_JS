# Tappa 27.5 — Schermo intero: giochi storici

Ultima modifica: 2026-11-06

## Obiettivo

Tris, Impiccato, Sasso carta forbici, Indovina il numero. Stesso metodo della [Tappa 27.1](39-tappa-27-1-carte-italiane.md); le attività di dettaglio si scrivono all'inizio della sotto-tappa, dopo aver guardato i giochi a 375px.

## Attività

- [x] Guardati i 4 giochi a 375×667: pagine alte 826-1217px, gioco a 317-388px dall'alto
- [x] `data-pannello` (link, titolo, sottotitolo, modalità, regole; in Tris il riquadro delle opzioni, in Indovina il numero anche la difficoltà), `js/tavola.js` e `css/tavola.css` sulle 4 pagine. Tris: contenitore da `#contenitore_body` a `#contenitore_gioco` (lo cerca `js/tavola.js`)
- [x] Nessuna pausa da gestire: nessuno dei 4 giochi ha tempo o mosse del computer in attesa (il computer del Tris muove subito)
- [x] Impiccato: sul telefono il tocco sulla tastiera dello schermo non dà più il fuoco al campo di testo (apriva la tastiera del telefono sopra il gioco); tolto `autofocus`. Test in `js/test-tavolo-pannello.js`
- [x] CSS (Codex, un giro): tabellone compatto con spazio tra nome e numero, Impiccato in uno schermo (disegno più piccolo, campo di testo nascosto), ripristini da 600px in su
- [x] Verifiche nel browser (375×667, 390×844) e confronto degli stili a 600/900/1280px con il commit precedente
- [ ] Prova su telefono (utente)

## Come verificare

Vedi [Tappa 27](38-tappa-27-schermo-intero-tutti.md#come-verificare).

## Esito

- **HTML:** le 4 pagine con `data-pannello`, `js/tavola.js` e `css/tavola.css`; contenitore `#contenitore_gioco`. In Indovina il numero il campo della difficoltà (classe `campo--difficolta`) va nel pannello sul telefono.
- **JavaScript (Claude):** `tris/main.js` (nuovo id del contenitore), `il_impiccato/main.js` (`fuocoAlCampo()`: fuoco al campo di testo solo sugli schermi larghi). Test in `js/test-tavolo-pannello.js`.
- **CSS (Codex, un giro, circa 3 minuti):** `tris/style.css` (selettori `#contenitore_body` rinominati), `il_impiccato/style.css` (disegno da 128px, campo di testo e lettere provate nascosti sul telefono), `sasso_carta_forbici/style.css` e `indovina_il_numero/style.css` (spazio tra nome e numero nel tabellone), più i ripristini da 600px in su. Un ripristino mancante aggiunto da Claude: in Indovina il numero `css/tavola.css` restringeva i pulsanti Prova e Nuova partita (da 272px a 91 e 150px).
- **Verifiche:** `node scripts/check.js`: 58 suite, 0 controlli falliti. A 375×667 e 390×844 tutte e 4 le pagine stanno in uno schermo, anche durante la partita (Tris dopo tre mosse, Impiccato con una parola di 12 lettere, Sasso dopo un turno, Indovina dopo 4 tentativi); prima erano alte 826-1217px. Tasti dell'Impiccato 48×44px. Nessuno scorrimento orizzontale. Pannello dell'Impiccato con modalità e regole funzionante. Da 600px in su stili calcolati e posizioni uguali al commit precedente (restano solo differenze senza effetto: `flex-direction` su elementi non flex, la parola casuale dell'Impiccato).

## Decisioni prese

- Impiccato sul telefono: campo «Oppure scrivi una lettera» e riga delle lettere provate nascosti. La tastiera sullo schermo ha tutte le 26 lettere e i tasti mostrano già le lettere giuste e sbagliate; il campo, con il fuoco, apriva la tastiera del telefono sopra il gioco (ADR 0012).

## Problemi aperti

- Prova su telefono dell'utente da fare.
- Impiccato in 2 giocatori: a 375×667 la pagina è alta 683px (16px di scorrimento) per la riga dei punteggi in più.
