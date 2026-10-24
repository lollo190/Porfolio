const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const artDir = 'C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const httpPort = 9493;
const chromePort = 9494;

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
    console.log(`Server listening on http://127.0.0.1:${httpPort}`);
    const chrome = spawn(chromePath, [
        '--headless=new',
        '--remote-debugging-port=' + chromePort,
        'about:blank'
    ]);

    setTimeout(async () => {
        try {
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

            // Test 1: Desktop 1024 x 504 (Exact aspect ratio & resolution of user's uploaded screenshot)
            await send('Emulation.setDeviceMetricsOverride', { width: 1024, height: 504, deviceScaleFactor: 1, mobile: false });
            await send('Page.enable');
            await send('Runtime.enable');
            await send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/index.html` });

            await new Promise(r => setTimeout(r, 2200));

            // Skip site intro
            await send('Runtime.evaluate', {
                expression: `
                    const intro = document.getElementById('site-intro-overlay');
                    if (intro) intro.style.display = 'none';
                    document.body.classList.remove('intro-active');
                    // Hover on NOMOD window to show FULL PROJECT badge
                    const nomod = document.getElementById('project-win-1');
                    if (nomod) nomod.classList.add('hover-test');
                    const aboutBtn = document.querySelector('.sd-scam-about-link');
                    if (aboutBtn) {
                        aboutBtn.style.animation = 'none';
                        aboutBtn.style.opacity = '1';
                        aboutBtn.style.visibility = 'visible';
                    }
                `
            });
            await new Promise(r => setTimeout(r, 500));

            // Measure layout positions
            const layoutMetrics = await send('Runtime.evaluate', {
                expression: `(() => {
                    const vlc = document.getElementById('hero-win-vlc');
                    const nomod = document.getElementById('project-win-1');
                    const harp = document.getElementById('project-win-0');
                    const luca = document.getElementById('project-win-2');
                    const toc = document.getElementById('sd-toc');
                    const about = document.getElementById('sd-about-col');

                    function getInfo(el, name) {
                        if (!el) return { name, exists: false };
                        const r = el.getBoundingClientRect();
                        return {
                            name,
                            left: Math.round(r.left),
                            top: Math.round(r.top),
                            width: Math.round(r.width),
                            height: Math.round(r.height),
                            right: Math.round(r.right),
                            bottom: Math.round(r.bottom)
                        };
                    }

                    return {
                        viewportWidth: window.innerWidth,
                        viewportHeight: window.innerHeight,
                        vlc: getInfo(vlc, 'VLC (reel.mp4)'),
                        nomod: getInfo(nomod, 'NOMOD'),
                        harp: getInfo(harp, 'HARP CHAIR'),
                        luca: getInfo(luca, 'LUCA'),
                        toc: getInfo(toc, 'TOC (Left)'),
                        about: getInfo(about, 'ABOUT (Right)')
                    };
                })()`,
                returnByValue: true
            });

            console.log('Layout Metrics (1024x504):', JSON.stringify(layoutMetrics.result.result.value, null, 2));

            // Screenshot 1: Exact layout matching user's screenshot
            let shot1024 = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'exact_layout_1024x504.png'), Buffer.from(shot1024.result.data, 'base64'));
            console.log('Saved exact_layout_1024x504.png');

            // Test 2: Standard Desktop 1440 x 900
            await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
            await new Promise(r => setTimeout(r, 600));

            let shot1440 = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'exact_layout_1440x900.png'), Buffer.from(shot1440.result.data, 'base64'));
            console.log('Saved exact_layout_1440x900.png');

            // Test 2B: Full HD 1920 x 1080
            await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
            await new Promise(r => setTimeout(r, 600));

            let shot1080 = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'exact_layout_1920x1080.png'), Buffer.from(shot1080.result.data, 'base64'));
            console.log('Saved exact_layout_1920x1080.png');

            // Test 3: Dark Mode at 1440x900
            await send('Runtime.evaluate', {
                expression: `
                    document.body.classList.add('dark-theme');
                    localStorage.setItem('portfolio_theme', 'dark');
                `
            });
            await new Promise(r => setTimeout(r, 500));

            let shotDark = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'exact_layout_dark_theme.png'), Buffer.from(shotDark.result.data, 'base64'));
            console.log('Saved exact_layout_dark_theme.png');

            // Test 4: Drag & Resize Test
            await send('Runtime.evaluate', {
                expression: `(() => {
                    document.body.classList.remove('dark-theme');
                    const nomod = document.getElementById('project-win-1');
                    const tb = nomod.querySelector('.kali-titlebar');
                    const rect = tb.getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;

                    // Drag NOMOD 40px left, 30px down
                    tb.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: cx, clientY: cy, pointerId: 1 }));
                    window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: cx - 40, clientY: cy + 30, pointerId: 1 }));
                    window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: cx - 40, clientY: cy + 30, pointerId: 1 }));
                })()`
            });
            await new Promise(r => setTimeout(r, 400));

            let shotDragged = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'exact_layout_drag_test.png'), Buffer.from(shotDragged.result.data, 'base64'));
            console.log('Saved exact_layout_drag_test.png');

            // Test 5: Mobile Viewport 390 x 844
            await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
            await send('Runtime.evaluate', {
                expression: `
                    window.scrollTo(0, 0);
                `
            });
            await new Promise(r => setTimeout(r, 600));

            let shotMobile = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'exact_layout_mobile.png'), Buffer.from(shotMobile.result.data, 'base64'));
            console.log('Saved exact_layout_mobile.png');

            console.log('ALL VERIFICATIONS COMPLETED!');
            chrome.kill();
            server.close();
            process.exit(0);
        } catch (e) {
            console.error('Error:', e);
            chrome.kill();
            server.close();
            process.exit(1);
        }
    }, 1500);
});
