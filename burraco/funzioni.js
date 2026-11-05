// Burraco a due giocatori: due mazzi con 4 jolly, 11 carte a testa e un pozzetto da 11 per giocatore.
// Matte: il jolly e la pinella (il 2), al massimo una per combinazione; la pinella al suo posto in scala è una carta normale.
// Turno: 'pesca' (dal tallone o tutti gli scarti) -> 'gioca' (calare, attaccare alle proprie combinazioni) -> scarto.
// Si prova con: node burraco/test-burraco.js
const Burraco = (() => {
    const M = typeof module !== 'undefined' ? require('../js/mazzo') : Mazzo;
    const C = typeof module !== 'undefined' ? require('../js/combinazioni') : Combinazioni;
    const REGOLE = { matta: c => !!c.jolly || c.numero === 2, forseNaturale: c => !c.jolly && c.numero === 2, maxMatte: 1, trisSemiDiversi: false, trisMax: 99, vietaTrisDi: [2] };
    const USCITA = 1005, CHIUSURA = 100, PULITO = 200, SPORCO = 100, POZZETTO = 100;
    const valore = c => c.jolly ? 30 : c.numero === 2 ? 20 : c.numero === 1 ? 15 : c.numero >= 8 ? 10 : 5;
    const matta = (t, x) => x.matta; // carta usata come matta in una combinazione analizzata
    // Burraco: almeno 7 carte; pulito se nessuna carta fa da matta
    function burraco(t) { return t.carte.length >= 7 ? (t.carte.some(x => matta(t, x)) ? 'sporco' : 'pulito') : null; }
    function crea(casuale = Math.random) {
        const s = { casuale, punti: [0, 0], numeroMano: 0, primo: 1, finita: false, vincitore: null };
        nuovaMano(s);
        return s;
    }
    function nuovaMano(s) {
        s.numeroMano++; s.primo = 1 - s.primo;
        const mazzo = M.mescola(C.mazzo(), s.casuale);
        s.pozzetti = [mazzo.splice(0, 11), mazzo.splice(0, 11)];
        s.mani = [mazzo.splice(0, 11), mazzo.splice(0, 11)];
        s.scarti = mazzo.splice(0, 1); s.tallone = mazzo;
        s.tavolo = [[], []]; s.prossimoId = 1; s.pozzettoPreso = [false, false]; s.pozzettoDaGiocare = [false, false];
        s.senzaTallone = 0;
        s.turno = s.primo; s.fase = 'pesca'; s.vietato = null; s.esito = null; s.ultimo = null; s.errore = '';
    }
    const errore = (s, testo) => { s.errore = testo; return false; };
    const mano = s => s.mani[s.turno];
    function trova(s, ids) { const carte = ids.map(id => mano(s).find(c => c.id === id)); return carte.every(Boolean) ? carte : null; }
    const togli = (s, carte) => { s.mani[s.turno] = mano(s).filter(c => !carte.includes(c)); };
    function pesca(s, scarti) {
        if (s.fase !== 'pesca' || s.finita) return errore(s, 'Non è il momento di pescare.');
        if (scarti) {
            if (!s.scarti.length) return errore(s, 'Non ci sono scarti.');
            const presi = s.scarti.splice(0); mano(s).push(...presi);
            // Chi raccoglie un solo scarto non può riscartare la stessa carta
            s.vietato = presi.length === 1 ? presi[0].id : null;
            s.ultimo = { tipo: 'scarti', giocatore: s.turno, quante: presi.length }; s.senzaTallone++;
        } else {
            mano(s).push(s.tallone.shift()); s.vietato = null; s.senzaTallone = 0;
            s.ultimo = { tipo: 'tallone', giocatore: s.turno };
        }
        s.fase = 'gioca'; s.errore = '';
        return true;
    }
    // Rimasti senza carte giocando: si prende il pozzetto e si continua (se non è già stato preso serve almeno una carta da scartare)
    function dopoGiocata(s) {
        if (mano(s).length) return;
        s.mani[s.turno] = s.pozzetti[s.turno]; s.pozzetti[s.turno] = []; s.pozzettoPreso[s.turno] = true;
        s.ultimo = { ...s.ultimo, pozzetto: 'in diretta' };
    }
    // Dopo aver preso il pozzetto bisogna tenere almeno una carta normale per lo scarto finale (jolly e pinelle non chiudono)
    // e, se dopo la giocata non c'è ancora un burraco, almeno due carte (una sola non si potrebbe scartare senza chiudere)
    function puoSvuotare(s, carte, dimensioneDopo = 0) {
        if (!s.pozzettoPreso[s.turno]) return true;
        const restano = mano(s).filter(c => !carte.includes(c));
        const burracoDopo = haBurraco(s, s.turno) || dimensioneDopo >= 7;
        return restano.some(c => !REGOLE.matta(c)) && (burracoDopo || restano.length >= 2);
    }
    function cala(s, ids) {
        if (s.fase !== 'gioca') return errore(s, 'Prima devi pescare.');
        const carte = trova(s, ids);
        if (!carte) return errore(s, 'Carte non valide.');
        const analisi = C.analizza(carte, REGOLE);
        if (!analisi) return errore(s, 'Serve una scala dello stesso seme o un gruppo di carte uguali, con al massimo una matta (jolly o pinella).');
        if (!puoSvuotare(s, carte, carte.length)) return errore(s, 'Hai già preso il pozzetto: tieni almeno una carta (non jolly né pinella) da scartare.');
        togli(s, carte); s.tavolo[s.turno].push({ id: s.prossimoId++, ...analisi });
        s.ultimo = { tipo: 'cala', giocatore: s.turno, analisi }; s.errore = '';
        dopoGiocata(s);
        return true;
    }
    function attacca(s, id, combinazioneId) {
        if (s.fase !== 'gioca') return errore(s, 'Prima devi pescare.');
        const [carta] = trova(s, [id]) || [], t = s.tavolo[s.turno].find(x => x.id === combinazioneId);
        if (!carta || !t) return errore(s, 'Si attacca solo alle proprie combinazioni.');
        const nuova = C.attacca(t, carta, REGOLE);
        if (!nuova) return errore(s, 'La carta non si attacca a questa combinazione.');
        if (!puoSvuotare(s, [carta], nuova.carte.length)) return errore(s, 'Hai già preso il pozzetto: tieni almeno una carta (non jolly né pinella) da scartare.');
        togli(s, [carta]); Object.assign(t, nuova);
        s.ultimo = { tipo: 'attacca', giocatore: s.turno, carta }; s.errore = '';
        dopoGiocata(s);
        return true;
    }
    const haBurraco = (s, g) => s.tavolo[g].some(t => burraco(t));
    const puoChiudere = (s, g = s.turno) => s.pozzettoPreso[g] && haBurraco(s, g);
    function scarta(s, id) {
        if (s.fase !== 'gioca') return errore(s, 'Prima devi pescare.');
        const [carta] = trova(s, [id]) || [];
        if (!carta) return errore(s, 'Carta non valida.');
        if (carta.id === s.vietato && mano(s).length > 1) return errore(s, 'Non puoi riscartare l’unica carta raccolta dagli scarti.');
        const ultima = mano(s).length === 1;
        if (ultima && s.pozzettoPreso[s.turno] && !puoChiudere(s)) return errore(s, 'Per chiudere serve almeno un burraco (7 carte): tieni la carta.');
        if (ultima && puoChiudere(s) && REGOLE.matta(carta)) return errore(s, 'Non si chiude scartando un jolly o una pinella.');
        togli(s, [carta]); s.scarti.push(carta);
        s.ultimo = { tipo: 'scarta', giocatore: s.turno, carta }; s.errore = '';
        if (!mano(s).length) {
            if (puoChiudere(s)) { chiudiMano(s, s.turno); return true; }
            // Pozzetto preso con lo scarto: si gioca dal turno successivo
            s.mani[s.turno] = s.pozzetti[s.turno]; s.pozzetti[s.turno] = []; s.pozzettoPreso[s.turno] = true;
            s.ultimo.pozzetto = 'con lo scarto';
        }
        // Restano due carte nel tallone (o da 10 turni nessuno pesca dal tallone): la mano finisce senza chiusura
        if (s.tallone.length <= 2 || s.senzaTallone >= 10) { chiudiMano(s, null); return true; }
        s.turno = 1 - s.turno; s.fase = 'pesca';
        return true;
    }
    // Punti di un giocatore nella mano
    function conta(s, g, chi) {
        const combinazioni = s.tavolo[g].reduce((n, t) => n + t.carte.reduce((k, x) => k + valore(x.carta), 0), 0);
        const pulti = s.tavolo[g].filter(t => burraco(t) === 'pulito').length, sporchi = s.tavolo[g].filter(t => burraco(t) === 'sporco').length;
        const inMano = s.mani[g].reduce((n, c) => n + valore(c), 0);
        const dettaglio = { combinazioni, puliti: pulti * PULITO, sporchi: sporchi * SPORCO, chiusura: chi === g ? CHIUSURA : 0,
            mano: -inMano, pozzetto: s.pozzettoPreso[g] ? 0 : -POZZETTO };
        return { totale: Object.values(dettaglio).reduce((a, b) => a + b, 0), dettaglio };
    }
    function chiudiMano(s, chi) {
        const conti = [0, 1].map(g => conta(s, g, chi));
        conti.forEach((k, g) => { s.punti[g] += k.totale; });
        s.esito = { chiude: chi, conti };
        s.fase = 'fineMano';
        if (s.punti.some(p => p >= USCITA) && s.punti[0] !== s.punti[1]) { s.finita = true; s.vincitore = s.punti[0] > s.punti[1] ? 0 : 1; }
    }
    function prossimaMano(s) { if (s.fase !== 'fineMano' || s.finita) return false; nuovaMano(s); return true; }
    // Il PC: raccoglie gli scarti se la carta in cima gli serve, cala e attacca, chiude appena può, scarta la carta meno utile
    function utile(s, carta, g) {
        if (s.tavolo[g].some(t => C.attacca(t, carta, REGOLE))) return true;
        return C.candidate([...s.mani[g], carta], REGOLE).some(k => k.carte.includes(carta) && k.carte.filter(x => !REGOLE.matta(x)).length >= 2 && !k.carte.some(x => x.jolly));
    }
    function turnoPC(s) {
        const io = s.turno;
        // Un monte di una sola carta si prende solo con abbastanza carte in mano per usarla davvero
        const monte = s.scarti.length > 0 && utile(s, s.scarti.at(-1), io) && (s.scarti.length > 1 || mano(s).length >= 4);
        if (s.fase === 'pesca') pesca(s, monte);
        let continua = true;
        while (continua && s.fase === 'gioca' && s.turno === io) {
            continua = false;
            // Attacca prima alle proprie combinazioni
            for (const carta of [...mano(s)]) {
                if (REGOLE.matta(carta) && !s.tavolo[io].some(t => t.carte.length >= 6)) continue; // le matte si tengono per i burraco
                const t = s.tavolo[io].find(x => C.attacca(x, carta, REGOLE));
                if (t && puoSvuotare(s, [carta], t.carte.length + 1) && attacca(s, carta.id, t.id)) { continua = true; break; }
            }
            if (continua) continue;
            const m = C.migliori(mano(s), REGOLE);
            for (const k of m.combinazioni) if (mano(s).some(c => c.id === k.carte[0].id) && puoSvuotare(s, k.carte, k.carte.length) && cala(s, k.carte.map(c => c.id))) { continua = true; break; }
        }
        if (s.fase === 'gioca' && s.turno === io) scarta(s, sceltaScarto(s).id);
        // Se lo scarto scelto non era ammesso, prova le altre carte
        for (const c of [...(s.fase === 'gioca' && s.turno === io ? mano(s) : [])]) if (scarta(s, c.id)) break;
    }
    function sceltaScarto(s) {
        const carte = mano(s), io = s.turno, chiude = carte.length === 1;
        const utilita = c => {
            if (REGOLE.matta(c)) return chiude ? -1 : 1000;
            if (c.id === s.vietato) return 900;
            let u = s.tavolo[io].some(t => C.attacca(t, c, REGOLE)) ? 500 : 0;
            for (const x of carte) if (x !== c && !REGOLE.matta(x)) {
                if (x.numero === c.numero) u += 12;
                if (x.seme === c.seme && Math.abs(x.numero - c.numero) <= 2) u += 8;
            }
            return u - valore(c) / 5;
        };
        return [...carte].sort((a, b) => utilita(a) - utilita(b))[0];
    }
    return { REGOLE, USCITA, valore, burraco, crea, pesca, cala, attacca, scarta, puoChiudere, prossimaMano, conta, turnoPC };
})();
if (typeof module !== 'undefined') module.exports = Burraco;
