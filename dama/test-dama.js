// Prova della logica della Dama italiana. Si avvia dalla radice del progetto con:  node dama/test-dama.js

const D = require('./funzioni.js');

let falliti = 0;
function controlla(descrizione, condizione) {
    console.log(`${condizione ? 'OK  ' : 'FAIL'} ${descrizione}`);
    if (!condizione) falliti++;
}

// Scacchiera da un elenco di pezzi: { 'riga,colonna': 'b' | 'B' | 'n' | 'N' } (solo caselle scure)
function pos(pezzi) {
    const s = new Array(64).fill('');
    for (const [chiave, pezzo] of Object.entries(pezzi)) {
        const [r, c] = chiave.split(',').map(Number);
        if (!D.scura(r, c)) throw new Error(`pezzo su casella chiara in ${r},${c}`);
        s[D.indice(r, c)] = pezzo;
    }
    return s;
}
const i = D.indice;
const descrivi = m => `${m.da}->${m.a} (${m.catture.length} prese)`;

// Posizione iniziale
const iniziale = D.scacchieraIniziale();
controlla('12 pedine per parte sulle caselle scure', D.conta(iniziale, 'bianco').pedine === 12 && D.conta(iniziale, 'nero').pedine === 12);
controlla('la casella d’angolo in basso a destra è scura', D.scura(7, 7) && iniziale[i(7, 7)] === 'b');
controlla('all’inizio il bianco ha 7 mosse', D.mosseLegali(iniziale, 'bianco').length === 7);

// Presa obbligatoria: la pedina in 5,3 deve mangiare in 4,4 anche se l'altra pedina potrebbe muovere
const obbligo = pos({ '5,3': 'b', '4,4': 'n', '7,7': 'b' });
const mObbligo = D.mosseLegali(obbligo, 'bianco');
controlla('se si può mangiare bisogna farlo (una sola mossa possibile)', mObbligo.length === 1 && mObbligo[0].catture[0] === i(4, 4) && mObbligo[0].a === i(3, 5));

// La pedina mangia solo in avanti
const indietro = pos({ '3,3': 'b', '4,2': 'n' });
controlla('la pedina bianca non mangia all’indietro', D.mosseLegali(indietro, 'bianco').every(m => m.catture.length === 0));
controlla('nemmeno la pedina nera mangia all’indietro', D.mosseLegali(indietro, 'nero').every(m => m.catture.length === 0));
const avanti = pos({ '3,3': 'b', '2,2': 'n' });
controlla('la pedina nera mangia in avanti (verso il basso)', D.mosseLegali(avanti, 'nero').some(m => m.catture[0] === i(3, 3)));

// La pedina non può mangiare la dama
const pedinaDama = pos({ '5,3': 'b', '4,4': 'N' });
controlla('la pedina non può mangiare la dama', D.mosseLegali(pedinaDama, 'bianco').every(m => m.catture.length === 0));
controlla('la dama invece mangia la pedina, anche all’indietro', D.mosseLegali(pedinaDama, 'nero').some(m => m.catture.includes(i(5, 3))));

// Priorità 1: si deve scegliere la presa che mangia più pezzi
const multipla = pos({ '6,2': 'b', '5,3': 'n', '3,5': 'n', '7,7': 'b', '6,6': 'n' });
const mMultipla = D.mosseLegali(multipla, 'bianco');
controlla(`presa multipla: obbligatorio mangiare 2 pezzi (${mMultipla.map(descrivi).join(', ')})`, mMultipla.length === 1 && mMultipla[0].catture.length === 2 && mMultipla[0].da === i(6, 2));

// Priorità 2: a parità di pezzi mangiati si mangia con la dama
const conDama = pos({ '4,2': 'B', '3,3': 'n', '5,5': 'b', '4,6': 'n' });
const mConDama = D.mosseLegali(conDama, 'bianco');
controlla(`a parità di prese si mangia con la dama (${mConDama.map(descrivi).join(', ')})`, mConDama.length === 1 && mConDama[0].da === i(4, 2));

// Priorità 3: a parità, si mangiano più dame
const piuDame = pos({ '4,2': 'B', '3,1': 'n', '3,3': 'N' });
const mPiuDame = D.mosseLegali(piuDame, 'bianco');
controlla(`a parità si mangia la dama invece della pedina (${mPiuDame.map(descrivi).join(', ')})`, mPiuDame.length === 1 && mPiuDame[0].catture[0] === i(3, 3));

// Priorità 4: a parità di tutto, si sceglie la presa che incontra prima una dama
const primaDama = pos({ '4,4': 'B', '3,3': 'N', '1,1': 'n', '3,5': 'n', '1,5': 'N' });
const mPrima = D.mosseLegali(primaDama, 'bianco');
controlla(`a parità si sceglie la presa che incontra prima una dama (${mPrima.map(descrivi).join(', ')})`, mPrima.length === 1 && mPrima[0].catture[0] === i(3, 3) && mPrima[0].catture.length === 2);

// Promozione: la pedina che arriva in fondo diventa dama e la presa si ferma
const promozione = pos({ '2,2': 'b', '1,1': 'n', '1,3': 'n' });
const mProm = D.mosseLegali(promozione, 'bianco');
const dopo = D.applica(promozione, mProm[0]);
controlla('presa che arriva in fondo: si ferma lì e diventa dama', mProm.length === 2 && mProm.every(m => m.catture.length === 1) && dopo[mProm[0].a] === 'B');
const semplice = D.applica(pos({ '1,1': 'b' }), { da: i(1, 1), a: i(0, 2), catture: [] });
controlla('mossa semplice in fondo: promozione a dama', semplice[i(0, 2)] === 'B');

// La dama muove anche all’indietro, ma di una sola casella
controlla('la dama ha 4 mosse (di una casella, in tutte le diagonali)', D.mosseLegali(pos({ '3,3': 'B' }), 'bianco').length === 4);

// Un pezzo non si mangia due volte: la dama fa il giro e torna alla casella di partenza
const giro = pos({ '6,4': 'B', '5,3': 'n', '3,3': 'n', '3,5': 'n', '5,5': 'n' });
const mGiro = D.mosseLegali(giro, 'bianco');
controlla(`la dama fa il giro, mangia 4 pezzi diversi e torna al punto di partenza (${mGiro.map(descrivi).join(', ')})`,
    mGiro.length >= 1 && mGiro.every(m => m.catture.length === 4 && new Set(m.catture).size === 4 && m.a === i(6, 4)));
controlla('dopo il giro i 4 pezzi neri spariscono', D.conta(D.applica(giro, mGiro[0]), 'nero').totale === 0);

// Fine partita
controlla('chi non ha più pezzi perde', D.vincitore(pos({ '7,1': 'b' }), 'nero') === 'bianco');
const bloccato = pos({ '7,1': 'b', '6,0': 'n', '6,2': 'n', '5,3': 'n' });
controlla('chi non ha mosse perde (bianco bloccato: vince il nero)', D.mosseLegali(bloccato, 'bianco').length === 0 && D.vincitore(bloccato, 'bianco') === 'nero');

// PC
function casualeRipetibile(seme) {
    let s = seme;
    return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
}
function partita(dif1, dif2, casuale) {
    let s = D.scacchieraIniziale();
    let tocca = 'bianco';
    const difficolta = { bianco: dif1, nero: dif2 };
    for (let mossa = 0; mossa < 300; mossa++) {
        const m = D.mossaPC(s, tocca, difficolta[tocca], casuale);
        if (!m) return difficolta[D.avversario(tocca)];
        s = D.applica(s, m);
        tocca = D.avversario(tocca);
    }
    // dopo 300 mosse: vince chi ha più materiale
    const v = D.valuta(s, 'bianco');
    return v > 0 ? difficolta.bianco : v < 0 ? difficolta.nero : 'pareggio';
}
const inizio = Date.now();
const risultati = {};
for (let k = 0; k < 10; k++) {
    const casuale = casualeRipetibile(k + 1);
    const esito = k % 2 === 0 ? partita('difficile', 'facile', casuale) : partita('facile', 'difficile', casuale);
    risultati[esito] = (risultati[esito] || 0) + 1;
}
controlla(`il Difficile batte il Facile in 10 partite su 10 (${JSON.stringify(risultati)}, ${Date.now() - inizio} ms)`, risultati.difficile === 10);
const t = Date.now();
D.mossaPC(D.scacchieraIniziale(), 'bianco', 'difficile');
const durata = Date.now() - t;
controlla(`difficile: prima mossa in ${durata} ms (meno di 1500)`, durata < 1500);

console.log(falliti === 0 ? '\nTutti i controlli sono passati' : `\n${falliti} controlli falliti`);
process.exit(falliti === 0 ? 0 : 1);
