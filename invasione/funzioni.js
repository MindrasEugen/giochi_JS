const Invasione = (() => {
    const LARGHEZZA = 600, ALTEZZA = 560;
    function ondata(s) {
        s.nemici = [];
        for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) s.nemici.push({ x: 58 + c * 68, y: 65 + r * 43, vivo: true, tipo: r });
        s.verso = 1; s.proiettili = []; s.tiroNemico = 1.1; s.scudi = [100, 235, 370, 505].map(x => ({ x, y: 425, vita: 5 }));
    }
    function crea() {
        const s = { x: 300, punti: 0, vite: 3, livello: 1, finita: false, ricarica: 0, invulnerabile: 0 };
        ondata(s); return s;
    }
    function spara(s) {
        if (s.finita || s.ricarica > 0) return;
        s.proiettili.push({ x: s.x, y: 507, vy: -470, amico: true }); s.ricarica = 0.22;
    }
    function passo(s, dt, asse = 0, fuoco = false, casuale = Math.random) {
        if (s.finita) return;
        s.x = Math.max(18, Math.min(582, s.x + asse * 320 * dt));
        s.ricarica = Math.max(0, s.ricarica - dt); s.invulnerabile = Math.max(0, s.invulnerabile - dt);
        if (fuoco) spara(s);
        const vivi = s.nemici.filter(n => n.vivo);
        const spostamento = s.verso * (27 + s.livello * 9 + (21 - vivi.length) * 2) * dt;
        if (vivi.some(n => n.x + spostamento < 20 || n.x + spostamento > 580)) {
            s.verso *= -1; vivi.forEach(n => { n.y += 19; });
        } else vivi.forEach(n => { n.x += spostamento; });
        if (vivi.some(n => n.y >= 490)) { s.finita = true; return; }
        s.tiroNemico -= dt;
        if (s.tiroNemico <= 0 && vivi.length) {
            const n = vivi[Math.floor(casuale() * vivi.length)];
            s.proiettili.push({ x: n.x, y: n.y + 15, vy: 160 + s.livello * 15, amico: false });
            s.tiroNemico = Math.max(0.25, 1 - s.livello * 0.08);
        }
        for (const p of s.proiettili) {
            const prima = p.y; p.y += p.vy * dt;
            const attraversa = y => Math.min(prima, p.y) <= y + 12 && Math.max(prima, p.y) >= y - 12;
            const scudo = s.scudi.find(b => b.vita > 0 && Math.abs(p.x - b.x) < 30 && attraversa(b.y));
            if (scudo) { scudo.vita--; p.morto = true; continue; }
            if (p.amico) {
                const n = s.nemici.find(n => n.vivo && Math.abs(p.x - n.x) < 20 && attraversa(n.y));
                if (n) { n.vivo = false; p.morto = true; s.punti += 10 * (3 - n.tipo); }
            } else if (Math.abs(p.x - s.x) < 21 && attraversa(520)) {
                p.morto = true;
                if (s.invulnerabile === 0) { s.vite--; s.invulnerabile = 1.5; if (s.vite <= 0) s.finita = true; }
            }
        }
        s.proiettili = s.proiettili.filter(p => !p.morto && p.y > -20 && p.y < 580);
        if (!s.finita && s.nemici.every(n => !n.vivo)) { s.livello++; ondata(s); }
    }
    return { LARGHEZZA, ALTEZZA, crea, spara, passo };
})();
if (typeof module !== 'undefined') module.exports = Invasione;
