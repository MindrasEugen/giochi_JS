# Tappa 34 — Invasione: navetta più in alto sul telefono

Ultima modifica: 2026-11-09

## Obiettivo

Richiesta dell'utente dopo la prova sul telefono: in Invasione la navetta sta troppo in basso e il dito la copre. Si applica la stessa modifica dello schermo scelta per Mattoncini nella [Tappa 31](49-tappa-31-mattoncini-livelli.md) (solo quella): nel campo alto del telefono navetta, scudi e base salgono, e sotto resta una fascia libera per il dito.

## Attività

- [x] **Logica** (`invasione/funzioni.js`): nuova misura `linea(s)` = fondo del campo meno un terzo dell'altezza in più rispetto ai 560 di partenza. Navetta, colpi che partono, scudi e linea della base si misurano da `linea(s)` invece che dal fondo. I colpi nemici spariscono sempre al fondo vero del campo.
- [x] **Pagina** (`invasione/main.js`): la navetta si disegna su `linea(s)`.
- [x] **Test** (`invasione/test-invasione.js`): valori del campo alto aggiornati (900: linea 787, scudi 652, colpo da 734, base raggiunta a 717) e controllo che con il campo di 560 non cambi nulla.
- [x] Prova nel browser (412×880, 375×667 e schermo largo) e nuovo APK
- [x] Prova sul telefono (utente). Esito (2026-11-09): «tutto okay».

## Come verificare

- `node scripts/check.js`: tutte le suite OK.
- Nel browser sul telefono: sotto la navetta c'è una fascia vuota; sullo schermo largo nulla cambia.
- Prova sul telefono con l'APK nuovo (utente): il dito trascina la navetta senza coprirla.

## Esito

- **Modificati:** `invasione/funzioni.js`, `invasione/main.js`, `invasione/test-invasione.js`.
- **Verifiche:** `node scripts/check.js`: 60 suite, 0 controlli falliti. Nel browser (Chrome headless): fascia libera sotto la navetta di circa 130 px a 412×880 e 70 px a 375×667 (Mattoncini: 135 e 80); sullo schermo largo campo di 560 e linea a 560, identico a prima; nessun errore nella console, nessuno scorrimento sul telefono.
- **APK:** `android/app/build/outputs/apk/debug/app-debug.apk` rigenerato.

## Decisioni prese

- Stessa regola di Mattoncini (un terzo dell'altezza in più), così i due giochi si comportano allo stesso modo su ogni telefono e sul PC non cambia nulla. Salgono insieme navetta, scudi e linea della base, per non accorciare la strada dei droni rispetto agli scudi.

## Problemi aperti

- Nessuno.
