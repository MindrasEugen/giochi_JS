
const celle = document.querySelectorAll('.cella');
const messaggi = document.querySelector('#messaggi');
const nuovaPartita = document.querySelector('#nuovaPartita');
const punteggioX = document.querySelector('#punteggio_giocatore_X');
const punteggioO = document.querySelector('#punteggio_giocatore_O');
const azzera = document.querySelector('#azzera');
const modalita = document.querySelector('#modalita');
const difficolta = document.querySelector('#difficolta');

// Stato della partita: la pagina viene sempre ridisegnata a partire da qui
let caselle = ['', '', '', '', '', '', '', '', ''];
let vittorieX = 0;
let vittorieO = 0;
let giocatoreCorrente = 'X';
let partitaFinita = false;

function disegnaGriglia() {
    for (let i = 0; i < celle.length; i++) {
        celle[i].textContent = caselle[i];
        if (caselle[i] === '') {
            delete celle[i].dataset.simbolo;
        } else {
            celle[i].dataset.simbolo = caselle[i];
        }
    }
}

function aggiornaPunteggi() {
    punteggioX.textContent = `Punteggio X: ${vittorieX}`;
    punteggioO.textContent = `Punteggio O: ${vittorieO}`;
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
}

function iniziaPartita() {
    caselle = ['', '', '', '', '', '', '', '', ''];
    giocatoreCorrente = 'X';
    partitaFinita = false;
    disegnaGriglia();
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
    azzeraPunteggi();
});
difficolta.addEventListener('change', azzeraPunteggi);

aggiornaDifficolta();
iniziaPartita();
