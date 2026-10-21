/* ============================================================
   PORTFOLIO — Main JavaScript
   ============================================================ */

// --------------- Configuration (easy to edit) ---------------
const CONFIG = {
    designerName: "Lorenzo Kraja",
    timezoneLabel: "RM",
    timezoneIANA: "Europe/Rome",
    bioText:
        "Product \u0026 Jewelry designer che esplora l\u2019intersezione tra materia, scultura indossabile e design industriale.",
    motionReel: "images/reel/reel.mp4",     // Inserisci il tuo video in images/reel/reel.mp4 (o lascia vuoto "")
    reelPoster: "images/reel/poster.jpg",   // Inserisci la copertina in images/reel/poster.jpg
    curriculumPdf: "assets/cv_lorenzo_kraja.pdf", // Curriculum PDF
    footerLeft: "Instagram, LinkedIn, Email",
    footerCenter: "\u00A9 2026",
    footerRight: "All rights reserved",
};

const PROJECTS = [
    {
        title: "Aether",
        meta: "Jewelry, 2025",
        description:
            "In questo progetto abbiamo sviluppato \u201CAether\u201D, una collezione capsule di anelli scultorei in argento 925 e titanio stampato in 3D. L\u2019obiettivo era comunicare un senso di sensibilit\u00E0 raffinata ed estetica futuristica, esprimendo morbidezza attraverso forme organiche ispirate al design industriale.",
        items: [
            {
                image: "images/aether/ath_01.jpg",
                caption: "ATH_01.JPG",
                aspect: "tall",
                overlayLeft: "AETHER",
                overlayCenter: "SCULTURA INDOSSABILE",
                overlayRight: "2025",
            },
            {
                image: "images/aether/ath_02.jpg",
                caption: "ATH_02.JPG",
                aspect: "landscape",
            },
            {
                image: "images/aether/ath_03.jpg",
                caption: "ATH_03.JPG",
                aspect: "tall",
            },
            {
                image: "images/aether/ath_04.jpg",
                caption: "ATH_04.JPG",
                aspect: "landscape",
            },
            {
                image: "images/aether/ath_05.jpg",
                caption: "ATH_05.JPG",
                aspect: "tall",
            },
        ],
    },
    {
        title: "NOMOD",
        meta: "Product Design, 2025",
        description:
            "NOMOD ci ha contattato per progettare un sistema di oggetti monolitici per la casa e l\u2019illuminazione da tavolo. Il prodotto doveva apparire audace e contemporaneo, utilizzando alluminio anodizzato spazzolato e vetro borosilicato per una comunit\u00E0 che apprezza sia la sperimentazione materica che il rigore formale.",
        items: [
            {
                image: "images/nomod/nmd_01.jpg",
                caption: "NMD_01.JPG",
                aspect: "landscape",
            },
            {
                image: "images/nomod/nmd_02.jpg",
                caption: "NMD_02.JPG",
                aspect: "tall",
            },
            {
                image: "images/nomod/nmd_03.jpg",
                caption: "NMD_03.JPG",
                aspect: "landscape",
            },
            {
                image: "images/nomod/nmd_04.jpg",
                caption: "NMD_04.JPG",
                aspect: "tall",
            },
        ],
    },
    {
        title: "Luca",
        meta: "Eyewear & Hardware, 2024",
        description:
            "Per Luca, un brand di lifestyle ed eyewear, abbiamo disegnato i dettagli metallici delle cerniere e la struttura delle montature in acetato. Il cliente voleva posizionarsi all\u2019intersezione tra moda, ingegneria di precisione e cultura contemporanea.",
        items: [
            {
                image: "images/luca/luca_01.jpg",
                caption: "LUCA_01.JPG",
                aspect: "tall",
            },
            {
                image: "images/luca/luca_02.jpg",
                caption: "LUCA_02.JPG",
                aspect: "landscape",
            },
            {
                image: "images/luca/luca_03.jpg",
                caption: "LUCA_03.JPG",
                aspect: "landscape",
            },
        ],
    },
];

// --------------- Live Clock --------------------------------
function startClock() {
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
                }).format(now) +
                " " +
                CONFIG.timezoneLabel;
        } catch {
            el.textContent = "08:22:30 " + CONFIG.timezoneLabel;
        }
    };

    tick();
    setInterval(tick, 1000);
}

// --------------- Render helpers ----------------------------
function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function renderMediaItem(item) {
    const aspect = item.aspect || "tall";
    const overlay =
        item.overlayLeft
            ? `<div class="nb-overlay-text">
                   <span>${escapeHTML(item.overlayLeft || "")}</span>
                   <span>${escapeHTML(item.overlayCenter || "")}</span>
                   <span>${escapeHTML(item.overlayRight || "")}</span>
               </div>`
            : "";

    return `
        <div class="nb-media-item">
            <div class="nb-media-box nb-aspect-${aspect}">
                ${item.image ? `<img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.caption || "")}" loading="lazy">` : ""}
                ${overlay}
            </div>
            <span class="nb-caption">${escapeHTML(item.caption || "")}</span>
        </div>`;
}

function renderProject(proj, idx) {
    const items = proj.items || [];
    const allItems = items.map(renderMediaItem).join("");

    // Split meta into category and year (e.g. "Jewelry, 2025")
    const metaParts = (proj.meta || "").split(",").map(s => s.trim());
    const category = metaParts[0] || "";
    const year = metaParts[1] || "";

    const metaHtml = `
        <span class="nb-meta-title">${escapeHTML(proj.title)}</span>
        ${category ? `<span class="nb-meta-sep">,</span><span class="nb-meta-category">${escapeHTML(category)}</span>` : ""}
        ${year ? `<span class="nb-meta-sep">,</span><span class="nb-meta-year">${escapeHTML(year)}</span>` : ""}
    `;

    return `
        <section class="nb-project" id="project-${idx}" data-project="${idx}">
            <div class="nb-project-details">
                <div class="nb-project-meta">${metaHtml}</div>
                <div class="nb-project-description">${escapeHTML(proj.description)}</div>
            </div>

            <div class="nb-media-container">
                <div class="nb-media-track" data-track="${idx}">
                    ${allItems}
                </div>
            </div>
        </section>`;
}

function renderReel() {
    const videoSrc = escapeHTML(CONFIG.motionReel || "images/reel/reel.mp4");
    const posterAttr = CONFIG.reelPoster ? `poster="${escapeHTML(CONFIG.reelPoster)}"` : "";

    return `
        <div class="nb-reel-video-wrap">
            <video class="nb-fullscreen-reel"
                   src="${videoSrc}"
                   ${posterAttr}
                   autoplay muted loop playsinline
                   aria-label="Lorenzo Kraja Motion Reel"
                   onerror="this.style.display='none'; const fb = this.nextElementSibling; if(fb) fb.style.display='flex';"></video>
            <div class="nb-reel-placeholder" style="display:none;" aria-label="Placeholder motion reel">
                <div class="nb-reel-placeholder-inner">
                    <div class="nb-reel-placeholder-title">reel.mp4</div>
                    <div class="nb-reel-placeholder-text">
                        Inserisci il file video in <strong>images/reel/reel.mp4</strong>.
                    </div>
                </div>
            </div>
        </div>`;
}

// --------------- Render Hero Windows (Kali OS Style) -------
function renderHeroWindow(project, idx, customClass = "") {
    const firstItem = project.items && project.items[0];
    const imgSrc = firstItem ? escapeHTML(firstItem.image) : "";
    const winId = "hero-win-" + idx;
    const fileSlug = (project.title || "project").toLowerCase().replace(/[^a-z0-9]/g, "_") + ".prj";

    return `
        <div class="fg-hero-window ${customClass}" id="${winId}">
            <!-- 1. Titlebar (macOS Style: subtle silver-gray gradient, centered title, traffic light buttons on left) -->
            <div class="kali-titlebar">
                <div class="kali-controls">
                    <span class="kali-btn kali-btn-close" aria-label="Chiudi" title="Chiudi"></span>
                    <span class="kali-btn kali-btn-min" aria-label="Riduci a icona" title="Riduci a icona"></span>
                    <span class="kali-btn kali-btn-max" aria-label="Ingrandisci" title="Ingrandisci"></span>
                </div>
                <div class="kali-title-info">
                    <span class="kali-title-text">${escapeHTML(fileSlug)} — Project Viewer</span>
                </div>
                <div class="kali-titlebar-spacer" aria-hidden="true"></div>
            </div>

            <!-- 2. Menubar (XFCE Style) -->
            <div class="kali-menubar">
                <span class="kali-menu-item">File</span>
                <span class="kali-menu-item">Edit</span>
                <span class="kali-menu-item">View</span>
                <span class="kali-menu-item">Go</span>
                <span class="kali-menu-item">Help</span>
            </div>

            <!-- 3. Toolbar -->
            <div class="kali-nav-toolbar">
                <div class="kali-tool-group">
                    <a href="#project-${idx}" class="kali-tb-btn fg-window-view-btn" title="Vai al progetto">
                        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M12 9v4H3V4h4M9 3h4v4M13 3L7 9" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span class="kali-tb-label">Vedi Progetto</span>
                    </a>
                </div>
                <div class="kali-tb-sep"></div>
                <div class="kali-tool-group kali-tb-right">
                    <span class="kali-tb-info">${escapeHTML(project.meta || "")}</span>
                </div>
            </div>

            <!-- 4. Content Area -->
            <a href="#project-${idx}" class="fg-hero-window-content" aria-label="Esplora ${escapeHTML(project.title)}">
                ${imgSrc ? `<img src="${imgSrc}" alt="${escapeHTML(project.title)}" loading="lazy" draggable="false">` : `<div class="fg-hero-window-placeholder">${escapeHTML(project.title)}</div>`}
                <span class="fg-window-badge">ESPLORA &rarr;</span>
            </a>

            <!-- 5. Statusbar -->
            <div class="kali-statusbar">
                <div class="kali-status-left">
                    <span>${escapeHTML(project.title)}</span>
                    <span class="kali-status-sep">&bull;</span>
                    <span>${escapeHTML(project.meta || "")}</span>
                </div>
                <div class="kali-status-right">
                    <span>Lorenzo Kraja OS</span>
                </div>
            </div>
        </div>`;
}

// --------------- Build Page --------------------------------
function buildPage() {
    const app = document.getElementById("app");

    // Pick first 2 projects for hero windows
    const heroProjects = PROJECTS.slice(0, 2);

    app.innerHTML = `
        <!-- TOP BAR -->
        <nav class="nb-top-nav">
            <div class="nb-nav-col-1">
                <a href="index.html" class="nb-nav-home-link" aria-label="Torna alla Home">
                    <span class="nb-nav-home-text">${escapeHTML(CONFIG.designerName)}</span>
                    <span class="nb-nav-logo-dock" id="nb-nav-logo-dock" aria-label="Lorenzo Kraja Home">
                        <img src="assets/lorenzo-spinning.gif" alt="Lorenzo Kraja" class="nb-dock-gif nb-dock-light" draggable="false">
                        <img src="assets/lorenzo-spinning-dark.gif" alt="Lorenzo Kraja" class="nb-dock-gif nb-dock-dark" draggable="false">
                    </span>
                </a>
            </div>
            <div class="nb-nav-col-3">
                <a href="about.html" class="nb-nav-about-link">About</a>
            </div>
            <div class="nb-nav-col-4">
                <a href="#contact" class="nb-nav-contact-link">Contact</a>
                <div class="nb-clock-toggle-wrap">
                    <span id="live-clock"></span>
                    <button id="theme-toggle" class="nb-theme-toggle" aria-label="Cambia tema chiaro / scuro" title="Tema chiaro / scuro">
                        <span class="nb-theme-icon-wrap">
                            <svg viewBox="0 0 512 512" width="20" height="20" fill="currentColor" class="nb-theme-icon nb-theme-icon-sun" aria-hidden="true">
                                <circle cx="256" cy="256" r="128"/>
                                <g>
                                    <rect x="230" y="0" width="52" height="91" rx="26"/>
                                    <rect x="230" y="0" width="52" height="91" rx="26" transform="rotate(45 256 256)"/>
                                    <rect x="230" y="0" width="52" height="91" rx="26" transform="rotate(90 256 256)"/>
                                    <rect x="230" y="0" width="52" height="91" rx="26" transform="rotate(135 256 256)"/>
                                    <rect x="230" y="0" width="52" height="91" rx="26" transform="rotate(180 256 256)"/>
                                    <rect x="230" y="0" width="52" height="91" rx="26" transform="rotate(225 256 256)"/>
                                    <rect x="230" y="0" width="52" height="91" rx="26" transform="rotate(270 256 256)"/>
                                    <rect x="230" y="0" width="52" height="91" rx="26" transform="rotate(315 256 256)"/>
                                </g>
                            </svg>
                            <svg viewBox="0 0 512 512" width="20" height="20" fill="currentColor" class="nb-theme-icon nb-theme-icon-moon" aria-hidden="true">
                                <path d="M 129 3 L 125 5 L 123 7 L 113 13 L 109 16 L 104 20 L 99 24 L 93 29 L 69 53 L 63 60 L 59 65 L 55 70 L 52 74 L 40 92 L 37 97 L 32 106 L 25 120 L 21 129 L 19 134 L 16 142 L 14 148 L 11 157 L 9 164 L 8 168 L 7 172 L 4 187 L 3 193 L 2 199 L 1 208 L 0 220 L 0 252 L 1 264 L 2 272 L 3 279 L 4 285 L 5 290 L 6 295 L 10 311 L 12 318 L 15 327 L 18 335 L 20 340 L 22 345 L 27 356 L 30 362 L 36 373 L 39 378 L 44 386 L 46 389 L 48 392 L 53 399 L 56 403 L 60 408 L 64 413 L 71 421 L 90 440 L 97 446 L 103 451 L 108 455 L 112 458 L 119 463 L 122 465 L 125 467 L 133 472 L 140 476 L 153 483 L 166 489 L 171 491 L 176 493 L 184 496 L 187 497 L 190 498 L 200 501 L 216 505 L 221 506 L 226 507 L 232 508 L 239 509 L 247 510 L 259 511 L 291 511 L 303 510 L 312 509 L 318 508 L 324 507 L 339 504 L 343 503 L 354 500 L 360 498 L 369 495 L 377 492 L 382 490 L 391 486 L 405 479 L 414 474 L 419 471 L 425 467 L 434 461 L 441 456 L 446 452 L 451 448 L 458 442 L 481 419 L 487 412 L 491 407 L 495 402 L 498 398 L 508 382 L 510 379 L 508 380 L 506 381 L 504 383 L 496 387 L 482 394 L 475 397 L 470 399 L 462 402 L 450 406 L 443 408 L 431 411 L 416 414 L 409 415 L 402 416 L 392 417 L 347 417 L 337 416 L 330 415 L 324 414 L 318 413 L 313 412 L 304 410 L 300 409 L 293 407 L 283 404 L 280 403 L 272 400 L 267 398 L 262 396 L 255 393 L 249 390 L 239 385 L 230 380 L 222 375 L 210 367 L 206 364 L 202 361 L 197 357 L 192 353 L 184 346 L 165 327 L 158 319 L 154 314 L 150 309 L 147 305 L 144 301 L 136 289 L 131 281 L 126 272 L 123 266 L 118 256 L 115 249 L 113 244 L 111 239 L 108 231 L 107 228 L 104 218 L 102 211 L 101 207 L 99 198 L 98 193 L 97 187 L 96 181 L 95 174 L 94 164 L 94 119 L 95 109 L 96 102 L 97 95 L 100 80 L 103 68 L 105 61 L 109 49 L 112 41 L 114 36 L 117 29 L 121 21 L 128 7 L 130 5 L 132 1 Z"/>
                            </svg>
                        </span>
                    </button>
                    <button id="menu-toggle" class="nb-menu-toggle" aria-label="Menu di navigazione" aria-expanded="false" title="Menu">
                        <span class="nb-menu-icon" aria-hidden="true">
                            <span class="nb-menu-line nb-line-top"></span>
                            <span class="nb-menu-line nb-line-bottom"></span>
                        </span>
                    </button>
                </div>
            </div>
        </nav>

        <!-- MOBILE MENU OVERLAY / DROPDOWN -->
        <div id="mobile-menu" class="nb-mobile-menu" aria-hidden="true">
            <div class="nb-mobile-menu-inner">
                <nav class="nb-mobile-menu-nav">
                    <a href="about.html" class="nb-mobile-link">
                        <span class="nb-mobile-link-text">About</span>
                        <span class="nb-mobile-link-tag">v2.4 &rarr;</span>
                    </a>
                    <a href="#contact" class="nb-mobile-link" id="mobile-link-contact">
                        <span class="nb-mobile-link-text">Contact</span>
                        <span class="nb-mobile-link-tag">&darr;</span>
                    </a>
                </nav>
                <div class="nb-mobile-menu-footer">
                    <div class="nb-mobile-meta-item">
                        <span class="nb-mobile-meta-label">Timezone</span>
                        <span class="nb-mobile-meta-val">Europe/Rome (RM)</span>
                    </div>
                    <div class="nb-mobile-meta-item">
                        <span class="nb-mobile-meta-label">Direct</span>
                        <a href="mailto:lorenzokraja99@gmail.com" class="nb-mobile-meta-email">lorenzokraja99@gmail.com</a>
                    </div>
                </div>
            </div>
        </div>

        <!-- ============================================================
             FREE GAME HERO SECTION (Virgil Abloh public---domain Style)
             ============================================================ -->
        <section class="fg-hero">
            <!-- Row 1: Bio + Logo on Left, FROM A-Z (TOC) on Right (Matching Foto 2) -->
            <div class="fg-hero-grid">
                <!-- Left Column: Intro Bio Text + Spinning Logo GIF -->
                <div class="fg-hero-col-left">
                    <div class="fg-intro-text">
                        <p>Curious by nature and attentive to every detail, I base my work on observation and
research. I turn my constant desire to learn into new practical skills, applying them
directly to the development and growth of every project.</p>
                    </div>
                    <div class="fg-hero-logo-wrap" id="fg-hero-logo-anchor">
                        <div class="fg-hero-logo-placeholder" aria-hidden="true"></div>
                    </div>
                </div>

                <!-- Right Column: FROM A - Z (TABLE OF CONTENTS) + 2 Columns in Blue -->
                <div class="fg-hero-col-right">
                    <div class="fg-toc">
                        <div class="fg-toc-header">
                            <span class="fg-toc-label-main">FROM A - Z</span>
                            <span class="fg-toc-label-sub">(TABLE OF CONTENTS)</span>
                        </div>
                        <nav class="fg-toc-list">
                            <div class="fg-toc-col">
                                <a href="about.html" class="fg-toc-item"><span class="fg-toc-num">1.</span> ABOUT</a>
                                <a href="#contact" class="fg-toc-item fg-toc-scroll"><span class="fg-toc-num">2.</span> CONTACT</a>
                                <a href="#project-0" class="fg-toc-item fg-toc-scroll"><span class="fg-toc-num">3.</span> AETHER</a>
                            </div>
                            <div class="fg-toc-col">
                                <a href="#project-1" class="fg-toc-item fg-toc-scroll"><span class="fg-toc-num">4.</span> NOMOD</a>
                                <a href="#project-2" class="fg-toc-item fg-toc-scroll"><span class="fg-toc-num">5.</span> LUCA</a>
                                <a href="#motion-reel" class="fg-toc-item fg-toc-scroll"><span class="fg-toc-num">6.</span> MOTION REEL</a>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>

            <!-- Staggered Asymmetrical Windows matching Allegato 1 -->
            <div class="fg-hero-windows">
                ${renderHeroWindow(heroProjects[0], 0, "fg-hero-window-left")}
                ${renderHeroWindow(heroProjects[1], 1, "fg-hero-window-right")}
            </div>
        </section>

        <!-- MOTION REEL (Below Hero — Fullscreen) -->
        <section class="nb-reel nb-reel-fullscreen" id="motion-reel">
            ${renderReel()}
        </section>

        <!-- PROJECTS -->
        <main>
            ${PROJECTS.map((p, i) => renderProject(p, i)).join("")}
        </main>

        <!-- FOOTER -->
        <footer class="nb-footer" id="contact">
            <div class="nb-footer-links">
                <a href="#contact">Contact</a>
                <span class="nb-footer-sep">&bull;</span>
                <span>${escapeHTML(CONFIG.footerLeft)}</span>
            </div>
            <div>${escapeHTML(CONFIG.footerCenter)}</div>
            <div>${escapeHTML(CONFIG.footerRight)}</div>
            <div class="nb-footer-end">Imprint</div>
        </footer>
    `;

    startClock();
    bindEvents();
    bindHeroTocLinks();
    initHeroLogoDock();
}

// --------------- Hero TOC smooth scroll --------------------
function bindHeroTocLinks() {
    document.querySelectorAll(".fg-toc-scroll, .fg-window-view-btn, .fg-hero-window-content").forEach(link => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            if (href && href.startsWith("#")) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: "smooth" });
                }
            }
        });
    });

    const logoLink = document.querySelector(".fg-hero-logo-link");
    if (logoLink) {
        logoLink.addEventListener("click", (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
}

// --------------- Hero Logo Dock Animation ------------------
function initHeroLogoDock() {
    const navLink = document.querySelector('.nb-nav-home-link');
    const dock = document.getElementById('nb-nav-logo-dock');
    const heroAnchor = document.getElementById('fg-hero-logo-anchor');
    if (!navLink || !dock || !heroAnchor) return;

    document.body.classList.add('has-dock-logo');

    let deltaX = 0;
    let deltaY = 0;
    let scaleFactor = 1;
    let isInitialized = false;

    function computeMeasurements() {
        // Temporarily reset transform to measure natural sizes
        const prevTransform = dock.style.transform;
        const prevTransition = dock.style.transition;
        dock.style.transition = 'none';
        dock.style.transform = 'translate3d(0, 0, 0) scale(1)';

        const navRect = navLink.getBoundingClientRect();
        const heroRect = heroAnchor.getBoundingClientRect();

        const dockedWidth = dock.offsetWidth || (navRect.width > 0 ? navRect.width : 115);
        const heroWidth = heroAnchor.offsetWidth || heroRect.width || 580;

        scaleFactor = heroWidth / (dockedWidth || 1);

        const scrollY = window.scrollY || window.pageYOffset || 0;
        const navPageTop = navRect.top + scrollY;
        const heroPageTop = heroRect.top + scrollY;

        deltaX = heroRect.left - navRect.left;
        deltaY = heroPageTop - navPageTop;

        dock.style.transition = prevTransition;
        dock.style.transform = prevTransform;

        applyState(false);
    }

    function applyState(smooth = true) {
        const scrollY = window.scrollY || window.pageYOffset || 0;
        const shouldDock = scrollY > 28;

        if (!smooth) {
            dock.style.transition = 'none';
        } else {
            dock.style.transition = 'transform 0.46s cubic-bezier(0.16, 1, 0.3, 1)';
        }

        if (shouldDock) {
            document.body.classList.add('is-docked');
            dock.style.transform = 'translate3d(0px, 0px, 0) scale(1)';
        } else {
            document.body.classList.remove('is-docked');
            dock.style.transform = `translate3d(${deltaX.toFixed(2)}px, ${deltaY.toFixed(2)}px, 0) scale(${scaleFactor.toFixed(4)})`;
        }

        if (!smooth) {
            dock.offsetHeight;
            dock.style.transition = 'transform 0.46s cubic-bezier(0.16, 1, 0.3, 1)';
        }
    }

    computeMeasurements();
    setTimeout(() => {
        computeMeasurements();
        isInitialized = true;
    }, 60);

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!isInitialized) return;
        if (!ticking) {
            requestAnimationFrame(() => {
                applyState(true);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener('resize', () => {
        computeMeasurements();
    });

    navLink.addEventListener('click', (e) => {
        if (document.body.classList.contains('is-docked')) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    dock.addEventListener('click', (e) => {
        if (!document.body.classList.contains('is-docked')) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

// --------------- Theme & Event Handling --------------------
function initTheme() {
    const savedTheme = localStorage.getItem("portfolio_theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
    }
}

function bindEvents() {
    const toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const isDark = document.body.classList.toggle("dark-theme");
            localStorage.setItem("portfolio_theme", isDark ? "dark" : "light");
            if (window.checkNavbarContrast) window.checkNavbarContrast();
        });
    }

    const homeLink = document.querySelector(".nb-nav-home-link");
    if (homeLink) {
        homeLink.addEventListener("click", (e) => {
            const path = window.location.pathname;
            if (path.endsWith("index.html") || path.endsWith("/") || path === "") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        });
    }

    // Contact smooth scrolling for desktop
    const contactDesktopLink = document.querySelector(".nb-nav-contact-link");
    if (contactDesktopLink) {
        contactDesktopLink.addEventListener("click", (e) => {
            e.preventDefault();
            const target = document.getElementById("contact");
            if (target) {
                target.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    // Mobile Hamburger Menu
    const menuToggle = document.getElementById("menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
    const contactMobileLink = document.getElementById("mobile-link-contact");

    if (menuToggle && mobileMenu) {
        const toggleMenu = (open) => {
            const isOpen = typeof open === "boolean" ? open : !mobileMenu.classList.contains("is-open");
            mobileMenu.classList.toggle("is-open", isOpen);
            menuToggle.classList.toggle("is-open", isOpen);
            menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            mobileMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
        };

        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        if (contactMobileLink) {
            contactMobileLink.addEventListener("click", (e) => {
                e.preventDefault();
                toggleMenu(false);
                const target = document.getElementById("contact");
                if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                }
            });
        }

        // Close when clicking outside
        document.addEventListener("click", (e) => {
            if (mobileMenu.classList.contains("is-open")) {
                if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                    toggleMenu(false);
                }
            }
        });

        // Close on escape
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) {
                toggleMenu(false);
            }
        });

        // Close on resize to desktop
        window.addEventListener("resize", () => {
            if (window.innerWidth > 768 && mobileMenu.classList.contains("is-open")) {
                toggleMenu(false);
            }
        });
    }

    initNavbarContrast();
}

// --------------- Dynamic Monochrome Navbar Contrast --------
function initNavbarContrast() {
    const cols = [
        document.querySelector(".nb-nav-col-1"),
        document.querySelector(".nb-nav-col-3"),
        document.querySelector(".nb-nav-col-4")
    ];

    let ticking = false;

    function checkContrast() {
        const mediaElements = document.querySelectorAll(
            ".nb-media-box, .nb-reel, .nb-media-item img, .nb-reel video"
        );
        if (!mediaElements.length) return;

        cols.forEach(col => {
            if (!col) return;
            const r = col.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return;

            let isOverMedia = false;
            for (let i = 0; i < mediaElements.length; i++) {
                const mr = mediaElements[i].getBoundingClientRect();
                const overlapX = Math.max(0, Math.min(r.right, mr.right) - Math.max(r.left, mr.left));
                const overlapY = Math.max(0, Math.min(r.bottom, mr.bottom) - Math.max(r.top, mr.top));

                if (overlapX > 4 && overlapY > 4) {
                    isOverMedia = true;
                    break;
                }
            }

            if (isOverMedia) {
                col.classList.add("nb-contrast-invert");
            } else {
                col.classList.remove("nb-contrast-invert");
            }
        });

        ticking = false;
    }

    window.checkNavbarContrast = checkContrast;

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(checkContrast);
            ticking = true;
        }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    checkContrast();
}

// --------------- Init --------------------------------------
initTheme();
document.addEventListener("DOMContentLoaded", buildPage);
