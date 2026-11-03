# Consegna

Il computer pensa a un numero intero da 1 a 100. L'utente lo scrive in un campo di testo e preme un bottone. La pagina risponde con "Troppo alto", "Troppo basso" oppure "Indovinato in X tentativi!".

## Passo 0: struttura e collegamenti

Crea la sottocartella (per esempio 01-indovina-numero) con dentro tre file:

- index.html per la struttura
- style.css per l'aspetto
- script.js per la logica

Ora il ripasso sui collegamenti. Ti do i concetti, il codice lo scrivi tu:

- Il CSS si collega dentro `<head>`, con un tag che non ha chiusura. Il tag si chiama come il verbo inglese "collegare". Ha bisogno di due attributi: uno che dice che tipo di relazione ha il file con la pagina (è un foglio di stile, in inglese stylesheet) e uno che dice dove si trova il file.soluzioni classiche: una riguarda dove metti il tag `<script>`, l'altra è un attributo da aggiungere al tag (cerca "script defer"). Scegline una e dimmi perché funziona.

Per controllare che i collegamenti funzionino:
- nel CSS metti un colore di sfondo vistoso al body;
- nel JS scrivi un console.log("collegato!");
- apri index.html nel browser e controlla lo sfondo e la console (F12, scheda Console).

## Passo 1: l'HTML

Nel body ti servono:
- un titolo;
- un breve testo con le istruzioni;
- un campo di input per i numeri (c'è un type apposta, con attributi per minimo e massimo);
- un bottone "Prova";
- un elemento vuoto dove compariranno i messaggi;
- un elemento per il numero di tentativi.

Pensa a quali elementi dovrai leggere o modificare dal JS e dai a ognuno un id chiaro.

Passo 2: JavaScript, prima parte

In main.js:

1. Seleziona gli elementi che ti servono (form, input, messaggi, numero dei tentativi) e salvali in costanti. Il metodo è sul document, e c'è sia la versione "per id" sia quella che accetta un selettore CSS.
2. Genera il numero segreto da 1 a 100. Ti servono due metodi di Math: uno restituisce un decimale tra 0 (incluso) e 1 (escluso), l'altro arrotonda per difetto. Ragiona così: se moltiplichi quel decimale per 100, qual è il valore più piccolo e quale il più grande che puoi ottenere? Cosa devi fare per arrivare a "da 1 a 100"?
3. Per controllare il risultato, stampa il numero segreto con console.log (lo toglieremo alla fine 😉).
4. Crea una variabile per i tentativi. const o let? Perché?
5. Ascolta l'evento del form (non il clic del bottone: quale evento lancia un form quando viene inviato?) e, per ora, dentro la funzione stampa in console il valore scritto nell'input.

Quando ci riesci, scrivi un numero e guarda la console. Due domande:
- il valore stampato è un numero o una stringa? (prova typeof);
- il messaggio resta in console o sparisce subito? Se sparisce, collegalo a quello che hai notato provando il form.

Fammi sapere quando hai fatto, oppure dimmi dove ti sei bloccato.