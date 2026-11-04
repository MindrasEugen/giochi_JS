// Tavolo condiviso: turni PC, scelta delle prese e passaggio delle mani coperte.
const CarteItalianePagina = (() => {
    function avvia(config) {
        const motore = config.motore;
        const select = document.querySelector('#modalitaGioco');
        const nomiPulsante = document.querySelector('#nomiGiocatori');
        const nuova = document.querySelector('#nuovaPartita');
        const continua = document.querySelector('#continua');
        const mano = document.querySelector('#mano');
        const tavolo = document.querySelector('#carteTavolo');
        const opzioni = document.querySelector('#opzioniPresa');
        const messaggi = document.querySelector('#messaggi');
        let stato, timer, versione = 0, occupato = true, coperto = true, inPassaggio = false, selezionata = null, cronaca = '';
        let nomi = Giocatori.leggiNomi();
        const due = () => select.value === 'due';
        const nome = i => due() ? nomi[i] : stato.mani.length === 4 ? ['Tu', 'Avversario PC 1', 'Compagno PC', 'Avversario PC 2'][i] : ['Tu', 'Computer'][i];
        const umano = () => due() || stato.turno === 0;
        const vista = () => due() ? stato.turno : 0;
        const etichetta = i => stato.mani.length === 4 ? (i === 0 ? 'Tu + Compagno PC' : 'Avversari PC') : nome(i);
        function scrivi(testo) { messaggi.textContent = testo; }
        function disegna() {
            const risultati = motore.risultato(stato);
            for (let i = 0; i < 2; i++) {
                document.querySelector(`#nomeP${i}`).textContent = etichetta(i);
                document.querySelector(`#puntiP${i}`).textContent = config.briscola || stato.finita ? risultati.punti[i] : stato.catturate[i].length;
            }
            document.querySelector('#tipoPunti').textContent = config.briscola ? 'Punti delle prese' : stato.finita ? (config.ruba ? 'Carte raccolte' : 'Punti della smazzata') : 'Carte raccolte (conteggio provvisorio)';
            document.querySelector('#rimaste').textContent = stato.mazzo.length;
            document.querySelector('#titoloMano').textContent = coperto ? 'Mano coperta' : due() ? `Mano di ${nome(vista())}` : 'La tua mano';
            const avversari = document.querySelector('#avversari'); avversari.textContent = '';
            stato.mani.forEach((carte, i) => {
                if (i === vista()) return;
                const zona = document.createElement('div'); zona.className = 'avversario-carte';
                const titolo = document.createElement('span'); titolo.textContent = `${nome(i)} · ${carte.length} carte`;
                zona.appendChild(titolo);
                carte.forEach(c => zona.appendChild(Carte.crea(c, { coperta: true })));
                avversari.appendChild(zona);
            });
            mano.textContent = '';
            stato.mani[vista()].forEach((carta, i) => {
                const bottone = document.createElement('button'); bottone.type = 'button'; bottone.className = 'carta-pulsante';
                const immagine = Carte.crea(carta, { coperta: coperto });
                if (i === selezionata) immagine.classList.add('carta--selezionata');
                bottone.appendChild(immagine); bottone.disabled = occupato || coperto || stato.finita || !umano();
                bottone.setAttribute('aria-label', coperto ? 'Carta coperta' : `Gioca ${Mazzo.nome(carta)}`);
                bottone.setAttribute('aria-pressed', String(i === selezionata));
                bottone.addEventListener('click', () => scegli(i)); mano.appendChild(bottone);
            });
            tavolo.textContent = '';
            if (config.briscola) {
                stato.tavolo.forEach(p => {
                    const figura = document.createElement('figure'), didascalia = document.createElement('figcaption');
                    didascalia.textContent = nome(p.giocatore); figura.append(Carte.crea(p.carta), didascalia); tavolo.appendChild(figura);
                });
            } else stato.tavolo.forEach(c => tavolo.appendChild(Carte.crea(c)));
            document.querySelector('#tavoloVuoto').hidden = stato.tavolo.length > 0;
            const briscola = document.querySelector('#briscola'); briscola.textContent = ''; briscola.hidden = !config.briscola;
            if (config.briscola) {
                const testo = document.createElement('p'); testo.textContent = `Briscola: ${stato.briscola.seme}${stato.mazzo.length ? '' : ' · tallone esaurito'}`;
                briscola.appendChild(testo);
                if (stato.mazzo.length) briscola.appendChild(Carte.crea(stato.briscola));
            }
            const pile = document.querySelector('#mazzetti'); pile.textContent = '';
            stato.catturate.forEach((carte, i) => {
                const zona = document.createElement('div'); zona.className = 'mazzetto-carte';
                const titolo = document.createElement('p'); titolo.textContent = `${nome(i)}: ${carte.length} carte${stato.scope ? ` · ${stato.scope[i]} scope` : ''}`;
                zona.appendChild(titolo);
                if (carte.length) zona.appendChild(Carte.crea(carte.at(-1), { coperta: !config.ruba }));
                pile.appendChild(zona);
            });
            opzioni.textContent = '';
            if (selezionata !== null && !occupato && !coperto) {
                const possibili = motore.mosseLegali(stato).filter(m => m.carta === selezionata);
                possibili.forEach(m => {
                    const bottone = document.createElement('button'); bottone.type = 'button'; bottone.className = 'pulsante pulsante--secondario scelta-presa';
                    bottone.textContent = m.ruba !== undefined ? `Ruba il mazzetto di ${nome(m.ruba)} (${stato.catturate[m.ruba].length} carte)`
                        : m.presa.length ? `Prendi ${m.presa.map(i => Mazzo.nome(stato.tavolo[i])).join(' + ')}` : 'Posa sul tavolo';
                    bottone.addEventListener('click', () => { if (!occupato && !coperto) applica(m); });
                    opzioni.appendChild(bottone);
                });
            }
            document.querySelector('#annullaScelta').hidden = selezionata === null;
            continua.hidden = !stato.presaCompleta || stato.finita;
            nuova.disabled = inPassaggio; select.disabled = inPassaggio; nomiPulsante.disabled = occupato || inPassaggio;
            const dettagli = document.querySelector('#risultati'); dettagli.textContent = ''; dettagli.hidden = !stato.finita;
            if (stato.finita) {
                const titolo = document.createElement('h2'); titolo.textContent = 'Conteggio finale'; dettagli.appendChild(titolo);
                const elenco = document.createElement('ul');
                for (let i = 0; i < 2; i++) {
                    const riga = document.createElement('li');
                    riga.textContent = `${etichetta(i)}: ${risultati.punti[i]} ${config.ruba ? 'carte' : 'punti'}`;
                    if (!config.briscola && !config.ruba) {
                        const d = risultati.dettaglio[i], valori = risultati.dati[i];
                        riga.textContent += ` — scope ${d.scope}, carte ${d.carte} (${valori.carte}), denari ${d.denari} (${valori.denari}), settebello ${d.settebello}, primiera ${d.primiera} (valore ${valori.primiera}).`;
                    }
                    elenco.appendChild(riga);
                }
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
            const io = stato.turno, carta = stato.mani[io][mossa.carta];
            if (!motore.gioca(stato, mossa)) return;
            cronaca = `${nome(io)} gioca ${Mazzo.nome(carta)}.`;
            if (!config.briscola) {
                if (stato.ultimo.ruba) cronaca += ' Mazzetto rubato!';
                else if (stato.ultimo.scopa) cronaca += ' Scopa!';
                else if (stato.ultimo.prese.length) cronaca += ` Prende ${stato.ultimo.prese.length} carte dal tavolo.`;
                else cronaca += ' La carta resta sul tavolo.';
            }
            preparaTurno();
        }
        function pianifica(azione, attesa = 650) {
            const corrente = versione;
            timer = setTimeout(() => { timer = null; if (corrente === versione) azione(); }, attesa);
        }
        async function preparaTurno() {
            const corrente = versione;
            occupato = true; coperto = due(); selezionata = null;
            if (stato.finita) {
                coperto = true; disegna();
                const risultato = motore.risultato(stato);
                scrivi(risultato.vincitore === null ? 'Smazzata conclusa in pareggio.' : `Vince ${etichetta(risultato.vincitore)} con ${risultato.punti[risultato.vincitore]} ${config.ruba ? 'carte' : 'punti'}!`);
                return;
            }
            if (stato.presaCompleta) {
                const vince = motore.vincitorePresa(stato.tavolo, stato.briscola.seme);
                continua.textContent = `Raccoglie ${nome(vince)}`;
                scrivi(`${cronaca} Presa a ${nome(vince)}.`); disegna();
                if (!due()) pianifica(raccogli, 1100);
                return;
            }
            disegna();
            if (due()) {
                inPassaggio = true; disegna();
                await Giocatori.passaDispositivo(nome(stato.turno));
                if (corrente !== versione) return;
                inPassaggio = false; coperto = false; occupato = false; disegna();
                scrivi(`${cronaca} Tocca a ${nome(stato.turno)}.`);
            } else if (umano()) {
                coperto = false; occupato = false; disegna(); scrivi(`${cronaca} Scegli una carta dalla tua mano.`);
            } else {
                coperto = false; disegna(); scrivi(`${cronaca} ${nome(stato.turno)} sta scegliendo…`);
                pianifica(() => applica(motore.mossaPC(stato)));
            }
        }
        function raccogli() {
            clearTimeout(timer); timer = null;
            if (!motore.raccogli?.(stato)) return;
            cronaca = `${nome(stato.ultimo.giocatore)} raccoglie ${stato.ultimo.punti} punti.`;
            preparaTurno();
        }
        function nuovaPartita() {
            if (inPassaggio) return;
            clearTimeout(timer); timer = null; versione++;
            stato = config.briscola ? motore.crea(select.value === 'quattro' ? 4 : 2) : motore.crea();
            cronaca = ''; preparaTurno();
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
