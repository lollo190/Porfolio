const { spawn } = require('child_process');
const http = require('http');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9371;

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

        await send('Page.navigate', {
            url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html'
        });

        await new Promise(r => setTimeout(r, 200));
        await send('Runtime.evaluate', {
            expression: `document.getElementById('site-intro-overlay').style.display = 'none'`
        });

        await send('Runtime.evaluate', {
            expression: `openAndFocusWindow('hero-win-contact')`
        });

        await new Promise(r => setTimeout(r, 200));

        // Get rect before drag
        const before = await send('Runtime.evaluate', {
            expression: `(() => {
                const w = document.getElementById('hero-win-contact');
                const r = w.getBoundingClientRect();
                return { left: r.left, top: r.top, transform: window.getComputedStyle(w).transform };
            })()`,
            returnByValue: true
        });

        // Simulate 2px drag
        const dragRes = await send('Runtime.evaluate', {
            expression: `(() => {
                const w = document.getElementById('hero-win-contact');
                const tb = w.querySelector('.kali-titlebar');
                const r = tb.getBoundingClientRect();
                const startX = r.left + 50;
                const startY = r.top + 15;
                
                tb.dispatchEvent(new PointerEvent('pointerdown', { clientX: startX, clientY: startY, button: 0, bubbles: true }));
                window.dispatchEvent(new PointerEvent('pointermove', { clientX: startX + 2, clientY: startY + 2, bubbles: true }));
                window.dispatchEvent(new PointerEvent('pointerup', { clientX: startX + 2, clientY: startY + 2, bubbles: true }));

                const afterR = w.getBoundingClientRect();
                return {
                    before: ${JSON.stringify(before.result.result.value)},
                    after: { left: afterR.left, top: afterR.top, transform: window.getComputedStyle(w).transform }
                };
            })()`,
            returnByValue: true
        });

        console.log('Drag Test:', JSON.stringify(dragRes.result.result.value, null, 2));

        chrome.kill();
        process.exit(0);
    } catch(e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
