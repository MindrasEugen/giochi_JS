# Tappa 29 — App Android: schermo intero, tasto indietro, icona

Ultima modifica: 2026-11-06

## Obiettivo

Far sembrare la raccolta una vera app sul telefono: niente barre di sistema, il tasto «indietro» di Android che si comporta come ci si aspetta, icona e schermata di avvio originali.

## Attività

- [ ] Schermo intero immersivo: barra di stato e barra di navigazione nascoste (riappaiono scorrendo dal bordo)
- [ ] Orientamento: verticale bloccato oppure libero (da decidere con l'utente: i layout del telefono sono pensati in verticale)
- [ ] Tasto indietro di Android: chiude prima il pannello della tavola o una finestra aperta (nomi, avvisi); se non c'è niente di aperto, da un gioco torna alla home; dalla home chiude l'app
- [ ] Nell'app il pulsante «Schermo intero» del pannello non serve: non deve comparire
- [ ] Icona e schermata di avvio originali, con i colori del design system
- [ ] Test del tasto indietro con il DOM minimo

## Come verificare

- Sull'emulatore (Android Studio): nessuna barra di sistema, il tasto indietro chiude il pannello, poi torna alla home, poi esce; l'icona compare nel menu delle app.
- Record e opzioni (`localStorage`) restano dopo aver chiuso e riaperto l'app.
- `node scripts/check.js` OK.

## Esito

—

## Decisioni prese

—

## Problemi aperti

—
