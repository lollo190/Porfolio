const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9395;
const artDir = 'C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc';

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

        // Grant clipboard permissions
        await send('Browser.grantPermissions', {
            permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite']
        });

        // 1. Desktop Viewport
        await send('Emulation.setDeviceMetricsOverride', {
            width: 1440,
            height: 900,
            deviceScaleFactor: 1,
            mobile: false
        });

        console.log('Navigating to about.html...');
        await send('Page.navigate', {
            url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/about.html'
        });

        await new Promise(r => setTimeout(r, 600));

        // Check desktop icons
        const iconsCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                const icons = Array.from(document.querySelectorAll('.kali-desktop-icon')).map(ic => ({
                    id: ic.id,
                    label: ic.querySelector('.kali-icon-label')?.textContent?.trim(),
                    badge: ic.querySelector('.kali-icon-badge')?.textContent?.trim(),
                    rect: ic.getBoundingClientRect()
                }));
                return icons;
            })()`,
            returnByValue: true
        });
        console.log('Desktop Icons:', JSON.stringify(iconsCheck.result.result.value, null, 2));

        // Screenshot 1: Desktop with contacts.txt icon
        let shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\about_desktop_icons.png`, Buffer.from(shot.result.data, 'base64'));

        // 2. Open contacts.txt by double-clicking the icon
        console.log('Opening contacts.txt via dblclick...');
        await send('Runtime.evaluate', {
            expression: `(() => {
                const icon = document.getElementById('icon-contact');
                icon.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            })()`
        });

        await new Promise(r => setTimeout(r, 400));

        // Verify window state
        const winCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                const win = document.getElementById('kali-win-contact');
                const title = document.getElementById('kali-active-title')?.textContent;
                const tab = document.getElementById('tab-contact');
                const r = win.getBoundingClientRect();
                return {
                    isOpen: !win.classList.contains('is-closed'),
                    isFocused: win.classList.contains('is-focused'),
                    title,
                    tabDisplay: window.getComputedStyle(tab).display,
                    tabActive: tab.classList.contains('active'),
                    rect: { left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) }
                };
            })()`,
            returnByValue: true
        });
        console.log('Contacts Window State:', JSON.stringify(winCheck.result.result.value, null, 2));

        // Screenshot 2: Desktop with contacts.txt window open
        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\about_contact_window_open.png`, Buffer.from(shot.result.data, 'base64'));

        // Test copy email button
        await send('Runtime.evaluate', {
            expression: `document.getElementById('copy-email-btn').click();`
        });
        await new Promise(r => setTimeout(r, 100));
        const copyCheck = await send('Runtime.evaluate', {
            expression: `document.getElementById('copy-email-btn').textContent`,
            returnByValue: true
        });
        console.log('Copy button text after click:', copyCheck.result.result.value);

        // 3. Dark Theme Desktop
        await send('Runtime.evaluate', {
            expression: `document.body.classList.add('dark-theme');`
        });
        await new Promise(r => setTimeout(r, 200));
        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\about_contact_dark.png`, Buffer.from(shot.result.data, 'base64'));

        // 4. Mobile Viewport (iPhone 14/15: 390x844)
        await send('Runtime.evaluate', {
            expression: `document.body.classList.remove('dark-theme');`
        });
        await send('Emulation.setDeviceMetricsOverride', {
            width: 390,
            height: 844,
            deviceScaleFactor: 2,
            mobile: true
        });

        await send('Runtime.evaluate', {
            expression: `window.scrollTo(0, 0);`
        });
        await new Promise(r => setTimeout(r, 300));

        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\about_mobile_icons_dock.png`, Buffer.from(shot.result.data, 'base64'));

        // Scroll to contacts window on mobile
        await send('Runtime.evaluate', {
            expression: `document.getElementById('kali-win-contact').scrollIntoView({ block: 'start' });`
        });
        await new Promise(r => setTimeout(r, 300));

        shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`${artDir}\\about_mobile_contact_win.png`, Buffer.from(shot.result.data, 'base64'));

        console.log('All verification screenshots saved successfully!');
        chrome.kill();
        process.exit(0);
    } catch (e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
