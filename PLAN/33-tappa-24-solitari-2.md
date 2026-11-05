# Tappa 24 — Solitari: TriPeaks, Yukon, Scorpione, Orologio, Le tredici

Ultima modifica: 2026-11-05

## Obiettivo

Completare la categoria Solitari.

## Attività

- [x] TriPeaks, Yukon, Scorpione, Orologio, Le tredici, con gli stessi comandi della tappa precedente
- [x] Screenshot e prova nel browser (disposizioni di TriPeaks, Orologio, Le tredici)
- [ ] Prova su telefono (utente)

## Come verificare

- Test con Node delle mosse valide: `node js/test-solitari-2.js`.
- Pagine con DOM simulato (tocchi, annulla, nuova partita): `node js/test-solitari-pagine.js` (ora con tutti e dieci i solitari).
- Screenshot e prova nel browser vero.

## Esito

Cinque solitari nuovi dalla home, che arriva a 50 giochi. Ogni gioco ha solo il motore delle regole e usa la pagina comune `js/solitario-pagina.js` e il CSS `css/solitario.css` della Tappa 23; non è servito CSS nuovo.

- **TriPeaks** (`tripeaks/`): tre picchi, carte che si girano quando sono libere, una in più o in meno anche tra re e asso, serie migliore.
- **Yukon** (`yukon/`): niente mazzo, si sposta qualunque carta scoperta con quelle sopra.
- **Scorpione** (`scorpione/`): stesso seme, re nelle colonne vuote, scale complete che escono, riserva di tre carte.
- **Orologio** (`orologio/`): tredici mucchi in cerchio; il mucchio dove va la carta girata è evidenziato.
- **Le tredici** (`tredici/`): tredici colonne di quattro carte su due righe, re in fondo, colonne vuote che restano vuote.

## Decisioni prese

- **"Le tredici" = Baker's Dozen:** il piano non diceva quale solitario fosse. Scelto quello a tredici colonne, perché le coppie da 13 erano già nella Piramide.
- **Riferimenti alle voci di Wikipedia in inglese:** per questi cinque solitari non ci sono voci italiane complete.
- **Orologio:** il gioco è solo fortuna (si vince circa una volta su 13), quindi la pagina evidenzia il mucchio giusto: basta toccarlo.
- **Le tredici:** colonne su due righe (7 + 6) per stare nel telefono; il ventaglio di una colonna si stringe oltre 1,5 carte (nuova opzione `ventaglioMassimo` del motore) perché la seconda riga non copra la prima.
- **TriPeaks:** re e asso si toccano, come nelle regole classiche.

## Problemi aperti

- Prova su telefono da fare (utente).
- TriPeaks ha 10 carte nella riga in basso: sul telefono le carte sono piccole come nello Spider. Da ripensare nella fase APK.
