

let parolaSegreta = listaParole[Math.floor(Math.random() * listaParole.length)];

let numeroErrori = 0;
let lettereScoperte = [];
let lettereUsate = [];
const alfabeto = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const disegni = [
    './pic/stato-0.png',
    './pic/stato-1.png',
    './pic/stato-2.png',
    './pic/stato-3.png',
    './pic/stato-4.png',
    './pic/stato-5.png',
    './pic/stato-6.png',
];


const parolaVisualizzata = document.querySelector('.parolaVisualizzata');
const lettera = document.querySelector('#lettera');
const laTuaLettera = document.querySelector('#laTuaLettera');
const errore = document.querySelector('.errore');
const messaggi = document.querySelector('.messaggi');
const lettereInserite = document.querySelector('.lettereUsate');
const prova = document.querySelector('#prova');
const nuovaPartita = document.querySelector('#nuovaPartita');
const tastiera = document.querySelector('#tastiera');
const disegno = document.querySelector('#disegno');
const vite = document.querySelectorAll('.vita');
const contaErrori = document.querySelector('#contaErrori');
const selectModalita = document.querySelector('#modalitaGioco');
const pulsanteNomi = document.querySelector('#nomiGiocatori');
const punteggiDue = document.querySelector('#punteggiDue');
const turnoDue = document.querySelector('#turnoDue');

// Sul telefono (Tappa 27.5) si gioca con la tastiera sullo schermo e il campo di testo è nascosto:
// dargli il fuoco aprirebbe la tastiera del telefono sopra il gioco
function fuocoAlCampo() {
    if (typeof Tavola !== 'undefined' && Tavola.telefono()) return;
    laTuaLettera.focus();
}
fuocoAlCampo();

// Modalità 2 giocatori: a ogni round uno sceglie la parola e l'altro la indovina, poi si scambiano
let dueGiocatori = false;
let nomi = Giocatori.leggiNomi();
let punti = [0, 0];
let chiSceglie = 0; // indice del giocatore che sceglie la parola in questo round


for (let i = 0; i < alfabeto.length; i++) {
    const tasto = document.createElement('button');
    tasto.type = 'button';
    tasto.textContent = alfabeto[i];
    tastiera.appendChild(tasto);
    tasto.addEventListener('click', () => {
        provaLettera(alfabeto[i]);
        fuocoAlCampo();
    })
};

// Prepara la parola nascosta: una tessera vuota per ogni lettera
function preparaParola() {
    lettereScoperte = [];
    parolaVisualizzata.textContent = '';
    for (let i = 0; i < parolaSegreta.length; i++) {
        lettereScoperte.push('_');
        const tessera = document.createElement('span');
        tessera.className = 'tessera';
        parolaVisualizzata.appendChild(tessera);
    }
    aggiornaDescrizioneParola();
}

// Per i lettori di schermo la parola viene letta come "c _ _ a"
function aggiornaDescrizioneParola() {
    parolaVisualizzata.setAttribute('aria-label', `Parola: ${lettereScoperte.join(' ')}`);
}

function scopriTessera(indice, classe) {
    const tessera = parolaVisualizzata.children[indice];
    tessera.textContent = parolaSegreta[indice];
    tessera.classList.add(classe);
}

// Le vite perse diventano grigie, una per ogni errore
function aggiornaVite() {
    for (let i = 0; i < vite.length; i++) {
        vite[i].classList.toggle('vita--persa', i >= vite.length - numeroErrori);
    }
    contaErrori.textContent = `${numeroErrori}/6`;
}

function bloccaPartita() {
    const tasti = tastiera.querySelectorAll('button');
    for (let i = 0; i < tasti.length; i++) {
        tasti[i].disabled = true;
    };
    laTuaLettera.disabled = true;
    prova.disabled = true;
}

function provaLettera(letteraScelta) {

    if (numeroErrori >= 6 || !lettereScoperte.includes('_')) {
        return
    }

    if (lettereUsate.includes(letteraScelta)) {
        messaggi.className = 'messaggi messaggio--avviso';
        messaggi.textContent = `Lettera già usata`;
        return
    } else {
        lettereUsate.push(letteraScelta);
        lettereInserite.textContent = `Lettere provate: ${lettereUsate.join(', ')}`;
        messaggi.className = 'messaggi';
        messaggi.textContent = '';
    }

    const presente = parolaSegreta.includes(letteraScelta);

    // il tasto diventa verde se la lettera c'è, rosso se non c'è
    const tasti = tastiera.querySelectorAll('button');
    for (let i = 0; i < tasti.length; i++) {
        if (tasti[i].textContent === letteraScelta) {
            tasti[i].disabled = true;
            tasti[i].classList.add(presente ? 'tasto--giusto' : 'tasto--sbagliato');
        }
    };

    if (presente) {
        for (let i = 0; i < parolaSegreta.length; i++) {
            if (parolaSegreta[i] === letteraScelta) {
                lettereScoperte[i] = letteraScelta;
                scopriTessera(i, 'tessera--scoperta');
            }
        };
        aggiornaDescrizioneParola();
        errore.textContent = '';
    } else {
        errore.textContent = `La lettera non è presente nella parola. Errori: ${++numeroErrori}/6`;
        disegno.src = disegni[numeroErrori];
    }
    aggiornaVite();


    if (!lettereScoperte.includes('_')) {
        messaggi.className = 'messaggi messaggio--successo';
        messaggi.textContent = dueGiocatori ? `${nomi[1 - chiSceglie]} ha indovinato la parola!` : 'Hai indovinato la parola!';
        bloccaPartita();
        fineRound(true);
    } else if (numeroErrori >= 6) {
        messaggi.className = 'messaggi messaggio--errore';
        messaggi.innerHTML = `Hai perso! La parola segreta era:
        <strong>${parolaSegreta}</strong>`
        // mostra le lettere che mancavano, in un altro colore
        for (let i = 0; i < parolaSegreta.length; i++) {
            if (lettereScoperte[i] === '_') {
                scopriTessera(i, 'tessera--rivelata');
            }
        }
        bloccaPartita();
        fineRound(false);
    };
}


preparaParola();
aggiornaVite();


lettera.addEventListener('submit', (event) => {
    event.preventDefault();
    const tentativo = laTuaLettera.value.toLowerCase();
    laTuaLettera.value = '';
    fuocoAlCampo();
    provaLettera(tentativo);

});

// Prepara una partita con la parola indicata
function avviaPartita(parola) {
    parolaSegreta = parola;
    numeroErrori = 0;
    lettereUsate = [];
    preparaParola();
    aggiornaVite();
    messaggi.className = 'messaggi';
    messaggi.textContent = '';
    lettereInserite.textContent = '';
    errore.textContent = '';
    disegno.src = disegni[numeroErrori];
    const tasti = tastiera.querySelectorAll('button');
    for (let i = 0; i < tasti.length; i++) {
        tasti[i].disabled = false;
        tasti[i].classList.remove('tasto--giusto', 'tasto--sbagliato');
    };
    laTuaLettera.disabled = false;
    prova.disabled = false;
    fuocoAlCampo();
    laTuaLettera.value = '';
}

function parolaCasuale() {
    return listaParole[Math.floor(Math.random() * listaParole.length)];
}

// Toglie gli accenti e mette in minuscolo: "Perché" diventa "perche"
function pulisciParola(testo) {
    return testo.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function controllaParola(testo) {
    const parola = pulisciParola(testo);
    if (!/^[a-z]+$/.test(parola)) {
        return 'Usa solo lettere, senza spazi, numeri o apostrofi.';
    }
    if (parola.length < 3 || parola.length > 12) {
        return 'La parola deve avere da 3 a 12 lettere.';
    }
    return '';
}

function aggiornaPunteggi() {
    document.querySelector('#nomeG1').textContent = nomi[0];
    document.querySelector('#nomeG2').textContent = nomi[1];
    document.querySelector('#puntiG1').textContent = punti[0];
    document.querySelector('#puntiG2').textContent = punti[1];
}

// Un round a 2 giocatori: chi sceglie scrive la parola di nascosto, poi passa il dispositivo a chi indovina
async function avviaRoundDue() {
    const indovina = 1 - chiSceglie;
    bloccaPartita();
    turnoDue.textContent = `${nomi[chiSceglie]} sceglie la parola…`;
    const parola = await Giocatori.chiediSegreto({
        titolo: `${nomi[chiSceglie]}, scegli la parola`,
        testo: `${nomi[indovina]} non deve guardare lo schermo.`,
        etichetta: 'Parola segreta (da 3 a 12 lettere)',
        controlla: controllaParola
    });
    await Giocatori.passaDispositivo(nomi[indovina], `Passa il dispositivo a ${nomi[indovina]}: deve indovinare la parola scelta da ${nomi[chiSceglie]}.`);
    turnoDue.textContent = `Indovina: ${nomi[indovina]} · Parola scelta da: ${nomi[chiSceglie]}`;
    avviaPartita(pulisciParola(parola));
}

// Fine di una partita: a 2 giocatori il punto va a chi indovina, oppure a chi ha scelto la parola
function fineRound(indovinata) {
    if (!dueGiocatori) {
        return;
    }
    const vincitore = indovinata ? 1 - chiSceglie : chiSceglie;
    punti[vincitore]++;
    aggiornaPunteggi();
    chiSceglie = 1 - chiSceglie;
    turnoDue.textContent = `Punto a ${nomi[vincitore]}. Nel prossimo round sceglie la parola ${nomi[chiSceglie]}.`;
    nuovaPartita.textContent = 'Prossimo round';
}

function impostaModalita(due) {
    dueGiocatori = due;
    punti = [0, 0];
    chiSceglie = 0;
    punteggiDue.hidden = !due;
    turnoDue.hidden = !due;
    nuovaPartita.textContent = due ? 'Prossimo round' : 'Nuova Partita';
    aggiornaPunteggi();
    if (due) {
        avviaRoundDue();
    } else {
        avviaPartita(parolaCasuale());
    }
}

Giocatori.collegaBarra({
    select: selectModalita,
    pulsanteNomi,
    suCambioModalita: impostaModalita,
    suCambioNomi: nuoviNomi => {
        nomi = nuoviNomi;
        aggiornaPunteggi();
    }
});

nuovaPartita.addEventListener('click', () => {
    if (dueGiocatori) {
        avviaRoundDue();
    } else {
        avviaPartita(parolaCasuale());
    }
});
