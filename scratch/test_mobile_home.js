const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const artDir = 'C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const httpPort = 9396;
const chromePort = 9397;

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
    let filePath = path.join(rootDir, req.url.split('?')[0]);
    if (filePath.endsWith(path.sep)) filePath = path.join(filePath, 'index.html');
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(httpPort, async () => {
    const chrome = spawn(chromePath, [
        '--headless=new',
        '--remote-debugging-port=' + chromePort,
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
            const targets = await getJSON('http://127.0.0.1:' + chromePort + '/json');
            const target = targets.find(t => t.type === 'page');
            const ws = new WebSocket(target.webSocketDebuggerUrl);
            await new Promise(r => ws.addEventListener('open', r, { once: true }));

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

            // Set mobile resolution 390x844 (iPhone 13/14/15)
            await send('Emulation.setDeviceMetricsOverride', {
                width: 390,
                height: 844,
                deviceScaleFactor: 2,
                mobile: true
            });

            await send('Page.enable');
            await send('Runtime.enable');

            await send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/index.html` });
            await new Promise(r => setTimeout(r, 2000));

            // Skip splash
            await send('Runtime.evaluate', {
                expression: `
                    const intro = document.getElementById('site-intro-overlay');
                    if (intro) intro.style.display = 'none';
                    document.body.classList.remove('intro-active');
                `
            });
            await new Promise(r => setTimeout(r, 400));

            // Capture top mobile (bio + TOC + reel)
            let shotMobTop = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'home_mobile_hero.png'), Buffer.from(shotMobTop.result.data, 'base64'));

            // Scroll down to Project 0
            await send('Runtime.evaluate', {
                expression: `
                    const p0 = document.getElementById('project-row-0');
                    if (p0) p0.scrollIntoView({ behavior: 'instant', block: 'start' });
                `
            });
            await new Promise(r => setTimeout(r, 500));

            let shotMobP0 = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'home_mobile_project0.png'), Buffer.from(shotMobP0.result.data, 'base64'));

            console.log('Mobile screenshots captured successfully!');
            chrome.kill();
            server.close();
            process.exit(0);
        } catch (e) {
            console.error('Error:', e);
            chrome.kill();
            server.close();
            process.exit(1);
        }
    }, 1200);
});
