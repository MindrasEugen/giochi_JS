// Pagina comune dei solitari: disegna le pile secondo motore.disposizione(), gestisce trascinamento (mouse e dito),
// tocco-tocco (seleziona una carta, poi tocca la pila di destinazione), doppio tocco per mandare la carta alla base,
// annulla, tempo e mosse. Ogni solitario fornisce solo il motore delle regole.
// Sul telefono le carte strette (meno di 60px) diventano carte semplificate: valore e seme grandi, disegnati in CSS
// (Tappa 25); un'opzione del pannello (js/tavola.js) riporta le immagini.
const SolitarioPagina = (() => {
    const SIMBOLI = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
    const LARGHEZZA_SEMPLICI = 60;
    function cartaSemplice(carta, coperta) {
        const el = document.createElement('div');
        el.className = 'carta carta-semplice';
        el.setAttribute('role', 'img');
        if (coperta) {
            el.classList.add('carta--coperta', 'carta-semplice--coperta');
            el.setAttribute('aria-label', 'Carta coperta');
            return el;
        }
        el.classList.add(Mazzo.colore(carta) === 'rosso' ? 'carta-semplice--rossa' : 'carta-semplice--nera');
        el.setAttribute('aria-label', Mazzo.nome(carta));
        const angolo = document.createElement('span'), valore = document.createElement('span'), piccolo = document.createElement('span'), centro = document.createElement('span');
        angolo.className = 'carta-semplice__angolo';
        valore.className = 'carta-semplice__valore'; valore.textContent = carta.valore.toUpperCase();
        piccolo.className = 'carta-semplice__seme'; piccolo.textContent = SIMBOLI[carta.seme];
        centro.className = 'carta-semplice__centro'; centro.textContent = SIMBOLI[carta.seme];
        centro.setAttribute('aria-hidden', 'true');
        angolo.append(valore, piccolo);
        el.append(angolo, centro);
        return el;
    }
    function avvia(config) {
        const motore = config.motore;
        const tavolo = document.querySelector('#tavoloSolitario');
        const select = document.querySelector('#modalitaGioco');
        const annulla = document.querySelector('#annulla');
        const completa = document.querySelector('#completa');
        const nuova = document.querySelector('#nuovaPartita');
        const messaggi = document.querySelector('#messaggi');
        let stato, storia = [], inizio = null, cronometro = null, selezione = null, trascina = null, ultimoTocco = { t: 0, chiave: '' }, finita = false;
        let misure = { w: 60, h: 84, passo: 67, semplici: false };
        let immagini = false, pausaDa = null;
        const scrivi = testo => { messaggi.textContent = testo; };
        const tempo = () => { if (!inizio) return '0:00'; const s = Math.floor((Date.now() - inizio) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
        function aggiornaRiepilogo() {
            document.querySelector('#puntiP0').textContent = tempo();
            document.querySelector('#puntiP1').textContent = stato.mosse;
            if (config.dettaglio) document.querySelector('#tipoPunti').textContent = config.dettaglio(stato);
        }
        // Misure in pixel: la larghezza della carta dipende da quante colonne ci sono e dallo spazio disponibile
        function calcolaMisure() {
            const larghezza = tavolo.clientWidth || 320;
            // Con le carte semplificate lo spazio tra le colonne si stringe: ogni pixel va alla carta
            let spazio = 1.12, w = Math.min(96, Math.floor(larghezza / (motore.colonne * spazio)));
            const semplici = !immagini && w < LARGHEZZA_SEMPLICI;
            if (semplici) { spazio = 1.05; w = Math.min(96, Math.floor(larghezza / (motore.colonne * spazio))); }
            const passo = w * spazio;
            // Margine a sinistra per centrare le colonne sul tavolo
            misure = { w, h: Math.round(w * 1.4), passo, semplici, sinistra: Math.max(0, (larghezza - ((motore.colonne - 1) * passo + w)) / 2) };
        }
        // Distanza verticale tra le carte di una colonna a ventaglio (più stretta per le coperte e per le colonne lunghe)
        function scostamenti(pila, tipo) {
            if (tipo !== 'colonna') return pila.map(() => 0);
            // Le carte semplificate mostrano valore e seme in una striscia in alto: serve un po' più di spazio
            const coperta = misure.h * 0.1, scoperta = misure.h * (misure.semplici ? 0.3 : 0.24);
            let y = 0;
            const lista = pila.map((x, i) => { const v = y; y += x.scoperta ? scoperta : coperta; return v; });
            const massimo = misure.h * (motore.ventaglioMassimo || 3.2); // le colonne molto lunghe si stringono
            if (y > massimo) { const k = massimo / y; return lista.map(v => v * k); }
            return lista;
        }
        function disegna() {
            calcolaMisure();
            tavolo.textContent = '';
            tavolo.style.setProperty('--larghezza-carta', `${misure.w}px`);
            tavolo.classList?.toggle('tavolo-solitario--semplici', misure.semplici);
            let altezza = 0;
            for (const d of motore.disposizione(stato)) {
                const x = misure.sinistra + d.x * misure.passo, y = d.y * misure.h;
                const posto = document.createElement('div');
                posto.className = `pila-solitario pila-solitario--${d.tipo}`;
                posto.dataset.pila = d.id; posto.dataset.indice = '-1';
                posto.style.left = `${x}px`; posto.style.top = `${y}px`; posto.style.width = `${misure.w}px`; posto.style.height = `${misure.h}px`;
                posto.textContent = d.etichetta || '';
                if (selezione && d.id !== selezione.pila && ok(selezione, d.id)) posto.classList.add('pila-solitario--meta');
                tavolo.appendChild(posto);
                const pila = stato.pile[d.id];
                // Mazzo e pile chiuse mostrano solo la carta in cima; gli scarti a 3 mostrano le ultime tre
                const visibili = d.tipo === 'colonna' || d.tipo === 'piramide' ? pila.map((x, i) => i)
                    : d.tipo === 'scarti' && stato.pesca === 3 ? pila.map((x, i) => i).slice(-3) : pila.length ? [pila.length - 1] : [];
                const dy = scostamenti(pila, d.tipo);
                visibili.forEach((i, k) => {
                    const x0 = pila[i];
                    const img = misure.semplici && x0.carta.tipo === 'francese' ? cartaSemplice(x0.carta, !x0.scoperta) : Carte.crea(x0.carta, { coperta: !x0.scoperta });
                    if (misure.semplici) img.style.height = `${misure.h}px`;
                    img.classList.add('carta-solitario');
                    if (selezione && selezione.pila === d.id && i >= selezione.indice) img.classList.add('carta-solitario--selezionata');
                    if (d.tipo === 'piramide' && motore.libera && !motore.libera(stato, d.id)) img.classList.add('carta-solitario--coperta');
                    // Orologio: si evidenzia il mucchio dove va la carta girata
                    if (motore.destinazione && motore.destinazione(stato) === d.id && i === pila.length - 1) img.classList.add('carta-solitario--selezionata');
                    // css/carte.css fissa la larghezza delle carte: qui serve quella calcolata per il tavolo
                    img.style.width = `${misure.w}px`;
                    img.dataset.pila = d.id; img.dataset.indice = String(i);
                    img.style.left = `${x + (d.tipo === 'scarti' ? k * misure.w * 0.3 : 0)}px`;
                    img.style.top = `${y + dy[i]}px`;
                    img.style.zIndex = String(10 + i);
                    tavolo.appendChild(img);
                    altezza = Math.max(altezza, y + dy[i] + misure.h);
                });
                altezza = Math.max(altezza, y + misure.h);
            }
            tavolo.style.height = `${Math.ceil(altezza + misure.h * 0.4)}px`;
            annulla.disabled = !storia.length || finita;
            completa.hidden = !(motore.completabile && motore.completabile(stato)) || finita;
            aggiornaRiepilogo();
        }
        const ok = (sel, meta) => { const carte = stato.pile[sel.pila].slice(sel.indice); return carte.length && motore.puoPosare(stato, carte, meta); };
        // Ogni azione riuscita si può annullare; il tempo parte alla prima mossa
        function esegui(azione, testo) {
            if (finita) return false;
            const prima = structuredClone(stato);
            if (!azione()) { if (stato.errore) scrivi(stato.errore); return false; }
            storia.push(prima); if (storia.length > 300) storia.shift();
            if (!inizio) { inizio = Date.now(); cronometro = setInterval(aggiornaRiepilogo, 1000); }
            selezione = null; disegna(); scrivi(testo || '');
            controllaFine();
            return true;
        }
        function controllaFine() {
            const vinto = motore.vinto(stato), bloccato = !vinto && motore.bloccata && motore.bloccata(stato);
            if (!vinto && !bloccato) return;
            finita = true; clearInterval(cronometro); disegna();
            const risultati = document.querySelector('#risultati'); risultati.hidden = false; risultati.textContent = '';
            const h = document.createElement('h2'), p = document.createElement('p');
            h.textContent = vinto ? 'Hai vinto!' : 'Nessuna mossa possibile';
            p.textContent = `${vinto ? 'Solitario risolto' : config.punteggio ? config.punteggio(stato) : 'Partita finita'} in ${tempo()} con ${stato.mosse} mosse.`;
            risultati.append(h, p);
            scrivi(`${h.textContent} ${p.textContent}`);
        }
        // Tocco o clic senza trascinare
        function tocco(pila, indice) {
            const chiave = `${pila}:${indice}`, ora = Date.now();
            const doppio = ora - ultimoTocco.t < 380 && ultimoTocco.chiave === chiave;
            ultimoTocco = { t: ora, chiave };
            if (stato.pile[pila] && pila === 'mazzo') { esegui(() => motore.clicMazzo(stato)); return; }
            if (motore.toccoSingolo || doppio) { if (esegui(() => motore.autoBase(stato, pila), 'Carta mandata alla base.')) return; }
            if (selezione) {
                const da = selezione;
                if (pila !== da.pila && esegui(() => motore.sposta(stato, da.pila, da.indice, pila))) return;
                selezione = null;
                if (pila === da.pila) { disegna(); return; }
            }
            if (indice >= 0 && motore.puoPrendere(stato, pila, indice)) { selezione = { pila, indice }; disegna(); scrivi('Carta selezionata: tocca dove vuoi spostarla (due tocchi per mandarla alla base).'); }
            else disegna();
        }
        function bersaglio(evento) {
            const el = document.elementsFromPoint(evento.clientX, evento.clientY).find(x => x.dataset?.pila && !x.classList.contains('carta-solitario--trascinata'));
            return el ? { pila: el.dataset.pila, indice: Number(el.dataset.indice) } : null;
        }
        tavolo.addEventListener('pointerdown', evento => {
            const el = evento.target.closest?.('[data-pila]');
            if (!el || finita) return;
            const pila = el.dataset.pila, indice = Number(el.dataset.indice);
            trascina = { pila, indice, x: evento.clientX, y: evento.clientY, attivo: false, elementi: [] };
            if (indice >= 0 && motore.puoPrendere(stato, pila, indice))
                trascina.elementi = [...tavolo.querySelectorAll('.carta-solitario')].filter(x => x.dataset.pila === pila && Number(x.dataset.indice) >= indice);
            tavolo.setPointerCapture?.(evento.pointerId);
        });
        tavolo.addEventListener('pointermove', evento => {
            if (!trascina || !trascina.elementi.length) return;
            const dx = evento.clientX - trascina.x, dy = evento.clientY - trascina.y;
            if (!trascina.attivo && Math.hypot(dx, dy) < 8) return;
            trascina.attivo = true; evento.preventDefault();
            // Lo z-index in linea serve perché le carte trascinate passino sopra tutte le altre
            trascina.elementi.forEach((x, k) => { x.classList.add('carta-solitario--trascinata'); x.style.zIndex = String(1000 + k); x.style.transform = `translate(${dx}px, ${dy}px)`; });
        });
        tavolo.addEventListener('pointerup', evento => {
            const t = trascina; trascina = null;
            if (!t) return;
            if (!t.attivo) { tocco(t.pila, t.indice); return; }
            const meta = bersaglio(evento);
            if (!meta || meta.pila === t.pila || !esegui(() => motore.sposta(stato, t.pila, t.indice, meta.pila))) disegna();
        });
        tavolo.addEventListener('pointercancel', () => { trascina = null; disegna(); });
        annulla.addEventListener('click', () => { if (storia.length && !finita) { stato = storia.pop(); stato.mosse++; selezione = null; disegna(); scrivi('Mossa annullata.'); } });
        completa.addEventListener('click', () => esegui(() => { motore.completa(stato); return true; }, 'Carte mandate alle basi.'));
        // Con il pannello aperto il tempo si ferma
        document.addEventListener('tavola:aperta', () => { if (inizio && !finita) { pausaDa = Date.now(); clearInterval(cronometro); } });
        document.addEventListener('tavola:chiusa', () => {
            if (pausaDa === null) return;
            inizio += Date.now() - pausaDa; pausaDa = null;
            if (!finita) cronometro = setInterval(aggiornaRiepilogo, 1000);
            aggiornaRiepilogo();
        });
        if (typeof Tavola !== 'undefined') Tavola.opzione({ chiave: 'giochi_js_carte_immagini', etichetta: 'Carte con le immagini anche quando sono piccole',
            suCambio: v => { immagini = v; if (stato) disegna(); } });
        function nuovaPartita() {
            clearInterval(cronometro); cronometro = null; inizio = null; pausaDa = null; storia = []; selezione = null; finita = false;
            document.querySelector('#risultati').hidden = true;
            stato = motore.crea(config.opzioni ? config.opzioni(select?.value) : {});
            disegna(); scrivi(config.benvenuto || 'Trascina le carte oppure toccane una e poi la destinazione.');
        }
        select?.addEventListener('change', nuovaPartita);
        nuova.addEventListener('click', nuovaPartita);
        window.addEventListener?.('resize', () => { if (stato) disegna(); });
        document.querySelector('#nomeP0').textContent = 'Tempo';
        document.querySelector('#nomeP1').textContent = 'Mosse';
        nuovaPartita();
        return { stato: () => stato };
    }
    return { avvia };
})();
