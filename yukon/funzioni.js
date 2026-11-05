// Yukon: come il Klondike ma senza mazzo; si sposta qualunque carta scoperta con tutte quelle sopra,
// anche se non sono in ordine. Si prova con: node js/test-solitari-2.js
// Pile: 'f0'..'f3' (basi), 'c0'..'c6' (colonne: la prima 1 carta, le altre i coperte + 5 scoperte).
const Yukon = (() => {
    const M = typeof module !== 'undefined' ? require('../js/mazzo') : Mazzo;
    const BASI = ['f0', 'f1', 'f2', 'f3'], COLONNE = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6'];
    const rosso = c => c.seme === 'hearts' || c.seme === 'diamonds';
    function crea(opzioni = {}, casuale = Math.random) {
        const mazzo = M.mescola(M.francese(), casuale), pile = {};
        COLONNE.forEach((id, i) => {
            const coperte = i, totale = i === 0 ? 1 : i + 5;
            pile[id] = mazzo.splice(0, totale).map((carta, k) => ({ carta, scoperta: k >= coperte }));
        });
        BASI.forEach(id => { pile[id] = []; });
        return { gioco: 'yukon', pile, mosse: 0 };
    }
    const cima = (s, id) => s.pile[id].at(-1);
    function puoPrendere(s, id, i) {
        const pila = s.pile[id];
        if (!pila || i < 0 || i >= pila.length) return false;
        if (BASI.includes(id)) return i === pila.length - 1;
        return pila[i].scoperta; // qualunque carta scoperta, con quelle sopra
    }
    function puoPosare(s, carte, destinazione) {
        const sopra = cima(s, destinazione), prima = carte[0].carta;
        if (BASI.includes(destinazione)) return carte.length === 1 && (sopra ? sopra.carta.seme === prima.seme && prima.numero === sopra.carta.numero + 1 : prima.numero === 1);
        if (COLONNE.includes(destinazione)) return sopra ? sopra.scoperta && rosso(sopra.carta) !== rosso(prima) && prima.numero === sopra.carta.numero - 1 : prima.numero === 13;
        return false;
    }
    function sposta(s, da, i, a) {
        if (da === a || !puoPrendere(s, da, i)) return false;
        const carte = s.pile[da].slice(i);
        if (!puoPosare(s, carte, a)) return false;
        s.pile[da].splice(i); s.pile[a].push(...carte);
        const nuova = cima(s, da); if (nuova) nuova.scoperta = true;
        s.mosse++;
        return true;
    }
    function autoBase(s, id) {
        const pila = s.pile[id];
        if (!pila?.length || BASI.includes(id)) return false;
        return BASI.some(b => sposta(s, id, pila.length - 1, b));
    }
    const vinto = s => BASI.every(b => s.pile[b].length === 13);
    const completabile = s => COLONNE.every(c => s.pile[c].every(x => x.scoperta) && s.pile[c].every((x, i, a) => i === 0 || x.carta.numero < a[i - 1].carta.numero));
    function completa(s) {
        let mossa = true;
        while (mossa) { mossa = false; for (const c of COLONNE) if (autoBase(s, c)) { mossa = true; break; } }
        return vinto(s);
    }
    function disposizione() {
        return [...BASI.map((id, i) => ({ id, x: 3 + i, y: 0, tipo: 'base', etichetta: 'A' })),
            ...COLONNE.map((id, i) => ({ id, x: i, y: 1.25, tipo: 'colonna', etichetta: 'K' }))];
    }
    return { BASI, COLONNE, colonne: 7, crea, puoPrendere, puoPosare, sposta, autoBase, vinto, completabile, completa, disposizione };
})();
if (typeof module !== 'undefined') module.exports = Yukon;
