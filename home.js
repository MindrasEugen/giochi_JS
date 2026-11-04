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
    { nome: 'Sasso carta forbici', cartella: 'sasso_carta_forbici', categoria: 'classici', emoji: '✊', dueGiocatori: false,
      descrizione: 'Sfida il computer: vince chi arriva per primo a 5 punti.' },
    { nome: 'Indovina il numero', cartella: 'indovina_il_numero', categoria: 'classici', emoji: '🔢', dueGiocatori: false,
      descrizione: 'Il computer pensa a un numero da 1 a 100: trovalo con meno tentativi possibili.' },
    { nome: 'Sette e mezzo', cartella: 'sette_e_mezzo', categoria: 'italiano', emoji: '🃏', dueGiocatori: false,
      descrizione: 'Il classico gioco di carte contro il banco: avvicinati a 7,5 senza sballare.' },
    { nome: 'Tris', cartella: 'tris', categoria: 'tavolo', emoji: '⭕', dueGiocatori: true,
      descrizione: 'Allinea tre simboli: in due giocatori oppure contro il computer.' },
    { nome: 'L’impiccato', cartella: 'il_impiccato', categoria: 'parole', emoji: '🪢', dueGiocatori: false,
      descrizione: 'Indovina la parola segreta una lettera alla volta, prima di fare 6 errori.' }
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
    giocatori.textContent = gioco.dueGiocatori ? '1–2 giocatori' : '1 giocatore';
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
