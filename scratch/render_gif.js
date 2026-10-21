const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9351',
    '--disable-gpu',
    'about:blank'
]);

setTimeout(async () => {
    try {
        const targets = await new Promise((res, rej) => http.get('http://127.0.0.1:9351/json', r => {
            let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
        }).on('error', rej));
        const target = targets.find(t => t.type === 'page');
        const ws = new WebSocket(target.webSocketDebuggerUrl);
        let id = 1; const pending = new Map();
        ws.addEventListener('message', e => {
            const data = JSON.parse(e.data);
            if (data.id && pending.has(data.id)) { pending.get(data.id)(data); pending.delete(data.id); }
        });
        const send = (m, p = {}) => new Promise(r => { const i = id++; pending.set(i, r); ws.send(JSON.stringify({id: i, method: m, params: p})); });
        await new Promise(r => ws.addEventListener('open', r, { once: true }));

        await send('Emulation.setDeviceMetricsOverride', { width: 1432, height: 236, deviceScaleFactor: 1, mobile: false });

        // Build HTML that generates 3D text with layers for extrusion, exactly like 3D Virgil Abloh text
        const html = `<!DOCTYPE html>
<html>
<head>
<style>
    * { box-sizing: border-box; }
    body {
        margin: 0;
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 236px;
        overflow: hidden;
    }
    .scene {
        perspective: 1600px;
        perspective-origin: 50% 50%;
    }
    .obj-3d {
        position: relative;
        transform-style: preserve-3d;
        width: 1400px;
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .layer {
        position: absolute;
        font-family: 'Helvetica Neue', Helvetica, 'Arial Black', Arial, sans-serif;
        font-weight: 900;
        font-size: 130px;
        letter-spacing: -0.04em;
        color: #000000;
        white-space: nowrap;
        user-select: none;
        -webkit-font-smoothing: antialiased;
    }
</style>
</head>
<body>
    <div class="scene">
        <div class="obj-3d" id="obj"></div>
    </div>
    <script>
        const obj = document.getElementById('obj');
        const text = 'Lorenzo Kraja™';
        // 24 extruded layers from Z = -12px to +12px for solid 3D depth
        const layers = 24;
        const depth = 24;
        for (let i = 0; i < layers; i++) {
            const el = document.createElement('div');
            el.className = 'layer';
            el.textContent = text;
            const z = (i - layers / 2) * (depth / layers);
            el.style.transform = 'translateZ(' + z + 'px)';
            obj.appendChild(el);
        }
        window.setAngle = function(deg) {
            obj.style.transform = 'rotateY(' + deg + 'deg)';
        };
    </script>
</body>
</html>`;

        await send('Page.navigate', { url: 'data:text/html;charset=utf-8,' + encodeURIComponent(html) });
        await new Promise(r => setTimeout(r, 600));

        // Test frame at 40 degrees
        await send('Runtime.evaluate', { expression: 'window.setAngle(40)' });
        await new Promise(r => setTimeout(r, 50));

        let shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('assets/test_3d_frame40.png', Buffer.from(shot.result.data, 'base64'));
        console.log('Saved test_3d_frame40.png');

        chrome.kill();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        chrome.kill();
        process.exit(1);
    }
}, 800);
