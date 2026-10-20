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

// --------------- Build Page --------------------------------
function buildPage() {
    const app = document.getElementById("app");

    app.innerHTML = `
        <!-- TOP BAR -->
        <nav class="nb-top-nav">
            <div class="nb-nav-col-1">
                <a href="index.html" class="nb-nav-home-link" aria-label="Torna alla Home">${escapeHTML(CONFIG.designerName)}</a>
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

        <!-- MOTION REEL (A FILO CON LA TOP NAVBAR / FULLSCREEN RICK OWENS STYLE) -->
        <section class="nb-reel nb-reel-fullscreen">
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
