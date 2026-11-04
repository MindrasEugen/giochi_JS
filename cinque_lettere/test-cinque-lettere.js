const assert = require('node:assert/strict');
const C = require('./funzioni'), parole = require('./parole'), dizionario = new Set(parole);
assert.ok(parole.length > 158);
assert.equal(dizionario.size, parole.length);
assert.ok(parole.every(p => /^[a-z]{5}$/.test(p)));
assert.equal(C.normalizza(' CITTÀ '), 'citta');
assert.equal(C.controlla(' CITTÀ ', dizionario), '');
assert.ok(C.controlla('a-bcd', dizionario));
assert.ok(C.controlla('zzzzz', dizionario));
assert.deepEqual(C.colora('cassa', 'sasso'), ['assente', 'esatta', 'esatta', 'esatta', 'assente']);
assert.deepEqual(C.colora('mamma', 'amami'), ['presente', 'presente', 'presente', 'esatta', 'assente']);
assert.deepEqual(C.colora('acqua', 'acqua'), Array(5).fill('esatta'));
// Controllo indipendente delle molteplicità su tutte le 59.049 coppie di parole di a/b/c.
const campioni = Array.from({ length: 243 }, (_, n) => {
    let p = ''; for (let i = 0; i < 5; i++) { p += 'abc'[n % 3]; n = Math.floor(n / 3); } return p;
});
for (const segreta of campioni) for (const tentativo of campioni) {
    const esiti = C.colora(segreta, tentativo);
    for (let i = 0; i < 5; i++) assert.equal(esiti[i] === 'esatta', segreta[i] === tentativo[i]);
    for (const l of 'abc') {
        const colorate = [...tentativo].filter((x, i) => x === l && esiti[i] !== 'assente').length;
        assert.equal(colorate, Math.min([...segreta].filter(x => x === l).length, [...tentativo].filter(x => x === l).length));
    }
}
const s = C.crea('cassa', dizionario);
const prima = JSON.stringify(s);
C.tenta(s, 'zzzzz', dizionario); assert.equal(JSON.stringify(s), prima);
C.tenta(s, 'sasso', dizionario); assert.equal(s.tastiera.s, 'esatta');
assert.ok(C.tenta(s, 'sasso', dizionario).errore); assert.equal(s.tentativi.length, 1);
C.tenta(s, 'sedia', dizionario); assert.equal(s.tastiera.s, 'esatta');
C.tenta(s, 'cassa', dizionario); assert.equal(s.finita, true); assert.equal(s.vinta, true);
const conclusa = JSON.stringify(s); C.tenta(s, 'mamma', dizionario); assert.equal(JSON.stringify(s), conclusa);
const persa = C.crea('acqua', dizionario);
for (const p of ['mamma', 'cassa', 'sasso', 'sedia', 'torre', 'terra']) C.tenta(persa, p, dizionario);
assert.equal(persa.finita, true); assert.equal(persa.vinta, false); assert.equal(persa.tentativi.length, 6);
const sfida = C.creaSfida();
assert.equal(C.registra(sfida, C.crea('mamma', dizionario)), false);
assert.equal(C.registra(sfida, s), true); assert.equal(sfida.risultati[1], 3); assert.equal(sfida.turno, 1);
assert.equal(C.registra(sfida, persa), true); assert.equal(sfida.risultati[0], 7); assert.equal(sfida.finita, true);
assert.equal(C.vincitore(sfida), 1); assert.equal(C.registra(sfida, s), false);
const pari = C.creaSfida(); C.registra(pari, persa); C.registra(pari, persa); assert.equal(C.vincitore(pari), null);
console.log(`OK Cinque lettere: ${parole.length} parole uniche, 59.049 coppie con doppie, validazione, tastiera, sei tentativi e sfida`);
