const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9369;
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

        await new Promise(r => ws.addEventListener('open', r, { once: true }));

        await send('Emulation.setDeviceMetricsOverride', {
            width: 390,
            height: 844,
            deviceScaleFactor: 2,
            mobile: true
        });

        await send('Page.navigate', {
            url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html'
        });

        await new Promise(r => setTimeout(r, 200));
        await send('Runtime.evaluate', {
            expression: `document.getElementById('site-intro-overlay').style.display = 'none'`
        });

        // Open contact window via openAndFocusWindow('hero-win-contact')
        await send('Runtime.evaluate', {
            expression: `openAndFocusWindow('hero-win-contact')`
        });

        await new Promise(r => setTimeout(r, 600));

        let shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\buggy_contact_window_mobile.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Saved buggy_contact_window_mobile.png');

        const info = await send('Runtime.evaluate', {
            expression: `(() => {
                const win = document.getElementById('hero-win-contact');
                const r = win.getBoundingClientRect();
                const cs = window.getComputedStyle(win);
                return {
                    rect: { top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom },
                    position: cs.position,
                    transform: cs.transform,
                    top: cs.top,
                    left: cs.left,
                    zIndex: cs.zIndex
                };
            })()`,
            returnByValue: true
        });

        console.log('Mobile contact win info:', JSON.stringify(info.result.result.value, null, 2));

        chrome.kill();
        process.exit(0);
    } catch(e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
