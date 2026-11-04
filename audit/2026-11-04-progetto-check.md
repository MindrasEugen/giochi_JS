# Audit — controllo completo del progetto (27 giochi)

Data: 2026-11-04 (stato del commit `57bc737`, Tappa 18)

## Giudizio generale

Il progetto è in buona salute. Tutti i controlli automatici passano: 89 file JavaScript senza errori di sintassi e 28 suite di test verdi (circa 1 minuto in tutto). Per la prima volta è stato possibile anche un controllo **nel browser** (Chrome, server locale): le 27 pagine si caricano senza errori in console e senza risorse mancanti, e le quattro pagine del mazzo italiano sono state giocate in automatico fino alla fine della smazzata senza errori. Non ci sono link rotti, ogni pagina ha `lang="it"`, `viewport`, un solo `h1`, nessun pulsante senza nome e nessuna immagine senza `alt`. Nessun `console.log` rimasto nel codice dei giochi. I problemi trovati sono di documentazione e di copertura delle verifiche, non bug visibili.

Limite del controllo: la finestra di Chrome non si è lasciata ridimensionare, quindi il telefono è stato simulato con un riquadro largo 375px (verificata solo l'assenza di scorrimento orizzontale). Touch reale, lettore di schermo e aspetto su telefono restano da provare a mano.

## Riepilogo

| # | File | Riga | Criticità | Problema in breve |
|---|---|---|---|---|
| 1 | `PLAN/24-tappa-15-arcade-1.md` … `27-tappa-18-italiano-1.md`, `PLAN/02-tappe.md` | — | Media | Tappe 15–18 ancora "in corso": manca la prova visiva, ora possibile in gran parte |
| 2 | `PLAN/27-tappa-18-italiano-1.md` | 43 | Bassa | Dice "Nessun commit della Tappa 18", ma il commit `57bc737` esiste |
| 3 | `PLAN/01-stato-attuale.md`, `91-prossimo-passo.md` | — | Bassa | "presente commit locale" invece dell'hash `57bc737` |
| 4 | `il_impiccato/`, `indovina_il_numero/`, `sasso_carta_forbici/`, `sette_e_mezzo/` | — | Bassa | I quattro giochi storici non hanno una suite di test della logica |
| 5 | `README.md` | varie | Bassa | Accenti scritti come apostrofo (`casualita'`, `modalita'`, `piu'`) |
| 6 | `carte/back.png`, `carte/dorso.png` | — | Nessuna | Due dorsi diversi: verificato, servono entrambi |
| 7 | `anteprima-componenti.html` | — | Bassa | Pagina di prova nella radice: non è nella home, valutare se tenerla |
| 8 | test con casualità e tempi (es. `scacchi/test-scacchi.js`) | — | Bassa | Alcuni test dipendono dal caso e dalla velocità del PC (già noto nel README) |

## 1. Tappe 15–18 bloccate sulla prova visiva

Criticità: Media. Le quattro tappe sono implementate e testate, ma restano ◐ perché il browser non era disponibile. In questo controllo il browser funzionava: nessun errore al caricamento, nessun errore giocando (pulsanti di avvio, tasti, clic sulle caselle per 23 giochi; smazzate intere per Briscola, Scopa, Asso piglia tutto e Rubamazzetto).
Suggerimento: fare la checklist manuale del README su telefono vero (touch, passaggio del dispositivo, schermi piccoli) e poi chiudere le tappe.

## 2. Tappa 18: frase sul commit superata

Criticità: Bassa. Riga 43: "Nessun commit o push della Tappa 18". Il commit `57bc737` raccoglie la tappa.
Suggerimento: aggiornare la frase con l'hash.

## 3. Stato attuale e prossimo passo senza hash

Criticità: Bassa. "raccolta nel presente commit locale" era vero prima del commit, ora è ambiguo.
Suggerimento: sostituire con `57bc737`.

## 4. Giochi storici senza test della logica

Criticità: Bassa. Sette e mezzo è coperto solo in parte da `scripts/test-interfacce.js`; Impiccato, Indovina il numero e Sasso carta forbici non hanno test. Sono giochi semplici e il browser non ha mostrato errori.
Suggerimento: se in futuro si tocca la loro logica, separarla in `funzioni.js` come nei giochi recenti e aggiungere un `test-*.js`.

## 5. Accenti nel README

Criticità: Bassa. Il resto del progetto usa le lettere accentate corrette.
Suggerimento: sostituire `a'`, `e'`, `o'` con `à`, `è`, `ò`.

## 6. Due immagini del dorso

Criticità: Nessuna. `back.png` (15 KB) e `dorso.png` (32 KB) sono file diversi. Verificato in `js/carte.js:22`: `dorso.png` è il dorso del mazzo italiano, `back.png` quello del mazzo francese (Tappe 21–24).
Suggerimento: nessuno.

## 7. Pagina di anteprima nella radice

Criticità: Bassa. `anteprima-componenti.html` è utile per lo sviluppo ma è pubblica come le altre pagine.
Suggerimento: tenerla, ma citarla nel README come pagina di sviluppo.

## 8. Test non deterministici

Criticità: Bassa. Per esempio il confronto "PC Media contro Facile" degli Scacchi impiega circa 31 secondi e dipende dal caso. Nel controllo di oggi sono passati tutti.
Suggerimento: se un test fallisce in modo saltuario, fissare un seme per i numeri casuali.
