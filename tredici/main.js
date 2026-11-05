// Le tredici: regole in tredici/funzioni.js, pagina comune in js/solitario-pagina.js.
SolitarioPagina.avvia({
    motore: Tredici,
    dettaglio: s => `Carte sulle basi: ${Tredici.BASI.reduce((n, b) => n + s.pile[b].length, 0)} di 52`
});
