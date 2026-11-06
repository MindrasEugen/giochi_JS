// Labirinto originale generato con corridoi connessi e passaggi aggiuntivi.
const Labirinto = (() => {
    const COLONNE = 19, RIGHE = 17;
    const DIREZIONI = { su: [0, -1], giu: [0, 1], sinistra: [-1, 0], destra: [1, 0] };
    const chiave = (x, y) => `${x},${y}`;
    // Misure dispari (corridoi e muri alternati): 19 × 17 sugli schermi larghi, più alto sul telefono (Tappa 29.2)
    function mappa(seme = 731, colonne = COLONNE, righe = RIGHE) {
        const griglia = Array.from({ length: righe }, () => Array(colonne).fill(1));
        let n = seme >>> 0;
        const casuale = () => { n = (Math.imul(n, 1664525) + 1013904223) >>> 0; return n / 4294967296; };
        const pila = [[1, 1]]; griglia[1][1] = 0;
        while (pila.length) {
            const [x, y] = pila[pila.length - 1];
            const scelte = Object.values(DIREZIONI).map(([dx, dy]) => [x + dx * 2, y + dy * 2, dx, dy])
                .filter(([xx, yy]) => xx > 0 && yy > 0 && xx < colonne - 1 && yy < righe - 1 && griglia[yy][xx]);
            if (!scelte.length) { pila.pop(); continue; }
            const [xx, yy, dx, dy] = scelte[Math.floor(casuale() * scelte.length)];
            griglia[y + dy][x + dx] = 0; griglia[yy][xx] = 0; pila.push([xx, yy]);
        }
        for (let y = 1; y < righe - 1; y++) for (let x = 1; x < colonne - 1; x++) {
            if (griglia[y][x] && ((griglia[y][x - 1] === 0 && griglia[y][x + 1] === 0) || (griglia[y - 1][x] === 0 && griglia[y + 1][x] === 0)) && casuale() < 0.2) griglia[y][x] = 0;
        }
        return griglia;
    }
    // Energie e guardiani negli altri tre angoli (con 19 × 17: 17,1 / 1,15 / 17,15)
    function crea(colonne = COLONNE, righe = RIGHE) {
        const griglia = mappa(731, colonne, righe), puntini = new Set();
        const x2 = colonne - 2, y2 = righe - 2;
        griglia.forEach((r, y) => r.forEach((v, x) => { if (!v && (x !== 1 || y !== 1)) puntini.add(chiave(x, y)); }));
        return { griglia, puntini, energie: new Set([chiave(x2, 1), chiave(1, y2), chiave(x2, y2)]),
            giocatore: { x: 1, y: 1 }, guardiani: [[x2, y2], [x2, 1], [1, y2]].map(([x, y]) => ({ x, y, casaX: x, casaY: y, delai: 0 })),
            direzione: null, prossima: null, punti: 0, vite: 3, potere: 0, invulnerabile: 1.5,
            tempo: 0, tempoGuardie: 0, finita: false, vinta: false };
    }
    function libero(s, x, y) { return s.griglia[y]?.[x] === 0; }
    function vicini(s, p) { return Object.values(DIREZIONI).map(([dx, dy]) => ({ x: p.x + dx, y: p.y + dy })).filter(p => libero(s, p.x, p.y)); }
    function distanze(s) {
        const coda = [s.giocatore], dist = new Map([[chiave(s.giocatore.x, s.giocatore.y), 0]]);
        for (let i = 0; i < coda.length; i++) for (const p of vicini(s, coda[i])) {
            const k = chiave(p.x, p.y);
            if (!dist.has(k)) { dist.set(k, dist.get(chiave(coda[i].x, coda[i].y)) + 1); coda.push(p); }
        }
        return dist;
    }
    function gira(s, d) { if (DIREZIONI[d] && !s.finita) s.prossima = d; }
    function collisioni(s) {
        for (const g of s.guardiani) {
            if (g.delai > 0 || g.x !== s.giocatore.x || g.y !== s.giocatore.y) continue;
            if (s.potere > 0) { s.punti += 100; g.x = g.casaX; g.y = g.casaY; g.delai = 2; }
            else if (s.invulnerabile === 0) {
                s.vite--; s.finita = s.vite === 0;
                s.giocatore = { x: 1, y: 1 }; s.direzione = null; s.prossima = null; s.invulnerabile = 2;
                s.guardiani.forEach(g => { g.x = g.casaX; g.y = g.casaY; g.delai = 0; });
                return;
            }
        }
    }
    function passo(s, dt) {
        if (s.finita) return;
        s.potere = Math.max(0, s.potere - dt); s.invulnerabile = Math.max(0, s.invulnerabile - dt);
        s.guardiani.forEach(g => { g.delai = Math.max(0, g.delai - dt); });
        s.tempo += dt; s.tempoGuardie += dt;
        if (s.tempo >= 0.13) {
            s.tempo -= 0.13;
            const puo = d => { const v = DIREZIONI[d]; return v && libero(s, s.giocatore.x + v[0], s.giocatore.y + v[1]); };
            if (puo(s.prossima)) s.direzione = s.prossima;
            if (puo(s.direzione)) { const [dx, dy] = DIREZIONI[s.direzione]; s.giocatore.x += dx; s.giocatore.y += dy; }
            const k = chiave(s.giocatore.x, s.giocatore.y);
            if (s.puntini.delete(k)) s.punti += 10;
            if (s.energie.delete(k)) { s.potere = 7; s.punti += 40; }
            collisioni(s);
            if (!s.finita && s.puntini.size === 0) { s.finita = true; s.vinta = true; }
        }
        if (!s.finita && s.tempoGuardie >= 0.26) {
            s.tempoGuardie -= 0.26;
            const dist = distanze(s);
            s.guardiani.forEach((g, i) => {
                if (g.delai > 0) return;
                const opzioni = vicini(s, g);
                // Ruota i pari merito: i guardiani non percorrono sempre la stessa traiettoria.
                const ordinate = [...opzioni.slice(i % opzioni.length), ...opzioni.slice(0, i % opzioni.length)];
                ordinate.sort((a, b) => (dist.get(chiave(a.x, a.y)) - dist.get(chiave(b.x, b.y))) * (s.potere > 0 ? -1 : 1));
                if (ordinate.length) { g.x = ordinate[0].x; g.y = ordinate[0].y; }
            });
            collisioni(s);
        }
    }
    return { COLONNE, RIGHE, DIREZIONI, chiave, mappa, crea, libero, vicini, distanze, gira, passo };
})();
if (typeof module !== 'undefined') module.exports = Labirinto;
