// Prova della logica del Serpente. Si avvia dalla radice del progetto con:  node serpente/test-serpente.js

const S = require('./funzioni.js');

let falliti = 0;
function controlla(descrizione, condizione) {
    console.log(`${condizione ? 'OK  ' : 'FAIL'} ${descrizione}`);
    if (!condizione) falliti++;
}

function stato(serpenti, cibo) {
    return { serpenti, cibo, finita: false };
}

const uno = S.statoIniziale(1);
controlla('1 giocatore: un serpente di 3 caselle che va a destra, cibo in una casella libera', uno.serpenti.length === 1 && uno.serpenti[0].corpo.length === 3 && uno.serpenti[0].direzione === 'destra' && uno.cibo !== null && !S.occupata(uno, uno.cibo.x, uno.cibo.y));

// Movimento
const s1 = stato([S.creaSerpente(5, 5, 'destra')], { x: 15, y: 15 });
S.passo(s1);
controlla('un passo a destra: la testa avanza di 1, la lunghezza resta 3', s1.serpenti[0].corpo[0].x === 6 && s1.serpenti[0].corpo.length === 3);
controlla('non si può tornare indietro (inversione ignorata)', !S.gira(s1.serpenti[0], 'sinistra') && s1.serpenti[0].prossima === 'destra');
controlla('si può girare di lato', S.gira(s1.serpenti[0], 'giu'));
S.passo(s1);
controlla('dopo la svolta la testa scende', s1.serpenti[0].corpo[0].x === 6 && s1.serpenti[0].corpo[0].y === 6);

// Doppia svolta veloce: su e poi sinistra prima del passo non deve far girare su sé stesso
const veloce = stato([S.creaSerpente(5, 5, 'destra')], { x: 15, y: 15 });
S.gira(veloce.serpenti[0], 'su');
controlla('due svolte nello stesso passo: la seconda (opposta alla direzione attuale) viene ignorata', !S.gira(veloce.serpenti[0], 'sinistra') && veloce.serpenti[0].prossima === 'su');

// Cibo e crescita
const mangia = stato([S.creaSerpente(5, 5, 'destra')], { x: 6, y: 5 });
const ev = S.passo(mangia);
controlla('mangiare: evento, +1 punto, nuovo cibo altrove', ev.some(e => e.tipo === 'mangia') && mangia.serpenti[0].punti === 1 && !(mangia.cibo.x === 6 && mangia.cibo.y === 5));
S.passo(mangia); S.passo(mangia);
controlla('dopo aver mangiato il serpente cresce di 2 (da 3 a 5)', mangia.serpenti[0].corpo.length === 5);

// Muro
const muro = stato([S.creaSerpente(19, 5, 'destra')], { x: 10, y: 10 });
S.passo(muro);
controlla('muro a destra: si rientra da sinistra (x 19 -> 0) senza morire', muro.serpenti[0].vivo && !muro.finita && muro.serpenti[0].corpo[0].x === 0 && muro.serpenti[0].corpo[0].y === 5);
const bordi = [['sinistra', 0, 7, 19, 7], ['su', 7, 0, 7, 19], ['giu', 7, 19, 7, 0]];
controlla('anche a sinistra, in alto e in basso si attraversa il bordo', bordi.every(([dir, x, y, nx, ny]) => {
    const st = stato([S.creaSerpente(x, y, dir)], { x: 10, y: 10 });
    S.passo(st);
    return st.serpenti[0].vivo && st.serpenti[0].corpo[0].x === nx && st.serpenti[0].corpo[0].y === ny;
}));
const ciboOltre = stato([S.creaSerpente(19, 3, 'destra')], { x: 0, y: 3 });
controlla('il cibo subito oltre il bordo si mangia', S.passo(ciboOltre).some(e => e.tipo === 'mangia'));
const morsoOltre = stato([{ corpo: [{ x: 19, y: 4 }, { x: 19, y: 5 }, { x: 0, y: 5 }, { x: 0, y: 4 }, { x: 0, y: 3 }], direzione: 'su', prossima: 'su', vivo: true, punti: 0, daCrescere: 0 }], { x: 10, y: 10 });
S.gira(morsoOltre.serpenti[0], 'destra');
S.passo(morsoOltre);
controlla('mordersi la coda attraverso il bordo fa morire', !morsoOltre.serpenti[0].vivo && morsoOltre.finita);

// Sé stesso
const lungo = S.creaSerpente(10, 10, 'destra', 6);
const se = stato([lungo], { x: 0, y: 0 });
S.gira(lungo, 'giu'); S.passo(se);
S.gira(lungo, 'sinistra'); S.passo(se);
S.gira(lungo, 'su'); S.passo(se);
controlla('girando su sé stesso il serpente lungo si morde e muore', !lungo.vivo);
// Seguire la propria coda è permesso (la coda si sposta nello stesso passo)
const quadrato = { corpo: [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 6, y: 5 }], direzione: 'su', prossima: 'destra', vivo: true, punti: 0, daCrescere: 0 };
const coda = stato([quadrato], { x: 0, y: 0 });
S.passo(coda);
controlla('entrare nella casella che la coda sta lasciando è permesso', quadrato.vivo);

// Due giocatori
const due = S.statoIniziale(2);
controlla('2 giocatori: due serpenti su lati opposti', due.serpenti.length === 2 && due.serpenti[0].direzione === 'destra' && due.serpenti[1].direzione === 'sinistra');
const scontro = stato([S.creaSerpente(5, 5, 'destra'), S.creaSerpente(7, 5, 'sinistra')], { x: 0, y: 0 });
S.passo(scontro);
controlla('due teste nella stessa casella: muoiono entrambi, partita finita', !scontro.serpenti[0].vivo && !scontro.serpenti[1].vivo && scontro.finita);
// il secondo serpente va a sinistra con il corpo che passa da 5,5: la testa del primo ci entra
const contro = stato([S.creaSerpente(5, 4, 'giu'), S.creaSerpente(4, 5, 'sinistra', 5)], { x: 0, y: 0 });
S.passo(contro);
controlla('la testa che entra nel corpo dell’altro: muore solo lei', !contro.serpenti[0].vivo && contro.serpenti[1].vivo && contro.finita);

// Ultimo cibo su un percorso continuo che occupa tutta la griglia.
const percorso = [];
for (let y = 0; y < S.LATO; y++) {
    for (let k = 0; k < S.LATO; k++) percorso.push({ x: y % 2 ? S.LATO - 1 - k : k, y });
}
const quasiPieno = S.creaSerpente(1, 0, 'sinistra');
quasiPieno.corpo = percorso.slice(1);
const pieno = stato([quasiPieno], percorso[0]);
const eventiPieno = S.passo(pieno);
controlla('ultimo cibo: griglia piena e partita conclusa con serpente vivo', pieno.finita && quasiPieno.vivo && quasiPieno.corpo.length === 400 && pieno.cibo === null && eventiPieno.some(e => e.tipo === 'grigliaPiena'));
const prima = JSON.stringify(pieno);
controlla('una partita conclusa non avanza', S.passo(pieno).length === 0 && JSON.stringify(pieno) === prima);

// Velocità e partite casuali
controlla('più punti, passo più veloce (da 160 ms fino a 70 ms)', S.intervallo(0) === 160 && S.intervallo(10) === 120 && S.intervallo(100) === 70);
let tutteFinite = true;
let ciboSempreLibero = true;
// Numeri casuali ripetibili (seme diverso per ogni partita): con i muri attraversabili la fine dipende dal caso
function casualeRipetibile(seme) {
    let x = seme;
    return () => (x = (x * 48271) % 2147483647) / 2147483647; // Park-Miller: prodotti esatti in JavaScript
}
for (let k = 0; k < 200; k++) {
    const casuale = casualeRipetibile(k + 1);
    const st = S.statoIniziale(k % 2 === 0 ? 1 : 2, casuale);
    const nomi = Object.keys(S.DIREZIONI);
    let passi = 0;
    while (!st.finita && passi < 5000) {
        st.serpenti.forEach(s => S.gira(s, nomi[Math.floor(casuale() * 4)]));
        S.passo(st, casuale);
        if (st.cibo && st.serpenti.some(s => s.vivo && s.corpo.some(p => p.x === st.cibo.x && p.y === st.cibo.y))) ciboSempreLibero = false;
        passi++;
    }
    if (!st.finita) tutteFinite = false;
}
controlla('200 partite con mosse a caso: finiscono tutte', tutteFinite);
controlla('il cibo non compare mai sopra un serpente', ciboSempreLibero);

console.log(falliti === 0 ? '\nTutti i controlli sono passati' : `\n${falliti} controlli falliti`);
process.exit(falliti === 0 ? 0 : 1);
