const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9380;

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

        console.log('Navigating to index.html...');
        await send('Page.navigate', {
            url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html'
        });

        await new Promise(r => setTimeout(r, 200));
        // Dismiss intro
        await send('Runtime.evaluate', {
            expression: `document.getElementById('site-intro-overlay').style.display = 'none'`
        });
        await new Promise(r => setTimeout(r, 200));

        // 1. Check all full project buttons
        const buttonCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                const projects = document.querySelectorAll('.nb-project');
                const list = [];
                projects.forEach((p, idx) => {
                    const btn = p.querySelector('.nb-btn-full-project');
                    list.push({
                        idx,
                        title: p.querySelector('.nb-meta-title, .nb-project-title-link')?.textContent?.trim(),
                        hasBtn: !!btn,
                        btnText: btn?.textContent?.trim().replace(/\\s+/g, ' '),
                        btnHref: btn?.getAttribute('href')
                    });
                });
                return list;
            })()`,
            returnByValue: true
        });
        console.log('Buttons check:', JSON.stringify(buttonCheck.result.result.value, null, 2));

        // Scroll to Project 0 and capture button in context
        await send('Runtime.evaluate', {
            expression: `document.querySelector('#project-0 .nb-project-action-row').scrollIntoView({ block: 'center' })`
        });
        await new Promise(r => setTimeout(r, 250));

        const shotButton = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\verified_full_project_btn_context.png', Buffer.from(shotButton.result.data, 'base64'));

        // Test Navigation: click NOMOD full project button
        console.log('Testing NOMOD full project button navigation...');
        await send('Runtime.evaluate', {
            expression: `document.querySelector('#project-1 .nb-btn-full-project').click()`
        });
        await new Promise(r => setTimeout(r, 500));

        const nomodPageCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                return {
                    url: window.location.href,
                    title: document.title,
                    isNomod: window.location.href.includes('nomod.html'),
                    galleryCardsCount: document.querySelectorAll('.proj-gallery-card').length,
                    hasBackButton: !!document.querySelector('.proj-nav-back')
                };
            })()`,
            returnByValue: true
        });
        console.log('NOMOD Page Check:', nomodPageCheck.result.result.value);

        const shotNomod = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\verified_nomod_full_page.png', Buffer.from(shotNomod.result.data, 'base64'));

        // Test Navigation: click LUCA full project button
        console.log('Navigating to luca.html...');
        await send('Page.navigate', {
            url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/luca.html'
        });
        await new Promise(r => setTimeout(r, 400));

        const lucaPageCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                return {
                    url: window.location.href,
                    title: document.title,
                    isLuca: window.location.href.includes('luca.html'),
                    galleryCardsCount: document.querySelectorAll('.proj-gallery-card').length,
                    hasBackButton: !!document.querySelector('.proj-nav-back')
                };
            })()`,
            returnByValue: true
        });
        console.log('Luca Page Check:', lucaPageCheck.result.result.value);

        const shotLuca = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\verified_luca_full_page.png', Buffer.from(shotLuca.result.data, 'base64'));

        chrome.kill();
        process.exit(0);
    } catch(e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
