// Pagine dei solitari con un DOM minimo: tocchi sulle carte e sul mazzo, annulla, nessun errore.
const assert = require('node:assert/strict');
const { ambiente } = require('../scripts/dom-minimo.js');
const seme = n => { let s = n; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };

for (const [cartella, opzione] of [['klondike', '3'], ['freecell', null], ['spider', '2'], ['piramide', null], ['golf', null], ['tripeaks', null], ['yukon', null], ['scorpione', null], ['orologio', null], ['tredici', null]]) {
    const a = ambiente();
    if (opzione) a.$('#modalitaGioco').value = opzione;
    for (const f of ['js/mazzo.js', 'js/carte.js', `${cartella}/funzioni.js`, 'js/solitario-pagina.js', `${cartella}/main.js`]) a.carica(f);
    const tavolo = a.$('#tavoloSolitario');
    // Un tocco = pointerdown e pointerup sullo stesso elemento, senza movimento
    const tocca = el => { const e = { target: el, clientX: 10, clientY: 10, pointerId: 1, preventDefault() {} }; tavolo.listeners.pointerdown(e); tavolo.listeners.pointerup(e); };
    const elementi = () => tavolo.children.filter(e => e.dataset.pila !== undefined);
    assert.ok(elementi().length > 0, `${cartella}: il tavolo è disegnato`);
    const casuale = seme(cartella.length);
    let mosse = 0;
    for (let i = 0; i < 300; i++) {
        const lista = elementi();
        tocca(lista[Math.floor(casuale() * lista.length)]);
        mosse = Number(a.$('#puntiP1').textContent);
        assert.ok(Number.isInteger(mosse));
        if (!a.$('#risultati').hidden) break;
    }
    const mazzo = elementi().find(e => e.dataset.pila === 'mazzo');
    if (mazzo && a.$('#risultati').hidden) { const prima = Number(a.$('#puntiP1').textContent); tocca(mazzo); assert.ok(Number(a.$('#puntiP1').textContent) >= prima); }
    if (!a.$('#annulla').disabled) { a.$('#annulla').listeners.click(); assert.equal(a.$('#messaggi').textContent, 'Mossa annullata.'); }
    a.$('#nuovaPartita').listeners.click();
    assert.equal(a.$('#puntiP1').textContent, '0'); assert.equal(a.$('#puntiP0').textContent, '0:00');
    console.log(`OK pagina ${cartella}: tavolo disegnato, ${mosse} mosse fatte con i tocchi, annulla e nuova partita`);
}
