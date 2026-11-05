// Pagina del Burraco con un DOM minimo: mani complete con i pulsanti, mano dell'altro coperta.
const assert = require('node:assert/strict');
const { ambiente, GIOCATORI_FINTI, attendi } = require('../scripts/dom-minimo.js');

(async () => {
    for (const modalita of ['uno', 'due']) {
        const a = ambiente();
        a.$('#modalitaGioco').value = modalita;
        a.esegui(GIOCATORI_FINTI + "; Giocatori.chiediNomi = async () => ['Uno', 'Due'];");
        for (const f of ['js/mazzo.js', 'js/carte.js', 'js/combinazioni.js', 'burraco/funzioni.js', 'burraco/main.js']) a.carica(f);
        await attendi();
        let passi = 0, mani = 0;
        const bottone = re => a.$('#opzioniPresa').children.find(b => re.test(b.textContent) && !b.disabled);
        while (mani < 1) {
            assert.ok(++passi < 6000, `${modalita}: la mano deve finire`);
            if (!a.$('#risultati').hidden) { mani++; assert.match(a.$('#risultati').children[1].textContent, /totale/); break; }
            const pesca = bottone(/Pesca dal tallone/);
            if (pesca) {
                assert.ok(a.$('#avversari').children[0].children.slice(1).every(c => c.alt === 'Carta coperta'));
                pesca.listeners.click(); await attendi(); continue;
            }
            if (a.$('#opzioniPresa').children.some(b => /Scarta/.test(b.textContent))) {
                // Scarta la prima carta valida
                const carte = a.$('#mano').children;
                for (let i = 0; i < carte.length; i++) {
                    carte[i].listeners.click();
                    const s = a.$('#opzioniPresa').children.find(b => /Scarta/.test(b.textContent));
                    if (!s) break;
                    s.listeners.click();
                    if (!a.$('#opzioniPresa').children.some(b => /Scarta/.test(b.textContent))) break;
                    a.$('#mano').children[i]?.listeners.click();
                }
                await attendi(); continue;
            }
            if (a.timer.length) a.svuotaTimer(1);
            await attendi();
        }
        console.log(`OK pagina Burraco ${modalita}: mano completa con i pulsanti e conteggio finale, mano altrui coperta`);
    }
})().catch(errore => { console.error(errore); process.exitCode = 1; });
