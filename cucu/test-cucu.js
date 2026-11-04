// Test del Cucù: node cucu/test-cucu.js
const assert = require('node:assert/strict');
const C = require('./funzioni'), M = require('../js/mazzo');
const carta = (numero, seme = 'bastoni') => M.italiano().find(c => c.numero === numero && c.seme === seme);
const seme = n => { let s = n; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };

const s = C.crea(4, seme(1));
assert.deepEqual(s.vite, [3, 3, 3, 3]); assert.equal(s.mazziere, 3); assert.equal(s.turno, 0);
assert.ok(s.carte.every(Boolean)); assert.equal(s.mazzo.length, 36);
assert.deepEqual(C.mosseLegali(s).map(m => Object.keys(m)[0]), ['tieni', 'cambia']);
console.log('OK   una carta a testa, tre vite, comincia chi segue il mazziere');

// Scambio con il successivo; il re blocca
s.carte = [carta(2), carta(7), carta(10), carta(4)];
assert.ok(C.gioca(s, { cambia: true }));
assert.deepEqual(s.carte.map(c => c.numero), [7, 2, 10, 4]); assert.equal(s.turno, 1);
assert.ok(C.gioca(s, { cambia: true }));
assert.equal(s.ultimo.tipo, 'cucu'); assert.deepEqual(s.carte.map(c => c.numero), [7, 2, 10, 4]); assert.equal(s.turno, 2);
assert.ok(C.gioca(s, { tieni: true }));
assert.equal(s.turno, 3); assert.deepEqual(C.mosseLegali(s).map(m => Object.keys(m)[0]), ['tieni', 'mazzo']);
console.log('OK   scambio con il giocatore successivo, il re (cucù) blocca lo scambio');

// Il mazziere tiene: si chiude la mano, perde chi ha la più bassa
assert.ok(C.gioca(s, { tieni: true }));
assert.equal(s.fase, 'fine'); assert.deepEqual(s.persi, [1]); assert.deepEqual(s.vite, [3, 2, 3, 3]);
assert.ok(C.gioca(s, { prossima: true }));
assert.equal(s.mazziere, 0); assert.equal(s.turno, 1); assert.equal(s.fase, 'turni'); assert.equal(s.mano, 2);
console.log('OK   la carta più bassa perde una vita, il mazziere passa al successivo');

// Mazziere con il mazzo: un re pescato non vale
const mazzo = C.crea(2, seme(2));
mazzo.carte = [carta(5), carta(1)];
C.gioca(mazzo, { tieni: true });
mazzo.mazzo = [carta(10, 'spade')];
assert.ok(C.gioca(mazzo, { mazzo: true }));
assert.equal(mazzo.ultimo.tipo, 'cucuMazzo'); assert.equal(mazzo.carte[1].numero, 1); assert.deepEqual(mazzo.persi, [1]);
const mazzo2 = C.crea(2, seme(3)); mazzo2.carte = [carta(5), carta(1)]; C.gioca(mazzo2, { tieni: true }); mazzo2.mazzo = [carta(9, 'spade')];
assert.ok(C.gioca(mazzo2, { mazzo: true })); assert.equal(mazzo2.carte[1].numero, 9); assert.deepEqual(mazzo2.persi, [0]);
console.log('OK   il mazziere spacca il mazzo; se pesca un re tiene la sua carta');

// Pari merito: perdono tutti i pari; se sono tutti pari la mano è nulla
const pari = C.crea(3, seme(4)); pari.carte = [carta(3), carta(3, 'spade'), carta(8)];
C.gioca(pari, { tieni: true }); C.gioca(pari, { tieni: true }); C.gioca(pari, { tieni: true });
assert.deepEqual(pari.persi, [0, 1]);
const nulla = C.crea(2, seme(5)); nulla.carte = [carta(6), carta(6, 'coppe')];
C.gioca(nulla, { tieni: true }); C.gioca(nulla, { tieni: true });
assert.deepEqual(nulla.persi, []); assert.deepEqual(nulla.vite, [3, 3]);
console.log('OK   a pari merito perdono tutti; se tutti sono pari la mano è nulla');

// Eliminati saltati; fine partita
const fine = C.crea(3, seme(6)); fine.vite = [1, 0, 1]; fine.carte = [carta(2), null, carta(9)]; fine.turno = 0; fine.mazziere = 2;
assert.ok(C.gioca(fine, { cambia: true })); // salta il giocatore 1 eliminato: scambia con il 2
assert.deepEqual([fine.carte[0].numero, fine.carte[2].numero], [9, 2]);
C.gioca(fine, { tieni: true });
assert.equal(fine.finita, true); assert.equal(fine.vincitore, 0); assert.equal(C.mosseLegali(fine).length, 0);
console.log('OK   gli eliminati non giocano; vince l’ultimo rimasto');

for (let i = 1; i <= 300; i++) {
    const n = 2 + i % 5, st = C.crea(n, seme(i)); let azioni = 0;
    while (!st.finita) {
        const legali = C.mosseLegali(st), m = i % 2 ? C.mossaPC(st) : legali[Math.floor(seme(i + azioni)() * legali.length)];
        assert.ok(C.gioca(st, m)); assert.ok(++azioni < 5000);
        assert.ok(st.vite.every(v => v >= 0));
        if (st.fase === 'turni') assert.ok(st.vite[st.turno] > 0, 'gioca solo chi è vivo');
    }
    assert.equal(st.vite.filter(v => v > 0).length, 1); assert.ok(st.vite[st.vincitore] > 0);
}
console.log('OK   300 partite complete da 2 a 6 giocatori: un solo vincitore');
console.log('Tutti i controlli sono passati');
