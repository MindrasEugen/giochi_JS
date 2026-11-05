// Pagine di Scala 40 e Ramino con un DOM minimo: mani complete con i pulsanti, mano dell'altro coperta.
const assert = require('node:assert/strict');
const { ambiente, GIOCATORI_FINTI, attendi } = require('../scripts/dom-minimo.js');

(async () => {
    for (const [cartella, modalita] of [['scala40', 'uno'], ['scala40', 'due'], ['ramino', 'uno'], ['ramino', 'due']]) {
        const a = ambiente();
        a.$('#modalitaGioco').value = modalita;
        a.esegui(GIOCATORI_FINTI + "; Giocatori.chiediNomi = async () => ['Uno', 'Due'];");
        for (const f of ['js/mazzo.js', 'js/carte.js', 'js/combinazioni.js', 'js/ramino.js', 'js/ramino-pagina.js', `${cartella}/main.js`]) a.carica(f);
        await attendi();
        let passi = 0, mani = 0;
        const bottone = re => a.$('#opzioniPresa').children.find(b => re.test(b.textContent) && !b.disabled);
        while (mani < 2) {
            assert.ok(++passi < 6000, `${cartella} ${modalita}: la mano deve finire`);
            const successiva = bottone(/Mano successiva/);
            if (successiva || !a.$('#risultati').hidden) { mani++; if (successiva) successiva.listeners.click(); else break; await attendi(); continue; }
            const pesca = bottone(/Pesca dal tallone/);
            if (pesca) {
                // Durante il proprio turno la mano dell'altro è coperta
                assert.ok(a.$('#avversari').children[0].children.slice(1).every(c => c.alt === 'Carta coperta'));
                pesca.listeners.click(); await attendi(); continue;
            }
            const scarta = a.$('#opzioniPresa').children.find(b => /Scarta/.test(b.textContent));
            if (scarta) {
                // La persona scarta una carta qualsiasi (provando finché lo scarto è valido)
                const carte = a.$('#mano').children;
                for (let i = 0; i < carte.length && a.$('#opzioniPresa').children.some(b => /Scarta/.test(b.textContent)); i++) {
                    carte[i].listeners.click();
                    const s = a.$('#opzioniPresa').children.find(b => /Scarta/.test(b.textContent));
                    s.listeners.click();
                    const ancora = a.$('#opzioniPresa').children.find(b => /Scarta/.test(b.textContent));
                    if (ancora && a.$('#mano').children[i]) a.$('#mano').children[i].listeners.click(); // deseleziona e riprova
                }
                await attendi(); continue;
            }
            if (a.timer.length) a.svuotaTimer(1);
            await attendi();
        }
        assert.ok(mani >= 1);
        console.log(`OK pagina ${cartella} ${modalita}: mani complete con i pulsanti, mano altrui coperta`);
    }
})().catch(errore => { console.error(errore); process.exitCode = 1; });
