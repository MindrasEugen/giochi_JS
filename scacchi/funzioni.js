// Logica degli scacchi, senza pagina (si prova con: node scacchi/test-scacchi.js).
// La scacchiera è un array di 64 caselle: indice 0 = a8 (in alto a sinistra), 63 = h1 (in basso a destra).
// Pezzi: P pedone, N cavallo, B alfiere, R torre, Q donna, K re; maiuscole bianco, minuscole nero; '' casella vuota.
// Lo stato è { scacchiera, tocca ('w' | 'b'), arrocco: { K, Q, k, q }, enPassant (indice o -1), mezzeMosse, numeroMossa, storia }.
// "storia" contiene le chiavi delle posizioni già viste (per la patta per tripla ripetizione).

const COLONNE = 'abcdefgh';

function colore(pezzo) {
    if (!pezzo) return null;
    return pezzo === pezzo.toUpperCase() ? 'w' : 'b';
}

function avversario(c) {
    return c === 'w' ? 'b' : 'w';
}

function riga(i) { return Math.floor(i / 8); }
function colonna(i) { return i % 8; }
function nomeCasa(i) { return `${COLONNE[colonna(i)]}${8 - riga(i)}`; }
function casaDaNome(nome) { return (8 - Number(nome[1])) * 8 + COLONNE.indexOf(nome[0]); }

// Posizione da una stringa FEN (la notazione standard delle posizioni)
function daFEN(fen) {
    const [disposizione, tocca, arrocco, ep, mezze, numero] = fen.trim().split(/\s+/);
    const scacchiera = [];
    for (const ch of disposizione.replace(/\//g, '')) {
        if (/\d/.test(ch)) for (let k = 0; k < Number(ch); k++) scacchiera.push('');
        else scacchiera.push(ch);
    }
    const stato = {
        scacchiera,
        tocca,
        arrocco: { K: arrocco.includes('K'), Q: arrocco.includes('Q'), k: arrocco.includes('k'), q: arrocco.includes('q') },
        enPassant: ep === '-' ? -1 : casaDaNome(ep),
        mezzeMosse: Number(mezze || 0),
        numeroMossa: Number(numero || 1),
        storia: []
    };
    stato.storia = [chiave(stato)];
    return stato;
}

const FEN_INIZIALE = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function statoIniziale() {
    return daFEN(FEN_INIZIALE);
}

// Chiave della posizione per la ripetizione: pezzi, chi muove, arrocchi ed en passant
function chiave(stato) {
    const ar = ['K', 'Q', 'k', 'q'].filter(k => stato.arrocco[k]).join('') || '-';
    return `${stato.scacchiera.map(p => p || '.').join('')} ${stato.tocca} ${ar} ${stato.enPassant}`;
}

const CAVALLO = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const RE = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const DIAGONALI = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const LINEE = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function dentro(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
}

// La casella i è attaccata da un pezzo del colore "da"?
function attaccata(s, i, da) {
    const r = riga(i), c = colonna(i);
    // pedoni: un pedone bianco attacca in diagonale verso l'alto, quindi viene da sotto
    const dir = da === 'w' ? 1 : -1;
    const pedone = da === 'w' ? 'P' : 'p';
    for (const dc of [-1, 1]) {
        const rr = r + dir, cc = c + dc;
        if (dentro(rr, cc) && s[rr * 8 + cc] === pedone) return true;
    }
    const cavallo = da === 'w' ? 'N' : 'n';
    for (const [dr, dc] of CAVALLO) {
        const rr = r + dr, cc = c + dc;
        if (dentro(rr, cc) && s[rr * 8 + cc] === cavallo) return true;
    }
    const re = da === 'w' ? 'K' : 'k';
    for (const [dr, dc] of RE) {
        const rr = r + dr, cc = c + dc;
        if (dentro(rr, cc) && s[rr * 8 + cc] === re) return true;
    }
    const scorre = (direzioni, pezzi) => direzioni.some(([dr, dc]) => {
        let rr = r + dr, cc = c + dc;
        while (dentro(rr, cc)) {
            const p = s[rr * 8 + cc];
            if (p) return colore(p) === da && pezzi.includes(p.toUpperCase());
            rr += dr; cc += dc;
        }
        return false;
    });
    return scorre(DIAGONALI, ['B', 'Q']) || scorre(LINEE, ['R', 'Q']);
}

function casaDelRe(s, c) {
    return s.indexOf(c === 'w' ? 'K' : 'k');
}

function sottoScacco(stato, c = stato.tocca) {
    const re = casaDelRe(stato.scacchiera, c);
    return re !== -1 && attaccata(stato.scacchiera, re, avversario(c));
}

// Mosse "pseudo-legali": rispettano il movimento dei pezzi, ma possono lasciare il proprio re sotto scacco.
// Una mossa è { da, a, promozione, presa, enPassant, arrocco }
function mossePseudo(stato) {
    const s = stato.scacchiera;
    const io = stato.tocca;
    const mosse = [];
    for (let i = 0; i < 64; i++) {
        const p = s[i];
        if (!p || colore(p) !== io) continue;
        const r = riga(i), c = colonna(i);
        const tipo = p.toUpperCase();
        if (tipo === 'P') {
            const dir = io === 'w' ? -1 : 1;
            const inizio = io === 'w' ? 6 : 1;
            const ultima = io === 'w' ? 0 : 7;
            const aggiungi = (a, extra) => {
                if (riga(a) === ultima) {
                    for (const pr of ['Q', 'R', 'B', 'N']) mosse.push({ da: i, a, promozione: io === 'w' ? pr : pr.toLowerCase(), ...extra });
                } else {
                    mosse.push({ da: i, a, ...extra });
                }
            };
            const avanti = (r + dir) * 8 + c;
            if (dentro(r + dir, c) && !s[avanti]) {
                aggiungi(avanti, {});
                const doppio = (r + 2 * dir) * 8 + c;
                if (r === inizio && !s[doppio]) mosse.push({ da: i, a: doppio, doppio: true });
            }
            for (const dc of [-1, 1]) {
                const rr = r + dir, cc = c + dc;
                if (!dentro(rr, cc)) continue;
                const a = rr * 8 + cc;
                if (s[a] && colore(s[a]) !== io) aggiungi(a, { presa: s[a] });
                else if (a === stato.enPassant) mosse.push({ da: i, a, presa: io === 'w' ? 'p' : 'P', enPassant: true });
            }
        } else if (tipo === 'N' || tipo === 'K') {
            for (const [dr, dc] of tipo === 'N' ? CAVALLO : RE) {
                const rr = r + dr, cc = c + dc;
                if (!dentro(rr, cc)) continue;
                const a = rr * 8 + cc;
                if (!s[a] || colore(s[a]) !== io) mosse.push({ da: i, a, presa: s[a] || undefined });
            }
            if (tipo === 'K') {
                // arrocco: re e torre mai mossi (diritti), caselle in mezzo libere, il re non è sotto scacco e non passa su case attaccate
                const nemico = avversario(io);
                const base = io === 'w' ? 60 : 4;
                if (i === base && !attaccata(s, base, nemico)) {
                    const corto = io === 'w' ? 'K' : 'k';
                    const lungo = io === 'w' ? 'Q' : 'q';
                    const torre = io === 'w' ? 'R' : 'r';
                    if (stato.arrocco[corto] && s[base + 3] === torre && !s[base + 1] && !s[base + 2] &&
                        !attaccata(s, base + 1, nemico) && !attaccata(s, base + 2, nemico)) {
                        mosse.push({ da: i, a: base + 2, arrocco: 'corto' });
                    }
                    if (stato.arrocco[lungo] && s[base - 4] === torre && !s[base - 1] && !s[base - 2] && !s[base - 3] &&
                        !attaccata(s, base - 1, nemico) && !attaccata(s, base - 2, nemico)) {
                        mosse.push({ da: i, a: base - 2, arrocco: 'lungo' });
                    }
                }
            }
        } else {
            const direzioni = tipo === 'B' ? DIAGONALI : tipo === 'R' ? LINEE : [...DIAGONALI, ...LINEE];
            for (const [dr, dc] of direzioni) {
                let rr = r + dr, cc = c + dc;
                while (dentro(rr, cc)) {
                    const a = rr * 8 + cc;
                    if (!s[a]) {
                        mosse.push({ da: i, a });
                    } else {
                        if (colore(s[a]) !== io) mosse.push({ da: i, a, presa: s[a] });
                        break;
                    }
                    rr += dr; cc += dc;
                }
            }
        }
    }
    return mosse;
}

// Applica una mossa e restituisce il nuovo stato (quello passato non cambia)
function applica(stato, m) {
    const s = [...stato.scacchiera];
    const pezzo = s[m.da];
    const io = stato.tocca;
    s[m.da] = '';
    s[m.a] = m.promozione || pezzo;
    if (m.enPassant) s[m.a + (io === 'w' ? 8 : -8)] = '';
    if (m.arrocco === 'corto') { s[m.a - 1] = s[m.a + 1]; s[m.a + 1] = ''; }
    if (m.arrocco === 'lungo') { s[m.a + 1] = s[m.a - 2]; s[m.a - 2] = ''; }
    const arrocco = { ...stato.arrocco };
    // il re o la torre che si muovono (o la torre catturata) fanno perdere il diritto di arroccare
    if (pezzo === 'K') { arrocco.K = false; arrocco.Q = false; }
    if (pezzo === 'k') { arrocco.k = false; arrocco.q = false; }
    for (const casa of [m.da, m.a]) {
        if (casa === 63) arrocco.K = false;
        if (casa === 56) arrocco.Q = false;
        if (casa === 7) arrocco.k = false;
        if (casa === 0) arrocco.q = false;
    }
    const nuovo = {
        scacchiera: s,
        tocca: avversario(io),
        arrocco,
        enPassant: m.doppio ? (m.da + m.a) / 2 : -1,
        mezzeMosse: pezzo.toUpperCase() === 'P' || m.presa ? 0 : stato.mezzeMosse + 1,
        numeroMossa: stato.numeroMossa + (io === 'b' ? 1 : 0),
        storia: stato.storia
    };
    nuovo.storia = [...stato.storia, chiave(nuovo)];
    return nuovo;
}

// Mosse legali: le pseudo-legali che non lasciano il proprio re sotto scacco
function mosseLegali(stato) {
    return mossePseudo(stato).filter(m => !sottoScacco(applica(stato, m), stato.tocca));
}

// Patta per materiale insufficiente: re contro re, re e un alfiere o un cavallo contro re,
// re e alfiere contro re e alfiere con gli alfieri sullo stesso colore di casa
function materialeInsufficiente(s) {
    const pezzi = s.map((p, i) => ({ p, i })).filter(x => x.p && x.p.toUpperCase() !== 'K');
    if (pezzi.length === 0) return true;
    if (pezzi.length === 1 && ['B', 'N'].includes(pezzi[0].p.toUpperCase())) return true;
    if (pezzi.every(x => x.p.toUpperCase() === 'B')) {
        const coloriCase = new Set(pezzi.map(x => (riga(x.i) + colonna(x.i)) % 2));
        return coloriCase.size === 1;
    }
    return false;
}

// Situazione della partita: { finita, esito: 'scaccomatto' | 'stallo' | 'cinquanta' | 'ripetizione' | 'materiale', vincitore }
function situazione(stato) {
    const mosse = mosseLegali(stato);
    if (mosse.length === 0) {
        return sottoScacco(stato)
            ? { finita: true, esito: 'scaccomatto', vincitore: avversario(stato.tocca) }
            : { finita: true, esito: 'stallo', vincitore: null };
    }
    if (stato.mezzeMosse >= 100) return { finita: true, esito: 'cinquanta', vincitore: null };
    const ultima = stato.storia[stato.storia.length - 1];
    if (stato.storia.filter(k => k === ultima).length >= 3) return { finita: true, esito: 'ripetizione', vincitore: null };
    if (materialeInsufficiente(stato.scacchiera)) return { finita: true, esito: 'materiale', vincitore: null };
    return { finita: false, scacco: sottoScacco(stato) };
}

// Notazione algebrica (es. Nf3, exd5, O-O, e8=Q+, Qxf7#)
function notazione(stato, m, legali = mosseLegali(stato)) {
    const pezzo = stato.scacchiera[m.da];
    const tipo = pezzo.toUpperCase();
    let testo;
    if (m.arrocco) {
        testo = m.arrocco === 'corto' ? 'O-O' : 'O-O-O';
    } else {
        const presa = m.presa ? 'x' : '';
        if (tipo === 'P') {
            testo = `${m.presa ? COLONNE[colonna(m.da)] : ''}${presa}${nomeCasa(m.a)}${m.promozione ? '=' + m.promozione.toUpperCase() : ''}`;
        } else {
            // se due pezzi uguali possono andare nella stessa casa si aggiunge la colonna o la riga di partenza
            const rivali = legali.filter(x => x.a === m.a && x.da !== m.da && stato.scacchiera[x.da] === pezzo);
            let disambigua = '';
            if (rivali.length > 0) {
                const stessaColonna = rivali.some(x => colonna(x.da) === colonna(m.da));
                const stessaRiga = rivali.some(x => riga(x.da) === riga(m.da));
                if (!stessaColonna) disambigua = COLONNE[colonna(m.da)];
                else if (!stessaRiga) disambigua = String(8 - riga(m.da));
                else disambigua = nomeCasa(m.da);
            }
            testo = `${tipo}${disambigua}${presa}${nomeCasa(m.a)}`;
        }
    }
    const dopo = applica(stato, m);
    if (sottoScacco(dopo)) testo += mosseLegali(dopo).length === 0 ? '#' : '+';
    return testo;
}

// Perft: numero di posizioni raggiungibili in "profondita" mezze mosse (per controllare il generatore di mosse)
function perft(stato, profondita) {
    if (profondita === 0) return 1;
    const mosse = mosseLegali(stato);
    if (profondita === 1) return mosse.length;
    let totale = 0;
    for (const m of mosse) totale += perft(applica(stato, m), profondita - 1);
    return totale;
}

// --- Computer ---
const VALORI = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 0 };
// Tabelle di posizione dal punto di vista del bianco (indice 0 = a8): incoraggiano a centralizzare e sviluppare
const TABELLE = {
    P: [0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0],
    N: [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
    B: [-20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20],
    R: [0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0],
    Q: [-20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20],
    K: [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20]
};

// Valutazione dal punto di vista di chi deve muovere
function valuta(stato) {
    let punti = 0;
    stato.scacchiera.forEach((p, i) => {
        if (!p) return;
        const tipo = p.toUpperCase();
        const casa = colore(p) === 'w' ? i : (7 - riga(i)) * 8 + colonna(i); // tabella speculare per il nero
        const v = VALORI[tipo] + TABELLE[tipo][casa];
        punti += colore(p) === 'w' ? v : -v;
    });
    return stato.tocca === 'w' ? punti : -punti;
}

// Prima le prese più vantaggiose (pezzo forte catturato da pezzo debole): la potatura alfa-beta taglia di più
function ordina(stato, mosse) {
    const peso = m => (m.presa ? 10 * VALORI[m.presa.toUpperCase()] - VALORI[stato.scacchiera[m.da].toUpperCase()] : 0) + (m.promozione ? 800 : 0);
    return [...mosse].sort((a, b) => peso(b) - peso(a));
}

// Negamax con potatura alfa-beta (minimax scritto dal punto di vista di chi muove)
function negamax(stato, profondita, alfa, beta) {
    const mosse = mosseLegali(stato);
    if (mosse.length === 0) return sottoScacco(stato) ? -100000 - profondita : 0;
    if (stato.mezzeMosse >= 100) return 0;
    if (profondita === 0) return valuta(stato);
    let migliore = -Infinity;
    for (const m of ordina(stato, mosse)) {
        const v = -negamax(applica(stato, m), profondita - 1, -beta, -alfa);
        if (v > migliore) migliore = v;
        if (v > alfa) alfa = v;
        if (alfa >= beta) break;
    }
    return migliore;
}

const PROFONDITA = { facile: 1, media: 2, difficile: 3 };

function mossaPC(stato, difficolta = 'media', casuale = Math.random) {
    const mosse = mosseLegali(stato);
    if (mosse.length === 0) return null;
    if (difficolta === 'facile' && casuale() < 0.5) {
        return mosse[Math.floor(casuale() * mosse.length)]; // metà delle volte una mossa a caso
    }
    const profondita = PROFONDITA[difficolta] ?? 2;
    let migliorValore = -Infinity;
    let migliori = [];
    for (const m of ordina(stato, mosse)) {
        const v = -negamax(applica(stato, m), profondita - 1, -Infinity, Infinity);
        if (v > migliorValore) { migliorValore = v; migliori = [m]; }
        else if (v === migliorValore) migliori.push(m);
    }
    return migliori[Math.floor(casuale() * migliori.length)];
}

if (typeof module !== 'undefined') {
    module.exports = { FEN_INIZIALE, colore, avversario, nomeCasa, casaDaNome, daFEN, statoIniziale, chiave, attaccata, sottoScacco, mossePseudo, applica, mosseLegali, materialeInsufficiente, situazione, notazione, perft, valuta, mossaPC };
}
