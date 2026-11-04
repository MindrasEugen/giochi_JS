// Test del Tressette: node tressette/test-tressette.js
const assert = require('node:assert/strict');
const T = require('./funzioni'), M = require('../js/mazzo');
const carta = (numero, seme = 'bastoni') => M.italiano().find(c => c.numero === numero && c.seme === seme);
const seme = n => { let s = n; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };

assert.equal(M.italiano().reduce((n, c) => n + T.terziCarta(c), 0), 32); // 10 punti e 2/3
assert.equal(T.vincitorePresa([{ giocatore: 0, carta: carta(1) }, { giocatore: 1, carta: carta(3) }]), 1);       // il tre batte l'asso
assert.equal(T.vincitorePresa([{ giocatore: 0, carta: carta(4) }, { giocatore: 1, carta: carta(3, 'coppe') }]), 0); // un altro seme non prende
assert.equal(T.vincitorePresa([{ giocatore: 0, carta: carta(10) }, { giocatore: 1, carta: carta(2) }, { giocatore: 2, carta: carta(1, 'spade') }, { giocatore: 3, carta: carta(7) }]), 1);
console.log('OK   forza: tre, due, asso, re... e solo il seme di uscita prende; 32 terzi nel mazzo');

const s = T.crea(2, seme(1));
assert.ok(s.mani.every(m => m.length === 10)); assert.equal(s.mazzo.length, 20);
s.mani[0] = [carta(5, 'coppe'), carta(3)]; s.mani[1] = [carta(1, 'coppe'), carta(2), carta(4, 'spade')];
assert.ok(T.gioca(s, { carta: 0 }));
assert.deepEqual(T.mosseLegali(s).map(m => m.carta), [0]); // deve rispondere a coppe
assert.equal(T.gioca(s, { carta: 1 }), false);
assert.ok(T.gioca(s, { carta: 0 }));
const primaPesca = s.mazzo.slice(0, 2);
assert.ok(T.raccogli(s));
assert.equal(s.turno, 1); assert.equal(s.terzi[1], 3);
assert.deepEqual(s.ultimo.pescate.map(p => p.giocatore), [1, 0]); // pesca prima chi ha preso
assert.deepEqual(s.ultimo.pescate.map(p => p.carta), primaPesca);
const piombo = T.crea(2, seme(2)); piombo.mani[0] = [carta(5, 'coppe')]; piombo.mani[1] = [carta(3), carta(2, 'spade')];
T.gioca(piombo, { carta: 0 }); assert.equal(T.mosseLegali(piombo).length, 2); // senza coppe si gioca qualunque carta
console.log('OK   obbligo di rispondere al seme, carta libera senza il seme, pesca a due mostrata');

const quattro = T.crea(4, seme(3));
assert.ok(quattro.mani.every(m => m.length === 10)); assert.equal(quattro.mazzo.length, 0);
console.log('OK   a quattro: 10 carte a testa, nessun mazzo');

for (const numero of [2, 4]) for (let i = 1; i <= 200; i++) {
    const casuale = seme(i), st = T.crea(numero, casuale); let mosse = 0;
    while (!st.finita) {
        if (st.presaCompleta) {
            const vince = T.vincitorePresa(st.tavolo); assert.ok(T.raccogli(st)); assert.equal(st.turno, vince);
        } else {
            const legali = T.mosseLegali(st), seme0 = st.tavolo[0]?.carta.seme;
            if (seme0 && st.mani[st.turno].some(c => c.seme === seme0)) assert.ok(legali.every(m => st.mani[st.turno][m.carta].seme === seme0));
            const m = i % 2 ? T.mossaPC(st) : legali[Math.floor(casuale() * legali.length)];
            assert.ok(T.gioca(st, m)); mosse++;
        }
        assert.equal(new Set([...st.mazzo, ...st.mani.flat(), ...st.catturate.flat(), ...st.tavolo.map(p => p.carta)].map(c => `${c.seme}-${c.numero}`)).size, 40);
    }
    assert.equal(mosse, 40); assert.equal(st.terzi[0] + st.terzi[1], 32);
    const r = T.risultato(st); assert.equal(r.punti[0] + r.punti[1], 11);
    const fine = JSON.stringify(st); assert.equal(T.gioca(st, { carta: 0 }), false); assert.equal(T.raccogli(st), false); assert.equal(JSON.stringify(st), fine);
}
const privata = T.crea(2, seme(9)); privata.mani[1] = new Proxy(privata.mani[1], { get() { throw new Error('Il PC legge la mano avversaria'); } });
assert.ok(T.mossaPC(privata));
console.log('OK   400 smazzate complete a 2 e a 4: sempre 11 punti, il PC non guarda le altre mani');
console.log('Tutti i controlli sono passati');
