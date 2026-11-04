// Collisioni, livelli e bonus, senza dipendenze dalla pagina.
const Mattoncini = (() => {
    const LARGHEZZA = 600, ALTEZZA = 520, RAGGIO = 7, LIVELLI = 3;
    const limita = (n, min, max) => Math.max(min, Math.min(max, n));
    function preparaLivello(s) {
        s.mattoni = [];
        const righe = 3 + s.livello;
        for (let r = 0; r < righe; r++) for (let c = 0; c < 8; c++) {
            s.mattoni.push({ x: 24 + c * 70, y: 56 + r * 25, w: 62, h: 17, vivo: true, bonus: (r * 8 + c + s.livello) % 9 === 0 });
        }
        s.bonus = []; s.largo = 0;
        preparaPalla(s);
    }
    function preparaPalla(s) {
        s.palla = { x: s.racchetta, y: 471, vx: 170 + s.livello * 16, vy: -260 - s.livello * 22 };
        s.inAttesa = true;
    }
    function crea() {
        const s = { racchetta: 300, punti: 0, vite: 3, livello: 1, finita: false, vinta: false, largo: 0 };
        preparaLivello(s);
        return s;
    }
    function larghezza(s) { return s.largo > 0 ? 132 : 92; }
    function muovi(s, x) { s.racchetta = limita(x, larghezza(s) / 2, LARGHEZZA - larghezza(s) / 2); }
    function lancia(s) { if (!s.finita) s.inAttesa = false; }
    function cerchioRettangolo(p, r) {
        const dx = p.x - limita(p.x, r.x, r.x + r.w), dy = p.y - limita(p.y, r.y, r.y + r.h);
        return dx * dx + dy * dy <= RAGGIO * RAGGIO;
    }
    function passo(s, dt, direzione = 0) {
        if (s.finita) return;
        s.largo = Math.max(0, s.largo - dt);
        muovi(s, s.racchetta + direzione * 440 * dt);
        if (s.inAttesa) { s.palla.x = s.racchetta; return; }
        const p = s.palla;
        const n = Math.max(1, Math.ceil(Math.hypot(p.vx, p.vy) * dt / 5));
        for (let k = 0; k < n; k++) {
            const precedente = { x: p.x, y: p.y };
            p.x += p.vx * dt / n; p.y += p.vy * dt / n;
            if (p.x < RAGGIO) { p.x = RAGGIO; p.vx = Math.abs(p.vx); }
            if (p.x > LARGHEZZA - RAGGIO) { p.x = LARGHEZZA - RAGGIO; p.vx = -Math.abs(p.vx); }
            if (p.y < RAGGIO) { p.y = RAGGIO; p.vy = Math.abs(p.vy); }
            if (p.vy > 0 && precedente.y + RAGGIO <= 484 && p.y + RAGGIO >= 484 && Math.abs(p.x - s.racchetta) <= larghezza(s) / 2 + RAGGIO) {
                const angolo = limita((p.x - s.racchetta) / (larghezza(s) / 2), -1, 1) * 1.05;
                const velocita = Math.hypot(p.vx, p.vy);
                p.y = 484 - RAGGIO; p.vx = velocita * Math.sin(angolo); p.vy = -velocita * Math.cos(angolo);
            }
            const mattone = s.mattoni.find(m => m.vivo && cerchioRettangolo(p, m));
            if (mattone) {
                mattone.vivo = false; s.punti += 10 * s.livello;
                if (precedente.y + RAGGIO <= mattone.y || precedente.y - RAGGIO >= mattone.y + mattone.h) p.vy *= -1;
                else p.vx *= -1;
                p.x = precedente.x; p.y = precedente.y;
                if (mattone.bonus) s.bonus.push({ x: mattone.x + mattone.w / 2, y: mattone.y });
                if (s.mattoni.every(m => !m.vivo)) {
                    if (s.livello === LIVELLI) { s.finita = true; s.vinta = true; }
                    else { s.livello++; preparaLivello(s); }
                    return;
                }
            }
            if (p.y > ALTEZZA + RAGGIO) {
                s.vite--; s.finita = s.vite === 0;
                s.bonus = []; s.largo = 0;
                preparaPalla(s);
                return;
            }
        }
        s.bonus = s.bonus.filter(b => {
            b.y += 140 * dt;
            if (b.y >= 478 && b.y <= 500 && Math.abs(b.x - s.racchetta) <= larghezza(s) / 2 + 9) { s.largo = 10; return false; }
            return b.y < ALTEZZA;
        });
    }
    return { LARGHEZZA, ALTEZZA, RAGGIO, LIVELLI, crea, passo, muovi, lancia, larghezza, cerchioRettangolo };
})();
if (typeof module !== 'undefined') module.exports = Mattoncini;
