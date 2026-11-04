// Logica del Ludo (Non t'arrabbiare), senza pagina (si prova con: node ludo/test-ludo.js).
// Da 2 a 4 giocatori: rosso, verde, giallo, blu. Ognuno ha 4 pedine.
// Posizione di una pedina, contata dalla propria casella di partenza:
// -1 in base; 0..50 sul percorso comune; 51..55 nella propria colonna di arrivo; 56 arrivata al centro.
// Il percorso comune ha 52 caselle; la partenza di ogni colore è spostata di 13 caselle rispetto al precedente.

const COLORI = ['rosso', 'verde', 'giallo', 'blu'];
const PARTENZA = { rosso: 0, verde: 13, giallo: 26, blu: 39 };
const PERCORSO = 52;
const ARRIVO = 56;
const ULTIMA_COMUNE = 50;
// Caselle sicure (assolute): le 4 partenze e le 4 "stelle" 8 caselle dopo ciascuna partenza
const SICURE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// Coordinate (riga, colonna) delle caselle sul tabellone 15 × 15, per la pagina
const COORD_PERCORSO = [
    [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 7], [0, 8],
    [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [7, 14], [8, 14],
    [8, 13], [8, 12], [8, 11], [8, 10], [8, 9], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], [14, 7], [14, 6],
    [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0], [7, 0], [6, 0]
];
const COORD_ARRIVO = {
    rosso: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
    verde: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
    giallo: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
    blu: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]]
};
const COORD_BASE = {
    rosso: [[2, 2], [2, 3], [3, 2], [3, 3]],
    verde: [[2, 11], [2, 12], [3, 11], [3, 12]],
    giallo: [[11, 11], [11, 12], [12, 11], [12, 12]],
    blu: [[11, 2], [11, 3], [12, 2], [12, 3]]
};

// Con 2 giocatori si usano due colori opposti
function coloriInGioco(numero) {
    if (numero === 2) return ['rosso', 'giallo'];
    if (numero === 3) return ['rosso', 'verde', 'giallo'];
    return [...COLORI];
}

function statoIniziale(numero = 4) {
    const colori = coloriInGioco(numero);
    const pedine = {};
    colori.forEach(c => { pedine[c] = [-1, -1, -1, -1]; });
    return { colori, pedine, tocca: 0, seiDiFila: 0 };
}

// Casella assoluta del percorso comune (0..51), oppure null se la pedina è in base o nella colonna di arrivo
function assoluta(colore, posizione) {
    if (posizione < 0 || posizione > ULTIMA_COMUNE) return null;
    return (PARTENZA[colore] + posizione) % PERCORSO;
}

// Mosse possibili per il colore con il dado "d": { pedina, da, a, mangia: [{ colore, pedina }] }
function mossePossibili(stato, colore, d) {
    const mosse = [];
    stato.pedine[colore].forEach((pos, k) => {
        let arrivo;
        if (pos === -1) {
            if (d !== 6) return;   // per uscire dalla base serve un 6
            arrivo = 0;
        } else if (pos === ARRIVO) {
            return;
        } else {
            arrivo = pos + d;
            if (arrivo > ARRIVO) return; // per arrivare al centro serve il numero esatto
        }
        const casella = assoluta(colore, arrivo);
        const mangia = [];
        if (casella !== null && !SICURE.has(casella)) {
            for (const altro of stato.colori) {
                if (altro === colore) continue;
                stato.pedine[altro].forEach((p, j) => {
                    if (assoluta(altro, p) === casella) mangia.push({ colore: altro, pedina: j });
                });
            }
        }
        mosse.push({ pedina: k, da: pos, a: arrivo, mangia });
    });
    return mosse;
}

function vincitore(stato) {
    return stato.colori.find(c => stato.pedine[c].every(p => p === ARRIVO)) || null;
}

// Applica il tiro "d" e la mossa scelta (o null se non si può muovere).
// Restituisce il nuovo stato: chi ha fatto 6 tira ancora, ma al terzo 6 di fila il turno passa.
function applica(stato, d, mossa) {
    const nuovo = { colori: stato.colori, pedine: {}, tocca: stato.tocca, seiDiFila: stato.seiDiFila };
    stato.colori.forEach(c => { nuovo.pedine[c] = [...stato.pedine[c]]; });
    const colore = stato.colori[stato.tocca];
    if (mossa) {
        nuovo.pedine[colore][mossa.pedina] = mossa.a;
        for (const preda of mossa.mangia) nuovo.pedine[preda.colore][preda.pedina] = -1;
    }
    const ripete = d === 6 && stato.seiDiFila < 2 && !vincitore(nuovo);
    if (ripete) {
        nuovo.seiDiFila = stato.seiDiFila + 1;
    } else {
        nuovo.seiDiFila = 0;
        nuovo.tocca = (stato.tocca + 1) % stato.colori.length;
    }
    return nuovo;
}

// Pericolo: quante pedine avversarie stanno da 1 a 6 caselle dietro una casella del percorso comune
function minacce(stato, colore, casella) {
    if (casella === null || SICURE.has(casella)) return 0;
    let n = 0;
    for (const altro of stato.colori) {
        if (altro === colore) continue;
        for (const p of stato.pedine[altro]) {
            const a = assoluta(altro, p);
            if (a === null) continue;
            const distanza = (casella - a + PERCORSO) % PERCORSO;
            if (distanza >= 1 && distanza <= 6) n++;
        }
    }
    return n;
}

// Scelta del computer: punteggio a ogni mossa possibile e si prende la migliore
function mossaPC(stato, colore, d, casuale = Math.random) {
    const mosse = mossePossibili(stato, colore, d);
    if (mosse.length === 0) return null;
    let migliore = null;
    let migliorPunteggio = -Infinity;
    for (const m of mosse) {
        let punti = 0;
        punti += 50 * m.mangia.length;                      // mangiare
        if (m.a === ARRIVO) punti += 40;                     // arrivare al centro
        if (m.da === -1) punti += 30;                        // uscire dalla base
        if (m.a > ULTIMA_COMUNE && m.da <= ULTIMA_COMUNE) punti += 25; // entrare nella colonna di arrivo (al sicuro)
        const prima = minacce(stato, colore, assoluta(colore, m.da));
        const dopo = minacce(stato, colore, assoluta(colore, m.a));
        punti += 10 * (prima - dopo);                        // allontanarsi dal pericolo
        if (SICURE.has(assoluta(colore, m.a))) punti += 8;
        punti += m.a / 10;                                   // a parità, avanza la pedina più avanti
        punti += casuale() * 0.5;                            // un pizzico di varietà
        if (punti > migliorPunteggio) { migliorPunteggio = punti; migliore = m; }
    }
    return migliore;
}

function tiraDado(casuale = Math.random) {
    return 1 + Math.floor(casuale() * 6);
}

if (typeof module !== 'undefined') {
    module.exports = { COLORI, PARTENZA, PERCORSO, ARRIVO, SICURE, COORD_PERCORSO, COORD_ARRIVO, COORD_BASE, coloriInGioco, statoIniziale, assoluta, mossePossibili, vincitore, applica, minacce, mossaPC, tiraDado };
}
