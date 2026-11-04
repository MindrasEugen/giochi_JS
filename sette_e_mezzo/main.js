
const pesca = document.querySelector('#pesca');
const stai = document.querySelector('#stai');
const nuovaPartita = document.querySelector('#nuova_partita');
const carteGiocatore = document.querySelector('#carte_giocatore');
const carteBanco = document.querySelector('#carte_banco');
const punteggioG = document.querySelector('#punti_giocatore');
const punteggioB = document.querySelector('#punti_banco');
const messaggi = document.querySelector('#messaggi');


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


// Mazzo italiano mescolato, preso dallo script condiviso js/mazzo.js
function creaMazzo() {
    mazzo.length = 0;
    mazzo.push(...Mazzo.mescola(Mazzo.italiano()));
}

// Fante, cavallo e re (numeri 8, 9, 10) valgono mezzo punto; le altre carte il loro numero
function puntiCarta(carta) {
    return carta.numero >= 8 ? 0.5 : carta.numero;
}

// Pesca la prima carta del mazzo, la mostra nel riquadro indicato e restituisce i suoi punti
function pescaCarta(riquadro) {
    const carta = Mazzo.pesca(mazzo, 1)[0];
    riquadro.appendChild(Carte.crea(carta));
    return puntiCarta(carta);
}

function giocatorePesca() {
    puntiGiocatore += pescaCarta(carteGiocatore);
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
        puntiBanco += pescaCarta(carteBanco);
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