ArcadePagina.avvia({
    chiave: 'labirinto', larghezza: 608, altezza: 544,
    istruzioni: 'Frecce, WASD o pulsanti per esplorare. Raccogli le luci; i cristalli grandi allontanano i guardiani per 7 secondi.',
    istruzioniGesti: 'Scorri il dito sul campo per cambiare strada. Raccogli le luci; i cristalli grandi allontanano i guardiani per 7 secondi.',
    tasti: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'],
    crea: () => Labirinto.crea(),
    comando(s, codice) {
        const m = { ArrowUp: 'su', KeyW: 'su', ArrowDown: 'giu', KeyS: 'giu', ArrowLeft: 'sinistra', KeyA: 'sinistra', ArrowRight: 'destra', KeyD: 'destra' };
        if (m[codice]) Labirinto.gira(s, m[codice]);
    },
    // Gesto: scorrere nella direzione in cui andare
    gesti: { scorri(s, direzione) { Labirinto.gira(s, direzione); } },
    passo: (s, dt) => Labirinto.passo(s, dt), punti: s => s.punti,
    dati: s => ({ etichetta1: 'Punti', punti1: s.punti, etichetta2: 'Vite', punti2: s.vite,
        fase: s.potere > 0 ? `Energia ${Math.ceil(s.potere)} s` : `${s.puntini.size} luci` }),
    esito: s => s.vinta ? `Tutte le luci raccolte: hai vinto con ${s.punti} punti!` : `I guardiani ti hanno raggiunto: ${s.punti} punti.`,
    disegna(ctx, s, c) {
        s.griglia.forEach((r, y) => r.forEach((v, x) => {
            if (v) { ctx.fillStyle = c.primarioChiaro; ctx.fillRect(x * 32 + 2, y * 32 + 2, 28, 28); }
            else if (s.puntini.has(Labirinto.chiave(x, y))) {
                ctx.fillStyle = c.accento; const grande = s.energie.has(Labirinto.chiave(x, y));
                ctx.beginPath(); ctx.arc(x * 32 + 16, y * 32 + 16, grande ? 8 : 3, 0, Math.PI * 2); ctx.fill();
            }
        }));
        const rombo = (x, y, r, colore) => {
            ctx.fillStyle = colore; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); ctx.fill();
        };
        s.guardiani.forEach((g, i) => {
            if (g.delai > 0) return;
            const x = g.x * 32 + 16, y = g.y * 32 + 16;
            rombo(x, y, 12, s.potere > 0 ? c.info : [c.errore, c.avviso, c.bordo][i]);
            ctx.fillStyle = c.primario; ctx.fillRect(x - 6, y - 2, 12, 4);
        });
        ctx.globalAlpha = s.invulnerabile > 0 ? 0.6 : 1;
        rombo(s.giocatore.x * 32 + 16, s.giocatore.y * 32 + 16, 12, c.superficie);
        rombo(s.giocatore.x * 32 + 16, s.giocatore.y * 32 + 16, 4, c.accento); ctx.globalAlpha = 1;
    }
});
