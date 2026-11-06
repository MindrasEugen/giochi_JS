# Tappa 28 — Capacitor: struttura del progetto Android

Ultima modifica: 2026-11-06

## Obiettivo

Preparare il progetto per l'app Android con Capacitor (scelta dell'utente del 2026-11-06): una copia pulita dei giochi nella cartella `www/`, il progetto Android generato in `android/`, tutto con pnpm. Il sito resta com'è e continua a funzionare nel browser.

## Attività

- [ ] `package.json` con pnpm: `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` (ultima versione stabile)
- [ ] Script `pnpm build`: copia in `www/` solo ciò che serve per giocare (pagine, `css/`, `js/`, immagini, cartelle dei giochi), senza `PLAN/`, `ADR/`, `audit/`, `scripts/`, file di test, `README.md`, `node_modules/`, `android/`
- [ ] `capacitor.config.json`: nome dell'app e identificativo (da confermare con l'utente, proposta: «Giochi JS», `it.giochijs.app`), `webDir: "www"`
- [ ] `pnpm exec cap add android` e `pnpm exec cap sync android`
- [ ] `.gitignore`: `www/` e le cartelle di build di `android/` (il progetto `android/` resta nel repo)
- [ ] ADR 0013: Capacitor per l'app Android (alternative scartate: WebView nativa, PWA + TWA)

## Come verificare

- `pnpm build` crea `www/index.html` e tutte le cartelle dei 50 giochi; nessun file di `PLAN/`, `ADR/`, test o script dentro `www/`.
- `pnpm exec cap sync android` senza errori.
- `node scripts/check.js` sempre OK (il sito non cambia).
- Il progetto `android/` si apre in Android Studio e l'app parte sull'emulatore con la home dei giochi.

## Esito

—

## Decisioni prese

—

## Problemi aperti

—
