
const campoEl = document.querySelector('#campo');
const messaggi = document.querySelector('#messaggi');
const selectLivello = document.querySelector('#livello');
const modoBandiera = document.querySelector('#modoBandiera');
const pulsanteNuova = document.querySelector('#nuovaPartita');

const PRESSIONE_LUNGA = 450; // millisecondi per mettere la bandiera tenendo premuto sul telefono

let stato = crea(9, 9, 10);
let caselle = [];
let secondi = 0;
let timer = null;
let bandieraAttiva = false;
let ignoraClic = false; // dopo una pressione lunga il "click" che segue non deve aprire la casella

function formattaTempo(totale) {
    return `${Math.floor(totale / 60)}:${String(totale % 60).padStart(2, '0')}`;
}

// Record: il tempo migliore per ogni livello, salvato nel browser
function chiaveRecord() {
    return `giochi_js_campo_minato_${selectLivello.value}`;
}

function leggiRecord() {
    try {
        const salvato = localStorage.getItem(chiaveRecord());
        const valore = Number(salvato);
        return salvato !== null && salvato.trim() !== '' && Number.isFinite(valore) && valore >= 0 ? valore : null;
    } catch (errore) {
        return null;
    }
}

function salvaRecord(tempo) {
    const attuale = leggiRecord();
    if (attuale !== null && tempo >= attuale) {
        return false;
    }
    try {
        localStorage.setItem(chiaveRecord(), String(tempo));
    } catch (errore) {
        // senza localStorage il record non si salva
    }
    return true;
}

function avviaTempo() {
    if (timer === null) {
        timer = setInterval(() => {
            secondi++;
            document.querySelector('#tempo').textContent = formattaTempo(secondi);
        }, 1000);
    }
}

function fermaTempo() {
    clearInterval(timer);
    timer = null;
}

function aggiornaTabellone() {
    document.querySelector('#mineRimaste').textContent = stato.mine - bandiereMesse(stato);
    document.querySelector('#tempo').textContent = formattaTempo(secondi);
    const record = leggiRecord();
    document.querySelector('#record').textContent = record === null ? '–' : formattaTempo(record);
}

function creaCampo() {
    campoEl.style.setProperty('--colonne', stato.colonne);
    campoEl.textContent = '';
    caselle = stato.celle.map((_, i) => {
        const casella = document.createElement('button');
        casella.type = 'button';
        casella.className = 'casella';
        casella.addEventListener('click', () => {
            if (ignoraClic) {
                ignoraClic = false;
                return;
            }
            azione(i, bandieraAttiva ? 'bandiera' : 'apri');
        });
        casella.addEventListener('contextmenu', evento => {
            evento.preventDefault();
            azione(i, 'bandiera');
        });
        // pressione lunga sui dispositivi touch
        let timerPressione;
        casella.addEventListener('pointerdown', evento => {
            if (evento.pointerType !== 'touch') {
                return;
            }
            timerPressione = setTimeout(() => {
                ignoraClic = true;
                azione(i, 'bandiera');
            }, PRESSIONE_LUNGA);
        });
        for (const fine of ['pointerup', 'pointerleave', 'pointercancel']) {
            casella.addEventListener(fine, () => clearTimeout(timerPressione));
        }
        campoEl.appendChild(casella);
        return casella;
    });
    disegna();
}

function descrizione(cella, i) {
    const riga = Math.floor(i / stato.colonne) + 1;
    const colonna = (i % stato.colonne) + 1;
    let contenuto = 'chiusa';
    if (cella.bandiera) contenuto = 'bandiera';
    if (cella.aperta) contenuto = cella.mina ? 'mina' : (cella.vicine === 0 ? 'vuota' : `${cella.vicine}`);
    if (stato.finita && cella.mina && !cella.aperta && !cella.bandiera) contenuto = 'mina';
    return `Riga ${riga}, colonna ${colonna}: ${contenuto}`;
}

function disegna() {
    stato.celle.forEach((cella, i) => {
        const casella = caselle[i];
        // a partita persa si mostrano tutte le mine e le bandiere sbagliate
        const mostraMina = cella.mina && (cella.aperta || (stato.finita && !stato.vinta && !cella.bandiera));
        const bandieraSbagliata = stato.finita && !stato.vinta && cella.bandiera && !cella.mina;
        casella.classList.toggle('casella--aperta', cella.aperta || mostraMina);
        casella.classList.toggle('casella--bandiera', cella.bandiera && !bandieraSbagliata);
        casella.classList.toggle('casella--mina', mostraMina);
        casella.classList.toggle('casella--esplosa', Boolean(cella.esplosa));
        casella.classList.toggle('casella--sbagliata', bandieraSbagliata);
        if (cella.aperta && !cella.mina && cella.vicine > 0) {
            casella.dataset.vicine = cella.vicine;
            casella.textContent = cella.vicine;
        } else {
            delete casella.dataset.vicine;
            casella.textContent = mostraMina ? '💣' : (cella.bandiera || bandieraSbagliata ? '🚩' : '');
        }
        casella.setAttribute('aria-label', descrizione(cella, i));
    });
    aggiornaTabellone();
}

function azione(i, tipo) {
    if (stato.finita) {
        return;
    }
    if (tipo === 'bandiera') {
        bandiera(stato, i);
    } else if (stato.celle[i].aperta) {
        apriIntorno(stato, i);
    } else {
        apri(stato, i);
    }
    if (stato.minePiazzate) {
        avviaTempo();
    }
    if (stato.finita) {
        fineVittoria();
    }
    disegna();
}

function fineVittoria() {
    fermaTempo();
    if (stato.vinta) {
        const nuovoRecord = salvaRecord(secondi);
        messaggi.textContent = `Hai vinto in ${formattaTempo(secondi)}${nuovoRecord ? ': nuovo record!' : '!'}`;
        messaggi.className = 'messaggio--successo';
    } else {
        messaggi.textContent = 'Boom! Hai aperto una mina.';
        messaggi.className = 'messaggio--errore';
    }
}

function iniziaPartita() {
    fermaTempo();
    secondi = 0;
    const livello = LIVELLI[selectLivello.value];
    stato = crea(livello.righe, livello.colonne, livello.mine);
    messaggi.textContent = '';
    messaggi.className = '';
    creaCampo();
}

modoBandiera.addEventListener('click', () => {
    bandieraAttiva = !bandieraAttiva;
    modoBandiera.setAttribute('aria-pressed', String(bandieraAttiva));
});
pulsanteNuova.addEventListener('click', iniziaPartita);
selectLivello.addEventListener('change', iniziaPartita);

iniziaPartita();
