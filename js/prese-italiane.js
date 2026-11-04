// Regole condivise per Scopa, Asso piglia tutto e Rubamazzetto.
const PreseItaliane = (() => {
    const M = typeof module !== 'undefined' ? require('./mazzo') : Mazzo;
    const VALORI_PRIMIERA = { 1: 16, 2: 12, 3: 13, 4: 14, 5: 15, 6: 18, 7: 21, 8: 10, 9: 10, 10: 10 };
    function primiera(carte) {
        const valori = M.SEMI_ITALIANI.map(seme => Math.max(0, ...carte.filter(c => c.seme === seme).map(c => VALORI_PRIMIERA[c.numero])));
        return valori.every(Boolean) ? valori.reduce((a, b) => a + b, 0) : 0;
    }
    function presePossibili(carta, tavolo, variante = 'scopa') {
        const uguali = tavolo.flatMap((c, i) => c.numero === carta.numero ? [[i]] : []);
        if (uguali.length) return uguali;
        if (variante === 'rubamazzetto') return [];
        if (variante === 'asso' && carta.numero === 1) return tavolo.length ? [tavolo.map((_, i) => i)] : [];
        const prese = [];
        function cerca(da, somma, indici) {
            if (somma === carta.numero) { prese.push(indici); return; }
            for (let i = da; i < tavolo.length; i++) if (somma + tavolo[i].numero <= carta.numero) cerca(i + 1, somma + tavolo[i].numero, [...indici, i]);
        }
        cerca(0, 0, []); return prese;
    }
    function crea(variante = 'scopa', casuale = Math.random) {
        if (!['scopa', 'asso', 'rubamazzetto'].includes(variante)) throw new Error('Variante non supportata.');
        let mazzo = M.mescola(M.italiano(), casuale);
        if (variante !== 'rubamazzetto') {
            let tentativi = 0;
            while (mazzo.slice(6, 10).filter(c => c.numero === 10).length >= 3) {
                // Anche una sorgente casuale costante non può bloccare la distribuzione.
                if (++tentativi < 20) mazzo = M.mescola(mazzo, casuale); else mazzo.push(mazzo.shift());
            }
        }
        const mani = M.distribuisci(mazzo, 2, 3), tavolo = M.pesca(mazzo, 4);
        return { variante, mazzo, mani, tavolo, catturate: [[], []], scope: [0, 0], turno: 0, ultimaPresa: null, finita: false, ultimo: null };
    }
    function mosseLegali(s) {
        if (s.finita) return [];
        return s.mani[s.turno].flatMap((c, carta) => {
            const mosse = presePossibili(c, s.tavolo, s.variante).map(presa => ({ carta, presa }));
            const altro = 1 - s.turno;
            if (s.variante === 'rubamazzetto' && s.catturate[altro].at(-1)?.numero === c.numero) mosse.push({ carta, presa: [], ruba: altro });
            return mosse.length ? mosse : [{ carta, presa: [] }];
        });
    }
    function gioca(s, mossa) {
        const scelta = mosseLegali(s).find(m => m.carta === mossa?.carta && m.ruba === mossa.ruba && m.presa.join(',') === (mossa.presa || []).join(','));
        if (!scelta) return false;
        const io = s.turno, carta = s.mani[io].splice(scelta.carta, 1)[0];
        const ultimaGiocata = s.mazzo.length === 0 && s.mani.every(m => m.length === 0);
        const prese = scelta.presa.map(i => s.tavolo[i]);
        const ruba = scelta.ruba !== undefined;
        let scopa = false;
        if (ruba) {
            s.catturate[io].push(...s.catturate[scelta.ruba], carta); s.catturate[scelta.ruba] = []; s.ultimaPresa = io;
        } else if (prese.length) {
            s.tavolo = s.tavolo.filter((_, i) => !scelta.presa.includes(i));
            s.catturate[io].push(...prese, carta); s.ultimaPresa = io;
            scopa = s.variante !== 'rubamazzetto' && s.tavolo.length === 0 && !ultimaGiocata;
            if (scopa) s.scope[io]++;
        } else s.tavolo.push(carta);
        s.ultimo = { giocatore: io, carta, prese, ruba, scopa };
        if (s.mani.every(m => m.length === 0)) {
            if (s.mazzo.length) s.mani = M.distribuisci(s.mazzo, 2, 3);
            else {
                const ultimo = s.ultimaPresa ?? io;
                // I resti vanno sotto il mazzetto: non cambiano la carta scoperta.
                s.catturate[ultimo].unshift(...s.tavolo); s.tavolo = []; s.finita = true;
            }
        }
        s.turno = 1 - io; return true;
    }
    function risultato(s) {
        const dati = s.catturate.map(carte => ({ carte: carte.length, denari: carte.filter(c => c.seme === 'denari').length,
            settebello: carte.some(c => c.seme === 'denari' && c.numero === 7) ? 1 : 0, primiera: primiera(carte) }));
        const punti = s.variante === 'rubamazzetto' ? dati.map(d => d.carte) : [...s.scope];
        const dettaglio = [0, 1].map(i => ({ scope: s.scope[i], carte: 0, denari: 0, settebello: dati[i].settebello, primiera: 0 }));
        if (s.variante !== 'rubamazzetto') {
            for (const criterio of ['carte', 'denari', 'primiera']) {
                if (dati[0][criterio] === dati[1][criterio]) continue;
                const vincitore = dati[0][criterio] > dati[1][criterio] ? 0 : 1;
                dettaglio[vincitore][criterio] = 1; punti[vincitore]++;
            }
            punti[0] += dati[0].settebello; punti[1] += dati[1].settebello;
        }
        return { dati, dettaglio, punti, vincitore: punti[0] === punti[1] ? null : punti[0] > punti[1] ? 0 : 1 };
    }
    function mossaPC(s) {
        const mosse = mosseLegali(s), io = s.turno;
        const valore = carta => (carta.seme === 'denari' ? 3 : 0) + (carta.seme === 'denari' && carta.numero === 7 ? 25 : 0) + VALORI_PRIMIERA[carta.numero] / 12;
        const peso = m => {
            if (m.ruba !== undefined) return 100 + s.catturate[m.ruba].length * 10;
            const carte = m.presa.map(i => s.tavolo[i]);
            if (carte.length) return carte.length * 5 + carte.reduce((n, c) => n + valore(c), 0) + valore(s.mani[io][m.carta]) + (carte.length === s.tavolo.length ? 20 : 0);
            const resta = [...s.tavolo, s.mani[io][m.carta]], somma = resta.reduce((n, c) => n + c.numero, 0);
            return -valore(s.mani[io][m.carta]) - (somma <= 10 && s.variante !== 'rubamazzetto' ? 12 : 0);
        };
        return [...mosse].sort((a, b) => peso(b) - peso(a))[0] || null;
    }
    return { VALORI_PRIMIERA, primiera, presePossibili, crea, mosseLegali, gioca, risultato, mossaPC };
})();
if (typeof module !== 'undefined') module.exports = PreseItaliane;
