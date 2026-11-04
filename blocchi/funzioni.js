// Blocchi che cadono: logica pura, senza canvas.
const Blocchi = (() => {
    const COLONNE = 10, RIGHE = 20;
    const FORME = [
        [[1, 1, 1, 1]], [[1, 1], [1, 1]], [[0, 1, 0], [1, 1, 1]],
        [[0, 1, 1], [1, 1, 0]], [[1, 1, 0], [0, 1, 1]],
        [[1, 0, 0], [1, 1, 1]], [[0, 0, 1], [1, 1, 1]]
    ];
    function generatore(seme) {
        let n = seme >>> 0;
        return () => { n = (Math.imul(n, 1664525) + 1013904223) >>> 0; return n / 4294967296; };
    }
    function ruota(m) { return m[0].map((_, x) => m.map(r => r[x]).reverse()); }
    function valido(c, forma = c.pezzo.forma, x = c.pezzo.x, y = c.pezzo.y) {
        return forma.every((r, dy) => r.every((v, dx) => !v || (x + dx >= 0 && x + dx < COLONNE && y + dy < RIGHE && (y + dy < 0 || c.griglia[y + dy][x + dx] === 0))));
    }
    function pesca(c) {
        if (!c.sacco.length) {
            c.sacco = FORME.map((_, i) => i);
            for (let i = c.sacco.length - 1; i > 0; i--) {
                const j = Math.floor(c.casuale() * (i + 1));
                [c.sacco[i], c.sacco[j]] = [c.sacco[j], c.sacco[i]];
            }
        }
        return c.sacco.pop();
    }
    function nuovoPezzo(c) {
        const tipo = c.prossimo;
        c.prossimo = pesca(c);
        c.pezzo = { tipo, forma: FORME[tipo].map(r => [...r]), x: Math.floor((COLONNE - FORME[tipo][0].length) / 2), y: 0 };
        if (!valido(c)) c.finita = true;
    }
    function creaCampo(casuale) {
        const c = { griglia: Array.from({ length: RIGHE }, () => Array(COLONNE).fill(0)), punti: 0, righe: 0, finita: false, tempo: 0, ripeti: 0, asse: 0, sacco: [], casuale };
        c.prossimo = pesca(c); nuovoPezzo(c);
        return c;
    }
    function crea(due = false, seme = Math.floor(Math.random() * 4294967296)) {
        return { campi: Array.from({ length: due ? 2 : 1 }, () => creaCampo(generatore(seme))), finita: false };
    }
    function cancellaRighe(c) {
        const libere = c.griglia.filter(r => r.some(v => !v));
        const n = RIGHE - libere.length;
        c.griglia = [...Array.from({ length: n }, () => Array(COLONNE).fill(0)), ...libere];
        c.punti += [0, 100, 300, 500, 800][n] * livello(c);
        c.righe += n;
        return n;
    }
    function livello(c) { return 1 + Math.floor(c.righe / 10); }
    function fissa(c) {
        const p = c.pezzo;
        p.forma.forEach((r, dy) => r.forEach((v, dx) => { if (v && p.y + dy >= 0) c.griglia[p.y + dy][p.x + dx] = p.tipo + 1; }));
        cancellaRighe(c); nuovoPezzo(c); c.tempo = 0;
    }
    function muovi(c, dx) {
        if (c.finita || !valido(c, c.pezzo.forma, c.pezzo.x + dx, c.pezzo.y)) return false;
        c.pezzo.x += dx; return true;
    }
    function gira(c) {
        if (c.finita) return false;
        const forma = ruota(c.pezzo.forma);
        for (const dx of [0, -1, 1, -2, 2]) if (valido(c, forma, c.pezzo.x + dx)) {
            c.pezzo.forma = forma; c.pezzo.x += dx; return true;
        }
        return false;
    }
    function scendi(c, rapido = false) {
        if (c.finita) return false;
        if (valido(c, c.pezzo.forma, c.pezzo.x, c.pezzo.y + 1)) { c.pezzo.y++; if (rapido) c.punti++; return true; }
        fissa(c); return false;
    }
    function lascia(c) {
        if (c.finita) return;
        while (valido(c, c.pezzo.forma, c.pezzo.x, c.pezzo.y + 1)) { c.pezzo.y++; c.punti += 2; }
        fissa(c);
    }
    function passo(s, dt, comandi) {
        if (s.finita) return;
        s.campi.forEach((c, i) => {
            if (c.finita) return;
            const { asse = 0, giu = false } = comandi[i] || {};
            c.ripeti -= dt;
            if (asse && (c.asse !== asse || c.ripeti <= 0)) { muovi(c, asse); c.ripeti = c.asse !== asse ? 0.18 : 0.09; }
            c.asse = asse;
            c.tempo += dt;
            if (c.tempo >= (giu ? 0.045 : Math.max(0.09, 0.8 * 0.82 ** (livello(c) - 1)))) { c.tempo = 0; scendi(c, giu); }
        });
        s.finita = s.campi.some(c => c.finita);
    }
    return { COLONNE, RIGHE, FORME, generatore, ruota, valido, crea, cancellaRighe, livello, muovi, gira, scendi, lascia, passo };
})();
if (typeof module !== 'undefined') module.exports = Blocchi;
