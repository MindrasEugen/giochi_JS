# Tappa 31 — Mattoncini: livelli infiniti, colpi di bordo, mattoni che scendono, doppia palla

Ultima modifica: 2026-11-06

## Obiettivo

Richiesta dell'utente dopo la prova delle distanze (sul telefono il gioco è lento e la difficoltà sale poco): rendere Mattoncini più vario e più difficile andando avanti.

1. La palla accelera quando colpisce i **bordi della racchetta**.
2. I livelli diventano **infiniti** (scelta dell'utente): la partita finisce solo quando finiscono le vite.
3. Dal **livello 4** i mattoni **scendono** piano durante il gioco. Se arrivano alla racchetta perdi una vita (scelta dell'utente).
4. Dal **livello 5** compaiono i mattoni con **°**: danno **due palle per 10 secondi**. Sono frequenti quanto quelli con il +.

Solo logica e testi: nessun file CSS cambia, il campo è un canvas. Sugli schermi larghi i primi 3 livelli si giocano come prima, a parte il colpo di bordo.

## Attività

- [x] **Colpo di bordo** (`mattoncini/funzioni.js`): se la palla tocca la racchetta nel quarto esterno, a destra o a sinistra, la velocità aumenta del 6%. Al centro la velocità non cambia. Tetto: 1,6 volte la velocità di partenza del livello. A ogni nuova palla (vita persa o livello nuovo) si riparte dalla velocità del livello.
- [x] **Livelli infiniti:** dopo un livello completato si passa sempre al successivo. Righe: 3 + livello, fino a un massimo di 8. Velocità di partenza: +16 a ogni livello, come oggi, fino a un tetto. Punti per mattone: sempre 10 × livello. Fine della partita solo a 0 vite.
- [x] **Mattoni che scendono dal livello 4:** tutti i mattoni vivi scendono insieme mentre la palla è in gioco (fermi quando la palla aspetta il lancio). Velocità: lenta al livello 4, poco più veloce a ogni livello successivo. Se il mattone più basso arriva alla racchetta: −1 vita, i mattoni tornano all'altezza di partenza (quelli già rotti restano rotti) e la palla torna sulla racchetta.
- [x] **Mattoni con ° dal livello 5:** uno ogni nove mattoni, su caselle diverse da quelle con il +. Come il +, rompendolo cade un bonus da prendere con la racchetta. Preso il bonus, parte una seconda palla dalla racchetta, che sparisce dopo 10 secondi. Con due palle in campo, perderne una non toglie vite: la vita si perde solo quando cadono tutte.
- [x] **Pagina** (`mattoncini/main.js`): disegno della seconda palla, del ° sui mattoni e del bonus ° che cade; nel tabellone «Livello N» invece di «Livello N / 3»; nuovo messaggio di fine partita («Sei arrivato al livello N con X punti»).
- [x] **Testi:** sottotitolo e regole in `mattoncini/index.html`, riga di Mattoncini nel `README.md`.
- [x] **Test** (`mattoncini/test-mattoncini.js`): colpo di bordo (sì ai bordi, no al centro, tetto), passaggio al livello 4 e oltre senza vittoria, mattoni fermi fino al livello 3 e in discesa dal 4, vita persa quando arrivano alla racchetta, ° solo dal livello 5 e mai sulla stessa casella del +, seconda palla per 10 secondi, nessuna vita persa se cade una sola delle due palle.
- [x] Prova nel browser (412×880, 375×667 e schermo largo) e nuovo APK
- [ ] Prova sul telefono (utente)

## Come verificare

- `node scripts/check.js`: tutte le suite OK.
- Nel browser, partendo da un livello alto (impostato a mano dalla console): i mattoni scendono dal 4, i ° compaiono dal 5, la seconda palla dura 10 secondi.
- Colpi al bordo della racchetta: la palla accelera in modo visibile; colpi al centro: nessun cambio.
- Schermi da 600px in su: pagina identica, a parte i testi delle regole.
- Prova sul telefono con l'APK nuovo (utente).

## Esito

- **Modificati:** `mattoncini/funzioni.js` (logica: colpo di bordo, livelli infiniti, discesa, seconda palla), `mattoncini/main.js` (seconda palla, simboli + e ° disegnati, colori delle righe 7 e 8, tabellone e messaggio finale), `mattoncini/index.html` (sottotitolo e regole), `mattoncini/test-mattoncini.js`, `README.md`.
- **Numeri scelti:** colpo di bordo +6% fino a 1,6 volte la velocità del livello; velocità di partenza che cresce fino al livello 12; righe fino a 8; discesa di 4 unità al secondo al livello 4, +1 a ogni livello fino a 10, in proporzione all'altezza del campo (circa 5 px al secondo sullo schermo di un telefono a 412×880); ° nelle caselle con resto 4 nella stessa regola del + (stesso numero di mattoni con + e con °).
- **Verifiche:** `node scripts/check.js`: 58 suite, 0 controlli falliti (nuovo blocco di test per la Tappa 31). Nel browser (Chrome headless) partita al livello 5 a 412×880, 375×667 e 1280×900: mattoni che scendono (24 unità in 2 secondi a 412×880), mattoni con + e ° alternati, seconda palla e bonus ° disegnati, tabellone «Livello 5», nessun errore nella console, nessuno scorrimento sul telefono.
- **APK:** `android/app/build/outputs/apk/debug/app-debug.apk` rigenerato (`pnpm sync` e `gradlew assembleDebug`).

## Decisioni prese

- Livelli infiniti (scelta dell'utente): la partita è una sfida al record. Le righe si fermano a 8 per lasciare spazio sotto i mattoni anche nel campo basso di 520.
- Mattoni che arrivano alla racchetta: −1 vita e mattoni di nuovo su (scelta dell'utente), invece di fine partita immediata.
- Il ° cade come bonus da prendere, come il +, per avere una sola regola per i bonus.
- I simboli + e ° sui mattoni sono disegnati (croce e anello) invece che scritti con il carattere: il ° di 14px quasi non si vedeva. Sulle righe scure il simbolo è chiaro.
- Con 8 righe i 6 colori della palette si ripetono (le righe 7 e 8 non avevano un colore).
- La velocità della palla non viene ancora adattata all'altezza del campo del telefono: non richiesto. Resta un'idea se sul telefono il gioco sembra ancora lento.

## Problemi aperti

- Manca la prova sul telefono con l'APK nuovo (utente): la tappa resta in corso fino ad allora.
- Per costruire l'APK da terminale servono `JAVA_HOME` (JBR di Android Studio) e `ANDROID_HOME` (`%LOCALAPPDATA%\Android\Sdk`): non sono impostate nel sistema, vanno date al comando.
