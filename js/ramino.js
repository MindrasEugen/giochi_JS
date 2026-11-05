// Partita a due di Scala 40 o Ramino (stesso motore, regole diverse). Si prova con: node js/test-ramino.js
// Turno: 'pesca' (dal tallone, o lo scarto se si può usare subito) -> 'gioca' (calare, attaccare) -> scarto.
// Chi non ha ancora aperto prepara le combinazioni a parte e apre solo se arriva alla soglia (40 o 50 punti).
const Ramino = (() => {
    const M = typeof module !== 'undefined' ? require('./mazzo') : Mazzo;
    const C = typeof module !== 'undefined' ? require('./combinazioni') : Combinazioni;
    const VARIANTI = {
        // Scala 40: 13 carte, apertura 40, lo scarto si prende solo dopo aver aperto; non si scarta una carta che attacca
        scala40: { carte: 13, soglia: 40, uscita: 101, pozzoPrimaDiAprire: false, vietaScartoCheAttacca: true, chiusuraInMano: true, arrotonda: false },
        // Ramino: apertura 50, lo scarto si prende anche per aprire; punti arrotondati alla decina.
        // 13 carte (variante citata da Wikipedia): con 8 carte e apertura a 50 spesso nessuno riesce ad aprire
        ramino: { carte: 13, soglia: 50, uscita: 200, pozzoPrimaDiAprire: true, vietaScartoCheAttacca: false, chiusuraInMano: false, arrotonda: true }
    };
    const R = C.REGOLE_SCALA40;
    function crea(variante = 'scala40', casuale = Math.random) {
        const s = { variante, regole: VARIANTI[variante], casuale, punti: [0, 0], numeroMano: 0, primo: 1, finita: false, vincitore: null };
        nuovaMano(s);
        return s;
    }
    function nuovaMano(s) {
        s.numeroMano++; s.primo = 1 - s.primo;
        s.tallone = M.mescola(C.mazzo(), s.casuale);
        s.mani = [s.tallone.splice(0, s.regole.carte), s.tallone.splice(0, s.regole.carte)];
        // La prima carta del pozzo non può essere un jolly
        const prima = s.tallone.findIndex(c => !c.jolly);
        s.pozzo = s.tallone.splice(prima, 1);
        s.tavolo = []; s.prossimoId = 1; s.aperto = [false, false]; s.preparazione = [];
        s.turno = s.primo; s.fase = 'pesca'; s.obbligo = null; s.esito = null; s.ultimo = null; s.errore = ''; s.rimescolate = 0;
    }
    const errore = (s, testo) => { s.errore = testo; return false; };
    const mano = s => s.mani[s.turno];
    const preparate = s => s.preparazione.flatMap(p => p.carte);
    const puntiPreparazione = s => s.preparazione.reduce((n, p) => n + C.puntiCombinazione(p.analisi), 0);
    function trova(s, ids) { const carte = ids.map(id => mano(s).find(c => c.id === id)); return carte.every(Boolean) ? carte : null; }
    const togli = (s, carte) => { s.mani[s.turno] = mano(s).filter(c => !carte.includes(c)); };
    // La carta si può usare subito? Attaccata al tavolo (se si è aperto) o in una combinazione con le carte in mano
    function usabile(s, carta, g = s.turno) {
        if (s.aperto[g] && s.tavolo.some(t => C.attacca(t, carta))) return true;
        const conCarta = [...s.mani[g], carta];
        if (s.aperto[g]) return C.candidate(conCarta, R).some(k => k.carte.includes(carta));
        // Chi non ha aperto (solo nel Ramino) deve poterci aprire
        const m = C.migliori(conCarta, R, carta);
        return m.punti >= s.regole.soglia && m.carte < conCarta.length;
    }
    function puoPrendereScarto(s) {
        const carta = s.pozzo.at(-1);
        if (!carta || (!s.aperto[s.turno] && !s.regole.pozzoPrimaDiAprire)) return false;
        return usabile(s, carta);
    }
    function rifaiTallone(s) {
        const sopra = s.pozzo.pop();
        s.tallone = M.mescola(s.pozzo, s.casuale); s.pozzo = [sopra];
    }
    function pesca(s, daScarto) {
        if (s.fase !== 'pesca' || s.finita) return errore(s, 'Non è il momento di pescare.');
        if (daScarto) {
            if (!puoPrendereScarto(s)) return errore(s, s.aperto[s.turno] || s.regole.pozzoPrimaDiAprire ? 'Puoi prendere lo scarto solo se lo usi subito.' : 'Lo scarto si prende solo dopo aver aperto.');
            const carta = s.pozzo.pop(); mano(s).push(carta); s.obbligo = carta.id;
            s.ultimo = { tipo: 'scarto', giocatore: s.turno, carta };
        } else {
            if (!s.tallone.length) {
                // Sicurezza contro le mani senza fine: al terzo esaurimento del tallone la mano si chiude
                if (s.rimescolate >= 2) { chiudiMano(s, null); return true; }
                rifaiTallone(s); s.rimescolate++;
            }
            const carta = s.tallone.shift(); mano(s).push(carta);
            s.ultimo = { tipo: 'tallone', giocatore: s.turno };
        }
        s.fase = 'gioca'; s.errore = '';
        return true;
    }
    function controllaObbligo(s) { if (s.obbligo !== null && !mano(s).some(c => c.id === s.obbligo)) s.obbligo = null; }
    // Calare una combinazione: subito sul tavolo se si è aperto, altrimenti in preparazione
    function cala(s, ids) {
        if (s.fase !== 'gioca') return errore(s, 'Prima devi pescare.');
        const carte = trova(s, ids);
        if (!carte) return errore(s, 'Carte non valide.');
        const analisi = C.analizza(carte, R);
        if (!analisi) return errore(s, 'Queste carte non formano una scala o un tris validi (al massimo un jolly).');
        if (s.aperto[s.turno]) {
            if (mano(s).length - carte.length < 1) return errore(s, 'Devi tenere almeno una carta da scartare.');
            togli(s, carte); s.tavolo.push({ id: s.prossimoId++, giocatore: s.turno, ...analisi });
            s.ultimo = { tipo: 'cala', giocatore: s.turno, analisi };
        } else { togli(s, carte); s.preparazione.push({ carte, analisi }); }
        controllaObbligo(s); s.errore = '';
        return true;
    }
    function annulla(s) {
        if (!s.preparazione.length) return false;
        mano(s).push(...preparate(s)); s.preparazione = [];
        return true;
    }
    // Aprire: le combinazioni preparate valgono almeno la soglia (o si chiude in mano con tutte le carte)
    function apri(s) {
        if (s.fase !== 'gioca' || s.aperto[s.turno] || !s.preparazione.length) return errore(s, 'Niente da aprire.');
        const punti = puntiPreparazione(s), restano = mano(s).length;
        const inMano = s.regole.chiusuraInMano && restano <= 1;
        if (punti < s.regole.soglia && !inMano) return errore(s, `Per aprire servono almeno ${s.regole.soglia} punti: ne hai ${punti}.`);
        if (restano < 1 && !inMano) return errore(s, 'Devi tenere almeno una carta da scartare.');
        for (const p of s.preparazione) s.tavolo.push({ id: s.prossimoId++, giocatore: s.turno, ...p.analisi });
        s.ultimo = { tipo: 'apre', giocatore: s.turno, punti, combinazioni: s.preparazione.length };
        s.preparazione = []; s.aperto[s.turno] = true; s.errore = '';
        if (!mano(s).length) chiudiMano(s, s.turno);
        return true;
    }
    function attaccaCarta(s, id, combinazioneId) {
        if (s.fase !== 'gioca') return errore(s, 'Prima devi pescare.');
        if (!s.aperto[s.turno]) return errore(s, 'Puoi attaccare solo dopo aver aperto.');
        const [carta] = trova(s, [id]) || [], tavolo = s.tavolo.find(t => t.id === combinazioneId);
        if (!carta || !tavolo) return errore(s, 'Carta o combinazione non valida.');
        if (mano(s).length < 2) return errore(s, 'Devi tenere almeno una carta da scartare.');
        const nuova = C.attacca(tavolo, carta, R);
        if (!nuova) return errore(s, 'La carta non si attacca a questa combinazione.');
        togli(s, [carta]); Object.assign(tavolo, nuova);
        s.ultimo = { tipo: 'attacca', giocatore: s.turno, carta }; controllaObbligo(s); s.errore = '';
        return true;
    }
    const attaccabile = (s, carta) => s.tavolo.some(t => C.attacca(t, carta, R));
    function scarta(s, id) {
        if (s.fase !== 'gioca') return errore(s, 'Prima devi pescare.');
        if (s.preparazione.length) return errore(s, 'Prima apri oppure annulla le combinazioni preparate.');
        if (s.obbligo !== null) return errore(s, 'Devi usare la carta presa dagli scarti.');
        const [carta] = trova(s, [id]) || [];
        if (!carta) return errore(s, 'Carta non valida.');
        if (s.regole.vietaScartoCheAttacca && s.aperto[s.turno] && mano(s).length > 1 && attaccabile(s, carta)) return errore(s, 'Non puoi scartare una carta che si attacca al tavolo.');
        togli(s, [carta]); s.pozzo.push(carta);
        s.ultimo = { tipo: 'scarta', giocatore: s.turno, carta }; s.errore = '';
        if (!mano(s).length) { chiudiMano(s, s.turno); return true; }
        s.turno = 1 - s.turno; s.fase = 'pesca';
        return true;
    }
    // Fine mano: chi resta con carte paga il loro valore (nel Ramino arrotondato alla decina)
    function valoreMano(s, carte) {
        const somma = carte.reduce((n, c) => n + C.puntiInMano(c), 0);
        if (!s.regole.arrotonda) return somma;
        if (carte.length <= 2 && carte.every(c => !c.jolly && c.numero !== 1 && c.numero < 4)) return 0;
        return Math.round(somma / 10) * 10;
    }
    // chi = null: mano chiusa per esaurimento del tallone, pagano entrambi
    function chiudiMano(s, chi) {
        if (s.preparazione.length) annulla(s);
        const pagati = [0, 1].map(g => g === chi ? 0 : valoreMano(s, s.mani[g]));
        pagati.forEach((p, g) => { s.punti[g] += p; });
        s.esito = { chiude: chi, pagati, carte: s.mani.map(m => [...m]) };
        s.fase = 'fineMano';
        if (s.punti.some(p => p >= s.regole.uscita)) { s.finita = true; s.vincitore = s.punti[0] < s.punti[1] ? 0 : 1; }
    }
    function prossimaMano(s) { if (s.fase !== 'fineMano' || s.finita) return false; nuovaMano(s); return true; }
    // Il PC: pesca lo scarto se gli serve, apre appena può, cala e attacca tenendo una carta, scarta la meno utile
    function turnoPC(s) {
        const io = s.turno, azioni = [];
        if (s.fase === 'pesca') { const daScarto = puoPrendereScarto(s); pesca(s, daScarto); azioni.push(daScarto ? 'scarto' : 'tallone'); }
        if (s.fase !== 'gioca') return azioni; // mano chiusa per esaurimento del tallone
        const obbligo = s.obbligo !== null ? mano(s).find(c => c.id === s.obbligo) : null;
        if (!s.aperto[io]) {
            const m = C.migliori(mano(s), R, obbligo);
            const tutte = m.carte === mano(s).length && s.regole.chiusuraInMano;
            if ((m.punti >= s.regole.soglia && m.carte < mano(s).length) || tutte) {
                for (const k of m.combinazioni) cala(s, k.carte.map(c => c.id));
                if (apri(s)) azioni.push('apre');
                else annulla(s);
            }
        }
        if (s.fase === 'gioca' && s.aperto[io]) {
            // Cala tutto quello che può, tenendo almeno una carta
            let m = C.migliori(mano(s), R, s.obbligo !== null ? mano(s).find(c => c.id === s.obbligo) : null);
            for (const k of m.combinazioni) if (mano(s).length - k.carte.length >= 1) cala(s, k.carte.map(c => c.id));
            let attaccato = true;
            while (attaccato && mano(s).length > 1) {
                attaccato = false;
                for (const carta of [...mano(s)]) {
                    const t = s.tavolo.find(x => C.attacca(x, carta, R));
                    if (t && mano(s).length > 1 && attaccaCarta(s, carta.id, t.id)) { attaccato = true; break; }
                }
            }
        }
        if (s.fase === 'gioca') {
            if (s.obbligo !== null) {
                // Ultima possibilità per usare la carta presa: attaccarla
                const carta = mano(s).find(c => c.id === s.obbligo), t = carta && s.tavolo.find(x => C.attacca(x, carta, R));
                if (t) attaccaCarta(s, carta.id, t.id);
                s.obbligo = null; // sicurezza: non succede se usabile() era vero
            }
            scarta(s, sceltaScarto(s).id);
        }
        return azioni;
    }
    // Carta meno utile: niente jolly, non vicina ad altre carte (stesso valore o scala), di valore alto
    function sceltaScarto(s) {
        const carte = mano(s), vietata = c => s.regole.vietaScartoCheAttacca && s.aperto[s.turno] && carte.length > 1 && attaccabile(s, c);
        const utilita = c => {
            // Il jolly si tiene, tranne quando resta quasi da solo e non si può più attaccare
            if (c.jolly) return carte.length <= 2 && !attaccabile(s, c) ? -1000 : 1000;
            let u = 0;
            for (const x of carte) if (x !== c && !x.jolly) {
                if (x.numero === c.numero && x.seme !== c.seme) u += 10;
                if (x.seme === c.seme && Math.abs(x.numero - c.numero) <= 2) u += 8;
            }
            return u - C.puntiInMano(c) / 2;
        };
        const ammesse = carte.filter(c => !vietata(c));
        return [...(ammesse.length ? ammesse : carte)].sort((a, b) => utilita(a) - utilita(b))[0];
    }
    return { VARIANTI, crea, pesca, puoPrendereScarto, cala, annulla, apri, attaccaCarta, scarta, prossimaMano, turnoPC, valoreMano, puntiPreparazione, usabile };
})();
if (typeof module !== 'undefined') module.exports = Ramino;
