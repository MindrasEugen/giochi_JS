// TriPeaks: tre picchi di 28 carte; si porta sulla base una carta libera di valore una in più o una in meno
// (re e asso si toccano: dopo il re l'asso e viceversa). Le carte si girano quando sono libere.
// Si prova con: node js/test-solitari-2.js
// Pile: 't0'..'t27' (righe da 3, 6, 9 e 10 carte), 'mazzo', 'base'.
const TriPeaks = (() => {
    const M = typeof module !== 'undefined' ? require('../js/mazzo') : Mazzo;
    // Posti: riga, posizione nella riga, coordinate e carte che lo coprono (della riga sotto)
    const POSTI = [];
    for (let p = 0; p < 3; p++) POSTI.push({ r: 0, x: 3 * p + 1.5, y: 0, copre: null, p, q: 0 });
    for (let p = 0; p < 3; p++) for (let q = 0; q < 2; q++) POSTI.push({ r: 1, x: 3 * p + q + 1, y: 0.5, p, q });
    for (let j = 0; j < 9; j++) POSTI.push({ r: 2, x: j + 0.5, y: 1, j });
    for (let j = 0; j < 10; j++) POSTI.push({ r: 3, x: j, y: 1.5, j });
    POSTI.forEach((posto, n) => { posto.id = `t${n}`; });
    const indice = (r, k) => POSTI.findIndex(x => x.r === r && (r === 0 ? x.p === k : r === 1 ? x.p * 2 + x.q === k : x.j === k));
    // Chi copre chi: riga 0 coperta da 2 carte della riga 1, riga 1 da 2 della riga 2, riga 2 da 2 della riga 3
    POSTI.forEach(x => {
        if (x.r === 0) x.coperta = [indice(1, 2 * x.p), indice(1, 2 * x.p + 1)];
        else if (x.r === 1) x.coperta = [indice(2, 3 * x.p + x.q), indice(2, 3 * x.p + x.q + 1)];
        else if (x.r === 2) x.coperta = [indice(3, x.j), indice(3, x.j + 1)];
        else x.coperta = [];
    });
    const posto = id => POSTI.find(x => x.id === id);
    function crea(opzioni = {}, casuale = Math.random) {
        const mazzo = M.mescola(M.francese(), casuale), pile = {};
        POSTI.forEach(x => { pile[x.id] = [{ carta: mazzo.shift(), scoperta: x.r === 3 }]; });
        pile.base = [{ carta: mazzo.shift(), scoperta: true }];
        pile.mazzo = mazzo.map(carta => ({ carta, scoperta: false })); // 23 carte
        return { gioco: 'tripeaks', pile, mosse: 0, serie: 0, migliorSerie: 0 };
    }
    const libera = (s, id) => { const x = posto(id); return !!x && s.pile[id].length > 0 && x.coperta.every(n => !s.pile[POSTI[n].id].length); };
    const vicine = (a, b) => Math.abs(a - b) === 1 || Math.abs(a - b) === 12; // anche re-asso
    const puoPrendere = (s, id, i) => i === 0 && libera(s, id);
    const puoPosare = (s, carte, destinazione) => destinazione === 'base' && carte.length === 1 && vicine(carte[0].carta.numero, s.pile.base.at(-1).carta.numero);
    function sposta(s, da, i, a) {
        if (!puoPrendere(s, da, i) || !puoPosare(s, s.pile[da], a)) return false;
        s.pile.base.push(s.pile[da].pop()); s.mosse++;
        s.serie++; s.migliorSerie = Math.max(s.migliorSerie, s.serie);
        POSTI.forEach(x => { if (libera(s, x.id)) s.pile[x.id][0].scoperta = true; }); // si girano le carte liberate
        return true;
    }
    function clicMazzo(s) {
        if (!s.pile.mazzo.length) return false;
        const x = s.pile.mazzo.pop(); x.scoperta = true; s.pile.base.push(x); s.mosse++; s.serie = 0;
        return true;
    }
    const autoBase = (s, id) => sposta(s, id, 0, 'base');
    const vinto = s => POSTI.every(x => !s.pile[x.id].length);
    const rimaste = s => POSTI.filter(x => s.pile[x.id].length).length;
    const bloccata = s => !s.pile.mazzo.length && !POSTI.some(x => libera(s, x.id) && puoPosare(s, s.pile[x.id], 'base'));
    function disposizione() {
        return [...POSTI.map(x => ({ id: x.id, x: x.x, y: x.y, tipo: 'piramide', etichetta: '' })),
            { id: 'mazzo', x: 3, y: 3, tipo: 'mazzo', etichetta: '' }, { id: 'base', x: 5, y: 3, tipo: 'base', etichetta: '' }];
    }
    return { POSTI, colonne: 10, crea, libera, puoPrendere, puoPosare, sposta, clicMazzo, autoBase, vinto, rimaste, bloccata, disposizione, toccoSingolo: true };
})();
if (typeof module !== 'undefined') module.exports = TriPeaks;
