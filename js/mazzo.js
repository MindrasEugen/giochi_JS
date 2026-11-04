// Mazzi di carte condivisi da tutti i giochi di carte.
// Una carta è un oggetto { tipo, seme, valore, numero }:
// - tipo: 'italiano' o 'francese'
// - seme e valore: come nel nome del file dell'immagine in carte/ (es. 'coppe' e 'asso', 'hearts' e 'q')
// - numero: posizione della carta nel seme (asso = 1 ... re = 10 nell'italiano, asso = 1 ... re = 13 nel francese)
// Queste funzioni non toccano la pagina: si possono provare con Node (node js/test-mazzo.js).

const Mazzo = (() => {
    const SEMI_ITALIANI = ['bastoni', 'coppe', 'denari', 'spade'];
    const VALORI_ITALIANI = ['asso', '2', '3', '4', '5', '6', '7', 'fante', 'cavallo', 're'];
    const SEMI_FRANCESI = ['clubs', 'diamonds', 'hearts', 'spades'];
    const VALORI_FRANCESI = ['a', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k'];

    // Nomi in italiano, per i testi e per l'alt delle immagini
    const NOMI_SEMI_FRANCESI = { clubs: 'fiori', diamonds: 'quadri', hearts: 'cuori', spades: 'picche' };
    const NOMI_VALORI_FRANCESI = { a: 'asso', j: 'fante', q: 'donna', k: 're' };

    function crea(tipo, semi, valori) {
        const carte = [];
        for (let s = 0; s < semi.length; s++) {
            for (let v = 0; v < valori.length; v++) {
                carte.push({ tipo, seme: semi[s], valore: valori[v], numero: v + 1 });
            }
        }
        return carte;
    }

    // 40 carte: 4 semi × 10 valori
    function italiano() {
        return crea('italiano', SEMI_ITALIANI, VALORI_ITALIANI);
    }

    // 52 carte: 4 semi × 13 valori
    function francese() {
        return crea('francese', SEMI_FRANCESI, VALORI_FRANCESI);
    }

    // Mescolamento di Fisher-Yates: ogni ordine ha la stessa probabilità.
    // Restituisce un nuovo array; quello passato non cambia.
    // "casuale" si può sostituire nei test con una funzione ripetibile.
    function mescola(carte, casuale = Math.random) {
        const copia = [...carte];
        for (let i = copia.length - 1; i > 0; i--) {
            const j = Math.floor(casuale() * (i + 1));
            [copia[i], copia[j]] = [copia[j], copia[i]];
        }
        return copia;
    }

    // Toglie le prime "quante" carte dal mazzo (che cambia) e le restituisce
    function pesca(mazzo, quante = 1) {
        return mazzo.splice(0, quante);
    }

    // Distribuisce una carta a testa, a giro, finché ognuno ne ha "perGiocatore"
    function distribuisci(mazzo, giocatori, perGiocatore) {
        const mani = [];
        for (let g = 0; g < giocatori; g++) {
            mani.push([]);
        }
        for (let giro = 0; giro < perGiocatore; giro++) {
            for (let g = 0; g < giocatori; g++) {
                mani[g].push(...pesca(mazzo, 1));
            }
        }
        return mani;
    }

    // Colore della carta francese: cuori e quadri sono rossi
    function colore(carta) {
        return carta.seme === 'hearts' || carta.seme === 'diamonds' ? 'rosso' : 'nero';
    }

    // Nome leggibile: "asso di coppe", "donna di cuori"
    function nome(carta) {
        if (carta.tipo === 'italiano') {
            return `${carta.valore} di ${carta.seme}`;
        }
        const valore = NOMI_VALORI_FRANCESI[carta.valore] || carta.valore;
        return `${valore} di ${NOMI_SEMI_FRANCESI[carta.seme]}`;
    }

    // Due carte sono la stessa carta se hanno tipo, seme e valore uguali
    function uguali(a, b) {
        return a.tipo === b.tipo && a.seme === b.seme && a.valore === b.valore;
    }

    return {
        SEMI_ITALIANI, VALORI_ITALIANI, SEMI_FRANCESI, VALORI_FRANCESI,
        italiano, francese, mescola, pesca, distribuisci, colore, nome, uguali
    };
})();

if (typeof module !== 'undefined') {
    module.exports = Mazzo;
}
