const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9379;

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

        console.log('1. Visit Home (index.html)...');
        await send('Page.navigate', {
            url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html'
        });
        await new Promise(r => setTimeout(r, 400));

        // Verify intro is shown on first visit
        const introFirst = await send('Runtime.evaluate', {
            expression: `(() => {
                const intro = document.getElementById('site-intro-overlay');
                return {
                    hasIntro: !!intro,
                    display: intro ? window.getComputedStyle(intro).display : null
                };
            })()`,
            returnByValue: true
        });
        console.log('Intro first visit:', introFirst.result.result.value);

        // Click About link in nav
        console.log('2. Clicking About link...');
        await send('Runtime.evaluate', {
            expression: `document.querySelector('a[href="about.html"]').click()`
        });
        await new Promise(r => setTimeout(r, 600));

        // Check About page
        const aboutCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                const sideBtn = document.getElementById('about-side-back');
                const btnStyle = sideBtn ? window.getComputedStyle(sideBtn) : null;
                return {
                    url: window.location.href,
                    isAbout: window.location.href.includes('about.html'),
                    hasSideHomeBtn: !!sideBtn,
                    homeBtnText: sideBtn?.textContent?.trim(),
                    homeBtnLeft: btnStyle?.left,
                    homeBtnRight: btnStyle?.right
                };
            })()`,
            returnByValue: true
        });
        console.log('About page check:', aboutCheck.result.result.value);

        // Capture About Screenshot
        const aboutShot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\verified_nav_about.png', Buffer.from(aboutShot.result.data, 'base64'));

        // Click Home link on About page
        console.log('3. Clicking ← HOME button on About page...');
        await send('Runtime.evaluate', {
            expression: `document.getElementById('about-side-back').querySelector('a').click()`
        });
        await new Promise(r => setTimeout(r, 600));

        // Check Return to Home
        const returnCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                const intro = document.getElementById('site-intro-overlay');
                const introStyle = intro ? window.getComputedStyle(intro) : null;
                return {
                    url: window.location.href,
                    isHome: window.location.href.includes('index.html'),
                    introDisplay: introStyle?.display,
                    sessionStoragePlayed: sessionStorage.getItem('site_intro_played'),
                    projectsCount: document.querySelectorAll('.nb-project').length
                };
            })()`,
            returnByValue: true
        });
        console.log('Return to Home check:', returnCheck.result.result.value);

        // Capture Home return Screenshot
        const returnShot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\verified_nav_return_home.png', Buffer.from(returnShot.result.data, 'base64'));

        chrome.kill();
        process.exit(0);
    } catch(e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
