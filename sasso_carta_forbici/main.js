
const carta = document.querySelector('#carta');
const forbici = document.querySelector('#forbici');
const sasso = document.querySelector('#sasso');
const sceltaPc = document.querySelector('.sceltaPc');
const risultato = document.querySelector('.risultato');
const puntiTu = document.querySelector('#puntiGiocatore');
const puntiPc = document.querySelector('#puntiComputer');
const manoGiocatore = document.querySelector('#manoGiocatore');
const manoComputer = document.querySelector('#manoComputer');
const nuovaPartita = document.querySelector('#nuovaPartita');
const selectModalita = document.querySelector('#modalitaGioco');
const pulsanteNomi = document.querySelector('#nomiGiocatori');
const turnoDue = document.querySelector('#turnoDue');
const nomeGiocatore = document.querySelector('#nomeGiocatore');
const nomeComputer = document.querySelector('#nomeComputer');


const scelte = ['carta', 'forbici', 'sasso'];
const icone = { carta: '✋', forbici: '✌️', sasso: '✊' };

let puntiGiocatore = 0;
let puntiComputer = 0;

// Modalità 2 giocatori: "giocatore" è il giocatore 1, "computer" diventa il giocatore 2.
// Il giocatore 1 sceglie per primo; la sua scelta resta coperta finché non sceglie anche il 2.
let dueGiocatori = false;
let nomi = Giocatori.leggiNomi();
let sceltaInAttesa = null;
aggiornaPunteggio();


function aggiornaPunteggio() {
    puntiTu.textContent = puntiGiocatore;
    puntiPc.textContent = puntiComputer;
}

// Mostra le due mani nell'arena e fa ripartire l'animazione di entrata
function mostraMani(sceltaGiocatore, sceltaComputer) {
    manoGiocatore.textContent = icone[sceltaGiocatore];
    manoComputer.textContent = icone[sceltaComputer];
    const mani = [manoGiocatore, manoComputer];
    for (let i = 0; i < mani.length; i++) {
        mani[i].classList.remove('mano--entra');
        void mani[i].offsetWidth; // forza il browser a "dimenticare" l'animazione precedente
        mani[i].classList.add('mano--entra');
    }
}

function giocaTurno(sceltaGiocatore) {
    if (dueGiocatori) {
        sceltaDue(sceltaGiocatore);
        return;
    }
    const indiceCasuale = Math.floor(Math.random() * 3);
    sceltaPc.textContent = `Scelta del PC: ${scelte[indiceCasuale]}`;
    confronta(sceltaGiocatore, scelte[indiceCasuale]);
}

// Confronta le due scelte, assegna il punto e controlla la fine della partita
function confronta(sceltaGiocatore, sceltaAvversario) {
    mostraMani(sceltaGiocatore, sceltaAvversario);

    if (sceltaGiocatore === sceltaAvversario) {
        risultato.textContent = 'Pareggio!';
        risultato.className = 'risultato';
    } else if ((sceltaGiocatore === 'carta' && sceltaAvversario === 'sasso') || (sceltaGiocatore === 'forbici' && sceltaAvversario === 'carta') || (sceltaGiocatore === 'sasso' && sceltaAvversario === 'forbici')) {
        risultato.textContent = dueGiocatori ? `${nomi[0]} vince il turno!` : 'Hai vinto il turno!';
        risultato.className = 'risultato messaggio--successo';
        ++puntiGiocatore
    } else {
        risultato.textContent = dueGiocatori ? `${nomi[1]} vince il turno!` : 'Hai perso il turno!';
        risultato.className = 'risultato messaggio--errore';
        ++puntiComputer
    };
    aggiornaPunteggio();
    finePartita();
}

// A 2 giocatori: la prima scelta viene messa da parte, poi si passa il dispositivo
async function sceltaDue(scelta) {
    if (sceltaInAttesa === null) {
        sceltaInAttesa = scelta;
        manoGiocatore.textContent = '❔';
        manoComputer.textContent = '❔';
        risultato.textContent = `${nomi[0]} ha scelto.`;
        risultato.className = 'risultato';
        await Giocatori.passaDispositivo(nomi[1], `${nomi[0]} ha fatto la sua scelta. Passa il dispositivo a ${nomi[1]}.`);
        turnoDue.textContent = `Tocca a ${nomi[1]}`;
        return;
    }
    const primaScelta = sceltaInAttesa;
    sceltaInAttesa = null;
    sceltaPc.textContent = `Scelta di ${nomi[0]}: ${primaScelta}. Scelta di ${nomi[1]}: ${scelta}`;
    confronta(primaScelta, scelta);
    if (!carta.disabled) {
        turnoDue.textContent = `Tocca a ${nomi[0]}`;
    }
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
        risultato.textContent = dueGiocatori ? `${nomi[0]} vince la partita!!` : 'Hai vinto la partita!!';
        risultato.className = 'risultato messaggio--successo risultato--finale';
        carta.disabled = true;
        forbici.disabled = true;
        sasso.disabled = true;
    } else if (puntiComputer === 5) {
        risultato.textContent = dueGiocatori ? `${nomi[1]} vince la partita!!` : 'Hai perso la partita!'
        risultato.className = 'risultato messaggio--errore risultato--finale';
        carta.disabled = true;
        forbici.disabled = true;
        sasso.disabled = true;
    }
    if (carta.disabled) {
        turnoDue.textContent = 'Partita finita';
    }
};

function aggiornaNomi() {
    nomeGiocatore.textContent = dueGiocatori ? nomi[0] : 'Tu';
    nomeComputer.textContent = dueGiocatori ? nomi[1] : 'PC';
}

nuovaPartita.addEventListener('click', ricomincia);

function ricomincia() {
    sceltaInAttesa = null;
    turnoDue.textContent = `Tocca a ${nomi[0]}`;
    carta.disabled = false;
    forbici.disabled = false;
    sasso.disabled = false;
    puntiComputer = 0;
    puntiGiocatore = 0;
    risultato.className = 'risultato';
    risultato.textContent = 'Buona fortuna!';
    sceltaPc.textContent = '';
    manoGiocatore.textContent = '❔';
    manoComputer.textContent = '❔';
    aggiornaPunteggio();
}

Giocatori.collegaBarra({
    select: selectModalita,
    pulsanteNomi,
    suCambioModalita: due => {
        dueGiocatori = due;
        turnoDue.hidden = !due;
        aggiornaNomi();
        ricomincia();
    },
    suCambioNomi: nuoviNomi => {
        nomi = nuoviNomi;
        aggiornaNomi();
    }
});
