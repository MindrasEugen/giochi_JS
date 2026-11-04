ArcadePagina.avvia({
    chiave: 'ping_pong', larghezza: PingPong.LARGHEZZA, altezza: PingPong.ALTEZZA,
    istruzioni: 'Muovi con ↑ ↓ o i pulsanti. In due: W e S a sinistra, frecce a destra. Si arriva a 7.',
    tasti: ['ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'],
    crea: due => PingPong.crea(due),
    passo(s, dt, tasti, due) {
        const asse = (su, giu) => Number(tasti.has(giu)) - Number(tasti.has(su));
        PingPong.passo(s, dt, due ? [asse('KeyW', 'KeyS'), asse('ArrowUp', 'ArrowDown')] : [asse('ArrowUp', 'ArrowDown') || asse('KeyW', 'KeyS'), 0]);
    },
    dati(s, due, nome) { return { etichetta1: nome(0), punti1: s.punti[0], etichetta2: nome(1), punti2: s.punti[1], fase: 'Primo a 7' }; },
    punti: s => s.punti[0],
    esito: (s, due, nome) => `Vince ${nome(s.punti[0] >= 7 ? 0 : 1)}: ${s.punti[0]} a ${s.punti[1]}.`,
    puntatore(s, p) { if (!s.due) s.racchette[0] = Math.max(0, Math.min(PingPong.ALTEZZA - PingPong.RACCHETTA, p.y - PingPong.RACCHETTA / 2)); },
    disegna(ctx, s, c) {
        ctx.strokeStyle = c.primarioChiaro; ctx.lineWidth = 3; ctx.setLineDash([10, 12]);
        ctx.beginPath(); ctx.moveTo(360, 0); ctx.lineTo(360, 440); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(360, 220, 65, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = c.superficie; ctx.fillRect(28, s.racchette[0], 14, PingPong.RACCHETTA);
        ctx.fillStyle = c.accento; ctx.fillRect(678, s.racchette[1], 14, PingPong.RACCHETTA);
        ctx.fillStyle = c.superficie; ctx.beginPath(); ctx.arc(s.palla.x, s.palla.y, PingPong.RAGGIO, 0, Math.PI * 2); ctx.fill();
        if (s.attesa > 0) { ctx.font = '600 22px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = c.accento; ctx.fillText('Servizio…', 360, 320); }
    }
});
