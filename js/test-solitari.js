// Test dei solitari della Tappa 23 (Klondike, FreeCell, Spider, Piramide, Golf): node js/test-solitari.js
const assert = require('node:assert/strict');
const M = require('./mazzo');
const K = require('../klondike/funzioni'), F = require('../freecell/funzioni'), S = require('../spider/funzioni');
const P = require('../piramide/funzioni'), G = require('../golf/funzioni');
const seme = n => { let s = n; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
const SEMI = { h: 'hearts', d: 'diamonds', c: 'clubs', s: 'spades' };
const c = (sigla, scoperta = true) => ({ carta: M.francese().find(x => x.valore === (sigla.slice(0, -1) === 't' ? '10' : sigla.slice(0, -1)) && x.seme === SEMI[sigla.at(-1)]), scoperta });
const carte = testo => testo ? testo.split(' ').map(x => c(x)) : [];
const contaCarte = s => Object.values(s.pile).reduce((n, p) => n + p.length, 0);

// --- Klondike ---
let k = K.crea({ pesca: 1 }, seme(1));
assert.deepEqual(K.COLONNE.map(id => k.pile[id].length), [1, 2, 3, 4, 5, 6, 7]);
assert.ok(K.COLONNE.every(id => k.pile[id].at(-1).scoperta && k.pile[id].slice(0, -1).every(x => !x.scoperta)));
assert.equal(k.pile.mazzo.length, 24); assert.equal(contaCarte(k), 52);
k.pile.c0 = carte('8s'); k.pile.c1 = [c('kd', false), c('9h')]; k.pile.c2 = [];
assert.ok(K.sposta(k, 'c0', 0, 'c1'));                 // 8 nero su 9 rosso
assert.equal(K.sposta(k, 'c1', 1, 'c0'), false);        // colonna vuota: solo un re
k.pile.c3 = [c('qs', false), c('kh')];
assert.ok(K.sposta(k, 'c3', 1, 'c2')); assert.ok(k.pile.c3[0].scoperta); // si scopre la carta sotto
assert.ok(K.sposta(k, 'c1', 1, 'c3') === false);
k.pile.scarti = carte('ah'); k.pile.f0 = [];
assert.ok(K.autoBase(k, 'scarti')); assert.equal(k.pile.f0.length, 1);
k.pile.scarti = carte('3h'); assert.equal(K.autoBase(k, 'scarti'), false); // serve prima il 2
const tre = K.crea({ pesca: 3 }, seme(2));
K.clicMazzo(tre); assert.equal(tre.pile.scarti.length, 3); assert.equal(tre.pile.mazzo.length, 21);
while (tre.pile.mazzo.length) K.clicMazzo(tre);
K.clicMazzo(tre); assert.equal(tre.pile.mazzo.length, 24); assert.equal(tre.pile.scarti.length, 0); assert.equal(tre.giri, 1);
const facile = K.crea({}, seme(3));
['hearts', 'diamonds', 'clubs', 'spades'].forEach((sm, i) => { facile.pile[`f${i}`] = M.francese().filter(x => x.seme === sm && x.numero < 13).map(x => ({ carta: x, scoperta: true })); });
K.COLONNE.forEach(id => { facile.pile[id] = []; }); facile.pile.mazzo = []; facile.pile.scarti = [];
['hearts', 'diamonds', 'clubs', 'spades'].forEach((sm, i) => { facile.pile[`c${i}`] = [{ carta: M.francese().find(x => x.seme === sm && x.numero === 13), scoperta: true }]; });
assert.ok(K.completabile(facile)); assert.ok(K.completa(facile)); assert.ok(K.vinto(facile));
console.log('OK   Klondike: distribuzione, colori alterni, re sulle colonne vuote, basi, pesca 1 e 3, completamento');

// --- FreeCell ---
let f = F.crea({}, seme(4));
assert.equal(contaCarte(f), 52); assert.deepEqual(F.COLONNE.map(id => f.pile[id].length), [7, 7, 7, 7, 6, 6, 6, 6]);
for (let i = 1; i <= 8; i++) assert.ok(F.risolvi(F.crea({}, seme(100 + i))), 'ogni partita data è risolvibile');
f.pile = { k0: [], k1: [], k2: [], k3: [], f0: [], f1: [], f2: [], f3: [], t0: carte('9h 8s 7h 6s'), t1: carte('tc'), t2: [], t3: [], t4: [], t5: [], t6: [], t7: [] };
assert.equal(F.capacita(f, 't1'), (4 + 1) * 2 ** 6);
f.pile.t2 = carte('2c'); f.pile.t3 = carte('3c'); f.pile.t4 = carte('4c'); f.pile.t5 = carte('5c'); f.pile.t6 = carte('jc'); f.pile.t7 = carte('qc');
f.pile.k0 = carte('ad'); f.pile.k1 = carte('ah'); f.pile.k2 = carte('as'); // una cella libera, nessuna colonna vuota
assert.equal(F.capacita(f, 't1'), 2);
assert.equal(F.sposta(f, 't0', 0, 't1'), false);     // 4 carte: troppe
assert.equal(F.sposta(f, 't0', 2, 'k3'), false);     // due carte non vanno in una cella
assert.ok(F.sposta(f, 't0', 3, 'k3')); assert.equal(f.pile.k3.length, 1);
assert.equal(F.sposta(f, 'f0', 0, 't0'), false);      // dalle basi non si riprende
console.log('OK   FreeCell: partite risolvibili (risolutore), spostamento di più carte secondo celle e colonne libere');

// --- Spider ---
for (const n of [1, 2, 4]) {
    const sp = S.crea({ semi: n }, seme(5));
    assert.equal(contaCarte(sp), 104); assert.equal(sp.pile.mazzo.length, 50);
    assert.equal(new Set(Object.values(sp.pile).flat().map(x => x.carta.seme)).size, n);
}
let sp = S.crea({ semi: 2 }, seme(6));
S.COLONNE.forEach(id => { sp.pile[id] = carte('9s'); });
sp.pile.c0 = carte('9s 8h'); sp.pile.c1 = carte('7h 6h');
assert.equal(S.sposta(sp, 'c0', 0, 'c2'), false);     // 9-8 di semi diversi non si spostano insieme
assert.ok(S.sposta(sp, 'c1', 0, 'c0'));               // 7-6 di cuori sull'8 (seme qualunque)
const scala = 'ks qs js ts 9s 8s 7s 6s 5s 4s 3s 2s'.split(' ');
sp.pile.c3 = carte(scala.join(' ')); sp.pile.c4 = carte('as');
assert.ok(S.sposta(sp, 'c4', 0, 'c3')); assert.equal(sp.pile.fatte.length, 13); assert.equal(sp.pile.c3.length, 0);
sp.pile.mazzo = Array.from({ length: 10 }, () => c('5d', false));
assert.equal(S.clicMazzo(sp), false); assert.match(sp.errore, /colonne vuote/);
sp.pile.c1 = carte('2d'); sp.pile.c3 = carte('2d'); sp.pile.c4 = carte('2d');
assert.ok(S.clicMazzo(sp)); assert.ok(S.COLONNE.every(id => sp.pile[id].at(-1).scoperta));
console.log('OK   Spider: 1, 2 o 4 semi, sequenze dello stesso seme, scala completa che esce, distribuzione');

// --- Piramide ---
let p = P.crea({}, seme(7));
assert.equal(P.POSTI.length, 28); assert.equal(p.pile.mazzo.length, 24); assert.equal(contaCarte(p), 52);
assert.ok(P.libera(p, 'p27') && P.libera(p, 'p21')); assert.equal(P.libera(p, 'p0'), false);
P.POSTI.forEach(x => { p.pile[x.id] = []; });
p.pile.p21 = carte('5h'); p.pile.p22 = carte('8c'); p.pile.p15 = carte('kh');
assert.equal(P.libera(p, 'p15'), false);
assert.ok(P.sposta(p, 'p21', 0, 'p22'));              // 5 + 8 = 13
assert.ok(P.libera(p, 'p15')); assert.ok(P.autoBase(p, 'p15')); // il re da solo
assert.ok(P.vinto(p));
p = P.crea({}, seme(8)); p.pile.scarti = carte('qd'); P.POSTI.forEach(x => { p.pile[x.id] = []; }); p.pile.p27 = carte('ac');
assert.ok(P.sposta(p, 'scarti', 0, 'p27'));           // donna (12) + asso (1)
p = P.crea({}, seme(9));
for (let i = 0; i < 24 * 3 + 5; i++) P.clicMazzo(p);
assert.equal(p.giri, P.PASSAGGI - 1); assert.equal(P.clicMazzo(p), false);
console.log('OK   Piramide: carte libere, coppie da 13, re da solo, tre passaggi del mazzo');

// --- Golf ---
let g = G.crea({}, seme(10));
assert.ok(G.COLONNE.every(id => g.pile[id].length === 5)); assert.equal(g.pile.mazzo.length, 16); assert.equal(contaCarte(g), 52);
g.pile.base = carte('7h'); g.pile.g0 = carte('3c 8s'); g.pile.g1 = carte('6d'); g.pile.g2 = carte('9c');
assert.ok(G.autoBase(g, 'g0')); assert.ok(G.autoBase(g, 'g2')); assert.equal(G.autoBase(g, 'g1'), false); // 8, 9; poi il 6 no
g.pile.base = carte('kh'); g.pile.g3 = carte('ac');
assert.equal(G.autoBase(g, 'g3'), false);             // niente asso sul re
const prima = g.pile.mazzo.length; G.clicMazzo(g); assert.equal(g.pile.mazzo.length, prima - 1);
console.log('OK   Golf: una in più o una in meno, senza girare, carta dal mazzo');

// Partite giocate con mosse a caso: le carte restano tutte e le regole non si rompono
const motori = [[K, { pesca: 3 }, 52], [F, { senzaControllo: true }, 52], [S, { semi: 4 }, 104], [P, {}, 52], [G, {}, 52]];
for (const [motore, opzioni, totale] of motori) for (let i = 1; i <= 30; i++) {
    const st = motore.crea(opzioni, seme(i)), casuale = seme(i * 13), ids = Object.keys(st.pile);
    for (let passo = 0; passo < 400; passo++) {
        if (motore.clicMazzo && casuale() < 0.15) motore.clicMazzo(st);
        const da = ids[Math.floor(casuale() * ids.length)], a = ids[Math.floor(casuale() * ids.length)];
        const pila = st.pile[da]; if (!pila.length) continue;
        motore.sposta(st, da, Math.floor(casuale() * pila.length), a);
        if (casuale() < 0.1) motore.autoBase(st, da);
        assert.equal(contaCarte(st), totale);
    }
}
console.log('OK   150 partite con mosse a caso: nessuna carta persa o duplicata');
console.log('Tutti i controlli sono passati');
