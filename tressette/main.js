// Tressette: punti in terzi durante la smazzata, carte pescate mostrate nei messaggi (a 2).
(() => {
    // 7 terzi -> "2 e 1/3"
    const terzi = t => `${Math.floor(t / 3)}${t % 3 ? ` e ${t % 3}/3` : ''}`;
    CarteItalianePagina.avvia({
        motore: Tressette,
        giro: true,
        crea: modalita => Tressette.crea(modalita === 'quattro' ? 4 : 2),
        tabellone: (stato, risultati, { etichetta }) => ({
            voci: [0, 1].map(i => ({ nome: etichetta(i), valore: stato.finita ? risultati.punti[i] : terzi(stato.terzi[i]) })),
            tipo: stato.finita ? 'Punti della smazzata' : "Punti delle prese (l'ultima presa vale 1 punto in più)"
        }),
        info: stato => ({ testo: stato.tavolo.length ? `Seme di uscita: ${stato.tavolo[0].carta.seme}` : 'Nessuna briscola' }),
        invito: stato => stato.tavolo.length ? `Rispondi a ${stato.tavolo[0].carta.seme} se ce l'hai.` : 'Scegli la carta di uscita.',
        descriviRaccolta: (stato, { nome }) => {
            let testo = `${nome(stato.ultimo.giocatore)} prende la presa (${terzi(stato.ultimo.terzi)} punti).`;
            if (stato.ultimo.pescate.length) testo += ` Pescate: ${stato.ultimo.pescate.map(p => `${nome(p.giocatore)} ${Mazzo.nome(p.carta)}`).join(', ')}.`;
            return testo;
        },
        righeFinali: (stato, risultati, { etichetta }) => [0, 1].map(i =>
            `${etichetta(i)}: ${risultati.punti[i]} punti — prese per ${terzi(stato.terzi[i])} punti${Tressette.squadra(stato, stato.ultimaPresa) === i ? ', più 1 per l’ultima presa' : ''}.`)
    });
})();
