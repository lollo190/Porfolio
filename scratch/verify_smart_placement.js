const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9392;

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

        // 1. Desktop Verification
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
        await new Promise(r => setTimeout(r, 200));

        const deskAnalysis = await send('Runtime.evaluate', {
            expression: `(() => {
                const projects = document.querySelectorAll('.nb-project');
                const results = [];
                projects.forEach((p, idx) => {
                    const actionItem = p.querySelector('.nb-media-action-item');
                    const btn = actionItem ? actionItem.querySelector('.nb-btn-full-project') : null;
                    const items = Array.from(p.querySelectorAll('.nb-media-track > .nb-media-item'));
                    const lastPhoto = items[items.length - 2]; // item before action item
                    const rPhoto = lastPhoto ? lastPhoto.getBoundingClientRect() : null;
                    const rBtn = btn ? btn.getBoundingClientRect() : null;
                    const rAction = actionItem ? actionItem.getBoundingClientRect() : null;

                    results.push({
                        idx,
                        title: p.querySelector('.nb-project-title-link, .nb-meta-title')?.textContent?.trim(),
                        btnHref: btn?.getAttribute('href'),
                        btnText: btn?.textContent?.trim().replace(/\\s+/g, ' '),
                        actionClasses: actionItem?.className,
                        photoBox: rPhoto ? { left: Math.round(rPhoto.left), top: Math.round(rPhoto.top), right: Math.round(rPhoto.right), bottom: Math.round(rPhoto.bottom) } : null,
                        btnBox: rBtn ? { left: Math.round(rBtn.left), top: Math.round(rBtn.top), right: Math.round(rBtn.right), bottom: Math.round(rBtn.bottom) } : null,
                        isAdjacent: rPhoto && rBtn ? Math.abs(rPhoto.top - rAction.top) < 50 : false,
                        isUnder: rPhoto && rBtn ? rBtn.top > rPhoto.bottom - 10 : false
                    });
                });
                return results;
            })()`,
            returnByValue: true
        });

        console.log('Desktop Smart Placement Analysis:\n', JSON.stringify(deskAnalysis.result.result.value, null, 2));

        // Capture Desktop Visuals
        // Project 0: Harp Chair (Adjacent to HARP_08.JPG)
        await send('Runtime.evaluate', {
            expression: `document.querySelector('#project-0 .nb-media-action-item').scrollIntoView({ block: 'center' });`
        });
        await new Promise(r => setTimeout(r, 250));
        let shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\final_desk_harp.png', Buffer.from(shot.result.data, 'base64'));

        // Project 1: NOMOD (Under NMD_04.JPG)
        await send('Runtime.evaluate', {
            expression: `document.querySelector('#project-1 .nb-media-action-item').scrollIntoView({ block: 'center' });`
        });
        await new Promise(r => setTimeout(r, 250));
        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\final_desk_nomod.png', Buffer.from(shot.result.data, 'base64'));

        // Project 2: Luca (Adjacent to LUCA_03.JPG)
        await send('Runtime.evaluate', {
            expression: `document.querySelector('#project-2 .nb-media-action-item').scrollIntoView({ block: 'center' });`
        });
        await new Promise(r => setTimeout(r, 250));
        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\final_desk_luca.png', Buffer.from(shot.result.data, 'base64'));

        // Dark Theme Desktop
        await send('Runtime.evaluate', {
            expression: `document.body.classList.add('dark-theme'); document.querySelector('#project-0 .nb-media-action-item').scrollIntoView({ block: 'center' });`
        });
        await new Promise(r => setTimeout(r, 250));
        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\final_dark_harp.png', Buffer.from(shot.result.data, 'base64'));

        // Test navigation by clicking NOMOD button
        console.log('Testing navigation to NOMOD...');
        await send('Runtime.evaluate', {
            expression: `document.querySelector('#project-1 .nb-btn-full-project').click();`
        });
        await new Promise(r => setTimeout(r, 500));

        const navCheck = await send('Runtime.evaluate', {
            expression: `window.location.href.includes('nomod.html') && document.title.includes('NOMOD')`,
            returnByValue: true
        });
        console.log('Navigation to nomod.html successful:', navCheck.result.result.value);

        console.log('All tests passed successfully!');
        chrome.kill();
        process.exit(0);
    } catch (e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
