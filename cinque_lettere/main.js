const vocabolario = new Set(PAROLE_CINQUE);
const campo = document.querySelector('#parola');
const modulo = document.querySelector('#modulo');
const invia = document.querySelector('#invia');
const nuova = document.querySelector('#nuovaPartita');
const messaggi = document.querySelector('#messaggi');
const tabella = document.querySelector('#tentativi');
const tastiera = document.querySelector('#tastiera');
const selectModalita = document.querySelector('#modalitaGioco');
const pulsanteNomi = document.querySelector('#nomiGiocatori');
const descrizioni = { esatta: 'al posto giusto', presente: 'presente in un altro posto', assente: 'non disponibile' };
const simboli = { esatta: '✓', presente: '↔', assente: '–' };
let partita = null, sfida = null, dueGiocatori = false, inPreparazione = false, generazione = 0, secondoInAttesa = false;
let nomi = Giocatori.leggiNomi();

const righe = [];
for (let r = 0; r < 6; r++) {
    const riga = document.createElement('li');
    riga.className = 'riga-lettere';
    const celle = [];
    for (let i = 0; i < 5; i++) {
        const cella = document.createElement('span');
        cella.className = 'tessera-lettera'; cella.setAttribute('aria-hidden', 'true');
        const lettera = document.createElement('span'), indizio = document.createElement('small');
        indizio.className = 'indizio-lettera'; cella.append(lettera, indizio); riga.appendChild(cella);
        celle.push({ cella, lettera, indizio });
    }
    righe.push({ riga, celle }); tabella.appendChild(riga);
}
const tasti = new Map();
for (const lettere of ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']) {
    const riga = document.createElement('div'); riga.className = 'tastiera-riga';
    for (const lettera of lettere) {
        const tasto = document.createElement('button');
        tasto.type = 'button'; tasto.className = 'tasto-lettera'; tasto.textContent = lettera.toUpperCase();
        tasto.addEventListener('click', () => scrivi(lettera));
        tasti.set(lettera, tasto); riga.appendChild(tasto);
    }
    tastiera.appendChild(riga);
}
const cancella = document.querySelector('#cancella');
const invioTastiera = document.querySelector('#invioTastiera');
const giocabile = () => partita && !partita.finita && !inPreparazione;

function messaggio(testo, tipo = '') { messaggi.textContent = testo; messaggi.className = tipo ? `messaggio--${tipo}` : ''; }
function aggiornaSfida() {
    document.querySelector('#punteggiDue').hidden = !dueGiocatori;
    document.querySelector('#turnoDue').hidden = !dueGiocatori;
    for (let i = 0; i < 2; i++) {
        document.querySelector(`#nomeG${i + 1}`).textContent = nomi[i];
        const n = sfida?.risultati[i];
        document.querySelector(`#puntiG${i + 1}`).textContent = n == null ? '–' : n > 6 ? 'Non trovata' : `${n} tent.`;
    }
}
function disegna() {
    const attivi = Boolean(giocabile());
    righe.forEach(({ riga, celle }, r) => {
        const prova = partita?.tentativi[r];
        const corrente = attivi && r === partita.tentativi.length;
        const parola = prova?.parola || (corrente ? campo.value : '');
        riga.classList.toggle('riga-lettere--corrente', corrente);
        celle.forEach(({ cella, lettera, indizio }, i) => {
            const esito = prova?.esiti[i];
            lettera.textContent = parola[i]?.toUpperCase() || '';
            indizio.textContent = esito ? simboli[esito] : '';
            if (esito) cella.dataset.esito = esito; else delete cella.dataset.esito;
        });
        riga.setAttribute('aria-label', prova
            ? `Tentativo ${r + 1}: ${[...prova.parola].map((l, i) => `${l.toUpperCase()} ${descrizioni[prova.esiti[i]]}`).join('; ')}`
            : `Tentativo ${r + 1}: ${parola ? [...parola.toUpperCase()].join(' ') : 'vuoto'}`);
    });
    for (const [lettera, tasto] of tasti) {
        const esito = partita?.tastiera[lettera];
        tasto.disabled = !attivi;
        if (esito) tasto.dataset.esito = esito; else delete tasto.dataset.esito;
        tasto.setAttribute('aria-label', `${lettera.toUpperCase()}${esito ? `: ${descrizioni[esito]}` : ''}`);
    }
    campo.disabled = !attivi; invia.disabled = !attivi; cancella.disabled = !attivi; invioTastiera.disabled = !attivi;
    nuova.disabled = inPreparazione; selectModalita.disabled = inPreparazione; pulsanteNomi.disabled = inPreparazione;
    document.querySelector('#contaTentativi').textContent = `${partita?.tentativi.length || 0} / 6`;
    aggiornaSfida();
}
function scrivi(lettera) {
    if (!giocabile() || campo.value.length >= 5) return;
    campo.value += lettera; messaggio(''); disegna();
}
function togli() {
    if (!giocabile()) return;
    campo.value = campo.value.slice(0, -1); messaggio(''); disegna();
}
function fineTurno() {
    if (!dueGiocatori) { nuova.textContent = 'Nuova parola'; return; }
    CinqueLettere.registra(sfida, partita);
    if (!sfida.finita) {
        secondoInAttesa = true;
        document.querySelector('#turnoDue').textContent = `${nomi[1]} sceglie la prossima parola; ${nomi[0]} proverà a indovinarla.`;
        nuova.textContent = 'Secondo turno';
    } else {
        secondoInAttesa = false;
        const vincitore = CinqueLettere.vincitore(sfida);
        const esito = vincitore === null ? 'Sfida in pareggio!' : `Vince ${nomi[vincitore]}: ha usato meno tentativi!`;
        document.querySelector('#turnoDue').textContent = esito;
        messaggio(`${messaggi.textContent} ${esito}`, 'successo');
        nuova.textContent = 'Nuova sfida';
    }
}
function conferma() {
    if (!giocabile()) return;
    const esito = CinqueLettere.tenta(partita, campo.value, vocabolario);
    if (esito.errore) { messaggio(esito.errore, 'errore'); return; }
    campo.value = '';
    if (partita.finita) {
        messaggio(partita.vinta ? `Hai trovato ${partita.segreta.toUpperCase()} in ${partita.tentativi.length} tentativi!`
            : `Tentativi finiti: la parola era ${partita.segreta.toUpperCase()}.`, partita.vinta ? 'successo' : 'errore');
        fineTurno();
    } else {
        const riepilogo = partita.tentativi.at(-1);
        messaggio(`${riepilogo.parola.toUpperCase()}: ${riepilogo.esiti.filter(e => e === 'esatta').length} lettere al posto giusto. Restano ${6 - partita.tentativi.length} tentativi.`);
    }
    disegna();
}
function avvia(parola) {
    partita = CinqueLettere.crea(parola, vocabolario); campo.value = '';
    messaggio('Scrivi la tua prima parola di cinque lettere.'); disegna(); campo.focus();
}
async function nuovaPartita() {
    if (inPreparazione) return;
    const versione = ++generazione;
    campo.value = ''; partita = null;
    if (!dueGiocatori) {
        sfida = null; nuova.textContent = 'Nuova parola';
        avvia(PAROLE_CINQUE[Math.floor(Math.random() * PAROLE_CINQUE.length)]); return;
    }
    if (!secondoInAttesa) sfida = CinqueLettere.creaSfida();
    secondoInAttesa = false;
    const sceglie = sfida.turno, indovina = 1 - sceglie;
    inPreparazione = true; nuova.textContent = 'Nuova sfida';
    document.querySelector('#turnoDue').textContent = `${nomi[sceglie]} sceglie la parola…`;
    messaggio('Passa il dispositivo a chi sceglie. La parola resterà nascosta.');
    disegna();
    try {
        const parola = await Giocatori.chiediSegreto({
            titolo: `${nomi[sceglie]}, scegli cinque lettere`,
            testo: `${nomi[indovina]} non deve guardare. Usa una parola del vocabolario: sono ammessi plurali e forme flesse.`,
            etichetta: 'Parola segreta di cinque lettere', controlla: testo => CinqueLettere.controlla(testo, vocabolario)
        });
        if (versione !== generazione) return;
        await Giocatori.passaDispositivo(nomi[indovina]);
        if (versione !== generazione) return;
        inPreparazione = false;
        document.querySelector('#turnoDue').textContent = `Indovina ${nomi[indovina]} · Parola scelta da ${nomi[sceglie]}`;
        avvia(parola);
    } catch {
        inPreparazione = false; partita = null;
        messaggio('Preparazione interrotta. Premi Nuova sfida per riprovare.', 'errore'); disegna();
    }
}
modulo.addEventListener('submit', e => { e.preventDefault(); conferma(); });
campo.addEventListener('input', e => {
    if (e.isComposing) return;
    campo.value = CinqueLettere.normalizza(campo.value).replace(/[^a-z]/g, '').slice(0, 5);
    messaggio(''); disegna();
});
cancella.addEventListener('click', togli);
invioTastiera.addEventListener('click', conferma);
nuova.addEventListener('click', nuovaPartita);
document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey || document.querySelector('.copertura')) return;
    if (e.target instanceof Element && e.target.matches('input, select, textarea')) return;
    if (e.target instanceof Element && e.target.matches('button, a, summary') && ['Enter', ' '].includes(e.key)) return;
    if (/^[a-z]$/i.test(e.key)) { e.preventDefault(); scrivi(e.key.toLowerCase()); }
    else if (e.key === 'Backspace') { e.preventDefault(); togli(); }
    else if (e.key === 'Enter') { e.preventDefault(); conferma(); }
});
Giocatori.collegaBarra({ select: selectModalita, pulsanteNomi,
    suCambioModalita: due => {
        if (inPreparazione) return;
        dueGiocatori = due; sfida = null; secondoInAttesa = false; nuovaPartita();
    },
    suCambioNomi: n => { nomi = n; disegna(); if (dueGiocatori && partita && !partita.finita) document.querySelector('#turnoDue').textContent = `Indovina ${nomi[1 - sfida.turno]} · Parola scelta da ${nomi[sfida.turno]}`; }
});
document.querySelector('#numeroParole').textContent = PAROLE_CINQUE.length;
nuovaPartita();
