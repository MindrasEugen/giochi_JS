# Tappa 27 — Schermo intero in tutti gli altri giochi

Ultima modifica: 2026-11-06

## Obiettivo

Portare barra, pannello e tavola a tutta altezza della [Tappa 25](36-tappa-25-schermo-intero.md) a tutti i giochi rimasti. Dopo la prova della Tappa 25 l'utente ha chiesto di farlo **prima** dei gesti degli arcade ([Tappa 26](37-tappa-26-gesti-arcade.md)), partendo dai giochi con il mazzo italiano. Il lavoro è diviso in sotto-tappe, una per famiglia; ognuna ha il suo file, la sua verifica e la prova su telefono.

## Sotto-tappe

| # | Famiglia | File |
|---|---|---|
| 27.1 | Carte italiane: Scopa, Briscola, Scopone, Briscola a 5, Tressette, Cirulla, Asso piglia tutto, Rubamazzetto, Sette e mezzo, Mercante in fiera, Cucù | [39-tappa-27-1-carte-italiane.md](39-tappa-27-1-carte-italiane.md) |
| 27.2 | Carte francesi: Blackjack, Guerra, Cambio colore, Poker, Scala 40, Ramino, Burraco | [40-tappa-27-2-carte-francesi.md](40-tappa-27-2-carte-francesi.md) |
| 27.3 | Tavolo: Dama, Filetto, Battaglia navale, Ludo, Scacchi | [41-tappa-27-3-tavolo.md](41-tappa-27-3-tavolo.md) |
| 27.4 | Logica e parole: Forza 4, Memory, Campo minato, Raddoppia, Sudoku, Cinque lettere | [42-tappa-27-4-logica-parole.md](42-tappa-27-4-logica-parole.md) |
| 27.5 | Giochi storici: Tris, Impiccato, Sasso carta forbici, Indovina il numero | [43-tappa-27-5-storici.md](43-tappa-27-5-storici.md) |

## Come verificare

Vale per ogni sotto-tappa: tutti i test (`node scripts/check.js`) OK; nel browser a 375×667 e 390×844 nessuno scorrimento orizzontale, tavola visibile, pannello funzionante; a 900 e 1280px misure della pagina uguali a prima (confronto con il commit precedente); prova su telefono dell'utente.

## Esito

Tutte e 5 le sotto-tappe completate e provate sul telefono dall'utente: 27.1 `29c1260`, 27.2 `4d5a8b2`, 27.3 `6071bb7`, 27.4 `fcbc50b`, 27.5 `0dbb852`. Dettagli nei file delle sotto-tappe.

## Decisioni prese

- Ordine: prima tutti i giochi, poi i gesti degli arcade (scelta dell'utente, 2026-11-05).

## Problemi aperti

—
