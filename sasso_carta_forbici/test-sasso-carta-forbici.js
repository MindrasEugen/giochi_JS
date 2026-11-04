// Test di Sasso carta forbici con un DOM minimo: node sasso_carta_forbici/test-sasso-carta-forbici.js
const assert = require('node:assert/strict');
const { ambiente, GIOCATORI_FINTI, attendi } = require('../scripts/dom-minimo.js');

function nuovaPagina() {
    const a = ambiente();
    a.esegui(GIOCATORI_FINTI);
    a.carica('sasso_carta_forbici/main.js');
    return a;
}

(async () => {
    // Le 9 combinazioni: chi vince il turno
    const attese = {
        'carta-carta': 'pari', 'carta-sasso': 'g', 'carta-forbici': 'pc',
        'forbici-forbici': 'pari', 'forbici-carta': 'g', 'forbici-sasso': 'pc',
        'sasso-sasso': 'pari', 'sasso-forbici': 'g', 'sasso-carta': 'pc'
    };
    for (const [coppia, esito] of Object.entries(attese)) {
        const a = nuovaPagina();
        const [g, pc] = coppia.split('-');
        a.esegui(`confronta('${g}', '${pc}')`);
        const punti = a.valore('[puntiGiocatore, puntiComputer]');
        assert.deepEqual(punti, esito === 'g' ? [1, 0] : esito === 'pc' ? [0, 1] : [0, 0], coppia);
    }
    console.log('OK   le 9 combinazioni assegnano il punto giusto');

    // Contro il PC: la scelta del PC viene da Math.random (0 = carta)
    const pc = nuovaPagina();
    pc.esegui('Math.random = () => 0');
    pc.$('#forbici').listeners.click();
    assert.match(pc.$('.sceltaPc').textContent, /carta/);
    assert.equal(pc.esegui('puntiGiocatore'), 1);
    console.log('OK   il clic su un pulsante gioca contro la scelta casuale del PC');

    // Chi arriva a 5 vince: i pulsanti si bloccano (nel browser un pulsante disabilitato non riceve clic)
    for (let i = 0; i < 4; i++) pc.$('#forbici').listeners.click();
    assert.equal(pc.esegui('puntiGiocatore'), 5);
    assert.equal(pc.$('#carta').disabled, true);
    assert.match(pc.$('.risultato').textContent, /vinto la partita/);
    console.log('OK   a 5 punti la partita finisce e i pulsanti si bloccano');

    pc.$('#nuovaPartita').listeners.click();
    assert.deepEqual(pc.valore('[puntiGiocatore, puntiComputer]'), [0, 0]);
    assert.equal(pc.$('#carta').disabled, false);
    console.log('OK   Nuova partita azzera punti e pulsanti');

    // Due giocatori: la prima scelta resta nascosta, la seconda chiude il turno
    const due = nuovaPagina();
    due.esegui('barra.suCambioModalita(true)');
    due.esegui("giocaTurno('sasso')");
    await attendi();
    assert.equal(due.$('#manoGiocatore').textContent, '❔');
    assert.equal(due.$('#turnoDue').textContent, 'Tocca a Due');
    assert.deepEqual(due.valore('[puntiGiocatore, puntiComputer]'), [0, 0]);
    due.esegui("giocaTurno('forbici')");
    await attendi();
    assert.deepEqual(due.valore('[puntiGiocatore, puntiComputer]'), [1, 0]);
    assert.match(due.$('.risultato').textContent, /Uno vince il turno/);
    assert.equal(due.$('#turnoDue').textContent, 'Tocca a Uno');
    console.log('OK   2 giocatori: prima scelta nascosta, punto a chi vince');

    // Cambiare modalità a metà turno non lascia una scelta in sospeso
    due.esegui("giocaTurno('carta')");
    await attendi();
    due.esegui('barra.suCambioModalita(false)');
    assert.equal(due.esegui('sceltaInAttesa'), null);
    assert.equal(due.$('#nomeGiocatore').textContent, 'Tu');
    console.log('OK   il cambio di modalità annulla la scelta in attesa');

    console.log('Tutti i controlli sono passati');
})().catch(errore => { console.error(errore); process.exitCode = 1; });
