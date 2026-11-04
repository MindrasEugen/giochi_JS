// Integrazione dei PNG con il controller reale: movimento, cattura e promozione.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
class Nodo {
    constructor(tag = 'div') {
        this.tag = tag; this.children = []; this.dataset = {}; this.listeners = {}; this.attributes = {};
        this.classList = { toggle() {} };
    }
    set textContent(testo) { this.testo = testo; this.children = []; }
    get textContent() { return this.testo || ''; }
    appendChild(nodo) {
        if (nodo.parent) nodo.parent.children = nodo.parent.children.filter(n => n !== nodo);
        nodo.parent = this; this.children.push(nodo); return nodo;
    }
    addEventListener(k, fn) { this.listeners[k] = fn; }
    setAttribute(k, v) { this.attributes[k] = v; }
    querySelectorAll() { return this.scelte || []; }
    querySelector() { return this.scelte[0]; }
    focus() {}
}
const nodi = new Map();
const document = {
    createElement: tag => new Nodo(tag),
    querySelector(k) { if (!nodi.has(k)) nodi.set(k, new Nodo()); return nodi.get(k); }
};
const promozione = document.querySelector('#promozione');
promozione.scelte = ['Q', 'R', 'B', 'N'].map(pezzo => { const n = new Nodo('button'); n.dataset.pezzo = pezzo; return n; });
const c = vm.createContext({ document, setTimeout: () => 1, clearTimeout() {},
    Giocatori: { leggiNomi: () => ['Uno', 'Due'], collegaBarra() {} } });
const esegui = codice => vm.runInContext(codice, c);
for (const file of ['funzioni.js', 'main.js']) esegui(fs.readFileSync(path.join(__dirname, file), 'utf8'));
function immagini(nodo) { return nodo.children.flatMap(n => n.tag === 'img' ? [n] : immagini(n)); }
const tavolo = nodi.get('#scacchiera');
assert.equal(immagini(tavolo).length, 32);
const fileAttesi = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'];
for (const lato of ['white', 'black']) for (const tipo of fileAttesi) {
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'pezzi_scacco', `${lato}-${tipo}.png`)));
}
assert.ok(immagini(tavolo).every(img => img.alt === '' && img.attributes['aria-hidden'] === 'true' && img.draggable === false));
esegui("dueGiocatori = true; clicCasella(casaDaNome('e2')); clicCasella(casaDaNome('e4'));");
assert.match(esegui("caselle[casaDaNome('e4')].children[0].src"), /white-pawn\.png$/);
esegui("stato = daFEN('4k3/8/8/3q4/8/8/3R4/4K3 w - - 0 1'); storiaStati = []; mosseScritte = []; finita = false; disegna(); clicCasella(casaDaNome('d2')); clicCasella(casaDaNome('d5'));");
const cattura = immagini(nodi.get('#catturatiW'));
assert.equal(cattura.length, 1); assert.match(cattura[0].src, /black-queen\.png$/); assert.equal(cattura[0].alt, 'donna nera');
esegui('annulla()'); assert.equal(immagini(nodi.get('#catturatiW')).length, 0);
for (const [fen, da, a, lato, pezzo] of [
    ['8/4P3/8/8/8/8/k7/4K3 w - - 0 1', 'e7', 'e8', 'white', 'Q'],
    ['4k3/8/8/8/8/8/4p3/K7 b - - 0 1', 'e2', 'e1', 'black', 'q']
]) {
    esegui(`stato = daFEN('${fen}'); finita = false; selezionata = null; mosseValide = []; disegna(); clicCasella(casaDaNome('${da}')); clicCasella(casaDaNome('${a}'));`);
    assert.equal(promozione.hidden, false);
    assert.ok(promozione.scelte.every(b => b.children[0].src.includes(`/${lato}-`)));
    promozione.scelte[0].listeners.click();
    assert.equal(esegui(`stato.scacchiera[casaDaNome('${a}')]`), pezzo);
    assert.match(esegui(`caselle[casaDaNome('${a}')].children[0].src`), new RegExp(`${lato}-queen\\.png$`));
}
nodi.get('#gira').listeners.click();
assert.equal(tavolo.children[0], esegui('caselle[63]'));
assert.ok(immagini(tavolo).every(img => fs.existsSync(path.resolve(__dirname, img.src))));
console.log('OK PNG Scacchi: 12 asset, 32 pezzi iniziali, movimento, cattura, annullamento, promozioni nei due colori e rotazione');
