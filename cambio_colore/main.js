// Pagina di Cambio colore: carte disegnate in HTML e CSS (nessuna immagine), da 2 a 4 giocatori.
// In "2 persone" i posti 0 e 1 sono umani: prima di ogni loro turno si passa il dispositivo e le mani restano coperte.
(() => {
    const C = CambioColore;
    const SIMBOLI = { fermo: '⊘', giro: '⇄', piu2: '+2', cambio: '◐', cambio4: '+4' };
    const select = document.querySelector('#modalitaGioco');
    const nomiPulsante = document.querySelector('#nomiGiocatori');
    const nuova = document.querySelector('#nuovaPartita');
    const mano = document.querySelector('#mano');
    const opzioni = document.querySelector('#opzioniPresa');
    const messaggi = document.querySelector('#messaggi');
    let stato, timer = null, versione = 0, coperto = true, occupato = true, inPassaggio = false, vista = 0, cronaca = '';
    let nomi = Giocatori.leggiNomi();
    const due = () => select.value.startsWith('due');
    const numero = () => Number(select.value.split('-')[1]);
    const umano = g => (due() ? [0, 1] : [0]).includes(g);
    const nome = g => due() ? (g < 2 ? nomi[g] : `PC ${g - 1}`) : (g === 0 ? 'Tu' : `PC ${g}`);
    const scrivi = testo => { messaggi.textContent = testo; };
    // Una carta: <span class="carta-colore carta-colore--menta"><span class="carta-colore__simbolo">7</span></span>
    function creaCarta(carta, { coperta = false, piccola = false } = {}) {
        const el = document.createElement('span');
        el.className = 'carta-colore';
        if (piccola) el.classList.add('carta-colore--piccola');
        if (coperta) { el.classList.add('carta-colore--coperta'); el.setAttribute('aria-label', 'Carta coperta'); return el; }
        el.classList.add(`carta-colore--${carta.colore || 'jolly'}`);
        el.setAttribute('aria-label', C.nome(carta));
        const simbolo = document.createElement('span'); simbolo.className = 'carta-colore__simbolo';
        simbolo.textContent = carta.tipo === 'numero' ? carta.valore : SIMBOLI[carta.tipo];
        el.appendChild(simbolo);
        if (carta.tipo !== 'numero') { const nomeCarta = document.createElement('span'); nomeCarta.className = 'carta-colore__nome'; nomeCarta.textContent = C.NOMI[carta.tipo]; el.appendChild(nomeCarta); }
        return el;
    }
    function descrivi(u) {
        if (!u) return '';
        const chi = nome(u.giocatore);
        if (u.tipo === 'carta') {
            let testo = `${chi} gioca ${C.nome(u.carta)}.`;
            if (u.ultimaCarta) testo += ` ${chi}: ultima carta!`;
            if (u.salta !== undefined) testo += ` ${nome(u.salta)} salta il turno.`;
            if (u.pesca) testo += ` ${nome(u.pesca.giocatore)} pesca ${u.pesca.quante} carte e salta il turno.`;
            return testo;
        }
        if (u.tipo === 'colore') return `${chi} sceglie il colore ${u.colore}.${u.pesca ? ` ${nome(u.pesca.giocatore)} pesca ${u.pesca.quante} carte e salta il turno.` : ''}`;
        if (u.tipo === 'pesca') return `${chi} pesca una carta${u.passa ? ' e passa' : ''}.`;
        if (u.tipo === 'passa') return `${chi} passa.`;
        return '';
    }
    function disegna() {
        const s = stato;
        document.querySelector('#nomeP0').textContent = 'Tocca a'; document.querySelector('#puntiP0').textContent = s.finita ? '—' : nome(s.turno);
        document.querySelector('#nomeP1').textContent = 'Carte nel mazzo'; document.querySelector('#puntiP1').textContent = s.mazzo.length;
        document.querySelector('#tipoPunti').textContent = `Verso del gioco: ${s.verso === 1 ? 'orario' : 'antiorario'}`;
        const avversari = document.querySelector('#avversari'); avversari.textContent = '';
        s.mani.forEach((carte, g) => {
            if (g === vista) return;
            const zona = document.createElement('div'); zona.className = 'avversario-carte';
            if (g === s.turno && !s.finita) zona.classList.add('avversario-carte--turno');
            const titolo = document.createElement('span'); titolo.textContent = `${nome(g)} · ${carte.length} ${carte.length === 1 ? 'carta' : 'carte'}`;
            zona.appendChild(titolo);
            carte.slice(0, 8).forEach(() => zona.appendChild(creaCarta(null, { coperta: true, piccola: true })));
            avversari.appendChild(zona);
        });
        const scarti = document.querySelector('#scarti'); scarti.textContent = ''; scarti.appendChild(creaCarta(C.cima(s)));
        const colore = document.querySelector('#coloreAttivo'); colore.textContent = `Colore: ${s.colore}`; colore.className = `colore-attivo colore-attivo--${s.colore}`;
        document.querySelector('#mazzoRimasto').textContent = `${s.mazzo.length} carte nel mazzo`;
        document.querySelector('#titoloMano').textContent = coperto ? 'Mano coperta' : due() ? `Mano di ${nome(vista)}` : 'La tua mano';
        const attivo = !occupato && !coperto && !s.finita && umano(s.turno);
        const legali = attivo ? C.mosseLegali(s) : [];
        mano.textContent = '';
        mano.style.setProperty('--colonne', Carte.colonne(s.mani[vista].length, 5));
        s.mani[vista].forEach((carta, i) => {
            const bottone = document.createElement('button'); bottone.type = 'button'; bottone.className = 'carta-pulsante';
            bottone.appendChild(creaCarta(carta, { coperta: coperto }));
            bottone.disabled = !legali.some(m => m.carta === i);
            bottone.setAttribute('aria-label', coperto ? 'Carta coperta' : `Gioca ${C.nome(carta)}`);
            if (s.pescata === i && !coperto) bottone.classList.add('carta-pulsante--pescata');
            bottone.addEventListener('click', () => applica({ carta: i }));
            mano.appendChild(bottone);
        });
        opzioni.textContent = '';
        legali.filter(m => m.carta === undefined).forEach(m => {
            const bottone = document.createElement('button'); bottone.type = 'button'; bottone.className = 'pulsante pulsante--secondario scelta-presa';
            if (m.colore) { bottone.classList.add('scelta-colore', `scelta-colore--${m.colore}`); bottone.textContent = `Colore ${m.colore}`; }
            else bottone.textContent = m.pesca ? 'Pesca una carta' : 'Passa';
            bottone.addEventListener('click', () => applica(m));
            opzioni.appendChild(bottone);
        });
        nuova.disabled = inPassaggio; select.disabled = inPassaggio; nomiPulsante.hidden = !due(); nomiPulsante.disabled = inPassaggio;
        const risultati = document.querySelector('#risultati');
        risultati.hidden = !s.finita; risultati.textContent = '';
        if (s.finita) {
            const h = document.createElement('h2'); h.textContent = 'Fine della partita';
            const elenco = document.createElement('ul');
            s.mani.forEach((carte, g) => { const li = document.createElement('li'); li.textContent = `${nome(g)}: ${carte.length ? `${carte.length} carte rimaste` : 'nessuna carta, vince!'}`; elenco.appendChild(li); });
            risultati.append(h, elenco);
        }
    }
    function applica(mossa) {
        if (!mossa || !C.gioca(stato, mossa)) return;
        cronaca = descrivi(stato.ultimo);
        prepara();
    }
    // Mentre il pannello (js/tavola.js) è aperto il PC aspetta
    const dopoPannello = fn => (typeof Tavola !== 'undefined' ? Tavola.quandoChiuso(fn) : fn());
    function pianifica(azione, attesa = 900) {
        const corrente = versione;
        timer = setTimeout(() => { timer = null; dopoPannello(() => { if (corrente === versione) azione(); }); }, attesa);
    }
    async function prepara() {
        const corrente = versione, s = stato;
        occupato = true; coperto = due();
        if (s.finita) { coperto = false; disegna(); scrivi(`${cronaca} Vince ${nome(s.vincitore)}!`); return; }
        const g = s.turno;
        if (umano(g)) {
            // Stessa persona che continua (scelta del colore o carta pescata): niente passaggio
            const continua = vista === g && (s.sceltaColore !== null || s.pescata !== null);
            if (due() && !continua) {
                inPassaggio = true; disegna();
                await Giocatori.passaDispositivo(nome(g));
                if (corrente !== versione) return;
                inPassaggio = false;
            }
            vista = g; coperto = false; occupato = false; disegna();
            const invito = s.sceltaColore !== null ? 'Scegli il nuovo colore.' : s.pescata !== null ? 'Puoi giocare la carta pescata oppure passare.' : 'Gioca una carta o pesca.';
            scrivi(`${cronaca} ${due() ? `${nome(g)}: ` : ''}${invito}`.trim());
        } else {
            disegna(); scrivi(`${cronaca} ${nome(g)} sta giocando…`.trim());
            pianifica(() => applica(C.mossaPC(stato)));
        }
    }
    function nuovaPartita() {
        if (inPassaggio) return;
        clearTimeout(timer); timer = null; versione++;
        stato = C.crea(numero()); vista = 0; cronaca = '';
        prepara();
    }
    select.addEventListener('change', nuovaPartita);
    nuova.addEventListener('click', nuovaPartita);
    nomiPulsante.addEventListener('click', async () => { nomi = await Giocatori.chiediNomi(); disegna(); });
    nuovaPartita();
})();
