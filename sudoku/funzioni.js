// Logica del Sudoku, senza pagina (si prova con: node sudoku/test-sudoku.js).
// La griglia è un array di 81 numeri (9 righe × 9 colonne); 0 vuol dire casella vuota.

// Numeri di partenza (indizi) per ogni difficoltà: meno indizi, più difficile
const DIFFICOLTA = { facile: 40, medio: 32, difficile: 26 };

function riga(i) { return Math.floor(i / 9); }
function colonna(i) { return i % 9; }
function riquadro(i) { return Math.floor(riga(i) / 3) * 3 + Math.floor(colonna(i) / 3); }

// Per ogni casella, le 20 caselle "collegate": stessa riga, stessa colonna o stesso riquadro 3×3
const COLLEGATE = (() => {
    const lista = [];
    for (let i = 0; i < 81; i++) {
        const insieme = [];
        for (let j = 0; j < 81; j++) {
            if (j !== i && (riga(j) === riga(i) || colonna(j) === colonna(i) || riquadro(j) === riquadro(i))) {
                insieme.push(j);
            }
        }
        lista.push(insieme);
    }
    return lista;
})();

// Numeri che si possono mettere nella casella senza ripeterne uno della riga, della colonna o del riquadro
function candidati(griglia, i) {
    const usati = new Set(COLLEGATE[i].map(j => griglia[j]));
    const lista = [];
    for (let n = 1; n <= 9; n++) {
        if (!usati.has(n)) lista.push(n);
    }
    return lista;
}

// Caselle in conflitto: lo stesso numero due volte nella stessa riga, colonna o riquadro
function conflitti(griglia) {
    const sbagliate = new Set();
    for (let i = 0; i < 81; i++) {
        if (griglia[i] !== 0 && COLLEGATE[i].some(j => griglia[j] === griglia[i])) {
            sbagliate.add(i);
        }
    }
    return sbagliate;
}

// Casella vuota con meno candidati (così il backtracking prova meno strade), oppure null se è tutto pieno
function casellaPiuVincolata(griglia) {
    let migliore = null;
    let migliori = null;
    for (let i = 0; i < 81; i++) {
        if (griglia[i] === 0) {
            const c = candidati(griglia, i);
            if (migliori === null || c.length < migliori.length) {
                migliore = i;
                migliori = c;
                if (c.length <= 1) break;
            }
        }
    }
    return migliore === null ? null : { indice: migliore, candidati: migliori };
}

// Conta le soluzioni fino a "limite" (per sapere se una è unica basta fermarsi a 2)
function contaSoluzioni(griglia, limite = 2) {
    const g = [...griglia];
    let trovate = 0;
    function prova() {
        const scelta = casellaPiuVincolata(g);
        if (scelta === null) {
            trovate++;
            return trovate >= limite;
        }
        for (const n of scelta.candidati) {
            g[scelta.indice] = n;
            if (prova()) return true;
        }
        g[scelta.indice] = 0;
        return false;
    }
    if (conflitti(g).size === 0) {
        prova();
    }
    return trovate;
}

// Restituisce una soluzione (array di 81 numeri) oppure null.
// Con "casuale" i candidati vengono provati in ordine casuale: serve a generare griglie diverse.
function risolvi(griglia, casuale = null) {
    const g = [...griglia];
    function prova() {
        const scelta = casellaPiuVincolata(g);
        if (scelta === null) return true;
        const ordine = casuale ? mescola(scelta.candidati, casuale) : scelta.candidati;
        for (const n of ordine) {
            g[scelta.indice] = n;
            if (prova()) return true;
        }
        g[scelta.indice] = 0;
        return false;
    }
    if (conflitti(g).size > 0) return null;
    return prova() ? g : null;
}

function mescola(elementi, casuale = Math.random) {
    const copia = [...elementi];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(casuale() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

// Genera un sudoku con una sola soluzione:
// 1) si riempie una griglia completa a caso;
// 2) si tolgono numeri in ordine casuale, rimettendo quelli la cui rimozione crea una seconda soluzione,
//    finché si arriva al numero di indizi della difficoltà (o non se ne possono togliere altri).
function genera(difficolta = 'medio', casuale = Math.random) {
    const soluzione = risolvi(new Array(81).fill(0), casuale);
    const puzzle = [...soluzione];
    const obiettivo = DIFFICOLTA[difficolta] ?? DIFFICOLTA.medio;
    let indizi = 81;
    for (const i of mescola([...Array(81).keys()], casuale)) {
        if (indizi <= obiettivo) break;
        const valore = puzzle[i];
        puzzle[i] = 0;
        if (contaSoluzioni(puzzle, 2) === 1) {
            indizi--;
        } else {
            puzzle[i] = valore;
        }
    }
    return { puzzle, soluzione };
}

function completo(griglia) {
    return griglia.every(n => n !== 0) && conflitti(griglia).size === 0;
}

if (typeof module !== 'undefined') {
    module.exports = { DIFFICOLTA, riga, colonna, riquadro, COLLEGATE, candidati, conflitti, contaSoluzioni, risolvi, genera, completo };
}
