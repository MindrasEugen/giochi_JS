// Prova della logica del Memory. Si avvia dalla radice del progetto con:  node memory/test-memory.js

const M = require('./funzioni.js');

let falliti = 0;
function controlla(descrizione, condizione) {
    console.log(`${condizione ? 'OK  ' : 'FAIL'} ${descrizione}`);
    if (!condizione) falliti++;
}

controlla('12 simboli diversi per la griglia grande', new Set(M.SIMBOLI).size === 12);
for (const [nome, f] of Object.entries(M.FORMATI)) {
    const stato = M.nuovaPartita(f.coppie);
    const conteggi = {};
    stato.carte.forEach(c => { conteggi[c.simbolo] = (conteggi[c.simbolo] || 0) + 1; });
    controlla(`${nome}: ${f.colonne}×${f.righe} = ${stato.carte.length} carte, ogni simbolo esattamente 2 volte`,
        stato.carte.length === f.colonne * f.righe && Object.values(conteggi).every(n => n === 2) && Object.keys(conteggi).length === f.coppie);
}

// Partita guidata: trovo le posizioni dei simboli e gioco
const stato = M.nuovaPartita(6);
const posizioni = {};
stato.carte.forEach((c, i) => { (posizioni[c.simbolo] = posizioni[c.simbolo] || []).push(i); });
const simboli = Object.keys(posizioni);
const [a1, a2] = posizioni[simboli[0]];
const [b1] = posizioni[simboli[1]];

controlla('prima carta: "prima"', M.scopri(stato, a1) === 'prima' && stato.carte[a1].scoperta);
controlla('la stessa carta di nuovo: ignorata', M.scopri(stato, a1) === 'ignorata');
controlla('carta diversa: "diversa", conta una mossa', M.scopri(stato, b1) === 'diversa' && stato.mosse === 1);
controlla('con due carte scoperte, una terza viene ignorata', M.scopri(stato, a2) === 'ignorata' && !stato.carte[a2].scoperta);
M.copriDiverse(stato);
controlla('copriDiverse copre le due carte', !stato.carte[a1].scoperta && !stato.carte[b1].scoperta && stato.scelte.length === 0);
M.scopri(stato, a1);
controlla('coppia: "coppia", le due carte restano trovate', M.scopri(stato, a2) === 'coppia' && stato.carte[a1].trovata && stato.carte[a2].trovata && stato.coppieTrovate === 1);
controlla('una carta già trovata viene ignorata', M.scopri(stato, a1) === 'ignorata');
for (const s of simboli.slice(1)) {
    M.scopri(stato, posizioni[s][0]);
    M.scopri(stato, posizioni[s][1]);
}
controlla(`partita finita dopo 6 coppie, ${stato.mosse} mosse`, M.finita(stato) && stato.mosse === 7);

// Mescolamento: le carte non sono sempre nello stesso ordine
const ordini = new Set();
for (let i = 0; i < 20; i++) ordini.add(M.nuovaPartita(8).carte.map(c => c.simbolo).join(''));
controlla(`20 partite, ${ordini.size} ordini diversi`, ordini.size > 15);

console.log(falliti === 0 ? '\nTutti i controlli sono passati' : `\n${falliti} controlli falliti`);
process.exit(falliti === 0 ? 0 : 1);
