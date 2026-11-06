// Tasto indietro dell'app Android (Tappa 29, ADR 0013). MainActivity chiama window.indietroApp():
// se restituisce true il tasto è stato usato dalla pagina, se restituisce false l'app va in secondo piano.
// Nel browser non viene mai chiamata e non cambia nulla.
const Indietro = (() => {
    function indietro() {
        // Una finestra dei giocatori (nomi, parola segreta, «passa il telefono») va completata: il tasto non fa nulla
        if (document.querySelector('.copertura')) return true;
        // Il pannello della tavola (regole, menu) si chiude e si torna al gioco
        if (typeof Tavola !== 'undefined' && Tavola.aperto()) { Tavola.chiudi(); return true; }
        // In un gioco si torna alla home
        const casa = document.querySelector('.link-home');
        if (casa) { window.location.href = casa.href; return true; }
        // Nella home: l'app va in secondo piano
        return false;
    }
    if (typeof window !== 'undefined') window.indietroApp = indietro;
    return { indietro };
})();
if (typeof module !== 'undefined') module.exports = Indietro;
