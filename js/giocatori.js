// Modalità 2 giocatori sullo stesso dispositivo (ADR 0008).
// Fornisce le finestre che coprono il gioco:
// - passaDispositivo(nome): "Tocca a <nome>", da usare prima di mostrare qualcosa di nascosto
// - chiediSegreto({...}): un giocatore scrive una parola o un numero che l'altro non deve vedere
// - chiediNomi(): i nomi dei due giocatori, salvati nel browser (localStorage)
// - annuncia({...}): un messaggio con un pulsante (per esempio a fine round)
// Ogni funzione restituisce una Promise che si risolve quando il giocatore preme il pulsante.

const Giocatori = (() => {
    const CHIAVE = 'giochi_js_nomi';
    const PREDEFINITI = ['Giocatore 1', 'Giocatore 2'];
    const LUNGHEZZA_NOME = 20;

    function leggiNomi() {
        try {
            const salvati = JSON.parse(localStorage.getItem(CHIAVE));
            if (Array.isArray(salvati) && salvati.length === 2 && salvati.every(n => typeof n === 'string' && n.trim() !== '')) {
                return salvati;
            }
        } catch (errore) {
            // dati rovinati o localStorage non disponibile: si usano i nomi predefiniti
        }
        return [...PREDEFINITI];
    }

    function salvaNomi(nomi) {
        const puliti = nomi.map((nome, i) => (nome || '').trim().slice(0, LUNGHEZZA_NOME) || PREDEFINITI[i]);
        try {
            localStorage.setItem(CHIAVE, JSON.stringify(puliti));
        } catch (errore) {
            // senza localStorage i nomi valgono solo per questa pagina
        }
        return puliti;
    }

    // Crea la finestra: un velo che copre tutta la pagina con un riquadro al centro.
    // "contenuto" è una funzione che riceve il riquadro e una funzione "chiudi(valore)".
    function apri(titolo, testo, contenuto) {
        return new Promise(risolvi => {
            const primaDiAprire = document.activeElement;

            const copertura = document.createElement('div');
            copertura.className = 'copertura';
            copertura.setAttribute('role', 'dialog');
            copertura.setAttribute('aria-modal', 'true');

            const finestra = document.createElement('div');
            finestra.className = 'copertura__finestra';

            const h2 = document.createElement('h2');
            h2.className = 'copertura__titolo';
            h2.id = `copertura-titolo-${Date.now()}`;
            h2.textContent = titolo;
            copertura.setAttribute('aria-labelledby', h2.id);
            finestra.appendChild(h2);

            if (testo) {
                const p = document.createElement('p');
                p.className = 'copertura__testo';
                p.textContent = testo;
                finestra.appendChild(p);
            }

            function chiudi(valore) {
                copertura.remove();
                document.body.classList.remove('con-copertura');
                if (primaDiAprire && typeof primaDiAprire.focus === 'function') {
                    primaDiAprire.focus();
                }
                risolvi(valore);
            }

            contenuto(finestra, chiudi);
            copertura.appendChild(finestra);

            // Il tasto Tab resta dentro la finestra
            copertura.addEventListener('keydown', evento => {
                if (evento.key !== 'Tab') {
                    return;
                }
                const attivi = finestra.querySelectorAll('button, input, select');
                const primo = attivi[0];
                const ultimo = attivi[attivi.length - 1];
                if (evento.shiftKey && document.activeElement === primo) {
                    evento.preventDefault();
                    ultimo.focus();
                } else if (!evento.shiftKey && document.activeElement === ultimo) {
                    evento.preventDefault();
                    primo.focus();
                }
            });

            document.body.appendChild(copertura);
            document.body.classList.add('con-copertura');
            const daAttivare = finestra.querySelector('input, button');
            if (daAttivare) {
                daAttivare.focus();
            }
        });
    }

    function creaPulsante(testo, classe = 'pulsante') {
        const pulsante = document.createElement('button');
        pulsante.type = 'button';
        pulsante.className = classe;
        pulsante.textContent = testo;
        return pulsante;
    }

    function creaAzioni(...pulsanti) {
        const azioni = document.createElement('div');
        azioni.className = 'copertura__azioni';
        azioni.append(...pulsanti);
        return azioni;
    }

    function passaDispositivo(nome, testo) {
        return apri(`Tocca a ${nome}`, testo || `Passa il dispositivo a ${nome}. L'altro giocatore non deve guardare.`, (finestra, chiudi) => {
            const pronto = creaPulsante('Sono pronto');
            pronto.addEventListener('click', () => chiudi());
            finestra.appendChild(creaAzioni(pronto));
        });
    }

    function annuncia({ titolo, testo, pulsante = 'Continua' }) {
        return apri(titolo, testo, (finestra, chiudi) => {
            const ok = creaPulsante(pulsante);
            ok.addEventListener('click', () => chiudi());
            finestra.appendChild(creaAzioni(ok));
        });
    }

    // Chiede un valore nascosto (il campo è di tipo password).
    // "controlla(valore)" restituisce un messaggio d'errore, oppure '' se il valore va bene.
    function chiediSegreto({ titolo, testo, etichetta, numerico = false, controlla = () => '', pulsante = 'Conferma' }) {
        return apri(titolo, testo, (finestra, chiudi) => {
            const form = document.createElement('form');
            form.className = 'copertura__modulo';

            const id = `segreto-${Date.now()}`;
            const label = document.createElement('label');
            label.htmlFor = id;
            label.textContent = etichetta;

            const campo = document.createElement('input');
            campo.id = id;
            campo.type = 'password';
            campo.autocomplete = 'off';
            campo.className = 'copertura__campo';
            if (numerico) {
                campo.inputMode = 'numeric';
            }

            // Pulsante "occhio" per controllare quello che si è scritto
            const mostra = creaPulsante('Mostra', 'copertura__mostra');
            mostra.setAttribute('aria-pressed', 'false');
            mostra.addEventListener('click', () => {
                const visibile = campo.type === 'text';
                campo.type = visibile ? 'password' : 'text';
                mostra.textContent = visibile ? 'Mostra' : 'Nascondi';
                mostra.setAttribute('aria-pressed', String(!visibile));
            });

            const riga = document.createElement('div');
            riga.className = 'copertura__riga';
            riga.append(campo, mostra);

            const errore = document.createElement('p');
            errore.className = 'copertura__errore';
            errore.setAttribute('aria-live', 'polite');

            const conferma = creaPulsante(pulsante);
            conferma.type = 'submit';

            form.append(label, riga, errore, creaAzioni(conferma));
            form.addEventListener('submit', evento => {
                evento.preventDefault();
                const valore = campo.value.trim();
                const messaggio = valore === '' ? 'Scrivi qualcosa prima di confermare.' : controlla(valore);
                if (messaggio) {
                    errore.textContent = messaggio;
                    campo.focus();
                    return;
                }
                chiudi(valore);
            });
            finestra.appendChild(form);
        });
    }

    function chiediNomi() {
        const attuali = leggiNomi();
        return apri('Nomi dei giocatori', '', (finestra, chiudi) => {
            const form = document.createElement('form');
            form.className = 'copertura__modulo';
            const campi = attuali.map((nome, i) => {
                const id = `nome-giocatore-${i + 1}-${Date.now()}`;
                const label = document.createElement('label');
                label.htmlFor = id;
                label.textContent = `Giocatore ${i + 1}`;
                const campo = document.createElement('input');
                campo.id = id;
                campo.type = 'text';
                campo.maxLength = LUNGHEZZA_NOME;
                campo.value = nome;
                campo.className = 'copertura__campo';
                form.append(label, campo);
                return campo;
            });
            const conferma = creaPulsante('Salva');
            conferma.type = 'submit';
            form.appendChild(creaAzioni(conferma));
            form.addEventListener('submit', evento => {
                evento.preventDefault();
                chiudi(salvaNomi(campi.map(campo => campo.value)));
            });
            finestra.appendChild(form);
        });
    }

    return { leggiNomi, salvaNomi, passaDispositivo, annuncia, chiediSegreto, chiediNomi };
})();
