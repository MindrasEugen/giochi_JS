# Tappa 19 — Mazzo italiano: Scopone scientifico, Tressette, Cirulla, Briscola a 5

Ultima modifica: 2026-11-05

## Obiettivo

I giochi di carte italiani più complessi.

## Attività

- [x] Scopone scientifico a 4 (2 coppie)
- [x] Tressette a 2 e a 4, con l'obbligo di rispondere al seme
- [x] Cirulla, con le regole delle scope speciali
- [x] Briscola a 5, con la chiamata del compagno
- [x] Motore delle prese e pagina condivisa estesi da 2 a 5 posti ([ADR 0011](../ADR/0011-tavolo-carte-italiane-da-2-a-5-posti.md))
- [x] CSS: opzioni dell'asta su più colonne (scritto da Claude: Codex bloccato oltre 20 minuti senza scrivere, annotato in failures.md)
- [x] Prova su telefono (utente, 2026-11-05: tutto a posto)

## Come verificare

- Test con Node delle regole di presa e dei punteggi: `node scopone/test-scopone.js`, `node cirulla/test-cirulla.js`, `node tressette/test-tressette.js`, `node briscola_chiamata/test-briscola-chiamata.js`.
- DOM simulato: smazzate complete tramite i pulsanti delle pagine, in tutte le modalità: `node js/test-carte-italiane-nuove-pagine.js`. Le pagine della Tappa 18 restano verdi con `node js/test-carte-italiane-pagine.js`.
- Browser: smazzata completa giocata in automatico nelle quattro pagine, senza errori in console; asta della Briscola chiamata provata a mano.

## Esito

Quattro giochi nuovi dalla home, che arriva a 31 giochi: cartelle `scopone/`, `cirulla/`, `tressette/`, `briscola_chiamata/`. Regole verificate sulle voci di Wikipedia (Scopone, Cirulla, Tressette, Briscola a chiamata), linkate in ogni pagina.

- `js/prese-italiane.js`: varianti in una tabella, prese e scope contate per squadra, presa del 15, asso piglia tutto, matta, bussate, tavola iniziale da 15 o 30, napola, grande e piccola.
- `js/carte-italiane-pagina.js`: da 2 a 5 posti, persone e PC mescolati, mosse senza carta (asta, seme) come pulsanti, carte non giocabili disattivate, testi propri di ogni gioco nel `config`.
- Nuovi motori: `tressette/funzioni.js`, `briscola_chiamata/funzioni.js`. Scopone e Cirulla sono varianti del motore delle prese.
- Test: 5 suite nuove (Scopone, Cirulla, Tressette, Briscola chiamata, pagine). 200–400 smazzate simulate per gioco: carte conservate, Tressette sempre a 11 punti, Briscola chiamata sempre a 120.

## Decisioni prese

- **Scopone scientifico:** 9 carte a testa e 4 in tavola (come nella voce di Wikipedia), tre re in tavola si ridistribuisce, napola inclusa. Senza il primo turno a carte scoperte. Modalità: tu + compagno PC, oppure due persone avversarie, ognuna con un compagno PC.
- **Cirulla:** a 2 giocatori. La carta uguale ha la precedenza sulle somme, la presa del 15 è sempre possibile; prendere è obbligatorio. Le bussate si dichiarano da sole a ogni distribuzione (decino 10 scope, bàrsega 3), senza il tris da 13. Resti a chi ha preso per ultimo (la voce non lo indica: regola della Scopa).
- **Tressette:** obbligo di rispondere al seme (richiesto dal piano; la voce di Wikipedia lo descrive in modo indiretto). Nessuna accusa. A 2 le carte pescate sono scritte nei messaggi, perché la regola le mostra all'avversario.
- **Briscola chiamata:** solo una persona con quattro PC. Asta per carte decrescenti, poi rilancio a punti dopo il due (da 62). Il chiamante vince con almeno 61 punti o con i punti offerti. Senza la chiamata «solo». I punti delle squadre si vedono solo quando il socio si scopre. Il PC conosce solo quello che saprebbe un giocatore vero (test dedicato).
- **Una sola smazzata per partita**, come nella Tappa 18.

## Problemi aperti

- La strategia del PC è semplice: nella Briscola chiamata il chiamante PC vince circa 8 volte su 10 nelle simulazioni, perché gli avversari collaborano poco prima che il socio si scopra.
- Prova su telefono eseguita dall'utente il 2026-11-05: passata.
