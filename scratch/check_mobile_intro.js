const { spawn } = require('child_process');
const http = require('http');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9364',
    '--disable-gpu',
    'about:blank'
]);

setTimeout(async () => {
    try {
        const targets = await new Promise((res, rej) => http.get('http://127.0.0.1:9364/json', r => {
            let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
        }).on('error', rej));
        const target = targets.find(t => t.type === 'page');
        const ws = new WebSocket(target.webSocketDebuggerUrl);
        let id = 1; const pending = new Map();
        ws.addEventListener('message', e => {
            const data = JSON.parse(e.data);
            if (data.id && pending.has(data.id)) { pending.get(data.id)(data); pending.delete(data.id); }
        });
        const send = (m, p = {}) => new Promise(r => { const i = id++; pending.set(i, r); ws.send(JSON.stringify({id: i, method: m, params: p})); });
        await new Promise(r => ws.addEventListener('open', r, { once: true }));

        await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html' });
        await new Promise(r => setTimeout(r, 400));

        const res = await send('Runtime.evaluate', {
            expression: `JSON.stringify({
                docWidth: document.documentElement.scrollWidth,
                winW: window.innerWidth,
                winH: window.innerHeight,
                ov: document.getElementById('site-intro-overlay').getBoundingClientRect(),
                logo: document.querySelector('.intro-logo-img').getBoundingClientRect()
            })`
        });
        console.log('Mobile diagnostic:', res.result.result.value);

        chrome.kill();
        process.exit(0);
    } catch(e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
