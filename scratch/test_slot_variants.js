const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9388;

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

        // 1. Harp Chair desktop (last photo is HARP_08.JPG in Col 1)
        await send('Runtime.evaluate', {
            expression: `document.querySelector('#project-0 .nb-media-item:last-child').scrollIntoView({ block: 'center' });`
        });
        await new Promise(r => setTimeout(r, 300));
        let shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\slot_desk_harp.png', Buffer.from(shot.result.data, 'base64'));

        // 2. NOMOD desktop (4 photos full row, button under photo 4)
        await send('Runtime.evaluate', {
            expression: `document.querySelector('#project-1 .nb-media-item:last-child').scrollIntoView({ block: 'center' });`
        });
        await new Promise(r => setTimeout(r, 300));
        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\slot_desk_nomod.png', Buffer.from(shot.result.data, 'base64'));

        // 3. Luca desktop (3 photos, button in col 4 adjacent to photo 3)
        await send('Runtime.evaluate', {
            expression: `document.querySelector('#project-2 .nb-media-item:last-child').scrollIntoView({ block: 'center' });`
        });
        await new Promise(r => setTimeout(r, 300));
        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\slot_desk_luca.png', Buffer.from(shot.result.data, 'base64'));

        // 4. Mobile Viewport
        await send('Emulation.setDeviceMetricsOverride', {
            width: 390,
            height: 844,
            deviceScaleFactor: 2,
            mobile: true
        });

        // Mobile Harp (under col 2)
        await send('Runtime.evaluate', {
            expression: `document.querySelector('#project-0 .nb-media-item:last-child').scrollIntoView({ block: 'center' });`
        });
        await new Promise(r => setTimeout(r, 300));
        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\slot_mob_harp.png', Buffer.from(shot.result.data, 'base64'));

        // Mobile NOMOD (adjacent in col 2)
        await send('Runtime.evaluate', {
            expression: `document.querySelector('#project-1 .nb-media-item:last-child').scrollIntoView({ block: 'center' });`
        });
        await new Promise(r => setTimeout(r, 300));
        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\slot_mob_nomod.png', Buffer.from(shot.result.data, 'base64'));

        // Mobile Luca (under col 2)
        await send('Runtime.evaluate', {
            expression: `document.querySelector('#project-2 .nb-media-item:last-child').scrollIntoView({ block: 'center' });`
        });
        await new Promise(r => setTimeout(r, 300));
        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\slot_mob_luca.png', Buffer.from(shot.result.data, 'base64'));

        console.log('All variant shots captured!');
        chrome.kill();
        process.exit(0);
    } catch (e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
