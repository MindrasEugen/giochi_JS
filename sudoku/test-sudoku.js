// Prova della logica del Sudoku. Si avvia dalla radice del progetto con:  node sudoku/test-sudoku.js

const S = require('./funzioni.js');

let falliti = 0;
function controlla(descrizione, condizione) {
    console.log(`${condizione ? 'OK  ' : 'FAIL'} ${descrizione}`);
    if (!condizione) falliti++;
}
const leggi = testo => testo.replace(/\s/g, '').split('').map(c => (c === '.' ? 0 : Number(c)));

// Risolutore indipendente, scritto in modo diverso da quello del gioco:
// riempie le caselle nell'ordine (da 0 a 80) e controlla le regole a mano. Conta fino a 2 soluzioni.
function contaIndipendente(griglia) {
    const g = [...griglia];
    let trovate = 0;
    function valido(i, n) {
        const r = Math.floor(i / 9), c = i % 9;
        for (let k = 0; k < 9; k++) {
            if (g[r * 9 + k] === n || g[k * 9 + c] === n) return false;
        }
        const r0 = r - (r % 3), c0 = c - (c % 3);
        for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) if (g[(r0 + a) * 9 + c0 + b] === n) return false;
        return true;
    }
    function prova(i) {
        if (trovate >= 2) return;
        if (i === 81) { trovate++; return; }
        if (g[i] !== 0) { prova(i + 1); return; }
        for (let n = 1; n <= 9; n++) {
            if (valido(i, n)) { g[i] = n; prova(i + 1); g[i] = 0; }
        }
    }
    prova(0);
    return trovate;
}

function grigliaValida(g) {
    const gruppi = [];
    for (let k = 0; k < 9; k++) {
        gruppi.push([...Array(9).keys()].map(j => k * 9 + j));
        gruppi.push([...Array(9).keys()].map(j => j * 9 + k));
        gruppi.push([...Array(9).keys()].map(j => (Math.floor(k / 3) * 3 + Math.floor(j / 3)) * 9 + (k % 3) * 3 + (j % 3)));
    }
    return g.length === 81 && gruppi.every(gr => new Set(gr.map(i => g[i])).size === 9 && gr.every(i => g[i] >= 1 && g[i] <= 9));
}

controlla('ogni casella ha 20 caselle collegate', S.COLLEGATE.every(l => l.length === 20));

// Un sudoku noto, molto difficile (soluzione unica)
const difficile = leggi(`
8........ ..36..... .7..9.2..
.5...7... ....457.. ...1...3.
..1....68 ..85...1. .9....4..`);
const soluzione = S.risolvi(difficile);
controlla('risolve un sudoku noto molto difficile', grigliaValida(soluzione) && difficile.every((n, i) => n === 0 || n === soluzione[i]));
controlla('il sudoku noto ha una sola soluzione (risolutore del gioco e risolutore indipendente)', S.contaSoluzioni(difficile) === 1 && contaIndipendente(difficile) === 1);
const dueSoluzioni = [...difficile];
dueSoluzioni[0] = 0;
controlla('togliendo un indizio le soluzioni diventano più di una', S.contaSoluzioni(dueSoluzioni) === 2);

// Conflitti e candidati
const conConflitto = new Array(81).fill(0);
conConflitto[0] = 5;
conConflitto[8] = 5;
controlla('conflitto nella stessa riga', S.conflitti(conConflitto).has(0) && S.conflitti(conConflitto).has(8));
controlla('griglia con conflitto: nessuna soluzione', S.risolvi(conConflitto) === null && S.contaSoluzioni(conConflitto) === 0);
controlla('candidati: il 5 non c’è nella casella 4 (stessa riga)', !S.candidati(conConflitto, 4).includes(5));

// Sudoku generati
for (const [nome, indizi] of Object.entries(S.DIFFICOLTA)) {
    let tuttiUnici = true;
    let tutteValide = true;
    let indiziVeri = [];
    const inizio = Date.now();
    for (let k = 0; k < 5; k++) {
        const { puzzle, soluzione: sol } = S.genera(nome);
        indiziVeri.push(puzzle.filter(n => n !== 0).length);
        if (contaIndipendente(puzzle) !== 1) tuttiUnici = false;
        if (!grigliaValida(sol) || puzzle.some((n, i) => n !== 0 && n !== sol[i])) tutteValide = false;
    }
    const tempo = Date.now() - inizio;
    controlla(`${nome}: 5 sudoku generati, soluzione unica secondo il risolutore indipendente`, tuttiUnici);
    controlla(`${nome}: soluzioni valide e coerenti con gli indizi`, tutteValide);
    controlla(`${nome}: indizi ${indiziVeri.join(', ')} (obiettivo ${indizi}, tempo medio ${Math.round(tempo / 5)} ms)`, indiziVeri.every(n => n >= indizi && n <= indizi + 6) && tempo / 5 < 1500);
}

controlla('completo: la soluzione è completa, il sudoku di partenza no', S.completo(soluzione) && !S.completo(difficile));

console.log(falliti === 0 ? '\nTutti i controlli sono passati' : `\n${falliti} controlli falliti`);
process.exit(falliti === 0 ? 0 : 1);
