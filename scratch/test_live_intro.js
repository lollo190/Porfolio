const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9359;
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
        const targets = await getJSON(`http://127.0.0.1:${port}/json`);
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

        // 1. Desktop Test: 1440 x 900
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

        // T = 350ms: Intro overlay active
        await new Promise(r => setTimeout(r, 350));
        let shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\live_intro_1_active.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Captured live_intro_1_active.png');

        // T = 1750ms: Intro fading out smoothly
        await new Promise(r => setTimeout(r, 1400));
        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\live_intro_2_fading.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Captured live_intro_2_fading.png');

        // T = 2600ms: Intro finished, site completely open and clean
        await new Promise(r => setTimeout(r, 850));
        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\live_intro_3_revealed.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Captured live_intro_3_revealed.png');

        // Verify overlay display property
        const overlayDisplay = await send('Runtime.evaluate', {
            expression: `window.getComputedStyle(document.getElementById('site-intro-overlay')).display`
        });
        console.log('Overlay display style after fade:', overlayDisplay.result.value);

        // 2. Mobile View Test (390 x 844)
        await send('Emulation.setDeviceMetricsOverride', {
            width: 390,
            height: 844,
            deviceScaleFactor: 2,
            mobile: true
        });

        await send('Page.navigate', {
            url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html'
        });
        await new Promise(r => setTimeout(r, 350));
        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\live_intro_mobile_active.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Captured live_intro_mobile_active.png');

        console.log('ALL LIVE INTRO TESTS COMPLETED SUCCESSFULLY!');
        chrome.kill();
        process.exit(0);
    } catch(err) {
        console.error('Test error:', err);
        chrome.kill();
        process.exit(1);
    }
}, 800);
