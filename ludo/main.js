
const contenitore = document.querySelector('#contenitore_gioco');
const tabelloneEl = document.querySelector('#tabelloneLudo');
const dado = document.querySelector('#dado');
const messaggi = document.querySelector('#messaggi');
const selectNumero = document.querySelector('#numeroGiocatori');

const FACCE = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
const NOMI = { rosso: 'Rosso', verde: 'Verde', giallo: 'Giallo', blu: 'Blu' };
const ATTESA_PC = 650;

let stato = statoIniziale(4);
let tiro = null;            // valore del dado nel turno in corso (null = da lanciare)
let mosseOra = [];
let finita = false;
let timer;
// Mentre il pannello del telefono (js/tavola.js) è aperto il computer aspetta; una nuova partita annulla l'attesa
let partita = 0;
function dopoPannello(fn) {
    const questa = partita;
    const esegui = () => { if (questa === partita) fn(); };
    if (typeof Tavola !== 'undefined') Tavola.quandoChiuso(esegui); else esegui();
}

// Tabellone 15 × 15: ogni cella sa che cosa rappresenta
const celle = [];
for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
        const cella = document.createElement('div');
        cella.className = 'casella-ludo';
        tabelloneEl.appendChild(cella);
        celle.push(cella);
    }
}
const cella = (r, c) => celle[r * 15 + c];

function preparaTabellone() {
    // basi negli angoli (6 × 6) e centro (3 × 3)
    const angoli = { rosso: [0, 0], verde: [0, 9], giallo: [9, 9], blu: [9, 0] };
    for (const [colore, [r0, c0]] of Object.entries(angoli)) {
        for (let r = r0; r < r0 + 6; r++) for (let c = c0; c < c0 + 6; c++) cella(r, c).classList.add('casella-ludo--base', `casella-ludo--base-${colore}`);
    }
    for (let r = 6; r < 9; r++) for (let c = 6; c < 9; c++) cella(r, c).classList.add('casella-ludo--centro');
    COORD_PERCORSO.forEach(([r, c], i) => {
        const el = cella(r, c);
        el.classList.add('casella-ludo--percorso');
        if (SICURE.has(i)) el.classList.add('casella-ludo--sicura');
        for (const colore of COLORI) {
            if (PARTENZA[colore] === i) el.classList.add('casella-ludo--partenza', `casella-ludo--partenza-${colore}`);
        }
    });
    for (const colore of COLORI) {
        COORD_ARRIVO[colore].forEach(([r, c], k) => cella(r, c).classList.add(k < 5 ? `casella-ludo--arrivo-${colore}` : `casella-ludo--meta-${colore}`));
        COORD_BASE[colore].forEach(([r, c]) => cella(r, c).classList.add('casella-ludo--posto', `casella-ludo--posto-${colore}`));
    }
}

// Coordinate della pedina k del colore, data la sua posizione
function coordinate(colore, k, posizione) {
    if (posizione === -1) return COORD_BASE[colore][k];
    if (posizione <= 50) return COORD_PERCORSO[assoluta(colore, posizione)];
    return COORD_ARRIVO[colore][posizione - 51];
}

function coloreDiTurno() {
    return stato.colori[stato.tocca];
}

function tipo(colore) {
    return document.querySelector(`#tipo-${colore}`).value;
}

function disegna() {
    celle.forEach(c => {
        c.querySelectorAll('.pedina-ludo').forEach(p => p.remove());
    });
    const mobili = new Set(mosseOra.map(m => m.pedina));
    for (const colore of stato.colori) {
        stato.pedine[colore].forEach((pos, k) => {
            const [r, c] = coordinate(colore, k, pos);
            const pedina = document.createElement('button');
            pedina.type = 'button';
            pedina.className = `pedina-ludo pedina-ludo--${colore}`;
            const giocabile = !finita && tiro !== null && colore === coloreDiTurno() && tipo(colore) === 'umano' && mobili.has(k);
            pedina.classList.toggle('pedina-ludo--mobile', giocabile);
            pedina.disabled = !giocabile;
            const dove = pos === -1 ? 'in base' : pos === ARRIVO ? 'arrivata' : pos > 50 ? 'nella colonna di arrivo' : `sulla casella ${assoluta(colore, pos) + 1}`;
            pedina.setAttribute('aria-label', `Pedina ${NOMI[colore].toLowerCase()} ${k + 1}, ${dove}`);
            pedina.addEventListener('click', () => scegli(k));
            cella(r, c).appendChild(pedina);
        });
    }
    // più pedine nella stessa casella: il CSS le rimpicciolisce
    celle.forEach(c => { c.dataset.pedine = c.querySelectorAll('.pedina-ludo').length; });
    for (const colore of COLORI) {
        const inGioco = stato.colori.includes(colore);
        document.querySelector(`.segnapunti--${colore}`).hidden = !inGioco;
        document.querySelector(`.configurazione__riga--${colore}`).hidden = !inGioco;
        if (inGioco) document.querySelector(`#arrivate-${colore}`).textContent = `${stato.pedine[colore].filter(p => p === ARRIVO).length}/4`;
    }
    contenitore.dataset.turno = finita ? '' : coloreDiTurno();
    dado.disabled = finita || tiro !== null || tipo(coloreDiTurno()) !== 'umano';
}

function mostraDado(valore) {
    dado.dataset.valore = valore;
    dado.textContent = FACCE[valore];
    dado.setAttribute('aria-label', `Dado: ${valore}`);
    dado.classList.remove('dado--lancio');
    void dado.offsetWidth;
    dado.classList.add('dado--lancio');
}

function annunciaTurno() {
    if (finita) return;
    const colore = coloreDiTurno();
    const chi = tipo(colore) === 'umano' ? NOMI[colore] : `${NOMI[colore]} (computer)`;
    messaggi.textContent = tipo(colore) === 'umano'
        ? `Tocca a ${chi}: lancia il dado${stato.seiDiFila > 0 ? ' di nuovo' : ''}.`
        : `Tocca a ${chi}…`;
    messaggi.className = '';
}

function lancia() {
    if (finita || tiro !== null) return;
    tiro = tiraDado();
    mostraDado(tiro);
    const colore = coloreDiTurno();
    mosseOra = mossePossibili(stato, colore, tiro);
    if (mosseOra.length === 0) {
        messaggi.textContent = `${NOMI[colore]}: ${tiro}, nessuna mossa possibile.`;
        disegna();
        timer = setTimeout(() => esegui(null), 900);
        return;
    }
    if (tipo(colore) === 'computer') {
        disegna();
        timer = setTimeout(() => dopoPannello(() => esegui(mossaPC(stato, colore, tiro))), ATTESA_PC);
        return;
    }
    messaggi.textContent = `${NOMI[colore]}: hai fatto ${tiro}. Tocca la pedina da muovere.`;
    disegna();
}

function scegli(k) {
    const mossa = mosseOra.find(m => m.pedina === k);
    if (mossa) esegui(mossa);
}

function esegui(mossa) {
    const colore = coloreDiTurno();
    const valore = tiro;
    stato = applica(stato, valore, mossa);
    tiro = null;
    mosseOra = [];
    const vince = vincitore(stato);
    if (vince) {
        finita = true;
        messaggi.textContent = `Vince ${NOMI[vince]}${tipo(vince) === 'computer' ? ' (computer)' : ''}!`;
        messaggi.className = tipo(vince) === 'umano' ? 'messaggio--successo' : 'messaggio--errore';
        disegna();
        return;
    }
    if (mossa && mossa.mangia.length > 0) {
        messaggi.textContent = `${NOMI[colore]} mangia ${mossa.mangia.map(p => NOMI[p.colore].toLowerCase()).join(' e ')}!`;
    }
    disegna();
    prossimoTurno(mossa && mossa.mangia.length > 0 ? 900 : 0);
}

function prossimoTurno(attesa = 0) {
    clearTimeout(timer);
    timer = setTimeout(() => {
        annunciaTurno();
        disegna();
        if (tipo(coloreDiTurno()) === 'computer') {
            timer = setTimeout(() => dopoPannello(lancia), ATTESA_PC);
        }
    }, attesa);
}

function iniziaPartita() {
    partita++;
    clearTimeout(timer);
    stato = statoIniziale(Number(selectNumero.value));
    tiro = null;
    mosseOra = [];
    finita = false;
    dado.textContent = '🎲';
    delete dado.dataset.valore;
    dado.setAttribute('aria-label', 'Lancia il dado');
    disegna();
    prossimoTurno();
}

dado.addEventListener('click', lancia);
document.querySelector('#nuovaPartita').addEventListener('click', iniziaPartita);
selectNumero.addEventListener('change', iniziaPartita);
for (const colore of COLORI) {
    document.querySelector(`#tipo-${colore}`).addEventListener('change', iniziaPartita);
}

preparaTabellone();
iniziaPartita();
