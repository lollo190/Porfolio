const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9385;

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

        // 1. Desktop Viewport
        await send('Emulation.setDeviceMetricsOverride', {
            width: 1440,
            height: 900,
            deviceScaleFactor: 1,
            mobile: false
        });

        console.log('Navigating to index.html...');
        await send('Page.navigate', {
            url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html'
        });

        await new Promise(r => setTimeout(r, 600));

        // Dismiss intro overlay
        await send('Runtime.evaluate', {
            expression: `const o = document.getElementById('site-intro-overlay'); if (o) o.style.display = 'none';`
        });
        await new Promise(r => setTimeout(r, 300));

        // Scroll to Project 0 action button
        await send('Runtime.evaluate', {
            expression: `const r = document.querySelector('#project-0 .nb-project-action-row'); if (r) r.scrollIntoView({ block: 'center' });`
        });
        await new Promise(r => setTimeout(r, 300));

        const shotP0 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\verified_p0_action_btn.png', Buffer.from(shotP0.result.data, 'base64'));

        // Scroll to Project 1 action button
        await send('Runtime.evaluate', {
            expression: `const r = document.querySelector('#project-1 .nb-project-action-row'); if (r) r.scrollIntoView({ block: 'center' });`
        });
        await new Promise(r => setTimeout(r, 300));

        const shotP1 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\verified_p1_action_btn.png', Buffer.from(shotP1.result.data, 'base64'));

        // 2. Mobile Viewport (iPhone 14/15 size)
        await send('Emulation.setDeviceMetricsOverride', {
            width: 390,
            height: 844,
            deviceScaleFactor: 2,
            mobile: true
        });

        await send('Runtime.evaluate', {
            expression: `const r = document.querySelector('#project-0 .nb-project-action-row'); if (r) r.scrollIntoView({ block: 'center' });`
        });
        await new Promise(r => setTimeout(r, 300));

        const shotMobile = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\verified_mobile_action_btn.png', Buffer.from(shotMobile.result.data, 'base64'));

        console.log('Screenshots saved successfully!');
        chrome.kill();
        process.exit(0);
    } catch (e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
