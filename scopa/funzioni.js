const Scopa = (() => {
    const P = typeof module !== 'undefined' ? require('../js/prese-italiane') : PreseItaliane;
    return { ...P, crea: (casuale = Math.random) => P.crea('scopa', casuale) };
})();
if (typeof module !== 'undefined') module.exports = Scopa;
