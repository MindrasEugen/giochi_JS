// Cirulla: le bussate e la tavola iniziale da 15 o 30 vengono annunciate nei messaggi.
(() => {
    const nomiCarte = carte => carte.map(c => Mazzo.nome(c)).join(', ');
    function annunci(stato, { nome }) {
        return stato.annunci.map(a => `${nome(a.giocatore)} bussa: ${a.tipo} (${nomiCarte(a.carte)}), ${a.scope} scope.`).join(' ');
    }
    CarteItalianePagina.avvia({
        motore: Cirulla,
        descriviInizio: (stato, aiuti) => {
            const testi = [];
            if (stato.iniziale) testi.push(`In tavola ${stato.iniziale.somma}: ${aiuti.nome(stato.iniziale.giocatore)}, il mazziere, raccoglie e fa ${stato.iniziale.scope} ${stato.iniziale.scope === 1 ? 'scopa' : 'scope'}.`);
            testi.push(annunci(stato, aiuti));
            return testi.filter(Boolean).join(' ');
        },
        descrivi: annunci
    });
})();
