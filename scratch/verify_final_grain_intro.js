const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9360;
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

        console.log('Navigating to index.html on desktop...');
        await send('Page.navigate', {
            url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html'
        });

        // T = 350ms: Intro overlay active
        await new Promise(r => setTimeout(r, 350));
        let shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\grain_intro_desktop_active.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Captured grain_intro_desktop_active.png');

        // Check logo computed dimensions and classes
        const logoMetrics = await send('Runtime.evaluate', {
            expression: `(() => {
                const img = document.querySelector('.intro-logo-img');
                const overlay = document.getElementById('site-intro-overlay');
                const grain = document.querySelector('.intro-film-grain');
                const rect = img.getBoundingClientRect();
                return {
                    imgSrc: img.src,
                    width: rect.width,
                    height: rect.height,
                    grainExists: !!grain,
                    grainAnim: window.getComputedStyle(grain).animationName,
                    overlayBg: window.getComputedStyle(overlay).backgroundColor
                };
            })()`,
            returnByValue: true
        });
        console.log('Desktop Intro Metrics:', JSON.stringify(logoMetrics.result.value, null, 2));

        // T = 1750ms: Mid fade
        await new Promise(r => setTimeout(r, 1400));
        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\grain_intro_desktop_fading.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Captured grain_intro_desktop_fading.png');

        // T = 2600ms: Completely revealed
        await new Promise(r => setTimeout(r, 850));
        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\grain_intro_desktop_revealed.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Captured grain_intro_desktop_revealed.png');

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
        fs.writeFileSync(`${artDir}\\grain_intro_mobile_active.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Captured grain_intro_mobile_active.png');

        const mobileMetrics = await send('Runtime.evaluate', {
            expression: `(() => {
                const img = document.querySelector('.intro-logo-img');
                const rect = img.getBoundingClientRect();
                return {
                    width: rect.width,
                    height: rect.height
                };
            })()`,
            returnByValue: true
        });
        console.log('Mobile Logo Metrics:', JSON.stringify(mobileMetrics.result.value, null, 2));

        console.log('ALL VERIFICATION SCREENSHOTS CAPTURED!');
        chrome.kill();
        process.exit(0);
    } catch(err) {
        console.error('Test error:', err);
        chrome.kill();
        process.exit(1);
    }
}, 800);
