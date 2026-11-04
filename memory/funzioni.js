// Logica del Memory, senza pagina (si prova con: node memory/test-memory.js).
// Lo stato della partita è un oggetto:
// { carte: [{ simbolo, scoperta, trovata }], scelte: [indici scoperti nel turno], mosse, coppieTrovate }

const SIMBOLI = ['🍎', '🚀', '🐙', '🌵', '🎸', '🦊', '⚽', '🍕', '🌈', '🐢', '🎲', '🔑'];

// Formati della griglia: colonne × righe e numero di coppie
const FORMATI = {
    piccola: { colonne: 4, righe: 3, coppie: 6 },
    media: { colonne: 4, righe: 4, coppie: 8 },
    grande: { colonne: 4, righe: 6, coppie: 12 }
};

// Mescolamento di Fisher-Yates (come in js/mazzo.js)
function mescola(elementi, casuale = Math.random) {
    const copia = [...elementi];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(casuale() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

function nuovaPartita(coppie, casuale = Math.random) {
    const simboli = SIMBOLI.slice(0, coppie);
    const carte = mescola([...simboli, ...simboli], casuale).map(simbolo => ({ simbolo, scoperta: false, trovata: false }));
    return { carte, scelte: [], mosse: 0, coppieTrovate: 0 };
}

// Scopre una carta e dice cosa è successo:
// - 'ignorata': carta già scoperta o già trovata, oppure ci sono già due carte scoperte da coprire
// - 'prima': prima carta del turno
// - 'coppia': seconda carta uguale alla prima (le due restano scoperte)
// - 'diversa': seconda carta diversa (vanno coperte con copriDiverse)
function scopri(stato, i) {
    const carta = stato.carte[i];
    if (!carta || carta.scoperta || carta.trovata || stato.scelte.length === 2) {
        return 'ignorata';
    }
    carta.scoperta = true;
    stato.scelte.push(i);
    if (stato.scelte.length === 1) {
        return 'prima';
    }
    stato.mosse++;
    const [a, b] = stato.scelte;
    if (stato.carte[a].simbolo === stato.carte[b].simbolo) {
        stato.carte[a].trovata = true;
        stato.carte[b].trovata = true;
        stato.coppieTrovate++;
        stato.scelte = [];
        return 'coppia';
    }
    return 'diversa';
}

// Copre le due carte diverse del turno
function copriDiverse(stato) {
    for (const i of stato.scelte) {
        stato.carte[i].scoperta = false;
    }
    stato.scelte = [];
}

function finita(stato) {
    return stato.coppieTrovate === stato.carte.length / 2;
}

if (typeof module !== 'undefined') {
    module.exports = { SIMBOLI, FORMATI, mescola, nuovaPartita, scopri, copriDiverse, finita };
}
