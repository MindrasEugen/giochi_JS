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
for (const gioco of ['serpente', 'ping_pong', 'mattoncini', 'blocchi', 'invasione', 'volo', 'labirinto', 'meteore']) {
    const nodi = new Map(), eventi = new Elemento(), finestra = new Elemento();
    let frame, barra;
    const documento = {
        body: new Elemento(), documentElement: new Elemento(), hidden: false,
        querySelector(k) {
            if (k === '.copertura' || (k === '#modalitaGioco' && ['mattoncini', 'invasione', 'labirinto', 'meteore'].includes(gioco))) return null;
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
    // Gesti sul campo (Tappe 25 e 26): un tocco a partita ferma avvia, il pannello della tavola mette in pausa
    const canvas = nodi.get('canvas');
    const ev = (k, x, y, id = 1) => canvas.emetti(k, { clientX: x, clientY: y, pointerId: id });
    const tocca = (x, y, id = 1) => { ev('pointerdown', x, y, id); ev('pointerup', x, y, id); };
    const val = codice => vm.runInContext(codice, c);
    assert.ok(val('typeof config.gesti === "object"'), `${gioco}: ha i gesti`);
    tocca(100, 100);
    assert.equal(avvia.textContent, 'Pausa', `${gioco}: un tocco sul campo avvia la partita`);
    eventi.emetti('tavola:aperta');
    assert.equal(avvia.textContent, 'Riprendi', `${gioco}: il pannello mette in pausa`);
    tocca(400, 100);
    assert.equal(avvia.textContent, 'Pausa', `${gioco}: un tocco riprende`);
    // Si registra ogni chiamata ai gesti, senza cambiarne l'effetto
    val(`globalThis.chiamate = []; for (const k of ['scorri', 'tocco', 'premi', 'trascina']) if (config.gesti[k]) {
        const vero = config.gesti[k]; config.gesti[k] = (...a) => { chiamate.push([k, ...a.slice(1)]); globalThis.ultimoStato = a[0]; return vero(...a); }; }`);
    const chiamate = () => JSON.parse(val('JSON.stringify(chiamate.splice(0))'));
    if (gioco === 'serpente' || gioco === 'labirinto') {
        ev('pointerdown', 100, 100); ev('pointermove', 105, 110);
        assert.deepEqual(chiamate(), [], `${gioco}: sotto la soglia non è un gesto`);
        ev('pointermove', 104, 160);
        assert.deepEqual(chiamate(), [['scorri', 'giu', false, 0]]);
        ev('pointermove', 60, 162);
        assert.deepEqual(chiamate(), [['scorri', 'sinistra', false, 0]], `${gioco}: gesto a L, due svolte`);
        ev('pointerup', 60, 162);
    }
    if (gioco === 'blocchi') {
        ev('pointerdown', 100, 100); ev('pointermove', 125, 100); ev('pointermove', 150, 100);
        assert.deepEqual(chiamate(), [['scorri', 'destra', false, 0], ['scorri', 'destra', false, 0]], 'blocchi: una colonna ogni soglia');
        ev('pointermove', 150, 130); ev('pointermove', 150, 160); ev('pointermove', 180, 160);
        assert.deepEqual(chiamate(), [['scorri', 'giu', false, 0]], 'blocchi: dopo la caduta il resto del gesto è ignorato');
        ev('pointerup', 180, 160);
        tocca(100, 100);
        assert.deepEqual(chiamate(), [['tocco', false, 0]], 'blocchi: il tocco ruota');
        ev('pointerdown', 100, 100); ev('pointermove', 130, 100); ev('pointerup', 130, 100);
        assert.deepEqual(chiamate(), [['scorri', 'destra', false, 0]], 'blocchi: uno scorrimento non è anche un tocco');
    }
    if (gioco === 'mattoncini') {
        ev('pointerdown', 240, 100);
        assert.deepEqual(chiamate().map(x => x[0]), ['premi', 'trascina'], 'mattoncini: appoggiare il dito lancia e muove');
        ev('pointermove', 120, 100);
        assert.equal(chiamate()[0][1].x, 150, 'mattoncini: il punto è in coordinate del campo');
        ev('pointerup', 120, 100);
    }
    if (gioco === 'volo') {
        ev('pointerdown', 100, 100);
        assert.deepEqual(chiamate(), [['premi', false, 0]], 'volo: il battito arriva appena il dito tocca');
        ev('pointerup', 100, 100);
    }
    if (gioco === 'invasione') {
        // Il passo finto legge solo i tasti premuti: la partita non avanza e non può finire durante il controllo
        val('const passoVero = config.passo; config.passo = (s, dt, t) => { globalThis.fuoco = t.has("Space"); };');
        const fuoco = t => { frame(t); frame(t + 20); return val('globalThis.fuoco'); };
        ev('pointerdown', 100, 400, 1);
        assert.equal(fuoco(20000), true, 'invasione: con il dito sul campo spara');
        ev('pointerdown', 300, 400, 2); ev('pointerup', 100, 400, 1);
        assert.equal(fuoco(20100), true, 'invasione: spara finché resta almeno un dito');
        ev('pointerup', 300, 400, 2);
        assert.equal(fuoco(20200), false, 'invasione: dita alzate, sparo fermo');
        val('config.passo = passoVero');
    }
    if (gioco === 'meteore') {
        // Il dito sul campo dà la mira (in coordinate del campo) e tiene premuto lo sparo; il passo vero qui è già sostituito
        val('config.passo = (s, dt, t) => { globalThis.fuoco = t.has("Space"); };');
        ev('pointerdown', 240, 100);
        assert.deepEqual(chiamate().map(x => x[0]), ['trascina'], 'meteore: il dito sul campo dà la mira');
        assert.equal(val('ultimoStato.dito.x'), 300, 'meteore: mira in coordinate del campo');
        frame(30000); frame(30020);
        assert.equal(val('globalThis.fuoco'), true, 'meteore: con il dito sul campo spara');
        ev('pointerup', 240, 100);
        frame(30040); frame(30060);
        assert.equal(val('globalThis.fuoco'), false, 'meteore: dito alzato, sparo fermo');
    }
    nodi.get('#nuovaPartita').emetti('click');
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
        if (gioco === 'ping_pong' || gioco === 'blocchi' || gioco === 'serpente') {
            // In due, due dita insieme (una per metà) comandano ognuna il proprio giocatore
            nodi.get('#nuovaPartita').emetti('click'); avvia.emetti('click');
            val('globalThis.chiamate = []');
            ev('pointerdown', 100, 100, 1); ev('pointerdown', 380, 300, 2);
            ev('pointermove', 100, 140, 1); ev('pointermove', 330, 300, 2);
            ev('pointermove', 260, 300, 2); // il dito di destra passa a sinistra ma resta del secondo giocatore
            ev('pointerup', 100, 140, 1); ev('pointerup', 260, 300, 2);
            const lati = chiamate().filter(x => x[0] !== 'premi').map(x => x[x.length - 1]);
            assert.ok(lati.includes(0) && lati.includes(1), `${gioco}: in due si usano entrambe le metà`);
            if (gioco === 'ping_pong') {
                // Ogni racchetta è centrata sull'ultimo punto del suo dito (y in coordinate del campo)
                const [r0, r1, A, R] = JSON.parse(val('JSON.stringify([...ultimoStato.racchette, PingPong.ALTEZZA, PingPong.RACCHETTA])'));
                const centro = y => Math.max(0, Math.min(A - R, y * A / 480 - R / 2));
                assert.equal(r0, centro(140), 'ping pong: racchetta sinistra dal primo dito');
                assert.equal(r1, centro(300), 'ping pong: racchetta destra dal secondo dito');
            }
        }
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
    console.log(`OK pagina ${gioco}: caricamento, disegno, avvio, blur, ripresa, fine, riavvio e gesti`);
}
