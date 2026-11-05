// Test dei solitari della Tappa 24 (TriPeaks, Yukon, Scorpione, Orologio, Le tredici): node js/test-solitari-2.js
const assert = require('node:assert/strict');
const M = require('./mazzo');
const T = require('../tripeaks/funzioni'), Y = require('../yukon/funzioni'), S = require('../scorpione/funzioni');
const O = require('../orologio/funzioni'), D = require('../tredici/funzioni');
const seme = n => { let s = n; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
const SEMI = { h: 'hearts', d: 'diamonds', c: 'clubs', s: 'spades' };
const c = (sigla, scoperta = true) => ({ carta: M.francese().find(x => x.valore === (sigla.slice(0, -1) === 't' ? '10' : sigla.slice(0, -1)) && x.seme === SEMI[sigla.at(-1)]), scoperta });
const carte = testo => testo ? testo.split(' ').map(x => c(x)) : [];
const conta = s => Object.values(s.pile).reduce((n, p) => n + p.length, 0);

// --- TriPeaks ---
let t = T.crea({}, seme(1));
assert.equal(T.POSTI.length, 28); assert.equal(t.pile.mazzo.length, 23); assert.equal(conta(t), 52);
assert.equal(T.POSTI.filter(x => T.libera(t, x.id)).length, 10); // solo la riga in basso è libera
assert.ok(T.POSTI.filter(x => x.r === 3).every(x => t.pile[x.id][0].scoperta));
T.POSTI.forEach(x => { t.pile[x.id] = []; });
t.pile.t18 = carte('5h'); t.pile.t19 = carte('4c'); t.pile.t9 = [c('qs', false)]; t.pile.base = carte('6d');
assert.equal(T.libera(t, 't9'), false);
assert.ok(T.autoBase(t, 't18')); assert.ok(T.autoBase(t, 't19'));  // 6 -> 5 -> 4
assert.ok(T.libera(t, 't9')); assert.ok(t.pile.t9[0].scoperta);      // la carta liberata si gira
t.pile.base = carte('kd'); t.pile.t9 = carte('ah');
assert.ok(T.autoBase(t, 't9'));                                      // asso sul re
console.log('OK   TriPeaks: tre picchi, carte libere che si girano, una in più o in meno anche tra re e asso');

// --- Yukon ---
let y = Y.crea({}, seme(2));
assert.deepEqual(Y.COLONNE.map(id => y.pile[id].length), [1, 6, 7, 8, 9, 10, 11]); assert.equal(conta(y), 52);
assert.deepEqual(Y.COLONNE.map(id => y.pile[id].filter(x => x.scoperta).length), [1, 5, 5, 5, 5, 5, 5]);
y.pile.c0 = carte('9h'); y.pile.c1 = [c('2c', false), c('8s'), c('3d'), c('jh')];
assert.ok(Y.sposta(y, 'c1', 1, 'c0'));                               // l'8 nero con sopra carte in disordine
assert.equal(y.pile.c0.length, 4); assert.ok(y.pile.c1[0].scoperta);
assert.equal(Y.sposta(y, 'c0', 0, 'c1'), false);
console.log('OK   Yukon: si sposta qualunque carta scoperta con quelle sopra, anche non in ordine');

// --- Scorpione ---
let sc = S.crea({}, seme(3));
assert.ok(S.COLONNE.every(id => sc.pile[id].length === 7)); assert.equal(sc.pile.mazzo.length, 3); assert.equal(conta(sc), 52);
assert.ok(S.COLONNE.slice(0, 4).every(id => sc.pile[id].slice(0, 3).every(x => !x.scoperta)));
sc.pile.c0 = carte('9h'); sc.pile.c1 = [c('8h'), c('kc'), c('2d')];
assert.ok(S.sposta(sc, 'c1', 0, 'c0'));                              // stesso seme, valore inferiore
sc.pile.c2 = carte('8s'); assert.equal(S.sposta(sc, 'c2', 0, 'c0'), false); // seme diverso
sc.pile.c3 = [];
assert.equal(S.sposta(sc, 'c0', 0, 'c3'), false);                    // in colonna vuota solo il re
sc.pile.c4 = carte('kc qc jc tc 9c 8c 7c 6c 5c 4c 3c'); sc.pile.c5 = carte('2c ac');
assert.ok(S.sposta(sc, 'c5', 0, 'c4')); assert.equal(sc.pile.fatte.length, 13);
const riserva = S.crea({}, seme(4)); const prima = riserva.pile.c0.length;
assert.ok(S.clicMazzo(riserva)); assert.equal(riserva.pile.c0.length, prima + 1); assert.equal(S.clicMazzo(riserva), false);
console.log('OK   Scorpione: stesso seme, re nelle colonne vuote, scala completa che esce, riserva una volta sola');

// --- Orologio ---
let o = O.crea({}, seme(5));
assert.equal(conta(o), 52); assert.equal(o.pile.mano.length, 1);
const sbagliata = O.destinazione(o) === 'o1' ? 'o2' : 'o1';
assert.equal(O.autoBase(o, sbagliata), false);                       // solo il mucchio della carta in mano
let passi = 0;
while (!O.vinto(o) && !O.bloccata(o)) {
    const meta = O.destinazione(o);
    assert.ok(O.autoBase(o, meta)); assert.ok(++passi <= 52);
    if (!O.bloccata(o) && !O.vinto(o)) assert.ok(o.pile[meta].at(-1).scoperta); // la carta sistemata resta in cima
}
assert.equal(conta(o), 52);
let vinte = 0;
for (let i = 1; i <= 300; i++) { const x = O.crea({}, seme(i)); while (!O.vinto(x) && !O.bloccata(x)) O.autoBase(x, O.destinazione(x)); if (O.vinto(x)) { vinte++; assert.equal(O.scoperte(x), 52); } }
assert.ok(vinte > 0 && vinte < 60, `vinte ${vinte}`);                // in teoria una partita su 13
console.log(`OK   Orologio: la carta va al mucchio della sua ora, si perde con il quarto re (vinte ${vinte} su 300, attese circa 23)`);

// --- Le tredici ---
let d = D.crea({}, seme(6));
assert.ok(D.COLONNE.every(id => d.pile[id].length === 4)); assert.equal(conta(d), 52);
// I re stanno in fondo: nessun re sopra una carta che non sia un re
assert.ok(D.COLONNE.every(id => d.pile[id].every((x, i, a) => x.carta.numero !== 13 || a.slice(0, i).every(z => z.carta.numero === 13))));
d.pile.c0 = carte('9h'); d.pile.c1 = carte('5d 8s'); d.pile.c2 = [];
assert.ok(D.sposta(d, 'c1', 1, 'c0'));                               // seme qualunque
assert.equal(D.sposta(d, 'c1', 0, 'c2'), false);                     // le colonne vuote restano vuote
d.pile.c3 = carte('2s 3s'); assert.equal(D.sposta(d, 'c3', 0, 'c1'), false); // solo la carta in cima
console.log('OK   Le tredici: re in fondo, una carta alla volta di valore inferiore, colonne vuote che restano vuote');

// Mosse a caso: nessuna carta persa
for (const motore of [T, Y, S, O, D]) for (let i = 1; i <= 30; i++) {
    const st = motore.crea({}, seme(i)), casuale = seme(i * 7), ids = Object.keys(st.pile);
    for (let passo = 0; passo < 300; passo++) {
        if (motore.clicMazzo && casuale() < 0.1) motore.clicMazzo(st);
        const da = ids[Math.floor(casuale() * ids.length)], a = ids[Math.floor(casuale() * ids.length)];
        if (st.pile[da].length) motore.sposta(st, da, Math.floor(casuale() * st.pile[da].length), a);
        if (casuale() < 0.2) motore.autoBase(st, a);
        assert.equal(conta(st), 52);
    }
}
console.log('OK   150 partite con mosse a caso: nessuna carta persa o duplicata');
console.log('Tutti i controlli sono passati');
