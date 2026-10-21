const { spawn } = require('child_process');
const http = require('http');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9398;

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

        await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 950, deviceScaleFactor: 1, mobile: false });
        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html' });
        await new Promise(r => setTimeout(r, 1600));

        // Click the side about button
        const clickResult = await send('Runtime.evaluate', {
            expression: `(() => {
                const btn = document.querySelector('.fg-side-about a') || document.querySelector('.fg-bottom-center-about a');
                if (!btn) return { error: 'Button not found' };
                btn.click();
                return {
                    hudVisible: document.querySelector('.macos-spaces-hud')?.classList.contains('is-visible'),
                    vtDirection: document.documentElement.dataset.vtDirection,
                    storedTransition: sessionStorage.getItem('macos_space_transition')
                };
            })()`,
            returnByValue: true
        });

        console.log("Click Transition Test:", JSON.stringify(clickResult.result.result ? clickResult.result.result.value : clickResult.result, null, 2));

        chrome.kill();
        process.exit(0);
    } catch (e) {
        console.error("Test Error:", e);
        chrome.kill();
        process.exit(1);
    }
}, 1500);
