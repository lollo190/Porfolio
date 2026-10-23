const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9398;
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

        // Set desktop resolution 1440x900
        await send('Emulation.setDeviceMetricsOverride', {
            width: 1440,
            height: 900,
            deviceScaleFactor: 1,
            mobile: false
        });

        const url = 'file:///c:/Users/lory/Desktop/Sito%20Portfolio/about.html';
        await send('Page.navigate', { url });

        // Wait for animation opening sequence (cv @ 40ms, contact @ 140ms, projects @ 280ms)
        await new Promise(r => setTimeout(r, 900));

        // Evaluate window states
        const checkExpr = `
            (() => {
                const keys = ['cv', 'projects', 'contact', 'reel'];
                const status = {};
                keys.forEach(k => {
                    const el = document.getElementById('kali-win-' + k);
                    const tab = document.getElementById('tab-' + k);
                    if (!el) return;
                    const r = el.getBoundingClientRect();
                    const handles = Array.from(el.querySelectorAll('.kali-resize-handle')).map(h => h.dataset.dir);
                    status[k] = {
                        isOpen: !el.classList.contains('is-closed') && !el.classList.contains('is-minimized'),
                        isFocused: el.classList.contains('is-focused'),
                        tabVisible: tab ? tab.style.display !== 'none' : false,
                        rect: { left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) },
                        handlesCount: handles.length,
                        handles: handles
                    };
                });
                return status;
            })()
        `;

        const checkRes = await send('Runtime.evaluate', { expression: checkExpr, returnByValue: true });
        console.log('Window States on Load:', JSON.stringify(checkRes.result.result.value, null, 2));

        // Capture initial composition screenshot
        const shot1 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(artDir + '\\about_triptych_composition.png', Buffer.from(shot1.result.data, 'base64'));
        console.log('Saved about_triptych_composition.png');

        // Test resizing: Let's resize the contact window via its SE corner handle!
        console.log('--- Testing Resize on contact window SE handle ---');
        const resizeHandleExpr = `
            (() => {
                const win = document.getElementById('kali-win-contact');
                const handle = win.querySelector('.kali-resize-se');
                const hr = handle.getBoundingClientRect();
                return {
                    centerX: hr.left + hr.width / 2,
                    centerY: hr.top + hr.height / 2
                };
            })()
        `;
        const handlePos = (await send('Runtime.evaluate', { expression: resizeHandleExpr, returnByValue: true })).result.result.value;

        // Pointerdown on SE handle
        await send('Input.dispatchMouseEvent', {
            type: 'mousePressed',
            x: handlePos.centerX,
            y: handlePos.centerY,
            button: 'left',
            clickCount: 1
        });

        // Drag 60px right, 50px down
        await send('Input.dispatchMouseEvent', {
            type: 'mouseMoved',
            x: handlePos.centerX + 60,
            y: handlePos.centerY + 50
        });

        // Release mouse
        await send('Input.dispatchMouseEvent', {
            type: 'mouseReleased',
            x: handlePos.centerX + 60,
            y: handlePos.centerY + 50,
            button: 'left'
        });

        await new Promise(r => setTimeout(r, 200));

        // Check resized dimensions
        const postResizeExpr = `
            (() => {
                const win = document.getElementById('kali-win-contact');
                const r = win.getBoundingClientRect();
                return { left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) };
            })()
        `;
        const postResize = (await send('Runtime.evaluate', { expression: postResizeExpr, returnByValue: true })).result.result.value;
        console.log('Contact Window Rect after SE Drag (+60w, +50h):', postResize);

        // Test resizing on Archive (projects) NW corner handle (adjusts top/left/w/h)
        console.log('--- Testing Resize on Archive window NW handle ---');
        const nwHandleExpr = `
            (() => {
                const win = document.getElementById('kali-win-projects');
                const handle = win.querySelector('.kali-resize-nw');
                const hr = handle.getBoundingClientRect();
                return {
                    centerX: hr.left + hr.width / 2,
                    centerY: hr.top + hr.height / 2
                };
            })()
        `;
        const nwPos = (await send('Runtime.evaluate', { expression: nwHandleExpr, returnByValue: true })).result.result.value;

        await send('Input.dispatchMouseEvent', {
            type: 'mousePressed',
            x: nwPos.centerX,
            y: nwPos.centerY,
            button: 'left',
            clickCount: 1
        });

        // Drag 30px left, 15px down
        await send('Input.dispatchMouseEvent', {
            type: 'mouseMoved',
            x: nwPos.centerX - 30,
            y: nwPos.centerY + 15
        });

        await send('Input.dispatchMouseEvent', {
            type: 'mouseReleased',
            x: nwPos.centerX - 30,
            y: nwPos.centerY + 15,
            button: 'left'
        });

        await new Promise(r => setTimeout(r, 200));

        const postNw = (await send('Runtime.evaluate', {
            expression: `(() => {
                const r = document.getElementById('kali-win-projects').getBoundingClientRect();
                return { left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) };
            })()`,
            returnByValue: true
        })).result.result.value;
        console.log('Archive Window Rect after NW Drag:', postNw);

        // Capture resized state
        const shot2 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(artDir + '\\about_windows_resized.png', Buffer.from(shot2.result.data, 'base64'));
        console.log('Saved about_windows_resized.png');

        // Toggle dark mode and take screenshot
        await send('Runtime.evaluate', { expression: `document.getElementById('theme-toggle').click();` });
        await new Promise(r => setTimeout(r, 300));
        const shot3 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(artDir + '\\about_triptych_dark.png', Buffer.from(shot3.result.data, 'base64'));
        console.log('Saved about_triptych_dark.png');

        ws.close();
        chrome.kill();
        process.exit(0);
    } catch(err) {
        console.error(err);
        chrome.kill();
        process.exit(1);
    }
}, 1000);
