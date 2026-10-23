const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9365;
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

        // 1. DESKTOP LIGHT MODE (1440x900)
        await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html' });
        
        // Active Intro (t = 400ms)
        await new Promise(r => setTimeout(r, 400));
        let shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\final_intro_desktop_active.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Saved final_intro_desktop_active.png');

        // Mid-Fade (t = 1600ms)
        await new Promise(r => setTimeout(r, 1200));
        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\final_intro_desktop_midfade.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Saved final_intro_desktop_midfade.png');

        // Fully Revealed Site (t = 2500ms)
        await new Promise(r => setTimeout(r, 900));
        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\final_intro_desktop_revealed.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Saved final_intro_desktop_revealed.png');

        // 2. MOBILE VIEW (390 x 844)
        await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html' });
        await new Promise(r => setTimeout(r, 400));

        shot = await send('Page.captureScreenshot', {
            format: 'png',
            clip: { x: 0, y: 0, width: 390, height: 844, scale: 2 }
        });
        fs.writeFileSync(`${artDir}\\final_intro_mobile_active.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Saved final_intro_mobile_active.png');

        // Mobile revealed
        await new Promise(r => setTimeout(r, 2000));
        shot = await send('Page.captureScreenshot', {
            format: 'png',
            clip: { x: 0, y: 0, width: 390, height: 844, scale: 2 }
        });
        fs.writeFileSync(`${artDir}\\final_intro_mobile_revealed.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Saved final_intro_mobile_revealed.png');

        console.log('ALL VERIFICATION SCREENSHOTS SAVED!');
        chrome.kill();
        process.exit(0);
    } catch(err) {
        console.error('Error:', err);
        chrome.kill();
        process.exit(1);
    }
}, 800);
