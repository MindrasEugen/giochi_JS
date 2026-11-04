// Pagine della Tappa 19 (Scopone, Cirulla, Tressette, Briscola chiamata) con un DOM minimo:
// smazzate complete tramite i pulsanti, mani PC sempre coperte, asta e scelta del seme con i pulsanti delle opzioni.
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
const immagini = nodo => nodo.children.flatMap(n => n.tag === 'img' ? [n] : immagini(n));
const GIOCHI = {
    scopone: { file: ['js/prese-italiane.js'], modalita: { uno: [0], due: [0, 1] }, numero: () => 4 },
    cirulla: { file: ['js/prese-italiane.js'], modalita: { uno: [0], due: [0, 1] }, numero: () => 2 },
    tressette: { file: [], modalita: { uno: [0], due: [0, 1], quattro: [0] }, numero: m => m === 'quattro' ? 4 : 2 },
    briscola_chiamata: { file: ['briscola/funzioni.js'], modalita: { uno: [0] }, numero: () => 5 }
};
async function verifica(cartella) {
    const gioco = GIOCHI[cartella];
    const nodi = new Map(), timer = new Map(), passaggi = [];
    let barra, idTimer = 0;
    const document = { createElement: t => new Nodo(t), querySelector: k => { if (!nodi.has(k)) nodi.set(k, new Nodo()); return nodi.get(k); } };
    const $ = k => document.querySelector(k);
    const contesto = vm.createContext({ document,
        setTimeout: f => { timer.set(++idTimer, f); return idTimer; }, clearTimeout: id => timer.delete(id),
        Giocatori: { leggiNomi: () => ['Uno', 'Due'], collegaBarra: b => { barra = b; },
            passaDispositivo: nome => new Promise(resolve => passaggi.push({ nome, resolve })) }
    });
    const esegui = codice => vm.runInContext(codice, contesto);
    const carica = f => esegui(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'));
    for (const f of ['js/mazzo.js', 'js/carte.js', ...gioco.file, 'js/carte-italiane-pagina.js', `${cartella}/funzioni.js`]) carica(f);
    // Mescolamento ripetibile e accesso allo stato creato dalla pagina
    esegui(`let n = 321; Math.random = () => { n = (Math.imul(n, 1664525) + 1013904223) >>> 0; return n / 4294967296; };
        const originale = CarteItalianePagina.avvia;
        CarteItalianePagina.avvia = config => {
            globalThis.config = config; const crea = config.crea || (() => config.motore.crea());
            config.crea = modalita => (globalThis.statoTest = crea(modalita)); originale(config);
        };`);
    carica(`${cartella}/main.js`);
    const stato = () => esegui('statoTest'), motore = esegui('config.motore');
    const passoTimer = () => { const [id, f] = timer.entries().next().value; timer.delete(id); f(); };
    const svuota = async () => { await Promise.resolve(); await Promise.resolve(); };
    // La persona di turno sceglie la mossa che sceglierebbe il PC, ma usando i pulsanti della pagina
    function mossaUmana() {
        const s = stato(), m = motore.mossaPC(s);
        if (m.carta === undefined) {
            const etichetta = motore.etichettaMossa(s, m);
            const bottone = $('#opzioniPresa').children.find(b => b.textContent === etichetta);
            assert.ok(bottone, `pulsante "${etichetta}" mancante`); bottone.click(); return;
        }
        assert.ok($('#mano').children.every((b, i) => b.disabled === !motore.mosseLegali(s).some(x => x.carta === i)), 'solo le carte giocabili sono attive');
        const scelte = motore.mosseLegali(s).filter(x => x.carta === m.carta);
        $('#mano').children[m.carta].click();
        if (scelte.length > 1) $('#opzioniPresa').children[scelte.findIndex(x => x.ruba === m.ruba && x.presa.join() === m.presa.join())].click();
    }
    async function termina(modalita) {
        const umani = gioco.modalita[modalita];
        assert.equal(stato().mani.length, gioco.numero(modalita));
        let azioni = 0;
        while (!stato().finita) {
            assert.ok(++azioni < 600, 'la smazzata deve finire');
            const s = stato();
            // Le mani dei PC non si vedono mai
            assert.ok(immagini($('#avversari')).every(img => img.alt === 'Carta coperta'));
            if (passaggi.length) {
                assert.ok(immagini($('#mano')).every(img => img.alt === 'Carta coperta'), 'mano coperta durante il passaggio');
                passaggi.shift().resolve(); await svuota();
            } else if (s.presaCompleta) {
                if (modalita === 'due') $('#continua').click(); else passoTimer();
            } else if (umani.includes(s.turno)) mossaUmana();
            else {
                if (modalita === 'due') assert.ok(immagini($('#mano')).every(img => img.alt === 'Carta coperta'), 'in due la mano resta coperta durante i turni PC');
                passoTimer();
            }
        }
        assert.equal($('#risultati').hidden, false);
        assert.ok($('#risultati').children[1].children.length >= 2);
        assert.ok($('#messaggi').textContent.length > 0);
    }
    await termina('uno');
    for (const modalita of Object.keys(gioco.modalita).filter(m => m !== 'uno')) {
        $('#modalitaGioco').value = modalita; barra.suCambioModalita(modalita === 'due');
        await termina(modalita);
    }
    console.log(`OK pagina ${cartella}: smazzate complete in ${Object.keys(gioco.modalita).join(', ')}, mani PC coperte, solo carte giocabili attive`);
}
(async () => { for (const c of Object.keys(GIOCHI)) await verifica(c); })()
    .catch(errore => { console.error(errore); process.exitCode = 1; });
