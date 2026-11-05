// Pagina condivisa di Scala 40 e Ramino. Si selezionano le carte della mano e poi si sceglie l'azione:
// cala (o prepara l'apertura), attacca (toccando una combinazione sul tavolo), scarta.
// In due si passa il dispositivo a ogni turno e la mano dell'altro resta coperta.
const RaminoPagina = (() => {
    function avvia(variante) {
        const R = Ramino, C = Combinazioni;
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
        // Il jolly non ha un'immagine: è disegnato in HTML e CSS
        function carta(c, opzioniCarta = {}) {
            if (!c.jolly || opzioniCarta.coperta) return Carte.crea(c, opzioniCarta);
            const el = document.createElement('span'); el.className = 'carta carta--jolly'; el.setAttribute('role', 'img'); el.setAttribute('aria-label', 'jolly');
            el.textContent = '★'; return el;
        }
        const ordina = carte => [...carte].sort(ordine === 'valore'
            ? (a, b) => (a.jolly - b.jolly) || a.numero - b.numero || a.seme.localeCompare(b.seme)
            : (a, b) => (a.jolly - b.jolly) || a.seme.localeCompare(b.seme) || a.numero - b.numero);
        function bottone(testo, azione, principale = false) {
            const b = document.createElement('button'); b.type = 'button'; b.className = `pulsante ${principale ? '' : 'pulsante--secondario'} scelta-presa`.replace('  ', ' ');
            b.textContent = testo; b.addEventListener('click', azione); opzioni.appendChild(b); return b;
        }
        function disegna() {
            const s = stato, io = vista, altro = 1 - vista, mioTurno = !occupato && !coperto && umano(s.turno) && s.turno === io && !s.finita;
            for (const g of [0, 1]) { document.querySelector(`#nomeP${g}`).textContent = nome(g); document.querySelector(`#puntiP${g}`).textContent = s.punti[g]; }
            document.querySelector('#tipoPunti').textContent = `Punti di penalità · si esce a ${s.regole.uscita} · mano ${s.numeroMano} · apertura ${s.regole.soglia}`;
            const avversario = document.querySelector('#avversari'); avversario.textContent = '';
            const zona = document.createElement('div'); zona.className = 'avversario-carte';
            const titolo = document.createElement('span'); titolo.textContent = `${nome(altro)} · ${s.mani[altro].length} carte${s.aperto[altro] ? ' · ha aperto' : ''}`;
            zona.appendChild(titolo);
            const finita = s.fase === 'fineMano';
            ordina(s.mani[altro]).forEach(c => zona.appendChild(carta(c, { coperta: !finita })));
            avversario.appendChild(zona);
            // Tallone e scarto
            const tallone = document.querySelector('#tallone'); tallone.textContent = '';
            tallone.appendChild(Carte.crea({ tipo: 'francese' }, { coperta: true }));
            document.querySelector('#contaTallone').textContent = `${s.tallone.length} nel tallone`;
            const pozzo = document.querySelector('#pozzo'); pozzo.textContent = '';
            if (s.pozzo.length) pozzo.appendChild(carta(s.pozzo.at(-1)));
            // Combinazioni sul tavolo: si toccano per attaccare la carta selezionata
            const tavolo = document.querySelector('#combinazioni'); tavolo.textContent = '';
            s.tavolo.forEach(t => {
                const b = document.createElement('button'); b.type = 'button'; b.className = 'combinazione-tavolo';
                b.setAttribute('aria-label', `Combinazione di ${nome(t.giocatore)}: ${t.carte.map(x => C.nome(x.carta)).join(', ')}. Tocca per attaccare la carta selezionata`);
                t.carte.forEach(x => b.appendChild(carta(x.carta)));
                b.disabled = !(mioTurno && s.fase === 'gioca' && s.aperto[io] && selezionate.size === 1);
                b.addEventListener('click', () => esegui(() => R.attaccaCarta(stato, [...selezionate][0], t.id), 'attacca'));
                tavolo.appendChild(b);
            });
            document.querySelector('#tavoloVuoto').hidden = s.tavolo.length > 0;
            // Combinazioni preparate per l'apertura
            const prep = document.querySelector('#preparazione'); prep.textContent = '';
            prep.hidden = !s.preparazione.length || coperto;
            if (s.preparazione.length && !coperto) {
                const t = document.createElement('p'); t.textContent = `Pronte per aprire: ${R.puntiPreparazione(s)} punti su ${s.regole.soglia}`; prep.appendChild(t);
                s.preparazione.forEach(p => { const g = document.createElement('div'); g.className = 'combinazione-preparata'; p.carte.forEach(c => g.appendChild(carta(c))); prep.appendChild(g); });
            }
            // La mano
            document.querySelector('#titoloMano').textContent = coperto ? 'Mano coperta' : due() ? `Mano di ${nome(io)}` : 'La tua mano';
            const mano = document.querySelector('#mano'); mano.textContent = '';
            ordina(s.mani[io]).forEach(c => {
                const b = document.createElement('button'); b.type = 'button'; b.className = 'carta-pulsante';
                if (selezionate.has(c.id)) b.classList.add('carta-pulsante--selezionata');
                if (s.obbligo === c.id && !coperto) b.classList.add('carta-pulsante--obbligo');
                b.appendChild(carta(c, { coperta: coperto && !finita }));
                b.setAttribute('aria-pressed', String(selezionate.has(c.id)));
                b.setAttribute('aria-label', coperto ? 'Carta coperta' : C.nome(c));
                b.disabled = !mioTurno || s.fase !== 'gioca';
                b.addEventListener('click', () => { selezionate.has(c.id) ? selezionate.delete(c.id) : selezionate.add(c.id); disegna(); });
                mano.appendChild(b);
            });
            // Pulsanti delle azioni
            opzioni.textContent = '';
            if (finita && !s.finita && !occupato) bottone('Mano successiva', () => { R.prossimaMano(stato); selezionate.clear(); cronaca = ''; prepara(); }, true);
            if (mioTurno && s.fase === 'pesca') {
                bottone('Pesca dal tallone', () => esegui(() => R.pesca(stato, false), 'pesca'), true);
                bottone('Prendi lo scarto', () => esegui(() => R.pesca(stato, true), 'scarto')).disabled = !R.puoPrendereScarto(s);
            }
            if (mioTurno && s.fase === 'gioca') {
                const scelte = [...selezionate];
                bottone(s.aperto[io] ? 'Cala la combinazione' : 'Prepara la combinazione', () => esegui(() => R.cala(stato, scelte), 'cala')).disabled = scelte.length < 3;
                if (s.preparazione.length) { bottone(`Apri (${R.puntiPreparazione(s)} punti)`, () => esegui(() => R.apri(stato), 'apri'), true); bottone('Annulla le combinazioni preparate', () => esegui(() => R.annulla(stato), 'annulla')); }
                bottone('Scarta la carta selezionata', () => esegui(() => R.scarta(stato, scelte[0]), 'scarta')).disabled = scelte.length !== 1;
                bottone(ordine === 'valore' ? 'Ordina per seme' : 'Ordina per valore', () => { ordine = ordine === 'valore' ? 'seme' : 'valore'; disegna(); });
            }
            nuova.disabled = inPassaggio; select.disabled = inPassaggio; nomiPulsante.hidden = !due(); nomiPulsante.disabled = inPassaggio;
            const risultati = document.querySelector('#risultati'); risultati.hidden = !s.finita; risultati.textContent = '';
            if (s.finita) {
                const h = document.createElement('h2'); h.textContent = 'Fine della partita';
                const p = document.createElement('p'); p.textContent = `Vince ${nome(s.vincitore)}: ${nome(0)} ${s.punti[0]} punti, ${nome(1)} ${s.punti[1]} punti (si esce a ${s.regole.uscita}).`;
                risultati.append(h, p);
            }
        }
        function descrivi(u) {
            if (!u) return '';
            const chi = nome(u.giocatore);
            switch (u.tipo) {
                case 'tallone': return `${chi} pesca dal tallone.`;
                case 'scarto': return `${chi} prende lo scarto: ${C.nome(u.carta)}.`;
                case 'apre': return `${chi} apre con ${u.punti} punti.`;
                case 'cala': return `${chi} cala una combinazione.`;
                case 'attacca': return `${chi} attacca ${C.nome(u.carta)}.`;
                case 'scarta': return `${chi} scarta ${C.nome(u.carta)}.`;
                default: return '';
            }
        }
        function testoFineMano() {
            const e = stato.esito;
            const conto = `${nome(0)} +${e.pagati[0]}, ${nome(1)} +${e.pagati[1]}.`;
            return e.chiude === null ? `Tallone esaurito per la terza volta: la mano si chiude, ognuno paga le sue carte. ${conto}` : `${nome(e.chiude)} chiude! ${conto}`;
        }
        // Azione della persona di turno: se va male si mostra il motivo
        function esegui(azione) {
            const prima = stato.turno;
            if (!azione()) { scrivi(stato.errore); return; }
            selezionate = new Set([...selezionate].filter(id => stato.mani[vista].some(c => c.id === id)));
            cronaca = descrivi(stato.ultimo);
            if (stato.turno !== prima || stato.fase === 'fineMano') { selezionate.clear(); prepara(); } else { disegna(); scrivi(`${cronaca} ${invito()}`.trim()); }
        }
        function invito() {
            const s = stato;
            if (s.fase === 'pesca') return 'Pesca dal tallone o prendi lo scarto.';
            if (s.obbligo !== null) return 'Usa subito la carta presa dagli scarti.';
            if (s.preparazione.length) return `Aggiungi combinazioni o apri (servono ${s.regole.soglia} punti).`;
            return s.aperto[s.turno] ? 'Cala, attacca (seleziona una carta e tocca una combinazione) oppure scarta.' : `Prepara le combinazioni per aprire (${s.regole.soglia} punti) oppure scarta.`;
        }
        function pianifica(azione, attesa = 900) {
            const corrente = versione;
            timer = setTimeout(() => { timer = null; if (corrente === versione) azione(); }, attesa);
        }
        async function prepara() {
            const corrente = versione, s = stato;
            occupato = true; coperto = due();
            if (s.fase === 'fineMano') { occupato = false; coperto = false; disegna(); scrivi(`${cronaca} ${testoFineMano()}${s.finita ? ` Partita finita: vince ${nome(s.vincitore)}!` : ''}`.trim()); return; }
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
                    const azioni = R.turnoPC(stato);
                    const testi = [];
                    if (azioni.includes('scarto')) testi.push(`${nome(g)} prende lo scarto.`); else testi.push(`${nome(g)} pesca dal tallone.`);
                    if (azioni.includes('apre')) testi.push(`${nome(g)} apre!`);
                    if (stato.ultimo?.tipo === 'scarta') testi.push(`Scarta ${C.nome(stato.ultimo.carta)}.`);
                    cronaca = testi.join(' ');
                    prepara();
                });
            }
        }
        function nuovaPartita() {
            if (inPassaggio) return;
            clearTimeout(timer); timer = null; versione++;
            stato = R.crea(variante); vista = 0; selezionate = new Set(); cronaca = '';
            prepara();
        }
        select.addEventListener('change', nuovaPartita);
        nuova.addEventListener('click', nuovaPartita);
        nomiPulsante.addEventListener('click', async () => { nomi = await Giocatori.chiediNomi(); disegna(); });
        nuovaPartita();
    }
    return { avvia };
})();
