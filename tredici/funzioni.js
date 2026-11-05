// Le tredici (in inglese "Baker's Dozen"): 13 colonne di 4 carte scoperte, con i re spostati in fondo alla colonna.
// Si sposta solo la carta in cima: su una colonna va una carta di valore subito inferiore, di qualunque seme.
// Le colonne vuote restano vuote. Le basi si riempiono per seme dall'asso al re. Si prova con: node js/test-solitari-2.js
// Pile: 'f0'..'f3', 'c0'..'c12' (disposte su due righe: 7 + 6).
const Tredici = (() => {
    const M = typeof module !== 'undefined' ? require('../js/mazzo') : Mazzo;
    const BASI = ['f0', 'f1', 'f2', 'f3'], COLONNE = Array.from({ length: 13 }, (_, i) => `c${i}`);
    function crea(opzioni = {}, casuale = Math.random) {
        const mazzo = M.mescola(M.francese(), casuale), pile = {};
        COLONNE.forEach(id => {
            const carte = mazzo.splice(0, 4);
            // I re vanno in fondo (sotto le altre carte), così non bloccano niente
            carte.sort((a, b) => (b.numero === 13) - (a.numero === 13));
            pile[id] = carte.map(carta => ({ carta, scoperta: true }));
        });
        BASI.forEach(id => { pile[id] = []; });
        return { gioco: 'tredici', pile, mosse: 0 };
    }
    const cima = (s, id) => s.pile[id].at(-1);
    const puoPrendere = (s, id, i) => COLONNE.includes(id) && s.pile[id].length > 0 && i === s.pile[id].length - 1;
    function puoPosare(s, carte, destinazione) {
        if (carte.length !== 1) return false;
        const sopra = cima(s, destinazione), c = carte[0].carta;
        if (BASI.includes(destinazione)) return sopra ? sopra.carta.seme === c.seme && c.numero === sopra.carta.numero + 1 : c.numero === 1;
        return COLONNE.includes(destinazione) && !!sopra && c.numero === sopra.carta.numero - 1; // niente carte sulle colonne vuote
    }
    function sposta(s, da, i, a) {
        if (da === a || !puoPrendere(s, da, i) || !puoPosare(s, s.pile[da].slice(i), a)) return false;
        s.pile[a].push(s.pile[da].pop()); s.mosse++;
        return true;
    }
    const autoBase = (s, id) => s.pile[id]?.length ? BASI.some(b => sposta(s, id, s.pile[id].length - 1, b)) : false;
    const vinto = s => BASI.every(b => s.pile[b].length === 13);
    // Completabile quando ogni colonna è in ordine decrescente: le carte possono uscire tutte
    const completabile = s => COLONNE.every(c => s.pile[c].every((x, i, a) => i === 0 || x.carta.numero < a[i - 1].carta.numero));
    function completa(s) {
        let mossa = true;
        while (mossa) { mossa = false; for (const c of COLONNE) if (autoBase(s, c)) { mossa = true; break; } }
        return vinto(s);
    }
    function disposizione() {
        return [...BASI.map((id, i) => ({ id, x: 1.5 + i, y: 0, tipo: 'base', etichetta: 'A' })),
            // seconda riga sotto la prima: il ventaglio di una colonna non supera 1,5 carte (ventaglioMassimo)
            ...COLONNE.map((id, i) => ({ id, x: i < 7 ? i : i - 7 + 0.5, y: i < 7 ? 1.2 : 3.9, tipo: 'colonna', etichetta: '' }))];
    }
    return { BASI, COLONNE, colonne: 7, ventaglioMassimo: 1.5, crea, puoPrendere, puoPosare, sposta, autoBase, vinto, completabile, completa, disposizione };
})();
if (typeof module !== 'undefined') module.exports = Tredici;
