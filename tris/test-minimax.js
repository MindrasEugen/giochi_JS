// Prova della modalità Impossibile del tris.
// Si avvia dalla radice del progetto con:  node tris/test-minimax.js
// Il giocatore (X) prova TUTTE le sequenze di mosse possibili; il PC (O) risponde sempre con mossaMigliore.
// Se X riesce a vincere anche una sola partita, la prova fallisce.

const { trovaVincitore, grigliaPiena, caselleVuote, mossaMigliore } = require('./funzioni.js');

const risultati = { vittorieX: 0, vittorieO: 0, pareggi: 0 };
const esempiSconfitta = [];

// Gioca ogni mossa possibile di X; dopo ognuna muove il PC
function esplora(caselle, mosse) {
    for (const indice of caselleVuote(caselle)) {
        const dopoX = [...caselle];
        dopoX[indice] = 'X';
        const mosseX = [...mosse, `X${indice}`];

        if (trovaVincitore(dopoX) === 'X') {
            risultati.vittorieX++;
            esempiSconfitta.push(mosseX.join(' '));
            continue;
        }
        if (grigliaPiena(dopoX)) {
            risultati.pareggi++;
            continue;
        }

        const rispostaPC = mossaMigliore(dopoX);
        const dopoO = [...dopoX];
        dopoO[rispostaPC] = 'O';
        const mosseO = [...mosseX, `O${rispostaPC}`];

        if (trovaVincitore(dopoO) === 'O') {
            risultati.vittorieO++;
        } else if (grigliaPiena(dopoO)) {
            risultati.pareggi++;
        } else {
            esplora(dopoO, mosseO);
        }
    }
}

// Controlli su posizioni precise
function controlla(descrizione, griglia, attesa) {
    const caselle = griglia.split('').map(c => (c === '.' ? '' : c));
    const mossa = mossaMigliore(caselle);
    const ok = attesa.includes(mossa);
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${descrizione}: mossa ${mossa}`);
    return ok;
}

const inizio = Date.now();
esplora(['', '', '', '', '', '', '', '', ''], []);
const durata = Date.now() - inizio;

let tuttoOk = true;
tuttoOk = controlla('vince subito invece di bloccare (OO. / XX.)', 'OO.XX....', [2]) && tuttoOk;
tuttoOk = controlla('blocca il tris di X (XX. / .O.)', 'XX..O....', [2]) && tuttoOk;
tuttoOk = controlla('risponde all\'angolo prendendo il centro', 'X........', [4]) && tuttoOk;
tuttoOk = controlla('blocca la doppia minaccia sugli angoli opposti (X.. / .O. / ..X)', 'X...O...X', [1, 3, 5, 7]) && tuttoOk;

const totale = risultati.vittorieX + risultati.vittorieO + risultati.pareggi;
console.log(`\nPartite giocate: ${totale} (in ${durata} ms)`);
console.log(`Vittorie di X: ${risultati.vittorieX}  Vittorie del PC: ${risultati.vittorieO}  Pareggi: ${risultati.pareggi}`);

if (risultati.vittorieX > 0) {
    console.log('FAIL il PC ha perso, per esempio:', esempiSconfitta.slice(0, 3));
    tuttoOk = false;
} else {
    console.log('OK   il PC non perde mai');
}

process.exit(tuttoOk ? 0 : 1);
