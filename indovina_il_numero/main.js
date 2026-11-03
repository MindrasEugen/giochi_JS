

const form = document.querySelector('#form');
const input = document.querySelector('#input');
const messaggi = document.querySelector('#messaggi');
const contatore = document.querySelector('#contatore');
const button = document.querySelector('#button');
const reset = document.querySelector('#reset');
const difficolta = document.querySelector('#difficolta');

let numeroSegreto = Math.floor((Math.random() * 100) + 1);

let numeroTentativi = 0;
let limiteTentativi = 10;

difficolta.addEventListener('change', nuovaPartita);

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const tentativo = Number(input.value);
    numeroTentativi++;
    const tentativiRimanenti = limiteTentativi - numeroTentativi;
    contatore.textContent = `Tentativi fatti: ${numeroTentativi} - Tentativi rimanenti: ${tentativiRimanenti} `;
    if (tentativo === numeroSegreto) {
        messaggi.className = 'messaggio--successo';
        messaggi.textContent = `Hai indovinato in ${numeroTentativi} tentativi!`;
        button.disabled = true;
        input.disabled = true;
    }else if (numeroTentativi >= limiteTentativi){
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
    contatore.textContent = `Tentativi fatti: ${numeroTentativi} - Tentativi rimanenti: ${limiteTentativi} `;
    messaggi.className = '';
    messaggi.textContent = '';
    
};

nuovaPartita();