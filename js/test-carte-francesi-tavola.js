// Tappa 27.2: Scala 40, Ramino e Burraco sul telefono con un pannello della tavola finto (js/tavola.js).
// Carte scoperte semplificate (opzione per tornare alle immagini), colonne della mano, PC fermo con il pannello aperto.
const assert = require('node:assert/strict');
const { ambiente, GIOCATORI_FINTI, attendi } = require('../scripts/dom-minimo.js');

const TAVOLA_FINTA = `
    let pannelloAperto = false, inAttesa = [], opzioni = {}, telefonoFinto = true;
    const Tavola = {
        telefono: () => telefonoFinto, aperto: () => pannelloAperto,
        quandoChiuso: f => { if (pannelloAperto) inAttesa.push(f); else f(); },
        opzione: o => { opzioni[o.chiave] = o; o.suCambio(false); return () => false; }
    };
    const chiudiPannello = () => { pannelloAperto = false; inAttesa.splice(0).forEach(f => f()); };`;

(async () => {
    for (const cartella of ['scala40', 'ramino', 'burraco']) {
        const a = ambiente();
        a.$('#modalitaGioco').value = 'uno';
        const colonne = [];
        a.$('#mano').style.setProperty = (k, v) => { if (k === '--colonne') colonne.push(v); };
        a.esegui(GIOCATORI_FINTI + TAVOLA_FINTA);
        const file = cartella === 'burraco'
            ? ['js/mazzo.js', 'js/carte.js', 'js/combinazioni.js', 'burraco/funzioni.js', 'burraco/main.js']
            : ['js/mazzo.js', 'js/carte.js', 'js/combinazioni.js', 'js/ramino.js', 'js/ramino-pagina.js', `${cartella}/main.js`];
        for (const f of file) a.carica(f);
        await attendi();
        const carteMano = () => a.$('#mano').children.map(b => b.children[0]);
        const semplice = c => c.className.includes('carta-semplice') || c.className === 'carta carta--jolly';

        // Telefono: carte scoperte semplificate, mano dell'avversario coperta (immagini), colonne della mano
        assert.ok(carteMano().every(semplice), `${cartella}: mano con carte semplificate`);
        assert.ok(a.$('.tavolo-ramino').classList.contains('tavolo-ramino--semplici'));
        assert.ok(a.$('#avversari').children[0].children.slice(1).every(c => c.alt === 'Carta coperta'));
        const n = a.$('#mano').children.length;
        assert.equal(colonne.at(-1), String(Math.ceil(n / Math.ceil(n / 7))), `${cartella}: colonne della mano`);
        // L'opzione del pannello riporta le immagini; schermo largo: immagini
        const opzione = a.valore("Object.keys(opzioni)");
        assert.deepEqual(opzione, ['giochi_js_carte_immagini']);
        a.esegui("opzioni.giochi_js_carte_immagini.suCambio(true)");
        assert.ok(carteMano().every(c => !c.className.includes('carta-semplice')), `${cartella}: con l'opzione tornano le immagini`);
        assert.ok(!a.$('.tavolo-ramino').classList.contains('tavolo-ramino--semplici'));
        a.esegui("opzioni.giochi_js_carte_immagini.suCambio(false)");
        assert.ok(carteMano().every(semplice));

        // Pesca e scarta, poi tocca al PC: con il pannello aperto il PC non gioca finché non si chiude
        a.$('#opzioniPresa').children.find(b => /Pesca dal tallone/.test(b.textContent)).listeners.click();
        await attendi();
        const carte = a.$('#mano').children;
        for (let i = 0; i < carte.length && a.$('#opzioniPresa').children.some(b => /Scarta/.test(b.textContent)); i++) {
            a.$('#mano').children[i].listeners.click();
            a.$('#opzioniPresa').children.find(b => /Scarta/.test(b.textContent)).listeners.click();
            if (a.$('#opzioniPresa').children.some(b => /Scarta/.test(b.textContent))) a.$('#mano').children[i].listeners.click();
        }
        await attendi();
        assert.match(a.$('#messaggi').textContent, /Computer sta giocando/);
        const tallone = a.$('#contaTallone').textContent;
        a.esegui('pannelloAperto = true');
        a.svuotaTimer(1);
        await attendi();
        assert.match(a.$('#messaggi').textContent, /Computer sta giocando/, `${cartella}: il PC aspetta con il pannello aperto`);
        assert.equal(a.$('#contaTallone').textContent, tallone);
        a.esegui('chiudiPannello()');
        await attendi();
        assert.doesNotMatch(a.$('#messaggi').textContent, /Computer sta giocando/, `${cartella}: chiuso il pannello il PC gioca`);
        console.log(`OK ${cartella} sul telefono: carte semplificate, opzione immagini, colonne della mano, PC fermo con il pannello aperto`);
    }
})().catch(errore => { console.error(errore); process.exitCode = 1; });
