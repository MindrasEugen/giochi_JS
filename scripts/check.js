// Controlli senza dipendenze: sintassi e tutte le suite, dalla radice del progetto.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const radice = path.resolve(__dirname, '..');
function elenco(cartella) {
    return fs.readdirSync(cartella, { withFileTypes: true }).flatMap(voce => {
        if (['.git', 'node_modules'].includes(voce.name)) return [];
        const file = path.join(cartella, voce.name);
        return voce.isDirectory() ? elenco(file) : file.endsWith('.js') ? [file] : [];
    });
}
let falliti = 0;
const files = elenco(radice);
function esegui(argomenti) {
    const risultato = spawnSync(process.execPath, argomenti, { cwd: radice, stdio: 'inherit' });
    if (risultato.error) console.error(risultato.error.message);
    if (risultato.status !== 0) falliti++;
}
for (const file of files) esegui(['--check', file]);
const test = files.filter(file => /^test-.*\.js$/.test(path.basename(file)));
if (!process.argv.includes('--syntax-only')) {
    for (const file of test) { console.log(path.relative(radice, file)); esegui([file]); }
}
console.log(`${files.length} file JavaScript; ${test.length} suite disponibili; ${falliti} controlli falliti.`);
process.exitCode = falliti ? 1 : 0;
