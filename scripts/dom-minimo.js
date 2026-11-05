// DOM minimo per provare i controller delle pagine con Node, senza dipendenze.
// Non sostituisce un browser reale: niente rendering, CSS, focus nativo o touch.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class Elemento {
    constructor() {
        this.children = []; this.dataset = {}; this.attributes = {}; this.listeners = {};
        this.value = ''; this._testo = ''; this.inert = false; this.disabled = false; this.hidden = false;
        this.className = '';
        const classi = new Set();
        this.classList = {
            add: (...c) => c.forEach(x => classi.add(x)),
            remove: (...c) => c.forEach(x => classi.delete(x)),
            toggle: (c, forza) => ((forza ?? !classi.has(c)) ? classi.add(c) : classi.delete(c)),
            contains: c => classi.has(c)
        };
        this.style = { setProperty() {} };
    }
    // Come nel browser, scrivere textContent toglie i figli
    get textContent() { return this._testo || this.children.map(e => e.textContent).join(''); }
    set textContent(testo) { this._testo = String(testo); this.children = []; }
    set innerHTML(html) { this._testo = String(html).replace(/<[^>]*>/g, ''); this.children = []; }
    get innerHTML() { return this._testo; }
    append(...elementi) { for (const e of elementi) { e.parent = this; this.children.push(e); } }
    appendChild(e) { this.append(e); return e; }
    remove() { this.parent.children = this.parent.children.filter(e => e !== this); }
    setAttribute(k, v) { this.attributes[k] = String(v); }
    getAttribute(k) { return k in this.attributes ? this.attributes[k] : null; }
    addEventListener(k, fn) { this.listeners[k] = fn; }
    querySelectorAll(selettore) { return selettore === 'button' ? this.children.filter(e => e.type === 'button') : []; }
    querySelector() { return this.children[0] || null; }
    focus() {}
    // Basta per i selettori [data-...] usati dalle pagine: l'elemento stesso o un antenato con quel dato
    closest(selettore) {
        const dato = /\[data-([a-z]+)\]/.exec(selettore)?.[1];
        for (let e = this; e; e = e.parent) if (dato && e.dataset?.[dato] !== undefined) return e;
        return null;
    }
}

// Crea un contesto isolato: document finto, localStorage in memoria, timer registrati, eseguiti solo da svuotaTimer.
function ambiente() {
    const elementi = new Map();
    const dati = new Map();
    const timer = [];
    let ultimoTimer = 0;
    const document = {
        body: new Elemento(), activeElement: new Elemento(),
        createElement: () => new Elemento(),
        querySelector: selettore => {
            if (!elementi.has(selettore)) elementi.set(selettore, new Elemento());
            return elementi.get(selettore);
        },
        querySelectorAll: () => [], addEventListener() {}
    };
    const contesto = vm.createContext({ document, Element: Elemento, console, structuredClone, window: {},
        setTimeout: fn => { const id = ++ultimoTimer; timer.push({ id, fn }); return id; },
        clearTimeout: id => { const i = timer.findIndex(t => t.id === id); if (i >= 0) timer.splice(i, 1); },
        setInterval: () => 1, clearInterval() {},
        localStorage: {
            getItem: k => dati.has(k) ? dati.get(k) : null,
            setItem: (k, v) => dati.set(k, String(v))
        }
    });
    const esegui = codice => vm.runInContext(codice, contesto);
    const carica = file => esegui(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'));
    // Esegue i timer in attesa, anche quelli creati nel frattempo, fino a un massimo di passi
    const svuotaTimer = (massimo = 100) => {
        for (let i = 0; i < massimo && timer.length; i++) timer.shift().fn();
    };
    const $ = selettore => document.querySelector(selettore);
    // Copia con JSON: gli array del contesto hanno un prototipo diverso da quelli di Node
    const valore = espressione => JSON.parse(esegui(`JSON.stringify(${espressione})`));
    return { document, dati, timer, esegui, carica, svuotaTimer, $, valore };
}

// Giocatori finto: nomi fissi, finestre che si chiudono subito, barra della modalità catturata
const GIOCATORI_FINTI = `
    let barra;
    let segreti = [];
    const Giocatori = {
        leggiNomi: () => ['Uno', 'Due'],
        collegaBarra: b => { barra = b; return { dueGiocatori: () => false }; },
        passaDispositivo: async () => {},
        annuncia: async () => {},
        chiediSegreto: async () => segreti.shift()
    };`;

// Le funzioni async dei controller proseguono dopo qualche giro di microtask
const attendi = () => new Promise(r => setImmediate(r));

module.exports = { Elemento, ambiente, GIOCATORI_FINTI, attendi };
