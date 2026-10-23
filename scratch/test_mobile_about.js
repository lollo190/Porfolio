const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9394;
const artDir = 'C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc';

const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--disable-gpu',
    'about:blank'
]);

function getJSON(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

setTimeout(async () => {
    try {
        const targets = await getJSON('http://127.0.0.1:' + port + '/json');
        const target = targets.find(t => t.type === 'page');
        const ws = new WebSocket(target.webSocketDebuggerUrl);
        await new Promise(r => ws.addEventListener('open', r, { once: true }));

        let msgId = 1;
        const pending = new Map();
        ws.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            if (data.id && pending.has(data.id)) {
                pending.get(data.id)(data);
                pending.delete(data.id);
            }
        });
        function send(method, params = {}) {
            return new Promise((resolve) => {
                const id = msgId++;
                pending.set(id, resolve);
                ws.send(JSON.stringify({ id, method, params }));
            });
        }

        // Mobile metrics iPhone 14 / standard 390x844
        await send('Emulation.setDeviceMetricsOverride', {
            width: 390,
            height: 844,
            deviceScaleFactor: 2,
            mobile: true
        });

        const url = 'file:///c:/Users/lory/Desktop/Sito%20Portfolio/about.html';
        await send('Page.navigate', { url });
        await new Promise(r => setTimeout(r, 900));

        const expr = `
            (() => {
                const wins = ['projects', 'contact', 'cv'];
                return wins.map(k => {
                    const el = document.getElementById('kali-win-' + k);
                    const r = el.getBoundingClientRect();
                    return {
                        key: k,
                        isOpen: !el.classList.contains('is-closed'),
                        left: Math.round(r.left),
                        top: Math.round(r.top),
                        width: Math.round(r.width),
                        height: Math.round(r.height)
                    };
                });
            })()
        `;

        const res = (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.result.value;
        console.log('Mobile Window metrics:', JSON.stringify(res, null, 2));

        const shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(artDir + '\\about_mobile_triptych.png', Buffer.from(shot.result.data, 'base64'));
        console.log('Saved about_mobile_triptych.png');

        ws.close();
        chrome.kill();
        process.exit(0);
    } catch(err) {
        console.error(err);
        chrome.kill();
        process.exit(1);
    }
}, 1000);
