const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9389;

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

        // Desktop Viewport
        await send('Emulation.setDeviceMetricsOverride', {
            width: 1440,
            height: 900,
            deviceScaleFactor: 1,
            mobile: false
        });

        await send('Page.navigate', {
            url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html'
        });

        await new Promise(r => setTimeout(r, 600));

        await send('Runtime.evaluate', {
            expression: `const o = document.getElementById('site-intro-overlay'); if (o) o.style.display = 'none';`
        });
        await new Promise(r => setTimeout(r, 300));

        // Test alignment variants for Harp Chair (adjacent in Col 2)
        // Variant 1: Vertically centered (current)
        await send('Runtime.evaluate', {
            expression: `document.querySelector('#project-0 .nb-media-item:last-child').scrollIntoView({ block: 'center' });`
        });
        await new Promise(r => setTimeout(r, 200));
        let shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\align_center.png', Buffer.from(shot.result.data, 'base64'));

        // Variant 2: Aligned bottom with photo (padding-bottom to align with caption)
        await send('Runtime.evaluate', {
            expression: `
                const el = document.querySelector('#project-0 .nb-action-adj-desk .nb-action-slot');
                if (el) {
                    el.style.alignItems = 'flex-end';
                    el.style.paddingBottom = '24px';
                }
            `
        });
        await new Promise(r => setTimeout(r, 200));
        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\align_bottom.png', Buffer.from(shot.result.data, 'base64'));

        // Variant 3: Aligned top with photo
        await send('Runtime.evaluate', {
            expression: `
                const el = document.querySelector('#project-0 .nb-action-adj-desk .nb-action-slot');
                if (el) {
                    el.style.alignItems = 'flex-start';
                    el.style.paddingTop = '12px';
                    el.style.paddingBottom = '0';
                }
            `
        });
        await new Promise(r => setTimeout(r, 200));
        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\align_top.png', Buffer.from(shot.result.data, 'base64'));

        console.log('All align variants captured!');
        chrome.kill();
        process.exit(0);
    } catch (e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
