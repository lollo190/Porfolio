const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9397;
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

        // 1. Desktop Test (1440x950)
        await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 950, deviceScaleFactor: 1, mobile: false });
        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html' });
        await new Promise(r => setTimeout(r, 1600));

        const deskCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                const el = document.querySelector('.fg-side-about') || document.querySelector('.fg-bottom-center-about');
                const btn = el ? el.querySelector('a') : null;
                const rect = el ? el.getBoundingClientRect() : null;
                const cs = el ? window.getComputedStyle(el) : null;
                return {
                    found: !!el,
                    text: btn ? btn.innerText.trim() : null,
                    rect: rect ? { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width, height: rect.height } : null,
                    cs: cs ? { position: cs.position, top: cs.top, right: cs.right, transform: cs.transform, zIndex: cs.zIndex } : null,
                    viewportHeight: window.innerHeight,
                    viewportWidth: window.innerWidth,
                    verticalCenterDistance: rect ? Math.abs((rect.top + rect.height / 2) - (window.innerHeight / 2)) : null
                };
            })()`,
            returnByValue: true
        });

        console.log("Desktop Check:", JSON.stringify(deskCheck.result.result ? deskCheck.result.result.value : deskCheck.result, null, 2));

        const scr1 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artDir, 'about_button_right_mid_desktop.png'), Buffer.from(scr1.result.data, 'base64'));

        // Scroll test
        await send('Runtime.evaluate', { expression: `window.scrollTo(0, 300);` });
        await new Promise(r => setTimeout(r, 300));
        const scrScroll = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artDir, 'about_button_right_mid_scrolled.png'), Buffer.from(scrScroll.result.data, 'base64'));

        // Dark theme test
        await send('Runtime.evaluate', { expression: `document.body.classList.add('dark-theme');` });
        await new Promise(r => setTimeout(r, 300));
        const scrDark = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artDir, 'about_button_right_mid_dark.png'), Buffer.from(scrDark.result.data, 'base64'));

        // 2. Mobile Test (390x844)
        await send('Runtime.evaluate', { expression: `document.body.classList.remove('dark-theme'); window.scrollTo(0, 0);` });
        await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
        await new Promise(r => setTimeout(r, 800));

        const mobileCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                const el = document.querySelector('.fg-side-about') || document.querySelector('.fg-bottom-center-about');
                const btn = el ? el.querySelector('a') : null;
                const rect = el ? el.getBoundingClientRect() : null;
                const cs = el ? window.getComputedStyle(el) : null;
                return {
                    found: !!el,
                    text: btn ? btn.innerText.trim() : null,
                    rect: rect ? { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width, height: rect.height } : null,
                    cs: cs ? { position: cs.position, top: cs.top, right: cs.right, transform: cs.transform, zIndex: cs.zIndex } : null,
                    viewportHeight: window.innerHeight,
                    viewportWidth: window.innerWidth,
                    verticalCenterDistance: rect ? Math.abs((rect.top + rect.height / 2) - (window.innerHeight / 2)) : null
                };
            })()`,
            returnByValue: true
        });

        console.log("Mobile Check:", JSON.stringify(mobileCheck.result.result ? mobileCheck.result.result.value : mobileCheck.result, null, 2));

        const mobScr = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artDir, 'about_button_right_mid_mobile.png'), Buffer.from(mobScr.result.data, 'base64'));

        console.log("ALL TESTS FINISHED.");
        chrome.kill();
        process.exit(0);
    } catch (e) {
        console.error("Test Error:", e);
        chrome.kill();
        process.exit(1);
    }
}, 1500);
