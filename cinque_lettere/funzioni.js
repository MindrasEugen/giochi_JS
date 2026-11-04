// Regole di Cinque lettere, indipendenti dalla pagina e dal vocabolario.
const CinqueLettere = (() => {
    const LUNGHEZZA = 5, TENTATIVI = 6;
    const PESI = { assente: 0, presente: 1, esatta: 2 };
    function normalizza(testo) {
        return String(testo).trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }
    function controlla(testo, vocabolario) {
        const parola = normalizza(testo);
        if (!/^[a-z]{5}$/.test(parola)) return 'Scrivi una parola di cinque lettere, senza spazi o apostrofi.';
        if (!vocabolario.has(parola)) return 'Questa parola non è nel vocabolario del gioco. Provane un’altra.';
        return '';
    }
    function colora(segreta, tentativo) {
        segreta = normalizza(segreta); tentativo = normalizza(tentativo);
        if (!/^[a-z]{5}$/.test(segreta) || !/^[a-z]{5}$/.test(tentativo)) throw new Error('Servono due parole di cinque lettere.');
        const esiti = Array(LUNGHEZZA).fill('assente');
        const rimaste = new Map();
        // Prima si assegnano tutte le posizioni esatte.
        for (let i = 0; i < LUNGHEZZA; i++) {
            if (segreta[i] === tentativo[i]) esiti[i] = 'esatta';
            else rimaste.set(segreta[i], (rimaste.get(segreta[i]) || 0) + 1);
        }
        // Ogni lettera residua può colorare una sola casella gialla.
        for (let i = 0; i < LUNGHEZZA; i++) {
            if (esiti[i] === 'esatta') continue;
            const disponibili = rimaste.get(tentativo[i]) || 0;
            if (disponibili > 0) { esiti[i] = 'presente'; rimaste.set(tentativo[i], disponibili - 1); }
        }
        return esiti;
    }
    function crea(segreta, vocabolario) {
        const errore = controlla(segreta, vocabolario);
        if (errore) throw new Error(errore);
        return { segreta: normalizza(segreta), tentativi: [], tastiera: {}, finita: false, vinta: false };
    }
    function tenta(s, testo, vocabolario) {
        if (s.finita) return { errore: 'La partita è finita. Inizia una nuova partita.' };
        const parola = normalizza(testo), errore = controlla(parola, vocabolario);
        if (errore) return { errore };
        if (s.tentativi.some(t => t.parola === parola)) return { errore: 'Hai già provato questa parola: scegli un altro tentativo.' };
        const esiti = colora(s.segreta, parola);
        s.tentativi.push({ parola, esiti });
        for (let i = 0; i < LUNGHEZZA; i++) {
            const precedente = s.tastiera[parola[i]];
            if (precedente === undefined || PESI[esiti[i]] > PESI[precedente]) s.tastiera[parola[i]] = esiti[i];
        }
        s.vinta = parola === s.segreta;
        s.finita = s.vinta || s.tentativi.length === TENTATIVI;
        return { esiti };
    }
    function creaSfida() { return { turno: 0, risultati: [null, null], finita: false }; }
    function registra(sfida, partita) {
        const indovina = 1 - sfida.turno;
        if (sfida.finita || !partita.finita || sfida.risultati[indovina] !== null) return false;
        sfida.risultati[indovina] = partita.vinta ? partita.tentativi.length : TENTATIVI + 1;
        if (sfida.turno === 0) sfida.turno = 1; else sfida.finita = true;
        return true;
    }
    function vincitore(sfida) {
        if (!sfida.finita || sfida.risultati[0] === sfida.risultati[1]) return null;
        return sfida.risultati[0] < sfida.risultati[1] ? 0 : 1;
    }
    return { LUNGHEZZA, TENTATIVI, PESI, normalizza, controlla, colora, crea, tenta, creaSfida, registra, vincitore };
})();
if (typeof module !== 'undefined') module.exports = CinqueLettere;
