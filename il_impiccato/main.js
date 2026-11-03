

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


for (let i = 0; i < alfabeto.length; i++) {
    const tasto = document.createElement('button');
    tasto.type = 'button';
    tasto.textContent = alfabeto[i];
    tastiera.appendChild(tasto);
    tasto.addEventListener('click', () => {
        provaLettera(alfabeto[i]);
        laTuaLettera.focus();
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
        messaggi.textContent = 'Hai indovinato la parola!';
        bloccaPartita();
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
    };
}


preparaParola();
aggiornaVite();


lettera.addEventListener('submit', (event) => {
    event.preventDefault();
    const tentativo = laTuaLettera.value.toLowerCase();
    laTuaLettera.value = '';
    laTuaLettera.focus();
    provaLettera(tentativo);

});

nuovaPartita.addEventListener('click', () => {
    parolaSegreta = listaParole[Math.floor(Math.random() * listaParole.length)];
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
    laTuaLettera.focus();
    laTuaLettera.value = '';
});
