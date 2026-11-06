// Collisioni, livelli e bonus, senza dipendenze dalla pagina.
const Mattoncini = (() => {
    const LARGHEZZA = 600, ALTEZZA = 520, RAGGIO = 7;
    // Tappa 31: livelli infiniti; dal 4 i mattoni scendono, dal 5 compaiono i mattoni con ° (doppia palla)
    const LIVELLO_DISCESA = 4, LIVELLO_DOPPIA = 5, RIGHE_MAX = 8, DURATA_BONUS = 10;
    // Il campo può essere più alto sul telefono (Tappa 29.2): racchetta e fondo si misurano da s.altezza
    const altezza = s => s.altezza ?? ALTEZZA;
    const linea = s => altezza(s) - 36; // altezza della racchetta (484 con il campo di 520)
    const limita = (n, min, max) => Math.max(min, Math.min(max, n));
    // Velocità di partenza della palla: cresce a ogni livello fino al dodicesimo, poi resta quella
    function velocitaLivello(livello) {
        const l = Math.min(livello, 12);
        return { vx: 170 + l * 16, vy: 260 + l * 22 };
    }
    const velocitaBase = s => { const v = velocitaLivello(s.livello); return Math.hypot(v.vx, v.vy); };
    // Colpo sul bordo della racchetta: +6%, fino a 1,6 volte la velocità di partenza del livello
    const SPINTA_BORDO = 1.06, TETTO_VELOCITA = 1.6;
    // Discesa dei mattoni (unità al secondo), in proporzione all'altezza del campo
    function velocitaDiscesa(s) {
        if (s.livello < LIVELLO_DISCESA) return 0;
        return Math.min(10, 4 + (s.livello - LIVELLO_DISCESA)) * altezza(s) / ALTEZZA;
    }
    function preparaLivello(s) {
        s.mattoni = [];
        const righe = Math.min(3 + s.livello, RIGHE_MAX);
        // Nel campo alto del telefono i mattoni scendono di un quarto dell'altezza in più: meno strada fino alla racchetta
        const scesa = Math.round((altezza(s) - ALTEZZA) / 4);
        for (let r = 0; r < righe; r++) for (let c = 0; c < 8; c++) {
            const i = r * 8 + c + s.livello;
            const bonus = i % 9 === 0 ? '+' : s.livello >= LIVELLO_DOPPIA && i % 9 === 4 ? '°' : null;
            const y = 56 + scesa + r * 25;
            s.mattoni.push({ x: 24 + c * 70, y, y0: y, w: 62, h: 17, riga: r, vivo: true, bonus });
        }
        s.bonus = []; s.largo = 0;
        preparaPalla(s);
    }
    function preparaPalla(s) {
        const v = velocitaLivello(s.livello);
        s.palla = { x: s.racchetta, y: linea(s) - 13, vx: v.vx, vy: -v.vy };
        s.palla2 = null; s.doppia = 0;
        s.inAttesa = true;
    }
    function crea(alto = ALTEZZA) {
        const s = { racchetta: 300, punti: 0, vite: 3, livello: 1, finita: false, largo: 0, altezza: alto };
        preparaLivello(s);
        return s;
    }
    function perdiVita(s) {
        s.vite--; s.finita = s.vite === 0;
        s.bonus = []; s.largo = 0;
        for (const m of s.mattoni) m.y = m.y0; // i mattoni tornano su, quelli rotti restano rotti
        preparaPalla(s);
    }
    function larghezza(s) { return s.largo > 0 ? 132 : 92; }
    function muovi(s, x) { s.racchetta = limita(x, larghezza(s) / 2, LARGHEZZA - larghezza(s) / 2); }
    function lancia(s) { if (!s.finita) s.inAttesa = false; }
    function cerchioRettangolo(p, r) {
        const dx = p.x - limita(p.x, r.x, r.x + r.w), dy = p.y - limita(p.y, r.y, r.y + r.h);
        return dx * dx + dy * dy <= RAGGIO * RAGGIO;
    }
    // Muove una palla; restituisce 'persa' se esce dal fondo, 'livello' se rompe l'ultimo mattone
    function muoviPalla(s, p, dt) {
        const n = Math.max(1, Math.ceil(Math.hypot(p.vx, p.vy) * dt / 5));
        for (let k = 0; k < n; k++) {
            const precedente = { x: p.x, y: p.y };
            p.x += p.vx * dt / n; p.y += p.vy * dt / n;
            if (p.x < RAGGIO) { p.x = RAGGIO; p.vx = Math.abs(p.vx); }
            if (p.x > LARGHEZZA - RAGGIO) { p.x = LARGHEZZA - RAGGIO; p.vx = -Math.abs(p.vx); }
            if (p.y < RAGGIO) { p.y = RAGGIO; p.vy = Math.abs(p.vy); }
            const y = linea(s);
            if (p.vy > 0 && precedente.y + RAGGIO <= y && p.y + RAGGIO >= y && Math.abs(p.x - s.racchetta) <= larghezza(s) / 2 + RAGGIO) {
                const punto = limita((p.x - s.racchetta) / (larghezza(s) / 2), -1, 1);
                const angolo = punto * 1.05;
                let velocita = Math.hypot(p.vx, p.vy);
                // Quarto esterno della racchetta, a destra o a sinistra: la palla accelera
                if (Math.abs(punto) > 0.5) velocita = Math.min(velocita * SPINTA_BORDO, velocitaBase(s) * TETTO_VELOCITA);
                p.y = y - RAGGIO; p.vx = velocita * Math.sin(angolo); p.vy = -velocita * Math.cos(angolo);
            }
            const mattone = s.mattoni.find(m => m.vivo && cerchioRettangolo(p, m));
            if (mattone) {
                mattone.vivo = false; s.punti += 10 * s.livello;
                if (precedente.y + RAGGIO <= mattone.y || precedente.y - RAGGIO >= mattone.y + mattone.h) p.vy *= -1;
                else p.vx *= -1;
                p.x = precedente.x; p.y = precedente.y;
                if (mattone.bonus) s.bonus.push({ x: mattone.x + mattone.w / 2, y: mattone.y, tipo: mattone.bonus });
                if (s.mattoni.every(m => !m.vivo)) return 'livello';
            }
            if (p.y > altezza(s) + RAGGIO) return 'persa';
        }
        return null;
    }
    // Bonus °: parte una seconda palla dalla racchetta per DURATA_BONUS secondi (se c'è già, si ricarica il tempo)
    function doppiaPalla(s) {
        s.doppia = DURATA_BONUS;
        if (s.palla2) return;
        const v = velocitaLivello(s.livello);
        s.palla2 = { x: s.racchetta, y: linea(s) - RAGGIO - 1, vx: s.palla.vx > 0 ? -v.vx : v.vx, vy: -v.vy };
    }
    function passo(s, dt, direzione = 0) {
        if (s.finita) return;
        s.largo = Math.max(0, s.largo - dt);
        muovi(s, s.racchetta + direzione * 440 * dt);
        if (s.inAttesa) { s.palla.x = s.racchetta; return; }
        // La seconda palla sparisce allo scadere del tempo
        if (s.palla2) { s.doppia -= dt; if (s.doppia <= 0) { s.palla2 = null; s.doppia = 0; } }
        // Dal livello 4 i mattoni scendono; se il più basso arriva alla racchetta si perde una vita
        const discesa = velocitaDiscesa(s) * dt;
        if (discesa > 0) {
            let fondo = 0;
            for (const m of s.mattoni) if (m.vivo) { m.y += discesa; fondo = Math.max(fondo, m.y + m.h); }
            if (fondo >= linea(s)) { perdiVita(s); return; }
        }
        for (const chiave of ['palla', 'palla2']) {
            if (!s[chiave]) continue;
            const esito = muoviPalla(s, s[chiave], dt);
            if (esito === 'livello') { s.livello++; preparaLivello(s); return; }
            if (esito === 'persa') {
                if (chiave === 'palla2') { s.palla2 = null; s.doppia = 0; }
                else if (s.palla2) { s.palla = s.palla2; s.palla2 = null; s.doppia = 0; } // resta in campo l'altra palla
                else { perdiVita(s); return; }
            }
        }
        s.bonus = s.bonus.filter(b => {
            b.y += 140 * dt;
            if (b.y >= linea(s) - 6 && b.y <= linea(s) + 16 && Math.abs(b.x - s.racchetta) <= larghezza(s) / 2 + 9) {
                if (b.tipo === '°') doppiaPalla(s); else s.largo = DURATA_BONUS;
                return false;
            }
            return b.y < altezza(s);
        });
    }
    return { LARGHEZZA, ALTEZZA, RAGGIO, LIVELLO_DISCESA, LIVELLO_DOPPIA, DURATA_BONUS, linea, crea, passo, muovi, lancia, larghezza, cerchioRettangolo, velocitaLivello, velocitaBase, velocitaDiscesa, preparaLivello };
})();
if (typeof module !== 'undefined') module.exports = Mattoncini;
