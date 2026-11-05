// Blackjack con il mazzo francese. Contro il banco del computer, oppure in due: uno dei due fa il banco
// e i ruoli si scambiano a ogni mano (Tappa 10.1). Si prova con: node blackjack/test-blackjack.js
// Fasi: 'puntata' -> 'gioco' (le mani di chi punta) -> 'banco' -> 'fine' (esiti e pagamenti) -> 'puntata'...
const Blackjack = (() => {
    const M = typeof module !== 'undefined' ? require('../js/mazzo') : Mazzo;
    const PUNTATE = [10, 20, 50], FICHES = 200, MAZZI = 2;
    const punti = c => Math.min(c.numero, 10); // asso 1 (vale 11 se conviene), figure 10
    function valore(carte) {
        let totale = carte.reduce((n, c) => n + punti(c), 0);
        const morbida = carte.some(c => c.numero === 1) && totale + 10 <= 21;
        if (morbida) totale += 10;
        return { totale, morbida };
    }
    const naturale = mano => mano.carte.length === 2 && !mano.divisa && valore(mano.carte).totale === 21;
    function nuovaScarpa(casuale) { return M.mescola(Array.from({ length: MAZZI }, () => M.francese()).flat(), casuale); }
    // modalita: 'uno' (banco del computer, fiches illimitate) o 'due' (banco umano, fiches per entrambi)
    function crea(modalita = 'uno', casuale = Math.random) {
        return { modalita, casuale, scarpa: nuovaScarpa(casuale), fiches: [FICHES, FICHES], banco: 1, fase: 'puntata',
            mani: [], attiva: 0, bancoCarte: [], esiti: [], ultimo: null, finita: false, numeroMano: 1 };
    }
    const giocatore = s => 1 - s.banco;
    function pesca(s) {
        if (s.scarpa.length < 15) s.scarpa = nuovaScarpa(s.casuale); // scarpa rimescolata quando sta per finire
        return s.scarpa.shift();
    }
    const puoPagare = (s, quanto) => s.fiches[giocatore(s)] >= quanto;
    function mosseLegali(s) {
        if (s.finita) return [];
        if (s.fase === 'puntata') return PUNTATE.filter(p => puoPagare(s, p) && (s.modalita === 'uno' || s.fiches[s.banco] >= p)).map(p => ({ punta: p }));
        if (s.fase === 'fine') return [{ prossima: true }];
        if (s.fase === 'banco') return [{ carta: true }, { stai: true }];
        const mano = s.mani[s.attiva], mosse = [{ carta: true }, { stai: true }];
        // Raddoppio e divisione aggiungono una puntata: servono fiches per coprire tutto quello che è in gioco
        const impegnate = s.mani.reduce((n, m) => n + m.puntata, 0);
        if (mano.carte.length === 2 && puoPagare(s, impegnate + mano.puntata)) {
            mosse.push({ raddoppia: true });
            if (s.mani.length === 1 && punti(mano.carte[0]) === punti(mano.carte[1])) mosse.push({ dividi: true });
        }
        return mosse;
    }
    function etichettaMossa(s, m) {
        if (m.punta) return `Punta ${m.punta} fiches`;
        if (m.prossima) return 'Mano successiva';
        if (m.carta) return 'Carta';
        if (m.stai) return 'Stai';
        if (m.raddoppia) return 'Raddoppia';
        return 'Dividi';
    }
    const tipo = m => Object.keys(m || {})[0];
    function gioca(s, mossa) {
        const scelta = mosseLegali(s).find(m => tipo(m) === tipo(mossa) && (m.punta === undefined || m.punta === mossa.punta));
        if (!scelta) return false;
        if (scelta.punta) { distribuisci(s, scelta.punta); return true; }
        if (scelta.prossima) { prossimaMano(s); return true; }
        if (s.fase === 'banco') {
            if (scelta.carta) { s.bancoCarte.push(pesca(s)); s.ultimo = { tipo: 'bancoCarta' }; if (valore(s.bancoCarte).totale >= 21) regola(s); }
            else regola(s);
            return true;
        }
        const mano = s.mani[s.attiva];
        if (scelta.carta) { mano.carte.push(pesca(s)); s.ultimo = { tipo: 'carta' }; if (valore(mano.carte).totale >= 21) mano.finita = true; }
        else if (scelta.stai) { mano.finita = true; s.ultimo = { tipo: 'stai' }; }
        else if (scelta.raddoppia) { mano.puntata *= 2; mano.raddoppiata = true; mano.carte.push(pesca(s)); mano.finita = true; s.ultimo = { tipo: 'raddoppia' }; }
        else {
            // Divisione: due mani con la stessa puntata; con due assi una sola carta per mano
            const [a, b] = mano.carte, assi = a.numero === 1;
            s.mani = [{ carte: [a, pesca(s)], puntata: mano.puntata, divisa: true, finita: assi }, { carte: [b, pesca(s)], puntata: mano.puntata, divisa: true, finita: assi }];
            s.ultimo = { tipo: 'dividi' };
        }
        avanza(s);
        return true;
    }
    function distribuisci(s, puntata) {
        s.mani = [{ carte: [pesca(s)], puntata, divisa: false, finita: false }];
        s.bancoCarte = [pesca(s)]; s.mani[0].carte.push(pesca(s)); s.bancoCarte.push(pesca(s));
        s.attiva = 0; s.esiti = []; s.ultimo = { tipo: 'distribuzione', puntata };
        // Blackjack del banco o di chi punta: la mano si chiude subito
        if (valore(s.bancoCarte).totale === 21 || naturale(s.mani[0])) { s.mani[0].finita = true; regola(s); return; }
        s.fase = 'gioco';
    }
    function avanza(s) {
        while (s.attiva < s.mani.length && s.mani[s.attiva].finita) s.attiva++;
        if (s.attiva < s.mani.length) return;
        // Tutte le mani sballate: il banco vince senza giocare
        if (s.mani.every(m => valore(m.carte).totale > 21)) { regola(s); return; }
        s.fase = 'banco';
        if (s.modalita === 'uno') {
            // Il banco del computer pesca fino a 17 e sta su ogni 17
            while (valore(s.bancoCarte).totale < 17) s.bancoCarte.push(pesca(s));
            regola(s);
        }
    }
    // Pagamenti: vinta 1 a 1, blackjack 3 a 2, pareggio restituito
    function regola(s) {
        const banco = valore(s.bancoCarte).totale, bancoNaturale = s.bancoCarte.length === 2 && banco === 21;
        let saldo = 0;
        s.esiti = s.mani.map(mano => {
            const mio = valore(mano.carte).totale;
            let esito, vincita;
            if (mio > 21) [esito, vincita] = ['sballata', -mano.puntata];
            else if (naturale(mano) && !bancoNaturale) [esito, vincita] = ['blackjack', mano.puntata * 3 / 2];
            else if (bancoNaturale && !naturale(mano)) [esito, vincita] = ['persa', -mano.puntata];
            else if (banco > 21 || mio > banco) [esito, vincita] = ['vinta', mano.puntata];
            else if (mio === banco) [esito, vincita] = ['pari', 0];
            else [esito, vincita] = ['persa', -mano.puntata];
            saldo += vincita;
            return { esito, vincita, totale: mio };
        });
        const g = giocatore(s);
        if (s.modalita === 'due') {
            // Il banco umano paga con le sue fiches: se non bastano paga quello che ha
            const pagato = saldo > 0 ? Math.min(saldo, s.fiches[s.banco]) : saldo;
            s.fiches[g] += pagato; s.fiches[s.banco] -= pagato;
        } else s.fiches[g] += saldo;
        s.saldo = saldo; s.fase = 'fine'; s.ultimo = { tipo: 'fine', saldo };
    }
    function prossimaMano(s) {
        if (s.modalita === 'due') s.banco = 1 - s.banco;
        s.numeroMano++; s.mani = []; s.bancoCarte = []; s.esiti = []; s.fase = 'puntata'; s.ultimo = null;
        if (!mosseLegali(s).length) s.finita = true; // chi punta non ha abbastanza fiches (o il banco non può coprire)
    }
    // Strategia di base semplificata, usata dal PC che fa da consigliere e nei test
    function consiglio(s) {
        const mosse = mosseLegali(s), ha = t => mosse.find(m => tipo(m) === t);
        if (s.fase === 'puntata') return mosse[0];
        if (s.fase !== 'gioco') return mosse[0];
        const mano = s.mani[s.attiva], { totale, morbida } = valore(mano.carte), banco = punti(s.bancoCarte[0]) === 1 ? 11 : punti(s.bancoCarte[0]);
        if (ha('dividi') && [1, 8].includes(mano.carte[0].numero)) return ha('dividi');
        if (ha('raddoppia') && !morbida && (totale === 11 || (totale === 10 && banco < 10))) return ha('raddoppia');
        if (morbida) return totale >= 19 || (totale === 18 && banco < 9) ? ha('stai') : ha('carta');
        if (totale >= 17 || (totale >= 13 && banco <= 6) || (totale === 12 && banco >= 4 && banco <= 6)) return ha('stai');
        return ha('carta');
    }
    return { PUNTATE, FICHES, punti, valore, naturale, crea, giocatore, mosseLegali, etichettaMossa, gioca, consiglio };
})();
if (typeof module !== 'undefined') module.exports = Blackjack;
