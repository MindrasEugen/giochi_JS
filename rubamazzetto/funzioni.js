const Rubamazzetto = (() => {
    const P = typeof module !== 'undefined' ? require('../js/prese-italiane') : PreseItaliane;
    return { ...P, crea: (casuale = Math.random) => P.crea('rubamazzetto', casuale) };
})();
if (typeof module !== 'undefined') module.exports = Rubamazzetto;
