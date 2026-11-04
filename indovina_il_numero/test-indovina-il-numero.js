// Test di Indovina il numero con un DOM minimo: node indovina_il_numero/test-indovina-il-numero.js
const assert = require('node:assert/strict');
const { ambiente, GIOCATORI_FINTI, attendi } = require('../scripts/dom-minimo.js');

function nuovaPagina(tentativi = '10') {
    const a = ambiente();
    a.$('#difficolta').value = tentativi;
    a.esegui(GIOCATORI_FINTI);
    a.carica('indovina_il_numero/main.js');
    // Invia il modulo come farebbe il pulsante "Prova"
    a.prova = numero => { a.$('#input').value = String(numero); a.$('#form').listeners.submit({ preventDefault() {} }); };
    return a;
}

(async () => {
    const a = nuovaPagina();
    a.esegui('preparaTentativi(42)');
    a.prova(50);
    assert.equal(a.$('#messaggi').textContent, 'Troppo alto');
    assert.equal(a.$('#intervallo').textContent, '1 – 49');
    a.prova(30);
    assert.equal(a.$('#messaggi').textContent, 'Troppo basso');
    assert.equal(a.$('#intervallo').textContent, '31 – 49');
    assert.equal(a.$('#rimanenti').textContent, '8');
    console.log('OK   troppo alto / troppo basso restringono l\'intervallo');

    // Un tentativo fuori dall'intervallo già noto non lo allarga
    a.prova(10);
    assert.equal(a.$('#intervallo').textContent, '31 – 49');
    console.log('OK   un tentativo già escluso non allarga l\'intervallo');

    a.prova(42);
    assert.equal(a.$('#messaggi').textContent, 'Hai indovinato in 4 tentativi!');
    assert.equal(a.$('#button').disabled, true);
    assert.equal(a.$('#input').disabled, true);
    assert.equal(a.$('#storico').children.length, 4);
    console.log('OK   il numero giusto chiude la partita e blocca il modulo');

    // Tentativi finiti
    const b = nuovaPagina('5');
    b.esegui('preparaTentativi(77)');
    for (let i = 1; i <= 5; i++) b.prova(i);
    assert.match(b.$('#messaggi').textContent, /finito i tentativi.*77/);
    assert.equal(b.$('#button').disabled, true);
    assert.equal(b.$('#rimanenti').textContent, '0');
    console.log('OK   al limite dei tentativi la partita finisce e mostra il numero');

    // Nuova partita: torna tutto come all'inizio, con il limite della difficoltà scelta
    b.$('#difficolta').value = '7';
    b.$('#reset').listeners.click();
    assert.equal(b.$('#button').disabled, false);
    assert.equal(b.$('#rimanenti').textContent, '7');
    assert.equal(b.$('#storico').children.length, 0);
    const segreto = b.esegui('numeroSegreto');
    assert.ok(Number.isInteger(segreto) && segreto >= 1 && segreto <= 100);
    console.log('OK   Nuova partita usa la difficoltà scelta e un numero da 1 a 100');

    // Controllo del numero segreto scelto in due
    assert.equal(a.esegui("controllaNumero('1')"), '');
    assert.equal(a.esegui("controllaNumero('100')"), '');
    for (const sbagliato of ['0', '101', '4.5', 'abc', '']) {
        assert.notEqual(a.esegui(`controllaNumero('${sbagliato}')`), '', sbagliato);
    }
    console.log('OK   il numero segreto deve essere intero da 1 a 100');

    // Sfida a due: vince chi indovina con meno tentativi; chi non indovina conta limite + 1
    const due = nuovaPagina('10');
    due.esegui("segreti = ['20', '60']");
    due.esegui('barra.suCambioModalita(true)');
    await attendi();
    assert.equal(due.esegui('numeroSegreto'), 20);
    due.prova(50); due.prova(20);                 // Due indovina in 2
    assert.match(due.$('#turnoDue').textContent, /Ora tocca a Due scegliere/);
    due.$('#reset').listeners.click();
    await attendi();
    assert.equal(due.esegui('numeroSegreto'), 60);
    for (let i = 1; i <= 10; i++) due.prova(i);   // Uno non indovina
    assert.match(due.$('#turnoDue').textContent, /^Vince Due!/);
    assert.match(due.$('#turnoDue').textContent, /Uno: non ha indovinato/);
    assert.equal(due.$('#puntiG2').textContent, '1');
    console.log('OK   sfida a due: vince chi usa meno tentativi');

    const pari = nuovaPagina('10');
    pari.esegui("segreti = ['5', '6']");
    pari.esegui('barra.suCambioModalita(true)');
    await attendi();
    pari.prova(5);
    pari.$('#reset').listeners.click();
    await attendi();
    pari.prova(6);
    assert.match(pari.$('#turnoDue').textContent, /^Pareggio!/);
    assert.deepEqual(pari.valore('punti'), [0, 0]);
    console.log('OK   sfida a due: stessi tentativi, pareggio senza punti');

    console.log('Tutti i controlli sono passati');
})().catch(errore => { console.error(errore); process.exitCode = 1; });
