# Tappa 10 — Modalità 2 giocatori nei giochi già scritti

Ultima modifica: 2026-11-04

## Obiettivo

Aggiungere la modalità 2 giocatori, sullo stesso dispositivo, ai giochi esistenti che lo permettono.

## Attività

- [x] Impiccato: il giocatore 1 scrive la parola segreta (campo nascosto, solo lettere), il giocatore 2 indovina; poi i ruoli si scambiano e si tiene il punteggio
- [x] Indovina il numero: il giocatore 1 sceglie il numero (nascosto), il giocatore 2 indovina, poi si scambiano; vince chi trova il numero dell'altro con meno tentativi
- [x] Sasso carta forbici: si sceglie a turno; la scelta del primo resta coperta finché non ha scelto anche il secondo
- [x] Sette e mezzo: due giocatori contro il banco, uno dopo l'altro; il banco gioca alla fine
- [x] Tris: la modalità 2 giocatori c'è già; si aggiungono i nomi dei giocatori da `giocatori.js`
- [x] Design della barra della modalità, dei punteggi a 2 giocatori e dei tre riquadri di Sette e mezzo (Codex)

## Come verificare

- jsdom: una partita completa a 2 giocatori per ogni gioco, con lo scambio dei ruoli e il punteggio.
- Le modalità a 1 giocatore funzionano come prima (stessi test delle tappe precedenti).

## Esito

Codice scritto da Claude, design da Codex, controllo finale di Claude.

- `js/giocatori.js`: nuova funzione `collegaBarra()`, che collega il menu "1 giocatore / 2 giocatori" e il pulsante "Nomi" (visibile solo a 2 giocatori).
- **Impiccato:** il giocatore che sceglie scrive la parola in un campo nascosto. Sono accettate solo lettere, da 3 a 12; gli accenti vengono tolti. Poi compare "Passa il dispositivo" e l'altro indovina. Il punto va a chi indovina, oppure a chi ha scelto se l'altro non ci riesce. A ogni round i ruoli si scambiano (pulsante "Prossimo round").
- **Indovina il numero:** sfida in due turni. Ognuno sceglie un numero da 1 a 100 per l'altro, e vince chi indovina con meno tentativi. Chi non indovina conta come "limite + 1" tentativi. Se finiscono pari è pareggio.
- **Sasso carta forbici:** il giocatore 1 sceglie, poi "Passa il dispositivo" e la scelta resta coperta; sceglie il giocatore 2, poi si mostrano tutte e due le mani. I nomi sono sul tabellone.
- **Sette e mezzo** (`main.js` riscritto): una carta a testa all'inizio, poi gioca il giocatore 1 e dopo il giocatore 2. Il banco pesca finché non raggiunge il punteggio più alto di chi non ha sballato; se sballano tutti, vince il banco senza giocare. Il terzo riquadro compare solo a 2 giocatori; `data-turno` vale `giocatore`, `giocatore2` o `banco`.
- **Tris:** i nomi dei giocatori sono sul tabellone e nei messaggi ("Vince Anna (X)"), con il pulsante "Nomi". Contro il PC tutto resta come prima.
- **Home:** etichetta "1–2 giocatori" e descrizioni aggiornate per i 5 giochi.
- **Codex:** in `css/giocatori.css` gli stili di `.barra-modalita`, `.punteggi-due` e `.turno-due`; in `sette_e_mezzo/style.css` i tre riquadri e il turno del giocatore 2; in `tris/style.css` il pulsante "Nomi"; il collegamento a `css/giocatori.css` in quattro giochi. Claude l'ha aggiunto anche al Tris, che nel prompt mancava per una svista.

Verifica eseguita:
- jsdom, 42 controlli a 2 giocatori passati. Comprendono:
  - dati non validi: apostrofo, parola troppo corta, numero 150;
  - scambio dei ruoli, punteggi, pareggio;
  - tre casi del banco: batte il giocatore, sballa e vincono entrambi, tutti sballano;
  - ritorno a 1 giocatore;
  - nessun errore JavaScript.
- Rieseguiti tutti i test delle tappe precedenti (modalità a 1 giocatore): passano. I test che si aspettavano testi cambiati apposta sono stati aggiornati, compreso un controllo del Tris rimasto indietro dalla Tappa 7.
- `node tris/test-minimax.js` e `node js/test-mazzo.js` passano.
- Screenshot a 375 e 900 px, guardati da Claude: Sette e mezzo a 2 giocatori (tre riquadri, turno del giocatore 2 evidenziato), finestre "Tocca a…", "scegli la parola/il numero" e "Nomi", tabellina dei punti e riga del turno. Nessuno scorrimento orizzontale.
- Nessun `!important` nei CSS toccati da Codex. I due colori scritti a mano in `sette_e_mezzo/style.css` c'erano già dalla Tappa 8.

## Decisioni prese

- Tutti i giochi usano la stessa barra e le stesse finestre di `js/giocatori.js` ([ADR 0008](../ADR/0008-due-giocatori-sullo-stesso-dispositivo.md)).
- Sette e mezzo a 2 giocatori: il banco gioca una volta sola contro entrambi e deve raggiungere il punteggio più alto di chi non ha sballato. È la regola più vicina a quella del gioco con una sola persona.
- Indovina il numero: chi non trova il numero conta come "limite + 1" tentativi, così si può sempre confrontare con l'altro giocatore.
- I nomi dei giocatori sono salvati nel browser e valgono per tutti i giochi.

## Problemi aperti

- Cambiare la difficoltà a metà di una sfida di Indovina il numero fa ricominciare tutta la sfida. È voluto, ma non c'è un avviso.
- Prova a occhio nel browser vero, con due persone: la fa l'utente.
