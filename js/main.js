/* ============================================================
   PORTFOLIO — Main JavaScript
   ============================================================ */

// --------------- Configuration (easy to edit) ---------------
const CONFIG = {
    designerName: "Lorenzo Kraja",
    timezoneLabel: "RM",
    timezoneIANA: "Europe/Rome",
    bioText:
        "Curious by nature and attentive to every detail, I base my work on observation and research. I turn my constant desire to learn into new practical skills, applying them directly to the development and growth of every project.",
    statementTicker:
        "Hi! My name is Lorenzo, and I'm a product and jewelry designer. I design products and accessories with meticulous attention to every detail, combining pure design with a strong focus on visual presentation and brand identity.",
    motionReel: "assets/motion-reel.mp4",
    reelPoster: "images/reel/poster.jpg",
    curriculumPdf: "assets/cv_lorenzo_kraja.pdf",
    footerLeft: "Instagram, LinkedIn, Email",
    footerCenter: "© 2026",
    footerRight: "All rights reserved",
};

const PROJECTS = [
    {
        title: "Harp Chair",
        url: "harp-chair.html",
        meta: "Product & Furniture Design, 2025",
        description:
            "Harp Chair esplora l'eleganza strutturale e la tensione formale ispirata alle corde di un'arpa. Il telaio in lega d'alluminio lavora in sinergia con cavi metallici in tensione calibrata, offrendo una seduta che unisce leggerezza visiva estrema e rigorosa solidità architettonica.",
        items: [
            {
                image: "images/harp-chair/1.jpg",
                caption: "HARP_01.JPG",
                aspect: "landscape",
                overlayLeft: "HARP CHAIR",
                overlayCenter: "FURNITURE DESIGN",
                overlayRight: "2025",
            },
            {
                image: "images/harp-chair/2.jpg",
                caption: "HARP_02.JPG",
                aspect: "landscape",
            },
            {
                image: "images/harp-chair/4.jpg",
                caption: "HARP_04.JPG",
                aspect: "landscape",
            },
            {
                image: "images/harp-chair/6.jpg",
                caption: "HARP_06.JPG",
                aspect: "landscape",
            },
            {
                image: "images/harp-chair/8.jpg",
                caption: "HARP_08.JPG",
                aspect: "landscape",
            },
        ],
    },
    {
        title: "NOMOD",
        url: "nomod.html",
        meta: "Product Design, 2025",
        description:
            "NOMOD ci ha contattato per progettare un sistema di oggetti monolitici per la casa e l’illuminazione da tavolo. Il prodotto doveva apparire audace e contemporaneo, utilizzando alluminio anodizzato spazzolato e vetro borosilicato per una comunità che apprezza sia la sperimentazione materica che il rigore formale.",
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
        url: "luca.html",
        meta: "Eyewear & Hardware, 2024",
        description:
            "Per Luca, un brand di lifestyle ed eyewear, abbiamo disegnato i dettagli metallici delle cerniere e la struttura delle montature in acetato. Il cliente voleva posizionarsi all’intersezione tra moda, ingegneria di precisione e cultura contemporanea.",
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

    const titleHtml = proj.url
        ? `<a href="${escapeHTML(proj.url)}" class="nb-project-title-link" title="Apri pagina progetto">${escapeHTML(proj.title)} &rarr;</a>`
        : `<span class="nb-meta-title">${escapeHTML(proj.title)}</span>`;

    const metaHtml = `
        ${titleHtml}
        ${category ? `<span class="nb-meta-sep">,</span><span class="nb-meta-category">${escapeHTML(category)}</span>` : ""}
        ${year ? `<span class="nb-meta-sep">,</span><span class="nb-meta-year">${escapeHTML(year)}</span>` : ""}
    `;

    // Smart placement of "full project" button:
    // Desktop (4 cols): if row full (items % 4 === 0), place under last photo (Col 4); else adjacent in next col
    // Mobile (2 cols with hero): if row full ((items - 1) % 2 === 0), place under last photo (Col 2); else adjacent in Col 2
    const numItems = items.length;
    const isDeskFull = (numItems % 4 === 0);
    const isMobFull = ((numItems - 1) % 2 === 0);

    const actionItemClass = [
        "nb-media-item",
        "nb-media-action-item",
        isDeskFull ? "nb-action-under-desk" : "nb-action-adj-desk",
        isMobFull ? "nb-action-under-mob" : "nb-action-adj-mob"
    ].join(" ");

    const actionItemHtml = `
        <div class="${actionItemClass}">
            <div class="nb-action-slot">
                <a href="${escapeHTML(proj.url || '#')}" class="nb-btn-full-project" aria-label="Visualizza progetto completo ${escapeHTML(proj.title)}">
                    <span class="nb-btn-bracket">[</span>
                    <span class="nb-btn-full-text">full project</span>
                    <span class="nb-btn-full-arrow">&rarr;</span>
                    <span class="nb-btn-bracket">]</span>
                </a>
            </div>
        </div>
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
                    ${actionItemHtml}
                </div>
            </div>
        </section>`;
}

// --------------- Render VLC Player Window (macOS Style) -----
function renderVlcWindow() {
    const videoSrc = escapeHTML(CONFIG.motionReel || "assets/motion-reel.mp4");
    const posterAttr = CONFIG.reelPoster ? `poster="${escapeHTML(CONFIG.reelPoster)}"` : "";

    return `
        <div class="kali-window kali-window-vlc fg-hero-window fg-vlc-window" id="hero-win-vlc" role="region" aria-label="reel.mp4 — VLC Media Player">
            <!-- 8 Resize Handles (4 Edges + 4 Corners) -->
            <div class="kali-resize-handle kali-resize-n" data-dir="n" aria-hidden="true"></div>
            <div class="kali-resize-handle kali-resize-s" data-dir="s" aria-hidden="true"></div>
            <div class="kali-resize-handle kali-resize-w" data-dir="w" aria-hidden="true"></div>
            <div class="kali-resize-handle kali-resize-e" data-dir="e" aria-hidden="true"></div>
            <div class="kali-resize-handle kali-resize-nw" data-dir="nw" aria-hidden="true"></div>
            <div class="kali-resize-handle kali-resize-ne" data-dir="ne" aria-hidden="true"></div>
            <div class="kali-resize-handle kali-resize-sw" data-dir="sw" aria-hidden="true"></div>
            <div class="kali-resize-handle kali-resize-se" data-dir="se" aria-hidden="true"></div>

            <!-- 1. VLC Titlebar (macOS Style with authentic VLC cone icon) -->
            <div class="kali-titlebar vlc-titlebar">
                <div class="kali-controls">
                    <button class="kali-btn kali-btn-close" type="button" aria-label="Chiudi finestra" title="Chiudi"></button>
                    <button class="kali-btn kali-btn-min" type="button" aria-label="Riduci finestra" title="Riduci a icona"></button>
                    <button class="kali-btn kali-btn-max" type="button" aria-label="Ingrandisci finestra" title="Ingrandisci"></button>
                </div>
                <div class="vlc-title-info">
                    <svg class="vlc-cone-icon" viewBox="0 0 32 32" width="16" height="16" aria-hidden="true">
                        <ellipse cx="16" cy="27" rx="13" ry="3.5" fill="#e05300"/>
                        <ellipse cx="16" cy="26" rx="12" ry="3" fill="#f58220"/>
                        <polygon points="12,5 20,5 23,24 9,24" fill="#f58220"/>
                        <polygon points="10,21 22,21 22.8,24.5 9.2,24.5" fill="#ffffff"/>
                        <polygon points="11.4,12 20.6,12 21.6,15.5 10.4,15.5" fill="#ffffff"/>
                        <ellipse cx="16" cy="5" rx="4" ry="1.5" fill="#f58220"/>
                        <ellipse cx="16" cy="4.5" rx="3.5" ry="1.2" fill="#ff9d47"/>
                    </svg>
                    <span class="vlc-title-text">reel.mp4 — VLC Media Player</span>
                </div>
                <div class="kali-titlebar-spacer" aria-hidden="true"></div>
            </div>

            <!-- 2. VLC Video Player Body (Landscape 16:9) -->
            <div class="vlc-video-container" title="Click per Riprodurre / Pausa">
                <video class="vlc-video-element"
                       id="sd-reel-video"
                       src="${videoSrc}"
                       ${posterAttr}
                       autoplay
                       muted
                       loop
                       playsinline
                       aria-label="Lorenzo Kraja Motion Reel"
                       onerror="if (this.src.indexOf('images/reel') === -1) { this.src = 'images/reel/reel.mp4'; } else { this.style.display='none'; const fb = this.nextElementSibling; if(fb) fb.style.display='flex'; }"></video>
                <div class="nb-reel-placeholder" style="display:none;" aria-label="Placeholder motion reel">
                    <div class="nb-reel-placeholder-inner">
                        <div class="nb-reel-placeholder-title">reel.mp4</div>
                        <div class="nb-reel-placeholder-text">Motion reel video preview</div>
                    </div>
                </div>
            </div>

            <!-- 3. VLC Bottom Control Toolbar (macOS VLC Style) -->
            <div class="vlc-toolbar">
                <div class="vlc-transport-btns">
                    <button type="button" class="vlc-ctrl-btn vlc-btn-play" title="Riproduci / Pausa" aria-label="Riproduci o Pausa">
                        <svg class="vlc-icon-pause" viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
                            <rect x="3" y="2" width="3.5" height="12" rx="0.8"/>
                            <rect x="9.5" y="2" width="3.5" height="12" rx="0.8"/>
                        </svg>
                        <svg class="vlc-icon-play" style="display:none;" viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
                            <polygon points="3,2 14,8 3,14"/>
                        </svg>
                    </button>
                    <button type="button" class="vlc-ctrl-btn vlc-btn-prev" title="Indietro (5s)" aria-label="Indietro">
                        <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor">
                            <rect x="1" y="3" width="2" height="10"/>
                            <polygon points="8,8 14,3 14,13"/>
                            <polygon points="3,8 9,3 9,13"/>
                        </svg>
                    </button>
                    <button type="button" class="vlc-ctrl-btn vlc-btn-stop" title="Ferma riproduzione" aria-label="Ferma">
                        <svg viewBox="0 0 16 16" width="9" height="9" fill="currentColor">
                            <rect x="2" y="2" width="12" height="12" rx="1"/>
                        </svg>
                    </button>
                    <button type="button" class="vlc-ctrl-btn vlc-btn-next" title="Avanti (5s)" aria-label="Avanti">
                        <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor">
                            <polygon points="1,3 7,8 1,13"/>
                            <polygon points="7,3 13,8 7,13"/>
                            <rect x="13" y="3" width="2" height="10"/>
                        </svg>
                    </button>
                </div>

                <!-- Timeline Scrubber -->
                <div class="vlc-scrubber-wrap">
                    <input type="range" class="vlc-scrubber" min="0" max="100" value="0" step="0.1" title="Posizione di riproduzione">
                </div>

                <!-- Time readout -->
                <div class="vlc-time-display">
                    <span class="vlc-time-current">00:00</span>
                </div>

                <!-- Volume speaker + slider -->
                <div class="vlc-volume-wrap">
                    <button type="button" class="vlc-ctrl-btn vlc-btn-volume" title="Volume / Muto" aria-label="Volume">
                        <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
                            <path d="M2 5v6h3l4 4V1L5 5H2zM12 4a5 5 0 0 1 0 8v-1.5a3.5 3.5 0 0 0 0-5V4z"/>
                        </svg>
                    </button>
                    <input type="range" class="vlc-volume-slider" min="0" max="1" step="0.05" value="0" title="Volume">
                </div>

                <!-- Fullscreen button -->
                <button type="button" class="vlc-ctrl-btn vlc-btn-fullscreen" title="Schermo intero" aria-label="Schermo intero">
                    <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor">
                        <path d="M1 1h4v1.5H2.5v2.5H1V1zm10 0h4v4h-1.5V2.5H11V1zM1 11h1.5v2.5H5V15H1v-4zm13.5 0H15v4h-4v-1.5h2.5V11z"/>
                    </svg>
                </button>
            </div>
        </div>`;
}

// --------------- Render Hero (Sophia Denison Style / Desktop OS Workspace) ---
function renderSophiaHero() {
    return `
        <section class="sd-hero-section sd-desktop-workspace" id="hero-section" aria-label="Desktop Workspace">
            <!-- Left: Works Table of Contents (Sophia Denison / Virgil Abloh style) -->
            <div class="sd-hero-left" id="sd-toc">
                <div class="sd-toc-wrap">
                    <div class="sd-toc-header">
                        <span class="sd-toc-label-main">FROM A - Z</span>
                        <span class="sd-toc-label-sub">(TABLE OF CONTENTS)</span>
                    </div>
                    <nav class="sd-toc-list" aria-label="Table of Contents">
                        <a href="#contact" class="sd-toc-item sd-toc-scroll">
                            <span class="sd-toc-num">[ 01 ]</span>
                            <span class="sd-toc-label">CONTACT</span>
                        </a>
                        <a href="#hero-win-vlc" class="sd-toc-item sd-toc-scroll">
                            <span class="sd-toc-num">[ 02 ]</span>
                            <span class="sd-toc-label">MOTION REEL</span>
                        </a>
                        <a href="#project-win-0" class="sd-toc-item sd-toc-scroll">
                            <span class="sd-toc-num">[ 03 ]</span>
                            <span class="sd-toc-label">HARP CHAIR</span>
                        </a>
                        <a href="#project-win-1" class="sd-toc-item sd-toc-scroll">
                            <span class="sd-toc-num">[ 04 ]</span>
                            <span class="sd-toc-label">NOMOD</span>
                        </a>
                        <a href="#project-win-2" class="sd-toc-item sd-toc-scroll">
                            <span class="sd-toc-num">[ 05 ]</span>
                            <span class="sd-toc-label">LUCA</span>
                        </a>
                    </nav>
                </div>
            </div>

            <!-- Unified Desktop Canvas holding the 4 Interactive OS Windows -->
            <div class="sd-desktop-canvas" id="desktop-canvas">
                <!-- 1. VLC Media Player Window (Top Center/Left) -->
                ${renderVlcWindow()}

                <!-- 2. NOMOD Window (Top Right) -->
                ${renderProjectWindow(PROJECTS[1], 1, "fg-win-nomod")}

                <!-- 3. HARP CHAIR Window (Bottom Left) -->
                ${renderProjectWindow(PROJECTS[0], 0, "fg-win-harp")}

                <!-- 4. LUCA Window (Bottom Center/Right) -->
                ${renderProjectWindow(PROJECTS[2], 2, "fg-win-luca")}
            </div>

            <!-- Right: About Link (Almost attached to right margin, Adv Scam Arrow & Blink) -->
            <div class="sd-hero-right" id="sd-about-col">
                <a href="about.html" class="sd-scam-about-link" aria-label="About Lorenzo Kraja">
                    <span class="sd-scam-about-text">ABOUT</span>
                    <span class="sd-scam-arrow-wrap" aria-hidden="true">
                        <svg class="sd-scam-arrow-svg" viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
                            <rect x="1" y="6" width="7" height="4"/>
                            <rect x="8" y="2" width="2" height="12"/>
                            <rect x="10" y="4" width="2" height="8"/>
                            <rect x="12" y="6" width="2" height="4"/>
                            <rect x="14" y="7" width="1" height="2"/>
                        </svg>
                    </span>
                </a>
            </div>
        </section>`;
}

// --------------- Render Project Windows (Showcase Cards) ----
function renderProjectWindow(project, idx, customClass = "") {
    const items = project.items || [];
    const winId = "project-win-" + idx;
    const fileSlug = (project.title || "project").toLowerCase().replace(/[^a-z0-9]/g, "_") + ".prj";

    const slidesHtml = items.map((item, i) => `
        <div class="fg-slide ${i === 0 ? 'is-active' : ''}" data-slide-index="${i}">
            <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.caption || project.title)}" loading="lazy" draggable="false">
        </div>
    `).join("");

    const totalCountStr = String(items.length).padStart(2, '0');

    return `
        <div class="fg-hero-window fg-project-window kali-window ${customClass}" id="${winId}" data-project-idx="${idx}">
            <!-- 8 Resize Handles (4 Edges + 4 Corners) -->
            <div class="kali-resize-handle kali-resize-n" data-dir="n" aria-hidden="true"></div>
            <div class="kali-resize-handle kali-resize-s" data-dir="s" aria-hidden="true"></div>
            <div class="kali-resize-handle kali-resize-w" data-dir="w" aria-hidden="true"></div>
            <div class="kali-resize-handle kali-resize-e" data-dir="e" aria-hidden="true"></div>
            <div class="kali-resize-handle kali-resize-nw" data-dir="nw" aria-hidden="true"></div>
            <div class="kali-resize-handle kali-resize-ne" data-dir="ne" aria-hidden="true"></div>
            <div class="kali-resize-handle kali-resize-sw" data-dir="sw" aria-hidden="true"></div>
            <div class="kali-resize-handle kali-resize-se" data-dir="se" aria-hidden="true"></div>

            <!-- 1. Titlebar (macOS Style Draggable Handle) -->
            <div class="kali-titlebar">
                <div class="kali-controls">
                    <button class="kali-btn kali-btn-close" type="button" aria-label="Chiudi finestra" title="Chiudi"></button>
                    <button class="kali-btn kali-btn-min" type="button" aria-label="Riduci finestra" title="Riduci a icona"></button>
                    <button class="kali-btn kali-btn-max" type="button" aria-label="Ingrandisci finestra" title="Ingrandisci"></button>
                </div>
                <div class="kali-title-info">
                    <span class="kali-title-text">${escapeHTML(project.title)} — Project Viewer</span>
                </div>
                <div class="kali-titlebar-spacer" aria-hidden="true"></div>
            </div>

            <!-- 2. Menubar (macOS / XFCE Style) -->
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
                    <a href="${escapeHTML(project.url)}" class="kali-tb-btn fg-window-view-btn" title="Apri pagina del progetto">
                        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M12 9v4H3V4h4M9 3h4v4M13 3L7 9" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span class="kali-tb-label">Full Project</span>
                    </a>
                </div>
                <div class="kali-tb-sep"></div>
                <div class="kali-tool-group">
                    <button class="kali-tb-btn fg-win-prev-btn" type="button" title="Immagine precedente" aria-label="Immagine precedente">
                        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                            <path d="M10 3L5 8l5 5V3z"/>
                        </svg>
                    </button>
                    <button class="kali-tb-btn fg-win-next-btn" type="button" title="Immagine successiva" aria-label="Immagine successiva">
                        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                            <path d="M6 3l5 5-5 5V3z"/>
                        </svg>
                    </button>
                </div>
                <div class="kali-tb-sep"></div>
                <div class="kali-tool-group kali-tb-right">
                    <span class="kali-tb-info">${escapeHTML(project.meta || "")}</span>
                </div>
            </div>

            <!-- 4. Content Area (16:9 Landscape Format, Smooth Fade Slideshow, Superimposed "FULL PROJECT" on Hover) -->
            <a href="${escapeHTML(project.url)}" class="fg-hero-window-content fg-project-slideshow" aria-label="Apri progetto: ${escapeHTML(project.title)}">
                <div class="fg-slides-track">
                    ${slidesHtml}
                </div>
                <div class="fg-slides-counter">
                    <span class="fg-slide-cur">01</span> / <span class="fg-slide-total">${totalCountStr}</span>
                </div>
                <!-- Superimposed "FULL PROJECT" Overlay on hover -->
                <div class="fg-project-overlay" aria-hidden="true">
                    <div class="fg-project-overlay-center">
                        <span class="fg-overlay-badge">FULL PROJECT</span>
                        <span class="fg-overlay-arrow">&rarr;</span>
                    </div>
                </div>
            </a>

            <!-- 5. Statusbar -->
            <div class="kali-statusbar">
                <div class="kali-status-left">
                    <span>${escapeHTML(project.title)}</span>
                    <span class="kali-status-sep">&bull;</span>
                    <span>${escapeHTML(project.meta || "")}</span>
                </div>
                <div class="kali-status-right">
                    <span>16:9 Landscape &bull; Lorenzo Kraja OS</span>
                </div>
            </div>
        </div>`;
}

// --------------- Render Projects Showcase (Alternating Left / Right Rows) ---
function renderProjectsShowcase() {
    const rows = PROJECTS.map((proj, idx) => {
        const isLeft = (idx % 2 === 0);
        const rowClass = isLeft ? "is-left" : "is-right";
        const windowMarkup = renderProjectWindow(proj, idx, isLeft ? "fg-win-stagger-left" : "fg-win-stagger-right");

        return `
            <div class="fg-project-row ${rowClass}" id="project-row-${idx}">
                <div class="fg-project-window-shell">
                    <div class="fg-project-row-stamp">
                        <span class="fg-stamp-num">0${idx + 1} //</span>
                        <span class="fg-stamp-title">${escapeHTML(proj.title.toUpperCase())}</span>
                        <span class="fg-stamp-meta">${escapeHTML(proj.meta || "")}</span>
                    </div>
                    ${windowMarkup}
                </div>
            </div>
        `;
    }).join("");

    return `
        <section class="fg-projects-showcase" id="projects-showcase" aria-label="Progetti Selezionati">
            ${rows}
        </section>
    `;
}

// --------------- Project Windows Slideshow Controller -------
function initProjectSlideshows() {
    const projectWindows = document.querySelectorAll('.fg-project-window');
    if (!projectWindows.length) return;

    projectWindows.forEach((winEl) => {
        const pIdx = parseInt(winEl.dataset.projectIdx, 10);
        const proj = PROJECTS[pIdx];
        if (!proj) return;

        const slides = Array.from(winEl.querySelectorAll('.fg-slide'));
        const totalCount = slides.length;
        if (totalCount <= 0) return;

        const curCounterEl = winEl.querySelector('.fg-slide-cur');
        const prevBtn = winEl.querySelector('.fg-win-prev-btn');
        const nextBtn = winEl.querySelector('.fg-win-next-btn');

        let currentIndex = 0;
        let autoplayTimer = null;
        let isPaused = false;

        function goToSlide(idx) {
            if (idx < 0) idx = totalCount - 1;
            if (idx >= totalCount) idx = 0;
            currentIndex = idx;

            slides.forEach((slide, i) => {
                if (i === currentIndex) {
                    slide.classList.add('is-active');
                } else {
                    slide.classList.remove('is-active');
                }
            });

            if (curCounterEl) {
                curCounterEl.textContent = String(currentIndex + 1).padStart(2, '0');
            }
        }

        function startAutoplay() {
            if (totalCount <= 1) return;
            stopAutoplay();
            autoplayTimer = setInterval(() => {
                if (!isPaused) {
                    goToSlide(currentIndex + 1);
                }
            }, 3200);
        }

        function stopAutoplay() {
            if (autoplayTimer) {
                clearInterval(autoplayTimer);
                autoplayTimer = null;
            }
        }

        // Prev & Next Toolbar Buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                goToSlide(currentIndex - 1);
                startAutoplay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                goToSlide(currentIndex + 1);
                startAutoplay();
            });
        }

        // Pause slideshow on hover to invite viewing / clicking "FULL PROJECT"
        winEl.addEventListener('mouseenter', () => {
            isPaused = true;
        });

        winEl.addEventListener('mouseleave', () => {
            isPaused = false;
        });

        // Initialize first slide and start continuous crossfade autoplay
        goToSlide(0);
        startAutoplay();
    });
}

// --------------- Render MSCHF-Style Statement Ticker ---------
function renderMschfTicker() {
    const rawText = escapeHTML(
        CONFIG.statementTicker ||
        "Hi! My name is Lorenzo, and I'm a product and jewelry designer. I design products and accessories with meticulous attention to every detail, combining pure design with a strong focus on visual presentation and brand identity."
    );
    // MSCHF Hotels ticker repetition with hyphen separator
    const itemContent = `<span>${rawText} &nbsp;-&nbsp;&nbsp;</span>`;

    return `
        <!-- MSCHF-STYLE STATEMENT MARQUEE TICKER -->
        <div class="mschf-marquee-wrap" id="home-statement-ticker" aria-label="Lorenzo Kraja statement">
            <div class="mschf-marquee-track">
                <div class="mschf-marquee-item">${itemContent}</div>
                <div class="mschf-marquee-item" aria-hidden="true">${itemContent}</div>
                <div class="mschf-marquee-item" aria-hidden="true">${itemContent}</div>
                <div class="mschf-marquee-item" aria-hidden="true">${itemContent}</div>
            </div>
        </div>
    `;
}

function initMschfMarquee() {
    const wrap = document.getElementById('home-statement-ticker');
    if (!wrap) return;
    const item = wrap.querySelector('.mschf-marquee-item');
    if (!item) return;

    function updateSpeed() {
        // Measure real rendered width of 1 item
        const width = item.getBoundingClientRect().width;
        if (width > 0) {
            // MSCHF hotels exact speed: 82.2667 px / second
            const duration = width / 82.2667;
            wrap.style.setProperty('--marquee-duration', `${duration.toFixed(2)}s`);
        }
    }

    updateSpeed();
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(updateSpeed);
    }
    window.addEventListener('resize', updateSpeed, { passive: true });
}

// --------------- Build Page --------------------------------
function buildPage() {
    const app = document.getElementById("app");

    app.innerHTML = `
        <!-- TOP BAR (Minimalist: Brand + Spinning Logo on Left, About + Live Clock & Theme on Right) -->
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
            <div class="nb-nav-col-4">
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
                    <a href="#hero-section" class="nb-mobile-link" id="mobile-link-toc">
                        <span class="nb-mobile-link-text">Table of Contents</span>
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

        <!-- HERO / DESKTOP OS WORKSPACE -->
        ${renderSophiaHero()}

        <!-- MSCHF-STYLE STATEMENT MARQUEE TICKER -->
        ${renderMschfTicker()}

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
    initVlcPlayer();
    initHeroWindows();
    initProjectSlideshows();
    initHeroLogoDock();
    initMacosSpacesTransition();
    initSiteIntro();
    initMschfMarquee();
}

// --------------- Hero TOC smooth scroll & window focus -----
function bindHeroTocLinks() {
    document.querySelectorAll(".sd-toc-scroll, .fg-toc-scroll").forEach(link => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            if (href && href.startsWith("#")) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    if (target.id === "contact") {
                        if (window.innerWidth <= 900) {
                            target.scrollIntoView({ behavior: "smooth", block: "center" });
                        } else {
                            window.location.href = "mailto:lorenzokraja99@gmail.com";
                        }
                        return;
                    }
                    const win = (target.classList.contains('kali-window') || target.classList.contains('fg-hero-window'))
                        ? target
                        : target.querySelector('.kali-window, .fg-hero-window');
                    if (win && typeof win._bringToFront === 'function') {
                        win._bringToFront();
                    } else if (win) {
                        document.querySelectorAll('.kali-window, .fg-hero-window').forEach(w => w.classList.remove('is-focused'));
                        win.classList.add('is-focused');
                    }
                    if (target.id === "hero-win-vlc") {
                        const video = target.querySelector('.vlc-video-element');
                        if (video && video.paused) {
                            video.play().catch(() => {});
                        }
                    }
                    if (window.innerWidth <= 900) {
                        target.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
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

// --------------- VLC Player Controller ---------------------
function initVlcPlayer() {
    const vlcWin = document.getElementById('hero-win-vlc');
    if (!vlcWin) return;

    const video = vlcWin.querySelector('.vlc-video-element');
    const playBtn = vlcWin.querySelector('.vlc-btn-play');
    const prevBtn = vlcWin.querySelector('.vlc-btn-prev');
    const nextBtn = vlcWin.querySelector('.vlc-btn-next');
    const stopBtn = vlcWin.querySelector('.vlc-btn-stop');
    const scrubber = vlcWin.querySelector('.vlc-scrubber');
    const timeDisplay = vlcWin.querySelector('.vlc-time-current');
    const volumeBtn = vlcWin.querySelector('.vlc-btn-volume');
    const volumeSlider = vlcWin.querySelector('.vlc-volume-slider');
    const fullscreenBtn = vlcWin.querySelector('.vlc-btn-fullscreen');
    const videoContainer = vlcWin.querySelector('.vlc-video-container');
    const iconPlay = vlcWin.querySelector('.vlc-icon-play');
    const iconPause = vlcWin.querySelector('.vlc-icon-pause');

    if (!video) return;

    function formatTime(sec) {
        if (isNaN(sec) || sec < 0) return "00:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
    }

    function updatePlayIcon() {
        if (video.paused) {
            if (iconPlay) iconPlay.style.display = 'block';
            if (iconPause) iconPause.style.display = 'none';
        } else {
            if (iconPlay) iconPlay.style.display = 'none';
            if (iconPause) iconPause.style.display = 'block';
        }
    }

    function togglePlay() {
        if (video.paused) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
        updatePlayIcon();
    }

    if (playBtn) {
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlay();
        });
    }

    if (videoContainer) {
        videoContainer.addEventListener('click', (e) => {
            if (e.target.closest('.kali-controls') || e.target.closest('.vlc-toolbar')) return;
            togglePlay();
        });
    }

    if (stopBtn) {
        stopBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            video.pause();
            video.currentTime = 0;
            if (scrubber) scrubber.value = 0;
            if (timeDisplay) timeDisplay.textContent = "00:00";
            updatePlayIcon();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            video.currentTime = Math.max(0, video.currentTime - 5);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            video.currentTime = Math.min(video.duration || 100, video.currentTime + 5);
        });
    }

    let isScrubbing = false;
    if (scrubber) {
        scrubber.addEventListener('pointerdown', () => { isScrubbing = true; });
        scrubber.addEventListener('input', () => {
            if (video.duration) {
                video.currentTime = (parseFloat(scrubber.value) / 100) * video.duration;
                if (timeDisplay) timeDisplay.textContent = formatTime(video.currentTime);
            }
        });
        const stopScrub = () => { isScrubbing = false; };
        scrubber.addEventListener('pointerup', stopScrub);
        scrubber.addEventListener('pointercancel', stopScrub);
    }

    video.addEventListener('timeupdate', () => {
        if (!isScrubbing && video.duration) {
            if (scrubber) scrubber.value = (video.currentTime / video.duration) * 100;
            if (timeDisplay) timeDisplay.textContent = formatTime(video.currentTime);
        }
        updatePlayIcon();
    });

    video.addEventListener('play', updatePlayIcon);
    video.addEventListener('pause', updatePlayIcon);

    let lastVolume = 0.8;
    if (volumeSlider) {
        volumeSlider.value = video.muted ? 0 : video.volume;
        volumeSlider.addEventListener('input', (e) => {
            e.stopPropagation();
            const val = parseFloat(volumeSlider.value);
            video.volume = val;
            video.muted = (val === 0);
            if (val > 0) lastVolume = val;
        });
    }

    if (volumeBtn) {
        volumeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            video.muted = !video.muted;
            if (volumeSlider) {
                volumeSlider.value = video.muted ? 0 : (video.volume || lastVolume);
            }
        });
    }

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            } else if (vlcWin.requestFullscreen) {
                vlcWin.requestFullscreen().catch(() => {});
            } else if (video.requestFullscreen) {
                video.requestFullscreen().catch(() => {});
            }
        });
    }
}

// --------------- Hero Windows Drag & 8-Direction Resize (VLC) -
function initHeroWindows() {
    const windows = document.querySelectorAll('.kali-window, .fg-hero-window, #hero-win-vlc');
    if (!windows.length) return;

    let highestZ = 35;

    windows.forEach((winEl) => {
        const titlebar = winEl.querySelector('.kali-titlebar') || winEl.querySelector('.vlc-titlebar');
        const contentEl = winEl.querySelector('.vlc-video-container') || winEl.querySelector('.fg-hero-window-content');
        const handles = winEl.querySelectorAll('.kali-resize-handle');

        let tx = 0;
        let ty = 0;
        let isDragging = false;
        let isResizing = false;
        let pointerMoved = false;

        const bringToFront = () => {
            highestZ += 2;
            winEl.style.zIndex = highestZ;
            document.querySelectorAll('.kali-window, .fg-hero-window').forEach(w => w.classList.remove('is-focused'));
            winEl.classList.add('is-focused');
        };
        winEl._bringToFront = bringToFront;

        winEl.addEventListener('pointerdown', () => {
            bringToFront();
        });

        // 1. Titlebar Dragging
        if (titlebar) {
            let startX = 0, startY = 0;
            let startTx = 0, startTy = 0;

            const onPointerMove = (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                tx = startTx + dx;
                ty = startTy + dy;
                winEl.style.transform = `translate3d(${Math.round(tx)}px, ${Math.round(ty)}px, 0)`;
            };

            const onPointerUp = (e) => {
                if (!isDragging) return;
                isDragging = false;
                winEl.classList.remove('is-dragging');
                document.body.classList.remove('is-window-interacting');
                try {
                    titlebar.releasePointerCapture(e.pointerId);
                } catch (_) {}
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);
                window.removeEventListener('pointercancel', onPointerUp);
            };

            titlebar.addEventListener('pointerdown', (e) => {
                if (e.target.closest('.kali-controls') || e.target.closest('button') || e.target.closest('a')) {
                    return;
                }
                bringToFront();
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                startTx = tx;
                startTy = ty;

                winEl.classList.add('is-dragging');
                document.body.classList.add('is-window-interacting');
                try {
                    titlebar.setPointerCapture(e.pointerId);
                } catch (_) {}

                window.addEventListener('pointermove', onPointerMove, { passive: false });
                window.addEventListener('pointerup', onPointerUp, { passive: false });
                window.addEventListener('pointercancel', onPointerUp, { passive: false });
                e.preventDefault();
            });
        }

        // 2. 8-Direction Resizing (Corners & Edges) with Flex-Centering Compensation
        handles.forEach(handle => {
            const dir = handle.dataset.dir;
            if (!dir) return;

            let startX = 0, startY = 0;
            let startW = 0, startH = 0;
            let startTx = 0, startTy = 0;

            const onResizeMove = (e) => {
                if (!isResizing) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                const minW = 260;
                const maxW = Math.max(minW, window.innerWidth - 40);

                let newW = startW;
                let newH = startH;
                let newTx = startTx;
                let newTy = startTy;

                const isCorner = dir === 'nw' || dir === 'ne' || dir === 'sw' || dir === 'se';

                // Check if this window's parent is flex-centered (like VLC in sd-hero-center)
                const isParentFlexCentered = (() => {
                    const parent = winEl.parentElement;
                    if (!parent) return false;
                    const style = window.getComputedStyle(parent);
                    return style.display === 'flex' && style.justifyContent === 'center';
                })();

                if (isParentFlexCentered) {
                    if (isCorner) {
                        let deltaW = 0;
                        if (dir === 'se') deltaW = dx;
                        else if (dir === 'sw') deltaW = -dx;
                        else if (dir === 'ne') deltaW = dx;
                        else if (dir === 'nw') deltaW = -dx;

                        let targetW = Math.max(minW, Math.min(maxW, startW + deltaW));
                        let targetH = Math.round(targetW * (9 / 16));

                        newW = targetW;
                        newH = targetH;

                        // Flex-centering anchor compensation
                        if (dir.indexOf('e') !== -1) {
                            newTx = startTx + (newW - startW) / 2;
                        } else {
                            newTx = startTx - (newW - startW) / 2;
                        }

                        if (dir.indexOf('s') !== -1) {
                            newTy = startTy + (newH - startH) / 2;
                        } else {
                            newTy = startTy - (newH - startH) / 2;
                        }
                    } else {
                        if (dir === 'e') {
                            newW = Math.max(minW, Math.min(maxW, startW + dx));
                            newH = Math.round(newW * (9 / 16));
                            newTx = startTx + (newW - startW) / 2;
                            newTy = startTy + (newH - startH) / 2;
                        } else if (dir === 'w') {
                            newW = Math.max(minW, Math.min(maxW, startW - dx));
                            newH = Math.round(newW * (9 / 16));
                            newTx = startTx - (newW - startW) / 2;
                            newTy = startTy + (newH - startH) / 2;
                        } else if (dir === 's') {
                            newH = Math.max(Math.round(minW * 9 / 16), startH + dy);
                            newW = Math.max(minW, Math.min(maxW, Math.round(newH * (16 / 9))));
                            newH = Math.round(newW * (9 / 16));
                            newTx = startTx + (newW - startW) / 2;
                            newTy = startTy + (newH - startH) / 2;
                        } else if (dir === 'n') {
                            newH = Math.max(Math.round(minW * 9 / 16), startH - dy);
                            newW = Math.max(minW, Math.min(maxW, Math.round(newH * (16 / 9))));
                            newH = Math.round(newW * (9 / 16));
                            newTx = startTx + (newW - startW) / 2;
                            newTy = startTy - (newH - startH) / 2;
                        }
                    }
                } else {
                    // Standard flow / left-aligned window anchor compensation (zero opposite-edge jitter)
                    if (isCorner) {
                        let deltaW = 0;
                        if (dir === 'se') deltaW = dx;
                        else if (dir === 'sw') deltaW = -dx;
                        else if (dir === 'ne') deltaW = dx;
                        else if (dir === 'nw') deltaW = -dx;

                        let targetW = Math.max(minW, Math.min(maxW, startW + deltaW));
                        let targetH = Math.round(targetW * (9 / 16));

                        newW = targetW;
                        newH = targetH;

                        const dw = newW - startW;
                        const dh = newH - startH;

                        if (dir === 'se') {
                            newTx = startTx;
                            newTy = startTy;
                        } else if (dir === 'sw') {
                            newTx = startTx - dw;
                            newTy = startTy;
                        } else if (dir === 'ne') {
                            newTx = startTx;
                            newTy = startTy - dh;
                        } else if (dir === 'nw') {
                            newTx = startTx - dw;
                            newTy = startTy - dh;
                        }
                    } else {
                        if (dir === 'e') {
                            newW = Math.max(minW, Math.min(maxW, startW + dx));
                            newH = Math.round(newW * (9 / 16));
                            newTx = startTx;
                            newTy = startTy;
                        } else if (dir === 'w') {
                            newW = Math.max(minW, Math.min(maxW, startW - dx));
                            newH = Math.round(newW * (9 / 16));
                            newTx = startTx - (newW - startW);
                            newTy = startTy;
                        } else if (dir === 's') {
                            newH = Math.max(Math.round(minW * 9 / 16), startH + dy);
                            newW = Math.max(minW, Math.min(maxW, Math.round(newH * (16 / 9))));
                            newH = Math.round(newW * (9 / 16));
                            newTx = startTx;
                            newTy = startTy;
                        } else if (dir === 'n') {
                            newH = Math.max(Math.round(minW * 9 / 16), startH - dy);
                            newW = Math.max(minW, Math.min(maxW, Math.round(newH * (16 / 9))));
                            newH = Math.round(newW * (9 / 16));
                            newTx = startTx;
                            newTy = startTy - (newH - startH);
                        }
                    }
                }

                winEl.style.width = `${Math.round(newW)}px`;
                winEl.style.maxWidth = 'none';
                winEl.style.flexShrink = '0';
                if (winEl.parentElement && winEl.parentElement.classList.contains('fg-project-window-shell')) {
                    winEl.parentElement.style.maxWidth = 'none';
                    winEl.parentElement.style.width = `${Math.round(newW)}px`;
                }
                if (contentEl) {
                    contentEl.style.height = `${Math.round(newH)}px`;
                    contentEl.style.maxHeight = 'none';
                    contentEl.style.aspectRatio = '16 / 9';
                }
                tx = newTx;
                ty = newTy;
                winEl.style.transform = `translate3d(${Math.round(tx)}px, ${Math.round(ty)}px, 0)`;
            };

            const onResizeUp = (e) => {
                if (!isResizing) return;
                isResizing = false;
                winEl.classList.remove('is-resizing');
                document.body.classList.remove('is-window-interacting');
                try {
                    handle.releasePointerCapture(e.pointerId);
                } catch (_) {}
                window.removeEventListener('pointermove', onResizeMove);
                window.removeEventListener('pointerup', onResizeUp);
                window.removeEventListener('pointercancel', onResizeUp);
            };

            handle.addEventListener('pointerdown', (e) => {
                bringToFront();
                isResizing = true;
                startX = e.clientX;
                startY = e.clientY;
                startW = winEl.offsetWidth;
                startH = contentEl ? contentEl.offsetHeight : Math.round(startW * (9 / 16));
                startTx = tx;
                startTy = ty;

                winEl.classList.add('is-resizing');
                document.body.classList.add('is-window-interacting');
                try {
                    handle.setPointerCapture(e.pointerId);
                } catch (_) {}

                window.addEventListener('pointermove', onResizeMove, { passive: false });
                window.addEventListener('pointerup', onResizeUp, { passive: false });
                window.addEventListener('pointercancel', onResizeUp, { passive: false });
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // 3. Window Control Buttons
        const closeBtn = winEl.querySelector('.kali-btn-close');
        const minBtn = winEl.querySelector('.kali-btn-min');
        const maxBtn = winEl.querySelector('.kali-btn-max');

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                winEl.style.opacity = '0';
                winEl.style.transform = `translate3d(${tx}px, ${ty + 16}px, 0) scale(0.96)`;
                winEl.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
                setTimeout(() => {
                    winEl.style.display = 'none';
                }, 240);
            });
        }

        if (minBtn) {
            let isMin = false;
            minBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                isMin = !isMin;
                const tb = winEl.querySelector('.vlc-toolbar') || winEl.querySelector('.kali-nav-toolbar');
                if (isMin) {
                    if (contentEl) contentEl.style.display = 'none';
                    if (tb) tb.style.display = 'none';
                } else {
                    if (contentEl) contentEl.style.display = '';
                    if (tb) tb.style.display = '';
                }
            });
        }

        if (maxBtn) {
            let isMax = false;
            let prevW = '';
            let prevH = '';
            let prevTx = 0;
            let prevTy = 0;

            maxBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                isMax = !isMax;
                if (isMax) {
                    prevW = winEl.style.width;
                    prevH = contentEl ? contentEl.style.height : '';
                    prevTx = tx;
                    prevTy = ty;

                    winEl.style.width = 'calc(100vw - 48px)';
                    winEl.style.maxWidth = '1100px';
                    if (contentEl) {
                        contentEl.style.height = '520px';
                        contentEl.style.maxHeight = 'none';
                        contentEl.style.aspectRatio = 'auto';
                    }
                    tx = 0;
                    ty = 0;
                    winEl.style.transform = 'translate3d(0, 0, 0)';
                } else {
                    winEl.style.width = prevW || '';
                    winEl.style.maxWidth = '';
                    if (contentEl) {
                        contentEl.style.height = prevH || '';
                        contentEl.style.maxHeight = '';
                    }
                    tx = prevTx;
                    ty = prevTy;
                    winEl.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
                }
            });
        }

        // Prevent accidental click when dragging or resizing
        if (contentEl) {
            contentEl.addEventListener('click', (e) => {
                if (pointerMoved) {
                    e.preventDefault();
                    e.stopPropagation();
                    pointerMoved = false;
                }
            });
        }
    });
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
                    <span class="macos-hud-dot macos-dot-1 active" id="macos-dot-1"></span>
                    <span class="macos-hud-dot macos-dot-2" id="macos-dot-2"></span>
                </div>
            </div>`;
        document.body.appendChild(hud);
    }
    return hud;
}

function showMacosHud(fromDesktop, toDesktop, duration = 1200) {
    const hud = ensureMacosHud();
    const textEl = document.getElementById('macos-hud-text');
    const dot1 = document.getElementById('macos-dot-1');
    const dot2 = document.getElementById('macos-dot-2');

    if (textEl) {
        textEl.textContent = `DESKTOP ${fromDesktop} \u2192 DESKTOP ${toDesktop}`;
    }
    if (dot1 && dot2) {
        dot1.classList.toggle('active', toDesktop === 1);
        dot2.classList.toggle('active', toDesktop === 2);
    }

    hud.classList.add('visible');
    clearTimeout(hud._hideTimeout);
    hud._hideTimeout = setTimeout(() => {
        hud.classList.remove('visible');
    }, duration);
}

function initMacosSpacesTransition() {
    // 1. Check if returning from About
    const pendingTrans = sessionStorage.getItem('macos_space_transition');
    if (pendingTrans === 'to_portfolio') {
        document.documentElement.dataset.vtDirection = 'backward';
        sessionStorage.removeItem('macos_space_transition');
        showMacosHud(2, 1, 1000);
    }

    // 2. Intercept all About links
    const aboutLinks = document.querySelectorAll('a[href="about.html"]');
    aboutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey) return;

            e.preventDefault();
            const targetUrl = link.getAttribute('href');

            // Set direction forward (Slide left)
            document.documentElement.dataset.vtDirection = 'forward';
            sessionStorage.setItem('macos_space_transition', 'to_about');

            // Show HUD bezel
            showMacosHud(1, 2, 1400);

            // Navigate
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 80);
        });
    });
}

// --------------- Dynamic Monochrome Navbar Contrast --------
function initNavbarContrast() {
    const cols = [
        document.querySelector(".nb-nav-col-1"),
        document.querySelector(".nb-nav-col-4")
    ];

    let ticking = false;

    function checkContrast() {
        const mediaElements = document.querySelectorAll(
            ".nb-media-box, .nb-reel, .kali-window-vlc, .vlc-video-element, .nb-media-item img, .nb-reel video"
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

// --------------- Site Intro Splash Overlay -----------------
function initSiteIntro() {
    const overlay = document.getElementById("site-intro-overlay");
    if (!overlay) return;

    // Se l'intro è già stata visualizzata in questa sessione o stiamo tornando da About, non riavviarla
    const alreadyPlayed = sessionStorage.getItem("site_intro_played");
    const isSpaceTransition = sessionStorage.getItem("macos_space_transition") === "to_portfolio";
    if (alreadyPlayed || isSpaceTransition) {
        overlay.style.display = "none";
        return;
    }

    // Segna che l'intro è stata mostrata per non ripeterla ai cambi pagina
    sessionStorage.setItem("site_intro_played", "true");

    let isDismissed = false;

    function dismissIntro() {
        if (isDismissed) return;
        isDismissed = true;
        overlay.classList.add("is-faded");

        const cleanup = () => {
            overlay.style.display = "none";
            overlay.removeEventListener("transitionend", cleanup);
        };
        overlay.addEventListener("transitionend", cleanup);
        setTimeout(cleanup, 950);
    }

    // Dissolvenza automatica dopo ~1.4s di esposizione
    const timer = setTimeout(dismissIntro, 1400);

    // Permette all'utente di fare click o tap per entrare subito
    overlay.addEventListener("click", () => {
        clearTimeout(timer);
        dismissIntro();
    });

    // Permette di chiudere con Escape, Spazio o Invio
    window.addEventListener("keydown", (e) => {
        if (!isDismissed && (e.key === "Escape" || e.key === " " || e.key === "Enter")) {
            clearTimeout(timer);
            dismissIntro();
        }
    }, { once: true });
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

// --------------- Typing Animation Bio Overlay ---------------
function initTypingBio() {
    const textContainer = document.querySelector("#reel-typing-text .typing-content");
    if (!textContainer) return;

    const fullText = CONFIG.bioText ||
        "Curious by nature and attentive to every detail, I base my work on observation and research. I turn my constant desire to learn into new practical skills, applying them directly to the development and growth of every project.";

    textContainer.textContent = "";
    let charIndex = 0;
    let hasStarted = false;

    function typeNextChar() {
        if (charIndex < fullText.length) {
            const char = fullText.charAt(charIndex);
            textContainer.textContent += char;
            charIndex++;

            let delay = 22 + Math.random() * 12;
            if (char === '.' || char === '!' || char === '?') {
                delay = 230;
            } else if (char === ',') {
                delay = 130;
            }

            setTimeout(typeNextChar, delay);
        }
    }

    function startTyping() {
        if (hasStarted) return;
        hasStarted = true;
        setTimeout(typeNextChar, 350);
    }

    const overlay = document.getElementById("site-intro-overlay");
    const alreadyPlayed = sessionStorage.getItem("site_intro_played");
    const isSpaceTransition = sessionStorage.getItem("macos_space_transition") === "to_portfolio";

    if (!alreadyPlayed && !isSpaceTransition && overlay && overlay.style.display !== "none" && !overlay.classList.contains("is-faded")) {
        const checkIntro = setInterval(() => {
            if (overlay.style.display === "none" || overlay.classList.contains("is-faded")) {
                clearInterval(checkIntro);
                setTimeout(startTyping, 200);
            }
        }, 100);
    } else {
        startTyping();
    }
}

// --------------- Init --------------------------------------
initTheme();
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildPage);
} else {
    buildPage();
}
