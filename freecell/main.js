// FreeCell: regole e risolutore in freecell/funzioni.js, pagina comune in js/solitario-pagina.js.
SolitarioPagina.avvia({
    motore: FreeCell,
    dettaglio: s => `Celle libere: ${FreeCell.CELLE.filter(c => !s.pile[c].length).length} · carte sulle basi: ${FreeCell.BASI.reduce((n, b) => n + s.pile[b].length, 0)}`,
    benvenuto: 'Partita controllata dal risolutore: si può vincere. Trascina le carte oppure toccane una e poi la destinazione.'
});
