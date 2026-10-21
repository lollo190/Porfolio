const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9385;
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
        await new Promise(r => ws.addEventListener('open', r, { once: true }));

        let id = 1;
        const send = (method, params = {}) => new Promise((resolve) => {
            const curId = id++;
            const l = (e) => {
                const data = JSON.parse(e.data);
                if (data.id === curId) {
                    ws.removeEventListener('message', l);
                    resolve(data);
                }
            };
            ws.addEventListener('message', l);
            ws.send(JSON.stringify({ id: curId, method, params }));
        });

        // 1. Desktop Dark Theme
        await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 950, deviceScaleFactor: 1, mobile: false });
        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html' });
        await new Promise(r => setTimeout(r, 1600));

        await send('Runtime.evaluate', {
            expression: `document.getElementById('theme-toggle').click();`
        });
        await new Promise(r => setTimeout(r, 400));

        const darkSnap = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artDir, 'home_desktop_projects_dark.png'), Buffer.from(darkSnap.result.data, 'base64'));
        console.log('Saved home_desktop_projects_dark.png');

        // 2. Mobile View (390 x 844)
        await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
        await send('Runtime.evaluate', {
            expression: `document.getElementById('theme-toggle').click();` // back to light
        });
        await new Promise(r => setTimeout(r, 500));

        const mobileSnap = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artDir, 'home_mobile_projects.png'), Buffer.from(mobileSnap.result.data, 'base64'));
        console.log('Saved home_mobile_projects.png');

        ws.close();
        chrome.kill();
        process.exit(0);
    } catch (err) {
        console.error(err);
        chrome.kill();
        process.exit(1);
    }
}, 1200);
