# Tappa 20 — Mazzo italiano: Mercante in fiera e Cucù

Ultima modifica: 2026-11-05

## Obiettivo

Giochi di gruppo con il mazzo italiano.

## Attività

- [x] Mercante in fiera: da 2 a 6 giocatori (umani o PC), asta delle carte ed estrazione, con due mazzi italiani
- [x] Cucù: da 2 a 6 giocatori, scambio delle carte e vite
- [x] CSS dei posti dei giocatori in `css/carte-italiane.css` (scritto da Claude: Codex bloccato nella Tappa 19)
- [x] Prova su telefono (utente, 2026-11-05: tutto a posto)

## Come verificare

- Test dei motori: `node cucu/test-cucu.js`, `node mercante/test-mercante.js` (300 partite complete ciascuno, da 2 a 6 giocatori).
- DOM simulato: partite complete tramite i pulsanti delle pagine: `node cucu/test-pagina.js`, `node mercante/test-pagina.js`.
- Browser: partite automatiche nelle due pagine, senza errori in console.

## Esito

Due giochi nuovi dalla home, che arriva a 33 giochi: cartelle `cucu/` e `mercante/`, ognuna con motore (`funzioni.js`), pagina propria (`main.js`), test del motore e test della pagina. Regole verificate sulle voci di Wikipedia, linkate nelle pagine. Le due pagine hanno un controller proprio: i posti attorno al tavolo, le vite e le fiches non rientrano nel tavolo condiviso dei giochi di presa ([ADR 0011](../ADR/0011-tavolo-carte-italiane-da-2-a-5-posti.md)).

## Decisioni prese

- **Numero di giocatori:** si sceglie nella tendina (Tu + PC, 2 persone, 2 persone + 2 PC), da 2 a 6 posti.
- **Cucù:** tre vite (la voce non fissa il numero). Il re blocca lo scambio; il mazziere può «spaccare il mazzo» e un re pescato non vale. A pari merito perdono tutti i pari; se perderebbero tutti i rimasti la mano è nulla, così c'è sempre un vincitore. Nessuna variante locale. In due persone si passa il dispositivo prima di ogni turno umano; le carte si scoprono solo a fine mano.
- **Mercante in fiera:** 50 fiches a testa, posta di 10. Le 40 carte vanno tutte all'asta a lotti (la voce dice «una o più carte alla volta»), così quasi tutti i premi hanno un proprietario. Due premi con 2–3 giocatori (60/40), tre con 4–6 (50/30/20); un premio senza proprietario va al banco. Niente baratti durante l'estrazione e niente «premio Esposito». Tutte le carte comprate sono scoperte, quindi in due persone non serve passare il dispositivo.
- **PC:** Cucù tiene da 6 in su e il re; Mercante stima il valore di un lotto dal piatto, con una «personalità» diversa per ogni PC.

## Problemi aperti

- Nel Mercante i PC tendono a spendere quasi tutte le fiches: è un gioco d'azzardo, ma la strategia si può affinare.
- Prova su telefono eseguita dall'utente il 2026-11-05: passata.
