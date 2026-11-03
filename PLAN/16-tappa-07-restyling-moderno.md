# Tappa 7 — Restyling moderno di Sasso carta forbici e Tris

Ultima modifica: 2026-11-03

## Obiettivo

Su richiesta dell'utente, dare a Sasso carta forbici e al Tris un aspetto moderno, da app di giochi, non solo ordinato. La palette crema, verde e oro resta la stessa (Tappa 3). Cambiano forme, profondità, icone e animazioni.

## Attività

- [x] `css/comune.css`: sfondo con sfumature leggere, pulsanti con rilievo e "pressione" al clic, select con freccia personalizzata, pannello `<details>` per le regole
- [x] Sasso carta forbici: tabellone "Tu – PC" con i numeri grandi, arena con le due mani (emoji) che entrano con un'animazione, tre scelte a tessera con icona, regole richiudibili
- [x] Tris: tabellone X/O che evidenzia di chi è il turno, griglia su un pannello scuro, simboli che "spuntano", anteprima del simbolo al passaggio del mouse, linea vincente evidenziata, regole richiudibili
- [x] JS solo per la parte visiva: punteggi scritti come numeri, emoji delle mani, `data-turno`, caselle vincenti (`rigaVincente`). La logica dei giochi resta la stessa
- [x] Animazioni disattivate con `prefers-reduced-motion`

## Come verificare

- Screenshot a 375 px e a desktop, prima e durante una partita.
- Prova con jsdom di partite complete per i due giochi, senza errori JavaScript.
- `node tris/test-minimax.js` passa ancora.
- Contrasti AA per i colori nuovi.

## Esito

Lavoro fatto da Claude.

- `css/comune.css` (vale per tutte le pagine):
  - sfondo con due aloni sfumati (oro e verde);
  - titoli con dimensione fluida (`clamp`);
  - pulsanti con rilievo, sollevamento al passaggio del mouse ed effetto "pressione" al clic;
  - `select` con freccia disegnata in SVG;
  - nuovo componente `.pannello` per le regole richiudibili (`<details>`);
  - card più arrotondate e nuove variabili (`--ombra-forte`, `--raggio-xl`, `--molla`).
- Sasso carta forbici, file `index.html`, `main.js` e `style.css`:
  - tabellone scuro "Tu – VS – PC" con i numeri grandi;
  - arena con le due mani in emoji (quella del PC è specchiata), che entrano con un'animazione a ogni turno;
  - risultato in una "pillola" colorata;
  - tre scelte a tessera con icona;
  - regole richiudibili.
  - Nel JS il punteggio si scrive come numero (`aggiornaPunteggio()`), le mani sono mostrate da `mostraMani()` e la riga del PC resta per i lettori di schermo. La logica del turno e dei 5 punti è la stessa.
- Tris, file `index.html`, `main.js`, `style.css` e `funzioni.js`:
  - tabellone con una scheda per giocatore, che si evidenzia quando è il suo turno (`data-turno`);
  - i nomi diventano "Tu" e "Computer" contro il PC;
  - griglia su un pannello verde con caselle a tessera;
  - simboli che "spuntano" e anteprima leggera del simbolo al passaggio del mouse;
  - le tre caselle del tris si colorano d'oro e pulsano;
  - `aria-label` dinamico sulle caselle ("Casella 5: X");
  - regole richiudibili.
  - Nuova funzione `rigaVincente()`; `trovaVincitore()` ora la usa.

Verifica eseguita:
- `node tris/test-minimax.js`: ancora 0 vittorie di X su 569 partite.
- jsdom, 17 controlli passati. Comprende:
  - Sasso carta forbici: tabellone, mani, animazione, partita completa con messaggio coerente con il punteggio, nuova partita;
  - Tris: turno, etichette, riga vincente, nomi contro il PC, 100 partite contro Impossibile senza sconfitte;
  - gli altri 3 giochi caricano senza errori.
- Screenshot a 375 e 800 px durante una partita, più home, impiccato, indovina il numero e sette e mezzo dopo le modifiche al CSS comune: nessuno scorrimento orizzontale, niente sovrapposizioni.
- Contrasti dei colori nuovi tra 4,83:1 e 8,86:1 (AA). Per esempio "Hai perso il turno" 4,83:1 e la casella vincente 7,83:1.

## Decisioni prese

- Le icone sono emoji e non immagini: non serve nessun file in più e si vedono su ogni sistema. Sono nascoste ai lettori di schermo (`aria-hidden`), che leggono invece il testo.
- Le regole sono in un `<details>` richiudibile, così la pagina del gioco resta compatta.
- Le animazioni sono brevi e si disattivano da sole con `prefers-reduced-motion` (regola già presente in `css/comune.css`).
- Per l'aspetto visivo sono state toccate un po' di HTML e JS (punteggi come numeri, `data-turno`, `rigaVincente`), ma non la logica dei giochi.

## Problemi aperti

- Prova a occhio nel browser vero (hover, animazioni, Tab): la fa l'utente. Se si vede ancora lo stile vecchio, ricaricare con Ctrl+F5.
