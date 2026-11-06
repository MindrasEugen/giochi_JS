# Tappa 28 — Capacitor: struttura del progetto Android

Ultima modifica: 2026-11-06

## Obiettivo

Preparare il progetto per l'app Android con Capacitor (scelta dell'utente del 2026-11-06): una copia pulita dei giochi nella cartella `www/`, il progetto Android generato in `android/`, tutto con pnpm. Il sito resta com'è e continua a funzionare nel browser.

## Attività

- [x] `package.json` con pnpm: `@capacitor/core`, `@capacitor/android` e `@capacitor/cli` 8.6.0 (ultima versione stabile); script `build`, `sync`, `android`, `check`
- [x] Script `pnpm build` (`scripts/build-www.js`): copia in `www/` solo ciò che serve per giocare (333 file), senza `PLAN/`, `ADR/`, `audit/`, `scripts/`, test, file Markdown, `anteprima-componenti.html`, `node_modules/`, `android/`
- [x] `capacitor.config.json`: «Giochi di una volta», `it.giochijs.app`, `webDir: "www"`
- [x] `pnpm exec cap add android` (con la copia dei giochi negli assets)
- [x] `.gitignore`: `www/`; le copie dei giochi e le build di `android/` sono già escluse da `android/.gitignore`
- [x] `scripts/check.js` ignora `www/` e `android/`
- [x] ADR 0013: Capacitor per l'app Android

## Come verificare

- `pnpm build` crea `www/index.html` e tutte le cartelle dei 50 giochi; nessun file di `PLAN/`, `ADR/`, test o script dentro `www/`.
- `pnpm exec cap sync android` senza errori.
- `node scripts/check.js` sempre OK (il sito non cambia).
- Il progetto `android/` si apre in Android Studio e l'app parte sull'emulatore con la home dei giochi.

## Esito

- **Creati:** `package.json`, `pnpm-lock.yaml`, `capacitor.config.json`, `scripts/build-www.js`, `android/` (progetto generato da Capacitor), `ADR/0013-app-android-con-capacitor.md`. **Modificati:** `.gitignore`, `scripts/check.js`.
- **Verifiche:** `pnpm build` copia 333 file, nessun test né file Markdown in `www/`. `cap add android` e la copia negli assets senza errori. `android/gradlew assembleDebug` (Java 21): BUILD SUCCESSFUL in 29 secondi, `app-debug.apk` da 6 MB. Sull'emulatore Pixel 6 (Android 13) l'app si installa e si apre sulla home dei giochi; Serpente si apre nell'app con la barra e il pannello. `node scripts/check.js`: 58 suite, 0 controlli falliti.

## Decisioni prese

- Strumento Capacitor (scelta dell'utente), nome «Giochi di una volta», identificativo `it.giochijs.app` (ADR 0013).
- Orientamento dello schermo libero, non bloccato in verticale: l'utente pensa che alcuni giochi si vedano meglio in orizzontale (si applica nella [Tappa 29](45-tappa-29-app-android.md)).

## Problemi aperti

- La WebView dell'emulatore è vecchia (Chrome 109): non conosce `color-mix()` e il velo degli arcade diventa trasparente. Sui telefoni aggiornati non succede; da controllare sul telefono dell'utente nella [Tappa 30](46-tappa-30-apk.md). Se serve, aggiungere un colore di riserva prima di ogni `color-mix()` (15 file CSS).
- ~~La home dice ancora «Giochi JS»~~: risolto il 2026-11-06, nome «Giochi di una volta» nell'app e nel sito (scelta dell'utente): titoli delle 40 pagine che lo citavano, intestazione e piè di pagina della home, README. «Nessuna installazione» diventa «Senza pubblicità», vero sia nel sito sia nell'app.
