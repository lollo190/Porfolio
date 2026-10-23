const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const artDir = 'C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const httpPort = 9401;
const chromePort = 9402;

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
    console.log(`Server listening on port ${httpPort}`);
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

            await send('Emulation.setDeviceMetricsOverride', {
                width: 1440,
                height: 900,
                deviceScaleFactor: 1,
                mobile: false
            });

            await send('Page.enable');
            await send('Runtime.enable');

            await send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/index.html` });
            await new Promise(r => setTimeout(r, 1800));

            // Dismiss intro splash immediately for test
            await send('Runtime.evaluate', {
                expression: `
                    const intro = document.getElementById('site-intro-overlay');
                    if (intro) intro.style.display = 'none';
                    document.body.classList.remove('intro-active');
                `
            });

            // Wait 2.2s for typing animation to progress
            await new Promise(r => setTimeout(r, 2200));

            // Evaluate Navbar and Typing state
            const state = await send('Runtime.evaluate', {
                expression: `
                    (() => {
                        const nav = document.querySelector('.nb-top-nav');
                        const navAbout = nav.querySelector('a[href="about.html"]');
                        const navContact = nav.querySelector('a[href="#contact"]');
                        const homeText = nav.querySelector('.nb-nav-home-text');
                        const dockLogo = nav.querySelector('.nb-nav-logo-dock');
                        const liveClock = nav.querySelector('#live-clock');

                        const typingContent = document.querySelector('#reel-typing-text .typing-content');
                        const typingEl = document.querySelector('#reel-typing-text');
                        const compStyle = typingEl ? window.getComputedStyle(typingEl) : null;

                        const bottomToc = document.getElementById('table-of-contents');
                        const tocRect = bottomToc ? bottomToc.getBoundingClientRect() : null;
                        const tocInner = bottomToc ? bottomToc.querySelector('.fg-toc') : null;
                        const tocInnerRect = tocInner ? tocInner.getBoundingClientRect() : null;

                        return {
                            navbar: {
                                hasAboutInNav: !!navAbout,
                                hasContactInNav: !!navContact,
                                homeText: homeText ? homeText.textContent : '',
                                hasLogo: !!dockLogo,
                                hasClock: !!liveClock
                            },
                            typing: {
                                text: typingContent ? typingContent.textContent : '',
                                color: compStyle ? compStyle.color : '',
                                blendMode: compStyle ? compStyle.mixBlendMode : ''
                            },
                            bottomToc: {
                                exists: !!bottomToc,
                                isAtBottom: bottomToc ? (bottomToc.offsetTop > 1200) : false,
                                rightOffset: tocInnerRect ? (window.innerWidth - tocInnerRect.right) : 0,
                                leftOffset: tocInnerRect ? tocInnerRect.left : 0
                            }
                        };
                    })()
                `,
                returnByValue: true
            });

            console.log('Page State:', JSON.stringify(state.result.value, null, 2));

            // Screenshot 1: Fullscreen Reel with Typing animation
            let shot1 = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'reel_typing_animation.png'), Buffer.from(shot1.result.data, 'base64'));
            console.log('Saved reel_typing_animation.png');

            // Wait another 3s for full text to type out
            await new Promise(r => setTimeout(r, 3000));
            let shot1b = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'reel_typing_completed.png'), Buffer.from(shot1b.result.data, 'base64'));
            console.log('Saved reel_typing_completed.png');

            // Scroll down to the Table of Contents at the bottom
            await send('Runtime.evaluate', {
                expression: `
                    const toc = document.getElementById('table-of-contents');
                    if (toc) toc.scrollIntoView({ behavior: 'instant', block: 'center' });
                `
            });
            await new Promise(r => setTimeout(r, 500));

            let shot2 = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'bottom_table_of_contents.png'), Buffer.from(shot2.result.data, 'base64'));
            console.log('Saved bottom_table_of_contents.png');

            // Dark Mode test
            await send('Runtime.evaluate', {
                expression: `
                    document.body.classList.add('dark-theme');
                    localStorage.setItem('portfolio_theme', 'dark');
                    window.scrollTo({ top: 0, behavior: 'instant' });
                `
            });
            await new Promise(r => setTimeout(r, 500));

            let shotDarkReel = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'dark_reel_typing.png'), Buffer.from(shotDarkReel.result.data, 'base64'));
            console.log('Saved dark_reel_typing.png');

            // Mobile test (390x844)
            await send('Emulation.setDeviceMetricsOverride', {
                width: 390,
                height: 844,
                deviceScaleFactor: 2,
                mobile: true
            });
            await send('Runtime.evaluate', {
                expression: `
                    document.body.classList.remove('dark-theme');
                    window.scrollTo({ top: 0, behavior: 'instant' });
                `
            });
            await new Promise(r => setTimeout(r, 500));

            let shotMobReel = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'mobile_reel_typing.png'), Buffer.from(shotMobReel.result.data, 'base64'));
            console.log('Saved mobile_reel_typing.png');

            // Scroll to bottom TOC on mobile
            await send('Runtime.evaluate', {
                expression: `
                    const toc = document.getElementById('table-of-contents');
                    if (toc) toc.scrollIntoView({ behavior: 'instant', block: 'center' });
                `
            });
            await new Promise(r => setTimeout(r, 500));

            let shotMobToc = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'mobile_bottom_toc.png'), Buffer.from(shotMobToc.result.data, 'base64'));
            console.log('Saved mobile_bottom_toc.png');

            console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
            chrome.kill();
            server.close();
            process.exit(0);

        } catch (e) {
            console.error('Test error:', e);
            chrome.kill();
            server.close();
            process.exit(1);
        }
    }, 1200);
});
