const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9368;
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

        await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html' });
        await new Promise(r => setTimeout(r, 1500));

        // 1. Verify Structure: Windows, Removal of old main / reel
        const checkStructure = await send('Runtime.evaluate', {
            expression: `(() => {
                const mainEl = document.querySelector('#app > main');
                const oldReel = document.querySelector('.nb-reel-fullscreen');
                const win0 = document.getElementById('hero-win-0');
                const win1 = document.getElementById('hero-win-1');
                const win2 = document.getElementById('hero-win-2');
                const vlc = document.getElementById('hero-win-vlc');
                const contact = document.getElementById('hero-win-contact');
                const bottomBar = document.querySelector('.fg-desktop-bottom-bar');

                return {
                    hasOldMain: !!mainEl,
                    hasOldReel: !!oldReel,
                    hasWin0: !!win0,
                    hasWin1: !!win1,
                    hasWin2: !!win2,
                    hasVlc: !!vlc,
                    hasContact: !!contact,
                    hasBottomBar: !!bottomBar,
                    vlcVideoSrc: vlc ? vlc.querySelector('video')?.src : null,
                    vlcTitle: vlc ? vlc.querySelector('.vlc-title-text')?.textContent : null,
                    vlcHasScrubber: !!vlc?.querySelector('.vlc-scrubber'),
                    vlcHasTime: !!vlc?.querySelector('.vlc-time-current')
                };
            })()`,
            returnByValue: true
        });

        console.log('--- Structure Check ---');
        console.log(JSON.stringify(checkStructure.result.result.value, null, 2));

        // Screenshot 1: Desktop Overview
        const ss1 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}/desktop_overview.png`, Buffer.from(ss1.result.data, 'base64'));
        console.log('Saved desktop_overview.png');

        // 2. Test VLC Video & Controls
        const vlcTest = await send('Runtime.evaluate', {
            expression: `(() => {
                const vlc = document.getElementById('hero-win-vlc');
                const vid = vlc.querySelector('video');
                const playBtn = vlc.querySelector('.vlc-btn-play');
                const scrubber = vlc.querySelector('.vlc-scrubber');
                const prev = vlc.querySelector('.vlc-btn-prev');
                const next = vlc.querySelector('.vlc-btn-next');
                const time = vlc.querySelector('.vlc-time-current');

                // Simulate play click
                playBtn.click();
                const pausedAfterClick = vid.paused;

                // Simulate next click
                next.click();

                return {
                    paused: vid.paused,
                    currentTime: vid.currentTime,
                    duration: vid.duration,
                    volume: vid.volume,
                    muted: vid.muted,
                    timeText: time.textContent
                };
            })()`,
            returnByValue: true
        });
        console.log('--- VLC Test ---');
        console.log(JSON.stringify(vlcTest.result.result.value, null, 2));

        // 3. Test Project Windows Carousel & Info
        const projTest = await send('Runtime.evaluate', {
            expression: `(() => {
                const win0 = document.getElementById('hero-win-0');
                const nextBtn = win0.querySelector('.fg-win-next-btn');
                const img = win0.querySelector('.fg-win-main-img');
                const counter = win0.querySelector('.fg-cur-idx');
                const infoBtn = win0.querySelector('.fg-win-info-btn');
                const drawer = win0.querySelector('.fg-win-info-drawer');

                const initialSrc = img.src;
                const initialCount = counter.textContent;

                // Click next image
                nextBtn.click();
                const nextSrc = img.src;
                const nextCount = counter.textContent;

                // Click Info
                infoBtn.click();
                const drawerOpen = drawer.classList.contains('is-open');

                return {
                    initialSrc,
                    initialCount,
                    nextSrc,
                    nextCount,
                    drawerOpen
                };
            })()`,
            returnByValue: true
        });
        console.log('--- Project Carousel & Drawer Test ---');
        console.log(JSON.stringify(projTest.result.result.value, null, 2));

        // 4. Test TOC clicking 2. CONTACT
        await send('Runtime.evaluate', {
            expression: `(() => {
                const contactTrigger = document.querySelector('[data-target="hero-win-contact"]');
                contactTrigger.click();
            })()`
        });
        await new Promise(r => setTimeout(r, 600));

        const contactTest = await send('Runtime.evaluate', {
            expression: `(() => {
                const contact = document.getElementById('hero-win-contact');
                return {
                    isClosed: contact.classList.contains('is-closed'),
                    isFocused: contact.classList.contains('is-focused'),
                    zIndex: contact.style.zIndex
                };
            })()`,
            returnByValue: true
        });
        console.log('--- Contact Window Trigger Test ---');
        console.log(JSON.stringify(contactTest.result.result.value, null, 2));

        // Screenshot 2: Contact Window Opened
        const ss2 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}/desktop_contact_open.png`, Buffer.from(ss2.result.data, 'base64'));
        console.log('Saved desktop_contact_open.png');

        // 5. Test VLC Window Dragging & Resizing
        await send('Runtime.evaluate', {
            expression: `(() => {
                const vlc = document.getElementById('hero-win-vlc');
                const titlebar = vlc.querySelector('.kali-titlebar');
                const grip = vlc.querySelector('.kali-resize-grip');

                // Simulate drag
                titlebar.dispatchEvent(new PointerEvent('pointerdown', { clientX: 700, clientY: 450, pointerId: 1, bubbles: true }));
                titlebar.dispatchEvent(new PointerEvent('pointermove', { clientX: 620, clientY: 400, pointerId: 1, bubbles: true }));
                titlebar.dispatchEvent(new PointerEvent('pointerup', { clientX: 620, clientY: 400, pointerId: 1, bubbles: true }));

                // Simulate resize via grip
                grip.dispatchEvent(new PointerEvent('pointerdown', { clientX: 1100, clientY: 800, pointerId: 2, bubbles: true }));
                grip.dispatchEvent(new PointerEvent('pointermove', { clientX: 1200, clientY: 880, pointerId: 2, bubbles: true }));
                grip.dispatchEvent(new PointerEvent('pointerup', { clientX: 1200, clientY: 880, pointerId: 2, bubbles: true }));

                return {
                    vlcTransform: vlc.style.transform,
                    vlcWidth: vlc.style.width,
                    vlcHeight: vlc.style.height
                };
            })()`,
            returnByValue: true
        });

        // Screenshot 3: After Drag & Resize
        const ss3 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}/desktop_drag_resize.png`, Buffer.from(ss3.result.data, 'base64'));
        console.log('Saved desktop_drag_resize.png');

        chrome.kill();
        process.exit(0);
    } catch (err) {
        console.error('Error during test:', err);
        chrome.kill();
        process.exit(1);
    }
}, 1000);
