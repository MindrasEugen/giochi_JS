// Test di Cambio colore: node cambio_colore/test-cambio-colore.js
const assert = require('node:assert/strict');
const C = require('./funzioni');
const seme = n => { let s = n; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
let id = 1000;
const c = (tipo, colore = null, valore) => ({ id: id++, tipo, colore, ...(valore !== undefined ? { valore } : {}) });
const n = (valore, colore) => c('numero', colore, valore);

const mazzo = C.creaMazzo();
assert.equal(mazzo.length, 108); assert.equal(new Set(mazzo.map(x => x.id)).size, 108);
assert.equal(mazzo.filter(x => x.tipo === 'cambio4').length, 4); assert.equal(mazzo.filter(x => x.colore === 'menta').length, 25);
const s0 = C.crea(3, seme(1));
assert.ok(s0.mani.every(m => m.length === 7)); assert.equal(C.cima(s0).tipo, 'numero');
console.log('OK   mazzo originale di 108 carte, 7 a testa, prima carta un numero');

function partita(giocatori, mani, sopra, colore = sopra.colore) {
    const s = C.crea(giocatori, seme(2));
    s.mani = mani; s.scarti = [sopra]; s.colore = colore;
    return s;
}
// Stesso colore o stesso numero/simbolo
let s = partita(2, [[n(5, 'notte'), n(3, 'sole'), c('giro', 'menta'), n(8, 'corallo')], [n(1, 'sole')]], n(3, 'menta'));
assert.deepEqual(C.mosseLegali(s).map(m => m.carta ?? Object.keys(m)[0]), [1, 2, 'pesca']);
console.log('OK   si risponde con lo stesso colore o lo stesso numero');

// Cambio + 4 solo senza carte del colore richiesto
s = partita(2, [[c('cambio4'), n(2, 'menta')], [n(1, 'sole')]], n(7, 'menta'));
assert.ok(!C.mosseLegali(s).some(m => m.carta === 0));
s = partita(2, [[c('cambio4'), n(2, 'sole'), n(4, 'notte')], [n(1, 'sole'), n(9, 'notte')]], n(7, 'menta'));
assert.ok(C.gioca(s, { carta: 0 })); assert.equal(s.turno, 0); assert.deepEqual(C.mosseLegali(s).map(m => m.colore), C.COLORI);
assert.ok(C.gioca(s, { colore: 'notte' }));
assert.equal(s.colore, 'notte'); assert.equal(s.mani[1].length, 6); assert.equal(s.turno, 0); // l'altro pesca 4 e salta
console.log('OK   cambio + 4: solo senza il colore richiesto, si sceglie il colore, l’altro pesca 4 e salta');

// Fermo e giro a tre giocatori; pesca 2
s = partita(3, [[c('fermo', 'sole'), n(1, 'sole')], [n(2, 'sole')], [n(3, 'sole')]], n(5, 'sole'));
C.gioca(s, { carta: 0 }); assert.equal(s.turno, 2);
s = partita(3, [[c('giro', 'sole'), n(1, 'sole')], [n(2, 'sole')], [n(3, 'sole'), n(4, 'sole')]], n(5, 'sole'));
C.gioca(s, { carta: 0 }); assert.equal(s.turno, 2); assert.equal(s.verso, -1);
C.gioca(s, { carta: 0 }); assert.equal(s.turno, 1);
s = partita(2, [[c('giro', 'sole'), n(1, 'sole')], [n(2, 'sole')]], n(5, 'sole'));
C.gioca(s, { carta: 0 }); assert.equal(s.turno, 0); // in due il giro fa saltare l'altro
s = partita(3, [[c('piu2', 'sole'), n(1, 'sole')], [n(2, 'sole')], [n(3, 'sole')]], n(5, 'sole'));
C.gioca(s, { carta: 0 }); assert.equal(s.mani[1].length, 3); assert.equal(s.turno, 2);
console.log('OK   fermo, giro (che in due vale come fermo) e pesca 2');

// Pesca: se la carta pescata si può giocare si sceglie, altrimenti il turno passa
s = partita(2, [[n(9, 'notte')], [n(1, 'sole')]], n(5, 'sole'));
s.mazzo = [n(5, 'menta'), ...s.mazzo];
C.gioca(s, { pesca: true }); assert.equal(s.turno, 0); assert.deepEqual(C.mosseLegali(s).map(m => m.carta ?? 'passa'), [1, 'passa']);
s = partita(2, [[n(9, 'notte')], [n(1, 'sole')]], n(5, 'sole'));
s.mazzo = [n(2, 'menta'), ...s.mazzo];
C.gioca(s, { pesca: true }); assert.equal(s.turno, 1); assert.equal(s.mani[0].length, 2);
console.log('OK   la carta pescata si gioca subito solo se è valida');

// Vittoria con l'ultima carta
s = partita(2, [[n(5, 'sole')], [n(1, 'sole')]], n(7, 'sole'));
C.gioca(s, { carta: 0 }); assert.equal(s.finita, true); assert.equal(s.vincitore, 0); assert.equal(C.mosseLegali(s).length, 0);
console.log('OK   vince chi resta senza carte');

const privata = C.crea(2, seme(5)); privata.mani[1] = new Proxy(privata.mani[1], { get(t, k) { if (k === 'length') return t.length; throw new Error('Il PC legge la mano avversaria'); } });
assert.ok(C.mossaPC(privata));
for (let i = 1; i <= 300; i++) {
    const g = 2 + i % 3, st = C.crea(g, seme(i)); let mosse = 0;
    while (!st.finita) {
        const legali = C.mosseLegali(st), m = st.turno % 2 ? C.mossaPC(st) : legali[Math.floor(seme(i * 7 + mosse)() * legali.length)];
        assert.ok(C.gioca(st, m)); assert.ok(++mosse < 3000);
        assert.equal(st.mazzo.length + st.scarti.length + st.mani.flat().length, 108);
        assert.ok(C.COLORI.includes(st.colore));
    }
    assert.equal(st.mani[st.vincitore].length, 0);
}
console.log('OK   300 partite da 2 a 4 giocatori: 108 carte sempre in gioco, il PC vede solo quante carte hanno gli altri');
console.log('Tutti i controlli sono passati');
