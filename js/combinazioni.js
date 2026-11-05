// Combinazioni dei giochi della famiglia del ramino (Scala 40, Ramino, Burraco), con due mazzi francesi e jolly.
// Una carta ha anche un "id" unico, perché con due mazzi esistono due carte uguali.
// Regole configurabili:
//   matta(c): la carta è sempre una matta (il jolly; nel Burraco anche il 2, la pinella, quando non è al suo posto)
//   forseNaturale(c): la matta può anche valere come carta normale (la pinella come 2 del suo seme)
//   maxMatte: matte ammesse in una combinazione · trisSemiDiversi: nel tris i semi devono essere tutti diversi
//   trisMax: carte massime in un tris (4 in Scala 40, illimitate nel Burraco) · vietaTrisDi: valori che non formano tris (il 2 nel Burraco)
// Si prova con: node js/test-combinazioni.js
const Combinazioni = (() => {
    const M = typeof module !== 'undefined' ? require('./mazzo') : Mazzo;
    const JOLLY = { tipo: 'francese', seme: 'jolly', valore: 'jolly', numero: 0, jolly: true };
    function mazzo(mazzi = 2, jolly = 4) {
        let id = 0;
        const carte = [];
        for (let m = 0; m < mazzi; m++) for (const c of M.francese()) carte.push({ ...c, id: id++ });
        for (let j = 0; j < jolly; j++) carte.push({ ...JOLLY, id: id++ });
        return carte;
    }
    const nome = c => c.jolly ? 'jolly' : M.nome(c);
    const REGOLE_SCALA40 = { matta: c => !!c.jolly, forseNaturale: () => false, maxMatte: 1, trisSemiDiversi: true, trisMax: 4 };
    // Prova a leggere le carte come tris; restituisce null se non è valido
    function comeTris(carte, regole, matte) {
        const naturali = carte.filter(c => !matte.includes(c));
        if (carte.length < 3 || carte.length > regole.trisMax || naturali.length < 2) return null;
        if (!naturali.every(c => c.numero === naturali[0].numero)) return null;
        if (regole.trisSemiDiversi && new Set(naturali.map(c => c.seme)).size !== naturali.length) return null;
        const numero = naturali[0].numero;
        if (regole.vietaTrisDi?.includes(numero)) return null;
        return { tipo: 'tris', numero, carte: [...naturali, ...matte].map(c => ({ carta: c, valore: numero === 1 ? 14 : numero, matta: matte.includes(c) })) };
    }
    // Prova a leggere le carte come scala dello stesso seme (asso basso o alto, mai in mezzo)
    function comeScala(carte, regole, matte) {
        const naturali = carte.filter(c => !matte.includes(c));
        if (carte.length < 3 || carte.length > 13 || naturali.length < 2) return null;
        const seme = naturali[0].seme;
        if (!naturali.every(c => c.seme === seme)) return null;
        for (const assoAlto of [false, true]) {
            const valori = naturali.map(c => c.numero === 1 && assoAlto ? 14 : c.numero).sort((a, b) => a - b);
            if (new Set(valori).size !== valori.length) continue;
            const span = valori.at(-1) - valori[0] + 1, buchi = span - valori.length;
            if (buchi > matte.length || span > carte.length) continue;
            // Le matte avanzate allungano la scala: prima verso l'alto, poi verso il basso
            let basso = valori[0], alto = valori.at(-1), extra = matte.length - buchi;
            while (extra > 0 && alto < 14 && !(alto === 13 && valori[0] === 1)) { alto++; extra--; }
            while (extra > 0 && basso > 1) { basso--; extra--; }
            if (extra > 0 || alto - basso + 1 > 13) continue;
            const libere = [...matte], ordinate = [];
            for (let v = basso; v <= alto; v++) {
                const naturale = naturali.find(c => (c.numero === 1 && assoAlto ? 14 : c.numero) === v);
                ordinate.push(naturale ? { carta: naturale, valore: v, matta: false } : { carta: libere.shift(), valore: v, matta: true });
            }
            return { tipo: 'scala', seme, carte: ordinate };
        }
        return null;
    }
    // Analizza un gruppo di carte; la pinella (forseNaturale) viene provata sia come carta normale sia come matta
    function analizza(carte, regole = REGOLE_SCALA40) {
        const incerte = carte.filter(c => regole.matta(c) && regole.forseNaturale(c));
        const sicure = carte.filter(c => regole.matta(c) && !regole.forseNaturale(c));
        // Prima si prova con le pinelle come carte normali (bit a 1), poi via via come matte
        for (let maschera = (1 << incerte.length) - 1; maschera >= 0; maschera--) {
            const matte = [...sicure, ...incerte.filter((_, i) => !(maschera >> i & 1))];
            if (matte.length > regole.maxMatte) continue;
            const risultato = comeScala(carte, regole, matte) || comeTris(carte, regole, matte);
            if (risultato) return risultato;
        }
        return null;
    }
    // Punti di una combinazione calata (Scala 40 e Ramino): carte numerate al loro valore, figure 10,
    // asso 1 se basso e 11 se alto o in un tris; il jolly vale la carta che sostituisce
    function puntiCombinazione(combinazione) {
        return combinazione.carte.reduce((n, { valore }) => n + (valore === 14 ? 11 : Math.min(valore, 10)), 0);
    }
    // Valore di una carta rimasta in mano: asso 11, figure 10, jolly 25
    const puntiInMano = c => c.jolly ? 25 : c.numero === 1 ? 11 : Math.min(c.numero, 10);
    // Si può aggiungere una carta a una combinazione già sul tavolo?
    function attacca(combinazione, carta, regole = REGOLE_SCALA40) {
        return analizza([...combinazione.carte.map(x => x.carta), carta], regole);
    }
    // Tutte le combinazioni possibili con le carte di una mano (al massimo maxMatte matte ciascuna)
    function candidate(mano, regole = REGOLE_SCALA40) {
        // Le matte che possono anche essere carte normali (la pinella) compaiono in entrambi i ruoli
        const matte = mano.filter(c => regole.matta(c));
        const normali = mano.filter(c => !regole.matta(c) || regole.forseNaturale(c));
        const risultati = [], visti = new Set();
        const aggiungi = carte => {
            const chiave = carte.map(c => c.id).sort((a, b) => a - b).join(',');
            if (visti.has(chiave)) return;
            const analisi = analizza(carte, regole);
            if (analisi) { visti.add(chiave); risultati.push({ carte, analisi, punti: puntiCombinazione(analisi) }); }
        };
        const conMatta = gruppo => {
            aggiungi(gruppo);
            if (regole.maxMatte > 0) { const m = matte.find(x => !gruppo.includes(x)); if (m) aggiungi([...gruppo, m]); }
        };
        // Tris: carte dello stesso valore (una per seme se richiesto)
        const perValore = {};
        normali.forEach(c => (perValore[c.numero] ||= []).push(c));
        for (const gruppo of Object.values(perValore)) {
            const scelte = regole.trisSemiDiversi ? Object.values(Object.fromEntries(gruppo.map(c => [c.seme, c]))) : gruppo;
            const sottoinsiemi = k => { const r = []; (function cerca(da, acc) { if (acc.length === k) { r.push(acc); return; } for (let i = da; i < scelte.length; i++) cerca(i + 1, [...acc, scelte[i]]); })(0, []); return r; };
            for (let k = 2; k <= Math.min(scelte.length, regole.trisMax); k++) sottoinsiemi(k).forEach(conMatta);
        }
        // Scale: tratti consecutivi dello stesso seme, con al massimo un buco riempito da una matta
        const perSeme = {};
        normali.forEach(c => (perSeme[c.seme] ||= []).push(c));
        for (const carteSeme of Object.values(perSeme)) {
            for (const assoAlto of [false, true]) {
                const perV = new Map();
                carteSeme.forEach(c => { const v = c.numero === 1 && assoAlto ? 14 : c.numero; if (!perV.has(v)) perV.set(v, c); });
                const valori = [...perV.keys()].sort((a, b) => a - b);
                for (let i = 0; i < valori.length; i++) for (let j = i + 1; j < valori.length; j++) {
                    const tratto = valori.slice(i, j + 1);
                    if (tratto.at(-1) - tratto[0] + 1 - tratto.length > 1) break;
                    conMatta(tratto.map(v => perV.get(v)));
                }
            }
        }
        return risultati;
    }
    // Il gruppo di combinazioni disgiunte che vale di più (per il PC e per i controlli di apertura)
    function migliori(mano, regole = REGOLE_SCALA40, obbligatoria = null) {
        const lista = candidate(mano, regole).sort((a, b) => b.punti - a.punti);
        let meglio = { combinazioni: [], punti: 0, carte: 0 };
        const tempo = Date.now();
        (function cerca(da, scelte, usate, punti, carte) {
            const ok = !obbligatoria || usate.has(obbligatoria.id);
            if (ok && (punti > meglio.punti || (punti === meglio.punti && carte > meglio.carte))) meglio = { combinazioni: scelte, punti, carte };
            if (Date.now() - tempo > 150) return; // limite di sicurezza per mani molto grandi
            for (let i = da; i < lista.length; i++) {
                const c = lista[i];
                if (c.carte.some(x => usate.has(x.id))) continue;
                const nuove = new Set(usate); c.carte.forEach(x => nuove.add(x.id));
                cerca(i + 1, [...scelte, c], nuove, punti + c.punti, carte + c.carte.length);
            }
        })(0, [], new Set(), 0, 0);
        return meglio;
    }
    return { JOLLY, REGOLE_SCALA40, mazzo, nome, analizza, puntiCombinazione, puntiInMano, attacca, candidate, migliori };
})();
if (typeof module !== 'undefined') module.exports = Combinazioni;
