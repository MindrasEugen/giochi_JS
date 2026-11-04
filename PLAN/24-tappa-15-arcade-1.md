# Tappa 15 — Arcade: Serpente, Ping pong, Mattoncini

Ultima modifica: 2026-11-05

## Obiettivo

I primi giochi arcade su `<canvas>`, con lo script comune `arcade.js`.

## Attività

- [x] Serpente (genere Snake): 1 giocatore, oppure 2 serpenti sullo stesso schermo (frecce e WASD)
- [x] Ping pong (genere Pong): 2 giocatori sulla stessa tastiera o contro il PC
- [x] Mattoncini (genere Breakout): livelli, bonus, record
- [x] Comandi touch implementati per tutti e tre
- [x] Screenshot e prova interattiva nel browser e sul telefono

## Come verificare

- Test con Node delle collisioni.
- Screenshot e prova nel browser vero, perché le animazioni non si possono verificare con jsdom.

## Esito

Implementazione disponibile dalla home: 18 giochi. Logica separata dalle pagine, controller comune in `js/arcade-pagina.js`, CSS mobile-first in `css/arcade.css`. Verifiche automatiche con `node scripts/check.js`.

## Decisioni prese

Ping pong termina a 7 punti; il PC ha una velocità limitata. Mattoncini ha tre livelli, tre vite e un bonus che allarga la racchetta per 10 secondi. Pausa esplicita e automatica al cambio scheda; i record dei duelli non sovrascrivono quelli personali.

Modifica del 2026-11-05, su richiesta dell'utente: nel Serpente i muri si attraversano (si esce da un lato e si rientra da quello opposto) e da soli si muore solo mordendosi la coda. A 2 giocatori sbattere contro l'altro serpente resta mortale (scelta dell'utente), così in due si può ancora chiudere l'avversario; testa contro testa resta pareggio. Cambiati `serpente/funzioni.js`, le regole in `serpente/index.html` e `serpente/test-serpente.js` (attraversamento dei quattro bordi, cibo oltre il bordo, morso attraverso il bordo, partite casuali con seme ripetibile).

## Problemi aperti

Controllo nel browser del 2026-11-04 (Chrome, server locale, vedi `audit/2026-11-04-progetto-check.md`): pagine caricate senza errori in console né risorse mancanti, nessuno scorrimento orizzontale a 375px, partite avviate con tasti e clic senza errori. Prova su telefono eseguita dall'utente il 2026-11-05 sulla maggior parte dei giochi: funzionano. I comandi touch risultano un po' scomodi: si sistemeranno nella fase APK a fine progetto (vedi [Fuori MVP](90-fuori-mvp.md)).
