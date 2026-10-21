const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9363;
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

        await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html' });
        await new Promise(r => setTimeout(r, 1200));

        // 1. Check Default Dimensions (+20%)
        let dims = await send('Runtime.evaluate', {
            expression: `(() => {
                const left = document.querySelector('.fg-hero-window-left');
                const right = document.querySelector('.fg-hero-window-right');
                const leftContent = left.querySelector('.fg-hero-window-content');
                const rightContent = right.querySelector('.fg-hero-window-content');
                return JSON.stringify({
                    left: { width: left.offsetWidth, height: left.offsetHeight, contentH: leftContent.offsetHeight },
                    right: { width: right.offsetWidth, height: right.offsetHeight, contentH: rightContent.offsetHeight }
                });
            })()`
        });
        console.log('DEFAULT WINDOW DIMENSIONS (+20%):', JSON.parse(dims.result.result.value));

        let shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\test_windows_default.png`, Buffer.from(shot.result.data, 'base64'));

        // 2. Drag Test on Left Window
        await send('Runtime.evaluate', {
            expression: `(() => {
                const win = document.querySelector('.fg-hero-window-left');
                const tb = win.querySelector('.kali-titlebar');
                const rect = tb.getBoundingClientRect();
                
                // Dispatch pointerdown
                tb.dispatchEvent(new PointerEvent('pointerdown', {
                    bubbles: true, cancelable: true, clientX: rect.left + 50, clientY: rect.top + 15, pointerId: 1
                }));
                // Dispatch pointermove (+80px X, -40px Y)
                tb.dispatchEvent(new PointerEvent('pointermove', {
                    bubbles: true, cancelable: true, clientX: rect.left + 130, clientY: rect.top - 25, pointerId: 1
                }));
                // Dispatch pointerup
                tb.dispatchEvent(new PointerEvent('pointerup', {
                    bubbles: true, cancelable: true, clientX: rect.left + 130, clientY: rect.top - 25, pointerId: 1
                }));

                return JSON.stringify({
                    transform: win.style.transform,
                    zIndex: win.style.zIndex
                });
            })()`
        });
        console.log('DRAG TEST RESULT: Left window dragged!');

        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\test_drag_result.png`, Buffer.from(shot.result.data, 'base64'));

        // 3. Resize Test on Right Window (SE corner grip)
        await send('Runtime.evaluate', {
            expression: `(() => {
                const win = document.querySelector('.fg-hero-window-right');
                const grip = win.querySelector('.kali-resize-grip') || win.querySelector('.fg-resize-se');
                const rect = grip.getBoundingClientRect();

                grip.dispatchEvent(new PointerEvent('pointerdown', {
                    bubbles: true, cancelable: true, clientX: rect.left + 4, clientY: rect.top + 4, pointerId: 2
                }));
                grip.dispatchEvent(new PointerEvent('pointermove', {
                    bubbles: true, cancelable: true, clientX: rect.left + 120, clientY: rect.top + 90, pointerId: 2
                }));
                grip.dispatchEvent(new PointerEvent('pointerup', {
                    bubbles: true, cancelable: true, clientX: rect.left + 120, clientY: rect.top + 90, pointerId: 2
                }));

                return JSON.stringify({
                    width: win.style.width,
                    height: win.style.height
                });
            })()`
        });
        console.log('RESIZE TEST RESULT: Right window resized!');

        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\test_resize_result.png`, Buffer.from(shot.result.data, 'base64'));

        console.log('ALL INTERACTIVE WINDOW TESTS COMPLETED!');
        chrome.kill();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        chrome.kill();
        process.exit(1);
    }
}, 800);
