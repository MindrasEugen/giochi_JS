// Regressioni dei controller con un DOM minimo; non sostituisce un browser reale.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class Elemento {
    constructor() {
        this.children = []; this.dataset = {}; this.attributes = {}; this.listeners = {};
        this.value = ''; this.textContent = ''; this.inert = false;
        this.classList = { add() {}, remove() {}, toggle() {} };
        this.style = { setProperty() {} };
    }
    append(...elementi) { for (const e of elementi) { e.parent = this; this.children.push(e); } }
    appendChild(e) { this.append(e); return e; }
    remove() { this.parent.children = this.parent.children.filter(e => e !== this); }
    setAttribute(k, v) { this.attributes[k] = v; }
    addEventListener(k, fn) { this.listeners[k] = fn; }
    querySelectorAll() { return []; }
    querySelector() { return this.children[0] || null; }
    focus() {}
}
function ambiente() {
    const elementi = new Map();
    const dati = new Map();
    const document = {
        body: new Elemento(), activeElement: new Elemento(),
        createElement: () => new Elemento(),
        querySelector: selettore => {
            if (!elementi.has(selettore)) elementi.set(selettore, new Elemento());
            return elementi.get(selettore);
        },
        querySelectorAll: () => [], addEventListener() {}
    };
    const contesto = vm.createContext({ document, Element: Elemento, console,
        setTimeout: () => 1, clearTimeout() {}, setInterval: () => 1, clearInterval() {},
        localStorage: {
            getItem: k => dati.has(k) ? dati.get(k) : null,
            setItem: (k, v) => dati.set(k, String(v))
        }
    });
    const esegui = codice => vm.runInContext(codice, contesto);
    const carica = file => esegui(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'));
    return { document, dati, esegui, carica };
}

for (const gioco of ['campo_minato', 'sudoku']) {
    const a = ambiente();
    a.document.querySelector(gioco === 'sudoku' ? '#difficolta' : '#livello').value = 'facile';
    a.carica(`${gioco}/funzioni.js`);
    a.carica(`${gioco}/main.js`);
    assert.equal(a.esegui('leggiRecord()'), null);
    a.esegui('salvaRecord(0)');
    assert.equal(a.esegui('leggiRecord()'), 0);
    assert.equal(a.esegui('salvaRecord(1)'), false);
    a.dati.set(a.esegui('chiaveRecord()'), 'Infinity');
    assert.equal(a.esegui('leggiRecord()'), null);
    console.log(`OK ${gioco}: record assente, zero, confronto e valore non finito`);
}

const banco = ambiente();
banco.carica('js/mazzo.js');
banco.esegui("const Carte = { crea: () => document.createElement('img') }; let barra; const Giocatori = { leggiNomi: () => ['Uno', 'Due'], collegaBarra: b => { barra = b; } };");
banco.carica('sette_e_mezzo/main.js');
banco.esegui("barra.suCambioModalita(true); fineMano('banco', 'Fine'); barra.suCambioNomi(['Primo', 'Secondo']);");
assert.equal(banco.document.querySelector('#nome_banco').textContent, 'Banco: Secondo');
banco.esegui('iniziaMano()');
assert.equal(banco.document.querySelector('#nome_banco').textContent, 'Banco: Primo');
banco.esegui("fineMano('banco', 'Fine'); barra.suCambioModalita(false); barra.suCambioModalita(true);");
assert.equal(banco.document.querySelector('#nome_banco').textContent, 'Banco: Secondo');
console.log('OK sette e mezzo: cambio nomi a mano conclusa, scambio banco e cambio modalita');

const home = ambiente();
home.carica('home.js');
assert.equal(home.esegui("creaScheda(GIOCHI.find(g => g.cartella === 'ludo')).children[3].children[0].textContent"), '1\u20134 giocatori');
console.log('OK home: Ludo mostra fino a quattro giocatori');

const finestre = ambiente();
const sfondo = new Elemento();
const giaInerte = new Elemento(); giaInerte.inert = true;
finestre.document.body.append(sfondo, giaInerte);
finestre.carica('js/giocatori.js');
finestre.esegui("Giocatori.annuncia({ titolo: 'Test', testo: 'Verifica focus' })");
assert.equal(sfondo.inert, true);
const copertura = finestre.document.body.children[2];
copertura.children[0].children[2].children[0].listeners.click();
assert.equal(sfondo.inert, false);
assert.equal(giaInerte.inert, true);
assert.equal(finestre.document.body.children.length, 2);
console.log('OK finestre: sfondo inerte e ripristino dello stato precedente');
