// Prova delle funzioni condivise che non usano la pagina.
// Si avvia dalla radice del progetto con:  node js/test-mazzo.js

const fs = require('fs');
const path = require('path');
const Mazzo = require('./mazzo.js');
const Carte = require('./carte.js');
const Arcade = require('./arcade.js');

let falliti = 0;
function controlla(descrizione, condizione) {
    console.log(`${condizione ? 'OK  ' : 'FAIL'} ${descrizione}`);
    if (!condizione) {
        falliti++;
    }
}

const chiave = carta => `${carta.tipo}-${carta.seme}-${carta.valore}`;

// Mazzi
const italiano = Mazzo.italiano();
const francese = Mazzo.francese();
controlla('mazzo italiano: 40 carte', italiano.length === 40);
controlla('mazzo francese: 52 carte', francese.length === 52);
controlla('mazzo italiano: nessun doppione', new Set(italiano.map(chiave)).size === 40);
controlla('mazzo francese: nessun doppione', new Set(francese.map(chiave)).size === 52);
controlla('italiano: numeri da 1 a 10 in ogni seme', Mazzo.SEMI_ITALIANI.every(seme =>
    italiano.filter(c => c.seme === seme).map(c => c.numero).join() === '1,2,3,4,5,6,7,8,9,10'));
controlla('francese: re = 13, asso = 1', francese.find(c => c.valore === 'k').numero === 13 && francese.find(c => c.valore === 'a').numero === 1);

// Mescolamento
const mescolato = Mazzo.mescola(francese);
controlla('mescola: non perde e non duplica carte', mescolato.length === 52 && new Set(mescolato.map(chiave)).size === 52);
controlla('mescola: il mazzo originale non cambia', francese.map(chiave).join() === Mazzo.francese().map(chiave).join());
// Con 20.000 mescolamenti di 4 carte ognuna delle 24 permutazioni deve uscire circa 1/24 delle volte
const conteggi = {};
const piccolo = Mazzo.italiano().slice(0, 4);
for (let i = 0; i < 20000; i++) {
    const ordine = Mazzo.mescola(piccolo).map(c => c.numero).join('');
    conteggi[ordine] = (conteggi[ordine] || 0) + 1;
}
const valori = Object.values(conteggi);
controlla(`mescola: tutte le 24 permutazioni escono (${valori.length})`, valori.length === 24);
controlla(`mescola: distribuzione uniforme (min ${Math.min(...valori)}, max ${Math.max(...valori)}, attesi circa 833)`,
    Math.min(...valori) > 700 && Math.max(...valori) < 970);

// Pesca e distribuzione
const mazzo = Mazzo.mescola(Mazzo.italiano());
const prime = Mazzo.pesca(mazzo, 3);
controlla('pesca: toglie le carte dal mazzo', prime.length === 3 && mazzo.length === 37);
const mani = Mazzo.distribuisci(mazzo, 4, 9);
controlla('distribuisci: 4 mani da 9 carte e il mazzo vuoto', mani.every(m => m.length === 9) && mazzo.length === 1);

// Nomi e colori
controlla('nome: "asso di coppe"', Mazzo.nome({ tipo: 'italiano', seme: 'coppe', valore: 'asso' }) === 'asso di coppe');
controlla('nome: "donna di cuori"', Mazzo.nome({ tipo: 'francese', seme: 'hearts', valore: 'q' }) === 'donna di cuori');
controlla('colore: cuori rosso, picche nero', Mazzo.colore({ seme: 'hearts' }) === 'rosso' && Mazzo.colore({ seme: 'spades' }) === 'nero');

// Immagini: ogni carta dei due mazzi, e i due dorsi, hanno il loro file in carte/
Carte.impostaCartella(path.join(__dirname, '..', 'carte') + path.sep);
const mancanti = [...Mazzo.italiano(), ...Mazzo.francese()].map(Carte.immagine)
    .concat([Carte.dorso('italiano'), Carte.dorso('francese')])
    .filter(file => !fs.existsSync(file));
controlla(`immagini: tutte le 92 carte e i 2 dorsi esistono in carte/ (mancanti: ${mancanti.length})`, mancanti.length === 0);

// Arcade: passo fisso
const uno = Arcade.passiDaFare(0, Arcade.PASSO * 2.5);
controlla('arcade: 2,5 passi di tempo -> 2 aggiornamenti e mezzo passo di resto', uno.passi === 2 && Math.abs(uno.resto - Arcade.PASSO / 2) < 1e-9);
const lungo = Arcade.passiDaFare(0, 5000);
controlla('arcade: dopo una pausa lunga non recupera più di 250 ms', lungo.passi === Math.floor(250 / Arcade.PASSO));

console.log(falliti === 0 ? '\nTutti i controlli sono passati' : `\n${falliti} controlli falliti`);
process.exit(falliti === 0 ? 0 : 1);
