// Tappe 27.3 e 27.4: nei giochi da tavolo e in Forza 4 il computer aspetta mentre il pannello del telefono (js/tavola.js) è aperto,
// e una nuova partita iniziata nel frattempo annulla la mossa in attesa. DOM minimo, pannello finto.
const assert = require('node:assert/strict');
const { ambiente, GIOCATORI_FINTI } = require('../scripts/dom-minimo.js');

const TAVOLA_FINTA = `
    let pannelloAperto = false, inAttesa = [];
    const Tavola = { aperto: () => pannelloAperto, quandoChiuso: f => { if (pannelloAperto) inAttesa.push(f); else f(); } };
    const chiudiPannello = () => { pannelloAperto = false; inAttesa.splice(0).forEach(f => f()); };`;

const giochi = [
    // cartella, variabile con lo stato, istruzione che passa il turno al computer
    ['dama', 's', "tocca = 'nero'"],
    ['filetto', 'stato', "stato.tocca = 'N'"],
    ['scacchi', 'stato', "stato.tocca = 'b'"],
    ['forza_4', 'caselle', "tocca = PEDINA_PC"]
];
for (const [cartella, variabile, turnoPC] of giochi) {
    const a = ambiente();
    a.$('#modalitaGioco').value = 'uno';
    a.$('#difficolta').value = 'facile';
    a.esegui(GIOCATORI_FINTI + TAVOLA_FINTA);
    a.carica(`${cartella}/funzioni.js`);
    a.carica(`${cartella}/main.js`);
    const statoOra = () => a.esegui(`JSON.stringify(${variabile})`);
    a.svuotaTimer();
    const iniziale = statoOra();

    // Pannello aperto: il timer del computer scade ma la mossa aspetta
    a.esegui(turnoPC);
    const primaDelPC = statoOra();
    a.esegui('pannelloAperto = true; turnoComputer()');
    a.svuotaTimer(1);
    assert.equal(statoOra(), primaDelPC, `${cartella}: con il pannello aperto il computer non muove`);
    assert.equal(a.esegui('inAttesa.length'), 1);
    a.esegui('chiudiPannello()');
    assert.notEqual(statoOra(), primaDelPC, `${cartella}: chiuso il pannello il computer muove`);

    // Nuova partita mentre la mossa aspetta: la mossa vecchia non viene giocata
    a.esegui(`iniziaPartita(); ${turnoPC}; pannelloAperto = true; turnoComputer()`);
    a.svuotaTimer(1);
    a.esegui('iniziaPartita()');
    const nuova = statoOra();
    a.esegui('chiudiPannello()');
    a.svuotaTimer();
    assert.equal(statoOra(), nuova, `${cartella}: la mossa rimasta in attesa non tocca la nuova partita`);
    assert.equal(nuova, iniziale);
    console.log(`OK ${cartella}: computer fermo con il pannello aperto, nuova partita annulla l'attesa`);
}

// Tappa 27.4: con il pannello aperto il tempo di Memory, Campo minato e Sudoku si ferma e alla chiusura riparte
for (const cartella of ['memory', 'campo_minato', 'sudoku']) {
    const a = ambiente();
    const ascoltatori = {};
    a.document.addEventListener = (tipo, f) => { (ascoltatori[tipo] ||= []).push(f); };
    const emetti = tipo => (ascoltatori[tipo] || []).forEach(f => f({ type: tipo }));
    a.$('#formato').value = 'media'; a.$('#livello').value = 'facile'; a.$('#difficolta').value = 'medio';
    // Nel DOM minimo un elemento senza figli non ha discendenti: qui basta un elemento qualsiasi per ogni selettore
    a.esegui('Element.prototype.querySelector = function (q) { this._q ||= {}; return this._q[q] ||= new Element(); }');
    a.esegui(GIOCATORI_FINTI);
    a.carica(`${cartella}/funzioni.js`);
    a.carica(`${cartella}/main.js`);
    a.esegui('avviaTempo()');
    assert.notEqual(a.esegui('timer'), null, `${cartella}: il tempo corre`);
    emetti('tavola:aperta');
    assert.equal(a.esegui('timer'), null, `${cartella}: con il pannello aperto il tempo è fermo`);
    emetti('tavola:chiusa');
    assert.notEqual(a.esegui('timer'), null, `${cartella}: chiuso il pannello il tempo riparte`);
    // Tempo non partito (partita non iniziata): aprire e chiudere il pannello non lo avvia
    a.esegui('fermaTempo()');
    emetti('tavola:aperta'); emetti('tavola:chiusa');
    assert.equal(a.esegui('timer'), null, `${cartella}: il pannello non fa partire il tempo`);
    console.log(`OK ${cartella}: tempo fermo con il pannello aperto`);
}
