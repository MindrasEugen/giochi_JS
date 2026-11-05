# Tappa 27.1 — Schermo intero: giochi con il mazzo italiano

Ultima modifica: 2026-11-05

## Obiettivo

Sul telefono gli 11 giochi con il mazzo italiano usano barra e pannello della [Tappa 25](36-tappa-25-schermo-intero.md), e le carte diventano leggibili. Oggi a 375px (Scopone) le carte in tavola sono larghe 30-45px, la mano 68px, e tre file di dorsi degli avversari occupano metà del tavolo. Scelta dell'utente: **si tengono le immagini delle carte, ma più grandi**; gli avversari diventano compatti.

## Attività

- [ ] Le 8 pagine con il tavolo comune (`js/carte-italiane-pagina.js`): Scopa, Briscola, Scopone, Briscola a 5, Tressette, Cirulla, Asso piglia tutto, Rubamazzetto: `data-pannello` su intestazione, modalità, regole, fonti e sui riquadri che non servono durante la mano; `js/tavola.js` e `css/tavola.css`
- [ ] Avversari compatti sul telefono: al posto della fila di dorsi, un piccolo mazzetto con nome e numero di carte (prese e turno restano visibili)
- [ ] Carte in tavola e in mano più grandi (obiettivo 60-75px a 375px); mano lunga (Scopone, 9-10 carte) su al massimo due righe o a ventaglio
- [ ] Sette e mezzo, Mercante in fiera, Cucù (controller propri): stesso layout, carte più grandi dove servono
- [ ] Pausa: dove c'è un tempo o un'attesa del PC, il pannello aperto non deve far perdere mosse
- [ ] CSS (Codex)
- [ ] Test: le suite delle carte italiane restano verdi; controllo che gli avversari compatti mostrino il numero di carte giusto
- [ ] Prova su telefono (utente)

## Come verificare

- `node scripts/check.js`: 0 controlli falliti.
- Nel browser a 375×667 e 390×844: Scopone, Briscola a 5 e Scopa senza scorrimento orizzontale, carte in tavola e in mano almeno 60px, avversari compatti, una mano giocata fino in fondo con i tocchi; Sette e mezzo, Mercante, Cucù con il nuovo layout.
- A 900 e 1280px: misure uguali a prima (confronto con il commit precedente).
- Screenshot a 375px di Scopone, Briscola a 5, Scopa, Mercante.

## Esito

—

## Decisioni prese

- Immagini più grandi e avversari compatti, non carte semplificate (scelta dell'utente, 2026-11-05): per i semi italiani non esistono caratteri e le immagini si riconoscono anche dal numero di simboli.

## Problemi aperti

—
