
const contenitore = document.querySelector('#contenitore_gioco');
const scacchieraEl = document.querySelector('#scacchiera');
const messaggi = document.querySelector('#messaggi');
const selectModalita = document.querySelector('#modalitaGioco');
const difficolta = document.querySelector('#difficolta');
const pulsanteNomi = document.querySelector('#nomiGiocatori');
const pulsanteNuova = document.querySelector('#nuovaPartita');

const COLORE_PC = 'nero';
const MOSSE_PER_PATTA = 80; // 40 mosse a testa senza prese

let s = scacchieraIniziale();
let tocca = 'bianco';
let selezionato = null;
let mosseValide = [];
let ultimaMossa = null;
let finita = false;
let pcPensa = false;
let timerPC;
let mosseSenzaPresa = 0;
let dueGiocatori = false;
let nomi = Giocatori.leggiNomi();

// 64 caselle: le scure sono pulsanti, le chiare solo decorative
const caselle = [];
for (let r = 0; r < LATO; r++) {
    for (let c = 0; c < LATO; c++) {
        const i = indice(r, c);
        let casella;
        if (scura(r, c)) {
            casella = document.createElement('button');
            casella.type = 'button';
            casella.className = 'casella-dama casella-dama--scura';
            casella.addEventListener('click', () => clicCasella(i));
        } else {
            casella = document.createElement('span');
            casella.className = 'casella-dama casella-dama--chiara';
            casella.setAttribute('aria-hidden', 'true');
        }
        scacchieraEl.appendChild(casella);
        caselle.push(casella);
    }
}

function nome(giocatore) {
    if (!dueGiocatori) return giocatore === 'bianco' ? 'Tu' : 'Computer';
    return giocatore === 'bianco' ? nomi[0] : nomi[1];
}

function puoGiocareUmano() {
    return !finita && !pcPensa && (dueGiocatori || tocca !== COLORE_PC);
}

function disegna() {
    const tutte = finita ? [] : mosseLegali(s, tocca);
    const obbligate = new Set(tutte.filter(m => m.catture.length > 0).map(m => m.da));
    const destinazioni = new Set(mosseValide.map(m => m.a));
    for (let i = 0; i < 64; i++) {
        const casella = caselle[i];
        if (!casella.classList.contains('casella-dama--scura')) continue;
        const pezzo = s[i];
        casella.textContent = '';
        if (pezzo) {
            const segno = document.createElement('span');
            segno.className = `pezzo pezzo--${colore(pezzo)}${eDama(pezzo) ? ' pezzo--dama' : ''}`;
            segno.setAttribute('aria-hidden', 'true');
            casella.appendChild(segno);
        }
        casella.classList.toggle('casella-dama--selezionata', i === selezionato);
        casella.classList.toggle('casella-dama--destinazione', destinazioni.has(i));
        casella.classList.toggle('casella-dama--obbligata', puoGiocareUmano() && obbligate.has(i) && selezionato === null);
        casella.classList.toggle('casella-dama--ultima', ultimaMossa !== null && (ultimaMossa.da === i || ultimaMossa.a === i));
        const r = Math.floor(i / LATO) + 1, c = i % LATO + 1;
        const descrizione = pezzo ? `${eDama(pezzo) ? 'dama' : 'pedina'} ${colore(pezzo) === 'bianco' ? 'bianca' : 'nera'}` : 'vuota';
        casella.setAttribute('aria-label', `Riga ${r}, colonna ${c}: ${descrizione}${destinazioni.has(i) ? ', puoi muovere qui' : ''}`);
    }
    document.querySelector('#nomeBianco').textContent = nome('bianco');
    document.querySelector('#nomeNero').textContent = nome('nero');
    document.querySelector('#pezziBianco').textContent = conta(s, 'bianco').totale;
    document.querySelector('#pezziNero').textContent = conta(s, 'nero').totale;
    contenitore.dataset.turno = finita ? '' : tocca;
}

function aggiornaMessaggio() {
    if (finita) return;
    messaggi.className = '';
    if (!dueGiocatori && tocca === COLORE_PC) {
        messaggi.textContent = 'Il computer sta pensando…';
        return;
    }
    const obbligo = mosseLegali(s, tocca).some(m => m.catture.length > 0);
    const chi = dueGiocatori ? `Tocca a ${nome(tocca)} (${tocca})` : 'Tocca a te';
    messaggi.textContent = obbligo ? `${chi}: devi mangiare!` : chi;
}

function clicCasella(i) {
    if (!puoGiocareUmano()) return;
    // clic su una destinazione valida: si muove
    const mossa = mosseValide.find(m => m.a === i);
    if (mossa) {
        eseguiMossa(mossa);
        return;
    }
    // clic su un proprio pezzo: lo si seleziona (se ha mosse valide)
    if (colore(s[i]) === tocca) {
        const mosse = mosseLegali(s, tocca).filter(m => m.da === i);
        selezionato = mosse.length > 0 ? i : null;
        mosseValide = mosse;
        if (mosse.length === 0) {
            const obbligo = mosseLegali(s, tocca).some(m => m.catture.length > 0);
            messaggi.textContent = obbligo ? 'Questo pezzo non può mangiare: devi mangiare con un altro pezzo.' : 'Questo pezzo non può muovere.';
            messaggi.className = 'messaggio--errore';
        } else {
            aggiornaMessaggio();
        }
    } else {
        selezionato = null;
        mosseValide = [];
    }
    disegna();
}

function eseguiMossa(mossa) {
    s = applica(s, mossa);
    ultimaMossa = mossa;
    selezionato = null;
    mosseValide = [];
    mosseSenzaPresa = mossa.catture.length > 0 ? 0 : mosseSenzaPresa + 1;
    tocca = avversario(tocca);
    const vince = vincitore(s, tocca);
    if (vince) {
        finita = true;
        if (!dueGiocatori) {
            messaggi.textContent = vince === COLORE_PC ? 'Ha vinto il computer' : 'Hai vinto!';
            messaggi.className = vince === COLORE_PC ? 'messaggio--errore' : 'messaggio--successo';
        } else {
            messaggi.textContent = `Vince ${nome(vince)} (${vince})!`;
            messaggi.className = 'messaggio--successo';
        }
    } else if (mosseSenzaPresa >= MOSSE_PER_PATTA) {
        finita = true;
        messaggi.textContent = 'Patta: 40 mosse a testa senza prese.';
        messaggi.className = '';
    }
    disegna();
    aggiornaMessaggio();
    if (!finita && !dueGiocatori && tocca === COLORE_PC) {
        turnoComputer();
    }
}

function turnoComputer() {
    pcPensa = true;
    disegna();
    timerPC = setTimeout(() => {
        pcPensa = false;
        const mossa = mossaPC(s, COLORE_PC, difficolta.value);
        if (mossa) eseguiMossa(mossa);
    }, 500);
}

function iniziaPartita() {
    clearTimeout(timerPC);
    pcPensa = false;
    s = scacchieraIniziale();
    tocca = 'bianco';
    selezionato = null;
    mosseValide = [];
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
