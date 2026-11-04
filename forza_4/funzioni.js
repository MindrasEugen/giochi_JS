// Logica di Forza 4.
// La griglia è un array di 42 caselle (6 righe × 7 colonne), riga 0 in alto:
// l'indice della casella è riga * 7 + colonna. Ogni casella vale '' (vuota), 'R' (rosso) o 'G' (giallo).
// Le pedine "cadono": in una colonna si occupa sempre la casella libera più in basso.
// Queste funzioni non toccano la pagina: si provano con Node (node forza_4/test-forza4.js).

const RIGHE = 6;
const COLONNE = 7;
// Le colonne centrali sono le più utili: il PC le prova per prime, così la potatura alfa-beta taglia di più
const ORDINE_COLONNE = [3, 2, 4, 1, 5, 0, 6];

function grigliaVuota() {
    return new Array(RIGHE * COLONNE).fill('');
}

function indice(riga, colonna) {
    return riga * COLONNE + colonna;
}

function avversario(pedina) {
    return pedina === 'R' ? 'G' : 'R';
}

// Riga in cui cadrebbe una pedina nella colonna, oppure -1 se la colonna è piena
function rigaLibera(griglia, colonna) {
    for (let riga = RIGHE - 1; riga >= 0; riga--) {
        if (griglia[indice(riga, colonna)] === '') {
            return riga;
        }
    }
    return -1;
}

function colonneLibere(griglia) {
    return ORDINE_COLONNE.filter(c => rigaLibera(griglia, c) !== -1);
}

// Mette la pedina nella colonna (la griglia cambia) e restituisce la riga, oppure -1 se la colonna è piena
function inserisci(griglia, colonna, pedina) {
    const riga = rigaLibera(griglia, colonna);
    if (riga !== -1) {
        griglia[indice(riga, colonna)] = pedina;
    }
    return riga;
}

function piena(griglia) {
    return griglia.every(casella => casella !== '');
}

// Tutte le "finestre" di 4 caselle in fila: orizzontali, verticali e nelle due diagonali
const FINESTRE = (() => {
    const finestre = [];
    const direzioni = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (let riga = 0; riga < RIGHE; riga++) {
        for (let colonna = 0; colonna < COLONNE; colonna++) {
            for (const [dr, dc] of direzioni) {
                const fineRiga = riga + 3 * dr;
                const fineColonna = colonna + 3 * dc;
                if (fineRiga < RIGHE && fineColonna >= 0 && fineColonna < COLONNE) {
                    finestre.push([0, 1, 2, 3].map(k => indice(riga + k * dr, colonna + k * dc)));
                }
            }
        }
    }
    return finestre;
})();

// Restituisce { vincitore, celle } se ci sono 4 pedine uguali in fila, altrimenti null
function quattroInFila(griglia) {
    for (const finestra of FINESTRE) {
        const prima = griglia[finestra[0]];
        if (prima !== '' && finestra.every(i => griglia[i] === prima)) {
            return { vincitore: prima, celle: finestra };
        }
    }
    return null;
}

// Punteggio di una posizione dal punto di vista di "pedina", usato quando il minimax si ferma prima della fine:
// premia le file di 3 o 2 con caselle libere e le pedine nella colonna centrale, penalizza le minacce dell'avversario
function valuta(griglia, pedina) {
    const altra = avversario(pedina);
    let punteggio = 0;
    for (let riga = 0; riga < RIGHE; riga++) {
        if (griglia[indice(riga, 3)] === pedina) {
            punteggio += 3;
        }
    }
    for (const finestra of FINESTRE) {
        let mie = 0;
        let sue = 0;
        let vuote = 0;
        for (const i of finestra) {
            if (griglia[i] === pedina) mie++;
            else if (griglia[i] === altra) sue++;
            else vuote++;
        }
        if (mie === 3 && vuote === 1) punteggio += 5;
        else if (mie === 2 && vuote === 2) punteggio += 2;
        if (sue === 3 && vuote === 1) punteggio -= 4;
    }
    return punteggio;
}

// Minimax con potatura alfa-beta.
// "pedina" è il PC; "tocca" è chi muove nella posizione immaginata.
// Una vittoria vale tanto di più quanto prima arriva (profondita rimasta più alta).
function minimax(griglia, profondita, alfa, beta, tocca, pedina) {
    const quattro = quattroInFila(griglia);
    if (quattro) {
        return quattro.vincitore === pedina ? 100000 + profondita : -100000 - profondita;
    }
    if (piena(griglia)) {
        return 0;
    }
    if (profondita === 0) {
        return valuta(griglia, pedina);
    }
    const massimizza = tocca === pedina;
    let migliore = massimizza ? -Infinity : Infinity;
    for (const colonna of colonneLibere(griglia)) {
        const riga = inserisci(griglia, colonna, tocca);
        const punteggio = minimax(griglia, profondita - 1, alfa, beta, avversario(tocca), pedina);
        griglia[indice(riga, colonna)] = '';
        if (massimizza) {
            migliore = Math.max(migliore, punteggio);
            alfa = Math.max(alfa, punteggio);
        } else {
            migliore = Math.min(migliore, punteggio);
            beta = Math.min(beta, punteggio);
        }
        // l'avversario non lascerebbe mai arrivare qui: inutile provare le altre colonne
        if (alfa >= beta) {
            break;
        }
    }
    return migliore;
}

// Colonna in cui la pedina vincerebbe subito, oppure null
function colonnaVincente(griglia, pedina) {
    for (const colonna of colonneLibere(griglia)) {
        const copia = [...griglia];
        inserisci(copia, colonna, pedina);
        if (quattroInFila(copia)) {
            return colonna;
        }
    }
    return null;
}

function colonnaCasuale(griglia, casuale = Math.random) {
    const libere = colonneLibere(griglia);
    return libere[Math.floor(casuale() * libere.length)];
}

// Mossa del PC:
// - facile: a caso
// - media: vince se può, altrimenti blocca la vittoria immediata dell'avversario, altrimenti a caso
// - difficile: minimax con alfa-beta, 6 mosse in anticipo
function mossaPC(griglia, difficolta, pedina, casuale = Math.random) {
    if (difficolta === 'facile') {
        return colonnaCasuale(griglia, casuale);
    }
    const vincente = colonnaVincente(griglia, pedina);
    if (vincente !== null) {
        return vincente;
    }
    const daBloccare = colonnaVincente(griglia, avversario(pedina));
    if (difficolta === 'media') {
        return daBloccare !== null ? daBloccare : colonnaCasuale(griglia, casuale);
    }
    const copia = [...griglia];
    let migliorPunteggio = -Infinity;
    let migliorColonna = colonneLibere(copia)[0];
    for (const colonna of colonneLibere(copia)) {
        const riga = inserisci(copia, colonna, pedina);
        const punteggio = minimax(copia, 5, -Infinity, Infinity, avversario(pedina), pedina);
        copia[indice(riga, colonna)] = '';
        if (punteggio > migliorPunteggio) {
            migliorPunteggio = punteggio;
            migliorColonna = colonna;
        }
    }
    return migliorColonna;
}

if (typeof module !== 'undefined') {
    module.exports = { RIGHE, COLONNE, FINESTRE, grigliaVuota, indice, avversario, rigaLibera, colonneLibere, inserisci, piena, quattroInFila, valuta, minimax, colonnaVincente, mossaPC };
}
