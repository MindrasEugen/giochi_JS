# Tappa 3 — Pagina home con tutti i giochi

Ultima modifica: 2026-11-03

## Obiettivo

Una pagina `index.html` nella radice del progetto che presenta i 5 giochi e porta a ognuno con un clic. Da ogni gioco si può tornare alla home.

## Attività

- [x] `index.html` nella radice: titolo, breve presentazione, una scheda per gioco (nome, una riga di descrizione, link)
- [x] `css/home.css` per lo stile della home (usa le variabili del file comune della [Tappa 4](13-tappa-04-css.md), che vengono create già qui)
- [x] Link "← Tutti i giochi" in cima a ogni gioco
- [x] Pagina utilizzabile da telefono (schede una sotto l'altra sugli schermi stretti)

## Come verificare

- Aprire `index.html` nella radice: si vedono 5 schede e ogni link apre il gioco giusto.
- Da ogni gioco il link "Tutti i giochi" riporta alla home.
- Con F12 → modalità dispositivo (larghezza 375 px) le schede sono una sotto l'altra e non serve scorrere in orizzontale.

## Esito

- Creati da Codex (esito buono): `index.html` nella radice, `css/comune.css` (variabili della palette, reset, pulsanti, input, card, `.link-home`, focus visibile, `prefers-reduced-motion`), `css/home.css`. In revisione il sub-agente ha corretto i margini dell'intestazione, annullati da `.contenitore`.
- Aggiunto da Claude il link `← Tutti i giochi` (`class="link-home"`, `href="../index.html"`) in cima ai 5 `index.html` dei giochi. Lo stile del link arriva con la Tappa 4, quando i giochi collegano `css/comune.css`.

Verifica eseguita:
- Tutti i percorsi della home e dei link di ritorno esistono (controllo con `test -f`).
- Screenshot con Edge headless: 375 px → una colonna, nessuno scorrimento orizzontale; 600 px → due colonne; 1000 px → tre colonne. Contrasti AA calcolati da Codex (es. bianco su `#12372A` 13:1).

## Decisioni prese

- Palette scelta dall'utente con lo schema P.A.L.E.T.T.E.: crema `#FFF8E7`, verde scuro `#12372A`, oro `#E9C46A`, font di sistema, solo tema chiaro (il tema scuro resta in [90-fuori-mvp.md](90-fuori-mvp.md)). `home.css` sta in `css/` insieme a `comune.css`, per tenere tutti i fogli di stile condivisi in un punto. Il file `css/comune.css` nasce già in questa tappa ([ADR 0003](../ADR/0003-css-comune-piu-css-del-gioco.md)).
- I link "← Tutti i giochi" nei giochi si aggiungono dopo la fine della Tappa 2, per non modificare gli stessi file in parallelo.

## Problemi aperti

Nessuno.
