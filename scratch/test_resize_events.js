const { spawn } = require('child_process');
const http = require('http');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9399;
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

        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito%20Portfolio/about.html' });
        await new Promise(r => setTimeout(r, 600));

        const testExpr = `
            (() => {
                const win = document.getElementById('kali-win-contact');
                const handle = win.querySelector('.kali-resize-se');
                const before = { w: win.offsetWidth, h: win.offsetHeight };
                
                // Dispatch pointerdown
                handle.dispatchEvent(new PointerEvent('pointerdown', {
                    clientX: 400,
                    clientY: 700,
                    pointerId: 1,
                    bubbles: true
                }));

                // Dispatch pointermove
                handle.dispatchEvent(new PointerEvent('pointermove', {
                    clientX: 460,
                    clientY: 750,
                    pointerId: 1,
                    bubbles: true
                }));

                // Dispatch pointerup
                handle.dispatchEvent(new PointerEvent('pointerup', {
                    clientX: 460,
                    clientY: 750,
                    pointerId: 1,
                    bubbles: true
                }));

                const after = { w: win.offsetWidth, h: win.offsetHeight, styleW: win.style.width, styleH: win.style.height };
                return { before, after };
            })()
        `;

        const res = await send('Runtime.evaluate', { expression: testExpr, returnByValue: true, awaitPromise: true });
        console.log('Direct PointerEvent test:', JSON.stringify(res.result.result.value, null, 2));

        ws.close();
        chrome.kill();
        process.exit(0);
    } catch(err) {
        console.error(err);
        chrome.kill();
        process.exit(1);
    }
}, 1000);
