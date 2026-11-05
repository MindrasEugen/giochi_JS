// Elenco dei giochi della home (ADR 0007).
// Per aggiungere un gioco basta aggiungere una riga a GIOCHI: la scheda compare da sola nella sua categoria.

const CATEGORIE = [
    { id: 'classici', nome: 'Classici', simbolo: '✌', descrizione: 'Poche regole, una sfida che conosci già.' },
    { id: 'italiano', nome: 'Mazzo italiano', simbolo: '✦', descrizione: 'Il piacere di una partita, come al tavolo di casa.' },
    { id: 'francese', nome: 'Mazzo francese', simbolo: '♠', descrizione: 'Una buona mano e la mossa giusta al momento giusto.' },
    { id: 'solitari', nome: 'Solitari', simbolo: '♣', descrizione: 'Il tuo ritmo, le tue carte. Una pausa tutta per te.' },
    { id: 'arcade', nome: 'Arcade', simbolo: '↯', descrizione: 'Riflessi pronti? Punta al prossimo record.' },
    { id: 'logica', nome: 'Logica', simbolo: '◈', descrizione: 'Metti insieme gli indizi e trova la soluzione.' },
    { id: 'tavolo', nome: 'Da tavolo', simbolo: '♞', descrizione: 'Strategia, intuito e una mossa di vantaggio.' },
    { id: 'parole', nome: 'Parole', simbolo: 'Aa', descrizione: 'Lettera dopo lettera, ogni parola è una scoperta.' }
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
    { nome: 'Blackjack', cartella: 'blackjack', categoria: 'francese', emoji: '🂡', dueGiocatori: true, etichettaGiocatori: '1–2 giocatori · in due uno fa il banco',
      descrizione: 'Punta le fiches e avvicinati a 21 senza superarlo: carta, stai, raddoppia o dividi.' },
    { nome: 'Guerra', cartella: 'guerra', categoria: 'francese', emoji: '⚔️', dueGiocatori: true,
      descrizione: 'Gira una carta a testa: la più alta prende tutto. A parità scoppia la guerra.' },
    { nome: 'Cambio colore', cartella: 'cambio_colore', categoria: 'francese', emoji: '🎨', dueGiocatori: true, etichettaGiocatori: '2–4 giocatori, anche PC',
      descrizione: 'Genere: carte a colori con azioni. Mazzo originale con Fermo, Giro, Pesca 2 e Cambio.' },
    { nome: 'Poker heads-up', cartella: 'poker', categoria: 'francese', emoji: '♠️', dueGiocatori: true,
      descrizione: "Texas Hold'em testa a testa con fiches finte: vedi, rilancia o lascia contro il PC o un amico." },
    { nome: 'Scala 40', cartella: 'scala40', categoria: 'francese', emoji: '🃁', dueGiocatori: true,
      descrizione: 'Scale e tris con due mazzi e i jolly: apri con 40 punti, attacca e chiudi per primo.' },
    { nome: 'Ramino', cartella: 'ramino', categoria: 'francese', emoji: '🀄', dueGiocatori: true,
      descrizione: "Il ramino con due mazzi: apri con 50 punti e liberati delle carte prima dell'avversario." },
    { nome: 'Burraco', cartella: 'burraco', categoria: 'francese', emoji: '🃏', dueGiocatori: true,
      descrizione: 'Jolly e pinelle, pozzetto e burraco da sette carte: chiudi per primo e arriva a 1005 punti.' },
    { nome: 'Klondike', cartella: 'klondike', categoria: 'solitari', emoji: '🂮', dueGiocatori: false,
      descrizione: "Il solitario classico: colonne a colori alterni e quattro basi dall'asso al re. Pesca 1 o 3." },
    { nome: 'FreeCell', cartella: 'freecell', categoria: 'solitari', emoji: '🗃️', dueGiocatori: false,
      descrizione: 'Tutte le carte scoperte e quattro celle libere: ogni partita proposta si può vincere.' },
    { nome: 'Spider', cartella: 'spider', categoria: 'solitari', emoji: '🕷️', dueGiocatori: false,
      descrizione: 'Dieci colonne e due mazzi: completa otto scale dello stesso seme. Con 1, 2 o 4 semi.' },
    { nome: 'Piramide', cartella: 'piramide', categoria: 'solitari', emoji: '🔺', dueGiocatori: false,
      descrizione: 'Smonta la piramide eliminando coppie di carte libere che fanno 13.' },
    { nome: 'Golf', cartella: 'golf', categoria: 'solitari', emoji: '⛳', dueGiocatori: false,
      descrizione: 'Porta sulla base carte di un valore sopra o sotto e svuota le sette colonne.' },
    { nome: 'TriPeaks', cartella: 'tripeaks', categoria: 'solitari', emoji: '🏔️', dueGiocatori: false,
      descrizione: 'Tre picchi di carte da far crollare con serie di valori vicini, re e asso compresi.' },
    { nome: 'Yukon', cartella: 'yukon', categoria: 'solitari', emoji: '❄️', dueGiocatori: false,
      descrizione: 'Come il Klondike senza mazzo: sposti qualunque carta scoperta con tutte quelle sopra.' },
    { nome: 'Scorpione', cartella: 'scorpione', categoria: 'solitari', emoji: '🦂', dueGiocatori: false,
      descrizione: 'Ricomponi i quattro semi dal re all’asso spostando gruppi su carte dello stesso seme.' },
    { nome: 'Orologio', cartella: 'orologio', categoria: 'solitari', emoji: '🕰️', dueGiocatori: false,
      descrizione: 'Ogni carta alla sua ora, prima che escano i quattro re. Tutta fortuna, in pochi minuti.' },
    { nome: 'Le tredici', cartella: 'tredici', categoria: 'solitari', emoji: '🧺', dueGiocatori: false,
      descrizione: 'Tredici colonne scoperte e una carta alla volta: le colonne vuote restano vuote.' },
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
    li.dataset.categoria = gioco.categoria;

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
    const navigazione = document.querySelector('#navigazione-categorie');
    navigazione.textContent = '';
    let trovati = 0;

    for (const categoria of CATEGORIE) {
        const giochi = GIOCHI.filter(g => g.categoria === categoria.id && normalizza(`${g.nome} ${g.descrizione} ${categoria.nome}`).includes(cercato));
        if (giochi.length === 0) {
            continue;
        }
        trovati += giochi.length;

        const sezione = document.createElement('section');
        sezione.className = 'categoria';
        sezione.id = `sezione-${categoria.id}`;
        sezione.dataset.categoria = categoria.id;
        sezione.setAttribute('aria-labelledby', `categoria-${categoria.id}`);

        const testata = document.createElement('div');
        testata.className = 'categoria__testata';
        const simbolo = document.createElement('span');
        simbolo.className = 'categoria__simbolo';
        simbolo.setAttribute('aria-hidden', 'true');
        simbolo.textContent = categoria.simbolo;
        const introduzione = document.createElement('div');
        const titolo = document.createElement('h2');
        titolo.className = 'categoria__titolo';
        titolo.id = `categoria-${categoria.id}`;
        titolo.textContent = categoria.nome;

        const conteggio = document.createElement('span');
        conteggio.className = 'categoria__conteggio';
        conteggio.textContent = giochi.length;
        titolo.appendChild(conteggio);
        const descrizione = document.createElement('p');
        descrizione.className = 'categoria__descrizione';
        descrizione.textContent = categoria.descrizione;
        introduzione.append(titolo, descrizione);
        testata.append(simbolo, introduzione);

        const collegamento = document.createElement('a');
        collegamento.className = 'categoria-link';
        collegamento.href = `#sezione-${categoria.id}`;
        collegamento.textContent = `${categoria.nome} · ${giochi.length}`;
        navigazione.appendChild(collegamento);

        const lista = document.createElement('ul');
        lista.className = 'griglia-giochi';
        giochi.forEach(g => lista.appendChild(creaScheda(g)));

        sezione.append(testata, lista);
        contenitore.appendChild(sezione);
    }

    nessuno.hidden = trovati > 0;
    document.querySelector('#totale-giochi').textContent = GIOCHI.length;
    document.querySelector('#stato-ricerca').textContent = cercato
        ? `${trovati} ${trovati === 1 ? 'gioco trovato' : 'giochi trovati'} per “${filtro.trim()}”`
        : `${GIOCHI.length} giochi, ${CATEGORIE.length} modi di divertirsi.`;
}

document.querySelector('#cerca').addEventListener('input', evento => disegnaHome(evento.target.value));
document.querySelector('#azzera-ricerca').addEventListener('click', () => {
    const cerca = document.querySelector('#cerca');
    cerca.value = '';
    disegnaHome();
    cerca.focus();
});
disegnaHome();
