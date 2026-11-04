# Giochi JS

Raccolta di giochi in HTML, CSS e JavaScript, senza framework e senza compilazione.

## Avvio

Aprire `index.html` nel browser. In alternativa usare un server statico locale (per esempio Live Server in VS Code).
Non occorre installare dipendenze. I record e i nomi sono salvati nel browser; il loro contenuto dipende anche dall'origine con cui si apre il sito.

## Giochi disponibili

Sasso carta forbici, Indovina il numero, Sette e mezzo, Forza 4, Memory, Campo minato, Raddoppia, Sudoku, Tris, Dama, Filetto, Battaglia navale, Ludo e Scacchi, oltre a L'impiccato.
La sala arcade include anche Serpente, Ping pong e Mattoncini: 18 giochi disponibili nella home.

Serpente e Ping pong supportano due giocatori sullo stesso dispositivo, con tastiera o pulsanti touch. Mattoncini offre tre livelli, bonus temporanei e record. Tutti gli arcade hanno avvio esplicito, pausa, riavvio e pausa automatica al cambio di scheda.

## Verifiche

Con Node.js installato, dalla radice:

```sh
node scripts/check.js
```

Il comando controlla la sintassi JavaScript ed esegue tutti i file `test-*.js`; restituisce un codice diverso da zero in caso di errori.
Per la sola sintassi: `node scripts/check.js --syntax-only`.
Per una suite singola: `node scacchi/test-scacchi.js`.
Non sono necessari npm, build o librerie aggiuntive. Alcuni test storici usano casualita' e soglie temporali: un fallimento va analizzato conservando l'output.

## Struttura

- Una cartella per gioco: `index.html`, `main.js`, `style.css`; i giochi piu' recenti separano la logica in `funzioni.js`.
- `js/`: strumenti condivisi per carte, giocatori e arcade.
- `css/`: stili e componenti comuni.
- `ADR/`: decisioni tecniche.
- `PLAN/`: stato e tappe di sviluppo.
- `audit/`: rapporti storici; la data identifica lo stato esaminato.

## Verifica manuale prima della pubblicazione

Controllare su desktop e telefono: cambio modalita', nuova partita durante l'attesa del PC, passaggio del dispositivo, modifica nomi e record dopo il ricaricamento.
Verificare tastiera, focus nelle finestre, scorrimento delle griglie e lettore di schermo.
Per Sette e mezzo controllare i titoli dopo cambio nomi a mano conclusa e lo scambio del banco alla mano successiva.
Per Scacchi controllare promozione, catture e annullamento.
I test Node non sostituiscono queste verifiche nel browser.
