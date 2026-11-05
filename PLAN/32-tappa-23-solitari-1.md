# Tappa 23 — Solitari: Klondike, FreeCell, Spider, Piramide, Golf

Ultima modifica: 2026-11-05

## Obiettivo

I primi cinque solitari, a 1 giocatore.

## Attività

- [x] Trascinamento delle carte con mouse e dito, doppio clic per mandare una carta alla base
- [x] Annulla mossa, tempo, contatore delle mosse
- [x] Klondike (pesca 1 o 3), FreeCell, Spider (1, 2 o 4 semi), Piramide, Golf
- [x] CSS comune dei solitari (Codex, primo giro) e prova del trascinamento nel browser (asso trascinato sulla base, carta sotto girata)
- [ ] Prova su telefono (utente)

## Come verificare

- Test con Node delle mosse valide di ogni solitario: `node js/test-solitari.js`.
- FreeCell: il risolutore automatico conferma che ogni partita generata è risolvibile (nel test e alla creazione di ogni partita).
- Pagine con DOM simulato (tocchi, annulla, nuova partita): `node js/test-solitari-pagine.js`.
- Screenshot e prova del trascinamento nel browser vero.

## Esito

Cinque solitari nuovi dalla home, che arriva a 45 giochi. Ogni solitario ha solo il motore delle regole (`funzioni.js`); la pagina è comune: `js/solitario-pagina.js` disegna le pile in posizione assoluta calcolando la larghezza delle carte dallo schermo, gestisce trascinamento con Pointer Events (mouse e dito), tocco-tocco, doppio tocco verso la base, annulla (anche più volte), tempo, mosse, pulsante Completa (Klondike e FreeCell) e fine partita (vittoria o partita bloccata per Piramide e Golf).

## Decisioni prese

- **Una pagina comune, un motore per gioco:** ogni motore espone `crea`, `puoPrendere`, `puoPosare`, `sposta`, `clicMazzo`, `autoBase`, `vinto` e `disposizione` (posizioni delle pile in unità di carta). Piramide e Golf rientrano nello stesso schema: nella Piramide "posare" una carta su un'altra significa eliminare la coppia da 13; nel Golf basta un tocco.
- **Tocco-tocco oltre al trascinamento:** sul telefono è più comodo; in attesa della fase APK, dove i comandi touch verranno ripensati.
- **FreeCell:** risolutore "prima il migliore" con mosse di una carta e spostamenti sicuri alle basi; una partita non risolta entro 150.000 posizioni viene scartata e rimescolata. Nelle prove tutte le partite si risolvono in meno di un secondo.
- **Klondike:** giri del mazzo illimitati, nessun punteggio. **Spider:** non si distribuisce con una colonna vuota (regola classica). **Piramide:** tre passaggi del mazzo. **Golf:** niente asso sul re né re sull'asso; il punteggio è il numero di carte rimaste.
- **Annulla** conta come una mossa (il contatore non torna indietro).

## Problemi aperti

- Prova su telefono da fare (utente).
- A 375px le carte sono larghe 38px (7 colonne), 33px (FreeCell) e 26px (Spider, 10 colonne): giocabili ma piccole. Da ripensare nella fase APK insieme ai comandi touch ([Fuori MVP](90-fuori-mvp.md)).
- Difetti trovati nel controllo e corretti: la carta trascinata passava sotto le altre (z-index in linea, segnalato da Codex), il gioco non era centrato, e la larghezza delle carte veniva fissata da css/carte.css invece che dal tavolo.
