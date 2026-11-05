// Tavolo condiviso dei giochi con il mazzo italiano: turni PC, scelta delle prese, mosse senza carta (asta, seme)
// e passaggio delle mani coperte. Da 2 a 5 posti; a 4 si gioca in coppie (0+2 contro 1+3).
// Opzioni di config (tutte facoltative tranne motore):
//   briscola / giro: le carte si giocano a giro e la presa si raccoglie (Briscola, Tressette, Briscola chiamata)
//   ruba: punteggio in carte (Rubamazzetto) · crea(modalita): crea lo stato secondo la modalità scelta
//   tabellone, info, descrivi, descriviInizio, descriviRaccolta, righeFinali, messaggioFinale: testi propri del gioco
const CarteItalianePagina = (() => {
    function avvia(config) {
        const motore = config.motore;
        const aGiro = Boolean(config.briscola || config.giro);
        const select = document.querySelector('#modalitaGioco');
        const nomiPulsante = document.querySelector('#nomiGiocatori');
        const nuova = document.querySelector('#nuovaPartita');
        const continua = document.querySelector('#continua');
        const mano = document.querySelector('#mano');
        const tavolo = document.querySelector('#carteTavolo');
        const opzioni = document.querySelector('#opzioniPresa');
        const messaggi = document.querySelector('#messaggi');
        let stato, timer, versione = 0, occupato = true, coperto = true, inPassaggio = false, selezionata = null, cronaca = '', ultimaVista = 0;
        let nomi = Giocatori.leggiNomi();
        const due = () => select.value === 'due';
        const posti = () => stato.mani.length;
        function nome(i) {
            if (posti() === 5) return ['Tu', 'PC 1', 'PC 2', 'PC 3', 'PC 4'][i];
            if (posti() === 4) return due() ? [nomi[0], nomi[1], `Compagno PC di ${nomi[0]}`, `Compagno PC di ${nomi[1]}`][i]
                : ['Tu', 'Avversario PC 1', 'Compagno PC', 'Avversario PC 2'][i];
            return due() ? nomi[i] : ['Tu', 'Computer'][i];
        }
        // Nome di una squadra (a 2 posti coincide con il giocatore)
        function etichetta(i) {
            if (posti() === 4) return due() ? `${nomi[i]} + compagno PC` : i === 0 ? 'Tu + Compagno PC' : 'Avversari PC';
            return nome(i);
        }
        const umani = () => due() ? [0, 1] : [0];
        const umano = () => umani().includes(stato.turno);
        // Mano mostrata: quella di chi gioca, se è una persona; durante i turni PC resta l'ultima persona che ha giocato
        const vista = () => umano() ? stato.turno : ultimaVista;
        const aiuti = { nome, etichetta, due };
        function scrivi(testo) { messaggi.textContent = testo; }
        // Con il pannello della tavola aperto (js/tavola.js) i PC aspettano
        const dopoPannello = fn => (typeof Tavola !== 'undefined' ? Tavola.quandoChiuso(fn) : fn());
        // Colonne per mano e tavolo sul telefono: fino a 5 carte su una riga, oltre su due righe
        const colonne = n => String(n <= 5 ? Math.max(n, 1) : Math.ceil(n / 2));
        function etichettaMossa(m) { return (config.etichettaMossa || motore.etichettaMossa)(stato, m); }
        function disegna() {
            const risultati = motore.risultato(stato);
            const tabellone = config.tabellone?.(stato, risultati, aiuti);
            for (let i = 0; i < 2; i++) {
                document.querySelector(`#nomeP${i}`).textContent = tabellone ? tabellone.voci[i].nome : etichetta(i);
                document.querySelector(`#puntiP${i}`).textContent = tabellone ? tabellone.voci[i].valore
                    : config.briscola || stato.finita ? risultati.punti[i] : stato.catturate[i].length;
            }
            document.querySelector('#tipoPunti').textContent = tabellone ? tabellone.tipo
                : config.briscola ? 'Punti delle prese' : stato.finita ? (config.ruba ? 'Carte raccolte' : 'Punti della smazzata') : 'Carte raccolte (conteggio provvisorio)';
            document.querySelector('#rimaste').textContent = stato.mazzo.length;
            document.querySelector('#titoloMano').textContent = coperto ? 'Mano coperta' : due() ? `Mano di ${nome(vista())}` : 'La tua mano';
            const avversari = document.querySelector('#avversari'); avversari.textContent = '';
            stato.mani.forEach((carte, i) => {
                if (i === vista()) return;
                const zona = document.createElement('div'); zona.className = 'avversario-carte';
                // Sul telefono si vede un solo dorso con nome e numero di carte; il bordo indica chi sta giocando
                if (i === stato.turno && !stato.finita && !stato.presaCompleta) zona.classList.add('avversario-carte--turno');
                const titolo = document.createElement('span'); titolo.textContent = `${nome(i)} · ${carte.length} carte`;
                zona.appendChild(titolo);
                carte.forEach(c => zona.appendChild(Carte.crea(c, { coperta: true })));
                avversari.appendChild(zona);
            });
            const legali = stato.finita ? [] : motore.mosseLegali(stato);
            const giocabili = new Set(legali.map(m => m.carta).filter(c => c !== undefined));
            mano.textContent = '';
            mano.style.setProperty('--colonne', colonne(stato.mani[vista()].length));
            stato.mani[vista()].forEach((carta, i) => {
                const bottone = document.createElement('button'); bottone.type = 'button'; bottone.className = 'carta-pulsante';
                const immagine = Carte.crea(carta, { coperta: coperto });
                if (i === selezionata) immagine.classList.add('carta--selezionata');
                bottone.appendChild(immagine);
                bottone.disabled = occupato || coperto || stato.finita || !umano() || !giocabili.has(i);
                bottone.setAttribute('aria-label', coperto ? 'Carta coperta' : `Gioca ${Mazzo.nome(carta)}`);
                bottone.setAttribute('aria-pressed', String(i === selezionata));
                bottone.addEventListener('click', () => scegli(i)); mano.appendChild(bottone);
            });
            tavolo.textContent = '';
            tavolo.style.setProperty('--colonne', colonne(stato.tavolo.length));
            if (aGiro) {
                stato.tavolo.forEach(p => {
                    const figura = document.createElement('figure'), didascalia = document.createElement('figcaption');
                    didascalia.textContent = nome(p.giocatore); figura.append(Carte.crea(p.carta), didascalia); tavolo.appendChild(figura);
                });
            } else stato.tavolo.forEach(c => tavolo.appendChild(Carte.crea(c)));
            document.querySelector('#tavoloVuoto').hidden = stato.tavolo.length > 0;
            const riquadro = document.querySelector('#briscola'); riquadro.textContent = '';
            const info = config.info ? config.info(stato, aiuti)
                : config.briscola ? { testo: `Briscola: ${stato.briscola.seme}${stato.mazzo.length ? '' : ' · tallone esaurito'}`, carta: stato.mazzo.length ? stato.briscola : null } : null;
            riquadro.hidden = !info;
            if (info) {
                const testo = document.createElement('p'); testo.textContent = info.testo; riquadro.appendChild(testo);
                if (info.carta) riquadro.appendChild(Carte.crea(info.carta));
            }
            const pile = document.querySelector('#mazzetti'); pile.textContent = '';
            stato.catturate.forEach((carte, i) => {
                const zona = document.createElement('div'); zona.className = 'mazzetto-carte';
                const chi = stato.catturate.length === posti() ? nome(i) : etichetta(i);
                const titolo = document.createElement('p'); titolo.textContent = `${chi}: ${carte.length} carte${stato.scope ? ` · ${stato.scope[i]} scope` : ''}`;
                zona.appendChild(titolo);
                if (carte.length) zona.appendChild(Carte.crea(carte.at(-1), { coperta: !config.ruba }));
                pile.appendChild(zona);
            });
            opzioni.textContent = '';
            const attivo = !occupato && !coperto && umano();
            const bottoneOpzione = (testo, azione) => {
                const bottone = document.createElement('button'); bottone.type = 'button'; bottone.className = 'pulsante pulsante--secondario scelta-presa';
                bottone.textContent = testo; bottone.addEventListener('click', azione); opzioni.appendChild(bottone);
            };
            if (selezionata !== null && attivo) {
                legali.filter(m => m.carta === selezionata).forEach(m => bottoneOpzione(
                    m.ruba !== undefined ? `Ruba il mazzetto di ${nome(m.ruba)} (${stato.catturate[m.ruba].length} carte)`
                        : m.presa.length ? `Prendi ${m.presa.map(i => Mazzo.nome(stato.tavolo[i])).join(' + ')}` : 'Posa sul tavolo',
                    () => { if (!occupato && !coperto) applica(m); }));
            } else if (attivo && legali.length && !giocabili.size) {
                // Mosse senza carta: asta, scelta del seme
                legali.forEach(m => bottoneOpzione(etichettaMossa(m), () => { if (!occupato && !coperto) applica(m); }));
            }
            // Molte opzioni (l'asta): il CSS le dispone su più colonne
            opzioni.classList.toggle('opzioni-prese--molte', opzioni.children.length > 4);
            document.querySelector('#annullaScelta').hidden = selezionata === null;
            continua.hidden = !stato.presaCompleta || stato.finita;
            nuova.disabled = inPassaggio; select.disabled = inPassaggio; nomiPulsante.disabled = occupato || inPassaggio;
            const dettagli = document.querySelector('#risultati'); dettagli.textContent = ''; dettagli.hidden = !stato.finita;
            if (stato.finita) {
                const titolo = document.createElement('h2'); titolo.textContent = 'Conteggio finale'; dettagli.appendChild(titolo);
                const elenco = document.createElement('ul');
                const righe = config.righeFinali ? config.righeFinali(stato, risultati, aiuti) : [0, 1].map(i => {
                    let testo = `${etichetta(i)}: ${risultati.punti[i]} ${config.ruba ? 'carte' : 'punti'}`;
                    if (!config.briscola && !config.ruba) {
                        const d = risultati.dettaglio[i], valori = risultati.dati[i];
                        testo += ` — scope ${d.scope}, carte ${d.carte} (${valori.carte}), denari ${d.denari} (${valori.denari}), settebello ${d.settebello}, primiera ${d.primiera} (valore ${valori.primiera})`;
                        if (stato.variante === 'scopone') testo += `, napola ${d.napola}`;
                        if (stato.variante === 'cirulla') testo += `, grande ${d.grande}, piccola ${d.piccola}`;
                        testo += '.';
                    }
                    return testo;
                });
                righe.forEach(testo => { const riga = document.createElement('li'); riga.textContent = testo; elenco.appendChild(riga); });
                dettagli.appendChild(elenco);
            }
        }
        function scegli(indice) {
            if (occupato || coperto || !umano() || stato.finita) return;
            const mosse = motore.mosseLegali(stato).filter(m => m.carta === indice);
            if (mosse.length === 1) { applica(mosse[0]); return; }
            if (!mosse.length) return;
            selezionata = indice; disegna(); scrivi('Questa carta permette più prese: scegli quale effettuare.');
            opzioni.querySelector('button')?.focus();
        }
        function applica(mossa) {
            if (!mossa) return;
            const io = stato.turno, carta = mossa.carta !== undefined ? stato.mani[io][mossa.carta] : null;
            const testoMossa = carta ? '' : etichettaMossa(mossa);
            if (!motore.gioca(stato, mossa)) return;
            cronaca = carta ? `${nome(io)} gioca ${Mazzo.nome(carta)}.` : `${nome(io)}: ${testoMossa}.`;
            if (carta && !aGiro) {
                if (stato.ultimo.ruba) cronaca += ' Mazzetto rubato!';
                else if (stato.ultimo.scopa) cronaca += ' Scopa!';
                else if (stato.ultimo.prese.length) cronaca += ` Prende ${stato.ultimo.prese.length} carte dal tavolo.`;
                else cronaca += ' La carta resta sul tavolo.';
            }
            const extra = config.descrivi?.(stato, aiuti);
            if (extra) cronaca += ` ${extra}`;
            preparaTurno();
        }
        function pianifica(azione, attesa = 650) {
            const corrente = versione;
            timer = setTimeout(() => { timer = null; dopoPannello(() => { if (corrente === versione) azione(); }); }, attesa);
        }
        async function preparaTurno() {
            const corrente = versione;
            occupato = true; coperto = due(); selezionata = null;
            if (stato.finita) {
                coperto = true; disegna();
                const risultato = motore.risultato(stato);
                scrivi(config.messaggioFinale ? config.messaggioFinale(stato, risultato, aiuti)
                    : risultato.vincitore === null ? 'Smazzata conclusa in pareggio.' : `Vince ${etichetta(risultato.vincitore)} con ${risultato.punti[risultato.vincitore]} ${config.ruba ? 'carte' : 'punti'}!`);
                return;
            }
            if (stato.presaCompleta) {
                const vince = motore.vincitorePresa(stato.tavolo, stato.briscola?.seme);
                continua.textContent = `Raccoglie ${nome(vince)}`;
                scrivi(`${cronaca} Presa a ${nome(vince)}.`); disegna();
                if (!due()) pianifica(raccogli, 1100);
                return;
            }
            disegna();
            if (due() && umano()) {
                inPassaggio = true; disegna();
                await Giocatori.passaDispositivo(nome(stato.turno));
                if (corrente !== versione) return;
                ultimaVista = stato.turno;
                inPassaggio = false; coperto = false; occupato = false; disegna();
                scrivi(`${cronaca} Tocca a ${nome(stato.turno)}.`);
            } else if (umano()) {
                ultimaVista = stato.turno;
                coperto = false; occupato = false; disegna(); scrivi(`${cronaca} ${config.invito?.(stato, aiuti) || 'Scegli una carta dalla tua mano.'}`);
            } else {
                // Turno di un PC: in due la mano dell'ultima persona resta coperta
                coperto = due(); disegna(); scrivi(`${cronaca} ${nome(stato.turno)} sta scegliendo…`);
                pianifica(() => applica(motore.mossaPC(stato)));
            }
        }
        function raccogli() {
            clearTimeout(timer); timer = null;
            if (!motore.raccogli?.(stato)) return;
            cronaca = config.descriviRaccolta ? config.descriviRaccolta(stato, aiuti) : `${nome(stato.ultimo.giocatore)} raccoglie ${stato.ultimo.punti} punti.`;
            preparaTurno();
        }
        function nuovaPartita() {
            if (inPassaggio) return;
            clearTimeout(timer); timer = null; versione++; ultimaVista = 0;
            stato = config.crea ? config.crea(select.value) : config.briscola ? motore.crea(select.value === 'quattro' ? 4 : 2) : motore.crea();
            cronaca = config.descriviInizio?.(stato, aiuti) || ''; preparaTurno();
        }
        nuova.addEventListener('click', nuovaPartita);
        continua.addEventListener('click', raccogli);
        document.querySelector('#annullaScelta').addEventListener('click', () => { selezionata = null; disegna(); scrivi('Scegli una carta dalla tua mano.'); });
        Giocatori.collegaBarra({ select, pulsanteNomi: nomiPulsante, suCambioModalita: nuovaPartita,
            suCambioNomi: nuovi => { nomi = nuovi; disegna(); scrivi(`Tocca a ${nome(stato.turno)}.`); } });
        nuovaPartita();
    }
    return { avvia };
})();
