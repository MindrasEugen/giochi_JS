const AssoPigliaTutto = (() => {
    const P = typeof module !== 'undefined' ? require('../js/prese-italiane') : PreseItaliane;
    return { ...P, crea: (casuale = Math.random) => P.crea('asso', casuale) };
})();
if (typeof module !== 'undefined') module.exports = AssoPigliaTutto;
