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
    const winKeys = ['cv', 'reel', 'projects'];
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

        handleEl.addEventListener('pointerdown', (e) => {
            // Ignore if maximized or clicking control buttons
            if (windows[key].isMaximized || e.target.closest('.kali-controls') || e.target.closest('button')) {
                return;
            }

            windows[key].hasBeenDragged = true;
            bringToFront(key);
            isDragging = true;
            winEl.classList.add('is-dragging');
            handleEl.setPointerCapture(e.pointerId);

            startX = e.clientX;
            startY = e.clientY;

            // Accurate parent-relative coordinates (fixes cursor jump and top gap)
            const parent = winEl.offsetParent || document.getElementById('kali-os-desktop') || document.body;
            const parentRect = parent.getBoundingClientRect();
            const rect = winEl.getBoundingClientRect();

            initialLeft = rect.left - parentRect.left;
            initialTop = rect.top - parentRect.top;

            e.preventDefault();
        });

        handleEl.addEventListener('pointermove', (e) => {
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
        });

        const stopDrag = (e) => {
            if (isDragging) {
                isDragging = false;
                winEl.classList.remove('is-dragging');
                try {
                    handleEl.releasePointerCapture(e.pointerId);
                } catch { }
            }
        };

        handleEl.addEventListener('pointerup', stopDrag);
        handleEl.addEventListener('pointercancel', stopDrag);
        window.addEventListener('pointerup', stopDrag);
    }

    // --------------- Desktop Icons Dragging & Clicks -----
    function initDesktopIcons() {
        const iconCv = document.getElementById('icon-cv');
        const iconReel = document.getElementById('icon-reel');
        const iconProjects = document.getElementById('icon-projects');
        const iconTrash = document.getElementById('icon-trash');

        const map = [
            { el: iconCv, key: 'cv' },
            { el: iconProjects, key: 'projects' },
            { el: iconReel, key: 'reel' },
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
        const toggleBtn = document.getElementById('cv-toggle-view');
        const viewLabel = document.getElementById('cv-view-label');
        const pdfIframe = document.getElementById('kali-cv-iframe');
        const sheetContainer = document.getElementById('kali-cv-sheet');
        const zoomInBtn = document.getElementById('cv-zoom-in');
        const zoomOutBtn = document.getElementById('cv-zoom-out');
        const zoomVal = document.getElementById('cv-zoom-val');
        const sheetZoom = document.getElementById('kali-doc-sheet-zoom');

        let isSheetView = false;
        let zoomLevel = 100;

        // On mobile, default to adaptive responsive sheet for crisp reading
        if (window.innerWidth <= 768 && pdfIframe && sheetContainer) {
            isSheetView = true;
            pdfIframe.style.display = 'none';
            sheetContainer.style.display = 'flex';
            if (viewLabel) viewLabel.textContent = 'PDF Nativo';
        }

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                isSheetView = !isSheetView;
                if (isSheetView) {
                    pdfIframe.style.display = 'none';
                    sheetContainer.style.display = 'flex';
                    if (viewLabel) viewLabel.textContent = 'PDF Nativo';
                } else {
                    sheetContainer.style.display = 'none';
                    pdfIframe.style.display = 'block';
                    if (viewLabel) viewLabel.textContent = 'Vista Scheda';
                }
            });
        }

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

        if (!winCv || !winProjects) return;

        if (w >= 1400) {
            // Large screens: Archive in center-left, CV on the right (matching screenshot exactly)
            if (!winProjects.hasBeenDragged && !winProjects.isMaximized) {
                const projW = Math.min(780, Math.floor(w * 0.48));
                const projLeft = Math.max(340, Math.floor(w * 0.22));
                winProjects.el.style.left = `${projLeft}px`;
                winProjects.el.style.top = `${Math.max(60, Math.floor(desktopH * 0.14))}px`;
                winProjects.el.style.width = `${projW}px`;
                winProjects.el.style.height = `${Math.min(590, Math.floor(desktopH * 0.84))}px`;
            }

            if (!winCv.hasBeenDragged && !winCv.isMaximized) {
                const cvW = Math.min(540, Math.floor(w * 0.36));
                const cvLeft = Math.min(w - cvW - 40, Math.floor(w * 0.60));
                winCv.el.style.left = `${cvLeft}px`;
                winCv.el.style.top = `${Math.max(120, Math.floor(desktopH * 0.20))}px`;
                winCv.el.style.width = `${cvW}px`;
                winCv.el.style.height = `${Math.min(620, Math.floor(desktopH * 0.86))}px`;
            }
        } else if (w >= 980) {
            // Medium screens: Archive left/center, CV on right
            if (!winProjects.hasBeenDragged && !winProjects.isMaximized) {
                const projW = Math.min(700, Math.floor(w * 0.54));
                winProjects.el.style.left = '220px';
                winProjects.el.style.top = '40px';
                winProjects.el.style.width = `${projW}px`;
                winProjects.el.style.height = `${Math.min(560, Math.floor(desktopH * 0.84))}px`;
            }

            if (!winCv.hasBeenDragged && !winCv.isMaximized) {
                const cvW = Math.min(480, Math.floor(w * 0.40));
                const cvLeft = Math.max(20, w - cvW - 24);
                winCv.el.style.left = `${cvLeft}px`;
                winCv.el.style.top = '100px';
                winCv.el.style.width = `${cvW}px`;
                winCv.el.style.height = `${Math.min(580, Math.floor(desktopH * 0.82))}px`;
            }
        } else {
            // Mobile & small screens (w <= 768): Clean fluid vertical cascade (public---domain mobile layout)
            [winCv, winProjects, winReel].forEach(wObj => {
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

        // Staggered animated opening sequence: CV -> Archive (Projects in front)
        // reel.mp4 is kept closed on the desktop, not in playback
        const sequence = [
            { key: 'cv', delay: 40 },
            { key: 'projects', delay: 180 }
        ];

        // Ensure reel is closed and paused on start
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

    // --------------- Document Ready ---------------------
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        initClock();
        initWindows();
        initDesktopIcons();
        initCvControls();
        initVideoControls();
        initPublicDomainFileManager();

        // Open scattered side-by-side workspace on entering about
        openScatteredWorkspace();
    });

})();
