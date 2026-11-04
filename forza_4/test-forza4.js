// Prova della logica di Forza 4. Si avvia dalla radice del progetto con:  node forza_4/test-forza4.js

const F = require('./funzioni.js');

let falliti = 0;
function controlla(descrizione, condizione) {
    console.log(`${condizione ? 'OK  ' : 'FAIL'} ${descrizione}`);
    if (!condizione) falliti++;
}

// Costruisce una griglia giocando una sequenza di colonne, alternando R e G
function gioca(colonne, prima = 'R') {
    const g = F.grigliaVuota();
    let pedina = prima;
    for (const c of colonne) {
        F.inserisci(g, c, pedina);
        pedina = F.avversario(pedina);
    }
    return g;
}

// Caduta delle pedine
const g = F.grigliaVuota();
controlla('la prima pedina cade sul fondo (riga 5)', F.inserisci(g, 3, 'R') === 5 && g[F.indice(5, 3)] === 'R');
controlla('la seconda si appoggia sopra (riga 4)', F.inserisci(g, 3, 'G') === 4);
for (let i = 0; i < 4; i++) F.inserisci(g, 3, 'R');
controlla('colonna piena: -1 e la colonna non è più libera', F.inserisci(g, 3, 'G') === -1 && !F.colonneLibere(g).includes(3));

// Vittoria in tutte le direzioni
controlla('orizzontale', F.quattroInFila(gioca([0, 0, 1, 1, 2, 2, 3])).vincitore === 'R');
controlla('verticale', F.quattroInFila(gioca([0, 1, 0, 1, 0, 1, 0])).vincitore === 'R');
controlla('diagonale che sale', F.quattroInFila(gioca([0, 1, 1, 2, 2, 3, 2, 3, 3, 6, 3])).vincitore === 'R');
controlla('diagonale che scende', F.quattroInFila(gioca([6, 5, 5, 4, 4, 3, 4, 3, 3, 0, 3])).vincitore === 'R');
controlla('tre in fila non bastano', F.quattroInFila(gioca([0, 0, 1, 1, 2])) === null);
controlla('le celle vincenti sono 4', F.quattroInFila(gioca([0, 0, 1, 1, 2, 2, 3])).celle.length === 4);
// 24 orizzontali + 21 verticali + 12 diagonali che salgono + 12 che scendono, tutte diverse
controlla('69 finestre di 4 caselle sulla griglia 6×7, tutte diverse',
    F.FINESTRE.length === 69 && new Set(F.FINESTRE.map(f => [...f].sort((a, b) => a - b).join())).size === 69);

// Griglia piena senza vincitore: pareggio
const pareggio = gioca([0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6, 1, 0, 3, 2, 5, 4, 0, 6, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6, 1, 0, 3, 2, 5, 4, 6]);
controlla('griglia piena senza 4 in fila (pareggio)', F.piena(pareggio) && F.quattroInFila(pareggio) === null);

// PC
controlla('media: vince se può', F.mossaPC(gioca([0, 6, 1, 6, 2, 5], 'G'), 'media', 'G') === 3);
controlla('media: blocca il tris dell\'avversario', F.mossaPC(gioca([0, 6, 1, 6, 2]), 'media', 'G') === 3);
controlla('difficile: vince se può', F.mossaPC(gioca([0, 6, 1, 6, 2, 5], 'G'), 'difficile', 'G') === 3);
controlla('difficile: blocca', F.mossaPC(gioca([0, 6, 1, 6, 2]), 'difficile', 'G') === 3);

// Un generatore casuale ripetibile, così il test dà sempre lo stesso risultato
function casualeRipetibile(seme) {
    let s = seme;
    return () => {
        s = (s * 1103515245 + 12345) % 2147483648;
        return s / 2147483648;
    };
}

// Il Difficile contro il Facile, 50 partite, alternando chi comincia
function partita(primo, secondo, casuale) {
    const griglia = F.grigliaVuota();
    const giocatori = { R: primo, G: secondo };
    let tocca = 'R';
    while (true) {
        const colonna = F.mossaPC(griglia, giocatori[tocca], tocca, casuale);
        F.inserisci(griglia, colonna, tocca);
        const quattro = F.quattroInFila(griglia);
        if (quattro) return giocatori[quattro.vincitore];
        if (F.piena(griglia)) return 'pareggio';
        tocca = F.avversario(tocca);
    }
}
const inizio = Date.now();
const risultati = { difficile: 0, facile: 0, pareggio: 0 };
for (let i = 0; i < 50; i++) {
    const casuale = casualeRipetibile(i + 1);
    const esito = i % 2 === 0 ? partita('difficile', 'facile', casuale) : partita('facile', 'difficile', casuale);
    risultati[esito]++;
}
controlla(`il Difficile batte il Facile in tutte le 50 partite (difficile ${risultati.difficile}, facile ${risultati.facile}, pari ${risultati.pareggio}) in ${Date.now() - inizio} ms`, risultati.difficile === 50);

// Velocità: la mossa più lenta (griglia vuota) deve restare sotto il mezzo secondo
const t = Date.now();
F.mossaPC(F.grigliaVuota(), 'difficile', 'R');
const durata = Date.now() - t;
controlla(`difficile: prima mossa in ${durata} ms (meno di 500)`, durata < 500);

console.log(falliti === 0 ? '\nTutti i controlli sono passati' : `\n${falliti} controlli falliti`);
process.exit(falliti === 0 ? 0 : 1);
