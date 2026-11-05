// Orologio: 13 mucchi coperti da 4 carte, disposti come le ore (dall'asso alla donna) con i re al centro.
// Si gira la carta in cima al centro e la si mette sotto il mucchio della sua ora; poi si gira la prima carta
// coperta di quel mucchio, e così via. Si perde se escono i quattro re prima di aver scoperto tutto.
// Il giocatore tocca il mucchio giusto (quello indicato dalla carta in mano). Si prova con: node js/test-solitari-2.js
// Pile: 'o1'..'o12' (ore), 'o13' (centro, i re), 'mano' (la carta girata da sistemare).
const Orologio = (() => {
    const M = typeof module !== 'undefined' ? require('../js/mazzo') : Mazzo;
    const ORE = Array.from({ length: 13 }, (_, i) => `o${i + 1}`);
    function crea(opzioni = {}, casuale = Math.random) {
        const mazzo = M.mescola(M.francese(), casuale), pile = {};
        ORE.forEach(id => { pile[id] = mazzo.splice(0, 4).map(carta => ({ carta, scoperta: false })); });
        // Si comincia girando la carta in cima al centro
        const prima = pile.o13.pop(); prima.scoperta = true;
        pile.mano = [prima];
        return { gioco: 'orologio', pile, mosse: 0, perso: false };
    }
    const destinazione = s => s.pile.mano.length ? `o${s.pile.mano[0].carta.numero}` : null;
    const puoPrendere = (s, id) => id === 'mano' && s.pile.mano.length > 0;
    const puoPosare = (s, carte, id) => id === destinazione(s);
    // La carta in mano va scoperta in cima al mucchio della sua ora; poi si gira l'ultima carta coperta di quel mucchio
    function sposta(s, da, i, a) {
        if (s.perso || da !== 'mano' || !puoPosare(s, s.pile.mano, a)) return false;
        const carta = s.pile.mano.pop();
        s.pile[a].push(carta); // scoperta sopra; le coperte restano sotto
        const coperte = s.pile[a].filter(x => !x.scoperta);
        if (coperte.length) {
            const prossima = s.pile[a].splice(s.pile[a].indexOf(coperte.at(-1)), 1)[0];
            prossima.scoperta = true; s.pile.mano.push(prossima);
        }
        if (!s.pile.mano.length && !vinto(s)) s.perso = true; // quarto re uscito troppo presto
        s.mosse++;
        return true;
    }
    // Basta toccare il mucchio giusto
    const autoBase = (s, id) => sposta(s, 'mano', 0, id);
    const vinto = s => ORE.every(id => s.pile[id].every(x => x.scoperta)) && !s.pile.mano.length;
    const bloccata = s => s.perso;
    const scoperte = s => ORE.reduce((n, id) => n + s.pile[id].filter(x => x.scoperta).length, 0);
    // 12 ore in cerchio intorno al centro, in unità di carta
    function disposizione() {
        const ore = ORE.slice(0, 12).map((id, i) => {
            const angolo = (i + 1) / 12 * 2 * Math.PI;
            return { id, x: 3 + Math.sin(angolo) * 3, y: 2 - Math.cos(angolo) * 2, tipo: 'base', etichetta: String(i + 1) };
        });
        return [...ore, { id: 'o13', x: 3, y: 2, tipo: 'base', etichetta: 'K' }, { id: 'mano', x: 6, y: 4.6, tipo: 'scarti', etichetta: '' }];
    }
    return { ORE, colonne: 7, crea, destinazione, puoPrendere, puoPosare, sposta, autoBase, vinto, bloccata, scoperte, disposizione, toccoSingolo: true };
})();
if (typeof module !== 'undefined') module.exports = Orologio;
