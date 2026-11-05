
const contenitore = document.querySelector('#contenitore_gioco');
const tavolo = document.querySelector('#tavolo');
const messaggi = document.querySelector('#messaggi');
const selectModalita = document.querySelector('#modalitaGioco');
const selectFormato = document.querySelector('#formato');
const pulsanteNomi = document.querySelector('#nomiGiocatori');
const pulsanteNuova = document.querySelector('#nuovaPartita');
const tabelloneUno = document.querySelector('#tabelloneUno');
const punteggiDue = document.querySelector('#punteggiDue');
const turnoDue = document.querySelector('#turnoDue');

const ATTESA_COPERTURA = 900; // millisecondi in cui restano visibili due carte diverse

let stato = nuovaPartita(FORMATI.media.coppie);
let pulsanti = [];
let dueGiocatori = false;
let nomi = Giocatori.leggiNomi();
let turno = 0;
let punti = [0, 0];
let secondi = 0;
let timer = null;
let timerCopertura = null;

// Record: il numero di mosse più basso per ogni dimensione, salvato nel browser
function chiaveRecord() {
    return `giochi_js_memory_${selectFormato.value}`;
}

function leggiRecord() {
    try {
        const valore = Number(localStorage.getItem(chiaveRecord()));
        return valore > 0 ? valore : null;
    } catch (errore) {
        return null;
    }
}

function salvaRecord(mosse) {
    const attuale = leggiRecord();
    if (attuale !== null && mosse >= attuale) {
        return false;
    }
    try {
        localStorage.setItem(chiaveRecord(), String(mosse));
    } catch (errore) {
        // senza localStorage il record non si salva
    }
    return true;
}

function formattaTempo(totale) {
    const minuti = Math.floor(totale / 60);
    const resto = String(totale % 60).padStart(2, '0');
    return `${minuti}:${resto}`;
}

function aggiornaTabellone() {
    document.querySelector('#mosse').textContent = stato.mosse;
    document.querySelector('#tempo').textContent = formattaTempo(secondi);
    const record = leggiRecord();
    document.querySelector('#record').textContent = record === null ? '–' : record;
    document.querySelector('#nomeG1').textContent = nomi[0];
    document.querySelector('#nomeG2').textContent = nomi[1];
    document.querySelector('#puntiG1').textContent = punti[0];
    document.querySelector('#puntiG2').textContent = punti[1];
}

function aggiornaTurno() {
    contenitore.dataset.turno = dueGiocatori && !finita(stato) ? String(turno + 1) : '';
    if (dueGiocatori && !finita(stato)) {
        turnoDue.textContent = `Tocca a ${nomi[turno]}`;
    }
}

function avviaTempo() {
    if (timer === null) {
        timer = setInterval(() => {
            secondi++;
            document.querySelector('#tempo').textContent = formattaTempo(secondi);
        }, 1000);
    }
}

function fermaTempo() {
    clearInterval(timer);
    timer = null;
}

// Con il pannello del telefono aperto (js/tavola.js) il tempo si ferma e riparte alla chiusura
let tempoInPausa = false;
document.addEventListener('tavola:aperta', () => { if (timer !== null) { fermaTempo(); tempoInPausa = true; } });
document.addEventListener('tavola:chiusa', () => { if (tempoInPausa) { tempoInPausa = false; avviaTempo(); } });

// Ogni carta è un pulsante con due facce: il retro e il fronte con il simbolo
function creaCarte() {
    const formato = FORMATI[selectFormato.value];
    tavolo.style.setProperty('--colonne', formato.colonne);
    tavolo.textContent = '';
    pulsanti = stato.carte.map((carta, i) => {
        const pulsante = document.createElement('button');
        pulsante.type = 'button';
        pulsante.className = 'carta-memory';
        pulsante.innerHTML = '<span class="carta-memory__interno"><span class="carta-memory__retro" aria-hidden="true"></span><span class="carta-memory__fronte" aria-hidden="true"></span></span>';
        pulsante.querySelector('.carta-memory__fronte').textContent = carta.simbolo;
        pulsante.addEventListener('click', () => giraCarta(i));
        tavolo.appendChild(pulsante);
        return pulsante;
    });
    disegna();
}

function disegna() {
    stato.carte.forEach((carta, i) => {
        const pulsante = pulsanti[i];
        pulsante.classList.toggle('carta-memory--girata', carta.scoperta);
        pulsante.classList.toggle('carta-memory--trovata', carta.trovata);
        pulsante.disabled = carta.trovata;
        pulsante.setAttribute('aria-label', carta.scoperta ? `Carta ${i + 1}: ${carta.simbolo}` : `Carta ${i + 1}, coperta`);
    });
}

function giraCarta(i) {
    const esito = scopri(stato, i);
    if (esito === 'ignorata') {
        return;
    }
    if (!dueGiocatori) {
        avviaTempo();
    }
    disegna();
    if (esito === 'coppia') {
        if (dueGiocatori) {
            punti[turno]++;
        }
        aggiornaTabellone();
        if (finita(stato)) {
            fineVittoria();
        } else if (dueGiocatori) {
            turnoDue.textContent = `Coppia per ${nomi[turno]}: gioca ancora`;
        }
    } else if (esito === 'diversa') {
        aggiornaTabellone();
        timerCopertura = setTimeout(() => {
            copriDiverse(stato);
            disegna();
            if (dueGiocatori) {
                turno = 1 - turno;
                aggiornaTurno();
            }
        }, ATTESA_COPERTURA);
    }
}

function fineVittoria() {
    fermaTempo();
    aggiornaTurno();
    if (!dueGiocatori) {
        const nuovoRecord = salvaRecord(stato.mosse);
        aggiornaTabellone();
        messaggi.textContent = `Hai trovato tutte le coppie in ${stato.mosse} mosse e ${formattaTempo(secondi)}${nuovoRecord ? ': nuovo record!' : '.'}`;
        messaggi.className = 'messaggio--successo';
        return;
    }
    if (punti[0] === punti[1]) {
        messaggi.textContent = `Pareggio: ${punti[0]} coppie a testa.`;
    } else {
        const vincitore = punti[0] > punti[1] ? 0 : 1;
        messaggi.textContent = `Vince ${nomi[vincitore]} con ${punti[vincitore]} coppie!`;
    }
    messaggi.className = 'messaggio--successo';
    turnoDue.textContent = 'Partita finita';
}

function iniziaPartita() {
    clearTimeout(timerCopertura);
    fermaTempo();
    tempoInPausa = false;
    secondi = 0;
    stato = nuovaPartita(FORMATI[selectFormato.value].coppie);
    turno = 0;
    punti = [0, 0];
    messaggi.textContent = '';
    messaggi.className = '';
    tabelloneUno.hidden = dueGiocatori;
    punteggiDue.hidden = !dueGiocatori;
    turnoDue.hidden = !dueGiocatori;
    creaCarte();
    aggiornaTabellone();
    aggiornaTurno();
}

pulsanteNuova.addEventListener('click', iniziaPartita);
selectFormato.addEventListener('change', iniziaPartita);

Giocatori.collegaBarra({
    select: selectModalita,
    pulsanteNomi,
    suCambioModalita: due => {
        dueGiocatori = due;
        iniziaPartita();
    },
    suCambioNomi: nuoviNomi => {
        nomi = nuoviNomi;
        aggiornaTabellone();
        aggiornaTurno();
    }
});

iniziaPartita();
