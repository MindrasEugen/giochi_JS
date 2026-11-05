# Tappa 25 — Tavola a schermo intero sul telefono (Serpente e solitari)

Ultima modifica: 2026-11-05

## Obiettivo

Sul telefono la tavola da gioco occupa tutto lo schermo. Intestazione, regole, modalità, nomi e il resto passano in un **pannello sopra il gioco**, aperto da una barra sottile in alto. Mentre il pannello è aperto il gioco va in pausa. Il layout si prova prima su Serpente (arcade) e sui 10 solitari. Contiene anche la [Tappa 24.1](35-tappa-24-1-carte-leggibili.md) (carte leggibili), per scelta dell'utente.

## Attività

- [x] Barra in alto comune: "← Giochi", nome del gioco, "Regole", "⋯" (menu); pulsante "Schermo intero" dove il browser lo permette (Android sì, iPhone Safari quasi mai)
- [x] Pannello sopra il gioco (componente comune in `js/`): contiene regole, modalità 1/2 giocatori, nomi, record, nuova partita; apertura = pausa, chiusura = il gioco resta in pausa finché non si tocca Riprendi
- [x] Opzione nascosta nel pannello "Mostra pulsanti sullo schermo" (spenta di default sui dispositivi touch), ricordata nel browser con `localStorage`
- [x] Serpente: campo a tutta altezza (`100dvh` meno la barra), tabellone ridotto a una riga sopra il campo
- [x] Serpente come prova dei gesti (aggiunta durante la tappa: senza pulsanti sul telefono serviva un comando): scorrere il dito sul campo gira il serpente, un tocco avvia o riprende; in due il campo è diviso a metà
- [x] Solitari (`js/solitario-pagina.js`): tavolo a tutta altezza; dalla 24.1: carte semplificate (valore e seme grandi, in CSS) quando sono più strette di 60px, con interruttore nel pannello per tornare alle immagini; bordi e margini ridotti
- [x] Computer: layout e tastiera come oggi (CSS mobile-first: lo schermo intero è lo stile base, il layout largo arriva con `min-width`)
- [x] CSS della barra, del pannello, del campo a tutta altezza e delle carte semplificate (Codex)
- [x] Test automatici: pannello apre/chiude e mette in pausa, opzione pulsanti ricordata, solitari giocabili con i tocchi (anche con carte semplificate)
- [ ] Prova su telefono (utente)

## Come verificare

- `node js/test-arcade-pagine.js` e `node js/test-solitari-pagine.js` (con i nuovi controlli) tutti OK.
- Nel browser a 375×667 e 390×844: nessuno scorrimento della pagina in Serpente e Klondike, campo/tavolo visibile per intero, pannello che si apre e chiude, partita in pausa con il pannello aperto.
- Screenshot a 375px di Serpente, Klondike, Spider e TriPeaks (anche carte semplificate).
- A 1280px: layout del computer invariato.
- Prova su telefono (utente).

## Esito

- **Nuovi file:** `js/tavola.js` (barra, pannello, opzioni, schermo intero), `css/tavola.css` (Codex, due giri), `js/test-tavola.js` (DOM finto ad albero), [ADR 0012](../ADR/0012-tavola-a-schermo-intero-sul-telefono.md).
- **Modificati:** `js/arcade-pagina.js` (pausa con il pannello, gesti con `config.scorri`, opzione "Mostra i pulsanti"), `serpente/main.js` e `serpente/index.html` (gesti, regole aggiornate), `js/solitario-pagina.js` (carte semplificate sotto i 60px, spazio tra le colonne ridotto, tempo fermo con il pannello aperto, opzione "Carte con le immagini"), le 10 pagine dei solitari (`data-pannello`, nuovi script e CSS), `css/solitario.css` (blocco del telefono riscritto mobile-first), test di arcade e solitari.
- **Verifiche:** `node scripts/check.js`: 56 suite, 0 controlli falliti. Nel browser (Chrome, 375×667 e 390×844, con tocco): nessuno scorrimento della pagina in Serpente, Klondike, Spider, TriPeaks e FreeCell; il campo di Serpente è tutto visibile; un tocco avvia, lo scorrimento gira il serpente; "Regole" mette in pausa; il menu mostra intestazione, modalità, regole e opzioni; le opzioni funzionano (pulsanti a schermo, carte con le immagini). A 900 e 1280px le misure della pagina (contenitore, tavolo, titolo, pulsanti) sono identiche a prima della tappa, confrontate con la versione del commit precedente.
- **Codex:** primo giro in circa 3 minuti e mezzo, secondo giro in circa 3 minuti (tabellone di Serpente troppo alto con "Esplorazione" spezzata, messaggio dei solitari tagliato, riepilogo su 4 righe: visti da Claude negli screenshot). Perimetro rispettato.

## Decisioni prese

- Regole e contenuti in un pannello sopra il gioco, non in pagine separate: cambiando pagina la partita si perderebbe (scelta dell'utente, 2026-11-05). Andrà in un ADR.
- Pulsanti a schermo nascosti sul telefono, con un'opzione per mostrarli (scelta dell'utente).
- Gli elementi vanno nel pannello spostandoli con il JavaScript, non nascondendoli con il CSS: così il CSS resta mobile-first e i loro eventi continuano a funzionare ([ADR 0012](../ADR/0012-tavola-a-schermo-intero-sul-telefono.md)).
- Le carte semplificate dipendono dalla larghezza della carta, non dal dispositivo: compaiono anche in una finestra stretta del computer o su un tablet piccolo (per esempio Klondike a 600px, Spider fino a circa 750px). Sopra i 600px il pannello non c'è, quindi l'opzione "Carte con le immagini" non si può cambiare lì; vale comunque quella scelta sul telefono, perché è ricordata nel browser.
- I gesti di Serpente sono stati anticipati da questa tappa perché, senza pulsanti, sul telefono non si poteva giocare. Gli altri arcade nella [Tappa 26](37-tappa-26-gesti-arcade.md).

## Problemi aperti

- Prova su telefono dell'utente da fare.
- Serpente a 375px: nei riquadri del tabellone "Record personale" ed "Esplorazione" sono tagliati con i puntini. Da rivedere nella Tappa 26, quando il layout passa a tutti gli arcade.
- `css/gioco.css` e `css/home.css` contengono ancora media query `max-width` (non toccate in questa tappa): da riscrivere mobile-first, `gioco.css` nella [Tappa 27](38-tappa-27-schermo-intero-tutti.md).
- Un telefono in orizzontale largo più di 600px riceve il layout del computer.
