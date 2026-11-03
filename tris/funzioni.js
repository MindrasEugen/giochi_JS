function controllaVincitore() {
    for (let i = 0; i < combinazioniVincenti.length; i++) {
        const primo = celle[combinazioniVincenti[i][0]].textContent;
        const secondo = celle[combinazioniVincenti[i][1]].textContent;
        const terzo = celle[combinazioniVincenti[i][2]].textContent;
        if (primo === secondo && primo === terzo && primo !== '') {
            messaggi.textContent = `Il vincitore e ${primo}`;
            partitaFinita = true;
            if (primo === 'X') {
                vittorieX++;
                punteggioX.textContent = `Punteggio X: ${vittorieX}`
            } else {
                vittorieO++;
                punteggioO.textContent = `Punteggio O: ${vittorieO}`
            }
            return
        }
    }
    let grigliaPiena = true;
    for (let i = 0; i < celle.length; i++) {
        if (celle[i].textContent === '') {
            grigliaPiena = false;
        }
    }
    if (partitaFinita === false && grigliaPiena === true) {
        messaggi.textContent = 'Pareggio';
        partitaFinita = true;
    }

};

function iniziaPartita() {
    giocatoreCorrente = 'X';
    for (let i = 0; i < celle.length; i++) {
        celle[i].textContent = '';
    }
    messaggi.textContent = 'Comincia X';
    partitaFinita = false;
}

function azzeraPunteggi() {
    punteggioO.textContent = 'Punteggio O: 0';
    punteggioX.textContent = 'Punteggio X: 0';
    vittorieO = 0;
    vittorieX = 0;
    iniziaPartita();
}

function mossaPC() {
    let celleVuote = [];
    for (let i = 0; i < celle.length; i++) {
        if (celle[i].textContent === '') {
            celleVuote.push(i)
        }
    }
    let indiceScelto = Math.floor(Math.random() * celleVuote.length);
    let indiceCella = cercaMossa('O');
    if(indiceCella === null){
        indiceCella = cercaMossa('X')
    };
    if(indiceCella === null){
        indiceCella = celleVuote[indiceScelto]
    };
    celle[indiceCella].textContent = 'O';
    controllaVincitore();
    giocatoreCorrente = 'X';
    if (partitaFinita === false) {
        messaggi.textContent = `E il turno di: ${giocatoreCorrente}`
    }
}

function cercaMossa(simbolo) {
    for (let i = 0; i < combinazioniVincenti.length; i++) {
        const primo = celle[combinazioniVincenti[i][0]].textContent;
        const secondo = celle[combinazioniVincenti[i][1]].textContent;
        const terzo = celle[combinazioniVincenti[i][2]].textContent;
        if (primo === simbolo && secondo === simbolo && terzo === '') {
            return combinazioniVincenti[i][2]
        } else if (primo === simbolo && terzo === simbolo && secondo === '') {
            return combinazioniVincenti[i][1]
        } else if (primo === '' && secondo === simbolo && terzo === simbolo) {
            return combinazioniVincenti[i][0]
        }
    }
    return null
}