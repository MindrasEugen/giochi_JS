
const grigliaEl = document.querySelector('#griglia');
const messaggi = document.querySelector('#messaggi');
const selectDifficolta = document.querySelector('#difficolta');
const pulsanteNote = document.querySelector('#note');
const pulsanteNuova = document.querySelector('#nuovaPartita');

let puzzle = [];          // indizi di partenza (0 = vuota)
let soluzione = [];
let valori = [];          // numeri attuali
let note = [];            // per ogni casella, l'insieme dei numeri scritti in piccolo
let selezionata = null;
let modoNote = false;
let storia = [];          // mosse da annullare: { indice, valore, note }
let sbagliateMostrate = new Set();
let secondi = 0;
let timer = null;
let finita = false;

// 81 caselle; i bordi spessi separano i riquadri 3×3
const caselle = [];
for (let i = 0; i < 81; i++) {
    const casella = document.createElement('button');
    casella.type = 'button';
    casella.className = 'cella-sudoku';
    if (colonna(i) === 2 || colonna(i) === 5) casella.classList.add('cella-sudoku--bordo-destro');
    if (riga(i) === 2 || riga(i) === 5) casella.classList.add('cella-sudoku--bordo-sotto');
    casella.addEventListener('click', () => seleziona(i));
    grigliaEl.appendChild(casella);
    caselle.push(casella);
}

// Tastierino 1–9
const numeriEl = document.querySelector('#numeri');
for (let n = 1; n <= 9; n++) {
    const tasto = document.createElement('button');
    tasto.type = 'button';
    tasto.className = 'tasto-numero';
    tasto.textContent = n;
    tasto.addEventListener('click', () => inserisci(n));
    numeriEl.appendChild(tasto);
}

function formattaTempo(totale) {
    return `${Math.floor(totale / 60)}:${String(totale % 60).padStart(2, '0')}`;
}

function chiaveRecord() {
    return `giochi_js_sudoku_${selectDifficolta.value}`;
}

function leggiRecord() {
    try {
        const valore = Number(localStorage.getItem(chiaveRecord()));
        return valore > 0 ? valore : null;
    } catch (errore) {
        return null;
    }
}

function salvaRecord(tempo) {
    const attuale = leggiRecord();
    if (attuale !== null && tempo >= attuale) return false;
    try {
        localStorage.setItem(chiaveRecord(), String(tempo));
    } catch (errore) {
        // senza localStorage il record non si salva
    }
    return true;
}

function disegna() {
    const inConflitto = conflitti(valori);
    const valoreScelto = selezionata === null ? 0 : valori[selezionata];
    for (let i = 0; i < 81; i++) {
        const casella = caselle[i];
        const collegata = selezionata !== null && COLLEGATE[selezionata].includes(i);
        casella.classList.toggle('cella-sudoku--data', puzzle[i] !== 0);
        casella.classList.toggle('cella-sudoku--selezionata', i === selezionata);
        casella.classList.toggle('cella-sudoku--evidenziata', collegata);
        casella.classList.toggle('cella-sudoku--stesso', valoreScelto !== 0 && valori[i] === valoreScelto && i !== selezionata);
        casella.classList.toggle('cella-sudoku--conflitto', inConflitto.has(i) && puzzle[i] === 0);
        casella.classList.toggle('cella-sudoku--sbagliata', sbagliateMostrate.has(i));
        if (valori[i] !== 0) {
            casella.textContent = valori[i];
        } else if (note[i].size > 0) {
            // note a matita: una griglia 3×3 di numeri piccoli
            casella.innerHTML = '<span class="note-sudoku"></span>';
            const contenitoreNote = casella.firstChild;
            for (let n = 1; n <= 9; n++) {
                const nota = document.createElement('span');
                nota.textContent = note[i].has(n) ? n : '';
                contenitoreNote.appendChild(nota);
            }
        } else {
            casella.textContent = '';
        }
        const descrizione = valori[i] !== 0 ? String(valori[i]) : (note[i].size ? `note ${[...note[i]].sort().join(' ')}` : 'vuota');
        casella.setAttribute('aria-label', `Riga ${riga(i) + 1}, colonna ${colonna(i) + 1}: ${descrizione}${puzzle[i] ? ' (indizio)' : ''}`);
    }
    document.querySelector('#rimaste').textContent = valori.filter(n => n === 0).length;
    document.querySelector('#tempo').textContent = formattaTempo(secondi);
    const record = leggiRecord();
    document.querySelector('#record').textContent = record === null ? '–' : formattaTempo(record);
}

function seleziona(i) {
    selezionata = i;
    disegna();
}

function salvaMossa(i) {
    storia.push({ indice: i, valore: valori[i], note: new Set(note[i]), collegate: COLLEGATE[i].map(j => new Set(note[j])) });
}

function inserisci(n) {
    if (finita || selezionata === null || puzzle[selezionata] !== 0) {
        return;
    }
    const i = selezionata;
    salvaMossa(i);
    sbagliateMostrate.clear();
    if (modoNote) {
        if (valori[i] !== 0) {
            storia.pop();
            return;
        }
        if (note[i].has(n)) note[i].delete(n); else note[i].add(n);
    } else {
        valori[i] = valori[i] === n ? 0 : n;
        note[i].clear();
        // il numero messo toglie la stessa nota dalle caselle collegate
        if (valori[i] !== 0) {
            COLLEGATE[i].forEach(j => note[j].delete(n));
        }
    }
    avviaTempo();
    disegna();
    if (completo(valori)) {
        fine();
    }
}

function cancella() {
    if (finita || selezionata === null || puzzle[selezionata] !== 0) return;
    if (valori[selezionata] === 0 && note[selezionata].size === 0) return;
    salvaMossa(selezionata);
    valori[selezionata] = 0;
    note[selezionata].clear();
    sbagliateMostrate.clear();
    disegna();
}

function annulla() {
    if (finita || storia.length === 0) return;
    const mossa = storia.pop();
    valori[mossa.indice] = mossa.valore;
    note[mossa.indice] = mossa.note;
    COLLEGATE[mossa.indice].forEach((j, k) => { note[j] = mossa.collegate[k]; });
    selezionata = mossa.indice;
    sbagliateMostrate.clear();
    disegna();
}

function controllaSoluzione() {
    if (finita) return;
    sbagliateMostrate = new Set();
    valori.forEach((n, i) => { if (n !== 0 && n !== soluzione[i]) sbagliateMostrate.add(i); });
    messaggi.textContent = sbagliateMostrate.size === 0 ? 'Per ora nessun errore.' : `Caselle sbagliate: ${sbagliateMostrate.size}.`;
    messaggi.className = sbagliateMostrate.size === 0 ? 'messaggio--successo' : 'messaggio--errore';
    disegna();
}

function avviaTempo() {
    if (timer === null && !finita) {
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

function fine() {
    finita = true;
    fermaTempo();
    const nuovoRecord = salvaRecord(secondi);
    selezionata = null;
    disegna();
    messaggi.textContent = `Sudoku completato in ${formattaTempo(secondi)}${nuovoRecord ? ': nuovo record!' : '!'}`;
    messaggi.className = 'messaggio--successo';
}

function iniziaPartita() {
    fermaTempo();
    const generato = genera(selectDifficolta.value);
    puzzle = generato.puzzle;
    soluzione = generato.soluzione;
    valori = [...puzzle];
    note = valori.map(() => new Set());
    storia = [];
    sbagliateMostrate = new Set();
    selezionata = null;
    secondi = 0;
    finita = false;
    messaggi.textContent = '';
    messaggi.className = '';
    disegna();
}

// Tastiera: numeri, frecce, cancellazione, N per le note, Ctrl+Z per annullare
document.addEventListener('keydown', evento => {
    const bersaglio = evento.target;
    if (bersaglio instanceof Element && bersaglio.matches('input, select, textarea')) return;
    if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === 'z') {
        evento.preventDefault();
        annulla();
        return;
    }
    if (/^[1-9]$/.test(evento.key)) {
        inserisci(Number(evento.key));
    } else if (['Backspace', 'Delete', '0'].includes(evento.key)) {
        cancella();
    } else if (evento.key.toLowerCase() === 'n') {
        pulsanteNote.click();
    } else if (evento.key.startsWith('Arrow')) {
        evento.preventDefault();
        const partenza = selezionata === null ? 40 : selezionata;
        let r = riga(partenza);
        let c = colonna(partenza);
        if (evento.key === 'ArrowUp') r = (r + 8) % 9;
        if (evento.key === 'ArrowDown') r = (r + 1) % 9;
        if (evento.key === 'ArrowLeft') c = (c + 8) % 9;
        if (evento.key === 'ArrowRight') c = (c + 1) % 9;
        seleziona(r * 9 + c);
        caselle[selezionata].focus();
    }
});

pulsanteNote.addEventListener('click', () => {
    modoNote = !modoNote;
    pulsanteNote.setAttribute('aria-pressed', String(modoNote));
});
document.querySelector('#cancella').addEventListener('click', cancella);
document.querySelector('#annulla').addEventListener('click', annulla);
document.querySelector('#controlla').addEventListener('click', controllaSoluzione);
pulsanteNuova.addEventListener('click', iniziaPartita);
selectDifficolta.addEventListener('change', iniziaPartita);

iniziaPartita();
