// Elenco dei giochi della home (ADR 0007).
// Per aggiungere un gioco basta aggiungere una riga a GIOCHI: la scheda compare da sola nella sua categoria.

const CATEGORIE = [
    { id: 'classici', nome: 'Classici' },
    { id: 'italiano', nome: 'Mazzo italiano' },
    { id: 'francese', nome: 'Mazzo francese' },
    { id: 'solitari', nome: 'Solitari' },
    { id: 'arcade', nome: 'Arcade' },
    { id: 'logica', nome: 'Logica' },
    { id: 'tavolo', nome: 'Da tavolo' },
    { id: 'parole', nome: 'Parole' }
];

const GIOCHI = [
    { nome: 'Briscola', cartella: 'briscola', categoria: 'italiano', emoji: '🃏', dueGiocatori: true, etichettaGiocatori: '1–2 persone · 4 con PC',
      descrizione: 'Conquista i carichi: contro il computer, in due o a quattro in coppie con giocatori PC.' },
    { nome: 'Scopa', cartella: 'scopa', categoria: 'italiano', emoji: '🧹', dueGiocatori: true,
      descrizione: 'Scegli le prese per somma e conquista carte, denari, settebello e primiera.' },
    { nome: 'Asso piglia tutto', cartella: 'asso_piglia_tutto', categoria: 'italiano', emoji: '🂡', dueGiocatori: true,
      descrizione: 'Le prese della Scopa con un asso che può raccogliere tutto il tavolo.' },
    { nome: 'Rubamazzetto', cartella: 'rubamazzetto', categoria: 'italiano', emoji: '🗂️', dueGiocatori: true,
      descrizione: 'Prendi le carte uguali o ruba il mazzetto avversario. Vince chi raccoglie più carte.' },
    { nome: 'Scopone scientifico', cartella: 'scopone', categoria: 'italiano', emoji: '🤝', dueGiocatori: true, etichettaGiocatori: '1–2 persone · 4 con PC',
      descrizione: 'La Scopa a quattro in coppie: nove carte a testa, scope, primiera e napola.' },
    { nome: 'Cirulla', cartella: 'cirulla', categoria: 'italiano', emoji: '🔟', dueGiocatori: true,
      descrizione: 'Prese da quindici, asso piglia tutto, matta e bussate che valgono subito delle scope.' },
    { nome: 'Tressette', cartella: 'tressette', categoria: 'italiano', emoji: '3️⃣', dueGiocatori: true, etichettaGiocatori: '1–2 persone · 4 con PC',
      descrizione: 'Rispondi al seme e conquista assi e figure. In due con la pesca o a quattro in coppie.' },
    { nome: 'Briscola chiamata', cartella: 'briscola_chiamata', categoria: 'italiano', emoji: '📣', dueGiocatori: false, etichettaGiocatori: '1 persona · 5 con PC',
      descrizione: "Briscola a cinque: vinci l'asta, scegli la briscola e scopri chi è il tuo socio segreto." },
    { nome: 'Mercante in fiera', cartella: 'mercante', categoria: 'italiano', emoji: '🎪', dueGiocatori: true, etichettaGiocatori: '2–6 giocatori, anche PC',
      descrizione: "Compra le carte all'asta con le fiches e spera che sopravvivano all'estrazione fino ai premi." },
    { nome: 'Cucù', cartella: 'cucu', categoria: 'italiano', emoji: '🐦', dueGiocatori: true, etichettaGiocatori: '2–6 giocatori, anche PC',
      descrizione: 'Tieni la carta o scambiala con il vicino: chi resta con la più bassa perde una vita.' },
    { nome: 'Cinque lettere', cartella: 'cinque_lettere', categoria: 'parole', emoji: '🔤', dueGiocatori: true,
      descrizione: 'Trova la parola in sei tentativi. Da solo o a turni, con indizi per ogni lettera.' },
    { nome: 'Blocchi', cartella: 'blocchi', categoria: 'arcade', emoji: '🟨', dueGiocatori: true,
      descrizione: 'Incastra i pezzi e libera le righe. Da solo o su due campi con la stessa sequenza.' },
    { nome: 'Invasione', cartella: 'invasione', categoria: 'arcade', emoji: '🛸', dueGiocatori: false,
      descrizione: 'Difendi la base con gli scudi e resisti a ondate di droni sempre più veloci.' },
    { nome: 'Volo', cartella: 'volo', categoria: 'arcade', emoji: '🪁', dueGiocatori: true,
      descrizione: 'Guida un aliante tra i varchi: da solo o a turni con gli stessi ostacoli.' },
    { nome: 'Labirinto', cartella: 'labirinto', categoria: 'arcade', emoji: '💠', dueGiocatori: false,
      descrizione: 'Raccogli ogni luce, trova i cristalli e sfuggi ai guardiani del labirinto.' },
    { nome: 'Serpente', cartella: 'serpente', categoria: 'arcade', emoji: '🐍', dueGiocatori: true,
      descrizione: 'Raccogli il cibo, attraversa i bordi e non morderti la coda: da solo o con due serpenti.' },
    { nome: 'Ping pong', cartella: 'ping_pong', categoria: 'arcade', emoji: '🏓', dueGiocatori: true,
      descrizione: 'Rimanda la palla al computer o a un amico. Vince chi arriva per primo a 7 punti.' },
    { nome: 'Mattoncini', cartella: 'mattoncini', categoria: 'arcade', emoji: '🧱', dueGiocatori: false,
      descrizione: 'Tre livelli, tre vite e bonus da raccogliere: libera il campo e supera il tuo record.' },
    { nome: 'Sasso carta forbici', cartella: 'sasso_carta_forbici', categoria: 'classici', emoji: '✊', dueGiocatori: true,
      descrizione: 'Contro il computer o contro un amico: vince chi arriva per primo a 5 punti.' },
    { nome: 'Indovina il numero', cartella: 'indovina_il_numero', categoria: 'classici', emoji: '🔢', dueGiocatori: true,
      descrizione: 'Trova il numero da 1 a 100 con meno tentativi possibili, da solo o sfidando un amico.' },
    { nome: 'Sette e mezzo', cartella: 'sette_e_mezzo', categoria: 'italiano', emoji: '🃏', dueGiocatori: true,
      descrizione: 'Il classico gioco di carte contro il banco, da soli o in due: avvicinati a 7,5 senza sballare.' },
    { nome: 'Forza 4', cartella: 'forza_4', categoria: 'logica', emoji: '🔴', dueGiocatori: true,
      descrizione: 'Fai cadere le pedine e allineane 4: contro un amico o contro il computer, fino al livello Difficile.' },
    { nome: 'Memory', cartella: 'memory', categoria: 'logica', emoji: '🧠', dueGiocatori: true,
      descrizione: 'Gira le carte e trova le coppie: da solo contro il tempo o a turni con un amico.' },
    { nome: 'Campo minato', cartella: 'campo_minato', categoria: 'logica', emoji: '💣', dueGiocatori: false,
      descrizione: 'Apri tutte le caselle senza mine aiutandoti con i numeri. Tre livelli e record del tempo.' },
    { nome: 'Raddoppia', cartella: 'raddoppia', categoria: 'logica', emoji: '➕', dueGiocatori: true,
      descrizione: 'Fai scorrere le tessere e unisci quelle uguali fino a 2048. In due: sfida con le stesse tessere.' },
    { nome: 'Sudoku', cartella: 'sudoku', categoria: 'logica', emoji: '🧩', dueGiocatori: false,
      descrizione: 'Il classico rompicapo dei numeri, con tre difficoltà, note a matita e soluzione sempre unica.' },
    { nome: 'Tris', cartella: 'tris', categoria: 'tavolo', emoji: '⭕', dueGiocatori: true,
      descrizione: 'Allinea tre simboli: in due giocatori oppure contro il computer.' },
    { nome: 'Dama', cartella: 'dama', categoria: 'tavolo', emoji: '⚪', dueGiocatori: true,
      descrizione: 'La dama italiana con presa obbligatoria: contro un amico o contro il computer in tre livelli.' },
    { nome: 'Filetto', cartella: 'filetto', categoria: 'tavolo', emoji: '🔵', dueGiocatori: true,
      descrizione: 'Il mulino a 9 pedine: fai tre in fila per togliere una pedina all’avversario.' },
    { nome: 'Battaglia navale', cartella: 'battaglia_navale', categoria: 'tavolo', emoji: '🚢', dueGiocatori: true,
      descrizione: 'Disponi la flotta e affonda quella nemica: contro il computer o passando il telefono a un amico.' },
    { nome: 'Ludo', cartella: 'ludo', etichettaGiocatori: '1\u20134 giocatori', categoria: 'tavolo', emoji: '🎲', dueGiocatori: true,
      descrizione: 'Il “Non t’arrabbiare” da 2 a 4 giocatori: persone o computer, porta a casa tutte le pedine.' },
    { nome: 'Scacchi', cartella: 'scacchi', categoria: 'tavolo', emoji: '♟️', dueGiocatori: true,
      descrizione: 'Tutte le regole degli scacchi: contro un amico o contro il computer in tre livelli.' },
    { nome: 'L’impiccato', cartella: 'il_impiccato', categoria: 'parole', emoji: '🪢', dueGiocatori: true,
      descrizione: 'Indovina la parola segreta una lettera alla volta; in due, la parola la sceglie l’altro giocatore.' }
];

// Toglie gli accenti e mette in minuscolo, così "piu" trova anche "più"
function normalizza(testo) {
    return testo.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function creaScheda(gioco) {
    const li = document.createElement('li');
    li.className = 'card scheda';

    const emoji = document.createElement('span');
    emoji.className = 'emoji-gioco';
    emoji.setAttribute('aria-hidden', 'true');
    emoji.textContent = gioco.emoji;

    const titolo = document.createElement('h3');
    titolo.className = 'scheda__titolo';
    titolo.textContent = gioco.nome;

    const descrizione = document.createElement('p');
    descrizione.className = 'scheda__descrizione';
    descrizione.textContent = gioco.descrizione;

    const etichette = document.createElement('p');
    etichette.className = 'scheda__etichette';
    const giocatori = document.createElement('span');
    giocatori.className = gioco.dueGiocatori ? 'etichetta etichetta--due' : 'etichetta';
    giocatori.textContent = gioco.etichettaGiocatori || (gioco.dueGiocatori ? '1\u20132 giocatori' : '1 giocatore');
    etichette.appendChild(giocatori);

    const link = document.createElement('a');
    link.className = 'pulsante';
    link.href = `./${gioco.cartella}/index.html`;
    link.textContent = 'Gioca';
    link.setAttribute('aria-label', `Gioca a ${gioco.nome}`);

    li.append(emoji, titolo, descrizione, etichette, link);
    return li;
}

function disegnaHome(filtro = '') {
    const contenitore = document.querySelector('#categorie');
    const nessuno = document.querySelector('#nessun-risultato');
    const cercato = normalizza(filtro.trim());
    contenitore.textContent = '';
    let trovati = 0;

    for (const categoria of CATEGORIE) {
        const giochi = GIOCHI.filter(g => g.categoria === categoria.id && normalizza(`${g.nome} ${g.descrizione}`).includes(cercato));
        if (giochi.length === 0) {
            continue;
        }
        trovati += giochi.length;

        const sezione = document.createElement('section');
        sezione.className = 'categoria';
        sezione.setAttribute('aria-labelledby', `categoria-${categoria.id}`);

        const titolo = document.createElement('h2');
        titolo.className = 'categoria__titolo';
        titolo.id = `categoria-${categoria.id}`;
        titolo.textContent = categoria.nome;

        const conteggio = document.createElement('span');
        conteggio.className = 'categoria__conteggio';
        conteggio.textContent = giochi.length;
        titolo.appendChild(conteggio);

        const lista = document.createElement('ul');
        lista.className = 'griglia-giochi';
        giochi.forEach(g => lista.appendChild(creaScheda(g)));

        sezione.append(titolo, lista);
        contenitore.appendChild(sezione);
    }

    nessuno.hidden = trovati > 0;
    document.querySelector('#totale-giochi').textContent = GIOCHI.length;
}

document.querySelector('#cerca').addEventListener('input', evento => disegnaHome(evento.target.value));
disegnaHome();
