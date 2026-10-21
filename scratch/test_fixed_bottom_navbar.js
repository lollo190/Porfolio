const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9392;
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

        let id = 1;
        const send = (method, params = {}) => new Promise((resolve) => {
            const curId = id++;
            const l = (e) => {
                const data = JSON.parse(e.data);
                if (data.id === curId) {
                    ws.removeEventListener('message', l);
                    resolve(data);
                }
            };
            ws.addEventListener('message', l);
            ws.send(JSON.stringify({ id: curId, method, params }));
        });

        const getVal = (res) => (res && res.result && res.result.result ? res.result.result.value : (res && res.result ? res.result.value : null));

        // --- 1. Desktop Test (1440x950) ---
        await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 950, deviceScaleFactor: 1, mobile: false });
        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html' });
        await new Promise(r => setTimeout(r, 1600));

        const deskCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                const bar = document.querySelector('.fg-desktop-bottom-bar');
                const aboutLink = document.querySelector('.fg-bottom-center-about');
                const cs = window.getComputedStyle(bar);
                const rect = bar.getBoundingClientRect();
                const aboutRect = aboutLink.getBoundingClientRect();
                return {
                    position: cs.position,
                    bottom: cs.bottom,
                    zIndex: cs.zIndex,
                    height: rect.height,
                    rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width },
                    aboutCenterOffsetFromMiddle: (aboutRect.left + aboutRect.width / 2) - (window.innerWidth / 2),
                    scrollY: window.scrollY
                };
            })()`,
            returnByValue: true
        });

        console.log("Desktop Initial Check:", JSON.stringify(getVal(deskCheck), null, 2));

        // Take initial desktop screenshot
        const scr1 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artDir, 'fixed_bottom_desktop_light.png'), Buffer.from(scr1.result.data, 'base64'));

        // --- 2. Scroll Test: Scroll down 350px ---
        await send('Runtime.evaluate', {
            expression: `window.scrollTo(0, 350);`
        });
        await new Promise(r => setTimeout(r, 300));

        const scrollCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                const bar = document.querySelector('.fg-desktop-bottom-bar');
                const rect = bar.getBoundingClientRect();
                return {
                    scrollY: window.scrollY,
                    bottom: rect.bottom,
                    top: rect.top,
                    pinnedToViewportBottom: Math.abs(rect.bottom - window.innerHeight) < 1
                };
            })()`,
            returnByValue: true
        });

        console.log("Desktop Scrolled Check:", JSON.stringify(getVal(scrollCheck), null, 2));

        // Take scrolled screenshot
        const scr2 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artDir, 'fixed_bottom_desktop_scrolled.png'), Buffer.from(scr2.result.data, 'base64'));

        // --- 3. Dark Theme Test ---
        await send('Runtime.evaluate', {
            expression: `document.body.classList.add('dark-theme');`
        });
        await new Promise(r => setTimeout(r, 300));

        const darkScr = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artDir, 'fixed_bottom_desktop_dark.png'), Buffer.from(darkScr.result.data, 'base64'));

        // Reset scroll and theme
        await send('Runtime.evaluate', {
            expression: `document.body.classList.remove('dark-theme'); window.scrollTo(0, 0);`
        });

        // --- 4. Mobile Test (390x844) ---
        await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
        await new Promise(r => setTimeout(r, 800));

        const mobileCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                const bar = document.querySelector('.fg-desktop-bottom-bar');
                const aboutLink = document.querySelector('.fg-bottom-center-about');
                const cs = window.getComputedStyle(bar);
                const rect = bar.getBoundingClientRect();
                const aboutRect = aboutLink.getBoundingClientRect();
                return {
                    position: cs.position,
                    bottom: cs.bottom,
                    zIndex: cs.zIndex,
                    height: rect.height,
                    rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width },
                    aboutCenterOffsetFromMiddle: (aboutRect.left + aboutRect.width / 2) - (window.innerWidth / 2)
                };
            })()`,
            returnByValue: true
        });

        console.log("Mobile Check:", JSON.stringify(getVal(mobileCheck), null, 2));

        const mobScr = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artDir, 'fixed_bottom_mobile.png'), Buffer.from(mobScr.result.data, 'base64'));

        console.log("ALL TESTS COMPLETED SUCCESSFULLY.");
        chrome.kill();
        process.exit(0);
    } catch (e) {
        console.error("Test Error:", e);
        chrome.kill();
        process.exit(1);
    }
}, 1500);
