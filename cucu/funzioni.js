// Cucù: una carta a testa, si tiene o si scambia con il giocatore successivo; il re ("cucù") blocca lo scambio.
// Chi ha la carta più bassa perde una vita; vince l'ultimo rimasto. Si prova con: node cucu/test-cucu.js
// Fasi: 'turni' (ognuno sceglie, il mazziere per ultimo) -> 'fine' (carte scoperte, si passa alla mano successiva).
const Cucu = (() => {
    const M = typeof module !== 'undefined' ? require('../js/mazzo') : Mazzo;
    const RE = 10;
    function crea(giocatori = 4, casuale = Math.random, vite = 3) {
        if (giocatori < 2 || giocatori > 6) throw new Error('Cucù: da 2 a 6 giocatori.');
        const s = { numero: giocatori, vite: Array(giocatori).fill(vite), mazziere: giocatori - 1, fase: 'turni', carte: [], mazzo: [],
            turno: 0, mano: 0, persi: [], ultimo: null, finita: false, vincitore: null, casuale };
        nuovaMano(s);
        return s;
    }
    const vivo = (s, g) => s.vite[g] > 0;
    const vivi = s => s.vite.map((v, g) => v > 0 ? g : -1).filter(g => g >= 0);
    function successivo(s, g) {
        for (let k = 1; k <= s.numero; k++) { const h = (g + k) % s.numero; if (vivo(s, h)) return h; }
        return g;
    }
    function nuovaMano(s) {
        s.mazzo = M.mescola(M.italiano(), s.casuale);
        s.carte = s.vite.map(v => v > 0 ? M.pesca(s.mazzo)[0] : null);
        // Comincia il giocatore dopo il mazziere; il mazziere sceglie per ultimo
        s.fase = 'turni'; s.turno = successivo(s, s.mazziere); s.persi = []; s.mano++; s.scartate = [];
    }
    function mosseLegali(s) {
        if (s.finita) return [];
        if (s.fase === 'fine') return [{ prossima: true }];
        return s.turno === s.mazziere ? [{ tieni: true }, { mazzo: true }] : [{ tieni: true }, { cambia: true }];
    }
    function etichettaMossa(s, m, nome = g => `Giocatore ${g + 1}`) {
        if (m.prossima) return 'Mano successiva';
        if (m.tieni) return 'Tengo la carta';
        if (m.mazzo) return 'Cambio con il mazzo';
        return `Cambio con ${nome(successivo(s, s.turno))}`;
    }
    function gioca(s, mossa) {
        const scelta = mosseLegali(s).find(m => Object.keys(m)[0] === Object.keys(mossa || {})[0]);
        if (!scelta) return false;
        const io = s.turno;
        if (scelta.prossima) { s.mazziere = successivo(s, s.mazziere); nuovaMano(s); s.ultimo = { tipo: 'nuova' }; return true; }
        if (scelta.tieni) s.ultimo = { tipo: 'tiene', giocatore: io };
        else if (scelta.cambia) {
            const altro = successivo(s, io);
            if (s.carte[altro].numero === RE) s.ultimo = { tipo: 'cucu', giocatore: io, altro, carta: s.carte[altro] };
            else { [s.carte[io], s.carte[altro]] = [s.carte[altro], s.carte[io]]; s.ultimo = { tipo: 'cambio', giocatore: io, altro }; }
        } else {
            // Il mazziere "spacca il mazzo": prende una carta a caso; se è un re lo scambio non vale
            const pescata = s.mazzo.splice(Math.floor(s.casuale() * s.mazzo.length), 1)[0];
            if (pescata.numero === RE) s.ultimo = { tipo: 'cucuMazzo', giocatore: io, carta: pescata };
            else { s.scartate.push(s.carte[io]); s.carte[io] = pescata; s.ultimo = { tipo: 'mazzo', giocatore: io }; }
        }
        if (io === s.mazziere) chiudiMano(s); else s.turno = successivo(s, io);
        return true;
    }
    // Perde una vita chi ha la carta più bassa (anche più giocatori a pari merito).
    // Se perderebbero tutti i rimasti la mano è nulla, così la partita ha sempre un vincitore.
    function chiudiMano(s) {
        const rimasti = vivi(s), minimo = Math.min(...rimasti.map(g => s.carte[g].numero));
        const perdenti = rimasti.filter(g => s.carte[g].numero === minimo);
        s.persi = perdenti.length === rimasti.length ? [] : perdenti;
        s.persi.forEach(g => s.vite[g]--);
        s.fase = 'fine';
        const ancora = vivi(s);
        if (ancora.length === 1) { s.finita = true; s.vincitore = ancora[0]; }
        s.turno = s.mazziere;
    }
    // Il PC conosce solo la propria carta: tiene da 6 in su (e sempre il re), altrimenti cambia.
    function mossaPC(s) {
        const mosse = mosseLegali(s);
        if (!mosse.length) return null;
        if (s.fase === 'fine') return mosse[0];
        const mia = s.carte[s.turno].numero;
        return mia >= 6 ? mosse[0] : mosse[1];
    }
    return { RE, crea, vivi, successivo, mosseLegali, etichettaMossa, gioca, mossaPC };
})();
if (typeof module !== 'undefined') module.exports = Cucu;
