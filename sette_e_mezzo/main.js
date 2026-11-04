
const pesca = document.querySelector('#pesca');
const stai = document.querySelector('#stai');
const nuovaPartita = document.querySelector('#nuova_partita');
const carteBanco = document.querySelector('#carte_banco');
const punteggioB = document.querySelector('#punti_banco');
const messaggi = document.querySelector('#messaggi');
const contenitore = document.querySelector('.contenitore_body');
const riquadroGiocatore2 = document.querySelector('.contenitore_giocatore2');
const selectModalita = document.querySelector('#modalitaGioco');
const pulsanteNomi = document.querySelector('#nomiGiocatori');
const turnoDue = document.querySelector('#turnoDue');

// Per ogni giocatore: riquadro delle carte, pillola dei punti e titolo
const giocatori = [
    { carte: document.querySelector('#carte_giocatore'), punteggio: document.querySelector('#punti_giocatore'), titolo: document.querySelector('#nome_giocatore') },
    { carte: document.querySelector('#carte_giocatore2'), punteggio: document.querySelector('#punti_giocatore2'), titolo: document.querySelector('#nome_giocatore2') }
];

const mazzo = [];
let punti = [0, 0];          // punti di ciascun giocatore
let sballato = [false, false];
let puntiBanco = 0;
let timerBanco;
let attivo = 0;              // indice del giocatore che sta pescando

// Modalità 2 giocatori: i due giocatori giocano uno dopo l'altro contro lo stesso banco
let dueGiocatori = false;
let nomi = Giocatori.leggiNomi();

function numeroGiocatori() {
    return dueGiocatori ? 2 : 1;
}

// Il CSS usa data-turno per evidenziare il riquadro di chi sta giocando
function impostaTurno(turno) {
    contenitore.dataset.turno = turno;
}

function mostraMessaggio(testo, tipo) {
    messaggi.textContent = testo;
    messaggi.className = tipo ? `messaggio--${tipo}` : '';
}

function nome(indice) {
    return dueGiocatori ? nomi[indice] : 'Giocatore';
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

function daiCarta(indice) {
    punti[indice] += pescaCarta(giocatori[indice].carte);
    giocatori[indice].punteggio.textContent = punti[indice].toLocaleString('it-IT');
}

function giocatorePesca() {
    daiCarta(attivo);
    if (punti[attivo] > 7.5) {
        sballato[attivo] = true;
        if (dueGiocatori) {
            mostraMessaggio(`${nomi[attivo]} ha sballato!`, 'errore');
            prossimoTurno();
        } else {
            mostraMessaggio('Hai sballato! Vince il banco.', 'errore');
            impostaTurno('');
            stai.disabled = true;
            pesca.disabled = true;
        }
    }
}

// Dopo "Stai" o uno sballo: tocca al giocatore 2, oppure al banco
function prossimoTurno() {
    if (dueGiocatori && attivo === 0) {
        attivo = 1;
        impostaTurno('giocatore2');
        turnoDue.textContent = `Tocca a ${nomi[1]}`;
        return;
    }
    stai.disabled = true;
    pesca.disabled = true;
    if (sballato.slice(0, numeroGiocatori()).every(s => s)) {
        // hanno sballato tutti: il banco vince senza giocare
        mostraMessaggio(dueGiocatori ? 'Avete sballato tutti e due: vince il banco!' : 'Hai sballato! Vince il banco.', 'errore');
        impostaTurno('');
        turnoDue.textContent = 'Mano finita';
        return;
    }
    mostraMessaggio('Il banco sta giocando...', 'attesa');
    impostaTurno('banco');
    turnoDue.textContent = 'Gioca il banco';
    timerBanco = setTimeout(bancoPesca, 1000);
}

// Il banco deve raggiungere il punteggio più alto tra i giocatori che non hanno sballato
function obiettivoBanco() {
    let obiettivo = 0;
    for (let i = 0; i < numeroGiocatori(); i++) {
        if (!sballato[i]) {
            obiettivo = Math.max(obiettivo, punti[i]);
        }
    }
    return obiettivo;
}

function bancoPesca() {
    if (puntiBanco < obiettivoBanco()) {
        puntiBanco += pescaCarta(carteBanco);
        punteggioB.textContent = puntiBanco.toLocaleString('it-IT');
        timerBanco = setTimeout(bancoPesca, 1000);
    } else {
        risultati();
    }
}

// Chi non ha sballato vince solo se il banco sballa o se ha più punti del banco (a parità vince il banco)
function vincitori() {
    const lista = [];
    for (let i = 0; i < numeroGiocatori(); i++) {
        if (!sballato[i] && (puntiBanco > 7.5 || punti[i] > puntiBanco)) {
            lista.push(i);
        }
    }
    return lista;
}

function risultati() {
    impostaTurno('');
    turnoDue.textContent = 'Mano finita';
    const vinti = vincitori();
    if (!dueGiocatori) {
        if (puntiBanco > 7.5) {
            mostraMessaggio('Il banco ha sballato, vince il giocatore!', 'successo');
        } else {
            mostraMessaggio('Vince il banco!', 'errore');
        }
        return;
    }
    if (vinti.length === 0) {
        mostraMessaggio('Vince il banco!', 'errore');
    } else {
        const chi = vinti.map(i => nomi[i]).join(' e ');
        const inizio = puntiBanco > 7.5 ? 'Il banco ha sballato: ' : '';
        mostraMessaggio(`${inizio}${vinti.length > 1 ? 'vincono' : 'vince'} ${chi}!`, 'successo');
    }
}

function aggiornaNomi() {
    giocatori[0].titolo.textContent = nome(0);
    giocatori[1].titolo.textContent = nome(1);
}

function iniziaMano() {
    clearTimeout(timerBanco);
    creaMazzo();
    punti = [0, 0];
    sballato = [false, false];
    puntiBanco = 0;
    attivo = 0;
    punteggioB.textContent = '0';
    carteBanco.textContent = '';
    for (const g of giocatori) {
        g.carte.textContent = '';
        g.punteggio.textContent = '0';
    }
    riquadroGiocatore2.hidden = !dueGiocatori;
    mostraMessaggio('', '');
    impostaTurno('giocatore');
    turnoDue.textContent = `Tocca a ${nomi[0]}`;
    stai.disabled = false;
    pesca.disabled = false;
    // ogni giocatore riceve la prima carta
    for (let i = 0; i < numeroGiocatori(); i++) {
        daiCarta(i);
    }
}


pesca.addEventListener('click', giocatorePesca);
stai.addEventListener('click', prossimoTurno);
nuovaPartita.addEventListener('click', iniziaMano);

Giocatori.collegaBarra({
    select: selectModalita,
    pulsanteNomi,
    suCambioModalita: due => {
        dueGiocatori = due;
        turnoDue.hidden = !due;
        aggiornaNomi();
        iniziaMano();
    },
    suCambioNomi: nuoviNomi => {
        nomi = nuoviNomi;
        aggiornaNomi();
    }
});

aggiornaNomi();
iniziaMano();
