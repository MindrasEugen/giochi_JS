# ADR 0006 — Script condivisi in `js/`, senza moduli

- **Stato:** accettata
- **Data:** 2026-11-04
- **Commit:** Tappa 9 (vedi `git log`)

## Contesto

Si passa da 5 a circa 49 giochi. Molti hanno bisogno delle stesse cose: un mazzo da mescolare (italiano o francese), le immagini delle carte, la gestione di 1 o 2 giocatori, un ciclo di animazione per gli arcade. Riscriverle in ogni gioco vorrebbe dire 49 copie da correggere una per una. I moduli ES (`import`) non funzionano aprendo i file con `file://` ([ADR 0001](0001-javascript-senza-framework-ne-build.md)). Collegamento: [PLAN/18-tappa-09-fondamenta.md](../PLAN/18-tappa-09-fondamenta.md).

## Decisione

- Una cartella `js/` nella radice con script piccoli e indipendenti: `mazzo.js`, `carte.js`, `giocatori.js`, `arcade.js`. Le immagini di tutte le carte (italiane e francesi) stanno in una sola cartella, `carte/`, scelta dall'utente.
- Ogni script crea **un solo oggetto globale** con un nome chiaro (`Mazzo`, `Carte`, `Giocatori`, `Arcade`), per non riempire lo spazio dei nomi globale e non scontrarsi con le variabili dei giochi.
- Ogni gioco carica solo gli script che gli servono, con `<script src="../js/mazzo.js">` prima del proprio `main.js`.
- Le funzioni di logica pura (mescolare, contare punti, mosse valide) non toccano il DOM e terminano con il controllo `typeof module` già usato nel Tris ([ADR 0005](0005-logica-del-tris-separata-dalla-pagina.md)), così si provano con Node.
- La logica di ogni gioco resta nella cartella del gioco, come oggi (`funzioni.js` più `main.js`).

## Conseguenze

- Un bug nel mescolamento si corregge in un solo punto per tutti i giochi di carte.
- I giochi non sono più copiabili da soli: una cartella copiata da sola deve portarsi dietro anche `js/` e `css/` (come già succede con `css/comune.css`).
- Cambiare la firma di una funzione condivisa può rompere molti giochi: servono test con Node sulle funzioni condivise.
