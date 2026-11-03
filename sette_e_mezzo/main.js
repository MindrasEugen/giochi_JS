
const pesca = document.querySelector('#pesca');
const stai = document.querySelector('#stai');
const nuovaPartita = document.querySelector('#nuova_partita');
const carteGiocatore = document.querySelector('#carte_giocatore');
const carteBanco = document.querySelector('#carte_banco');
const punteggioG = document.querySelector('#punti_giocatore');
const punteggioB = document.querySelector('#punti_banco');
const messaggi = document.querySelector('#messaggi');


const semi = ['bastoni', 'coppe', 'denari', 'spade'];
const nomiCarte = ['asso', '2', '3', '4', '5', '6', '7', 'fante', 'cavallo', 're'];
const mazzo = [];
let puntiGiocatore = 0;
let puntiBanco = 0;
let timerBanco;
const contenitore = document.querySelector('.contenitore_body');

// Il CSS usa data-turno per evidenziare il riquadro di chi sta giocando
function impostaTurno(turno) {
    contenitore.dataset.turno = turno;
}

function mostraMessaggio(testo, tipo) {
    messaggi.textContent = testo;
    messaggi.className = tipo ? `messaggio--${tipo}` : '';
}


creaMazzo();


function creaMazzo() {
    mazzo.length = 0;
    for (let i = 0; i < semi.length; i++) {
        for (let j = 0; j < nomiCarte.length; j++) {
            let valore;
            if (nomiCarte[j] === 'fante' || nomiCarte[j] === 'cavallo' || nomiCarte[j] === 're') {
                valore = 0.5;
            } else if (nomiCarte[j] === 'asso') {
                valore = 1;
            } else {
                valore = Number(nomiCarte[j]);
            }
            mazzo.push({ nome: nomiCarte[j], seme: semi[i], immagine: `./pic/${nomiCarte[j]}-${semi[i]}.png`, valore: valore });
        }
    };
}

function giocatorePesca() {
    const carteEstrate = mazzo.splice(Math.floor(Math.random() * mazzo.length), 1);
    const immagineCarta = document.createElement('img');
    immagineCarta.src = carteEstrate[0].immagine;
    immagineCarta.alt = `${carteEstrate[0].nome} di ${carteEstrate[0].seme}`;
    carteGiocatore.appendChild(immagineCarta);
    puntiGiocatore += carteEstrate[0].valore;
    punteggioG.textContent = puntiGiocatore.toLocaleString('it-IT');

    if (puntiGiocatore > 7.5) {
        mostraMessaggio('Hai sballato! Vince il banco.', 'errore');
        impostaTurno('');
        stai.disabled = true;
        pesca.disabled = true;
    }
}

function bancoPesca() {
    if (puntiBanco < puntiGiocatore) {
        const carteEstrate = mazzo.splice(Math.floor(Math.random() * mazzo.length), 1);
        const immagineCarta = document.createElement('img');
        immagineCarta.src = carteEstrate[0].immagine;
        immagineCarta.alt = `${carteEstrate[0].nome} di ${carteEstrate[0].seme}`;
        carteBanco.appendChild(immagineCarta);
        puntiBanco += carteEstrate[0].valore;
        punteggioB.textContent = puntiBanco.toLocaleString('it-IT');
        timerBanco = setTimeout(bancoPesca, 1000);
    } else if (puntiBanco > 7.5) {
        mostraMessaggio('Il banco ha sballato, vince il giocatore!', 'successo');
        impostaTurno('');
    } else {
        mostraMessaggio('Vince il banco!', 'errore');
        impostaTurno('');
    }
}



pesca.addEventListener('click', giocatorePesca);


stai.addEventListener('click', () => {
    stai.disabled = true;
    pesca.disabled = true;
    mostraMessaggio('Il banco sta giocando...', 'attesa');
    impostaTurno('banco');
    timerBanco = setTimeout(() => {
        bancoPesca();
    }, 1000)
});

nuovaPartita.addEventListener('click', () => {
    clearTimeout(timerBanco);
    puntiBanco = 0;
    puntiGiocatore = 0;
    punteggioB.textContent = '0';
    punteggioG.textContent = '0';
    mostraMessaggio('', '');
    impostaTurno('giocatore');
    carteGiocatore.textContent = '';
    carteBanco.textContent = '';
    creaMazzo();
    stai.disabled = false;
    pesca.disabled = false;
    giocatorePesca();
});


impostaTurno('giocatore');
giocatorePesca();