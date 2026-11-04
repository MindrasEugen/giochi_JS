// Pagina del Mercante in fiera con un DOM minimo: asta con i pulsanti, estrazione automatica, premi e classifica.
const assert = require('node:assert/strict');
const { ambiente, GIOCATORI_FINTI, attendi } = require('../scripts/dom-minimo.js');

(async () => {
    for (const modalita of ['uno-2', 'uno-6', 'due-4']) {
        const a = ambiente();
        a.$('#modalitaGioco').value = modalita;
        a.esegui(GIOCATORI_FINTI + "; Giocatori.chiediNomi = async () => ['Uno', 'Due'];");
        for (const f of ['js/mazzo.js', 'js/carte.js', 'mercante/funzioni.js', 'mercante/main.js']) a.carica(f);
        let passi = 0, offerte = 0, automatico = false;
        while (a.$('#risultati').hidden) {
            assert.ok(++passi < 5000, `${modalita}: la partita deve finire`);
            const bottoni = a.$('#opzioniPresa').children, etichette = bottoni.map(b => b.textContent);
            if (etichette.some(e => /Passo$/.test(e))) {
                // Asta: la persona di turno rilancia di 1 sui primi lotti, poi passa
                const rilancio = bottoni.find(b => /Offro/.test(b.textContent));
                if (rilancio && offerte < 6) { offerte++; rilancio.listeners.click(); } else bottoni[0].listeners.click();
            } else if (!a.$('#automatico').hidden && !automatico) { automatico = true; a.$('#automatico').listeners.click(); }
            else if (a.timer.length) a.svuotaTimer(1);
            else if (bottoni.length) bottoni[0].listeners.click();
            await attendi();
        }
        assert.ok(automatico, 'il pulsante "Estrai fino alla fine" compare durante l’estrazione');
        assert.match(a.$('#messaggi').textContent, /Vince|Pareggio/);
        const classifica = a.$('#risultati').children[1].children;
        assert.equal(classifica.length, Number(modalita.split('-')[1]));
        assert.ok(classifica.every(li => /fiche/.test(li.textContent)));
        console.log(`OK pagina Mercante ${modalita}: asta, estrazione automatica, premi e classifica di ${classifica.length} giocatori`);
    }
})().catch(errore => { console.error(errore); process.exitCode = 1; });
