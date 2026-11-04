
const contenitore = document.querySelector('#contenitore_gioco');
const grigliaMia = document.querySelector('#grigliaMia');
const grigliaNemica = document.querySelector('#grigliaNemica');
const campoNemico = document.querySelector('#campoNemico');
const disposizione = document.querySelector('#disposizione');
const istruzioni = document.querySelector('#istruzioniDisposizione');
const pulsanteRuota = document.querySelector('#ruota');
const pulsanteConferma = document.querySelector('#conferma');
const messaggi = document.querySelector('#messaggi');
const selectModalita = document.querySelector('#modalitaGioco');
const difficolta = document.querySelector('#difficolta');
const pulsanteNomi = document.querySelector('#nomiGiocatori');
const pulsanteNuova = document.querySelector('#nuovaPartita');

const RIGHE = 'ABCDEFGHIJ';
const ATTESA_PC = 700;      // millisecondi prima del colpo del computer
const ATTESA_CAMBIO = 1200; // millisecondi per leggere l'esito prima di passare il dispositivo

let flotte = [flottaVuota(), flottaVuota()];
let fasePartita = 'disposizione'; // 'disposizione' | 'gioco' | 'fine'
let chiDispone = 0;
let orizzontale = true;
let tocca = 0;
let inAttesa = false;
let coperto = false; // durante "Passa il dispositivo" le navi non si disegnano, così non si intravedono sotto il velo
let timer;
let dueGiocatori = false;
let nomi = Giocatori.leggiNomi();

function creaGriglia(griglia, alClic) {
    const celle = [];
    for (let i = 0; i < LATO * LATO; i++) {
        const cella = document.createElement('button');
        cella.type = 'button';
        cella.className = 'cella-mare';
        cella.addEventListener('click', () => alClic(i));
        griglia.appendChild(cella);
        celle.push(cella);
    }
    return celle;
}
const celleMie = creaGriglia(grigliaMia, clicMia);
const celleNemiche = creaGriglia(grigliaNemica, clicNemica);

function coordinata(i) {
    return `${RIGHE[Math.floor(i / LATO)]}${(i % LATO) + 1}`;
}

function nome(indice) {
    if (!dueGiocatori) return indice === 0 ? 'Tu' : 'Computer';
    return nomi[indice];
}

// Chi sta guardando lo schermo: a 1 giocatore sempre tu; a 2 giocatori chi dispone o chi spara
function vista() {
    if (!dueGiocatori) return 0;
    return fasePartita === 'disposizione' ? chiDispone : tocca;
}

function naviRimaste(flotta) {
    return flotta.navi.filter(n => !affondata(n)).length;
}

// Disegna una griglia: con "mostraNavi" si vedono le proprie navi, altrimenti solo i colpi
function disegnaGriglia(celle, flotta, mostraNavi, bersaglio) {
    celle.forEach((cella, i) => {
        const nave = naveIn(flotta, i);
        const colpo = flotta.colpi.get(i);
        const naveAffondata = nave && affondata(nave);
        cella.classList.toggle('cella-mare--nave', Boolean(nave) && (mostraNavi || naveAffondata));
        cella.classList.toggle('cella-mare--acqua', colpo === 'acqua');
        cella.classList.toggle('cella-mare--colpito', colpo === 'colpito');
        cella.classList.toggle('cella-mare--affondata', Boolean(naveAffondata));
        cella.textContent = colpo === 'acqua' ? '•' : (colpo === 'colpito' ? '✕' : '');
        cella.disabled = bersaglio ? (fasePartita !== 'gioco' || inAttesa || flotta.colpi.has(i) || (!dueGiocatori && tocca !== 0)) : fasePartita !== 'disposizione';
        let descrizione = 'mare';
        if (colpo === 'acqua') descrizione = 'acqua';
        else if (colpo === 'colpito') descrizione = naveAffondata ? `${nave.nome} affondata` : 'colpito';
        else if (nave && mostraNavi) descrizione = nave.nome;
        cella.setAttribute('aria-label', `${coordinata(i)}: ${descrizione}`);
    });
}

function disegna() {
    const io = vista();
    const altro = 1 - io;
    disegnaGriglia(celleMie, flotte[io], !coperto, false);
    disegnaGriglia(celleNemiche, flotte[altro], fasePartita === 'fine', true);
    disposizione.hidden = fasePartita !== 'disposizione';
    campoNemico.hidden = fasePartita === 'disposizione';
    document.querySelector('#titoloMio').textContent = dueGiocatori ? `Flotta di ${nome(io)}` : 'La tua flotta';
    document.querySelector('#titoloNemico').textContent = dueGiocatori ? `Flotta di ${nome(altro)}` : 'Flotta nemica';
    document.querySelector('#nomeMio').textContent = dueGiocatori ? nome(io) : 'La tua flotta';
    document.querySelector('#nomeNemico').textContent = dueGiocatori ? nome(altro) : 'Flotta nemica';
    document.querySelector('#naviMie').textContent = naviRimaste(flotte[io]) || (fasePartita === 'disposizione' ? NAVI.length : 0);
    document.querySelector('#naviNemiche').textContent = fasePartita === 'disposizione' ? NAVI.length : naviRimaste(flotte[altro]);
    contenitore.dataset.fase = fasePartita;
    if (fasePartita === 'disposizione') {
        const prossima = NAVI[flotte[chiDispone].navi.length];
        const chi = dueGiocatori ? `${nome(chiDispone)}: ` : '';
        // a 1 giocatore la frase comincia con la maiuscola, a 2 giocatori dopo il nome
        const frase = prossima
            ? `metti la ${prossima.nome.toLowerCase()} (${prossima.lunghezza} caselle): tocca la casella di partenza.`
            : 'flotta pronta. Premi “Conferma la flotta”.';
        istruzioni.textContent = chi ? `${chi}${frase}` : frase.charAt(0).toUpperCase() + frase.slice(1);
        pulsanteConferma.disabled = Boolean(prossima);
        pulsanteRuota.textContent = orizzontale ? '↻ Orizzontale' : '↻ Verticale';
    }
}

function clicMia(i) {
    if (fasePartita !== 'disposizione') return;
    const flotta = flotte[chiDispone];
    const modello = NAVI[flotta.navi.length];
    if (!modello) return;
    const celle = celleNave(i, modello.lunghezza, orizzontale);
    if (!posizioneValida(flotta.navi, celle)) {
        messaggi.textContent = celle ? 'Qui la nave tocca o si sovrappone a un’altra: scegli un’altra casella.' : 'Qui la nave esce dalla griglia: scegli un’altra casella o cambia verso.';
        messaggi.className = 'messaggio--errore';
        return;
    }
    flotta.navi.push(creaNave(modello, celle));
    messaggi.textContent = '';
    messaggi.className = '';
    disegna();
}

async function confermaFlotta() {
    if (flotte[chiDispone].navi.length < NAVI.length) return;
    if (!dueGiocatori) {
        flotte[1] = disponiACaso();
        iniziaBattaglia();
        return;
    }
    if (chiDispone === 0) {
        await passaCoperto(1, `Passa il dispositivo a ${nomi[1]}: ora dispone le sue navi.`);
        chiDispone = 1;
        disegna();
        return;
    }
    await passaCoperto(0, `Flotte pronte! Passa il dispositivo a ${nomi[0]}: comincia a sparare.`);
    iniziaBattaglia();
}

// "Passa il dispositivo" con le navi nascoste sotto il velo
async function passaCoperto(indice, testo) {
    coperto = true;
    disegna();
    await Giocatori.passaDispositivo(nome(indice), testo);
    coperto = false;
}

function iniziaBattaglia() {
    fasePartita = 'gioco';
    tocca = 0;
    messaggi.textContent = dueGiocatori ? `Tocca a ${nome(0)}: spara nella flotta di ${nome(1)}.` : 'Tocca a te: spara nella flotta nemica.';
    messaggi.className = '';
    disegna();
}

function descriviEsito(esito, nave, i) {
    if (esito.esito === 'acqua') return `${coordinata(i)}: acqua.`;
    if (esito.esito === 'colpito') return `${coordinata(i)}: colpito!`;
    return `${coordinata(i)}: colpito e affondato! (${nave.nome.toLowerCase()})`;
}

function controllaFine(chiSpara) {
    if (!tutteAffondate(flotte[1 - chiSpara])) return false;
    fasePartita = 'fine';
    if (!dueGiocatori) {
        messaggi.textContent = chiSpara === 0 ? 'Hai affondato tutta la flotta nemica: hai vinto!' : 'Il computer ha affondato tutta la tua flotta.';
        messaggi.className = chiSpara === 0 ? 'messaggio--successo' : 'messaggio--errore';
    } else {
        messaggi.textContent = `Vince ${nome(chiSpara)}: ha affondato tutta la flotta di ${nome(1 - chiSpara)}!`;
        messaggi.className = 'messaggio--successo';
    }
    disegna();
    return true;
}

function clicNemica(i) {
    if (fasePartita !== 'gioco' || inAttesa) return;
    if (!dueGiocatori && tocca !== 0) return;
    const chiSpara = tocca;
    const esito = spara(flotte[1 - chiSpara], i);
    if (esito.esito === 'ripetuto') return;
    messaggi.textContent = descriviEsito(esito, esito.nave, i);
    messaggi.className = esito.esito === 'acqua' ? '' : 'messaggio--successo';
    if (controllaFine(chiSpara)) return;
    inAttesa = true;
    disegna();
    if (!dueGiocatori) {
        tocca = 1;
        timer = setTimeout(colpoComputer, ATTESA_PC);
    } else {
        timer = setTimeout(async () => {
            await passaCoperto(1 - chiSpara, `Passa il dispositivo a ${nome(1 - chiSpara)}: ora spara.`);
            tocca = 1 - chiSpara;
            inAttesa = false;
            messaggi.textContent = `Tocca a ${nome(tocca)}: spara nella flotta di ${nome(1 - tocca)}.`;
            messaggi.className = '';
            disegna();
        }, ATTESA_CAMBIO);
    }
}

function colpoComputer() {
    const i = mossaPC(flotte[0], difficolta.value);
    const esito = spara(flotte[0], i);
    inAttesa = false;
    tocca = 0;
    const testo = descriviEsito(esito, esito.nave, i);
    if (controllaFine(1)) return;
    messaggi.textContent = `Il computer spara in ${testo} Tocca a te.`;
    messaggi.className = esito.esito === 'acqua' ? '' : 'messaggio--errore';
    disegna();
}

function iniziaPartita() {
    clearTimeout(timer);
    flotte = [flottaVuota(), flottaVuota()];
    fasePartita = 'disposizione';
    chiDispone = 0;
    tocca = 0;
    inAttesa = false;
    messaggi.textContent = '';
    messaggi.className = '';
    disegna();
}

pulsanteRuota.addEventListener('click', () => {
    orizzontale = !orizzontale;
    disegna();
});
document.querySelector('#casuale').addEventListener('click', () => {
    flotte[chiDispone] = disponiACaso();
    messaggi.textContent = '';
    disegna();
});
document.querySelector('#svuota').addEventListener('click', () => {
    flotte[chiDispone] = flottaVuota();
    disegna();
});
pulsanteConferma.addEventListener('click', confermaFlotta);
pulsanteNuova.addEventListener('click', iniziaPartita);
difficolta.addEventListener('change', iniziaPartita);

Giocatori.collegaBarra({
    select: selectModalita,
    pulsanteNomi,
    suCambioModalita: due => {
        dueGiocatori = due;
        difficolta.disabled = due;
        iniziaPartita();
    },
    suCambioNomi: nuoviNomi => {
        nomi = nuoviNomi;
        disegna();
    }
});

iniziaPartita();
