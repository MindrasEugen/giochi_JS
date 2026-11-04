# Registro

Ultima modifica: 2026-11-03

- 2026-11-03 — Audit iniziale del progetto, creati `PLAN/` (6 tappe), `ADR/` (0001–0005) e `audit/`. In attesa del via dell'utente.
- 2026-11-03 — Piano approvato dall'utente. Tappa 1 completata: `git init` sul ramo `main`, `.gitignore`, primo commit.
- 2026-11-03 — Tappa 2 avviata: file di Indovina il numero spostati in `indovina_il_numero/`, correzioni affidate a Codex. Tappa 3 avviata in parallelo: palette crema/verde scelta dall'utente, home affidata a Codex.
- 2026-11-03 — Tappa 3: home creata da Codex (buono, margini dell'intestazione corretti in revisione). Tappa 2: task di Codex bloccato senza modifiche, fermato su richiesta dell'utente; correzioni fatte da Claude e verificate con jsdom. Tappa 2 completata.
- 2026-11-03 — Tappa 3 completata: link "← Tutti i giochi" nei 5 giochi, home verificata a 375/600/1000 px. Tappa 4 avviata (CSS affidato a Codex), con il via dell'utente già dato.
- 2026-11-03 — Codex della Tappa 4 fermato su richiesta dell'utente ("occupati te personalmente di tutte le modifiche"). Tappa 4 completata da Claude: CSS dei 5 giochi, verificata con screenshot e jsdom.
- 2026-11-03 — Tappa 5 completata: logica del Tris separata dalla pagina, menu Facile/Media, 20 controlli passati. Avviata la Tappa 6.
- 2026-11-03 — Tappa 6 completata: modalità Impossibile con minimax, prova esaustiva (0 vittorie di X su 569 partite) e controllo indipendente su 2097 posizioni. Piano concluso.
- 2026-11-03 — Voce sul minimax salvata nell'archivio globale. Aggiunta la Tappa 7 (restyling moderno di Sasso carta forbici e Tris) su richiesta dell'utente.
- 2026-11-03 — Tappa 7 completata: restyling moderno di Sasso carta forbici e Tris e ritocchi a `css/comune.css`, verificati con jsdom, test del minimax e screenshot.
- 2026-11-03 — Aggiunta la Tappa 8 (stile moderno su Impiccato, Indovina il numero e Sette e mezzo) su richiesta dell'utente.
- 2026-11-03 — Tappa 8 completata: stile moderno su Impiccato, Indovina il numero e Sette e mezzo, verificato con jsdom (23 controlli) e screenshot.
- 2026-11-04 — L'utente chiede 44 giochi nuovi e la modalità 2 giocatori in tutti i giochi che lo permettono. Scritto il piano della seconda parte (Tappe 9–24) e gli ADR 0006–0009 in proposta. In attesa del via.
- 2026-11-04 — L'utente ha aggiunto `carte/` con le 52 carte francesi. Le 40 carte italiane sono state spostate lì da `sette_e_mezzo/pic/` e il percorso in Sette e mezzo è stato aggiornato e verificato.
- 2026-11-04 — Via dell'utente alla seconda parte, con la regola "per il design usa Codex". Tappa 9 avviata: `js/mazzo.js`, `js/carte.js`, `js/giocatori.js`, `js/arcade.js`, `home.js`, anteprima dei componenti; Sette e mezzo usa il mazzo condiviso. CSS affidato a Codex.
- 2026-11-04 — Tappa 9 completata: script condivisi, home a categorie, anteprima dei componenti, carte in `carte/`; design di Codex in due giri (ventaglio corretto nel secondo). ADR 0006–0009 accettati.
- 2026-11-04 — Tappa 10 completata: modalità 2 giocatori in Impiccato, Indovina il numero, Sasso carta forbici, Sette e mezzo e Tris; design di Codex; 42 controlli a 2 giocatori e test precedenti passati.
- 2026-11-04 — Tappa 11 completata: Forza 4 (PC con minimax alfa-beta), Memory, Campo minato; 45 controlli con Node, 37 con jsdom; design di Codex in due giri (caselle del Campo minato rese distinguibili nel secondo).
- 2026-11-04 — Tappa 12 completata: Raddoppia (con sfida a 2 a tessere uguali) e Sudoku (generatore con soluzione unica); 41 controlli con Node, 30 con jsdom; design di Codex al primo giro.
- 2026-11-04 — Correzione chiesta dall'utente: a 2 giocatori in Sette e mezzo uno dei due fa il banco (Tappa 10.1). Codice e test fatti da Claude; resta il ritocco del layout su desktop, affidato a Codex. ADR 0008 e Tappa 21 aggiornati.
- 2026-11-04 — Tappa 10.1 completata: Sette e mezzo a 2 giocatori con uno dei due che fa il banco; layout del banco su desktop corretto da Codex.
