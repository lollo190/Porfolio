const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const artDir = 'C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const httpPort = 9394;
const chromePort = 9395;

// Simple static server
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
    console.log(`Server listening at http://127.0.0.1:${httpPort}`);

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

            // Set desktop resolution 1440x900
            await send('Emulation.setDeviceMetricsOverride', {
                width: 1440,
                height: 900,
                deviceScaleFactor: 1,
                mobile: false
            });

            await send('Page.enable');
            await send('Runtime.enable');

            // Navigate to home page
            await send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/index.html` });
            await new Promise(r => setTimeout(r, 2200));

            // Skip site intro if overlay is present
            await send('Runtime.evaluate', {
                expression: `
                    const intro = document.getElementById('site-intro-overlay');
                    if (intro) intro.style.display = 'none';
                    document.body.classList.remove('intro-active');
                `
            });
            await new Promise(r => setTimeout(r, 600));

            // Inspect Layout
            const layoutMetrics = await send('Runtime.evaluate', {
                expression: `
                    (() => {
                        const heroGrid = document.querySelector('.fg-hero-grid');
                        const reel = document.getElementById('motion-reel');
                        const showcase = document.getElementById('projects-showcase');
                        const rows = Array.from(document.querySelectorAll('.fg-project-row'));
                        const windows = Array.from(document.querySelectorAll('.fg-project-window'));

                        const heroRect = heroGrid ? heroGrid.getBoundingClientRect() : null;
                        const reelRect = reel ? reel.getBoundingClientRect() : null;

                        const rowData = rows.map((r, i) => {
                            const isLeft = r.classList.contains('is-left');
                            const isRight = r.classList.contains('is-right');
                            const win = r.querySelector('.fg-project-window');
                            const rect = win ? win.getBoundingClientRect() : null;
                            const handles = win ? win.querySelectorAll('.kali-resize-handle').length : 0;
                            const slides = win ? win.querySelectorAll('.fg-slide').length : 0;
                            const content = win ? win.querySelector('.fg-hero-window-content') : null;
                            const contentH = content ? content.offsetHeight : 0;

                            return {
                                index: i,
                                isLeft,
                                isRight,
                                winWidth: rect ? rect.width : 0,
                                winHeight: rect ? rect.height : 0,
                                contentH,
                                leftOffset: rect ? rect.left : 0,
                                rightOffset: rect ? (window.innerWidth - rect.right) : 0,
                                handlesCount: handles,
                                slidesCount: slides
                            };
                        });

                        return {
                            hasReel: !!reel,
                            reelTop: reelRect ? (reelRect.top + window.scrollY) : 0,
                            heroBottom: heroRect ? (heroRect.bottom + window.scrollY) : 0,
                            rowCount: rows.length,
                            windowCount: windows.length,
                            rows: rowData
                        };
                    })()
                `,
                returnByValue: true
            });

            console.log('Layout Metrics:', JSON.stringify(layoutMetrics.result.value, null, 2));

            // Capture Screenshot 1: Hero & Motion Reel
            let shot1 = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'home_hero_and_reel.png'), Buffer.from(shot1.result.data, 'base64'));
            console.log('Saved home_hero_and_reel.png');

            // Scroll down to Project 1 & 2
            await send('Runtime.evaluate', {
                expression: `
                    const row0 = document.getElementById('project-row-0');
                    if (row0) row0.scrollIntoView({ behavior: 'instant', block: 'start' });
                `
            });
            await new Promise(r => setTimeout(r, 600));

            // Capture Screenshot 2: Projects Showcase (Harp Chair left)
            let shot2 = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'home_showcase_harp.png'), Buffer.from(shot2.result.data, 'base64'));
            console.log('Saved home_showcase_harp.png');

            // Hover on Project 0 content to reveal "FULL PROJECT" badge
            await send('Runtime.evaluate', {
                expression: `
                    const win0 = document.getElementById('project-win-0');
                    win0.classList.add('hover-test');
                    // dispatch mouseenter
                    win0.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                    const badge = win0.querySelector('.fg-window-badge');
                    badge.style.opacity = '1';
                    badge.style.transform = 'translateY(0)';
                    badge.style.background = '#0000ff';
                `
            });
            await new Promise(r => setTimeout(r, 400));

            let shotHover = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'home_showcase_hover_badge.png'), Buffer.from(shotHover.result.data, 'base64'));
            console.log('Saved home_showcase_hover_badge.png');

            // Scroll down to NOMOD and LUCA
            await send('Runtime.evaluate', {
                expression: `
                    const row1 = document.getElementById('project-row-1');
                    if (row1) row1.scrollIntoView({ behavior: 'instant', block: 'start' });
                `
            });
            await new Promise(r => setTimeout(r, 600));

            let shot3 = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'home_showcase_nomod_luca.png'), Buffer.from(shot3.result.data, 'base64'));
            console.log('Saved home_showcase_nomod_luca.png');

            // Test Dragging & Resizing on Project 0
            await send('Runtime.evaluate', {
                expression: `
                    const row0 = document.getElementById('project-row-0');
                    if (row0) row0.scrollIntoView({ behavior: 'instant', block: 'center' });
                    const win0 = document.getElementById('project-win-0');
                    // Drag simulate: move by 50px right, 30px down
                    win0.style.transform = 'translate3d(50px, 30px, 0)';
                    // Resize simulate: make width 860px and content 480px
                    win0.style.width = '860px';
                    const c = win0.querySelector('.fg-hero-window-content');
                    if (c) c.style.height = '480px';
                `
            });
            await new Promise(r => setTimeout(r, 500));

            let shotDrag = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'home_window_dragged_resized.png'), Buffer.from(shotDrag.result.data, 'base64'));
            console.log('Saved home_window_dragged_resized.png');

            // Test Slideshow advancing
            await send('Runtime.evaluate', {
                expression: `
                    const win0 = document.getElementById('project-win-0');
                    win0.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
                `
            });
            // Wait 2.8s for slide to auto-advance
            await new Promise(r => setTimeout(r, 2800));

            const slideCheck = await send('Runtime.evaluate', {
                expression: `
                    (() => {
                        const win0 = document.getElementById('project-win-0');
                        const activeSlide = win0.querySelector('.fg-slide.is-active');
                        const curCounter = win0.querySelector('.fg-slide-cur');
                        return {
                            activeSlideIndex: activeSlide ? activeSlide.dataset.slideIndex : null,
                            counterText: curCounter ? curCounter.textContent : ''
                        };
                    })()
                `,
                returnByValue: true
            });
            console.log('Slide progression check:', slideCheck.result.value);

            // Test Dark Mode
            await send('Runtime.evaluate', {
                expression: `
                    document.body.classList.add('dark-theme');
                    localStorage.setItem('portfolio_theme', 'dark');
                `
            });
            await new Promise(r => setTimeout(r, 400));

            let shotDark = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'home_showcase_dark.png'), Buffer.from(shotDark.result.data, 'base64'));
            console.log('Saved home_showcase_dark.png');

            console.log('All tests finished successfully!');
            chrome.kill();
            server.close();
            process.exit(0);

        } catch (err) {
            console.error('Test error:', err);
            chrome.kill();
            server.close();
            process.exit(1);
        }
    }, 1200);
});
