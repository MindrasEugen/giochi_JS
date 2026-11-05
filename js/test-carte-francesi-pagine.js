// Pagine della Tappa 21 (Blackjack, Guerra, Cambio colore) con un DOM minimo: partite complete con i pulsanti.
const assert = require('node:assert/strict');
const { ambiente, GIOCATORI_FINTI, attendi } = require('../scripts/dom-minimo.js');

function pagina(cartella, modalita) {
    const a = ambiente();
    a.$('#modalitaGioco').value = modalita;
    a.esegui(GIOCATORI_FINTI + "; Giocatori.chiediNomi = async () => ['Uno', 'Due'];");
    for (const f of ['js/mazzo.js', 'js/carte.js', `${cartella}/funzioni.js`, `${cartella}/main.js`]) a.carica(f);
    return a;
}
const bottoni = a => a.$('#opzioniPresa').children;
const scegli = (a, testo) => bottoni(a).find(b => testo.test(b.textContent));

(async () => {
    // Blackjack: si gioca seguendo i pulsanti fino a finire le fiches (o 60 mani)
    for (const modalita of ['uno', 'due']) {
        const a = pagina('blackjack', modalita);
        let mani = 0, passi = 0, divise = 0;
        while (a.$('#risultati').hidden && mani < 60) {
            assert.ok(++passi < 4000);
            const punta = scegli(a, /^Punta 50/) || scegli(a, /^Punta/);
            if (punta) { punta.listeners.click(); mani++; continue; }
            const prossima = scegli(a, /Mano successiva/);
            if (prossima) {
                assert.match(a.$('#messaggi').textContent, /banco|fiches|restituita/i);
                prossima.listeners.click(); continue;
            }
            const dividi = scegli(a, /^Dividi$/);
            if (dividi) { divise++; dividi.listeners.click(); continue; }
            // Durante il gioco la seconda carta del banco è coperta
            if (scegli(a, /^Raddoppia$/)) assert.equal(a.$('#carteBanco').children[1].alt, 'Carta coperta');
            const totale = Number((a.$('#messaggi').textContent.match(/ha(?:i)? (\d+)/) || [])[1] || 0);
            (totale < 17 ? scegli(a, /^Carta$/) : scegli(a, /^Stai$/)).listeners.click();
        }
        assert.ok(mani > 0);
        console.log(`OK pagina Blackjack ${modalita}: ${mani} mani giocate con i pulsanti${divise ? `, ${divise} divisioni` : ''}, carta del banco coperta durante il gioco`);
    }
    // Guerra: battaglie a mano, poi gioco automatico fino alla fine
    for (const modalita of ['uno', 'due']) {
        const a = pagina('guerra', modalita);
        for (let i = 0; i < 5; i++) a.$('#gira').listeners.click();
        assert.match(a.$('#messaggi').textContent, /contro/);
        assert.equal(Number(a.$('#puntiP0').textContent) + Number(a.$('#puntiP1').textContent), 52);
        let giri = 0;
        // setInterval nel DOM minimo non parte da solo: si simulano i giri con il pulsante
        while (a.$('#risultati').hidden) { assert.ok(++giri < 400); a.$('#gira').listeners.click(); }
        assert.match(a.$('#messaggi').textContent, /Vince|Pareggio/);
        assert.equal(a.$('#gira').disabled, true);
        console.log(`OK pagina Guerra ${modalita}: partita completa, 52 carte sempre in gioco`);
    }
    // Cambio colore: le persone giocano la prima carta valida (o pescano), i PC con i timer
    for (const modalita of ['uno-2', 'uno-4', 'due-2', 'due-4']) {
        const a = pagina('cambio_colore', modalita);
        await attendi();
        let passi = 0;
        while (a.$('#risultati').hidden) {
            assert.ok(++passi < 4000, `${modalita}: la partita deve finire`);
            const carte = a.$('#mano').children.filter(b => !b.disabled);
            const colore = scegli(a, /^Colore/), pesca = scegli(a, /Pesca una carta|Passa/);
            if (carte.length || colore || pesca) {
                // È il turno di una persona: le carte degli altri sono coperte
                assert.ok(a.$('#avversari').children.every(z => z.children.slice(1).every(c => c.attributes['aria-label'] === 'Carta coperta')));
                if (colore) colore.listeners.click(); else if (carte.length) carte[0].listeners.click(); else pesca.listeners.click();
            } else if (a.timer.length) a.svuotaTimer(1);
            await attendi();
        }
        assert.match(a.$('#messaggi').textContent, /Vince/);
        console.log(`OK pagina Cambio colore ${modalita}: partita completa, mani altrui coperte`);
    }
})().catch(errore => { console.error(errore); process.exitCode = 1; });
