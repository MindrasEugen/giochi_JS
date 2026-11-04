// Prova della logica di Raddoppia. Si avvia dalla radice del progetto con:  node raddoppia/test-raddoppia.js

const R = require('./funzioni.js');

let falliti = 0;
function controlla(descrizione, condizione) {
    console.log(`${condizione ? 'OK  ' : 'FAIL'} ${descrizione}`);
    if (!condizione) falliti++;
}
const uguale = (a, b) => a.join() === b.join();

// Una riga
const casi = [
    [[0, 0, 0, 0], [0, 0, 0, 0], 0],
    [[2, 0, 0, 2], [4, 0, 0, 0], 4],
    [[2, 2, 2, 2], [4, 4, 0, 0], 8],
    [[2, 2, 4, 4], [4, 8, 0, 0], 12],
    [[4, 2, 2, 0], [4, 4, 0, 0], 4],
    [[2, 2, 2, 0], [4, 2, 0, 0], 4],
    [[4, 4, 8, 0], [8, 8, 0, 0], 8],
    [[2, 4, 8, 16], [2, 4, 8, 16], 0]
];
for (const [riga, attesa, punti] of casi) {
    const esito = R.scorriRiga(riga);
    controlla(`riga ${riga.join(' ')} -> ${attesa.join(' ')} (+${punti})`, uguale(esito.riga, attesa) && esito.punti === punti);
}
controlla('una tessera nata da un’unione non si unisce di nuovo nella stessa mossa (4 4 8 -> 8 8, non 16)', uguale(R.scorriRiga([4, 4, 8, 0]).riga, [8, 8, 0, 0]));
controlla('posizioni delle tessere unite (2 2 4 4 -> unite in 0 e 1)', uguale(R.scorriRiga([2, 2, 4, 4]).unite, [0, 1]));

// Le 4 direzioni
const g = [
    2, 0, 2, 0,
    0, 4, 0, 4,
    2, 0, 0, 0,
    2, 0, 0, 0
];
controlla('sinistra', uguale(R.muovi(g, 'sinistra').griglia, [4, 0, 0, 0, 8, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0]));
controlla('destra', uguale(R.muovi(g, 'destra').griglia, [0, 0, 0, 4, 0, 0, 0, 8, 0, 0, 0, 2, 0, 0, 0, 2]));
controlla('su', uguale(R.muovi(g, 'su').griglia, [4, 4, 2, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
controlla('giù', uguale(R.muovi(g, 'giu').griglia, [0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 4, 4, 2, 4]));
controlla('la griglia originale non cambia', uguale(g, [2, 0, 2, 0, 0, 4, 0, 4, 2, 0, 0, 0, 2, 0, 0, 0]));
const ferma = [2, 4, 0, 0, 8, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
controlla('una mossa che non sposta niente: mosso = false', R.muovi(ferma, 'sinistra').mosso === false && R.muovi(ferma, 'destra').mosso === true);

// Fine partita
const bloccata = [2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2];
controlla('griglia piena senza coppie vicine: non si può muovere', !R.puoMuovere(bloccata));
const conCoppia = [...bloccata];
conCoppia[1] = 2;
controlla('griglia piena con due tessere uguali vicine: si può muovere', R.puoMuovere(conCoppia));
controlla('obiettivo 2048', R.haObiettivo([2048, ...new Array(15).fill(0)]) && !R.haObiettivo(bloccata));

// Nuove tessere
let solo2e4 = true;
let quattro = 0;
for (let k = 0; k < 2000; k++) {
    const vuota = R.grigliaVuota();
    const i = R.aggiungiTessera(vuota);
    if (![2, 4].includes(vuota[i])) solo2e4 = false;
    if (vuota[i] === 4) quattro++;
}
controlla(`nuove tessere: solo 2 e 4, circa 1 su 10 è un 4 (${quattro} su 2000)`, solo2e4 && quattro > 120 && quattro < 280);
controlla('griglia piena: nessuna tessera aggiunta', R.aggiungiTessera([...bloccata]) === -1);

// Generatore ripetibile
const a = R.generatore(42);
const b = R.generatore(42);
const c = R.generatore(43);
const serieA = [a(), a(), a()];
controlla('stesso seme -> stessa sequenza, seme diverso -> sequenza diversa', uguale(serieA, [b(), b(), b()]) && !uguale(serieA, [c(), c(), c()]));
controlla('valori tra 0 e 1', serieA.every(x => x >= 0 && x < 1));

// Una partita intera a caso arriva sempre a una fine
const casuale = R.generatore(7);
let griglia = R.grigliaVuota();
R.aggiungiTessera(griglia, casuale);
R.aggiungiTessera(griglia, casuale);
let mosse = 0;
let punteggio = 0;
const direzioni = ['sinistra', 'destra', 'su', 'giu'];
while (R.puoMuovere(griglia) && mosse < 10000) {
    const esito = R.muovi(griglia, direzioni[Math.floor(casuale() * 4)]);
    if (esito.mosso) {
        griglia = esito.griglia;
        punteggio += esito.punti;
        R.aggiungiTessera(griglia, casuale);
        mosse++;
    }
}
controlla(`partita casuale finita dopo ${mosse} mosse con ${punteggio} punti`, !R.puoMuovere(griglia) && mosse > 20);

console.log(falliti === 0 ? '\nTutti i controlli sono passati' : `\n${falliti} controlli falliti`);
process.exit(falliti === 0 ? 0 : 1);
