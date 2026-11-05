// Test delle combinazioni (scale e tris con jolly): node js/test-combinazioni.js
const assert = require('node:assert/strict');
const C = require('./combinazioni'), M = require('./mazzo');
const SEMI = { h: 'hearts', d: 'diamonds', c: 'clubs', s: 'spades' };
let id = 1000;
const c = sigla => sigla === 'J*' ? { ...C.JOLLY, id: id++ } : { ...M.francese().find(k => k.valore === (sigla.slice(0, -1) === 't' ? '10' : sigla.slice(0, -1)) && k.seme === SEMI[sigla.at(-1)]), id: id++ };
const carte = testo => testo.split(' ').map(c);
const a = testo => C.analizza(carte(testo));

const m = C.mazzo();
assert.equal(m.length, 108); assert.equal(m.filter(x => x.jolly).length, 4); assert.equal(new Set(m.map(x => x.id)).size, 108);
console.log('OK   due mazzi francesi e 4 jolly, ogni carta con un id unico');

assert.equal(a('3h 4h 5h').tipo, 'scala'); assert.equal(a('5h 3h 4h').tipo, 'scala'); // l'ordine non conta
assert.equal(a('ah 2h 3h').tipo, 'scala'); assert.equal(a('qh kh ah').tipo, 'scala');
assert.equal(a('kh ah 2h'), null);                   // l'asso non sta in mezzo
assert.equal(a('3h 4h 5d'), null); assert.equal(a('5h 6h 8h'), null); assert.equal(a('3h 4h'), null);
console.log('OK   scale: stesso seme, consecutive, asso basso o alto ma non in mezzo, almeno 3 carte');

assert.equal(a('7h 7d 7c').tipo, 'tris'); assert.equal(a('7h 7d 7c 7s').tipo, 'tris');
assert.equal(a('7h 7h 7c'), null);                   // semi diversi
assert.equal(a('7h 7d 7c 7s 7h'), null);             // al massimo quattro
console.log('OK   tris e poker: stesso valore, semi tutti diversi, al massimo 4 carte');

assert.deepEqual(a('3h J* 5h').carte.map(x => x.valore), [3, 4, 5]);
assert.deepEqual(a('3h 4h J*').carte.map(x => x.valore), [3, 4, 5]);
assert.deepEqual(a('qh kh J*').carte.map(x => x.valore), [12, 13, 14]); // dopo il re il jolly fa l'asso
assert.deepEqual(a('qh kh ah J*').carte.map(x => x.valore), [11, 12, 13, 14]); // dopo l'asso non c'è posto: va prima
assert.equal(a('7h 7d J*').tipo, 'tris');
assert.equal(a('J* J* 5h'), null); assert.equal(a('3h J* J* 6h'), null); // un solo jolly per combinazione
console.log('OK   jolly: riempie un buco o allunga la scala, uno solo per combinazione');

assert.equal(C.puntiCombinazione(a('ah 2h 3h')), 6);   // asso basso vale 1
assert.equal(C.puntiCombinazione(a('qh kh ah')), 31);  // asso alto vale 11
assert.equal(C.puntiCombinazione(a('ah ad ac')), 33);
assert.equal(C.puntiCombinazione(a('9h J* jh')), 29);  // il jolly vale la carta che sostituisce (10)
assert.deepEqual(carte('ah kh 5c J*').map(C.puntiInMano), [11, 10, 5, 25]);
console.log('OK   punti: asso 1 o 11, figure 10, jolly come la carta sostituita; in mano jolly 25');

const tris = a('7h 7d 7c');
assert.ok(C.attacca(tris, c('7s'))); assert.equal(C.attacca(tris, c('7h')), null);
const scala = a('4s 5s 6s');
assert.ok(C.attacca(scala, c('3s'))); assert.ok(C.attacca(scala, c('7s'))); assert.equal(C.attacca(scala, c('9s')), null);
console.log('OK   attaccare una carta a tris e scale');

const mano = carte('ah kh qh jh 7c 7d 7s 2c 9d J* 4s 5s 6s');
const migliore = C.migliori(mano);
assert.equal(migliore.punti, 87); assert.equal(migliore.combinazioni.length, 3);
const ids = migliore.combinazioni.flatMap(k => k.carte.map(x => x.id));
assert.equal(new Set(ids).size, ids.length);
console.log('OK   le combinazioni migliori di una mano, senza carte ripetute');
console.log('Tutti i controlli sono passati');
