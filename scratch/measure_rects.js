const { spawn } = require('child_process');
const http = require('http');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9357',
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
        const targets = await getJSON('http://127.0.0.1:9357/json');
        const target = targets.find(t => t.type === 'page');
        const ws = new WebSocket(target.webSocketDebuggerUrl);
        await new Promise(r => ws.addEventListener('open', r, { once: true }));

        let id = 1;
        function send(method, params = {}) {
            return new Promise(resolve => {
                const reqId = id++;
                const handler = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.id === reqId) {
                        ws.removeEventListener('message', handler);
                        resolve(data);
                    }
                };
                ws.addEventListener('message', handler);
                ws.send(JSON.stringify({ id: reqId, method, params }));
            });
        }

        // Set 1440x900 viewport
        await send('Emulation.setDeviceMetricsOverride', {
            width: 1440,
            height: 900,
            deviceScaleFactor: 1,
            mobile: false
        });

        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html' });
        await new Promise(r => setTimeout(r, 1200));

        const res = await send('Runtime.evaluate', {
            expression: `(() => {
                const nav = document.querySelector('.nb-nav-home-link').getBoundingClientRect();
                const hero = document.querySelector('.fg-hero-logo-wrap').getBoundingClientRect();
                const heroImg = document.querySelector('.fg-hero-spinning-logo').getBoundingClientRect();
                return JSON.stringify({
                    nav: { left: nav.left, top: nav.top, width: nav.width, height: nav.height },
                    hero: { left: hero.left, top: hero.top, width: hero.width, height: hero.height },
                    heroImg: { left: heroImg.left, top: heroImg.top, width: heroImg.width, height: heroImg.height }
                });
            })()`
        });

        console.log('MEASUREMENTS DESKTOP:', JSON.parse(res.result.result.value));

        // Test Mobile
        await send('Emulation.setDeviceMetricsOverride', {
            width: 390,
            height: 844,
            deviceScaleFactor: 2,
            mobile: true
        });
        await new Promise(r => setTimeout(r, 600));

        const resMobile = await send('Runtime.evaluate', {
            expression: `(() => {
                const nav = document.querySelector('.nb-nav-home-link').getBoundingClientRect();
                const hero = document.querySelector('.fg-hero-logo-wrap').getBoundingClientRect();
                const heroImg = document.querySelector('.fg-hero-spinning-logo').getBoundingClientRect();
                return JSON.stringify({
                    nav: { left: nav.left, top: nav.top, width: nav.width, height: nav.height },
                    hero: { left: hero.left, top: hero.top, width: hero.width, height: hero.height },
                    heroImg: { left: heroImg.left, top: heroImg.top, width: heroImg.width, height: heroImg.height }
                });
            })()`
        });

        console.log('MEASUREMENTS MOBILE:', JSON.parse(resMobile.result.result.value));

        chrome.kill();
        process.exit(0);
    } catch (e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
