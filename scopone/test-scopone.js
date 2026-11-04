// Test dello Scopone scientifico: node scopone/test-scopone.js
const assert = require('node:assert/strict');
const S = require('./funzioni'), M = require('../js/mazzo');
const carta = (numero, seme = 'bastoni') => M.italiano().find(c => c.numero === numero && c.seme === seme);
const seme = n => { let s = n; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };

const s = S.crea(seme(1));
assert.equal(s.mani.length, 4); assert.ok(s.mani.every(m => m.length === 9)); assert.equal(s.tavolo.length, 4); assert.equal(s.mazzo.length, 0);
assert.ok(s.tavolo.filter(c => c.numero === 10).length < 3);
assert.deepEqual([0, 1, 2, 3].map(g => S.squadra(s, g)), [0, 1, 0, 1]);
console.log('OK   4 giocatori, 9 carte a testa, 4 in tavola, coppie 0+2 contro 1+3');

// Le prese del compagno finiscono nello stesso mazzetto
const coppia = S.crea(seme(2)); coppia.turno = 2; coppia.mani[2] = [carta(5)]; coppia.tavolo = [carta(5, 'spade'), carta(3)];
assert.ok(S.gioca(coppia, { carta: 0, presa: [0] }));
assert.equal(coppia.catturate[0].length, 2); assert.equal(coppia.turno, 3);
console.log('OK   la presa del compagno va nel mazzetto della coppia; il turno passa al giocatore successivo');

// Ultima carta: niente scopa; i resti alla coppia che ha preso per ultima
const fine = S.crea(seme(3));
fine.mani = [[], [], [], [carta(4)]]; fine.turno = 3; fine.tavolo = [carta(4, 'spade')]; fine.scope = [0, 0];
assert.ok(S.gioca(fine, { carta: 0, presa: [0] })); assert.equal(fine.scope[1], 0); assert.equal(fine.finita, true);
const resti = S.crea(seme(4));
resti.mani = [[], [], [], [carta(4)]]; resti.turno = 3; resti.tavolo = [carta(7)]; resti.ultimaPresa = 2; resti.catturate = [[], []];
assert.ok(S.gioca(resti, { carta: 0, presa: [] })); assert.equal(resti.catturate[0].length, 2);
console.log('OK   ultima carta senza scopa, resti alla coppia dell’ultima presa');

// Napola
const P = require('../js/prese-italiane');
assert.equal(P.scalaDenari([1, 2, 3, 4, 5].map(n => carta(n, 'denari')), 10), 5);
assert.equal(P.scalaDenari([1, 2, 4].map(n => carta(n, 'denari')), 10), 0);
assert.equal(P.scalaDenari(M.italiano().filter(c => c.seme === 'denari'), 10), 10);
const napola = S.crea(seme(5)); napola.scope = [0, 0];
napola.catturate = [[1, 2, 3, 4].map(n => carta(n, 'denari')), []];
assert.equal(S.risultato(napola).dettaglio[0].napola, 4);
console.log('OK   napola: asso, 2 e 3 di denari 3 punti, più uno per ogni denaro in scala');

for (let i = 1; i <= 200; i++) {
    const casuale = seme(i), st = S.crea(casuale); let mosse = 0;
    while (!st.finita) {
        const legali = S.mosseLegali(st), m = st.turno % 2 ? legali[Math.floor(casuale() * legali.length)] : S.mossaPC(st);
        assert.ok(S.gioca(st, m)); mosse++;
        assert.equal(new Set([...st.mani.flat(), ...st.tavolo, ...st.catturate.flat()].map(c => `${c.seme}-${c.numero}`)).size, 40);
    }
    assert.equal(mosse, 36); assert.equal(st.catturate.flat().length, 40);
    assert.ok(S.risultato(st).punti.every(Number.isInteger));
}
console.log('OK   200 smazzate complete a quattro: carte conservate, 36 giocate');
console.log('Tutti i controlli sono passati');
