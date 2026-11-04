// Cirulla a 2: presa del 15, asso piglia tutto, matta (7 di coppe) e accusi. Regole in js/prese-italiane.js.
const Cirulla = (() => {
    const P = typeof module !== 'undefined' ? require('../js/prese-italiane') : PreseItaliane;
    return { ...P, crea: (casuale = Math.random) => P.crea('cirulla', casuale) };
})();
if (typeof module !== 'undefined') module.exports = Cirulla;
