
const contenitore = document.querySelector('#contenitore_gioco');
const tavoliere = document.querySelector('#tavoliere');
const messaggi = document.querySelector('#messaggi');
const selectModalita = document.querySelector('#modalitaGioco');
const difficolta = document.querySelector('#difficolta');
const pulsanteNomi = document.querySelector('#nomiGiocatori');
const pulsanteNuova = document.querySelector('#nuovaPartita');

const COLORE_PC = 'N';
const MOSSE_PER_PATTA = 50;
const NOMI_COLORI = { B: 'bianco', N: 'nero' };

let stato = statoIniziale();
let selezionato = null;     // pedina scelta per lo spostamento
let inSospeso = null;       // spostamento già fatto che ha formato un mulino: manca la pedina da togliere
let ultimaMossa = null;
let finita = false;
let pcPensa = false;
let timerPC;
// Mentre il pannello del telefono (js/tavola.js) è aperto il computer aspetta; una nuova partita annulla l'attesa
let partita = 0;
function dopoPannello(fn) {
    const questa = partita;
    const esegui = () => { if (questa === partita) fn(); };
    if (typeof Tavola !== 'undefined') Tavola.quandoChiuso(esegui); else esegui();
}
let mosseSenzaPresa = 0;
let dueGiocatori = false;
let nomi = Giocatori.leggiNomi();

// 24 punti, posizionati con le coordinate in percentuale
const punti = COORDINATE.map(([x, y], i) => {
    const punto = document.createElement('button');
    punto.type = 'button';
    punto.className = 'punto';
    punto.style.setProperty('--x', `${x}%`);
    punto.style.setProperty('--y', `${y}%`);
    punto.addEventListener('click', () => clicPunto(i));
    tavoliere.appendChild(punto);
    return punto;
});

function nome(g) {
    if (!dueGiocatori) return g === 'B' ? 'Tu' : 'Computer';
    return g === 'B' ? nomi[0] : nomi[1];
}

function puoGiocareUmano() {
    return !finita && !pcPensa && (dueGiocatori || stato.tocca !== COLORE_PC);
}

// Posizione da mostrare: se c'è un mulino in sospeso, la pedina è già spostata ma niente è ancora stato tolto
function puntiMostrati() {
    if (!inSospeso) return stato.punti;
    const p = [...stato.punti];
    if (inSospeso.da !== null) p[inSospeso.da] = '';
    p[inSospeso.a] = stato.tocca;
    return p;
}

function mossePossibili() {
    return finita ? [] : mosseLegali(stato);
}

function disegna() {
    const mostrati = puntiMostrati();
    const mosse = mossePossibili();
    const destinazioni = new Set();
    const rimovibiliOra = new Set();
    if (inSospeso) {
        mosse.filter(m => m.da === inSospeso.da && m.a === inSospeso.a && m.rimuovi !== null).forEach(m => rimovibiliOra.add(m.rimuovi));
    } else if (puoGiocareUmano()) {
        const f = fase(stato, stato.tocca);
        mosse.filter(m => (f === 'piazza' ? m.da === null : m.da === selezionato)).forEach(m => destinazioni.add(m.a));
    }
    punti.forEach((punto, i) => {
        const g = mostrati[i];
        if (g) punto.dataset.pedina = g; else delete punto.dataset.pedina;
        punto.classList.toggle('punto--selezionato', i === selezionato);
        punto.classList.toggle('punto--destinazione', destinazioni.has(i) && selezionato !== null);
        punto.classList.toggle('punto--rimovibile', rimovibiliOra.has(i));
        punto.classList.toggle('punto--mulino', g !== '' && inMulino(mostrati, i));
        punto.classList.toggle('punto--ultimo', ultimaMossa !== null && (ultimaMossa.a === i || ultimaMossa.da === i));
        const descrizione = g ? `pedina ${NOMI_COLORI[g]}` : 'libero';
        punto.setAttribute('aria-label', `Punto ${i + 1}: ${descrizione}${rimovibiliOra.has(i) ? ', puoi toglierla' : ''}${destinazioni.has(i) ? ', puoi muovere qui' : ''}`);
    });
    for (const g of ['B', 'N']) {
        document.querySelector(`#nome${g}`).textContent = nome(g);
        document.querySelector(`#tavola${g}`).textContent = mostrati.filter(p => p === g).length;
        document.querySelector(`#mano${g}`).textContent = `${stato.daPiazzare[g]} in mano`;
    }
    contenitore.dataset.turno = finita ? '' : stato.tocca;
    contenitore.dataset.fase = finita ? '' : (inSospeso ? 'rimuovi' : fase(stato, stato.tocca));
}

function aggiornaMessaggio() {
    if (finita) return;
    messaggi.className = '';
    if (!dueGiocatori && stato.tocca === COLORE_PC) {
        messaggi.textContent = 'Il computer sta pensando…';
        return;
    }
    const chi = dueGiocatori ? `${nome(stato.tocca)} (${NOMI_COLORI[stato.tocca]})` : 'Tu';
    if (inSospeso) {
        messaggi.textContent = `Mulino! ${chi}: scegli una pedina avversaria da togliere.`;
        messaggi.className = 'messaggio--successo';
        return;
    }
    const f = fase(stato, stato.tocca);
    const azione = { piazza: 'metti una pedina in un punto libero', muovi: 'sposta una pedina in un punto vicino', vola: 'hai 3 pedine: puoi volare in qualsiasi punto libero' }[f];
    messaggi.textContent = dueGiocatori ? `Tocca a ${chi}: ${azione}.` : `Tocca a te: ${azione}.`;
}

// Prova lo spostamento: se forma un mulino aspetta la scelta della pedina da togliere
function proponi(da, a) {
    const candidate = mosseLegali(stato).filter(m => m.da === da && m.a === a);
    if (candidate.length === 0) return;
    if (candidate[0].rimuovi === null) {
        esegui(candidate[0]);
    } else {
        inSospeso = { da, a };
        selezionato = null;
        disegna();
        aggiornaMessaggio();
    }
}

function clicPunto(i) {
    if (!puoGiocareUmano()) return;
    if (inSospeso) {
        const mossa = mosseLegali(stato).find(m => m.da === inSospeso.da && m.a === inSospeso.a && m.rimuovi === i);
        if (mossa) {
            inSospeso = null;
            esegui(mossa);
        } else {
            messaggi.textContent = 'Scegli una delle pedine avversarie evidenziate.';
            messaggi.className = 'messaggio--errore';
        }
        return;
    }
    const f = fase(stato, stato.tocca);
    if (f === 'piazza') {
        if (stato.punti[i] === '') proponi(null, i);
        return;
    }
    if (stato.punti[i] === stato.tocca) {
        const haMosse = mosseLegali(stato).some(m => m.da === i);
        selezionato = haMosse ? i : null;
        if (!haMosse) {
            messaggi.textContent = 'Questa pedina non può muovere.';
            messaggi.className = 'messaggio--errore';
        } else {
            aggiornaMessaggio();
        }
        disegna();
        return;
    }
    if (stato.punti[i] === '' && selezionato !== null) {
        proponi(selezionato, i);
    }
}

function esegui(mossa) {
    const finitoPiazzamento = stato.daPiazzare.B === 0 && stato.daPiazzare.N === 0;
    stato = applica(stato, mossa);
    ultimaMossa = mossa;
    selezionato = null;
    inSospeso = null;
    if (mossa.rimuovi !== null) mosseSenzaPresa = 0;
    else if (finitoPiazzamento) mosseSenzaPresa++;
    const vince = vincitore(stato);
    if (vince) {
        finita = true;
        if (!dueGiocatori) {
            messaggi.textContent = vince === COLORE_PC ? 'Ha vinto il computer' : 'Hai vinto!';
            messaggi.className = vince === COLORE_PC ? 'messaggio--errore' : 'messaggio--successo';
        } else {
            messaggi.textContent = `Vince ${nome(vince)} (${NOMI_COLORI[vince]})!`;
            messaggi.className = 'messaggio--successo';
        }
    } else if (mosseSenzaPresa >= MOSSE_PER_PATTA) {
        finita = true;
        messaggi.textContent = 'Patta: 50 mosse senza togliere pedine.';
        messaggi.className = '';
    }
    disegna();
    aggiornaMessaggio();
    if (!finita && !dueGiocatori && stato.tocca === COLORE_PC) {
        turnoComputer();
    }
}

function turnoComputer() {
    pcPensa = true;
    disegna();
    timerPC = setTimeout(() => dopoPannello(() => {
        pcPensa = false;
        const mossa = mossaPC(stato, difficolta.value);
        if (mossa) esegui(mossa);
    }), 500);
}

function iniziaPartita() {
    partita++;
    clearTimeout(timerPC);
    pcPensa = false;
    stato = statoIniziale();
    selezionato = null;
    inSospeso = null;
    ultimaMossa = null;
    finita = false;
    mosseSenzaPresa = 0;
    disegna();
    aggiornaMessaggio();
}

pulsanteNuova.addEventListener('click', iniziaPartita);
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

iniziaPartita();
