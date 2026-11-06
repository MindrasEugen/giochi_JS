ArcadePagina.avvia({
    chiave: 'invasione', larghezza: 600, altezza: 560,
    istruzioni: 'Frecce o A/D per muovere. Tieni Spazio o Fuoco per sparare. Gli scudi assorbono anche i tuoi colpi.',
    istruzioniGesti: 'Trascina il dito per muovere la navetta: finché il dito resta sul campo, spara da sola. Gli scudi assorbono anche i tuoi colpi.',
    tasti: ['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'],
    // Sul telefono il campo resta largo 600 e diventa alto quanto lo spazio libero (Tappa 29.2)
    forma({ telefono, rapporto }) {
        if (!telefono) return null;
        return { larghezza: Invasione.LARGHEZZA, altezza: Math.max(Invasione.ALTEZZA, Math.min(1100, Math.round(Invasione.LARGHEZZA * rapporto))) };
    },
    crea: (due, forma) => Invasione.crea(forma?.altezza),
    comando(s, codice) { if (codice === 'Space') Invasione.spara(s); },
    passo(s, dt, tasti) { Invasione.passo(s, dt, Number(tasti.has('ArrowRight') || tasti.has('KeyD')) - Number(tasti.has('ArrowLeft') || tasti.has('KeyA')), tasti.has('Space')); },
    // Gesto: la navetta segue il dito e spara finché il dito resta sul campo
    gesti: { trascina(s, p) { s.x = Math.max(18, Math.min(582, p.x)); }, tieni: 'Space' },
    punti: s => s.punti,
    dati: s => ({ etichetta1: 'Punti', punti1: s.punti, etichetta2: 'Vite', punti2: s.vite, fase: `Ondata ${s.livello}` }),
    esito: s => `Difesa conclusa all'ondata ${s.livello}: ${s.punti} punti.`,
    disegna(ctx, s, c) {
        ctx.fillStyle = c.primarioChiaro;
        for (let i = 0; i < 36; i++) ctx.fillRect((i * 137) % 600, (i * 79) % s.altezza, 2, 2);
        s.nemici.forEach(n => {
            if (!n.vivo) return;
            ctx.fillStyle = [c.accento, c.bordo, c.superficie][n.tipo];
            // Droni esagonali e antenne: sagome originali, senza sprite esterni.
            ctx.beginPath(); ctx.moveTo(n.x - 18, n.y); ctx.lineTo(n.x - 9, n.y - 12); ctx.lineTo(n.x + 9, n.y - 12);
            ctx.lineTo(n.x + 18, n.y); ctx.lineTo(n.x + 9, n.y + 12); ctx.lineTo(n.x - 9, n.y + 12); ctx.closePath(); ctx.fill();
            ctx.fillStyle = c.primario; ctx.fillRect(n.x - 7, n.y - 3, 14, 5);
        });
        s.scudi.forEach(b => {
            if (!b.vita) return;
            ctx.fillStyle = b.vita > 2 ? c.successo : c.avviso; ctx.fillRect(b.x - 28, b.y - 10, 56, 20);
            ctx.fillStyle = c.superficie; ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center'; ctx.fillText(b.vita, b.x, b.y + 5);
        });
        for (const p of s.proiettili) { ctx.fillStyle = p.amico ? c.accento : c.errore; ctx.fillRect(p.x - 2, p.y - 7, 4, 14); }
        ctx.globalAlpha = s.invulnerabile > 0 ? 0.5 : 1;
        ctx.fillStyle = c.superficie; const y = Invasione.fondo(s); ctx.beginPath(); ctx.moveTo(s.x, y - 57); ctx.lineTo(s.x + 20, y - 27); ctx.lineTo(s.x, y - 35); ctx.lineTo(s.x - 20, y - 27); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    }
});
