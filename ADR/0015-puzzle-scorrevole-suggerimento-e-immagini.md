# ADR 0015 — Puzzle scorrevole: suggerimento a ricerca e immagini in SVG

- **Stato:** accettata; la parte sull'elenco delle immagini è sostituita da [ADR 0016](0016-elenco-automatico-immagini-puzzle.md)
- **Data:** 2026-11-09
- **Commit:** — (Tappa 35)

## Contesto

L'utente ha chiesto un puzzle scorrevole con griglie 3×3, 4×4 e 5×5, immagini salvate nel progetto e tre suggerimenti per partita che indichino «il tassello da muovere per avvicinarsi alla soluzione». Nel progetto non c'erano immagini adatte. Sul 3×3 la soluzione più corta si calcola in un attimo; sul 4×4 e sul 5×5 calcolarla può richiedere milioni di posizioni, troppo per un telefono. Collegamento: [PLAN/53-tappa-35-puzzle-scorrevole.md](../PLAN/53-tappa-35-puzzle-scorrevole.md).

## Decisione

- **Immagini:** 6 illustrazioni originali in SVG disegnate da Claude (scelta dell'utente), in `puzzle_scorrevole/immagini/`, con l'elenco in `funzioni.js` (il browser non legge le cartelle). Sostituito dall'elenco automatico dell'ADR 0016.
- **Mescolamento:** mosse legali a caso dal puzzle risolto (80 / 200 / 400), senza annullare subito l'ultima; la partita è sempre risolvibile.
- **Suggerimento sul 3×3:** ricerca esatta IDA* con distanza di Manhattan più conflitti lineari: sempre la prima mossa di una soluzione più corta.
- **Suggerimento sul 4×4 e 5×5:** ricerca A* pesata (stima ×3 sul 4×4 con al massimo 60.000 posizioni, ×5 sul 5×5 con al massimo 30.000), che non rimette indietro il tassello appena mosso. Se non trova la soluzione entro il limite, si usa una **riserva sempre valida**: si ripercorre all'indietro la storia della partita (mescolamento e mosse), saltando i giri a vuoto, fino al puzzle risolto.
- **Vittoria:** la griglia mostra l'immagine intera come sfondo e i tasselli sfumano, così non restano le righe dovute agli arrotondamenti dei tasselli sul telefono.

## Conseguenze

- Ogni suggerimento porta davvero verso la soluzione: nei test, seguendo solo i suggerimenti si risolvono le partite di ogni livello (sul 3×3 con il numero minimo di mosse, controllato con una visita di tutte le 181.440 posizioni).
- Sul 4×4 e 5×5 il suggerimento non è sempre quello della strada più corta: le soluzioni trovate sono più lunghe di quelle ottime.
- Tempi misurati sul PC: al massimo circa 30 ms sul 4×4 e 150 ms sul 5×5 per un suggerimento; sul telefono più lenti, ma i suggerimenti sono solo tre e si chiedono a mano.
- Le immagini SVG pesano poco e restano nitide a ogni misura; per aggiungerne una basta il file (vedi ADR 0016).
