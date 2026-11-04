const assert = require('node:assert/strict');
const B = require('./funzioni');
for (const originale of B.FORME) {
    let forma = originale;
    for (let i = 0; i < 4; i++) forma = B.ruota(forma);
    assert.deepEqual(forma, originale);
    assert.equal(forma.flat().filter(Boolean).length, 4);
}
const s = B.crea(true, 123), c = s.campi[0];
assert.equal(c.pezzo.tipo, s.campi[1].pezzo.tipo);
assert.equal(c.prossimo, s.campi[1].prossimo);
c.pezzo.x = 0;
assert.equal(B.muovi(c, -1), false);
assert.ok(B.gira(c));
assert.ok(B.valido(c));
c.griglia = Array.from({ length: 20 }, (_, y) => Array(10).fill(y >= 16 ? 1 : 0));
assert.equal(B.cancellaRighe(c), 4);
assert.equal(c.punti, 800); assert.equal(c.righe, 4);
assert.ok(c.griglia.every(r => r.every(v => !v)));
c.righe = 10; assert.equal(B.livello(c), 2);
const tipi = [];
const sacco = B.crea(false, 17).campi[0];
for (let i = 0; i < 14; i++) {
    tipi.push(sacco.pezzo.tipo); B.lascia(sacco);
    sacco.griglia = Array.from({ length: 20 }, () => Array(10).fill(0));
}
assert.equal(new Set(tipi.slice(0, 7)).size, 7);
assert.equal(new Set(tipi.slice(7)).size, 7);
assert.equal(sacco.finita, false);
const uguali = B.crea(true, 333);
for (let i = 0; i < 12; i++) {
    assert.equal(uguali.campi[0].pezzo.tipo, uguali.campi[1].pezzo.tipo);
    uguali.campi.forEach(c => { B.lascia(c); c.griglia.forEach(r => r.fill(0)); });
}
const perso = B.crea();
const p = perso.campi[0];
p.griglia[0].fill(1, 2, 8); p.griglia[1].fill(1, 2, 8);
p.pezzo = { tipo: 1, forma: B.FORME[1], x: 0, y: 18 };
B.lascia(p); B.passo(perso, 1 / 60, [{}]);
assert.equal(perso.finita, true);
const punti = p.punti; B.lascia(p); assert.equal(p.punti, punti);
console.log('OK Blocchi: 4 rotazioni, confini, righe multiple, livelli, sacco di 7, duello equo e fine partita');
