// Logica del Filetto (o Mulino a 9 pedine), senza pagina (si prova con: node filetto/test-filetto.js).
// Il tavoliere ha 24 punti su tre quadrati concentrici, numerati così:
//
//  0-----------1-----------2
//  |           |           |
//  |   3-------4-------5   |
//  |   |       |       |   |
//  |   |   6---7---8   |   |
//  |   |   |       |   |   |
//  9--10--11      12--13--14
//  |   |   |       |   |   |
//  |   |  15--16--17   |   |
//  |   |       |       |   |
//  |  18------19------20   |
//  |           |           |
// 21----------22----------23
//
// Lo stato è { punti: array di 24 ('' | 'B' | 'N'), daPiazzare: { B, N }, tocca }.

const VICINI = [
    [1, 9], [0, 2, 4], [1, 14],
    [4, 10], [1, 3, 5, 7], [4, 13],
    [7, 11], [4, 6, 8], [7, 12],
    [0, 10, 21], [3, 9, 11, 18], [6, 10, 15], [8, 13, 17], [5, 12, 14, 20], [2, 13, 23],
    [11, 16], [15, 17, 19], [12, 16],
    [10, 19], [16, 18, 20, 22], [13, 19],
    [9, 22], [19, 21, 23], [14, 22]
];

const MULINI = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13, 14], [15, 16, 17], [18, 19, 20], [21, 22, 23],
    [0, 9, 21], [3, 10, 18], [6, 11, 15], [1, 4, 7], [16, 19, 22], [8, 12, 17], [5, 13, 20], [2, 14, 23]
];

// Posizione dei punti sul disegno (in percentuale), per la pagina
const COORDINATE = [
    [0, 0], [50, 0], [100, 0],
    [16.67, 16.67], [50, 16.67], [83.33, 16.67],
    [33.33, 33.33], [50, 33.33], [66.67, 33.33],
    [0, 50], [16.67, 50], [33.33, 50], [66.67, 50], [83.33, 50], [100, 50],
    [33.33, 66.67], [50, 66.67], [66.67, 66.67],
    [16.67, 83.33], [50, 83.33], [83.33, 83.33],
    [0, 100], [50, 100], [100, 100]
];

const PEDINE = 9;

function avversario(g) {
    return g === 'B' ? 'N' : 'B';
}

function statoIniziale() {
    return { punti: new Array(24).fill(''), daPiazzare: { B: PEDINE, N: PEDINE }, tocca: 'B' };
}

function contaPedine(stato, g) {
    return stato.punti.filter(p => p === g).length;
}

// Fase del giocatore: 'piazza' finché ha pedine in mano, poi 'muovi', oppure 'vola' con sole 3 pedine
function fase(stato, g) {
    if (stato.daPiazzare[g] > 0) return 'piazza';
    return contaPedine(stato, g) === 3 ? 'vola' : 'muovi';
}

// La pedina nel punto "p" fa parte di un mulino?
function inMulino(punti, p) {
    const g = punti[p];
    if (!g) return false;
    return MULINI.some(m => m.includes(p) && m.every(q => punti[q] === g));
}

// Pedine dell'avversario che si possono togliere: quelle fuori dai mulini; se sono tutte in mulino, tutte
function rimovibili(punti, g) {
    const sue = punti.map((p, i) => (p === g ? i : -1)).filter(i => i >= 0);
    const libere = sue.filter(i => !inMulino(punti, i));
    return libere.length > 0 ? libere : sue;
}

// Tutte le mosse legali di chi deve giocare: { da, a, rimuovi }
// da = null quando si piazza; rimuovi = punto da togliere all'avversario (o null se non si fa mulino)
function mosseLegali(stato) {
    const g = stato.tocca;
    const f = fase(stato, g);
    const spostamenti = [];
    const vuoti = stato.punti.map((p, i) => (p === '' ? i : -1)).filter(i => i >= 0);
    if (f === 'piazza') {
        vuoti.forEach(a => spostamenti.push({ da: null, a }));
    } else {
        stato.punti.forEach((p, da) => {
            if (p !== g) return;
            const arrivi = f === 'vola' ? vuoti : VICINI[da].filter(a => stato.punti[a] === '');
            arrivi.forEach(a => spostamenti.push({ da, a }));
        });
    }
    const mosse = [];
    for (const sp of spostamenti) {
        const punti = [...stato.punti];
        if (sp.da !== null) punti[sp.da] = '';
        punti[sp.a] = g;
        if (inMulino(punti, sp.a)) {
            rimovibili(punti, avversario(g)).forEach(r => mosse.push({ ...sp, rimuovi: r }));
        } else {
            mosse.push({ ...sp, rimuovi: null });
        }
    }
    return mosse;
}

// Applica una mossa e restituisce il nuovo stato (quello passato non cambia)
function applica(stato, mossa) {
    const g = stato.tocca;
    const punti = [...stato.punti];
    const daPiazzare = { ...stato.daPiazzare };
    if (mossa.da === null) {
        daPiazzare[g]--;
    } else {
        punti[mossa.da] = '';
    }
    punti[mossa.a] = g;
    if (mossa.rimuovi !== null && mossa.rimuovi !== undefined) {
        punti[mossa.rimuovi] = '';
    }
    return { punti, daPiazzare, tocca: avversario(g) };
}

// Perde chi (finito il piazzamento) ha meno di 3 pedine, oppure chi deve muovere e non può
function vincitore(stato) {
    for (const g of ['B', 'N']) {
        if (stato.daPiazzare[g] === 0 && contaPedine(stato, g) < 3) return avversario(g);
    }
    if (mosseLegali(stato).length === 0) return avversario(stato.tocca);
    return null;
}

// Valutazione per il PC: pedine (in tavola e in mano), mulini formati, mobilità, "quasi mulini"
function valuta(stato, g) {
    const altro = avversario(g);
    const pedine = x => contaPedine(stato, x) + stato.daPiazzare[x];
    let punteggio = 30 * (pedine(g) - pedine(altro));
    for (const m of MULINI) {
        const mie = m.filter(p => stato.punti[p] === g).length;
        const sue = m.filter(p => stato.punti[p] === altro).length;
        const vuote = 3 - mie - sue;
        if (mie === 3) punteggio += 8;
        if (sue === 3) punteggio -= 8;
        if (mie === 2 && vuote === 1) punteggio += 4;
        if (sue === 2 && vuote === 1) punteggio -= 5;
    }
    const mobilita = x => stato.punti.reduce((tot, p, i) => tot + (p === x ? VICINI[i].filter(v => stato.punti[v] === '').length : 0), 0);
    punteggio += mobilita(g) - mobilita(altro);
    return punteggio;
}

function minimax(stato, profondita, alfa, beta, giocatore) {
    const vince = vincitore(stato);
    if (vince) return vince === giocatore ? 100000 + profondita : -100000 - profondita;
    if (profondita === 0) return valuta(stato, giocatore);
    const massimizza = stato.tocca === giocatore;
    let migliore = massimizza ? -Infinity : Infinity;
    for (const m of mosseLegali(stato)) {
        const v = minimax(applica(stato, m), profondita - 1, alfa, beta, giocatore);
        if (massimizza) { migliore = Math.max(migliore, v); alfa = Math.max(alfa, v); }
        else { migliore = Math.min(migliore, v); beta = Math.min(beta, v); }
        if (alfa >= beta) break;
    }
    return migliore;
}

const PROFONDITA = { facile: 0, media: 2, difficile: 4 };

function mossaPC(stato, difficolta = 'media', casuale = Math.random) {
    const mosse = mosseLegali(stato);
    if (mosse.length === 0) return null;
    const profondita = PROFONDITA[difficolta] ?? 2;
    if (profondita === 0) return mosse[Math.floor(casuale() * mosse.length)];
    const g = stato.tocca;
    let migliorValore = -Infinity;
    let migliori = [];
    for (const m of mosse) {
        const v = minimax(applica(stato, m), profondita - 1, -Infinity, Infinity, g);
        if (v > migliorValore) { migliorValore = v; migliori = [m]; }
        else if (v === migliorValore) migliori.push(m);
    }
    return migliori[Math.floor(casuale() * migliori.length)];
}

if (typeof module !== 'undefined') {
    module.exports = { VICINI, MULINI, COORDINATE, PEDINE, avversario, statoIniziale, contaPedine, fase, inMulino, rimovibili, mosseLegali, applica, vincitore, valuta, mossaPC };
}
