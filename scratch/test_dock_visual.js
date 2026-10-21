const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9358;
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

        // 1. Desktop Light (1440x900)
        await send('Emulation.setDeviceMetricsOverride', {
            width: 1440,
            height: 900,
            deviceScaleFactor: 1,
            mobile: false
        });

        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html' });
        await new Promise(r => setTimeout(r, 1000));

        // Evaluate coordinates at scrollY = 0
        let coords = await send('Runtime.evaluate', {
            expression: `(() => {
                const dock = document.getElementById('nb-nav-logo-dock').getBoundingClientRect();
                const anchor = document.getElementById('fg-hero-logo-anchor').getBoundingClientRect();
                const navLink = document.querySelector('.nb-nav-home-link').getBoundingClientRect();
                return JSON.stringify({
                    scrollY: window.scrollY,
                    isDocked: document.body.classList.contains('is-docked'),
                    dock: { left: dock.left, top: dock.top, width: dock.width, height: dock.height },
                    anchor: { left: anchor.left, top: anchor.top, width: anchor.width, height: anchor.height },
                    navLink: { left: navLink.left, top: navLink.top, width: navLink.width, height: navLink.height }
                });
            })()`
        });
        console.log('AT SCROLL 0 (DESKTOP):', JSON.parse(coords.result.result.value));

        let shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\dock_hero_desktop_light.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Saved dock_hero_desktop_light.png');

        // Scroll down 250px
        await send('Runtime.evaluate', { expression: `window.scrollTo(0, 250)` });
        // Wait for 0.46s transition to complete
        await new Promise(r => setTimeout(r, 650));

        coords = await send('Runtime.evaluate', {
            expression: `(() => {
                const dock = document.getElementById('nb-nav-logo-dock').getBoundingClientRect();
                const navLink = document.querySelector('.nb-nav-home-link').getBoundingClientRect();
                return JSON.stringify({
                    scrollY: window.scrollY,
                    isDocked: document.body.classList.contains('is-docked'),
                    dock: { left: dock.left, top: dock.top, width: dock.width, height: dock.height },
                    navLink: { left: navLink.left, top: navLink.top, width: navLink.width, height: navLink.height }
                });
            })()`
        });
        console.log('AT SCROLL 250 (DESKTOP DOCKED):', JSON.parse(coords.result.result.value));

        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\dock_navbar_desktop_light.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Saved dock_navbar_desktop_light.png');

        // Switch to Dark mode
        await send('Runtime.evaluate', { expression: `document.getElementById('theme-toggle').click()` });
        await new Promise(r => setTimeout(r, 400));

        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\dock_navbar_desktop_dark.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Saved dock_navbar_desktop_dark.png');

        // Scroll back to top
        await send('Runtime.evaluate', { expression: `window.scrollTo(0, 0)` });
        await new Promise(r => setTimeout(r, 650));

        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\dock_hero_desktop_returned.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Saved dock_hero_desktop_returned.png');

        // Mobile View (390x844)
        await send('Emulation.setDeviceMetricsOverride', {
            width: 390,
            height: 844,
            deviceScaleFactor: 2,
            mobile: true
        });
        await send('Runtime.evaluate', {
            expression: `document.body.classList.remove('dark-theme'); localStorage.setItem('portfolio_theme', 'light'); window.scrollTo(0, 0);`
        });
        await new Promise(r => setTimeout(r, 600));

        coords = await send('Runtime.evaluate', {
            expression: `(() => {
                const dock = document.getElementById('nb-nav-logo-dock').getBoundingClientRect();
                const anchor = document.getElementById('fg-hero-logo-anchor').getBoundingClientRect();
                return JSON.stringify({
                    scrollY: window.scrollY,
                    isDocked: document.body.classList.contains('is-docked'),
                    dock: { left: dock.left, top: dock.top, width: dock.width, height: dock.height },
                    anchor: { left: anchor.left, top: anchor.top, width: anchor.width, height: anchor.height }
                });
            })()`
        });
        console.log('AT SCROLL 0 (MOBILE):', JSON.parse(coords.result.result.value));

        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\dock_hero_mobile_light.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Saved dock_hero_mobile_light.png');

        // Scroll down 200px on mobile
        await send('Runtime.evaluate', { expression: `window.scrollTo(0, 200)` });
        await new Promise(r => setTimeout(r, 650));

        coords = await send('Runtime.evaluate', {
            expression: `(() => {
                const dock = document.getElementById('nb-nav-logo-dock').getBoundingClientRect();
                const navLink = document.querySelector('.nb-nav-home-link').getBoundingClientRect();
                return JSON.stringify({
                    scrollY: window.scrollY,
                    isDocked: document.body.classList.contains('is-docked'),
                    dock: { left: dock.left, top: dock.top, width: dock.width, height: dock.height },
                    navLink: { left: navLink.left, top: navLink.top, width: navLink.width, height: navLink.height }
                });
            })()`
        });
        console.log('AT SCROLL 200 (MOBILE DOCKED):', JSON.parse(coords.result.result.value));

        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\dock_navbar_mobile_light.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Saved dock_navbar_mobile_light.png');

        console.log('ALL DOCK TESTS COMPLETED SUCCESSFULLY');
        chrome.kill();
        process.exit(0);
    } catch (err) {
        console.error('Test error:', err);
        chrome.kill();
        process.exit(1);
    }
}, 800);
