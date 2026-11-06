# Registro

Ultima modifica: 2026-11-03

- 2026-11-03 — Audit iniziale del progetto, creati `PLAN/` (6 tappe), `ADR/` (0001–0005) e `audit/`. In attesa del via dell'utente.
- 2026-11-03 — Piano approvato dall'utente. Tappa 1 completata: `git init` sul ramo `main`, `.gitignore`, primo commit.
- 2026-11-03 — Tappa 2 avviata: file di Indovina il numero spostati in `indovina_il_numero/`, correzioni affidate a Codex. Tappa 3 avviata in parallelo: palette crema/verde scelta dall'utente, home affidata a Codex.
- 2026-11-03 — Tappa 3: home creata da Codex (buono, margini dell'intestazione corretti in revisione). Tappa 2: task di Codex bloccato senza modifiche, fermato su richiesta dell'utente; correzioni fatte da Claude e verificate con jsdom. Tappa 2 completata.
- 2026-11-03 — Tappa 3 completata: link "← Tutti i giochi" nei 5 giochi, home verificata a 375/600/1000 px. Tappa 4 avviata (CSS affidato a Codex), con il via dell'utente già dato.
- 2026-11-03 — Codex della Tappa 4 fermato su richiesta dell'utente ("occupati te personalmente di tutte le modifiche"). Tappa 4 completata da Claude: CSS dei 5 giochi, verificata con screenshot e jsdom.
- 2026-11-03 — Tappa 5 completata: logica del Tris separata dalla pagina, menu Facile/Media, 20 controlli passati. Avviata la Tappa 6.
- 2026-11-03 — Tappa 6 completata: modalità Impossibile con minimax, prova esaustiva (0 vittorie di X su 569 partite) e controllo indipendente su 2097 posizioni. Piano concluso.
- 2026-11-03 — Voce sul minimax salvata nell'archivio globale. Aggiunta la Tappa 7 (restyling moderno di Sasso carta forbici e Tris) su richiesta dell'utente.
- 2026-11-03 — Tappa 7 completata: restyling moderno di Sasso carta forbici e Tris e ritocchi a `css/comune.css`, verificati con jsdom, test del minimax e screenshot.
- 2026-11-03 — Aggiunta la Tappa 8 (stile moderno su Impiccato, Indovina il numero e Sette e mezzo) su richiesta dell'utente.
- 2026-11-03 — Tappa 8 completata: stile moderno su Impiccato, Indovina il numero e Sette e mezzo, verificato con jsdom (23 controlli) e screenshot.
- 2026-11-04 — L'utente chiede 44 giochi nuovi e la modalità 2 giocatori in tutti i giochi che lo permettono. Scritto il piano della seconda parte (Tappe 9–24) e gli ADR 0006–0009 in proposta. In attesa del via.
- 2026-11-04 — L'utente ha aggiunto `carte/` con le 52 carte francesi. Le 40 carte italiane sono state spostate lì da `sette_e_mezzo/pic/` e il percorso in Sette e mezzo è stato aggiornato e verificato.
- 2026-11-04 — Via dell'utente alla seconda parte, con la regola "per il design usa Codex". Tappa 9 avviata: `js/mazzo.js`, `js/carte.js`, `js/giocatori.js`, `js/arcade.js`, `home.js`, anteprima dei componenti; Sette e mezzo usa il mazzo condiviso. CSS affidato a Codex.
- 2026-11-04 — Tappa 9 completata: script condivisi, home a categorie, anteprima dei componenti, carte in `carte/`; design di Codex in due giri (ventaglio corretto nel secondo). ADR 0006–0009 accettati.
- 2026-11-04 — Tappa 10 completata: modalità 2 giocatori in Impiccato, Indovina il numero, Sasso carta forbici, Sette e mezzo e Tris; design di Codex; 42 controlli a 2 giocatori e test precedenti passati.
- 2026-11-04 — Tappa 11 completata: Forza 4 (PC con minimax alfa-beta), Memory, Campo minato; 45 controlli con Node, 37 con jsdom; design di Codex in due giri (caselle del Campo minato rese distinguibili nel secondo).
- 2026-11-04 — Tappa 12 completata: Raddoppia (con sfida a 2 a tessere uguali) e Sudoku (generatore con soluzione unica); 41 controlli con Node, 30 con jsdom; design di Codex al primo giro.
- 2026-11-04 — Correzione chiesta dall'utente: a 2 giocatori in Sette e mezzo uno dei due fa il banco (Tappa 10.1). Codice e test fatti da Claude; resta il ritocco del layout su desktop, affidato a Codex. ADR 0008 e Tappa 21 aggiornati.
- 2026-11-04 — Tappa 10.1 completata: Sette e mezzo a 2 giocatori con uno dei due che fa il banco; layout del banco su desktop corretto da Codex.
- 2026-11-04 — Tappa 13 completata: Dama italiana, Filetto, Battaglia navale; 61 controlli con Node, 40 con jsdom; design di Codex in due giri (il secondo crea `css/gioco.css`, ADR 0010). L'utente chiede CSS mobile-first: verificato su tutti i file.
- 2026-11-04 — Tappa 14 completata: Scacchi (17 perft uguali ai valori pubblicati) e Ludo (da 2 a 4 giocatori, persone o computer); 57 controlli con Node, 25 con jsdom; design di Codex al primo giro.
- 2026-11-04 — Tappa 15 avviata: helper per i colori del canvas in `js/arcade.js`, logica e test del Serpente. Lavoro interrotto per il limite d'uso, ripartire da `PLAN/01-stato-attuale.md`.

- 2026-11-04 - Codex prosegue su richiesta diretta: implementati Serpente, Ping pong e Mattoncini con pagine canvas, design mobile-first, comandi touch e controller condiviso. Home a 18 giochi, regressioni per collisioni e ciclo di vita. Tappa 15 ancora in corso solo per prova visiva browser/telefono, bloccata dal controllo nativo dell'URL. Nessun commit o push.

- 2026-11-04 - Tappa 15 e correzioni raccolte nel commit locale fe8bc4d, su richiesta dell'utente; nessun push.
- 2026-11-04 - Su richiesta dell'utente implementata la Tappa 16: Blocchi, Invasione, Volo e Labirinto. Home a 22 giochi, controlli touch, test delle quattro logiche e dei sette controller arcade. Verifica visiva ancora da eseguire per servizio browser non disponibile. Nessun commit o push della Tappa 16.

- 2026-11-04 - Su richiesta dell'utente integrate le 12 immagini PNG di pezzi_scacco negli Scacchi: scacchiera, promozioni e catture, con descrizioni accessibili e test del controller.

- 2026-11-04 - Tappa 17 implementata da Codex su richiesta: Cinque lettere con sei tentativi, vocabolario locale di 1.376 parole, lettere doppie, tastiera a schermo e sfida a due turni. Home a 23 giochi; test della logica e del controller. Prova visiva ancora da eseguire per servizio browser non disponibile. Nessun commit o push.

- 2026-11-04 - Tappe 16 e 17, PNG Scacchi e palette chiara di Blocchi raccolti nel commit locale 0df7b0d su richiesta dell'utente. Nessun push.
- 2026-11-04 - Tappa 18 implementata: Briscola a due/quattro, Scopa, Asso piglia tutto e Rubamazzetto. Home a 27 giochi, componenti carte condivisi, 900 smazzate di test e controller delle quattro pagine. Prova visiva ancora da eseguire per servizio browser non disponibile. Nessun commit o push.
- 2026-11-04 - Controllo completo del progetto: 28 suite verdi, 27 pagine caricate e provate in Chrome senza errori. Report in audit/2026-11-04-progetto-check.md. Nessun commit.
- 2026-11-04 - Correzioni del controllo: 4 suite per i giochi storici con DOM minimo condiviso, README (accenti, test, anteprima), piano aggiornato con hash ed esito della prova nel browser. 32 suite verdi. Report in audit/2026-11-04-progetto-check-correzioni.md. Nessun commit.
- 2026-11-04 - Correzioni del controllo raccolte nel commit locale b25a80e su richiesta dell'utente. Nessun push.
- 2026-11-05 - Tappe 15–18 completate: prova su telefono eseguita dall'utente, comandi touch rimandati alla fase APK (aggiunta in Fuori MVP). Serpente: muri attraversabili, da soli si muore solo mordendosi la coda; in due resta mortale l'altro serpente. Test aggiornati.
- 2026-11-05 - Tappa 19 implementata: Scopone scientifico, Cirulla, Tressette (2 e 4) e Briscola chiamata (5, asta e socio segreto). Motore delle prese e pagina condivisa da 2 a 5 posti (ADR 0011), regole verificate su Wikipedia, 5 suite nuove, prova automatica nel browser senza errori. CSS dell'asta da Codex. Home a 31 giochi. Manca la prova su telefono.
- 2026-11-05 - Codex bloccato oltre 20 minuti sul CSS della Tappa 19 senza scrivere nulla (in failures.md): CSS dell'asta e dei posti scritto da Claude.
- 2026-11-05 - Tappa 20 implementata su richiesta dell'utente: Mercante in fiera (asta a lotti, estrazione, premi) e Cucù (scambi, re che blocca, vite), da 2 a 6 giocatori anche PC. Motori e pagine con test, prova automatica nel browser senza errori. Home a 33 giochi. Tappe 19 e 20 nello stesso commit.
- 2026-11-05 - Tappa 21 implementata: Blackjack (banco del PC o, in due, di uno dei giocatori a turno; raddoppio, divisione, fiches), Guerra (limite di 300 battaglie, gioco automatico) e Cambio colore (mazzo originale in CSS, 2-4 giocatori). Motori e pagine con test. Home a 36 giochi.
- 2026-11-05 - Tappe 19, 20 e 21 completate: prova su telefono dell'utente passata. Avviata la Tappa 22, divisa in tre passi (Poker; Scala 40 e Ramino; Burraco), regole dei giochi di combinazioni verificate su Wikipedia.
- 2026-11-05 - Tappa 22, passo 1: Poker heads-up con valutazione delle mani, puntate e PC a simulazione; CSS di Codex al primo giro. Home a 37 giochi.
- 2026-11-05 - Tappa 22, passi 2 e 3: Scala 40, Ramino e Burraco con motore comune delle combinazioni e jolly in CSS; sicurezze contro le mani infinite trovate con le simulazioni; CSS di Codex. Home a 40 giochi.
- 2026-11-05 - Tappa 22 completata: prova su telefono dell'utente passata. Avviata la Tappa 23 (solitari).
- 2026-11-05 - Tappa 23 implementata: Klondike, FreeCell (con risolutore), Spider, Piramide e Golf con pagina comune (trascinamento, tocco-tocco, annulla, tempo, mosse). CSS di Codex. Home a 45 giochi.
- 2026-11-05 - Tappa 24 implementata: TriPeaks, Yukon, Scorpione, Orologio e Le tredici (Baker's Dozen) con la pagina comune dei solitari. Home a 50 giochi. Tutte le tappe del piano implementate; mancano le prove su telefono delle Tappe 23 e 24.
- 2026-11-05 - Tappe 23 e 24 completate: prova su telefono passata, ma carte poco leggibili. Aggiunta la Tappa 24.1 (carte semplificate e più spazio, scelta dell'utente).
- 2026-11-05 - Nuova fase: sul telefono tavola a schermo intero, regole e altro in un pannello sopra il gioco, gesti touch al posto dei pulsanti (pulsanti con opzione nascosta). Aggiunte le Tappe 25, 26 e 27; la 24.1 è unita alla 25.
- 2026-11-05 - Tappa 25 implementata: barra e pannello sopra il gioco (`js/tavola.js`), Serpente con gesti, solitari con carte semplificate; CSS di Codex in due giri; verificata nel browser, manca la prova su telefono.
- 2026-11-05 - Tappa 25 completata: prova su telefono passata. L'utente chiede la stessa soluzione per tutti i giochi, anche con il mazzo italiano.
- 2026-11-05 - Piano rivisto: Tappa 27 divisa in 5 sotto-tappe per famiglia e anticipata prima della 26; carte italiane con immagini più grandi e avversari compatti (scelte dell'utente).
- 2026-11-05 - Tappa 27.1 implementata: 11 giochi con il mazzo italiano a schermo intero, carte più grandi, avversari compatti, PC fermi con il pannello aperto; CSS di Codex in due giri; corretta la larghezza massima di css/tavola.css. Manca la prova su telefono.
- 2026-11-05 - Tappa 27.1 completata: prova su telefono passata («a primo colpo d'occhio sembra vada bene»). Via alla Tappa 27.2 (carte francesi).
- 2026-11-05 - Tappa 27.2 implementata: 7 giochi con il mazzo francese a schermo intero; carte semplificate in Scala 40, Ramino e Burraco; carte più grandi in Blackjack, Guerra, Poker; avversari compatti in Cambio colore; CSS di Codex in due giri. Manca la prova su telefono.
- 2026-11-05 - Tappa 27.2 completata (via dell'utente). Inizio Tappa 27.3 (giochi da tavolo).
- 2026-11-05 - Tappa 27.3 implementata: Dama, Filetto, Battaglia navale, Ludo, Scacchi a schermo intero, segnapunti in una riga, computer fermo con il pannello aperto; CSS di Codex in un giro. Manca la prova su telefono.
- 2026-11-05 - Tappa 27.3 completata (prova su telefono passata). Tappa 27.4 implementata: Forza 4, Memory, Campo minato, Raddoppia, Sudoku, Cinque lettere a schermo intero, tempo fermo con il pannello aperto, css/gioco.css mobile-first; spostamento su css/gioco.css rimandato. Manca la prova su telefono.
- 2026-11-06 - Tappa 27.4 completata (prova su telefono: «tutto ok»). Inizio Tappa 27.5 (giochi storici): pannello sulle 4 pagine, fuoco del campo dell'Impiccato solo sugli schermi larghi; CSS a Codex.
- 2026-11-06 - Tappa 27.5 implementata: Tris, Impiccato, Sasso carta forbici, Indovina il numero a schermo intero; Impiccato senza tastiera del telefono; CSS di Codex in un giro più un ripristino di Claude. Manca la prova su telefono.
- 2026-11-06 - Tappa 27.5 e Tappa 27 completate (prova su telefono passata). Tappa 26 implementata: gesti comuni in js/arcade-pagina.js per i 7 arcade, due dita in due giocatori, pannello sui 6 arcade rimasti, tabellone senza puntini (Codex, un giro). Manca la prova su telefono.
- 2026-11-06 - Tappa 26 completata («perfetto, procedi»). Tutte le 27 tappe concluse. Inizio della pianificazione della fase APK.
- 2026-11-06 - Fase APK pianificata: strumento Capacitor (scelta dell'utente), Tappe 28 (struttura), 29 (schermo intero, tasto indietro, icona), 30 (APK e prova). In attesa del via.
- 2026-11-06 - Tappa 28 completata: Capacitor 8 con pnpm, www/ con i soli file dei giochi, progetto android/, APK di debug compilato e provato sull'emulatore. Nome «Giochi di una volta», orientamento libero (scelte dell'utente).
- 2026-11-06 - Nome «Giochi di una volta» anche nel sito (scelta dell'utente): titoli, home, README; «Nessuna installazione» diventa «Senza pubblicità».
- 2026-11-06 - Tappa 29 completata: schermo intero, tasto indietro (js/indietro.js), icona e schermata di avvio originali, verticale per ora; verificata sull'emulatore. Aggiunta la Tappa 29.1 (orizzontale per alcuni giochi scelti dall'utente).
- 2026-11-06 - L'utente ha installato l'APK e provato alcuni giochi: negli arcade il campo occupa circa metà dello schermo (misurato: 27-44%). Aggiunta la Tappa 29.2 (campi verticali sul telefono), in attesa del via.
- 2026-11-06 - Tappa 29.2 implementata: campi verticali sul telefono misurati sullo spazio libero, Ping pong girato, Blocchi stretto; campo dal 27-44% al 71-79% dello schermo. Record unico (scelta dell'utente). Manca la prova su telefono.
- 2026-11-06 - Tappa 29.2: su richiesta dell'utente i mattoni di Mattoncini scendono un po' nel campo alto del telefono (un quarto dell'altezza in più).
- 2026-11-06 - Tappa 29.2 completata: prova su telefono passata («per il resto mi sembra vada tutto bene»).
- 2026-11-06 - Tappa 29.1 saltata (richiesta dell'utente, in Fuori MVP). Tappa 30 completata: APK di debug, sezione «App Android» nel README, .gitattributes per gradlew. Piano completato.
- 2026-11-06 - Push fatti dall'utente; resta solo il secondo test di Mattoncini sul telefono.
- 2026-11-06 - Prova di Mattoncini (distanze e difficoltà, nel browser): sul telefono la palla impiega più del doppio del tempo che sul PC e la difficoltà sale poco. Scritto il piano della Tappa 31 (livelli infiniti, colpi di bordo, mattoni che scendono dal livello 4, doppia palla dal 5), in attesa del via.
- 2026-11-06 - Tappa 31: colpo di bordo, livelli infiniti, mattoni che scendono dal livello 4, doppia palla dal 5; test e prova nel browser OK, APK rigenerato. Manca la prova sul telefono.
