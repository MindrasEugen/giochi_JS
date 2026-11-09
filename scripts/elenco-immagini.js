// Elenco automatico delle immagini del Puzzle scorrevole (Tappa 35).
// Il browser non può leggere il contenuto di una cartella: questo script la legge sul PC e scrive
// puzzle_scorrevole/immagini.js con l'elenco dei file. Basta copiare le immagini in puzzle_scorrevole/immagini/.
// Nome mostrato sotto l'anteprima: il <title> dell'SVG; se manca, il nome del file
// ("13-faro-nella-tempesta.svg" → "Faro nella tempesta").
// Uso: pnpm immagini (gira da solo anche con pnpm build e pnpm sync)
const fs = require('node:fs');
const path = require('node:path');

const cartella = path.join(__dirname, '..', 'puzzle_scorrevole', 'immagini');
const destinazione = path.join(__dirname, '..', 'puzzle_scorrevole', 'immagini.js');
const FORMATI = /\.(svg|png|jpe?g|webp)$/i;

const ENTITA = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&#39;': "'" };
const decodifica = testo => testo.replace(/&(amp|lt|gt|quot|apos|#39);/g, e => ENTITA[e]);

// "13-faro-nella-tempesta.svg" → "Faro nella tempesta"
function nomeDaFile(file) {
    const parole = file.replace(FORMATI, '').replace(/^\d+[-_ ]*/, '').replace(/[-_]+/g, ' ').trim();
    return parole ? parole[0].toUpperCase() + parole.slice(1) : file;
}

function nomeImmagine(file) {
    if (/\.svg$/i.test(file)) {
        const titolo = /<title[^>]*>([^<]+)<\/title>/i.exec(fs.readFileSync(path.join(cartella, file), 'utf8'));
        if (titolo && titolo[1].trim()) return decodifica(titolo[1].trim().replace(/\s+/g, ' '));
    }
    return nomeDaFile(file);
}

function elenco() {
    return fs.readdirSync(cartella)
        .filter(file => FORMATI.test(file))
        .sort((a, b) => a.localeCompare(b, 'it', { numeric: true }))
        .map(file => ({ file, nome: nomeImmagine(file) }));
}

function scrivi() {
    const immagini = elenco();
    if (!immagini.length) throw new Error('Nessuna immagine in puzzle_scorrevole/immagini/');
    const righe = immagini.map(i => `    ${JSON.stringify(i)}`).join(',\n');
    const testo = `// File generato da scripts/elenco-immagini.js: non modificarlo a mano.
// Per aggiungere un'immagine copiala in puzzle_scorrevole/immagini/ e avvia: pnpm immagini
const IMMAGINI_PUZZLE = [
${righe}
];

if (typeof module !== 'undefined') {
    module.exports = IMMAGINI_PUZZLE;
}
`;
    const prima = fs.existsSync(destinazione) ? fs.readFileSync(destinazione, 'utf8') : '';
    if (prima.replace(/\r\n/g, '\n') !== testo) fs.writeFileSync(destinazione, testo);
    console.log(`Puzzle scorrevole: ${immagini.length} immagini nell'elenco.`);
    return immagini;
}

if (require.main === module) scrivi();
module.exports = { elenco, nomeDaFile, scrivi };
