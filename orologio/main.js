// Orologio: regole in orologio/funzioni.js, pagina comune in js/solitario-pagina.js.
const NOMI_ORE = { 11: 'il fante (11)', 12: 'la donna (12)', 13: 'il centro (re)' };
SolitarioPagina.avvia({
    motore: Orologio,
    dettaglio: s => `Carte scoperte: ${Orologio.scoperte(s)} di 52${s.pile.mano.length ? ` · porta la carta su ${NOMI_ORE[s.pile.mano[0].carta.numero] || `le ore ${s.pile.mano[0].carta.numero}`}` : ''}`,
    punteggio: s => `Il quarto re è uscito: scoperte ${Orologio.scoperte(s)} carte su 52`,
    benvenuto: 'Tocca il mucchio dell\'ora indicata dalla carta girata.'
});
