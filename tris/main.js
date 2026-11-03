
const celle = document.querySelectorAll('.cella');
const messaggi = document.querySelector('#messaggi');
const nuovaPartita = document.querySelector('#nuovaPartita');
const punteggioX = document.querySelector('#punteggio_giocatore_X');
const punteggioO = document.querySelector('#punteggio_giocatore_O');
const azzera = document.querySelector('#azzera');
const modalita = document.querySelector('#modalita');
const difficolta = document.querySelector('#difficolta');
const contenitore = document.querySelector('#contenitore_body');
const nomeX = document.querySelector('#nome_giocatore_X');
const nomeO = document.querySelector('#nome_giocatore_O');

// Stato della partita: la pagina viene sempre ridisegnata a partire da qui
let caselle = ['', '', '', '', '', '', '', '', ''];
let vittorieX = 0;
let vittorieO = 0;
let giocatoreCorrente = 'X';
let partitaFinita = false;

function disegnaGriglia() {
    const riga = rigaVincente(caselle);
    for (let i = 0; i < celle.length; i++) {
        celle[i].textContent = caselle[i];
        celle[i].setAttribute('aria-label', `Casella ${i + 1}: ${caselle[i] === '' ? 'vuota' : caselle[i]}`);
        if (caselle[i] === '') {
            delete celle[i].dataset.simbolo;
        } else {
            celle[i].dataset.simbolo = caselle[i];
        }
        // le tre caselle del tris vengono evidenziate dal CSS
        celle[i].classList.toggle('cella--vincente', riga !== null && riga.includes(i));
    }
}

// Il CSS usa data-turno per evidenziare chi deve muovere e per l'anteprima del simbolo
function aggiornaTurno() {
    contenitore.dataset.turno = partitaFinita ? '' : giocatoreCorrente;
}

// Nomi sul tabellone: contro il PC la O è il computer
function aggiornaNomi() {
    const controPC = modalita.value === 'controPC';
    nomeX.textContent = controPC ? 'Tu' : 'Giocatore X';
    nomeO.textContent = controPC ? 'Computer' : 'Giocatore O';
}

function aggiornaPunteggi() {
    punteggioX.textContent = vittorieX;
    punteggioO.textContent = vittorieO;
}

function controllaFinePartita() {
    const vincitore = trovaVincitore(caselle);
    if (vincitore !== null) {
        messaggi.textContent = `Il vincitore è ${vincitore}`;
        partitaFinita = true;
        if (vincitore === 'X') {
            vittorieX++;
        } else {
            vittorieO++;
        }
        aggiornaPunteggi();
    } else if (grigliaPiena(caselle)) {
        messaggi.textContent = 'Pareggio';
        partitaFinita = true;
    }
}

function giocaMossa(indice) {
    caselle[indice] = giocatoreCorrente;
    disegnaGriglia();
    controllaFinePartita();
    if (partitaFinita === false) {
        giocatoreCorrente === 'X' ? giocatoreCorrente = 'O' : giocatoreCorrente = 'X';
        messaggi.textContent = `È il turno di: ${giocatoreCorrente}`;
    }
    aggiornaTurno();
}

function iniziaPartita() {
    caselle = ['', '', '', '', '', '', '', '', ''];
    giocatoreCorrente = 'X';
    partitaFinita = false;
    disegnaGriglia();
    aggiornaTurno();
    messaggi.textContent = 'Comincia X';
}

function azzeraPunteggi() {
    vittorieX = 0;
    vittorieO = 0;
    aggiornaPunteggi();
    iniziaPartita();
}

// La difficoltà serve solo quando si gioca contro il PC
function aggiornaDifficolta() {
    difficolta.disabled = modalita.value !== 'controPC';
}

for (let i = 0; i < celle.length; i++) {
    celle[i].addEventListener('click', () => {
        if (caselle[i] === '' && partitaFinita === false) {
            giocaMossa(i);
            if (modalita.value === 'controPC' && partitaFinita === false) {
                giocaMossa(mossaPC(caselle, difficolta.value));
            }
        }
    })
};

nuovaPartita.addEventListener('click', iniziaPartita);
azzera.addEventListener('click', azzeraPunteggi);
modalita.addEventListener('change', () => {
    aggiornaDifficolta();
    aggiornaNomi();
    azzeraPunteggi();
});
difficolta.addEventListener('change', azzeraPunteggi);

aggiornaDifficolta();
aggiornaNomi();
iniziaPartita();
