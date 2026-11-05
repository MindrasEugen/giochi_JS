// Test del Blackjack: node blackjack/test-blackjack.js
const assert = require('node:assert/strict');
const B = require('./funzioni'), M = require('../js/mazzo');
const carta = (valore, seme = 'spades') => M.francese().find(c => c.valore === String(valore) && c.seme === seme);
const seme = n => { let s = n; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
const v = (...valori) => B.valore(valori.map(x => carta(x)));

assert.deepEqual(v('a', 'k'), { totale: 21, morbida: true });
assert.deepEqual(v('a', 6), { totale: 17, morbida: true });
assert.deepEqual(v('a', 6, 9), { totale: 16, morbida: false });     // l'asso torna a valere 1
assert.deepEqual(v('a', 'a', 9), { totale: 21, morbida: true });     // un asso 11, l'altro 1
assert.deepEqual(v('a', 'a', 'a', 'a'), { totale: 14, morbida: true });
assert.deepEqual(v('k', 'q', 2), { totale: 22, morbida: false });
console.log('OK   valore della mano: assi da 1 o 11, figure da 10');

// Mano preparata: le carte della scarpa sono messe in ordine dal test
function mano(modalita, carteInOrdine, fiches) {
    const s = B.crea(modalita, seme(1));
    s.scarpa = [...carteInOrdine.map(x => carta(x)), ...s.scarpa];
    if (fiches) s.fiches = fiches;
    return s;
}
// Ordine di distribuzione: giocatore, banco, giocatore, banco (coperta)
let s = mano('uno', [10, 9, 'a', 7]);
assert.ok(B.gioca(s, { punta: 20 }));
assert.equal(s.fase, 'fine'); assert.equal(s.esiti[0].esito, 'blackjack'); assert.equal(s.fiches[0], 230);
console.log('OK   blackjack servito pagato 3 a 2');

s = mano('uno', [10, 'a', 9, 'k']);
B.gioca(s, { punta: 10 });
assert.equal(s.fase, 'fine'); assert.equal(s.esiti[0].esito, 'persa'); assert.equal(s.fiches[0], 190);
console.log('OK   blackjack del banco: la mano si chiude subito');

s = mano('uno', [10, 10, 6, 6, 9]);  // giocatore 16, banco 16: il banco pesca il 9 e sballa
B.gioca(s, { punta: 10 }); assert.ok(B.gioca(s, { stai: true }));
assert.equal(s.fase, 'fine'); assert.equal(B.valore(s.bancoCarte).totale, 25); assert.equal(s.esiti[0].esito, 'vinta'); assert.equal(s.fiches[0], 210);
s = mano('uno', [10, 10, 7, 'a']);   // banco 21 morbido? no: 10 + asso = blackjack
B.gioca(s, { punta: 10 }); assert.equal(s.esiti[0].esito, 'persa');
s = mano('uno', [10, 10, 8, 7]);     // 18 contro 17: il banco sta su 17
B.gioca(s, { punta: 10 }); B.gioca(s, { stai: true }); assert.equal(s.bancoCarte.length, 2); assert.equal(s.esiti[0].esito, 'vinta');
s = mano('uno', [10, 10, 7, 7]);
B.gioca(s, { punta: 10 }); B.gioca(s, { stai: true }); assert.equal(s.esiti[0].esito, 'pari'); assert.equal(s.fiches[0], 200);
console.log('OK   il banco del PC pesca fino a 17; vinta 1 a 1, pareggio restituito');

s = mano('uno', [5, 10, 6, 7, 10]);  // 11 contro 17: raddoppio con un 10
B.gioca(s, { punta: 20 }); assert.ok(B.mosseLegali(s).some(m => m.raddoppia));
assert.ok(B.gioca(s, { raddoppia: true }));
assert.equal(s.esiti[0].esito, 'vinta'); assert.equal(s.esiti[0].vincita, 40); assert.equal(s.fiches[0], 240);
console.log('OK   raddoppio: puntata doppia e una sola carta');

s = mano('uno', [8, 10, 8, 7, 3, 10]);  // due 8: divisione, poi 8+3 e 8+10
B.gioca(s, { punta: 10 }); assert.ok(B.mosseLegali(s).some(m => m.dividi));
assert.ok(B.gioca(s, { dividi: true }));
assert.equal(s.mani.length, 2); assert.deepEqual(s.mani.map(m => B.valore(m.carte).totale), [11, 18]);
B.gioca(s, { stai: true }); B.gioca(s, { stai: true });
assert.deepEqual(s.esiti.map(e => e.esito), ['persa', 'vinta']); assert.equal(s.fiches[0], 200);
const assi = mano('uno', ['a', 10, 'a', 7, 'k', 'q']);
B.gioca(assi, { punta: 10 }); B.gioca(assi, { dividi: true });
assert.equal(assi.fase, 'fine'); assert.ok(assi.mani.every(m => m.carte.length === 2));
assert.deepEqual(assi.esiti.map(e => e.esito), ['vinta', 'vinta']); // 21 dopo la divisione vale 21, non blackjack
console.log('OK   divisione in due mani; con due assi una sola carta per mano e niente blackjack');

s = mano('uno', [10, 10, 6, 7, 'k']);
B.gioca(s, { punta: 10 }); B.gioca(s, { carta: true });
assert.equal(s.fase, 'fine'); assert.equal(s.esiti[0].esito, 'sballata'); assert.equal(s.bancoCarte.length, 2);
console.log('OK   chi sballa perde subito, il banco non pesca');

// Due giocatori: il banco è una persona, decide lei e paga con le sue fiches; i ruoli si scambiano
const due = mano('due', [10, 10, 9, 5, 4]);
assert.equal(B.giocatore(due), 0); assert.equal(due.banco, 1);
B.gioca(due, { punta: 20 }); B.gioca(due, { stai: true });
assert.equal(due.fase, 'banco'); assert.deepEqual(B.mosseLegali(due).map(m => Object.keys(m)[0]), ['carta', 'stai']);
B.gioca(due, { carta: true });                 // banco 15 + 4 = 19: vince contro 19? pari
assert.equal(B.valore(due.bancoCarte).totale, 19); B.gioca(due, { stai: true });
assert.equal(due.esiti[0].esito, 'pari');
B.gioca(due, { prossima: true });
assert.equal(due.banco, 0); assert.equal(B.giocatore(due), 1);
const paga = mano('due', [10, 10, 'a', 6, 10], [200, 15]);
B.gioca(paga, { punta: 10 }); B.gioca(paga, { stai: true }); B.gioca(paga, { stai: true });
assert.equal(paga.esiti[0].esito, 'blackjack'); assert.deepEqual(paga.fiches, [215, 0]); // il banco paga solo quello che ha
B.gioca(paga, { prossima: true }); assert.equal(paga.finita, true);
console.log('OK   in due il banco è una persona, paga con le sue fiches, i ruoli si scambiano');

for (const modalita of ['uno', 'due']) for (let i = 1; i <= 200; i++) {
    const st = B.crea(modalita, seme(i)); let azioni = 0;
    while (!st.finita && st.numeroMano <= 40) {
        const legali = B.mosseLegali(st), m = i % 2 ? (st.fase === 'banco' ? legali[B.valore(st.bancoCarte).totale < 17 ? 0 : 1] : B.consiglio(st)) : legali[Math.floor(seme(i + azioni)() * legali.length)];
        assert.ok(B.gioca(st, m)); assert.ok(++azioni < 5000);
        assert.ok(st.fiches[0] >= 0 && st.fiches[1] >= 0);
        if (modalita === 'due') assert.equal(st.fiches[0] + st.fiches[1], 400);
    }
}
console.log('OK   400 partite simulate: fiches mai negative, in due il totale resta 400');
console.log('Tutti i controlli sono passati');
