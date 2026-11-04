// Prova della logica della Battaglia navale. Si avvia dalla radice del progetto con:  node battaglia_navale/test-battaglia.js

const B = require('./funzioni.js');

let falliti = 0;
function controlla(descrizione, condizione) {
    console.log(`${condizione ? 'OK  ' : 'FAIL'} ${descrizione}`);
    if (!condizione) falliti++;
}

controlla('5 navi per 17 caselle in tutto', B.NAVI.length === 5 && B.NAVI.reduce((t, n) => t + n.lunghezza, 0) === 17);
controlla('nave orizzontale che esce dalla griglia: non valida', B.celleNave(8, 3, true) === null && B.celleNave(7, 3, true).join() === '7,8,9');
controlla('nave verticale: caselle una sotto l’altra', B.celleNave(5, 3, false).join() === '5,15,25' && B.celleNave(85, 3, false) === null);

const una = [B.creaNave(B.NAVI[4], [0, 1])];
controlla('non si può sovrapporre', !B.posizioneValida(una, [1, 2]));
controlla('non si può toccare di lato', !B.posizioneValida(una, [2, 3]));
controlla('non si può toccare in diagonale', !B.posizioneValida(una, [12, 13]));
controlla('a una casella di distanza va bene', B.posizioneValida(una, [3, 4]));

// Disposizione casuale: 1000 flotte tutte valide
let tutteValide = true;
for (let k = 0; k < 1000; k++) {
    const flotta = B.disponiACaso();
    const celle = flotta.navi.flatMap(n => n.celle);
    const insieme = new Set(celle);
    const lunghezzeGiuste = flotta.navi.map(n => n.celle.length).join() === '5,4,3,3,2';
    const inFila = flotta.navi.every(n => {
        const d = n.celle[1] - n.celle[0];
        return (d === 1 || d === 10) && n.celle.every((c, j) => j === 0 || c - n.celle[j - 1] === d) && (d !== 1 || Math.floor(n.celle[0] / 10) === Math.floor(n.celle[n.celle.length - 1] / 10));
    });
    const nonSiToccano = flotta.navi.every(n => n.celle.every(c => B.intorno(c).every(v => !insieme.has(v) || n.celle.includes(v))));
    if (insieme.size !== 17 || !lunghezzeGiuste || !inFila || !nonSiToccano) tutteValide = false;
}
controlla('1000 disposizioni casuali: navi in fila, dentro la griglia, senza sovrapporsi né toccarsi', tutteValide);

// Colpi
const flotta = { navi: [B.creaNave(B.NAVI[4], [0, 1]), B.creaNave(B.NAVI[2], [30, 40, 50])], colpi: new Map() };
controlla('acqua', B.spara(flotta, 99).esito === 'acqua');
controlla('lo stesso colpo due volte: ripetuto', B.spara(flotta, 99).esito === 'ripetuto');
controlla('colpito', B.spara(flotta, 0).esito === 'colpito');
const affondo = B.spara(flotta, 1);
controlla('colpito e affondato, con il nome della nave', affondo.esito === 'affondato' && affondo.nave.nome === 'Cacciatorpediniere');
controlla('non è finita finché resta una nave', !B.tutteAffondate(flotta));
B.spara(flotta, 30); B.spara(flotta, 40); B.spara(flotta, 50);
controlla('tutte affondate: partita vinta', B.tutteAffondate(flotta));
controlla('il contorno di una nave affondata è escluso', B.celleEscluse(flotta).has(2) && B.celleEscluse(flotta).has(11));

// PC normale
const caccia = { navi: [B.creaNave(B.NAVI[1], [44, 45, 46, 47])], colpi: new Map() };
B.spara(caccia, 45);
const dopoUno = B.mossaPC(caccia, 'normale');
controlla(`dopo un colpito il PC spara vicino (${dopoUno})`, [35, 55, 44, 46].includes(dopoUno));
B.spara(caccia, 46);
const dopoDue = B.mossaPC(caccia, 'normale');
controlla(`con due colpi in fila il PC prosegue sulla linea (${dopoDue})`, [44, 47].includes(dopoDue));

// Partite complete: il PC non spara mai due volte nello stesso punto e finisce sempre
function partita(difficolta) {
    const f = B.disponiACaso();
    let colpi = 0;
    let ripetuti = 0;
    while (!B.tutteAffondate(f) && colpi < 200) {
        const i = B.mossaPC(f, difficolta);
        if (B.spara(f, i).esito === 'ripetuto') ripetuti++;
        colpi++;
    }
    return { colpi, ripetuti, finita: B.tutteAffondate(f) };
}
const media = d => {
    let somma = 0, ripetuti = 0, finite = 0;
    for (let k = 0; k < 200; k++) { const p = partita(d); somma += p.colpi; ripetuti += p.ripetuti; finite += p.finita ? 1 : 0; }
    return { media: somma / 200, ripetuti, finite };
};
const facile = media('facile');
const normale = media('normale');
controlla(`facile: 200 partite finite, nessun colpo ripetuto, ${facile.media.toFixed(1)} colpi di media`, facile.finite === 200 && facile.ripetuti === 0);
controlla(`normale: 200 partite finite, nessun colpo ripetuto, ${normale.media.toFixed(1)} colpi di media`, normale.finite === 200 && normale.ripetuti === 0);
controlla('il PC normale ha bisogno di molti meno colpi del facile (almeno 25 in meno)', normale.media < facile.media - 25);

console.log(falliti === 0 ? '\nTutti i controlli sono passati' : `\n${falliti} controlli falliti`);
process.exit(falliti === 0 ? 0 : 1);
