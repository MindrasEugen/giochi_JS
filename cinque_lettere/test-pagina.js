// Controller reale con DOM minimo e finestre asincrone controllate dal test.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
class Nodo {
    constructor(tag = 'div') {
        this.tag = tag; this.children = []; this.dataset = {}; this.attributes = {}; this.listeners = {}; this.value = '';
        this.classList = { toggle() {} };
    }
    set textContent(t) { this.testo = String(t); this.children = []; }
    get textContent() { return this.testo || ''; }
    append(...nodi) { this.children.push(...nodi); }
    appendChild(n) { this.append(n); return n; }
    setAttribute(k, v) { this.attributes[k] = v; }
    addEventListener(k, f) { (this.listeners[k] ||= []).push(f); }
    matches(selettori) { return selettori.split(', ').includes(this.tag); }
    focus() {}
    emetti(k, extra = {}) { for (const f of this.listeners[k] || []) f({ target: this, preventDefault() {}, ...extra }); }
}
async function verifica() {
    const nodi = new Map(), documento = new Nodo();
    documento.createElement = t => new Nodo(t);
    documento.querySelector = k => {
        if (k === '.copertura') return null;
        if (!nodi.has(k)) nodi.set(k, new Nodo(k === '#parola' ? 'input' : 'div'));
        return nodi.get(k);
    };
    let barra, segreto, passaggio;
    const c = vm.createContext({ document: documento, Element: Nodo,
        Giocatori: {
            leggiNomi: () => ['Uno', 'Due'], collegaBarra: b => { barra = b; },
            chiediSegreto: opzioni => new Promise(resolve => { segreto = { opzioni, resolve }; }),
            passaDispositivo: nome => new Promise(resolve => { passaggio = { nome, resolve }; })
        }
    });
    const esegui = codice => vm.runInContext(codice, c);
    for (const file of ['parole.js', 'funzioni.js', 'main.js']) esegui(fs.readFileSync(path.join(__dirname, file), 'utf8'));
    const input = nodi.get('#parola'), form = nodi.get('#modulo'), nuova = nodi.get('#nuovaPartita');
    const svuota = async () => { await Promise.resolve(); await Promise.resolve(); };
    const prova = parola => { input.value = parola; form.emetti('submit'); };
    async function scegli(parola, indovina) {
        assert.ok(segreto.opzioni.controlla('zzzzz'));
        assert.equal(input.disabled, true);
        segreto.resolve(parola); await svuota();
        assert.equal(passaggio.nome, indovina); assert.equal(input.disabled, true);
        passaggio.resolve(); await svuota(); assert.equal(input.disabled, false);
    }
    assert.equal(nodi.get('#tentativi').children.length, 6);
    assert.ok(nodi.get('#tentativi').children.every(r => r.children.length === 5));
    assert.equal(esegui('tasti.size'), 26);
    esegui("avvia('cassa')");
    prova('zzzzz'); assert.equal(esegui('partita.tentativi.length'), 0);
    prova('sasso'); assert.equal(esegui('partita.tentativi.length'), 1);
    assert.equal(esegui("tasti.get('s').dataset.esito"), 'esatta');
    assert.equal(nodi.get('#tentativi').children[0].children[0].dataset.esito, 'assente');
    assert.match(nodi.get('#tentativi').children[0].attributes['aria-label'], /S non disponibile/);
    prova('sasso'); assert.equal(esegui('partita.tentativi.length'), 1);
    input.value = '';
    for (const lettera of 'cassa') esegui(`tasti.get('${lettera}').emetti('click')`);
    nodi.get('#invioTastiera').emetti('click');
    assert.equal(esegui('partita.vinta'), true); assert.equal(input.disabled, true);
    esegui("avvia('citta')"); input.value = 'CITTÀ'; input.emetti('input');
    assert.equal(input.value, 'citta'); form.emetti('submit'); assert.equal(esegui('partita.vinta'), true);
    esegui("avvia('cassa')");
    documento.emetti('keydown', { key: 'c', ctrlKey: true }); assert.equal(input.value, '');
    documento.emetti('keydown', { key: 'c' }); assert.equal(input.value, 'c');
    documento.emetti('keydown', { key: 'Backspace' }); assert.equal(input.value, '');
    documento.emetti('keydown', { key: 'c', target: new Nodo('button') }); assert.equal(input.value, 'c');
    documento.emetti('keydown', { key: 'Enter', target: new Nodo('button') }); assert.equal(esegui('partita.tentativi.length'), 0);
    barra.suCambioModalita(true);
    assert.equal(nodi.get('#modalitaGioco').disabled, true);
    assert.ok(nodi.get('#tentativi').children.every(r => r.children.every(t => t.children[0].textContent === '')));
    await scegli('mamma', 'Due');
    prova('cassa'); prova('mamma');
    assert.equal(nuova.textContent, 'Secondo turno'); assert.equal(esegui('sfida.risultati[1]'), 2);
    nuova.emetti('click');
    assert.ok(nodi.get('#tentativi').children.every(r => r.children.every(t => t.children[0].textContent === '')));
    assert.doesNotMatch(nodi.get('#messaggi').textContent, /MAMMA/);
    await scegli('cassa', 'Uno'); prova('cassa');
    assert.equal(esegui('sfida.finita'), true);
    assert.match(nodi.get('#turnoDue').textContent, /Vince Uno/);
    assert.equal(nodi.get('#puntiG1').textContent, '1 tent.');
    assert.equal(nodi.get('#puntiG2').textContent, '2 tent.');
    nuova.emetti('click'); await scegli('mamma', 'Due'); prova('mamma');
    nuova.emetti('click'); await scegli('cassa', 'Uno');
    // Nuova sfida durante il secondo turno azzera entrambi i risultati.
    nuova.emetti('click'); await scegli('mamma', 'Due');
    assert.equal(esegui('sfida.turno'), 0);
    assert.equal(esegui('sfida.risultati.every(n => n === null)'), true);
    barra.suCambioModalita(false);
    assert.equal(nodi.get('#punteggiDue').hidden, true); assert.equal(input.disabled, false);
    console.log('OK pagina Cinque lettere: 30 celle, tastiera, accenti, errori, riservatezza, due turni, risultati e riavvio');
}
verifica().catch(errore => { console.error(errore); process.exitCode = 1; });
