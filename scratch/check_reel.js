const { spawn } = require('child_process');
const http = require('http');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9361',
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
        const targets = await getJSON('http://127.0.0.1:9361/json');
        const target = targets.find(t => t.type === 'page');
        const ws = new WebSocket(target.webSocketDebuggerUrl);
        await new Promise(r => ws.addEventListener('open', r, { once: true }));

        let id = 1;
        function send(method, params = {}) {
            return new Promise(resolve => {
                const reqId = id++;
                const handler = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.id === reqId) {
                        ws.removeEventListener('message', handler);
                        resolve(data);
                    }
                };
                ws.addEventListener('message', handler);
                ws.send(JSON.stringify({ id: reqId, method, params }));
            });
        }

        await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html' });
        await new Promise(r => setTimeout(r, 1200));

        const res = await send('Runtime.evaluate', {
            expression: `(() => {
                const left = document.querySelector('.fg-hero-window-left');
                const content = left.querySelector('.fg-hero-window-content');
                const img = left.querySelector('img');
                return JSON.stringify({
                    leftH: left.offsetHeight,
                    contentH: content ? content.offsetHeight : 0,
                    imgH: img ? img.offsetHeight : 0,
                    contentComputedH: window.getComputedStyle(content).height,
                    contentMaxH: window.getComputedStyle(content).maxHeight
                });
            })()`
        });
        console.log('LEFT WIN DETAILS:', JSON.parse(res.result.result.value));

        chrome.kill();
        process.exit(0);
    } catch (e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
