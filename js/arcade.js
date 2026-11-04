// Strumenti per i giochi arcade su <canvas>.
// - avvia({ aggiorna, disegna }): ciclo di gioco a passo fisso (60 aggiornamenti al secondo),
//   così il gioco va alla stessa velocità su schermi a 60 Hz e a 120 Hz
// - premuto(tasto): true se il tasto è tenuto premuto (es. 'ArrowLeft', 'KeyW', 'Space')
// - record(chiave) / salvaRecord(chiave, punti): miglior punteggio salvato nel browser
// - adattaCanvas(canvas, larghezza, altezza): disegno nitido anche sugli schermi ad alta densità

const Arcade = (() => {
    const PASSO = 1000 / 60;      // durata di un aggiornamento, in millisecondi
    const MASSIMO_RITARDO = 250;  // se la scheda resta in background, non si recupera più di così
    const TASTI_DEL_GIOCO = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];
    const premuti = new Set();

    if (typeof window !== 'undefined') {
        window.addEventListener('keydown', evento => {
            // le frecce e lo spazio non devono far scorrere la pagina mentre si gioca
            if (TASTI_DEL_GIOCO.includes(evento.code) && evento.target === document.body) {
                evento.preventDefault();
            }
            premuti.add(evento.code);
        });
        window.addEventListener('keyup', evento => premuti.delete(evento.code));
        window.addEventListener('blur', () => premuti.clear());
    }

    function premuto(tasto) {
        return premuti.has(tasto);
    }

    // Quanti aggiornamenti servono per coprire il tempo trascorso (funzione pura, provata con Node)
    function passiDaFare(accumulato, trascorso) {
        const totale = accumulato + Math.min(trascorso, MASSIMO_RITARDO);
        const passi = Math.floor(totale / PASSO);
        return { passi, resto: totale - passi * PASSO };
    }

    function avvia({ aggiorna, disegna }) {
        let ultimo = null;
        let accumulato = 0;
        let inPausa = false;
        let fermo = false;

        function fotogramma(adesso) {
            if (fermo) {
                return;
            }
            if (ultimo === null) {
                ultimo = adesso;
            }
            if (!inPausa) {
                const { passi, resto } = passiDaFare(accumulato, adesso - ultimo);
                for (let i = 0; i < passi; i++) {
                    aggiorna(PASSO / 1000);
                }
                accumulato = resto;
            }
            ultimo = adesso;
            disegna();
            requestAnimationFrame(fotogramma);
        }
        requestAnimationFrame(fotogramma);

        // Pausa automatica quando si cambia scheda
        function suCambioScheda() {
            if (document.hidden) {
                inPausa = true;
            }
        }
        document.addEventListener('visibilitychange', suCambioScheda);

        return {
            pausa() { inPausa = true; },
            riprendi() { inPausa = false; },
            alterna() { inPausa = !inPausa; return inPausa; },
            inPausa() { return inPausa; },
            ferma() {
                fermo = true;
                document.removeEventListener('visibilitychange', suCambioScheda);
            }
        };
    }

    function chiaveRecord(chiave) {
        return `giochi_js_record_${chiave}`;
    }

    function record(chiave) {
        try {
            const valore = Number(localStorage.getItem(chiaveRecord(chiave)));
            return Number.isFinite(valore) ? valore : 0;
        } catch (errore) {
            return 0;
        }
    }

    // Salva solo se è un nuovo record; restituisce true in quel caso
    function salvaRecord(chiave, punti) {
        if (punti <= record(chiave)) {
            return false;
        }
        try {
            localStorage.setItem(chiaveRecord(chiave), String(punti));
        } catch (errore) {
            // senza localStorage il record non si salva, il gioco continua
        }
        return true;
    }

    // Il canvas resta "larghezza × altezza" unità logiche, ma usa tutti i pixel dello schermo
    function adattaCanvas(canvas, larghezza, altezza) {
        const densita = window.devicePixelRatio || 1;
        canvas.width = Math.round(larghezza * densita);
        canvas.height = Math.round(altezza * densita);
        const contesto = canvas.getContext('2d');
        contesto.setTransform(densita, 0, 0, densita, 0, 0);
        return contesto;
    }

    return { PASSO, avvia, premuto, passiDaFare, record, salvaRecord, adattaCanvas };
})();

if (typeof module !== 'undefined') {
    module.exports = Arcade;
}
