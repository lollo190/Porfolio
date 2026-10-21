const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9380;
const artDir = 'C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc';

const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
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
        const targets = await getJSON(`http://127.0.0.1:${port}/json`);
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

        await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html' });
        await new Promise(r => setTimeout(r, 1500));

        // 1. Verify Harp Chair window on Desktop
        const winCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                const win0 = document.getElementById('hero-win-0');
                const titleText = win0.querySelector('.kali-title-text').textContent;
                const statusLeft = win0.querySelector('.kali-status-left').textContent;
                const tocItem3 = document.querySelector('[data-target="hero-win-0"]').textContent;
                const slides = Array.from(win0.querySelectorAll('.fg-slide-img')).map(img => img.src);
                const seeMoreBtn = win0.querySelector('.fg-see-more-btn');

                return {
                    titleText,
                    statusLeft,
                    tocItem3: tocItem3.trim(),
                    slidesCount: slides.length,
                    slides,
                    seeMoreHref: seeMoreBtn ? seeMoreBtn.getAttribute('href') : null
                };
            })()`,
            returnByValue: true
        });

        console.log('--- Harp Chair Desktop Check ---');
        console.log(JSON.stringify(winCheck.result.result.value, null, 2));

        // Screenshot 1: Harp Chair Window on Desktop
        const ss1 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}/harp_chair_desktop_window.png`, Buffer.from(ss1.result.data, 'base64'));
        console.log('Saved harp_chair_desktop_window.png');

        // 2. Hover over content to trigger "SEE MORE" button
        await send('Runtime.evaluate', {
            expression: `(() => {
                const content = document.querySelector('#hero-win-0 .fg-hero-window-content');
                const btn = content.querySelector('.fg-see-more-btn');
                btn.style.opacity = '1';
                btn.style.transform = 'translate(-50%, -50%) scale(1)';
                btn.style.pointerEvents = 'auto';
            })()`
        });

        const ss2 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}/harp_chair_hover_see_more.png`, Buffer.from(ss2.result.data, 'base64'));
        console.log('Saved harp_chair_hover_see_more.png');

        // 3. Navigate to harp-chair.html
        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/harp-chair.html' });
        await new Promise(r => setTimeout(r, 1200));

        const pageCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                const title = document.querySelector('.proj-page-title').textContent;
                const cards = document.querySelectorAll('.proj-gallery-card').length;
                const images = Array.from(document.querySelectorAll('.proj-gallery-card img')).map(img => img.src);
                const backLink = document.querySelector('.proj-nav-back').getAttribute('href');

                return {
                    title,
                    cards,
                    images,
                    backLink
                };
            })()`,
            returnByValue: true
        });

        console.log('--- Harp Chair Page Check ---');
        console.log(JSON.stringify(pageCheck.result.result.value, null, 2));

        const ss3 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}/harp_chair_page_full.png`, Buffer.from(ss3.result.data, 'base64'));
        console.log('Saved harp_chair_page_full.png');

        chrome.kill();
        process.exit(0);
    } catch (err) {
        console.error('Error during test:', err);
        chrome.kill();
        process.exit(1);
    }
}, 1000);
