// Golf: 7 colonne da 5 carte scoperte; si porta sulla base la carta in cima a una colonna se vale una in più
// o una in meno di quella sulla base (senza girare: niente asso sul re né re sull'asso).
// Dal mazzo si gira una carta sulla base quando non ci sono mosse. Si prova con: node golf/test-golf.js
// Pile: 'g0'..'g6', 'mazzo', 'base'.
const Golf = (() => {
    const M = typeof module !== 'undefined' ? require('../js/mazzo') : Mazzo;
    const COLONNE = Array.from({ length: 7 }, (_, i) => `g${i}`);
    function crea(opzioni = {}, casuale = Math.random) {
        const mazzo = M.mescola(M.francese(), casuale), pile = {};
        COLONNE.forEach(id => { pile[id] = mazzo.splice(0, 5).map(carta => ({ carta, scoperta: true })); });
        pile.base = [{ carta: mazzo.shift(), scoperta: true }];
        pile.mazzo = mazzo.map(carta => ({ carta, scoperta: false })); // 16 carte
        return { gioco: 'golf', pile, mosse: 0 };
    }
    const puoPrendere = (s, id, indice) => COLONNE.includes(id) && s.pile[id].length > 0 && indice === s.pile[id].length - 1;
    function puoPosare(s, carte, destinazione) {
        if (destinazione !== 'base' || carte.length !== 1) return false;
        return Math.abs(carte[0].carta.numero - s.pile.base.at(-1).carta.numero) === 1;
    }
    function sposta(s, da, indice, a) {
        if (!puoPrendere(s, da, indice) || !puoPosare(s, s.pile[da].slice(indice), a)) return false;
        s.pile.base.push(s.pile[da].pop()); s.mosse++;
        return true;
    }
    function clicMazzo(s) {
        if (!s.pile.mazzo.length) return false;
        const x = s.pile.mazzo.pop(); x.scoperta = true; s.pile.base.push(x); s.mosse++;
        return true;
    }
    // Basta un tocco per mandare la carta sulla base
    const autoBase = (s, id) => sposta(s, id, s.pile[id]?.length - 1, 'base');
    const vinto = s => COLONNE.every(c => !s.pile[c].length);
    const rimaste = s => COLONNE.reduce((n, c) => n + s.pile[c].length, 0);
    const bloccata = s => !s.pile.mazzo.length && !COLONNE.some(c => s.pile[c].length && puoPosare(s, [s.pile[c].at(-1)], 'base'));
    function disposizione() {
        return [
            ...COLONNE.map((id, i) => ({ id, x: i, y: 0, tipo: 'colonna', etichetta: '' })),
            { id: 'mazzo', x: 2, y: 3.4, tipo: 'mazzo', etichetta: '' }, { id: 'base', x: 4, y: 3.4, tipo: 'base', etichetta: '' }
        ];
    }
    return { COLONNE, colonne: 7, crea, puoPrendere, puoPosare, sposta, clicMazzo, autoBase, vinto, rimaste, bloccata, disposizione, toccoSingolo: true };
})();
if (typeof module !== 'undefined') module.exports = Golf;
