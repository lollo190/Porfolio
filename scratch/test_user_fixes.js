const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9400;
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

        // 1. Initial Desktop Load (1440x950)
        await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 950, deviceScaleFactor: 1, mobile: false });
        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html' });
        await new Promise(r => setTimeout(r, 1600));

        // Evaluate window layout & bottom navbar transparency
        const initialCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                const pWin = document.getElementById('hero-win-projects');
                const vWin = document.getElementById('hero-win-vlc');
                const bBar = document.querySelector('.fg-desktop-bottom-bar');
                const vVideo = vWin.querySelector('video');
                const vContainer = vWin.querySelector('.vlc-video-container');

                const pRect = pWin.getBoundingClientRect();
                const vRect = vWin.getBoundingClientRect();
                const bStyle = window.getComputedStyle(bBar);
                const vVideoStyle = window.getComputedStyle(vVideo);
                const vContainerStyle = window.getComputedStyle(vContainer);

                return {
                    projects: {
                        left: pRect.left,
                        top: pRect.top,
                        width: pRect.width,
                        height: pRect.height
                    },
                    vlc: {
                        left: vRect.left,
                        top: vRect.top,
                        width: vRect.width,
                        height: vRect.height,
                        videoObjectFit: vVideoStyle.objectFit,
                        videoBg: vVideoStyle.backgroundColor,
                        containerBg: vContainerStyle.backgroundColor
                    },
                    gapBetweenWindows: vRect.left - pRect.right,
                    bottomBar: {
                        background: bStyle.backgroundColor,
                        borderTop: bStyle.borderTop,
                        backdropFilter: bStyle.backdropFilter
                    }
                };
            })()`,
            returnByValue: true
        });

        console.log("INITIAL LAYOUT & TRANSPARENCY CHECK:", JSON.stringify(getVal(initialCheck), null, 2));

        const scr1 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artDir, 'test_windows_balanced.png'), Buffer.from(scr1.result.data, 'base64'));

        // 2. Corner Resizing Test via Mouse Emulation
        // Let's test SE corner of Projects
        const pWinHandles = await send('Runtime.evaluate', {
            expression: `(() => {
                const pWin = document.getElementById('hero-win-projects');
                const se = pWin.querySelector('.fg-resize-se');
                const sw = pWin.querySelector('.fg-resize-sw');
                const ne = pWin.querySelector('.fg-resize-ne');
                const nw = pWin.querySelector('.fg-resize-nw');
                return {
                    hasAllCorners: !!(se && sw && ne && nw),
                    seRect: se.getBoundingClientRect(),
                    initialWidth: pWin.offsetWidth,
                    initialHeight: pWin.offsetHeight
                };
            })()`,
            returnByValue: true
        });

        console.log("Projects Handles Check:", JSON.stringify(getVal(pWinHandles), null, 2));

        const seInfo = getVal(pWinHandles);
        const seX = seInfo.seRect.left + seInfo.seRect.width / 2;
        const seY = seInfo.seRect.top + seInfo.seRect.height / 2;

        // Perform drag on SE handle by +60px X and +40px Y
        await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: seX, y: seY, button: 'left', clickCount: 1 });
        for (let i = 1; i <= 6; i++) {
            await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: seX + i * 10, y: seY + i * 7, button: 'left' });
            await new Promise(r => setTimeout(r, 25));
        }
        await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: seX + 60, y: seY + 42, button: 'left' });
        await new Promise(r => setTimeout(r, 300));

        const pWinResized = await send('Runtime.evaluate', {
            expression: `(() => {
                const pWin = document.getElementById('hero-win-projects');
                return {
                    newWidth: pWin.offsetWidth,
                    newHeight: pWin.offsetHeight,
                    increasedW: pWin.offsetWidth > ${seInfo.initialWidth},
                    increasedH: pWin.offsetHeight > ${seInfo.initialHeight}
                };
            })()`,
            returnByValue: true
        });

        console.log("Projects SE Resize Result:", JSON.stringify(getVal(pWinResized), null, 2));

        // Test VLC SW handle (bottom-left)
        const vlcSwCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                const vWin = document.getElementById('hero-win-vlc');
                const sw = vWin.querySelector('.fg-resize-sw');
                const swRect = sw.getBoundingClientRect();
                return {
                    initialW: vWin.offsetWidth,
                    initialH: vWin.offsetHeight,
                    initialLeft: vWin.getBoundingClientRect().left,
                    swX: swRect.left + swRect.width / 2,
                    swY: swRect.top + swRect.height / 2
                };
            })()`,
            returnByValue: true
        });

        const vlcSw = getVal(vlcSwCheck);
        // Drag SW handle to the LEFT by 50px and DOWN by 30px
        await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: vlcSw.swX, y: vlcSw.swY, button: 'left', clickCount: 1 });
        for (let i = 1; i <= 5; i++) {
            await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: vlcSw.swX - i * 10, y: vlcSw.swY + i * 6, button: 'left' });
            await new Promise(r => setTimeout(r, 25));
        }
        await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: vlcSw.swX - 50, y: vlcSw.swY + 30, button: 'left' });
        await new Promise(r => setTimeout(r, 300));

        const vlcSwResult = await send('Runtime.evaluate', {
            expression: `(() => {
                const vWin = document.getElementById('hero-win-vlc');
                return {
                    newW: vWin.offsetWidth,
                    newH: vWin.offsetHeight,
                    newLeft: vWin.getBoundingClientRect().left,
                    widenedLeft: vWin.offsetWidth > ${vlcSw.initialW} && vWin.getBoundingClientRect().left < ${vlcSw.initialLeft}
                };
            })()`,
            returnByValue: true
        });

        console.log("VLC SW (Bottom-Left) Resize Result:", JSON.stringify(getVal(vlcSwResult), null, 2));

        const scr2 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artDir, 'test_resize_corners.png'), Buffer.from(scr2.result.data, 'base64'));

        // 3. Two-Way Navigation Check
        // Click About button on index.html
        await send('Runtime.evaluate', {
            expression: `document.querySelector('.fg-side-about a').click();`
        });
        await new Promise(r => setTimeout(r, 1200));

        // Now on about.html: check the vice-versa button
        const aboutPageCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                const backBtn = document.getElementById('about-side-back');
                const link = backBtn ? backBtn.querySelector('a') : null;
                const rect = backBtn ? backBtn.getBoundingClientRect() : null;
                const cs = backBtn ? window.getComputedStyle(backBtn) : null;
                return {
                    url: window.location.href,
                    backBtnFound: !!backBtn,
                    text: link ? link.innerText.trim() : null,
                    position: cs ? cs.position : null,
                    top: cs ? cs.top : null,
                    right: cs ? cs.right : null,
                    rect: rect
                };
            })()`,
            returnByValue: true
        });

        console.log("About Page Vice-Versa Button Check:", JSON.stringify(getVal(aboutPageCheck), null, 2));

        const scr3 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artDir, 'about_page_vice_versa.png'), Buffer.from(scr3.result.data, 'base64'));

        // Click vice-versa back button to return to Portfolio
        await send('Runtime.evaluate', {
            expression: `document.querySelector('#about-side-back a').click();`
        });
        await new Promise(r => setTimeout(r, 1200));

        const returnCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                return {
                    url: window.location.href,
                    hudText: document.getElementById('macos-hud-text')?.innerText,
                    vtDir: document.documentElement.dataset.vtDirection
                };
            })()`,
            returnByValue: true
        });

        console.log("Returned to Portfolio Check:", JSON.stringify(getVal(returnCheck), null, 2));

        chrome.kill();
        process.exit(0);
    } catch (e) {
        console.error("Test Error:", e);
        chrome.kill();
        process.exit(1);
    }
}, 1500);
