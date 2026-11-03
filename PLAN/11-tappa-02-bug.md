# Tappa 2 — Correzione dei bug dell'audit

Ultima modifica: 2026-11-03

## Obiettivo

Correggere i problemi elencati in [audit/2026-11-03-progetto-audit.md](../audit/2026-11-03-progetto-audit.md), senza cambiare le regole dei giochi. Il riordino del codice del Tris non si fa qui ma nella [Tappa 5](14-tappa-05-tris-difficolta.md).

## Attività

**Indovina il numero**
- [ ] "Nuova partita" da `type="reset"` a `type="button"`, così la difficoltà scelta resta quella mostrata
- [ ] A fine partita disabilitare anche l'input, riattivarlo in "Nuova partita"
- [ ] Spostare i file da `indovina_il_numero/inde/` a `indovina_il_numero/` ([ADR 0002](../ADR/0002-cartella-indovina-il-numero-senza-inde.md))
- [ ] Togliere i `console.log` del numero segreto

**L'impiccato**
- [ ] Togliere i `console.log` della parola segreta e della lettera
- [ ] Cancellare il messaggio di errore quando la lettera è giusta
- [ ] Accento: "non è presente"

**Sasso carta forbici**
- [ ] Togliere il `console.log('caricato')`

**Sette e mezzo**
- [ ] `alt` sulle immagini delle carte (es. "7 di coppe")
- [ ] Punteggio scritto con la virgola ("7,5")
- [ ] Messaggio "Hai sballato! Vince il banco."

**Tris**
- [ ] Accenti: "Il vincitore è", "È il turno di"
- [ ] Regole scritte aggiornate anche per la modalità contro il PC

## Come verificare

Aprire ogni `index.html` nel browser con la console aperta (F12):
- Indovina il numero: scegli "Difficile", premi "Nuova partita" → la tendina resta su "Difficile" e il contatore dice 5 tentativi rimanenti.
- Nessun gioco scrive la soluzione in console.
- Impiccato: sbaglia una lettera, poi indovinane una → il messaggio di errore sparisce.
- Sette e mezzo: il punteggio mostra la virgola; passando il mouse su una carta (o con l'ispettore) si vede l'`alt`.
- Tris: i messaggi hanno gli accenti.

## Esito

—

## Decisioni prese

—

## Problemi aperti

—
