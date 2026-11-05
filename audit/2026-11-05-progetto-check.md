# Check completo del progetto Giochi JS

Data: 5 novembre 2026. Riferimento Git: `8a69b0d` più le modifiche già presenti nell'indice ai sei file del piano. Analisi della copia di lavoro locale, non del sito pubblicato.

## Valutazione generale

Il progetto ha una buona base tecnica per una raccolta statica: 50 giochi, nessuna dipendenza da installare, logica generalmente separata dai controller, componenti condivisi e una suite automatica ampia. Il controllo ufficiale passa integralmente: **165 file JavaScript, 55 suite, zero controlli falliti**.

Questo esito non equivale a un collaudo completo dell'interfaccia. Le verifiche supplementari hanno confermato una barriera all'uso dei solitari da tastiera, un ramo di FreeCell che non rispetta la garanzia di risolvibilità, un difetto del cronometro e un conteggio ambiguo degli annullamenti. Resta aperto il problema già segnalato delle carte troppo piccole sul telefono. Non sono emersi errori bloccanti nelle verifiche eseguite.

Priorità: completare la Tappa 24.1 e correggere i problemi del controller condiviso prima di considerare concluso il lavoro sui solitari o iniziare il collaudo APK.

## Perimetro e metodo

- Inventario di tutte le pagine HTML e dei file JavaScript; verifica dei percorsi locali HTML/CSS e della corrispondenza tra home e cartelle dei giochi.
- Esecuzione integrale di `node scripts/check.js`, che controlla la sintassi e avvia tutte le suite `test-*.js`.
- Lettura di README, ADR, stato del piano e audit precedenti per distinguere problemi nuovi, problemi noti e correzioni già completate.
- Revisione mirata dei moduli condivisi, in particolare solitari, carte, giocatori, persistenza e DOM di test. Non è una revisione riga per riga di tutti i motori.
- Prove supplementari riproducibili con `node audit/verifiche-2026-11-05.cjs`: inventario, tre annullamenti consecutivi, semantica dei controlli, cronometro dopo la fine e ramo di fallback FreeCell.
- Nessuna modifica al codice dei giochi, nessuna installazione, commit o pubblicazione. Le modifiche preesistenti al piano sono state preservate.

## Risultati misurati

| Controllo | Esito |
|---|---|
| Giochi dichiarati nella home | 50, nessun duplicato, tutte le pagine presenti |
| Pagine HTML | 52: home, 50 giochi, anteprima componenti |
| Sintassi JavaScript | 165 file controllati, zero errori |
| Suite ufficiali | 55 eseguite, zero fallimenti, uscita del runner 0 |
| Riferimenti locali HTML/CSS | 551 verificati, nessun file mancante |
| Struttura HTML di base | Tutte le 52 pagine hanno `lang="it"`, viewport e un solo `h1`; nessun ID duplicato rilevato |
| Link esterni distinti | 26 censiti; destinazioni non verificate in rete |
| Dimensione della copia di lavoro | Circa 2,84 MB esclusi `.git` e `node_modules`; non è il peso scaricato da una singola pagina |
| Build e pacchetti | Nessuna build o dipendenza npm richiesta dall'architettura |

Il controllo dei riferimenti usa un'analisi testuale degli attributi HTML e degli `url()` CSS: non sostituisce il pannello Network. Le immagini generate dinamicamente dei mazzi sono inoltre controllate dalla suite `js/test-mazzo.js` (92 carte e due dorsi); gli Scacchi hanno una suite dedicata agli asset.

## Rilievi e priorità

| ID | Priorità | Rilievo | Evidenza |
|---|---|---|---|
| R1 | Alta per l'accessibilità | Tavoli dei dieci solitari non utilizzabili da tastiera | Controller e prova sul DOM simulato |
| R2 | Media | FreeCell può restituire una partita non verificata | Ramo di fallback e prova isolata |
| R3 | Media | Carte dei solitari troppo piccole sul telefono | Segnalazione già nel piano e formula di dimensionamento |
| R4 | Bassa | Tempo finale modificabile dopo un ridimensionamento | Riproduzione deterministica sul controller |
| R5 | Bassa | Contatore incoerente dopo annullamenti consecutivi | Riproduzione deterministica sul controller |
| R6 | Media, verifica | Manca una verifica reale del browser in questo audit | Accesso al browser indisponibile; limiti del DOM minimo |
| R7 | Bassa | Checklist 24.1 contiene esiti non coerenti con il codice presente | Confronto piano/controller/test |
| R8 | Bassa | Validazione dei record locali disomogenea | Lettura dei controller Memory e Raddoppia |

### R1 — I solitari richiedono mouse o touch

File: `js/solitario-pagina.js:47`, `js/solitario-pagina.js:126`, `js/carte.js:31`.

Le pile sono `div` e le carte sono immagini. Il controller registra soltanto `pointerdown`, `pointermove`, `pointerup` e `pointercancel` sul tavolo; non assegna `tabindex` né implementa azioni da tastiera. La prova sul tavolo Klondike conta zero elementi con semantica pulsante o accesso al focus. I pulsanti esterni Annulla, Completa e Nuova partita non consentono di effettuare le mosse.

Impatto: chi usa soltanto la tastiera non può giocare ai dieci solitari, perché condividono questo controller. Gli `alt` delle immagini aiutano a leggere le carte ma non rendono eseguibili le azioni.

Intervento: aggiungere una navigazione tra pile/carte con focus visibile, selezione e destinazione attivabili da tastiera e nomi accessibili che descrivano posizione e azione. Verificare anche il ripristino del focus dopo `disegna()`, che ricrea il tavolo.

### R2 — La promessa FreeCell non è garantita nel fallback

File: `freecell/funzioni.js:16–21`, `freecell/index.html:11`, `home.js` (scheda FreeCell), `PLAN/32-tappa-23-solitari-1.md:20`.

`crea()` prova fino a 20 distribuzioni e le accetta se il risolutore trova una soluzione entro il limite. Esauriti i tentativi, restituisce una ventunesima distribuzione senza chiamare il risolutore. L'interfaccia e il piano promettono invece che ogni partita proposta sia risolvibile.

La prova supplementare forza soltanto nel contesto isolato l'esaurimento dei tentativi e conferma che viene comunque restituito un mazzo di 52 carte. **Non è stata trovata una partita reale irrisolvibile**: il difetto confermato è l'assenza di verifica nell'ultimo ramo, non la frequenza del problema. Le distribuzioni campionate dalla suite ufficiale passano.

Intervento: usare una distribuzione di riserva già certificata oppure gestire esplicitamente l'impossibilità di generare una partita verificata. Aggiungere un test del ramo di esaurimento, senza rimuovere la garanzia in silenzio.

### R3 — Leggibilità mobile ancora da risolvere

File: `js/solitario-pagina.js:23–28`, `css/solitario.css`, `PLAN/35-tappa-24-1-carte-leggibili.md:7`.

La larghezza delle carte è calcolata dividendo quella del tavolo per `numeroColonne × 1,12`, con un massimo di 96 px e nessun minimo. Per esempio, con tavolo largo 320 px e dieci colonne si ottengono carte larghe 28 px. Non si tratta di una misura acquisita oggi nel browser, ma dell'applicazione della formula presente nel codice.

Il piano riporta già una prova dell'utente con carte da 26–38 px a viewport 375 px. Nel codice controllato le carte sono ancora immagini; mancano la rappresentazione semplificata e il selettore persistente previsti dalla Tappa 24.1.

Intervento: completare la soluzione già scelta nel piano, poi verificare leggibilità di valore e seme, selezione, sovrapposizione e destinazioni con tutte le dieci disposizioni. Servono una prova a 375 px e una su telefono reale.

### R4 — Il tempo finale non viene congelato

File: `js/solitario-pagina.js:16`, `js/solitario-pagina.js:98`, `js/solitario-pagina.js:161`.

Alla fine viene fermato l'intervallo, ma `tempo()` continua a calcolare `Date.now() - inizio`. Un evento `resize` richiama `disegna()` e aggiorna il riepilogo anche a partita conclusa.

Riproduzione isolata: simulare la vittoria alla prima mossa, avanzare l'orologio di 60 secondi e richiamare il gestore `resize`. Il tempo passa da **0:00 a 1:00**. Il testo del risultato resta quello generato alla fine, quindi può divergere dal riepilogo. La prova simula la vittoria per controllare il ciclo di vita del controller; non è una partita completata nel browser.

Intervento: memorizzare il tempo trascorso alla conclusione e usare quel valore per tutti i disegni successivi.

### R5 — Gli annullamenti hanno un conteggio ambiguo

File: `js/solitario-pagina.js:151`.

Tre pescate Klondike portano il contatore a 3. Tre pressioni di Annulla producono **3 → 3 → 2 → 1**, perché viene ripristinato il contatore dello snapshot e poi incrementato. Il mazzo torna alla posizione iniziale ma il riepilogo mostra una mossa.

Questo comportamento non rappresenta né il numero di mosse ancora applicate, che tornerebbe a zero, né il totale delle azioni eseguite, che crescerebbe. Il ripristino delle carte funziona; il rilievo riguarda il significato del contatore.

Intervento: definire la convenzione desiderata e gestire il contatore di conseguenza; testare più annullamenti consecutivi e una nuova mossa dopo un annullamento.

### R6 — I test verdi non certificano rendering e interazione reale

File: `scripts/dom-minimo.js:32–61`, `js/test-solitari-pagine.js`, `scripts/test-interfacce.js`.

Il DOM minimo crea elementi anche quando un selettore non esiste nell'HTML, non applica CSS, non gestisce il focus nativo e simula soltanto parte dei selettori e degli eventi. I timer a intervallo non avanzano. Le finestre dei giocatori sono spesso sostituite da stub nei test dei controller. È un approccio utile per verificare la logica, già dichiarato nel README, ma può lasciare passare errori di integrazione e accessibilità.

In questa sessione l'inventario del browser ha restituito `The browser access host is unavailable`. Non sono stati eseguiti collaudi del browser reale, misure responsive, letture della console o registrazioni Network. Le prove browser riportate negli audit precedenti rimangono evidenza storica sullo stato di allora.

Intervento: affiancare alle suite un controllo reale di caricamento delle 50 pagine e casi mirati per tastiera, passaggio del dispositivo, ridimensionamento, trascinamento e riavvio durante il turno PC. Non è necessario sostituire il sistema di test esistente.

### R7 — La checklist della Tappa 24.1 va chiarita

File: `PLAN/35-tappa-24-1-carte-leggibili.md:17–28`.

La sezione «Come verificare» contiene già righe «OK pagina» e una nota «anche con le carte semplificate», mentre attività ed esito sono ancora vuoti e nel controller non esiste la modalità semplificata. Inoltre la suite ufficiale dei solitari usa tocchi casuali con seme per scegliere gli elementi, ma non fissa la casualità della distribuzione iniziale: i numeri di mosse stampati non sono una certificazione ripetibile del rendering.

Intervento: distinguere i risultati attesi dagli esiti realmente acquisiti, annotando comando, stato del codice ed eventuali screenshot. Non ho modificato questi file perché appartengono alle modifiche preesistenti dell'utente.

### R8 — Dati dei record locali non sempre validati

File: `memory/main.js:30–33`, `raddoppia/main.js:37–39`.

Memory accetta qualsiasi numero maggiore di zero, inclusa `Infinity`; Raddoppia usa `Number(valore) || 0`, che accetta anche valori negativi e infiniti. Il modulo Arcade e i controller di Campo minato/Sudoku applicano già controlli più espliciti.

Impatto basso: riguarda dati corrotti o modificati nel browser, non è stata osservata una corruzione generata dal normale gioco. In Raddoppia un record `Infinity` impedirebbe di salvare nuovi record finiti.

Intervento: accettare soltanto valori finiti e coerenti con il punteggio, altrimenti usare il valore predefinito.

## Architettura, sicurezza e manutenzione

**Architettura.** La scelta HTML/CSS/JavaScript senza build è coerente con il progetto e documentata negli ADR. I moduli condivisi riducono la duplicazione; in particolare correggere il controller dei solitari porta beneficio a dieci giochi. Non emerge una necessità di introdurre un framework.

**Test.** La suite include simulazioni complete, conservazione di carte/fiches, regole dei giochi, controller, riavvii e algoritmi PC. Gli Scacchi includono perft e casi speciali; Sudoku usa anche un risolutore indipendente. Sono punti di forza concreti. Non è stata misurata una percentuale di copertura: 55 suite non significano copertura esaustiva delle varianti.

**Sicurezza del codice esaminato.** Non sono emersi backend, autenticazione o chiamate `fetch` nel codice applicativo cercato. Nomi e record sono conservati in `localStorage` con gestione degli errori di accesso. Il rendering usa prevalentemente `textContent`; i pochi `innerHTML` individuati contengono markup costante o, nell'Impiccato, una parola proveniente dal dizionario locale o dalla validazione alfabetica del flusso a due giocatori. Non è stato identificato un percorso XSS confermato in questi flussi. Le carte coperte hanno un testo alternativo generico, utile a non rivelarle tramite lettore di schermo.

**Limiti della verifica di sicurezza.** Non è un penetration test né una scansione della storia Git. La ricerca per nomi di file non ha trovato `.env`, `.pem`, `.key` o `.pfx` nella copia di lavoro esclusa `.git`; non dimostra l'assenza di segreti con altri nomi o nei commit storici. HTTPS, intestazioni del server, CSP, cache e configurazione di pubblicazione non sono stati verificati.

**Manutenzione.** Il README descrive correttamente avvio e verifiche senza npm. I problemi storici dei quattro giochi iniziali senza test sono stati affrontati e le suite sono passate anche oggi. Non risulta una pipeline CI versionata sotto `.github`: automatizzare il comando esistente sarebbe un miglioramento utile. Non sono necessari aggiornamenti di pacchetti, perché il progetto non ha un manifesto npm.

**Versionamento.** All'inizio erano già staged modifiche a `PLAN/01-stato-attuale.md`, `PLAN/02-tappe.md`, `PLAN/32-tappa-23-solitari-1.md`, `PLAN/33-tappa-24-solitari-2.md`, `PLAN/35-tappa-24-1-carte-leggibili.md` e `PLAN/99-registro.md`. L'audit aggiunge soltanto questo report e lo script supplementare nella cartella `audit`; non altera l'indice Git.

## Ordine di intervento e criteri di accettazione

1. **Concludere la Tappa 24.1:** carte leggibili e modalità semplificata funzionante/persistente; controllo delle dieci disposizioni a 375 px e su telefono.
2. **Rendere i solitari giocabili da tastiera:** mosse complete, pesca, selezione e destinazione senza mouse, con focus mantenuto dopo il disegno.
3. **Rispettare la garanzia FreeCell:** nessuna distribuzione restituita senza certificazione, compreso il ramo dopo 20 tentativi.
4. **Correggere tempo e contatore:** tempo finale stabile dopo resize e convenzione degli annullamenti verificata da test mirati.
5. **Eseguire il collaudo browser:** caricamento di tutte le pagine senza errori di console/risorse mancanti, interazioni mirate e controllo del passaggio tra giocatori.
6. **Completare la manutenzione:** validazione uniforme dei record, checklist con evidenze effettive e CI sul comando ufficiale.

## Riproduzione delle verifiche

```sh
node scripts/check.js
node audit/verifiche-2026-11-05.cjs
```

Il primo comando è la suite ufficiale e restituisce zero soltanto se tutti i controlli passano. Il secondo stampa osservazioni dell'audit: è diagnostico, non una suite di regressione che fallisce sui difetti rilevati. Le prove FreeCell e del cronometro usano modifiche esclusivamente nel contesto VM in memoria; i file applicativi restano intatti.
