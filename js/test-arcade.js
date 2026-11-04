const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const eventi = new Map();
let prossimo, aggiornamenti = 0, disegni = 0;
const contesto = vm.createContext({
    document: { hidden: false, addEventListener: (k, f) => eventi.set(k, f), removeEventListener: k => eventi.delete(k) },
    requestAnimationFrame: f => { prossimo = f; }
});
vm.runInContext(fs.readFileSync(require.resolve('./arcade'), 'utf8'), contesto);
contesto.aggiorna = () => { aggiornamenti++; if (aggiornamenti === 1) vm.runInContext('ciclo.pausa()', contesto); };
contesto.disegna = () => { disegni++; };
vm.runInContext('const ciclo = Arcade.avvia({ aggiorna, disegna });', contesto);
prossimo(0); prossimo(200);
assert.equal(aggiornamenti, 1, 'pausa richiesta dentro aggiorna interrompe i sottopassi');
vm.runInContext('ciclo.riprendi()', contesto);
prossimo(10000);
assert.equal(aggiornamenti, 1, 'riprendere non recupera il tempo della pausa');
prossimo(10020); assert.equal(aggiornamenti, 2);
vm.runInContext('document.hidden = true', contesto); eventi.get('visibilitychange')();
prossimo(10040); assert.equal(aggiornamenti, 2);
const prima = disegni; vm.runInContext('ciclo.ferma()', contesto); prossimo(10060);
assert.equal(disegni, prima); assert.equal(eventi.has('visibilitychange'), false);
console.log('OK Arcade: pausa durante aggiornamento, ripresa senza recupero, scheda nascosta e arresto');
