// Test di Sette e mezzo con un DOM minimo: node sette_e_mezzo/test-sette-e-mezzo.js
// Le carte arrivano in un ordine fissato dal test, al posto del mescolamento casuale.
const assert = require('node:assert/strict');
const { ambiente, GIOCATORI_FINTI } = require('../scripts/dom-minimo.js');

function nuovaPagina() {
    const a = ambiente();
    a.esegui(GIOCATORI_FINTI);
    a.carica('js/mazzo.js');
    a.esegui("const Carte = { crea: () => document.createElement('img') };");
    a.carica('sette_e_mezzo/main.js');
    // Il prossimo mazzo conterrà, in quest'ordine, carte con i numeri indicati (8, 9, 10 = figure)
    a.esegui(`function fissa(numeri) {
        Mazzo.mescola = () => numeri.map(n => ({ tipo: 'italiano', seme: 'coppe', valore: String(n), numero: n }));
    }`);
    a.mano = numeri => { a.esegui(`fissa(${JSON.stringify(numeri)}); iniziaMano();`); };
    a.pesca = () => a.$('#pesca').listeners.click();
    a.stai = () => a.$('#stai').listeners.click();
    return a;
}

const a = nuovaPagina();
assert.equal(a.esegui('Mazzo.italiano().length'), 40);
assert.deepEqual([1, 7, 8, 9, 10].map(n => a.esegui(`puntiCarta({ numero: ${n} })`)), [1, 7, 0.5, 0.5, 0.5]);
console.log('OK   asso..7 valgono il loro numero, le figure mezzo punto');

a.mano([7, 8]);
a.pesca();
assert.equal(a.$('#punti_giocatore').textContent, '7,5');
assert.equal(a.esegui('manoFinita'), false);
console.log('OK   7 e mezzo esatto non sballa (punteggio scritto con la virgola)');

a.mano([7, 5]);
a.pesca();
assert.equal(a.$('#messaggi').textContent, 'Hai sballato! Vince il banco.');
assert.equal(a.$('#pesca').disabled, true);
console.log('OK   oltre 7 e mezzo il giocatore sballa e vince il banco');

// Banco del PC: pesca finché non raggiunge il giocatore
a.mano([5, 8, 3, 2]);
a.stai();
assert.equal(a.$('#messaggi').textContent, 'Il banco sta giocando...');
a.svuotaTimer();
assert.equal(a.$('#punti_banco').textContent, '5,5');
assert.equal(a.$('#messaggi').textContent, 'Vince il banco!');
console.log('OK   il banco del PC pesca fino a raggiungere il giocatore');

a.mano([5, 5]);
a.stai();
a.svuotaTimer();
assert.equal(a.$('#messaggi').textContent, 'Vince il banco!');
console.log('OK   a parità di punti vince il banco');

a.mano([7, 6, 4]);
a.stai();
a.svuotaTimer();
assert.equal(a.$('#messaggi').textContent, 'Il banco ha sballato, vince il giocatore!');
console.log('OK   se il banco sballa vince il giocatore');

// Nuova partita mentre il PC sta pescando: il vecchio turno del banco non continua
a.mano([6, 1, 1, 1]);
a.stai();
a.mano([2]);
a.svuotaTimer();
assert.equal(a.$('#punti_banco').textContent, '0');
assert.equal(a.esegui('manoFinita'), false);
assert.equal(a.$('#pesca').disabled, false);
console.log('OK   Nuova partita durante il turno del PC annulla il turno vecchio');

// Due giocatori: chi fa il banco pesca a mano e si ferma con Stai
const due = nuovaPagina();
due.esegui("fissa([4, 3, 9, 2]); barra.suCambioModalita(true);");
assert.equal(due.$('#nome_giocatore').textContent, 'Uno');
assert.equal(due.$('#nome_banco').textContent, 'Banco: Due');
due.stai();                       // Uno sta con 4
assert.equal(due.$('#turnoDue').textContent, 'Tocca al banco: Due');
due.pesca(); due.pesca(); due.pesca(); // banco: 3 + 0,5 + 2 = 5,5
assert.equal(due.$('#punti_banco').textContent, '5,5');
due.stai();
assert.match(due.$('#messaggi').textContent, /Vince il banco \(Due\): 5,5 contro 4/);
assert.equal(due.$('#puntiG2').textContent, '1');
assert.equal(due.timer.length, 0);
console.log('OK   2 giocatori: il banco pesca a mano, nessun turno automatico del PC');

due.esegui('fissa([2, 9, 9, 9, 9])');
due.$('#nuova_partita').listeners.click();
assert.equal(due.$('#nome_banco').textContent, 'Banco: Uno');
due.stai();
due.pesca(); due.pesca(); due.pesca(); // banco Uno: 1,5 contro 2
due.stai();
assert.match(due.$('#messaggi').textContent, /Vince Due: 2 contro 1,5/);
assert.equal(due.$('#puntiG2').textContent, '2');
console.log('OK   2 giocatori: il banco passa all\'altro giocatore a ogni mano');

console.log('Tutti i controlli sono passati');
