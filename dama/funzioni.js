// Logica della Dama italiana, senza pagina (si prova con: node dama/test-dama.js).
// La scacchiera è un array di 64 caselle (8 × 8, riga 0 in alto); si gioca solo sulle caselle scure,
// quelle con (riga + colonna) pari: così la casella d'angolo scura è a destra di ciascun giocatore.
// Valori: '' vuota, 'b' pedina bianca, 'B' dama bianca, 'n' pedina nera, 'N' dama nera.
// Il bianco sta in basso (righe 5–7), muove verso l'alto e comincia per primo.

const LATO = 8;

function indice(riga, colonna) {
    return riga * LATO + colonna;
}

function scura(riga, colonna) {
    return (riga + colonna) % 2 === 0;
}

function colore(pezzo) {
    if (pezzo === 'b' || pezzo === 'B') return 'bianco';
    if (pezzo === 'n' || pezzo === 'N') return 'nero';
    return null;
}

function eDama(pezzo) {
    return pezzo === 'B' || pezzo === 'N';
}

function avversario(giocatore) {
    return giocatore === 'bianco' ? 'nero' : 'bianco';
}

function scacchieraIniziale() {
    const s = new Array(64).fill('');
    for (let r = 0; r < LATO; r++) {
        for (let c = 0; c < LATO; c++) {
            if (!scura(r, c)) continue;
            if (r <= 2) s[indice(r, c)] = 'n';
            if (r >= 5) s[indice(r, c)] = 'b';
        }
    }
    return s;
}

// Direzioni diagonali in cui un pezzo può muovere: la pedina solo in avanti, la dama in tutte e quattro
function direzioni(pezzo) {
    const avanti = colore(pezzo) === 'bianco' ? -1 : 1;
    if (eDama(pezzo)) return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    return [[avanti, -1], [avanti, 1]];
}

function dentro(r, c) {
    return r >= 0 && r < LATO && c >= 0 && c < LATO;
}

function rigaPromozione(giocatore) {
    return giocatore === 'bianco' ? 0 : LATO - 1;
}

// Tutte le sequenze di presa che partono dalla casella "da".
// Regole: la pedina mangia solo in avanti e non può mangiare la dama; la dama mangia in tutte le direzioni;
// un pezzo non si mangia due volte; i pezzi mangiati restano sulla scacchiera fino alla fine della mossa;
// una pedina che arriva in fondo durante la presa diventa dama e la mossa finisce lì.
function sequenzeDiPresa(s, da) {
    const pezzo = s[da];
    const giocatore = colore(pezzo);
    const risultati = [];
    function esplora(posizione, percorso, catture) {
        const r = Math.floor(posizione / LATO);
        const c = posizione % LATO;
        let continua = false;
        for (const [dr, dc] of direzioni(pezzo)) {
            const rm = r + dr, cm = c + dc;       // casella del pezzo da mangiare
            const ra = r + 2 * dr, ca = c + 2 * dc; // casella di arrivo
            if (!dentro(ra, ca)) continue;
            const mezzo = indice(rm, cm);
            const arrivo = indice(ra, ca);
            const preda = s[mezzo];
            if (colore(preda) !== avversario(giocatore) || catture.includes(mezzo)) continue;
            if (!eDama(pezzo) && eDama(preda)) continue;
            if (s[arrivo] !== '' && arrivo !== da) continue;
            continua = true;
            const nuovoPercorso = [...percorso, arrivo];
            const nuoveCatture = [...catture, mezzo];
            if (!eDama(pezzo) && ra === rigaPromozione(giocatore)) {
                risultati.push({ percorso: nuovoPercorso, catture: nuoveCatture });
            } else {
                esplora(arrivo, nuovoPercorso, nuoveCatture);
            }
        }
        if (!continua && catture.length > 0) {
            risultati.push({ percorso, catture });
        }
    }
    esplora(da, [da], []);
    return risultati;
}

// Confronto tra due prese secondo le regole italiane (numero positivo se "a" è da preferire)
function confrontaPrese(s, a, b) {
    if (a.catture.length !== b.catture.length) return a.catture.length - b.catture.length;
    const aDama = eDama(s[a.percorso[0]]) ? 1 : 0;
    const bDama = eDama(s[b.percorso[0]]) ? 1 : 0;
    if (aDama !== bDama) return aDama - bDama;
    const dameA = a.catture.filter(i => eDama(s[i])).length;
    const dameB = b.catture.filter(i => eDama(s[i])).length;
    if (dameA !== dameB) return dameA - dameB;
    const primaA = a.catture.findIndex(i => eDama(s[i]));
    const primaB = b.catture.findIndex(i => eDama(s[i]));
    if (primaA !== primaB) {
        if (primaA === -1) return -1;
        if (primaB === -1) return 1;
        return primaB - primaA; // meglio la presa che incontra prima una dama
    }
    return 0;
}

// Tutte le mosse legali del giocatore: { da, a, percorso, catture }.
// Se si può mangiare bisogna farlo, scegliendo tra le prese migliori secondo le priorità.
function mosseLegali(s, giocatore) {
    const prese = [];
    const semplici = [];
    for (let i = 0; i < 64; i++) {
        if (colore(s[i]) !== giocatore) continue;
        for (const seq of sequenzeDiPresa(s, i)) {
            prese.push({ da: i, a: seq.percorso[seq.percorso.length - 1], percorso: seq.percorso, catture: seq.catture });
        }
        const r = Math.floor(i / LATO), c = i % LATO;
        for (const [dr, dc] of direzioni(s[i])) {
            if (dentro(r + dr, c + dc) && s[indice(r + dr, c + dc)] === '') {
                semplici.push({ da: i, a: indice(r + dr, c + dc), percorso: [i, indice(r + dr, c + dc)], catture: [] });
            }
        }
    }
    if (prese.length === 0) return semplici;
    let migliori = [prese[0]];
    for (const p of prese.slice(1)) {
        const confronto = confrontaPrese(s, p, migliori[0]);
        if (confronto > 0) migliori = [p];
        else if (confronto === 0) migliori.push(p);
    }
    return migliori;
}

// Applica una mossa e restituisce la nuova scacchiera (quella passata non cambia)
function applica(s, mossa) {
    const nuova = [...s];
    let pezzo = nuova[mossa.da];
    nuova[mossa.da] = '';
    for (const i of mossa.catture) nuova[i] = '';
    const rigaArrivo = Math.floor(mossa.a / LATO);
    if (!eDama(pezzo) && rigaArrivo === rigaPromozione(colore(pezzo))) {
        pezzo = pezzo.toUpperCase();
    }
    nuova[mossa.a] = pezzo;
    return nuova;
}

function conta(s, giocatore) {
    const pezzi = s.filter(p => colore(p) === giocatore);
    return { pedine: pezzi.filter(p => !eDama(p)).length, dame: pezzi.filter(eDama).length, totale: pezzi.length };
}

// Chi deve muovere e non ha mosse (o pezzi) ha perso
function vincitore(s, tocca) {
    return mosseLegali(s, tocca).length === 0 ? avversario(tocca) : null;
}

// Valutazione per il PC: materiale (la dama vale circa due pedine e mezzo), avanzamento delle pedine e centro
function valuta(s, giocatore) {
    let punteggio = 0;
    for (let i = 0; i < 64; i++) {
        const p = s[i];
        if (!p) continue;
        const r = Math.floor(i / LATO), c = i % LATO;
        let valore = eDama(p) ? 250 : 100;
        if (!eDama(p)) {
            valore += 4 * (colore(p) === 'bianco' ? 7 - r : r);   // più avanti, meglio
        }
        if (c >= 2 && c <= 5 && r >= 2 && r <= 5) valore += 5;   // centro
        punteggio += colore(p) === giocatore ? valore : -valore;
    }
    return punteggio;
}

function minimax(s, profondita, alfa, beta, tocca, giocatore) {
    const mosse = mosseLegali(s, tocca);
    if (mosse.length === 0) {
        return tocca === giocatore ? -100000 - profondita : 100000 + profondita;
    }
    if (profondita === 0) return valuta(s, giocatore);
    const massimizza = tocca === giocatore;
    let migliore = massimizza ? -Infinity : Infinity;
    for (const m of mosse) {
        const v = minimax(applica(s, m), profondita - 1, alfa, beta, avversario(tocca), giocatore);
        if (massimizza) { migliore = Math.max(migliore, v); alfa = Math.max(alfa, v); }
        else { migliore = Math.min(migliore, v); beta = Math.min(beta, v); }
        if (alfa >= beta) break;
    }
    return migliore;
}

const PROFONDITA = { facile: 0, media: 2, difficile: 5 };

// Mossa del PC: facile a caso, media e difficile con minimax (2 o 5 mosse in anticipo)
function mossaPC(s, giocatore, difficolta = 'media', casuale = Math.random) {
    const mosse = mosseLegali(s, giocatore);
    if (mosse.length === 0) return null;
    const profondita = PROFONDITA[difficolta] ?? 2;
    if (profondita === 0) return mosse[Math.floor(casuale() * mosse.length)];
    let migliorValore = -Infinity;
    let migliori = [];
    for (const m of mosse) {
        const v = minimax(applica(s, m), profondita - 1, -Infinity, Infinity, avversario(giocatore), giocatore);
        if (v > migliorValore) { migliorValore = v; migliori = [m]; }
        else if (v === migliorValore) migliori.push(m);
    }
    // a parità di valore sceglie a caso, così le partite non sono tutte uguali
    return migliori[Math.floor(casuale() * migliori.length)];
}

if (typeof module !== 'undefined') {
    module.exports = { LATO, indice, scura, colore, eDama, avversario, scacchieraIniziale, sequenzeDiPresa, mosseLegali, applica, conta, vincitore, valuta, mossaPC };
}
