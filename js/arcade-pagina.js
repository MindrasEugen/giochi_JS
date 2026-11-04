// Gestisce il ciclo di vita delle pagine arcade; la fisica resta nei singoli giochi.
const ArcadePagina = (() => {
    function avvia(config) {
        const canvas = document.querySelector('canvas');
        const ctx = Arcade.adattaCanvas(canvas, config.larghezza, config.altezza);
        const colori = Arcade.colori();
        const pulsante = document.querySelector('#avvia');
        const modalita = document.querySelector('#modalitaGioco');
        const messaggi = document.querySelector('#messaggi');
        const velo = document.querySelector('#velo');
        const tasti = new Set();
        let nomi = Giocatori.leggiNomi();
        let recordPersonale = Arcade.record(config.chiave);
        let stato, iniziata = false, conclusa = false;
        const due = () => modalita?.value === 'due';
        const nome = i => due() ? nomi[i] : (i === 0 ? 'Tu' : 'Computer');
        function tabellone() {
            const dati = config.dati(stato, due(), nome);
            for (const [id, valore] of Object.entries(dati)) document.querySelector(`#${id}`).textContent = valore;
            document.querySelector('#record').textContent = recordPersonale;
        }
        function avviso(titolo, testo) {
            velo.hidden = false;
            document.querySelector('#statoTitolo').textContent = titolo;
            document.querySelector('#statoTesto').textContent = testo;
        }
        function pausa() {
            tasti.clear();
            if (!iniziata || conclusa) return;
            ciclo.pausa();
            pulsante.textContent = 'Riprendi';
            pulsante.setAttribute('aria-pressed', 'false');
            avviso('Una pausa?', 'La partita ti aspetta. Premi Riprendi per continuare.');
            messaggi.textContent = 'Partita in pausa.';
        }
        function nuova() {
            ciclo.pausa(); tasti.clear(); iniziata = false; conclusa = false;
            stato = config.crea(due());
            pulsante.textContent = 'Gioca'; pulsante.disabled = false;
            pulsante.setAttribute('aria-pressed', 'false');
            avviso('Pronto a giocare?', config.istruzioni);
            messaggi.textContent = 'Premi Gioca per iniziare.';
            document.querySelectorAll('[data-giocatore="1"]').forEach(el => { el.hidden = !due(); });
            tabellone();
        }
        function alterna() {
            if (conclusa) nuova();
            if (iniziata && !ciclo.inPausa()) { pausa(); return; }
            iniziata = true;
            velo.hidden = true;
            pulsante.textContent = 'Pausa'; pulsante.setAttribute('aria-pressed', 'true');
            messaggi.textContent = config.istruzioni;
            canvas.focus(); ciclo.riprendi();
        }
        function comando(codice) {
            if (!iniziata || conclusa || ciclo.inPausa()) return;
            config.comando?.(stato, codice, due());
        }
        const ciclo = Arcade.avvia({
            aggiorna(dt) {
                if (document.querySelector('.copertura')) { pausa(); return; }
                config.passo(stato, dt, tasti, due());
                if (stato.finita) {
                    conclusa = true; ciclo.pausa(); tasti.clear();
                    if (!due() && config.punti) {
                        Arcade.salvaRecord(config.chiave, config.punti(stato));
                        recordPersonale = Arcade.record(config.chiave);
                    }
                    const esito = config.esito(stato, due(), nome);
                    avviso('Partita finita', esito); messaggi.textContent = esito;
                    pulsante.textContent = 'Gioca ancora'; pulsante.setAttribute('aria-pressed', 'false');
                }
                tabellone();
            },
            disegna() {
                if (!stato) return;
                ctx.fillStyle = colori.primario;
                ctx.fillRect(0, 0, config.larghezza, config.altezza);
                config.disegna(ctx, stato, colori);
            }
        });
        document.addEventListener('keydown', e => {
            if (e.target instanceof Element && e.target.matches('input, select, textarea, summary')) return;
            if (document.querySelector('.copertura')) return;
            if (e.code === 'Escape' || e.code === 'KeyP') { e.preventDefault(); pausa(); return; }
            // Lo spazio su un bottone mantiene il comportamento nativo.
            if (e.code === 'Space' && e.target instanceof Element && e.target.matches('button, a')) return;
            if (!config.tasti.includes(e.code) && e.code !== 'Space') return;
            e.preventDefault();
            if (e.code === 'Space' && !e.repeat && (!iniziata || conclusa || ciclo.inPausa())) { alterna(); return; }
            if (!e.repeat) comando(e.code);
            tasti.add(e.code);
        });
        document.addEventListener('keyup', e => tasti.delete(e.code));
        document.querySelectorAll('[data-tasto]').forEach(b => {
            b.addEventListener('pointerdown', e => {
                e.preventDefault(); b.setPointerCapture(e.pointerId);
                if (!iniziata || conclusa || ciclo.inPausa()) return;
                tasti.add(b.dataset.tasto); comando(b.dataset.tasto);
            });
            for (const fine of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(fine, () => tasti.delete(b.dataset.tasto));
            // Attivazione con tastiera o tecnologie assistive.
            b.addEventListener('click', e => {
                if (e.detail !== 0) return;
                comando(b.dataset.tasto);
                // Un clic assistivo equivale a una breve pressione anche nei giochi a movimento continuo.
                if (iniziata && !conclusa && !ciclo.inPausa()) {
                    tasti.add(b.dataset.tasto);
                    setTimeout(() => tasti.delete(b.dataset.tasto), 120);
                }
            });
        });
        if (config.puntatore) {
            let trascina = false;
            const sposta = e => {
                if (trascina && iniziata && !conclusa && !ciclo.inPausa()) config.puntatore(stato, Arcade.puntoCanvas(canvas, e, config.larghezza, config.altezza));
            };
            canvas.addEventListener('pointerdown', e => {
                trascina = true; canvas.setPointerCapture(e.pointerId); sposta(e); comando('Space');
            });
            canvas.addEventListener('pointermove', sposta);
            for (const fine of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(fine, () => { trascina = false; });
        }
        pulsante.addEventListener('click', alterna);
        document.querySelector('#nuovaPartita').addEventListener('click', nuova);
        window.addEventListener('blur', pausa);
        document.addEventListener('visibilitychange', () => { if (document.hidden) pausa(); });
        if (modalita) {
            document.querySelector('#nomiGiocatori').addEventListener('click', pausa);
            Giocatori.collegaBarra({ select: modalita, pulsanteNomi: document.querySelector('#nomiGiocatori'),
                suCambioModalita: nuova, suCambioNomi: n => { nomi = n; tabellone(); } });
        }
        nuova();
    }
    return { avvia };
})();
