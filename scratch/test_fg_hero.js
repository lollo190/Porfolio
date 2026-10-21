const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9355;
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

        // 1. Desktop Light Mode (1440x1200)
        await send('Emulation.setDeviceMetricsOverride', {
            width: 1440,
            height: 1200,
            deviceScaleFactor: 1,
            mobile: false
        });

        await send('Page.navigate', {
            url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html'
        });
        await new Promise(r => setTimeout(r, 1200));

        let shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\fg_hero_desktop_light.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Saved fg_hero_desktop_light.png');

        // 2. Desktop Dark Mode
        await send('Runtime.evaluate', {
            expression: `document.getElementById('theme-toggle').click()`
        });
        await new Promise(r => setTimeout(r, 500));

        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\fg_hero_desktop_dark.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Saved fg_hero_desktop_dark.png');

        // 3. Mobile View (390x844)
        await send('Emulation.setDeviceMetricsOverride', {
            width: 390,
            height: 844,
            deviceScaleFactor: 2,
            mobile: true
        });
        await send('Runtime.evaluate', {
            expression: `document.body.classList.remove('dark-theme'); localStorage.setItem('portfolio_theme', 'light');`
        });
        await new Promise(r => setTimeout(r, 600));

        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\fg_hero_mobile_light.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Saved fg_hero_mobile_light.png');

        // 4. Mobile Dark View
        await send('Runtime.evaluate', {
            expression: `document.body.classList.add('dark-theme'); localStorage.setItem('portfolio_theme', 'dark');`
        });
        await new Promise(r => setTimeout(r, 600));

        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\fg_hero_mobile_dark.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Saved fg_hero_mobile_dark.png');

        console.log('ALL VERIFICATION SHOTS COMPLETED');
        chrome.kill();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        chrome.kill();
        process.exit(1);
    }
}, 800);
