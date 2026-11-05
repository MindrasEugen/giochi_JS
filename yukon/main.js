// Yukon: regole in yukon/funzioni.js, pagina comune in js/solitario-pagina.js.
SolitarioPagina.avvia({
    motore: Yukon,
    dettaglio: s => `Carte sulle basi: ${Yukon.BASI.reduce((n, b) => n + s.pile[b].length, 0)} di 52`
});
