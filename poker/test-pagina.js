// Pagina del Poker con un DOM minimo: mani complete con i pulsanti, carte altrui coperte fino al confronto.
const assert = require('node:assert/strict');
const { ambiente, GIOCATORI_FINTI, attendi } = require('../scripts/dom-minimo.js');

(async () => {
    for (const modalita of ['uno', 'due']) {
        const a = ambiente();
        a.$('#modalitaGioco').value = modalita;
        a.esegui(GIOCATORI_FINTI + "; Giocatori.chiediNomi = async () => ['Uno', 'Due'];");
        for (const f of ['js/mazzo.js', 'js/carte.js', 'poker/funzioni.js', 'poker/main.js']) a.carica(f);
        await attendi();
        let mani = 0, passi = 0, confronti = 0;
        while (a.$('#risultati').hidden && mani < 12) {
            assert.ok(++passi < 3000);
            const bottoni = a.$('#opzioniPresa').children, testi = bottoni.map(b => b.textContent);
            const altre = a.$('#carteAltro').children.map(c => c.alt);
            if (testi.includes('Mano successiva')) {
                if (/·/.test(a.$('#messaggi').textContent)) { confronti++; assert.ok(altre.every(x => x !== 'Carta coperta'), 'al confronto le carte si scoprono'); }
                mani++; bottoni[0].listeners.click();
            } else if (bottoni.length) {
                assert.ok(altre.every(x => x === 'Carta coperta'), `${modalita}: le carte dell'altro sono coperte durante la mano`);
                const scelta = bottoni.find(b => /^Vedi|^Passa/.test(b.textContent)) || bottoni[0];
                scelta.listeners.click();
            } else if (a.timer.length) a.svuotaTimer(1);
            await attendi();
        }
        assert.ok(mani >= 1); assert.ok(confronti >= 1);
        const fiches = Number(a.$('#puntiP0').textContent) + Number(a.$('#puntiP1').textContent);
        assert.ok(fiches <= 1000);
        console.log(`OK pagina Poker ${modalita}: ${mani} mani, ${confronti} confronti finali, carte altrui coperte fino al confronto`);
    }
})().catch(errore => { console.error(errore); process.exitCode = 1; });
