// Verifiche supplementari dell'audit: nessuna modifica ai giochi.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    if (e.name === '.git' || e.name === 'node_modules') return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
const files = walk(root), rel = p => path.relative(root, p).replaceAll('\\', '/');
const html = files.filter(p => p.endsWith('.html'));
const problems = [], external = new Set(); let localRefs = 0;
for (const p of html) {
  const s = fs.readFileSync(p, 'utf8');
  const ids = [...s.matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1]);
  const dup = [...new Set(ids.filter((v, i) => ids.indexOf(v) !== i))];
  if (dup.length) problems.push([rel(p), 'duplicate-id', dup]);
  if (!/<html\b[^>]*\blang=["']it["']/i.test(s)) problems.push([rel(p), 'lang']);
  if (!/<meta\b[^>]*\bname=["']viewport["']/i.test(s)) problems.push([rel(p), 'viewport']);
  if ((s.match(/<h1\b/gi) || []).length !== 1) problems.push([rel(p), 'h1']);
  for (const m of s.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
    let ref = m[1];
    if (/^https?:/i.test(ref)) { external.add(ref); continue; }
    if (/^(?:#|data:|mailto:|javascript:)/i.test(ref)) continue;
    ref = ref.split(/[?#]/)[0];
    if (!ref) continue;
    localRefs++;
    const target = path.resolve(path.dirname(p), decodeURIComponent(ref));
    if (!fs.existsSync(target)) problems.push([rel(p), 'missing', ref]);
  }
}
for (const p of files.filter(p => p.endsWith('.css'))) {
  for (const m of fs.readFileSync(p, 'utf8').matchAll(/url\(\s*["']?([^\s)"']+)/g)) {
    if (/^(?:data:|https?:|#)/.test(m[1])) continue;
    localRefs++;
    if (!fs.existsSync(path.resolve(path.dirname(p), m[1].split(/[?#]/)[0]))) problems.push([rel(p), 'css-missing', m[1]]);
  }
}
const home = fs.readFileSync(path.join(root, 'home.js'), 'utf8');
const games = [...home.matchAll(/cartella: '([^']+)'/g)].map(m => m[1]);
for (const g of games) if (!fs.existsSync(path.join(root, g, 'index.html'))) problems.push(['home.js', 'missing-game', g]);
console.log(JSON.stringify({ html: html.length, games: games.length, duplicateGames: games.length - new Set(games).size,
  js: files.filter(p => p.endsWith('.js')).length, suites: files.filter(p => /[\\/]test-[^\\/]+\.js$/.test(p)).length,
  localRefs, externalLinks: external.size, totalBytes: files.reduce((n, p) => n + fs.statSync(p).size, 0), problems }, null, 2));

const { ambiente } = require('../scripts/dom-minimo.js');
const a = ambiente();
a.esegui('window.addEventListener = (tipo, fn) => { window[tipo] = fn; };');
a.$('#modalitaGioco').value = '1';
for (const f of ['js/mazzo.js', 'js/carte.js', 'klondike/funzioni.js', 'js/solitario-pagina.js', 'klondike/main.js']) a.carica(f);
const table = a.$('#tavoloSolitario');
const tapStock = () => {
  const el = table.children.find(x => x.dataset.pila === 'mazzo');
  const ev = { target: el, clientX: 10, clientY: 10, pointerId: 1, preventDefault() {} };
  table.listeners.pointerdown(ev); table.listeners.pointerup(ev);
};
const moves = () => Number(a.$('#puntiP1').textContent);
tapStock(); tapStock(); tapStock();
const undoCounts = [moves()];
for (let i = 0; i < 3; i++) { a.$('#annulla').listeners.click(); undoCounts.push(moves()); }
console.log('Klondike: 3 pescate e 3 annullamenti; contatori =', undoCounts);
console.log('Eventi tavolo solitari:', Object.keys(table.listeners));
console.log('Elementi tavolo con semantica pulsante o tabindex:', table.children.filter(e => e.type === 'button' || e.attributes.role === 'button' || e.attributes.tabindex !== undefined || e.tabIndex >= 0).length);

// Simula una vittoria per isolare il ciclo di vita del cronometro del controller.
a.$('#nuovaPartita').listeners.click();
a.esegui('Date.now = () => 100000; Klondike.vinto = () => true;');
tapStock();
const finalTime = a.$('#puntiP0').textContent;
a.esegui('Date.now = () => 160000; window.resize();');
console.log('Cronometro dopo fine partita e resize a +60 secondi:', finalTime, '=>', a.$('#puntiP0').textContent);

// Forza solo nel contesto isolato l'esaurimento dei tentativi del risolutore.
// Non dimostra una distribuzione reale irrisolvibile: verifica il ramo di fallback.
const vm = require('node:vm');
const source = fs.readFileSync(path.join(root, 'freecell/funzioni.js'), 'utf8');
const ctx = vm.createContext({ Mazzo: require('../js/mazzo.js') });
vm.runInContext(source.replace('if (opzioni.senzaControllo || risolvi(s, 150000)) return s;', 'if (false) return s;'), ctx);
console.log('FreeCell: ramo dopo 20 tentativi falliti restituisce comunque', vm.runInContext('Object.values(FreeCell.crea().pile).flat().length', ctx), 'carte senza verifica finale.');
