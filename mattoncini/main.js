ArcadePagina.avvia({
    chiave: 'mattoncini', larghezza: Mattoncini.LARGHEZZA, altezza: Mattoncini.ALTEZZA,
    istruzioni: 'Muovi con ← →, A e D o trascina sul campo. Spazio o tocco per lanciare la palla.',
    istruzioniGesti: 'Trascina il dito a destra e a sinistra per muovere la racchetta. Tocca il campo per lanciare la palla.',
    tasti: ['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'],
    // Sul telefono il campo resta largo 600 e diventa alto quanto lo spazio libero (Tappa 29.2)
    forma({ telefono, rapporto }) {
        if (!telefono) return null;
        const altezza = Math.max(Mattoncini.ALTEZZA, Math.min(1100, Math.round(Mattoncini.LARGHEZZA * rapporto)));
        return { larghezza: Mattoncini.LARGHEZZA, altezza };
    },
    crea: (due, forma) => Mattoncini.crea(forma?.altezza),
    comando(s, codice) { if (codice === 'Space') Mattoncini.lancia(s); },
    passo(s, dt, tasti) { Mattoncini.passo(s, dt, Number(tasti.has('ArrowRight') || tasti.has('KeyD')) - Number(tasti.has('ArrowLeft') || tasti.has('KeyA'))); },
    punti: s => s.punti,
    dati: s => ({ etichetta1: 'Punti', punti1: s.punti, etichetta2: 'Vite', punti2: s.vite, fase: `Livello ${s.livello}` }),
    esito: s => `Sei arrivato al livello ${s.livello} con ${s.punti} punti. Ritenta la scalata!`,
    // Gesto: la racchetta segue il dito; appoggiarlo lancia la palla
    gesti: { premi: s => Mattoncini.lancia(s), trascina: (s, p) => Mattoncini.muovi(s, p.x) },
    disegna(ctx, s, c) {
        const tinte = [c.accento, c.superficie, c.bordo, c.info, c.successo, c.avviso];
        // Simbolo del bonus: + (racchetta larga) oppure ° disegnato come un anello (doppia palla, Tappa 31)
        const simbolo = (tipo, x, y, colore) => {
            ctx.fillStyle = colore; ctx.strokeStyle = colore;
            if (tipo === '°') { ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.stroke(); }
            else { ctx.fillRect(x - 6, y - 1.5, 12, 3); ctx.fillRect(x - 1.5, y - 6, 3, 12); }
        };
        for (const m of s.mattoni) {
            if (!m.vivo) continue;
            // Fino a 8 righe: i 6 colori si ripetono; sulle righe scure il simbolo è chiaro
            const tinta = m.riga % tinte.length;
            ctx.fillStyle = tinte[tinta]; ctx.fillRect(m.x, m.y, m.w, m.h);
            if (m.bonus) simbolo(m.bonus, m.x + m.w / 2, m.y + m.h / 2, tinta >= 3 ? c.superficie : c.primario);
        }
        for (const b of s.bonus) {
            ctx.fillStyle = c.accento; ctx.fillRect(b.x - 10, b.y - 9, 20, 18);
            simbolo(b.tipo, b.x, b.y, c.primario);
        }
        ctx.fillStyle = s.largo > 0 ? c.accento : c.superficie;
        ctx.fillRect(s.racchetta - Mattoncini.larghezza(s) / 2, Mattoncini.linea(s), Mattoncini.larghezza(s), 12);
        ctx.fillStyle = c.superficie; ctx.beginPath(); ctx.arc(s.palla.x, s.palla.y, Mattoncini.RAGGIO, 0, Math.PI * 2); ctx.fill();
        // Seconda palla del bonus °, con il colore dei bonus
        if (s.palla2) { ctx.fillStyle = c.accento; ctx.beginPath(); ctx.arc(s.palla2.x, s.palla2.y, Mattoncini.RAGGIO, 0, Math.PI * 2); ctx.fill(); }
        if (s.inAttesa && !s.finita) { ctx.font = '600 20px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = c.accento; ctx.fillText('Spazio o tocco per lanciare', 300, s.altezza * 0.67); }
    }
});
