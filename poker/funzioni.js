// Poker Texas Hold'em a due (heads-up), con fiches finte. Si prova con: node poker/test-poker.js
// Fasi di una mano: 'preflop' -> 'flop' -> 'turn' -> 'river' -> 'fine' (vincitore e piatto assegnato).
// Il mazziere mette il piccolo buio e parla per primo prima del flop; dopo il flop parla per primo l'altro.
const Poker = (() => {
    const M = typeof module !== 'undefined' ? require('../js/mazzo') : Mazzo;
    const FICHES = 500, PICCOLO = 5, GRANDE = 10;
    const CATEGORIE = ['carta alta', 'coppia', 'doppia coppia', 'tris', 'scala', 'colore', 'full', 'poker', 'scala colore'];
    const forza = c => c.numero === 1 ? 14 : c.numero; // asso alto (vale anche 1 nella scala A-2-3-4-5)
    // Valuta esattamente 5 carte: [categoria, ...spareggi], confrontabile elemento per elemento
    function valuta5(carte) {
        const valori = carte.map(forza).sort((a, b) => b - a);
        const colore = carte.every(c => c.seme === carte[0].seme);
        const unici = [...new Set(valori)];
        let altaScala = 0;
        if (unici.length === 5 && valori[0] - valori[4] === 4) altaScala = valori[0];
        if (unici.length === 5 && valori.join() === '14,5,4,3,2') altaScala = 5; // la ruota: A-2-3-4-5
        const conta = unici.map(v => [valori.filter(x => x === v).length, v]).sort((a, b) => b[0] - a[0] || b[1] - a[1]);
        const gruppi = conta.map(g => g[0]), ordine = conta.map(g => g[1]);
        if (altaScala && colore) return [8, altaScala];
        if (gruppi[0] === 4) return [7, ...ordine];
        if (gruppi[0] === 3 && gruppi[1] === 2) return [6, ...ordine];
        if (colore) return [5, ...valori];
        if (altaScala) return [4, altaScala];
        if (gruppi[0] === 3) return [3, ...ordine];
        if (gruppi[0] === 2 && gruppi[1] === 2) return [2, ...ordine];
        if (gruppi[0] === 2) return [1, ...ordine];
        return [0, ...valori];
    }
    function confronta(a, b) {
        for (let i = 0; i < Math.max(a.length, b.length); i++) if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) - (b[i] || 0);
        return 0;
    }
    // La migliore combinazione di 5 carte tra 5, 6 o 7
    function valutaMano(carte) {
        let migliore = null, scelte = null;
        // Tutti i gruppi di 5 carte (21 con 7 carte)
        function cerca(da, gruppo) {
            if (gruppo.length === 5) {
                const v = valuta5(gruppo);
                if (!migliore || confronta(v, migliore) > 0) { migliore = v; scelte = gruppo; }
                return;
            }
            for (let i = da; i <= carte.length - (5 - gruppo.length); i++) cerca(i + 1, [...gruppo, carte[i]]);
        }
        cerca(0, []);
        return { punteggio: migliore, categoria: migliore[0], nome: nomeMano(migliore), carte: scelte };
    }
    function nomeMano(v) { return v[0] === 8 && v[1] === 14 ? 'scala reale' : CATEGORIE[v[0]]; }
    // modalita: 'uno' (contro il PC, posto 1) o 'due'
    function crea(modalita = 'uno', casuale = Math.random) {
        const s = { modalita, casuale, fiches: [FICHES, FICHES], mazziere: 1, numeroMano: 0, finita: false, vincitorePartita: null };
        nuovaMano(s);
        return s;
    }
    function nuovaMano(s) {
        s.mazziere = 1 - s.mazziere; s.numeroMano++;
        s.mazzo = M.mescola(M.francese(), s.casuale);
        s.mani = [M.pesca(s.mazzo, 2), M.pesca(s.mazzo, 2)];
        s.tavolo = []; s.piatto = 0; s.puntate = [0, 0]; s.fase = 'preflop'; s.esito = null; s.ultimo = null; s.uscito = null;
        const piccolo = s.mazziere, grande = 1 - s.mazziere;
        metti(s, piccolo, Math.min(PICCOLO, s.fiches[piccolo])); metti(s, grande, Math.min(GRANDE, s.fiches[grande]));
        s.ultimoRilancio = GRANDE; s.agito = [false, false]; s.turno = piccolo;
        if (s.fiches[0] === 0 || s.fiches[1] === 0) completa(s); // un buio ha già messo tutto: si scoprono le carte
    }
    function metti(s, g, quanto) { s.fiches[g] -= quanto; s.puntate[g] += quanto; s.piatto += quanto; }
    const daChiamare = (s, g) => Math.max(0, s.puntate[1 - g] - s.puntate[g]);
    function mosseLegali(s) {
        if (s.finita) return [];
        if (s.fase === 'fine') return [{ prossima: true }];
        const g = s.turno, chiamata = Math.min(daChiamare(s, g), s.fiches[g]), mosse = [];
        if (chiamata > 0) mosse.push({ lascia: true }, { chiama: chiamata }); else mosse.push({ passa: true });
        // Rilanci: minimo, piatto, tutto (in totale messo in questo giro); solo se l'altro ha ancora fiches
        if (s.fiches[1 - g] > 0 && s.fiches[g] > chiamata) {
            const massimo = s.puntate[g] + s.fiches[g], base = s.puntate[1 - g];
            const minimo = Math.min(massimo, base + Math.max(GRANDE, s.ultimoRilancio));
            const piatto = Math.min(massimo, base + s.piatto + chiamata);
            for (const totale of [...new Set([minimo, piatto, massimo])].sort((a, b) => a - b)) if (totale > base) mosse.push({ rilancia: totale });
        }
        return mosse;
    }
    function etichettaMossa(s, m) {
        if (m.prossima) return 'Mano successiva';
        if (m.lascia) return 'Lascia';
        if (m.passa) return 'Passa (check)';
        if (m.chiama) return `Vedi ${m.chiama}`;
        const tutto = m.rilancia === s.puntate[s.turno] + s.fiches[s.turno];
        return tutto ? `Tutto (${m.rilancia})` : `${s.puntate[1 - s.turno] ? 'Rilancia a' : 'Punta'} ${m.rilancia}`;
    }
    const tipo = m => Object.keys(m || {})[0];
    function gioca(s, mossa) {
        const scelta = mosseLegali(s).find(m => tipo(m) === tipo(mossa) && (m.rilancia === undefined || m.rilancia === mossa.rilancia));
        if (!scelta) return false;
        if (scelta.prossima) {
            if (s.fiches[0] === 0 || s.fiches[1] === 0) { s.finita = true; s.vincitorePartita = s.fiches[0] ? 0 : 1; return true; }
            nuovaMano(s); return true;
        }
        const g = s.turno, altro = 1 - g;
        s.agito[g] = true;
        if (scelta.lascia) { s.ultimo = { giocatore: g, azione: 'lascia' }; s.uscito = g; assegna(s, [altro]); return true; }
        if (scelta.passa) s.ultimo = { giocatore: g, azione: 'passa' };
        else if (scelta.chiama) { metti(s, g, scelta.chiama); s.ultimo = { giocatore: g, azione: 'chiama', quanto: scelta.chiama }; }
        else {
            const aggiunta = scelta.rilancia - s.puntate[g];
            s.ultimoRilancio = Math.max(s.ultimoRilancio, scelta.rilancia - s.puntate[altro]);
            metti(s, g, aggiunta); s.agito[altro] = false;
            s.ultimo = { giocatore: g, azione: 'rilancia', totale: scelta.rilancia, tutto: s.fiches[g] === 0 };
        }
        // Il giro finisce quando entrambi hanno parlato e le puntate sono pari (o chi deve vedere non ha più fiches)
        const pari = s.puntate[0] === s.puntate[1] || s.fiches[s.puntate[0] < s.puntate[1] ? 0 : 1] === 0;
        if (s.agito[0] && s.agito[1] && pari) prossimoGiro(s); else s.turno = altro;
        return true;
    }
    function prossimoGiro(s) {
        // Fiches non coperte (l'altro era già tutto dentro) tornano a chi le ha puntate
        const diff = s.puntate[0] - s.puntate[1];
        if (diff !== 0) { const g = diff > 0 ? 0 : 1; s.fiches[g] += Math.abs(diff); s.piatto -= Math.abs(diff); }
        s.puntate = [0, 0]; s.agito = [false, false]; s.ultimoRilancio = GRANDE;
        if (s.fiches[0] === 0 || s.fiches[1] === 0 || s.fase === 'river') { completa(s); return; }
        const quante = s.fase === 'preflop' ? 3 : 1;
        s.mazzo.shift(); // carta bruciata
        s.tavolo.push(...M.pesca(s.mazzo, quante));
        s.fase = { preflop: 'flop', flop: 'turn', turn: 'river' }[s.fase];
        s.turno = 1 - s.mazziere;
    }
    // Si scoprono le carte che mancano e si confrontano le mani
    function completa(s) {
        while (s.tavolo.length < 5) { s.mazzo.shift(); s.tavolo.push(...M.pesca(s.mazzo, s.tavolo.length ? 1 : 3)); }
        const mani = s.mani.map(m => valutaMano([...m, ...s.tavolo]));
        const c = confronta(mani[0].punteggio, mani[1].punteggio);
        s.mostrate = mani;
        assegna(s, c > 0 ? [0] : c < 0 ? [1] : [0, 1]);
    }
    function assegna(s, vincitori) {
        const quota = Math.floor(s.piatto / vincitori.length);
        vincitori.forEach(g => { s.fiches[g] += quota; });
        if (vincitori.length === 2 && s.piatto % 2) s.fiches[1 - s.mazziere] += 1; // la fiche dispari a chi non è mazziere
        s.esito = { vincitori, piatto: s.piatto, mostrate: s.uscito === null };
        s.piatto = 0; s.puntate = [0, 0]; s.fase = 'fine';
    }
    // Forza della propria mano: percentuale di vittorie contro carte casuali (simulazione), senza guardare l'avversario
    function equita(s, g, prove = 250) {
        const note = [...s.mani[g], ...s.tavolo], chiave = c => `${c.seme}-${c.valore}`, usate = new Set(note.map(chiave));
        const resto = M.francese().filter(c => !usate.has(chiave(c)));
        let punti = 0;
        for (let k = 0; k < prove; k++) {
            const pescate = M.mescola(resto, s.casuale).slice(0, 2 + 5 - s.tavolo.length);
            const tavolo = [...s.tavolo, ...pescate.slice(2)];
            const c = confronta(valutaMano([...s.mani[g], ...tavolo]).punteggio, valutaMano([...pescate.slice(0, 2), ...tavolo]).punteggio);
            punti += c > 0 ? 1 : c === 0 ? 0.5 : 0;
        }
        return punti / prove;
    }
    function mossaPC(s) {
        const mosse = mosseLegali(s);
        if (!mosse.length) return null;
        if (s.fase === 'fine') return mosse[0];
        const g = s.turno, forzaMano = equita(s, g), chiamata = Math.min(daChiamare(s, g), s.fiches[g]);
        const quota = chiamata / (s.piatto + chiamata || 1), rilanci = mosse.filter(m => m.rilancia);
        const bluff = s.casuale() < 0.06;
        if ((forzaMano > 0.78 || (bluff && !chiamata)) && rilanci.length) return rilanci[Math.min(1, rilanci.length - 1)];
        if (forzaMano > 0.6 && rilanci.length && s.casuale() < 0.5) return rilanci[0];
        if (!chiamata) return mosse.find(m => m.passa);
        if (forzaMano >= quota + 0.08 || forzaMano > 0.55) return mosse.find(m => m.chiama);
        return mosse.find(m => m.lascia);
    }
    return { FICHES, PICCOLO, GRANDE, CATEGORIE, valuta5, valutaMano, confronta, crea, mosseLegali, etichettaMossa, gioca, equita, mossaPC, daChiamare };
})();
if (typeof module !== 'undefined') module.exports = Poker;
