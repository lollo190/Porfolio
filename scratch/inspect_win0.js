const http = require('http');

http.get('http://127.0.0.1:9482/json', (res) => {
    let d = ''; res.on('data', c => d += c); res.on('end', async () => {
        const targets = JSON.parse(d);
        const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
        await new Promise(r => ws.addEventListener('open', r));
        let id = 1;
        function send(method, params) {
            return new Promise(r => {
                const i = id++;
                ws.addEventListener('message', function h(e) {
                    const m = JSON.parse(e.data);
                    if (m.id === i) { ws.removeEventListener('message', h); r(m.result); }
                });
                ws.send(JSON.stringify({ id: i, method, params }));
            });
        }
        const res = await send('Runtime.evaluate', {
            expression: `(() => {
                const w = document.getElementById("project-win-0");
                if (!w) return "NO WIN";
                const c = w.querySelector(".fg-hero-window-content");
                const tb = w.querySelector(".kali-nav-toolbar");
                const mb = w.querySelector(".kali-menubar");
                const cs = window.getComputedStyle(w);
                const ccs = c ? window.getComputedStyle(c) : null;
                return {
                    winRect: w.getBoundingClientRect(),
                    winPos: cs.position,
                    winDisplay: cs.display,
                    winHeight: cs.height,
                    contentRect: c ? c.getBoundingClientRect() : null,
                    contentDisplay: ccs ? ccs.display : null,
                    contentHeight: ccs ? ccs.height : null,
                    mbDisplay: mb ? window.getComputedStyle(mb).display : null,
                    tbDisplay: tb ? window.getComputedStyle(tb).display : null
                };
            })()`,
            returnByValue: true
        });
        console.log(JSON.stringify(res.result.value, null, 2));
        ws.close();
    });
}).on('error', (e) => console.error(e.message));
