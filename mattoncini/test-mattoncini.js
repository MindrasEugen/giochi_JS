const assert = require('node:assert/strict');
const M = require('./funzioni');
const s = M.crea();
assert.equal(s.mattoni.length, 32);
assert.equal(s.inAttesa, true);
M.muovi(s, -100); M.passo(s, 1 / 60);
assert.equal(s.racchetta, 46);
assert.equal(s.palla.x, 46);
M.lancia(s);
s.palla = { x: 8, y: 300, vx: -350, vy: -100 };
M.passo(s, 1 / 60);
assert.ok(s.palla.vx > 0);
s.palla = { x: s.racchetta, y: 473, vx: 0, vy: 400 };
M.passo(s, 1 / 60);
assert.ok(s.palla.vy < 0);
const m = s.mattoni.find(m => m.bonus);
s.palla = { x: m.x + 30, y: m.y + m.h + 9, vx: 0, vy: -300 };
M.passo(s, 1 / 60);
assert.equal(m.vivo, false);
assert.equal(s.punti, 10);
assert.equal(s.bonus.length, 1);
s.bonus = [{ x: s.racchetta, y: 480 }];
s.palla = { x: 400, y: 300, vx: 100, vy: 100 };
M.passo(s, 1 / 60);
assert.equal(M.larghezza(s), 132);
assert.equal(s.bonus.length, 0);
s.largo = 0.001;
M.passo(s, 1 / 60);
assert.equal(M.larghezza(s), 92);
for (let livello = 1; livello <= 3; livello++) {
    s.mattoni.forEach((m, i) => { m.vivo = i === 0; });
    const ultimo = s.mattoni[0];
    s.inAttesa = false;
    s.palla = { x: ultimo.x + 30, y: ultimo.y + ultimo.h + 9, vx: 0, vy: -300 };
    M.passo(s, 1 / 60);
    if (livello < 3) { assert.equal(s.livello, livello + 1); assert.equal(s.inAttesa, true); }
}
assert.equal(s.finita, true); assert.equal(s.vinta, true);
const prima = JSON.stringify(s); M.passo(s, 1); assert.equal(JSON.stringify(s), prima);
const perso = M.crea();
for (let vita = 2; vita >= 0; vita--) {
    M.lancia(perso); perso.palla = { x: 400, y: 528, vx: 0, vy: 300 };
    M.passo(perso, 1 / 60); assert.equal(perso.vite, vita);
}
assert.equal(perso.finita, true); assert.equal(perso.vinta, false);
console.log('OK Mattoncini: lancio, limiti, rimbalzi, punti, bonus, scadenza, tre livelli e tre vite');

// Tappa 29.2: campo alto 900 sul telefono, la racchetta scende in fondo
{
    const M = require('./funzioni');
    const s = M.crea(900);
    assert.equal(M.linea(s), 864); assert.equal(s.palla.y, 851);
    M.lancia(s); s.palla = { x: s.racchetta, y: 840, vx: 0, vy: 300 };
    M.passo(s, 0.1);
    assert.ok(s.palla.vy < 0, 'campo alto: la palla rimbalza sulla racchetta in fondo');
    s.palla = { x: 20, y: 880, vx: 0, vy: 400 }; M.passo(s, 0.1);
    assert.equal(s.vite, 2, 'campo alto: la vita si perde solo oltre il fondo di 900');
    console.log('OK Mattoncini con il campo alto del telefono');
}
