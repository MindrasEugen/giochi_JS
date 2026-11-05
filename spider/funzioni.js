// Spider con 1, 2 o 4 semi: due mazzi (104 carte), 10 colonne, 5 distribuzioni dal mazzo.
// Una scala completa dello stesso seme dal re all'asso esce da sola. Si prova con: node spider/test-spider.js
// Pile: 'mazzo', 'fatte' (scale completate), 'c0'..'c9'.
const Spider = (() => {
    const M = typeof module !== 'undefined' ? require('../js/mazzo') : Mazzo;
    const COLONNE = Array.from({ length: 10 }, (_, i) => `c${i}`);
    const SEMI = { 1: ['spades'], 2: ['spades', 'hearts'], 4: ['spades', 'hearts', 'diamonds', 'clubs'] };
    function crea(opzioni = {}, casuale = Math.random) {
        const semi = SEMI[opzioni.semi] || SEMI[1];
        // 104 carte: 8 serie da 13 carte, divise tra i semi scelti
        const carte = [];
        for (let k = 0; k < 8; k++) for (const c of M.francese().filter(x => x.seme === semi[k % semi.length])) carte.push(c);
        const mazzo = M.mescola(carte, casuale), pile = { fatte: [] };
        COLONNE.forEach((id, i) => { const n = i < 4 ? 6 : 5; pile[id] = mazzo.splice(0, n).map((carta, k) => ({ carta, scoperta: k === n - 1 })); });
        pile.mazzo = mazzo.map(carta => ({ carta, scoperta: false })); // 50 carte: 5 distribuzioni da 10
        return { gioco: 'spider', semi: semi.length, pile, mosse: 0 };
    }
    const cima = (s, id) => s.pile[id].at(-1);
    // Si spostano insieme solo carte scoperte dello stesso seme in ordine decrescente
    const sequenzaValida = carte => carte.every((x, i) => x.scoperta && (i === 0 || (x.carta.seme === carte[i - 1].carta.seme && x.carta.numero === carte[i - 1].carta.numero - 1)));
    function puoPrendere(s, id, indice) {
        const pila = s.pile[id];
        if (!pila || !COLONNE.includes(id) || indice < 0 || indice >= pila.length) return false;
        return sequenzaValida(pila.slice(indice));
    }
    // Su una colonna si posa una carta di valore subito inferiore, di qualunque seme; su una colonna vuota qualunque carta
    function puoPosare(s, carte, destinazione) {
        if (!COLONNE.includes(destinazione)) return false;
        const sopra = cima(s, destinazione);
        return !sopra || carte[0].carta.numero === sopra.carta.numero - 1;
    }
    function scopri(s, id) { const c = cima(s, id); if (c) c.scoperta = true; }
    // Re-asso dello stesso seme in fondo alla colonna: esce
    function controllaScala(s, id) {
        const pila = s.pile[id];
        if (pila.length < 13) return false;
        const ultime = pila.slice(-13);
        if (ultime[0].carta.numero !== 13 || !sequenzaValida(ultime)) return false;
        s.pile.fatte.push(...pila.splice(-13)); scopri(s, id);
        return true;
    }
    function sposta(s, da, indice, a) {
        if (da === a || !puoPrendere(s, da, indice)) return false;
        const carte = s.pile[da].slice(indice);
        if (!puoPosare(s, carte, a)) return false;
        s.pile[da].splice(indice); s.pile[a].push(...carte);
        scopri(s, da); controllaScala(s, a); s.mosse++;
        return true;
    }
    // Una carta del mazzo su ogni colonna; non si distribuisce se c'è una colonna vuota
    function clicMazzo(s) {
        if (!s.pile.mazzo.length) return false;
        if (COLONNE.some(c => !s.pile[c].length)) { s.errore = 'Prima di distribuire riempi le colonne vuote.'; return false; }
        COLONNE.forEach(c => { const x = s.pile.mazzo.pop(); x.scoperta = true; s.pile[c].push(x); controllaScala(s, c); });
        s.mosse++; s.errore = '';
        return true;
    }
    // Doppio clic: sposta la sequenza più lunga in cima alla colonna sul posto migliore (meglio se dello stesso seme)
    function autoBase(s, id) {
        const pila = s.pile[id];
        if (!pila?.length || !COLONNE.includes(id)) return false;
        let indice = pila.length - 1;
        while (indice > 0 && puoPrendere(s, id, indice - 1)) indice--;
        const prima = pila[indice].carta;
        const destinazioni = COLONNE.filter(c => c !== id && s.pile[c].length && puoPosare(s, [pila[indice]], c))
            .sort((a, b) => (cima(s, b).carta.seme === prima.seme) - (cima(s, a).carta.seme === prima.seme));
        const vuota = COLONNE.find(c => c !== id && !s.pile[c].length);
        const meta = destinazioni[0] || (indice > 0 ? vuota : null);
        return meta ? sposta(s, id, indice, meta) : false;
    }
    const vinto = s => s.pile.fatte.length === 104;
    function disposizione() {
        return [
            { id: 'mazzo', x: 0, y: 0, tipo: 'mazzo', etichetta: '' }, { id: 'fatte', x: 9, y: 0, tipo: 'fatte', etichetta: '' },
            ...COLONNE.map((id, i) => ({ id, x: i, y: 1.25, tipo: 'colonna', etichetta: '' }))
        ];
    }
    return { COLONNE, colonne: 10, crea, puoPrendere, puoPosare, sposta, clicMazzo, autoBase, vinto, disposizione };
})();
if (typeof module !== 'undefined') module.exports = Spider;
