ArcadePagina.avvia({
    chiave: 'volo', larghezza: 600, altezza: 480,
    istruzioni: 'Premi Spazio, ↑ o il pulsante Battito per volare. Puoi anche toccare il campo. Ogni varco superato vale un punto.',
    istruzioniGesti: 'Tocca il campo per un battito d’ali. Ogni varco superato vale un punto.',
    tasti: ['ArrowUp', 'KeyW'],
    crea: due => Volo.crea(due),
    prossimo: Volo.prossimo, avanza: Volo.avanza,
    comando(s, codice) { if (['Space', 'ArrowUp', 'KeyW'].includes(codice)) Volo.salta(s); },
    // Gesto: ogni tocco è un battito, subito, senza aspettare che il dito si alzi
    gesti: { premi: s => Volo.salta(s) },
    passo: (s, dt) => Volo.passo(s, dt),
    punti: s => s.punti,
    dati(s, due, nome) { return { etichetta1: due ? nome(0) : 'Varchi', punti1: due ? (s.turno === 0 ? s.punti : s.risultati[0]) : s.punti,
        etichetta2: due ? nome(1) : 'Distanza', punti2: due ? (s.turno === 1 ? s.punti : '–') : `${Math.floor(s.distanza / 10)} m`,
        fase: due ? `Turno ${s.turno + 1} / 2` : 'Resta in volo' }; },
    esito(s, due, nome) {
        if (!due) return `Hai superato ${s.punti} varchi. Un altro volo?`;
        if (Volo.prossimo(s)) return `${nome(0)}: ${s.punti} punti. Ora gioca ${nome(1)}, con gli stessi ostacoli. Premi il pulsante quando sei pronto.`;
        if (s.risultati[0] === s.risultati[1]) return `Pareggio: ${s.punti} varchi a testa!`;
        return `Vince ${nome(s.risultati[0] > s.risultati[1] ? 0 : 1)}: ${s.risultati[0]} a ${s.risultati[1]}.`;
    },
    disegna(ctx, s, c) {
        ctx.strokeStyle = c.primarioChiaro; ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) { const x = ((i * 160 - s.distanza * 0.3) % 800 + 800) % 800 - 100; ctx.beginPath(); ctx.arc(x, 120 + i % 3 * 100, 55, 0, Math.PI * 2); ctx.stroke(); }
        s.ostacoli.forEach(o => {
            const alto = o.centro - Volo.APERTURA / 2, basso = o.centro + Volo.APERTURA / 2;
            ctx.fillStyle = c.primarioChiaro; ctx.fillRect(o.x, 0, 60, alto); ctx.fillRect(o.x, basso, 60, 480 - basso);
            ctx.fillStyle = c.accento; ctx.fillRect(o.x, alto - 6, 60, 6); ctx.fillRect(o.x, basso, 60, 6);
        });
        // Aliante di carta, costruito con tre triangoli.
        ctx.fillStyle = c.superficie; ctx.beginPath(); ctx.moveTo(153, s.y); ctx.lineTo(108, s.y - 14); ctx.lineTo(120, s.y + 13); ctx.closePath(); ctx.fill();
        ctx.fillStyle = c.accento; ctx.beginPath(); ctx.moveTo(153, s.y); ctx.lineTo(119, s.y); ctx.lineTo(120, s.y + 13); ctx.closePath(); ctx.fill();
        if (!s.attivo) { ctx.font = '600 20px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = c.accento; ctx.fillText('Un battito per partire', 300, 370); }
    }
});
