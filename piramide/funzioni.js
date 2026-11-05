// Piramide: 28 carte a piramide, si eliminano coppie che sommano 13 (il re da solo; fante 11, donna 12, asso 1).
// Si usano solo le carte libere (non coperte da due carte della riga sotto) e la carta in cima agli scarti.
// Tre passaggi del mazzo. Si prova con: node piramide/test-piramide.js
// Pile: 'p0'..'p27' (riga r, posizione i: indice r*(r+1)/2 + i), 'mazzo', 'scarti', 'eliminate'.
const Piramide = (() => {
    const M = typeof module !== 'undefined' ? require('../js/mazzo') : Mazzo;
    const POSTI = [];
    for (let r = 0; r < 7; r++) for (let i = 0; i <= r; i++) POSTI.push({ id: `p${POSTI.length}`, r, i });
    const PASSAGGI = 3;
    const posto = id => POSTI.find(p => p.id === id);
    const idDi = (r, i) => `p${r * (r + 1) / 2 + i}`;
    function crea(opzioni = {}, casuale = Math.random) {
        const mazzo = M.mescola(M.francese(), casuale), pile = { eliminate: [], scarti: [] };
        POSTI.forEach(p => { pile[p.id] = [{ carta: mazzo.shift(), scoperta: true }]; });
        pile.mazzo = mazzo.map(carta => ({ carta, scoperta: false }));
        return { gioco: 'piramide', pile, mosse: 0, giri: 0 };
    }
    // Una carta della piramide è libera se nella riga sotto le due carte che la coprono sono state eliminate
    function libera(s, id) {
        const p = posto(id);
        if (!p || !s.pile[id].length) return false;
        if (p.r === 6) return true;
        return !s.pile[idDi(p.r + 1, p.i)].length && !s.pile[idDi(p.r + 1, p.i + 1)].length;
    }
    function puoPrendere(s, id, indice) {
        if (id === 'scarti') return s.pile.scarti.length > 0 && indice === s.pile.scarti.length - 1;
        return posto(id) ? indice === 0 && libera(s, id) : false;
    }
    // "Posare" una carta su un'altra significa eliminarle insieme se sommano 13; un re si elimina da solo
    function puoPosare(s, carte, destinazione) {
        const c = carte[0].carta;
        if (destinazione === 'eliminate') return c.numero === 13;
        const sotto = destinazione === 'scarti' ? s.pile.scarti.at(-1) : (posto(destinazione) && libera(s, destinazione) ? s.pile[destinazione][0] : null);
        return !!sotto && sotto.carta !== c && c.numero + sotto.carta.numero === 13;
    }
    function sposta(s, da, indice, a) {
        if (da === a || !puoPrendere(s, da, indice)) return false;
        const carte = s.pile[da].slice(indice);
        if (!puoPosare(s, carte, a)) return false;
        s.pile.eliminate.push(...s.pile[da].splice(indice));
        if (a !== 'eliminate') s.pile.eliminate.push(s.pile[a].pop());
        s.mosse++;
        return true;
    }
    function clicMazzo(s) {
        if (s.pile.mazzo.length) { const x = s.pile.mazzo.pop(); x.scoperta = true; s.pile.scarti.push(x); }
        else if (s.pile.scarti.length && s.giri < PASSAGGI - 1) { s.pile.mazzo = s.pile.scarti.reverse().map(x => ({ ...x, scoperta: false })); s.pile.scarti = []; s.giri++; }
        else return false;
        s.mosse++;
        return true;
    }
    // Doppio clic su un re: si elimina
    function autoBase(s, id) {
        const pila = s.pile[id];
        if (!pila?.length) return false;
        return sposta(s, id, pila.length - 1, 'eliminate');
    }
    const vinto = s => POSTI.every(p => !s.pile[p.id].length);
    // Partita persa: mazzo finito (passaggi esauriti) e nessuna coppia possibile
    function bloccata(s) {
        if (s.pile.mazzo.length || (s.pile.scarti.length && s.giri < PASSAGGI - 1)) return false;
        const libere = [...POSTI.filter(p => libera(s, p.id)).map(p => p.id), ...(s.pile.scarti.length ? ['scarti'] : [])];
        return !libere.some(a => { const pa = s.pile[a]; const ca = pa.at(-1); return ca.carta.numero === 13 || libere.some(b => b !== a && puoPosare(s, [ca], b)); });
    }
    function disposizione() {
        // Le righe si sovrappongono a metà carta, centrate su 7 colonne
        return [
            ...POSTI.map(p => ({ id: p.id, x: 3 - p.r / 2 + p.i, y: p.r * 0.5, tipo: 'piramide', etichetta: '' })),
            { id: 'mazzo', x: 0, y: 4.6, tipo: 'mazzo', etichetta: '' }, { id: 'scarti', x: 1, y: 4.6, tipo: 'scarti' },
            { id: 'eliminate', x: 6, y: 4.6, tipo: 'base', etichetta: 'K' }
        ];
    }
    return { POSTI, PASSAGGI, colonne: 7, crea, libera, puoPrendere, puoPosare, sposta, clicMazzo, autoBase, vinto, bloccata, disposizione, toccoSingolo: false };
})();
if (typeof module !== 'undefined') module.exports = Piramide;
