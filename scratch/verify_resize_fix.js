const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9395;
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

        await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 950, deviceScaleFactor: 1, mobile: false });
        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html' });
        await new Promise(r => setTimeout(r, 1800));

        // Test resizing height and width through simulated pointer interactions
        const testRes = await send('Runtime.evaluate', {
            expression: `(() => {
                const pw = document.getElementById('hero-win-projects');
                const vw = document.getElementById('hero-win-vlc');
                const bb = document.querySelector('.fg-desktop-bottom-bar');
                const sHandle = pw.querySelector('.fg-resize-s');
                const eHandle = pw.querySelector('.fg-resize-e');

                const initialPWHeight = pw.offsetHeight;
                const initialPWWidth = pw.offsetWidth;
                const initialBBTop = bb.getBoundingClientRect().top;
                const initialVWTop = vw.getBoundingClientRect().top;
                const initialVWLeft = vw.getBoundingClientRect().left;

                // 1. Simulate pointerdown on South handle
                const pDown = new PointerEvent('pointerdown', { clientX: 200, clientY: 500, bubbles: true, pointerId: 10 });
                sHandle.dispatchEvent(pDown);

                // 2. Simulate pointermove (drag down +100px)
                const pMove = new PointerEvent('pointermove', { clientX: 200, clientY: 600, bubbles: true, pointerId: 10 });
                sHandle.dispatchEvent(pMove);

                // Read values during vertical resize
                const duringPWHeight = pw.offsetHeight;
                const duringBBTop = bb.getBoundingClientRect().top;
                const duringVWTop = vw.getBoundingClientRect().top;

                // 3. Simulate pointerup
                const pUp = new PointerEvent('pointerup', { clientX: 200, clientY: 600, bubbles: true, pointerId: 10 });
                sHandle.dispatchEvent(pUp);

                // 4. Simulate pointerdown on East handle and drag wider +80px
                const pDownE = new PointerEvent('pointerdown', { clientX: 700, clientY: 300, bubbles: true, pointerId: 11 });
                eHandle.dispatchEvent(pDownE);

                const pMoveE = new PointerEvent('pointermove', { clientX: 780, clientY: 300, bubbles: true, pointerId: 11 });
                eHandle.dispatchEvent(pMoveE);

                const duringPWWidth = pw.offsetWidth;
                const duringVWLeft = vw.getBoundingClientRect().left;

                const pUpE = new PointerEvent('pointerup', { clientX: 780, clientY: 300, bubbles: true, pointerId: 11 });
                eHandle.dispatchEvent(pUpE);

                return {
                    initialPWHeight,
                    duringPWHeight,
                    pwHeightGrewBy: duringPWHeight - initialPWHeight,
                    initialBBTop,
                    duringBBTop,
                    bottomBarShift: Math.round(duringBBTop - initialBBTop),
                    initialVWTop,
                    duringVWTop,
                    vlcTopShift: Math.round(duringVWTop - initialVWTop),
                    initialPWWidth,
                    duringPWWidth,
                    pwWidthGrewBy: duringPWWidth - initialPWWidth,
                    initialVWLeft,
                    duringVWLeft,
                    vlcLeftShift: Math.round(duringVWLeft - initialVWLeft)
                };
            })()`,
            returnByValue: true
        });

        console.log('--- Resizing Verification Results ---');
        console.log(JSON.stringify(getVal(testRes), null, 2));

        const snap = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artDir, 'resize_verified.png'), Buffer.from(snap.result.data, 'base64'));
        console.log('Saved screenshot: resize_verified.png');

        ws.close();
        chrome.kill();
        process.exit(0);
    } catch (err) {
        console.error(err);
        chrome.kill();
        process.exit(1);
    }
}, 1200);
