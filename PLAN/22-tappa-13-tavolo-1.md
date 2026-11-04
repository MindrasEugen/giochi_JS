# Tappa 13 — Da tavolo: Dama, Filetto (Mulino), Battaglia navale

Ultima modifica: 2026-11-04

## Obiettivo

I primi giochi da tavolo.

## Attività

- [x] Dama italiana: 2 giocatori o contro il PC, presa obbligatoria, damone, mosse possibili evidenziate
- [x] Filetto / Mulino: fasi di piazzamento, movimento e volo; un mulino toglie una pedina all'avversario; 2 giocatori o contro il PC
- [x] Battaglia navale: posizionamento delle navi (anche casuale); contro il PC, che cerca le navi vicino ai colpi andati a segno, o 2 giocatori con la schermata "Passa il dispositivo"
- [x] Design dei tre giochi (Codex, due giri) e CSS comune delle pagine di gioco `css/gioco.css`

## Come verificare

- Test con Node delle regole: prese obbligatorie della dama, mulini, affondamento delle navi.
- jsdom: partite complete; screenshot.

## Esito

Codice e test scritti da Claude, design da Codex (due giri), controllo finale di Claude.

File creati:
- `dama/`: `funzioni.js`, `main.js`, `index.html`, `style.css`, `test-dama.js`.
  - Logica: sequenze di presa (la pedina mangia solo in avanti e non mangia la dama; un pezzo non si mangia due volte; la pedina che arriva in fondo diventa dama e si ferma), `confrontaPrese` con le 4 priorità italiane, `mosseLegali` con presa obbligatoria, PC con minimax e alfa-beta (Facile a caso, Media 2 mosse, Difficile 5).
  - Pagina: selezione del pezzo con le destinazioni, avviso "devi mangiare!" con il pezzo obbligato evidenziato, ultima mossa evidenziata, patta dopo 40 mosse a testa senza prese.
- `filetto/`: `funzioni.js`, `main.js`, `index.html`, `style.css`, `test-filetto.js`.
  - Logica: 24 punti con i vicini, 16 mulini, fasi piazza/muovi/vola, togliere una pedina fuori dai mulini (o una qualsiasi se lo sono tutte), sconfitta con 2 pedine o senza mosse, PC con minimax (Difficile 4 mosse).
  - Pagina: tavoliere in SVG con 24 pulsanti sopra; dopo un mulino si sceglie la pedina da togliere tra quelle evidenziate; patta dopo 50 mosse senza prese.
- `battaglia_navale/`: `funzioni.js`, `main.js`, `index.html`, `style.css`, `test-battaglia.js`.
  - Logica: navi da 5, 4, 3, 3, 2 che non si sovrappongono e non si toccano, disposizione casuale, colpi (acqua, colpito, affondato), PC Facile a caso o Normale (a scacchiera, poi insegue la nave colpita ed esclude il contorno delle navi affondate).
  - Pagina: disposizione a mano (con "↻") o a caso; due campi; a 2 giocatori la schermata "Passa il dispositivo" tra un turno e l'altro, con le navi nascoste sotto il velo.
- `css/gioco.css` (Codex): regole comuni delle pagine di gioco ([ADR 0010](../ADR/0010-css-comune-delle-pagine-di-gioco.md)), usate dai tre giochi nuovi.
- `home.js`: Dama, Filetto e Battaglia navale nella categoria Da tavolo (13 giochi in tutto).

Verifica eseguita:
- `node dama/test-dama.js`: 22 controlli passati. Comprendono presa obbligatoria, pedina che non mangia la dama, le 4 priorità con posizioni costruite apposta, promozione che ferma la presa, la dama che fa il giro e torna al punto di partenza, la fine partita, e il Difficile che batte il Facile 10 volte su 10.
- `node filetto/test-filetto.js`: 19 controlli passati. Comprendono il tavoliere (collegamenti simmetrici, 32 collegamenti, ogni punto in 2 mulini), mulino e rimozione, movimento e volo, la fine partita, il PC che chiude e blocca i mulini, e il Difficile che batte il Facile 10 volte su 10.
- `node battaglia_navale/test-battaglia.js`: 20 controlli passati. Comprendono 1000 disposizioni casuali valide, i colpi, il contorno escluso, il PC che insegue la nave, e 200 partite per livello senza colpi ripetuti (Normale 43,9 colpi di media, Facile 95,5).
- jsdom, 40 controlli passati: partite in tutte le modalità, compresi l'obbligo di presa e la vittoria con promozione nella Dama, il mulino e la rimozione nel Filetto, la disposizione con navi rifiutate, la battaglia contro il PC e a 2 giocatori con le navi nascoste nella Battaglia navale, e la home con 13 giochi.
- Screenshot guardati da Claude, a 375 e 900 px, nella posizione iniziale e durante il gioco: la Dama con l'obbligo di presa e le dame, il Filetto con il mulino e le pedine da togliere, la Battaglia navale nella disposizione e nella battaglia.
- CSS mobile-first: nessuna `@media` con `max-width` in tutto il progetto; nessun BOM.

## Decisioni prese

- Dama italiana con la casella d'angolo scura a destra di ciascun giocatore (si gioca sulle caselle con riga + colonna pari); il bianco comincia; contro il computer giochi con il bianco.
- PC della Dama a 5 mosse di profondità e del Filetto a 4: battono sempre il livello Facile e rispondono in pochi millisecondi (fino a circa 200 ms per il Filetto).
- Battaglia navale: le navi non si toccano nemmeno in diagonale; i turni si alternano a ogni colpo, anche dopo un colpito.
- Nella Battaglia navale a 2 giocatori le navi non si disegnano mentre c'è la schermata "Passa il dispositivo", così non si vedono sotto il velo.
- `css/gioco.css` per le regole comuni delle pagine di gioco, dopo che al primo giro Codex aveva stilato solo le tavole ([ADR 0010](../ADR/0010-css-comune-delle-pagine-di-gioco.md)).

## Problemi aperti

- Su un telefono da 375 px le caselle della Dama sono di circa 40 px e quelle della Battaglia navale di circa 30 px, sotto i 44 px consigliati: è il limite di griglie 8×8 e 10×10 su schermi stretti.
- I giochi delle Tappe 11 e 12 hanno ancora le regole di pagina copiate nel loro `style.css`; spostarli su `css/gioco.css` è un lavoro a parte ([PLAN/90-fuori-mvp.md](90-fuori-mvp.md)).
- Prova a occhio nel browser vero (in particolare la Battaglia navale passando il telefono): la fa l'utente.
