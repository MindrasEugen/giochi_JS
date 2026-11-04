// Regole condivise per i giochi di presa: Scopa, Asso piglia tutto, Rubamazzetto, Scopone scientifico e Cirulla.
// Le carte prese e le scope sono contate per squadra: a 2 giocatori ognuno è una squadra, a 4 si gioca in coppie (0+2 contro 1+3).
const PreseItaliane = (() => {
    const M = typeof module !== 'undefined' ? require('./mazzo') : Mazzo;
    const VALORI_PRIMIERA = { 1: 16, 2: 12, 3: 13, 4: 14, 5: 15, 6: 18, 7: 21, 8: 10, 9: 10, 10: 10 };
    // giocatori, carte in mano per distribuzione, carte iniziali in tavola
    const VARIANTI = {
        scopa: { giocatori: 2, mano: 3, tavolo: 4 },
        asso: { giocatori: 2, mano: 3, tavolo: 4 },
        rubamazzetto: { giocatori: 2, mano: 3, tavolo: 4 },
        scopone: { giocatori: 4, mano: 9, tavolo: 4 },
        cirulla: { giocatori: 2, mano: 3, tavolo: 4 }
    };
    const eMatta = c => c.seme === 'coppe' && c.numero === 7; // Cirulla: il 7 di coppe
    const squadra = (s, giocatore) => giocatore % 2;
    function primiera(carte) {
        const valori = M.SEMI_ITALIANI.map(seme => Math.max(0, ...carte.filter(c => c.seme === seme).map(c => VALORI_PRIMIERA[c.numero])));
        return valori.every(Boolean) ? valori.reduce((a, b) => a + b, 0) : 0;
    }
    // Asso, 2 e 3 di denari valgono 3 punti, più 1 per ogni denaro successivo in scala (fino a "massimo").
    function scalaDenari(carte, massimo) {
        const denari = new Set(carte.filter(c => c.seme === 'denari').map(c => c.numero));
        if (![1, 2, 3].every(n => denari.has(n))) return 0;
        let punti = 3;
        for (let n = 4; n <= massimo && denari.has(n); n++) punti++;
        return punti;
    }
    // Tutti gli insiemi di indici del tavolo con la somma indicata
    function somme(tavolo, obiettivo) {
        const prese = [];
        function cerca(da, somma, indici) {
            if (somma === obiettivo && indici.length) { prese.push(indici); return; }
            for (let i = da; i < tavolo.length; i++) if (somma + tavolo[i].numero <= obiettivo) cerca(i + 1, somma + tavolo[i].numero, [...indici, i]);
        }
        cerca(0, 0, []); return prese;
    }
    function presePossibili(carta, tavolo, variante = 'scopa') {
        const uguali = tavolo.flatMap((c, i) => c.numero === carta.numero ? [[i]] : []);
        if (variante === 'cirulla') {
            // Asso senza assi in tavola: prende tutto (vale scopa). Altrimenti carta uguale (ha la precedenza sulle somme) e presa del 15.
            if (carta.numero === 1 && tavolo.length && !uguali.length) return [tavolo.map((_, i) => i)];
            const base = uguali.length ? uguali : somme(tavolo, carta.numero);
            const chiavi = new Set(base.map(p => p.join(',')));
            return [...base, ...somme(tavolo, 15 - carta.numero).filter(p => !chiavi.has(p.join(',')))];
        }
        if (uguali.length) return uguali;
        if (variante === 'rubamazzetto') return [];
        if (variante === 'asso' && carta.numero === 1) return tavolo.length ? [tavolo.map((_, i) => i)] : [];
        return somme(tavolo, carta.numero);
    }
    // Cirulla, accusi a ogni distribuzione: tre carte uguali (decino, 10 scope) o somma minore di 10 (bàrsega, 3 scope).
    // La matta vale quello che serve: completa una coppia o conta 1.
    function accuso(mano) {
        const altre = mano.filter(c => !eMatta(c));
        const matta = altre.length < mano.length;
        if (mano.length === 3 && (altre.every(c => c.numero === altre[0].numero))) return { tipo: 'decino', scope: 10 };
        const somma = altre.reduce((n, c) => n + c.numero, 0) + (matta ? 1 : 0);
        if (mano.length === 3 && somma < 10) return { tipo: 'bàrsega', scope: 3 };
        return null;
    }
    // Cirulla: somma delle 4 carte iniziali, scegliendo il valore della matta (1–10) per arrivare a 15 o 30
    function sommaIniziale(tavolo) {
        const base = tavolo.filter(c => !eMatta(c)).reduce((n, c) => n + c.numero, 0);
        if (tavolo.length === tavolo.filter(c => !eMatta(c)).length) return base;
        for (const obiettivo of [15, 30]) if (obiettivo - base >= 1 && obiettivo - base <= 10) return obiettivo;
        return base + 7;
    }
    function distribuisciAccusi(s) {
        s.annunci = [];
        if (s.variante !== 'cirulla') return;
        s.mani.forEach((mano, g) => {
            const a = accuso(mano);
            if (!a) return;
            s.scope[squadra(s, g)] += a.scope;
            s.annunci.push({ giocatore: g, ...a, carte: [...mano] });
        });
    }
    function crea(variante = 'scopa', casuale = Math.random) {
        const regole = VARIANTI[variante];
        if (!regole) throw new Error('Variante non supportata.');
        let mazzo = M.mescola(M.italiano(), casuale);
        const inizio = regole.giocatori * regole.mano;
        // Tavola da rifare: tre re (Scopa e Scopone) oppure due assi senza 15 o 30 (Cirulla).
        const daRifare = m => {
            const tavolo = m.slice(inizio, inizio + regole.tavolo);
            if (variante === 'rubamazzetto') return false;
            if (variante === 'cirulla') return tavolo.filter(c => c.numero === 1).length >= 2 && ![15, 30].includes(sommaIniziale(tavolo));
            return tavolo.filter(c => c.numero === 10).length >= 3;
        };
        let tentativi = 0;
        while (daRifare(mazzo)) {
            // Anche una sorgente casuale costante non può bloccare la distribuzione.
            if (++tentativi < 20) mazzo = M.mescola(mazzo, casuale); else mazzo.push(mazzo.shift());
        }
        const mani = M.distribuisci(mazzo, regole.giocatori, regole.mano), tavolo = M.pesca(mazzo, regole.tavolo);
        const s = { variante, giocatori: regole.giocatori, mazzo, mani, tavolo, catturate: [[], []], scope: [0, 0], turno: 0,
            ultimaPresa: null, finita: false, ultimo: null, annunci: [], iniziale: null };
        if (variante === 'cirulla') {
            const somma = sommaIniziale(tavolo);
            if (somma === 15 || somma === 30) {
                // Il mazziere (l'ultimo a giocare) raccoglie la tavola: 1 scopa con 15, 2 con 30.
                const mazziere = regole.giocatori - 1;
                s.catturate[squadra(s, mazziere)].push(...s.tavolo); s.tavolo = [];
                s.scope[squadra(s, mazziere)] += somma / 15; s.ultimaPresa = mazziere;
                s.iniziale = { giocatore: mazziere, somma, scope: somma / 15 };
            }
        }
        distribuisciAccusi(s);
        return s;
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
        const io = s.turno, mia = squadra(s, io), carta = s.mani[io].splice(scelta.carta, 1)[0];
        const ultimaGiocata = s.mazzo.length === 0 && s.mani.every(m => m.length === 0);
        const prese = scelta.presa.map(i => s.tavolo[i]);
        const ruba = scelta.ruba !== undefined;
        let scopa = false;
        s.annunci = [];
        if (ruba) {
            s.catturate[mia].push(...s.catturate[scelta.ruba], carta); s.catturate[scelta.ruba] = []; s.ultimaPresa = io;
        } else if (prese.length) {
            s.tavolo = s.tavolo.filter((_, i) => !scelta.presa.includes(i));
            s.catturate[mia].push(...prese, carta); s.ultimaPresa = io;
            scopa = s.variante !== 'rubamazzetto' && s.tavolo.length === 0 && !ultimaGiocata;
            if (scopa) s.scope[mia]++;
        } else s.tavolo.push(carta);
        s.ultimo = { giocatore: io, carta, prese, ruba, scopa };
        if (s.mani.every(m => m.length === 0)) {
            if (s.mazzo.length) { s.mani = M.distribuisci(s.mazzo, s.giocatori, 3); distribuisciAccusi(s); }
            else {
                const ultimo = s.ultimaPresa ?? io;
                // I resti vanno sotto il mazzetto: non cambiano la carta scoperta.
                s.catturate[squadra(s, ultimo)].unshift(...s.tavolo); s.tavolo = []; s.finita = true;
            }
        }
        s.turno = (io + 1) % s.giocatori; return true;
    }
    function risultato(s) {
        const dati = s.catturate.map(carte => ({ carte: carte.length, denari: carte.filter(c => c.seme === 'denari').length,
            settebello: carte.some(c => c.seme === 'denari' && c.numero === 7) ? 1 : 0, primiera: primiera(carte),
            napola: s.variante === 'scopone' ? scalaDenari(carte, 10) : 0,
            grande: s.variante === 'cirulla' && [8, 9, 10].every(n => carte.some(c => c.seme === 'denari' && c.numero === n)) ? 5 : 0,
            piccola: s.variante === 'cirulla' ? scalaDenari(carte, 7) : 0 }));
        const punti = s.variante === 'rubamazzetto' ? dati.map(d => d.carte) : [...s.scope];
        const dettaglio = [0, 1].map(i => ({ scope: s.scope[i], carte: 0, denari: 0, settebello: dati[i].settebello, primiera: 0,
            napola: dati[i].napola, grande: dati[i].grande, piccola: dati[i].piccola }));
        if (s.variante !== 'rubamazzetto') {
            for (const criterio of ['carte', 'denari', 'primiera']) {
                if (dati[0][criterio] === dati[1][criterio]) continue;
                const vincitore = dati[0][criterio] > dati[1][criterio] ? 0 : 1;
                dettaglio[vincitore][criterio] = 1; punti[vincitore]++;
            }
            for (const i of [0, 1]) punti[i] += dati[i].settebello + dati[i].napola + dati[i].grande + dati[i].piccola;
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
            // Lasciare in tavola una somma facile da prendere tutta in una volta regala una scopa.
            const facile = s.variante === 'cirulla' ? somma <= 10 || somma - 15 <= 10 && somma >= 16 : somma <= 10;
            return -valore(s.mani[io][m.carta]) - (facile && s.variante !== 'rubamazzetto' ? 12 : 0);
        };
        return [...mosse].sort((a, b) => peso(b) - peso(a))[0] || null;
    }
    return { VALORI_PRIMIERA, VARIANTI, primiera, scalaDenari, presePossibili, accuso, sommaIniziale, squadra, eMatta, crea, mosseLegali, gioca, risultato, mossaPC };
})();
if (typeof module !== 'undefined') module.exports = PreseItaliane;
