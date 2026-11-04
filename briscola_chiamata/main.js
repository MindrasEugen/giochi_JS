// Briscola chiamata: asta e scelta del seme con i pulsanti delle opzioni; i punti delle squadre restano nascosti
// finché il socio non gioca la carta chiamata.
(() => {
    const B = BriscolaChiamata;
    const cartaChiamata = stato => Mazzo.italiano().find(c => c.numero === stato.chiamata.numero && c.seme === stato.chiamata.seme);
    const scoperto = stato => stato.socioRivelato || stato.finita;
    const offerta = (stato, nome) => stato.migliore
        ? `Offerta migliore: ${nome(stato.migliore.giocatore)} chiama ${B.NOMI[stato.migliore.numero]}${stato.migliore.numero === 2 ? ` a ${stato.migliore.punti} punti` : ''}`
        : 'Nessuna offerta per ora';
    const passati = (stato, nome) => stato.passati.length ? `Hanno passato: ${stato.passati.map(nome).join(', ')}` : 'Nessuno ha ancora passato';
    const squadra = (stato, nome) => stato.socio === stato.chiamante ? `${nome(stato.chiamante)} (da solo)` : `${nome(stato.chiamante)} + ${nome(stato.socio)}`;
    CarteItalianePagina.avvia({
        motore: B,
        giro: true,
        crea: () => B.crea(),
        tabellone: (stato, risultati, { nome }) => {
            if (stato.fase !== 'gioco') return { voci: [{ nome: 'Asta', valore: stato.migliore ? nome(stato.migliore.giocatore) : '—' }, { nome: 'Obiettivo', valore: stato.migliore?.punti ?? 61 }], tipo: passati(stato, nome) };
            return {
                voci: [{ nome: scoperto(stato) ? squadra(stato, nome) : `${nome(stato.chiamante)} + socio segreto`, valore: scoperto(stato) ? risultati.punti[0] : '?' },
                    { nome: 'Gli altri', valore: scoperto(stato) ? risultati.punti[1] : '?' }],
                tipo: `Il chiamante deve arrivare a ${stato.soglia} punti`
            };
        },
        info: (stato, { nome }) => stato.fase === 'asta' ? { testo: offerta(stato, nome) }
            : stato.fase === 'seme' ? { testo: 'Il chiamante sceglie la briscola' }
            : { testo: `Briscola: ${stato.briscola.seme} · carta chiamata`, carta: cartaChiamata(stato) },
        invito: stato => stato.fase === 'asta' ? 'Fai la tua offerta oppure passa.' : stato.fase === 'seme' ? 'Hai vinto l’asta: scegli il seme di briscola.' : 'Scegli una carta dalla tua mano.',
        descrivi: (stato, { nome }) => {
            if (stato.fase === 'asta' && stato.ultimo?.ridistribuita) return 'Tutti hanno passato: nuova distribuzione.';
            if (stato.fase === 'seme') return `${nome(stato.chiamante)} vince l’asta.`;
            if (stato.fase === 'gioco' && stato.ultimo?.chiamata && !stato.tavolo.length && stato.catturate.every(c => !c.length))
                return `Si chiama ${Mazzo.nome(cartaChiamata(stato))}: chi ce l’ha è il socio segreto.`;
            const ultima = stato.tavolo.at(-1)?.carta;
            if (ultima && ultima.numero === stato.chiamata?.numero && ultima.seme === stato.chiamata.seme)
                return stato.socio === stato.chiamante ? `${nome(stato.chiamante)} giocava da solo!` : `È la carta chiamata: ${nome(stato.socio)} è il socio!`;
            return '';
        },
        messaggioFinale: (stato, risultati, { nome }) =>
            `${squadra(stato, nome)}: ${risultati.punti[0]} punti su ${stato.soglia}. ${risultati.vincitore === 0 ? 'Vince la squadra del chiamante!' : 'Vincono gli altri!'}`,
        righeFinali: (stato, risultati, { nome }) => [
            `Chiamante: ${nome(stato.chiamante)}, carta chiamata ${Mazzo.nome(cartaChiamata(stato))}, socio: ${stato.socio === stato.chiamante ? 'nessuno (da solo)' : nome(stato.socio)}.`,
            `Squadra del chiamante: ${risultati.punti[0]} punti (obiettivo ${stato.soglia}). Gli altri: ${risultati.punti[1]} punti.`,
            `Punti per giocatore: ${stato.catturate.map((carte, i) => `${nome(i)} ${carte.reduce((n, c) => n + B.puntiCarta(c), 0)}`).join(', ')}.`
        ]
    });
})();
