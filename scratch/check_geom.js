const { spawn } = require('child_process');
const http = require('http');

const port = 9381;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--disable-gpu',
    'about:blank'
]);

setTimeout(async () => {
    try {
        const getJSON = (url) => new Promise(r => http.get(url, res => { let d=''; res.on('data', c=>d+=c); res.on('end', ()=>r(JSON.parse(d))); }));
        const targets = await getJSON('http://127.0.0.1:' + port + '/json');
        const target = targets.find(t => t.type === 'page');
        const ws = new WebSocket(target.webSocketDebuggerUrl);
        await new Promise(r => ws.addEventListener('open', r, { once: true }));

        let id = 1;
        const send = (method, params = {}) => new Promise(r => {
            const curId = id++;
            const l = (e) => { const d = JSON.parse(e.data); if (d.id === curId) { ws.removeEventListener('message', l); r(d); } };
            ws.addEventListener('message', l);
            ws.send(JSON.stringify({ id: curId, method, params }));
        });

        await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 950, deviceScaleFactor: 1, mobile: false });
        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html' });
        await new Promise(r => setTimeout(r, 1600));

        const res = await send('Runtime.evaluate', {
            expression: `JSON.stringify((() => {
                const hw = document.querySelector('.fg-hero-windows');
                const pw = document.getElementById('hero-win-projects');
                const vw = document.getElementById('hero-win-vlc');
                return {
                    containerWidth: hw ? hw.offsetWidth : null,
                    pwWidth: pw ? pw.offsetWidth : null,
                    vwWidth: vw ? vw.offsetWidth : null,
                    pwRect: pw ? pw.getBoundingClientRect() : null,
                    vwRect: vw ? vw.getBoundingClientRect() : null,
                    pwComputedWidth: pw ? getComputedStyle(pw).width : null,
                    vwComputedWidth: vw ? getComputedStyle(vw).width : null
                };
            })())`
        });

        console.log('Geometry:', JSON.parse(res.result.result.value));
        ws.close(); chrome.kill(); process.exit(0);
    } catch(e) { console.error(e); chrome.kill(); process.exit(1); }
}, 1200);
