// Navicella, colpi, rocce e ondate, senza dipendenze dalla pagina (Tappa 33).
const Meteore = (() => {
    const LARGHEZZA = 600, ALTEZZA = 520;
    // Misure delle rocce: 0 grande, 1 media, 2 piccola
    const RAGGI = [40, 23, 12], PUNTI = [20, 50, 100], SPINTA_PEZZI = [1, 1.45, 1.9];
    const RAGGIO_NAVE = 15, VITE = 3, VITA_EXTRA = 10000;
    const ROTAZIONE = 4.2, ROTAZIONE_DITO = 7, SPINTA = 270, VELOCITA_MAX = 360;
    // Nello spazio non c'è attrito: la navicella perde solo il 25% della velocità in un secondo
    const FRENO = 0.75;
    const COLPI_MAX = 4, VELOCITA_COLPO = 480, DURATA_COLPO = 0.9, CADENZA = 0.22;
    const INTOCCABILE = 2, PAUSA_ONDATA = 1.5, DISTANZA_NASCITA = 150, ROCCE_MAX = 11;
    const altezza = s => s.altezza ?? ALTEZZA;
    // Chi esce da un bordo rientra dal lato opposto; il margine evita che un oggetto sparisca a metà
    function rientra(s, o, margine) {
        const A = altezza(s);
        if (o.x < -margine) o.x += LARGHEZZA + 2 * margine;
        else if (o.x > LARGHEZZA + margine) o.x -= LARGHEZZA + 2 * margine;
        if (o.y < -margine) o.y += A + 2 * margine;
        else if (o.y > A + margine) o.y -= A + 2 * margine;
    }
    // Contorno irregolare fisso: 10 punti con distanza dal centro tra 0,62 e 1 volte il raggio
    function formaRoccia(caso) { return Array.from({ length: 10 }, () => 0.62 + caso() * 0.38); }
    function nuovaRoccia(s, x, y, misura, angolo) {
        const base = 38 + Math.min(s.ondata, 10) * 6;
        const velocita = base * SPINTA_PEZZI[misura] * (0.7 + s.caso() * 0.3);
        return { x, y, vx: Math.cos(angolo) * velocita, vy: Math.sin(angolo) * velocita, misura, raggio: RAGGI[misura],
            forma: formaRoccia(s.caso), giro: s.caso() * Math.PI * 2, rotazione: (s.caso() - 0.5) * 1.6 };
    }
    // Ondata nuova: rocce grandi lungo i bordi, mai vicine alla navicella
    function preparaOndata(s) {
        const A = altezza(s), quante = Math.min(3 + s.ondata, ROCCE_MAX);
        s.rocce = [];
        for (let i = 0; i < quante; i++) {
            let x, y, tentativi = 0;
            do {
                const lato = Math.floor(s.caso() * 4), t = s.caso();
                [x, y] = [[t * LARGHEZZA, 0], [LARGHEZZA, t * A], [t * LARGHEZZA, A], [0, t * A]][lato];
                tentativi++;
            } while (Math.hypot(x - s.nave.x, y - s.nave.y) < DISTANZA_NASCITA + RAGGI[0] && tentativi < 30);
            s.rocce.push(nuovaRoccia(s, x, y, 0, s.caso() * Math.PI * 2));
        }
        s.pausaOndata = 0;
    }
    function preparaNave(s) {
        s.nave = { x: LARGHEZZA / 2, y: altezza(s) / 2, vx: 0, vy: 0, angolo: -Math.PI / 2 };
        s.intoccabile = INTOCCABILE; s.spinta = false;
    }
    function crea(alto = ALTEZZA, caso = Math.random) {
        const s = { altezza: alto, caso, punti: 0, vite: VITE, ondata: 1, finita: false, colpi: [], ricarica: 0,
            prossimaVita: VITA_EXTRA, dito: null, rocce: [] };
        preparaNave(s);
        s.intoccabile = 0;
        preparaOndata(s);
        return s;
    }
    // Spara dalla punta della navicella; il colpo eredita la velocità della navicella
    function spara(s) {
        if (s.finita || s.ricarica > 0 || s.colpi.length >= COLPI_MAX) return false;
        const n = s.nave, cx = Math.cos(n.angolo), cy = Math.sin(n.angolo);
        s.colpi.push({ x: n.x + cx * RAGGIO_NAVE * 1.4, y: n.y + cy * RAGGIO_NAVE * 1.4,
            vx: n.vx + cx * VELOCITA_COLPO, vy: n.vy + cy * VELOCITA_COLPO, vita: DURATA_COLPO });
        s.ricarica = CADENZA;
        return true;
    }
    // Il dito sul campo (telefono): la navicella si gira verso il dito e, se è lontano, accelera verso di lui
    function punta(s, punto) { s.dito = punto ? { x: punto.x, y: punto.y } : null; }
    const differenzaAngolo = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
    function aggiungiPunti(s, punti) {
        s.punti += punti;
        while (s.punti >= s.prossimaVita) { s.vite++; s.prossimaVita += VITA_EXTRA; }
    }
    // Una roccia colpita si spezza in due pezzi più piccoli e più veloci, ai lati della sua direzione
    function spezza(s, indice) {
        const r = s.rocce[indice];
        s.rocce.splice(indice, 1);
        aggiungiPunti(s, PUNTI[r.misura]);
        if (r.misura === 2) return;
        const direzione = Math.atan2(r.vy, r.vx);
        for (const lato of [-1, 1]) s.rocce.push(nuovaRoccia(s, r.x, r.y, r.misura + 1, direzione + lato * (0.4 + s.caso() * 0.4)));
    }
    function perdiVita(s) {
        s.vite--; s.colpi = []; s.dito = null;
        if (s.vite <= 0) { s.vite = 0; s.finita = true; return; }
        preparaNave(s);
    }
    // comandi: { giro: -1 | 0 | 1, spinta: booleano, fuoco: booleano }
    function passo(s, dt, comandi = {}) {
        if (s.finita) return;
        const n = s.nave;
        s.ricarica = Math.max(0, s.ricarica - dt);
        s.intoccabile = Math.max(0, s.intoccabile - dt);
        let spinta = !!comandi.spinta;
        if (s.dito) {
            const verso = Math.atan2(s.dito.y - n.y, s.dito.x - n.x), d = differenzaAngolo(n.angolo, verso);
            n.angolo += Math.sign(d) * Math.min(Math.abs(d), ROTAZIONE_DITO * dt);
            if (Math.hypot(s.dito.x - n.x, s.dito.y - n.y) > Math.min(LARGHEZZA, altezza(s)) / 3) spinta = true;
        } else n.angolo += (comandi.giro || 0) * ROTAZIONE * dt;
        s.spinta = spinta;
        if (spinta) { n.vx += Math.cos(n.angolo) * SPINTA * dt; n.vy += Math.sin(n.angolo) * SPINTA * dt; }
        const freno = Math.pow(FRENO, dt);
        n.vx *= freno; n.vy *= freno;
        const v = Math.hypot(n.vx, n.vy);
        if (v > VELOCITA_MAX) { n.vx *= VELOCITA_MAX / v; n.vy *= VELOCITA_MAX / v; }
        n.x += n.vx * dt; n.y += n.vy * dt;
        rientra(s, n, RAGGIO_NAVE);
        if (comandi.fuoco) spara(s);
        s.colpi = s.colpi.filter(c => {
            c.x += c.vx * dt; c.y += c.vy * dt; c.vita -= dt;
            rientra(s, c, 2);
            return c.vita > 0;
        });
        for (const r of s.rocce) { r.x += r.vx * dt; r.y += r.vy * dt; r.giro += r.rotazione * dt; rientra(s, r, r.raggio); }
        // Colpi contro rocce: ogni colpo rompe al massimo una roccia
        s.colpi = s.colpi.filter(c => {
            const i = s.rocce.findIndex(r => Math.hypot(c.x - r.x, c.y - r.y) <= r.raggio);
            if (i < 0) return true;
            spezza(s, i);
            return false;
        });
        // Roccia contro navicella (cerchi), solo se la navicella non è intoccabile
        if (s.intoccabile <= 0 && s.rocce.some(r => Math.hypot(n.x - r.x, n.y - r.y) <= r.raggio + RAGGIO_NAVE * 0.8)) {
            perdiVita(s);
            return;
        }
        // Schermo ripulito: breve pausa, poi l'ondata successiva
        if (!s.rocce.length) {
            s.pausaOndata += dt;
            if (s.pausaOndata >= PAUSA_ONDATA) { s.ondata++; preparaOndata(s); }
        }
    }
    return { LARGHEZZA, ALTEZZA, RAGGI, PUNTI, RAGGIO_NAVE, COLPI_MAX, DURATA_COLPO, INTOCCABILE, VITA_EXTRA, PAUSA_ONDATA,
        DISTANZA_NASCITA, ROCCE_MAX, crea, passo, spara, punta, spezza, preparaOndata, nuovaRoccia };
})();
if (typeof module !== 'undefined') module.exports = Meteore;
