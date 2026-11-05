// Golf: regole in golf/funzioni.js, pagina comune in js/solitario-pagina.js.
SolitarioPagina.avvia({
    motore: Golf,
    dettaglio: s => `Carte nelle colonne: ${Golf.rimaste(s)} · nel mazzo: ${s.pile.mazzo.length}`,
    punteggio: s => `Restano ${Golf.rimaste(s)} carte`,
    benvenuto: 'Tocca una carta in cima a una colonna per mandarla sulla base, oppure tocca il mazzo.'
});
