// Test dell'Impiccato con un DOM minimo: node il_impiccato/test-impiccato.js
const assert = require('node:assert/strict');
const { ambiente, GIOCATORI_FINTI, attendi } = require('../scripts/dom-minimo.js');

function nuovaPagina() {
    const a = ambiente();
    a.esegui(GIOCATORI_FINTI);
    a.carica('il_impiccato/doc/lista_parole.js');
    a.carica('il_impiccato/main.js');
    a.tessere = () => a.$('.parolaVisualizzata').children.map(t => t.textContent || '_').join('');
    return a;
}

(async () => {
    // Lista delle parole: come promesso nel commento del file
    const lista = nuovaPagina().valore('listaParole');
    assert.equal(lista.length, 1000);
    assert.equal(new Set(lista).size, 1000);
    assert.ok(lista.every(p => /^[a-z]{4,12}$/.test(p)));
    console.log('OK   1000 parole diverse, minuscole, da 4 a 12 lettere');

    const a = nuovaPagina();
    assert.equal(a.$('#tastiera').children.length, 26);
    a.esegui("avviaPartita('casa')");
    assert.equal(a.tessere(), '____');
    a.esegui("provaLettera('a')");
    assert.equal(a.tessere(), '_a_a');
    assert.equal(a.$('.parolaVisualizzata').getAttribute('aria-label'), 'Parola: _ a _ a');
    console.log('OK   una lettera giusta scopre tutte le sue posizioni');

    a.esegui("provaLettera('z')");
    assert.equal(a.esegui('numeroErrori'), 1);
    assert.equal(a.$('#contaErrori').textContent, '1/6');
    a.esegui("provaLettera('z')");
    assert.equal(a.esegui('numeroErrori'), 1);
    assert.equal(a.$('.messaggi').textContent, 'Lettera già usata');
    console.log('OK   lettera sbagliata = un errore; ripeterla non conta');

    // Inserimento da tastiera: maiuscola convertita
    a.$('#laTuaLettera').value = 'C';
    a.$('#lettera').listeners.submit({ preventDefault() {} });
    a.esegui("provaLettera('s')");
    assert.equal(a.tessere(), 'casa');
    assert.equal(a.$('.messaggi').textContent, 'Hai indovinato la parola!');
    assert.equal(a.$('#prova').disabled, true);
    assert.ok(a.$('#tastiera').children.every(t => t.disabled));
    console.log('OK   parola completata: vittoria e tastiera bloccata');

    // Dopo la fine le lettere vengono ignorate
    a.esegui("provaLettera('q')");
    assert.equal(a.esegui('numeroErrori'), 1);
    console.log('OK   a partita finita le lettere non contano');

    // Sei errori: sconfitta e parola rivelata
    const b = nuovaPagina();
    b.esegui("avviaPartita('sole')");
    b.esegui("provaLettera('s')");
    for (const l of 'abcdfg') b.esegui(`provaLettera('${l}')`);
    assert.equal(b.esegui('numeroErrori'), 6);
    assert.match(b.$('.messaggi').textContent, /Hai perso!.*sole/s);
    assert.equal(b.tessere(), 'sole');
    assert.ok(b.$('.parolaVisualizzata').children[1].classList.contains('tessera--rivelata'));
    assert.ok(b.$('.parolaVisualizzata').children[0].classList.contains('tessera--scoperta'));
    console.log('OK   al sesto errore la partita è persa e le lettere mancanti si rivelano');

    // Nuova partita: tutto azzerato
    b.esegui("avviaPartita('mare')");
    assert.equal(b.esegui('numeroErrori'), 0);
    assert.equal(b.tessere(), '____');
    assert.equal(b.$('#prova').disabled, false);
    assert.ok(b.$('#tastiera').children.every(t => !t.disabled));
    console.log('OK   Nuova partita azzera errori, tessere e tastiera');

    // Parola segreta scelta in due
    assert.equal(b.esegui("pulisciParola('Perché')"), 'perche');
    assert.equal(b.esegui("controllaParola('Città')"), '');
    for (const sbagliata of ['ab', 'tredicilettere', "l'ora", 'due parole', 'abc1']) {
        assert.notEqual(b.esegui(`controllaParola(${JSON.stringify(sbagliata)})`), '', sbagliata);
    }
    console.log('OK   parola segreta: accenti tolti, solo lettere, da 3 a 12');

    // Due giocatori: il punto va a chi indovina oppure a chi ha scelto
    const due = nuovaPagina();
    due.esegui("segreti = ['Città', 'oca']");
    due.esegui('barra.suCambioModalita(true)');
    await attendi();
    assert.equal(due.esegui('parolaSegreta'), 'citta');
    for (const l of 'cita') due.esegui(`provaLettera('${l}')`);
    assert.equal(due.$('#puntiG2').textContent, '1');
    assert.equal(due.esegui('chiSceglie'), 1);
    due.$('#nuovaPartita').listeners.click();
    await attendi();
    for (const l of 'bdfghl') due.esegui(`provaLettera('${l}')`);
    assert.equal(due.$('#puntiG2').textContent, '2');
    assert.match(due.$('#turnoDue').textContent, /Punto a Due/);
    console.log('OK   2 giocatori: punto a chi indovina, altrimenti a chi ha scelto');

    console.log('Tutti i controlli sono passati');
})().catch(errore => { console.error(errore); process.exitCode = 1; });
