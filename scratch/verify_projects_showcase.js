const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
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
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.pdf': 'application/pdf'
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
        res.end('Not found');
    }
});

server.listen(httpPort, async () => {
    console.log(`Server listening on http://127.0.0.1:${httpPort}`);

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

            // Desktop viewport 1440x900
            await send('Emulation.setDeviceMetricsOverride', {
                width: 1440,
                height: 900,
                deviceScaleFactor: 1,
                mobile: false
            });

            await send('Page.enable');
            await send('Runtime.enable');

            // Navigate
            console.log('Navigating to index.html...');
            await send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/index.html` });
            await new Promise(r => setTimeout(r, 2200));

            // Dismiss site intro if present
            await send('Runtime.evaluate', {
                expression: `
                    const intro = document.getElementById('site-intro-overlay');
                    if (intro) intro.style.display = 'none';
                    document.body.classList.remove('intro-active');
                `
            });
            await new Promise(r => setTimeout(r, 600));

            // Verify showcase metrics
            const showcaseInfo = await send('Runtime.evaluate', {
                expression: `
                    (() => {
                        const showcase = document.getElementById('projects-showcase');
                        const rows = Array.from(document.querySelectorAll('.fg-project-row'));
                        const windows = Array.from(document.querySelectorAll('.fg-project-window'));

                        return {
                            hasShowcase: !!showcase,
                            rowCount: rows.length,
                            windowCount: windows.length,
                            windows: windows.map((w, i) => {
                                const rect = w.getBoundingClientRect();
                                const content = w.querySelector('.fg-hero-window-content');
                                const contentRect = content ? content.getBoundingClientRect() : null;
                                const handles = w.querySelectorAll('.kali-resize-handle').length;
                                const slides = w.querySelectorAll('.fg-slide').length;
                                const overlay = w.querySelector('.fg-project-overlay');
                                const curSlide = w.querySelector('.fg-slide.is-active');
                                const curIdx = curSlide ? curSlide.dataset.slideIndex : null;

                                return {
                                    id: w.id,
                                    width: Math.round(rect.width),
                                    height: Math.round(rect.height),
                                    contentWidth: contentRect ? Math.round(contentRect.width) : 0,
                                    contentHeight: contentRect ? Math.round(contentRect.height) : 0,
                                    aspectRatio: contentRect ? (contentRect.width / contentRect.height).toFixed(3) : 0,
                                    handlesCount: handles,
                                    slidesCount: slides,
                                    hasOverlay: !!overlay,
                                    activeSlideIndex: curIdx
                                };
                            })
                        };
                    })()
                `,
                returnByValue: true
            });

            console.log('Project Showcase Info:', JSON.stringify(showcaseInfo.result.result ? showcaseInfo.result.result.value : showcaseInfo.result, null, 2));

            // Scroll to Project 0 (Harp Chair)
            await send('Runtime.evaluate', {
                expression: `
                    const row0 = document.getElementById('project-row-0');
                    if (row0) row0.scrollIntoView({ behavior: 'instant', block: 'start' });
                `
            });
            await new Promise(r => setTimeout(r, 600));

            // Capture screenshot of Harp Chair row
            let shotHarp = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'project_windows_harp_chair.png'), Buffer.from(shotHarp.result.data, 'base64'));
            console.log('Saved project_windows_harp_chair.png');

            // Trigger hover on Project 0 to showcase superimposed "FULL PROJECT"
            await send('Runtime.evaluate', {
                expression: `
                    const win0 = document.getElementById('project-win-0');
                    win0.classList.add('hover-test');
                    win0.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                `
            });
            await new Promise(r => setTimeout(r, 500));

            let shotHover = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'project_windows_full_project_hover.png'), Buffer.from(shotHover.result.data, 'base64'));
            console.log('Saved project_windows_full_project_hover.png');

            // Remove hover test
            await send('Runtime.evaluate', {
                expression: `
                    const win0 = document.getElementById('project-win-0');
                    win0.classList.remove('hover-test');
                    win0.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
                `
            });

            // Wait 3.5s for continuous slideshow autoplay transition to slide 2
            console.log('Waiting 3.5s for automatic slideshow crossfade...');
            await new Promise(r => setTimeout(r, 3500));

            const slideAfterAutoplay = await send('Runtime.evaluate', {
                expression: `
                    (() => {
                        const win0 = document.getElementById('project-win-0');
                        const curSlide = win0.querySelector('.fg-slide.is-active');
                        const counter = win0.querySelector('.fg-slide-cur');
                        return {
                            activeSlideIndex: curSlide ? curSlide.dataset.slideIndex : null,
                            counterText: counter ? counter.textContent : null
                        };
                    })()
                `,
                returnByValue: true
            });
            console.log('Slide after autoplay:', slideAfterAutoplay.result.result ? slideAfterAutoplay.result.result.value : slideAfterAutoplay.result);

            // Test Next Button click
            await send('Runtime.evaluate', {
                expression: `
                    const nextBtn = document.querySelector('#project-win-0 .fg-win-next-btn');
                    if (nextBtn) nextBtn.click();
                `
            });
            await new Promise(r => setTimeout(r, 500));

            const slideAfterNextBtn = await send('Runtime.evaluate', {
                expression: `
                    (() => {
                        const win0 = document.getElementById('project-win-0');
                        const curSlide = win0.querySelector('.fg-slide.is-active');
                        const counter = win0.querySelector('.fg-slide-cur');
                        return {
                            activeSlideIndex: curSlide ? curSlide.dataset.slideIndex : null,
                            counterText: counter ? counter.textContent : null
                        };
                    })()
                `,
                returnByValue: true
            });
            console.log('Slide after Next button click:', slideAfterNextBtn.result.result ? slideAfterNextBtn.result.result.value : slideAfterNextBtn.result);

            // Scroll down to NOMOD and Luca
            await send('Runtime.evaluate', {
                expression: `
                    const row1 = document.getElementById('project-row-1');
                    if (row1) row1.scrollIntoView({ behavior: 'instant', block: 'start' });
                `
            });
            await new Promise(r => setTimeout(r, 600));

            let shotNomod = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'project_windows_nomod.png'), Buffer.from(shotNomod.result.data, 'base64'));
            console.log('Saved project_windows_nomod.png');

            await send('Runtime.evaluate', {
                expression: `
                    const row2 = document.getElementById('project-row-2');
                    if (row2) row2.scrollIntoView({ behavior: 'instant', block: 'start' });
                `
            });
            await new Promise(r => setTimeout(r, 600));

            let shotLuca = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'project_windows_luca.png'), Buffer.from(shotLuca.result.data, 'base64'));
            console.log('Saved project_windows_luca.png');

            // Test Dragging on Project 0
            await send('Runtime.evaluate', {
                expression: `
                    const row0 = document.getElementById('project-row-0');
                    if (row0) row0.scrollIntoView({ behavior: 'instant', block: 'center' });
                `
            });
            await new Promise(r => setTimeout(r, 500));

            const dragResult = await send('Runtime.evaluate', {
                expression: `
                    (() => {
                        const win0 = document.getElementById('project-win-0');
                        const titlebar = win0.querySelector('.kali-titlebar');
                        const rect = titlebar.getBoundingClientRect();
                        const cx = rect.left + rect.width / 2;
                        const cy = rect.top + rect.height / 2;

                        titlebar.dispatchEvent(new PointerEvent('pointerdown', {
                            bubbles: true,
                            clientX: cx,
                            clientY: cy,
                            pointerId: 1
                        }));

                        window.dispatchEvent(new PointerEvent('pointermove', {
                            bubbles: true,
                            clientX: cx + 60,
                            clientY: cy + 40,
                            pointerId: 1
                        }));

                        window.dispatchEvent(new PointerEvent('pointerup', {
                            bubbles: true,
                            clientX: cx + 60,
                            clientY: cy + 40,
                            pointerId: 1
                        }));

                        return {
                            transform: win0.style.transform,
                            width: win0.style.width
                        };
                    })()
                `,
                returnByValue: true
            });
            console.log('Drag test result:', dragResult.result.result ? dragResult.result.result.value : dragResult.result);

            // Test 8-Direction Resizing (se corner) on Project 0
            const resizeResult = await send('Runtime.evaluate', {
                expression: `
                    (() => {
                        const win0 = document.getElementById('project-win-0');
                        const handleSe = win0.querySelector('.kali-resize-se');
                        const rect = handleSe.getBoundingClientRect();
                        const cx = rect.left + rect.width / 2;
                        const cy = rect.top + rect.height / 2;

                        const prevW = win0.offsetWidth;

                        handleSe.dispatchEvent(new PointerEvent('pointerdown', {
                            bubbles: true,
                            clientX: cx,
                            clientY: cy,
                            pointerId: 2
                        }));

                        window.dispatchEvent(new PointerEvent('pointermove', {
                            bubbles: true,
                            clientX: cx + 80,
                            clientY: cy + 45,
                            pointerId: 2
                        }));

                        window.dispatchEvent(new PointerEvent('pointerup', {
                            bubbles: true,
                            clientX: cx + 80,
                            clientY: cy + 45,
                            pointerId: 2
                        }));

                        const content = win0.querySelector('.fg-hero-window-content');
                        const cRect = content.getBoundingClientRect();

                        return {
                            prevWidth: prevW,
                            newWidth: win0.offsetWidth,
                            newContentWidth: Math.round(cRect.width),
                            newContentHeight: Math.round(cRect.height),
                            aspectRatio: (cRect.width / cRect.height).toFixed(3),
                            transform: win0.style.transform
                        };
                    })()
                `,
                returnByValue: true
            });
            console.log('Resize test result:', resizeResult.result.result ? resizeResult.result.result.value : resizeResult.result);

            let shotResized = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'project_windows_dragged_and_resized.png'), Buffer.from(shotResized.result.data, 'base64'));
            console.log('Saved project_windows_dragged_and_resized.png');

            // Dark Mode test
            await send('Runtime.evaluate', {
                expression: `
                    document.body.classList.add('dark-theme');
                    localStorage.setItem('portfolio_theme', 'dark');
                    const row0 = document.getElementById('project-row-0');
                    if (row0) row0.scrollIntoView({ behavior: 'instant', block: 'start' });
                    const win0 = document.getElementById('project-win-0');
                    win0.classList.add('hover-test');
                `
            });
            await new Promise(r => setTimeout(r, 600));

            let shotDark = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'project_windows_dark_theme.png'), Buffer.from(shotDark.result.data, 'base64'));
            console.log('Saved project_windows_dark_theme.png');

            // Mobile Viewport test 390x844
            await send('Emulation.setDeviceMetricsOverride', {
                width: 390,
                height: 844,
                deviceScaleFactor: 2,
                mobile: true
            });
            await send('Runtime.evaluate', {
                expression: `
                    const toggle = document.getElementById('theme-toggle');
                    if (toggle && document.body.classList.contains('dark-theme')) toggle.click();
                    const row0 = document.getElementById('project-row-0');
                    if (row0) row0.scrollIntoView({ behavior: 'instant', block: 'start' });
                `
            });
            await new Promise(r => setTimeout(r, 600));

            let shotMobile = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(artDir, 'project_windows_mobile.png'), Buffer.from(shotMobile.result.data, 'base64'));
            console.log('Saved project_windows_mobile.png');

            console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
            ws.close();
            chrome.kill();
            server.close();
            process.exit(0);
        } catch (err) {
            console.error('Error during testing:', err);
            chrome.kill();
            server.close();
            process.exit(1);
        }
    }, 1500);
});
