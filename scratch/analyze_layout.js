const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9396;
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

        const imgPath = 'file:///C:/Users/lory/.gemini/antigravity/brain/180e8f8a-f0bc-44a9-8e86-be276ad1a9dc/.user_uploaded/media_1792686861795_7b7199ba.png';
        await send('Page.navigate', { url: imgPath });
        await new Promise(r => setTimeout(r, 600));

        const expr = `
            (() => {
                const img = document.querySelector('img');
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const idata = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = idata.data;
                const w = canvas.width;
                const h = canvas.height;

                function getPixel(x, y) {
                    if (x < 0 || x >= w || y < 0 || y >= h) return [0,0,0];
                    const idx = (Math.floor(y) * w + Math.floor(x)) * 4;
                    return [data[idx], data[idx+1], data[idx+2]];
                }

                // Traffic lights are at x=win.left + ~14, y=win.top + ~10 roughly.
                // In Kali titlebars:
                // traffic light red button center is ~18px from left, ~15px from top.
                function findWindowBounds(redX, redY) {
                    let top = redY;
                    while (top > 0) {
                        const [r, g, b] = getPixel(redX, top - 1);
                        if (r < 180 || r > 245) break;
                        top--;
                    }
                    let left = redX;
                    while (left > 0) {
                        const [r, g, b] = getPixel(left - 1, redY);
                        if (r < 180 || r > 245) break;
                        left--;
                    }
                    let right = redX + 50;
                    while (right < w) {
                        const [r, g, b] = getPixel(right + 1, redY);
                        if (r < 190 && getPixel(right + 5, redY)[0] < 190) break;
                        right++;
                    }
                    let bottom = redY + 50;
                    while (bottom < h) {
                        const [r, g, b] = getPixel(left + 50, bottom + 1);
                        if (r < 180 && getPixel(left + 50, bottom + 5)[0] < 180) break;
                        bottom++;
                    }
                    return { left, top, right, bottom, width: right - left, height: bottom - top };
                }

                return {
                    imgW: w,
                    imgH: h,
                    win_contact: findWindowBounds(58, 188),
                    win_archive: findWindowBounds(297, 54),
                    win_cv: findWindowBounds(737, 100)
                };
            })()
        `;

        const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
        console.log('Detected Bounds:', JSON.stringify(res.result.result.value, null, 2));

        ws.close();
        chrome.kill();
        process.exit(0);
    } catch(err) {
        console.error(err);
        chrome.kill();
        process.exit(1);
    }
}, 1000);
