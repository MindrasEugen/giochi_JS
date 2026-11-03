# Tappa 1 — Struttura: git, PLAN, ADR, audit

Ultima modifica: 2026-11-03

## Obiettivo

Mettere il progetto sotto controllo di versione e creare la documentazione di base, prima di toccare il codice.

## Attività

- [x] Audit iniziale di tutto il progetto in `audit/`
- [x] Cartella `PLAN/` con tutte le tappe
- [x] Cartella `ADR/` con `README.md` e le prime decisioni
- [x] `git init` e `.gitignore` (per esempio `.vscode/`, `Thumbs.db`, `.DS_Store`)
- [x] Primo commit con lo stato iniziale dei giochi e i documenti

## Come verificare

- `git status` dice "working tree clean" dopo il commit.
- `git log --oneline` mostra un commit.
- I link tra `PLAN/`, `ADR/` e `audit/` si aprono dall'editor.

## Esito

Documenti scritti: `PLAN/` (00, 01, 02, 10–15, 90, 91, 99), `ADR/README.md` e ADR 0001–0005, `audit/2026-11-03-progetto-audit.md`. Repository git inizializzato sul ramo `main`, `.gitignore` creato (`.vscode/`, `Thumbs.db`, `.DS_Store`, `node_modules/`), primo commit con lo stato iniziale dei giochi e i documenti. Verifica: `git status` pulito, `git log` con un commit.

## Decisioni prese

- Il progetto resta in HTML, CSS e JavaScript senza framework e senza build ([ADR 0001](../ADR/0001-javascript-senza-framework-ne-build.md)).
- Git solo in locale, un commit per tappa, nessun push (i push li fa l'utente).

## Problemi aperti

Nessuno.
