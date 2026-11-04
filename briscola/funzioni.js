const Briscola = (() => {
    const M = typeof module !== 'undefined' ? require('../js/mazzo') : Mazzo;
    const VALORI = { 1: 11, 3: 10, 8: 2, 9: 3, 10: 4 };
    const ORDINE = [2, 4, 5, 6, 7, 8, 9, 10, 3, 1];
    const puntiCarta = c => VALORI[c.numero] || 0;
    const squadra = (s, giocatore) => s.numero === 4 ? giocatore % 2 : giocatore;
    function crea(numero = 2, casuale = Math.random) {
        if (![2, 4].includes(numero)) throw new Error('Briscola richiede due o quattro giocatori.');
        const mazzo = M.mescola(M.italiano(), casuale), mani = M.distribuisci(mazzo, numero, 3);
        const briscola = M.pesca(mazzo)[0]; mazzo.push(briscola);
        return { numero, mazzo, mani, briscola, tavolo: [], catturate: Array.from({ length: numero }, () => []),
            punti: [0, 0], turno: 0, presaCompleta: false, finita: false, ultimo: null };
    }
    function batte(a, b, seme) { return a.seme === b.seme ? ORDINE.indexOf(a.numero) > ORDINE.indexOf(b.numero) : a.seme === seme; }
    function vincitorePresa(tavolo, seme) {
        if (!tavolo.length) return null;
        return tavolo.reduce((v, p) => batte(p.carta, v.carta, seme) ? p : v).giocatore;
    }
    function mosseLegali(s) {
        return s.finita || s.presaCompleta ? [] : s.mani[s.turno].map((_, carta) => ({ carta }));
    }
    function gioca(s, mossa) {
        if (!mosseLegali(s).some(m => m.carta === mossa?.carta)) return false;
        const carta = s.mani[s.turno].splice(mossa.carta, 1)[0];
        s.tavolo.push({ giocatore: s.turno, carta });
        if (s.tavolo.length === s.numero) s.presaCompleta = true;
        else s.turno = (s.turno + 1) % s.numero;
        return true;
    }
    function raccogli(s) {
        if (!s.presaCompleta || s.finita) return false;
        const vince = vincitorePresa(s.tavolo, s.briscola.seme);
        const carte = s.tavolo.map(p => p.carta), punti = carte.reduce((n, c) => n + puntiCarta(c), 0);
        s.catturate[vince].push(...carte); s.punti[squadra(s, vince)] += punti;
        s.ultimo = { giocatore: vince, punti }; s.tavolo = []; s.presaCompleta = false;
        for (let i = 0; i < s.numero; i++) s.mani[(vince + i) % s.numero].push(...M.pesca(s.mazzo));
        s.turno = vince; s.finita = s.mani.every(m => m.length === 0);
        return true;
    }
    function mossaPC(s) {
        const mosse = mosseLegali(s);
        if (!mosse.length) return null;
        const io = s.turno;
        const costo = m => puntiCarta(s.mani[io][m.carta]) * 5 + (s.mani[io][m.carta].seme === s.briscola.seme ? 25 : 0) + ORDINE.indexOf(s.mani[io][m.carta].numero);
        const ultime = s.tavolo.length === s.numero - 1;
        // Guarda solo la propria mano e le carte pubbliche sul tavolo.
        const vincenti = mosse.filter(m => squadra(s, vincitorePresa([...s.tavolo, { giocatore: io, carta: s.mani[io][m.carta] }], s.briscola.seme)) === squadra(s, io));
        if (ultime && vincenti.length) {
            const compagnoVince = s.numero === 4 && squadra(s, vincitorePresa(s.tavolo, s.briscola.seme)) === squadra(s, io);
            return [...vincenti].sort((a, b) => compagnoVince
                ? puntiCarta(s.mani[io][b.carta]) - puntiCarta(s.mani[io][a.carta]) || costo(a) - costo(b)
                : costo(a) - costo(b))[0];
        }
        return [...mosse].sort((a, b) => costo(a) - costo(b))[0];
    }
    function risultato(s) { return { punti: [...s.punti], vincitore: s.punti[0] === s.punti[1] ? null : s.punti[0] > s.punti[1] ? 0 : 1 }; }
    return { crea, puntiCarta, squadra, batte, vincitorePresa, mosseLegali, gioca, raccogli, mossaPC, risultato };
})();
if (typeof module !== 'undefined') module.exports = Briscola;
