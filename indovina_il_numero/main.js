

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

let numeroSegreto = Math.floor((Math.random() * 100) + 1);

let numeroTentativi = 0;
let limiteTentativi = 10;
// intervallo in cui può ancora trovarsi il numero: si stringe a ogni tentativo
let minimo = 1;
let massimo = 100;

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

reset.addEventListener('click', nuovaPartita)

function nuovaPartita(){
    limiteTentativi = Number(difficolta.value);
    numeroSegreto = Math.floor((Math.random() * 100) + 1);
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

nuovaPartita();
