# ADR 0007 — Home a categorie, una cartella per gioco

- **Stato:** accettata
- **Data:** 2026-11-04
- **Commit:** Tappa 9 (vedi `git log`)

## Contesto

Con circa 49 giochi una home a schede tutte uguali diventa una lista lunghissima. Bisogna anche decidere dove mettere i nuovi giochi: in sottocartelle per categoria (`carte-italiane/briscola/`) oppure tutte allo stesso livello, come i 5 giochi attuali. Collegamento: [PLAN/18-tappa-09-fondamenta.md](../PLAN/18-tappa-09-fondamenta.md).

## Decisione

- Ogni gioco resta in una propria cartella nella radice, allo stesso livello di quelli di oggi (per esempio `briscola/`, `forza_4/`), con nomi minuscoli e il trattino basso, come `il_impiccato/`. Gli indirizzi attuali non cambiano e i percorsi `../css/` e `../js/` sono uguali per tutti.
- La categoria è un'informazione della home, non della cartella. L'elenco dei giochi (nome, cartella, categoria, descrizione, emoji, "2 giocatori" sì o no) sta in un solo array dentro `home.js`, che disegna le schede.
- La home mostra una sezione per categoria e ha una casella di ricerca che filtra per nome.

## Conseguenze

- Per aggiungere un gioco alla home basta aggiungere una riga all'array.
- La home ora usa JavaScript. Senza JavaScript le schede non compaiono: per un sito di giochi in JavaScript è accettabile.
- La radice avrà circa 50 cartelle: è ordinata in ordine alfabetico, ma meno raggruppata di quanto sarebbe con sottocartelle.
