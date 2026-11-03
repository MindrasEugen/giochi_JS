
const celle = document.querySelectorAll('.cella');
const messaggi = document.querySelector('#messaggi');
const nuovaPartita = document.querySelector('#nuovaPartita');
const punteggioX = document.querySelector('#punteggio_giocatore_X');
const punteggioO = document.querySelector('#punteggio_giocatore_O');
const azzera = document.querySelector('#azzera');
const modalita = document.querySelector('#modalita');

let vittorieX = 0;
let vittorieO = 0;
let giocatoreCorrente = 'X';
const combinazioniVincenti = [
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8]
];
let partitaFinita = false;

for (let i = 0; i < celle.length; i++) {
    celle[i].addEventListener('click', () => {
        if (celle[i].textContent === '' && partitaFinita === false) {
            celle[i].textContent = giocatoreCorrente;
            giocatoreCorrente === 'X' ? giocatoreCorrente = 'O' : giocatoreCorrente = 'X';
            messaggi.textContent = `E il turno di: ${giocatoreCorrente}`;
            controllaVincitore()
            if(modalita.value === 'controPC' && partitaFinita === false){
                mossaPC();
            }
        }
    })
};

nuovaPartita.addEventListener('click', iniziaPartita);
azzera.addEventListener('click', azzeraPunteggi);
modalita.addEventListener('change',azzeraPunteggi);



