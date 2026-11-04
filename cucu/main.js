// Pagina del Cucù: posti attorno al tavolo, una carta a testa, vite. In "2 persone" i posti 0 e 1 sono umani
// e si passa il dispositivo prima di ogni loro turno; le carte degli altri restano coperte fino alla fine della mano.
(() => {
    const select = document.querySelector('#modalitaGioco');
    const nomiPulsante = document.querySelector('#nomiGiocatori');
    const nuova = document.querySelector('#nuovaPartita');
    const posti = document.querySelector('#posti');
    const tavolo = document.querySelector('#carteTavolo');
    const opzioni = document.querySelector('#opzioniPresa');
    const messaggi = document.querySelector('#messaggi');
    let stato, timer = null, versione = 0, coperto = true, occupato = true, inPassaggio = false, vista = 0, cronaca = '';
    let nomi = Giocatori.leggiNomi();
    const due = () => select.value.startsWith('due');
    const numero = () => Number(select.value.split('-')[1]);
    const umani = () => due() ? [0, 1] : [0];
    const umano = g => umani().includes(g);
    const nome = g => due() ? (g < 2 ? nomi[g] : `PC ${g - 1}`) : (g === 0 ? 'Tu' : `PC ${g}`);
    const cuori = v => v > 0 ? '♥'.repeat(v) : 'eliminato';
    function scrivi(testo) { messaggi.textContent = testo; }
    function descrivi(u) {
        if (!u) return '';
        const conTe = g => !due() && g === 0 ? 'te' : nome(g);
        switch (u.tipo) {
            case 'tiene': return `${nome(u.giocatore)} tiene la carta.`;
            case 'cambio': return `${nome(u.giocatore)} scambia la carta con ${conTe(u.altro)}.`;
            case 'cucu': return `${nome(u.giocatore)} vuole cambiare, ma ${nome(u.altro)} ha il re: cucù!`;
            case 'mazzo': return `${nome(u.giocatore)} cambia con il mazzo.`;
            case 'cucuMazzo': return `${nome(u.giocatore)} pesca un re dal mazzo: cucù, tiene la sua carta.`;
            default: return '';
        }
    }
    function disegna() {
        const fine = stato.fase === 'fine';
        document.querySelector('#nomeP0').textContent = 'Mano';
        document.querySelector('#puntiP0').textContent = stato.mano;
        document.querySelector('#nomeP1').textContent = 'Giocatori in gioco';
        document.querySelector('#puntiP1').textContent = Cucu.vivi(stato).length;
        document.querySelector('#tipoPunti').textContent = `Mazziere: ${nome(stato.mazziere)}`;
        posti.textContent = '';
        for (let g = 0; g < stato.numero; g++) {
            const posto = document.createElement('div');
            posto.className = 'posto';
            if (stato.vite[g] === 0 && !stato.persi.includes(g)) posto.classList.add('posto--eliminato');
            if (!fine && g === stato.turno && !stato.finita) posto.classList.add('posto--turno');
            if (fine && stato.persi.includes(g)) posto.classList.add('posto--perde');
            const titolo = document.createElement('p'); titolo.className = 'posto__nome';
            titolo.textContent = `${nome(g)}${g === stato.mazziere ? ' · mazziere' : ''}`;
            const vite = document.createElement('p'); vite.className = 'posto__vite';
            vite.textContent = cuori(stato.vite[g]); vite.setAttribute('aria-label', stato.vite[g] > 0 ? `${stato.vite[g]} vite` : 'eliminato');
            posto.append(titolo, vite);
            const carta = stato.carte[g];
            if (carta) posto.appendChild(Carte.crea(carta, { coperta: !(fine || (g === vista && umano(g) && !coperto)) }));
            posti.appendChild(posto);
        }
        // Al centro: le carte scartate dal mazziere e i re pescati dal mazzo
        tavolo.textContent = '';
        const centro = [...stato.scartate, ...(stato.ultimo?.tipo === 'cucuMazzo' && !fine ? [stato.ultimo.carta] : [])];
        centro.forEach(c => tavolo.appendChild(Carte.crea(c)));
        document.querySelector('#tavoloVuoto').textContent = centro.length ? '' : `Carte nel mazzo: ${stato.mazzo.length}`;
        opzioni.textContent = '';
        const attivo = !occupato && !coperto && !stato.finita && (fine ? true : umano(stato.turno));
        if (attivo) Cucu.mosseLegali(stato).forEach(m => {
            const bottone = document.createElement('button'); bottone.type = 'button'; bottone.className = 'pulsante pulsante--secondario scelta-presa';
            bottone.textContent = Cucu.etichettaMossa(stato, m, nome);
            bottone.addEventListener('click', () => applica(m));
            opzioni.appendChild(bottone);
        });
        nuova.disabled = inPassaggio; select.disabled = inPassaggio; nomiPulsante.hidden = !due(); nomiPulsante.disabled = inPassaggio;
        const risultati = document.querySelector('#risultati');
        risultati.hidden = !stato.finita; risultati.textContent = '';
        if (stato.finita) {
            const h = document.createElement('h2'); h.textContent = 'Fine della partita';
            const p = document.createElement('p'); p.textContent = `Vince ${nome(stato.vincitore)} dopo ${stato.mano} mani.`;
            risultati.append(h, p);
        }
    }
    function applica(mossa) {
        if (!Cucu.gioca(stato, mossa)) return;
        cronaca = descrivi(stato.ultimo);
        prepara();
    }
    function pianifica(azione, attesa = 800) {
        const corrente = versione;
        timer = setTimeout(() => { timer = null; if (corrente === versione) azione(); }, attesa);
    }
    function testoFine() {
        if (stato.finita) return `Vince ${nome(stato.vincitore)}!`;
        if (!stato.persi.length) return 'Carte uguali per tutti: mano nulla, nessuno perde vite.';
        const bassa = Mazzo.nome(stato.carte[stato.persi[0]]);
        return `Carta più bassa: ${bassa}. ${stato.persi.map(nome).join(', ')} ${stato.persi.length > 1 ? 'perdono' : 'perde'} una vita.`;
    }
    async function prepara() {
        const corrente = versione;
        occupato = true; coperto = due();
        if (stato.fase === 'fine') {
            occupato = false; coperto = false; disegna();
            scrivi(`${cronaca} ${testoFine()}`.trim());
            // Se nessuna persona è più in gioco la partita prosegue da sola
            if (!stato.finita && !umani().some(g => stato.vite[g] > 0)) { occupato = true; disegna(); pianifica(() => applica({ prossima: true }), 1600); }
            return;
        }
        const g = stato.turno;
        if (umano(g)) {
            if (due()) {
                inPassaggio = true; disegna();
                await Giocatori.passaDispositivo(nome(g));
                if (corrente !== versione) return;
                inPassaggio = false;
            }
            vista = g; coperto = false; occupato = false; disegna();
            const mia = Mazzo.nome(stato.carte[g]);
            scrivi(`${cronaca} ${due() ? `${nome(g)}, hai` : 'Hai'} ${mia}: tieni o cambi?`.trim());
        } else {
            disegna(); scrivi(`${cronaca} ${nome(g)} sta decidendo…`.trim());
            pianifica(() => applica(Cucu.mossaPC(stato)));
        }
    }
    function nuovaPartita() {
        if (inPassaggio) return;
        clearTimeout(timer); timer = null; versione++;
        stato = Cucu.crea(numero());
        vista = 0; cronaca = '';
        prepara();
    }
    select.addEventListener('change', nuovaPartita);
    nuova.addEventListener('click', nuovaPartita);
    nomiPulsante.addEventListener('click', async () => { nomi = await Giocatori.chiediNomi(); disegna(); });
    nuovaPartita();
})();
