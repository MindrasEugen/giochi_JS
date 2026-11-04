
const pesca = document.querySelector('#pesca');
const stai = document.querySelector('#stai');
const nuovaPartita = document.querySelector('#nuova_partita');
const carteGiocatore = document.querySelector('#carte_giocatore');
const carteBanco = document.querySelector('#carte_banco');
const punteggioG = document.querySelector('#punti_giocatore');
const punteggioB = document.querySelector('#punti_banco');
const titoloGiocatore = document.querySelector('#nome_giocatore');
const titoloBanco = document.querySelector('#nome_banco');
const messaggi = document.querySelector('#messaggi');
const contenitore = document.querySelector('.contenitore_body');
const selectModalita = document.querySelector('#modalitaGioco');
const pulsanteNomi = document.querySelector('#nomiGiocatori');
const punteggiDue = document.querySelector('#punteggiDue');
const turnoDue = document.querySelector('#turnoDue');

const mazzo = [];
let puntiGiocatore = 0;
let puntiBanco = 0;
let timerBanco;
let turnoBanco = false;   // false: pesca il giocatore; true: pesca il banco
let manoFinita = false;

// Modalità 2 giocatori: niente banco del computer, uno dei due fa il banco e i ruoli si scambiano a ogni mano
let dueGiocatori = false;
let nomi = Giocatori.leggiNomi();
let chiBanco = 1;          // indice del giocatore che fa il banco in questa mano
let maniVinte = [0, 0];

function chiGioca() {
    return 1 - chiBanco;
}

// Il CSS usa data-turno per evidenziare il riquadro di chi sta giocando
function impostaTurno(turno) {
    contenitore.dataset.turno = turno;
}

function mostraMessaggio(testo, tipo) {
    messaggi.textContent = testo;
    messaggi.className = tipo ? `messaggio--${tipo}` : '';
}

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
        fineMano('banco', dueGiocatori ? `${nomi[chiGioca()]} ha sballato! Vince il banco (${nomi[chiBanco]}).` : 'Hai sballato! Vince il banco.');
    }
}

// A 2 giocatori il banco pesca quando vuole: si ferma con "Stai" o se sballa
function bancoPescaUmano() {
    puntiBanco += pescaCarta(carteBanco);
    punteggioB.textContent = puntiBanco.toLocaleString('it-IT');
    if (puntiBanco > 7.5) {
        fineMano('giocatore', `Il banco (${nomi[chiBanco]}) ha sballato! Vince ${nomi[chiGioca()]}.`);
    }
}

// A 1 giocatore il banco del computer pesca finché raggiunge o supera il giocatore
function bancoPescaComputer() {
    if (puntiBanco < puntiGiocatore) {
        puntiBanco += pescaCarta(carteBanco);
        punteggioB.textContent = puntiBanco.toLocaleString('it-IT');
        timerBanco = setTimeout(bancoPescaComputer, 1000);
    } else if (puntiBanco > 7.5) {
        fineMano('giocatore', 'Il banco ha sballato, vince il giocatore!');
    } else {
        fineMano('banco', 'Vince il banco!');
    }
}

// "Stai": tocca al banco, oppure (se sta già pescando il banco a 2 giocatori) si confrontano i punti.
// Vince chi ha più punti; a parità vince il banco.
function staiClic() {
    if (manoFinita) return;
    if (!turnoBanco) {
        turnoBanco = true;
        impostaTurno('banco');
        if (dueGiocatori) {
            turnoDue.textContent = `Tocca al banco: ${nomi[chiBanco]}`;
            mostraMessaggio(`${nomi[chiGioca()]} sta con ${puntiGiocatore.toLocaleString('it-IT')}. Ora pesca il banco.`, '');
        } else {
            stai.disabled = true;
            pesca.disabled = true;
            mostraMessaggio('Il banco sta giocando...', 'attesa');
            timerBanco = setTimeout(bancoPescaComputer, 1000);
        }
        return;
    }
    if (puntiGiocatore > puntiBanco) {
        fineMano('giocatore', `Vince ${nomi[chiGioca()]}: ${puntiGiocatore.toLocaleString('it-IT')} contro ${puntiBanco.toLocaleString('it-IT')}.`);
    } else {
        fineMano('banco', `Vince il banco (${nomi[chiBanco]}): ${puntiBanco.toLocaleString('it-IT')} contro ${puntiGiocatore.toLocaleString('it-IT')}.`);
    }
}

function pescaClic() {
    if (manoFinita) return;
    if (turnoBanco) {
        if (dueGiocatori) bancoPescaUmano();
        return;
    }
    giocatorePesca();
}

function fineMano(vincitore, testo) {
    manoFinita = true;
    stai.disabled = true;
    pesca.disabled = true;
    impostaTurno('');
    const vinceGiocatore = vincitore === 'giocatore';
    mostraMessaggio(testo, vinceGiocatore ? 'successo' : 'errore');
    if (dueGiocatori) {
        maniVinte[vinceGiocatore ? chiGioca() : chiBanco]++;
        aggiornaPunteggi();
        turnoDue.textContent = `Nella prossima mano fa il banco ${nomi[1 - chiBanco]}`;
        nuovaPartita.textContent = 'Prossima mano';
    }
}

function aggiornaPunteggi() {
    document.querySelector('#nomeG1').textContent = nomi[0];
    document.querySelector('#nomeG2').textContent = nomi[1];
    document.querySelector('#puntiG1').textContent = maniVinte[0];
    document.querySelector('#puntiG2').textContent = maniVinte[1];
}

function aggiornaTitoli() {
    titoloGiocatore.textContent = dueGiocatori ? nomi[chiGioca()] : 'Giocatore';
    titoloBanco.textContent = dueGiocatori ? `Banco: ${nomi[chiBanco]}` : 'Banco';
}

function iniziaMano() {
    if (dueGiocatori && manoFinita) chiBanco = 1 - chiBanco;
    clearTimeout(timerBanco);
    creaMazzo();
    puntiGiocatore = 0;
    puntiBanco = 0;
    turnoBanco = false;
    manoFinita = false;
    punteggioG.textContent = '0';
    punteggioB.textContent = '0';
    carteGiocatore.textContent = '';
    carteBanco.textContent = '';
    mostraMessaggio('', '');
    impostaTurno('giocatore');
    stai.disabled = false;
    pesca.disabled = false;
    aggiornaTitoli();
    if (dueGiocatori) {
        turnoDue.textContent = `Tocca a ${nomi[chiGioca()]} (il banco è ${nomi[chiBanco]})`;
    }
    giocatorePesca();
}

pesca.addEventListener('click', pescaClic);
stai.addEventListener('click', staiClic);
nuovaPartita.addEventListener('click', iniziaMano);

Giocatori.collegaBarra({
    select: selectModalita,
    pulsanteNomi,
    suCambioModalita: due => {
        dueGiocatori = due;
        punteggiDue.hidden = !due;
        turnoDue.hidden = !due;
        chiBanco = 1;
        manoFinita = false;
        maniVinte = [0, 0];
        nuovaPartita.textContent = due ? 'Prossima mano' : 'Nuova Partita';
        aggiornaPunteggi();
        iniziaMano();
    },
    suCambioNomi: nuoviNomi => {
        nomi = nuoviNomi;
        aggiornaPunteggi();
        aggiornaTitoli();
    }
});

aggiornaPunteggi();
iniziaMano();
