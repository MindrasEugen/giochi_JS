const Volo = (() => {
    const LARGHEZZA = 600, ALTEZZA = 480, RAGGIO = 13, APERTURA = 150, VELOCITA = 175;
    // Il campo può essere più alto sul telefono (Tappa 29.2): i varchi (larghi sempre 150) si distribuiscono
    // su tutta l'altezza, a 125 dal bordo alto e dal basso come nel campo di 480
    function altezzaVarco(seme, i, altezza = ALTEZZA) {
        let n = (seme + Math.imul(i + 1, 2654435761)) >>> 0;
        n = Math.imul(n ^ (n >>> 16), 2246822507); n = Math.imul(n ^ (n >>> 13), 3266489909);
        return 125 + ((n ^ (n >>> 16)) >>> 0) / 4294967296 * (altezza - 250);
    }
    function prepara(s) {
        s.y = (s.altezza ?? ALTEZZA) / 2; s.vy = 0; s.punti = 0; s.distanza = 0; s.finita = false; s.attivo = false;
        s.prossimo = 0; s.ostacoli = [];
    }
    function crea(due = false, seme = Math.floor(Math.random() * 4294967296), altezza = ALTEZZA) {
        const s = { due, seme, turno: 0, risultati: [null, null], altezza }; prepara(s); return s;
    }
    function prossimo(s) { return s.due && s.turno === 0 && s.finita; }
    function avanza(s) { if (prossimo(s)) { s.turno = 1; prepara(s); } return s; }
    function salta(s) { if (!s.finita) { s.attivo = true; s.vy = -300; } }
    function termina(s) { s.finita = true; s.risultati[s.turno] = s.punti; }
    function passo(s, dt) {
        if (s.finita || !s.attivo) return;
        const n = Math.max(1, Math.ceil(dt / (1 / 120)));
        for (let k = 0; k < n && !s.finita; k++) {
            const delta = dt / n;
            s.vy += 850 * delta; s.y += s.vy * delta;
            s.distanza += VELOCITA * delta;
            while (s.prossimo * 230 <= s.distanza) {
                s.ostacoli.push({ x: 650 + s.prossimo * 230 - s.distanza + VELOCITA * delta, centro: altezzaVarco(s.seme, s.prossimo, s.altezza ?? ALTEZZA), contato: false }); s.prossimo++;
            }
            for (const o of s.ostacoli) {
                o.x -= VELOCITA * delta;
                if (!o.contato && o.x + 60 < 130 - RAGGIO) { o.contato = true; s.punti++; }
                if (o.x < 130 + RAGGIO && o.x + 60 > 130 - RAGGIO && (s.y - RAGGIO < o.centro - APERTURA / 2 || s.y + RAGGIO > o.centro + APERTURA / 2)) termina(s);
            }
            s.ostacoli = s.ostacoli.filter(o => o.x > -70);
            if (s.y < RAGGIO || s.y > (s.altezza ?? ALTEZZA) - RAGGIO) termina(s);
        }
    }
    return { LARGHEZZA, ALTEZZA, RAGGIO, APERTURA, altezzaVarco, crea, salta, passo, prossimo, avanza };
})();
if (typeof module !== 'undefined') module.exports = Volo;
