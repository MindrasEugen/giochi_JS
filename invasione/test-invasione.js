const assert = require('node:assert/strict');
const I = require('./funzioni');
const s = I.crea();
assert.equal(s.nemici.length, 21); assert.equal(s.scudi.length, 4);
I.spara(s); I.spara(s); assert.equal(s.proiettili.length, 1);
s.proiettili = [{ x: s.nemici[0].x, y: 85, vy: -470, amico: true }];
I.passo(s, 0.05);
assert.equal(s.nemici[0].vivo, false); assert.equal(s.punti, 30);
const scudo = s.scudi[0];
for (const amico of [true, false]) {
    s.proiettili = [{ x: scudo.x, y: amico ? 440 : 410, vy: amico ? -470 : 200, amico }];
    I.passo(s, 0.05);
}
assert.equal(scudo.vita, 3);
s.proiettili = [{ x: s.x, y: 510, vy: 200, amico: false }, { x: s.x, y: 510, vy: 200, amico: false }];
I.passo(s, 0.05); assert.equal(s.vite, 2); assert.ok(s.invulnerabile > 0);
s.nemici.forEach(n => { n.vivo = false; }); s.scudi[0].vita = 0;
I.passo(s, 1 / 60); assert.equal(s.livello, 2); assert.equal(s.scudi[0].vita, 5);
for (let i = 0; i < 200; i++) I.passo(s, 1 / 60, -1, false, () => 0);
assert.equal(s.x, 18);
s.nemici[0].y = 490; I.passo(s, 1 / 60); assert.equal(s.finita, true);
const prima = JSON.stringify(s); I.passo(s, 1); I.spara(s); assert.equal(JSON.stringify(s), prima);
console.log('OK Invasione: fuoco limitato, colpi, scudi nei due versi, protezione, ondate, confini e invasione base');

// Tappa 29.2: campo alto 900 sul telefono, navetta, scudi e base misurati dal fondo
{
    const I = require('./funzioni');
    const s = I.crea(900);
    assert.equal(s.scudi[0].y, 765); I.spara(s); assert.equal(s.proiettili[0].y, 847);
    s.nemici.forEach(n => { n.y = 700; }); I.passo(s, 0.01, 0, false, () => 0.5);
    assert.equal(s.finita, false, 'campo alto: a 700 i droni non hanno ancora raggiunto la base (830)');
    s.nemici.forEach(n => { n.y = 830; }); I.passo(s, 0.01, 0, false, () => 0.5);
    assert.equal(s.finita, true, 'campo alto: a 830 la base è raggiunta');
    console.log('OK Invasione con il campo alto del telefono');
}
