const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9377;

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

        await send('Emulation.setDeviceMetricsOverride', {
            width: 1440,
            height: 900,
            deviceScaleFactor: 1,
            mobile: false
        });

        await send('Page.navigate', {
            url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html'
        });

        await new Promise(r => setTimeout(r, 200));
        await send('Runtime.evaluate', {
            expression: `document.getElementById('site-intro-overlay').style.display = 'none'`
        });
        await new Promise(r => setTimeout(r, 200));

        // Drag Projects to left side, and contact.txt to right side
        await send('Runtime.evaluate', {
            expression: `(() => {
                const proj = document.getElementById('desktop-icon-projects');
                const contact = document.getElementById('desktop-icon-contact');

                function drag(element, dx, dy) {
                    const r = element.getBoundingClientRect();
                    const sX = r.left + r.width / 2;
                    const sY = r.top + r.height / 2;
                    element.dispatchEvent(new PointerEvent('pointerdown', { clientX: sX, clientY: sY, button: 0, bubbles: true }));
                    window.dispatchEvent(new PointerEvent('pointermove', { clientX: sX + dx, clientY: sY + dy, bubbles: true }));
                    window.dispatchEvent(new PointerEvent('pointerup', { clientX: sX + dx, clientY: sY + dy, bubbles: true }));
                }

                // Move Projects 220px to left, 30px down
                drag(proj, -220, 30);
                // Move contact.txt 180px to right, 50px down
                drag(contact, 180, 50);
            })()`
        });

        await new Promise(r => setTimeout(r, 250));

        // Screenshot Light Theme
        const lightShot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\verified_dragged_light.png', Buffer.from(lightShot.result.data, 'base64'));

        // Toggle Dark Theme
        await send('Runtime.evaluate', {
            expression: `document.body.classList.add('dark-theme')`
        });
        await new Promise(r => setTimeout(r, 150));

        // Screenshot Dark Theme
        const darkShot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\verified_dragged_dark.png', Buffer.from(darkShot.result.data, 'base64'));

        console.log('Visual screenshots created successfully');
        chrome.kill();
        process.exit(0);
    } catch(e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
