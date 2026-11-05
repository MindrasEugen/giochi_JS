// Test della Guerra: node guerra/test-guerra.js
const assert = require('node:assert/strict');
const G = require('./funzioni'), M = require('../js/mazzo');
const carta = (valore, seme = 'spades') => M.francese().find(c => c.valore === String(valore) && c.seme === seme);
const seme = n => { let s = n; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };

const s = G.crea(seme(1));
assert.deepEqual(s.mazzi.map(m => m.length), [26, 26]);
assert.equal(G.forza(carta('a')), 14); assert.equal(G.forza(carta('k')), 13); assert.equal(G.forza(carta(2)), 2);
console.log('OK   26 carte a testa; l’asso è la carta più alta');

s.mazzi = [[carta('k'), carta(2)], [carta(9), carta(3)]];
assert.ok(G.gira(s));
assert.equal(s.ultimo.vincitore, 0); assert.equal(s.ultimo.prese, 2); assert.deepEqual(s.mazzi.map(m => m.length), [3, 1]);
console.log('OK   la carta più alta prende entrambe');

// Guerra: parità di 7, tre coperte a testa, poi la regina batte il 5
const guerra = G.crea(seme(2));
guerra.mazzi = [[carta(7), carta(2), carta(3), carta(4), carta('q'), carta(9)], [carta(7, 'hearts'), carta(2, 'hearts'), carta(3, 'hearts'), carta(4, 'hearts'), carta(5, 'hearts')]];
G.gira(guerra);
assert.equal(guerra.ultimo.guerre, 1); assert.equal(guerra.ultimo.vincitore, 0); assert.equal(guerra.ultimo.prese, 10);
assert.deepEqual(guerra.mazzi.map(m => m.length), [11, 0]); assert.equal(guerra.finita, true); assert.equal(guerra.vincitore, 0);
console.log('OK   guerra a parità: tre carte coperte e una scoperta, chi resta senza carte perde');

// Guerra con poche carte: si usano quelle che restano, tenendo l'ultima da scoprire
const corta = G.crea(seme(3));
corta.mazzi = [[carta(8), carta('j')], [carta(8, 'hearts'), carta(2, 'hearts'), carta(3, 'hearts'), carta(4, 'hearts'), carta(5, 'hearts')]];
G.gira(corta);
assert.equal(corta.ultimo.vincitore, 0); assert.equal(corta.mazzi[0].length, 7);
console.log('OK   guerra con poche carte: si scopre l’ultima rimasta');

for (let i = 1; i <= 300; i++) {
    const st = G.crea(seme(i));
    while (G.gira(st)) assert.equal(st.mazzi[0].length + st.mazzi[1].length, 52);
    assert.ok(st.finita && st.battaglie <= G.LIMITE);
    if (st.battaglie < G.LIMITE) assert.ok(st.mazzi.some(m => m.length === 0));
    assert.equal(G.gira(st), false);
}
console.log('OK   300 partite: 52 carte sempre in gioco, fine entro il limite di battaglie');
console.log('Tutti i controlli sono passati');
