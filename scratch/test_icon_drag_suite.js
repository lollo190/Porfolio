const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9376;

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

        await send('Page.navigate', {
            url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html'
        });

        await new Promise(r => setTimeout(r, 200));
        await send('Runtime.evaluate', {
            expression: `document.getElementById('site-intro-overlay').style.display = 'none'`
        });
        await new Promise(r => setTimeout(r, 300));

        // Test Suite Evaluation
        const results = await send('Runtime.evaluate', {
            expression: `(async () => {
                const results = [];
                const proj = document.getElementById('desktop-icon-projects');
                const contact = document.getElementById('desktop-icon-contact');
                const winProj = document.getElementById('hero-win-projects');
                const winContact = document.getElementById('hero-win-contact');

                // 1. Initial State
                const initP = proj.getBoundingClientRect();
                const initC = contact.getBoundingClientRect();
                results.push({
                    test: '1. Initial State',
                    projectsLeft: initP.left,
                    projectsTop: initP.top,
                    contactLeft: initC.left,
                    contactTop: initC.top,
                    projWindowClosed: winProj.classList.contains('is-closed')
                });

                // Helper: simulate drag
                function drag(element, dx, dy) {
                    const r = element.getBoundingClientRect();
                    const sX = r.left + r.width / 2;
                    const sY = r.top + r.height / 2;
                    element.dispatchEvent(new PointerEvent('pointerdown', { clientX: sX, clientY: sY, button: 0, bubbles: true }));
                    
                    // intermediate step
                    window.dispatchEvent(new PointerEvent('pointermove', { clientX: sX + dx / 2, clientY: sY + dy / 2, bubbles: true }));
                    // full step
                    window.dispatchEvent(new PointerEvent('pointermove', { clientX: sX + dx, clientY: sY + dy, bubbles: true }));
                    // end
                    window.dispatchEvent(new PointerEvent('pointerup', { clientX: sX + dx, clientY: sY + dy, bubbles: true }));
                }

                // 2. Drag Projects by +120px X, +60px Y
                drag(proj, 120, 60);
                const pAfter1 = proj.getBoundingClientRect();
                const cAfter1 = contact.getBoundingClientRect();
                results.push({
                    test: '2. Drag Projects (+120, +60)',
                    dx: Math.round(pAfter1.left - initP.left),
                    dy: Math.round(pAfter1.top - initP.top),
                    contactDeltaX: Math.round(cAfter1.left - initC.left),
                    contactDeltaY: Math.round(cAfter1.top - initC.top),
                    pass: Math.round(pAfter1.left - initP.left) === 120 && Math.round(pAfter1.top - initP.top) === 60 && Math.round(cAfter1.left - initC.left) === 0 && Math.round(cAfter1.top - initC.top) === 0
                });

                // 3. Sequential drag on Projects by another +40px X, -20px Y
                drag(proj, 40, -20);
                const pAfter2 = proj.getBoundingClientRect();
                results.push({
                    test: '3. Second Drag Projects (+40, -20 cumulative)',
                    totalDx: Math.round(pAfter2.left - initP.left),
                    totalDy: Math.round(pAfter2.top - initP.top),
                    pass: Math.round(pAfter2.left - initP.left) === 160 && Math.round(pAfter2.top - initP.top) === 40
                });

                // 4. Drag contact.txt by -150px X, +80px Y
                drag(contact, -150, 80);
                const cAfter2 = contact.getBoundingClientRect();
                const pAfter3 = proj.getBoundingClientRect();
                results.push({
                    test: '4. Drag contact.txt (-150, +80)',
                    dx: Math.round(cAfter2.left - initC.left),
                    dy: Math.round(cAfter2.top - initC.top),
                    projDeltaAfterContactMove: Math.round(pAfter3.left - pAfter2.left),
                    pass: Math.round(cAfter2.left - initC.left) === -150 && Math.round(cAfter2.top - initC.top) === 80 && Math.round(pAfter3.left - pAfter2.left) === 0
                });

                // 5. Clamping check: Drag contact off-screen left by -2000px
                drag(contact, -2000, 0);
                const cClamped = contact.getBoundingClientRect();
                results.push({
                    test: '5. Clamping check (off-screen left)',
                    clampedLeft: cClamped.left,
                    pass: cClamped.left >= 8 && cClamped.left <= 12
                });

                // Wait for drag cooldown (180ms) to ensure double clicks test normal interaction
                await new Promise(r => setTimeout(r, 250));

                // 6. Double click test on projects (open projects window)
                proj.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
                results.push({
                    test: '6. Double Click Projects',
                    winProjectsOpen: !winProj.classList.contains('is-closed')
                });

                // 7. Double click test on contact.txt (open contact window)
                contact.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
                results.push({
                    test: '7. Double Click contact.txt',
                    winContactOpen: !winContact.classList.contains('is-closed')
                });

                return results;
            })()`,
            awaitPromise: true,
            returnByValue: true
        });

        console.log('Test Suite Results:\n', JSON.stringify(results.result.result.value, null, 2));

        // Take a screenshot of the desktop with the repositioned icons & windows
        const desktopShot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\verified_desktop_icons_dragged.png', Buffer.from(desktopShot.result.data, 'base64'));

        // Mobile responsiveness test
        await send('Emulation.setDeviceMetricsOverride', {
            width: 390,
            height: 844,
            deviceScaleFactor: 2,
            mobile: true
        });
        await new Promise(r => setTimeout(r, 200));

        const mobileCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                const p = document.getElementById('desktop-icon-projects');
                const c = document.getElementById('desktop-icon-contact');
                const pR = p.getBoundingClientRect();
                const cR = c.getBoundingClientRect();
                const pTransform = window.getComputedStyle(p).transform;
                const cTransform = window.getComputedStyle(c).transform;
                return {
                    mobile: true,
                    projectsLeft: pR.left,
                    projectsWidth: pR.width,
                    contactLeft: cR.left,
                    contactWidth: cR.width,
                    pTransform,
                    cTransform
                };
            })()`,
            returnByValue: true
        });

        console.log('Mobile Check:', JSON.stringify(mobileCheck.result.result.value, null, 2));

        const mobileShot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\verified_mobile_icons_layout.png', Buffer.from(mobileShot.result.data, 'base64'));

        chrome.kill();
        process.exit(0);
    } catch(e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
