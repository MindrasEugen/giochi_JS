# ADR 0014 — Aiutante comune dei solitari con ricerca in avanti

- **Stato:** accettata
- **Data:** 2026-11-06
- **Commit:** — (Tappa 32)

## Contesto

L'utente ha chiesto, per i solitari, un suggerimento per chi si blocca e un avviso quando non ci sono più mosse. I solitari sono 10 e usano già la stessa pagina (`js/solitario-pagina.js`) e le stesse funzioni delle regole (`disposizione`, `puoPrendere`, `puoPosare`, `sposta`, `clicMazzo`). Solo 4 (Piramide, Golf, TriPeaks, Orologio) avevano un controllo esatto della partita bloccata (`bloccata()`). Collegamento: [PLAN/50-tappa-32-solitari-aiuto.md](../PLAN/50-tappa-32-solitari-aiuto.md).

## Decisione

Un solo aiutante comune, `js/solitario-aiuto.js`, che non conosce le regole dei giochi: le usa attraverso le funzioni del motore.

- Prova le mosse su copie leggere della partita e cerca la strada più corta verso un **progresso**: una carta in più sulle basi (peso 4), una carta coperta scoperta (peso 2), una cella o colonna liberata (peso 1). I clic sul mazzo da soli non contano: il confronto riparte dalla posizione dopo i clic. Con gli scarti (Klondike) a ogni passo si prova tutto il giro del mazzo.
- Limiti: 6 mosse in avanti, 20.000 posizioni, 250 millisecondi.
- **Suggerimento** = prima mossa di quella strada (o "tocca il mazzo").
- **Nessuna mossa utile** = la ricerca ha guardato tutto, entro i limiti, senza trovare progressi, e il mazzo non porta carte nuove. Se un limite finisce prima, la ricerca è incompleta e l'avviso non compare.
- I 4 giochi con `bloccata()` tengono il loro controllo esatto, che chiude la partita. Negli altri 6 l'avviso non chiude la partita: si può annullare.

## Conseguenze

- Un solitario nuovo che rispetta le stesse funzioni avrà suggerimento e avviso senza lavoro in più.
- La ricerca ha dei limiti: una via d'uscita molto lunga (soprattutto in FreeCell, Spider, Klondike con più giri del mazzo) può sfuggire. Per questo l'avviso dice «Nessuna mossa utile» e non dichiara la partita persa, e Annulla resta attivo.
- La ricerca gira sul telefono dopo ogni mossa (in un attimo nella maggior parte delle posizioni, fino a circa 250 ms nelle posizioni difficili); parte poco dopo il disegno, per non rallentare la mossa.
- I suggerimenti sono "golosi": portano al prossimo progresso, non alla vittoria. Seguendoli sempre non si vince ogni partita.
