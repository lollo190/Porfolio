const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve('.');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const httpPort = 9495;
const chromePort = 9496;

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
            await send('Emulation.setDeviceMetricsOverride', { width: 1024, height: 504, deviceScaleFactor: 1, mobile: false });
            await send('Page.navigate', { url: 'http://127.0.0.1:' + httpPort + '/index.html' });
            await new Promise(r => setTimeout(r, 1200));

            const res = await send('Runtime.evaluate', {
                expression: `(() => {
                    const tk = document.getElementById('home-statement-ticker');
                    const ft = document.getElementById('contact');
                    const span = tk ? tk.querySelector('span') : null;
                    return {
                        tickerComputed: tk ? {
                            display: window.getComputedStyle(tk).display,
                            visibility: window.getComputedStyle(tk).visibility,
                            opacity: window.getComputedStyle(tk).opacity,
                            color: span ? window.getComputedStyle(span).color : null,
                            height: window.getComputedStyle(tk).height,
                            rect: { top: tk.getBoundingClientRect().top, bottom: tk.getBoundingClientRect().bottom }
                        } : null,
                        spanText: span ? span.innerText.slice(0, 40) : null,
                        footerComputed: ft ? {
                            display: window.getComputedStyle(ft).display,
                            height: window.getComputedStyle(ft).height,
                            rect: { top: ft.getBoundingClientRect().top, bottom: ft.getBoundingClientRect().bottom },
                            text: ft.innerText
                        } : null
                    };
                })()`,
                returnByValue: true
            });

            console.log(JSON.stringify(res.result.result.value, null, 2));

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
