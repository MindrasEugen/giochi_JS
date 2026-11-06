ArcadePagina.avvia({
    chiave: 'serpente', larghezza: 480, altezza: 480,
    istruzioni: 'Scorri il dito sul campo o usa le frecce. In due: metà sinistra (o frecce) per il verde, metà destra (o WASD) per il dorato.',
    istruzioniGesti: 'Scorri il dito sul campo per girare. In due: chi scorre a sinistra guida il verde, chi scorre a destra il dorato.',
    tasti: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'],
    crea(due) { return { ...statoIniziale(due ? 2 : 1), trascorso: 0 }; },
    comando(s, tasto, due) {
        const frecce = { ArrowUp: 'su', ArrowDown: 'giu', ArrowLeft: 'sinistra', ArrowRight: 'destra' };
        const wasd = { KeyW: 'su', KeyS: 'giu', KeyA: 'sinistra', KeyD: 'destra' };
        if (frecce[tasto]) gira(s.serpenti[0], frecce[tasto]);
        if (wasd[tasto]) gira(s.serpenti[due ? 1 : 0], wasd[tasto]);
    },
    // Gesto sul campo: in due ogni giocatore usa la sua metà
    gesti: { scorri(s, direzione, due, lato) { gira(s.serpenti[due ? lato : 0], direzione); } },
    passo(s, dt) {
        s.trascorso += dt * 1000;
        const tempo = intervallo(Math.max(...s.serpenti.map(p => p.punti)));
        if (s.trascorso >= tempo) { s.trascorso -= tempo; passo(s); }
    },
    punti: s => s.serpenti[0].punti,
    dati(s, due, nome) {
        return { etichetta1: due ? nome(0) : 'Cibo raccolto', punti1: s.serpenti[0].punti,
            etichetta2: due ? nome(1) : 'Lunghezza', punti2: due ? s.serpenti[1].punti : s.serpenti[0].corpo.length,
            fase: due ? 'Duello' : 'Esplorazione' };
    },
    esito(s, due, nome) {
        if (!due) return s.serpenti[0].vivo ? 'Griglia completata: hai vinto!' : `Hai raccolto ${s.serpenti[0].punti} cibi. Riprova a superarti!`;
        const vivi = s.serpenti.map((p, i) => p.vivo ? i : -1).filter(i => i >= 0);
        if (vivi.length === 1) return `Vince ${nome(vivi[0])}: è rimasto in campo!`;
        if (vivi.length === 0 || s.serpenti[0].punti === s.serpenti[1].punti) return 'Pareggio!';
        return `Griglia piena: vince ${nome(s.serpenti[0].punti > s.serpenti[1].punti ? 0 : 1)} per punti.`;
    },
    disegna(ctx, s, c) {
        ctx.strokeStyle = c.primarioChiaro; ctx.lineWidth = 1;
        for (let i = 0; i <= 20; i++) {
            ctx.beginPath(); ctx.moveTo(i * 24, 0); ctx.lineTo(i * 24, 480); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i * 24); ctx.lineTo(480, i * 24); ctx.stroke();
        }
        if (s.cibo) {
            ctx.fillStyle = c.errore; ctx.beginPath(); ctx.arc(s.cibo.x * 24 + 12, s.cibo.y * 24 + 12, 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = c.superficie; ctx.fillRect(s.cibo.x * 24 + 10, s.cibo.y * 24 + 4, 4, 4);
        }
        s.serpenti.forEach((p, i) => p.corpo.forEach((cella, k) => {
            ctx.fillStyle = !p.vivo ? c.testoTenue : i === 0 ? c.superficie : c.accento;
            ctx.fillRect(cella.x * 24 + 2, cella.y * 24 + 2, 20, 20);
            if (k === 0) {
                const d = DIREZIONI[p.direzione];
                ctx.fillStyle = c.primario;
                ctx.fillRect(cella.x * 24 + 9 + d.x * 5 - d.y * 4, cella.y * 24 + 9 + d.y * 5 + d.x * 4, 4, 4);
                ctx.fillRect(cella.x * 24 + 9 + d.x * 5 + d.y * 4, cella.y * 24 + 9 + d.y * 5 - d.x * 4, 4, 4);
            }
        }));
    }
});
