// Controller reali e fotogrammi simulati: il rendering visivo va verificato nel browser.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');
class Elemento {
    constructor() { this.value = 'uno'; this.dataset = {}; this.listeners = {}; this.textContent = ''; this.hidden = false; }
    addEventListener(k, fn) { (this.listeners[k] ||= []).push(fn); }
    setAttribute(k, v) { this[k] = v; }
    matches(selettori) { return selettori.split(', ').includes(this.tag); }
    focus() { this.attivo = true; }
    setPointerCapture() {}
    getBoundingClientRect() { return { left: 0, top: 0, width: 480, height: 480 }; }
    getContext() { return new Proxy({}, { get: () => () => {} }); }
    emetti(k, extra = {}) { for (const f of this.listeners[k] || []) f({ target: this, preventDefault() {}, ...extra }); }
}
for (const gioco of ['serpente', 'ping_pong', 'mattoncini', 'blocchi', 'invasione', 'volo', 'labirinto']) {
    const nodi = new Map(), eventi = new Elemento(), finestra = new Elemento();
    let frame, barra;
    const documento = {
        body: new Elemento(), documentElement: new Elemento(), hidden: false,
        querySelector(k) {
            if (k === '.copertura' || (k === '#modalitaGioco' && ['mattoncini', 'invasione', 'labirinto'].includes(gioco))) return null;
            if (!nodi.has(k)) nodi.set(k, new Elemento()); return nodi.get(k);
        }, querySelectorAll: () => [],
        addEventListener: (...args) => eventi.addEventListener(...args), removeEventListener() {}
    };
    const salvati = new Map();
    const c = vm.createContext({ document: documento, Element: Elemento, window: finestra,
        getComputedStyle: () => ({ getPropertyValue: () => '#12372a' }),
        requestAnimationFrame: f => { frame = f; }, setTimeout: () => 1,
        localStorage: { getItem: k => salvati.get(k) ?? null, setItem: (k, v) => salvati.set(k, v) },
        Giocatori: { leggiNomi: () => ['Uno', 'Due'], collegaBarra: b => { barra = b; } }
    });
    const carica = f => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), c);
    carica('js/arcade.js'); carica('js/arcade-pagina.js'); carica(`${gioco}/funzioni.js`);
    vm.runInContext('const originale = ArcadePagina.avvia; ArcadePagina.avvia = c => { globalThis.config = c; originale(c); };', c);
    carica(`${gioco}/main.js`);
    const avvia = nodi.get('#avvia'), velo = nodi.get('#velo');
    assert.equal(avvia.textContent, 'Gioca');
    avvia.emetti('click'); assert.equal(velo.hidden, true); assert.equal(avvia.textContent, 'Pausa');
    frame(0); frame(20);
    finestra.emetti('blur'); assert.equal(avvia.textContent, 'Riprendi'); assert.equal(velo.hidden, false);
    avvia.emetti('click'); frame(10000); frame(10020);
    vm.runInContext('config.passo = s => { s.finita = true; };', c);
    frame(10040);
    assert.equal(avvia.textContent, 'Gioca ancora'); assert.equal(velo.hidden, false);
    nodi.get('#nuovaPartita').emetti('click'); assert.equal(avvia.textContent, 'Gioca');
    assert.equal(nodi.get('#punti1').textContent, 0);
    if (gioco === 'serpente') {
        // Gesti (Tappa 25): un tocco avvia, uno scorrimento gira, il pannello della tavola mette in pausa
        const canvas = nodi.get('canvas');
        vm.runInContext('const scorriVero = config.scorri; config.scorri = (...a) => { globalThis.ultimoGesto = a.slice(1); scorriVero(...a); };', c);
        const punto = (k, x, y) => canvas.emetti(k, { clientX: x, clientY: y, pointerId: 1 });
        punto('pointerdown', 100, 100); punto('pointerup', 100, 100);
        assert.equal(avvia.textContent, 'Pausa', 'un tocco sul campo avvia la partita');
        punto('pointerdown', 100, 100); punto('pointermove', 105, 110);
        assert.equal(vm.runInContext('globalThis.ultimoGesto', c), undefined, 'sotto la soglia non è un gesto');
        punto('pointermove', 104, 160);
        assert.deepEqual([...vm.runInContext('globalThis.ultimoGesto', c)], ['giu', false, 0]);
        punto('pointermove', 60, 162);
        assert.deepEqual([...vm.runInContext('globalThis.ultimoGesto', c)], ['sinistra', false, 0], 'gesto a L: due svolte');
        punto('pointerup', 60, 162);
        eventi.emetti('tavola:aperta');
        assert.equal(avvia.textContent, 'Riprendi', 'il pannello mette in pausa');
        punto('pointerdown', 400, 100); punto('pointerup', 400, 100);
        assert.equal(avvia.textContent, 'Pausa', 'un tocco riprende');
        nodi.get('#nuovaPartita').emetti('click');
    }
    if (barra) {
        nodi.get('#modalitaGioco').value = 'due'; barra.suCambioModalita(true);
        assert.equal(nodi.get('#etichetta1').textContent, 'Uno');
        assert.equal(nodi.get('#etichetta2').textContent, 'Due');
        barra.suCambioNomi(['Prima', 'Seconda']);
        assert.equal(nodi.get('#etichetta1').textContent, 'Prima');
        avvia.emetti('click');
        vm.runInContext('config.punti = () => 999;', c);
        if (gioco === 'volo') vm.runInContext('config.passo = s => { s.finita = true; s.risultati[s.turno] = s.turno === 0 ? 3 : 4; };', c);
        frame(11000); frame(11020);
        assert.equal(salvati.size, 0, 'il duello non sovrascrive il record personale');
        if (gioco === 'volo') {
            assert.equal(avvia.textContent, 'Gioca Seconda');
            avvia.emetti('click');
            assert.equal(nodi.get('#fase').textContent, 'Turno 2 / 2');
            assert.equal(nodi.get('#punti1').textContent, 3);
            frame(12000); frame(12020);
            assert.equal(avvia.textContent, 'Gioca ancora');
            assert.match(nodi.get('#messaggi').textContent, /Vince Seconda/);
            assert.equal(salvati.size, 0);
        }
    }
    console.log(`OK pagina ${gioco}: caricamento, disegno, avvio, blur, ripresa, fine e riavvio`);
}
