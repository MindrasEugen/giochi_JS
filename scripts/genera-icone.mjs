// Genera icone e schermate di avvio dell'app Android da scripts/icona-app.svg (Tappa 29).
// Usa Chrome senza finestra tramite il protocollo DevTools: nessuna dipendenza da installare.
// Uso: node scripts/genera-icone.mjs   (variabile CHROME per un percorso diverso di Chrome)
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const radice = join(dirname(fileURLToPath(import.meta.url)), '..');
const res = join(radice, 'android', 'app', 'src', 'main', 'res');
const svg = readFileSync(join(radice, 'scripts', 'icona-app.svg'), 'utf8');
const dati = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
const VERDE = '#234735', CREMA = '#FFFEFA';

// Ogni immagine è una piccola pagina HTML fotografata alla misura giusta
const pagina = (corpo, sfondo = 'transparent') => `<!DOCTYPE html><html><body style="margin:0;background:${sfondo};
  width:100vw;height:100vh;display:grid;place-items:center;overflow:hidden;font-family:system-ui,sans-serif">${corpo}</body></html>`;
const icona = (lato, forma) => pagina(`<div style="width:${lato}px;height:${lato}px;background:${VERDE};border-radius:${forma === 'tonda' ? '50%' : '22%'};
  position:relative;overflow:hidden"><img src="${dati}" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
  width:${lato * 1.3}px;height:${lato * 1.3}px"></div>`);
const avvio = (l, a) => {
    const lato = Math.min(l, a) * 0.6;
    return pagina(`<div style="display:grid;justify-items:center;gap:0">
      <img src="${dati}" style="width:${lato}px;height:${lato}px">
      <div style="color:${CREMA};font-weight:700;font-size:${lato * 0.12}px;letter-spacing:-0.01em">Giochi di una volta</div></div>`, VERDE);
};

const lavori = [];
const densita = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [nome, k] of Object.entries(densita)) {
    lavori.push({ file: `mipmap-${nome}/ic_launcher_foreground.png`, l: 108 * k, a: 108 * k, html: pagina(`<img src="${dati}" style="width:100%;height:100%">`) });
    lavori.push({ file: `mipmap-${nome}/ic_launcher.png`, l: 48 * k, a: 48 * k, html: icona(48 * k, 'quadrata') });
    lavori.push({ file: `mipmap-${nome}/ic_launcher_round.png`, l: 48 * k, a: 48 * k, html: icona(48 * k, 'tonda') });
}
const avvii = { mdpi: [320, 480], hdpi: [480, 800], xhdpi: [720, 1280], xxhdpi: [960, 1600], xxxhdpi: [1280, 1920] };
for (const [nome, [l, a]] of Object.entries(avvii)) {
    lavori.push({ file: `drawable-port-${nome}/splash.png`, l, a, html: avvio(l, a) });
    lavori.push({ file: `drawable-land-${nome}/splash.png`, l: a, a: l, html: avvio(a, l) });
}
lavori.push({ file: 'drawable/splash.png', l: 480, a: 320, html: avvio(480, 320) });

const chrome = spawn(process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    ['--headless=new', '--remote-debugging-port=9334', `--user-data-dir=${mkdtempSync(join(tmpdir(), 'icone-'))}`, '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const attesa = ms => new Promise(r => setTimeout(r, ms));
let lista;
for (let i = 0; i < 50 && !lista; i++) {
    try { lista = await (await fetch('http://127.0.0.1:9334/json')).json(); } catch { await attesa(200); }
}
const ws = new WebSocket(lista.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const risposte = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (risposte.has(m.id)) { risposte.get(m.id)(m); risposte.delete(m.id); } });
const invia = (method, params = {}) => new Promise(r => { const n = ++id; risposte.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
await invia('Page.enable');
await invia('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
for (const { file, l, a, html } of lavori) {
    await invia('Emulation.setDeviceMetricsOverride', { width: l, height: a, deviceScaleFactor: 1, mobile: false });
    await invia('Page.navigate', { url: `data:text/html;base64,${Buffer.from(html).toString('base64')}` });
    await attesa(250);
    const foto = await invia('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(res, file), Buffer.from(foto.result.data, 'base64'));
}
ws.close(); chrome.kill();
console.log(`${lavori.length} immagini generate in android/app/src/main/res`);
process.exit(0);
