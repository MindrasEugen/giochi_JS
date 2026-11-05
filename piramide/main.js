// Piramide: regole in piramide/funzioni.js, pagina comune in js/solitario-pagina.js.
SolitarioPagina.avvia({
    motore: Piramide,
    dettaglio: s => `Carte nella piramide: ${Piramide.POSTI.filter(p => s.pile[p.id].length).length} · passaggio del mazzo ${s.giri + 1} di ${Piramide.PASSAGGI}`,
    punteggio: s => `Restano ${Piramide.POSTI.filter(p => s.pile[p.id].length).length} carte nella piramide`
});
