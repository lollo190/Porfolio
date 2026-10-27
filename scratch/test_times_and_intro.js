const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve('.');
const artDir = 'C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const httpPort = 9481;
const chromePort = 9482;

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
            await send('CSS.enable');

            // Set desktop viewport
            await send('Emulation.setDeviceMetricsOverride', {
                width: 1440,
                height: 900,
                deviceScaleFactor: 1,
                mobile: false
            });

            // 1. TEST INTRO SPLASH
            console.log('--- Testing Intro Splash on index.html ---');
            await send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/index.html` });
            // Wait slightly for DOM to be ready, while intro overlay is visible
            await new Promise(r => setTimeout(r, 400));

            const introInfo = await send('Runtime.evaluate', {
                expression: `(() => {
                    const el = document.querySelector('.intro-logo-text');
                    const overlay = document.getElementById('site-intro-overlay');
                    if (!el) return { error: 'No .intro-logo-text found' };
                    const style = window.getComputedStyle(el);
                    const rect = el.getBoundingClientRect();
                    return {
                        text: el.textContent,
                        fontFamily: style.fontFamily,
                        fontSize: style.fontSize,
                        fontWeight: style.fontWeight,
                        color: style.color,
                        width: rect.width,
                        height: rect.height,
                        overlayDisplay: window.getComputedStyle(overlay).display,
                        overlayOpacity: window.getComputedStyle(overlay).opacity
                    };
                })()`,
                returnByValue: true
            });
            console.log('Intro logo evaluation:', introInfo.result.value);

            // Screenshot of intro
            const introShot = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'intro_splash_times.png'), Buffer.from(introShot.data, 'base64'));
            console.log('Saved intro_splash_times.png');

            // 2. TEST PROJECT DIDASCALIA: HARP CHAIR
            console.log('\n--- Testing Didascalia on harp-chair.html ---');
            await send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/harp-chair.html` });
            await new Promise(r => setTimeout(r, 800));

            const harpDida = await send('Runtime.evaluate', {
                expression: `(() => {
                    const p = document.querySelector('.fos-col p');
                    const author = document.querySelector('.fos-col-author');
                    if (!p) return { error: 'No .fos-col p found' };
                    const pStyle = window.getComputedStyle(p);
                    const aStyle = window.getComputedStyle(author);
                    return {
                        pFont: pStyle.fontFamily,
                        pFontStyle: pStyle.fontStyle,
                        pFontSize: pStyle.fontSize,
                        authorFont: aStyle.fontFamily,
                        authorFontStyle: aStyle.fontStyle
                    };
                })()`,
                returnByValue: true
            });
            console.log('Harp Chair didascalia evaluation:', harpDida.result.value);

            const harpShot = await send('Page.captureScreenshot', {
                format: 'png',
                clip: { x: 0, y: 0, width: 1440, height: 700, scale: 1 }
            });
            fs.writeFileSync(path.join(artDir, 'harp_didascalia_times.png'), Buffer.from(harpShot.data, 'base64'));
            console.log('Saved harp_didascalia_times.png');

            // 3. TEST NOMOD
            console.log('\n--- Testing Didascalia on nomod.html ---');
            await send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/nomod.html` });
            await new Promise(r => setTimeout(r, 800));

            const nomodDida = await send('Runtime.evaluate', {
                expression: `(() => {
                    const p = document.querySelector('.fos-col p');
                    const pStyle = window.getComputedStyle(p);
                    return {
                        pFont: pStyle.fontFamily,
                        pFontStyle: pStyle.fontStyle,
                        pFontSize: pStyle.fontSize
                    };
                })()`,
                returnByValue: true
            });
            console.log('NOMOD didascalia evaluation:', nomodDida.result.value);

            // 4. TEST LUCA
            console.log('\n--- Testing Didascalia on luca.html ---');
            await send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/luca.html` });
            await new Promise(r => setTimeout(r, 800));

            const lucaDida = await send('Runtime.evaluate', {
                expression: `(() => {
                    const p = document.querySelector('.fos-col p');
                    const pStyle = window.getComputedStyle(p);
                    return {
                        pFont: pStyle.fontFamily,
                        pFontStyle: pStyle.fontStyle,
                        pFontSize: pStyle.fontSize
                    };
                })()`,
                returnByValue: true
            });
            console.log('Luca didascalia evaluation:', lucaDida.result.value);

            // 5. TEST DARK THEME
            console.log('\n--- Testing Dark Theme on harp-chair.html ---');
            await send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/harp-chair.html` });
            await new Promise(r => setTimeout(r, 600));
            await send('Runtime.evaluate', { expression: `document.body.classList.add('dark-theme');` });
            await new Promise(r => setTimeout(r, 300));
            const darkHarpShot = await send('Page.captureScreenshot', {
                format: 'png',
                clip: { x: 0, y: 0, width: 1440, height: 700, scale: 1 }
            });
            fs.writeFileSync(path.join(artDir, 'harp_didascalia_dark.png'), Buffer.from(darkHarpShot.data, 'base64'));
            console.log('Saved harp_didascalia_dark.png');

            console.log('\nAll tests complete successfully!');
            chrome.kill();
            server.close();
            process.exit(0);
        } catch (err) {
            console.error('Error during execution:', err);
            chrome.kill();
            server.close();
            process.exit(1);
        }
    }, 1200);
});
