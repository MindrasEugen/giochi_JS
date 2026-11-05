// Pagina del Poker heads-up. Contro il PC le sue carte restano coperte fino al confronto finale;
// in due si passa il dispositivo prima di ogni scelta e si vedono solo le proprie carte.
(() => {
    const P = Poker;
    const select = document.querySelector('#modalitaGioco');
    const nomiPulsante = document.querySelector('#nomiGiocatori');
    const nuova = document.querySelector('#nuovaPartita');
    const opzioni = document.querySelector('#opzioniPresa');
    const messaggi = document.querySelector('#messaggi');
    let stato, timer = null, versione = 0, coperto = true, occupato = true, inPassaggio = false, vista = 0, cronaca = '';
    let nomi = Giocatori.leggiNomi();
    const due = () => select.value === 'due';
    const nome = g => due() ? nomi[g] : g === 0 ? 'Tu' : 'Computer';
    const umano = g => due() || g === 0;
    const scrivi = testo => { messaggi.textContent = testo; };
    const FASI = { preflop: 'prima del flop', flop: 'flop', turn: 'turn', river: 'river', fine: 'fine della mano' };
    function descrivi(u) {
        if (!u) return '';
        const chi = nome(u.giocatore);
        if (u.azione === 'lascia') return `${chi} lascia.`;
        if (u.azione === 'passa') return `${chi} passa.`;
        if (u.azione === 'chiama') return `${chi} vede ${u.quanto}.`;
        return u.tutto ? `${chi} mette tutto: ${u.totale}.` : `${chi} punta ${u.totale}.`;
    }
    function disegna() {
        const s = stato, altro = 1 - vista, fine = s.fase === 'fine';
        for (const g of [0, 1]) { document.querySelector(`#nomeP${g}`).textContent = `${nome(g)}${g === s.mazziere ? ' (mazziere)' : ''}`; document.querySelector(`#puntiP${g}`).textContent = s.fiches[g]; }
        document.querySelector('#tipoPunti').textContent = `Fiches · mano ${s.numeroMano} · bui ${P.PICCOLO}/${P.GRANDE} · ${FASI[s.fase]}`;
        document.querySelector('#titoloAltro').textContent = nome(altro);
        document.querySelector('#titoloMio').textContent = coperto ? 'Carte coperte' : due() ? `Carte di ${nome(vista)}` : 'Le tue carte';
        const mostraAltro = fine && s.esito?.mostrate;
        const carteAltro = document.querySelector('#carteAltro'); carteAltro.textContent = '';
        s.mani[altro].forEach(c => carteAltro.appendChild(Carte.crea(c, { coperta: !mostraAltro })));
        const mie = document.querySelector('#carteMie'); mie.textContent = '';
        s.mani[vista].forEach(c => mie.appendChild(Carte.crea(c, { coperta: coperto && !mostraAltro })));
        const tavolo = document.querySelector('#carteTavolo'); tavolo.textContent = '';
        s.tavolo.forEach(c => tavolo.appendChild(Carte.crea(c)));
        document.querySelector('#piatto').textContent = fine ? '' : `Piatto: ${s.piatto}`;
        const testoPuntata = g => fine ? (mostraAltro ? s.mostrate[g].nome : '') : s.puntate[g] ? `Puntata: ${s.puntate[g]}` : '';
        document.querySelector('#puntataAltro').textContent = testoPuntata(altro);
        document.querySelector('#puntataMia').textContent = testoPuntata(vista);
        opzioni.textContent = '';
        // A fine mano il pulsante "Mano successiva" serve anche con le carte coperte
        const attivo = !occupato && !s.finita && (fine || (!coperto && umano(s.turno)));
        if (attivo) P.mosseLegali(s).forEach(m => {
            const bottone = document.createElement('button'); bottone.type = 'button'; bottone.className = 'pulsante pulsante--secondario scelta-presa';
            bottone.textContent = P.etichettaMossa(s, m);
            bottone.addEventListener('click', () => applica(m));
            opzioni.appendChild(bottone);
        });
        nuova.disabled = inPassaggio; select.disabled = inPassaggio; nomiPulsante.hidden = !due(); nomiPulsante.disabled = inPassaggio;
        const risultati = document.querySelector('#risultati');
        risultati.hidden = !s.finita; risultati.textContent = '';
        if (s.finita) {
            const h = document.createElement('h2'); h.textContent = 'Fine della partita';
            const p = document.createElement('p'); p.textContent = `Vince ${nome(s.vincitorePartita)} dopo ${s.numeroMano} mani, con tutte le ${2 * P.FICHES} fiches.`;
            risultati.append(h, p);
        }
    }
    function testoFine() {
        const s = stato, e = s.esito;
        if (!e.mostrate) return `${nome(e.vincitori[0])} ${e.vincitori[0] === 0 && !due() ? 'vinci' : 'vince'} il piatto di ${e.piatto}.`;
        const mani = s.mostrate.map((m, g) => `${nome(g)}: ${m.nome}`).join(' · ');
        return `${mani}. ${e.vincitori.length === 2 ? `Piatto diviso (${e.piatto}).` : `${nome(e.vincitori[0])} ${e.vincitori[0] === 0 && !due() ? 'vinci' : 'vince'} ${e.piatto} fiches.`}`;
    }
    function applica(mossa) {
        if (!mossa || !P.gioca(stato, mossa)) return;
        cronaca = mossa.prossima ? '' : descrivi(stato.ultimo);
        prepara();
    }
    function pianifica(azione, attesa = 900) {
        const corrente = versione;
        timer = setTimeout(() => { timer = null; if (corrente === versione) azione(); }, attesa);
    }
    async function prepara() {
        const corrente = versione, s = stato;
        occupato = true; coperto = due();
        if (s.finita) { coperto = false; disegna(); scrivi(`${cronaca} Partita finita: vince ${nome(s.vincitorePartita)}!`.trim()); return; }
        if (s.fase === 'fine') { occupato = false; coperto = due() && !s.esito.mostrate; disegna(); scrivi(`${cronaca} ${testoFine()}`.trim()); return; }
        const g = s.turno;
        if (umano(g)) {
            if (due()) {
                inPassaggio = true; disegna();
                await Giocatori.passaDispositivo(nome(g));
                if (corrente !== versione) return;
                inPassaggio = false;
            }
            vista = g; coperto = false; occupato = false; disegna();
            const chiamata = P.daChiamare(s, g);
            const invito = chiamata ? `per vedere servono ${Math.min(chiamata, s.fiches[g])} fiches.` : 'puoi passare o puntare.';
            scrivi(`${cronaca} ${due() ? `${nome(g)}: ${invito}` : invito[0].toUpperCase() + invito.slice(1)}`.trim());
        } else {
            coperto = false; disegna(); scrivi(`${cronaca} ${nome(g)} sta pensando…`.trim());
            pianifica(() => applica(P.mossaPC(stato)));
        }
    }
    function nuovaPartita() {
        if (inPassaggio) return;
        clearTimeout(timer); timer = null; versione++;
        stato = P.crea(due() ? 'due' : 'uno'); vista = 0; cronaca = '';
        prepara();
    }
    select.addEventListener('change', nuovaPartita);
    nuova.addEventListener('click', nuovaPartita);
    nomiPulsante.addEventListener('click', async () => { nomi = await Giocatori.chiediNomi(); disegna(); });
    nuovaPartita();
})();
