// Scopone scientifico: 4 giocatori in coppie (0+2 contro 1+3), 9 carte a testa e 4 in tavola. Regole in js/prese-italiane.js.
const Scopone = (() => {
    const P = typeof module !== 'undefined' ? require('../js/prese-italiane') : PreseItaliane;
    return { ...P, crea: (casuale = Math.random) => P.crea('scopone', casuale) };
})();
if (typeof module !== 'undefined') module.exports = Scopone;
