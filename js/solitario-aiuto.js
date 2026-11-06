// Aiutante comune dei solitari (Tappa 32): suggerimento della prossima mossa e controllo "nessuna mossa utile".
// Usa solo le funzioni del motore di ogni gioco (disposizione, puoPrendere, puoPosare, sposta, clicMazzo):
// prova le mosse su copie della partita e cerca la strada più corta verso un progresso.
// Progresso = carte in più sulle basi (o scale completate), carte coperte scoperte, celle e colonne liberate.
// Si prova con: node js/test-solitari-aiuto.js
const SolitarioAiuto = (() => {
    // Limiti della ricerca: posizioni create e millisecondi (la profondità serve solo ai test). Se un limite si esaurisce
    // prima di aver guardato tutte le posizioni raggiungibili, la ricerca è "incompleta" e non si dichiara mai la
    // partita bloccata: l'avviso compare solo quando nessuna posizione raggiungibile porta a un progresso.
    const PROFONDITA = Infinity, LIMITE_STATI = 20000, LIMITE_MS = 250;
    // Copia leggera: pile e carte nuove (i motori cambiano "scoperta"), la carta vera è condivisa perché non cambia
    const copia = s => ({ ...s, pile: Object.fromEntries(Object.entries(s.pile).map(([id, pila]) => [id, pila.map(x => ({ ...x }))])) });
    const adesso = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const tipi = (motore, s) => Object.fromEntries(motore.disposizione(s).map(d => [d.id, d.tipo]));
    // Chiave della partita per non visitare due volte la stessa posizione
    const chiave = s => Object.keys(s.pile).sort().map(id => id + ':' + s.pile[id].map(x => x.carta.seme[0] + x.carta.numero + (x.scoperta ? '' : '?')).join('.')).join('|');
    function progresso(motore, s, t) {
        let p = 0;
        for (const [id, tipo] of Object.entries(t)) {
            const pila = s.pile[id] || [];
            // Sulle basi contano le carte scoperte (nell'Orologio le basi hanno anche carte coperte da scoprire)
            // Pesi: carta sistemata 4, carta scoperta 2, spazio libero 1 (scoprire una carta occupando una colonna vuota conviene)
            if (tipo === 'base' || tipo === 'fatte') p += 4 * pila.filter(x => x.scoperta || tipo === 'fatte').length;
            if (tipo !== 'mazzo') p -= 2 * pila.filter(x => !x.scoperta).length; // carte coperte ancora da scoprire
            if ((tipo === 'colonna' || tipo === 'cella') && !pila.length) p += 1; // spazio libero
        }
        return p;
    }
    // Mosse di carte valide, senza quelle inutili
    function mosse(motore, s, t) {
        const lista = [], ids = Object.keys(t);
        for (const da of ids) {
            const pila = s.pile[da];
            // Dal mazzo si pesca solo con il clic; dalle basi e dalle scale fatte non si riprende
            if (!pila?.length || t[da] === 'mazzo' || t[da] === 'fatte' || t[da] === 'base') continue;
            for (let indice = 0; indice < pila.length; indice++) {
                if (!motore.puoPrendere(s, da, indice)) continue;
                const carte = pila.slice(indice);
                for (const a of ids) {
                    if (a === da || t[a] === 'mazzo' || !motore.puoPosare(s, carte, a)) continue;
                    // Inutile: spostare una colonna intera, senza carte coperte sotto, in una colonna vuota
                    if (indice === 0 && t[da] === 'colonna' && t[a] === 'colonna' && !s.pile[a].length) continue;
                    lista.push({ da, indice, a });
                }
            }
        }
        return lista;
    }
    const prova = (motore, s, m) => { const n = copia(s); return motore.sposta(n, m.da, m.indice, m.a) ? n : null; };
    function clicca(motore, s) {
        if (!motore.clicMazzo) return null;
        const n = copia(s);
        return motore.clicMazzo(n) ? n : null;
    }
    // Giro del mazzo: le posizioni dopo 1, 2, 3... clic, finché si torna a una posizione già vista
    function giroMazzo(motore, s) {
        const lista = [], viste = new Set([chiave(s)]);
        const massimo = 2 * ((s.pile.mazzo?.length || 0) + (s.pile.scarti?.length || 0)) + 2;
        let n = s;
        for (let k = 1; k <= massimo; k++) {
            n = clicca(motore, n);
            if (!n) break;
            const c = chiave(n);
            if (viste.has(c)) break;
            viste.add(c); lista.push({ stato: n, clic: k });
        }
        return lista;
    }
    // Ricerca in ampiezza: restituisce { mossa, clic, guadagno } oppure { nessuna: true, completa } se non trova progressi
    function cerca(motore, s, limiti = {}) {
        const profonditaMax = limiti.profondita || PROFONDITA, statiMax = limiti.stati || LIMITE_STATI;
        const scadenza = adesso() + (limiti.ms ?? LIMITE_MS);
        const t = tipi(motore, s), p0 = progresso(motore, s, t);
        const viste = new Set([chiave(s)]);
        let livello = [], completa = true;
        for (const m of mosse(motore, s, t)) {
            const n = prova(motore, s, m);
            if (!n) continue;
            const c = chiave(n); if (viste.has(c)) continue; viste.add(c);
            livello.push({ stato: n, prima: m, base: p0 });
        }
        // Dopo i clic sul mazzo il confronto riparte dalla posizione raggiunta: girare carte non è un progresso da solo
        for (const g of giroMazzo(motore, s)) {
            const c = chiave(g.stato); if (viste.has(c)) continue; viste.add(c);
            livello.push({ stato: g.stato, prima: { mazzo: true, clic: g.clic }, base: progresso(motore, g.stato, t), daMazzo: true });
        }
        for (let profondita = 1; profondita <= profonditaMax && livello.length; profondita++) {
            let migliore = null;
            for (const nodo of livello) {
                const guadagno = progresso(motore, nodo.stato, t) - nodo.base;
                if (guadagno <= 0) continue;
                // A parità di guadagno meglio una mossa di carte che girare il mazzo
                if (!migliore || guadagno > migliore.guadagno || (guadagno === migliore.guadagno && migliore.daMazzo && !nodo.daMazzo))
                    migliore = { ...nodo, guadagno };
            }
            if (migliore) return { mossa: migliore.prima, guadagno: migliore.guadagno, profondita };
            if (profondita === profonditaMax) break;
            const prossimo = [];
            for (const nodo of livello) {
                if (adesso() > scadenza) { completa = false; break; }
                for (const m of mosse(motore, nodo.stato, t)) {
                    const n = prova(motore, nodo.stato, m);
                    if (!n) continue;
                    const c = chiave(n); if (viste.has(c)) continue; viste.add(c);
                    prossimo.push({ stato: n, prima: nodo.prima, base: nodo.base, daMazzo: nodo.daMazzo });
                    if (viste.size > statiMax || (viste.size % 200 === 0 && adesso() > scadenza)) { completa = false; break; }
                }
                if (!completa) break;
                // Il mazzo anche più avanti: con gli scarti (Klondike) tutto il giro, altrimenti un clic (Spider, Scorpione:
                // nuove carte sulle colonne). Il confronto riparte dalla posizione dopo i clic.
                const dopo = 'scarti' in nodo.stato.pile ? giroMazzo(motore, nodo.stato).map(g => g.stato) : [clicca(motore, nodo.stato)].filter(Boolean);
                const prima = progresso(motore, nodo.stato, t);
                for (const n of dopo) {
                    const c = chiave(n); if (viste.has(c)) continue; viste.add(c);
                    const base = nodo.base + progresso(motore, n, t) - prima; // i clic da soli non sono un progresso
                    prossimo.push({ stato: n, prima: nodo.prima, base, daMazzo: nodo.daMazzo });
                }
            }
            if (!completa) break;
            livello = prossimo;
        }
        return { nessuna: true, completa };
    }
    // Suggerimento: { mossa: { da, indice, a } } oppure { mazzo: true }; { incerto: true } se il tempo è finito prima
    // di trovare qualcosa; null se davvero non c'è niente da suggerire
    function suggerisci(motore, s, limiti) {
        if (motore.vinto(s)) return null;
        const r = cerca(motore, s, limiti);
        if (r.mossa) return r.mossa.mazzo ? { mazzo: true, clic: r.mossa.clic } : { mossa: r.mossa };
        // Nessun progresso in vista: se il mazzo porta carte nuove (non gira sugli scarti già visti), quello è il consiglio
        if (!('scarti' in s.pile) && clicca(motore, s)) return { mazzo: true, clic: 1 };
        return r.completa ? null : { incerto: true };
    }
    // Nessuna mossa utile: la ricerca è finita senza trovare progressi e il mazzo non porta carte nuove.
    // Con un mazzo che distribuisce sulle colonne (Spider, Scorpione) non si è mai bloccati finché ha carte.
    function bloccato(motore, s, limiti) {
        if (motore.vinto(s)) return false;
        const r = cerca(motore, s, limiti);
        if (!r.nessuna || !r.completa) return false;
        const giraSugliScarti = 'scarti' in s.pile;
        if (!giraSugliScarti && clicca(motore, s)) return false;
        return true;
    }
    // Nome di una carta francese o italiana per i messaggi: 7♥, A♠, K♣
    const SIMBOLI = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
    const FIGURE = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
    const nome = c => (FIGURE[c.numero] || String(c.numero)) + (SIMBOLI[c.seme] || '');
    function descrivi(motore, s, suggerimento) {
        if (!suggerimento) return 'Nessuna mossa utile: annulla qualche mossa o inizia una nuova partita.';
        if (suggerimento.incerto) return 'Non trovo un suggerimento in poco tempo: prova a spostare qualche carta o a girare il mazzo.';
        if (suggerimento.mazzo) return suggerimento.clic > 1 ? 'Gira carte dal mazzo: tra quelle in arrivo ce n’è una che puoi usare.' : 'Tocca il mazzo.';
        const { da, indice, a } = suggerimento.mossa, t = tipi(motore, s);
        const carta = s.pile[da][indice].carta, quante = s.pile[da].length - indice;
        const chi = quante > 1 ? `${nome(carta)} con le carte sopra` : nome(carta);
        const sotto = s.pile[a].at(-1);
        if (s.gioco === 'piramide') return a === 'eliminate' ? `Elimina ${nome(carta)}.` : `Abbina ${nome(carta)} a ${nome(sotto.carta)}: insieme fanno 13.`;
        if (t[a] === 'base') return s.gioco === 'orologio' ? `Metti ${chi} sul mucchio illuminato.` : `Metti ${chi} sulla base.`;
        if (t[a] === 'cella') return `Metti ${chi} in una cella libera.`;
        if (!sotto) return `Sposta ${chi} nella colonna vuota.`;
        return `Sposta ${chi} su ${nome(sotto.carta)}.`;
    }
    return { suggerisci, bloccato, descrivi, mosse, progresso, cerca, nome };
})();
if (typeof module !== 'undefined') module.exports = SolitarioAiuto;
