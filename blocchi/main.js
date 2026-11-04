// Palette chiara dedicata: stessa tinta per pezzi in movimento, posati e anteprima.
const COLORI_BLOCCHI = (() => {
    const stile = getComputedStyle(document.documentElement);
    return Array.from({ length: 7 }, (_, i) => stile.getPropertyValue(`--colore-blocco-${i + 1}`).trim());
})();

ArcadePagina.avvia({
    chiave: 'blocchi', larghezza: 720, altezza: 640,
    istruzioni: 'Frecce per muovere e ruotare, Spazio per posare. In due: WASD e F a sinistra, frecce e Spazio a destra.',
    tasti: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyF'],
    crea: due => Blocchi.crea(due),
    comando(s, codice, due) {
        const i = due && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(codice) ? 1 : 0;
        if (codice === 'ArrowUp' || codice === 'KeyW') Blocchi.gira(s.campi[i]);
        if (codice === 'Space' || codice === 'KeyF') Blocchi.lascia(s.campi[i]);
    },
    passo(s, dt, tasti, due) {
        const comandi = (sx, dx, giu) => ({ asse: Number(tasti.has(dx)) - Number(tasti.has(sx)), giu: tasti.has(giu) });
        Blocchi.passo(s, dt, due ? [comandi('KeyA', 'KeyD', 'KeyS'), comandi('ArrowLeft', 'ArrowRight', 'ArrowDown')]
            : [{ asse: Number(tasti.has('ArrowRight') || tasti.has('KeyD')) - Number(tasti.has('ArrowLeft') || tasti.has('KeyA')), giu: tasti.has('ArrowDown') || tasti.has('KeyS') }]);
    },
    punti: s => s.campi[0].punti,
    dati(s, due, nome) { return { etichetta1: due ? nome(0) : 'Punti', punti1: s.campi[0].punti,
        etichetta2: due ? nome(1) : 'Righe', punti2: due ? s.campi[1].punti : s.campi[0].righe,
        fase: due ? 'Sopravvivi' : `Livello ${Blocchi.livello(s.campi[0])}` }; },
    esito(s, due, nome) {
        if (!due) return `Campo pieno: ${s.campi[0].punti} punti e ${s.campi[0].righe} righe.`;
        if (s.campi.every(c => c.finita)) return 'Entrambi i campi pieni: pareggio!';
        return `Vince ${nome(s.campi[0].finita ? 1 : 0)}: ha mantenuto libero il campo.`;
    },
    disegna(ctx, s, c) {
        const colori = COLORI_BLOCCHI;
        s.campi.forEach((campo, i) => {
            const lato = 26, x0 = s.campi.length === 1 ? 230 : 45 + i * 370, y0 = 85;
            ctx.fillStyle = c.superficie; ctx.font = '600 20px system-ui'; ctx.textAlign = 'left';
            ctx.fillText(s.campi.length === 1 ? 'IL TUO CAMPO' : `CAMPO ${i + 1}`, x0, 35);
            ctx.font = '16px system-ui'; ctx.fillStyle = c.accento;
            ctx.fillText(`${campo.righe} righe · livello ${Blocchi.livello(campo)}`, x0, 62);
            const cella = (x, y, colore) => { ctx.fillStyle = colore; ctx.fillRect(x0 + x * lato + 1, y0 + y * lato + 1, lato - 2, lato - 2); };
            campo.griglia.forEach((r, y) => r.forEach((v, x) => cella(x, y, v ? colori[v - 1] : c.primarioChiaro)));
            const p = campo.pezzo;
            let ombra = p.y;
            while (Blocchi.valido(campo, p.forma, p.x, ombra + 1)) ombra++;
            p.forma.forEach((r, dy) => r.forEach((v, dx) => {
                if (!v) return;
                ctx.strokeStyle = c.bordo; ctx.strokeRect(x0 + (p.x + dx) * lato + 3, y0 + (ombra + dy) * lato + 3, lato - 6, lato - 6);
                cella(p.x + dx, p.y + dy, colori[p.tipo]);
            }));
            ctx.font = '14px system-ui'; ctx.fillStyle = c.superficie; ctx.fillText('Prossimo', x0, 630);
            Blocchi.FORME[campo.prossimo].forEach((r, y) => r.forEach((v, x) => {
                if (v) { ctx.fillStyle = colori[campo.prossimo]; ctx.fillRect(x0 + 90 + x * 10, 612 + y * 10, 8, 8); }
            }));
        });
    }
});
