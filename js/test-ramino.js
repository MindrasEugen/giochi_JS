// Test della partita di Scala 40 e Ramino: node js/test-ramino.js
const assert = require('node:assert/strict');
const R = require('./ramino'), C = require('./combinazioni'), M = require('./mazzo');
const SEMI = { h: 'hearts', d: 'diamonds', c: 'clubs', s: 'spades' };
const seme = n => { let s = n; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
let id = 5000;
const c = sigla => sigla === 'J*' ? { ...C.JOLLY, id: id++ } : { ...M.francese().find(k => k.valore === (sigla.slice(0, -1) === 't' ? '10' : sigla.slice(0, -1)) && k.seme === SEMI[sigla.at(-1)]), id: id++ };
const carte = testo => testo.split(' ').map(c);
const ids = (s, testo) => testo.split(' ').map(sigla => { const x = c(sigla); return s.mani[s.turno].find(k => k.seme === x.seme && k.numero === x.numero && !k.usata && (k.usata = true)).id; });
function partita(variante, mani, pozzo = '9d', tallone = '2c 3d 4h 5s 6c 7d 8h 9s') {
    const s = R.crea(variante, seme(1));
    s.mani = mani.map(carte); s.pozzo = carte(pozzo); s.tallone = carte(tallone); s.turno = 0; s.fase = 'pesca';
    return s;
}
const pulisci = s => s.mani.flat().forEach(k => delete k.usata);

for (const [v, carteMano, soglia] of [['scala40', 13, 40], ['ramino', 13, 50]]) {
    const s = R.crea(v, seme(2));
    assert.deepEqual(s.mani.map(m => m.length), [carteMano, carteMano]); assert.equal(s.pozzo.length, 1); assert.ok(!s.pozzo[0].jolly);
    assert.equal(s.tallone.length + s.pozzo.length + 2 * carteMano, 108); assert.equal(s.regole.soglia, soglia);
}
console.log('OK   distribuzione: 13 carte a testa, primo scarto mai jolly');

// Apertura in Scala 40: servono 40 punti
let s = partita('scala40', ['kh kd kc 4s 5s 6s 9h 2d', 'ah ad 3c 3h 5d 8c 8d 9c']);
assert.ok(R.pesca(s, false));
assert.ok(R.cala(s, ids(s, 'kh kd kc'))); pulisci(s);
assert.equal(R.apri(s), false); assert.match(s.errore, /40 punti: ne hai 30/);
assert.ok(R.cala(s, ids(s, '4s 5s 6s'))); pulisci(s);
assert.equal(R.puntiPreparazione(s), 45);
assert.ok(R.apri(s)); assert.equal(s.aperto[0], true); assert.equal(s.tavolo.length, 2);
console.log('OK   Scala 40: si apre solo con almeno 40 punti di combinazioni');

// Dopo aver aperto: attaccare; non si scarta una carta che attacca
assert.ok(R.attaccaCarta(s, s.mani[0].find(k => k.numero === 2).id, s.tavolo[1].id) === false); // 2 di quadri non va sulla scala di picche
const settePicche = c('7s'); s.mani[0].push(settePicche);
assert.ok(R.attaccaCarta(s, settePicche.id, s.tavolo[1].id)); assert.equal(s.tavolo[1].carte.length, 4);
const asso = c('as'); s.mani[0].push(asso, c('ks'));
const reCuori = s.mani[0].find(k => k.numero === 13 && k.seme === 'spades');
assert.equal(R.scarta(s, reCuori.id), false); assert.match(s.errore, /attacca/);
assert.ok(R.scarta(s, s.mani[0].find(k => k.numero === 9).id)); assert.equal(s.turno, 1);
console.log('OK   attaccare dopo l’apertura; in Scala 40 non si scarta una carta che si attacca');

// Lo scarto si prende solo se si usa subito (e in Scala 40 solo dopo aver aperto)
s = partita('scala40', ['5h 6h 9c 9d 2s', 'kh qd'], '7h');
assert.equal(R.puoPrendereScarto(s), false);
s.aperto[0] = true; assert.equal(R.puoPrendereScarto(s), true);
R.pesca(s, true); assert.equal(R.scarta(s, s.mani[0].find(k => k.numero === 2).id), false); assert.match(s.errore, /usare la carta/);
assert.ok(R.cala(s, ids(s, '5h 6h 7h'))); pulisci(s); assert.equal(s.obbligo, null);
const r = partita('ramino', ['kh kd kc qs qh qd 2s', '4c'], '5c');
assert.equal(R.puoPrendereScarto(r), false);              // nel Ramino serve poterci aprire (50 punti)
const r2 = partita('ramino', ['kh kd kc qs qh 2s 3d', '4c'], 'qd');
assert.equal(R.puoPrendereScarto(r2), true);              // re e donne: 60 punti con la donna presa
console.log('OK   scarto preso solo se si usa subito (Scala 40 dopo l’apertura, Ramino anche per aprire)');

// Chiusura e punti: Scala 40 somma esatta, Ramino arrotonda alla decina
s = partita('scala40', ['4h 5h 6h', 'ah kd 7c J*']);
s.aperto[0] = true; R.pesca(s, false);                       // pesca il 2 di fiori
assert.ok(R.cala(s, ids(s, '4h 5h 6h'))); pulisci(s);
assert.ok(R.scarta(s, s.mani[0][0].id));                     // scarta l'ultima carta: chiude
assert.equal(s.fase, 'fineMano'); assert.equal(s.esito.chiude, 0); assert.deepEqual(s.esito.pagati, [0, 53]); assert.deepEqual(s.punti, [0, 53]);
const arrot = R.crea('ramino', seme(3));
assert.equal(R.valoreMano(arrot, carte('kh 5d 9c')), 20);   // 24 -> 20
assert.equal(R.valoreMano(arrot, carte('kh 5d tc')), 30);   // 25 -> 30
assert.equal(R.valoreMano(arrot, carte('2h 3d')), 0);       // una o due carte sotto il 4
console.log('OK   chiusura: Scala 40 paga la somma, Ramino arrotonda alla decina');

// Partite PC contro PC fino all'uscita: le 108 carte restano sempre tutte in gioco
for (const v of ['scala40', 'ramino']) for (let i = 1; i <= 15; i++) {
    const st = R.crea(v, seme(i)); let turni = 0;
    while (!st.finita) {
        if (st.fase === 'fineMano') { R.prossimaMano(st); continue; }
        R.turnoPC(st); assert.ok(++turni < 8000);
        assert.ok(['pesca', 'fineMano'].includes(st.fase), 'il PC finisce sempre il turno');
        const totale = st.tallone.length + st.pozzo.length + st.mani.flat().length + st.tavolo.flatMap(t => t.carte).length;
        assert.equal(totale, 108);
        st.tavolo.forEach(t => assert.ok(C.analizza(t.carte.map(x => x.carta))));
    }
    assert.ok(st.punti.some(p => p >= st.regole.uscita)); assert.ok(st.punti[st.vincitore] < st.regole.uscita);
}
console.log('OK   30 partite PC contro PC: carte conservate, combinazioni sul tavolo sempre valide, uscita a 101 o 200');
console.log('Tutti i controlli sono passati');
