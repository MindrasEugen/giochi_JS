# Tappa 30 — APK e prova sul telefono

Ultima modifica: 2026-11-06

## Obiettivo

Produrre l'APK installabile e provarlo sul telefono dell'utente con tutti i giochi.

## Attività

- [x] APK di debug con Gradle (`android/gradlew assembleDebug`), rigenerato dopo ogni tappa dell'app
- [x] Istruzioni nel README (sezione «App Android»): requisiti, `pnpm install`, `pnpm sync`, `pnpm android`, APK con Gradle, installazione, icone
- [x] `.gitattributes`: fine riga fissi per `android/gradlew` (LF) e `gradlew.bat` (CRLF), così lo script di Gradle funziona anche su Linux e macOS
- [x] Installazione sul telefono (utente, dopo la Tappa 29)
- [x] Prova su telefono (utente): dalla prova è nata la [Tappa 29.2](48-tappa-29-2-campo-arcade.md); dopo, «per il resto mi sembra vada tutto bene»
- [x] APK firmato: non richiesto dall'utente, resta in [Fuori MVP](90-fuori-mvp.md)

## Come verificare

- Il file `app-debug.apk` esiste e si installa sul telefono.
- Prova su telefono dell'utente.

## Esito

- **File:** `android/app/build/outputs/apk/debug/app-debug.apk` (circa 6 MB), con i 50 giochi, l'icona e la schermata di avvio, lo schermo intero, il tasto indietro e i campi degli arcade della Tappa 29.2. **Modificati:** `README.md`; **creato:** `.gitattributes`.
- **Verifiche:** APK installato e provato dall'utente sul suo telefono; sull'emulatore Pixel 6 installazione, avvio, tasto indietro e dati salvati. `node scripts/check.js`: 58 suite, 0 controlli falliti.

## Decisioni prese

- APK di debug per l'uso personale; niente firma per gli store, perché l'utente non l'ha chiesta e la chiave deve crearla e custodirla lui.

## Problemi aperti

- L'ultimo ritocco (mattoni di Mattoncini più vicini, commit `88f6f1a`) è nell'APK ma non è ancora stato riprovato sul telefono.
- Sfondi trasparenti con WebView molto vecchie (`color-mix()`, [Tappa 28](44-tappa-28-capacitor.md)): visti solo sull'emulatore, non segnalati dall'utente sul suo telefono.
