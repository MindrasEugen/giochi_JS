// Logica del Campo minato, senza pagina (si prova con: node campo_minato/test-campo-minato.js).
// Lo stato è un oggetto { righe, colonne, mine, celle, minePiazzate, finita, vinta, aperte }.
// Ogni cella è { mina, vicine, aperta, bandiera }; l'indice di una cella è riga * colonne + colonna.

const LIVELLI = {
    facile: { righe: 9, colonne: 9, mine: 10 },
    medio: { righe: 16, colonne: 16, mine: 40 },
    difficile: { righe: 16, colonne: 24, mine: 75 }
};

function crea(righe, colonne, mine) {
    const celle = [];
    for (let i = 0; i < righe * colonne; i++) {
        celle.push({ mina: false, vicine: 0, aperta: false, bandiera: false });
    }
    return { righe, colonne, mine, celle, minePiazzate: false, finita: false, vinta: false, aperte: 0 };
}

// Indici delle (fino a 8) celle intorno alla cella i
function vicini(stato, i) {
    const riga = Math.floor(i / stato.colonne);
    const colonna = i % stato.colonne;
    const lista = [];
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            const r = riga + dr;
            const c = colonna + dc;
            if ((dr !== 0 || dc !== 0) && r >= 0 && r < stato.righe && c >= 0 && c < stato.colonne) {
                lista.push(r * stato.colonne + c);
            }
        }
    }
    return lista;
}

// Le mine si piazzano solo al primo clic, lontano dalla cella scelta e dalle sue vicine,
// così la prima apertura è sempre sicura e mostra uno spazio vuoto
function piazzaMine(stato, primaCella, casuale = Math.random) {
    const protette = new Set([primaCella, ...vicini(stato, primaCella)]);
    let candidate = stato.celle.map((_, i) => i).filter(i => !protette.has(i));
    // sui campi molto pieni potrebbero non bastare: allora si protegge solo la prima cella
    if (candidate.length < stato.mine) {
        candidate = stato.celle.map((_, i) => i).filter(i => i !== primaCella);
    }
    for (let k = 0; k < stato.mine; k++) {
        const j = k + Math.floor(casuale() * (candidate.length - k));
        [candidate[k], candidate[j]] = [candidate[j], candidate[k]];
        stato.celle[candidate[k]].mina = true;
    }
    stato.celle.forEach((cella, i) => {
        cella.vicine = vicini(stato, i).filter(v => stato.celle[v].mina).length;
    });
    stato.minePiazzate = true;
}

function controllaVittoria(stato) {
    if (!stato.finita && stato.aperte === stato.celle.length - stato.mine) {
        stato.finita = true;
        stato.vinta = true;
        // a fine partita le mine rimaste vengono segnate con la bandiera
        stato.celle.forEach(c => { if (c.mina) c.bandiera = true; });
    }
}

// Apre una cella. Restituisce l'elenco delle celle aperte (vuoto se non è successo niente).
// Se la cella non ha mine intorno si aprono anche le vicine, a cascata (visita in ampiezza).
function apri(stato, i, casuale = Math.random) {
    if (stato.finita) {
        return [];
    }
    if (!stato.minePiazzate) {
        piazzaMine(stato, i, casuale);
    }
    const partenza = stato.celle[i];
    if (partenza.aperta || partenza.bandiera) {
        return [];
    }
    if (partenza.mina) {
        partenza.aperta = true;
        partenza.esplosa = true;
        stato.finita = true;
        stato.vinta = false;
        return [i];
    }
    const aperte = [];
    const coda = [i];
    while (coda.length > 0) {
        const corrente = coda.shift();
        const cella = stato.celle[corrente];
        if (cella.aperta || cella.bandiera || cella.mina) {
            continue;
        }
        cella.aperta = true;
        stato.aperte++;
        aperte.push(corrente);
        if (cella.vicine === 0) {
            coda.push(...vicini(stato, corrente));
        }
    }
    controllaVittoria(stato);
    return aperte;
}

// Apertura rapida: su un numero già aperto con tante bandiere intorno quante sono le mine,
// si aprono tutte le vicine senza bandiera (se una bandiera è sbagliata, si esplode)
function apriIntorno(stato, i) {
    const cella = stato.celle[i];
    if (stato.finita || !cella.aperta || cella.vicine === 0) {
        return [];
    }
    const intorno = vicini(stato, i);
    const bandiere = intorno.filter(v => stato.celle[v].bandiera).length;
    if (bandiere !== cella.vicine) {
        return [];
    }
    const aperte = [];
    for (const v of intorno) {
        aperte.push(...apri(stato, v));
        if (stato.finita) {
            break;
        }
    }
    return aperte;
}

// Mette o toglie la bandiera; restituisce true se è cambiato qualcosa
function bandiera(stato, i) {
    const cella = stato.celle[i];
    if (stato.finita || cella.aperta) {
        return false;
    }
    cella.bandiera = !cella.bandiera;
    return true;
}

function bandiereMesse(stato) {
    return stato.celle.filter(c => c.bandiera).length;
}

if (typeof module !== 'undefined') {
    module.exports = { LIVELLI, crea, vicini, piazzaMine, apri, apriIntorno, bandiera, bandiereMesse };
}
