// Test della Cirulla: node cirulla/test-cirulla.js
const assert = require('node:assert/strict');
const C = require('./funzioni'), P = require('../js/prese-italiane'), M = require('../js/mazzo');
const carta = (numero, seme = 'bastoni') => M.italiano().find(c => c.numero === numero && c.seme === seme);
const seme = n => { let s = n; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
const prese = (c, tavolo) => P.presePossibili(c, tavolo, 'cirulla').map(p => p.join(','));

// Prese: uguale, somma, quindici
assert.deepEqual(prese(carta(6), [carta(2), carta(4), carta(9, 'coppe')]), ['0,1', '2']);              // 2+4 e 6+9=15
assert.deepEqual(prese(carta(10), [carta(10, 'spade'), carta(5), carta(5, 'coppe')]), ['0', '1', '2']); // il re prende il re (le somme no) oppure fa 15 con un 5
assert.deepEqual(prese(carta(3), [carta(4), carta(5)]), []);
assert.deepEqual(prese(carta(2), [carta(1), carta(4), carta(6, 'spade'), carta(2, 'spade')]), ['3', '0,1,2,3']); // il 2 uguale, oppure 2+1+4+6+2 = 15 (esempio della voce Wikipedia)
console.log('OK   prese: carta uguale con precedenza sulle somme, somme e presa del 15');

// Asso piglia tutto
assert.deepEqual(prese(carta(1), [carta(4), carta(7, 'spade')]), ['0,1']);
assert.deepEqual(prese(carta(1), [carta(1, 'spade'), carta(4), carta(10)]), ['0', '1,2']); // l'altro asso oppure 1+4+10=15
assert.deepEqual(prese(carta(1), []), []);
const asso = C.crea(seme(1)); asso.mani[0] = [carta(1), carta(5)]; asso.tavolo = [carta(4), carta(7, 'spade')]; asso.scope = [0, 0]; asso.mazzo = [carta(2)];
assert.ok(C.gioca(asso, { carta: 0, presa: [0, 1] })); assert.equal(asso.scope[0], 1); assert.equal(asso.tavolo.length, 0);
console.log('OK   asso senza assi in tavola prende tutto e vale scopa; con un asso in tavola no');

// Presa obbligatoria: non si può posare se si può prendere
const obbligo = C.crea(seme(2)); obbligo.mani[0] = [carta(6)]; obbligo.tavolo = [carta(9, 'coppe')];
assert.equal(C.gioca(obbligo, { carta: 0, presa: [] }), false);
console.log('OK   se si può prendere, prendere è obbligatorio');

// Bussate e matta
const matta = carta(7, 'coppe');
assert.deepEqual(P.accuso([carta(5), carta(5, 'spade'), carta(5, 'coppe')]), { tipo: 'decino', scope: 10 });
assert.deepEqual(P.accuso([carta(9), carta(9, 'spade'), matta]), { tipo: 'decino', scope: 10 });
assert.deepEqual(P.accuso([carta(1), carta(2), carta(6, 'spade')]), { tipo: 'bàrsega', scope: 3 });
assert.deepEqual(P.accuso([carta(3), carta(5), matta]), { tipo: 'bàrsega', scope: 3 }); // 3 + 5 + matta come asso = 9
assert.equal(P.accuso([carta(4), carta(5), carta(2, 'spade')]), null);                // 11
assert.equal(P.accuso([carta(7, 'spade'), carta(2), carta(1, 'spade')]), null);    // 10: non è meno di 10
console.log('OK   bussate: decino (anche con la matta) 10 scope, bàrsega (somma < 10, matta = 1) 3 scope');

// Tavola iniziale da 15 o 30 (la matta vale quello che serve)
assert.equal(P.sommaIniziale([carta(1), carta(4), carta(5), carta(5, 'spade')]), 15);
assert.equal(P.sommaIniziale([matta, carta(10), carta(10, 'spade'), carta(3)]), 30);   // 23 + 7
assert.equal(P.sommaIniziale([matta, carta(2), carta(3), carta(4)]), 15);              // matta = 6
let iniziali = 0;
for (let i = 1; i <= 400; i++) {
    const s = C.crea(seme(i)), somma = P.sommaIniziale([...s.tavolo, ...(s.iniziale ? s.catturate[1].slice(-4) : [])]);
    if (s.iniziale) {
        iniziali++;
        assert.equal(s.tavolo.length, 0); assert.equal(s.catturate[1].length, 4); assert.equal(s.ultimaPresa, 1);
        assert.ok(s.scope[1] >= s.iniziale.scope); assert.ok([15, 30].includes(s.iniziale.somma));
    } else {
        assert.ok(s.tavolo.filter(c => c.numero === 1).length < 2, 'due assi in tavola: si ridistribuisce');
        assert.ok(![15, 30].includes(somma));
    }
}
assert.ok(iniziali > 0);
console.log(`OK   tavola iniziale: 15 o 30 al mazziere come scope (${iniziali} casi su 400), due assi si ridistribuisce`);

// Punti: grande, piccola, carte, denari
assert.equal(P.scalaDenari([1, 2, 3].map(n => carta(n, 'denari')), 7), 3);
assert.equal(P.scalaDenari([1, 2, 3, 4, 5].map(n => carta(n, 'denari')), 7), 5);
assert.equal(P.scalaDenari([1, 2, 3, 5, 6].map(n => carta(n, 'denari')), 7), 3);
assert.equal(P.scalaDenari([1, 2, 3, 4, 5, 6, 7, 8].map(n => carta(n, 'denari')), 7), 7);
const finale = C.crea(seme(3));
finale.scope = [0, 0];
finale.catturate = [M.italiano().filter(c => c.seme === 'denari' || c.seme === 'coppe' || (c.seme === 'spade' && c.numero < 3)), []];
finale.catturate[1] = M.italiano().filter(c => !finale.catturate[0].some(x => x.seme === c.seme && x.numero === c.numero));
const r = C.risultato(finale);
assert.equal(r.dettaglio[0].grande, 5); assert.equal(r.dettaglio[0].piccola, 7);
assert.deepEqual(r.punti, [1 + 1 + 1 + 5 + 7 + r.dettaglio[0].primiera, r.dettaglio[1].primiera]); // carte 22, denari, settebello, grande, piccola
console.log('OK   punti: grande 5, piccola 3 + scala fino al 7, carte, denari, settebello e primiera');

// Smazzate complete: 40 carte, 36 giocate, punteggi interi
for (let i = 1; i <= 300; i++) {
    const casuale = seme(i), s = C.crea(casuale); let mosse = 0;
    while (!s.finita) {
        const legali = C.mosseLegali(s), m = i % 2 ? C.mossaPC(s) : legali[Math.floor(casuale() * legali.length)];
        assert.ok(C.gioca(s, m)); mosse++;
        const carte = [...s.mazzo, ...s.mani.flat(), ...s.tavolo, ...s.catturate.flat()];
        assert.equal(new Set(carte.map(c => `${c.seme}-${c.numero}`)).size, 40);
        assert.ok(mosse <= 36);
    }
    assert.equal(mosse, 36); assert.equal(s.catturate.flat().length, 40);
    assert.ok(C.risultato(s).punti.every(Number.isInteger));
}
console.log('OK   300 smazzate complete: carte conservate, 36 giocate, punteggi interi');
console.log('Tutti i controlli sono passati');
