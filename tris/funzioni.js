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

// Restituisce 'X' o 'O' se qualcuno ha fatto tris, altrimenti null
function trovaVincitore(caselle) {
    for (let i = 0; i < combinazioniVincenti.length; i++) {
        const [a, b, c] = combinazioniVincenti[i];
        if (caselle[a] !== '' && caselle[a] === caselle[b] && caselle[a] === caselle[c]) {
            return caselle[a];
        }
    }
    return null;
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

// Sceglie la mossa del PC (che gioca sempre con O) in base alla difficoltà
function mossaPC(caselle, difficolta) {
    if (difficolta === 'facile') {
        return mossaCasuale(caselle);
    }
    return mossaMedia(caselle);
}

// In Node (script di prova) esporta le funzioni; nel browser "module" non esiste e questa parte viene saltata
if (typeof module !== 'undefined') {
    module.exports = { combinazioniVincenti, trovaVincitore, grigliaPiena, caselleVuote, mossaCasuale, cercaMossa, mossaMedia, mossaPC };
}
