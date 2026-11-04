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

    // Per la mano a ventaglio: dà a ogni carta della mano la sua posizione (--i) e il totale (--n),
    // così il CSS può inclinarle in modo simmetrico. Va richiamata ogni volta che la mano cambia.
    function aVentaglio(mano) {
        const carte = [...mano.children];
        carte.forEach((carta, i) => {
            carta.style.setProperty('--i', i);
            carta.style.setProperty('--n', carte.length);
        });
    }

    return { impostaCartella, immagine, dorso, crea, aVentaglio };
})();

if (typeof module !== 'undefined') {
    module.exports = Carte;
}
