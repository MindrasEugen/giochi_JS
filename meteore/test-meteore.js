const assert = require('node:assert/strict');
const M = require('./funzioni');
// Numeri casuali ripetibili, per avere sempre le stesse rocce
const generatore = (seme = 7) => () => { seme = (seme * 16807) % 2147483647; return (seme - 1) / 2147483646; };
const nuova = (alto) => M.crea(alto, generatore());
const fermo = s => { s.rocce = []; s.pausaOndata = -1000; };

// Partenza: 4 rocce grandi, mai vicine alla navicella
let s = nuova();
assert.equal(s.vite, 3); assert.equal(s.ondata, 1); assert.equal(s.rocce.length, 4);
assert.ok(s.rocce.every(r => r.misura === 0));
for (let prova = 0; prova < 50; prova++) {
    const t = M.crea(undefined, generatore(prova + 1));
    assert.ok(t.rocce.every(r => Math.hypot(r.x - t.nave.x, r.y - t.nave.y) >= M.DISTANZA_NASCITA), 'nessuna roccia nasce sopra la navicella');
}

// Rotazione e spinta, senza attrito: dopo la spinta la navicella continua a scivolare
s = nuova(); fermo(s);
const angolo = s.nave.angolo;
M.passo(s, 0.5, { giro: 1 });
assert.ok(s.nave.angolo > angolo, 'gira a destra');
s.nave.angolo = 0;
for (let i = 0; i < 30; i++) M.passo(s, 1 / 60, { spinta: true });
const v = s.nave.vx;
assert.ok(v > 100 && Math.abs(s.nave.vy) < 1e-9, 'accelera nella direzione in cui punta');
M.passo(s, 1, {});
assert.ok(s.nave.vx > v * 0.7 && s.nave.vx < v, 'senza spinta rallenta pochissimo');
for (let i = 0; i < 600; i++) M.passo(s, 1 / 60, { spinta: true });
assert.ok(Math.hypot(s.nave.vx, s.nave.vy) <= 360 + 1e-9, 'velocità massima');

// Rientro dai bordi, per navicella, colpi e rocce
s = nuova(); fermo(s);
s.nave = { x: -M.RAGGIO_NAVE - 1, y: 100, vx: 0, vy: 0, angolo: 0 }; M.passo(s, 0, {});
assert.ok(s.nave.x > 600, 'uscita a sinistra, rientra a destra');
s.nave = { x: 300, y: s.altezza + M.RAGGIO_NAVE + 1, vx: 0, vy: 0, angolo: 0 }; M.passo(s, 0, {});
assert.ok(s.nave.y < 0, 'uscita in basso, rientra in alto');
s.rocce = [{ ...M.nuovaRoccia(s, 650, 200, 0, 0), vx: 0, vy: 0 }]; M.passo(s, 0, {});
assert.ok(s.rocce[0].x < 0, 'anche le rocce rientrano');
s.rocce = []; s.colpi = [{ x: 603, y: 50, vx: 0, vy: 0, vita: 1 }]; M.passo(s, 0, {});
assert.ok(s.colpi[0].x < 0, 'anche i colpi rientrano');

// Colpi: al massimo 4 in volo, con una cadenza minima, e durano poco meno di un secondo
s = nuova(); fermo(s); s.nave.x = 300; s.nave.y = 260;
let sparati = 0;
for (let i = 0; i < 60; i++) { M.passo(s, 1 / 60, { fuoco: true }); sparati = Math.max(sparati, s.colpi.length); }
assert.equal(sparati, M.COLPI_MAX, 'massimo 4 colpi');
assert.equal(M.spara(s), false);
s.colpi = []; s.ricarica = 0;
assert.equal(M.spara(s), true); assert.equal(M.spara(s), false, 'cadenza: due colpi non partono insieme');
for (let t = 0; t < M.DURATA_COLPO + 0.05; t += 1 / 60) M.passo(s, 1 / 60, {});
assert.equal(s.colpi.length, 0, 'il colpo si spegne');

// Spaccatura: grande -> 2 medie -> 2 piccole -> niente, con i punti per misura
s = nuova(); fermo(s); s.nave.x = 50; s.nave.y = 50;
s.rocce = [M.nuovaRoccia(s, 400, 300, 0, 0)];
const colpisci = indice => { const r = s.rocce[indice]; s.colpi = [{ x: r.x, y: r.y, vx: 0, vy: 0, vita: 1 }]; M.passo(s, 0, {}); };
colpisci(0);
assert.equal(s.punti, 20); assert.deepEqual(s.rocce.map(r => r.misura), [1, 1]);
const vGrande = Math.hypot(...['vx', 'vy'].map(k => M.nuovaRoccia(s, 0, 0, 0, 0)[k]));
assert.ok(s.rocce.every(r => Math.hypot(r.vx, r.vy) > vGrande * 0.9), 'i pezzi sono più veloci');
colpisci(0);
assert.equal(s.punti, 70); assert.deepEqual(s.rocce.map(r => r.misura), [1, 2, 2]);
s.rocce.forEach((r, i) => { r.x = 150 + i * 120; r.y = 400; r.vx = r.vy = 0; });
colpisci(1);
assert.equal(s.punti, 170); assert.deepEqual(s.rocce.map(r => r.misura), [1, 2]);
assert.equal(s.colpi.length, 0, 'il colpo sparisce sulla roccia');

// Ondata ripulita: pausa e poi un'ondata nuova con una roccia in più
s = nuova(); s.nave.x = 300; s.nave.y = 260;
s.rocce = [];
M.passo(s, 1, {});
assert.equal(s.ondata, 1, 'breve pausa tra le ondate');
M.passo(s, M.PAUSA_ONDATA, {});
assert.equal(s.ondata, 2); assert.equal(s.rocce.length, 5);
s.ondata = 30; M.preparaOndata(s);
assert.equal(s.rocce.length, M.ROCCE_MAX, 'tetto di rocce per ondata');

// Vita persa, invulnerabilità e fine partita
s = nuova(); fermo(s);
s.rocce = [{ ...M.nuovaRoccia(s, s.nave.x, s.nave.y, 0, 0), vx: 0, vy: 0 }];
M.passo(s, 1 / 60, {});
assert.equal(s.vite, 2); assert.equal(s.intoccabile, M.INTOCCABILE);
assert.deepEqual([s.nave.x, s.nave.y, s.nave.vx], [300, s.altezza / 2, 0], 'la navicella riappare ferma al centro');
M.passo(s, 1, {});
assert.equal(s.vite, 2, 'intoccabile per 2 secondi');
M.passo(s, 1.1, {});
assert.equal(s.vite, 1);
s.intoccabile = 0; M.passo(s, 1 / 60, {});
assert.equal(s.vite, 0); assert.equal(s.finita, true);
const congelato = JSON.stringify(s.rocce); M.passo(s, 1, {});
assert.equal(JSON.stringify(s.rocce), congelato, 'a partita finita non si muove nulla');

// Vita extra ogni 10.000 punti
s = nuova(); fermo(s); s.nave.x = 50; s.nave.y = 50;
s.punti = 9990; s.rocce = [M.nuovaRoccia(s, 400, 300, 2, 0)];
colpisci(0);
assert.equal(s.punti, 10090); assert.equal(s.vite, 4);
s.punti = 19950; s.rocce = [M.nuovaRoccia(s, 400, 300, 2, 0)]; colpisci(0);
assert.equal(s.vite, 5); assert.equal(s.prossimaVita, 30000);

// Dito sul campo: la navicella si gira verso il dito; accelera solo se il dito è lontano
s = nuova(); fermo(s);
M.punta(s, { x: 300 + 80, y: s.altezza / 2 });
for (let i = 0; i < 60; i++) M.passo(s, 1 / 60, {});
assert.ok(Math.abs(s.nave.angolo) < 1e-6, 'punta il dito');
assert.equal(s.nave.vx, 0, 'dito vicino: nessuna spinta');
M.punta(s, { x: 590, y: s.altezza / 2 });
M.passo(s, 1 / 60, {});
assert.ok(s.nave.vx > 0 && s.spinta, 'dito lontano: accelera verso di lui');
M.punta(s, null); M.passo(s, 1 / 60, {});
assert.equal(s.spinta, false);

// Campo alto del telefono: la navicella parte al centro del campo
s = nuova(900);
assert.equal(s.nave.y, 450);
console.log('OK meteore: rocce, colpi, bordi, spinta, ondate, vite e dito');
