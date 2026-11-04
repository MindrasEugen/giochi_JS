# Tappa 17 — Parole: Cinque lettere (tipo Wordle)

Ultima modifica: 2026-11-04

## Obiettivo

Un gioco di parole a 5 lettere.

## Attività

- [x] Cinque lettere: 6 tentativi, lettere verdi, gialle e grigie, tastiera a schermo, regola corretta per le lettere doppie
- [x] Lista italiana ampliata dalle 158 parole dell'impiccato a 1.376 voci uniche
- [x] 2 giocatori: uno sceglie la parola, l'altro indovina, poi si scambiano
- [x] Test della logica e del controller con DOM simulato
- [ ] Screenshot e prova interattiva nel browser, anche su telefono

## Come verificare

- Test con Node della colorazione, compresi i casi con lettere doppie.
- jsdom e screenshot.

## Esito

Cinque lettere disponibile dalla home, che raggiunge 23 giochi. Logica, vocabolario, pagina e stile separati. Nessuna nuova dipendenza. La colorazione è stata verificata su 59.049 coppie, oltre ai test di validazione, tastiera e fine partita. Il controller è stato verificato per i due turni, riservatezza della parola e riavvio della sfida.

## Decisioni prese

- Vocabolario locale: parole comuni, plurali e forme flesse; non un dizionario esaustivo. Le parole non riconosciute e quelle ripetute non consumano tentativi.
- Accenti ignorati; maiuscole e minuscole equivalenti. Segni distintivi oltre ai colori e descrizioni testuali per i lettori di schermo.
- Si assegnano prima tutte le lettere verdi, poi quelle gialle in base alle copie rimaste. La tastiera conserva sempre l'indizio migliore.
- La sfida dura due turni. Chi non trova la parola conta come sette tentativi; vince il totale inferiore, con pareggio possibile.
- Il tabellone del turno precedente viene cancellato prima di chiedere la nuova parola e di passare il dispositivo.

## Problemi aperti

Controllo nel browser del 2026-11-04 (Chrome, server locale, vedi `audit/2026-11-04-progetto-check.md`): pagine caricate senza errori in console né risorse mancanti, nessuno scorrimento orizzontale a 375px, tasti e clic sulla tastiera a schermo senza errori. Resta da fare la prova su un telefono vero (tastiera a schermo, passaggio del dispositivo). Tappa raccolta nel commit `0df7b0d`; i push restano a cura dell'utente.
