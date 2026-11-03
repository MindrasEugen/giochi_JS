// Logica del tris.
// La griglia è un array di 9 caselle: 'X', 'O' oppure '' (vuota).
// Indici delle caselle:
//   0 | 1 | 2
//   3 | 4 | 5
//   6 | 7 | 8
// Queste funzioni non leggono e non modificano la pagina: ricevono l'array
// e restituiscono un risultato. Così si possono provare anche con Node.

const combinazioniVincenti = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Restituisce la combinazione del tris (es. [0, 4, 8]) oppure null
function rigaVincente(caselle) {
    for (let i = 0; i < combinazioniVincenti.length; i++) {
        const [a, b, c] = combinazioniVincenti[i];
        if (caselle[a] !== '' && caselle[a] === caselle[b] && caselle[a] === caselle[c]) {
            return combinazioniVincenti[i];
        }
    }
    return null;
}

// Restituisce 'X' o 'O' se qualcuno ha fatto tris, altrimenti null
function trovaVincitore(caselle) {
    const riga = rigaVincente(caselle);
    return riga === null ? null : caselle[riga[0]];
}

function grigliaPiena(caselle) {
    return caselle.every(casella => casella !== '');
}

// Indici delle caselle ancora libere
function caselleVuote(caselle) {
    const vuote = [];
    for (let i = 0; i < caselle.length; i++) {
        if (caselle[i] === '') {
            vuote.push(i);
        }
    }
    return vuote;
}

function mossaCasuale(caselle) {
    const vuote = caselleVuote(caselle);
    return vuote[Math.floor(Math.random() * vuote.length)];
}

// Cerca una riga con due simboli uguali e la terza casella vuota:
// restituisce l'indice della casella vuota, oppure null
function cercaMossa(caselle, simbolo) {
    for (let i = 0; i < combinazioniVincenti.length; i++) {
        const riga = combinazioniVincenti[i];
        const uguali = riga.filter(indice => caselle[indice] === simbolo).length;
        const vuota = riga.find(indice => caselle[indice] === '');
        if (uguali === 2 && vuota !== undefined) {
            return vuota;
        }
    }
    return null;
}

// Media: chiude il proprio tris se può, altrimenti blocca quello di X, altrimenti gioca a caso
function mossaMedia(caselle) {
    let indice = cercaMossa(caselle, 'O');
    if (indice === null) {
        indice = cercaMossa(caselle, 'X');
    }
    if (indice === null) {
        indice = mossaCasuale(caselle);
    }
    return indice;
}

// Minimax: il PC "immagina" tutte le partite possibili a partire da questa griglia,
// supponendo che entrambi i giocatori scelgano sempre la mossa migliore per sé.
// - "simbolo" è chi deve muovere adesso nella partita immaginata;
// - il punteggio è dal punto di vista di O (il PC): positivo se vince O, negativo se vince X, 0 se pareggio;
// - "profondita" conta le mosse immaginate: sottraendola, una vittoria vicina vale più di una lontana
//   e una sconfitta lontana pesa meno di una vicina.
function minimax(caselle, simbolo, profondita) {
    const vincitore = trovaVincitore(caselle);
    if (vincitore === 'O') {
        return 10 - profondita;
    }
    if (vincitore === 'X') {
        return profondita - 10;
    }
    if (grigliaPiena(caselle)) {
        return 0;
    }

    const vuote = caselleVuote(caselle);
    const prossimo = simbolo === 'O' ? 'X' : 'O';
    // O cerca il punteggio più alto, X il più basso
    let migliore = simbolo === 'O' ? -Infinity : Infinity;
    for (let i = 0; i < vuote.length; i++) {
        caselle[vuote[i]] = simbolo;                                // prova la mossa...
        const punteggio = minimax(caselle, prossimo, profondita + 1);
        caselle[vuote[i]] = '';                                     // ...e la annulla
        if (simbolo === 'O') {
            migliore = Math.max(migliore, punteggio);
        } else {
            migliore = Math.min(migliore, punteggio);
        }
    }
    return migliore;
}

// Impossibile: prova ogni casella libera con O e tiene quella con il punteggio minimax più alto
function mossaMigliore(caselle) {
    const copia = [...caselle]; // il minimax lavora su una copia: la griglia vera non cambia
    const vuote = caselleVuote(copia);
    let migliorPunteggio = -Infinity;
    let migliorIndice = vuote[0];
    for (let i = 0; i < vuote.length; i++) {
        copia[vuote[i]] = 'O';
        const punteggio = minimax(copia, 'X', 1);
        copia[vuote[i]] = '';
        if (punteggio > migliorPunteggio) {
            migliorPunteggio = punteggio;
            migliorIndice = vuote[i];
        }
    }
    return migliorIndice;
}

// Sceglie la mossa del PC (che gioca sempre con O) in base alla difficoltà
function mossaPC(caselle, difficolta) {
    if (difficolta === 'facile') {
        return mossaCasuale(caselle);
    }
    if (difficolta === 'impossibile') {
        return mossaMigliore(caselle);
    }
    return mossaMedia(caselle);
}

// In Node (script di prova) esporta le funzioni; nel browser "module" non esiste e questa parte viene saltata
if (typeof module !== 'undefined') {
    module.exports = { combinazioniVincenti, rigaVincente, trovaVincitore, grigliaPiena, caselleVuote, mossaCasuale, cercaMossa, mossaMedia, minimax, mossaMigliore, mossaPC };
}
