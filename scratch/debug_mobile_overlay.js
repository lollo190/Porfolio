const { spawn } = require('child_process');
const http = require('http');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9361;

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
            width: 390,
            height: 844,
            deviceScaleFactor: 2,
            mobile: true
        });

        await send('Page.navigate', {
            url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html'
        });

        await new Promise(r => setTimeout(r, 400));

        const res = await send('Runtime.evaluate', {
            expression: `(() => {
                const ov = document.getElementById('site-intro-overlay');
                const ovRect = ov.getBoundingClientRect();
                const grain = ov.querySelector('.intro-film-grain');
                const grainRect = grain ? grain.getBoundingClientRect() : null;
                const bodyW = document.body.scrollWidth;
                const winW = window.innerWidth;
                
                // Find elements causing horizontal overflow if any
                const overflowing = [];
                for (let el of document.querySelectorAll('*')) {
                    const r = el.getBoundingClientRect();
                    if (r.right > winW + 5) {
                        overflowing.push({ tag: el.tagName, class: el.className, right: r.right, width: r.width });
                    }
                }

                return {
                    winW,
                    bodyW,
                    ovRect: { left: ovRect.left, top: ovRect.top, width: ovRect.width, height: ovRect.height, right: ovRect.right },
                    grainRect: grainRect ? { left: grainRect.left, top: grainRect.top, width: grainRect.width, height: grainRect.height } : null,
                    overflowingCount: overflowing.length,
                    topOverflowing: overflowing.slice(0, 5)
                };
            })()`,
            returnByValue: true
        });

        console.log('Result:', JSON.stringify(res.result.result.value, null, 2));
        chrome.kill();
        process.exit(0);
    } catch(e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
