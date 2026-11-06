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
        // Una finestra dei giocatori o il pannello della tavola (js/tavola.js) coprono il gioco
        const coperto = () => document.querySelector('.copertura') || (typeof Tavola !== 'undefined' && Tavola.aperto());
        const fermo = () => !iniziata || conclusa || ciclo.inPausa();
        const nome = i => due() ? nomi[i] : (i === 0 ? 'Tu' : 'Computer');
        // Sul telefono, con i pulsanti nascosti, le istruzioni spiegano i gesti (config.istruzioniGesti)
        const istruzioni = () => (config.istruzioniGesti && typeof Tavola !== 'undefined' && Tavola.telefono()
            && !document.body.classList?.contains('mostra-pulsanti')) ? config.istruzioniGesti : config.istruzioni;
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
            avviso('Pronto a giocare?', istruzioni());
            messaggi.textContent = 'Premi Gioca per iniziare.';
            document.querySelectorAll('[data-giocatore="1"]').forEach(el => { el.hidden = !due(); });
            tabellone();
        }
        function alterna() {
            if (conclusa && config.prossimo?.(stato)) {
                stato = config.avanza(stato);
                tasti.clear(); iniziata = false; conclusa = false;
                tabellone();
            } else if (conclusa) nuova();
            if (iniziata && !ciclo.inPausa()) { pausa(); return; }
            iniziata = true;
            velo.hidden = true;
            pulsante.textContent = 'Pausa'; pulsante.setAttribute('aria-pressed', 'true');
            messaggi.textContent = istruzioni();
            canvas.focus(); ciclo.riprendi();
        }
        function comando(codice) {
            if (!iniziata || conclusa || ciclo.inPausa()) return;
            config.comando?.(stato, codice, due());
        }
        const ciclo = Arcade.avvia({
            aggiorna(dt) {
                if (coperto()) { pausa(); return; }
                config.passo(stato, dt, tasti, due());
                if (stato.finita) {
                    conclusa = true; ciclo.pausa(); tasti.clear();
                    if (!due() && config.punti) {
                        Arcade.salvaRecord(config.chiave, config.punti(stato));
                        recordPersonale = Arcade.record(config.chiave);
                    }
                    const esito = config.esito(stato, due(), nome);
                    avviso('Partita finita', esito); messaggi.textContent = esito;
                    pulsante.textContent = config.prossimo?.(stato) ? `Gioca ${nome(1)}` : 'Gioca ancora';
                    pulsante.setAttribute('aria-pressed', 'false');
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
            if (coperto()) return;
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
        // Gesti sul campo (Tappa 25 per Serpente, Tappa 26 per tutti gli arcade). config.gesti può avere:
        //   scorri(stato, direzione, due, lato)  scorrimento del dito (si ripete a ogni soglia: un gesto a "L" vale due);
        //                                        se restituisce 'fine' il resto del gesto viene ignorato
        //   tocco(stato, due, lato)              tocco breve senza spostamento, al rilascio
        //   premi(stato, due, lato)              appena il dito tocca il campo (risposta immediata, per esempio Volo)
        //   trascina(stato, punto, due, lato)    posizione del dito in coordinate del campo, finché resta appoggiato
        //   tieni: 'Codice'                      tasto tenuto premuto finché un dito resta sul campo (sparo continuo)
        //   soglia                               pixel di schermo per uno scorrimento (predefinita 24)
        // Un tocco a partita ferma avvia o riprende. In due il campo è diviso a metà: lato 0 a sinistra, 1 a destra;
        // ogni dito resta del suo lato per tutto il gesto, e due dita insieme (una per metà) non si disturbano.
        // I pulsanti sullo schermo del telefono restano nascosti, ma si possono mostrare dal pannello.
        if (config.gesti) {
            const g = config.gesti;
            const SOGLIA = g.soglia || 24;
            const dita = new Map();
            document.body.classList?.add('con-gesti');
            if (typeof Tavola !== 'undefined') Tavola.opzione({ chiave: 'giochi_js_mostra_pulsanti', etichetta: 'Mostra i pulsanti sullo schermo',
                suCambio: v => { document.body.classList?.toggle('mostra-pulsanti', v); if (stato && !iniziata) nuova(); } });
            const lato = e => { const r = canvas.getBoundingClientRect(); return e.clientX - r.left < r.width / 2 ? 0 : 1; };
            const punto = e => Arcade.puntoCanvas(canvas, e, config.larghezza, config.altezza);
            const lascia = id => {
                const dito = dita.get(id);
                if (!dito) return null;
                dita.delete(id);
                // Il tasto resta premuto finché almeno un dito è sul campo
                if (g.tieni && !dita.size) tasti.delete(g.tieni);
                return dito;
            };
            canvas.addEventListener('pointerdown', e => {
                e.preventDefault?.();
                // La cattura può fallire con eventi sintetici: il gesto funziona lo stesso
                try { canvas.setPointerCapture?.(e.pointerId); } catch { /* nessun puntatore attivo */ }
                if (fermo()) { dita.clear(); alterna(); return; }
                const dito = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, lato: lato(e), mosso: false, fermato: false };
                dita.set(e.pointerId, dito);
                g.premi?.(stato, due(), dito.lato);
                g.trascina?.(stato, punto(e), due(), dito.lato);
                if (g.tieni) tasti.add(g.tieni);
            });
            canvas.addEventListener('pointermove', e => {
                const dito = dita.get(e.pointerId);
                if (!dito || fermo()) return;
                g.trascina?.(stato, punto(e), due(), dito.lato);
                if (Math.hypot(e.clientX - dito.x0, e.clientY - dito.y0) >= SOGLIA) dito.mosso = true;
                if (!g.scorri || dito.fermato) return;
                const dx = e.clientX - dito.x, dy = e.clientY - dito.y;
                if (Math.hypot(dx, dy) < SOGLIA) return;
                const direzione = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'destra' : 'sinistra') : (dy > 0 ? 'giu' : 'su');
                if (g.scorri(stato, direzione, due(), dito.lato) === 'fine') dito.fermato = true;
                // Si riparte da qui: con un solo gesto a "L" si gira due volte
                dito.x = e.clientX; dito.y = e.clientY;
            });
            canvas.addEventListener('pointerup', e => {
                const dito = lascia(e.pointerId);
                if (dito && !dito.mosso && !fermo()) g.tocco?.(stato, due(), dito.lato);
            });
            for (const fine of ['pointercancel', 'lostpointercapture']) canvas.addEventListener(fine, e => { lascia(e.pointerId); });
        }
        pulsante.addEventListener('click', alterna);
        document.addEventListener('tavola:aperta', pausa);
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
