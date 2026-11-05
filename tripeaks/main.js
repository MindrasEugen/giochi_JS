// TriPeaks: regole in tripeaks/funzioni.js, pagina comune in js/solitario-pagina.js.
SolitarioPagina.avvia({
    motore: TriPeaks,
    dettaglio: s => `Carte nei picchi: ${TriPeaks.rimaste(s)} · nel mazzo: ${s.pile.mazzo.length} · serie migliore: ${s.migliorSerie}`,
    punteggio: s => `Restano ${TriPeaks.rimaste(s)} carte nei picchi`,
    benvenuto: 'Tocca una carta libera per mandarla sulla base, oppure tocca il mazzo.'
});
