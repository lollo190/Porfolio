const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9390;
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
        const targets = await getJSON(`http://127.0.0.1:${port}/json`);
        const target = targets.find(t => t.type === 'page');
        const ws = new WebSocket(target.webSocketDebuggerUrl);
        await new Promise(r => ws.addEventListener('open', r, { once: true }));

        let id = 1;
        const send = (method, params = {}) => new Promise((resolve) => {
            const curId = id++;
            const l = (e) => {
                const data = JSON.parse(e.data);
                if (data.id === curId) {
                    ws.removeEventListener('message', l);
                    resolve(data);
                }
            };
            ws.addEventListener('message', l);
            ws.send(JSON.stringify({ id: curId, method, params }));
        });

        const getVal = (res) => (res && res.result && res.result.result ? res.result.result.value : (res && res.result ? res.result.value : null));

        await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 950, deviceScaleFactor: 1, mobile: false });
        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html' });
        await new Promise(r => setTimeout(r, 1800));

        // 1. Verify Top Navbar Logo & Old Logo Removal
        const evalNavLogo = await send('Runtime.evaluate', {
            expression: `(() => {
                const navLogo = document.querySelector('.nb-nav-center-logo');
                const oldHeroLogo = document.querySelector('.fg-hero-center-logo-wrap');
                const navLogoRect = navLogo ? navLogo.getBoundingClientRect() : null;
                const windowWidth = window.innerWidth;
                const isCentered = navLogoRect ? Math.abs((navLogoRect.left + navLogoRect.width / 2) - (windowWidth / 2)) < 8 : false;

                return {
                    navLogoPresent: !!navLogo,
                    oldHeroLogoPresent: !!oldHeroLogo,
                    navLogoRect: navLogoRect ? { x: Math.round(navLogoRect.x), y: Math.round(navLogoRect.y), w: Math.round(navLogoRect.width), h: Math.round(navLogoRect.height) } : null,
                    isCentered
                };
            })()`,
            returnByValue: true
        });
        console.log('--- Top Navbar Logo Evaluation ---');
        console.log(JSON.stringify(getVal(evalNavLogo), null, 2));

        const snap1 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artDir, 'navbar_logo_desktop.png'), Buffer.from(snap1.result.data, 'base64'));
        console.log('Saved screenshot: navbar_logo_desktop.png');

        // 2. Measure initial coordinates of bottom bar and VLC window
        const initCoordsRes = await send('Runtime.evaluate', {
            expression: `(() => {
                const bottomBar = document.querySelector('.fg-desktop-bottom-bar');
                const vlcWin = document.getElementById('hero-win-vlc');
                const projectsWin = document.getElementById('hero-win-projects');
                const sHandle = projectsWin ? projectsWin.querySelector('.fg-resize-s') : null;
                const sRect = sHandle ? sHandle.getBoundingClientRect() : null;

                return {
                    bottomBarTop: bottomBar ? Math.round(bottomBar.getBoundingClientRect().top) : null,
                    vlcWinTop: vlcWin ? Math.round(vlcWin.getBoundingClientRect().top) : null,
                    vlcWinLeft: vlcWin ? Math.round(vlcWin.getBoundingClientRect().left) : null,
                    projectsHeight: projectsWin ? projectsWin.offsetHeight : null,
                    handleCenter: sRect ? { x: Math.round(sRect.left + sRect.width / 2), y: Math.round(sRect.top + sRect.height / 2) } : null
                };
            })()`,
            returnByValue: true
        });
        const initCoords = getVal(initCoordsRes);
        console.log('--- Initial Coordinates Before Resize ---');
        console.log(JSON.stringify(initCoords, null, 2));

        // 3. Simulate dragging the South resize handle downward by 80px using CDP Input
        const handlePos = initCoords.handleCenter;
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: handlePos.x, y: handlePos.y });
        await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: handlePos.x, y: handlePos.y, button: 'left', clickCount: 1 });
        await new Promise(r => setTimeout(r, 60));

        // Drag down 80px in steps
        for (let step = 1; step <= 8; step++) {
            const curY = handlePos.y + (step * 10);
            await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: handlePos.x, y: curY, buttons: 1 });
            await new Promise(r => setTimeout(r, 20));
        }

        // Check coordinates DURING the resize
        const duringResizeRes = await send('Runtime.evaluate', {
            expression: `(() => {
                const bottomBar = document.querySelector('.fg-desktop-bottom-bar');
                const vlcWin = document.getElementById('hero-win-vlc');
                const projectsWin = document.getElementById('hero-win-projects');
                return {
                    bottomBarTop: bottomBar ? Math.round(bottomBar.getBoundingClientRect().top) : null,
                    vlcWinTop: vlcWin ? Math.round(vlcWin.getBoundingClientRect().top) : null,
                    projectsHeight: projectsWin ? projectsWin.offsetHeight : null
                };
            })()`,
            returnByValue: true
        });
        const duringCoords = getVal(duringResizeRes);
        console.log('--- Coordinates DURING Resize (Handle pulled down 80px) ---');
        console.log(JSON.stringify(duringCoords, null, 2));

        const bottomBarShiftDuring = duringCoords.bottomBarTop - initCoords.bottomBarTop;
        const vlcWinShiftDuring = duringCoords.vlcWinTop - initCoords.vlcWinTop;
        const projectsHeightGrowth = duringCoords.projectsHeight - initCoords.projectsHeight;
        console.log(`Projects window grew by: ${projectsHeightGrowth}px`);
        console.log(`Bottom bar shift during resize: ${bottomBarShiftDuring}px (Expected: 0px)`);
        console.log(`VLC window shift during resize: ${vlcWinShiftDuring}px (Expected: 0px)`);

        await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: handlePos.x, y: handlePos.y + 80, button: 'left' });
        await new Promise(r => setTimeout(r, 300));

        const snap2 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artDir, 'resize_no_shift_desktop.png'), Buffer.from(snap2.result.data, 'base64'));
        console.log('Saved screenshot: resize_no_shift_desktop.png');

        // 4. Test Mobile Navbar Logo (width: 390)
        await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
        await new Promise(r => setTimeout(r, 400));

        const evalMobileLogo = await send('Runtime.evaluate', {
            expression: `(() => {
                const navLogo = document.querySelector('.nb-nav-center-logo');
                const navLogoRect = navLogo ? navLogo.getBoundingClientRect() : null;
                const windowWidth = window.innerWidth;
                const isCentered = navLogoRect ? Math.abs((navLogoRect.left + navLogoRect.width / 2) - (windowWidth / 2)) < 6 : false;
                return {
                    navLogoPresent: !!navLogo,
                    navLogoRect: navLogoRect ? { x: Math.round(navLogoRect.x), y: Math.round(navLogoRect.y), w: Math.round(navLogoRect.width), h: Math.round(navLogoRect.height) } : null,
                    isCentered
                };
            })()`,
            returnByValue: true
        });
        console.log('--- Mobile Top Navbar Logo Evaluation ---');
        console.log(JSON.stringify(getVal(evalMobileLogo), null, 2));

        const snap3 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artDir, 'navbar_logo_mobile.png'), Buffer.from(snap3.result.data, 'base64'));
        console.log('Saved screenshot: navbar_logo_mobile.png');

        ws.close();
        chrome.kill();
        process.exit(0);
    } catch (err) {
        console.error(err);
        chrome.kill();
        process.exit(1);
    }
}, 1200);
