const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9366;
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
            width: 1440,
            height: 900,
            deviceScaleFactor: 2,
            mobile: false
        });

        await send('Page.navigate', {
            url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html'
        });

        // Skip intro
        await new Promise(r => setTimeout(r, 100));
        await send('Runtime.evaluate', {
            expression: `document.getElementById('site-intro-overlay').style.display = 'none'`
        });

        await new Promise(r => setTimeout(r, 400));

        // Get rect of desktop-icon-contact
        const rectRes = await send('Runtime.evaluate', {
            expression: `(() => {
                const icon = document.getElementById('desktop-icon-contact');
                const r = icon.getBoundingClientRect();
                return { x: r.x - 20, y: r.y - 20, width: r.width + 40, height: r.height + 40, scale: 1 };
            })()`,
            returnByValue: true
        });

        const clip = rectRes.result.result.value;
        const shot = await send('Page.captureScreenshot', {
            format: 'png',
            clip: {
                x: clip.x,
                y: clip.y,
                width: clip.width,
                height: clip.height,
                scale: 1
            }
        });

        fs.writeFileSync(`${artDir}\\crop_contact_icon.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Saved crop_contact_icon.png');

        chrome.kill();
        process.exit(0);
    } catch(e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
