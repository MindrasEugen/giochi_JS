// Test del Mercante in fiera: node mercante/test-mercante.js
const assert = require('node:assert/strict');
const T = require('./funzioni'), M = require('../js/mazzo');
const carta = (numero, seme = 'bastoni') => M.italiano().find(c => c.numero === numero && c.seme === seme);
const seme = n => { let s = n; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };

for (const [n, misura, premi] of [[2, 5, 2], [3, 3, 2], [4, 3, 3], [6, 2, 3]]) {
    const s = T.crea(n, seme(n));
    assert.equal(s.lotti[0].length, misura); assert.equal(s.lotti.flat().length, 40);
    assert.equal(s.premi.length, premi); assert.equal(s.estrazione.length, 40 - premi);
    assert.equal(s.piatto, 10 * n); assert.ok(s.fiches.every(f => f === 40));
}
console.log('OK   40 carte all’asta a lotti, 2 o 3 premi coperti, posta di 10 fiches nel piatto');

// Asta: rilanci, chi passa non rientra, vendita al migliore offerente
const s = T.crea(3, seme(1));
assert.deepEqual(T.mosseLegali(s).map(m => m.passa ? 'passo' : m.offri), ['passo', 1, 5]);
assert.ok(T.gioca(s, { offri: 1 }));      // 0 offre 1
assert.equal(T.gioca(s, { offri: 4 }), false); // solo +1 o +5 rispetto all'offerta migliore
assert.ok(T.gioca(s, { offri: 2 }));      // 1 offre 2
assert.ok(T.gioca(s, { passa: true }));   // 2 passa
assert.equal(s.turno, 0);
assert.ok(T.gioca(s, { passa: true }));   // 0 passa: vince 1
assert.equal(s.lotto, 1); assert.equal(s.possedute[1].length, 3); assert.equal(s.fiches[1], 38); assert.equal(s.piatto, 32);
assert.equal(s.turno, 1);                 // il lotto successivo lo apre il giocatore 1
console.log('OK   asta: rilanci di 1 o 5, chi passa non rientra, il lotto va al migliore offerente');

for (let g = 0; g < 3; g++) { const t = s.turno; assert.ok(T.gioca(s, { passa: true })); assert.notEqual(s.turno, t); if (s.lotto === 2) break; }
assert.equal(s.invendute.length, 3);
console.log('OK   un lotto senza offerte resta invenduto');

// Estrazione ed eliminazione, poi premi
const e = T.crea(2, seme(2));
e.fase = 'estrazione'; e.possedute = [[carta(1), carta(2)], [carta(3)]]; e.piatto = 100; e.fiches = [0, 0];
e.premi = [carta(2), carta(5)]; e.estrazione = [carta(1), carta(4)];
assert.ok(T.gioca(e, { estrai: true })); assert.deepEqual(e.possedute[0].map(c => c.numero), [2]); assert.equal(e.ultimo.giocatore, 0);
assert.ok(T.gioca(e, { estrai: true })); assert.equal(e.ultimo.giocatore, -1); assert.equal(e.fase, 'premi');
assert.ok(T.gioca(e, { rivela: true }));  // prima l'ultimo premio: il 5, che nessuno ha
assert.equal(e.alBanco, 40); assert.equal(e.premiRivelati[0].posizione, 2);
assert.ok(T.gioca(e, { rivela: true }));  // poi il primo: il 2 del giocatore 0
assert.equal(e.fiches[0], 60); assert.equal(e.finita, true);
assert.deepEqual(T.risultato(e).vincitori, [0]);
console.log('OK   ogni estratta elimina la gemella; premi dall’ultimo al primo, senza proprietario al banco');

for (let i = 1; i <= 300; i++) {
    const n = 2 + i % 5, st = T.crea(n, seme(i)); let azioni = 0;
    while (!st.finita) {
        const legali = T.mosseLegali(st), m = i % 3 ? T.mossaPC(st) : legali[Math.floor(seme(i * 13 + azioni)() * legali.length)];
        assert.ok(T.gioca(st, m)); assert.ok(++azioni < 4000);
        assert.ok(st.fiches.every(f => f >= 0));
        // Fiches dei giocatori + piatto non ancora distribuito + banco = fiches iniziali
        const distribuite = st.premiRivelati.reduce((a, p) => a + p.importo, 0);
        assert.equal(st.fiches.reduce((a, b) => a + b, 0) + st.piatto - distribuite + st.alBanco, n * 50);
    }
    assert.equal(st.fiches.reduce((a, b) => a + b, 0) + st.alBanco, n * 50);
    assert.equal(st.estratte.length, 40 - st.premi.length);
    // Alla fine restano solo le carte gemelle dei premi
    st.possedute.flat().forEach(c => assert.ok(st.premi.some(p => T.stessa(p, c))));
}
console.log('OK   300 partite complete da 2 a 6 giocatori: fiches conservate, restano solo le gemelle dei premi');
console.log('Tutti i controlli sono passati');
