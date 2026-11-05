// FreeCell: tutte le carte scoperte, 4 celle libere e 4 basi. Ogni partita viene controllata da un risolutore:
// si danno solo partite risolvibili. Si prova con: node freecell/test-freecell.js
// Pile: 'k0'..'k3' (celle), 'f0'..'f3' (basi), 't0'..'t7' (colonne).
const FreeCell = (() => {
    const M = typeof module !== 'undefined' ? require('../js/mazzo') : Mazzo;
    const CELLE = ['k0', 'k1', 'k2', 'k3'], BASI = ['f0', 'f1', 'f2', 'f3'], COLONNE = ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'];
    const rosso = c => c.seme === 'hearts' || c.seme === 'diamonds';
    function distribuisci(casuale) {
        const mazzo = M.mescola(M.francese(), casuale), pile = {};
        COLONNE.forEach(id => { pile[id] = []; });
        mazzo.forEach((carta, i) => pile[COLONNE[i % 8]].push({ carta, scoperta: true }));
        [...CELLE, ...BASI].forEach(id => { pile[id] = []; });
        return pile;
    }
    // Si rimescola finché il risolutore trova una soluzione (quasi tutte le partite lo sono)
    function crea(opzioni = {}, casuale = Math.random) {
        for (let tentativo = 0; tentativo < 20; tentativo++) {
            const s = { gioco: 'freecell', pile: distribuisci(casuale), mosse: 0 };
            if (opzioni.senzaControllo || risolvi(s, 150000)) return s;
        }
        return { gioco: 'freecell', pile: distribuisci(casuale), mosse: 0 };
    }
    const cima = (s, id) => s.pile[id].at(-1);
    const libere = (s, escludi) => ({ celle: CELLE.filter(c => !s.pile[c].length).length, colonne: COLONNE.filter(c => c !== escludi && !s.pile[c].length).length });
    const sequenzaValida = carte => carte.every((x, i) => i === 0 || (rosso(x.carta) !== rosso(carte[i - 1].carta) && x.carta.numero === carte[i - 1].carta.numero - 1));
    // Quante carte si spostano insieme: (celle libere + 1) × 2^(colonne vuote), senza contare la destinazione
    const capacita = (s, destinazione) => { const l = libere(s, destinazione); return (l.celle + 1) * 2 ** l.colonne; };
    function puoPrendere(s, id, indice) {
        const pila = s.pile[id];
        if (!pila || indice < 0 || indice >= pila.length || BASI.includes(id)) return false;
        if (CELLE.includes(id)) return indice === pila.length - 1;
        return sequenzaValida(pila.slice(indice));
    }
    function puoPosare(s, carte, destinazione) {
        const sopra = cima(s, destinazione), prima = carte[0].carta;
        if (CELLE.includes(destinazione)) return carte.length === 1 && !sopra;
        if (BASI.includes(destinazione)) return carte.length === 1 && (sopra ? sopra.carta.seme === prima.seme && prima.numero === sopra.carta.numero + 1 : prima.numero === 1);
        if (!COLONNE.includes(destinazione) || carte.length > capacita(s, destinazione)) return false;
        return !sopra || (rosso(sopra.carta) !== rosso(prima) && prima.numero === sopra.carta.numero - 1);
    }
    function sposta(s, da, indice, a) {
        if (da === a || !puoPrendere(s, da, indice)) return false;
        const carte = s.pile[da].slice(indice);
        if (!puoPosare(s, carte, a)) return false;
        s.pile[da].splice(indice); s.pile[a].push(...carte); s.mosse++;
        return true;
    }
    function autoBase(s, id) {
        const pila = s.pile[id];
        if (!pila?.length || BASI.includes(id)) return false;
        return BASI.some(b => sposta(s, id, pila.length - 1, b));
    }
    const vinto = s => BASI.every(b => s.pile[b].length === 13);
    const completabile = s => COLONNE.every(c => sequenzaValida(s.pile[c]) && s.pile[c].every((x, i, a) => i === 0 || x.carta.numero < a[i - 1].carta.numero));
    function completa(s) {
        let mossa = true;
        while (mossa) { mossa = false; for (const c of [...COLONNE, ...CELLE]) if (autoBase(s, c)) { mossa = true; break; } }
        return vinto(s);
    }
    // --- Risolutore: ricerca "prima il migliore" con mosse di una carta e spostamenti sicuri alle basi ---
    function risolvi(stato, limite = 150000) {
        const conv = s => ({ celle: CELLE.map(c => s.pile[c][0]?.carta || null), basi: Object.fromEntries(['hearts', 'diamonds', 'clubs', 'spades'].map(seme => [seme, (BASI.map(b => s.pile[b]).find(p => p.length && p[0].carta.seme === seme) || []).length])), colonne: COLONNE.map(c => s.pile[c].map(x => x.carta)) });
        const chiave = n => `${n.colonne.map(col => col.map(c => c.seme[0] + c.numero).join('.')).sort().join('|')}#${n.celle.map(c => c ? c.seme[0] + c.numero : '').sort().join(',')}`;
        const sicura = (n, c) => { // una carta va alla base senza rischi se le due di colore opposto più basse sono già sopra
            if (n.basi[c.seme] !== c.numero - 1) return false;
            if (c.numero <= 2) return true;
            const opposti = rosso(c) ? ['clubs', 'spades'] : ['hearts', 'diamonds'];
            return opposti.every(o => n.basi[o] >= c.numero - 1);
        };
        function autoplay(n) {
            let mossa = true;
            while (mossa) {
                mossa = false;
                n.celle.forEach((c, i) => { if (c && sicura(n, c)) { n.basi[c.seme]++; n.celle[i] = null; mossa = true; } });
                n.colonne.forEach(col => { const c = col.at(-1); if (c && sicura(n, c)) { n.basi[c.seme]++; col.pop(); mossa = true; } });
            }
            return n;
        }
        const copia = n => ({ celle: [...n.celle], basi: { ...n.basi }, colonne: n.colonne.map(c => [...c]) });
        const puo = (c, col) => !col.length || (rosso(col.at(-1)) !== rosso(c) && col.at(-1).numero === c.numero + 1);
        const punteggio = n => {
            const fuori = 52 - Object.values(n.basi).reduce((a, b) => a + b, 0);
            const celle = n.celle.filter(Boolean).length;
            // carte sotto le prossime da mandare alla base: più sono sepolte, peggio è
            let sepolte = 0;
            n.colonne.forEach(col => col.forEach((c, i) => { if (c.numero === n.basi[c.seme] + 1) sepolte += col.length - 1 - i; }));
            return fuori * 2 + celle + sepolte;
        };
        const inizio = autoplay(conv(stato));
        const coda = [[punteggio(inizio), inizio]], visti = new Set([chiave(inizio)]);
        let nodi = 0;
        while (coda.length && nodi < limite) {
            // estrae il nodo con il punteggio migliore (coda semplice: va bene per queste dimensioni)
            let migliore = 0;
            for (let i = 1; i < coda.length; i++) if (coda[i][0] < coda[migliore][0]) migliore = i;
            const [, n] = coda.splice(migliore, 1)[0]; nodi++;
            if (Object.values(n.basi).every(v => v === 13)) return true;
            const figli = [];
            const aggiungi = m => { autoplay(m); const k = chiave(m); if (!visti.has(k)) { visti.add(k); figli.push(m); } };
            n.colonne.forEach((col, i) => {
                const c = col.at(-1); if (!c) return;
                if (n.basi[c.seme] === c.numero - 1) { const m = copia(n); m.colonne[i].pop(); m.basi[c.seme]++; aggiungi(m); }
                n.colonne.forEach((altra, j) => { if (i !== j && puo(c, altra) && !(altra.length === 0 && col.length === 1)) { const m = copia(n); m.colonne[j].push(m.colonne[i].pop()); aggiungi(m); } });
                const vuota = n.celle.indexOf(null);
                if (vuota >= 0) { const m = copia(n); m.celle[vuota] = m.colonne[i].pop(); aggiungi(m); }
            });
            n.celle.forEach((c, i) => {
                if (!c) return;
                if (n.basi[c.seme] === c.numero - 1) { const m = copia(n); m.celle[i] = null; m.basi[c.seme]++; aggiungi(m); }
                n.colonne.forEach((col, j) => { if (puo(c, col)) { const m = copia(n); m.colonne[j].push(c); m.celle[i] = null; aggiungi(m); } });
            });
            figli.forEach(m => coda.push([punteggio(m), m]));
            if (coda.length > 60000) { coda.sort((a, b) => a[0] - b[0]); coda.length = 30000; } // tiene la memoria sotto controllo
        }
        return false;
    }
    function disposizione() {
        return [
            ...CELLE.map((id, i) => ({ id, x: i, y: 0, tipo: 'cella', etichetta: '' })),
            ...BASI.map((id, i) => ({ id, x: 4 + i, y: 0, tipo: 'base', etichetta: 'A' })),
            ...COLONNE.map((id, i) => ({ id, x: i, y: 1.25, tipo: 'colonna', etichetta: '' }))
        ];
    }
    return { CELLE, BASI, COLONNE, colonne: 8, crea, capacita, puoPrendere, puoPosare, sposta, autoBase, vinto, completabile, completa, risolvi, disposizione };
})();
if (typeof module !== 'undefined') module.exports = FreeCell;
