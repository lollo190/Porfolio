const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve('.');
const artDir = 'C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const httpPort = 9497;
const chromePort = 9498;

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
    let cleanUrl = req.url.split('?')[0].replace(/^\/+/, '');
    if (!cleanUrl) cleanUrl = 'index.html';
    let filePath = path.join(rootDir, cleanUrl);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(httpPort, async () => {
    const chrome = spawn(chromePath, [
        '--headless=new',
        '--remote-debugging-port=' + chromePort,
        'about:blank'
    ]);

    setTimeout(async () => {
        try {
            const targetsRes = await fetch('http://127.0.0.1:' + chromePort + '/json');
            const targets = await targetsRes.json();
            const target = targets.find(t => t.type === 'page') || targets[0];
            const ws = new WebSocket(target.webSocketDebuggerUrl);
            await new Promise(r => ws.addEventListener('open', r));

            let id = 1;
            function send(method, params) {
                return new Promise(r => {
                    const i = id++;
                    ws.addEventListener('message', function h(e) {
                        const m = JSON.parse(e.data);
                        if (m.id === i) { ws.removeEventListener('message', h); r(m); }
                    });
                    ws.send(JSON.stringify({ id: i, method, params }));
                });
            }

            await send('Page.enable');
            await send('Runtime.enable');

            async function capturePage(urlPath, filenamePrefix) {
                // 1. Desktop Light (1440 x 900)
                await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
                await send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/${urlPath}` });
                await new Promise(r => setTimeout(r, 1200));

                let shot = await send('Page.captureScreenshot', { format: 'png' });
                fs.writeFileSync(path.join(artDir, `${filenamePrefix}_desktop_top.png`), Buffer.from(shot.result.data, 'base64'));

                // Full page screenshot
                let fullShot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
                fs.writeFileSync(path.join(artDir, `${filenamePrefix}_desktop_full.png`), Buffer.from(fullShot.result.data, 'base64'));

                // 2. Desktop Dark
                await send('Runtime.evaluate', { expression: 'document.body.classList.add("dark-theme");' });
                await new Promise(r => setTimeout(r, 300));
                shot = await send('Page.captureScreenshot', { format: 'png' });
                fs.writeFileSync(path.join(artDir, `${filenamePrefix}_desktop_dark.png`), Buffer.from(shot.result.data, 'base64'));

                // 3. Mobile (390 x 844)
                await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
                await send('Runtime.evaluate', { expression: 'document.body.classList.remove("dark-theme");' });
                await new Promise(r => setTimeout(r, 300));
                shot = await send('Page.captureScreenshot', { format: 'png' });
                fs.writeFileSync(path.join(artDir, `${filenamePrefix}_mobile.png`), Buffer.from(shot.result.data, 'base64'));

                console.log(`Captured all views for ${urlPath}`);
            }

            await capturePage('harp-chair.html', 'fos_harp_chair');
            await capturePage('nomod.html', 'fos_nomod');
            await capturePage('luca.html', 'fos_luca');

            chrome.kill();
            server.close();
            process.exit(0);
        } catch(e) {
            console.error(e);
            chrome.kill();
            server.close();
            process.exit(1);
        }
    }, 1000);
});
