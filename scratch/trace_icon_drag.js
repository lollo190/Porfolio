const { spawn } = require('child_process');
const http = require('http');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9375;

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
        await new Promise(r => setTimeout(r, 300));

        // Trace what happens during drag of desktop-icon-projects
        const trace = await send('Runtime.evaluate', {
            expression: `(() => {
                const icon = document.getElementById('desktop-icon-projects');
                const other = document.getElementById('desktop-icon-contact');
                
                const beforeProjects = icon.getBoundingClientRect();
                const beforeContact = other.getBoundingClientRect();

                const log = [];
                log.push({ step: 'initial', projects: { left: beforeProjects.left, top: beforeProjects.top }, contact: { left: beforeContact.left, top: beforeContact.top } });

                // Simulate pointerdown
                const startX = beforeProjects.left + 20;
                const startY = beforeProjects.top + 20;
                icon.dispatchEvent(new PointerEvent('pointerdown', { clientX: startX, clientY: startY, button: 0, bubbles: true }));

                // Move 10px
                window.dispatchEvent(new PointerEvent('pointermove', { clientX: startX + 10, clientY: startY + 10, bubbles: true }));

                const duringProjects = icon.getBoundingClientRect();
                const duringContact = other.getBoundingClientRect();
                log.push({
                    step: 'during_drag',
                    projects: { left: duringProjects.left, top: duringProjects.top, position: window.getComputedStyle(icon).position },
                    contact: { left: duringContact.left, top: duringContact.top, position: window.getComputedStyle(other).position }
                });

                // End drag
                window.dispatchEvent(new PointerEvent('pointerup', { clientX: startX + 10, clientY: startY + 10, bubbles: true }));

                const afterProjects = icon.getBoundingClientRect();
                const afterContact = other.getBoundingClientRect();
                log.push({
                    step: 'after_drag',
                    projects: { left: afterProjects.left, top: afterProjects.top, position: window.getComputedStyle(icon).position },
                    contact: { left: afterContact.left, top: afterContact.top, position: window.getComputedStyle(other).position }
                });

                // Scroll page by 100px down and see what happens to projects!
                window.scrollTo(0, 100);
                const afterScrollProjects = icon.getBoundingClientRect();
                log.push({
                    step: 'after_scroll_100px',
                    projects_viewport_top: afterScrollProjects.top,
                    comment: 'If fixed, viewport_top does not change with scroll, meaning it is pinned to screen!'
                });

                return log;
            })()`,
            returnByValue: true
        });

        console.log('Drag Trace:', JSON.stringify(trace.result.result.value, null, 2));

        chrome.kill();
        process.exit(0);
    } catch(e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
