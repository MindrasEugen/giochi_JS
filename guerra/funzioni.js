// Guerra con il mazzo francese: si gira una carta a testa, la più alta prende entrambe.
// A parità c'è la guerra: tre carte coperte e una scoperta a testa, finché qualcuno vince.
// Per non giocare all'infinito la partita finisce dopo 300 battaglie: vince chi ha più carte.
// Si prova con: node guerra/test-guerra.js
const Guerra = (() => {
    const M = typeof module !== 'undefined' ? require('../js/mazzo') : Mazzo;
    const LIMITE = 300, COPERTE = 3;
    const forza = c => c.numero === 1 ? 14 : c.numero; // l'asso è la carta più alta
    function crea(casuale = Math.random) {
        const mazzo = M.mescola(M.francese(), casuale);
        return { casuale, mazzi: [mazzo.slice(0, 26), mazzo.slice(26)], battaglie: 0, ultimo: null, finita: false, vincitore: null };
    }
    function finisci(s) {
        const [a, b] = s.mazzi.map(m => m.length);
        if (a === 0 || b === 0 || s.battaglie >= LIMITE) { s.finita = true; s.vincitore = a === b ? null : a > b ? 0 : 1; }
    }
    // Una battaglia completa (con eventuali guerre). Restituisce false a partita finita.
    function gira(s) {
        if (s.finita) return false;
        s.battaglie++;
        const piatto = [], scontri = [];
        let vincitore = null;
        while (vincitore === null) {
            // Chi non ha più carte perde la battaglia (e la partita)
            if (!s.mazzi[0].length || !s.mazzi[1].length) { vincitore = s.mazzi[0].length ? 0 : 1; break; }
            const scoperte = s.mazzi.map(m => m.shift());
            piatto.push(...scoperte);
            scontri.push(scoperte);
            const [a, b] = scoperte.map(forza);
            if (a !== b) { vincitore = a > b ? 0 : 1; break; }
            // Guerra: tre coperte a testa (o quelle che restano, tenendone una da scoprire)
            for (const m of s.mazzi) piatto.push(...m.splice(0, Math.min(COPERTE, Math.max(0, m.length - 1))));
        }
        // Le carte vinte vanno in fondo al mazzo, mescolate: evita partite che si ripetono uguali
        s.mazzi[vincitore].push(...M.mescola(piatto, s.casuale));
        s.ultimo = { scontri, vincitore, prese: piatto.length, guerre: scontri.length - 1 };
        finisci(s);
        return true;
    }
    return { LIMITE, COPERTE, forza, crea, gira };
})();
if (typeof module !== 'undefined') module.exports = Guerra;
