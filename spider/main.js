// Spider: regole in spider/funzioni.js, pagina comune in js/solitario-pagina.js.
SolitarioPagina.avvia({
    motore: Spider,
    opzioni: valore => ({ semi: Number(valore) || 1 }),
    dettaglio: s => `Scale completate: ${s.pile.fatte.length / 13} di 8 · distribuzioni rimaste: ${s.pile.mazzo.length / 10}`
});
