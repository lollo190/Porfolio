const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const httpPort = 9489;
const chromePort = 9490;

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
            const targetsRes = await fetch(`http://127.0.0.1:${chromePort}/json`);
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
            await send('DOM.enable');
            await send('CSS.enable');
            await send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/index.html` });

            await new Promise(r => setTimeout(r, 2000));

            const doc = await send('DOM.getDocument');
            const winNode = await send('DOM.querySelector', { nodeId: doc.result.root.nodeId, selector: '#project-win-0' });
            const contentNode = await send('DOM.querySelector', { nodeId: doc.result.root.nodeId, selector: '#project-win-0 .fg-hero-window-content' });

            const winStyles = await send('CSS.getMatchedStylesForNode', { nodeId: winNode.result.nodeId });
            const contentStyles = await send('CSS.getMatchedStylesForNode', { nodeId: contentNode.result.nodeId });

            console.log('--- WIN MATCHED RULES ---');
            winStyles.result.matchedCSSRules.forEach(r => {
                const heightProp = r.rule.style.cssProperties.find(p => p.name === 'height' || p.name === 'position' || p.name === 'overflow');
                if (heightProp) {
                    console.log(r.rule.selectorList.text, '->', heightProp.name + ':', heightProp.value);
                }
            });

            console.log('--- CONTENT MATCHED RULES ---');
            contentStyles.result.matchedCSSRules.forEach(r => {
                const p = r.rule.style.cssProperties.filter(p => p.name.includes('height') || p.name.includes('aspect') || p.name.includes('flex'));
                if (p.length) {
                    console.log(r.rule.selectorList.text, '->', p.map(x => x.name + ':' + x.value).join('; '));
                }
            });

            chrome.kill();
            server.close();
            process.exit(0);
        } catch (e) {
            console.error(e);
            chrome.kill();
            server.close();
            process.exit(1);
        }
    }, 1200);
});
