// Scorpione: regole in scorpione/funzioni.js, pagina comune in js/solitario-pagina.js.
SolitarioPagina.avvia({
    motore: Scorpione,
    dettaglio: s => `Scale completate: ${s.pile.fatte.length / 13} di 4 · riserva: ${s.pile.mazzo.length ? 'da usare' : 'usata'}`
});
