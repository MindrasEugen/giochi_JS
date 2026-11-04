// Test della Briscola chiamata: node briscola_chiamata/test-briscola-chiamata.js
const assert = require('node:assert/strict');
const B = require('./funzioni'), M = require('../js/mazzo');
const carta = (numero, seme = 'bastoni') => M.italiano().find(c => c.numero === numero && c.seme === seme);
const seme = n => { let s = n; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };

const s = B.crea(seme(1));
assert.equal(s.mani.length, 5); assert.ok(s.mani.every(m => m.length === 8)); assert.equal(s.mazzo.length, 0);
assert.equal(s.fase, 'asta'); assert.equal(s.turno, 0);
assert.equal(B.mosseLegali(s).length, 11); // passo + 10 carte
console.log('OK   5 giocatori, 8 carte a testa, asta aperta dal giocatore 0');

// Asta: chiamate sempre più basse, chi passa non rientra
assert.ok(B.gioca(s, { numero: 10, punti: 61 }));        // 0 chiama il re
assert.equal(s.turno, 1);
assert.equal(B.gioca(s, { numero: 1, punti: 61 }), false); // l'asso è più alto del re: non si può
assert.ok(B.gioca(s, { passa: true }));                  // 1 passa
assert.ok(B.gioca(s, { numero: 2, punti: 61 }));          // 2 chiama il due
assert.deepEqual(B.mosseLegali(s).map(m => m.passa ? 'passo' : `${m.numero}/${m.punti}`), ['passo', '2/62', '2/66']);
assert.ok(B.gioca(s, { passa: true }));                  // 3
assert.ok(B.gioca(s, { passa: true }));                  // 4
assert.equal(s.turno, 0);                                // 1 è saltato perché ha passato
assert.ok(B.gioca(s, { numero: 2, punti: 62 }));          // 0 rilancia a 62
assert.equal(s.turno, 2);
assert.ok(B.gioca(s, { passa: true }));                  // 2 passa: resta 0
assert.equal(s.fase, 'seme'); assert.equal(s.chiamante, 0); assert.equal(s.soglia, 62); assert.equal(s.turno, 0);
console.log('OK   asta: carte sempre più basse, chi passa non rientra, dopo il due si rilancia a punti');

assert.ok(B.gioca(s, { seme: 'coppe' }));
assert.equal(s.briscola.seme, 'coppe'); assert.deepEqual(s.chiamata, { numero: 2, seme: 'coppe' });
assert.ok(s.mani[s.socio].some(c => c.numero === 2 && c.seme === 'coppe'));
assert.equal(s.fase, 'gioco'); assert.equal(s.turno, 0); assert.equal(s.socioRivelato, false);
console.log('OK   il chiamante sceglie la briscola; il socio è chi ha la carta chiamata');

// Tutti passano: nuova distribuzione
const vuota = B.crea(seme(2));
for (let k = 0; k < 5; k++) assert.ok(B.gioca(vuota, { passa: true }));
assert.equal(vuota.fase, 'asta'); assert.equal(vuota.passati.length, 0); assert.equal(vuota.ridistribuzioni, 1); assert.ok(vuota.ultimo.ridistribuita);
console.log('OK   se tutti passano si ridistribuisce');

// Il socio si rivela giocando la carta chiamata; punti della squadra e soglia
const rivela = B.crea(seme(3));
Object.assign(rivela, { fase: 'gioco', chiamante: 0, migliore: { giocatore: 0, numero: 1, punti: 61 }, soglia: 61, briscola: { seme: 'spade' }, chiamata: { numero: 1, seme: 'spade' }, socio: 2, turno: 2 });
rivela.mani[2] = [carta(1, 'spade'), ...rivela.mani[2].filter(c => !(c.numero === 1 && c.seme === 'spade')).slice(0, 7)];
assert.ok(B.gioca(rivela, { carta: 0 })); assert.equal(rivela.socioRivelato, true);
console.log('OK   giocare la carta chiamata rivela il socio');

// Conoscenze del PC: prima della rivelazione il chiamante non sa chi è il socio, il socio sì
const sapere = B.crea(seme(4));
Object.assign(sapere, { fase: 'gioco', chiamante: 0, briscola: { seme: 'denari' }, chiamata: { numero: 3, seme: 'denari' }, socio: 3 });
sapere.mani[3] = [carta(3, 'denari'), ...sapere.mani[3].slice(1)];
sapere.mani.forEach((m, g) => { if (g !== 3) sapere.mani[g] = m.filter(c => !(c.numero === 3 && c.seme === 'denari')); });
assert.deepEqual([...B.alleati(sapere, 0)], [0]);
assert.deepEqual([...B.alleati(sapere, 3)].sort(), [0, 3]);
assert.deepEqual([...B.alleati(sapere, 1)], [1]);
sapere.socioRivelato = true;
assert.deepEqual([...B.alleati(sapere, 1)].sort(), [1, 2, 4]);
assert.deepEqual([...B.alleati(sapere, 0)].sort(), [0, 3]);
console.log('OK   il PC conosce solo quello che saprebbe un giocatore vero');

// Smazzate complete con asta del PC
let vinteChiamante = 0;
for (let i = 1; i <= 300; i++) {
    const casuale = seme(i), st = B.crea(casuale); let azioni = 0;
    while (!st.finita) {
        if (st.presaCompleta) { const v = B.vincitorePresa(st.tavolo, st.briscola.seme); assert.ok(B.raccogli(st)); assert.equal(st.turno, v); }
        else {
            const legali = B.mosseLegali(st), m = st.fase === 'gioco' && i % 3 === 0 ? legali[Math.floor(casuale() * legali.length)] : B.mossaPC(st);
            assert.ok(B.gioca(st, m));
        }
        assert.ok(++azioni < 400);
        if (st.fase !== 'asta') assert.equal(new Set([...st.mani.flat(), ...st.catturate.flat(), ...st.tavolo.map(p => p.carta)].map(c => `${c.seme}-${c.numero}`)).size, 40);
    }
    const r = B.risultato(st);
    assert.equal(r.punti[0] + r.punti[1], 120);
    assert.equal(r.vincitore, r.punti[0] >= st.soglia ? 0 : 1);
    if (r.vincitore === 0) vinteChiamante++;
    const fine = JSON.stringify(st); assert.equal(B.gioca(st, { carta: 0 }), false); assert.equal(JSON.stringify(st), fine);
}
console.log(`OK   300 smazzate complete con asta del PC: 120 punti, vittoria secondo la soglia (chiamante vince ${vinteChiamante} volte)`);
console.log('Tutti i controlli sono passati');
