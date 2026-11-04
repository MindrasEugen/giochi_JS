
const contenitore = document.querySelector('#contenitore_gioco');
const scacchieraEl = document.querySelector('#scacchiera');
const messaggi = document.querySelector('#messaggi');
const selectModalita = document.querySelector('#modalitaGioco');
const difficolta = document.querySelector('#difficolta');
const pulsanteNomi = document.querySelector('#nomiGiocatori');
const pannelloPromozione = document.querySelector('#promozione');
const elencoMosse = document.querySelector('#mosse');

const COLORE_PC = 'b';
const NOMI_COLORI = { w: 'bianco', b: 'nero' };
// Simboli dei pezzi (sempre la versione piena; il colore lo dà il CSS). ︎ chiede la versione "testo", non emoji
const SIMBOLI = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' };
const NOMI_PEZZI = { K: 're', Q: 'donna', R: 'torre', B: 'alfiere', N: 'cavallo', P: 'pedone' };
const LETTERE_ITALIANE = { K: 'R', Q: 'D', R: 'T', B: 'A', N: 'C' };

let stato = statoIniziale();
let storiaStati = [];   // stati precedenti, per "Annulla mossa"
let mosseScritte = [];  // notazione delle mosse giocate
let selezionata = null;
let mosseValide = [];
let ultimaMossa = null;
let inSospeso = null;   // mosse di promozione in attesa della scelta del pezzo
let finita = false;
let pcPensa = false;
let timerPC;
let girata = false;
let dueGiocatori = false;
let nomi = Giocatori.leggiNomi();

function simbolo(pezzo) {
    return `${SIMBOLI[pezzo.toUpperCase()]}︎`;
}

// Notazione italiana: K→R (re), Q→D (donna), R→T (torre), B→A (alfiere), N→C (cavallo)
function inItaliano(testo) {
    return testo.replace(/^[KQRBN]/, l => LETTERE_ITALIANE[l]).replace(/=([QRBN])/, (_, l) => `=${LETTERE_ITALIANE[l]}`);
}

// 64 caselle create una volta; "girata" cambia solo l'ordine in cui sono mostrate
const caselle = [];
for (let i = 0; i < 64; i++) {
    const casella = document.createElement('button');
    casella.type = 'button';
    casella.className = `casella-scacchi casella-scacchi--${(Math.floor(i / 8) + (i % 8)) % 2 === 0 ? 'chiara' : 'scura'}`;
    casella.addEventListener('click', () => clicCasella(i));
    caselle.push(casella);
}

function ordinaCaselle() {
    scacchieraEl.textContent = '';
    const ordine = [...Array(64).keys()];
    if (girata) ordine.reverse();
    ordine.forEach(i => scacchieraEl.appendChild(caselle[i]));
}

function nome(c) {
    if (!dueGiocatori) return c === 'w' ? 'Tu (bianco)' : 'Computer (nero)';
    return `${c === 'w' ? nomi[0] : nomi[1]} (${NOMI_COLORI[c]})`;
}

function puoGiocareUmano() {
    return !finita && !pcPensa && !inSospeso && (dueGiocatori || stato.tocca !== COLORE_PC);
}

// Pezzi catturati da ciascun colore: quelli dell'avversario che mancano rispetto alla posizione iniziale
function catturati() {
    const iniziali = { P: 8, N: 2, B: 2, R: 2, Q: 1 };
    const presi = { w: [], b: [] };
    for (const tipo of Object.keys(iniziali)) {
        for (const c of ['w', 'b']) {
            const pezzo = c === 'w' ? tipo : tipo.toLowerCase();
            const rimasti = stato.scacchiera.filter(p => p === pezzo).length;
            // i pezzi in più (promozioni) non contano come catturati
            for (let k = rimasti; k < iniziali[tipo]; k++) presi[c === 'w' ? 'b' : 'w'].push(pezzo);
        }
    }
    return presi;
}

function disegna() {
    const destinazioni = new Map(mosseValide.map(m => [m.a, m]));
    const scacco = sottoScacco(stato);
    const re = stato.scacchiera.indexOf(stato.tocca === 'w' ? 'K' : 'k');
    for (let i = 0; i < 64; i++) {
        const casella = caselle[i];
        const pezzo = stato.scacchiera[i];
        casella.textContent = '';
        if (pezzo) {
            const segno = document.createElement('span');
            segno.className = `pezzo-scacchi pezzo-scacchi--${colore(pezzo)}`;
            segno.textContent = simbolo(pezzo);
            segno.setAttribute('aria-hidden', 'true');
            casella.appendChild(segno);
        }
        // coordinate sul bordo (lettere in basso, numeri a sinistra), secondo il verso della scacchiera
        const r = Math.floor(i / 8), c = i % 8;
        if (c === (girata ? 7 : 0)) {
            const numero = document.createElement('span');
            numero.className = 'coordinata coordinata--riga';
            numero.textContent = 8 - r;
            numero.setAttribute('aria-hidden', 'true');
            casella.appendChild(numero);
        }
        if (r === (girata ? 0 : 7)) {
            const lettera = document.createElement('span');
            lettera.className = 'coordinata coordinata--colonna';
            lettera.textContent = 'abcdefgh'[c];
            lettera.setAttribute('aria-hidden', 'true');
            casella.appendChild(lettera);
        }
        const destinazione = destinazioni.get(i);
        casella.classList.toggle('casella-scacchi--selezionata', i === selezionata);
        casella.classList.toggle('casella-scacchi--destinazione', Boolean(destinazione) && !destinazione.presa);
        casella.classList.toggle('casella-scacchi--presa', Boolean(destinazione) && Boolean(destinazione.presa));
        casella.classList.toggle('casella-scacchi--ultima', ultimaMossa !== null && (ultimaMossa.da === i || ultimaMossa.a === i));
        casella.classList.toggle('casella-scacchi--scacco', scacco && i === re);
        const descrizione = pezzo ? `${NOMI_PEZZI[pezzo.toUpperCase()]} ${colore(pezzo) === 'w' ? 'bianco' : 'nero'}` : 'vuota';
        casella.setAttribute('aria-label', `${nomeCasa(i)}: ${descrizione}${destinazione ? ', puoi muovere qui' : ''}`);
    }
    const presi = catturati();
    for (const c of ['w', 'b']) {
        document.querySelector(`#nome${c.toUpperCase()}`).textContent = nome(c);
        document.querySelector(`#catturati${c.toUpperCase()}`).textContent = presi[c].map(simbolo).join('');
    }
    contenitore.dataset.turno = finita ? '' : stato.tocca;
    document.querySelector('#annulla').disabled = storiaStati.length === 0 || pcPensa;
    disegnaMosse();
}

function disegnaMosse() {
    elencoMosse.textContent = '';
    for (let k = 0; k < mosseScritte.length; k += 2) {
        const voce = document.createElement('li');
        voce.textContent = `${inItaliano(mosseScritte[k])}${mosseScritte[k + 1] ? '  ' + inItaliano(mosseScritte[k + 1]) : ''}`;
        elencoMosse.appendChild(voce);
    }
}

function aggiornaMessaggio() {
    const sit = situazione(stato);
    if (sit.finita) {
        finita = true;
        const testi = {
            scaccomatto: dueGiocatori ? `Scacco matto! Vince ${nome(sit.vincitore)}.` : (sit.vincitore === COLORE_PC ? 'Scacco matto: ha vinto il computer.' : 'Scacco matto: hai vinto!'),
            stallo: 'Patta per stallo.',
            cinquanta: 'Patta: 50 mosse senza prese né mosse di pedone.',
            ripetizione: 'Patta: la stessa posizione si è ripetuta 3 volte.',
            materiale: 'Patta: non c’è abbastanza materiale per dare matto.'
        };
        messaggi.textContent = testi[sit.esito];
        const persa = sit.esito === 'scaccomatto' && !dueGiocatori && sit.vincitore === COLORE_PC;
        messaggi.className = sit.esito === 'scaccomatto' ? (persa ? 'messaggio--errore' : 'messaggio--successo') : '';
        return;
    }
    messaggi.className = sit.scacco ? 'messaggio--errore' : '';
    if (!dueGiocatori && stato.tocca === COLORE_PC) {
        messaggi.textContent = 'Il computer sta pensando…';
    } else {
        const chi = dueGiocatori ? `Tocca a ${nome(stato.tocca)}` : 'Tocca a te';
        messaggi.textContent = sit.scacco ? `${chi}: sei sotto scacco!` : chi;
    }
}

function clicCasella(i) {
    if (!puoGiocareUmano()) return;
    const scelte = mosseValide.filter(m => m.a === i);
    if (scelte.length > 0) {
        if (scelte.length > 1 && scelte[0].promozione) {
            // promozione: si sceglie il pezzo
            inSospeso = scelte;
            pannelloPromozione.querySelectorAll('.promozione__pezzo').forEach(b => {
                b.textContent = simbolo(stato.tocca === 'w' ? b.dataset.pezzo : b.dataset.pezzo.toLowerCase());
                b.classList.toggle('promozione__pezzo--nero', stato.tocca === 'b');
            });
            pannelloPromozione.hidden = false;
            pannelloPromozione.querySelector('button').focus();
            return;
        }
        gioca(scelte[0]);
        return;
    }
    if (colore(stato.scacchiera[i]) === stato.tocca) {
        selezionata = i;
        mosseValide = mosseLegali(stato).filter(m => m.da === i);
    } else {
        selezionata = null;
        mosseValide = [];
    }
    disegna();
}

function gioca(m) {
    mosseScritte.push(notazione(stato, m));
    storiaStati.push({ stato, ultimaMossa });
    stato = applica(stato, m);
    ultimaMossa = m;
    selezionata = null;
    mosseValide = [];
    aggiornaMessaggio();
    disegna();
    if (!finita && !dueGiocatori && stato.tocca === COLORE_PC) {
        turnoComputer();
    }
}

function turnoComputer() {
    pcPensa = true;
    disegna();
    // il calcolo parte dopo un attimo, così la pagina fa in tempo a mostrare la mossa del giocatore
    timerPC = setTimeout(() => {
        const m = mossaPC(stato, difficolta.value);
        pcPensa = false;
        if (m) gioca(m);
    }, 300);
}

// Annulla l'ultima mossa; contro il computer annulla anche la sua risposta, così tocca di nuovo a te
function annulla() {
    if (storiaStati.length === 0 || pcPensa) return;
    clearTimeout(timerPC);
    const quante = !dueGiocatori && stato.tocca === 'w' && storiaStati.length >= 2 ? 2 : 1;
    for (let k = 0; k < quante; k++) {
        const precedente = storiaStati.pop();
        stato = precedente.stato;
        ultimaMossa = precedente.ultimaMossa;
        mosseScritte.pop();
    }
    finita = false;
    inSospeso = null;
    pannelloPromozione.hidden = true;
    selezionata = null;
    mosseValide = [];
    aggiornaMessaggio();
    disegna();
    if (!dueGiocatori && stato.tocca === COLORE_PC) turnoComputer();
}

function iniziaPartita() {
    clearTimeout(timerPC);
    pcPensa = false;
    stato = statoIniziale();
    storiaStati = [];
    mosseScritte = [];
    selezionata = null;
    mosseValide = [];
    ultimaMossa = null;
    inSospeso = null;
    pannelloPromozione.hidden = true;
    finita = false;
    aggiornaMessaggio();
    disegna();
}

pannelloPromozione.querySelectorAll('.promozione__pezzo').forEach(b => {
    b.addEventListener('click', () => {
        if (!inSospeso) return;
        const scelta = inSospeso.find(m => m.promozione.toUpperCase() === b.dataset.pezzo);
        inSospeso = null;
        pannelloPromozione.hidden = true;
        gioca(scelta);
    });
});
document.querySelector('#nuovaPartita').addEventListener('click', iniziaPartita);
document.querySelector('#annulla').addEventListener('click', annulla);
document.querySelector('#gira').addEventListener('click', () => {
    girata = !girata;
    ordinaCaselle();
    disegna();
});
difficolta.addEventListener('change', iniziaPartita);

Giocatori.collegaBarra({
    select: selectModalita,
    pulsanteNomi,
    suCambioModalita: due => {
        dueGiocatori = due;
        difficolta.disabled = due;
        iniziaPartita();
    },
    suCambioNomi: nuoviNomi => {
        nomi = nuoviNomi;
        disegna();
        aggiornaMessaggio();
    }
});

ordinaCaselle();
iniziaPartita();
