// Prova della logica del Ludo. Si avvia dalla radice del progetto con:  node ludo/test-ludo.js

const L = require('./funzioni.js');

let falliti = 0;
function controlla(descrizione, condizione) {
    console.log(`${condizione ? 'OK  ' : 'FAIL'} ${descrizione}`);
    if (!condizione) falliti++;
}

// Tabellone
const chiave = ([r, c]) => `${r},${c}`;
const tutte = [...L.COORD_PERCORSO, ...Object.values(L.COORD_ARRIVO).flat(), ...Object.values(L.COORD_BASE).flat()];
controlla('percorso di 52 caselle, tutte diverse', L.COORD_PERCORSO.length === 52 && new Set(L.COORD_PERCORSO.map(chiave)).size === 52);
controlla('ogni passo del percorso va in una casella vicina (anche dall’ultima alla prima)', L.COORD_PERCORSO.every((p, i) => {
    const q = L.COORD_PERCORSO[(i + 1) % 52];
    return Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) === 1 || (Math.abs(p[0] - q[0]) === 1 && Math.abs(p[1] - q[1]) === 1);
}));
controlla('nessuna casella usata due volte (percorso, colonne di arrivo, basi)', new Set(tutte.map(chiave)).size === tutte.length);
controlla('le colonne di arrivo partono accanto all’ultima casella comune di ogni colore', L.COLORI.every(c => {
    const ultima = L.COORD_PERCORSO[L.assoluta(c, 50)];
    const prima = L.COORD_ARRIVO[c][0];
    return Math.abs(ultima[0] - prima[0]) + Math.abs(ultima[1] - prima[1]) === 1;
}));
controlla('le partenze sono a 13 caselle una dall’altra', L.PARTENZA.verde - L.PARTENZA.rosso === 13 && L.PARTENZA.blu === 39);

// Regole
const s = L.statoIniziale(4);
controlla('all’inizio senza un 6 non si muove', L.mossePossibili(s, 'rosso', 5).length === 0);
controlla('con un 6 si può uscire con una qualsiasi delle 4 pedine', L.mossePossibili(s, 'rosso', 6).length === 4 && L.mossePossibili(s, 'rosso', 6).every(m => m.a === 0));
const dopo6 = L.applica(s, 6, L.mossePossibili(s, 'rosso', 6)[0]);
controlla('dopo un 6 si tira di nuovo', dopo6.tocca === 0 && dopo6.seiDiFila === 1 && dopo6.pedine.rosso[0] === 0);
const dopo5 = L.applica(dopo6, 5, L.mossePossibili(dopo6, 'rosso', 5)[0]);
controlla('dopo un tiro diverso da 6 tocca al giocatore successivo', dopo5.tocca === 1 && dopo5.pedine.rosso[0] === 5);
let tre = { ...s, seiDiFila: 2 };
controlla('al terzo 6 di fila il turno passa comunque', L.applica(tre, 6, null).tocca === 1);

// Mangiare
const presa = L.statoIniziale(4);
presa.pedine.rosso[0] = 10;                      // casella assoluta 10
// il giallo sulla casella assoluta 12 (il verde non può starci: per lui è subito prima della colonna di arrivo)
presa.pedine.giallo[0] = (12 - L.PARTENZA.giallo + L.PERCORSO) % L.PERCORSO;
const mPresa = L.mossePossibili(presa, 'rosso', 2);
controlla(`rosso da 10 con un 2 arriva sul giallo (casella 12) e lo mangia`, mPresa.length === 1 && mPresa[0].mangia.length === 1 && mPresa[0].mangia[0].colore === 'giallo');
const dopoPresa = L.applica(presa, 2, mPresa[0]);
controlla('la pedina mangiata torna in base', dopoPresa.pedine.giallo[0] === -1 && dopoPresa.pedine.rosso[0] === 12);
const sicura = L.statoIniziale(4);
sicura.pedine.rosso[0] = 6;
sicura.pedine.verde[0] = (8 - 13 + 52) % 52;      // verde sulla stella 8 (sicura)
controlla('sulle caselle sicure non si mangia', L.mossePossibili(sicura, 'rosso', 2)[0].mangia.length === 0);

// Arrivo
const fine = L.statoIniziale(2);
fine.pedine.rosso = [53, 56, 56, 56];
controlla('per arrivare serve il numero esatto: da 53 con un 4 no, con un 3 sì', L.mossePossibili(fine, 'rosso', 4).length === 0 && L.mossePossibili(fine, 'rosso', 3)[0].a === 56);
const vinto = L.applica(fine, 3, L.mossePossibili(fine, 'rosso', 3)[0]);
controlla('tutte e 4 a casa: vince il rosso', L.vincitore(vinto) === 'rosso');
controlla('nella colonna di arrivo non si viene mangiati (non è sul percorso comune)', L.assoluta('rosso', 52) === null && L.assoluta('verde', 51) === null);

// 2 e 3 giocatori
controlla('2 giocatori: rosso e giallo, 3 giocatori: rosso, verde, giallo', L.coloriInGioco(2).join() === 'rosso,giallo' && L.coloriInGioco(3).join() === 'rosso,verde,giallo');

// PC
const scelta = L.statoIniziale(4);
scelta.pedine.rosso = [10, 30, -1, -1];
scelta.pedine.giallo[0] = (12 - 26 + 52) % 52;
controlla('il PC preferisce mangiare', L.mossaPC(scelta, 'rosso', 2).pedina === 0);
const esce = L.statoIniziale(4);
esce.pedine.rosso = [20, -1, -1, -1];
controlla('con un 6 il PC fa uscire una pedina dalla base', L.mossaPC(esce, 'rosso', 6).da === -1);

// Partite intere: finiscono sempre, il PC batte un giocatore che muove a caso
function casualeRipetibile(seme) {
    let x = seme;
    return () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; };
}
let finite = 0;
let vittoriePC = 0;
const partite = 200;
for (let k = 0; k < partite; k++) {
    const casuale = casualeRipetibile(k + 3);
    let st = L.statoIniziale(2);
    const pc = k % 2 === 0 ? 'rosso' : 'giallo';
    for (let t = 0; t < 5000 && !L.vincitore(st); t++) {
        const colore = st.colori[st.tocca];
        const d = L.tiraDado(casuale);
        const mosse = L.mossePossibili(st, colore, d);
        const m = colore === pc ? L.mossaPC(st, colore, d, casuale) : (mosse.length ? mosse[Math.floor(casuale() * mosse.length)] : null);
        st = L.applica(st, d, m);
    }
    if (L.vincitore(st)) finite++;
    if (L.vincitore(st) === pc) vittoriePC++;
}
controlla(`${partite} partite a 2 giocatori finite: ${finite}`, finite === partite);
controlla(`il PC vince contro chi muove a caso in ${vittoriePC} partite su ${partite} (almeno il 65%)`, vittoriePC >= partite * 0.65);

console.log(falliti === 0 ? '\nTutti i controlli sono passati' : `\n${falliti} controlli falliti`);
process.exit(falliti === 0 ? 0 : 1);
