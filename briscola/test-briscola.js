const assert = require('node:assert/strict');
const B = require('./funzioni'), M = require('../js/mazzo');
const carta = (numero, seme = 'coppe') => M.italiano().find(c => c.numero === numero && c.seme === seme);
const seme = n => { let s = n; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
assert.equal(M.italiano().reduce((n, c) => n + B.puntiCarta(c), 0), 120);
assert.ok(B.batte(carta(1), carta(3), 'spade'));
assert.ok(B.batte(carta(2, 'spade'), carta(1), 'spade'));
assert.equal(B.batte(carta(1, 'denari'), carta(2), 'spade'), false);
assert.equal(B.vincitorePresa([{ giocatore: 0, carta: carta(1) }, { giocatore: 1, carta: carta(2, 'spade') }, { giocatore: 2, carta: carta(3, 'spade') }, { giocatore: 3, carta: carta(1, 'denari') }], 'spade'), 2);
function conserva(s) {
    const carte = [...s.mazzo, ...s.mani.flat(), ...s.catturate.flat(), ...s.tavolo.map(p => p.carta)];
    assert.equal(carte.length, 40); assert.equal(new Set(carte.map(c => `${c.seme}-${c.numero}`)).size, 40);
    assert.equal(s.punti[0] + s.punti[1], s.catturate.flat().reduce((n, c) => n + B.puntiCarta(c), 0));
}
const esempio = B.crea(2, seme(3));
const immagineBriscola = esempio.briscola;
assert.equal(esempio.mazzo.at(-1), immagineBriscola);
const prima = JSON.stringify(esempio); assert.equal(B.gioca(esempio, { carta: 99 }), false); assert.equal(JSON.stringify(esempio), prima);
// Nessun obbligo di rispondere al seme e nessuna lettura delle mani avversarie da parte del PC.
esempio.mani[1] = new Proxy(esempio.mani[1], { get() { throw new Error('Mano avversaria letta dal PC'); } });
assert.ok(B.mossaPC(esempio));
for (const numero of [2, 4]) for (let i = 1; i <= 150; i++) {
    const casuale = seme(i), s = B.crea(numero, casuale); let mosse = 0, pescataUltima = false;
    conserva(s);
    while (!s.finita) {
        if (s.presaCompleta) {
            const vincitore = B.vincitorePresa(s.tavolo, s.briscola.seme);
            const prima = s.mazzo.length, daPescare = [...s.mazzo.slice(0, numero)];
            assert.ok(B.raccogli(s)); assert.equal(s.turno, vincitore);
            daPescare.forEach((c, k) => assert.equal(s.mani[(vincitore + k) % numero].at(-1), c));
            if (prima && s.mazzo.length === 0) { assert.ok(s.mani.flat().includes(s.briscola)); pescataUltima = true; }
        } else {
            const possibili = B.mosseLegali(s);
            const m = i % 2 ? B.mossaPC(s) : possibili[Math.floor(casuale() * possibili.length)];
            assert.ok(B.gioca(s, m)); mosse++;
        }
        conserva(s); assert.ok(mosse <= 40);
    }
    assert.equal(mosse, 40); assert.equal(pescataUltima, true); assert.equal(s.punti[0] + s.punti[1], 120);
    assert.equal(s.catturate.flat().length, 40);
    const finale = JSON.stringify(s); assert.equal(B.gioca(s, { carta: 0 }), false); assert.equal(B.raccogli(s), false); assert.equal(JSON.stringify(s), finale);
}
console.log('OK Briscola: valori, briscole, coppie, pesca del vincitore, ultima carta, mani segrete e 300 smazzate complete');
