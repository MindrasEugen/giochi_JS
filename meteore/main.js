ArcadePagina.avvia({
    chiave: 'meteore', larghezza: Meteore.LARGHEZZA, altezza: Meteore.ALTEZZA,
    istruzioni: 'Ruota con ← → o A e D, accelera con ↑ o W, spara con Spazio (tenuto premuto spara di continuo).',
    istruzioniGesti: 'Tieni il dito sul campo: la navicella si gira verso il dito e spara. Se il dito è lontano, accelera anche verso di lui.',
    tasti: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'KeyA', 'KeyD', 'KeyW'],
    // Sul telefono il campo resta largo 600 e diventa alto quanto lo spazio libero (Tappa 29.2)
    forma({ telefono, rapporto }) {
        if (!telefono) return null;
        return { larghezza: Meteore.LARGHEZZA, altezza: Math.max(Meteore.ALTEZZA, Math.min(1100, Math.round(Meteore.LARGHEZZA * rapporto))) };
    },
    crea: (due, forma) => Meteore.crea(forma?.altezza),
    comando(s, codice) { if (codice === 'Space') Meteore.spara(s); },
    passo(s, dt, tasti) {
        // Il dito vale solo finché resta sul campo: alzato, la navicella torna ai comandi normali
        if (!tasti.has('Space')) Meteore.punta(s, null);
        Meteore.passo(s, dt, {
            giro: Number(tasti.has('ArrowRight') || tasti.has('KeyD')) - Number(tasti.has('ArrowLeft') || tasti.has('KeyA')),
            spinta: tasti.has('ArrowUp') || tasti.has('KeyW'),
            fuoco: tasti.has('Space')
        });
    },
    // Gesto: la navicella punta il dito e spara finché il dito resta sul campo
    gesti: { trascina: (s, p) => Meteore.punta(s, p), tieni: 'Space' },
    punti: s => s.punti,
    dati: s => ({ etichetta1: 'Punti', punti1: s.punti, etichetta2: 'Vite', punti2: s.vite, fase: `Ondata ${s.ondata}` }),
    esito: s => `Viaggio concluso all'ondata ${s.ondata} con ${s.punti} punti.`,
    disegna(ctx, s, c) {
        // Stelle fisse di sfondo
        ctx.fillStyle = c.primarioChiaro;
        for (let i = 0; i < 48; i++) ctx.fillRect((i * 137) % 600, (i * 211) % s.altezza, 2, 2);
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        // Rocce a linee, con il contorno irregolare fisso di ognuna
        for (const r of s.rocce) {
            ctx.strokeStyle = [c.superficie, c.bordo, c.avviso][r.misura]; ctx.lineWidth = 2.5;
            ctx.beginPath();
            r.forma.forEach((f, i) => {
                const a = r.giro + i * Math.PI * 2 / r.forma.length;
                const x = r.x + Math.cos(a) * r.raggio * f, y = r.y + Math.sin(a) * r.raggio * f;
                if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
            });
            ctx.closePath(); ctx.stroke();
        }
        ctx.fillStyle = c.accento;
        for (const p of s.colpi) { ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2); ctx.fill(); }
        if (s.finita) return;
        // Navicella: a freccia con la coda incavata; lampeggia mentre è intoccabile
        const n = s.nave, R = Meteore.RAGGIO_NAVE;
        if (s.intoccabile > 0 && Math.floor(s.intoccabile * 8) % 2) return;
        ctx.save(); ctx.translate(n.x, n.y); ctx.rotate(n.angolo);
        ctx.strokeStyle = c.accento; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(R * 1.5, 0); ctx.lineTo(-R, -R * 0.9); ctx.lineTo(-R * 0.5, 0); ctx.lineTo(-R, R * 0.9); ctx.closePath(); ctx.stroke();
        if (s.spinta) {
            ctx.strokeStyle = c.avviso;
            ctx.beginPath(); ctx.moveTo(-R * 0.7, -R * 0.4); ctx.lineTo(-R * 1.6, 0); ctx.lineTo(-R * 0.7, R * 0.4); ctx.stroke();
        }
        ctx.restore();
        if (!s.rocce.length) {
            ctx.font = '600 20px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = c.accento;
            ctx.fillText(`Ondata ${s.ondata + 1} in arrivo`, 300, s.altezza * 0.3);
        }
    }
});
