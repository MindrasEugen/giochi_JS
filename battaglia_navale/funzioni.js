// Logica della Battaglia navale, senza pagina (si prova con: node battaglia_navale/test-battaglia.js).
// Ogni giocatore ha una "flotta" su una griglia 10 × 10 (indice = riga * 10 + colonna):
// { navi: [{ nome, lunghezza, celle: [indici], colpite: Set }], colpi: Map(indice -> 'acqua' | 'colpito') }
// Le navi non possono sovrapporsi né toccarsi, nemmeno in diagonale.

const LATO = 10;
const NAVI = [
    { nome: 'Portaerei', lunghezza: 5 },
    { nome: 'Corazzata', lunghezza: 4 },
    { nome: 'Incrociatore', lunghezza: 3 },
    { nome: 'Sottomarino', lunghezza: 3 },
    { nome: 'Cacciatorpediniere', lunghezza: 2 }
];

function intorno(i) {
    const r = Math.floor(i / LATO), c = i % LATO;
    const lista = [];
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            const rr = r + dr, cc = c + dc;
            if ((dr || dc) && rr >= 0 && rr < LATO && cc >= 0 && cc < LATO) lista.push(rr * LATO + cc);
        }
    }
    return lista;
}

// Caselle occupate da una nave che parte da "inizio" (orizzontale o verticale), oppure null se esce dalla griglia
function celleNave(inizio, lunghezza, orizzontale) {
    const r = Math.floor(inizio / LATO), c = inizio % LATO;
    if (orizzontale && c + lunghezza > LATO) return null;
    if (!orizzontale && r + lunghezza > LATO) return null;
    return [...Array(lunghezza).keys()].map(k => (orizzontale ? inizio + k : inizio + k * LATO));
}

// La nave si può mettere lì? Non deve sovrapporsi né toccare le navi già messe
function posizioneValida(navi, celle) {
    if (!celle) return false;
    const vietate = new Set();
    for (const nave of navi) {
        for (const i of nave.celle) {
            vietate.add(i);
            intorno(i).forEach(v => vietate.add(v));
        }
    }
    return celle.every(i => !vietate.has(i));
}

function creaNave(modello, celle) {
    return { nome: modello.nome, lunghezza: modello.lunghezza, celle, colpite: new Set() };
}

function flottaVuota() {
    return { navi: [], colpi: new Map() };
}

// Dispone tutte le navi a caso (riprova finché trova una disposizione valida)
function disponiACaso(casuale = Math.random) {
    for (let tentativo = 0; tentativo < 1000; tentativo++) {
        const navi = [];
        let riuscito = true;
        for (const modello of NAVI) {
            let messa = false;
            for (let k = 0; k < 200 && !messa; k++) {
                const orizzontale = casuale() < 0.5;
                const celle = celleNave(Math.floor(casuale() * LATO * LATO), modello.lunghezza, orizzontale);
                if (posizioneValida(navi, celle)) {
                    navi.push(creaNave(modello, celle));
                    messa = true;
                }
            }
            if (!messa) { riuscito = false; break; }
        }
        if (riuscito) return { navi, colpi: new Map() };
    }
    throw new Error('impossibile disporre le navi');
}

function naveIn(flotta, i) {
    return flotta.navi.find(n => n.celle.includes(i)) || null;
}

function affondata(nave) {
    return nave.colpite.size === nave.lunghezza;
}

// Spara nella casella i della flotta avversaria.
// Restituisce { esito: 'acqua' | 'colpito' | 'affondato' | 'ripetuto', nave }
function spara(flotta, i) {
    if (flotta.colpi.has(i)) return { esito: 'ripetuto', nave: null };
    const nave = naveIn(flotta, i);
    if (!nave) {
        flotta.colpi.set(i, 'acqua');
        return { esito: 'acqua', nave: null };
    }
    nave.colpite.add(i);
    flotta.colpi.set(i, 'colpito');
    return { esito: affondata(nave) ? 'affondato' : 'colpito', nave };
}

function tutteAffondate(flotta) {
    return flotta.navi.length > 0 && flotta.navi.every(affondata);
}

// Caselle in cui non può esserci una nave: l'acqua già trovata e il contorno delle navi affondate
function celleEscluse(flotta) {
    const escluse = new Set();
    for (const [i, esito] of flotta.colpi) {
        if (esito === 'acqua') escluse.add(i);
    }
    for (const nave of flotta.navi) {
        if (affondata(nave)) nave.celle.forEach(i => intorno(i).forEach(v => escluse.add(v)));
    }
    return escluse;
}

// Colpo del PC sulla flotta del giocatore.
// - facile: a caso tra le caselle non ancora colpite
// - normale: se ha colpito una nave non ancora affondata la "insegue" (prima le caselle vicine,
//   poi lungo la linea dei colpi); altrimenti spara a scacchiera (ogni nave copre almeno una casella nera),
//   evitando le caselle che non possono contenere navi
function mossaPC(flotta, difficolta = 'normale', casuale = Math.random) {
    const libere = [...Array(LATO * LATO).keys()].filter(i => !flotta.colpi.has(i));
    if (difficolta === 'facile') return libere[Math.floor(casuale() * libere.length)];
    const escluse = celleEscluse(flotta);
    const utili = libere.filter(i => !escluse.has(i));
    // colpi su navi non ancora affondate
    const aperti = [...flotta.colpi].filter(([i, e]) => e === 'colpito' && !affondata(naveIn(flotta, i))).map(([i]) => i);
    if (aperti.length > 0) {
        let candidati = [];
        if (aperti.length >= 2) {
            // i colpi sono in fila: si prosegue alle due estremità della linea
            const stessaRiga = aperti.every(i => Math.floor(i / LATO) === Math.floor(aperti[0] / LATO));
            const ordinati = [...aperti].sort((a, b) => a - b);
            const passo = stessaRiga ? 1 : LATO;
            const primo = ordinati[0] - passo;
            const ultimo = ordinati[ordinati.length - 1] + passo;
            const validoInLinea = j => j >= 0 && j < LATO * LATO && (!stessaRiga || Math.floor(j / LATO) === Math.floor(aperti[0] / LATO));
            candidati = [primo, ultimo].filter(j => validoInLinea(j) && utili.includes(j));
        }
        if (candidati.length === 0) {
            for (const i of aperti) {
                const r = Math.floor(i / LATO), c = i % LATO;
                const vicini = [];
                if (r > 0) vicini.push(i - LATO);
                if (r < LATO - 1) vicini.push(i + LATO);
                if (c > 0) vicini.push(i - 1);
                if (c < LATO - 1) vicini.push(i + 1);
                vicini.filter(v => utili.includes(v)).forEach(v => candidati.push(v));
            }
        }
        if (candidati.length > 0) return candidati[Math.floor(casuale() * candidati.length)];
    }
    const scacchiera = utili.filter(i => (Math.floor(i / LATO) + (i % LATO)) % 2 === 0);
    const tra = scacchiera.length > 0 ? scacchiera : (utili.length > 0 ? utili : libere);
    return tra[Math.floor(casuale() * tra.length)];
}

if (typeof module !== 'undefined') {
    module.exports = { LATO, NAVI, intorno, celleNave, posizioneValida, creaNave, flottaVuota, disponiACaso, naveIn, affondata, spara, tutteAffondate, celleEscluse, mossaPC };
}
