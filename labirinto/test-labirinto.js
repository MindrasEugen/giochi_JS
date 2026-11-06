const assert = require('node:assert/strict');
const L = require('./funzioni');
for (let seme = 1; seme <= 30; seme++) {
    const s = L.crea(); s.griglia = L.mappa(seme);
    const libere = s.griglia.flat().filter(v => !v).length;
    assert.equal(L.distanze(s).size, libere, 'ogni corridoio deve essere raggiungibile');
    assert.ok(s.griglia[0].every(Boolean) && s.griglia[16].every(Boolean));
    assert.ok(s.griglia.every(r => r[0] && r[18]));
}
const s = L.crea();
assert.deepEqual(s.griglia, L.mappa());
const p = L.vicini(s, s.giocatore)[0];
const dx = p.x - 1, dy = p.y - 1;
const dir = Object.keys(L.DIREZIONI).find(d => L.DIREZIONI[d][0] === dx && L.DIREZIONI[d][1] === dy);
L.gira(s, dir); L.passo(s, 0.14);
assert.equal(s.giocatore.x, p.x); assert.equal(s.giocatore.y, p.y); assert.equal(s.punti, 10);
s.direzione = null; s.prossima = null;
s.giocatore = { x: 17, y: 1 }; s.guardiani.forEach(g => { g.delai = 10; });
L.passo(s, 0.14); assert.equal(s.potere, 7); assert.equal(s.energie.has('17,1'), false);
const g = s.guardiani[0]; g.delai = 0; g.x = 17; g.y = 1;
const punti = s.punti; L.passo(s, 0.14); assert.equal(s.punti, punti + 100); assert.ok(g.delai > 0);
s.potere = 0; s.invulnerabile = 0;
g.delai = 0; g.x = s.giocatore.x; g.y = s.giocatore.y;
L.passo(s, 0.14); assert.equal(s.vite, 2); assert.deepEqual(s.giocatore, { x: 1, y: 1 });
const v = L.crea(); v.guardiani.forEach(g => { g.delai = 10; }); v.puntini.clear();
L.passo(v, 0.14); assert.equal(v.finita, true); assert.equal(v.vinta, true);
const prima = JSON.stringify(v); L.passo(v, 10); assert.equal(JSON.stringify(v), prima);
console.log('OK Labirinto: 30 mappe connesse, bordi, movimento, luci, energia, guardiani, respawn e vittoria');

// Tappa 29.2: labirinto verticale del telefono (13 colonne, righe dispari)
for (const righe of [17, 23, 31]) {
    const t = L.crea(13, righe);
    assert.equal(t.griglia.length, righe); assert.equal(t.griglia[0].length, 13);
    const raggiungibili = L.distanze(t);
    const libere = t.griglia.flatMap((r, y) => r.map((v, x) => (v ? null : L.chiave(x, y)))).filter(Boolean);
    assert.ok(libere.every(k => raggiungibili.has(k)), `13 × ${righe}: tutte le caselle libere sono raggiungibili`);
    for (const g of t.guardiani) assert.ok(L.libero(t, g.x, g.y), `13 × ${righe}: guardiano su una casella libera`);
    assert.deepEqual([...t.energie].sort(), [`1,${righe - 2}`, `11,1`, `11,${righe - 2}`].sort());
    assert.ok([...t.energie].every(k => t.puntini.has(k)), `13 × ${righe}: le energie stanno su una luce`);
}
console.log('OK Labirinto verticale: 13 × 17, 13 × 23 e 13 × 31 connessi, guardiani ed energie negli angoli');
