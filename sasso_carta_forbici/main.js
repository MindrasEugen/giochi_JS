console.log('caricato');


const carta = document.querySelector('#carta');
const forbici = document.querySelector('#forbici');
const sasso = document.querySelector('#sasso');
const sceltaPc = document.querySelector('.sceltaPc');
const risultato = document.querySelector('.risultato');
const punteggio = document.querySelector('.punteggio');
const nuovaPartita = document.querySelector('#nuovaPartita');


const scelte = ['carta', 'forbici', 'sasso'];

let puntiGiocatore = 0;
let puntiComputer = 0;
punteggio.textContent = `I tuoi punti: ${puntiGiocatore}  I punti del PC: ${puntiComputer}`;


function giocaTurno(sceltaGiocatore) {
    const indiceCasuale = Math.floor(Math.random() * 3);
    sceltaPc.textContent = `Scelta del PC: ${scelte[indiceCasuale]}`;

    if (sceltaGiocatore === scelte[indiceCasuale]) {
        risultato.textContent = 'Pareggio!';
        risultato.style.color = '';
        risultato.style.fontWeight = '';
    } else if ((sceltaGiocatore === 'carta' && scelte[indiceCasuale] === 'sasso') || (sceltaGiocatore === 'forbici' && scelte[indiceCasuale] === 'carta') || (sceltaGiocatore === 'sasso' && scelte[indiceCasuale] === 'forbici')) {
        risultato.textContent = 'Hai vinto il turno!';
        risultato.style.color = 'green';
        risultato.style.fontWeight = '';
        ++puntiGiocatore
    } else {
        risultato.textContent = 'Hai perso il turno!';
        risultato.style.color = 'red';
        risultato.style.fontWeight = '';
        ++puntiComputer
    };
    punteggio.textContent = `I tuoi punti: ${puntiGiocatore}  I punti del PC: ${puntiComputer}`;
    finePartita();
}

carta.addEventListener('click', () => {
    giocaTurno('carta')
});
forbici.addEventListener('click', () => {
    giocaTurno('forbici')
});

sasso.addEventListener('click', () => {
    giocaTurno('sasso')
});

function finePartita() {
    if (puntiGiocatore === 5) {
        risultato.textContent = 'Hai vinto la partita!!';
        risultato.style.color = 'green';
        risultato.style.fontWeight = 'bold';
        carta.disabled = true;
        forbici.disabled = true;
        sasso.disabled = true;
    } else if (puntiComputer === 5) {
        risultato.textContent = 'Hai perso la partita!'
        risultato.style.color = 'red';
        risultato.style.fontWeight = 'bold';
        carta.disabled = true;
        forbici.disabled = true;
        sasso.disabled = true;
    }
};

nuovaPartita.addEventListener('click', () => {
    carta.disabled = false;
    forbici.disabled = false;
    sasso.disabled = false;
    puntiComputer = 0;
    puntiGiocatore = 0;
    risultato.style.color = '';
    risultato.textContent = 'Buona fortuna!';
    risultato.style.fontWeight = '';
    sceltaPc.textContent = '';
    punteggio.textContent = `I tuoi punti: ${puntiGiocatore}  I punti del PC: ${puntiComputer}`;
});
