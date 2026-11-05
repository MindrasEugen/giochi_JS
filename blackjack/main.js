// Pagina del Blackjack: puntata, mani di chi punta (anche divise), banco del PC oppure di una persona.
// In due le carte sono tutte scoperte tranne la seconda del banco: non serve passare il dispositivo.
(() => {
    const B = Blackjack;
    const select = document.querySelector('#modalitaGioco');
    const nomiPulsante = document.querySelector('#nomiGiocatori');
    const nuova = document.querySelector('#nuovaPartita');
    const opzioni = document.querySelector('#opzioniPresa');
    const messaggi = document.querySelector('#messaggi');
    let stato, nomi = Giocatori.leggiNomi();
    const due = () => select.value === 'due';
    const nome = g => due() ? nomi[g] : g === 0 ? 'Tu' : 'Banco';
    const scritta = carte => { const { totale, morbida } = B.valore(carte); return morbida && totale < 21 ? `${totale - 10} o ${totale}` : String(totale); };
    const ESITI = { blackjack: 'Blackjack!', vinta: 'Vinta', pari: 'Pari', persa: 'Persa', sballata: 'Sballata' };
    function scrivi(testo) { messaggi.textContent = testo; }
    function disegna() {
        const s = stato, g = B.giocatore(s), scoperto = s.fase === 'banco' || s.fase === 'fine';
        if (due()) {
            for (const i of [0, 1]) { document.querySelector(`#nomeP${i}`).textContent = nomi[i]; document.querySelector(`#puntiP${i}`).textContent = s.fiches[i]; }
            document.querySelector('#tipoPunti').textContent = `Fiches · mano ${s.numeroMano}, fa il banco ${nomi[s.banco]}`;
        } else {
            document.querySelector('#nomeP0').textContent = 'Le tue fiches'; document.querySelector('#puntiP0').textContent = s.fiches[0];
            document.querySelector('#nomeP1').textContent = 'Mano'; document.querySelector('#puntiP1').textContent = s.numeroMano;
            document.querySelector('#tipoPunti').textContent = 'Puntate da 10, 20 o 50 fiches';
        }
        document.querySelector('#titoloBanco').textContent = due() ? `Banco: ${nomi[s.banco]}` : 'Banco';
        document.querySelector('#titoloGiocatore').textContent = due() ? `Punta: ${nomi[g]}` : 'La tua mano';
        const banco = document.querySelector('#carteBanco'); banco.textContent = '';
        s.bancoCarte.forEach((c, i) => banco.appendChild(Carte.crea(c, { coperta: i === 1 && !scoperto })));
        document.querySelector('#totaleBanco').textContent = !s.bancoCarte.length ? '' : scoperto ? `Totale: ${scritta(s.bancoCarte)}` : `Carta scoperta: ${scritta([s.bancoCarte[0]])}`;
        const mani = document.querySelector('#maniGiocatore'); mani.textContent = '';
        s.mani.forEach((mano, i) => {
            const zona = document.createElement('div'); zona.className = 'mano-blackjack';
            if (s.fase === 'gioco' && i === s.attiva) zona.classList.add('mano-blackjack--attiva');
            const titolo = document.createElement('h3');
            titolo.textContent = `${s.mani.length > 1 ? `Mano ${i + 1} · ` : ''}puntata ${mano.puntata}${mano.raddoppiata ? ' (raddoppiata)' : ''}`;
            const carte = document.createElement('div'); carte.className = 'mano';
            mano.carte.forEach(c => carte.appendChild(Carte.crea(c)));
            const totale = document.createElement('p'); totale.className = 'totale-mano';
            const esito = s.esiti[i];
            totale.textContent = `Totale: ${scritta(mano.carte)}${esito ? ` · ${ESITI[esito.esito]} (${esito.vincita > 0 ? '+' : ''}${esito.vincita})` : ''}`;
            zona.append(titolo, carte, totale); mani.appendChild(zona);
        });
        opzioni.textContent = '';
        B.mosseLegali(s).forEach(m => {
            const bottone = document.createElement('button'); bottone.type = 'button'; bottone.className = 'pulsante pulsante--secondario scelta-presa';
            bottone.textContent = B.etichettaMossa(s, m);
            bottone.addEventListener('click', () => applica(m));
            opzioni.appendChild(bottone);
        });
        nomiPulsante.hidden = !due();
        const risultati = document.querySelector('#risultati');
        risultati.hidden = !s.finita; risultati.textContent = '';
        if (s.finita) {
            const h = document.createElement('h2'); h.textContent = 'Partita finita';
            const p = document.createElement('p');
            p.textContent = due() ? `${nomi[0]}: ${s.fiches[0]} fiches · ${nomi[1]}: ${s.fiches[1]} fiches dopo ${s.numeroMano - 1} mani.`
                : `Fiches finite dopo ${s.numeroMano - 1} mani. Premi Nuova partita per ricominciare con ${B.FICHES} fiches.`;
            risultati.append(h, p);
        }
    }
    function testoFase() {
        const s = stato, g = B.giocatore(s);
        if (s.finita) return due() ? `${nome(s.fiches[0] >= s.fiches[1] ? 0 : 1)} chiude con più fiches.` : 'Hai finito le fiches.';
        if (s.fase === 'puntata') return due() ? `${nome(g)} punta, ${nome(s.banco)} fa il banco. Quanto punti?` : 'Quanto punti?';
        if (s.fase === 'gioco') {
            const testo = `${s.mani.length > 1 ? `mano ${s.attiva + 1}, ` : ''}hai ${scritta(s.mani[s.attiva].carte)}. Carta o stai?`;
            return due() ? `${nome(g)}: ${testo}` : testo[0].toUpperCase() + testo.slice(1);
        }
        if (s.fase === 'banco') return `Tocca al banco (${nome(s.banco)}): ha ${scritta(s.bancoCarte)}. Carta o stai?`;
        const saldo = s.saldo;
        const banco = B.valore(s.bancoCarte).totale;
        const finale = banco > 21 ? 'Il banco sballa.' : `Il banco ha ${banco}.`;
        return `${finale} ${saldo > 0 ? `${due() ? nome(g) : 'Hai'} ${due() ? 'vince' : 'vinto'} ${saldo} fiches.` : saldo < 0 ? `${due() ? nome(g) : 'Hai'} ${due() ? 'perde' : 'perso'} ${-saldo} fiches.` : 'Puntata restituita.'}`;
    }
    function applica(mossa) {
        if (!B.gioca(stato, mossa)) return;
        disegna(); scrivi(testoFase());
    }
    function nuovaPartita() { stato = B.crea(due() ? 'due' : 'uno'); disegna(); scrivi(testoFase()); }
    select.addEventListener('change', nuovaPartita);
    nuova.addEventListener('click', nuovaPartita);
    nomiPulsante.addEventListener('click', async () => { nomi = await Giocatori.chiediNomi(); disegna(); scrivi(testoFase()); });
    nuovaPartita();
})();
