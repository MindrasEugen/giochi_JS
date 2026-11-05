// Test del Burraco: node burraco/test-burraco.js
const assert = require('node:assert/strict');
const B = require('./funzioni'), C = require('../js/combinazioni'), M = require('../js/mazzo');
const SEMI = { h: 'hearts', d: 'diamonds', c: 'clubs', s: 'spades' };
const seme = n => { let s = n; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
let id = 9000;
const c = sigla => sigla === 'J*' ? { ...C.JOLLY, id: id++ } : { ...M.francese().find(k => k.valore === (sigla.slice(0, -1) === 't' ? '10' : sigla.slice(0, -1)) && k.seme === SEMI[sigla.at(-1)]), id: id++ };
const carte = testo => testo.split(' ').map(c);
const a = testo => C.analizza(carte(testo), B.REGOLE);
function partita(mani, tallone = '9c 9d 9h 9s 8c 8d 8h 8s 7c 7d', scarti = 'kc') {
    const s = B.crea(seme(1));
    s.mani = mani.map(carte); s.tallone = carte(tallone); s.scarti = carte(scarti); s.turno = 0; s.fase = 'pesca';
    return s;
}
const idDi = (s, ...sigle) => sigle.map(x => { const k = c(x); return s.mani[s.turno].find(y => y.seme === k.seme && y.numero === k.numero).id; });

const s0 = B.crea(seme(2));
assert.deepEqual(s0.mani.map(m => m.length), [11, 11]); assert.deepEqual(s0.pozzetti.map(p => p.length), [11, 11]);
assert.equal(s0.tallone.length + s0.scarti.length + 44, 108);
console.log('OK   11 carte a testa e due pozzetti da 11');

assert.equal(a('7h 7d 7c 7h 7s').tipo, 'tris');                    // carte uguali, anche dello stesso seme, senza limite
assert.equal(a('5h 6h 7h').tipo, 'scala'); assert.equal(a('5h 2c 7h').tipo, 'scala'); // la pinella fa da matta
assert.deepEqual(a('2h 3h 4h').carte.map(x => x.matta), [false, false, false]);       // pinella al suo posto: carta normale
assert.equal(a('2h 3h 4h J*').tipo, 'scala');                       // con la pinella al suo posto si aggiunge una matta
assert.equal(a('5h J* 2c'), null); assert.equal(a('7h 7d J* 2c'), null);                // al massimo una matta
assert.equal(a('2h 2d 2c'), null);                                  // niente tris di pinelle
console.log('OK   combinazioni: scale e carte uguali, una sola matta, pinella naturale al posto del 2');

const t7 = { carte: a('3h 4h 5h 6h 7h 8h 9h').carte }, t7s = { carte: a('3h 4h 5h 6h 2c 8h 9h').carte };
assert.equal(B.burraco(t7), 'pulito'); assert.equal(B.burraco(t7s), 'sporco'); assert.equal(B.burraco({ carte: a('3h 4h 5h').carte }), null);
assert.deepEqual(carte('J* 2h ah kh 8s 7s 3d').map(B.valore), [30, 20, 15, 10, 10, 5, 5]);
console.log('OK   burraco pulito e sporco; valori delle carte (jolly 30, pinella 20, asso 15...)');

// Raccogliere tutti gli scarti; con un solo scarto non si riscarta la stessa carta
let s = partita(['3h 4h 5h 9s'], undefined, 'kc');
assert.ok(B.pesca(s, true)); assert.equal(s.mani[0].length, 5); assert.equal(s.scarti.length, 0);
assert.equal(B.scarta(s, s.mani[0].find(x => x.numero === 13).id), false);
assert.ok(B.cala(s, idDi(s, '3h', '4h', '5h'))); assert.equal(s.tavolo[0].length, 1);
console.log('OK   si raccolgono tutti gli scarti; un solo scarto raccolto non si può riscartare');

// Pozzetto "in diretta": finite le carte calando si prende il pozzetto e si continua
s = partita(['3h 4h', '9s 9d']);
B.pesca(s, false);               // pesca il 9 di fiori
s.mani[0][2] = c('5h');          // (per il test) la carta pescata è il 5 di cuori
assert.ok(B.cala(s, idDi(s, '3h', '4h', '5h')));
assert.equal(s.pozzettoPreso[0], true); assert.equal(s.mani[0].length, 11); assert.equal(s.fase, 'gioca');
console.log('OK   pozzetto preso in diretta quando si finiscono le carte calando');

// Chiusura: serve il pozzetto e un burraco; l'ultima carta non può essere una matta
s = partita(['5h 9d', '9s 9c 4d']);
s.pozzettoPreso[0] = true; s.pozzetti[0] = [];
s.tavolo[0] = [{ id: 99, ...a('3s 4s 5s 6s 7s 8s 9s') }];
B.pesca(s, false);               // pesca il 9 di fiori
assert.ok(B.cala(s, idDi(s, '9d', '9c').concat([])) === false);    // due carte non bastano per una combinazione
assert.ok(B.attacca(s, idDi(s, '5h')[0], 99) === false);          // il 5 di cuori non va sulla scala di picche
const conMatta = partita(['J*', '9s']); conMatta.pozzettoPreso[0] = true; conMatta.tavolo[0] = [{ id: 1, ...a('3s 4s 5s 6s 7s 8s 9s') }];
B.pesca(conMatta, false); B.scarta(conMatta, conMatta.mani[0].find(x => !x.jolly).id);
assert.equal(conMatta.turno, 1); // scarta il 9 e tiene il jolly (non chiude)
B.scarta(s, idDi(s, '9d')[0]);
assert.equal(s.turno, 1);
const chiude = partita(['ac', '9s 4d']); chiude.pozzettoPreso[0] = true; chiude.tavolo[0] = [{ id: 1, ...a('3s 4s 5s 6s 7s 8s 9s') }];
B.pesca(chiude, false);          // 9 di fiori: due carte, ne scarta una e poi resta con l'altra
assert.ok(B.scarta(chiude, chiude.mani[0][1].id)); assert.equal(chiude.fase, 'pesca');
const fine = partita(['ac', '9s 4d']); fine.pozzettoPreso[0] = true; fine.tavolo[0] = [{ id: 1, ...a('3s 4s 5s 6s 7s 8s 9s') }];
fine.tallone = carte('2s 9c 9d 9h 9s'); B.pesca(fine, false);       // pesca la pinella di picche e la attacca
assert.ok(B.attacca(fine, fine.mani[0].find(x => x.numero === 2).id, 1));
assert.ok(B.scarta(fine, fine.mani[0][0].id));
assert.equal(fine.fase, 'fineMano'); assert.equal(fine.esito.chiude, 0);
const conto = fine.esito.conti[0].dettaglio;
assert.equal(conto.chiusura, 100); assert.equal(conto.puliti, 200); assert.equal(conto.pozzetto, 0);
assert.equal(fine.esito.conti[1].dettaglio.pozzetto, -100); assert.equal(fine.esito.conti[1].dettaglio.mano, -15);
console.log('OK   chiusura con pozzetto e burraco: +100, burraco pulito +200, pozzetto non preso -100, carte in mano sottratte');

// Partite PC contro PC fino a 1005 punti
for (let i = 1; i <= 25; i++) {
    const st = B.crea(seme(i)); let turni = 0;
    while (!st.finita) {
        if (st.fase === 'fineMano') { B.prossimaMano(st); continue; }
        B.turnoPC(st); assert.ok(++turni < 6000);
        assert.ok(['pesca', 'fineMano'].includes(st.fase), 'il PC finisce sempre il turno');
        const tot = st.tallone.length + st.scarti.length + st.mani.flat().length + st.pozzetti.flat().length + st.tavolo.flat().flatMap(t => t.carte).length;
        assert.equal(tot, 108);
        st.tavolo.flat().forEach(t => assert.ok(C.analizza(t.carte.map(x => x.carta), B.REGOLE)));
    }
    assert.ok(st.punti[st.vincitore] >= B.USCITA);
}
console.log('OK   25 partite PC contro PC fino a 1005 punti: carte conservate, combinazioni sempre valide');
console.log('Tutti i controlli sono passati');
