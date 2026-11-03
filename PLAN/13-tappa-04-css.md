# Tappa 4 — CSS migliorato per tutti i giochi

Ultima modifica: 2026-11-03

## Obiettivo

Dare a tutti i giochi un aspetto curato e coerente, seguendo lo schema P.A.L.E.T.T.E., con CSS scritto a mano (nessun framework come Tailwind o Bootstrap).

## Attività

- [x] `css/comune.css`: palette in variabili CSS, font, pulsanti, focus visibile, contenitore centrato, link "Tutti i giochi" ([ADR 0003](../ADR/0003-css-comune-piu-css-del-gioco.md))
- [x] Ogni gioco collega `css/comune.css` e poi il proprio `style.css`, che contiene solo ciò che è specifico del gioco
- [x] Impiccato: tastiera e disegno affiancati, lettere usate più leggibili
- [x] Indovina il numero: form ordinato, messaggi colorati (alto/basso/vinto)
- [x] Sasso carta forbici: stile completo (oggi c'è solo il colore di sfondo), pulsanti grandi, punteggio in evidenza
- [x] Sette e mezzo: si tiene il tema "tavolo verde" e lo si porta sulle variabili comuni
- [x] Tris: griglia centrata, simboli X e O di colori diversi, celle che si evidenziano al passaggio del mouse
- [x] Contrasto dei testi almeno AA, pagine utilizzabili da telefono

## Come verificare

- Aprire i 5 giochi e la home: stessa famiglia di colori, font e pulsanti.
- Con il tasto Tab si vede sempre dove si trova il focus.
- F12 → modalità dispositivo a 375 px: nessuno scorrimento orizzontale, niente sovrapposizioni.
- I giochi funzionano ancora come prima (una partita completa per gioco).

## Esito

Lavoro fatto da Claude: il task di Codex è stato fermato su richiesta dell'utente prima che scrivesse qualcosa. Da qui in poi l'utente vuole che le modifiche le faccia Claude.

File modificati:
- I 5 `index.html` collegano `../css/comune.css` prima di `./style.css`. Aggiunte solo classi (`pulsante`, `pulsante--secondario`, `scelta`, `badge`), un wrapper `.azioni` in Indovina il numero e `aria-live="polite"` sulle aree dei messaggi. Nessun id e nessun testo cambiato.
- I 5 `style.css` sono riscritti: solo regole del gioco, con le variabili comuni, mobile-first, `:hover` e `:disabled` curati.
- JS, senza cambiare la logica:
  - impiccato e sasso carta forbici: `style.color` e `style.fontWeight` sostituiti da classi `messaggio--*` (più `risultato--finale`);
  - indovina il numero: classi `messaggio--*` su Troppo alto, Troppo basso, Indovinato e Fine;
  - tris: `data-simbolo` sulle celle, per colorare X e O.
- `css/comune.css`: `.link-home` resta a sinistra anche nei contenitori centrati; `.pulsante` usa il font della pagina (prima i `<button>` mostravano Arial).

Verifica eseguita:
- Screenshot con Edge headless dei 5 giochi a 1100 px e dentro iframe da 375 px: nessuno scorrimento orizzontale, niente sovrapposizioni.
- Prova con jsdom, 18 controlli passati. Sono comprese le partite complete:
  - impiccato: avviso, vittoria, sconfitta con il disegno 6, nuova partita;
  - indovina il numero: avviso, vittoria, nuova partita;
  - sasso carta forbici: fino a fine partita e nuova partita;
  - tris: `data-simbolo` impostato e cancellato, mossa del PC;
  - sette e mezzo: caricamento della pagina;
  - nessun errore JavaScript in nessun gioco.
- Contrasti calcolati: tutti tra 5,5:1 e 8,4:1 (AA). Per esempio O rossa su bianco 5,85:1, oro su tavolo verde 7,83:1.
- `node --check` ok su tutti i JS; nessun `!important`.

## Decisioni prese

- Sette e mezzo mantiene il tavolo verde: il primario della palette fa da tavolo, l'oro fa da pulsanti e messaggi. Titoli e link sono riportati a colori chiari per il fondo scuro.
- Nel Tris X è blu (`--colore-info`) e O è rossa (`--colore-errore`).
- I tasti già usati nell'impiccato sono barrati oltre che più chiari, così si distinguono anche senza vedere i colori.
- L'attributo `data-simbolo` è una soluzione provvisoria: con la Tappa 5 il Tris disegna la griglia da un array ([ADR 0005](../ADR/0005-logica-del-tris-separata-dalla-pagina.md)).

## Problemi aperti

- Prova a occhio nel browser vero, in particolare l'hover e il focus con il tasto Tab: la faccia l'utente.
