// Tressette a 2 (con pesca dal mazzo) e a 4 in coppie, senza accuse. Si prova con: node tressette/test-tressette.js
const Tressette = (() => {
    const M = typeof module !== 'undefined' ? require('../js/mazzo') : Mazzo;
    const ORDINE = [4, 5, 6, 7, 8, 9, 10, 1, 2, 3]; // dalla più debole: quattro ... asso, due, tre
    // Valori in terzi di punto: l'asso vale 1 punto, due, tre e figure 1/3, le altre niente.
    const terziCarta = c => c.numero === 1 ? 3 : [2, 3, 8, 9, 10].includes(c.numero) ? 1 : 0;
    const squadra = (s, giocatore) => giocatore % 2;
    function crea(numero = 2, casuale = Math.random) {
        if (![2, 4].includes(numero)) throw new Error('Tressette richiede due o quattro giocatori.');
        const mazzo = M.mescola(M.italiano(), casuale), mani = M.distribuisci(mazzo, numero, 10);
        return { numero, mazzo, mani, tavolo: [], catturate: [[], []], terzi: [0, 0], turno: 0, presaCompleta: false,
            finita: false, ultimo: null, ultimaPresa: null };
    }
    const forte = (a, b) => ORDINE.indexOf(a.numero) > ORDINE.indexOf(b.numero);
    // Prende la carta più alta del seme di uscita: le altre non contano
    function vincitorePresa(tavolo) {
        if (!tavolo.length) return null;
        const seme = tavolo[0].carta.seme;
        return tavolo.reduce((v, p) => p.carta.seme === seme && forte(p.carta, v.carta) ? p : v).giocatore;
    }
    // Obbligo di rispondere al seme di uscita, se lo si ha in mano
    function mosseLegali(s) {
        if (s.finita || s.presaCompleta) return [];
        const mano = s.mani[s.turno], seme = s.tavolo[0]?.carta.seme;
        const risposta = seme && mano.some(c => c.seme === seme);
        return mano.flatMap((c, carta) => !risposta || c.seme === seme ? [{ carta }] : []);
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
        const vince = vincitorePresa(s.tavolo), carte = s.tavolo.map(p => p.carta);
        const terzi = carte.reduce((n, c) => n + terziCarta(c), 0);
        s.catturate[squadra(s, vince)].push(...carte); s.terzi[squadra(s, vince)] += terzi;
        s.tavolo = []; s.presaCompleta = false; s.ultimaPresa = vince;
        // A 2: chi prende pesca per primo, poi l'altro; le carte pescate si mostrano all'avversario.
        const pescate = [];
        if (s.mazzo.length) for (let k = 0; k < s.numero; k++) {
            const g = (vince + k) % s.numero, c = M.pesca(s.mazzo)[0];
            s.mani[g].push(c); pescate.push({ giocatore: g, carta: c });
        }
        s.ultimo = { giocatore: vince, terzi, pescate };
        s.turno = vince; s.finita = s.mani.every(m => m.length === 0);
        return true;
    }
    // Le frazioni si tolgono; l'ultima presa vale 1 punto: in tutto 11 punti per smazzata.
    function risultato(s) {
        const punti = s.terzi.map((t, i) => Math.floor(t / 3) + (s.finita && squadra(s, s.ultimaPresa) === i ? 1 : 0));
        return { punti, terzi: [...s.terzi], vincitore: punti[0] === punti[1] ? null : punti[0] > punti[1] ? 0 : 1 };
    }
    // Il PC guarda solo la propria mano e le carte sul tavolo.
    function mossaPC(s) {
        const mosse = mosseLegali(s);
        if (!mosse.length) return null;
        const io = s.turno, mano = s.mani[io], carta = m => mano[m.carta];
        const debole = (a, b) => terziCarta(carta(a)) - terziCarta(carta(b)) || ORDINE.indexOf(carta(a).numero) - ORDINE.indexOf(carta(b).numero);
        if (!s.tavolo.length) {
            // In uscita: una carta bassa del seme più lungo, senza buttare assi e tre se non servono.
            const lunghezza = seme => mano.filter(c => c.seme === seme).length;
            return [...mosse].sort((a, b) => lunghezza(carta(b).seme) - lunghezza(carta(a).seme) || debole(a, b))[0];
        }
        const ultimo = s.tavolo.length === s.numero - 1;
        const vinceOra = vincitorePresa(s.tavolo);
        const compagno = s.numero === 4 && squadra(s, vinceOra) === squadra(s, io);
        const punti = s.tavolo.reduce((n, p) => n + terziCarta(p.carta), 0);
        const vincenti = mosse.filter(m => vincitorePresa([...s.tavolo, { giocatore: io, carta: carta(m) }]) === io);
        if (compagno && ultimo) return [...mosse].sort((a, b) => -debole(a, b))[0]; // carica la presa del compagno
        // Prende con la carta vincente più economica se è l'ultimo, se ci sono punti o se costa poco
        const economica = [...vincenti].sort(debole)[0];
        if (economica && (ultimo || punti >= 3 || terziCarta(carta(economica)) === 0)) return economica;
        return [...mosse].sort(debole)[0];
    }
    return { ORDINE, terziCarta, squadra, crea, vincitorePresa, mosseLegali, gioca, raccogli, risultato, mossaPC };
})();
if (typeof module !== 'undefined') module.exports = Tressette;
