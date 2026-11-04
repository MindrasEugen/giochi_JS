# Correzioni successive al controllo completo del 4 novembre 2026

Data: 2026-11-04 — riferimento: `audit/2026-11-04-progetto-check.md` (non modificato).

## Interventi per punto

| # | Punto del controllo | Esito |
|---|---|---|
| 1 | Tappe 15–18 "in corso" | Aggiornati i "Problemi aperti" con l'esito della prova nel browser. Le tappe restano ◐: manca la prova su un telefono vero, che non si può fare da qui |
| 2 | Tappa 18 senza commit | Frase corretta con il commit `57bc737`; corretta anche la Tappa 17 (`0df7b0d`) |
| 3 | Stato attuale e prossimo passo senza hash | Inseriti gli hash; il prossimo passo indica la prova su telefono |
| 4 | Giochi storici senza test | Aggiunte 4 suite: `sasso_carta_forbici/test-sasso-carta-forbici.js`, `indovina_il_numero/test-indovina-il-numero.js`, `il_impiccato/test-impiccato.js`, `sette_e_mezzo/test-sette-e-mezzo.js`. DOM minimo condiviso in `scripts/dom-minimo.js` (timer annullabili, `textContent` che svuota i figli come nel browser). Nessuna modifica al codice dei giochi: i test non hanno trovato bug |
| 5 | Accenti nel README | Corretti (`casualità`, `più`, `modalità`). I vecchi audit non si toccano |
| 6 | Due dorsi delle carte | Nessun intervento: verificato che servono entrambi |
| 7 | Pagina di anteprima | Descritta nel README come pagina di sviluppo |
| 8 | Test non deterministici | Rivalutato: dove il risultato dipende dal caso c'è già un seme ripetibile (Scacchi); gli altri usi del caso controllano proprietà sempre vere. Restano soglie di tempo per il PC con margine ampio (es. 454 ms su 3000). README aggiornato con la descrizione corretta; nessuna modifica ai test |

## Cosa coprono i nuovi test

- Sasso carta forbici: 9 combinazioni, fine a 5 punti, Nuova partita, scelta nascosta a 2 giocatori, cambio modalità a metà turno.
- Indovina il numero: intervallo che si restringe, tentativo già escluso, vittoria, tentativi finiti, difficoltà, numero segreto valido, sfida a due con vittoria e pareggio.
- Impiccato: lista di 1000 parole valide, lettere giuste/sbagliate/ripetute, vittoria, sconfitta con parola rivelata, nuova partita, parola segreta con accenti, punti a 2 giocatori.
- Sette e mezzo: valore delle carte, 7 e mezzo esatto, sballo, banco del PC (raggiunge, pareggio, sballa), Nuova partita mentre il PC pesca, banco umano e cambio del banco a 2 giocatori.

## Verifiche

`node scripts/check.js`: 94 file JavaScript, 32 suite, 0 controlli falliti.

## Limiti

`scripts/test-interfacce.js` ha ancora il suo DOM minimo interno: non è stato spostato sul nuovo `scripts/dom-minimo.js` per non cambiare un test che funziona. Nessun commit.
