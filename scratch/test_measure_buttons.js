const { spawn } = require('child_process');
const http = require('http');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9382',
    'about:blank'
]);

setTimeout(async () => {
    try {
        const targets = await new Promise((res, rej) => {
            http.get('http://127.0.0.1:9382/json', r => {
                let d = '';
                r.on('data', c => d += c);
                r.on('end', () => res(JSON.parse(d)));
            }).on('error', rej);
        });
        const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
        let msgId = 1;
        const pending = new Map();
        ws.addEventListener('message', e => {
            const d = JSON.parse(e.data);
            if (d.id && pending.has(d.id)) {
                pending.get(d.id)(d);
                pending.delete(d.id);
            }
        });
        const send = (m, p = {}) => new Promise(r => {
            const id = msgId++;
            pending.set(id, r);
            ws.send(JSON.stringify({ id, method: m, params: p }));
        });
        await new Promise(r => ws.addEventListener('open', r, { once: true }));
        await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html' });
        // Wait for page to be built
        await send('Runtime.evaluate', {
            expression: `new Promise((resolve) => {
                if (document.querySelector('.nb-project')) return resolve(true);
                const check = setInterval(() => {
                    if (document.querySelector('.nb-project')) {
                        clearInterval(check);
                        resolve(true);
                    }
                }, 50);
            })`,
            awaitPromise: true
        });

        const layout = await send('Runtime.evaluate', {
            expression: `(() => {
                const aboutBtn = document.querySelector('.fg-desktop-about-link').getBoundingClientRect();
                const btns = Array.from(document.querySelectorAll('.nb-btn-full-project')).map((b, i) => {
                    const r = b.getBoundingClientRect();
                    return { index: i, left: r.left, right: r.right, width: r.width, top: r.top, bottom: r.bottom };
                });
                return {
                    aboutBtn: { left: aboutBtn.left, right: aboutBtn.right, top: aboutBtn.top, bottom: aboutBtn.bottom, width: aboutBtn.width },
                    btns
                };
            })()`,
            returnByValue: true
        });
        if (layout.result.exceptionDetails) {
            console.error('Exception:', layout.result.exceptionDetails);
        } else {
            console.log('Layout output:', JSON.stringify(layout.result.result.value, null, 2));
        }
        chrome.kill();
        process.exit(0);
    } catch (e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
