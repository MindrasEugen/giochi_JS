// Prova della logica del Filetto. Si avvia dalla radice del progetto con:  node filetto/test-filetto.js

const F = require('./funzioni.js');

let falliti = 0;
function controlla(descrizione, condizione) {
    console.log(`${condizione ? 'OK  ' : 'FAIL'} ${descrizione}`);
    if (!condizione) falliti++;
}

// Il tavoliere
const simmetrici = F.VICINI.every((lista, p) => lista.every(q => F.VICINI[q].includes(p)));
controlla('24 punti, collegamenti simmetrici (se A è vicino di B, B è vicino di A)', F.VICINI.length === 24 && simmetrici);
controlla('32 collegamenti in tutto', F.VICINI.reduce((t, l) => t + l.length, 0) / 2 === 32);
controlla('16 mulini, ogni punto in esattamente 2 mulini', F.MULINI.length === 16 && [...Array(24).keys()].every(p => F.MULINI.filter(m => m.includes(p)).length === 2));
controlla('ogni mulino è fatto di punti vicini in fila', F.MULINI.every(([a, b, c]) => F.VICINI[a].includes(b) && F.VICINI[b].includes(c)));

function stato(punti, daPiazzare = { B: 0, N: 0 }, tocca = 'B') {
    const p = new Array(24).fill('');
    for (const [i, g] of Object.entries(punti)) p[Number(i)] = g;
    return { punti: p, daPiazzare, tocca };
}

// Piazzamento
const s0 = F.statoIniziale();
controlla('all’inizio 24 mosse (piazzare in un punto vuoto) e fase "piazza"', F.mosseLegali(s0).length === 24 && F.fase(s0, 'B') === 'piazza');
const s1 = F.applica(s0, { da: null, a: 4, rimuovi: null });
controlla('dopo il piazzamento: pedina in tavola, una in meno in mano, tocca al nero', s1.punti[4] === 'B' && s1.daPiazzare.B === 8 && s1.tocca === 'N');

// Mulino e rimozione
const quasi = stato({ 0: 'B', 1: 'B', 9: 'N', 10: 'N', 11: 'N', 23: 'N' }, { B: 3, N: 3 });
const conMulino = F.mosseLegali(quasi).filter(m => m.a === 2);
controlla('piazzare in 2 fa mulino: si deve togliere una pedina nera', conMulino.length > 0 && conMulino.every(m => m.rimuovi !== null));
controlla('non si toglie una pedina in mulino se ce ne sono altre (9, 10, 11 sono in mulino, resta solo 23)', conMulino.every(m => m.rimuovi === 23));
const tutteInMulino = stato({ 0: 'B', 1: 'B', 9: 'N', 10: 'N', 11: 'N' }, { B: 3, N: 3 });
controlla('se tutte le pedine sono in mulino si può togliere una qualsiasi', F.mosseLegali(tutteInMulino).filter(m => m.a === 2).map(m => m.rimuovi).sort((x, y) => x - y).join() === '9,10,11');
const dopoMulino = F.applica(quasi, conMulino[0]);
controlla('dopo il mulino la pedina nera sparisce', dopoMulino.punti[23] === '' && F.inMulino(dopoMulino.punti, 2));

// Movimento e volo
const movimento = stato({ 4: 'B', 0: 'B', 21: 'B', 22: 'B', 9: 'N', 10: 'N', 13: 'N', 16: 'N' });
controlla('fase di movimento: la pedina in 4 va solo nei punti vicini liberi (1, 3, 5, 7)', F.mosseLegali(movimento).filter(m => m.da === 4).map(m => m.a).sort((a, b) => a - b).join() === '1,3,5,7');
const volo = stato({ 0: 'B', 21: 'B', 22: 'B', 9: 'N', 10: 'N', 13: 'N', 16: 'N' });
controlla('con 3 pedine si vola: la pedina in 0 può andare in tutti i 17 punti vuoti (destinazioni diverse)', F.fase(volo, 'B') === 'vola' && new Set(F.mosseLegali(volo).filter(m => m.da === 0).map(m => m.a)).size === 17);

// Fine partita
controlla('con 2 pedine (dopo il piazzamento) si perde', F.vincitore(stato({ 0: 'B', 1: 'B', 9: 'N', 10: 'N', 11: 'N' })) === 'N');
controlla('durante il piazzamento avere 2 pedine in tavola non fa perdere', F.vincitore(stato({ 0: 'B', 1: 'B', 9: 'N' }, { B: 5, N: 5 })) === null);
const bloccato = stato({ 0: 'B', 2: 'B', 21: 'B', 23: 'B', 1: 'N', 9: 'N', 14: 'N', 22: 'N', 6: 'N' });
controlla('chi non può muovere perde (il bianco è chiuso negli angoli)', F.mosseLegali(bloccato).length === 0 && F.vincitore(bloccato) === 'N');

// PC
function casualeRipetibile(seme) {
    let s = seme;
    return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
}
function partita(difB, difN, casuale) {
    let s = F.statoIniziale();
    const dif = { B: difB, N: difN };
    for (let k = 0; k < 200; k++) {
        const v = F.vincitore(s);
        if (v) return dif[v];
        s = F.applica(s, F.mossaPC(s, dif[s.tocca], casuale));
    }
    return 'pareggio';
}
controlla('media: chiude il mulino quando può', F.mossaPC(quasi, 'media').a === 2);
const minaccia = stato({ 9: 'N', 10: 'N', 0: 'B', 23: 'B' }, { B: 3, N: 3 });
controlla('media: blocca il mulino dell’avversario', F.mossaPC(minaccia, 'media').a === 11);
const inizio = Date.now();
const risultati = {};
for (let k = 0; k < 10; k++) {
    const casuale = casualeRipetibile(k + 1);
    const esito = k % 2 === 0 ? partita('difficile', 'facile', casuale) : partita('facile', 'difficile', casuale);
    risultati[esito] = (risultati[esito] || 0) + 1;
}
controlla(`il Difficile batte il Facile in 10 partite su 10 (${JSON.stringify(risultati)}, ${Date.now() - inizio} ms)`, risultati.difficile === 10);
const t = Date.now();
F.mossaPC(F.statoIniziale(), 'difficile');
controlla(`difficile: prima mossa in ${Date.now() - t} ms (meno di 1500)`, Date.now() - t < 1500);

console.log(falliti === 0 ? '\nTutti i controlli sono passati' : `\n${falliti} controlli falliti`);
process.exit(falliti === 0 ? 0 : 1);
