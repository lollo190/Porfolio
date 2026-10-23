const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9378;

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

        // 1. Check intro presence on first load
        await new Promise(r => setTimeout(r, 200));
        const introCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                const intro = document.getElementById('site-intro-overlay');
                return {
                    introPresent: !!intro,
                    introDisplay: intro ? window.getComputedStyle(intro).display : null,
                    sessionStoragePlayed: sessionStorage.getItem('site_intro_played')
                };
            })()`,
            returnByValue: true
        });
        console.log('1. Intro check:', introCheck.result.result.value);

        // Dismiss intro to inspect page
        await send('Runtime.evaluate', {
            expression: `document.getElementById('site-intro-overlay').style.display = 'none'`
        });
        await new Promise(r => setTimeout(r, 300));

        // 2. Check Home page structure
        const structureCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                const topNav = document.querySelector('.nb-top-nav');
                const hero = document.querySelector('.fg-hero');
                const heroWindows = document.querySelectorAll('.fg-hero-window');
                const reel = document.getElementById('motion-reel');
                const main = document.querySelector('main');
                const projects = document.querySelectorAll('.nb-project');
                const footer = document.getElementById('contact');
                const sideAbout = document.getElementById('desktop-side-about');

                // Check desktop icons (should NOT exist)
                const desktopIcons = document.querySelectorAll('.fg-desktop-icons-row, .fg-desktop-icon-projects, .fg-desktop-icon-contact');

                return {
                    hasTopNav: !!topNav,
                    hasHero: !!hero,
                    heroWindowsCount: heroWindows.length,
                    hasReel: !!reel,
                    hasMain: !!main,
                    projectsCount: projects.length,
                    projectTitles: Array.from(projects).map(p => p.querySelector('.nb-meta-title, .nb-project-title-link')?.textContent?.trim()),
                    hasFooter: !!footer,
                    hasSideAbout: !!sideAbout,
                    sideAboutHref: sideAbout?.querySelector('a')?.getAttribute('href'),
                    desktopIconsCount: desktopIcons.length
                };
            })()`,
            returnByValue: true
        });
        console.log('2. Home structure check:', structureCheck.result.result.value);

        // Capture Home Hero
        const shotHero = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\verified_scrollable_home_hero.png', Buffer.from(shotHero.result.data, 'base64'));

        // Scroll to Reel & Projects
        await send('Runtime.evaluate', {
            expression: `window.scrollTo(0, 900)`
        });
        await new Promise(r => setTimeout(r, 200));

        const shotReel = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\verified_scrollable_home_reel.png', Buffer.from(shotReel.result.data, 'base64'));

        // Scroll to Project 0 (Harp Chair)
        await send('Runtime.evaluate', {
            expression: `document.getElementById('project-0').scrollIntoView()`
        });
        await new Promise(r => setTimeout(r, 200));

        const shotProject = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\verified_scrollable_home_project.png', Buffer.from(shotProject.result.data, 'base64'));

        // Mobile Responsiveness Test (390x844)
        await send('Emulation.setDeviceMetricsOverride', {
            width: 390,
            height: 844,
            deviceScaleFactor: 2,
            mobile: true
        });
        await send('Runtime.evaluate', {
            expression: `window.scrollTo(0, 0)`
        });
        await new Promise(r => setTimeout(r, 250));

        const mobileCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                const heroWindows = document.querySelectorAll('.fg-hero-window');
                const win0 = heroWindows[0]?.getBoundingClientRect();
                const win1 = heroWindows[1]?.getBoundingClientRect();
                return {
                    mobile: true,
                    win0Width: win0?.width,
                    win1Width: win1?.width,
                    isStacked: win1 && win0 ? win1.top > win0.bottom - 10 : false
                };
            })()`,
            returnByValue: true
        });
        console.log('3. Mobile check:', mobileCheck.result.result.value);

        const shotMobile = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:\\Users\\lory\\.gemini\\antigravity\\brain\\180e8f8a-f0bc-44a9-8e86-be276ad1a9dc\\verified_scrollable_home_mobile.png', Buffer.from(shotMobile.result.data, 'base64'));

        chrome.kill();
        process.exit(0);
    } catch(e) {
        console.error(e);
        chrome.kill();
        process.exit(1);
    }
}, 800);
