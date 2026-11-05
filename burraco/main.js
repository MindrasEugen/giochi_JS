// Pagina del Burraco a due: si selezionano le carte e si sceglie l'azione (cala, attacca toccando una propria
// combinazione, scarta). In due si passa il dispositivo a ogni turno e la mano dell'altro resta coperta.
(() => {
    const B = Burraco, C = Combinazioni;
    const select = document.querySelector('#modalitaGioco');
    const nomiPulsante = document.querySelector('#nomiGiocatori');
    const nuova = document.querySelector('#nuovaPartita');
    const opzioni = document.querySelector('#opzioniPresa');
    const messaggi = document.querySelector('#messaggi');
    let stato, timer = null, versione = 0, coperto = true, occupato = true, inPassaggio = false, vista = 0;
    let selezionate = new Set(), ordine = 'valore', cronaca = '';
    let nomi = Giocatori.leggiNomi();
    const due = () => select.value === 'due';
    const nome = g => due() ? nomi[g] : g === 0 ? 'Tu' : 'Computer';
    const umano = g => due() || g === 0;
    const scrivi = testo => { messaggi.textContent = testo; };
    function carta(c, opzioniCarta = {}) {
        if (!c.jolly || opzioniCarta.coperta) return Carte.crea(c, opzioniCarta);
        const el = document.createElement('span'); el.className = 'carta carta--jolly'; el.setAttribute('role', 'img'); el.setAttribute('aria-label', 'jolly');
        el.textContent = '★'; return el;
    }
    const ordina = carte => [...carte].sort(ordine === 'valore'
        ? (a, b) => (a.jolly - b.jolly) || a.numero - b.numero || a.seme.localeCompare(b.seme)
        : (a, b) => (a.jolly - b.jolly) || a.seme.localeCompare(b.seme) || a.numero - b.numero);
    function bottone(testo, azione, principale = false) {
        const b = document.createElement('button'); b.type = 'button'; b.className = principale ? 'pulsante scelta-presa' : 'pulsante pulsante--secondario scelta-presa';
        b.textContent = testo; b.addEventListener('click', azione); opzioni.appendChild(b); return b;
    }
    // Le combinazioni di un giocatore; quelle della persona di turno si toccano per attaccare
    function disegnaCombinazioni(contenitore, g, attive) {
        contenitore.textContent = '';
        stato.tavolo[g].forEach(t => {
            const b = document.createElement('button'); b.type = 'button'; b.className = 'combinazione-tavolo';
            const tipo = B.burraco(t);
            if (tipo) b.classList.add(`combinazione-tavolo--${tipo}`);
            b.setAttribute('aria-label', `${tipo ? `Burraco ${tipo}: ` : ''}${t.carte.map(x => C.nome(x.carta)).join(', ')}${attive ? '. Tocca per attaccare la carta selezionata' : ''}`);
            t.carte.forEach(x => b.appendChild(carta(x.carta)));
            b.disabled = !attive;
            b.addEventListener('click', () => esegui(() => B.attacca(stato, [...selezionate][0], t.id)));
            contenitore.appendChild(b);
        });
    }
    function disegna() {
        const s = stato, io = vista, altro = 1 - vista, finita = s.fase === 'fineMano';
        const mioTurno = !occupato && !coperto && umano(s.turno) && s.turno === io && !s.finita;
        for (const g of [0, 1]) { document.querySelector(`#nomeP${g}`).textContent = nome(g); document.querySelector(`#puntiP${g}`).textContent = s.punti[g]; }
        document.querySelector('#tipoPunti').textContent = `Punti · si vince a ${B.USCITA} · mano ${s.numeroMano}`;
        const avversario = document.querySelector('#avversari'); avversario.textContent = '';
        const zona = document.createElement('div'); zona.className = 'avversario-carte';
        const titolo = document.createElement('span'); titolo.textContent = `${nome(altro)} · ${s.mani[altro].length} carte · ${s.pozzettoPreso[altro] ? 'pozzetto preso' : 'pozzetto da prendere'}`;
        zona.appendChild(titolo);
        ordina(s.mani[altro]).forEach(c => zona.appendChild(carta(c, { coperta: !finita })));
        avversario.appendChild(zona);
        disegnaCombinazioni(document.querySelector('#combinazioniAltro'), altro, false);
        document.querySelector('#titoloAltro').textContent = `Combinazioni di ${nome(altro)}`;
        const tallone = document.querySelector('#tallone'); tallone.textContent = '';
        tallone.appendChild(Carte.crea({ tipo: 'francese' }, { coperta: true }));
        document.querySelector('#contaTallone').textContent = `${s.tallone.length} nel tallone`;
        const pozzo = document.querySelector('#pozzo'); pozzo.textContent = '';
        s.scarti.slice(-5).forEach(c => pozzo.appendChild(carta(c)));
        document.querySelector('#contaScarti').textContent = `Scarti: ${s.scarti.length}`;
        disegnaCombinazioni(document.querySelector('#combinazioni'), io, mioTurno && s.fase === 'gioca' && selezionate.size === 1);
        document.querySelector('#titoloMie').textContent = due() ? `Combinazioni di ${nome(io)}` : 'Le tue combinazioni';
        document.querySelector('#statoPozzetto').textContent = s.pozzettoPreso[io] ? (B.puoChiudere(s, io) ? 'Pozzetto preso e burraco fatto: puoi chiudere.' : 'Pozzetto preso: per chiudere serve un burraco.') : 'Pozzetto ancora da prendere: finisci le carte per prenderlo.';
        document.querySelector('#titoloMano').textContent = coperto ? 'Mano coperta' : due() ? `Mano di ${nome(io)}` : 'La tua mano';
        const mano = document.querySelector('#mano'); mano.textContent = '';
        ordina(s.mani[io]).forEach(c => {
            const b = document.createElement('button'); b.type = 'button'; b.className = 'carta-pulsante';
            if (selezionate.has(c.id)) b.classList.add('carta-pulsante--selezionata');
            b.appendChild(carta(c, { coperta: coperto && !finita }));
            b.setAttribute('aria-pressed', String(selezionate.has(c.id)));
            b.setAttribute('aria-label', coperto ? 'Carta coperta' : C.nome(c));
            b.disabled = !mioTurno || s.fase !== 'gioca';
            b.addEventListener('click', () => { selezionate.has(c.id) ? selezionate.delete(c.id) : selezionate.add(c.id); disegna(); });
            mano.appendChild(b);
        });
        opzioni.textContent = '';
        if (finita && !s.finita && !occupato) bottone('Mano successiva', () => { B.prossimaMano(stato); selezionate.clear(); cronaca = ''; prepara(); }, true);
        if (mioTurno && s.fase === 'pesca') {
            bottone('Pesca dal tallone', () => esegui(() => B.pesca(stato, false)), true);
            bottone(`Raccogli gli scarti (${s.scarti.length})`, () => esegui(() => B.pesca(stato, true))).disabled = !s.scarti.length;
        }
        if (mioTurno && s.fase === 'gioca') {
            const scelte = [...selezionate];
            bottone('Cala la combinazione', () => esegui(() => B.cala(stato, scelte))).disabled = scelte.length < 3;
            bottone('Scarta la carta selezionata', () => esegui(() => B.scarta(stato, scelte[0]))).disabled = scelte.length !== 1;
            bottone(ordine === 'valore' ? 'Ordina per seme' : 'Ordina per valore', () => { ordine = ordine === 'valore' ? 'seme' : 'valore'; disegna(); });
        }
        nuova.disabled = inPassaggio; select.disabled = inPassaggio; nomiPulsante.hidden = !due(); nomiPulsante.disabled = inPassaggio;
        const risultati = document.querySelector('#risultati'); risultati.hidden = !finita; risultati.textContent = '';
        if (finita) {
            const h = document.createElement('h2'); h.textContent = s.finita ? 'Fine della partita' : `Fine della mano ${s.numeroMano}`;
            const elenco = document.createElement('ul');
            const etichette = { combinazioni: 'carte calate', puliti: 'burraco puliti', sporchi: 'burraco sporchi', chiusura: 'chiusura', mano: 'carte in mano', pozzetto: 'pozzetto non preso' };
            s.esito.conti.forEach((k, g) => {
                const li = document.createElement('li');
                li.textContent = `${nome(g)}: ${k.totale > 0 ? '+' : ''}${k.totale} (${Object.entries(k.dettaglio).filter(([, v]) => v).map(([n, v]) => `${etichette[n]} ${v > 0 ? '+' : ''}${v}`).join(', ') || 'nessun punto'}) · totale ${s.punti[g]}`;
                elenco.appendChild(li);
            });
            risultati.append(h, elenco);
            if (s.finita) { const p = document.createElement('p'); p.textContent = `Vince ${nome(s.vincitore)}!`; risultati.appendChild(p); }
        }
    }
    function descrivi(u) {
        if (!u) return '';
        const chi = nome(u.giocatore);
        let testo = { tallone: `${chi} pesca dal tallone.`, scarti: `${chi} raccoglie ${u.quante} ${u.quante === 1 ? 'scarto' : 'scarti'}.`, cala: `${chi} cala una combinazione.`,
            attacca: `${chi} attacca ${u.carta ? C.nome(u.carta) : 'una carta'}.`, scarta: `${chi} scarta ${u.carta ? C.nome(u.carta) : ''}.` }[u.tipo] || '';
        if (u.pozzetto) testo += ` ${chi} prende il pozzetto${u.pozzetto === 'con lo scarto' ? ' (si gioca dal prossimo turno)' : ''}!`;
        return testo;
    }
    function esegui(azione) {
        const prima = stato.turno;
        if (!azione()) { scrivi(stato.errore); return; }
        selezionate = new Set([...selezionate].filter(id => stato.mani[vista].some(c => c.id === id)));
        cronaca = descrivi(stato.ultimo);
        if (stato.turno !== prima || stato.fase === 'fineMano') { selezionate.clear(); prepara(); } else { disegna(); scrivi(`${cronaca} ${invito()}`.trim()); }
    }
    function invito() {
        const s = stato;
        if (s.fase === 'pesca') return 'Pesca dal tallone o raccogli tutti gli scarti.';
        return 'Cala, attacca (seleziona una carta e tocca una tua combinazione) e poi scarta.';
    }
    function testoFineMano() {
        const e = stato.esito;
        const conto = e.conti.map((k, g) => `${nome(g)} ${k.totale > 0 ? '+' : ''}${k.totale}`).join(', ');
        return `${e.chiude === null ? 'Mano finita senza chiusura.' : `${nome(e.chiude)} chiude!`} ${conto}.${stato.finita ? ` Vince ${nome(stato.vincitore)}!` : ''}`;
    }
    function pianifica(azione, attesa = 900) {
        const corrente = versione;
        timer = setTimeout(() => { timer = null; if (corrente === versione) azione(); }, attesa);
    }
    async function prepara() {
        const corrente = versione, s = stato;
        occupato = true; coperto = due();
        if (s.fase === 'fineMano') { occupato = false; coperto = false; disegna(); scrivi(`${cronaca} ${testoFineMano()}`.trim()); return; }
        const g = s.turno;
        if (umano(g)) {
            if (due()) {
                inPassaggio = true; disegna();
                await Giocatori.passaDispositivo(nome(g));
                if (corrente !== versione) return;
                inPassaggio = false;
            }
            vista = g; coperto = false; occupato = false; disegna();
            scrivi(`${cronaca} ${due() ? `${nome(g)}: ` : ''}${invito()}`.trim());
        } else {
            coperto = false; disegna(); scrivi(`${cronaca} ${nome(g)} sta giocando…`.trim());
            pianifica(() => {
                const prima = stato.tavolo[g].length, pozzetto = stato.pozzettoPreso[g];
                B.turnoPC(stato);
                const testi = [];
                if (stato.tavolo[g].length > prima) testi.push(`${nome(g)} cala ${stato.tavolo[g].length - prima} ${stato.tavolo[g].length - prima === 1 ? 'combinazione' : 'combinazioni'}.`);
                if (!pozzetto && stato.pozzettoPreso[g]) testi.push(`${nome(g)} prende il pozzetto!`);
                if (stato.ultimo?.tipo === 'scarta') testi.push(`Scarta ${C.nome(stato.ultimo.carta)}.`);
                cronaca = testi.join(' ') || `${nome(g)} ha giocato.`;
                prepara();
            });
        }
    }
    function nuovaPartita() {
        if (inPassaggio) return;
        clearTimeout(timer); timer = null; versione++;
        stato = B.crea(); vista = 0; selezionate = new Set(); cronaca = '';
        prepara();
    }
    select.addEventListener('change', nuovaPartita);
    nuova.addEventListener('click', nuovaPartita);
    nomiPulsante.addEventListener('click', async () => { nomi = await Giocatori.chiediNomi(); disegna(); });
    nuovaPartita();
})();
