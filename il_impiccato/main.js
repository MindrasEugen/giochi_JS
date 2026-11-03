

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

for (let i = 0; i < parolaSegreta.length; i++) {
    lettereScoperte.push('_');
};


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

disegno.src = disegni[numeroErrori];


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

function provaLettera(letteraScelta) {

    if (numeroErrori >= 6 || !lettereScoperte.includes('_')) {
        return
    }

    const tasti = tastiera.querySelectorAll('button');
    for (let i = 0; i < tasti.length; i++) {
            if (tasti[i].textContent === letteraScelta) {
                tasti[i].disabled = true;
            }
        };

    if (lettereUsate.includes(letteraScelta)) {
        messaggi.style.color = '#9A4D00';
        messaggi.textContent = `Lettera già usata`;
        return
    } else {
        lettereUsate.push(letteraScelta);
        lettereInserite.textContent = lettereUsate.join(', ');
        messaggi.textContent = '';
    }


    if (parolaSegreta.includes(letteraScelta)) {
        for (let i = 0; i < parolaSegreta.length; i++) {
            if (parolaSegreta[i] === letteraScelta) {
                lettereScoperte[i] = letteraScelta
            }
        };
        parolaVisualizzata.textContent = lettereScoperte.join(' ');
        errore.textContent = numeroErrori > 0 ? `Errori: ${numeroErrori}/6` : '';
    } else {
        errore.textContent = `La lettera non è presente nella parola. Errori: ${++numeroErrori}/6`;
        disegno.src = disegni[numeroErrori];
    }


    if (!lettereScoperte.includes('_')) {
        messaggi.style.color = 'green';
        messaggi.textContent = 'Hai indovinato la parola!';

        for (let i = 0; i < tasti.length; i++) {
            tasti[i].disabled = true;
        };

        laTuaLettera.disabled = true;
        prova.disabled = true;
    } else if (numeroErrori >= 6) {
        messaggi.style.color = 'red';
        messaggi.innerHTML = `Hai perso! La parola segreta era: 
        <strong>${parolaSegreta}</strong>`

        for (let i = 0; i < tasti.length; i++) {
            tasti[i].disabled = true;
        };

        laTuaLettera.disabled = true;
        prova.disabled = true;
    };

}


parolaVisualizzata.textContent = lettereScoperte.join(' ');


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
    lettereScoperte = [];
    lettereUsate = [];
    for (let i = 0; i < parolaSegreta.length; i++) {
        lettereScoperte.push('_');
    };
    parolaVisualizzata.textContent = lettereScoperte.join(' ');
    messaggi.style.color = '';
    messaggi.textContent = '';
    lettereInserite.textContent = '';
    errore.textContent = '';
    disegno.src = disegni[numeroErrori];
    const tasti = tastiera.querySelectorAll('button');
    for (let i = 0; i < tasti.length; i++) {
        tasti[i].disabled = false;
    };
    laTuaLettera.disabled = false;
    prova.disabled = false;
    laTuaLettera.focus();
    laTuaLettera.value = '';
});