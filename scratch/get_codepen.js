const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9371',
    '--disable-gpu',
    'about:blank'
]);

setTimeout(async () => {
    try {
        const targets = await new Promise((res, rej) => http.get('http://127.0.0.1:9371/json', r => {
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

        console.log('Navigating to CodePen...');
        await send('Page.navigate', { url: 'https://codepen.io/ooblek/pen/vYxYomx' });
        await new Promise(r => setTimeout(r, 4500));

        const res = await send('Runtime.evaluate', {
            expression: `
                JSON.stringify({
                    css: document.getElementById('css-box') ? document.getElementById('css-box').innerText : '',
                    html: document.getElementById('html-box') ? document.getElementById('html-box').innerText : '',
                    js: document.getElementById('js-box') ? document.getElementById('js-box').innerText : '',
                    initData: window._initData || null
                })
            `
        });
        
        fs.writeFileSync('scratch/codepen_data.json', res.result.result.value || '');
        console.log('Saved scratch/codepen_data.json');

        // Let's also navigate to the raw/debug view: https://codepen.io/ooblek/pen/vYxYomx.css or similar
        // Let's get outer HTML of the page
        const htmlDoc = await send('Runtime.evaluate', { expression: 'document.documentElement.outerHTML' });
        fs.writeFileSync('scratch/codepen_page.html', htmlDoc.result.result.value || '');
        console.log('Saved scratch/codepen_page.html');

        chrome.kill();
        process.exit(0);
    } catch(e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
