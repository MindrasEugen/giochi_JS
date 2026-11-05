# Giochi JS

Raccolta di giochi in HTML, CSS e JavaScript, senza framework e senza compilazione.

## Avvio

Aprire `index.html` nel browser. In alternativa usare un server statico locale (per esempio Live Server in VS Code).
Non occorre installare dipendenze. I record e i nomi sono salvati nel browser; il loro contenuto dipende anche dall'origine con cui si apre il sito.

## Giochi disponibili

Sasso carta forbici, Indovina il numero, Sette e mezzo, Forza 4, Memory, Campo minato, Raddoppia, Sudoku, Tris, Dama, Filetto, Battaglia navale, Ludo e Scacchi, oltre a L'impiccato.
La sala arcade include Serpente, Ping pong, Mattoncini, Blocchi, Invasione, Volo e Labirinto. Con Cinque lettere, i dieci giochi del mazzo italiano i tre della Tappa 21 (Blackjack, Guerra, Cambio colore) i quattro della Tappa 22 (Poker heads-up, Scala 40, Ramino, Burraco) e i dieci solitari delle Tappe 23 e 24 (Klondike, FreeCell, Spider, Piramide, Golf, TriPeaks, Yukon, Scorpione, Orologio, Le tredici), la home contiene 50 giochi.

Serpente e Ping pong supportano due giocatori sullo stesso dispositivo, con tastiera o pulsanti touch. Mattoncini offre tre livelli, bonus temporanei e record. Tutti gli arcade hanno avvio esplicito, pausa, riavvio e pausa automatica al cambio di scheda.

Blocchi offre righe, livelli e due campi affiancati con la stessa sequenza di pezzi. Invasione ha ondate e scudi distruttibili. Volo permette una sfida a due turni con gli stessi ostacoli. Labirinto propone una mappa originale con luci, cristalli e guardiani. Anche questi giochi hanno pulsanti touch e record personali separati dalle sfide.

Cinque lettere offre sei tentativi, indizi corretti per le lettere doppie e un vocabolario locale di 1.376 parole. Si gioca da soli oppure in due, scegliendo a turno una parola segreta. La tastiera a schermo conserva l'indizio migliore per ogni lettera; parole non valide o ripetute non consumano tentativi.

Briscola, Scopa, Asso piglia tutto e Rubamazzetto usano le immagini del mazzo italiano. Si gioca contro il PC oppure in due passando il dispositivo; Briscola offre anche quattro giocatori in coppie con tre PC. Ogni partita comprende una smazzata completa.
Scopone scientifico (in coppie, anche con due persone e due compagni PC), Cirulla (presa del 15, matta e bussate), Tressette (a 2 con la pesca o a 4 in coppie, con obbligo di rispondere al seme) e Briscola chiamata (cinque giocatori, asta e socio segreto) completano il mazzo italiano. Mercante in fiera (asta con le fiches ed estrazione) e Cucù (scambi e vite) si giocano da 2 a 6, mescolando persone e PC.
Blackjack (in due uno dei giocatori fa il banco, a turno) e Guerra usano il mazzo francese; Cambio colore ha un mazzo originale disegnato in CSS, da 2 a 4 giocatori. Le varianti adottate e i riferimenti delle regole sono nelle singole pagine; il conteggio finale mostra tutti i punti assegnati.

## Verifiche

Con Node.js installato, dalla radice:

```sh
node scripts/check.js
```

Il comando controlla la sintassi JavaScript ed esegue tutti i file `test-*.js`; restituisce un codice diverso da zero in caso di errori.
Per la sola sintassi: `node scripts/check.js --syntax-only`.
Per una suite singola: `node scacchi/test-scacchi.js`.
Non sono necessari npm, build o librerie aggiuntive. I test che dipendono dal caso usano un seme ripetibile, oppure controllano proprietà valide per qualunque estrazione. Alcuni test misurano il tempo di risposta del PC (Forza 4, Dama, Filetto, Scacchi, Sudoku) con un margine ampio: su un computer molto lento un fallimento va analizzato conservando l'output.
I test delle pagine usano un DOM minimo senza librerie (`scripts/dom-minimo.js`): verificano la logica dei controller, non il rendering.

## Struttura

- Una cartella per gioco: `index.html`, `main.js`, `style.css`; i giochi più recenti separano la logica in `funzioni.js`.
- `js/`: strumenti condivisi per carte, giocatori e arcade.
- `css/`: stili e componenti comuni.
- `pezzi_scacco/`: i 12 PNG forniti dall'utente, usati su scacchiera, promozioni e pezzi catturati.
- `ADR/`: decisioni tecniche.
- `PLAN/`: stato e tappe di sviluppo.
- `audit/`: rapporti storici; la data identifica lo stato esaminato.
- `anteprima-componenti.html`: pagina di sviluppo con i componenti comuni (carte singole, tavolo con mano a ventaglio, finestre per 2 giocatori); non è collegata dalla home.

## Verifica manuale prima della pubblicazione

Controllare su desktop e telefono: cambio modalità, nuova partita durante l'attesa del PC, passaggio del dispositivo, modifica nomi e record dopo il ricaricamento.
Verificare tastiera, focus nelle finestre, scorrimento delle griglie e lettore di schermo.
Per Sette e mezzo controllare i titoli dopo cambio nomi a mano conclusa e lo scambio del banco alla mano successiva.
Per Scacchi controllare promozione, catture e annullamento.
Per Blocchi provare i due campi contemporaneamente e i comandi su schermo piccolo. Per Volo completare entrambi i turni e verificare il passaggio del dispositivo prima di iniziare il secondo.
Per Cinque lettere provare tastiera del computer e touch, lettere ripetute, parola segreta e passaggio del dispositivo nei due turni.
Per Briscola chiamata provare l’asta (offerte, passo, rilancio dopo il due) e la scelta della briscola; per il Tressette verificare che le carte di un altro seme siano disattivate quando si deve rispondere.
Per i giochi di carte provare le prese alternative, il furto del mazzetto, la raccolta della presa e il riavvio mentre il PC sta scegliendo. In due verificare che nessuna mano sia visibile durante il passaggio; in Briscola a quattro controllare che la mano del compagno resti coperta.
I test Node non sostituiscono queste verifiche nel browser.
