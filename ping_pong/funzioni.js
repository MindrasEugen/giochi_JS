// Fisica indipendente dal canvas: coordinate logiche 720 × 440.
const PingPong = (() => {
    const LARGHEZZA = 720, ALTEZZA = 440, RACCHETTA = 88, RAGGIO = 8, TRAGUARDO = 7;
    const limita = (n, min, max) => Math.max(min, Math.min(max, n));
    function servizio(s, verso = 1) {
        s.palla = { x: 360, y: 220, vx: verso * 300, vy: 135 };
        s.attesa = 0.8;
    }
    function crea(due = false) {
        const s = { due, racchette: [176, 176], punti: [0, 0], finita: false };
        servizio(s);
        return s;
    }
    function passo(s, dt, comandi = [0, 0]) {
        if (s.finita) return;
        const destra = s.due ? (comandi[1] || 0) : limita((s.palla.y - (s.racchette[1] + RACCHETTA / 2)) / 28, -1, 1);
        s.racchette[0] = limita(s.racchette[0] + (comandi[0] || 0) * 370 * dt, 0, ALTEZZA - RACCHETTA);
        s.racchette[1] = limita(s.racchette[1] + destra * (s.due ? 370 : 265) * dt, 0, ALTEZZA - RACCHETTA);
        if (s.attesa > 0) { s.attesa -= dt; return; }
        // Sottopassi per non attraversare le racchette alle velocità più alte.
        const n = Math.max(1, Math.ceil(Math.hypot(s.palla.vx, s.palla.vy) * dt / 6));
        for (let k = 0; k < n; k++) {
            const p = s.palla;
            p.x += p.vx * dt / n; p.y += p.vy * dt / n;
            if (p.y < RAGGIO) { p.y = RAGGIO; p.vy = Math.abs(p.vy); }
            if (p.y > ALTEZZA - RAGGIO) { p.y = ALTEZZA - RAGGIO; p.vy = -Math.abs(p.vy); }
            const lato = p.vx < 0 ? 0 : 1;
            const bordo = lato === 0 ? 42 : LARGHEZZA - 42;
            const toccaX = lato === 0 ? p.x - RAGGIO <= bordo && p.x >= bordo - 16 : p.x + RAGGIO >= bordo && p.x <= bordo + 16;
            if (toccaX && p.y + RAGGIO >= s.racchette[lato] && p.y - RAGGIO <= s.racchette[lato] + RACCHETTA) {
                const angolo = limita((p.y - s.racchette[lato] - RACCHETTA / 2) / (RACCHETTA / 2), -1, 1) * 1.05;
                const velocita = Math.min(660, Math.hypot(p.vx, p.vy) + 22);
                p.x = bordo + (lato === 0 ? RAGGIO : -RAGGIO);
                p.vx = Math.cos(angolo) * velocita * (lato === 0 ? 1 : -1);
                p.vy = Math.sin(angolo) * velocita;
            }
            if (p.x < -RAGGIO || p.x > LARGHEZZA + RAGGIO) {
                const vince = p.x < 0 ? 1 : 0;
                s.punti[vince]++;
                s.finita = s.punti[vince] >= TRAGUARDO;
                servizio(s, vince === 0 ? -1 : 1);
                break;
            }
        }
    }
    return { LARGHEZZA, ALTEZZA, RACCHETTA, RAGGIO, TRAGUARDO, crea, passo };
})();
if (typeof module !== 'undefined') module.exports = PingPong;
