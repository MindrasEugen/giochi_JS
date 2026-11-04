# Correzioni successive al controllo del 4 novembre 2026

## Ambito

Applicate le sei correzioni funzionali individuate nel rapporto in chat, aggiunto isolamento dello sfondo delle finestre, documentato avvio e verifiche. Nessun cambio di stack e nessuna dipendenza aggiunta.
Le modifiche preesistenti in PLAN e js/arcade.js sono state lasciate intatte; la logica di Serpente, gia' in lavorazione, ha ricevuto solo la gestione di fine partita e le relative regressioni.

## Interventi

- Scacchi: la chiave di ripetizione considera l'en passant solo se la cattura e' legale, anche in presenza di inchiodatura. Nessuna chiamata ricorsiva al generatore delle mosse legali nel calcolo della chiave.
- Scacchi: le catture sono conservate nello stato, aggiornate dalle mosse e ripristinate dall'annullamento insieme alla posizione. Una promozione non viene piu' dedotta come cattura. Una posizione caricata da FEN parte senza cronologia delle catture, non ricostruibile dalla sola posizione.
- Serpente: la griglia piena termina la partita ed emette grigliaPiena. Chiamare passo dopo la fine non modifica lo stato. La pagina del gioco resta da sviluppare.
- Campo minato e Sudoku: zero secondi e' un record valido; dati assenti o non finiti non vengono accettati.
- Sette e mezzo: il banco cambia all'avvio della prossima mano, mantenendo corretti i titoli se si cambiano i nomi dopo la fine.
- Home: Ludo mostra 1-4 giocatori.
- Finestre condivise: lo sfondo diventa inert; alla chiusura viene ripristinato il valore precedente.
- scripts/check.js: controllo unico della sintassi e di tutte le suite; non richiede dipendenze.
- scripts/test-interfacce.js: regressioni dei controller reali con DOM minimo per record, ruoli del banco, home e finestre.
- README.md: istruzioni di avvio, struttura, comandi e checklist manuale.

## Verifiche

Le 13 suite originarie, con le nuove regressioni di Scacchi e Serpente, sono passate dopo le correzioni. Anche la nuova suite dei controller e' passata.
Il controllo di sintassi include i nuovi script. git diff --check non segnala errori di spaziatura.

## Limiti

Non eseguita una verifica interattiva browser: il servizio di accesso ai browser ha restituito "The browser access host is unavailable"; il tentativo di accedere a Edge tramite controllo nativo ha restituito finestra minimizzata senza un binding utilizzabile.
Il DOM simulato non verifica rendering, touch, compatibilita', focus nativo o lettori di schermo. La checklist nel README resta da eseguire su browser e telefono.
Nessuna modifica al motore sincrono del PC o ai test casuali storici; eventuali interventi richiedono misurazioni specifiche. Nessun commit, push o deploy effettuato.
