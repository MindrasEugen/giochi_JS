# Tappa 2 — Correzione dei bug dell'audit

Ultima modifica: 2026-11-03

## Obiettivo

Correggere i problemi elencati in [audit/2026-11-03-progetto-audit.md](../audit/2026-11-03-progetto-audit.md), senza cambiare le regole dei giochi. Il riordino del codice del Tris non si fa qui ma nella [Tappa 5](14-tappa-05-tris-difficolta.md).

## Attività

**Indovina il numero**
- [x] "Nuova partita" da `type="reset"` a `type="button"`, così la difficoltà scelta resta quella mostrata
- [x] A fine partita disabilitare anche l'input, riattivarlo in "Nuova partita"
- [x] Spostare i file da `indovina_il_numero/inde/` a `indovina_il_numero/` ([ADR 0002](../ADR/0002-cartella-indovina-il-numero-senza-inde.md))
- [x] Togliere i `console.log` del numero segreto

**L'impiccato**
- [x] Togliere i `console.log` della parola segreta e della lettera
- [x] Cancellare il messaggio di errore quando la lettera è giusta
- [x] Accento: "non è presente"

**Sasso carta forbici**
- [x] Togliere il `console.log('caricato')`

**Sette e mezzo**
- [x] `alt` sulle immagini delle carte (es. "7 di coppe")
- [x] Punteggio scritto con la virgola ("7,5")
- [x] Messaggio "Hai sballato! Vince il banco."

**Tris**
- [x] Accenti: "Il vincitore è", "È il turno di"
- [x] Regole scritte aggiornate anche per la modalità contro il PC

## Come verificare

Aprire ogni `index.html` nel browser con la console aperta (F12):
- Indovina il numero: scegli "Difficile", premi "Nuova partita" → la tendina resta su "Difficile" e il contatore dice 5 tentativi rimanenti.
- Nessun gioco scrive la soluzione in console.
- Impiccato: sbaglia una lettera, poi indovinane una → il messaggio di errore sparisce.
- Sette e mezzo: il punteggio mostra la virgola; passando il mouse su una carta (o con l'ispettore) si vede l'`alt`.
- Tris: i messaggi hanno gli accenti.

## Esito

Correzioni fatte da Claude (il task di Codex era bloccato senza aver scritto nulla ed è stato fermato su richiesta dell'utente).

File modificati:
- `indovina_il_numero/` — file spostati fuori da `inde/` con `git mv`; `index.html`: "Nuova partita" `type="button"`; `main.js`: tolti i `console.log`, input disabilitato a fine partita e riattivato in `nuovaPartita()`.
- `il_impiccato/main.js` — tolti 3 `console.log`; con una lettera giusta il messaggio diventa solo "Errori: N/6" (vuoto se 0); accento in "non è presente".
- `sasso_carta_forbici/main.js` — tolto `console.log('caricato')`.
- `sette_e_mezzo/main.js` — `alt` sulle carte ("re di coppe"), punteggi con `toLocaleString('it-IT')`, "Hai sballato! Vince il banco."
- `tris/funzioni.js`, `tris/main.js` — "Il vincitore è", "È il turno di"; `tris/index.html` — prima regola aggiornata con la modalità contro il PC.

Verifica eseguita:
- `grep`: nessun `console.log` nei file dei giochi, nessun "E il turno", "non e presente", `type="reset"`; `node --check` ok su tutti i JS.
- Prova con un browser simulato (jsdom, installato solo nella cartella temporanea): 14 controlli passati. Tra questi: Difficile + "Nuova partita" → la tendina resta su Difficile con 5 tentativi; input e bottone disabilitati a fine partita e riattivati; nessun log in console; "7,5" con la virgola e `alt` "re di coppe"; messaggi del Tris con gli accenti.

## Decisioni prese

- File di Indovina il numero spostati in `indovina_il_numero/` ([ADR 0002](../ADR/0002-cartella-indovina-il-numero-senza-inde.md)).
- Nell'impiccato il conteggio degli errori resta visibile anche dopo una lettera giusta (solo il testo "non è presente" sparisce), così chi gioca sa sempre quanti errori ha fatto.

## Problemi aperti

- La prova a occhio nel browser vero (doppio clic sui file) resta da fare dall'utente; la logica è verificata con jsdom.
