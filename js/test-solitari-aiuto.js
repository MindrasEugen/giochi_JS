// Test dell'aiutante dei solitari (Tappa 32): suggerimenti e "nessuna mossa utile". node js/test-solitari-aiuto.js
const assert = require('node:assert/strict');
const M = require('./mazzo');
const A = require('./solitario-aiuto');
const giochi = {
    klondike: require('../klondike/funzioni'), freecell: require('../freecell/funzioni'), spider: require('../spider/funzioni'),
    piramide: require('../piramide/funzioni'), golf: require('../golf/funzioni'), tripeaks: require('../tripeaks/funzioni'),
    yukon: require('../yukon/funzioni'), scorpione: require('../scorpione/funzioni'), orologio: require('../orologio/funzioni'),
    tredici: require('../tredici/funzioni')
};
const { klondike: K, freecell: F, spider: S, piramide: P, golf: G, yukon: Y, scorpione: Sc, orologio: O, tredici: T } = giochi;
// Carte scritte come "7h", "As", "Kd", "Tc" (dieci); con "#" davanti la carta è coperta
const SEMI = { h: 'hearts', d: 'diamonds', c: 'clubs', s: 'spades' };
const NUMERI = { A: 1, T: 10, J: 11, Q: 12, K: 13 };
const c = sigla => {
    const coperta = sigla.startsWith('#'), s = sigla.replace('#', '');
    const numero = NUMERI[s[0]] || Number(s[0]);
    return { carta: M.francese().find(x => x.numero === numero && x.seme === SEMI[s[1]]), scoperta: !coperta };
};
const carte = testo => testo ? testo.split(' ').map(c) : [];
// Partita costruita a mano: si parte da una vera e si sostituiscono le pile
function partita(motore, pile, extra = {}) {
    const s = motore.crea({}, () => 0.5);
    for (const id of Object.keys(s.pile)) s.pile[id] = [];
    for (const [id, testo] of Object.entries(pile)) s.pile[id] = carte(testo);
    return Object.assign(s, extra);
}
const mossa = (sug, da, indice, a) => { assert.ok(sug?.mossa, `atteso un suggerimento di mossa, trovato ${JSON.stringify(sug)}`); assert.deepEqual(sug.mossa, { da, indice, a }); };

// --- Klondike ---
// Il 7♥ va sull'8♠ e scopre la carta sotto
let s = partita(K, { c0: '#2c 7h', c1: '#3c 8s', c2: '#4c 5h', c3: '#5c 9d', c4: '#6c Jh', c5: '#8c 3d', c6: '#9c Qd' });
mossa(A.suggerisci(K, s), 'c0', 1, 'c1');
assert.equal(A.descrivi(K, s, A.suggerisci(K, s)), 'Sposta 7♥ su 8♠.');
assert.equal(A.bloccato(K, s), false);
// Tutte carte rosse in cima e mazzo senza carte utili: nessuna mossa utile
s = partita(K, { c0: '#2c 7h', c1: '#3c 8d', c2: '#4c 5h', c3: '#5c 9d', c4: '#6c Jh', c5: '#8c 3d', c6: '#9c Qd', mazzo: '#4d #6h #Td' });
assert.equal(A.suggerisci(K, s), null);
assert.equal(A.bloccato(K, s), true, 'Klondike: giro del mazzo inutile, nessuna mossa utile');
assert.match(A.descrivi(K, s, null), /Nessuna mossa utile/);
assert.match(A.descrivi(K, s, { incerto: true }), /Non trovo un suggerimento/);
// Con un limite di posizioni minuscolo la ricerca è incompleta: niente avviso, suggerimento "incerto"
s = partita(F, { t0: '9s 2h', t1: '9c Ah', t2: 'Ks', t3: 'Kc', t4: 'Kh', t5: 'Kd', t6: 'Qs', t7: 'Qc' });
assert.equal(A.bloccato(F, s, { stati: 1 }), false, 'ricerca incompleta: mai bloccato');
// L'asso è in fondo al mazzo: si consiglia di girare carte
s = partita(K, { c0: '#2c 7h', c1: '#3c 8d', c2: '#4c 5h', c3: '#5c 9d', c4: '#6c Jh', c5: '#8c 3d', c6: '#9c Qd', mazzo: '#As #4d #6h' });
let sug = A.suggerisci(K, s);
assert.deepEqual(sug, { mazzo: true, clic: 3 });
assert.match(A.descrivi(K, s, sug), /Gira carte dal mazzo/);
assert.equal(A.bloccato(K, s), false);
// Asso scoperto: va sulla base
s = partita(K, { c0: '#2c As', c1: '#3c 8d', c2: '#4c 5h', c3: '#5c 9d', c4: '#6c Jh', c5: '#8c 3d', c6: '#9c Qd' });
mossa(A.suggerisci(K, s), 'c0', 1, 'f0');
assert.equal(A.descrivi(K, s, A.suggerisci(K, s)), 'Metti A♠ sulla base.');
// Re con la sua scala nella colonna vuota: scopre una carta (anche se occupa la colonna)
s = partita(K, { c0: '', c1: '#3c Kd Qs', c2: '#4c 5h', c3: '#5c 9d', c4: '#6c 2h', c5: '#8c 3d', c6: '#9c Qd' });
mossa(A.suggerisci(K, s), 'c1', 1, 'c0');
assert.equal(A.descrivi(K, s, A.suggerisci(K, s)), 'Sposta K♦ con le carte sopra nella colonna vuota.');
// Una colonna intera già scoperta non si sposta in una colonna vuota (mossa inutile)
assert.ok(!A.mosse(K, partita(K, { c0: '', c1: 'Kd Qs' }), Object.fromEntries(K.disposizione().map(d => [d.id, d.tipo]))).some(m => m.da === 'c1' && m.a === 'c0'));

// --- FreeCell ---
s = partita(F, { t0: '5c Ah', t1: '9s', t2: '9c', t3: '9h', t4: '9d', t5: 'Ts', t6: 'Tc', t7: 'Th' });
mossa(A.suggerisci(F, s), 't0', 1, 'f0');
// Carta in una cella: il messaggio parla di cella libera
s = partita(F, { t0: '9s 2h', t1: '9c Ah', t2: 'Ks', t3: 'Kc', t4: 'Kh', t5: 'Kd', t6: 'Qs', t7: 'Qc' });
sug = A.suggerisci(F, s);
assert.ok(sug.mossa, 'FreeCell: esiste una strada (2♥ in cella, A♥ e 2♥ alla base)');
// Celle piene e nessuna mossa: bloccato
s = partita(F, { k0: '2s', k1: '2c', k2: '2h', k3: '2d', t0: '9s', t1: '9c', t2: 'Ks', t3: 'Kc', t4: 'Js', t5: 'Jc', t6: 'Qs', t7: 'Qc' });
assert.equal(A.suggerisci(F, s), null);
assert.equal(A.bloccato(F, s), true);

// --- Spider ---
const tutteCinque = { c0: '#9s 5s', c1: '#9s 5s', c2: '#9s 5s', c3: '#9s 5s', c4: '#9s 5s', c5: '#9s 5s', c6: '#9s 5s', c7: '#9s 5s', c8: '#9s 5s', c9: '#9s 5s' };
s = partita(S, { ...tutteCinque, mazzo: '#2s #3s #4s #6s #7s #8s #9s #Ts #Js #Qs' });
assert.deepEqual(A.suggerisci(S, s), { mazzo: true, clic: 1 }, 'Spider: niente da spostare, si distribuisce');
assert.equal(A.bloccato(S, s), false, 'Spider: con carte nel mazzo non si è mai bloccati');
s = partita(S, tutteCinque);
assert.equal(A.bloccato(S, s), true, 'Spider: mazzo vuoto e nessuna mossa');
s = partita(S, { ...tutteCinque, c1: '#9s 6s' });
mossa(A.suggerisci(S, s), 'c0', 1, 'c1');

// --- Piramide ---
s = partita(P, { p27: '6h', p26: '7c', p25: '2d', p24: '2d', p23: '2d', p22: '2d', p21: '2d', p0: '#5s' });
for (let i = 1; i <= 20; i++) s.pile[`p${i}`] = carte('3c');
sug = A.suggerisci(P, s);
assert.ok(sug.mossa && ['p26', 'p27'].includes(sug.mossa.da) && ['p26', 'p27'].includes(sug.mossa.a));
assert.match(A.descrivi(P, s, sug), /fanno 13/);

// --- Golf ---
s = partita(G, { g0: '3c 7h', g1: '3d', g2: 'Js', g3: 'Qd', g4: '2c', g5: '4s', g6: 'Th', base: '8c', mazzo: '#5d' });
mossa(A.suggerisci(G, s), 'g0', 1, 'base');
s = partita(G, { g0: '3c', g1: '9d', g2: 'Js', g3: 'Qd', g4: '2c', g5: '5s', g6: 'Th', base: '7c', mazzo: '#Kd' });
assert.deepEqual(A.suggerisci(G, s), { mazzo: true, clic: 1 }, 'Golf: niente sulla base, si gira il mazzo');

// --- Yukon e Scorpione: una carta scoperta che si sposta e scopre ---
s = partita(Y, { c0: '#2c 7h 3s', c1: '#3c 8s', c2: '#4c 5h', c3: '#5c 9d', c4: '#6c Jh', c5: '#8c 3d', c6: '#9c Qd' });
mossa(A.suggerisci(Y, s), 'c0', 1, 'c1');
s = partita(Sc, { c0: '#2c 7s 3h', c1: '#3c 8s', c2: '#4c 5h', c3: '#5c 9d', c4: '#6c Jh', c5: '#8c 3d', c6: '#9c Qd' });
mossa(A.suggerisci(Sc, s), 'c0', 1, 'c1');

// --- Orologio: la carta in mano va sul suo mucchio ---
s = O.crea({}, () => 0.3);
sug = A.suggerisci(O, s);
assert.equal(sug.mossa.da, 'mano'); assert.equal(sug.mossa.a, O.destinazione(s));
assert.equal(A.descrivi(O, s, sug), `Metti ${A.nome(s.pile.mano[0].carta)} sul mucchio illuminato.`);

// --- Le tredici: il 4 sul 5 libera l'asso sotto ---
s = partita(T, { c0: '8c Ah 4s', c1: '5d', c2: '9h', c3: '9s', c4: '9c', c5: '9d', c6: '7h', c7: '7s', c8: '7c', c9: '7d', c10: 'Kh', c11: 'Ks', c12: 'Kc' });
mossa(A.suggerisci(T, s), 'c0', 2, 'c1');

// --- Partite vere: ogni suggerimento è una mossa valida, e in tempi brevi ---
const seme = n => { let x = n; return () => { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return x / 4294967296; }; };
let tempoMassimo = 0;
for (const [nome, motore] of Object.entries(giochi)) {
    for (let p = 1; p <= 3; p++) {
        const st = motore.crea({}, seme(p * 31 + nome.length));
        for (let passo = 0; passo < 40 && !motore.vinto(st) && !(motore.bloccata && motore.bloccata(st)); passo++) {
            const t = Date.now(); const sg = A.suggerisci(motore, st); tempoMassimo = Math.max(tempoMassimo, Date.now() - t);
            if (!sg || sg.incerto) break;
            const prima = JSON.stringify(st.pile);
            const riuscita = sg.mazzo ? motore.clicMazzo(st) : motore.sposta(st, sg.mossa.da, sg.mossa.indice, sg.mossa.a);
            assert.ok(riuscita, `${nome}: il suggerimento ${JSON.stringify(sg)} deve essere una mossa valida`);
            assert.notEqual(JSON.stringify(st.pile), prima);
        }
    }
}
assert.ok(tempoMassimo < 1500, `ricerca troppo lenta: ${tempoMassimo} ms`);
console.log(`OK aiutante dei solitari: suggerimenti in 10 giochi, nessuna mossa utile, mazzo, messaggi, mosse sempre valide (ricerca più lenta: ${tempoMassimo} ms)`);
