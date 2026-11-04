# ADR 0010 — CSS comune delle pagine di gioco (`css/gioco.css`)

- **Stato:** accettata
- **Data:** 2026-11-04
- **Commit:** — (Tappa 13)

## Contesto

Ogni gioco nuovo ha la stessa struttura di pagina: contenitore bianco, titolo, sottotitolo, tabellone verde con i segnapunti, messaggio a pillola, pulsanti, regole richiudibili. Dalla Tappa 11 queste regole sono state copiate in ogni `style.css` (forza_4, memory, campo_minato, raddoppia, sudoku), cosa già segnata in [PLAN/90-fuori-mvp.md](../PLAN/90-fuori-mvp.md). Nella Tappa 13 Codex ha scritto solo gli stili delle tavole di gioco: Dama, Filetto e Battaglia navale sono rimasti con il resto della pagina senza stile. Collegamento: [PLAN/22-tappa-13-tavolo-1.md](../PLAN/22-tappa-13-tavolo-1.md).

## Decisione

- Un file `css/gioco.css` contiene le regole comuni a tutte le pagine di gioco: contenitore, titoli, tabellone e segnapunti, messaggi, azioni, regole, media query 600/900 px, `prefers-reduced-motion`. È mobile-first, come tutto il CSS del progetto.
- Ogni gioco nuovo carica, in ordine: `css/comune.css` (design system), `css/giocatori.css` (modalità 2 giocatori), `css/gioco.css` (pagina di gioco), poi il proprio `style.css`, che contiene solo ciò che è specifico del gioco (tavola, pezzi, stati del turno).
- I giochi già fatti (Tappe 1–12) per ora restano come sono. Spostarli su `gioco.css` è un lavoro a parte.

## Conseguenze

- I giochi nuovi hanno subito l'aspetto comune e il loro `style.css` è più corto.
- Un cambiamento all'aspetto di tutte le pagine di gioco si fa in un solo file, almeno per i giochi che lo usano.
- Per un po' convivono due modi: i giochi vecchi con le regole copiate e quelli nuovi con `gioco.css`.
