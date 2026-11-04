// Pagina del Cucù con un DOM minimo: partite complete con i pulsanti, carte altrui coperte durante i turni.
const assert = require('node:assert/strict');
const { ambiente, GIOCATORI_FINTI, attendi } = require('../scripts/dom-minimo.js');

const scoperte = el => el.children.flatMap(p => p.children).filter(n => n.src !== undefined && n.className === 'carta' && n.alt !== 'Carta coperta');

(async () => {
    for (const modalita of ['uno-3', 'uno-6', 'due-2', 'due-4']) {
        const a = ambiente();
        a.$('#modalitaGioco').value = modalita;
        a.esegui(GIOCATORI_FINTI + "; Giocatori.chiediNomi = async () => ['Uno', 'Due'];");
        for (const f of ['js/mazzo.js', 'js/carte.js', 'cucu/funzioni.js', 'cucu/main.js']) a.carica(f);
        await attendi();
        let passi = 0;
        while (a.$('#risultati').hidden) {
            assert.ok(++passi < 3000, `${modalita}: la partita deve finire`);
            const bottoni = a.$('#opzioniPresa').children;
            const etichette = bottoni.map(b => b.textContent);
            if (etichette.includes('Tengo la carta')) {
                // Turno di una persona: si vede solo la sua carta
                assert.equal(scoperte(a.$('#posti')).length, 1, `${modalita}: solo la propria carta è scoperta`);
                bottoni[passi % 2].listeners.click();
            } else if (etichette.includes('Mano successiva')) {
                assert.match(a.$('#messaggi').textContent, /perde|perdono|nulla/);
                bottoni[0].listeners.click();
            } else if (a.timer.length) a.svuotaTimer(1);
            await attendi();
        }
        assert.match(a.$('#messaggi').textContent, /Vince/);
        assert.match(a.$('#risultati').children[1].textContent, /^Vince .* dopo \d+ mani\.$/);
        assert.equal(a.$('#posti').children.length, Number(modalita.split('-')[1]));
        console.log(`OK pagina Cucù ${modalita}: partita completa, solo la propria carta visibile nel proprio turno`);
    }
})().catch(errore => { console.error(errore); process.exitCode = 1; });
