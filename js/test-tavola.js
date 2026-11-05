// js/tavola.js con un DOM finto ad albero: spostamento nel pannello sul telefono, ritorno al posto
// sugli schermi larghi, apertura e chiusura (sfondo inerte, eventi, Esc), opzioni ricordate nel browser.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');

class Nodo {
    constructor(tag, attributi = {}) {
        this.tag = tag; this.children = []; this.parent = null; this.listeners = {}; this.inert = false; this.hidden = false;
        this.dataset = {}; this.attributes = {}; this.className = attributi.class || ''; this.id = attributi.id || '';
        this.textContent = ''; this.open = false;
        if ('data-pannello' in attributi) this.dataset.pannello = '';
        const nodo = this;
        this.classList = {
            add: (...c) => { nodo.className = [...new Set([...nodo.className.split(' ').filter(Boolean), ...c])].join(' '); },
            remove: (...c) => { nodo.className = nodo.className.split(' ').filter(x => !c.includes(x)).join(' '); },
            contains: c => nodo.className.split(' ').includes(c),
            toggle: (c, si) => (si ?? !nodo.classList.contains(c)) ? nodo.classList.add(c) : nodo.classList.remove(c)
        };
    }
    stacca() { if (this.parent) { this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = null; } }
    appendChild(n) { n.stacca(); n.parent = this; this.children.push(n); return n; }
    append(...n) { n.forEach(x => this.appendChild(x)); }
    prepend(n) { n.stacca(); n.parent = this; this.children.unshift(n); }
    before(n) { n.stacca(); n.parent = this.parent; this.parent.children.splice(this.parent.children.indexOf(this), 0, n); }
    replaceWith(n) { const p = this.parent, i = p.children.indexOf(this); n.stacca(); p.children[i] = n; n.parent = p; this.parent = null; }
    setAttribute(k, v) { this.attributes[k] = String(v); if (k === 'id') this.id = v; }
    getAttribute(k) { return k in this.attributes ? this.attributes[k] : null; }
    addEventListener(k, f) { (this.listeners[k] ||= []).push(f); }
    emetti(k, extra = {}) { for (const f of this.listeners[k] || []) f({ target: this, preventDefault() {}, ...extra }); }
    focus() { documento.activeElement = this; }
    get offsetParent() { return this; }
    // Selettori semplici (tag, .classe, #id, [data-x]) e un solo livello "antenato discendente"
    corrisponde(s) {
        if (s.startsWith('.')) return this.classList.contains(s.slice(1));
        if (s.startsWith('#')) return this.id === s.slice(1);
        if (s === '[data-pannello]') return 'pannello' in this.dataset;
        if (s === 'a[href]') return this.tag === 'a';
        return this.tag === s;
    }
    tutti() { return this.children.flatMap(c => [c, ...c.tutti()]); }
    querySelectorAll(selettore) {
        const parti = selettore.split(',').map(x => x.trim().split(/\s+/));
        return this.tutti().filter(n => parti.some(p => p.length === 1 ? n.corrisponde(p[0])
            : n.corrisponde(p[1]) && (() => { for (let a = n.parent; a; a = a.parent) if (a.corrisponde(p[0])) return true; return false; })()));
    }
    querySelector(s) { return this.querySelectorAll(s)[0] || null; }
}

let documento;
function pagina({ largo = false, salvati = new Map() } = {}) {
    const body = new Nodo('body');
    const main = body.appendChild(new Nodo('main', { id: 'contenitore_gioco' }));
    const home = main.appendChild(new Nodo('a', { class: 'link-home', 'data-pannello': '' }));
    home.setAttribute('href', '../index.html');
    const intro = main.appendChild(new Nodo('header', { class: 'intro', 'data-pannello': '' }));
    const campo = main.appendChild(new Nodo('section', { class: 'tavolo' }));
    const regole = main.appendChild(new Nodo('details', { class: 'pannello regole', 'data-pannello': '' }));
    const fondo = main.appendChild(new Nodo('p', { class: 'fonti' }));
    const eventi = [], ascoltatori = {};
    const media = { matches: largo, listeners: [], addEventListener(k, f) { this.listeners.push(f); } };
    documento = {
        body, title: 'Serpente | Giochi JS', activeElement: body, fullscreenEnabled: false, documentElement: new Nodo('html'),
        createElement: tag => new Nodo(tag), createComment: () => new Nodo('#commento'),
        querySelector: s => body.querySelector(s), querySelectorAll: s => body.querySelectorAll(s),
        addEventListener: (k, f, o) => { const lista = (ascoltatori[k] ||= []); lista.push(o?.once ? function una(e) { lista.splice(lista.indexOf(una), 1); f(e); } : f); },
        dispatchEvent: e => { eventi.push(e.type); [...(ascoltatori[e.type] || [])].forEach(f => f(e)); }
    };
    const c = vm.createContext({ document: documento, CustomEvent: class { constructor(t) { this.type = t; } },
        window: { matchMedia: () => media },
        localStorage: { getItem: k => salvati.get(k) ?? null, setItem: (k, v) => salvati.set(k, v) } });
    vm.runInContext(fs.readFileSync(path.join(__dirname, 'tavola.js'), 'utf8') + '\nglobalThis.Tavola = Tavola;', c);
    const pannello = body.querySelector('.pannello-tavola');
    return { c, body, main, home, intro, campo, regole, fondo, eventi, media, salvati, pannello, Tavola: c.Tavola,
        contenuto: pannello.querySelector('.pannello-tavola__contenuto'), barra: main.children[0] };
}

// Telefono: barra in cima, elementi segnati nel pannello nell'ordine della pagina, tavola e resto al loro posto
const p = pagina();
assert.ok(p.body.classList.contains('con-tavola'));
assert.ok(p.barra.classList.contains('barra-tavola'));
assert.equal(p.barra.querySelector('.barra-tavola__casa').getAttribute('href'), '../index.html');
assert.equal(p.barra.querySelector('.barra-tavola__titolo').textContent, 'Serpente');
assert.deepEqual(p.contenuto.children.map(n => n.tag), ['a', 'header', 'details']);
assert.ok(p.main.children.includes(p.campo) && p.main.children.includes(p.fondo));
assert.equal(p.pannello.hidden, true);
console.log('OK telefono: barra in cima e contenuti nel pannello');

// "Regole" apre il pannello sulle regole: sfondo inerte, evento, poi Esc chiude e ripristina
const [pulsanteRegole, pulsanteMenu] = p.barra.querySelectorAll('button');
pulsanteRegole.emetti('click');
assert.equal(p.Tavola.aperto(), true);
assert.equal(p.pannello.hidden, false);
assert.equal(p.regole.open, true);
assert.equal(p.main.inert, true);
assert.equal(p.pannello.inert, false);
assert.deepEqual(p.eventi, ['tavola:aperta']);
pulsanteRegole.emetti('click');
assert.deepEqual(p.eventi, ['tavola:aperta'], 'un secondo tocco non riapre');
p.pannello.emetti('keydown', { key: 'Escape' });
assert.equal(p.Tavola.aperto(), false);
assert.equal(p.main.inert, false);
assert.equal(p.pannello.hidden, true);
assert.deepEqual(p.eventi, ['tavola:aperta', 'tavola:chiusa']);
// Menu, poi tocco sul velo fuori dalla finestra; un tocco dentro la finestra non chiude
pulsanteMenu.emetti('click');
p.pannello.querySelector('.pannello-tavola__finestra').emetti('click');
assert.equal(p.Tavola.aperto(), true);
p.pannello.emetti('click');
assert.equal(p.Tavola.aperto(), false);
console.log('OK apertura e chiusura: regole, menu, Esc, tocco sul velo');

// Opzione: valore predefinito, salvataggio, ricordata alla pagina successiva
const cambi = [];
const leggi = p.Tavola.opzione({ chiave: 'prova', etichetta: 'Mostra i pulsanti', suCambio: v => cambi.push(v) });
assert.deepEqual(cambi, [false]);
const casella = p.pannello.querySelector('input');
casella.checked = true; casella.emetti('change');
assert.equal(leggi(), true); assert.deepEqual(cambi, [false, true]); assert.equal(p.salvati.get('prova'), 'si');
assert.equal(p.pannello.querySelector('.pannello-tavola__opzioni').hidden, false);
const q = pagina({ salvati: p.salvati });
const cambi2 = [];
q.Tavola.opzione({ chiave: 'prova', etichetta: 'Mostra i pulsanti', suCambio: v => cambi2.push(v) });
assert.deepEqual(cambi2, [true]);
assert.equal(q.pannello.querySelector('input').checked, true);
console.log('OK opzioni ricordate nel browser');

// quandoChiuso: subito a pannello chiuso, dopo la chiusura a pannello aperto
const fatti = [];
q.Tavola.quandoChiuso(() => fatti.push('subito'));
q.barra.querySelectorAll('button')[1].emetti('click');
q.Tavola.quandoChiuso(() => fatti.push('dopo'));
assert.deepEqual(fatti, ['subito']);
q.pannello.emetti('keydown', { key: 'Escape' });
assert.deepEqual(fatti, ['subito', 'dopo']);
q.barra.querySelectorAll('button')[1].emetti('click'); q.pannello.emetti('keydown', { key: 'Escape' });
assert.deepEqual(fatti, ['subito', 'dopo'], 'una sola volta');
console.log('OK azioni rimandate alla chiusura del pannello');

// Il telefono ruotato o la finestra allargata: tutto torna al suo posto e il pannello si chiude
q.barra.querySelectorAll('button')[0].emetti('click');
q.media.matches = true; q.media.listeners.forEach(f => f());
assert.equal(q.Tavola.aperto(), false);
assert.deepEqual(q.main.children.map(n => n.tag), ['nav', 'a', 'header', 'section', 'details', 'p']);
assert.equal(q.contenuto.children.length, 0);
q.media.matches = false; q.media.listeners.forEach(f => f());
assert.deepEqual(q.contenuto.children.map(n => n.tag), ['a', 'header', 'details']);
// Schermo largo fin dall'inizio: nulla viene spostato
const r = pagina({ largo: true });
assert.deepEqual(r.main.children.map(n => n.tag), ['nav', 'a', 'header', 'section', 'details', 'p']);
console.log('OK schermo largo: pagina come prima');
