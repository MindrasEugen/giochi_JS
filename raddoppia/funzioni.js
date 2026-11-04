// Logica di Raddoppia (gioco di tessere che si sommano, genere "2048": ADR 0009).
// La griglia è un array di 16 numeri (4 righe × 4 colonne, riga 0 in alto); 0 vuol dire casella vuota.
// Si prova con Node: node raddoppia/test-raddoppia.js

const LATO = 4;
const OBIETTIVO = 2048;

function grigliaVuota() {
    return new Array(LATO * LATO).fill(0);
}

// Generatore casuale ripetibile (mulberry32): con lo stesso "seme" dà sempre la stessa sequenza.
// Serve alla sfida a 2 giocatori, perché tutti e due ricevano le tessere nello stesso ordine.
function generatore(seme) {
    let s = seme >>> 0;
    return function () {
        s = (s + 0x6D2B79F5) >>> 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Fa scorrere una riga verso sinistra: prima si tolgono i vuoti, poi due tessere uguali vicine
// si uniscono una sola volta (2 2 2 2 diventa 4 4, non 8). Restituisce la riga nuova, i punti
// guadagnati (la somma delle tessere create) e le posizioni delle tessere nate da un'unione.
function scorriRiga(riga) {
    const piene = riga.filter(n => n !== 0);
    const risultato = [];
    const unite = [];
    let punti = 0;
    for (let i = 0; i < piene.length; i++) {
        if (i + 1 < piene.length && piene[i] === piene[i + 1]) {
            const somma = piene[i] * 2;
            unite.push(risultato.length);
            risultato.push(somma);
            punti += somma;
            i++;
        } else {
            risultato.push(piene[i]);
        }
    }
    while (risultato.length < riga.length) {
        risultato.push(0);
    }
    return { riga: risultato, punti, unite };
}

// Indici delle 4 righe da far scorrere "verso l'inizio" per ogni direzione
function linee(direzione) {
    const lista = [];
    for (let k = 0; k < LATO; k++) {
        const linea = [];
        for (let j = 0; j < LATO; j++) {
            if (direzione === 'sinistra') linea.push(k * LATO + j);
            if (direzione === 'destra') linea.push(k * LATO + (LATO - 1 - j));
            if (direzione === 'su') linea.push(j * LATO + k);
            if (direzione === 'giu') linea.push((LATO - 1 - j) * LATO + k);
        }
        lista.push(linea);
    }
    return lista;
}

// Muove tutte le tessere in una direzione ('sinistra', 'destra', 'su', 'giu').
// Non cambia la griglia passata: restituisce { griglia, punti, mosso, unite }.
function muovi(griglia, direzione) {
    const nuova = [...griglia];
    let punti = 0;
    const unite = [];
    for (const linea of linee(direzione)) {
        const esito = scorriRiga(linea.map(i => griglia[i]));
        esito.riga.forEach((valore, j) => { nuova[linea[j]] = valore; });
        esito.unite.forEach(j => unite.push(linea[j]));
        punti += esito.punti;
    }
    const mosso = nuova.some((valore, i) => valore !== griglia[i]);
    return { griglia: nuova, punti, mosso, unite };
}

// Mette un 2 (9 volte su 10) o un 4 in una casella vuota a caso; la griglia cambia.
// Restituisce l'indice della casella, oppure -1 se la griglia è piena.
function aggiungiTessera(griglia, casuale = Math.random) {
    const vuote = [];
    griglia.forEach((valore, i) => { if (valore === 0) vuote.push(i); });
    if (vuote.length === 0) {
        return -1;
    }
    const i = vuote[Math.floor(casuale() * vuote.length)];
    griglia[i] = casuale() < 0.9 ? 2 : 4;
    return i;
}

// Si può ancora muovere se c'è una casella vuota o due tessere uguali vicine
function puoMuovere(griglia) {
    return ['sinistra', 'destra', 'su', 'giu'].some(d => muovi(griglia, d).mosso);
}

function haObiettivo(griglia) {
    return griglia.some(valore => valore >= OBIETTIVO);
}

if (typeof module !== 'undefined') {
    module.exports = { LATO, OBIETTIVO, grigliaVuota, generatore, scorriRiga, muovi, aggiungiTessera, puoMuovere, haObiettivo };
}
