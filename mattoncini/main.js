ArcadePagina.avvia({
    chiave: 'mattoncini', larghezza: Mattoncini.LARGHEZZA, altezza: Mattoncini.ALTEZZA,
    istruzioni: 'Muovi con ← →, A e D o trascina sul campo. Spazio o tocco per lanciare la palla.',
    tasti: ['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'],
    crea: () => Mattoncini.crea(),
    comando(s, codice) { if (codice === 'Space') Mattoncini.lancia(s); },
    passo(s, dt, tasti) { Mattoncini.passo(s, dt, Number(tasti.has('ArrowRight') || tasti.has('KeyD')) - Number(tasti.has('ArrowLeft') || tasti.has('KeyA'))); },
    punti: s => s.punti,
    dati: s => ({ etichetta1: 'Punti', punti1: s.punti, etichetta2: 'Vite', punti2: s.vite, fase: `Livello ${s.livello} / 3` }),
    esito: s => s.vinta ? `Tutti i livelli completati! ${s.punti} punti.` : `Hai fatto ${s.punti} punti. Ritenta la scalata!`,
    puntatore: (s, p) => Mattoncini.muovi(s, p.x),
    disegna(ctx, s, c) {
        const tinte = [c.accento, c.superficie, c.bordo, c.info, c.successo, c.avviso];
        for (const m of s.mattoni) {
            if (!m.vivo) continue;
            ctx.fillStyle = tinte[Math.floor((m.y - 56) / 25)]; ctx.fillRect(m.x, m.y, m.w, m.h);
            if (m.bonus) { ctx.fillStyle = c.primario; ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center'; ctx.fillText('+', m.x + m.w / 2, m.y + 13); }
        }
        for (const b of s.bonus) {
            ctx.fillStyle = c.accento; ctx.fillRect(b.x - 10, b.y - 9, 20, 18);
            ctx.fillStyle = c.primario; ctx.font = 'bold 16px system-ui'; ctx.textAlign = 'center'; ctx.fillText('+', b.x, b.y + 6);
        }
        ctx.fillStyle = s.largo > 0 ? c.accento : c.superficie;
        ctx.fillRect(s.racchetta - Mattoncini.larghezza(s) / 2, 484, Mattoncini.larghezza(s), 12);
        ctx.fillStyle = c.superficie; ctx.beginPath(); ctx.arc(s.palla.x, s.palla.y, Mattoncini.RAGGIO, 0, Math.PI * 2); ctx.fill();
        if (s.inAttesa && !s.finita) { ctx.font = '600 20px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = c.accento; ctx.fillText('Spazio o tocco per lanciare', 300, 350); }
    }
});
