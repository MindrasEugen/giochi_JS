// Cambio colore: gioco di carte con un mazzo originale (ADR 0009), da 2 a 4 giocatori.
// Quattro colori (corallo, sole, menta, notte), numeri da 0 a 9 e carte speciali:
//   fermo (il prossimo salta il turno), giro (cambia il verso), pesca 2, cambio (scegli il colore), cambio + 4.
// Si risponde con lo stesso colore o lo stesso simbolo; vince chi resta senza carte. Si prova con: node cambio_colore/test-cambio-colore.js
const CambioColore = (() => {
    const M = typeof module !== 'undefined' ? require('../js/mazzo') : Mazzo;
    const COLORI = ['corallo', 'sole', 'menta', 'notte'];
    const NOMI = { numero: '', fermo: 'Fermo', giro: 'Giro', piu2: 'Pesca 2', cambio: 'Cambio', cambio4: 'Cambio + 4' };
    function creaMazzo() {
        const carte = [];
        let id = 0;
        for (const colore of COLORI) {
            carte.push({ id: id++, colore, tipo: 'numero', valore: 0 });
            for (let v = 1; v <= 9; v++) for (let k = 0; k < 2; k++) carte.push({ id: id++, colore, tipo: 'numero', valore: v });
            for (const tipo of ['fermo', 'giro', 'piu2']) for (let k = 0; k < 2; k++) carte.push({ id: id++, colore, tipo });
        }
        for (const tipo of ['cambio', 'cambio4']) for (let k = 0; k < 4; k++) carte.push({ id: id++, colore: null, tipo });
        return carte; // 108 carte
    }
    const nome = c => c.tipo === 'numero' ? `${c.valore} ${c.colore}` : c.colore ? `${NOMI[c.tipo]} ${c.colore}` : NOMI[c.tipo];
    function crea(giocatori = 2, casuale = Math.random) {
        if (giocatori < 2 || giocatori > 4) throw new Error('Cambio colore: da 2 a 4 giocatori.');
        const mazzo = M.mescola(creaMazzo(), casuale);
        const mani = Array.from({ length: giocatori }, () => mazzo.splice(0, 7));
        // La prima carta scoperta è sempre un numero
        const prima = mazzo.findIndex(c => c.tipo === 'numero');
        const scarti = mazzo.splice(prima, 1);
        return { numero: giocatori, mazzo, mani, scarti, colore: scarti[0].colore, turno: 0, verso: 1,
            pescata: null, sceltaColore: null, ultimo: null, finita: false, vincitore: null, casuale };
    }
    const cima = s => s.scarti.at(-1);
    function giocabile(s, carta, mano) {
        if (carta.tipo === 'cambio') return true;
        if (carta.tipo === 'cambio4') return !mano.some(c => c.colore === s.colore); // solo senza carte del colore richiesto
        const sopra = cima(s);
        return carta.colore === s.colore || (carta.tipo === 'numero' ? sopra.tipo === 'numero' && sopra.valore === carta.valore : carta.tipo === sopra.tipo);
    }
    function mosseLegali(s) {
        if (s.finita) return [];
        if (s.sceltaColore !== null) return COLORI.map(colore => ({ colore }));
        const mano = s.mani[s.turno];
        if (s.pescata !== null) return [...(giocabile(s, mano[s.pescata], mano) ? [{ carta: s.pescata }] : []), { passa: true }];
        return [...mano.flatMap((c, carta) => giocabile(s, c, mano) ? [{ carta }] : []), { pesca: true }];
    }
    const prossimo = (s, da, passi = 1) => ((da + s.verso * passi) % s.numero + s.numero) % s.numero;
    function pescaCarte(s, g, quante) {
        const prese = [];
        for (let k = 0; k < quante; k++) {
            if (!s.mazzo.length) {
                // Mazzo finito: si rimescolano gli scarti tranne quello in cima
                const sopra = s.scarti.pop();
                s.mazzo = M.mescola(s.scarti, s.casuale); s.scarti = [sopra];
                if (!s.mazzo.length) break;
            }
            const c = s.mazzo.shift(); s.mani[g].push(c); prese.push(c);
        }
        return prese;
    }
    function fineTurno(s, salta = false) { s.turno = prossimo(s, s.turno, salta ? 2 : 1); s.pescata = null; }
    // Effetto della carta appena giocata sul giocatore successivo
    function effetto(s, carta) {
        const vittima = prossimo(s, s.turno);
        if (carta.tipo === 'fermo') { s.ultimo.salta = vittima; fineTurno(s, true); return; }
        if (carta.tipo === 'giro') {
            if (s.numero === 2) { s.ultimo.salta = vittima; fineTurno(s, true); return; } // in due il giro vale come un fermo
            s.verso *= -1; fineTurno(s); return;
        }
        if (carta.tipo === 'piu2' || carta.tipo === 'cambio4') {
            const quante = carta.tipo === 'piu2' ? 2 : 4;
            s.ultimo.pesca = { giocatore: vittima, quante: pescaCarte(s, vittima, quante).length };
            fineTurno(s, true); return;
        }
        fineTurno(s);
    }
    function gioca(s, mossa) {
        const legali = mosseLegali(s);
        const scelta = legali.find(m => m.carta === mossa?.carta && m.colore === mossa?.colore && m.pesca === mossa?.pesca && m.passa === mossa?.passa);
        if (!scelta) return false;
        const io = s.turno;
        if (scelta.colore) {
            s.colore = scelta.colore; const carta = s.sceltaColore; s.sceltaColore = null;
            s.ultimo = { tipo: 'colore', giocatore: io, colore: scelta.colore, carta };
            effetto(s, carta); return true;
        }
        if (scelta.pesca) {
            const [c] = pescaCarte(s, io, 1);
            s.ultimo = { tipo: 'pesca', giocatore: io };
            if (!c) { fineTurno(s); return true; }
            s.pescata = s.mani[io].length - 1;
            // Se la carta pescata non si può giocare il turno passa da solo
            if (!giocabile(s, c, s.mani[io])) { s.ultimo.passa = true; fineTurno(s); }
            return true;
        }
        if (scelta.passa) { s.ultimo = { tipo: 'passa', giocatore: io }; fineTurno(s); return true; }
        const carta = s.mani[io].splice(scelta.carta, 1)[0];
        s.scarti.push(carta); s.pescata = null;
        s.ultimo = { tipo: 'carta', giocatore: io, carta, ultimaCarta: s.mani[io].length === 1 };
        if (!s.mani[io].length) { s.finita = true; s.vincitore = io; return true; }
        if (!carta.colore) { s.sceltaColore = carta; return true; } // stesso giocatore: sceglie il colore
        s.colore = carta.colore;
        effetto(s, carta);
        return true;
    }
    // Il PC conosce la propria mano e quante carte hanno gli altri.
    function mossaPC(s) {
        const mosse = mosseLegali(s);
        if (!mosse.length) return null;
        const mano = s.mani[s.turno];
        if (s.sceltaColore !== null) {
            const conta = COLORI.map(colore => mano.filter(c => c.colore === colore).length);
            return { colore: COLORI[conta.indexOf(Math.max(...conta))] };
        }
        const carte = mosse.filter(m => m.carta !== undefined);
        if (!carte.length) return mosse.at(-1); // pesca o passa
        const prossimoPoche = s.mani[prossimo(s, s.turno)].length <= 2;
        const punteggio = m => {
            const c = mano[m.carta];
            if (c.tipo === 'cambio4') return prossimoPoche ? 50 : -20;
            if (c.tipo === 'cambio') return prossimoPoche ? 5 : -10;          // i jolly si tengono per ultimi
            if (c.tipo !== 'numero') return prossimoPoche ? 40 : 15;         // gli attacchi servono contro chi sta per vincere
            return c.valore + (c.colore === s.colore ? 1 : 0);
        };
        return [...carte].sort((a, b) => punteggio(b) - punteggio(a))[0];
    }
    return { COLORI, NOMI, creaMazzo, nome, crea, cima, giocabile, mosseLegali, gioca, mossaPC };
})();
if (typeof module !== 'undefined') module.exports = CambioColore;
