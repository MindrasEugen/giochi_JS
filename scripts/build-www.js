// Prepara la cartella www/ per l'app Android (Tappa 28, ADR 0013): una copia dei soli file che servono per giocare.
// Restano fuori la documentazione del progetto, i test, gli script e le cartelle di strumenti.
// Uso: pnpm build (poi pnpm exec cap sync android)
const fs = require('node:fs');
const path = require('node:path');

const radice = path.resolve(__dirname, '..');
const destinazione = path.join(radice, 'www');

// Cartelle e file della radice che non fanno parte dei giochi
const ESCLUSI = new Set([
    '.git', '.gitignore', '.vscode', 'node_modules', 'www', 'android',
    'PLAN', 'ADR', 'audit', 'scripts',
    'package.json', 'pnpm-lock.yaml', 'capacitor.config.json',
    'anteprima-componenti.html' // pagina di prova dei componenti, non un gioco
]);
// In tutte le cartelle: test, appunti in Markdown, file di sistema
const escluso = nome => /^test-.*\.js$/.test(nome) || nome.endsWith('.md') || nome === 'Thumbs.db' || nome === '.DS_Store';

function copia(da, a) {
    let file = 0;
    fs.mkdirSync(a, { recursive: true });
    for (const voce of fs.readdirSync(da, { withFileTypes: true })) {
        if (escluso(voce.name) || (da === radice && ESCLUSI.has(voce.name))) continue;
        const sorgente = path.join(da, voce.name), arrivo = path.join(a, voce.name);
        if (voce.isDirectory()) file += copia(sorgente, arrivo);
        else { fs.copyFileSync(sorgente, arrivo); file++; }
    }
    return file;
}

fs.rmSync(destinazione, { recursive: true, force: true });
const totale = copia(radice, destinazione);
if (!fs.existsSync(path.join(destinazione, 'index.html'))) throw new Error('www/index.html mancante');
console.log(`www/ pronta: ${totale} file copiati.`);
