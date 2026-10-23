const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9363;
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
            deviceScaleFactor: 1,
            mobile: false
        });

        await send('Page.navigate', {
            url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/about.html'
        });

        await new Promise(r => setTimeout(r, 600));

        let shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\about_current_layout.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Saved about_current_layout.png');

        // Check rect of #about-side-back and .kali-topbar-back
        const info = await send('Runtime.evaluate', {
            expression: `(() => {
                const sideBtn = document.getElementById('about-side-back');
                const topbarBack = document.querySelector('.kali-topbar-back');
                return {
                    sideBtn: sideBtn ? {
                        rect: sideBtn.getBoundingClientRect(),
                        text: sideBtn.innerText.trim(),
                        computedRight: window.getComputedStyle(sideBtn).right,
                        computedLeft: window.getComputedStyle(sideBtn).left
                    } : null,
                    topbarBack: topbarBack ? {
                        rect: topbarBack.getBoundingClientRect(),
                        text: topbarBack.innerText.trim(),
                        computedLeft: window.getComputedStyle(topbarBack).left
                    } : null
                };
            })()`,
            returnByValue: true
        });

        console.log('Button info:', JSON.stringify(info.result.result.value, null, 2));

        chrome.kill();
        process.exit(0);
    } catch(e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
