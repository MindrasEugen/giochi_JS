const assert = require('node:assert/strict');
const P = require('./prese-italiane'), M = require('./mazzo');
const carta = (numero, seme = 'coppe') => M.italiano().find(c => c.numero === numero && c.seme === seme);
const seme = n => { let s = n; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
assert.deepEqual(P.presePossibili(carta(5), [carta(2), carta(3), carta(5)]), [[2]]);
assert.deepEqual(P.presePossibili(carta(5), [carta(1), carta(4), carta(2), carta(3)]), [[0, 1], [2, 3]]);
assert.deepEqual(P.presePossibili(carta(1), [carta(4), carta(5)], 'asso'), [[0, 1]]);
assert.deepEqual(P.presePossibili(carta(1), [carta(4), carta(1), carta(1, 'spade')], 'asso'), [[1], [2]]);
assert.deepEqual(P.presePossibili(carta(1), [], 'asso'), []);
assert.deepEqual(P.presePossibili(carta(5), [carta(2), carta(3)], 'rubamazzetto'), []);
assert.ok(P.crea('scopa', () => 0).tavolo.filter(c => c.numero === 10).length < 3);
assert.equal(P.primiera(M.SEMI_ITALIANI.map(s => carta(7, s))), 84);
assert.equal(P.primiera([carta(7), carta(6), carta(1)]), 0);
assert.equal(P.primiera([carta(1, 'bastoni'), carta(6, 'coppe'), carta(7, 'denari'), carta(10, 'spade')]), 65);
// L'ultima carta non assegna una scopa; i resti non ne assegnano altre.
const fine = P.crea(); fine.mazzo = []; fine.mani = [[carta(5)], []]; fine.tavolo = [carta(5, 'spade')];
assert.ok(P.gioca(fine, { carta: 0, presa: [0] })); assert.equal(fine.finita, true); assert.equal(fine.scope[0], 0);
const scopa = P.crea(); scopa.mani[0] = [carta(5)]; scopa.tavolo = [carta(5, 'spade')];
P.gioca(scopa, { carta: 0, presa: [0] }); assert.equal(scopa.scope[0], 1);
const obbligo = P.crea(); obbligo.mani[0] = [carta(5)]; obbligo.tavolo = [carta(5, 'spade'), carta(2), carta(3)];
assert.equal(P.gioca(obbligo, { carta: 0, presa: [1, 2] }), false);
assert.equal(P.gioca(obbligo, { carta: 0, presa: [] }), false);
const resti = P.crea(); resti.mazzo = []; resti.mani = [[], [carta(4)]]; resti.turno = 1; resti.ultimaPresa = 0;
resti.catturate[0] = [carta(1), carta(2)]; resti.tavolo = [carta(7)];
P.gioca(resti, { carta: 0, presa: [] }); assert.equal(resti.catturate[0].length, 4); assert.equal(resti.catturate[0].at(-1).numero, 2); assert.deepEqual(resti.scope, [0, 0]);
const rubata = P.crea('rubamazzetto');
rubata.mani[0] = [carta(5)]; rubata.tavolo = [carta(5, 'spade')]; rubata.catturate[1] = [carta(7), carta(5, 'denari')];
assert.equal(P.mosseLegali(rubata).length, 2);
assert.equal(P.mossaPC(rubata).ruba, 1);
assert.ok(P.gioca(rubata, { carta: 0, presa: [], ruba: 1 })); assert.equal(rubata.catturate[1].length, 0); assert.equal(rubata.catturate[0].length, 3); assert.equal(rubata.catturate[0].at(-1).numero, 5);
const pareggio = P.crea();
// Due semi a testa: niente primiera, pareggio di carte e denari non assegnati.
pareggio.catturate = [M.italiano().filter(c => c.seme === 'coppe' || c.seme === 'bastoni'), M.italiano().filter(c => c.seme === 'denari' || c.seme === 'spade')];
const conteggio = P.risultato(pareggio); assert.equal(conteggio.dettaglio[0].carte, 0); assert.equal(conteggio.dettaglio[1].carte, 0); assert.equal(conteggio.dettaglio[0].primiera + conteggio.dettaglio[1].primiera, 0); assert.deepEqual(conteggio.punti, [0, 2]);
const pariDenari = P.crea(); pariDenari.catturate = [M.italiano().filter(c => c.numero % 2), M.italiano().filter(c => !(c.numero % 2))];
const pariPunti = P.risultato(pariDenari); assert.equal(pariPunti.dettaglio[0].denari + pariPunti.dettaglio[1].denari, 0); assert.equal(pariPunti.dettaglio[0].primiera, 1); assert.deepEqual(pariPunti.punti, [2, 0]);
const privata = P.crea(); privata.mani[1] = new Proxy(privata.mani[1], { get() { throw new Error('Il PC legge la mano avversaria'); } }); assert.ok(P.mossaPC(privata));
function conserva(s) {
    const carte = [...s.mazzo, ...s.mani.flat(), ...s.tavolo, ...s.catturate.flat()];
    assert.equal(carte.length, 40); assert.equal(new Set(carte.map(c => `${c.seme}-${c.numero}`)).size, 40);
}
for (const variante of ['scopa', 'asso', 'rubamazzetto']) for (let i = 1; i <= 200; i++) {
    const casuale = seme(i), s = P.crea(variante, casuale); let mosse = 0;
    if (variante !== 'rubamazzetto') assert.ok(s.tavolo.filter(c => c.numero === 10).length < 3);
    conserva(s);
    const iniziale = JSON.stringify(s); assert.equal(P.gioca(s, { carta: 99, presa: [] }), false); assert.equal(JSON.stringify(s), iniziale);
    while (!s.finita) {
        const legali = P.mosseLegali(s), scelta = i % 2 ? P.mossaPC(s) : legali[Math.floor(casuale() * legali.length)];
        assert.ok(P.gioca(s, scelta)); conserva(s); assert.ok(++mosse <= 36);
    }
    assert.equal(mosse, 36); assert.equal(s.catturate.flat().length, 40); assert.equal(s.tavolo.length, 0);
    const punti = P.risultato(s).punti; assert.ok(punti.every(Number.isInteger));
    if (variante === 'rubamazzetto') assert.equal(punti[0] + punti[1], 40);
    const finale = JSON.stringify(s); assert.equal(P.gioca(s, { carta: 0, presa: [] }), false); assert.equal(JSON.stringify(s), finale);
}
for (const [cartella, variante] of [['scopa', 'scopa'], ['asso_piglia_tutto', 'asso'], ['rubamazzetto', 'rubamazzetto']]) {
    assert.equal(require(`../${cartella}/funzioni`).crea(seme(42)).variante, variante);
}
console.log('OK Prese italiane: somme, priorita, assi, primiera, ultima scopa, furti, punteggi e 600 smazzate complete');
