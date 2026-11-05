// Pagina del Mercante in fiera: asta a lotti, estrazione e premi. Tutte le carte comprate sono scoperte,
// quindi anche in "2 persone" non serve passare il dispositivo: ognuno usa i pulsanti quando è il suo turno.
(() => {
    const select = document.querySelector('#modalitaGioco');
    const nomiPulsante = document.querySelector('#nomiGiocatori');
    const nuova = document.querySelector('#nuovaPartita');
    const automatico = document.querySelector('#automatico');
    const posti = document.querySelector('#posti');
    const tavolo = document.querySelector('#carteTavolo');
    const opzioni = document.querySelector('#opzioniPresa');
    const messaggi = document.querySelector('#messaggi');
    let stato, timer = null, versione = 0, inAutomatico = false, cronaca = '';
    let nomi = Giocatori.leggiNomi();
    const due = () => select.value.startsWith('due');
    const numero = () => Number(select.value.split('-')[1]);
    const umano = g => (due() ? [0, 1] : [0]).includes(g);
    const nome = g => due() ? (g < 2 ? nomi[g] : `PC ${g - 1}`) : (g === 0 ? 'Tu' : `PC ${g}`);
    const fiches = n => `${n} ${n === 1 ? 'fiche' : 'fiches'}`;
    function scrivi(testo) { messaggi.textContent = testo; }
    function descrivi(u) {
        if (!u) return '';
        switch (u.tipo) {
            case 'offerta': return `${nome(u.giocatore)} offre ${fiches(u.prezzo)}.`;
            case 'passa': return `${nome(u.giocatore)} passa.`;
            case 'venduta': return `Lotto venduto a ${nome(u.giocatore)} per ${fiches(u.prezzo)}.`;
            case 'invenduta': return 'Nessuna offerta: il lotto resta invenduto.';
            case 'estratta': return `Estratta: ${Mazzo.nome(u.carta)}.${u.giocatore >= 0 ? ` ${nome(u.giocatore)} perde la sua carta.` : ''}`;
            case 'premio': return `${u.posizione}° premio: ${Mazzo.nome(u.carta)}. ${u.giocatore >= 0 ? `Vince ${nome(u.giocatore)}: ${fiches(u.importo)}!` : `Nessuno ha questa carta: ${fiches(u.importo)} al banco.`}`;
            default: return '';
        }
    }
    function disegna() {
        const s = stato;
        document.querySelector('#nomeP0').textContent = 'Piatto';
        document.querySelector('#puntiP0').textContent = s.piatto;
        document.querySelector('#nomeP1').textContent = s.fase === 'asta' ? 'Lotto' : s.fase === 'estrazione' ? 'Carte da estrarre' : 'Premi scoperti';
        document.querySelector('#puntiP1').textContent = s.fase === 'asta' ? `${s.lotto + 1}/${s.lotti.length}`
            : s.fase === 'estrazione' ? s.estrazione.length : `${s.premiRivelati.length}/${s.premi.length}`;
        document.querySelector('#tipoPunti').textContent = s.fase === 'asta'
            ? (s.offerta ? `Offerta migliore: ${nome(s.offerta.giocatore)}, ${fiches(s.offerta.prezzo)}` : 'Nessuna offerta per questo lotto')
            : `Premi: ${s.quote.map((q, i) => `${i + 1}° ${q}%`).join(' · ')}`;
        // Al centro: il lotto in vendita, l'ultima carta estratta oppure le carte premio
        tavolo.textContent = '';
        let vuoto = '';
        if (s.fase === 'asta') Mercante.lottoInAsta(s).forEach(c => tavolo.appendChild(Carte.crea(c)));
        else if (s.fase === 'estrazione') {
            if (s.ultimo?.tipo === 'estratta') tavolo.appendChild(Carte.crea(s.ultimo.carta)); else vuoto = 'Asta finita: si comincia a estrarre.';
            s.premi.forEach(c => tavolo.appendChild(Carte.crea(c, { coperta: true })));
        } else s.premi.forEach((c, i) => {
            const figura = document.createElement('figure'), didascalia = document.createElement('figcaption');
            const scoperto = s.premiRivelati.some(p => p.posizione === i + 1);
            didascalia.textContent = `${i + 1}° premio`;
            figura.append(Carte.crea(c, { coperta: !scoperto }), didascalia); tavolo.appendChild(figura);
        });
        // Colonne delle carte al centro sul telefono (come js/carte-italiane-pagina.js): fino a 5 su una riga, oltre su due
        const n = tavolo.children.length;
        tavolo.style.setProperty('--colonne', String(n <= 5 ? Math.max(n, 1) : Math.ceil(n / 2)));
        document.querySelector('#tavoloVuoto').textContent = vuoto;
        posti.textContent = '';
        for (let g = 0; g < s.numero; g++) {
            const posto = document.createElement('div'); posto.className = 'posto';
            if (s.fase === 'asta' && g === s.turno) posto.classList.add('posto--turno');
            if (s.fase === 'asta' && s.ritirati.includes(g)) posto.classList.add('posto--ritirato');
            if (s.offerta?.giocatore === g && s.fase === 'asta') posto.classList.add('posto--offerta');
            const titolo = document.createElement('p'); titolo.className = 'posto__nome'; titolo.textContent = nome(g);
            const soldi = document.createElement('p'); soldi.className = 'posto__vite'; soldi.textContent = fiches(s.fiches[g]);
            const carte = document.createElement('div'); carte.className = 'posto__carte';
            s.possedute[g].forEach(c => carte.appendChild(Carte.crea(c)));
            if (!s.possedute[g].length) { const nessuna = document.createElement('span'); nessuna.textContent = 'nessuna carta'; carte.appendChild(nessuna); }
            posto.append(titolo, soldi, carte); posti.appendChild(posto);
        }
        opzioni.textContent = '';
        const turnoUmano = s.fase === 'asta' ? umano(s.turno) : true;
        if (!s.finita && turnoUmano && !inAutomatico) Mercante.mosseLegali(s).forEach(m => {
            const bottone = document.createElement('button'); bottone.type = 'button'; bottone.className = 'pulsante pulsante--secondario scelta-presa';
            bottone.textContent = (due() && s.fase === 'asta' ? `${nome(s.turno)}: ` : '') + Mercante.etichettaMossa(s, m);
            bottone.addEventListener('click', () => applica(m));
            opzioni.appendChild(bottone);
        });
        automatico.hidden = s.fase !== 'estrazione' || inAutomatico;
        nomiPulsante.hidden = !due();
        const risultati = document.querySelector('#risultati');
        risultati.hidden = !s.finita; risultati.textContent = '';
        if (s.finita) {
            const r = Mercante.risultato(s), h = document.createElement('h2'), elenco = document.createElement('ol');
            h.textContent = 'Classifica finale';
            r.ordine.forEach(g => { const li = document.createElement('li'); li.textContent = `${nome(g)}: ${fiches(s.fiches[g])}${s.vincite[g] ? ` (premi vinti: ${s.vincite[g]})` : ''}`; elenco.appendChild(li); });
            risultati.append(h, elenco);
            if (r.alBanco) { const p = document.createElement('p'); p.textContent = `Al banco: ${fiches(r.alBanco)}.`; risultati.appendChild(p); }
        }
    }
    function applica(mossa) {
        if (!mossa || !Mercante.gioca(stato, mossa)) return;
        cronaca = descrivi(stato.ultimo);
        prepara();
    }
    function pianifica(azione, attesa = 700) {
        const corrente = versione;
        // Con il pannello della tavola aperto (js/tavola.js) i PC aspettano
        timer = setTimeout(() => { timer = null; const dopo = () => { if (corrente === versione) azione(); }; typeof Tavola !== 'undefined' ? Tavola.quandoChiuso(dopo) : dopo(); }, attesa);
    }
    function prepara() {
        const s = stato;
        disegna();
        if (s.finita) {
            inAutomatico = false; disegna();
            const r = Mercante.risultato(s);
            scrivi(`${cronaca} ${r.vincitori.length > 1 ? `Pareggio tra ${r.vincitori.map(nome).join(' e ')}` : `Vince ${nome(r.vincitori[0])}`} con ${fiches(s.fiches[r.vincitori[0]])}!`);
            return;
        }
        if (s.fase === 'asta') {
            const lotto = Mercante.lottoInAsta(s).map(c => Mazzo.nome(c)).join(', ');
            if (umano(s.turno)) scrivi(`${cronaca} In vendita: ${lotto}. ${due() ? `Tocca a ${nome(s.turno)}.` : 'Rilanci o passi?'}`.trim());
            else { scrivi(`${cronaca} ${nome(s.turno)} sta pensando…`.trim()); pianifica(() => applica(Mercante.mossaPC(s))); }
            return;
        }
        if (inAutomatico) { scrivi(cronaca); pianifica(() => applica(Mercante.mosseLegali(s)[0]), s.fase === 'premi' ? 1500 : 450); return; }
        scrivi(`${cronaca} ${s.fase === 'estrazione' ? 'Estrai la prossima carta.' : 'Scopri i premi.'}`.trim());
    }
    function nuovaPartita() {
        clearTimeout(timer); timer = null; versione++; inAutomatico = false;
        stato = Mercante.crea(numero()); cronaca = '';
        prepara();
    }
    select.addEventListener('change', nuovaPartita);
    nuova.addEventListener('click', nuovaPartita);
    automatico.addEventListener('click', () => { inAutomatico = true; clearTimeout(timer); prepara(); });
    nomiPulsante.addEventListener('click', async () => { nomi = await Giocatori.chiediNomi(); disegna(); });
    nuovaPartita();
})();
