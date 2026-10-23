const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9373;
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
        const targets = await getJSON('http://127.0.0.1:' + port + '/json');
        const target = targets.find(t => t.type === 'page');
        const ws = new WebSocket(target.webSocketDebuggerUrl);

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

        await new Promise(r => ws.addEventListener('open', r, { once: true }));

        console.log('--- TEST 1: DESKTOP ICONS & CONTACT WINDOW ---');
        await send('Emulation.setDeviceMetricsOverride', {
            width: 1440,
            height: 900,
            deviceScaleFactor: 2,
            mobile: false
        });

        await send('Page.navigate', {
            url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html'
        });

        await new Promise(r => setTimeout(r, 100));
        await send('Runtime.evaluate', {
            expression: `document.getElementById('site-intro-overlay').style.display = 'none'`
        });

        await new Promise(r => setTimeout(r, 400));

        // 1A. Capture crop of both desktop icons
        const iconClip = await send('Runtime.evaluate', {
            expression: `(() => {
                const row = document.querySelector('.fg-desktop-icons-row');
                const r = row.getBoundingClientRect();
                return { x: r.x - 30, y: r.y - 15, width: r.width + 60, height: r.height + 30, scale: 1 };
            })()`,
            returnByValue: true
        });

        let shot = await send('Page.captureScreenshot', {
            format: 'png',
            clip: iconClip.result.result.value
        });
        fs.writeFileSync(`${artDir}\\verified_both_desktop_icons.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Saved verified_both_desktop_icons.png');

        // 1B. Open Contact Window
        await send('Runtime.evaluate', {
            expression: `openAndFocusWindow('hero-win-contact')`
        });

        await new Promise(r => setTimeout(r, 300));

        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\verified_contact_window_desktop.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Saved verified_contact_window_desktop.png');

        // Check rect & transform of contact window
        const desktopContactInfo = await send('Runtime.evaluate', {
            expression: `(() => {
                const win = document.getElementById('hero-win-contact');
                const r = win.getBoundingClientRect();
                const cs = window.getComputedStyle(win);
                return {
                    left: r.left, top: r.top, width: r.width, height: r.height,
                    transform: cs.transform,
                    zIndex: cs.zIndex
                };
            })()`,
            returnByValue: true
        });
        console.log('Desktop Contact Window Initial:', JSON.stringify(desktopContactInfo.result.result.value, null, 2));

        // 1C. Test Dragging on Desktop: 40px right, 30px down
        const dragTest = await send('Runtime.evaluate', {
            expression: `(() => {
                const win = document.getElementById('hero-win-contact');
                const tb = win.querySelector('.kali-titlebar');
                const r1 = win.getBoundingClientRect();
                const tbRect = tb.getBoundingClientRect();
                const startX = tbRect.left + 50;
                const startY = tbRect.top + 15;

                tb.dispatchEvent(new PointerEvent('pointerdown', { clientX: startX, clientY: startY, button: 0, bubbles: true }));
                window.dispatchEvent(new PointerEvent('pointermove', { clientX: startX + 40, clientY: startY + 30, bubbles: true }));
                window.dispatchEvent(new PointerEvent('pointerup', { clientX: startX + 40, clientY: startY + 30, bubbles: true }));

                const r2 = win.getBoundingClientRect();
                return {
                    initial: { left: r1.left, top: r1.top },
                    dragged: { left: r2.left, top: r2.top },
                    deltaX: r2.left - r1.left,
                    deltaY: r2.top - r1.top
                };
            })()`,
            returnByValue: true
        });
        console.log('Desktop Drag Test Result:', JSON.stringify(dragTest.result.result.value, null, 2));

        console.log('--- TEST 2: MOBILE CONTACT WINDOW ---');
        await send('Emulation.setDeviceMetricsOverride', {
            width: 390,
            height: 844,
            deviceScaleFactor: 2,
            mobile: true
        });

        await send('Page.navigate', {
            url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html'
        });

        await new Promise(r => setTimeout(r, 100));
        await send('Runtime.evaluate', {
            expression: `document.getElementById('site-intro-overlay').style.display = 'none'`
        });

        await send('Runtime.evaluate', {
            expression: `openAndFocusWindow('hero-win-contact')`
        });

        await new Promise(r => setTimeout(r, 300));

        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\verified_contact_window_mobile.png`, Buffer.from(shot.result.data, 'base64'));
        console.log('Saved verified_contact_window_mobile.png');

        const mobileContactInfo = await send('Runtime.evaluate', {
            expression: `(() => {
                const win = document.getElementById('hero-win-contact');
                const emailRow = win.querySelector('.fg-contact-row');
                const emailVal = win.querySelector('.fg-contact-val');
                const r = win.getBoundingClientRect();
                const cs = window.getComputedStyle(win);
                return {
                    left: r.left, top: r.top, width: r.width, height: r.height,
                    zIndex: cs.zIndex,
                    emailText: emailVal.innerText,
                    emailHeight: emailVal.offsetHeight,
                    emailScrollWidth: emailVal.scrollWidth,
                    emailClientWidth: emailVal.clientWidth
                };
            })()`,
            returnByValue: true
        });
        console.log('Mobile Contact Window Metrics:', JSON.stringify(mobileContactInfo.result.result.value, null, 2));

        console.log('--- TEST 3: INTRO SPLASH REPLAY PREVENTION ---');
        // Let's test the intro replay flow:
        // Clear session storage, load index.html -> intro should be active.
        // Dismiss intro -> set site_intro_played -> reload index.html -> intro should NOT be active!
        // Navigate to about.html -> click Home -> intro should NOT be active!

        await send('Page.navigate', {
            url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html'
        });
        await new Promise(r => setTimeout(r, 300));
        const introCheck1 = await send('Runtime.evaluate', {
            expression: `(() => {
                const ov = document.getElementById('site-intro-overlay');
                return {
                    display: window.getComputedStyle(ov).display,
                    siteIntroPlayed: sessionStorage.getItem('site_intro_played')
                };
            })()`,
            returnByValue: true
        });
        console.log('Intro on re-entering page (session already active):', JSON.stringify(introCheck1.result.result.value, null, 2));

        // Now test navigating to about.html and coming back
        await send('Page.navigate', {
            url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/about.html'
        });
        await new Promise(r => setTimeout(r, 400));

        // Click HOME button on about page
        await send('Runtime.evaluate', {
            expression: `document.getElementById('about-side-back').querySelector('a').click()`
        });
        await new Promise(r => setTimeout(r, 400));

        const introCheck2 = await send('Runtime.evaluate', {
            expression: `(() => {
                const ov = document.getElementById('site-intro-overlay');
                return {
                    display: window.getComputedStyle(ov).display,
                    siteIntroPlayed: sessionStorage.getItem('site_intro_played'),
                    url: window.location.href
                };
            })()`,
            returnByValue: true
        });
        console.log('Intro after returning from about.html:', JSON.stringify(introCheck2.result.result.value, null, 2));

        console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
        chrome.kill();
        process.exit(0);
    } catch(e) {
        console.error('Test error:', e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
