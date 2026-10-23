const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9357',
    '--disable-gpu',
    'about:blank'
]);

setTimeout(async () => {
    try {
        const targets = await new Promise((res, rej) => http.get('http://127.0.0.1:9357/json', r => {
            let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
        }).on('error', rej));
        const target = targets.find(t => t.type === 'page');
        const ws = new WebSocket(target.webSocketDebuggerUrl);
        let id = 1; const pending = new Map();
        ws.addEventListener('message', e => {
            const data = JSON.parse(e.data);
            if (data.id && pending.has(data.id)) { pending.get(data.id)(data); pending.delete(data.id); }
        });
        const send = (m, p = {}) => new Promise(r => { const i = id++; pending.set(i, r); ws.send(JSON.stringify({id: i, method: m, params: p})); });
        await new Promise(r => ws.addEventListener('open', r, { once: true }));

        await send('Emulation.setDeviceMetricsOverride', { width: 2800, height: 400, deviceScaleFactor: 1, mobile: false });
        await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });

        function getHtml(color) {
            return `<!DOCTYPE html>
<html>
<head>
<style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
        margin: 0;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2800px;
        height: 400px;
        overflow: hidden;
    }
    .text {
        font-family: 'Helvetica Neue', Helvetica, 'Arial Black', Arial, sans-serif;
        font-weight: 900;
        font-size: 260px;
        letter-spacing: -0.04em;
        color: ${color};
        white-space: nowrap;
        user-select: none;
        -webkit-font-smoothing: antialiased;
        line-height: 1;
    }
</style>
</head>
<body>
    <div class="text">Lorenzo Kraja</div>
</body>
</html>`;
        }

        // Render White
        await send('Page.navigate', { url: 'data:text/html;charset=utf-8,' + encodeURIComponent(getHtml('#ffffff')) });
        await new Promise(r => setTimeout(r, 600));
        let shot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
        fs.writeFileSync('assets/intro-logo-white.png', Buffer.from(shot.result.data, 'base64'));
        console.log('Saved assets/intro-logo-white.png');

        // Render Black
        await send('Page.navigate', { url: 'data:text/html;charset=utf-8,' + encodeURIComponent(getHtml('#000000')) });
        await new Promise(r => setTimeout(r, 400));
        shot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
        fs.writeFileSync('assets/intro-logo-black.png', Buffer.from(shot.result.data, 'base64'));
        console.log('Saved assets/intro-logo-black.png');

        chrome.kill();
        process.exit(0);
    } catch(e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
