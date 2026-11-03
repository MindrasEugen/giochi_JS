# Audit — tutto il progetto (5 giochi)

Data: 2026-11-03

## Giudizio generale

Il codice è buono per un percorso di apprendimento: nomi chiari in italiano, uso di `textContent` quasi ovunque e `preventDefault()` sui form. Si nota una crescita da Sasso carta forbici (logica per esteso) a Sette e mezzo (oggetti, timer, `clearTimeout` sul caso limite della nuova partita a metà turno). C'è un solo bug che l'utente vede davvero, in Indovina il numero. Gli altri punti sono rifiniture: `console.log` della soluzione, accenti mancanti, accessibilità e una dipendenza nascosta tra i file del Tris. Non ci sono problemi di sicurezza: l'unico `innerHTML` inserisce una parola dalla lista statica. La lista delle parole è stata controllata con uno script: 1000 parole, nessun doppione, tutte da 4 a 12 lettere, solo `a-z`.

## Riepilogo

| # | File | Riga | Criticità | Problema in breve |
|---|---|---|---|---|
| 1 | `indovina_il_numero/inde/index.html` | 31 | Alta | "Nuova partita" `type="reset"` riporta la tendina su Facile ma il limite resta quello vecchio |
| 2 | `tris/funzioni.js` | 1–85 | Media | Usa variabili globali definite in `main.js`, dipendenza nascosta tra file |
| 3 | `il_impiccato/main.js` | 109, 147, 152 | Bassa | `console.log` della parola segreta |
| 4 | `indovina_il_numero/inde/main.js` | 12, 44 | Bassa | `console.log` del numero segreto |
| 5 | `sasso_carta_forbici/main.js` | 1 | Bassa | `console.log('caricato')` rimasto dai test |
| 6 | `il_impiccato/main.js` | 81 | Bassa | Errore che resta visibile dopo una lettera giusta; manca l'accento in "è" |
| 7 | `tris/funzioni.js`, `tris/main.js` | 7, 68, 30 | Bassa | "Il vincitore e", "E il turno di": mancano gli accenti |
| 8 | `tris/index.html` | 40 | Bassa | Le regole dicono "Si gioca in due" ma c'è la modalità contro il PC |
| 9 | `sette_e_mezzo/main.js` | 42, 58 | Bassa | Immagini delle carte senza `alt` |
| 10 | `sette_e_mezzo/main.js` | 46, 62 | Bassa | Punteggio "7.5" invece di "7,5" |
| 11 | `sette_e_mezzo/main.js` | 49 | Bassa | Dopo "Hai sballato!" non si dice che vince il banco |
| 12 | `indovina_il_numero/inde/` | — | Bassa | Cartella `inde` (refuso) e livello in più rispetto agli altri giochi |
| 13 | `indovina_il_numero/inde/main.js` | 27–30 | Bassa | A fine partita resta attivo l'input |
| 14 | tutti i `style.css` | — | Bassa | Stili diversi tra i giochi; Sasso carta forbici e Tris quasi senza stile |
| 15 | impiccato, sasso carta forbici, sette e mezzo | — | Bassa | Codice ripetuto tra avvio e "Nuova partita" |

## 1. "Nuova partita" con `type="reset"`

- **Riga:** `indovina_il_numero/inde/index.html:31`
- **Criticità:** Alta
- **Problema:** il clic esegue prima `nuovaPartita()`, che legge la difficoltà scelta (per esempio Difficile, 5 tentativi). Subito dopo il browser esegue il reset del form e la tendina torna alla prima opzione, Facile. La pagina mostra "Facile" ma i tentativi sono 5.
- **Suggerimento:** usare `type="button"`. `nuovaPartita()` svuota già l'input da sola.

## 2. Variabili globali condivise nel Tris

- **Riga:** `tris/funzioni.js:1–85`
- **Criticità:** Media
- **Problema:** `controllaVincitore`, `mossaPC` e le altre funzioni usano `celle`, `messaggi`, `partitaFinita`, `vittorieX`… che sono dichiarate in `main.js`. Funziona solo perché vengono chiamate dopo che entrambi i file sono caricati. Lo stato è letto dal testo dei bottoni.
- **Suggerimento:** passare un array di 9 caselle come parametro e restituire un risultato, lasciando a `main.js` l'aggiornamento della pagina (vedi ADR 0005).

## 3–5. `console.log` della soluzione

- **Righe:** `il_impiccato/main.js:109, 147, 152`; `indovina_il_numero/inde/main.js:12, 44`; `sasso_carta_forbici/main.js:1`
- **Criticità:** Bassa
- **Problema:** chi apre la console vede la soluzione. Sono log utili durante lo sviluppo e la consegna stessa dice di toglierli alla fine.
- **Suggerimento:** rimuoverli.

## 6. Messaggio di errore dell'impiccato

- **Riga:** `il_impiccato/main.js:81`
- **Criticità:** Bassa
- **Problema:** dopo una lettera sbagliata il messaggio "La lettera non e presente…" resta visibile anche quando le lettere successive sono giuste. Manca l'accento.
- **Suggerimento:** svuotare `errore.textContent` quando la lettera è presente (il numero di errori si può mostrare a parte) e scrivere "è".

## 7. Accenti nel Tris

- **Righe:** `tris/funzioni.js:7, 68`; `tris/main.js:30`
- **Criticità:** Bassa
- **Problema:** "Il vincitore e X", "E il turno di".
- **Suggerimento:** "Il vincitore è X", "È il turno di".

## 8. Regole del Tris

- **Riga:** `tris/index.html:40`
- **Criticità:** Bassa
- **Problema:** le regole descrivono solo la modalità a due giocatori.
- **Suggerimento:** aggiungere una riga sulla modalità contro il PC (e poi sulla difficoltà).

## 9. `alt` sulle carte

- **Righe:** `sette_e_mezzo/main.js:42, 58`
- **Criticità:** Bassa
- **Problema:** le `<img>` create dal JS non hanno `alt`, quindi un lettore di schermo non sa quale carta è uscita.
- **Suggerimento:** `immagineCarta.alt = \`${nome} di ${seme}\``.

## 10. Punteggio con il punto

- **Righe:** `sette_e_mezzo/main.js:46, 62`
- **Criticità:** Bassa
- **Problema:** si legge "7.5", mentre le regole scrivono "7,5".
- **Suggerimento:** `puntiGiocatore.toLocaleString('it-IT')`.

## 11. Messaggio di sballo

- **Riga:** `sette_e_mezzo/main.js:49`
- **Criticità:** Bassa
- **Problema:** non è esplicito che la partita è persa.
- **Suggerimento:** "Hai sballato! Vince il banco."

## 12. Cartella `inde/`

- **Riga:** —
- **Criticità:** Bassa
- **Problema:** il nome sembra un refuso e la struttura è diversa da quella degli altri giochi. Inoltre `esercizio_1.md` cita `script.js` mentre il file è `main.js` (è il testo della consegna, quindi si lascia com'è).
- **Suggerimento:** spostare i file in `indovina_il_numero/` (ADR 0002).

## 13. Input attivo a fine partita

- **Righe:** `indovina_il_numero/inde/main.js:27–30`
- **Criticità:** Bassa
- **Problema:** viene disabilitato solo il bottone. Non fa danni (l'invio con Invio è bloccato), ma non è chiaro per chi gioca.
- **Suggerimento:** disabilitare anche l'input e riattivarlo in `nuovaPartita()`.

## 14. CSS non coerente

- **Riga:** —
- **Criticità:** Bassa
- **Problema:** ogni gioco ha una palette diversa, `sasso_carta_forbici/style.css` ha 3 righe e `tris/style.css` 14. Manca un focus visibile curato.
- **Suggerimento:** un CSS comune con le variabili più un CSS per gioco (ADR 0003).

## 15. Codice ripetuto

- **Riga:** per esempio `il_impiccato/main.js:19–21` e `130–132`
- **Criticità:** Bassa
- **Problema:** le righe che preparano la partita sono scritte due volte, all'avvio e in "Nuova partita".
- **Suggerimento:** una funzione `iniziaPartita()` chiamata in entrambi i casi. Lasciato fuori da questo lavoro (vedi `PLAN/90-fuori-mvp.md`).
