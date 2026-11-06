# ADR 0013 — App Android con Capacitor

- **Stato:** accettata
- **Data:** 2026-11-06
- **Commit:** — (Tappa 28)

## Contesto

A fine progetto la raccolta deve diventare un'app Android da installare sul telefono, per giocare a schermo intero ([Fuori MVP](../PLAN/90-fuori-mvp.md), Tappe 28–30). Le pagine sono già pronte per il telefono (Tappe 25–27). Servivano uno strumento per impacchettarle e un modo per tenere il sito e l'app allineati.

Alternative valutate:

- **WebView nativa scritta a mano** (progetto Android Studio minimo): nessuna dipendenza, ma ogni funzione del telefono (barre di sistema, tasto indietro) va scritta in Kotlin.
- **PWA + TWA** (Bubblewrap): richiede il sito pubblicato online e una connessione al primo avvio; la pubblicazione è fuori MVP.
- **Capacitor**: genera il progetto Android dal sito, ha plugin pronti per le funzioni del telefono e in futuro può produrre anche l'app per iPhone.

## Decisione

Capacitor 8 (scelta dell'utente del 2026-11-06), installato con pnpm.

- Nome dell'app **«Giochi di una volta»**, identificativo `it.giochijs.app` (`capacitor.config.json`).
- `pnpm build` (`scripts/build-www.js`) copia in `www/` solo i file per giocare: restano fuori `PLAN/`, `ADR/`, `audit/`, `scripts/`, i test, i file Markdown e la pagina di prova dei componenti. `www/` non va in git.
- Il progetto Android generato sta in `android/` ed è nel repo; le copie dei giochi dentro `android/app/src/main/assets/public` e le cartelle di build sono escluse da git (`android/.gitignore`).
- Ciclo: `pnpm sync` (build più `cap sync android`), poi Android Studio (`pnpm android`) o `android/gradlew assembleDebug`.
- `scripts/check.js` ignora `www/` e `android/`: i controlli guardano solo i sorgenti.

## Conseguenze

- Il sito resta senza build e senza framework ([ADR 0001](0001-javascript-senza-framework-ne-build.md) vale ancora): si apre nel browser come prima. Il passaggio di copia serve solo per l'app.
- Entrano nel progetto `package.json`, `pnpm-lock.yaml` e `node_modules/` (solo i tre pacchetti di Capacitor), più un progetto Android di circa 50 file.
- Dopo ogni modifica ai giochi bisogna rifare `pnpm sync` prima di compilare l'APK, altrimenti l'app contiene la versione vecchia.
- L'app usa la WebView di sistema del telefono: con una WebView molto vecchia (sotto Chrome 111) `color-mix()` non funziona e alcuni sfondi diventano trasparenti (visto sull'emulatore con Chrome 109). Sui telefoni aggiornati dal Play Store non succede.
- Dettagli in [PLAN/44-tappa-28-capacitor.md](../PLAN/44-tappa-28-capacitor.md).
