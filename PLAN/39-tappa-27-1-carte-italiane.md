# Tappa 27.1 — Schermo intero: giochi con il mazzo italiano

Ultima modifica: 2026-11-05

## Obiettivo

Sul telefono gli 11 giochi con il mazzo italiano usano barra e pannello della [Tappa 25](36-tappa-25-schermo-intero.md), e le carte diventano leggibili. Oggi a 375px (Scopone) le carte in tavola sono larghe 30-45px, la mano 68px, e tre file di dorsi degli avversari occupano metà del tavolo. Scelta dell'utente: **si tengono le immagini delle carte, ma più grandi**; gli avversari diventano compatti.

## Attività

- [x] Le 8 pagine con il tavolo comune (`js/carte-italiane-pagina.js`): Scopa, Briscola, Scopone, Briscola a 5, Tressette, Cirulla, Asso piglia tutto, Rubamazzetto: `data-pannello` su intestazione, modalità, regole, fonti e sui riquadri che non servono durante la mano; `js/tavola.js` e `css/tavola.css`
- [x] Avversari compatti sul telefono: al posto della fila di dorsi, un piccolo mazzetto con nome e numero di carte (prese e turno restano visibili)
- [x] Carte in tavola e in mano più grandi (obiettivo 60-75px a 375px); mano lunga (Scopone, 9-10 carte) su al massimo due righe o a ventaglio
- [x] Sette e mezzo, Mercante in fiera, Cucù (controller propri): stesso layout, carte più grandi dove servono
- [x] Pausa: dove c'è un tempo o un'attesa del PC, il pannello aperto non deve far perdere mosse
- [x] CSS (Codex)
- [x] Test: le suite delle carte italiane restano verdi; controllo che gli avversari compatti mostrino il numero di carte giusto
- [ ] Prova su telefono (utente)

## Come verificare

- `node scripts/check.js`: 0 controlli falliti.
- Nel browser a 375×667 e 390×844: Scopone, Briscola a 5 e Scopa senza scorrimento orizzontale, carte in tavola e in mano almeno 60px, avversari compatti, una mano giocata fino in fondo con i tocchi; Sette e mezzo, Mercante, Cucù con il nuovo layout.
- A 900 e 1280px: misure uguali a prima (confronto con il commit precedente).
- Screenshot a 375px di Scopone, Briscola a 5, Scopa, Mercante.

## Esito

- **JavaScript (Claude):** `js/carte-italiane-pagina.js` imposta `--colonne` su mano e tavolo (fino a 5 carte su una riga, oltre su due), segna l'avversario di turno (`avversario-carte--turno`) e fa aspettare i PC con il pannello aperto; lo stesso in `mercante/main.js` e `cucu/main.js` (anche `--colonne` per le carte al centro) e in `sette_e_mezzo/main.js` (il banco aspetta). Nuova funzione `Tavola.quandoChiuso()` in `js/tavola.js`.
- **HTML:** le 11 pagine hanno `data-pannello` su intestazione, modalità, regole, fonti (e mazzetti delle prese nei giochi del tavolo comune), più `js/tavola.js` e `css/tavola.css`. Sette e mezzo (pagina più vecchia) riceve `id="contenitore_gioco"` e la classe `regole` sul riquadro delle regole.
- **CSS (Codex, due giri):** `css/carte-italiane.css` (avversari in pastiglie con un solo dorso, mano e tavolo in griglia, opzioni dell'asta su 3 colonne, posti di Mercante e Cucù più compatti, riepilogo senza parole spezzate) e `sette_e_mezzo/style.css`. Ritocco di Claude: margine del contenitore di Sette e mezzo a zero sul telefono (faceva scorrere la pagina di 4px).
- **Correzione della Tappa 25:** `css/tavola.css` fissava la larghezza massima del contenitore a 880px sugli schermi larghi: nei giochi italiani a 1280px il contenitore passava da 960 a 880px. Tolta: ora vale la larghezza del CSS di ogni famiglia.
- **Verifiche:** `node scripts/check.js`: 56 suite, 0 controlli falliti (nuovi controlli: PC fermo con il pannello aperto in `js/test-carte-italiane-pagine.js`, `quandoChiuso` in `js/test-tavola.js`). Nel browser a 375×667: carte in mano 62-96px (Scopone 62, Briscola a 5 79, Scopa e Briscola 96), in tavola 79-80px, avversari 24px in pastiglie; nessuno scorrimento orizzontale; Scopa, Briscola e Scopone giocate fino in fondo con i tocchi, con il PC fermo mentre le regole sono aperte. A 600, 900 e 1280px misure uguali a prima della tappa in tutti gli 11 giochi (in Sette e mezzo cambiano solo i selettori nuovi, non le misure).

## Decisioni prese

- Immagini più grandi e avversari compatti, non carte semplificate (scelta dell'utente, 2026-11-05): per i semi italiani non esistono caratteri e le immagini si riconoscono anche dal numero di simboli.

- Le carte di mano e tavolo si dispongono in griglia con il numero di colonne calcolato dal JavaScript (`--colonne`): così le carte occupano tutta la larghezza disponibile, senza ventaglio.
- Mentre il pannello è aperto i PC non giocano: le loro mosse aspettano la chiusura (`Tavola.quandoChiuso`, [ADR 0012](../ADR/0012-tavola-a-schermo-intero-sul-telefono.md)).

## Problemi aperti

- Prova su telefono dell'utente da fare.
- Le pagine restano più alte dello schermo nei giochi con molte carte o molte scelte (a 375×667: Scopone 863px, Briscola a 5 durante l'asta 1039px, Mercante 870px, Cucù 808px): si scorre in verticale per arrivare alle scelte. Scopa, Briscola e gli altri a 2 giocatori sono intorno ai 740px.
