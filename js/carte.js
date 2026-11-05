// Immagini delle carte: tutte stanno nella cartella carte/ nella radice.
// - italiane: "<valore>-<seme>.png" (es. asso-coppe.png), dorso "dorso.png"
// - francesi: "<seme>-<valore>.png" (es. hearts-q.png), dorso "back.png"
// Richiede js/mazzo.js (per il nome leggibile della carta).

const Carte = (() => {
    // Percorso della cartella carte/ visto da un gioco (che sta in una sottocartella della radice)
    let cartella = '../carte/';

    function impostaCartella(percorso) {
        cartella = percorso;
    }

    function immagine(carta) {
        if (carta.tipo === 'italiano') {
            return `${cartella}${carta.valore}-${carta.seme}.png`;
        }
        return `${cartella}${carta.seme}-${carta.valore}.png`;
    }

    function dorso(tipo) {
        return tipo === 'italiano' ? `${cartella}dorso.png` : `${cartella}back.png`;
    }

    // Crea l'elemento <img class="carta"> pronto da inserire nella pagina.
    // Con { coperta: true } mostra il dorso e un alt generico, così la carta non si "legge" nemmeno con un lettore di schermo.
    function crea(carta, opzioni = {}) {
        const img = document.createElement('img');
        img.className = 'carta';
        img.draggable = false;
        if (opzioni.coperta) {
            img.src = dorso(carta.tipo);
            img.alt = 'Carta coperta';
            img.classList.add('carta--coperta');
        } else {
            img.src = immagine(carta);
            img.alt = Mazzo.nome(carta);
        }
        return img;
    }

    // Carta francese semplificata (Tappa 25): valore e seme grandi disegnati in HTML e CSS (css/tavola.css),
    // al posto dell'immagine quando sul telefono la carta è troppo stretta per leggerla.
    const SIMBOLI = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
    function semplice(carta, coperta) {
        const el = document.createElement('div');
        el.className = 'carta carta-semplice';
        el.setAttribute('role', 'img');
        if (coperta) {
            el.classList.add('carta--coperta', 'carta-semplice--coperta');
            el.setAttribute('aria-label', 'Carta coperta');
            return el;
        }
        el.classList.add(Mazzo.colore(carta) === 'rosso' ? 'carta-semplice--rossa' : 'carta-semplice--nera');
        el.setAttribute('aria-label', Mazzo.nome(carta));
        const angolo = document.createElement('span'), valore = document.createElement('span'), piccolo = document.createElement('span'), centro = document.createElement('span');
        angolo.className = 'carta-semplice__angolo';
        valore.className = 'carta-semplice__valore'; valore.textContent = carta.valore.toUpperCase();
        piccolo.className = 'carta-semplice__seme'; piccolo.textContent = SIMBOLI[carta.seme];
        centro.className = 'carta-semplice__centro'; centro.textContent = SIMBOLI[carta.seme];
        centro.setAttribute('aria-hidden', 'true');
        angolo.append(valore, piccolo);
        el.append(angolo, centro);
        return el;
    }

    // Colonne per una mano disposta a griglia sul telefono (variabile CSS --colonne): righe il più possibile piene,
    // al massimo `massimo` carte per riga. Es. con massimo 7: 13 carte -> 7, 22 carte -> 6 (4 righe).
    function colonne(n, massimo) {
        const righe = Math.max(1, Math.ceil(n / massimo));
        return String(Math.max(1, Math.ceil(n / righe)));
    }

    // Per la mano a ventaglio: dà a ogni carta della mano la sua posizione (--i) e il totale (--n),
    // così il CSS può inclinarle in modo simmetrico. Va richiamata ogni volta che la mano cambia.
    function aVentaglio(mano) {
        const carte = [...mano.children];
        carte.forEach((carta, i) => {
            carta.style.setProperty('--i', i);
            carta.style.setProperty('--n', carte.length);
        });
    }

    return { impostaCartella, immagine, dorso, crea, semplice, colonne, aVentaglio };
})();

if (typeof module !== 'undefined') {
    module.exports = Carte;
}
