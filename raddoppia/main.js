
const contenitore = document.querySelector('#contenitore_gioco');
const tavolo = document.querySelector('#tavolo');
const messaggi = document.querySelector('#messaggi');
const selectModalita = document.querySelector('#modalitaGioco');
const pulsanteNomi = document.querySelector('#nomiGiocatori');
const pulsanteNuova = document.querySelector('#nuovaPartita');
const punteggiDue = document.querySelector('#punteggiDue');
const turnoDue = document.querySelector('#turnoDue');

const CHIAVE_RECORD = 'giochi_js_raddoppia';
const DISTANZA_SWIPE = 30; // pixel minimi per considerare uno scorrimento del dito

let griglia = grigliaVuota();
let punti = 0;
let casuale = Math.random;
let finita = false;
let obiettivoAnnunciato = false;

// Sfida a 2: stessa sequenza di tessere (stesso seme) per tutti e due
let dueGiocatori = false;
let nomi = Giocatori.leggiNomi();
let turno = 0;
let seme = 0;
let punteggiSfida = [null, null];

// 16 caselle fisse; il valore della tessera è in data-valore
const caselle = [];
for (let i = 0; i < LATO * LATO; i++) {
    const casella = document.createElement('div');
    casella.className = 'casella-raddoppia';
    casella.setAttribute('role', 'gridcell');
    tavolo.appendChild(casella);
    caselle.push(casella);
}

function leggiRecord() {
    try {
        return Number(localStorage.getItem(CHIAVE_RECORD)) || 0;
    } catch (errore) {
        return 0;
    }
}

function salvaRecord(valore) {
    if (valore <= leggiRecord()) {
        return false;
    }
    try {
        localStorage.setItem(CHIAVE_RECORD, String(valore));
    } catch (errore) {
        // senza localStorage il record non si salva
    }
    return true;
}

// "nuova": indice della tessera appena comparsa; "unite": indici delle tessere nate da un'unione
function disegna(nuova = -1, unite = []) {
    griglia.forEach((valore, i) => {
        const casella = caselle[i];
        casella.textContent = valore === 0 ? '' : valore;
        if (valore === 0) {
            delete casella.dataset.valore;
        } else {
            // oltre 2048 tutte le tessere hanno lo stesso colore
            casella.dataset.valore = valore > OBIETTIVO ? 'oltre' : valore;
        }
        casella.setAttribute('aria-label', valore === 0 ? 'vuota' : String(valore));
        casella.classList.remove('casella-raddoppia--nuova', 'casella-raddoppia--unita');
        if (i === nuova || unite.includes(i)) {
            void casella.offsetWidth; // fa ripartire l'animazione
            casella.classList.add(i === nuova ? 'casella-raddoppia--nuova' : 'casella-raddoppia--unita');
        }
    });
    document.querySelector('#punti').textContent = punti;
    // nella sfida il secondo riquadro mostra la tessera più alta (i punti dei due giocatori sono nella tabellina sotto)
    document.querySelector('#record').textContent = dueGiocatori ? Math.max(...griglia) : leggiRecord();
}

function aggiornaPunteggiDue() {
    document.querySelector('#nomeG1').textContent = nomi[0];
    document.querySelector('#nomeG2').textContent = nomi[1];
    document.querySelector('#puntiG1').textContent = punteggiSfida[0] ?? '–';
    document.querySelector('#puntiG2').textContent = punteggiSfida[1] ?? '–';
    document.querySelector('#etichettaRecord').textContent = dueGiocatori ? 'Tessera più alta' : 'Record';
}

function avviaGriglia() {
    griglia = grigliaVuota();
    punti = 0;
    finita = false;
    obiettivoAnnunciato = false;
    aggiungiTessera(griglia, casuale);
    aggiungiTessera(griglia, casuale);
    messaggi.textContent = '';
    messaggi.className = '';
    disegna();
}

function mossa(direzione) {
    if (finita || document.querySelector('.copertura')) {
        return;
    }
    const esito = muovi(griglia, direzione);
    if (!esito.mosso) {
        return;
    }
    griglia = esito.griglia;
    punti += esito.punti;
    const nuova = aggiungiTessera(griglia, casuale);
    disegna(nuova, esito.unite);
    if (!obiettivoAnnunciato && haObiettivo(griglia)) {
        obiettivoAnnunciato = true;
        messaggi.textContent = 'Hai fatto 2048! Puoi continuare per fare più punti.';
        messaggi.className = 'messaggio--successo';
    }
    if (!puoMuovere(griglia)) {
        fineGriglia();
    }
}

function fineGriglia() {
    finita = true;
    if (!dueGiocatori) {
        const nuovoRecord = salvaRecord(punti);
        disegna();
        messaggi.textContent = `Nessuna mossa possibile: hai fatto ${punti} punti${nuovoRecord ? ', nuovo record!' : '.'}`;
        messaggi.className = nuovoRecord ? 'messaggio--successo' : '';
        return;
    }
    punteggiSfida[turno] = punti;
    aggiornaPunteggiDue();
    if (turno === 0) {
        messaggi.textContent = `${nomi[0]} ha fatto ${punti} punti.`;
        messaggi.className = '';
        turnoDue.textContent = `Ora tocca a ${nomi[1]}, con le stesse tessere.`;
        pulsanteNuova.textContent = `Gioca ${nomi[1]}`;
        return;
    }
    const [a, b] = punteggiSfida;
    if (a === b) {
        messaggi.textContent = `Pareggio: ${a} punti a testa!`;
    } else {
        const vincitore = a > b ? 0 : 1;
        messaggi.textContent = `Vince ${nomi[vincitore]} con ${Math.max(a, b)} punti!`;
    }
    messaggi.className = 'messaggio--successo';
    turnoDue.textContent = 'Sfida finita';
    pulsanteNuova.textContent = 'Nuova sfida';
}

async function nuovaPartitaClic() {
    if (!dueGiocatori) {
        casuale = Math.random;
        avviaGriglia();
        return;
    }
    if (turno === 0 && punteggiSfida[0] !== null && punteggiSfida[1] === null) {
        // tocca al secondo giocatore, con lo stesso seme del primo
        turno = 1;
        await Giocatori.passaDispositivo(nomi[1], `Passa il dispositivo a ${nomi[1]}: avrà le stesse tessere di ${nomi[0]}.`);
        iniziaTurnoDue();
        return;
    }
    nuovaSfida();
}

function iniziaTurnoDue() {
    casuale = generatore(seme);
    turnoDue.textContent = `Gioca ${nomi[turno]}`;
    pulsanteNuova.textContent = 'Ricomincia il turno';
    avviaGriglia();
}

function nuovaSfida() {
    seme = Math.floor(Math.random() * 2 ** 31);
    turno = 0;
    punteggiSfida = [null, null];
    aggiornaPunteggiDue();
    iniziaTurnoDue();
}

// Ricomincia il turno in corso (stesso seme) oppure passa al secondo giocatore
pulsanteNuova.addEventListener('click', () => {
    if (dueGiocatori && !finita && punteggiSfida[turno] === null) {
        // il primo giocatore che ricomincia riceve tessere nuove (il secondo non ha ancora giocato)
        if (turno === 0) {
            seme = Math.floor(Math.random() * 2 ** 31);
        }
        iniziaTurnoDue();
        return;
    }
    nuovaPartitaClic();
});

// Tastiera: frecce e W A S D
const TASTI = {
    ArrowUp: 'su', ArrowDown: 'giu', ArrowLeft: 'sinistra', ArrowRight: 'destra',
    KeyW: 'su', KeyS: 'giu', KeyA: 'sinistra', KeyD: 'destra'
};
document.addEventListener('keydown', evento => {
    const bersaglio = evento.target;
    if (bersaglio instanceof Element && bersaglio.matches('input, select, textarea')) {
        return;
    }
    const direzione = TASTI[evento.code];
    if (direzione) {
        evento.preventDefault();
        mossa(direzione);
    }
});

// Scorrimento del dito (o del mouse) sulla griglia
let inizioSwipe = null;
tavolo.addEventListener('pointerdown', evento => {
    inizioSwipe = { x: evento.clientX, y: evento.clientY };
});
tavolo.addEventListener('pointerup', evento => {
    if (!inizioSwipe) {
        return;
    }
    const dx = evento.clientX - inizioSwipe.x;
    const dy = evento.clientY - inizioSwipe.y;
    inizioSwipe = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < DISTANZA_SWIPE) {
        return;
    }
    if (Math.abs(dx) > Math.abs(dy)) {
        mossa(dx > 0 ? 'destra' : 'sinistra');
    } else {
        mossa(dy > 0 ? 'giu' : 'su');
    }
});

document.querySelectorAll('.comando').forEach(pulsante => {
    pulsante.addEventListener('click', () => mossa(pulsante.dataset.direzione));
});

// Sul telefono si gioca scorrendo il dito: le frecce sullo schermo si nascondono (CSS) e un'opzione del pannello
// (js/tavola.js) le fa ricomparire con la classe mostra-pulsanti, come negli arcade
if (typeof Tavola !== 'undefined') {
    Tavola.opzione({ chiave: 'giochi_js_mostra_pulsanti', etichetta: 'Mostra i pulsanti sullo schermo',
        suCambio: v => document.body.classList.toggle('mostra-pulsanti', v) });
}

Giocatori.collegaBarra({
    select: selectModalita,
    pulsanteNomi,
    suCambioModalita: due => {
        dueGiocatori = due;
        punteggiDue.hidden = !due;
        turnoDue.hidden = !due;
        pulsanteNuova.textContent = 'Nuova partita';
        aggiornaPunteggiDue();
        if (due) {
            nuovaSfida();
        } else {
            casuale = Math.random;
            avviaGriglia();
        }
    },
    suCambioNomi: nuoviNomi => {
        nomi = nuoviNomi;
        aggiornaPunteggiDue();
    }
});

aggiornaPunteggiDue();
avviaGriglia();
