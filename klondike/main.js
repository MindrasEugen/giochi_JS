// Klondike: regole in klondike/funzioni.js, pagina comune in js/solitario-pagina.js.
SolitarioPagina.avvia({
    motore: Klondike,
    opzioni: valore => ({ pesca: Number(valore) || 1 }),
    dettaglio: s => `Pesca ${s.pesca} · carte nel mazzo: ${s.pile.mazzo.length} · giri del mazzo: ${s.giri}`
});
