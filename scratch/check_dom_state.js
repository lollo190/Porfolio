const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve('.');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const httpPort = 9497;
const chromePort = 9498;

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
    let cleanUrl = req.url.split('?')[0].replace(/^\/+/, '');
    if (!cleanUrl) cleanUrl = 'index.html';
    let filePath = path.join(rootDir, cleanUrl);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(httpPort, async () => {
    const chrome = spawn(chromePath, [
        '--headless=new',
        '--remote-debugging-port=' + chromePort,
        'about:blank'
    ]);

    setTimeout(async () => {
        try {
            const targetsRes = await fetch('http://127.0.0.1:' + chromePort + '/json');
            const targets = await targetsRes.json();
            const target = targets.find(t => t.type === 'page') || targets[0];
            const ws = new WebSocket(target.webSocketDebuggerUrl);
            await new Promise(r => ws.addEventListener('open', r));

            let id = 1;
            function send(method, params) {
                return new Promise(r => {
                    const i = id++;
                    ws.addEventListener('message', function h(e) {
                        const m = JSON.parse(e.data);
                        if (m.id === i) { ws.removeEventListener('message', h); r(m); }
                    });
                    ws.send(JSON.stringify({ id: i, method, params }));
                });
            }

            await send('Page.enable');
            await send('Runtime.enable');
            await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
            await send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/harp-chair.html` });
            await new Promise(r => setTimeout(r, 1000));

            const res = await send('Runtime.evaluate', {
                expression: `(() => ({
                    brandText: document.querySelector(".nb-nav-home-text")?.innerText,
                    hasAbout: !!document.querySelector(".nb-nav-about-link"),
                    hasContact: !!document.querySelector(".nb-nav-contact-link"),
                    navBg: window.getComputedStyle(document.querySelector(".nb-top-nav")).backgroundColor,
                    navBorder: window.getComputedStyle(document.querySelector(".nb-top-nav")).borderBottomWidth,
                    platesCount: document.querySelectorAll(".fos-plate-item").length,
                    platesCodes: Array.from(document.querySelectorAll(".fos-plate-code")).map(el => el.innerText),
                    imgZIndex: window.getComputedStyle(document.querySelector(".fos-img-box img")).zIndex,
                    grainZIndex: window.getComputedStyle(document.querySelector(".film-grain")).zIndex
                }))()`,
                returnByValue: true
            });

            console.log('HARP CHAIR DOM CHECK:');
            console.log(JSON.stringify(res.result.result.value, null, 2));

            // Also check NOMOD
            await send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/nomod.html` });
            await new Promise(r => setTimeout(r, 800));
            const resNomod = await send('Runtime.evaluate', {
                expression: `(() => ({
                    brandText: document.querySelector(".nb-nav-home-text")?.innerText,
                    platesCount: document.querySelectorAll(".fos-plate-item").length,
                    platesCodes: Array.from(document.querySelectorAll(".fos-plate-code")).map(el => el.innerText)
                }))()`,
                returnByValue: true
            });
            console.log('\nNOMOD DOM CHECK:');
            console.log(JSON.stringify(resNomod.result.result.value, null, 2));

            // Also check LUCA
            await send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/luca.html` });
            await new Promise(r => setTimeout(r, 800));
            const resLuca = await send('Runtime.evaluate', {
                expression: `(() => ({
                    brandText: document.querySelector(".nb-nav-home-text")?.innerText,
                    platesCount: document.querySelectorAll(".fos-plate-item").length,
                    platesCodes: Array.from(document.querySelectorAll(".fos-plate-code")).map(el => el.innerText)
                }))()`,
                returnByValue: true
            });
            console.log('\nLUCA DOM CHECK:');
            console.log(JSON.stringify(resLuca.result.result.value, null, 2));

            chrome.kill();
            server.close();
            process.exit(0);
        } catch(e) {
            console.error(e);
            chrome.kill();
            server.close();
            process.exit(1);
        }
    }, 1000);
});
