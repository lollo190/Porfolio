const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const httpPort = 9483;
const chromePort = 9484;

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
    let filePath = path.join(rootDir, req.url.split('?')[0]);
    if (filePath.endsWith(path.sep)) filePath = path.join(filePath, 'index.html');
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
        const res = await fetch(`http://127.0.0.1:${chromePort}/json`);
        const targets = await res.json();
        const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
        await new Promise(r => ws.addEventListener('open', r));

        let id = 1;
        function send(method, params) {
            return new Promise(r => {
                const i = id++;
                ws.addEventListener('message', function h(e) {
                    const m = JSON.parse(e.data);
                    if (m.id === i) { ws.removeEventListener('message', h); r(m.result); }
                });
                ws.send(JSON.stringify({ id: i, method, params }));
            });
        }

        await send('Page.enable');
        await send('Runtime.enable');

        ws.addEventListener('message', (e) => {
            const m = JSON.parse(e.data);
            if (m.method === 'Runtime.consoleAPICalled') {
                console.log('BROWSER CONSOLE:', m.params.type, m.params.args);
            }
            if (m.method === 'Runtime.exceptionThrown') {
                console.log('BROWSER EXCEPTION:', JSON.stringify(m.params.exceptionDetails));
            }
        });

        const loadPromise = new Promise(r => {
            function h(e) {
                const m = JSON.parse(e.data);
                if (m.method === 'Page.loadEventFired') {
                    ws.removeEventListener('message', h);
                    r();
                }
            }
            ws.addEventListener('message', h);
        });

        await send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/index.html` });
        await loadPromise;
        await new Promise(r => setTimeout(r, 1000));

        const info = await send('Runtime.evaluate', {
            expression: `(() => {
                const w = document.getElementById('project-win-0');
                if (!w) return 'WINDOW NOT FOUND';
                const children = Array.from(w.children).map(c => ({
                    tag: c.tagName,
                    class: c.className,
                    display: window.getComputedStyle(c).display,
                    height: window.getComputedStyle(c).height,
                    width: window.getComputedStyle(c).width,
                    rect: c.getBoundingClientRect()
                }));
                const wStyle = window.getComputedStyle(w);
                return {
                    winClass: w.className,
                    winHeight: wStyle.height,
                    winWidth: wStyle.width,
                    winDisplay: wStyle.display,
                    winOverflow: wStyle.overflow,
                    winPos: wStyle.position,
                    rect: w.getBoundingClientRect(),
                    children
                };
            })()`,
            returnByValue: true
        });

        console.log('EVAL RESULT:', JSON.stringify(info.result.value, null, 2));

        chrome.kill();
        server.close();
        process.exit(0);
    }, 1200);
});
