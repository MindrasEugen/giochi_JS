// Klondike (il solitario classico), pesca 1 o 3. Si prova con: node klondike/test-klondike.js
// Pile: 'mazzo', 'scarti', 'f0'..'f3' (basi, dall'asso al re dello stesso seme), 'c0'..'c6' (colonne).
// Ogni carta in una pila è { carta, scoperta }.
const Klondike = (() => {
    const M = typeof module !== 'undefined' ? require('../js/mazzo') : Mazzo;
    const BASI = ['f0', 'f1', 'f2', 'f3'], COLONNE = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6'];
    const rosso = c => c.seme === 'hearts' || c.seme === 'diamonds';
    function crea(opzioni = {}, casuale = Math.random) {
        const mazzo = M.mescola(M.francese(), casuale), pile = {};
        COLONNE.forEach((id, i) => { pile[id] = mazzo.splice(0, i + 1).map((carta, k) => ({ carta, scoperta: k === i })); });
        BASI.forEach(id => { pile[id] = []; });
        pile.mazzo = mazzo.map(carta => ({ carta, scoperta: false })); pile.scarti = [];
        return { gioco: 'klondike', pesca: opzioni.pesca === 3 ? 3 : 1, pile, mosse: 0, giri: 0 };
    }
    const cima = (s, id) => s.pile[id].at(-1);
    // Una sequenza si sposta se è scoperta, a colori alterni e in ordine decrescente
    function sequenzaValida(carte) {
        return carte.every((x, i) => x.scoperta && (i === 0 || (rosso(x.carta) !== rosso(carte[i - 1].carta) && x.carta.numero === carte[i - 1].carta.numero - 1)));
    }
    function puoPrendere(s, id, indice) {
        const pila = s.pile[id];
        if (!pila || indice < 0 || indice >= pila.length || id === 'mazzo') return false;
        if (id.startsWith('c')) return sequenzaValida(pila.slice(indice));
        return indice === pila.length - 1; // scarti e basi: solo la carta in cima
    }
    function puoPosare(s, carte, destinazione) {
        const sopra = cima(s, destinazione), prima = carte[0].carta;
        if (BASI.includes(destinazione)) return carte.length === 1 && (sopra ? sopra.carta.seme === prima.seme && prima.numero === sopra.carta.numero + 1 : prima.numero === 1);
        if (COLONNE.includes(destinazione)) return sopra ? sopra.scoperta && rosso(sopra.carta) !== rosso(prima) && prima.numero === sopra.carta.numero - 1 : prima.numero === 13;
        return false;
    }
    function sposta(s, da, indice, a) {
        if (da === a || !puoPrendere(s, da, indice)) return false;
        const carte = s.pile[da].slice(indice);
        if (!puoPosare(s, carte, a)) return false;
        s.pile[da].splice(indice); s.pile[a].push(...carte);
        const nuova = cima(s, da);
        if (nuova && COLONNE.includes(da)) nuova.scoperta = true; // si scopre la carta rimasta in cima
        s.mosse++;
        return true;
    }
    // Clic sul mazzo: si girano 1 o 3 carte; a mazzo vuoto gli scarti tornano nel mazzo
    function clicMazzo(s) {
        if (s.pile.mazzo.length) {
            const girate = s.pile.mazzo.splice(-Math.min(s.pesca, s.pile.mazzo.length)).reverse();
            girate.forEach(x => { x.scoperta = true; }); s.pile.scarti.push(...girate);
        } else if (s.pile.scarti.length) {
            s.pile.mazzo = s.pile.scarti.reverse().map(x => ({ ...x, scoperta: false })); s.pile.scarti = []; s.giri++;
        } else return false;
        s.mosse++;
        return true;
    }
    // Doppio clic: la carta in cima va alla base giusta
    function autoBase(s, id) {
        const pila = s.pile[id];
        if (!pila?.length || BASI.includes(id)) return false;
        return BASI.some(b => sposta(s, id, pila.length - 1, b));
    }
    const vinto = s => BASI.every(b => s.pile[b].length === 13);
    // Si può completare da soli quando tutte le carte sono scoperte e il mazzo è finito
    const completabile = s => !s.pile.mazzo.length && !s.pile.scarti.length && COLONNE.every(c => s.pile[c].every(x => x.scoperta));
    function completa(s) {
        let mossa = true;
        while (mossa) { mossa = false; for (const c of [...COLONNE, 'scarti']) if (autoBase(s, c)) { mossa = true; break; } }
        return vinto(s);
    }
    // Disposizione sul tavolo, in unità di carta: x = colonna, y = riga
    function disposizione() {
        return [
            { id: 'mazzo', x: 0, y: 0, tipo: 'mazzo', etichetta: '↺' }, { id: 'scarti', x: 1, y: 0, tipo: 'scarti' },
            ...BASI.map((id, i) => ({ id, x: 3 + i, y: 0, tipo: 'base', etichetta: 'A' })),
            ...COLONNE.map((id, i) => ({ id, x: i, y: 1.25, tipo: 'colonna', etichetta: 'K' }))
        ];
    }
    return { BASI, COLONNE, colonne: 7, crea, puoPrendere, puoPosare, sposta, clicMazzo, autoBase, vinto, completabile, completa, disposizione };
})();
if (typeof module !== 'undefined') module.exports = Klondike;
