# ADR 0011 — Tavolo condiviso delle carte italiane da 2 a 5 posti

- **Stato:** accettata
- **Data:** 2026-11-05
- **Commit:** — (Tappa 19)

## Contesto

Nella Tappa 18 il motore delle prese (`js/prese-italiane.js`) e la pagina condivisa (`js/carte-italiane-pagina.js`) erano pensati per due giocatori; solo la Briscola aveva un caso speciale per quattro. La Tappa 19 aggiunge Scopone scientifico (4 in coppie), Cirulla (Scopa con regole in più), Tressette (2 o 4, obbligo di rispondere al seme) e Briscola chiamata (5 giocatori, asta e scelta del seme prima di giocare). Scrivere quattro pagine separate avrebbe copiato centinaia di righe già provate. Collegamento: [PLAN/28-tappa-19-italiano-2.md](../PLAN/28-tappa-19-italiano-2.md).

## Decisione

- **Motore delle prese:** `js/prese-italiane.js` gestisce le varianti con una tabella (giocatori, carte in mano, carte in tavola). Le carte prese e le scope sono contate **per squadra**: a 2 giocatori la squadra coincide con il giocatore, a 4 si gioca in coppie 0+2 contro 1+3. Scopone e Cirulla sono varianti di questo motore; Tressette e Briscola chiamata hanno un motore proprio, come la Briscola.
- **Pagina condivisa:** `js/carte-italiane-pagina.js` gestisce da 2 a 5 posti. In modalità "2 giocatori" i posti 0 e 1 sono persone e gli altri PC; la mano mostrata è quella della persona di turno, e durante i turni PC resta coperta. Le carte che le regole non permettono di giocare sono disabilitate.
- **Mosse senza carta:** se il motore propone mosse senza carta (asta, scelta del seme), la pagina le mostra come pulsanti con il testo dato da `etichettaMossa`.
- **Testi propri di ogni gioco:** tabellone, riquadro informativo, messaggi e conteggio finale si passano nel `config` di ogni `main.js` (`tabellone`, `info`, `descrivi`, `righeFinali`…), così i motori restano senza testi di pagina e si provano con Node.

## Conseguenze

- Le quattro pagine nuove hanno un `main.js` di poche righe; Briscola, Scopa, Asso piglia tutto e Rubamazzetto funzionano come prima (stessi test).
- Il controller condiviso è più lungo e ha più opzioni: una modifica va provata con entrambe le suite (`js/test-carte-italiane-pagine.js` e `js/test-carte-italiane-nuove-pagine.js`).
- Mercante in fiera e Cucù (Tappa 20, [PLAN/29-tappa-20-italiano-3.md](../PLAN/29-tappa-20-italiano-3.md)) non usano questo tavolo: posti con vite o fiches, asta con lotti ed estrazione sono troppo diversi. Hanno un controller proprio e riusano solo mazzo, carte, finestre e CSS.
- La Cirulla si gioca solo a 2 e la Briscola chiamata solo con una persona e quattro PC: altre combinazioni richiederebbero nuove regole di visibilità delle mani.
