const { spawn } = require('child_process');
const http = require('http');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9414',
    '--disable-gpu',
    'about:blank'
]);

setTimeout(async () => {
    try {
        const res = await new Promise((resolve, reject) => {
            http.get('http://127.0.0.1:9414/json', (r) => {
                let d = '';
                r.on('data', c => d += c);
                r.on('end', () => resolve(JSON.parse(d)));
            }).on('error', reject);
        });
        const target = res.find(t => t.type === 'page');
        const ws = new WebSocket(target.webSocketDebuggerUrl);
        await new Promise(r => ws.addEventListener('open', r, { once: true }));

        let id = 1;
        const pending = new Map();
        ws.addEventListener('message', e => {
            const d = JSON.parse(e.data);
            if (d.id && pending.has(d.id)) {
                pending.get(d.id)(d);
                pending.delete(d.id);
            }
        });
        function send(method, params = {}) {
            return new Promise(r => {
                const curId = id++;
                pending.set(curId, r);
                ws.send(JSON.stringify({ id: curId, method, params }));
            });
        }

        await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
        await send('Page.enable');
        await send('Runtime.enable');
        await send('Page.navigate', { url: 'https://sophiadenison.com/' });
        await new Promise(r => setTimeout(r, 4500));

        const info = await send('Runtime.evaluate', {
            expression: `
                (() => {
                    const textData = [];
                    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
                    let node;
                    while (node = walker.nextNode()) {
                        const txt = node.textContent.trim();
                        if (txt.length > 0 && (txt.includes('works') || txt.includes('DREAMSCAPE') || txt.includes('SOUND') || txt.includes('INFO') || txt.includes('SOPHIA'))) {
                            const el = node.parentElement;
                            const rect = el.getBoundingClientRect();
                            const style = window.getComputedStyle(el);
                            textData.push({
                                text: txt,
                                tag: el.tagName,
                                top: Math.round(rect.top),
                                left: Math.round(rect.left),
                                width: Math.round(rect.width),
                                height: Math.round(rect.height),
                                fontSize: style.fontSize,
                                fontFamily: style.fontFamily,
                                color: style.color
                            });
                        }
                    }

                    // Find all elements that look like the center box
                    const allEls = Array.from(document.querySelectorAll('*'));
                    const centerBoxes = allEls.filter(el => {
                        const r = el.getBoundingClientRect();
                        return r.width > 350 && r.width < 650 && r.height > 350 && r.height < 650 && r.left > 350 && r.right < 1100;
                    }).map(el => {
                        const r = el.getBoundingClientRect();
                        return {
                            tag: el.tagName,
                            className: el.className,
                            rect: { top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height) }
                        };
                    });

                    return { textData, centerBoxes: centerBoxes.slice(0, 3) };
                })()
            `,
            returnByValue: true
        });

        console.log('SOPHIA DENISON METRICS:', JSON.stringify(info.result.value, null, 2));
        chrome.kill();
        process.exit(0);
    } catch(e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 1200);
