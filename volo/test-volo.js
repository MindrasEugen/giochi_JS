const assert = require('node:assert/strict');
const V = require('./funzioni');
const ostacoli = seme => Array.from({ length: 40 }, (_, i) => V.altezzaVarco(seme, i));
assert.deepEqual(ostacoli(55), ostacoli(55));
assert.notDeepEqual(ostacoli(55), ostacoli(56));
assert.ok(ostacoli(55).every(y => y >= 125 && y <= 355));
const s = V.crea(true, 55);
V.passo(s, 10); assert.equal(s.y, 240);
function gioca(st) {
    const varchi = [];
    for (let i = 0; i < 3000 && !st.finita; i++) {
        if (i % 45 === 0) V.salta(st);
        V.passo(st, 1 / 60);
        if (st.ostacoli.length) varchi.push(st.ostacoli[0].centro);
    }
    assert.equal(st.finita, true);
    return varchi;
}
const primo = gioca(s), punteggio = s.punti;
assert.equal(s.risultati[0], punteggio); assert.equal(V.prossimo(s), true);
V.avanza(s); assert.equal(s.turno, 1); assert.equal(s.punti, 0); assert.equal(s.attivo, false);
assert.deepEqual(gioca(s), primo); assert.equal(s.risultati[1], punteggio); assert.equal(V.prossimo(s), false);
const copia = JSON.stringify(s); V.salta(s); V.passo(s, 1); assert.equal(JSON.stringify(s), copia);
const punto = V.crea(); V.salta(punto); punto.ostacoli = [{ x: 54, centro: 240, contato: false }];
V.passo(punto, 1 / 60); assert.equal(punto.punti, 1);
V.passo(punto, 1 / 60); assert.equal(punto.punti, 1);
const urto = V.crea(); V.salta(urto); urto.ostacoli = [{ x: 120, centro: 100, contato: false }];
V.passo(urto, 1 / 60); assert.equal(urto.finita, true);
console.log('OK Volo: seme, varchi validi, avvio, impulso, turni identici, punteggio singolo e collisioni');
