const { spawn } = require('child_process');
const http = require('http');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9390',
    'about:blank'
]);

setTimeout(async () => {
    try {
        const targets = await new Promise((res, rej) => {
            http.get('http://127.0.0.1:9390/json', r => {
                let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
            }).on('error', rej);
        });
        const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
        let msgId = 1;
        const pending = new Map();
        ws.addEventListener('message', e => {
            const d = JSON.parse(e.data);
            if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
        });
        const send = (m, p = {}) => new Promise(r => { const id = msgId++; pending.set(id, r); ws.send(JSON.stringify({ id, method: m, params: p })); });
        await new Promise(r => ws.addEventListener('open', r, { once: true }));
        await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html' });
        await send('Runtime.evaluate', {
            expression: `new Promise(resolve => {
                const interval = setInterval(() => {
                    if (document.querySelector('#project-0 .nb-btn-full-project')) {
                        clearInterval(interval);
                        resolve(true);
                    }
                }, 50);
            })`,
            awaitPromise: true
        });

        const metrics = await send('Runtime.evaluate', {
            expression: `(() => {
                const aboutBtn = (document.querySelector('.fg-side-about a') || document.querySelector('.fg-desktop-about-link')).getBoundingClientRect();
                const btn0 = document.querySelector('#project-0 .nb-btn-full-project').getBoundingClientRect();
                return {
                    aboutBtn: { left: aboutBtn.left, right: aboutBtn.right, width: aboutBtn.width },
                    btn0: { left: btn0.left, right: btn0.right, width: btn0.width },
                    gap: aboutBtn.left - btn0.right
                };
            })()`,
            returnByValue: true
        });

        if (metrics.result.exceptionDetails) {
            console.error('Exception:', metrics.result.exceptionDetails);
        } else {
            console.log('Mobile Metrics:', metrics.result.result.value);
        }
        chrome.kill();
        process.exit(0);
    } catch (e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
