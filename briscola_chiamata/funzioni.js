// Briscola chiamata a 5: asta, seme di briscola, socio segreto. Si prova con: node briscola_chiamata/test-briscola-chiamata.js
// Fasi: 'asta' -> 'seme' (il chiamante sceglie la briscola) -> 'gioco'. Il giocatore 4 fa il mazziere, il giocatore 0 parla e gioca per primo.
const BriscolaChiamata = (() => {
    const M = typeof module !== 'undefined' ? require('../js/mazzo') : Mazzo;
    const B = typeof module !== 'undefined' ? require('../briscola/funzioni') : Briscola;
    const NUMERO = 5;
    const ASTA = [1, 3, 10, 9, 8, 7, 6, 5, 4, 2]; // si chiama una carta sempre più bassa: chiamare più in basso è un'offerta più forte
    const NOMI = { 1: "l'asso", 3: 'il tre', 10: 'il re', 9: 'il cavallo', 8: 'il fante', 7: 'il sette', 6: 'il sei', 5: 'il cinque', 4: 'il quattro', 2: 'il due' };
    const puntiCarta = B.puntiCarta;
    function crea(casuale = Math.random) {
        const mazzo = M.mescola(M.italiano(), casuale), mani = M.distribuisci(mazzo, NUMERO, 8);
        return { numero: NUMERO, fase: 'asta', mazzo, mani, tavolo: [], catturate: Array.from({ length: NUMERO }, () => []),
            passati: [], migliore: null, chiamante: null, chiamata: null, briscola: null, socio: null, socioRivelato: false,
            soglia: 61, turno: 0, presaCompleta: false, finita: false, ultimo: null, ridistribuzioni: 0, casuale };
    }
    // Forza di un'offerta: posizione nell'elenco ASTA; oltre il due contano i punti promessi
    const forza = o => o ? ASTA.indexOf(o.numero) + (o.numero === 2 ? o.punti - 61 : 0) : -1;
    const tieneCarta = (mano, chiamata) => mano.some(c => c.numero === chiamata.numero && c.seme === chiamata.seme);
    function mosseLegali(s) {
        if (s.finita || s.presaCompleta) return [];
        if (s.fase === 'asta') {
            const mosse = [{ passa: true }], attuale = s.migliore;
            if (!attuale || attuale.numero !== 2) ASTA.forEach((n, i) => { if (i > forza(attuale)) mosse.push({ numero: n, punti: 61 }); });
            else for (const extra of [1, 5]) if (attuale.punti + extra <= 120) mosse.push({ numero: 2, punti: attuale.punti + extra });
            return mosse;
        }
        if (s.fase === 'seme') return M.SEMI_ITALIANI.map(seme => ({ seme }));
        return s.mani[s.turno].map((_, carta) => ({ carta }));
    }
    const prossimoInAsta = (s, da) => {
        for (let k = 1; k <= NUMERO; k++) { const g = (da + k) % NUMERO; if (!s.passati.includes(g)) return g; }
        return null;
    };
    function etichettaMossa(s, m) {
        if (m.passa) return 'Passo';
        if (m.seme) return `Briscola a ${m.seme}`;
        if (m.numero !== undefined) return m.numero === 2 && s.migliore?.numero === 2 ? `Chiamo il due a ${m.punti}` : `Chiamo ${NOMI[m.numero]}`;
        return '';
    }
    function gioca(s, mossa) {
        const legali = mosseLegali(s);
        const scelta = legali.find(m => m.carta === mossa?.carta && m.passa === mossa?.passa && m.seme === mossa?.seme
            && m.numero === mossa?.numero && (m.punti === undefined || m.punti === mossa?.punti));
        if (!scelta) return false;
        const io = s.turno;
        if (s.fase === 'asta') {
            s.ultimo = { giocatore: io, asta: etichettaMossa(s, scelta) };
            if (scelta.passa) s.passati.push(io); else s.migliore = { giocatore: io, numero: scelta.numero, punti: scelta.punti };
            if (s.passati.length === NUMERO) {
                // Tutti passano: si rimescola e si ridistribuisce
                const nuovo = crea(s.casuale);
                Object.assign(s, nuovo, { ridistribuzioni: s.ridistribuzioni + 1, ultimo: { giocatore: io, asta: 'Passo', ridistribuita: true } });
                return true;
            }
            if (s.migliore && s.passati.length === NUMERO - 1) {
                s.chiamante = s.migliore.giocatore; s.soglia = s.migliore.punti; s.fase = 'seme'; s.turno = s.chiamante;
                return true;
            }
            s.turno = prossimoInAsta(s, io);
            return true;
        }
        if (s.fase === 'seme') {
            s.briscola = { seme: scelta.seme };
            s.chiamata = { numero: s.migliore.numero, seme: scelta.seme };
            s.socio = s.mani.findIndex(mano => tieneCarta(mano, s.chiamata));
            s.ultimo = { giocatore: io, chiamata: { ...s.chiamata } };
            s.fase = 'gioco'; s.turno = 0;
            return true;
        }
        const carta = s.mani[io].splice(scelta.carta, 1)[0];
        s.tavolo.push({ giocatore: io, carta });
        if (carta.numero === s.chiamata.numero && carta.seme === s.chiamata.seme) s.socioRivelato = true;
        if (s.tavolo.length === NUMERO) s.presaCompleta = true;
        else s.turno = (io + 1) % NUMERO;
        return true;
    }
    const vincitorePresa = (tavolo, seme) => B.vincitorePresa(tavolo, seme);
    function raccogli(s) {
        if (!s.presaCompleta || s.finita) return false;
        const vince = vincitorePresa(s.tavolo, s.briscola.seme);
        const carte = s.tavolo.map(p => p.carta), punti = carte.reduce((n, c) => n + puntiCarta(c), 0);
        s.catturate[vince].push(...carte);
        s.ultimo = { giocatore: vince, punti }; s.tavolo = []; s.presaCompleta = false;
        s.turno = vince; s.finita = s.mani.every(m => m.length === 0);
        return true;
    }
    const squadraChiamante = s => [...new Set([s.chiamante, s.socio])];
    const puntiDi = (s, giocatori) => giocatori.reduce((n, g) => n + s.catturate[g].reduce((k, c) => k + puntiCarta(c), 0), 0);
    // Squadra 0: chiamante e socio; squadra 1: gli altri. Il chiamante vince se arriva alla soglia (61 o i punti promessi).
    function risultato(s) {
        if (s.fase !== 'gioco') return { punti: [0, 0], vincitore: null };
        const loro = squadraChiamante(s), punti = [puntiDi(s, loro), 120 - puntiDi(s, loro)];
        if (!s.finita) punti[1] = puntiDi(s, [0, 1, 2, 3, 4].filter(g => !loro.includes(g)));
        return { punti, soglia: s.soglia, vincitore: s.finita ? (punti[0] >= s.soglia ? 0 : 1) : null };
    }
    // Chi sa di giocare con chi: il socio e (dopo la rivelazione) tutti; prima della rivelazione il chiamante conosce solo sé stesso.
    function alleati(s, io) {
        const chiamata = s.chiamata, socioNoto = s.socioRivelato || tieneCarta(s.mani[io], chiamata);
        const socio = socioNoto ? (tieneCarta(s.mani[io], chiamata) ? io : s.socio) : null;
        if (io === s.chiamante) return new Set([io, ...(socio !== null ? [socio] : [])]);
        if (socio === io) return new Set([io, s.chiamante]);
        if (s.socioRivelato) return new Set([0, 1, 2, 3, 4].filter(g => g !== s.chiamante && g !== s.socio));
        return new Set([io]);
    }
    // Forza della mano per un seme: punti delle carte di quel seme più quattro per ogni carta del seme
    function valutaSemi(mano, semi = M.SEMI_ITALIANI) {
        return semi.map(seme => {
            const carte = mano.filter(c => c.seme === seme);
            return { seme, forza: carte.reduce((n, c) => n + puntiCarta(c), 0) + carte.length * 4 + mano.reduce((n, c) => n + puntiCarta(c), 0) / 4 };
        }).sort((a, b) => b.forza - a.forza)[0];
    }
    function mossaPC(s) {
        const mosse = mosseLegali(s);
        if (!mosse.length) return null;
        const io = s.turno, mano = s.mani[io];
        if (s.fase === 'asta') {
            const { seme, forza: f } = valutaSemi(mano);
            if (f < 20) return mosse[0];
            // Si spinge fino alla carta più alta che manca nel seme forte (il socio ideale); con mani forti anche oltre.
            const manca = ASTA.find(n => !mano.some(c => c.seme === seme && c.numero === n)) ?? 2;
            const limite = Math.min(ASTA.length - 1, ASTA.indexOf(manca) + Math.floor((f - 20) / 4));
            const puntiMax = 61 + Math.max(0, Math.floor((f - 34) * 2));
            // Evita di chiamare una carta del seme forte che ha già in mano (giocherebbe da solo)
            const ce = m => mano.some(c => c.seme === seme && c.numero === m.numero);
            const offerta = mosse.slice(1).find(m => ASTA.indexOf(m.numero) <= limite && !ce(m) && (m.numero !== 2 || m.punti <= puntiMax));
            return offerta || mosse[0];
        }
        if (s.fase === 'seme') {
            // Il seme più forte in cui la carta chiamata non è nella propria mano
            const chiamabili = M.SEMI_ITALIANI.filter(seme => !mano.some(c => c.seme === seme && c.numero === s.migliore.numero));
            const migliore = valutaSemi(mano, chiamabili.length ? chiamabili : M.SEMI_ITALIANI).seme;
            return mosse.find(m => m.seme === migliore);
        }
        const amici = alleati(s, io), briscola = s.briscola.seme;
        // Costo di una carta: punti, briscola e forza (si gioca volentieri la carta che costa meno)
        const costo = m => puntiCarta(mano[m.carta]) * 5 + (mano[m.carta].seme === briscola ? 25 : 0) + [2, 4, 5, 6, 7, 8, 9, 10, 3, 1].indexOf(mano[m.carta].numero);
        if (!s.tavolo.length) return [...mosse].sort((a, b) => costo(a) - costo(b))[0];
        const vinceOra = vincitorePresa(s.tavolo, briscola);
        const amicoVince = amici.has(vinceOra) && vinceOra !== io;
        const ultimo = s.tavolo.length === NUMERO - 1;
        const punti = s.tavolo.reduce((n, p) => n + puntiCarta(p.carta), 0);
        const vincenti = mosse.filter(m => vincitorePresa([...s.tavolo, { giocatore: io, carta: mano[m.carta] }], briscola) === io);
        if (amicoVince && ultimo) return [...mosse].sort((a, b) => puntiCarta(mano[b.carta]) - puntiCarta(mano[a.carta]) || costo(a) - costo(b))[0];
        // Un avversario noto (il chiamante, o la sua squadra dopo la rivelazione) sta prendendo: meglio superarlo
        const nemicoVince = !amici.has(vinceOra) && (vinceOra === s.chiamante || s.socioRivelato);
        if (!amicoVince && vincenti.length && (ultimo || punti >= 4 || nemicoVince)) return [...vincenti].sort((a, b) => costo(a) - costo(b))[0];
        return [...mosse].sort((a, b) => costo(a) - costo(b))[0];
    }
    return { NUMERO, ASTA, NOMI, puntiCarta, crea, mosseLegali, etichettaMossa, gioca, vincitorePresa, raccogli, risultato, alleati, mossaPC, squadraChiamante };
})();
if (typeof module !== 'undefined') module.exports = BriscolaChiamata;
