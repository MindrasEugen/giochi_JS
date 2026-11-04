

const form = document.querySelector('#form');
const input = document.querySelector('#input');
const messaggi = document.querySelector('#messaggi');
const contatore = document.querySelector('#contatore');
const button = document.querySelector('#button');
const reset = document.querySelector('#reset');
const difficolta = document.querySelector('#difficolta');
const fatti = document.querySelector('#fatti');
const rimanenti = document.querySelector('#rimanenti');
const intervallo = document.querySelector('#intervallo');
const storico = document.querySelector('#storico');
const selectModalita = document.querySelector('#modalitaGioco');
const pulsanteNomi = document.querySelector('#nomiGiocatori');
const punteggiDue = document.querySelector('#punteggiDue');
const turnoDue = document.querySelector('#turnoDue');
const sottotitolo = document.querySelector('.sottotitolo');

let numeroSegreto = Math.floor((Math.random() * 100) + 1);

let numeroTentativi = 0;
let limiteTentativi = 10;
// intervallo in cui può ancora trovarsi il numero: si stringe a ogni tentativo
let minimo = 1;
let massimo = 100;

// Modalità 2 giocatori: una sfida ha due turni; nel primo il giocatore 1 sceglie il numero e il 2 indovina,
// nel secondo il contrario. Vince la sfida chi indovina con meno tentativi.
let dueGiocatori = false;
let nomi = Giocatori.leggiNomi();
let punti = [0, 0];
let turnoSfida = 0;           // 0 o 1
let tentativiSfida = [0, 0];  // tentativi usati da ciascun giocatore per indovinare
let sfidaFinita = true;

difficolta.addEventListener('change', nuovaPartita);

function aggiornaTabellone() {
    const tentativiRimanenti = limiteTentativi - numeroTentativi;
    fatti.textContent = numeroTentativi;
    rimanenti.textContent = tentativiRimanenti;
    intervallo.textContent = `${minimo} – ${massimo}`;
    contatore.textContent = `Tentativi fatti: ${numeroTentativi} - Tentativi rimanenti: ${tentativiRimanenti} `;
}

// Aggiunge il tentativo allo storico, con una freccia che indica dove cercare
function aggiungiAlloStorico(tentativo, tipo) {
    const voce = document.createElement('li');
    voce.className = `storico__voce storico__voce--${tipo}`;
    const frecce = { alto: '↓', basso: '↑', giusto: '✓' };
    voce.textContent = `${tentativo} ${frecce[tipo]}`;
    storico.appendChild(voce);
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const tentativo = Number(input.value);
    numeroTentativi++;
    if (tentativo === numeroSegreto) {
        messaggi.className = 'messaggio--successo';
        messaggi.textContent = `Hai indovinato in ${numeroTentativi} tentativi!`;
        aggiungiAlloStorico(tentativo, 'giusto');
        minimo = numeroSegreto;
        massimo = numeroSegreto;
        button.disabled = true;
        input.disabled = true;
        fineTentativi(true);
    } else {
        if (tentativo > numeroSegreto) {
            massimo = Math.min(massimo, tentativo - 1);
            aggiungiAlloStorico(tentativo, 'alto');
        } else {
            minimo = Math.max(minimo, tentativo + 1);
            aggiungiAlloStorico(tentativo, 'basso');
        }

        if (numeroTentativi >= limiteTentativi) {
            button.disabled = true;
            input.disabled = true;
            messaggi.className = 'messaggio--errore';
            messaggi.textContent = `Hai finito i tentativi... Il numero segreto era: ${numeroSegreto}`
            fineTentativi(false);
        } else if (tentativo > numeroSegreto) {
            messaggi.className = 'messaggio--avviso';
            messaggi.textContent = 'Troppo alto';
        } else {
            messaggi.className = 'messaggio--avviso';
            messaggi.textContent = 'Troppo basso';
        };

        // campo vuoto e pronto per il prossimo numero
        input.value = '';
        input.focus();
    }
    aggiornaTabellone();
});

reset.addEventListener('click', () => {
    if (dueGiocatori && !sfidaFinita) {
        avviaTurnoDue();
    } else {
        nuovaPartita();
    }
});

function nuovaPartita(){
    if (dueGiocatori) {
        turnoSfida = 0;
        tentativiSfida = [0, 0];
        sfidaFinita = false;
        avviaTurnoDue();
        return;
    }
    preparaTentativi(Math.floor((Math.random() * 100) + 1));
}

// Azzera il gioco per indovinare il numero indicato
function preparaTentativi(numero) {
    limiteTentativi = Number(difficolta.value);
    numeroSegreto = numero;
    input.disabled = false;
    input.focus();
    input.value = '';
    button.disabled = false;
    numeroTentativi = 0;
    minimo = 1;
    massimo = 100;
    storico.textContent = '';
    aggiornaTabellone();
    messaggi.className = '';
    messaggi.textContent = '';

};

function controllaNumero(testo) {
    const numero = Number(testo);
    return Number.isInteger(numero) && numero >= 1 && numero <= 100 ? '' : 'Scrivi un numero intero da 1 a 100.';
}

function aggiornaPunteggi() {
    document.querySelector('#nomeG1').textContent = nomi[0];
    document.querySelector('#nomeG2').textContent = nomi[1];
    document.querySelector('#puntiG1').textContent = punti[0];
    document.querySelector('#puntiG2').textContent = punti[1];
}

// Un turno della sfida: chi sceglie scrive il numero di nascosto, poi passa il dispositivo a chi indovina
async function avviaTurnoDue() {
    const sceglie = turnoSfida;
    const indovina = 1 - sceglie;
    button.disabled = true;
    input.disabled = true;
    turnoDue.textContent = `${nomi[sceglie]} sceglie il numero…`;
    const numero = await Giocatori.chiediSegreto({
        titolo: `${nomi[sceglie]}, scegli il numero`,
        testo: `${nomi[indovina]} non deve guardare lo schermo.`,
        etichetta: 'Numero segreto (da 1 a 100)',
        numerico: true,
        controlla: controllaNumero
    });
    await Giocatori.passaDispositivo(nomi[indovina], `Passa il dispositivo a ${nomi[indovina]}: deve indovinare il numero scelto da ${nomi[sceglie]}.`);
    turnoDue.textContent = `Indovina: ${nomi[indovina]} · Numero scelto da: ${nomi[sceglie]}`;
    sottotitolo.textContent = `${nomi[sceglie]} ha pensato un numero da 1 a 100. ${nomi[indovina]}, riesci a trovarlo?`;
    reset.textContent = 'Ricomincia il turno';
    preparaTentativi(Number(numero));
}

// Fine dei tentativi di un turno: chi non indovina conta come "limite + 1" tentativi
function fineTentativi(indovinato) {
    if (!dueGiocatori) {
        return;
    }
    const indovina = 1 - turnoSfida;
    tentativiSfida[indovina] = indovinato ? numeroTentativi : limiteTentativi + 1;
    if (turnoSfida === 0) {
        turnoSfida = 1;
        turnoDue.textContent = `Ora tocca a ${nomi[1]} scegliere il numero e a ${nomi[0]} indovinarlo.`;
        reset.textContent = 'Turno successivo';
        return;
    }
    // Secondo turno finito: confronto dei tentativi
    sfidaFinita = true;
    const [a, b] = tentativiSfida;
    let esito;
    if (a === b) {
        esito = 'Pareggio!';
    } else {
        const vincitore = a < b ? 0 : 1;
        punti[vincitore]++;
        esito = `Vince ${nomi[vincitore]}!`;
    }
    aggiornaPunteggi();
    const descrivi = i => tentativiSfida[i] > limiteTentativi ? 'non ha indovinato' : `${tentativiSfida[i]} tentativi`;
    turnoDue.textContent = `${esito} ${nomi[0]}: ${descrivi(0)} · ${nomi[1]}: ${descrivi(1)}`;
    reset.textContent = 'Nuova sfida';
}

function impostaModalita(due) {
    dueGiocatori = due;
    punti = [0, 0];
    punteggiDue.hidden = !due;
    turnoDue.hidden = !due;
    reset.textContent = 'Nuova partita';
    if (!due) {
        sottotitolo.textContent = 'Il computer ha pensato un numero da 1 a 100. Riesci a trovarlo?';
    }
    aggiornaPunteggi();
    nuovaPartita();
}

Giocatori.collegaBarra({
    select: selectModalita,
    pulsanteNomi,
    suCambioModalita: impostaModalita,
    suCambioNomi: nuoviNomi => {
        nomi = nuoviNomi;
        aggiornaPunteggi();
    }
});

nuovaPartita();
