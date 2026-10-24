const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const artDir = 'C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const httpPort = 9491;
const chromePort = 9492;

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
        const targetsRes = await fetch(`http://127.0.0.1:${chromePort}/json`);
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

        await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
        await send('Page.enable');
        await send('Runtime.enable');
        await send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/index.html` });

        await new Promise(r => setTimeout(r, 2000));

        // Skip intro, activate dark mode, scroll to row0, hover win0
        const ret = await send('Runtime.evaluate', {
            expression: `(() => {
                const intro = document.getElementById('site-intro-overlay');
                if (intro) intro.style.display = 'none';
                document.body.classList.remove('intro-active');

                document.body.classList.add('dark-theme');

                const row0 = document.getElementById('project-row-0');
                if (row0) {
                    const top = row0.getBoundingClientRect().top + window.scrollY - 60;
                    window.scrollTo(0, top);
                }

                const win0 = document.getElementById('project-win-0');
                if (win0) win0.classList.add('hover-test');

                return {
                    bodyClasses: document.body.className,
                    scrollY: window.scrollY,
                    win0Rect: win0 ? win0.getBoundingClientRect() : null
                };
            })()`,
            returnByValue: true
        });

        console.log('DARK TEST EVAL:', JSON.stringify(ret.result.result.value, null, 2));

        await new Promise(r => setTimeout(r, 600));

        let shotDark = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artDir, 'project_windows_dark_theme.png'), Buffer.from(shotDark.result.data, 'base64'));
        console.log('Captured project_windows_dark_theme.png');

        chrome.kill();
        server.close();
        process.exit(0);
    }, 1200);
});
