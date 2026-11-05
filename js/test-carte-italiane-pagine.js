// Pagine reali, timer controllati e mani private: nessuna dipendenza da browser o servizi.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
class Nodo {
    constructor(tag = 'div') {
        this.tag = tag; this.children = []; this.listeners = {}; this.dataset = {}; this.attributes = {}; this.value = 'uno';
        this.style = { setProperty() {} }; this.classList = { add() {}, toggle() {} };
    }
    set textContent(v) { this.testo = String(v); this.children = []; }
    get textContent() { return this.testo || ''; }
    append(...nodi) { this.children.push(...nodi); }
    appendChild(n) { this.append(n); return n; }
    setAttribute(k, v) { this.attributes[k] = v; }
    addEventListener(k, f) { (this.listeners[k] ||= []).push(f); }
    querySelector(tag) { for (const n of this.children) { if (n.tag === tag) return n; const trovato = n.querySelector(tag); if (trovato) return trovato; } return null; }
    focus() {}
    click() { if (!this.disabled) for (const f of this.listeners.click || []) f(); }
}
function immagini(nodo) { return nodo.children.flatMap(n => n.tag === 'img' ? [n] : immagini(n)); }
async function verifica(cartella) {
    const nodi = new Map(), timer = new Map(), passaggi = [];
    let barra, idTimer = 0, pannelloAperto = false;
    const inAttesa = [];
    const document = { createElement: t => new Nodo(t), querySelector: k => {
        if (!nodi.has(k)) nodi.set(k, new Nodo()); return nodi.get(k);
    } };
    const contesto = vm.createContext({ document,
        setTimeout: f => { timer.set(++idTimer, f); return idTimer; }, clearTimeout: id => timer.delete(id),
        // Pannello della tavola finto (js/tavola.js): aperto, le azioni aspettano la chiusura
        Tavola: { aperto: () => pannelloAperto, quandoChiuso: f => { if (pannelloAperto) inAttesa.push(f); else f(); } },
        Giocatori: { leggiNomi: () => ['Uno', 'Due'], collegaBarra: b => { barra = b; },
            passaDispositivo: nome => new Promise(resolve => passaggi.push({ nome, resolve })) }
    });
    const esegui = codice => vm.runInContext(codice, contesto);
    function carica(f) { esegui(fs.readFileSync(path.join(__dirname, '..', f), 'utf8')); }
    for (const f of ['js/mazzo.js', 'js/carte.js', 'js/prese-italiane.js', 'js/carte-italiane-pagina.js', `${cartella}/funzioni.js`]) carica(f);
    esegui(`const originale = CarteItalianePagina.avvia;
        CarteItalianePagina.avvia = config => {
            globalThis.config = config; const crea = config.motore.crea;
            config.motore.crea = (...args) => {
                let n = 123; const casuale = () => { n = (Math.imul(n, 1664525) + 1013904223) >>> 0; return n / 4294967296; };
                globalThis.statoTest = config.briscola ? crea(args[0], casuale) : crea(casuale); return statoTest;
            }; originale(config);
        };`);
    carica(`${cartella}/main.js`);
    const stato = () => esegui('statoTest');
    const motore = () => esegui('config.motore');
    const completaMossa = () => {
        const s = stato(), m = motore().mossaPC(s);
        const scelte = motore().mosseLegali(s).filter(x => x.carta === m.carta);
        nodi.get('#mano').children[m.carta].click();
        const bottoni = nodi.get('#opzioniPresa').children;
        if (bottoni.length) {
            const indice = scelte.findIndex(x => x.ruba === m.ruba && x.presa.join() === m.presa.join());
            bottoni[indice].click();
        }
    };
    const passoTimer = () => {
        const prossimo = timer.entries().next().value;
        assert.ok(prossimo, 'deve esserci un turno PC pianificato'); timer.delete(prossimo[0]); prossimo[1]();
    };
    const svuota = async () => { await Promise.resolve(); await Promise.resolve(); };
    assert.equal(immagini(nodi.get('#mano')).length, 3);
    assert.ok(immagini(nodi.get('#mano')).every(img => img.alt !== 'Carta coperta'));
    assert.ok(immagini(nodi.get('#avversari')).every(img => img.alt === 'Carta coperta' && /dorso\.png$/.test(img.src)));
    // Un callback PC già accodato non può modificare la nuova smazzata.
    completaMossa(); const vecchioTimer = timer.values().next().value;
    assert.ok(vecchioTimer); nodi.get('#nuovaPartita').click();
    const nuova = JSON.stringify(stato()); vecchioTimer(); assert.equal(JSON.stringify(stato()), nuova);
    // Pannello aperto (Tappa 27.1): il PC non gioca finché non si chiude
    if (stato().turno === 0) completaMossa();
    const primaDelPannello = JSON.stringify(stato());
    pannelloAperto = true; passoTimer();
    assert.equal(JSON.stringify(stato()), primaDelPannello, 'con il pannello aperto il PC aspetta');
    assert.equal(inAttesa.length, 1);
    pannelloAperto = false; inAttesa.shift()();
    assert.notEqual(JSON.stringify(stato()), primaDelPannello, 'chiuso il pannello il PC gioca');
    nodi.get('#nuovaPartita').click(); timer.clear();
    async function termina(due) {
        let azioni = 0;
        while (!stato().finita) {
            assert.ok(++azioni < 250);
            if (passaggi.length) {
                assert.equal(nodi.get('#nuovaPartita').disabled, true);
                assert.ok(immagini(nodi.get('#mano')).every(img => img.alt === 'Carta coperta' && /dorso\.png$/.test(img.src)));
                assert.ok(nodi.get('#mano').children.every(b => b.attributes['aria-label'] === 'Carta coperta'));
                const p = passaggi.shift(); assert.ok(['Uno', 'Due'].includes(p.nome)); p.resolve(); await svuota();
                assert.ok(immagini(nodi.get('#avversari')).every(img => img.alt === 'Carta coperta'));
            } else if (stato().presaCompleta) nodi.get('#continua').click();
            else if (due || stato().turno === 0) completaMossa();
            else passoTimer();
        }
        assert.equal(nodi.get('#risultati').hidden, false);
        assert.match(nodi.get('#messaggi').textContent, /Vince|pareggio/);
        assert.equal(stato().catturate.flat().length, 40);
        assert.equal(immagini(nodi.get('#mano')).length, 0);
    }
    await termina(false);
    nodi.get('#modalitaGioco').value = 'due'; barra.suCambioModalita(true);
    assert.equal(passaggi.length, 1); await termina(true);
    if (cartella === 'briscola') {
        nodi.get('#modalitaGioco').value = 'quattro'; barra.suCambioModalita(false);
        assert.equal(stato().mani.length, 4); assert.equal(immagini(nodi.get('#avversari')).length, 9);
        await termina(false); assert.equal(stato().punti[0] + stato().punti[1], 120);
    }
    console.log(`OK pagina ${cartella}: smazzate complete, PC, prese, mani segrete, passaggi, riavvio durante attesa e pausa con il pannello`);
}
(async () => { for (const c of ['briscola', 'scopa', 'asso_piglia_tutto', 'rubamazzetto']) await verifica(c); })()
    .catch(errore => { console.error(errore); process.exitCode = 1; });
