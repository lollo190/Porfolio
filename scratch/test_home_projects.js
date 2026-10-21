const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9369;
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

        await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 950, deviceScaleFactor: 1, mobile: false });
        await send('Page.navigate', { url: 'file:///c:/Users/lory/Desktop/Sito Portfolio/index.html' });
        await new Promise(r => setTimeout(r, 2000));

        const getVal = (res) => (res && res.result && res.result.result ? res.result.result.value : (res && res.result ? res.result.value : null));

        // 1. Initial State Evaluation
        const evalRes = await send('Runtime.evaluate', {
            expression: `(() => {
                const projectsWin = document.getElementById('hero-win-projects');
                const vlcWin = document.getElementById('hero-win-vlc');
                const oldWin0 = document.getElementById('hero-win-0');
                const oldWin1 = document.getElementById('hero-win-1');
                const oldWin2 = document.getElementById('hero-win-2');
                const icon = document.getElementById('desktop-icon-projects');

                const folderRows = document.querySelectorAll('#home-pd-folders-list .pd-folder-row');
                const fileRows = document.querySelectorAll('#home-pd-files-list .pd-file-row');
                const previewImg = document.getElementById('home-pd-preview-img');
                const previewTitle = document.getElementById('home-pd-preview-title');
                const previewLink = document.getElementById('home-pd-preview-link');
                const iconRect = icon ? icon.getBoundingClientRect() : null;

                return {
                    projectsWinPresent: !!projectsWin,
                    projectsWinVisible: projectsWin ? !projectsWin.classList.contains('is-closed') : false,
                    vlcWinPresent: !!vlcWin,
                    oldWin0Present: !!oldWin0,
                    oldWin1Present: !!oldWin1,
                    oldWin2Present: !!oldWin2,
                    iconPresent: !!icon,
                    iconRect: iconRect ? { width: Math.round(iconRect.width), height: Math.round(iconRect.height), top: Math.round(iconRect.top), left: Math.round(iconRect.left) } : null,
                    folderCount: folderRows.length,
                    activeFolderText: folderRows.length > 0 ? folderRows[0].textContent.trim() : null,
                    fileCount: fileRows.length,
                    activeFileText: fileRows.length > 0 ? fileRows[0].textContent.trim() : null,
                    previewImgSrc: previewImg ? previewImg.getAttribute('src') : null,
                    previewTitleText: previewTitle ? previewTitle.textContent.trim() : null,
                    previewLinkHref: previewLink ? previewLink.getAttribute('href') : null
                };
            })()`,
            returnByValue: true
        });

        console.log('--- Initial State Evaluation ---');
        console.log(JSON.stringify(getVal(evalRes), null, 2));

        // Screenshot 1: Projects Window Open by Default + VLC Window
        const snap1 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artDir, 'home_desktop_projects_open.png'), Buffer.from(snap1.result.data, 'base64'));
        console.log('Saved screenshot 1: home_desktop_projects_open.png');

        // 2. Test Folder Switching: Click NOMOD folder (index 1)
        await send('Runtime.evaluate', {
            expression: `(() => {
                const folders = document.querySelectorAll('#home-pd-folders-list .pd-folder-row');
                if (folders[1]) folders[1].click();
            })()`
        });
        await new Promise(r => setTimeout(r, 500));

        const evalNomod = await send('Runtime.evaluate', {
            expression: `(() => {
                const previewTitle = document.getElementById('home-pd-preview-title');
                const fileRows = document.querySelectorAll('#home-pd-files-list .pd-file-row');
                const pathLabel = document.getElementById('home-pd-path-label');
                return {
                    pathLabel: pathLabel ? pathLabel.textContent.trim() : null,
                    fileCount: fileRows.length,
                    firstFileName: fileRows[0] ? fileRows[0].textContent.trim() : null,
                    previewTitle: previewTitle ? previewTitle.textContent.trim() : null
                };
            })()`,
            returnByValue: true
        });
        console.log('--- NOMOD Selection Evaluation ---');
        console.log(JSON.stringify(getVal(evalNomod), null, 2));

        const snap2 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artDir, 'home_nomod_selected.png'), Buffer.from(snap2.result.data, 'base64'));
        console.log('Saved screenshot 2: home_nomod_selected.png');

        // 3. Test TOC click: Click "3. HARP CHAIR" in TOC -> should select folder 0 (HARP CHAIR)
        await send('Runtime.evaluate', {
            expression: `(() => {
                const tocItem = document.querySelector('.fg-toc-item[data-folder="0"]');
                if (tocItem) tocItem.click();
            })()`
        });
        await new Promise(r => setTimeout(r, 500));

        const evalTocClick = await send('Runtime.evaluate', {
            expression: `(() => {
                const pathLabel = document.getElementById('home-pd-path-label');
                const previewTitle = document.getElementById('home-pd-preview-title');
                return {
                    pathLabel: pathLabel ? pathLabel.textContent.trim() : null,
                    previewTitle: previewTitle ? previewTitle.textContent.trim() : null
                };
            })()`,
            returnByValue: true
        });
        console.log('--- TOC Click Harp Chair Evaluation ---');
        console.log(JSON.stringify(getVal(evalTocClick), null, 2));

        // 4. Test Dragging Desktop Icon to custom position (e.g. x: 440, y: 220) using real CDP mouse events
        const iconPosRes = await send('Runtime.evaluate', {
            expression: `(() => {
                const icon = document.getElementById('desktop-icon-projects');
                const r = icon.getBoundingClientRect();
                return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
            })()`,
            returnByValue: true
        });
        const iconPos = getVal(iconPosRes);
        console.log('Icon initial center:', iconPos);

        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: iconPos.x, y: iconPos.y });
        await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: iconPos.x, y: iconPos.y, button: 'left', clickCount: 1 });
        await new Promise(r => setTimeout(r, 80));

        // Drag to x: 440, y: 220
        for (let step = 1; step <= 10; step++) {
            const curX = Math.round(iconPos.x + (440 - iconPos.x) * (step / 10));
            const curY = Math.round(iconPos.y + (220 - iconPos.y) * (step / 10));
            await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: curX, y: curY, buttons: 1 });
            await new Promise(r => setTimeout(r, 30));
        }

        await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 440, y: 220, button: 'left' });
        await new Promise(r => setTimeout(r, 400));

        const evalDrag = await send('Runtime.evaluate', {
            expression: `(() => {
                const icon = document.getElementById('desktop-icon-projects');
                return {
                    isMoved: icon.classList.contains('is-moved'),
                    stylePosition: icon.style.position,
                    styleLeft: icon.style.left,
                    styleTop: icon.style.top
                };
            })()`,
            returnByValue: true
        });
        console.log('--- Desktop Icon Drag Evaluation ---');
        console.log(JSON.stringify(getVal(evalDrag), null, 2));

        const snap3 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artDir, 'home_icon_dragged.png'), Buffer.from(snap3.result.data, 'base64'));
        console.log('Saved screenshot 3: home_icon_dragged.png');

        ws.close();
        chrome.kill();
        process.exit(0);
    } catch (err) {
        console.error('Error running test:', err);
        chrome.kill();
        process.exit(1);
    }
}, 1200);
