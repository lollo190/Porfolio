const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve('.');
const artDir = 'C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const httpPort = 9477;
const chromePort = 9478;

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
            function send(method, params = {}) {
                return new Promise((resolve, reject) => {
                    const curId = id++;
                    const onMsg = (evt) => {
                        const msg = JSON.parse(evt.data);
                        if (msg.id === curId) {
                            ws.removeEventListener('message', onMsg);
                            if (msg.error) reject(msg.error);
                            else resolve(msg.result);
                        }
                    };
                    ws.addEventListener('message', onMsg);
                    ws.send(JSON.stringify({ id: curId, method, params }));
                });
            }

            await send('Page.enable');
            await send('DOM.enable');

            await send('Emulation.setDeviceMetricsOverride', {
                width: 1440,
                height: 900,
                deviceScaleFactor: 1,
                mobile: false
            });

            // 1. INTRO SPLASH (+30% SIZE)
            console.log('--- Testing Scaled Intro Splash (+30%) ---');
            await send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/index.html` });
            await new Promise(r => setTimeout(r, 400));

            const introEval = await send('Runtime.evaluate', {
                expression: `(() => {
                    const el = document.querySelector('.intro-logo-text');
                    if (!el) return { error: 'No .intro-logo-text' };
                    const style = window.getComputedStyle(el);
                    const rect = el.getBoundingClientRect();
                    return {
                        text: el.textContent,
                        fontSize: style.fontSize,
                        fontFamily: style.fontFamily,
                        width: rect.width,
                        height: rect.height
                    };
                })()`,
                returnByValue: true
            });
            console.log('Intro Eval (+30%):', introEval.result.value);

            const introShot = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'intro_splash_plus30.png'), Buffer.from(introShot.data, 'base64'));
            console.log('Saved intro_splash_plus30.png');

            // 2. DISMISS INTRO & INSPECT INDEX FOOTER
            console.log('\n--- Testing Index Footer Without Imprint ---');
            // Wait for intro dismiss (1400ms + transition)
            await new Promise(r => setTimeout(r, 1800));

            const footerEval = await send('Runtime.evaluate', {
                expression: `(() => {
                    const footer = document.querySelector('.nb-footer');
                    if (!footer) return { error: 'No footer found' };
                    const imprintEl = footer.querySelector('.nb-footer-end');
                    const text = footer.innerText;
                    return {
                        footerText: text,
                        hasImprint: text.includes('Imprint'),
                        childrenCount: footer.children.length,
                        childrenTexts: Array.from(footer.children).map(c => c.innerText.trim())
                    };
                })()`,
                returnByValue: true
            });
            console.log('Footer Eval:', footerEval.result.value);

            const indexShot = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'index_footer_no_imprint.png'), Buffer.from(indexShot.data, 'base64'));
            console.log('Saved index_footer_no_imprint.png');

            chrome.kill();
            server.close();
            process.exit(0);
        } catch (err) {
            console.error('Error:', err);
            chrome.kill();
            server.close();
            process.exit(1);
        }
    }, 1200);
});
