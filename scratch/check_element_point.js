const { spawn } = require('child_process');
const http = require('http');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9398;
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

        await send('Emulation.setDeviceMetricsOverride', {
            width: 1440,
            height: 900,
            deviceScaleFactor: 1,
            mobile: false
        });

        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito%20Portfolio/about.html' });
        await new Promise(r => setTimeout(r, 600));

        const expr = `
            (() => {
                const win = document.getElementById('kali-win-contact');
                const handle = win.querySelector('.kali-resize-se');
                const hr = handle.getBoundingClientRect();
                const cx = hr.left + hr.width / 2;
                const cy = hr.top + hr.height / 2;
                const atPoint = document.elementFromPoint(cx, cy);
                return {
                    handleBounds: hr,
                    cx, cy,
                    elementTag: atPoint ? atPoint.tagName : null,
                    elementClass: atPoint ? atPoint.className : null,
                    isHandle: atPoint === handle
                };
            })()
        `;

        const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
        console.log('Element at SE Handle Point:', JSON.stringify(res.result.result.value, null, 2));

        ws.close();
        chrome.kill();
        process.exit(0);
    } catch(err) {
        console.error(err);
        chrome.kill();
        process.exit(1);
    }
}, 1000);
