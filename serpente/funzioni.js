// Logica del Serpente (genere "Snake", ADR 0009), senza pagina (si prova con: node serpente/test-serpente.js).
// La griglia è LATO × LATO caselle. Un serpente è { corpo: [{ x, y }, ...] (la testa è il primo), direzione,
// prossima (direzione scelta per il passo successivo), vivo, punti, daCrescere }.

const LATO = 20;
const DIREZIONI = { su: { x: 0, y: -1 }, giu: { x: 0, y: 1 }, sinistra: { x: -1, y: 0 }, destra: { x: 1, y: 0 } };
const OPPOSTE = { su: 'giu', giu: 'su', sinistra: 'destra', destra: 'sinistra' };

function creaSerpente(x, y, direzione, lunghezza = 3) {
    const d = DIREZIONI[direzione];
    const corpo = [];
    for (let k = 0; k < lunghezza; k++) corpo.push({ x: x - d.x * k, y: y - d.y * k });
    return { corpo, direzione, prossima: direzione, vivo: true, punti: 0, daCrescere: 0 };
}

// Uno o due serpenti: a 2 giocatori partono da lati opposti
function statoIniziale(giocatori = 1, casuale = Math.random) {
    const serpenti = giocatori === 1
        ? [creaSerpente(5, 10, 'destra')]
        : [creaSerpente(5, 5, 'destra'), creaSerpente(14, 14, 'sinistra')];
    const stato = { serpenti, cibo: null, finita: false };
    stato.cibo = nuovoCibo(stato, casuale);
    return stato;
}

function occupata(stato, x, y) {
    return stato.serpenti.some(s => s.vivo && s.corpo.some(p => p.x === x && p.y === y));
}

// Il cibo compare in una casella libera a caso (null se la griglia è piena)
function nuovoCibo(stato, casuale = Math.random) {
    const libere = [];
    for (let y = 0; y < LATO; y++) for (let x = 0; x < LATO; x++) if (!occupata(stato, x, y)) libere.push({ x, y });
    return libere.length ? libere[Math.floor(casuale() * libere.length)] : null;
}

// Cambia direzione, ma non si può tornare indietro su sé stessi (l'inversione viene ignorata)
function gira(serpente, direzione) {
    if (!DIREZIONI[direzione] || direzione === OPPOSTE[serpente.direzione]) return false;
    serpente.prossima = direzione;
    return true;
}

// Un passo per tutti i serpenti vivi. Eventi: 'mangia' e 'morto' con indice, oppure 'grigliaPiena'.
// Riempire la griglia conclude la partita con i serpenti rimasti vivi; dopo la fine lo stato non cambia.
// Regole: si muore contro il muro, contro il proprio corpo o contro l'altro serpente; due teste nella stessa casella muoiono entrambe.
function passo(stato, casuale = Math.random) {
    const eventi = [];
    if (stato.finita) return eventi;
    const vivi = stato.serpenti.map((s, i) => ({ s, i })).filter(x => x.s.vivo);
    // nuove teste
    const teste = vivi.map(({ s }) => {
        s.direzione = s.prossima;
        const d = DIREZIONI[s.direzione];
        return { x: s.corpo[0].x + d.x, y: s.corpo[0].y + d.y };
    });
    // la coda si sposta (e libera la sua casella) solo se il serpente non deve crescere
    const corpiDopo = vivi.map(({ s }, k) => {
        const mangia = stato.cibo && teste[k].x === stato.cibo.x && teste[k].y === stato.cibo.y;
        const cresce = s.daCrescere > 0 || mangia;
        return [teste[k], ...(cresce ? s.corpo : s.corpo.slice(0, -1))];
    });
    const morti = new Set();
    vivi.forEach(({ s, i }, k) => {
        const t = teste[k];
        if (t.x < 0 || t.y < 0 || t.x >= LATO || t.y >= LATO) { morti.add(i); return; }
        corpiDopo.forEach((corpo, j) => {
            const parti = j === k ? corpo.slice(1) : corpo;
            if (parti.some(p => p.x === t.x && p.y === t.y)) morti.add(i);
        });
    });
    vivi.forEach(({ s, i }, k) => {
        if (morti.has(i)) {
            s.vivo = false;
            eventi.push({ tipo: 'morto', serpente: i });
            return;
        }
        const mangia = stato.cibo && teste[k].x === stato.cibo.x && teste[k].y === stato.cibo.y;
        if (s.daCrescere > 0) s.daCrescere--;
        s.corpo = corpiDopo[k];
        if (mangia) {
            s.punti++;
            s.daCrescere += 1; // dopo aver mangiato cresce di 2 in tutto (1 subito, 1 al passo dopo)
            eventi.push({ tipo: 'mangia', serpente: i });
        }
    });
    if (eventi.some(e => e.tipo === 'mangia')) stato.cibo = nuovoCibo(stato, casuale);
    const ancoraVivi = stato.serpenti.filter(s => s.vivo).length;
    const piena = stato.cibo === null && ancoraVivi > 0 && nuovoCibo(stato, casuale) === null;
    stato.finita = piena || (stato.serpenti.length === 1 ? ancoraVivi === 0 : ancoraVivi <= 1);
    if (piena) eventi.push({ tipo: 'grigliaPiena' });
    return eventi;
}

// Millisecondi tra un passo e l'altro: più punti, più veloce (fino a un minimo)
function intervallo(punti) {
    return Math.max(70, 160 - punti * 4);
}

if (typeof module !== 'undefined') {
    module.exports = { LATO, DIREZIONI, OPPOSTE, creaSerpente, statoIniziale, occupata, nuovoCibo, gira, passo, intervallo };
}
