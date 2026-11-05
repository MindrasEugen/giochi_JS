// Pagina della Guerra: un pulsante per battaglia, oppure gioco automatico fino alla fine.
(() => {
    const G = Guerra;
    const select = document.querySelector('#modalitaGioco');
    const nomiPulsante = document.querySelector('#nomiGiocatori');
    const gira = document.querySelector('#gira');
    const automatico = document.querySelector('#automatico');
    const nuova = document.querySelector('#nuovaPartita');
    const messaggi = document.querySelector('#messaggi');
    let stato, timer = null, nomi = Giocatori.leggiNomi();
    const due = () => select.value === 'due';
    const nome = g => due() ? nomi[g] : g === 0 ? 'Tu' : 'Computer';
    function disegna() {
        const s = stato;
        for (const g of [0, 1]) {
            document.querySelector(`#nomeP${g}`).textContent = nome(g);
            document.querySelector(`#puntiP${g}`).textContent = s.mazzi[g].length;
            document.querySelector(`#titolo${g}`).textContent = nome(g);
            const zona = document.querySelector(`#carte${g}`); zona.textContent = '';
            // Le carte scoperte dell'ultima battaglia (più di una se c'è stata guerra)
            (s.ultimo?.scontri || []).forEach(scontro => zona.appendChild(Carte.crea(scontro[g])));
            if (!s.ultimo) zona.appendChild(Carte.crea({ tipo: 'francese' }, { coperta: true }));
        }
        document.querySelector('#tipoPunti').textContent = `Carte nel mazzo · battaglia ${s.battaglie} di ${G.LIMITE}`;
        gira.disabled = s.finita || timer !== null;
        automatico.textContent = timer !== null ? 'Ferma' : 'Gioca fino alla fine';
        automatico.disabled = s.finita;
        nomiPulsante.hidden = !due();
        const risultati = document.querySelector('#risultati');
        risultati.hidden = !s.finita; risultati.textContent = '';
        if (s.finita) {
            const h = document.createElement('h2'); h.textContent = 'Fine della partita';
            const p = document.createElement('p');
            p.textContent = `${nome(0)}: ${s.mazzi[0].length} carte · ${nome(1)}: ${s.mazzi[1].length} carte, dopo ${s.battaglie} battaglie.`;
            risultati.append(h, p);
        }
    }
    function racconta() {
        const s = stato, u = s.ultimo;
        if (!u) return 'Premi Gira le carte per cominciare.';
        const [a, b] = u.scontri.at(-1).map(c => Mazzo.nome(c));
        let testo = `${u.guerre ? `Guerra${u.guerre > 1 ? ` ×${u.guerre}` : ''}! ` : ''}${a} contro ${b}: ${nome(u.vincitore)} ${u.vincitore === 0 && !due() ? 'prendi' : 'prende'} ${u.prese} carte.`;
        if (s.finita) testo += s.vincitore === null ? ' Pareggio!' : ` Vince ${nome(s.vincitore)}!`;
        return testo;
    }
    function battaglia() { G.gira(stato); if (stato.finita) ferma(); disegna(); messaggi.textContent = racconta(); }
    function ferma() { clearInterval(timer); timer = null; }
    function nuovaPartita() { ferma(); stato = G.crea(); disegna(); messaggi.textContent = racconta(); }
    gira.addEventListener('click', battaglia);
    automatico.addEventListener('click', () => {
        if (timer !== null) { ferma(); disegna(); return; }
        timer = setInterval(battaglia, 120); disegna();
    });
    // Aprendo il pannello (js/tavola.js) il gioco automatico si ferma
    document.addEventListener('tavola:aperta', () => { if (timer !== null) { ferma(); disegna(); } });
    select.addEventListener('change', nuovaPartita);
    nuova.addEventListener('click', nuovaPartita);
    nomiPulsante.addEventListener('click', async () => { nomi = await Giocatori.chiediNomi(); disegna(); messaggi.textContent = racconta(); });
    nuovaPartita();
})();
