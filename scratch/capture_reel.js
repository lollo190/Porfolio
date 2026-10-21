const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9362',
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
        const targets = await getJSON('http://127.0.0.1:9362/json');
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

        // Scroll to where the windows transition to the reel
        await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 520)' });
        await new Promise(r => setTimeout(r, 600));

        const shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\reel_below_windows.png', Buffer.from(shot.result.data, 'base64'));

        chrome.kill();
        process.exit(0);
    } catch(e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
