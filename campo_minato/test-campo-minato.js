// Prova della logica del Campo minato. Si avvia dalla radice del progetto con:  node campo_minato/test-campo-minato.js

const C = require('./funzioni.js');

let falliti = 0;
function controlla(descrizione, condizione) {
    console.log(`${condizione ? 'OK  ' : 'FAIL'} ${descrizione}`);
    if (!condizione) falliti++;
}

// Campo con le mine messe a mano (per i casi precisi)
function campo(disegno) {
    const righe = disegno.length;
    const colonne = disegno[0].length;
    const mine = disegno.join('').split('').filter(c => c === '*').length;
    const stato = C.crea(righe, colonne, mine);
    disegno.join('').split('').forEach((c, i) => { stato.celle[i].mina = c === '*'; });
    stato.celle.forEach((cella, i) => { cella.vicine = C.vicini(stato, i).filter(v => stato.celle[v].mina).length; });
    stato.minePiazzate = true;
    return stato;
}

// Vicini
const s3 = C.crea(3, 3, 0);
controlla('angolo: 3 vicini, centro: 8, bordo: 5', C.vicini(s3, 0).length === 3 && C.vicini(s3, 4).length === 8 && C.vicini(s3, 1).length === 5);

// Prima apertura sempre sicura, su tutti i livelli e 200 partite
let sicure = true;
let conteggiGiusti = true;
for (const [nome, l] of Object.entries(C.LIVELLI)) {
    for (let k = 0; k < 200; k++) {
        const stato = C.crea(l.righe, l.colonne, l.mine);
        const prima = Math.floor(Math.random() * stato.celle.length);
        C.apri(stato, prima);
        const protette = [prima, ...C.vicini(stato, prima)];
        if (stato.finita && !stato.vinta || protette.some(i => stato.celle[i].mina)) sicure = false;
        if (stato.celle.filter(c => c.mina).length !== l.mine) conteggiGiusti = false;
    }
}
controlla('prima apertura sicura (e senza mine intorno) in 600 partite sui 3 livelli', sicure);
controlla('il numero di mine è sempre quello del livello', conteggiGiusti);

// Apertura a cascata
const cascata = campo([
    '....',
    '....',
    '...*'
]);
const aperte = C.apri(cascata, 0);
controlla(`cascata: dall’angolo vuoto si aprono tutte le 11 celle senza mina (${aperte.length})`, aperte.length === 11);
controlla('cascata: tutte le celle libere aperte = vittoria', cascata.finita && cascata.vinta && cascata.celle[11].bandiera);

// Numeri
const numeri = campo([
    '*..',
    '...',
    '..*'
]);
controlla('i numeri contano le mine intorno (centro = 2)', numeri.celle[4].vicine === 2);
controlla('aprire un numero apre solo quella cella', C.apri(numeri, 4).length === 1 && !numeri.celle[1].aperta);

// Mina: sconfitta
const mina = campo(['*.', '..']);
C.apri(mina, 0);
controlla('aprire una mina: partita persa, cella esplosa', mina.finita && !mina.vinta && mina.celle[0].esplosa);
controlla('a partita finita non si apre più niente', C.apri(mina, 3).length === 0);

// Bandiere
const conBandiera = campo(['*.', '..']);
controlla('bandiera: si mette', C.bandiera(conBandiera, 0) && conBandiera.celle[0].bandiera && C.bandiereMesse(conBandiera) === 1);
controlla('una cella con la bandiera non si apre', C.apri(conBandiera, 0).length === 0 && !conBandiera.finita);
controlla('bandiera: si toglie', C.bandiera(conBandiera, 0) && !conBandiera.celle[0].bandiera);

// Apertura rapida
const rapida = campo([
    '*..',
    '...',
    '...'
]);
C.apri(rapida, 4);
controlla('apertura rapida senza bandiere: non fa niente', C.apriIntorno(rapida, 4).length === 0);
C.bandiera(rapida, 0);
const intorno = C.apriIntorno(rapida, 4);
controlla(`apertura rapida con la bandiera giusta: apre le vicine e vince (${intorno.length} celle)`, rapida.vinta && intorno.length >= 7);
const sbagliata = campo([
    '*..',
    '...',
    '...'
]);
C.apri(sbagliata, 4);
C.bandiera(sbagliata, 1);
C.apriIntorno(sbagliata, 4);
controlla('apertura rapida con la bandiera sbagliata: si esplode', sbagliata.finita && !sbagliata.vinta);

console.log(falliti === 0 ? '\nTutti i controlli sono passati' : `\n${falliti} controlli falliti`);
process.exit(falliti === 0 ? 0 : 1);
