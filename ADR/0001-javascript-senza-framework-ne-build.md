# ADR 0001 — HTML, CSS e JavaScript senza framework né build

- **Stato:** accettata
- **Data:** 2026-11-03
- **Commit:** — (Tappa 1)

## Contesto

I 5 giochi sono esercizi per imparare il DOM, gli eventi, gli array e i timer. Sono già scritti in JavaScript "vanilla", con script classici (`<script src>`, senza `type="module"`). Si aprono con un doppio clic su `index.html`, senza server e senza installare nulla. Collegamento: [PLAN/10-tappa-01-struttura.md](../PLAN/10-tappa-01-struttura.md).

## Decisione

Si resta senza framework (niente React), senza librerie CSS (niente Tailwind o Bootstrap) e senza build (niente Vite). Niente `type="module"`, perché i moduli ES non funzionano aprendo il file con `file://`: servirebbe un server locale. I file JS si caricano con più `<script>` in ordine. Lo stack standard dei progetti (Express, React, Prisma) non si applica qui, perché non c'è né backend né database.

## Conseguenze

- Ogni gioco si apre direttamente nel browser, ed è facile da leggere per chi sta imparando.
- Senza moduli, le funzioni condivise tra file sono globali. L'ordine dei `<script>` conta e i nomi vanno scelti con cura per non scontrarsi.
- Lo script di prova del minimax (Tappa 6) deve poter leggere `funzioni.js` anche da Node, senza `import`.
