const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve('.');
const artDir = 'C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc';
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
            await send('Page.addScriptToEvaluateOnNewDocument', {
                source: 'sessionStorage.setItem("site_intro_played", "true");'
            });

            async function testResolution(name, width, height, isMobile = false) {
                await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: isMobile });
                await send('Page.navigate', { url: 'http://127.0.0.1:' + httpPort + '/index.html' });
                await new Promise(r => setTimeout(r, 1200));

                const evalRes = await send('Runtime.evaluate', {
                    expression: `(() => {
                        const ws = document.getElementById('hero-section')?.getBoundingClientRect();
                        const tk = document.getElementById('home-statement-ticker')?.getBoundingClientRect();
                        const ft = document.getElementById('contact');
                        const vlc = document.getElementById('hero-win-vlc')?.getBoundingClientRect();
                        const harp = document.getElementById('project-win-0')?.getBoundingClientRect();
                        const nomod = document.getElementById('project-win-1')?.getBoundingClientRect();
                        const luca = document.getElementById('project-win-2')?.getBoundingClientRect();
                        return {
                            docScrollHeight: document.documentElement.scrollHeight,
                            winInnerHeight: window.innerHeight,
                            scrollDiff: document.documentElement.scrollHeight - window.innerHeight,
                            footerDisplay: ft ? window.getComputedStyle(ft).display : 'none',
                            ticker: tk ? { top: Math.round(tk.top), bottom: Math.round(tk.bottom), height: Math.round(tk.height) } : null,
                            harp: harp ? { left: Math.round(harp.left), top: Math.round(harp.top), bottom: Math.round(harp.bottom), w: Math.round(harp.width), h: Math.round(harp.height) } : null,
                            luca: luca ? { left: Math.round(luca.left), top: Math.round(luca.top), bottom: Math.round(luca.bottom), w: Math.round(luca.width), h: Math.round(luca.height) } : null
                        };
                    })()`,
                    returnByValue: true
                });

                console.log(`\n=== RESULTS for ${name} (${width}x${height}) ===`);
                console.log(JSON.stringify(evalRes.result.result.value, null, 2));

                const shot = await send('Page.captureScreenshot', { format: 'png' });
                fs.writeFileSync(path.join(artDir, `no_scroll_${name}.png`), Buffer.from(shot.result.data, 'base64'));
                console.log(`Saved screenshot: no_scroll_${name}.png`);
            }

            await testResolution('1024x504', 1024, 504, false);
            await testResolution('1440x900', 1440, 900, false);
            await testResolution('1920x1080', 1920, 1080, false);
            await testResolution('mobile_390x844', 390, 844, true);

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
