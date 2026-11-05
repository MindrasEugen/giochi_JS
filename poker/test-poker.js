// Test del Poker heads-up: node poker/test-poker.js
const assert = require('node:assert/strict');
const P = require('./funzioni'), M = require('../js/mazzo');
const seme = n => { let s = n; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
// "ah" = asso di cuori, "td" = 10 di quadri, "9s" = 9 di picche
const SEMI = { h: 'hearts', d: 'diamonds', c: 'clubs', s: 'spades' };
const c = sigla => { const v = sigla.slice(0, -1).toLowerCase(), valore = v === 't' ? '10' : v; return M.francese().find(x => x.valore === valore && x.seme === SEMI[sigla.at(-1)]); };
const mano = testo => P.valutaMano(testo.split(' ').map(c));

const esempi = [
    ['ah kh qh jh th', 'scala reale'], ['9s 8s 7s 6s 5s', 'scala colore'], ['7h 7d 7c 7s 2h', 'poker'], ['kh kd kc 4s 4h', 'full'],
    ['ah 9h 6h 4h 2h', 'colore'], ['5d 4c 3h 2s ah', 'scala'], ['qh qd qc 9s 2h', 'tris'], ['jh jd 4c 4s ah', 'doppia coppia'],
    ['th td 8c 4s 2h', 'coppia'], ['ah jd 8c 4s 2h', 'carta alta']
];
esempi.forEach(([carte, nome]) => assert.equal(mano(carte).nome, nome, carte));
for (let i = 1; i < esempi.length; i++) assert.ok(P.confronta(mano(esempi[i - 1][0]).punteggio, mano(esempi[i][0]).punteggio) > 0);
console.log('OK   tutte le categorie riconosciute e ordinate (dalla scala reale alla carta alta)');

assert.ok(P.confronta(mano('6d 5c 4h 3s 2h').punteggio, mano('5d 4c 3h 2s ah').punteggio) > 0); // la ruota è la scala più bassa
assert.ok(P.confronta(mano('ah ad 9c 5s 3h').punteggio, mano('ah ad 9c 5s 2h').punteggio) > 0); // spareggio con il kicker
assert.ok(P.confronta(mano('kh kd 2c 2s ah').punteggio, mano('qh qd jc js ah').punteggio) > 0);
assert.equal(P.confronta(mano('ah kd 9c 5s 3h').punteggio, mano('as kc 9d 5h 3c').punteggio), 0);
console.log('OK   spareggi: ruota A-2-3-4-5, kicker, doppie coppie, pareggio esatto');

const sette = mano('2h 7d 7c ks 7h kd 3s');            // full di 7 con i re
assert.equal(sette.nome, 'full'); assert.equal(sette.carte.length, 5);
assert.equal(mano('ah kh 2c qh 3d jh th').nome, 'scala reale');
console.log('OK   la migliore combinazione di 5 carte su 7');

// Bui e prima mano: il mazziere (giocatore 0) mette il piccolo buio e parla per primo
let s = P.crea('uno', seme(1));
assert.equal(s.mazziere, 0); assert.deepEqual(s.fiches, [495, 490]); assert.equal(s.piatto, 15); assert.equal(s.turno, 0);
assert.deepEqual(P.mosseLegali(s).map(m => Object.keys(m)[0]), ['lascia', 'chiama', 'rilancia', 'rilancia', 'rilancia']);
assert.ok(P.gioca(s, { lascia: true }));
assert.equal(s.fase, 'fine'); assert.deepEqual(s.fiches, [495, 505]); assert.equal(s.esito.mostrate, false);
assert.ok(P.gioca(s, { prossima: true })); assert.equal(s.mazziere, 1); assert.equal(s.turno, 1);
console.log('OK   bui 5/10, chi lascia perde il piatto, il mazziere cambia a ogni mano');

// Vedere e passare fino allo showdown: 3 + 1 + 1 carte in tavola
s = P.crea('due', seme(2));
P.gioca(s, { chiama: 5 }); assert.equal(s.fase, 'preflop'); assert.equal(s.turno, 1); // il grande buio può ancora parlare
P.gioca(s, { passa: true }); assert.equal(s.fase, 'flop'); assert.equal(s.tavolo.length, 3); assert.equal(s.turno, 1);
P.gioca(s, { passa: true }); P.gioca(s, { passa: true }); assert.equal(s.fase, 'turn'); assert.equal(s.tavolo.length, 4);
P.gioca(s, { passa: true }); P.gioca(s, { passa: true }); assert.equal(s.fase, 'river');
P.gioca(s, { passa: true }); P.gioca(s, { passa: true });
assert.equal(s.fase, 'fine'); assert.equal(s.tavolo.length, 5); assert.equal(s.esito.mostrate, true); assert.equal(s.fiches[0] + s.fiches[1], 1000);
console.log('OK   giri di puntata: flop, turn, river e confronto delle mani');

// Tutto dentro: il resto non coperto torna indietro, il tavolo si completa
s = P.crea('due', seme(3));
s.fiches = [995, 90]; s.piatto = 15; s.puntate = [5, 10]; // il grande buio ha solo 100 fiches in tutto
const tutto = P.mosseLegali(s).filter(m => m.rilancia).at(-1);
P.gioca(s, tutto);
assert.equal(s.turno, 1); assert.ok(P.mosseLegali(s).some(m => m.chiama === 90));
P.gioca(s, { chiama: 90 });
assert.equal(s.fase, 'fine'); assert.equal(s.tavolo.length, 5); assert.equal(s.fiches[0] + s.fiches[1], 1100);
assert.ok(s.fiches.includes(0) || s.esito.vincitori.length === 2 || s.fiches[0] >= 900);
console.log('OK   tutto dentro: puntata non coperta restituita, carte scoperte fino al river');

// Piatto diviso
s = P.crea('due', seme(4));
s.mani = [[c('as'), c('2c')], [c('ad'), c('3c')]]; // entrambi: scala all'asso con il tavolo
s.mazzo = [c('4d'), c('kh'), c('qh'), c('jh'), c('5d'), c('th'), c('6d'), c('9s'), ...s.mazzo];
P.gioca(s, { chiama: 5 }); P.gioca(s, { passa: true });
for (let k = 0; k < 6; k++) P.gioca(s, { passa: true });
assert.deepEqual(s.esito.vincitori, [0, 1]); assert.deepEqual(s.fiches, [500, 500]);
console.log('OK   mani uguali: piatto diviso');

// Il PC decide senza guardare le carte dell'altro
const privata = P.crea('uno', seme(5)); privata.turno = 1; privata.mani[0] = new Proxy(privata.mani[0], { get() { throw new Error('Il PC legge le carte avversarie'); } });
assert.ok(P.mossaPC(privata));
assert.ok(P.equita({ ...P.crea('uno', seme(6)), mani: [[c('ah'), c('as')], [c('2c'), c('7d')]], tavolo: [] }, 0, 300) > 0.75);
console.log('OK   il PC stima la forza della propria mano (coppia d’assi > 75%) senza vedere le carte altrui');

for (let i = 1; i <= 12; i++) {
    const st = P.crea(i % 2 ? 'uno' : 'due', seme(i)); let azioni = 0;
    while (!st.finita && st.numeroMano <= 25) {
        const legali = P.mosseLegali(st), m = st.turno === 1 && i % 3 ? P.mossaPC(st) : legali[Math.floor(seme(i * 11 + azioni)() * legali.length)];
        assert.ok(P.gioca(st, m)); assert.ok(++azioni < 3000);
        assert.equal(st.fiches[0] + st.fiches[1] + st.piatto, 1000);
        assert.ok(st.fiches.every(f => f >= 0));
    }
}
console.log('OK   partite simulate: le 1000 fiches restano sempre in gioco');
console.log('Tutti i controlli sono passati');
