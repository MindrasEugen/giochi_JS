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
    assert.equal(s.livello, livello + 1); assert.equal(s.inAttesa, true);
}
assert.equal(s.finita, false, 'livelli infiniti: dopo il terzo si passa al quarto');
const perso = M.crea();
for (let vita = 2; vita >= 0; vita--) {
    M.lancia(perso); perso.palla = { x: 400, y: 528, vx: 0, vy: 300 };
    M.passo(perso, 1 / 60); assert.equal(perso.vite, vita);
}
assert.equal(perso.finita, true);
const prima = JSON.stringify(perso); M.passo(perso, 1); assert.equal(JSON.stringify(perso), prima, 'partita finita: nulla si muove');
console.log('OK Mattoncini: lancio, limiti, rimbalzi, punti, bonus, scadenza, livelli e tre vite');

// Tappa 29.2: campo alto 900 sul telefono (Tappa 31: racchetta alzata, fascia libera per il dito)
{
    const M = require('./funzioni');
    const s = M.crea(900);
    assert.equal(M.linea(s), 737, 'campo alto: la racchetta sale di un terzo dei 380 in più (fascia per il dito)'); assert.equal(s.palla.y, 724);
    assert.equal(M.linea(M.crea()), 484, 'campo di 520: racchetta dove era');
    assert.equal(s.mattoni[0].y, 56 + 95, 'campo alto: i mattoni scendono di un quarto dei 380 in più');
    assert.equal(M.crea().mattoni[0].y, 56, 'campo di 520: mattoni dove erano');
    M.lancia(s); s.palla = { x: s.racchetta, y: 715, vx: 0, vy: 300 };
    M.passo(s, 0.1);
    assert.ok(s.palla.vy < 0, 'campo alto: la palla rimbalza sulla racchetta alzata');
    s.palla = { x: 20, y: 880, vx: 0, vy: 400 }; M.passo(s, 0.1);
    assert.equal(s.vite, 2, 'campo alto: la vita si perde solo oltre il fondo di 900');
    console.log('OK Mattoncini con il campo alto del telefono');
}

// Tappa 31: colpi di bordo, livelli infiniti, mattoni che scendono, doppia palla
{
    const M = require('./funzioni');
    const livello = (n, alto) => { const s = M.crea(alto); s.livello = n; M.preparaLivello(s); M.lancia(s); return s; };
    const colpo = (s, spostamento, velocita) => {
        s.palla = { x: s.racchetta + spostamento, y: M.linea(s) - 10, vx: 0, vy: velocita };
        M.passo(s, 1 / 60); return Math.hypot(s.palla.vx, s.palla.vy);
    };
    // Colpo di bordo: +6% nel quarto esterno, nulla al centro, tetto a 1,6 volte la velocità del livello
    let s = livello(1);
    assert.ok(Math.abs(colpo(s, 0, 400) - 400) < 0.01, 'centro della racchetta: velocità uguale');
    assert.ok(Math.abs(colpo(s, 20, 400) - 400) < 0.01, 'metà interna: velocità uguale');
    assert.ok(Math.abs(colpo(s, 40, 400) - 424) < 0.01, 'bordo destro: +6%');
    assert.ok(Math.abs(colpo(s, -40, 400) - 424) < 0.01, 'bordo sinistro: +6%');
    const tetto = M.velocitaBase(s) * 1.6;
    assert.ok(Math.abs(colpo(s, 40, tetto) - tetto) < 0.01, 'oltre il tetto non accelera');
    s = livello(2); colpo(s, 40, 500); s.palla.y = 600; s.palla.vy = 300; M.passo(s, 1 / 60);
    assert.equal(s.vite, 2); assert.ok(Math.abs(Math.hypot(s.palla.vx, s.palla.vy) - M.velocitaBase(s)) < 0.01, 'nuova palla: velocità del livello');
    // Livelli infiniti: righe fino a 8, velocità che cresce fino a un tetto
    assert.equal(livello(4).mattoni.length, 56); assert.equal(livello(5).mattoni.length, 64); assert.equal(livello(9).mattoni.length, 64);
    assert.ok(M.velocitaBase(livello(6)) > M.velocitaBase(livello(5)));
    assert.equal(M.velocitaBase(livello(20)), M.velocitaBase(livello(12)));
    s = livello(7); s.mattoni.forEach((m, i) => { m.vivo = i === 0; });
    s.palla = { x: s.mattoni[0].x + 30, y: s.mattoni[0].y + 26, vx: 0, vy: -300 }; M.passo(s, 1 / 60);
    assert.equal(s.livello, 8); assert.equal(s.finita, false); assert.equal(s.punti, 70);
    // Mattoni fermi fino al livello 3, in discesa dal 4 (solo con la palla in gioco)
    s = livello(3); const y3 = s.mattoni[0].y; s.palla = { x: 300, y: 400, vx: 0, vy: -1 }; M.passo(s, 1);
    assert.equal(s.mattoni[0].y, y3, 'livello 3: mattoni fermi');
    s = livello(4); const y4 = s.mattoni[0].y; s.inAttesa = true; M.passo(s, 1);
    assert.equal(s.mattoni[0].y, y4, 'palla in attesa: mattoni fermi');
    M.lancia(s); s.palla = { x: 590, y: 450, vx: 0, vy: 0 }; M.passo(s, 1);
    assert.equal(s.mattoni[0].y, y4 + 4, 'livello 4: scendono di 4 al secondo');
    assert.ok(M.velocitaDiscesa(livello(6)) > M.velocitaDiscesa(livello(4)));
    assert.equal(M.velocitaDiscesa(livello(4, 1040)), 8, 'campo alto il doppio: discesa doppia');
    // Mattoni alla racchetta: una vita in meno e mattoni di nuovo su, quelli rotti restano rotti
    s = livello(4); s.mattoni[0].vivo = false;
    const ultimo = s.mattoni.at(-1); for (const m of s.mattoni) m.y += M.linea(s) - ultimo.h - 1 - ultimo.y;
    s.palla = { x: 590, y: 300, vx: 0, vy: 0 }; M.passo(s, 1);
    assert.equal(s.vite, 2); assert.equal(s.inAttesa, true);
    assert.ok(s.mattoni.every(m => m.y === m.y0)); assert.equal(s.mattoni[0].vivo, false);
    // Mattoni con °: solo dal livello 5, uno ogni nove, mai insieme al +
    assert.ok(!livello(4).mattoni.some(m => m.bonus === '°'));
    const l5 = livello(5).mattoni;
    assert.equal(l5.filter(m => m.bonus === '°').length, l5.filter(m => m.bonus === '+').length);
    assert.ok(l5.filter(m => m.bonus === '°').length >= 7);
    // Bonus °: seconda palla per 10 secondi
    s = livello(5); const doppio = s.mattoni.find(m => m.bonus === '°');
    s.palla = { x: doppio.x + 30, y: doppio.y + doppio.h + 9, vx: 0, vy: -300 }; M.passo(s, 1 / 60);
    assert.equal(s.bonus.length, 1); assert.equal(s.bonus[0].tipo, '°');
    s.bonus[0].x = s.racchetta; s.bonus[0].y = M.linea(s);
    s.palla = { x: 590, y: 500, vx: 0, vy: 0 }; M.passo(s, 1 / 60);
    assert.ok(s.palla2, 'bonus preso: seconda palla'); assert.equal(s.largo, 0, 'il ° non allarga la racchetta');
    assert.ok(s.palla2.vy < 0, "la seconda palla parte verso l'alto");
    // Con due palle, perderne una non toglie vite
    s.palla = { x: 590, y: M.ALTEZZA * 3, vx: 0, vy: 300 }; s.palla2 = { x: 300, y: 500, vx: 0, vy: 0 };
    M.passo(s, 1 / 60);
    assert.equal(s.vite, 3); assert.equal(s.palla2, null); assert.equal(s.palla.x, 300, "resta in campo l'altra palla");
    // Allo scadere dei 10 secondi la seconda palla sparisce
    s.palla2 = { x: 300, y: 500, vx: 0, vy: 0 }; s.doppia = 10;
    s.palla = { x: 590, y: 500, vx: 0, vy: 0 };
    for (let t = 0; t < 9; t++) M.passo(s, 1);
    assert.ok(s.palla2); M.passo(s, 1.01); assert.equal(s.palla2, null);
    console.log('OK Mattoncini Tappa 31: colpi di bordo, livelli infiniti, discesa dei mattoni, doppia palla');
}
