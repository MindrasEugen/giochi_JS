// Prova del Puzzle scorrevole. Si avvia dalla radice del progetto con:  node puzzle_scorrevole/test-puzzle.js

const fs = require('node:fs');
const path = require('node:path');
const P = require('./funzioni.js');
const { ambiente } = require('../scripts/dom-minimo.js');

let falliti = 0;
function controlla(descrizione, condizione) {
    console.log(`${condizione ? 'OK  ' : 'FAIL'} ${descrizione}`);
    if (!condizione) falliti++;
}
// Generatore fisso, così i test sono sempre uguali
function generatore(seme) {
    let s = seme;
    return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

// --- Mosse ---
const risolta3 = P.risolta(3);
controlla('il puzzle risolto è vinto', P.vinta(risolta3));
controlla('dal 3×3 risolto si muovono solo i due tasselli vicini all\'angolo', JSON.stringify(P.mobili(risolta3).sort()) === '[5,7]');
controlla('un tassello lontano dallo spazio vuoto non si muove', P.muovi(risolta3, 0) === null && P.muovi(risolta3, 4) === null);
const dopo = P.muovi(risolta3, 7);
controlla('il tassello vicino scivola nello spazio vuoto', dopo[8] === 7 && dopo[7] === 8 && !P.vinta(dopo));
controlla('la mossa non modifica la griglia di partenza', P.vinta(risolta3));
controlla('freccia a destra: il tassello a sinistra dello spazio vuoto va a destra', P.posizioneDaFreccia(risolta3, 'ArrowRight') === 7);
controlla('freccia giù: scende il tassello sopra lo spazio vuoto', P.posizioneDaFreccia(risolta3, 'ArrowDown') === 5);
controlla('freccia su e sinistra: nessun tassello oltre il bordo', P.posizioneDaFreccia(risolta3, 'ArrowUp') === null && P.posizioneDaFreccia(risolta3, 'ArrowLeft') === null);

// --- Risolvibilità, contata in modo indipendente dalla logica del gioco ---
// Un puzzle quadrato di lato dispari è risolvibile se le inversioni sono pari; di lato pari se
// inversioni + riga dello spazio vuoto (contata dal basso, da 1) è dispari.
function risolvibile(griglia) {
    const lato = Math.round(Math.sqrt(griglia.length)), vuoto = griglia.length - 1;
    const numeri = griglia.filter(v => v !== vuoto);
    let inversioni = 0;
    for (let i = 0; i < numeri.length; i++) for (let j = i + 1; j < numeri.length; j++) if (numeri[i] > numeri[j]) inversioni++;
    if (lato % 2 === 1) return inversioni % 2 === 0;
    const rigaDalBasso = lato - Math.floor(griglia.indexOf(vuoto) / lato);
    return (inversioni + rigaDalBasso) % 2 === 1;
}
controlla('il controllo indipendente riconosce un puzzle impossibile', !risolvibile([1, 0, 2, 3, 4, 5, 6, 7, 8]));
const caso = generatore(42);
let tuttiBuoni = true;
for (const livello of Object.values(P.LIVELLI)) {
    for (let k = 0; k < 30; k++) {
        const { griglia, storia } = P.mescola(livello.lato, livello.mescolate, caso);
        const valori = [...griglia].sort((a, b) => a - b).join();
        if (P.vinta(griglia) || !risolvibile(griglia) || valori !== P.risolta(livello.lato).join()
            || storia.length !== livello.mescolate + 1 || storia.at(-1) !== P.chiave(griglia) || storia[0] !== P.chiave(P.risolta(livello.lato))) tuttiBuoni = false;
    }
}
controlla('mescolamento: 90 partite tutte risolvibili, mai già risolte, con la storia giusta', tuttiBuoni);
// Anche con una sola mossa di mescolamento non si parte mai dal puzzle risolto
controlla('mescolamento corto: mai già risolto', Array.from({ length: 50 }, () => P.mescola(3, 2, caso).griglia).every(g => !P.vinta(g)));
controlla('livelli 3×3, 4×4, 5×5', P.LIVELLI.facile.lato === 3 && P.LIVELLI.medio.lato === 4 && P.LIVELLI.difficile.lato === 5);

// --- Immagini ---
let mairipetuta = true;
let ultima = null;
for (let k = 0; k < 200; k++) {
    const scelta = P.scegliImmagine(P.IMMAGINI, ultima, caso);
    if (scelta.file === ultima) mairipetuta = false;
    ultima = scelta.file;
}
controlla('l\'immagine nuova è sempre diversa da quella appena giocata', mairipetuta);
controlla('con una sola immagine si usa quella', P.scegliImmagine([{ file: 'a.svg' }], 'a.svg', caso).file === 'a.svg');
controlla('tutti i file delle immagini esistono', P.IMMAGINI.every(i => fs.existsSync(path.join(__dirname, 'immagini', i.file))));
// L'elenco generato (immagini.js) deve corrispondere alla cartella: se no, manca un "pnpm immagini"
const Elenco = require('../scripts/elenco-immagini.js');
const inCartella = Elenco.elenco();
const mancanti = inCartella.filter(i => !P.IMMAGINI.some(j => j.file === i.file && j.nome === i.nome)).map(i => i.file);
const sparite = P.IMMAGINI.filter(j => !inCartella.some(i => i.file === j.file)).map(j => j.file);
controlla(`immagini.js aggiornato con la cartella (${inCartella.length} file)${mancanti.length + sparite.length ? `: avvia pnpm immagini (nuove: ${mancanti.join(', ') || 'nessuna'}; tolte: ${sparite.join(', ') || 'nessuna'})` : ''}`,
    mancanti.length === 0 && sparite.length === 0);
controlla('nome dal file: "13-faro-nella-tempesta.svg" diventa "Faro nella tempesta"', Elenco.nomeDaFile('13-faro-nella-tempesta.svg') === 'Faro nella tempesta'
    && Elenco.nomeDaFile('Barca_a_vela.png') === 'Barca a vela');
controlla('i nomi delle immagini vengono dal titolo dell’SVG', P.IMMAGINI.find(i => i.file === 'citta.svg')?.nome === 'Città di notte');
const usate = new Set(Array.from({ length: 300 }, () => P.scegliImmagine(P.IMMAGINI, null, caso).file));
controlla('a caso escono tutte le immagini', usate.size === P.IMMAGINI.length);

// --- Suggerimento esatto sul 3×3: distanze vere calcolate con una visita in ampiezza dal puzzle risolto ---
const distanze = new Map([[risolta3.join(), 0]]);
const coda = [risolta3];
for (let i = 0; i < coda.length; i++) {
    const g = coda[i], d = distanze.get(g.join());
    for (const p of P.mobili(g)) {
        const figlia = P.muovi(g, p), k = figlia.join();
        if (!distanze.has(k)) { distanze.set(k, d + 1); coda.push(figlia); }
    }
}
controlla('la visita trova tutte le 181440 posizioni del 3×3', distanze.size === 181440);
let esatto = true, stimaOnesta = true;
const casoBfs = generatore(7);
for (let k = 0; k < 300; k++) {
    const g = coda[Math.floor(casoBfs() * coda.length)];
    const d = distanze.get(g.join());
    if (P.stima(g) > d) stimaOnesta = false;
    if (d === 0) continue;
    const p = P.suggerimento(g);
    if (p === null || distanze.get(P.muovi(g, p).join()) !== d - 1) esatto = false;
}
controlla('la stima non supera mai le mosse vere (300 posizioni)', stimaOnesta);
controlla('3×3: il suggerimento è sempre la prima mossa di una soluzione più corta (300 posizioni)', esatto);
// la posizione più lontana del 3×3 (31 mosse)
const lontana = coda.at(-1);
controlla('3×3: suggerimento esatto anche sulla posizione più lontana (31 mosse)', distanze.get(lontana.join()) === 31
    && distanze.get(P.muovi(lontana, P.suggerimento(lontana)).join()) === 30);
controlla('nessun suggerimento a puzzle risolto', P.suggerimento(risolta3) === null);

// Il suggerimento non rimette indietro il tassello appena mosso, se esiste un'altra soluzione più corta
const quasi = P.muovi(P.muovi(risolta3, 7), 4); // vuoto al centro: rimettere 4 al suo posto è la via
controlla('3×3: se tornare indietro è l\'unica via più corta, il suggerimento la indica comunque', P.suggerimento(quasi, { ultimo: 7 }) === 7);

// --- 4×4 e 5×5: seguendo solo i suggerimenti si arriva alla soluzione, con mosse legali e in tempi brevi ---
for (const lato of [4, 5]) {
    const casoGrande = generatore(lato * 11);
    let risolte = 0, legali = true, maxMs = 0, totaleMosse = 0;
    for (let partita = 0; partita < 3; partita++) {
        let { griglia, storia } = P.mescola(lato, lato === 4 ? 200 : 400, casoGrande);
        let ultimo = -1, n = 0;
        while (!P.vinta(griglia) && n < 1500) {
            const inizio = Date.now();
            const p = P.suggerimento(griglia, { ultimo, storia });
            maxMs = Math.max(maxMs, Date.now() - inizio);
            const nuova = p === null ? null : P.muovi(griglia, p);
            if (!nuova) { legali = false; break; }
            ultimo = griglia.indexOf(griglia.length - 1);
            griglia = nuova;
            storia.push(P.chiave(griglia));
            n++;
        }
        if (P.vinta(griglia)) risolte++;
        totaleMosse += n;
    }
    controlla(`${lato}×${lato}: 3 partite risolte seguendo solo i suggerimenti (${totaleMosse} mosse), sempre mosse legali`, risolte === 3 && legali);
    controlla(`${lato}×${lato}: ogni suggerimento in meno di un secondo (massimo ${maxMs} ms)`, maxMs < 1000);
}
// Riserva: la storia riporta indietro saltando i giri a vuoto
const g1 = P.muovi(P.risolta(4), 14), g2 = P.muovi(g1, 13), g3 = P.muovi(g2, 14); // giro a vuoto fino a g3
const storiaGiro = [P.risolta(4), g1, g2, g3, g2].map(P.chiave);
controlla('riserva: dalla storia si torna verso la soluzione saltando i giri', P.vinta(P.muovi(g1, P.primaMossaDaStoria(g1, storiaGiro)))
    && P.chiave(P.muovi(g2, P.primaMossaDaStoria(g2, storiaGiro))) === P.chiave(g1));

// --- Pagina, con il DOM minimo ---
const a = ambiente();
a.$('#livello').value = 'facile';
a.carica('puzzle_scorrevole/immagini.js');
a.carica('puzzle_scorrevole/funzioni.js');
a.carica('puzzle_scorrevole/main.js');
controlla('pagina: 9 tasselli nel 3×3, l\'ultimo è il mancante', a.$('#griglia').children.length === 9
    && a.$('#griglia').children[8].classList.contains('tassello--mancante'));
controlla('pagina: partita mescolata, zero mosse, tempo fermo', a.valore('mosse') === 0 && a.valore('timer') === null && !a.valore('Puzzle.vinta(griglia)'));
controlla('pagina: pulsante con 3 suggerimenti', a.$('#suggerimento').textContent.includes('(3)') && !a.$('#suggerimento').disabled);
const lontanoDalVuoto = a.valore('Puzzle.risolta(lato).find(p => !Puzzle.mobili(griglia).includes(p) && griglia[p] !== 8)');
a.esegui(`muoviTassello(${lontanoDalVuoto})`);
controlla('pagina: un tassello lontano non conta come mossa e non avvia il tempo', a.valore('mosse') === 0 && a.valore('timer') === null);
a.esegui('muoviTassello(Puzzle.mobili(griglia)[0])');
controlla('pagina: la prima mossa conta e avvia il tempo', a.valore('mosse') === 1 && a.valore('timer') !== null && a.$('#mosse').textContent === '1');
for (let k = 1; k <= 3; k++) {
    a.esegui('chiediSuggerimento()');
    const suggerito = a.valore('suggerito');
    const illuminati = a.$('#griglia').children.filter(t => t.classList.contains('tassello--suggerito'));
    controlla(`pagina: suggerimento ${k} illumina un solo tassello, mobile`, illuminati.length === 1 && illuminati[0] === a.$('#griglia').children[suggerito]
        && illuminati[0].classList.contains('tassello--mobile'));
    a.esegui('muoviTassello(griglia.indexOf(suggerito))');
}
controlla('pagina: a zero suggerimenti il pulsante si disattiva', a.$('#suggerimento').disabled && a.$('#suggerimento').textContent.includes('(0)'));
a.esegui('chiediSuggerimento()');
controlla('pagina: il quarto suggerimento non viene dato', a.valore('suggerimentiUsati') === 3 && a.valore('suggerito') === null);
a.esegui('mostraAnteprima(anteprimaBox.hidden)');
controlla('pagina: l\'anteprima si apre con l\'immagine della partita', !a.$('#anteprima_box').hidden
    && a.$('#anteprima_img').src === `immagini/${a.valore('immagine.file')}` && a.$('#anteprima').getAttribute('aria-expanded') === 'true');
// risolve con la ricerca esatta, mossa dopo mossa, come farebbe il giocatore
for (let k = 0; k < 40 && !a.valore('finita'); k++) a.esegui('muoviTassello(Puzzle.suggerimento(griglia))');
controlla('pagina: a puzzle completo la partita finisce, tempo fermo, tassello mancante visibile',
    a.valore('finita') && a.valore('timer') === null && a.$('#griglia').classList.contains('griglia-puzzle--completa'));
controlla('pagina: riepilogo con mosse, tempo e suggerimenti usati', !a.$('#riepilogo').hidden
    && a.$('#azioni').hidden && a.$('#riepilogo_mosse').textContent === String(a.valore('mosse')) && a.$('#riepilogo_suggerimenti').textContent === '3 su 3');
const mossePrima = a.valore('mosse');
a.esegui('muoviTassello(Puzzle.mobili(griglia)[0])');
controlla('pagina: a partita finita i tasselli non si muovono più', a.valore('mosse') === mossePrima && a.valore('Puzzle.vinta(griglia)'));
const immaginePrima = a.valore('immagine.file');
a.$('#livello').value = 'difficile';
a.esegui('iniziaPartita()');
controlla('pagina: nuova partita al 5×5 con 25 tasselli, immagine diversa, contatori azzerati', a.$('#griglia').children.length === 25
    && a.valore('immagine.file') !== immaginePrima && a.valore('mosse') === 0 && a.valore('suggerimentiUsati') === 0
    && a.$('#riepilogo').hidden && !a.$('#azioni').hidden && a.$('#anteprima_box').hidden && !a.$('#suggerimento').disabled);

console.log(falliti ? `${falliti} controlli falliti` : 'Tutti i controlli superati');
process.exitCode = falliti ? 1 : 0;
