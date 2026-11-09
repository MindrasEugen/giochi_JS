// Pagina del Puzzle scorrevole (Tappa 35): disegno dei tasselli, mosse, tempo, suggerimenti, anteprima.
// La logica sta in funzioni.js (oggetto Puzzle).

const grigliaEl = document.querySelector('#griglia');
const messaggi = document.querySelector('#messaggi');
const selectLivello = document.querySelector('#livello');
const pulsanteSuggerimento = document.querySelector('#suggerimento');
const pulsanteAnteprima = document.querySelector('#anteprima');
const anteprimaBox = document.querySelector('#anteprima_box');
const riepilogo = document.querySelector('#riepilogo');
const azioni = document.querySelector('#azioni');

let lato = 3;
let griglia = [];
let tasselli = [];         // un pulsante per numero di tassello (l'ultimo è il tassello mancante)
let storia = [];           // posizioni attraversate, dal puzzle risolto: serve al suggerimento di riserva
let immagine = null;
let mosse = 0;
let secondi = 0;
let timer = null;
let suggerimentiUsati = 0;
let suggerito = null;      // numero del tassello illuminato dal suggerimento
let ultimo = -1;           // posizione in cui è arrivato il tassello mosso per ultimo
let finita = false;

const caso = () => Math.random();

function percorsoImmagine() {
    return `immagini/${immagine.file}`;
}

// Crea i tasselli della partita: ognuno mostra la sua parte d'immagine, la posizione la decide disegna()
function creaTasselli() {
    grigliaEl.textContent = '';
    grigliaEl.style.setProperty('--lato', lato);
    // immagine intera, mostrata dalla griglia alla vittoria (senza le righe tra un tassello e l'altro)
    grigliaEl.style.setProperty('--immagine', `url("${percorsoImmagine()}")`);
    tasselli = [];
    for (let numero = 0; numero < lato * lato; numero++) {
        const tassello = document.createElement('button');
        tassello.type = 'button';
        tassello.className = 'tassello';
        const r = Math.floor(numero / lato), c = numero % lato;
        tassello.style.backgroundImage = `url("${percorsoImmagine()}")`;
        tassello.style.backgroundSize = `${lato * 100}% ${lato * 100}%`;
        tassello.style.backgroundPosition = `${(c / (lato - 1)) * 100}% ${(r / (lato - 1)) * 100}%`;
        if (numero === lato * lato - 1) {
            tassello.classList.add('tassello--mancante');
            tassello.tabIndex = -1;
        }
        tassello.addEventListener('click', () => muoviTassello(griglia.indexOf(numero)));
        grigliaEl.appendChild(tassello);
        tasselli.push(tassello);
    }
}

function disegna() {
    const vuoto = lato * lato - 1;
    const mobili = finita ? [] : Puzzle.mobili(griglia);
    griglia.forEach((numero, posizione) => {
        const tassello = tasselli[numero];
        const r = Math.floor(posizione / lato), c = posizione % lato;
        tassello.style.setProperty('--riga', r);
        tassello.style.setProperty('--colonna', c);
        tassello.classList.toggle('tassello--mobile', mobili.includes(posizione));
        tassello.classList.toggle('tassello--suggerito', numero === suggerito);
        if (numero !== vuoto) {
            tassello.setAttribute('aria-label', `Tassello ${numero + 1}, riga ${r + 1}, colonna ${c + 1}${mobili.includes(posizione) ? ', si può muovere' : ''}`);
        } else {
            tassello.setAttribute('aria-hidden', finita ? 'false' : 'true');
        }
    });
    grigliaEl.classList.toggle('griglia-puzzle--completa', finita);
    document.querySelector('#mosse').textContent = mosse;
    document.querySelector('#tempo').textContent = Puzzle.formattaTempo(secondi);
    const rimasti = Puzzle.MAX_SUGGERIMENTI - suggerimentiUsati;
    pulsanteSuggerimento.textContent = `💡 Suggerimento (${rimasti})`;
    pulsanteSuggerimento.disabled = finita || rimasti === 0;
}

function muoviTassello(posizione) {
    if (finita || posizione === null || posizione < 0) return;
    const prima = griglia.indexOf(lato * lato - 1);
    const nuova = Puzzle.muovi(griglia, posizione);
    if (!nuova) return;
    griglia = nuova;
    ultimo = prima;
    mosse++;
    suggerito = null;
    storia.push(Puzzle.chiave(griglia));
    messaggi.textContent = '';
    messaggi.className = '';
    avviaTempo();
    if (Puzzle.vinta(griglia)) fine();
    disegna();
}

function chiediSuggerimento() {
    if (finita || suggerimentiUsati >= Puzzle.MAX_SUGGERIMENTI) return;
    const posizione = Puzzle.suggerimento(griglia, { ultimo, storia });
    if (posizione === null) return;
    suggerimentiUsati++;
    suggerito = griglia[posizione];
    messaggi.textContent = 'Muovi il tassello illuminato.'; // quanti ne restano lo dice il pulsante
    messaggi.className = '';
    disegna();
}

function avviaTempo() {
    if (timer === null && !finita) {
        timer = setInterval(() => {
            secondi++;
            document.querySelector('#tempo').textContent = Puzzle.formattaTempo(secondi);
        }, 1000);
    }
}

function fermaTempo() {
    clearInterval(timer);
    timer = null;
}

// Con il pannello del telefono aperto (js/tavola.js) il tempo si ferma e riparte alla chiusura
let tempoInPausa = false;
document.addEventListener('tavola:aperta', () => { if (timer !== null) { fermaTempo(); tempoInPausa = true; } });
document.addEventListener('tavola:chiusa', () => { if (tempoInPausa) { tempoInPausa = false; avviaTempo(); } });

function fine() {
    finita = true;
    fermaTempo();
    suggerito = null;
    messaggi.textContent = 'Puzzle completato!';
    messaggi.className = 'messaggio--successo';
    document.querySelector('#riepilogo_mosse').textContent = mosse;
    document.querySelector('#riepilogo_tempo').textContent = Puzzle.formattaTempo(secondi);
    document.querySelector('#riepilogo_suggerimenti').textContent = `${suggerimentiUsati} su ${Puzzle.MAX_SUGGERIMENTI}`;
    // il riepilogo prende il posto dei pulsanti Suggerimento e Anteprima: la griglia non cambia misura
    mostraAnteprima(false);
    azioni.hidden = true;
    riepilogo.hidden = false;
}

function mostraAnteprima(aperta) {
    anteprimaBox.hidden = !aperta;
    pulsanteAnteprima.setAttribute('aria-expanded', String(aperta));
}

function iniziaPartita() {
    fermaTempo();
    const livello = Puzzle.LIVELLI[selectLivello.value] || Puzzle.LIVELLI.facile;
    lato = livello.lato;
    immagine = Puzzle.scegliImmagine(Puzzle.IMMAGINI, immagine?.file, caso);
    const mescolato = Puzzle.mescola(lato, livello.mescolate, caso);
    griglia = mescolato.griglia;
    storia = mescolato.storia;
    mosse = 0;
    secondi = 0;
    suggerimentiUsati = 0;
    suggerito = null;
    ultimo = -1;
    finita = false;
    tempoInPausa = false;
    messaggi.textContent = '';
    messaggi.className = '';
    riepilogo.hidden = true;
    azioni.hidden = false;
    const img = document.querySelector('#anteprima_img');
    img.src = percorsoImmagine();
    img.alt = `Anteprima: ${immagine.nome}`;
    document.querySelector('#anteprima_nome').textContent = immagine.nome;
    mostraAnteprima(false);
    creaTasselli();
    disegna();
}

// Tastiera: le frecce spostano verso lo spazio vuoto il tassello che sta dal lato opposto
document.addEventListener('keydown', evento => {
    const bersaglio = evento.target;
    if (bersaglio instanceof Element && bersaglio.matches('input, select, textarea')) return;
    if (!evento.key.startsWith('Arrow') || finita) return;
    evento.preventDefault();
    muoviTassello(Puzzle.posizioneDaFreccia(griglia, evento.key));
});

pulsanteSuggerimento.addEventListener('click', chiediSuggerimento);
pulsanteAnteprima.addEventListener('click', () => mostraAnteprima(anteprimaBox.hidden));
document.querySelector('#nuovaPartita').addEventListener('click', iniziaPartita);
selectLivello.addEventListener('change', iniziaPartita);

iniziaPartita();
