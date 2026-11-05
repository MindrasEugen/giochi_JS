// Scorpione: 7 colonne da 7 carte (nelle prime 4 le prime 3 coperte) e 3 carte di riserva.
// Si sposta qualunque carta scoperta con quelle sopra su una carta dello stesso seme e di valore subito superiore;
// in una colonna vuota va solo un re. Le scale complete dal re all'asso escono. Si prova con: node js/test-solitari-2.js
// Pile: 'mazzo' (3 carte), 'fatte', 'c0'..'c6'.
const Scorpione = (() => {
    const M = typeof module !== 'undefined' ? require('../js/mazzo') : Mazzo;
    const COLONNE = Array.from({ length: 7 }, (_, i) => `c${i}`);
    function crea(opzioni = {}, casuale = Math.random) {
        const mazzo = M.mescola(M.francese(), casuale), pile = { fatte: [] };
        COLONNE.forEach((id, i) => { pile[id] = mazzo.splice(0, 7).map((carta, k) => ({ carta, scoperta: !(i < 4 && k < 3) })); });
        pile.mazzo = mazzo.map(carta => ({ carta, scoperta: false }));
        return { gioco: 'scorpione', pile, mosse: 0 };
    }
    const cima = (s, id) => s.pile[id].at(-1);
    const puoPrendere = (s, id, i) => COLONNE.includes(id) && i >= 0 && i < s.pile[id].length && s.pile[id][i].scoperta;
    function puoPosare(s, carte, destinazione) {
        if (!COLONNE.includes(destinazione)) return false;
        const sopra = cima(s, destinazione), prima = carte[0].carta;
        return sopra ? sopra.scoperta && sopra.carta.seme === prima.seme && prima.numero === sopra.carta.numero - 1 : prima.numero === 13;
    }
    function controllaScala(s, id) {
        const pila = s.pile[id], ultime = pila.slice(-13);
        if (ultime.length < 13 || ultime[0].carta.numero !== 13) return;
        if (ultime.every((x, i) => x.scoperta && x.carta.seme === ultime[0].carta.seme && x.carta.numero === 13 - i)) {
            s.pile.fatte.push(...pila.splice(-13)); const c = cima(s, id); if (c) c.scoperta = true;
        }
    }
    function sposta(s, da, i, a) {
        if (da === a || !puoPrendere(s, da, i)) return false;
        const carte = s.pile[da].slice(i);
        if (!puoPosare(s, carte, a)) return false;
        s.pile[da].splice(i); s.pile[a].push(...carte);
        const c = cima(s, da); if (c) c.scoperta = true;
        controllaScala(s, a); s.mosse++;
        return true;
    }
    // Le 3 carte di riserva vanno sulle prime tre colonne, una volta sola
    function clicMazzo(s) {
        if (!s.pile.mazzo.length) return false;
        s.pile.mazzo.splice(0).forEach((x, k) => { x.scoperta = true; s.pile[COLONNE[k]].push(x); controllaScala(s, COLONNE[k]); });
        s.mosse++;
        return true;
    }
    // Doppio clic: la carta toccata (con quelle sopra) va dove si può posare
    function autoBase(s, id) {
        const pila = s.pile[id];
        if (!pila?.length || !COLONNE.includes(id)) return false;
        for (let i = pila.length - 1; i >= 0 && pila[i].scoperta; i--) {
            const meta = COLONNE.find(c => c !== id && puoPosare(s, pila.slice(i), c) && (s.pile[c].length || i > 0));
            if (meta) return sposta(s, id, i, meta);
        }
        return false;
    }
    const vinto = s => s.pile.fatte.length === 52;
    function disposizione() {
        return [{ id: 'mazzo', x: 0, y: 0, tipo: 'mazzo', etichetta: '' }, { id: 'fatte', x: 6, y: 0, tipo: 'fatte', etichetta: '' },
            ...COLONNE.map((id, i) => ({ id, x: i, y: 1.25, tipo: 'colonna', etichetta: 'K' }))];
    }
    return { COLONNE, colonne: 7, crea, puoPrendere, puoPosare, sposta, clicMazzo, autoBase, vinto, disposizione };
})();
if (typeof module !== 'undefined') module.exports = Scorpione;
