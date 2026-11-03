# Tappa 8 — Stesso stile moderno per Impiccato, Indovina il numero e Sette e mezzo

Ultima modifica: 2026-11-03

## Obiettivo

Portare sugli altri tre giochi lo stile della [Tappa 7](16-tappa-07-restyling-moderno.md): contenitore più profondo, tabellone con i numeri grandi, elementi "a tessera", piccole animazioni e regole richiudibili. Palette e logica dei giochi restano le stesse.

## Attività

- [x] Impiccato: tabellone con gli errori (6 "vite") e le lettere provate; parola in tessere, una per lettera, che si girano quando vengono scoperte; tastiera a tessere che diventa verde per le lettere giuste e rossa per quelle sbagliate; disegno in un riquadro; regole richiudibili
- [x] Indovina il numero: tabellone con tentativi fatti e rimanenti; "intervallo possibile" (per esempio "tra 34 e 100") che si stringe a ogni tentativo; storico dei tentativi in pillole con la freccia; campo del numero grande; dopo ogni tentativo il campo si svuota; regole richiudibili
- [x] Sette e mezzo: punteggi in pillole grandi accanto a "Giocatore" e "Banco"; carte che entrano con un'animazione; messaggio finale in una pillola colorata; "Il banco sta giocando…" che pulsa; regole richiudibili
- [x] JS solo per la parte visiva; la logica dei giochi resta la stessa

## Come verificare

- Screenshot a 375 px e a desktop durante una partita.
- jsdom: partita completa per ognuno dei tre giochi, senza errori JavaScript.
- Contrasti AA per i colori nuovi.

## Esito

Lavoro fatto da Claude.

- **Impiccato** (`index.html`, `main.js`, `style.css`):
  - tabellone verde con 6 "vite" dorate, che si svuotano a ogni errore, e il contatore "Errori N/6";
  - parola fatta di tessere, una per lettera, che si girano quando la lettera viene scoperta; a partita persa le lettere mancanti compaiono in rosso;
  - tastiera a tessere: verde per le lettere giuste, rossa e barrata per quelle sbagliate;
  - disegno in un riquadro (sopra la tastiera su mobile, accanto da 600 px), campo "Oppure scrivi una lettera", regole richiudibili.
  - Nel JS le nuove funzioni sono `preparaParola`, `scopriTessera`, `aggiornaVite` e `bloccaPartita`.
- **Indovina il numero** (`index.html`, `main.js`, `style.css`):
  - tabellone con tentativi fatti, "È tra" (l'intervallo in cui si trova ancora il numero, che si stringe a ogni tentativo) e tentativi rimasti;
  - campo del numero grande; dopo ogni tentativo sbagliato il campo si svuota e resta pronto;
  - messaggio in una pillola colorata;
  - storico dei tentativi in pillole con la freccia (↑ il numero è più alto, ↓ più basso, ✓ trovato);
  - istruzioni richiudibili; il menu mostra quanti tentativi ha ogni difficoltà.
- **Sette e mezzo** (`index.html`, `main.js`, `style.css`):
  - tavolo con un alone al centro e un bordo dorato;
  - punteggi in pillole dorate accanto a "Giocatore" e "Banco";
  - il riquadro di chi sta giocando ha il bordo dorato (`data-turno`);
  - le carte arrivano dall'alto con un'animazione;
  - messaggio finale in una pillola verde o rossa, e "Il banco sta giocando..." che pulsa;
  - "Nuova partita" in una variante chiara e regole in un pannello scuro richiudibile.
  - Nel JS le nuove funzioni sono `impostaTurno` e `mostraMessaggio`.

Verifica eseguita:
- jsdom, 23 controlli passati:
  - impiccato: tessere, vite, colori dei tasti, lettera già usata, vittoria, sconfitta con la parola rivelata, nuova partita;
  - indovina il numero: partita giocata con la ricerca binaria, controllando l'intervallo a ogni passo; storico; fine partita a Difficile; nuova partita;
  - sette e mezzo: inizio, pesca, "Stai" con il turno del banco, fine della mano dopo i timer;
  - nessun errore JavaScript.
- Screenshot a 375 e 820 px durante una partita. In base agli screenshot è stato tolto lo spazio vuoto lasciato dalla riga dell'errore quando è vuota.
- Contrasti dei colori nuovi tra 4,83:1 e 8,22:1 (AA).

## Decisioni prese

- Impiccato: con una lettera giusta il messaggio d'errore ora sparisce del tutto, perché il numero di errori è sempre visibile nel tabellone. Prende il posto della scelta della [Tappa 2](11-tappa-02-bug.md), che mostrava "Errori: N/6" nel messaggio.
- Indovina il numero: l'intervallo "È tra" e lo storico sono solo un aiuto visivo, calcolato dai tentativi già fatti; le regole del gioco non cambiano.
- Le regole di tutti i giochi ora sono in un pannello `<details>` richiudibile, come nella [Tappa 7](16-tappa-07-restyling-moderno.md).

## Problemi aperti

- Prova a occhio nel browser vero: la fa l'utente (Ctrl+F5 per evitare la cache).
