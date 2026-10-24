/* ============================================================
   LORENZO KRAJA OS — Desktop Operating System Manager
   Inspired by Virgil Abloh's public---domain.com & Debian Kali XFCE
   ============================================================ */

(function () {
    'use strict';

    // --------------- Configuration ---------------
    const CONFIG = {
        timezoneIANA: "Europe/Rome",
        timezoneLabel: "RM",
    };

    // --------------- State ---------------
    let highestZIndex = 50;
    const windows = {};
    const winKeys = ['cv', 'reel', 'projects', 'contact'];
    let activeWinKey = 'projects';
    let allMinimized = false;
    let prevStatesBeforeShowDesktop = {};

    // --------------- Theme Initialization ---------------
    function initTheme() {
        const savedTheme = localStorage.getItem("portfolio_theme");
        if (savedTheme === "dark") {
            document.body.classList.add("dark-theme");
        } else {
            document.body.classList.remove("dark-theme");
        }

        const toggleBtn = document.getElementById("theme-toggle");
        if (toggleBtn) {
            toggleBtn.addEventListener("click", () => {
                const isDark = document.body.classList.toggle("dark-theme");
                localStorage.setItem("portfolio_theme", isDark ? "dark" : "light");
            });
        }
    }

    // --------------- Live Clock -------------------------
    function initClock() {
        const el = document.getElementById("live-clock");
        if (!el) return;

        const tick = () => {
            try {
                const now = new Date();
                el.textContent =
                    new Intl.DateTimeFormat("en-US", {
                        timeZone: CONFIG.timezoneIANA,
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                    }).format(now) + " " + CONFIG.timezoneLabel;
            } catch {
                el.textContent = "08:22:30 " + CONFIG.timezoneLabel;
            }
        };

        tick();
        setInterval(tick, 1000);
    }

    // --------------- Window Manager ---------------------
    function initWindows() {
        winKeys.forEach(key => {
            const el = document.getElementById(`kali-win-${key}`);
            const titlebar = document.getElementById(`kali-tb-${key}`);
            const tab = document.getElementById(`tab-${key}`);
            if (!el) return;

            windows[key] = {
                el,
                titlebar,
                tab,
                isMaximized: false,
                isMinimized: el.classList.contains('is-closed'),
                hasBeenDragged: false,
                prevRect: null
            };

            // Focus on mousedown
            el.addEventListener('pointerdown', () => {
                bringToFront(key);
            });

            // Titlebar Dragging
            if (titlebar) {
                setupWindowDragging(key, el, titlebar);
            }
        });

        // Window Resizing (Corners & Edges)
        initWindowResizing();

        // Window Control Buttons
        document.querySelectorAll('.kali-btn-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const key = btn.dataset.win;
                if (key) closeWindow(key);
            });
        });

        document.querySelectorAll('.kali-btn-min').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const key = btn.dataset.win;
                if (key) minimizeWindow(key);
            });
        });

        document.querySelectorAll('.kali-btn-max').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const key = btn.dataset.win;
                if (key) toggleMaximizeWindow(key);
            });
        });

        // Taskbar tabs
        document.querySelectorAll('.kali-task-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const key = tab.dataset.win;
                if (!key || !windows[key]) return;

                const winObj = windows[key];
                if (winObj.el.classList.contains('is-closed')) {
                    openWindow(key);
                } else if (winObj.el.classList.contains('is-minimized')) {
                    winObj.el.classList.remove('is-minimized');
                    bringToFront(key);
                } else if (activeWinKey === key) {
                    minimizeWindow(key);
                } else {
                    bringToFront(key);
                }
            });
        });

        // Show Desktop toggle
        const showDesktopBtn = document.getElementById('kali-show-desktop');
        if (showDesktopBtn) {
            showDesktopBtn.addEventListener('click', () => {
                if (!allMinimized) {
                    winKeys.forEach(k => {
                        const w = windows[k];
                        if (w && !w.el.classList.contains('is-closed')) {
                            prevStatesBeforeShowDesktop[k] = !w.el.classList.contains('is-minimized');
                            w.el.classList.add('is-minimized');
                            if (w.tab) w.tab.classList.remove('active');
                        }
                    });
                    allMinimized = true;
                    updateTopBarTitle("Desktop");
                } else {
                    winKeys.forEach(k => {
                        const w = windows[k];
                        if (w && prevStatesBeforeShowDesktop[k]) {
                            w.el.classList.remove('is-minimized');
                        }
                    });
                    allMinimized = false;
                    if (activeWinKey) bringToFront(activeWinKey);
                }
            });
        }

        // Applications Launcher Menu
        const launcherBtn = document.getElementById('kali-launcher-btn');
        const appMenu = document.getElementById('kali-app-menu');
        if (launcherBtn && appMenu) {
            launcherBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = appMenu.style.display === 'flex';
                appMenu.style.display = isOpen ? 'none' : 'flex';
            });

            document.addEventListener('click', (e) => {
                if (!appMenu.contains(e.target) && e.target !== launcherBtn) {
                    appMenu.style.display = 'none';
                }
            });

            appMenu.querySelectorAll('.kali-app-menu-item[data-action="win"]').forEach(item => {
                item.addEventListener('click', () => {
                    const target = item.dataset.target;
                    if (target) openWindow(target);
                    appMenu.style.display = 'none';
                });
            });
        }

        // Global Esc shortcut
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && activeWinKey && windows[activeWinKey]) {
                const cur = windows[activeWinKey];
                if (cur && !cur.el.classList.contains('is-closed') && !cur.el.classList.contains('is-minimized')) {
                    closeWindow(activeWinKey);
                }
            }
        });
    }

    function bringToFront(key) {
        const win = windows[key];
        if (!win || win.el.classList.contains('is-closed')) return;

        highestZIndex += 2;
        win.el.style.zIndex = highestZIndex;

        // Visual classes
        winKeys.forEach(k => {
            if (windows[k]) {
                windows[k].el.classList.remove('is-focused');
                if (windows[k].tab) windows[k].tab.classList.remove('active');
            }
        });

        win.el.classList.add('is-focused');
        win.el.classList.remove('is-minimized');
        if (win.tab) {
            win.tab.style.display = 'inline-flex';
            win.tab.classList.add('active');
        }

        activeWinKey = key;
        updateTopBarTitle(getWindowTitle(key));

        if (window.innerWidth <= 768 && win.el) {
            setTimeout(() => {
                win.el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 60);
        }
    }

    function getWindowTitle(key) {
        switch (key) {
            case 'cv': return 'curriculum.pdf — Document Viewer';
            case 'reel': return 'reel.mp4 — Video Player';
            case 'projects': return 'archive — public---domain';
            case 'contact': return 'contacts.txt — Text Editor';
            default: return 'Desktop';
        }
    }

    function updateTopBarTitle(title) {
        const titleEl = document.getElementById('kali-active-title');
        if (titleEl) titleEl.textContent = title;
    }

    function openWindow(key) {
        const win = windows[key];
        if (!win) return;

        win.el.classList.remove('is-closed');
        win.el.classList.remove('is-minimized');
        if (win.tab) win.tab.style.display = 'inline-flex';

        bringToFront(key);

        if (key === 'reel') {
            const vid = document.getElementById('kali-os-video');
            if (vid) {
                vid.play().catch(() => { });
            }
        }
    }

    function closeWindow(key) {
        const win = windows[key];
        if (!win) return;

        win.el.classList.add('is-closed');
        win.el.classList.remove('is-focused');
        if (win.tab) win.tab.style.display = 'none';

        if (key === 'reel') {
            const vid = document.getElementById('kali-os-video');
            if (vid) vid.pause();
        }

        // Find next open window to focus
        let next = winKeys.find(k => windows[k] && !windows[k].el.classList.contains('is-closed') && !windows[k].el.classList.contains('is-minimized'));
        if (next) {
            bringToFront(next);
        } else {
            activeWinKey = null;
            updateTopBarTitle("Desktop");
        }
    }

    function minimizeWindow(key) {
        const win = windows[key];
        if (!win) return;

        win.el.classList.add('is-minimized');
        win.el.classList.remove('is-focused');
        if (win.tab) win.tab.classList.remove('active');

        // Focus next
        let next = winKeys.find(k => windows[k] && !windows[k].el.classList.contains('is-closed') && !windows[k].el.classList.contains('is-minimized'));
        if (next) {
            bringToFront(next);
        } else {
            activeWinKey = null;
            updateTopBarTitle("Desktop");
        }
    }

    function toggleMaximizeWindow(key) {
        const win = windows[key];
        if (!win) return;

        if (!win.isMaximized) {
            // Save current position
            win.prevRect = {
                top: win.el.style.top,
                left: win.el.style.left,
                width: win.el.style.width,
                height: win.el.style.height
            };
            win.el.classList.add('is-maximized');
            win.isMaximized = true;
        } else {
            win.el.classList.remove('is-maximized');
            if (win.prevRect) {
                win.el.style.top = win.prevRect.top;
                win.el.style.left = win.prevRect.left;
                win.el.style.width = win.prevRect.width;
                win.el.style.height = win.prevRect.height;
            }
            win.isMaximized = false;
        }
        bringToFront(key);
    }

    // --------------- Window Dragging ---------------------
    function setupWindowDragging(key, winEl, handleEl) {
        let isDragging = false;
        let startX = 0, startY = 0;
        let initialLeft = 0, initialTop = 0;

        const onPointerMove = (e) => {
            if (!isDragging) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let newLeft = initialLeft + dx;
            let newTop = initialTop + dy;

            const parent = winEl.offsetParent || document.getElementById('kali-os-desktop') || document.body;
            const maxLeft = parent.clientWidth - 80;
            const minLeft = -(winEl.offsetWidth - 80);
            const maxTop = Math.max(0, parent.clientHeight - 36);
            const minTop = 0; // Flush with topbar (0px gap)

            newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
            newTop = Math.max(minTop, Math.min(newTop, maxTop));

            winEl.style.left = `${newLeft}px`;
            winEl.style.top = `${newTop}px`;
            winEl.style.margin = '0';
        };

        const stopDrag = (e) => {
            if (isDragging) {
                isDragging = false;
                winEl.classList.remove('is-dragging');
                document.body.classList.remove('is-window-interacting');
                try {
                    handleEl.releasePointerCapture(e.pointerId);
                } catch { }
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', stopDrag);
                window.removeEventListener('pointercancel', stopDrag);
            }
        };

        handleEl.addEventListener('pointerdown', (e) => {
            // Ignore if maximized or clicking control buttons
            if (windows[key].isMaximized || e.target.closest('.kali-controls') || e.target.closest('button')) {
                return;
            }

            windows[key].hasBeenDragged = true;
            bringToFront(key);
            isDragging = true;
            winEl.classList.add('is-dragging');
            document.body.classList.add('is-window-interacting');
            try {
                handleEl.setPointerCapture(e.pointerId);
            } catch { }

            startX = e.clientX;
            startY = e.clientY;

            // Accurate parent-relative coordinates (fixes cursor jump and top gap)
            const parent = winEl.offsetParent || document.getElementById('kali-os-desktop') || document.body;
            const parentRect = parent.getBoundingClientRect();
            const rect = winEl.getBoundingClientRect();

            initialLeft = rect.left - parentRect.left;
            initialTop = rect.top - parentRect.top;

            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', stopDrag);
            window.addEventListener('pointercancel', stopDrag);

            e.preventDefault();
        });
    }

    // --------------- Window Resizing (Corners & Edges) ---
    function initWindowResizing() {
        winKeys.forEach(key => {
            const win = windows[key];
            if (!win || !win.el) return;
            const winEl = win.el;

            const directions = ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'];
            directions.forEach(dir => {
                let handle = winEl.querySelector(`.kali-resize-${dir}`);
                if (!handle) {
                    handle = document.createElement('div');
                    handle.className = `kali-resize-handle kali-resize-${dir}`;
                    handle.dataset.dir = dir;
                    handle.dataset.win = key;
                    handle.setAttribute('aria-hidden', 'true');
                    winEl.appendChild(handle);
                }
                setupWindowResizeHandle(key, winEl, handle, dir);
            });
        });
    }

    function setupWindowResizeHandle(key, winEl, handleEl, dir) {
        let isResizing = false;
        let startX = 0, startY = 0;
        let initialLeft = 0, initialTop = 0;
        let initialWidth = 0, initialHeight = 0;

        const onPointerMove = (e) => {
            if (!isResizing) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let minW = 280;
            let minH = 200;
            if (key === 'projects') {
                minW = 380;
                minH = 240;
            } else if (key === 'cv') {
                minW = 280;
                minH = 220;
            } else if (key === 'contact') {
                minW = 260;
                minH = 200;
            } else if (key === 'reel') {
                minW = 300;
                minH = 200;
            }

            const parent = winEl.offsetParent || document.getElementById('kali-os-desktop') || document.body;
            const maxDesktopW = parent.clientWidth;
            const maxDesktopH = parent.clientHeight;

            let newLeft = initialLeft;
            let newTop = initialTop;
            let newWidth = initialWidth;
            let newHeight = initialHeight;

            // East: adjust width
            if (dir.indexOf('e') !== -1) {
                newWidth = Math.max(minW, Math.min(initialWidth + dx, maxDesktopW - initialLeft));
            }

            // West: adjust left and width
            if (dir.indexOf('w') !== -1) {
                let proposedW = initialWidth - dx;
                let proposedLeft = initialLeft + dx;
                if (proposedW < minW) {
                    proposedLeft = initialLeft + (initialWidth - minW);
                    proposedW = minW;
                }
                if (proposedLeft < 0) {
                    proposedW += proposedLeft;
                    proposedLeft = 0;
                }
                newLeft = proposedLeft;
                newWidth = Math.max(minW, proposedW);
            }

            // South: adjust height
            if (dir.indexOf('s') !== -1) {
                newHeight = Math.max(minH, Math.min(initialHeight + dy, maxDesktopH - initialTop));
            }

            // North: adjust top and height
            if (dir.indexOf('n') !== -1) {
                let proposedH = initialHeight - dy;
                let proposedTop = initialTop + dy;
                if (proposedH < minH) {
                    proposedTop = initialTop + (initialHeight - minH);
                    proposedH = minH;
                }
                if (proposedTop < 0) {
                    proposedH += proposedTop;
                    proposedTop = 0;
                }
                newTop = proposedTop;
                newHeight = Math.max(minH, proposedH);
            }

            winEl.style.left = `${Math.round(newLeft)}px`;
            winEl.style.top = `${Math.round(newTop)}px`;
            winEl.style.width = `${Math.round(newWidth)}px`;
            winEl.style.height = `${Math.round(newHeight)}px`;
            winEl.style.margin = '0';
        };

        const stopResize = (e) => {
            if (isResizing) {
                isResizing = false;
                winEl.classList.remove('is-resizing');
                document.body.classList.remove('is-window-interacting');
                document.body.style.cursor = '';
                try {
                    handleEl.releasePointerCapture(e.pointerId);
                } catch { }
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', stopResize);
                window.removeEventListener('pointercancel', stopResize);
            }
        };

        handleEl.addEventListener('pointerdown', (e) => {
            if (windows[key].isMaximized || winEl.classList.contains('is-closed') || winEl.classList.contains('is-minimized')) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            windows[key].hasBeenDragged = true;
            bringToFront(key);

            isResizing = true;
            winEl.classList.add('is-resizing');
            document.body.classList.add('is-window-interacting');
            try {
                handleEl.setPointerCapture(e.pointerId);
            } catch { }

            const activeCursor = window.getComputedStyle(handleEl).cursor;
            document.body.style.cursor = activeCursor;

            startX = e.clientX;
            startY = e.clientY;

            const parent = winEl.offsetParent || document.getElementById('kali-os-desktop') || document.body;
            const parentRect = parent.getBoundingClientRect();
            const rect = winEl.getBoundingClientRect();

            initialLeft = rect.left - parentRect.left;
            initialTop = rect.top - parentRect.top;
            initialWidth = rect.width;
            initialHeight = rect.height;

            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', stopResize);
            window.addEventListener('pointercancel', stopResize);
        });
    }

    // --------------- Desktop Icons Dragging & Clicks -----
    function initDesktopIcons() {
        const iconCv = document.getElementById('icon-cv');
        const iconReel = document.getElementById('icon-reel');
        const iconProjects = document.getElementById('icon-projects');
        const iconContact = document.getElementById('icon-contact');
        const iconTrash = document.getElementById('icon-trash');

        const map = [
            { el: iconCv, key: 'cv' },
            { el: iconProjects, key: 'projects' },
            { el: iconReel, key: 'reel' },
            { el: iconContact, key: 'contact' },
        ];

        map.forEach(item => {
            if (!item.el) return;

            // Single click selects, double click or enter opens
            let lastTap = 0;
            item.el.addEventListener('click', (e) => {
                const now = Date.now();
                const isDouble = (now - lastTap) < 320;
                lastTap = now;

                document.querySelectorAll('.kali-desktop-icon').forEach(ic => ic.classList.remove('is-selected'));
                item.el.classList.add('is-selected');

                // If mobile or double-clicked, open window
                if (isDouble || window.innerWidth <= 768) {
                    openWindow(item.key);
                }
            });

            item.el.addEventListener('dblclick', () => {
                openWindow(item.key);
            });

            item.el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openWindow(item.key);
                }
            });

            // Draggable desktop icon
            setupIconDragging(item.el);
        });

        if (iconTrash) {
            let lastTapTrash = 0;
            iconTrash.addEventListener('click', () => {
                const now = Date.now();
                const isDouble = (now - lastTapTrash) < 320;
                lastTapTrash = now;

                document.querySelectorAll('.kali-desktop-icon').forEach(ic => ic.classList.remove('is-selected'));
                iconTrash.classList.add('is-selected');

                if (isDouble) {
                    alert("Trash is empty.");
                }
            });
            iconTrash.addEventListener('dblclick', () => {
                alert("Trash is empty.");
            });
            iconTrash.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alert("Trash is empty.");
                }
            });
            setupIconDragging(iconTrash);
        }

        // Deselect icons when clicking empty canvas
        const desktopCanvas = document.getElementById('kali-os-desktop');
        if (desktopCanvas) {
            desktopCanvas.addEventListener('pointerdown', (e) => {
                if (!e.target.closest('.kali-desktop-icon') && !e.target.closest('.kali-window') && !e.target.closest('.kali-topbar') && !e.target.closest('.kali-os-taskbar')) {
                    document.querySelectorAll('.kali-desktop-icon').forEach(ic => ic.classList.remove('is-selected'));
                }
            });
        }
    }

    function setupIconDragging(iconEl) {
        let isDragging = false;
        let startX = 0, startY = 0;
        let startLeft = 0, startTop = 0;
        let moved = false;

        iconEl.addEventListener('pointerdown', (e) => {
            if (window.innerWidth <= 768) return; // Disable icon dragging on mobile for clean scrolling
            isDragging = true;
            moved = false;
            startX = e.clientX;
            startY = e.clientY;

            const r = iconEl.getBoundingClientRect();
            startLeft = r.left;
            startTop = r.top;
            iconEl.setPointerCapture(e.pointerId);
        });

        iconEl.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
                moved = true;
                iconEl.classList.add('is-dragging');
                iconEl.style.position = 'fixed';
                iconEl.style.right = 'auto';
                iconEl.style.bottom = 'auto';
                iconEl.style.left = `${startLeft + dx}px`;
                iconEl.style.top = `${startTop + dy}px`;
            }
        });

        const stop = (e) => {
            if (isDragging) {
                isDragging = false;
                iconEl.classList.remove('is-dragging');
                try {
                    iconEl.releasePointerCapture(e.pointerId);
                } catch { }
            }
        };

        iconEl.addEventListener('pointerup', stop);
        iconEl.addEventListener('pointercancel', stop);
    }

    // --------------- Curriculum Viewer Controls ----------
    function initCvControls() {
        const zoomInBtn = document.getElementById('cv-zoom-in');
        const zoomOutBtn = document.getElementById('cv-zoom-out');
        const zoomVal = document.getElementById('cv-zoom-val');
        const sheetZoom = document.getElementById('kali-doc-sheet-zoom');

        let zoomLevel = 100;

        if (zoomInBtn && zoomOutBtn && zoomVal && sheetZoom) {
            zoomInBtn.addEventListener('click', () => {
                if (zoomLevel < 160) {
                    zoomLevel += 15;
                    applyZoom();
                }
            });

            zoomOutBtn.addEventListener('click', () => {
                if (zoomLevel > 60) {
                    zoomLevel -= 15;
                    applyZoom();
                }
            });

            function applyZoom() {
                zoomVal.textContent = `${zoomLevel}%`;
                sheetZoom.style.transform = `scale(${zoomLevel / 100})`;
                sheetZoom.style.transformOrigin = 'top center';
            }
        }
    }

    // --------------- Video Reel Controls -----------------
    function initVideoControls() {
        const vid = document.getElementById('kali-os-video');
        const playBtn = document.getElementById('video-btn-play');
        const playIcon = document.getElementById('video-play-icon');
        const playLabel = document.getElementById('video-play-label');
        const restartBtn = document.getElementById('video-btn-restart');
        const muteBtn = document.getElementById('video-btn-mute');
        const fsBtn = document.getElementById('video-btn-fs');
        const timeDisplay = document.getElementById('video-time-display');

        if (!vid) return;

        function updatePlayState() {
            if (vid.paused) {
                if (playIcon) playIcon.innerHTML = '&#9654;';
                if (playLabel) playLabel.textContent = 'Play';
            } else {
                if (playIcon) playIcon.innerHTML = '&#10074;&#10074;';
                if (playLabel) playLabel.textContent = 'Pause';
            }
        }

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                if (vid.paused) vid.play();
                else vid.pause();
                updatePlayState();
            });
        }

        vid.addEventListener('play', updatePlayState);
        vid.addEventListener('pause', updatePlayState);

        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                vid.currentTime = 0;
                vid.play();
            });
        }

        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                vid.muted = !vid.muted;
                muteBtn.innerHTML = vid.muted ? '&#128263; Unmute' : '&#128266; Mute';
            });
        }

        if (fsBtn) {
            fsBtn.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                    vid.requestFullscreen().catch(() => { });
                } else {
                    document.exitFullscreen().catch(() => { });
                }
            });
        }

        vid.addEventListener('timeupdate', () => {
            if (!timeDisplay) return;
            const cur = formatTime(vid.currentTime);
            const dur = formatTime(vid.duration || 0);
            timeDisplay.textContent = `${cur} / ${dur}`;
        });

        function formatTime(sec) {
            const m = Math.floor(sec / 60);
            const s = Math.floor(sec % 60);
            return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
    }

    // --------------- Projects & Hobbies Data (Virgil Abloh public---domain style) ---------------
    const PROJECT_FOLDERS = [
        {
            id: "aether",
            name: "AETHER",
            displayPath: "AETHER",
            category: "Jewelry, 2025",
            portfolioLink: "index.html#project-0",
            description: "Collezione capsule di anelli scultorei in argento 925 e titanio stampato in 3D.",
            files: [
                {
                    name: "ath_01.jpg",
                    type: "image",
                    subType: "JPEG image",
                    src: "images/aether/ath_01.jpg",
                    size: "1.3 MB",
                    sizeBytes: "1326546",
                    created: "5/29/2024, 12:09:41 AM",
                    modified: "5/29/2024, 12:09:41 AM",
                    contentType: "image/jpeg",
                    dimensions: "1920 × 2400",
                    caption: "ATH_01.JPG — Scultura indossabile in titanio 3D"
                },
                {
                    name: "ath_02.jpg",
                    type: "image",
                    subType: "JPEG image",
                    src: "images/aether/ath_02.jpg",
                    size: "1.0 MB",
                    sizeBytes: "1019224",
                    created: "5/29/2024, 12:10:20 AM",
                    modified: "5/29/2024, 12:10:20 AM",
                    contentType: "image/jpeg",
                    dimensions: "1920 × 2400",
                    caption: "ATH_02.JPG — Prototipo e finitura manuale"
                },
                {
                    name: "ath_03.jpg",
                    type: "image",
                    subType: "JPEG image",
                    src: "images/aether/ath_03.jpg",
                    size: "1.1 MB",
                    sizeBytes: "1099472",
                    created: "5/29/2024, 12:10:46 AM",
                    modified: "5/29/2024, 12:10:46 AM",
                    contentType: "image/jpeg",
                    dimensions: "1920 × 2400",
                    caption: "ATH_03.JPG — Dettaglio texture organica"
                },
                {
                    name: "ath_04.jpg",
                    type: "image",
                    subType: "JPEG image",
                    src: "images/aether/ath_04.jpg",
                    size: "1.0 MB",
                    sizeBytes: "1053625",
                    created: "5/29/2024, 12:11:39 AM",
                    modified: "5/29/2024, 12:11:39 AM",
                    contentType: "image/jpeg",
                    dimensions: "1920 × 2400",
                    caption: "ATH_04.JPG — Studio di proporzioni"
                },
                {
                    name: "ath_05.jpg",
                    type: "image",
                    subType: "JPEG image",
                    src: "images/aether/ath_05.jpg",
                    size: "890 KB",
                    sizeBytes: "890356",
                    created: "5/29/2024, 12:12:02 AM",
                    modified: "5/29/2024, 12:12:02 AM",
                    contentType: "image/jpeg",
                    dimensions: "1920 × 2400",
                    caption: "ATH_05.JPG — Anello Aether 925"
                }
            ]
        },
        {
            id: "nomod",
            name: "NOMOD",
            displayPath: "NOMOD",
            category: "Product Design, 2025",
            portfolioLink: "index.html#project-1",
            description: "Sistema di oggetti monolitici per la casa e l'illuminazione da tavolo in alluminio anodizzato e vetro borosilicato.",
            files: [
                {
                    name: "nmd_01.jpg",
                    type: "image",
                    subType: "JPEG image",
                    src: "images/nomod/nmd_01.jpg",
                    size: "1.4 MB",
                    sizeBytes: "1370370",
                    created: "5/29/2024, 12:27:05 AM",
                    modified: "5/29/2024, 12:27:05 AM",
                    contentType: "image/jpeg",
                    dimensions: "1920 × 2400",
                    caption: "NMD_01.JPG — Lampada monolitica da tavolo"
                },
                {
                    name: "nmd_02.jpg",
                    type: "image",
                    subType: "JPEG image",
                    src: "images/nomod/nmd_02.jpg",
                    size: "1.4 MB",
                    sizeBytes: "1398243",
                    created: "5/29/2024, 12:27:33 AM",
                    modified: "5/29/2024, 12:27:33 AM",
                    contentType: "image/jpeg",
                    dimensions: "1920 × 2400",
                    caption: "NMD_02.JPG — Dettaglio alluminio spazzolato"
                },
                {
                    name: "nmd_03.jpg",
                    type: "image",
                    subType: "JPEG image",
                    src: "images/nomod/nmd_03.jpg",
                    size: "1.5 MB",
                    sizeBytes: "1487063",
                    created: "5/29/2024, 12:28:01 AM",
                    modified: "5/29/2024, 12:28:01 AM",
                    contentType: "image/jpeg",
                    dimensions: "1920 × 2400",
                    caption: "NMD_03.JPG — Diffusore vetro borosilicato"
                },
                {
                    name: "nmd_04.jpg",
                    type: "image",
                    subType: "JPEG image",
                    src: "images/nomod/nmd_04.jpg",
                    size: "1.8 MB",
                    sizeBytes: "1794166",
                    created: "5/29/2024, 12:28:42 AM",
                    modified: "5/29/2024, 12:28:42 AM",
                    contentType: "image/jpeg",
                    dimensions: "1920 × 2400",
                    caption: "NMD_04.JPG — Vista d'insieme collezione"
                }
            ]
        },
        {
            id: "luca",
            name: "LUCA",
            displayPath: "LUCA",
            category: "Eyewear & Hardware, 2024",
            portfolioLink: "index.html#project-2",
            description: "Dettagli metallici delle cerniere e struttura delle montature in acetato, tra ingegneria di precisione e moda.",
            files: [
                {
                    name: "luca_01.jpg",
                    type: "image",
                    subType: "JPEG image",
                    src: "images/luca/luca_01.jpg",
                    size: "1.4 MB",
                    sizeBytes: "1374229",
                    created: "5/29/2024, 1:07:21 AM",
                    modified: "5/29/2024, 1:07:21 AM",
                    contentType: "image/jpeg",
                    dimensions: "1920 × 2400",
                    caption: "LUCA_01.JPG — Montatura e cerniere custom"
                },
                {
                    name: "luca_02.jpg",
                    type: "image",
                    subType: "JPEG image",
                    src: "images/luca/luca_02.jpg",
                    size: "1.1 MB",
                    sizeBytes: "1129112",
                    created: "5/29/2024, 1:07:42 AM",
                    modified: "5/29/2024, 1:07:42 AM",
                    contentType: "image/jpeg",
                    dimensions: "1920 × 2400",
                    caption: "LUCA_02.JPG — Vista profilo acetato lucido"
                },
                {
                    name: "luca_03.jpg",
                    type: "image",
                    subType: "JPEG image",
                    src: "images/luca/luca_03.jpg",
                    size: "1.3 MB",
                    sizeBytes: "1269051",
                    created: "5/29/2024, 1:08:38 AM",
                    modified: "5/29/2024, 1:08:38 AM",
                    contentType: "image/jpeg",
                    dimensions: "1920 × 2400",
                    caption: "LUCA_03.JPG — Ingegneria cerniera a filo"
                }
            ]
        },
        {
            id: "hobbies",
            name: "HOBBIES",
            displayPath: "HOBBIES",
            category: "Personal Experiments, 2024-2026",
            portfolioLink: "index.html",
            description: "Sperimentazioni materiche personali: prototipazione rapida, scultura 3D, fotografia analogica 35mm e riparazione tech.",
            files: [
                {
                    name: "analogue_35mm_street.jpg",
                    type: "image",
                    subType: "JPEG image",
                    src: "images/aether/ath_02.jpg",
                    size: "1.2 MB",
                    sizeBytes: "1254300",
                    created: "10/12/2025, 3:15:20 PM",
                    modified: "10/12/2025, 3:15:20 PM",
                    contentType: "image/jpeg",
                    dimensions: "1920 × 2400",
                    caption: "Fotografia analogica 35mm — Architettura e ombre"
                },
                {
                    name: "3d_sculpture_generative.obj",
                    type: "model",
                    subType: "3D Wavefront OBJ",
                    src: "images/aether/ath_04.jpg",
                    size: "4.8 MB",
                    sizeBytes: "4982110",
                    created: "10/12/2025, 4:18:22 PM",
                    modified: "10/12/2025, 4:18:22 PM",
                    contentType: "model/obj",
                    dimensions: "Mesh 3D (Vertices: 48k)",
                    caption: "Scultura 3D generativa — Mesh organica per resina"
                },
                {
                    name: "custom_hardware_modding.jpg",
                    type: "image",
                    subType: "JPEG image",
                    src: "images/luca/luca_02.jpg",
                    size: "1.6 MB",
                    sizeBytes: "1642100",
                    created: "11/04/2025, 6:40:11 PM",
                    modified: "11/04/2025, 6:40:11 PM",
                    contentType: "image/jpeg",
                    dimensions: "1920 × 2400",
                    caption: "Custom PC & Hardware Modding — Assemblaggio e circuiti"
                },
                {
                    name: "upcycling_tech_lab.jpg",
                    type: "image",
                    subType: "JPEG image",
                    src: "images/nomod/nmd_02.jpg",
                    size: "2.1 MB",
                    sizeBytes: "2198400",
                    created: "01/18/2026, 2:10:45 PM",
                    modified: "01/18/2026, 2:10:45 PM",
                    contentType: "image/jpeg",
                    dimensions: "1920 × 2400",
                    caption: "Upcycling Tech Project — Secondo classificato Hackathon 2023"
                }
            ]
        }
    ];

    // --------------- Virgil Abloh public---domain 3-Column Miller File Manager ---------------
    function initPublicDomainFileManager() {
        const foldersContainer = document.getElementById('pd-folders-list');
        const filesContainer = document.getElementById('pd-files-list');
        const pathLabel = document.getElementById('pd-path-label');
        const countLabel = document.getElementById('pd-item-count');
        const btnBack = document.getElementById('pd-btn-back');
        const btnFwd = document.getElementById('pd-btn-forward');

        // Column 3: Inspector / Preview elements
        const previewImg = document.getElementById('pd-preview-img');
        const previewTitle = document.getElementById('pd-preview-title');
        const previewSub = document.getElementById('pd-preview-sub');
        const metaCreated = document.getElementById('pd-meta-created');
        const metaModified = document.getElementById('pd-meta-modified');
        const metaSize = document.getElementById('pd-meta-size');
        const metaType = document.getElementById('pd-meta-type');
        const metaDims = document.getElementById('pd-meta-dims');
        const metaProject = document.getElementById('pd-meta-project');
        const previewLink = document.getElementById('pd-preview-link');
        const statusSummary = document.getElementById('pd-status-summary');

        if (!foldersContainer || !filesContainer) return;

        let activeFolderIdx = 0;
        let activeFileIdx = 0;
        let history = [0];
        let historyIdx = 0;

        function updateHistoryButtons() {
            if (btnBack) btnBack.disabled = (historyIdx <= 0);
            if (btnFwd) btnFwd.disabled = (historyIdx >= history.length - 1);
        }

        function renderFolderList() {
            foldersContainer.innerHTML = PROJECT_FOLDERS.map((f, idx) => `
                <div class="pd-folder-row ${idx === activeFolderIdx ? 'active' : ''}" data-idx="${idx}" tabindex="0" role="button" aria-selected="${idx === activeFolderIdx ? 'true' : 'false'}">
                    <span class="pd-folder-name">${escapeHTML(f.name)}</span>
                    <span class="pd-pill-count">${f.files.length}</span>
                </div>
            `).join('');

            foldersContainer.querySelectorAll('.pd-folder-row').forEach(row => {
                const handleFolderSelect = () => {
                    const idx = parseInt(row.dataset.idx, 10);
                    if (idx !== activeFolderIdx) {
                        history = history.slice(0, historyIdx + 1);
                        history.push(idx);
                        historyIdx = history.length - 1;
                        selectFolder(idx);
                    }
                };

                row.addEventListener('click', handleFolderSelect);
                row.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleFolderSelect();
                    }
                });
            });
        }

        function selectFile(fileIdx) {
            const folder = PROJECT_FOLDERS[activeFolderIdx];
            if (!folder || !folder.files || !folder.files[fileIdx]) return;

            activeFileIdx = fileIdx;
            const file = folder.files[fileIdx];

            // 1. Highlight file row in Column 2 with system blue #007aff
            const rows = filesContainer.querySelectorAll('.pd-file-row');
            rows.forEach((r, idx) => {
                if (idx === fileIdx) {
                    r.classList.add('active');
                    r.setAttribute('aria-selected', 'true');
                    // Scroll into view if needed
                    r.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                } else {
                    r.classList.remove('active');
                    r.setAttribute('aria-selected', 'false');
                }
            });

            // 2. Update Column 3 Inspector Pane
            if (previewImg) {
                previewImg.src = file.src;
                previewImg.alt = file.name;
            }
            if (previewTitle) {
                previewTitle.textContent = file.name;
            }
            if (previewSub) {
                previewSub.textContent = `${file.subType || 'JPEG image'} - ${file.size}`;
            }

            // 3. Update Key-Value Metadata Table (Exact match to reference)
            if (metaCreated) metaCreated.textContent = file.created || "5/29/2024, 12:09:41 AM";
            if (metaModified) metaModified.textContent = file.modified || file.created || "5/29/2024, 12:09:41 AM";
            if (metaSize) metaSize.textContent = file.sizeBytes || file.size;
            if (metaType) metaType.textContent = file.contentType || "image/jpeg";
            if (metaDims) metaDims.textContent = file.dimensions || "1920 × 2400";
            if (metaProject) metaProject.textContent = `${folder.name} (${folder.category})`;

            // 4. Update Portfolio Action Link
            if (previewLink) {
                previewLink.href = folder.portfolioLink || 'index.html';
                const linkLabel = previewLink.querySelector('span:first-child');
                if (linkLabel) {
                    linkLabel.textContent = folder.id === 'hobbies' ? 'Esplora nel Portfolio' : 'Apri nel Portfolio';
                }
            }
        }

        function renderFilesList(folder) {
            filesContainer.innerHTML = folder.files.map((file, idx) => `
                <div class="pd-file-row ${idx === activeFileIdx ? 'active' : ''}" data-file-idx="${idx}" tabindex="0" role="button" aria-selected="${idx === activeFileIdx ? 'true' : 'false'}" title="${escapeHTML(file.name)}">
                    <div class="pd-file-left">
                        <span class="pd-file-icon" aria-hidden="true">
                            <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
                                <path d="M4 0h5.5v3.5H13V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V4.5H9a1 1 0 0 1-1-1V1H4z"/>
                            </svg>
                        </span>
                        <span class="pd-file-name">${escapeHTML(file.name)}</span>
                    </div>
                    <div class="pd-file-right">
                        <span class="pd-arrow-glyph" aria-hidden="true">&#9654;</span>
                    </div>
                </div>
            `).join('');

            filesContainer.querySelectorAll('.pd-file-row').forEach(row => {
                const handleSelect = () => {
                    const fIdx = parseInt(row.dataset.fileIdx, 10);
                    selectFile(fIdx);
                };

                row.addEventListener('click', handleSelect);
                row.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelect();
                    }
                });
            });
        }

        function selectFolder(idx) {
            activeFolderIdx = idx;
            activeFileIdx = 0;
            const folder = PROJECT_FOLDERS[idx];
            if (!folder) return;

            if (pathLabel) pathLabel.textContent = folder.name;
            if (countLabel) countLabel.textContent = `${folder.files.length} items`;

            if (statusSummary) {
                const totalFiles = PROJECT_FOLDERS.reduce((acc, f) => acc + f.files.length, 0);
                statusSummary.textContent = `${totalFiles} file • Archivio Progetti & Hobbies`;
            }

            renderFolderList();
            renderFilesList(folder);
            selectFile(0);
            updateHistoryButtons();
        }

        if (btnBack) {
            btnBack.addEventListener('click', () => {
                if (historyIdx > 0) {
                    historyIdx--;
                    selectFolder(history[historyIdx]);
                }
            });
        }

        if (btnFwd) {
            btnFwd.addEventListener('click', () => {
                if (historyIdx < history.length - 1) {
                    historyIdx++;
                    selectFolder(history[historyIdx]);
                }
            });
        }

        // Keyboard arrow navigation (Up/Down for files, Left/Right for folders)
        const projectsWin = document.getElementById('kali-win-projects');
        if (projectsWin) {
            projectsWin.addEventListener('keydown', (e) => {
                // Ignore if typing inside input or textarea
                if (e.target.matches('input, textarea')) return;

                const folder = PROJECT_FOLDERS[activeFolderIdx];
                if (!folder) return;

                if (e.key === 'ArrowDown') {
                    if (activeFileIdx < folder.files.length - 1) {
                        e.preventDefault();
                        selectFile(activeFileIdx + 1);
                    }
                } else if (e.key === 'ArrowUp') {
                    if (activeFileIdx > 0) {
                        e.preventDefault();
                        selectFile(activeFileIdx - 1);
                    }
                } else if (e.key === 'ArrowLeft') {
                    if (activeFolderIdx > 0) {
                        e.preventDefault();
                        history.push(activeFolderIdx - 1);
                        historyIdx = history.length - 1;
                        selectFolder(activeFolderIdx - 1);
                    }
                } else if (e.key === 'ArrowRight') {
                    if (activeFolderIdx < PROJECT_FOLDERS.length - 1) {
                        e.preventDefault();
                        history.push(activeFolderIdx + 1);
                        historyIdx = history.length - 1;
                        selectFolder(activeFolderIdx + 1);
                    }
                }
            });
        }

        // Initial selection: AETHER (folder 0, file 0)
        selectFolder(0);
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // --------------- Scattered / Side-by-Side Windows Layout ---------------
    function arrangeScatteredWindows() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const desktopH = h - 70; // 36px topbar + 34px taskbar

        const winCv = windows['cv'];
        const winProjects = windows['projects'];
        const winReel = windows['reel'];
        const winContact = windows['contact'];

        if (!winCv || !winProjects) return;

        if (w >= 1400) {
            // Large screens (Exact match to requested user composition):
            // 1. Archive in center-top
            // 2. Contacts in lower-left
            // 3. CV on right

            // Archive (Center-Top)
            if (!winProjects.hasBeenDragged && !winProjects.isMaximized) {
                const projW = Math.round(Math.min(740, w * 0.38));
                const projLeft = Math.round(w * 0.285);
                const projTop = Math.round(Math.max(46, desktopH * 0.05));
                const projH = Math.round(Math.min(590, desktopH * 0.64));
                winProjects.el.style.left = `${projLeft}px`;
                winProjects.el.style.top = `${projTop}px`;
                winProjects.el.style.width = `${projW}px`;
                winProjects.el.style.height = `${projH}px`;
            }

            // Contacts (Lower-Left, shifted slightly right)
            if (winContact && !winContact.hasBeenDragged && !winContact.isMaximized) {
                const contactW = Math.round(Math.min(390, w * 0.245));
                const contactLeft = Math.round(Math.max(80, w * 0.095));
                const contactTop = Math.round(Math.max(220, desktopH * 0.36));
                const contactH = Math.round(Math.min(460, desktopH * 0.52));
                winContact.el.style.left = `${contactLeft}px`;
                winContact.el.style.top = `${contactTop}px`;
                winContact.el.style.width = `${contactW}px`;
                winContact.el.style.height = `${contactH}px`;
            }

            // CV (Right side)
            if (!winCv.hasBeenDragged && !winCv.isMaximized) {
                const cvW = Math.round(Math.min(460, w * 0.27));
                const cvLeft = Math.round(Math.min(w - cvW - 28, w * 0.70));
                const cvTop = Math.round(Math.max(68, desktopH * 0.08));
                const cvH = Math.round(Math.min(700, desktopH * 0.76));
                winCv.el.style.left = `${cvLeft}px`;
                winCv.el.style.top = `${cvTop}px`;
                winCv.el.style.width = `${cvW}px`;
                winCv.el.style.height = `${cvH}px`;
            }
        } else if (w >= 980) {
            // Medium screens (1024 - 1399px)
            if (!winProjects.hasBeenDragged && !winProjects.isMaximized) {
                const projW = Math.round(Math.min(540, w * 0.40));
                const projLeft = Math.round(w * 0.27);
                const projTop = 44;
                const projH = Math.round(Math.min(520, desktopH * 0.63));
                winProjects.el.style.left = `${projLeft}px`;
                winProjects.el.style.top = `${projTop}px`;
                winProjects.el.style.width = `${projW}px`;
                winProjects.el.style.height = `${projH}px`;
            }

            if (winContact && !winContact.hasBeenDragged && !winContact.isMaximized) {
                const contactW = Math.round(Math.min(350, w * 0.25));
                const contactLeft = Math.round(Math.max(60, w * 0.085));
                const contactTop = Math.round(Math.max(190, desktopH * 0.38));
                const contactH = Math.round(Math.min(420, desktopH * 0.50));
                winContact.el.style.left = `${contactLeft}px`;
                winContact.el.style.top = `${contactTop}px`;
                winContact.el.style.width = `${contactW}px`;
                winContact.el.style.height = `${contactH}px`;
            }

            if (!winCv.hasBeenDragged && !winCv.isMaximized) {
                const cvW = Math.round(Math.min(390, w * 0.28));
                const cvLeft = Math.round(Math.min(w - cvW - 20, w * 0.69));
                const cvTop = Math.round(Math.max(72, desktopH * 0.09));
                const cvH = Math.round(Math.min(590, desktopH * 0.74));
                winCv.el.style.left = `${cvLeft}px`;
                winCv.el.style.top = `${cvTop}px`;
                winCv.el.style.width = `${cvW}px`;
                winCv.el.style.height = `${cvH}px`;
            }
        } else if (w > 768) {
            // Small desktop / Tablet landscape (769 - 979px)
            if (!winProjects.hasBeenDragged && !winProjects.isMaximized) {
                winProjects.el.style.left = '190px';
                winProjects.el.style.top = '40px';
                winProjects.el.style.width = `${Math.min(440, w - 210)}px`;
                winProjects.el.style.height = `${Math.min(460, desktopH * 0.58)}px`;
            }
            if (winContact && !winContact.hasBeenDragged && !winContact.isMaximized) {
                winContact.el.style.left = '45px';
                winContact.el.style.top = `${Math.round(desktopH * 0.44)}px`;
                winContact.el.style.width = '300px';
                winContact.el.style.height = `${Math.min(380, desktopH * 0.50)}px`;
            }
            if (!winCv.hasBeenDragged && !winCv.isMaximized) {
                const cvW = 300;
                winCv.el.style.left = `${w - cvW - 16}px`;
                winCv.el.style.top = '70px';
                winCv.el.style.width = `${cvW}px`;
                winCv.el.style.height = `${Math.min(500, desktopH * 0.70)}px`;
            }
        } else {
            // Mobile & small screens (w <= 768): Clean fluid vertical cascade
            [winCv, winProjects, winReel, winContact].forEach(wObj => {
                if (wObj && !wObj.hasBeenDragged) {
                    wObj.el.style.left = '';
                    wObj.el.style.top = '';
                    wObj.el.style.width = '';
                    wObj.el.style.height = '';
                }
            });
        }

        // Configure reel position if opened later by clicking icon
        if (winReel && !winReel.hasBeenDragged && !winReel.isMaximized) {
            const reelW = Math.min(480, Math.floor(w * 0.32));
            winReel.el.style.width = `${reelW}px`;
            winReel.el.style.height = `${Math.min(340, Math.floor(desktopH * 0.50))}px`;
            winReel.el.style.left = `${Math.max(20, w - reelW - 36)}px`;
            winReel.el.style.top = '60px';
        }
    }

    function openScatteredWorkspace() {
        arrangeScatteredWindows();

        // Staggered animated opening sequence: CV -> Contact -> Archive (Projects in front)
        // reel.mp4 is kept closed initially, ready to open on icon click
        const sequence = [
            { key: 'cv', delay: 40 },
            { key: 'contact', delay: 140 },
            { key: 'projects', delay: 280 }
        ];

        // Ensure reel is closed on start
        const winReel = windows['reel'];
        if (winReel) {
            winReel.el.classList.add('is-closed');
            winReel.el.classList.remove('is-focused');
            if (winReel.tab) winReel.tab.style.display = 'none';
            const vid = document.getElementById('kali-os-video');
            if (vid) vid.pause();
        }

        sequence.forEach(({ key, delay }) => {
            setTimeout(() => {
                const w = windows[key];
                if (w) {
                    w.el.classList.remove('is-closed');
                    w.el.classList.remove('is-minimized');
                    if (w.tab) w.tab.style.display = 'inline-flex';
                    bringToFront(key);
                }
            }, delay);
        });
    }

    window.addEventListener('resize', () => {
        arrangeScatteredWindows();
    });

    // --------------- macOS Spaces Desktop Switch Transition -----
    function ensureMacosHud() {
        let hud = document.getElementById('macos-spaces-hud');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'macos-spaces-hud';
            hud.className = 'macos-spaces-hud';
            hud.setAttribute('aria-hidden', 'true');
            hud.innerHTML = `
                <div class="macos-hud-pill">
                    <span class="macos-hud-icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="4" width="9" height="7" rx="1.5"></rect>
                            <rect x="13" y="4" width="9" height="7" rx="1.5"></rect>
                            <rect x="2" y="13" width="9" height="7" rx="1.5"></rect>
                            <rect x="13" y="13" width="9" height="7" rx="1.5"></rect>
                        </svg>
                    </span>
                    <span class="macos-hud-text" id="macos-hud-text">DESKTOP 1 &rarr; DESKTOP 2</span>
                    <div class="macos-hud-dots">
                        <span class="macos-hud-dot macos-dot-1" id="macos-dot-1"></span>
                        <span class="macos-hud-dot macos-dot-2 active" id="macos-dot-2"></span>
                    </div>
                </div>`;
            document.body.appendChild(hud);
        }
        return hud;
    }

    function showMacosHud(fromDesktop, toDesktop, duration = 1100) {
        const hud = ensureMacosHud();
        const text = document.getElementById('macos-hud-text');
        const dot1 = document.getElementById('macos-dot-1');
        const dot2 = document.getElementById('macos-dot-2');

        if (text) {
            text.innerHTML = `DESKTOP ${fromDesktop} &rarr; DESKTOP ${toDesktop}`;
        }
        if (dot1 && dot2) {
            if (toDesktop === 2) {
                dot1.classList.remove('active');
                dot2.classList.add('active');
            } else {
                dot2.classList.remove('active');
                dot1.classList.add('active');
            }
        }

        hud.classList.add('is-visible');
        clearTimeout(hud._timer);
        hud._timer = setTimeout(() => {
            hud.classList.remove('is-visible');
        }, duration);
    }

    function initMacosSpacesDesktopTransition() {
        // 1. Check if entering from Portfolio (Desktop 1 -> Desktop 2)
        const pendingTrans = sessionStorage.getItem('macos_space_transition');
        if (pendingTrans === 'to_about') {
            document.documentElement.dataset.vtDirection = 'forward';
            sessionStorage.removeItem('macos_space_transition');
            showMacosHud(1, 2, 1000);
        }

        // 2. Set Workspace 2 as active in taskbar switch
        const wsButtons = document.querySelectorAll('.kali-workspace-switch .kali-ws-btn');
        if (wsButtons.length >= 2) {
            wsButtons[0].classList.remove('active');
            wsButtons[1].classList.add('active');
            wsButtons[0].setAttribute('title', 'Passa a Desktop 1 (Home)');
            wsButtons[0].style.cursor = 'pointer';

            // Clicking Workspace 1 switches back to Desktop 1
            wsButtons[0].addEventListener('click', (e) => {
                e.preventDefault();
                navigateBackToPortfolio();
            });
        }

        function navigateBackToPortfolio(targetUrl = 'index.html') {
            document.documentElement.dataset.vtDirection = 'backward';
            sessionStorage.setItem('macos_space_transition', 'to_portfolio');
            showMacosHud(2, 1, 1400);

            if (document.startViewTransition) {
                window.location.href = targetUrl;
            } else {
                document.body.classList.add('macos-space-slide-out-right');
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 460);
            }
        }

        // 3. Intercept all links back to Portfolio (index.html)
        const backLinks = document.querySelectorAll('a[href="index.html"], a[href^="index.html#"], .kali-topbar-back');
        backLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                e.preventDefault();
                const href = link.getAttribute('href') || 'index.html';
                navigateBackToPortfolio(href);
            });
        });
    }

    // --------------- Contact Window Actions -----------------
    function initContactWindowActions() {
        const copyBtn = document.getElementById('copy-email-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText('lorenzokraja99@gmail.com').then(() => {
                    copyBtn.textContent = 'COPIATO!';
                    copyBtn.classList.add('copied');
                    setTimeout(() => {
                        copyBtn.textContent = 'COPIA';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                }).catch(() => {
                    copyBtn.textContent = 'COPIATO!';
                    setTimeout(() => {
                        copyBtn.textContent = 'COPIA';
                    }, 2000);
                });
            });
        }

        // Auto-open if URL has #contact
        if (window.location.hash === '#contact' || window.location.search.includes('contact')) {
            setTimeout(() => {
                openWindow('contact');
            }, 300);
        }
    }

    // --------------- Document Ready ---------------------
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        initClock();
        initWindows();
        initDesktopIcons();
        initCvControls();
        initVideoControls();
        initPublicDomainFileManager();
        initContactWindowActions();
        initMacosSpacesDesktopTransition();

        // Open scattered side-by-side workspace on entering about
        openScatteredWorkspace();
    });

})();
