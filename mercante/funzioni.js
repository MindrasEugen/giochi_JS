// Mercante in fiera con due mazzi italiani: un mazzo va all'asta, dall'altro si scelgono coperte le carte premio
// e si estraggono le altre. Ogni carta estratta elimina la gemella venduta; alla fine le carte gemelle dei premi vincono.
// Fasi: 'asta' -> 'estrazione' -> 'premi' -> finita. Il banditore è il gioco stesso. Si prova con: node mercante/test-mercante.js
const Mercante = (() => {
    const M = typeof module !== 'undefined' ? require('../js/mazzo') : Mazzo;
    const FICHES = 50, POSTA = 10;
    const stessa = (a, b) => a.seme === b.seme && a.numero === b.numero;
    // Tutte le 40 carte vanno all'asta, a lotti: 5 carte a lotto in 2, 3 in 3–4, 2 in 5–6
    function aLotti(carte, giocatori) {
        const misura = Math.max(2, Math.round(40 / (4 * giocatori)));
        const lotti = [];
        for (let i = 0; i < carte.length; i += misura) lotti.push(carte.slice(i, i + misura));
        return lotti;
    }
    function crea(giocatori = 4, casuale = Math.random) {
        if (giocatori < 2 || giocatori > 6) throw new Error('Mercante in fiera: da 2 a 6 giocatori.');
        const asta = M.mescola(M.italiano(), casuale), estrazione = M.mescola(M.italiano(), casuale);
        const numeroPremi = giocatori <= 3 ? 2 : 3;
        const s = { numero: giocatori, fiches: Array(giocatori).fill(FICHES - POSTA), piatto: POSTA * giocatori,
            lotti: aLotti(asta, giocatori), lotto: 0, offerta: null, ritirati: [], turno: 0,
            possedute: Array.from({ length: giocatori }, () => []), eliminate: [], invendute: [],
            premi: estrazione.splice(0, numeroPremi), quote: numeroPremi === 2 ? [60, 40] : [50, 30, 20],
            estrazione, estratte: [], premiRivelati: [], vincite: Array(giocatori).fill(0), alBanco: 0,
            fase: 'asta', ultimo: null, finita: false, casuale, personalita: Array.from({ length: giocatori }, () => 0.8 + casuale() * 1.4) };
        return s;
    }
    const lottoInAsta = s => s.fase === 'asta' ? s.lotti[s.lotto] : null;
    // Chi è ancora in gara per il lotto: non ha passato e non ha già l'offerta migliore
    function prossimoOfferente(s, da) {
        for (let k = 1; k <= s.numero; k++) {
            const g = (da + k) % s.numero;
            if (!s.ritirati.includes(g) && g !== s.offerta?.giocatore) return g;
        }
        return null;
    }
    function mosseLegali(s) {
        if (s.finita) return [];
        if (s.fase === 'asta') {
            const prezzo = s.offerta?.prezzo ?? 0, mosse = [{ passa: true }];
            for (const extra of [1, 5]) if (s.fiches[s.turno] >= prezzo + extra) mosse.push({ offri: prezzo + extra });
            return mosse;
        }
        if (s.fase === 'estrazione') return [{ estrai: true }];
        return [{ rivela: true }];
    }
    function etichettaMossa(s, m) {
        if (m.passa) return 'Passo';
        if (m.offri) return `Offro ${m.offri} ${m.offri === 1 ? 'fiche' : 'fiches'}`;
        if (m.estrai) return 'Estrai una carta';
        return s.premiRivelati.length === s.premi.length - 1 ? 'Scopri il primo premio' : 'Scopri il premio successivo';
    }
    function chiudiLotto(s) {
        const carte = lottoInAsta(s);
        if (s.offerta) {
            const { giocatore, prezzo } = s.offerta;
            s.fiches[giocatore] -= prezzo; s.piatto += prezzo; s.possedute[giocatore].push(...carte);
            s.ultimo = { tipo: 'venduta', carte, giocatore, prezzo };
        } else { s.invendute.push(...carte); s.ultimo = { tipo: 'invenduta', carte }; }
        s.lotto++; s.offerta = null; s.ritirati = [];
        if (s.lotto >= s.lotti.length) { s.fase = 'estrazione'; s.turno = 0; return; }
        s.turno = s.lotto % s.numero; // a ogni lotto apre un giocatore diverso
    }
    function proprietario(s, carta) { return s.possedute.findIndex(carte => carte.some(c => stessa(c, carta))); }
    function gioca(s, mossa) {
        const scelta = mosseLegali(s).find(m => m.passa === mossa?.passa && m.offri === mossa?.offri && m.estrai === mossa?.estrai && m.rivela === mossa?.rivela);
        if (!scelta) return false;
        const io = s.turno;
        if (s.fase === 'asta') {
            if (scelta.passa) { s.ritirati.push(io); s.ultimo = { tipo: 'passa', giocatore: io }; }
            else { s.offerta = { giocatore: io, prezzo: scelta.offri }; s.ultimo = { tipo: 'offerta', giocatore: io, prezzo: scelta.offri }; }
            const prossimo = prossimoOfferente(s, io);
            if (prossimo === null) chiudiLotto(s); else s.turno = prossimo;
            return true;
        }
        if (s.fase === 'estrazione') {
            const carta = s.estrazione.shift(); s.estratte.push(carta);
            const chi = proprietario(s, carta);
            if (chi >= 0) { s.possedute[chi] = s.possedute[chi].filter(c => !stessa(c, carta)); s.eliminate.push({ carta, giocatore: chi }); }
            s.ultimo = { tipo: 'estratta', carta, giocatore: chi };
            if (!s.estrazione.length) s.fase = 'premi';
            return true;
        }
        // Premi scoperti dal più piccolo al primo; il primo prende anche il resto delle divisioni
        const indice = s.premi.length - 1 - s.premiRivelati.length, carta = s.premi[indice];
        const importi = s.quote.map(q => Math.floor(s.piatto * q / 100));
        importi[0] += s.piatto - importi.reduce((a, b) => a + b, 0);
        const chi = proprietario(s, carta), importo = importi[indice];
        if (chi >= 0) { s.fiches[chi] += importo; s.vincite[chi] += importo; } else s.alBanco += importo;
        s.premiRivelati.push({ posizione: indice + 1, carta, giocatore: chi, importo });
        s.ultimo = { tipo: 'premio', posizione: indice + 1, carta, giocatore: chi, importo };
        if (s.premiRivelati.length === s.premi.length) s.finita = true;
        return true;
    }
    // Classifica finale per fiches
    function risultato(s) {
        const ordine = [...s.fiches.keys()].sort((a, b) => s.fiches[b] - s.fiches[a]);
        const migliore = s.fiches[ordine[0]];
        return { fiches: [...s.fiches], ordine, vincitori: ordine.filter(g => s.fiches[g] === migliore), alBanco: s.alBanco };
    }
    // Il PC stima il valore del lotto: in media ogni carta porta un quarantesimo del piatto finale.
    // Ognuno ha una "personalità" fissa che lo rende più o meno prudente.
    function mossaPC(s) {
        const mosse = mosseLegali(s);
        if (!mosse.length) return null;
        if (s.fase !== 'asta') return mosse[0];
        const io = s.turno, prezzo = s.offerta?.prezzo ?? 0;
        const restanti = s.lotti.length - s.lotto, carte = lottoInAsta(s).length;
        const valore = Math.max(1, Math.round((s.piatto + restanti * 2) / 40 * carte * 1.5 * s.personalita[io]));
        const giaMie = s.possedute[io].length, quota = 40 / s.numero;
        if (prezzo + 1 > valore || (giaMie > quota * 1.5 && prezzo >= 1)) return mosse[0];
        return mosse.find(m => m.offri === prezzo + 1) || mosse[0];
    }
    return { FICHES, POSTA, stessa, crea, lottoInAsta, mosseLegali, etichettaMossa, gioca, proprietario, risultato, mossaPC };
})();
if (typeof module !== 'undefined') module.exports = Mercante;
