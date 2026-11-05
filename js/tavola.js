// Tavola a schermo intero sul telefono (Tappa 25, ADR 0012).
// Sul telefono (sotto i 600px) gli elementi della pagina segnati con data-pannello (intestazione, modalità,
// regole, fonti...) vengono spostati in un pannello che si apre sopra il gioco; resta visibile solo la tavola.
// Una barra sottile in alto porta a casa, apre le regole o il menu. Sugli schermi larghi gli elementi tornano
// al loro posto e la pagina resta come prima. All'apertura e alla chiusura del pannello vengono emessi gli
// eventi 'tavola:aperta' e 'tavola:chiusa' su document (i giochi li usano per la pausa).
// Le pagine possono aggiungere opzioni (caselle da spuntare) ricordate nel browser con Tavola.opzione().
const Tavola = (() => {
    let pannello = null, finestra = null, contenuto = null, opzioniBox = null, chiudiBtn = null;
    let aperto = false, spostati = [], sfondo = [], primaDiAprire = null;

    const telefono = () => !window.matchMedia?.('(min-width: 600px)').matches;
    const crea = (tag, classe, testo) => {
        const el = document.createElement(tag);
        if (classe) el.className = classe;
        if (testo) el.textContent = testo;
        return el;
    };
    const leggi = (chiave, predefinito) => {
        try { const v = localStorage.getItem(chiave); return v === null ? predefinito : v === 'si'; } catch { return predefinito; }
    };
    const salva = (chiave, valore) => { try { localStorage.setItem(chiave, valore ? 'si' : 'no'); } catch { /* senza localStorage vale solo per questa pagina */ } };

    // Telefono: gli elementi segnati vanno nel pannello (nell'ordine della pagina); schermo largo: tornano al loro posto
    function sistema() {
        if (telefono() && !spostati.length) {
            for (const el of document.querySelectorAll('#contenitore_gioco [data-pannello]')) {
                const segnaposto = document.createComment('pannello');
                el.before(segnaposto);
                contenuto.appendChild(el);
                spostati.push({ el, segnaposto });
            }
        } else if (!telefono() && spostati.length) {
            chiudi();
            for (const { el, segnaposto } of spostati) segnaposto.replaceWith(el);
            spostati = [];
        }
    }

    function apri(sezione) {
        if (aperto) return;
        aperto = true;
        primaDiAprire = document.activeElement;
        // Come le finestre di Giocatori: lo sfondo non si raggiunge né con il dito né con la tastiera
        sfondo = [...document.body.children].filter(el => el !== pannello).map(el => ({ el, inert: el.inert }));
        sfondo.forEach(({ el }) => { el.inert = true; });
        pannello.hidden = false;
        document.body.classList.add('con-pannello');
        const regole = contenuto.querySelector('.regole');
        if (sezione === 'regole' && regole) { regole.open = true; regole.scrollIntoView?.({ block: 'start' }); }
        else finestra.scrollTop = 0; // il menu riparte sempre dall'inizio, anche dopo le regole
        chiudiBtn.focus();
        document.dispatchEvent(new CustomEvent('tavola:aperta'));
    }

    function chiudi() {
        if (!aperto) return;
        aperto = false;
        pannello.hidden = true;
        document.body.classList.remove('con-pannello');
        sfondo.forEach(({ el, inert }) => { el.inert = inert; });
        sfondo = [];
        primaDiAprire?.focus?.();
        document.dispatchEvent(new CustomEvent('tavola:chiusa'));
    }

    function creaBarra(titolo) {
        const barra = crea('nav', 'barra-tavola');
        barra.setAttribute('aria-label', 'Barra del gioco');
        const casa = crea('a', 'barra-tavola__casa', '← Giochi');
        casa.setAttribute('href', document.querySelector('.link-home')?.getAttribute('href') || '../index.html');
        const nome = crea('span', 'barra-tavola__titolo', titolo);
        const regole = crea('button', 'barra-tavola__pulsante', 'Regole');
        regole.type = 'button';
        regole.addEventListener('click', () => apri('regole'));
        const menu = crea('button', 'barra-tavola__pulsante barra-tavola__menu', '⋯');
        menu.type = 'button';
        menu.setAttribute('aria-label', 'Menu: modalità, opzioni e informazioni');
        menu.addEventListener('click', () => apri('menu'));
        barra.append(casa, nome, regole, menu);
        return barra;
    }

    function creaPannello(titolo) {
        pannello = crea('div', 'pannello-tavola');
        pannello.hidden = true;
        pannello.setAttribute('role', 'dialog');
        pannello.setAttribute('aria-modal', 'true');
        pannello.setAttribute('aria-labelledby', 'pannelloTavolaTitolo');
        finestra = crea('div', 'pannello-tavola__finestra');
        const testa = crea('div', 'pannello-tavola__testa');
        const h2 = crea('h2', 'pannello-tavola__titolo', titolo);
        h2.id = 'pannelloTavolaTitolo';
        chiudiBtn = crea('button', 'pannello-tavola__chiudi', '✕');
        chiudiBtn.type = 'button';
        chiudiBtn.setAttribute('aria-label', 'Chiudi e torna al gioco');
        chiudiBtn.addEventListener('click', chiudi);
        testa.append(h2, chiudiBtn);
        contenuto = crea('div', 'pannello-tavola__contenuto');
        opzioniBox = crea('section', 'pannello-tavola__opzioni');
        opzioniBox.setAttribute('aria-label', 'Opzioni');
        opzioniBox.appendChild(crea('h3', 'pannello-tavola__sottotitolo', 'Opzioni'));
        opzioniBox.hidden = true;
        finestra.append(testa, contenuto, opzioniBox);
        pannello.appendChild(finestra);
        // Tocco sul velo fuori dalla finestra, Esc e Tab che resta dentro il pannello
        pannello.addEventListener('click', e => { if (e.target === pannello) chiudi(); });
        pannello.addEventListener('keydown', e => {
            if (e.key === 'Escape') { e.preventDefault(); chiudi(); return; }
            if (e.key !== 'Tab') return;
            const attivi = [...finestra.querySelectorAll('a[href], button, input, select, summary')].filter(x => !x.disabled && x.offsetParent !== null);
            if (!attivi.length) return;
            const primo = attivi[0], ultimo = attivi[attivi.length - 1];
            if (e.shiftKey && document.activeElement === primo) { e.preventDefault(); ultimo.focus(); }
            else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primo.focus(); }
        });
        document.body.appendChild(pannello);
    }

    // Una casella nel pannello, ricordata nel browser. suCambio viene chiamata subito con il valore attuale.
    function opzione({ chiave, etichetta, predefinito = false, suCambio }) {
        let valore = leggi(chiave, predefinito);
        if (opzioniBox) {
            const riga = crea('label', 'pannello-tavola__opzione');
            const casella = crea('input');
            casella.type = 'checkbox';
            casella.checked = valore;
            casella.addEventListener('change', () => { valore = casella.checked; salva(chiave, valore); suCambio?.(valore); });
            riga.append(casella, crea('span', '', etichetta));
            opzioniBox.appendChild(riga);
            opzioniBox.hidden = false;
        }
        suCambio?.(valore);
        return () => valore;
    }

    // Schermo intero vero: solo dove il browser lo permette (Android sì, Safari su iPhone di solito no)
    function aggiungiSchermoIntero() {
        if (!document.fullscreenEnabled || !document.documentElement.requestFullscreen) return;
        const pulsante = crea('button', 'pulsante pulsante--secondario pannello-tavola__schermo', 'Schermo intero');
        pulsante.type = 'button';
        const etichetta = () => { pulsante.textContent = document.fullscreenElement ? 'Esci dallo schermo intero' : 'Schermo intero'; };
        pulsante.addEventListener('click', () => {
            const richiesta = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
            richiesta?.catch?.(() => {});
            chiudi();
        });
        document.addEventListener('fullscreenchange', etichetta);
        opzioniBox.appendChild(pulsante);
        opzioniBox.hidden = false;
    }

    function avvia() {
        const main = document.querySelector('#contenitore_gioco');
        if (!main || pannello) return;
        const titolo = (document.title.split('|')[0] || '').trim() || 'Gioco';
        document.body.classList.add('con-tavola');
        main.prepend(creaBarra(titolo));
        creaPannello(titolo);
        aggiungiSchermoIntero();
        sistema();
        window.matchMedia?.('(min-width: 600px)').addEventListener?.('change', sistema);
    }

    return { avvia, apri, chiudi, opzione, aperto: () => aperto };
})();

// Si avvia da sola: gli script dei giochi vengono dopo e trovano già il pannello pronto per le opzioni
if (typeof document !== 'undefined' && document.querySelector) Tavola.avvia();
if (typeof module !== 'undefined') module.exports = Tavola;
