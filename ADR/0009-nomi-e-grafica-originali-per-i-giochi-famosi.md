# ADR 0009 — Nomi e grafica originali per i giochi ispirati a giochi famosi

- **Stato:** accettata
- **Data:** 2026-11-04
- **Commit:** — (Tappe 12, 15, 16, 17 e 21)

## Contesto

Nell'elenco dell'utente ci sono giochi tradizionali e di pubblico dominio (scopa, briscola, scacchi, dama, solitari, battaglia navale) e giochi commerciali famosi, con nome, personaggi e grafica protetti: Tetris, Space Invaders, Pac-Man, Uno, Wordle, Flappy Bird, 2048, Pong. Il progetto è pubblicato online, nel portfolio. Collegamenti: [PLAN/25-tappa-16-arcade-2.md](../PLAN/25-tappa-16-arcade-2.md) e le altre tappe citate sopra.

## Decisione

Dei giochi commerciali si riprende solo il **genere** (la meccanica), con nome, personaggi, grafica e suoni originali:

| Ispirato a | Nome nel progetto | Cosa è originale |
|---|---|---|
| Tetris | **Blocchi** | nome, forme colorate disegnate in CSS/canvas, niente musica o schermate riconoscibili |
| Space Invaders | **Invasione** | nemici disegnati da zero, colori della palette del progetto |
| Pac-Man | **Labirinto** | personaggio, guardiani e labirinto originali |
| Uno | **Cambio colore** | mazzo proprio, simboli e nomi delle carte speciali originali |
| Wordle | **Cinque lettere** | grafica nella palette del progetto |
| Flappy Bird | **Volo** | personaggio e ostacoli originali |
| 2048 | **Raddoppia** | colori delle tessere nella palette del progetto |
| Pong | **Ping pong** | nome generico, grafica del progetto |
| Breakout | **Mattoncini** | nome generico, grafica del progetto |
| Snake | **Serpente** | nome generico |

Le schede della home possono dire "genere: blocchi che cadono", ma non usano i nomi commerciali come titolo.

## Conseguenze

- Il portfolio non pubblica copie di giochi protetti.
- I nomi sono meno riconoscibili. Una riga di descrizione sulla scheda della home spiega com'è il gioco.
