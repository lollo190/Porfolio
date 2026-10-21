const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9402;
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

        const getVal = (res) => (res && res.result && res.result.result ? res.result.result.value : (res && res.result ? res.result.value : null));

        await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 950, deviceScaleFactor: 1, mobile: false });
        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html' });
        await new Promise(r => setTimeout(r, 1600));

        const geometry = await send('Runtime.evaluate', {
            expression: `(() => {
                const p = document.getElementById('hero-win-projects').getBoundingClientRect();
                const v = document.getElementById('hero-win-vlc').getBoundingClientRect();
                const c = document.querySelector('.fg-hero-windows').getBoundingClientRect();
                return {
                    projects: {
                        left: p.left,
                        top: p.top,
                        width: p.width,
                        height: p.height,
                        ratio: p.width / p.height,
                        leftPercentOfViewport: (p.left / window.innerWidth) * 100
                    },
                    vlc: {
                        left: v.left,
                        top: v.top,
                        width: v.width,
                        height: v.height,
                        ratio: v.width / v.height,
                        leftPercentOfViewport: (v.left / window.innerWidth) * 100
                    },
                    gapPx: v.left - p.right,
                    gapPercentOfViewport: ((v.left - p.right) / window.innerWidth) * 100,
                    topOffsetDiff: v.top - p.top
                };
            })()`,
            returnByValue: true
        });

        console.log("EXACT WINDOW GEOMETRY:", JSON.stringify(getVal(geometry), null, 2));

        // 1. Full Desktop screenshot
        const scrFull = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artDir, 'exact_windows_full_desktop.png'), Buffer.from(scrFull.result.data, 'base64'));

        // 2. Crop to windows area to match user's upload
        const clipEval = await send('Runtime.evaluate', {
            expression: `(() => {
                const p = document.getElementById('hero-win-projects').getBoundingClientRect();
                const v = document.getElementById('hero-win-vlc').getBoundingClientRect();
                const minX = Math.max(0, p.left - 40);
                const minY = Math.max(0, p.top - 20);
                const maxX = Math.min(window.innerWidth, v.right + 40);
                const maxY = Math.max(p.bottom, v.bottom) + 30;
                return {
                    x: minX,
                    y: minY,
                    width: maxX - minX,
                    height: maxY - minY,
                    scale: 1
                };
            })()`,
            returnByValue: true
        });

        const clip = getVal(clipEval);
        const scrCropped = await send('Page.captureScreenshot', { format: 'png', clip });
        fs.writeFileSync(path.join(artDir, 'exact_windows_cropped.png'), Buffer.from(scrCropped.result.data, 'base64'));

        chrome.kill();
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        chrome.kill();
        process.exit(1);
    }
}, 1500);
