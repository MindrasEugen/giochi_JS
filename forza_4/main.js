
const contenitore = document.querySelector('#contenitore_gioco');
const grigliaEl = document.querySelector('#griglia');
const messaggi = document.querySelector('#messaggi');
const selectModalita = document.querySelector('#modalitaGioco');
const difficolta = document.querySelector('#difficolta');
const pulsanteNomi = document.querySelector('#nomiGiocatori');
const nuovaPartita = document.querySelector('#nuovaPartita');
const azzera = document.querySelector('#azzera');

const PEDINA_PC = 'G';
const NOMI_COLORI = { R: 'rosso', G: 'giallo' };

// Stato della partita: la pagina viene ridisegnata a partire da qui
let caselle = grigliaVuota();
let tocca = 'R';
let chiComincia = 'R';
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
let punti = { R: 0, G: 0 };
let dueGiocatori = false;
let nomi = Giocatori.leggiNomi();

// Crea le 7 colonne, ognuna con 6 caselle (dall'alto in basso)
const colonne = [];
for (let c = 0; c < COLONNE; c++) {
    const colonna = document.createElement('button');
    colonna.type = 'button';
    colonna.className = 'colonna';
    colonna.dataset.colonna = c;
    for (let r = 0; r < RIGHE; r++) {
        const cella = document.createElement('span');
        cella.className = 'cella';
        colonna.appendChild(cella);
    }
    colonna.addEventListener('click', () => sceltaColonna(c));
    grigliaEl.appendChild(colonna);
    colonne.push(colonna);
}

function nome(pedina) {
    if (!dueGiocatori) {
        return pedina === 'R' ? 'Tu' : 'Computer';
    }
    return pedina === 'R' ? nomi[0] : nomi[1];
}

function aggiornaPunteggi() {
    document.querySelector('#nomeR').textContent = nome('R');
    document.querySelector('#nomeG').textContent = nome('G');
    document.querySelector('#puntiR').textContent = punti.R;
    document.querySelector('#puntiG').textContent = punti.G;
}

// Disegna le pedine; "nuova" è l'indice della pedina appena caduta (per l'animazione di caduta)
function disegna(nuova = -1) {
    const quattro = quattroInFila(caselle);
    for (let c = 0; c < COLONNE; c++) {
        const celle = colonne[c].children;
        let libere = 0;
        for (let r = 0; r < RIGHE; r++) {
            const i = indice(r, c);
            const cella = celle[r];
            if (caselle[i] === '') {
                delete cella.dataset.pedina;
                libere++;
            } else {
                cella.dataset.pedina = caselle[i];
            }
            cella.classList.toggle('cella--vincente', quattro !== null && quattro.celle.includes(i));
            if (i === nuova) {
                // --caduta: di quante righe è scesa la pedina, per la durata dell'animazione
                cella.style.setProperty('--caduta', r + 1);
                cella.classList.remove('cella--nuova');
                void cella.offsetWidth;
                cella.classList.add('cella--nuova');
            }
        }
        const bloccata = finita || pcPensa || libere === 0 || (!dueGiocatori && tocca === PEDINA_PC);
        colonne[c].disabled = bloccata;
        colonne[c].setAttribute('aria-label', `Colonna ${c + 1}${libere === 0 ? ', piena' : ''}`);
    }
}

// data-turno serve al CSS per evidenziare chi deve muovere
function aggiornaTurno() {
    contenitore.dataset.turno = finita ? '' : tocca;
    if (finita) {
        return;
    }
    if (!dueGiocatori) {
        messaggi.textContent = tocca === PEDINA_PC ? 'Il computer sta pensando…' : 'Tocca a te';
    } else {
        messaggi.textContent = `Tocca a ${nome(tocca)} (${NOMI_COLORI[tocca]})`;
    }
    messaggi.className = '';
}

function gioca(colonna) {
    const riga = inserisci(caselle, colonna, tocca);
    if (riga === -1) {
        return;
    }
    const quattro = quattroInFila(caselle);
    if (quattro) {
        finita = true;
        punti[quattro.vincitore]++;
        aggiornaPunteggi();
        if (!dueGiocatori) {
            messaggi.textContent = quattro.vincitore === PEDINA_PC ? 'Ha vinto il computer' : 'Hai vinto!';
            messaggi.className = quattro.vincitore === PEDINA_PC ? 'messaggio--errore' : 'messaggio--successo';
        } else {
            messaggi.textContent = `Vince ${nome(quattro.vincitore)}!`;
            messaggi.className = 'messaggio--successo';
        }
    } else if (piena(caselle)) {
        finita = true;
        messaggi.textContent = 'Pareggio';
        messaggi.className = '';
    } else {
        tocca = avversario(tocca);
    }
    disegna(indice(riga, colonna));
    aggiornaTurno();
    if (!finita && !dueGiocatori && tocca === PEDINA_PC) {
        turnoComputer();
    }
}

// Piccola attesa prima della mossa del PC, così si vede cadere una pedina alla volta
function turnoComputer() {
    pcPensa = true;
    disegna();
    timerPC = setTimeout(() => dopoPannello(() => {
        pcPensa = false;
        gioca(mossaPC(caselle, difficolta.value, PEDINA_PC));
    }), 450);
}

function sceltaColonna(colonna) {
    if (finita || pcPensa || (!dueGiocatori && tocca === PEDINA_PC)) {
        return;
    }
    gioca(colonna);
}

// A ogni nuova partita comincia l'altro giocatore
function iniziaPartita(alterna = true) {
    partita++;
    clearTimeout(timerPC);
    pcPensa = false;
    if (alterna) {
        chiComincia = avversario(chiComincia);
    }
    caselle = grigliaVuota();
    tocca = chiComincia;
    finita = false;
    disegna();
    aggiornaTurno();
    if (!dueGiocatori && tocca === PEDINA_PC) {
        turnoComputer();
    }
}

function azzeraTutto() {
    punti = { R: 0, G: 0 };
    chiComincia = 'R';
    aggiornaPunteggi();
    iniziaPartita(false);
}

// Tasti da 1 a 7 per scegliere la colonna (non mentre si scrive in un campo)
document.addEventListener('keydown', evento => {
    const bersaglio = evento.target;
    if ((bersaglio instanceof Element && bersaglio.matches('input, select, textarea')) || document.querySelector('.copertura')) {
        return;
    }
    const numero = Number(evento.key);
    if (Number.isInteger(numero) && numero >= 1 && numero <= COLONNE) {
        sceltaColonna(numero - 1);
    }
});

nuovaPartita.addEventListener('click', () => iniziaPartita());
azzera.addEventListener('click', azzeraTutto);
difficolta.addEventListener('change', azzeraTutto);

Giocatori.collegaBarra({
    select: selectModalita,
    pulsanteNomi,
    suCambioModalita: due => {
        dueGiocatori = due;
        difficolta.disabled = due;
        azzeraTutto();
    },
    suCambioNomi: nuoviNomi => {
        nomi = nuoviNomi;
        aggiornaPunteggi();
        aggiornaTurno();
    }
});

aggiornaPunteggi();
iniziaPartita(false);
