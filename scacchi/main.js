
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
const FILE_PEZZI = { K: 'king', Q: 'queen', R: 'rook', B: 'bishop', N: 'knight', P: 'pawn' };
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

function descrizionePezzo(pezzo) {
    const femminile = ['Q', 'R'].includes(pezzo.toUpperCase());
    const tinta = femminile ? (colore(pezzo) === 'w' ? 'bianca' : 'nera') : NOMI_COLORI[colore(pezzo)];
    return `${NOMI_PEZZI[pezzo.toUpperCase()]} ${tinta}`;
}

function immaginePezzo(pezzo, decorativa = true) {
    const immagine = document.createElement('img');
    const lato = colore(pezzo) === 'w' ? 'white' : 'black';
    immagine.src = `../pezzi_scacco/${lato}-${FILE_PEZZI[pezzo.toUpperCase()]}.png`;
    immagine.className = 'pezzo-scacchi';
    immagine.width = 512;
    immagine.height = 512;
    immagine.draggable = false;
    immagine.alt = decorativa ? '' : descrizionePezzo(pezzo);
    if (decorativa) immagine.setAttribute('aria-hidden', 'true');
    return immagine;
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

// Catture registrate nelle mosse: le promozioni non sono catture.
function catturati() {
    return stato.catturati;
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
            casella.appendChild(immaginePezzo(pezzo));
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
        const descrizione = pezzo ? descrizionePezzo(pezzo) : 'vuota';
        casella.setAttribute('aria-label', `${nomeCasa(i)}: ${descrizione}${destinazione ? ', puoi muovere qui' : ''}`);
    }
    const presi = catturati();
    for (const c of ['w', 'b']) {
        document.querySelector(`#nome${c.toUpperCase()}`).textContent = nome(c);
        const catture = document.querySelector(`#catturati${c.toUpperCase()}`);
        catture.textContent = '';
        presi[c].forEach(pezzo => catture.appendChild(immaginePezzo(pezzo, false)));
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
                b.textContent = '';
                b.appendChild(immaginePezzo(stato.tocca === 'w' ? b.dataset.pezzo : b.dataset.pezzo.toLowerCase()));
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
