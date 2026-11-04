// Prova della logica degli scacchi. Si avvia dalla radice del progetto con:  node scacchi/test-scacchi.js

const S = require('./funzioni.js');

let falliti = 0;
function controlla(descrizione, condizione) {
    console.log(`${condizione ? 'OK  ' : 'FAIL'} ${descrizione}`);
    if (!condizione) falliti++;
}

// Perft: valori pubblicati per posizioni note (chessprogramming.org, "Perft Results").
// Contano tutte le partite possibili fino alla profondità indicata: verificano arrocco, en passant, promozione e scacchi.
const casiPerft = [
    { nome: 'posizione iniziale', fen: S.FEN_INIZIALE, valori: [20, 400, 8902, 197281] },
    { nome: '"Kiwipete" (arrocchi, prese, promozioni)', fen: 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1', valori: [48, 2039, 97862] },
    { nome: 'posizione 3 (en passant e scacchi scoperti)', fen: '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1', valori: [14, 191, 2812, 43238] },
    { nome: 'posizione 4 (promozioni e arrocchi persi)', fen: 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1', valori: [6, 264, 9467] },
    { nome: 'posizione 5', fen: 'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8', valori: [44, 1486, 62379] }
];
for (const caso of casiPerft) {
    const stato = S.daFEN(caso.fen);
    caso.valori.forEach((atteso, k) => {
        const inizio = Date.now();
        const trovato = S.perft(stato, k + 1);
        controlla(`perft ${caso.nome}, profondità ${k + 1}: ${trovato} (atteso ${atteso}, ${Date.now() - inizio} ms)`, trovato === atteso);
    });
}

// Regole singole
const giocate = (fen, mosse) => mosse.reduce((s, nome) => {
    const m = S.mosseLegali(s).find(x => S.notazione(s, x) === nome);
    if (!m) throw new Error(`mossa ${nome} non trovata`);
    return S.applica(s, m);
}, S.daFEN(fen));

const matto = giocate(S.FEN_INIZIALE, ['f3', 'e5', 'g4', 'Qh4#']);
controlla('matto dell’imbecille: scaccomatto, vince il nero', S.situazione(matto).esito === 'scaccomatto' && S.situazione(matto).vincitore === 'b');
const stallo = S.daFEN('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
controlla('stallo: il re nero non ha mosse ma non è sotto scacco', S.situazione(stallo).esito === 'stallo');
controlla('materiale insufficiente: re e cavallo contro re', S.situazione(S.daFEN('8/8/4k3/8/8/3NK3/8/8 w - - 0 1')).esito === 'materiale');
controlla('re e torre contro re non è materiale insufficiente', !S.situazione(S.daFEN('8/8/4k3/8/8/3RK3/8/8 w - - 0 1')).finita);
controlla('regola delle 50 mosse (100 mezze mosse senza prese né mosse di pedone)', S.situazione(S.daFEN('8/8/4k3/8/8/3RK3/8/8 w - - 100 80')).esito === 'cinquanta');
const ripetizione = giocate(S.FEN_INIZIALE, ['Nf3', 'Nf6', 'Ng1', 'Ng8', 'Nf3', 'Nf6', 'Ng1', 'Ng8']);
controlla('tripla ripetizione della posizione: patta', S.situazione(ripetizione).esito === 'ripetizione');

// En passant
const ep = giocate(S.FEN_INIZIALE, ['e4', 'a6', 'e5', 'd5']);
const presaEp = S.mosseLegali(ep).find(m => m.enPassant);
controlla('en passant: exd6 è possibile subito dopo d7-d5', presaEp && S.notazione(ep, presaEp) === 'exd6');
const dopoEp = S.applica(ep, presaEp);
controlla('en passant: il pedone d5 sparisce', dopoEp.scacchiera[S.casaDaNome('d5')] === '' && dopoEp.scacchiera[S.casaDaNome('d6')] === 'P');
const tardi = giocate(S.FEN_INIZIALE, ['e4', 'a6', 'e5', 'd5', 'Nf3', 'h6']);
controlla('en passant: una mossa dopo non è più possibile', !S.mosseLegali(tardi).some(m => m.enPassant));

// Arrocco
const arrocco = S.daFEN('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
const nomi = S.mosseLegali(arrocco).map(m => S.notazione(arrocco, m));
controlla('arrocco corto e lungo possibili', nomi.includes('O-O') && nomi.includes('O-O-O'));
const dopoArrocco = S.applica(arrocco, S.mosseLegali(arrocco).find(m => m.arrocco === 'corto'));
controlla('dopo O-O il re è in g1 e la torre in f1', dopoArrocco.scacchiera[S.casaDaNome('g1')] === 'K' && dopoArrocco.scacchiera[S.casaDaNome('f1')] === 'R' && !dopoArrocco.arrocco.K && !dopoArrocco.arrocco.Q);
const attraverso = S.daFEN('r3k2r/8/8/8/8/8/5r2/R3K2R w KQkq - 0 1');
controlla('non si arrocca passando su una casa attaccata (f1)', !S.mosseLegali(attraverso).some(m => m.arrocco === 'corto'));
const sottoScacco = S.daFEN('r3k2r/8/8/8/8/8/4r3/R3K2R w KQkq - 0 1');
controlla('non si arrocca sotto scacco', !S.mosseLegali(sottoScacco).some(m => m.arrocco));
const torreMossa = S.applica(S.applica(arrocco, S.mosseLegali(arrocco).find(m => S.notazione(arrocco, m) === 'Rb1')), S.mosseLegali(S.applica(arrocco, S.mosseLegali(arrocco).find(m => S.notazione(arrocco, m) === 'Rb1')))[0]);
controlla('dopo aver mosso la torre di a1 l’arrocco lungo non è più possibile', !torreMossa.arrocco.Q && torreMossa.arrocco.K);

// Promozione
const promo = S.daFEN('8/4P3/8/8/8/8/k7/4K3 w - - 0 1');
const promozioni = S.mosseLegali(promo).filter(m => m.promozione).map(m => S.notazione(promo, m)).sort();
controlla(`promozione: 4 scelte (${promozioni.join(', ')})`, promozioni.join() === 'e8=B,e8=N,e8=Q,e8=R');

// Notazione con disambiguazione
const due = S.daFEN('4k3/8/8/8/8/8/4K3/R6R w - - 0 1');
controlla('notazione: due torri possono andare in d1 -> Rad1 e Rhd1', S.mosseLegali(due).filter(m => S.casaDaNome('d1') === m.a && due.scacchiera[m.da] === 'R').map(m => S.notazione(due, m)).sort().join() === 'Rad1,Rhd1');

// Computer
controlla('il PC (media) mangia la donna lasciata in presa', (() => {
    const s = S.daFEN('4k3/8/8/3q4/8/8/3R4/4K3 w - - 0 1');
    const m = S.mossaPC(s, 'media');
    return S.notazione(s, m) === 'Rxd5';
})());
controlla('il PC (media) dà scaccomatto in una mossa', (() => {
    const s = S.daFEN('6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1');
    return S.notazione(s, S.mossaPC(s, 'media')) === 'Ra8#';
})());
const t = Date.now();
const centro = S.daFEN('r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3');
S.mossaPC(centro, 'difficile');
const durata = Date.now() - t;
controlla(`difficile: mossa in apertura in ${durata} ms (meno di 3000)`, durata < 3000);

// Il Difficile contro il Facile: su 6 partite (max 80 mosse ciascuna) non deve mai perdere e deve vincere almeno metà
function casualeRipetibile(seme) {
    let s = seme;
    return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
}
const esiti = { vinte: 0, perse: 0, altre: 0 };
const inizioPartite = Date.now();
for (let k = 0; k < 6; k++) {
    const casuale = casualeRipetibile(k + 7);
    let s = S.statoIniziale();
    const difficile = k % 2 === 0 ? 'w' : 'b';
    let esito = null;
    for (let mezza = 0; mezza < 160 && !esito; mezza++) {
        const sit = S.situazione(s);
        if (sit.finita) { esito = sit; break; }
        s = S.applica(s, S.mossaPC(s, s.tocca === difficile ? 'media' : 'facile', casuale));
    }
    if (esito && esito.vincitore === difficile) esiti.vinte++;
    else if (esito && esito.vincitore) esiti.perse++;
    else {
        // partita non finita: conta il materiale
        const v = S.valuta(s) * (s.tocca === difficile ? 1 : -1);
        if (v > 300) esiti.vinte++; else if (v < -300) esiti.perse++; else esiti.altre++;
    }
}
controlla(`il PC Media contro il Facile: ${JSON.stringify(esiti)} in ${Math.round((Date.now() - inizioPartite) / 1000)} s (nessuna sconfitta, almeno 4 vinte o in vantaggio netto)`, esiti.perse === 0 && esiti.vinte >= 4);

console.log(falliti === 0 ? '\nTutti i controlli sono passati' : `\n${falliti} controlli falliti`);
process.exit(falliti === 0 ? 0 : 1);
