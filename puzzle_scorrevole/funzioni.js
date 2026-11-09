// Logica del Puzzle scorrevole (Tappa 35), senza DOM: la usano main.js e i test.
// La griglia è un array di n×n numeri: il numero k è il tassello che, a puzzle risolto, sta nella posizione k
// (da sinistra a destra, dall'alto in basso). Il numero n×n−1 è lo spazio vuoto, in basso a destra a puzzle risolto.
// Le funzioni che usano il caso ricevono il generatore (per esempio Math.random): i test passano un generatore fisso.

const LIVELLI = {
    facile: { lato: 3, mescolate: 80 },
    medio: { lato: 4, mescolate: 200 },
    difficile: { lato: 5, mescolate: 400 }
};

const MAX_SUGGERIMENTI = 3;

// Immagini in puzzle_scorrevole/immagini/ (il browser non può leggere una cartella: l'elenco sta qui)
const IMMAGINI = [
    { file: 'lago.svg', nome: 'Lago di montagna al tramonto' },
    { file: 'faro.svg', nome: 'Faro sul mare' },
    { file: 'mongolfiere.svg', nome: 'Mongolfiere sulle colline' },
    { file: 'barriera.svg', nome: 'Pesci nella barriera corallina' },
    { file: 'citta.svg', nome: 'Città di notte' },
    { file: 'bosco.svg', nome: 'Bosco in autunno' },
    // aggiunte dall'utente
    { file: '01-montagne-al-tramonto.svg', nome: 'Montagne al tramonto' },
    { file: '02-foresta-nella-nebbia.svg', nome: 'Foresta nella nebbia' },
    { file: '03-dune-del-deserto.svg', nome: 'Dune del deserto' },
    { file: '04-isole-tropicali.svg', nome: 'Isole tropicali' },
    { file: '05-aurora-boreale.svg', nome: 'Aurora boreale' },
    { file: '06-campi-di-lavanda.svg', nome: 'Campi di lavanda' },
    { file: '07-canyon-rosso.svg', nome: 'Canyon rosso' },
    { file: '08-colline-toscane.svg', nome: 'Colline toscane' },
    { file: '09-scogliere-al-tramonto.svg', nome: 'Scogliere al tramonto' },
    { file: '10-villaggio-alpino.svg', nome: 'Villaggio alpino innevato' },
    { file: '11-cascata-nella-giungla.svg', nome: 'Cascata nella giungla' },
    { file: '12-paesaggio-vulcanico.svg', nome: 'Paesaggio vulcanico' }
];

const latoDi = griglia => Math.round(Math.sqrt(griglia.length));
const vuotoDi = griglia => griglia.indexOf(griglia.length - 1);

function risolta(lato) {
    return Array.from({ length: lato * lato }, (_, i) => i);
}

function vinta(griglia) {
    return griglia.every((valore, i) => valore === i);
}

// Posizioni vicine (sopra, sotto, sinistra, destra) di una posizione
function vicini(lato, posizione) {
    const r = Math.floor(posizione / lato), c = posizione % lato;
    const elenco = [];
    if (r > 0) elenco.push(posizione - lato);
    if (r < lato - 1) elenco.push(posizione + lato);
    if (c > 0) elenco.push(posizione - 1);
    if (c < lato - 1) elenco.push(posizione + 1);
    return elenco;
}

// Posizioni dei tasselli che possono scivolare nello spazio vuoto
function mobili(griglia) {
    return vicini(latoDi(griglia), vuotoDi(griglia));
}

// Sposta nello spazio vuoto il tassello che sta in "posizione"; null se non è vicino allo spazio vuoto
function muovi(griglia, posizione) {
    const vuoto = vuotoDi(griglia);
    if (!vicini(latoDi(griglia), vuoto).includes(posizione)) return null;
    const nuova = [...griglia];
    nuova[vuoto] = griglia[posizione];
    nuova[posizione] = griglia[vuoto];
    return nuova;
}

// Tasto freccia → posizione del tassello da muovere: la freccia indica dove va il tassello
// (freccia su: sale il tassello che sta sotto lo spazio vuoto). null se da quel lato non c'è un tassello.
function posizioneDaFreccia(griglia, tasto) {
    const lato = latoDi(griglia), vuoto = vuotoDi(griglia);
    const r = Math.floor(vuoto / lato), c = vuoto % lato;
    if (tasto === 'ArrowUp') return r < lato - 1 ? vuoto + lato : null;
    if (tasto === 'ArrowDown') return r > 0 ? vuoto - lato : null;
    if (tasto === 'ArrowLeft') return c < lato - 1 ? vuoto + 1 : null;
    if (tasto === 'ArrowRight') return c > 0 ? vuoto - 1 : null;
    return null;
}

// Mescolamento: dal puzzle risolto, mosse legali a caso senza annullare subito l'ultima.
// Restituisce anche la storia delle posizioni attraversate (serve al suggerimento di riserva).
function mescola(lato, mosse, caso) {
    for (;;) {
        let griglia = risolta(lato);
        const storia = [chiave(griglia)];
        let precedente = -1;
        for (let k = 0; k < mosse; k++) {
            const vuoto = vuotoDi(griglia);
            const scelte = vicini(lato, vuoto).filter(p => p !== precedente);
            const scelta = scelte[Math.floor(caso() * scelte.length)];
            griglia = muovi(griglia, scelta);
            precedente = vuoto; // il tassello mosso ora sta dove era lo spazio vuoto
            storia.push(chiave(griglia));
        }
        if (!vinta(griglia)) return { griglia, storia };
    }
}

// Immagine a caso, diversa dall'ultima quando ce n'è più di una
function scegliImmagine(elenco, ultima, caso) {
    const scelte = elenco.length > 1 ? elenco.filter(immagine => immagine.file !== ultima) : elenco;
    return scelte[Math.floor(caso() * scelte.length)];
}

const chiave = griglia => griglia.map(v => String.fromCharCode(65 + v)).join('');

// Stima delle mosse che mancano: distanza di Manhattan più i conflitti lineari
// (due tasselli nella loro riga o colonna giusta ma in ordine invertito costano almeno 2 mosse in più).
// Non supera mai il numero vero di mosse, quindi la ricerca esatta resta esatta.
function stima(griglia) {
    const lato = latoDi(griglia), vuoto = griglia.length - 1;
    let totale = 0;
    for (let i = 0; i < griglia.length; i++) {
        const v = griglia[i];
        if (v === vuoto) continue;
        totale += Math.abs(Math.floor(i / lato) - Math.floor(v / lato)) + Math.abs((i % lato) - (v % lato));
    }
    for (let linea = 0; linea < lato; linea++) {
        totale += 2 * conflitti(lato, k => linea * lato + k, v => Math.floor(v / lato) === linea, v => v % lato, griglia);
        totale += 2 * conflitti(lato, k => k * lato + linea, v => v % lato === linea, v => Math.floor(v / lato), griglia);
    }
    return totale;
}

// Conflitti in una riga o colonna: quanti tasselli togliere perché gli altri siano in ordine
function conflitti(lato, posizione, appartiene, meta, griglia) {
    const mete = [];
    for (let k = 0; k < lato; k++) {
        const v = griglia[posizione(k)];
        if (v !== griglia.length - 1 && appartiene(v)) mete.push(meta(v));
    }
    if (mete.length < 2) return 0;
    // sequenza crescente più lunga: chi ne resta fuori deve uscire dalla linea
    const migliori = [];
    for (let i = 0; i < mete.length; i++) {
        migliori[i] = 1;
        for (let j = 0; j < i; j++) if (mete[j] < mete[i]) migliori[i] = Math.max(migliori[i], migliori[j] + 1);
    }
    return mete.length - Math.max(...migliori);
}

// Ricerca esatta (IDA*): prima mossa di una soluzione più corta possibile. Adatta al 3×3.
function primaMossaEsatta(griglia, vietata = -1) {
    if (vinta(griglia)) return null;
    const g = [...griglia], lato = latoDi(griglia);
    let soglia = stima(g), primaMossa = null;
    function cerca(vuoto, passi, precedente, prima) {
        const f = passi + stima(g);
        if (f > soglia) return f;
        if (vinta(g)) { primaMossa = prima; return -1; }
        let minimo = Infinity;
        for (const p of vicini(lato, vuoto)) {
            if (p === precedente || (passi === 0 && p === vietata)) continue;
            [g[vuoto], g[p]] = [g[p], g[vuoto]];
            const esito = cerca(p, passi + 1, vuoto, passi === 0 ? p : prima);
            [g[vuoto], g[p]] = [g[p], g[vuoto]];
            if (esito === -1) return -1;
            minimo = Math.min(minimo, esito);
        }
        return minimo;
    }
    for (;;) {
        const esito = cerca(vuotoDi(g), 0, -1, null);
        if (esito === -1) return primaMossa;
        if (esito === Infinity) return null;
        soglia = esito;
    }
}

// Ricerca veloce (A* pesato) per 4×4 e 5×5: trova una soluzione, non sempre la più corta.
// Si ferma dopo "limite" posizioni esaminate e in quel caso restituisce null.
function primaMossaVeloce(griglia, vietata = -1, limite = 60000, peso = 3) {
    if (vinta(griglia)) return null;
    const lato = latoDi(griglia);
    const visti = new Map();
    const coda = new Coda();
    const inizio = chiave(griglia);
    visti.set(inizio, 0);
    for (const p of vicini(lato, vuotoDi(griglia))) {
        if (p === vietata) continue;
        const figlia = muovi(griglia, p), k = chiave(figlia);
        if (visti.has(k)) continue;
        visti.set(k, 1);
        coda.aggiungi({ griglia: figlia, passi: 1, prima: p }, 1 + peso * stima(figlia));
    }
    let esaminate = 0;
    while (coda.lunghezza && esaminate < limite) {
        const nodo = coda.togli();
        esaminate++;
        if (vinta(nodo.griglia)) return nodo.prima;
        for (const p of vicini(lato, vuotoDi(nodo.griglia))) {
            const figlia = muovi(nodo.griglia, p), k = chiave(figlia);
            const passi = nodo.passi + 1;
            if (visti.has(k) && visti.get(k) <= passi) continue;
            visti.set(k, passi);
            coda.aggiungi({ griglia: figlia, passi, prima: nodo.prima }, passi + peso * stima(figlia));
        }
    }
    return null;
}

// Riserva sempre valida: si ripercorre all'indietro la storia (mescolamento e mosse del giocatore),
// saltando i giri a vuoto, fino al puzzle risolto. Restituisce la posizione del tassello da muovere.
function primaMossaDaStoria(griglia, storia) {
    const attuale = chiave(griglia);
    const indice = storia.indexOf(attuale); // prima volta in cui si è passati di qui
    if (indice <= 0) return null;
    const meta = storia[indice - 1];
    return mobili(griglia).find(p => chiave(muovi(griglia, p)) === meta) ?? null;
}

// Suggerimento: posizione del tassello da muovere per avvicinarsi alla soluzione.
// ultimo = posizione in cui è arrivato il tassello mosso per ultimo: su 4×4 e 5×5 non si consiglia di rimetterlo indietro.
function suggerimento(griglia, { ultimo = -1, storia = [] } = {}) {
    if (vinta(griglia)) return null;
    // 3×3: sempre la mossa della soluzione più corta (rimette indietro l'ultimo tassello solo se era una mossa sbagliata)
    if (latoDi(griglia) === 3) return primaMossaEsatta(griglia);
    // 5×5: stima pesata di più, per restare veloci anche sul telefono (soluzioni un po' più lunghe)
    const [limite, peso] = latoDi(griglia) === 4 ? [60000, 3] : [30000, 5];
    return primaMossaVeloce(griglia, ultimo, limite, peso) ?? primaMossaDaStoria(griglia, storia) ?? primaMossaVeloce(griglia, -1, limite, peso);
}

// Coda con priorità (heap binario): esce per primo il valore più basso
class Coda {
    constructor() { this.elementi = []; }
    get lunghezza() { return this.elementi.length; }
    aggiungi(dato, priorita) {
        const e = this.elementi;
        e.push({ dato, priorita });
        let i = e.length - 1;
        while (i > 0) {
            const padre = (i - 1) >> 1;
            if (e[padre].priorita <= e[i].priorita) break;
            [e[padre], e[i]] = [e[i], e[padre]];
            i = padre;
        }
    }
    togli() {
        const e = this.elementi, primo = e[0], ultimo = e.pop();
        if (e.length) {
            e[0] = ultimo;
            let i = 0;
            for (;;) {
                const s = 2 * i + 1, d = s + 1;
                let minore = i;
                if (s < e.length && e[s].priorita < e[minore].priorita) minore = s;
                if (d < e.length && e[d].priorita < e[minore].priorita) minore = d;
                if (minore === i) break;
                [e[minore], e[i]] = [e[i], e[minore]];
                i = minore;
            }
        }
        return primo.dato;
    }
}

function formattaTempo(totale) {
    return `${Math.floor(totale / 60)}:${String(totale % 60).padStart(2, '0')}`;
}

const Puzzle = {
    LIVELLI, MAX_SUGGERIMENTI, IMMAGINI, risolta, vinta, vicini, mobili, muovi, posizioneDaFreccia, mescola,
    scegliImmagine, chiave, stima, primaMossaEsatta, primaMossaVeloce, primaMossaDaStoria, suggerimento, formattaTempo
};

if (typeof module !== 'undefined') {
    module.exports = Puzzle;
}
