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

// --------------- Virgil Abloh public---domain Projects Folders Data -------
const HOME_PROJECT_FOLDERS = [
    {
        id: "harp-chair",
        name: "HARP CHAIR",
        displayPath: "HARP CHAIR",
        category: "Product & Furniture Design, 2025",
        portfolioLink: "harp-chair.html",
        linkText: "EXPLORE PROJECT &rarr;",
        description: "Sedia a sbalzo in acciaio trafilato e legno massello, ispirata all'arpa celtica.",
        files: [
            {
                name: "harp_01.jpg",
                type: "image",
                subType: "JPEG image",
                src: "images/harp-chair/1.jpg",
                size: "1.3 MB",
                sizeBytes: "1326546",
                created: "5/29/2024, 12:09:41 AM",
                modified: "10/21/2026, 4:15:00 PM",
                contentType: "image/jpeg",
                dimensions: "1920 × 2400",
                caption: "HARP_01.JPG — Vista frontale scultorea"
            },
            {
                name: "harp_02.jpg",
                type: "image",
                subType: "JPEG image",
                src: "images/harp-chair/2.jpg",
                size: "1.0 MB",
                sizeBytes: "1019224",
                created: "5/29/2024, 12:10:14 AM",
                modified: "10/21/2026, 4:15:00 PM",
                contentType: "image/jpeg",
                dimensions: "1920 × 2400",
                caption: "HARP_02.JPG — Profilo slanciato a sbalzo"
            },
            {
                name: "harp_04.jpg",
                type: "image",
                subType: "JPEG image",
                src: "images/harp-chair/4.jpg",
                size: "1.1 MB",
                sizeBytes: "1099472",
                created: "5/29/2024, 12:10:48 AM",
                modified: "10/21/2026, 4:15:00 PM",
                contentType: "image/jpeg",
                dimensions: "1920 × 2400",
                caption: "HARP_04.JPG — Dettaglio corde metalliche e giunzioni"
            },
            {
                name: "harp_06.jpg",
                type: "image",
                subType: "JPEG image",
                src: "images/harp-chair/6.jpg",
                size: "1.0 MB",
                sizeBytes: "1053625",
                created: "5/29/2024, 12:11:25 AM",
                modified: "10/21/2026, 4:15:00 PM",
                contentType: "image/jpeg",
                dimensions: "1920 × 2400",
                caption: "HARP_06.JPG — Vista tre quarti schienale"
            },
            {
                name: "harp_08.jpg",
                type: "image",
                subType: "JPEG image",
                src: "images/harp-chair/8.jpg",
                size: "0.9 MB",
                sizeBytes: "890356",
                created: "5/29/2024, 12:12:02 AM",
                modified: "10/21/2026, 4:15:00 PM",
                contentType: "image/jpeg",
                dimensions: "1920 × 2400",
                caption: "HARP_08.JPG — Studio ergonomico e finitura legno"
            }
        ]
    },
    {
        id: "nomod",
        name: "NOMOD",
        displayPath: "NOMOD",
        category: "Product Design, 2025",
        portfolioLink: "index.html#project-1",
        linkText: "EXPLORE PROJECT &rarr;",
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
        linkText: "EXPLORE PROJECT &rarr;",
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
        portfolioLink: "about.html",
        linkText: "EXPLORE PROJECT &rarr;",
        description: "Sperimentazioni materiche personali: prototipazione rapida, scultura 3D, fotografia analogica 35mm e riparazione tech.",
        files: [
            {
                name: "analogue_35mm_street.jpg",
                type: "image",
                subType: "JPEG image",
                src: "images/nomod/nmd_01.jpg",
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
                src: "images/harp-chair/4.jpg",
                size: "4.8 MB",
                sizeBytes: "4982110",
                created: "10/12/2025, 4:18:22 PM",
                modified: "10/21/2026, 4:18:22 PM",
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

// Helper: Render all 8 edge and corner resize handles
function renderResizeHandles() {
    return `
        <!-- 8 Resize Edge & Corner Handles -->
        <div class="fg-win-resize-handle fg-resize-n" data-direction="n" aria-hidden="true" title="Ridimensiona"></div>
        <div class="fg-win-resize-handle fg-resize-s" data-direction="s" aria-hidden="true" title="Ridimensiona"></div>
        <div class="fg-win-resize-handle fg-resize-e" data-direction="e" aria-hidden="true" title="Ridimensiona"></div>
        <div class="fg-win-resize-handle fg-resize-w" data-direction="w" aria-hidden="true" title="Ridimensiona"></div>
        <div class="fg-win-resize-handle fg-resize-nw" data-direction="nw" aria-hidden="true" title="Ridimensiona"></div>
        <div class="fg-win-resize-handle fg-resize-ne" data-direction="ne" aria-hidden="true" title="Ridimensiona"></div>
        <div class="fg-win-resize-handle fg-resize-se" data-direction="se" aria-hidden="true" title="Ridimensiona"></div>
        <div class="fg-win-resize-handle fg-resize-sw" data-direction="sw" aria-hidden="true" title="Ridimensiona"></div>
    `;
}

// --------------- Render Projects File Manager Window (public---domain / Archive Style) -------
function renderHomeProjectsWindow() {
    return `
        <div class="kali-window kali-window-projects fg-hero-window fg-win-projects is-focused" id="hero-win-projects" role="region" aria-label="Archive — Projects">
            <!-- 1. Titlebar (macOS Style: Traffic Lights on Left, Centered "Archive" Title) -->
            <div class="kali-titlebar" id="hero-tb-projects">
                <div class="kali-controls">
                    <button class="kali-btn kali-btn-close" data-win="hero-win-projects" aria-label="Chiudi" title="Chiudi"></button>
                    <button class="kali-btn kali-btn-min" data-win="hero-win-projects" aria-label="Riduci a icona" title="Riduci a icona"></button>
                    <button class="kali-btn kali-btn-max" data-win="hero-win-projects" aria-label="Ingrandisci" title="Ingrandisci"></button>
                </div>
                <div class="kali-title-info">
                    <span class="kali-title-text">Archive</span>
                </div>
                <div class="kali-titlebar-spacer" aria-hidden="true"></div>
            </div>

            <!-- 2. Toolbar (<, >, FOLDER_PATH) -->
            <div class="pd-fm-toolbar">
                <div class="pd-toolbar-left">
                    <div class="pd-nav-segment" role="group" aria-label="Navigazione cartelle">
                        <button class="pd-nav-btn pd-btn-back" id="home-pd-btn-back" title="Cartella precedente" aria-label="Indietro">&#8249;</button>
                        <button class="pd-nav-btn pd-btn-forward" id="home-pd-btn-forward" title="Cartella successiva" aria-label="Avanti">&#8250;</button>
                    </div>
                    <span class="pd-current-path" id="home-pd-path-label">HARP CHAIR</span>
                </div>
            </div>

            <!-- 3. 3-Column Miller Columns Body (Extends to bottom border, identical to reference) -->
            <div class="pd-fm-body pd-3col-body">
                <!-- Column 1: Folders List -->
                <nav class="pd-col-folders" id="home-pd-folders-list" aria-label="Cartelle"></nav>

                <!-- Column 2: Files List -->
                <section class="pd-col-files" id="home-pd-files-container" aria-label="File">
                    <div class="pd-files-list" id="home-pd-files-list"></div>
                </section>

                <!-- Column 3: Big Photo Preview Artboard + Explore Project Button -->
                <aside class="pd-col-inspector" id="home-pd-inspector" aria-label="Anteprima Progetto">
                    <div class="pd-artboard-wrapper">
                        <div class="pd-artboard-sheet">
                            <div class="pd-artboard-header">
                                <h2 class="pd-artboard-title" id="home-pd-preview-title">HARP CHAIR</h2>
                                <div class="pd-artboard-sub" id="home-pd-preview-sub">COLORWAY & PROTOTYPE EXPLORATION</div>
                            </div>
                            <div class="pd-artboard-media">
                                <img id="home-pd-preview-img" src="images/harp-chair/1.jpg" alt="Anteprima file" class="pd-artboard-image">
                            </div>
                            <div class="pd-artboard-footer">
                                <div class="pd-artboard-meta">
                                    <span class="pd-artboard-filename" id="home-pd-filename-label">harp_01.jpg</span>
                                    <span class="pd-artboard-specs" id="home-pd-meta-size">1.3 MB &bull; 1920 &times; 2400</span>
                                </div>
                                <a id="home-pd-preview-link" href="harp-chair.html" class="pd-explore-btn">
                                    <span>EXPLORE PROJECT</span>
                                    <span class="pd-explore-arrow">&rarr;</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            ${renderResizeHandles()}
        </div>
    `;
}

// --------------- Render VLC Player Window (macOS Style) -----
function renderVlcWindow() {
    const videoSrc = escapeHTML(CONFIG.motionReel || "images/reel/reel.mp4");
    const posterSrc = escapeHTML(CONFIG.reelPoster || "assets/reel-preview.jpg");

    return `
        <div class="kali-window kali-window-vlc fg-hero-window fg-vlc-window fg-win-vlc" id="hero-win-vlc" role="region" aria-label="reel.mp4 — VLC Media Player">
            <!-- 1. VLC Titlebar (macOS Style with authentic VLC cone icon) -->
            <div class="kali-titlebar vlc-titlebar">
                <div class="kali-controls">
                    <button class="kali-btn kali-btn-close" data-win="hero-win-vlc" aria-label="Chiudi" title="Chiudi"></button>
                    <button class="kali-btn kali-btn-min" data-win="hero-win-vlc" aria-label="Riduci a icona" title="Riduci a icona"></button>
                    <button class="kali-btn kali-btn-max" data-win="hero-win-vlc" aria-label="Ingrandisci" title="Ingrandisci"></button>
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
                    <span class="vlc-title-text">reel.mp4 — VLC 2.2.0</span>
                </div>
                <div class="kali-titlebar-spacer" aria-hidden="true"></div>
            </div>

            <!-- 2. VLC Video Player Body -->
            <div class="vlc-video-container" title="Click per Riprodurre / Pausa">
                <video class="vlc-video-element"
                       src="${videoSrc}"
                       poster="${posterSrc}"
                       autoplay
                       muted
                       loop
                       playsinline
                       aria-label="Lorenzo Kraja Motion Reel"></video>
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
                    <button type="button" class="vlc-ctrl-btn vlc-btn-playlist" title="Playlist / Effetti" aria-label="Playlist">
                        <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
                            <rect x="2" y="3" width="12" height="1.8" rx="0.5"/>
                            <rect x="2" y="7" width="12" height="1.8" rx="0.5"/>
                            <rect x="2" y="11" width="12" height="1.8" rx="0.5"/>
                        </svg>
                    </button>
                </div>

                <!-- Timeline Scrubber -->
                <div class="vlc-scrubber-wrap">
                    <input type="range" class="vlc-scrubber" min="0" max="100" value="0" step="0.1" title="Posizione di riproduzione">
                </div>

                <!-- Time readout (e.g. 00:04) -->
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

                <!-- Corner Resize Grip -->
                <span class="kali-resize-grip" title="Ridimensiona" data-direction="se" aria-hidden="true">
                    <svg viewBox="0 0 8 8" width="8" height="8" fill="currentColor">
                        <path d="M7 1L1 7M7 4L4 7M7 7L7 7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                    </svg>
                </span>
            </div>

            ${renderResizeHandles()}
        </div>`;
}

// --------------- Render Contact Window (macOS TextEdit Style)
function renderContactWindow() {
    return `
        <div class="fg-hero-window fg-contact-window is-closed" id="hero-win-contact">
            <!-- 1. Titlebar -->
            <div class="kali-titlebar">
                <div class="kali-controls">
                    <button class="kali-btn kali-btn-close" data-win="hero-win-contact" aria-label="Chiudi" title="Chiudi"></button>
                    <button class="kali-btn kali-btn-min" data-win="hero-win-contact" aria-label="Riduci a icona" title="Riduci a icona"></button>
                    <button class="kali-btn kali-btn-max" data-win="hero-win-contact" aria-label="Ingrandisci" title="Ingrandisci"></button>
                </div>
                <div class="kali-title-info">
                    <span class="kali-title-text">contact.txt — TextEdit</span>
                </div>
                <div class="kali-titlebar-spacer" aria-hidden="true"></div>
            </div>

            <!-- 2. Menubar -->
            <div class="kali-menubar">
                <span class="kali-menu-item">File</span>
                <span class="kali-menu-item">Edit</span>
                <span class="kali-menu-item">Format</span>
                <span class="kali-menu-item">View</span>
                <span class="kali-menu-item">Help</span>
            </div>

            <!-- 3. Content Area: Clean macOS Note / TextEdit Document -->
            <div class="fg-contact-content">
                <div class="fg-contact-header">
                    <h3 class="fg-contact-title">LORENZO KRAJA</h3>
                    <p class="fg-contact-subtitle">Product &amp; Jewelry Designer &bull; Rome [RM], Italy</p>
                </div>
                <div class="fg-contact-body">
                    <div class="fg-contact-row">
                        <span class="fg-contact-label">EMAIL:</span>
                        <a href="mailto:lorenzokraja99@gmail.com" class="fg-contact-val">lorenzokraja99@gmail.com</a>
                        <button type="button" class="fg-contact-copy-btn" id="copy-email-btn" title="Copia email">COPIA</button>
                    </div>
                    <div class="fg-contact-row">
                        <span class="fg-contact-label">INSTAGRAM:</span>
                        <a href="https://www.instagram.com/lorenzo.kraja?vrfl=emV0cDFlbW51NWFm" target="_blank" rel="noopener noreferrer" class="fg-contact-val">lorenzo.kraja &rarr;</a>
                    </div>
                    <div class="fg-contact-row">
                        <span class="fg-contact-label">LINKEDIN:</span>
                        <a href="https://linkedin.com" target="_blank" rel="noopener" class="fg-contact-val">Lorenzo Kraja &rarr;</a>
                    </div>
                    <div class="fg-contact-row">
                        <span class="fg-contact-label">CURRICULUM:</span>
                        <a href="assets/cv_lorenzo_kraja.pdf" target="_blank" class="fg-contact-val">cv_lorenzo_kraja.pdf &darr;</a>
                    </div>
                    <div class="fg-contact-row">
                        <span class="fg-contact-label">TIMEZONE:</span>
                        <span class="fg-contact-val">Europe/Rome (GMT+2)</span>
                    </div>
                </div>
                <div class="fg-contact-footer">
                    <span>&copy; 2026 Lorenzo Kraja. All rights reserved.</span>
                </div>
            </div>

            <!-- 4. Statusbar -->
            <div class="kali-statusbar">
                <div class="kali-status-left">
                    <span>Plain Text Document</span>
                    <span class="kali-status-sep">&bull;</span>
                    <span>UTF-8</span>
                </div>
                <div class="kali-status-right">
                    <span>Lorenzo Kraja OS</span>
                    <span class="kali-resize-grip" title="Ridimensiona" data-direction="se" aria-hidden="true">
                        <svg viewBox="0 0 8 8" width="8" height="8" fill="currentColor">
                            <path d="M7 1L1 7M7 4L4 7M7 7L7 7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                        </svg>
                    </span>
                </div>
            </div>

            ${renderResizeHandles()}
        </div>`;
}

// --------------- Build Page --------------------------------
function buildPage() {
    const app = document.getElementById("app");

    app.innerHTML = `
        <!-- TOP BAR -->
        <nav class="nb-top-nav">
            <div class="nb-nav-col-1">
                <a href="index.html" class="nb-nav-home-link" aria-label="Torna alla Home">
                    <span class="nb-nav-home-text">${escapeHTML(CONFIG.designerName)}</span>
                </a>
            </div>
            <!-- Top Navbar Center: 3D Spinning Logo GIF -->
            <div class="nb-nav-center-logo">
                <a href="index.html" class="nb-nav-logo-link" aria-label="Lorenzo Kraja Home" title="Torna all'inizio">
                    <img src="assets/lorenzo-spinning.gif" alt="Lorenzo Kraja" class="nb-nav-spinning-logo fg-logo-light" draggable="false">
                    <img src="assets/lorenzo-spinning-dark.gif" alt="Lorenzo Kraja" class="nb-nav-spinning-logo fg-logo-dark" draggable="false">
                </a>
            </div>
            <div class="nb-nav-col-3" aria-hidden="true"></div>
            <div class="nb-nav-col-4">
                <a href="#hero-win-contact" class="nb-nav-contact-link">Contact</a>
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
                    <a href="#hero-win-contact" class="nb-mobile-link" id="mobile-link-contact">
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
             FREE GAME HERO SECTION (Virgil Abloh public---domain Style Desktop)
             ============================================================ -->
        <section class="fg-hero fg-desktop-surface">
            <!-- Row 1: Bio + Projects Folder on Left, FROM A-Z (TOC) on Right -->
            <div class="fg-hero-grid">
                <!-- Left Column: Intro Bio Text -->
                <div class="fg-hero-col-left">
                    <div class="fg-intro-text">
                        <p>Curious by nature and attentive to every detail, I base my work on observation and
research. I turn my constant desire to learn into new practical skills, applying them
directly to the development and growth of every project.</p>
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
                                <a href="#hero-win-contact" class="fg-toc-item fg-toc-win-trigger" data-target="hero-win-contact"><span class="fg-toc-num">2.</span> CONTACT</a>
                                <a href="#hero-win-projects" class="fg-toc-item fg-toc-win-trigger" data-target="hero-win-projects" data-folder="0"><span class="fg-toc-num">3.</span> HARP CHAIR</a>
                            </div>
                            <div class="fg-toc-col">
                                <a href="#hero-win-projects" class="fg-toc-item fg-toc-win-trigger" data-target="hero-win-projects" data-folder="1"><span class="fg-toc-num">4.</span> NOMOD</a>
                                <a href="#hero-win-projects" class="fg-toc-item fg-toc-win-trigger" data-target="hero-win-projects" data-folder="2"><span class="fg-toc-num">5.</span> LUCA</a>
                                <a href="#hero-win-vlc" class="fg-toc-item fg-toc-win-trigger" data-target="hero-win-vlc"><span class="fg-toc-num">6.</span> MOTION REEL</a>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>

            <!-- Desktop Icons (Center Column: Projects Folder, and contact.txt underneath) -->
            <div class="fg-desktop-icons-row fg-desktop-icons-center">
                <!-- 1. Folder: Projects -->
                <div class="kali-desktop-icon kali-icon-dir fg-desktop-icon-projects" id="desktop-icon-projects" tabindex="0" role="button"
                    aria-label="Cartella Projects" title="Fai doppio clic o premi Invio per aprire i progetti">
                    <div class="kali-icon-thumb kali-thumb-cyan-folder">
                        <svg viewBox="0 0 54 44" width="58" height="46" fill="none">
                            <path d="M4 8a3 3 0 0 1 3-3h13l4 4h23a3 3 0 0 1 3 3v24a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8z"
                                fill="#0097a7" />
                            <rect x="7" y="11" width="40" height="4" rx="1" fill="#00838f" opacity="0.6" />
                            <path d="M3 15a3 3 0 0 1 3-3h42a3 3 0 0 1 3 3v21a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V15z"
                                fill="#00c5d4" />
                            <path d="M6 13h42a3 3 0 0 1 3 3v1H3v-1a3 3 0 0 1 3-3z" fill="#33d6e2" opacity="0.35" />
                        </svg>
                        <span class="kali-icon-badge kali-badge-cyan">PROJ</span>
                    </div>
                    <span class="kali-icon-label">Projects</span>
                </div>

                <!-- 2. Text File: contact.txt (Un po' sotto la cartella projects) -->
                <div class="kali-desktop-icon kali-icon-doc fg-desktop-icon-contact" id="desktop-icon-contact" tabindex="0" role="button"
                    aria-label="File contact.txt" title="Fai doppio clic o premi Invio per aprire contact.txt">
                    <div class="kali-icon-thumb kali-thumb-doc">
                        <svg viewBox="0 0 44 52" width="46" height="50" fill="none">
                            <path d="M6 3h22l10 10v34a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z" fill="#ffffff" stroke="#c0c0c0" stroke-width="1.5" />
                            <path d="M28 3v10h10" fill="#ededed" stroke="#c0c0c0" stroke-width="1.5" stroke-linejoin="round" />
                            <line x1="10" y1="20" x2="30" y2="20" stroke="#4a4a4a" stroke-width="2" stroke-linecap="round" />
                            <line x1="10" y1="26" x2="32" y2="26" stroke="#888888" stroke-width="2" stroke-linecap="round" />
                            <line x1="10" y1="32" x2="28" y2="32" stroke="#888888" stroke-width="2" stroke-linecap="round" />
                            <line x1="10" y1="38" x2="22" y2="38" stroke="#aaaaaa" stroke-width="2" stroke-linecap="round" />
                        </svg>
                        <span class="kali-icon-badge kali-badge-txt">TXT</span>
                    </div>
                    <span class="kali-icon-label">contact.txt</span>
                </div>
            </div>

            <!-- Staggered Windows Desktop Area (Projects File Manager + VLC Media Player + Contact) -->
            <div class="fg-hero-windows">
                <!-- Projects File Manager Window (public---domain 3-Column Miller Columns, Open by Default) -->
                ${renderHomeProjectsWindow()}
                <!-- Motion Reel: VLC Media Player Window -->
                ${renderVlcWindow()}
                <!-- Contact Note Window (Floating on desktop, closed by default) -->
                ${renderContactWindow()}
            </div>

            <!-- Desktop Bottom Status Bar -->
            <div class="fg-desktop-bottom-bar">
                <span class="fg-bottom-brand">Lorenzo Kraja OS <span class="fg-bottom-desktop-only">&bull; Desktop Workspace</span></span>
                <span class="fg-bottom-copy">&copy; 2026<span class="fg-bottom-desktop-only"> Lorenzo Kraja</span></span>
            </div>

            <!-- Floating Side ABOUT Button (Right Edge, Mid-Height) -->
            <div class="fg-side-about" id="fg-side-about">
                <a href="about.html" class="fg-desktop-about-link" aria-label="Vai alla pagina About">ABOUT &rarr;</a>
            </div>
        </section>
    `;

    startClock();
    bindEvents();
    bindHeroTocLinks();
    initHeroLogoCenter();
    initDesktopProjectsFolder();
    initDesktopContactFile();
    initHomeProjectsFileManager();
    initHeroWindowsInteractive();
    initVlcPlayer();
    initProjectWindowsCarousel();
    initContactWindow();
    initMacosSpacesTransition();
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

            // If View Transitions API supported and cross-document navigation enabled
            if (document.startViewTransition) {
                window.location.href = targetUrl;
            } else {
                document.body.classList.add('macos-space-slide-out-left');
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 460);
            }
        });
    });
}

let highestDesktopZ = 20;

function openAndFocusWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;

    win.classList.remove('is-closed', 'is-minimized');
    highestDesktopZ++;
    win.style.zIndex = highestDesktopZ;
    document.querySelectorAll('.fg-hero-window').forEach(w => w.classList.remove('is-focused'));
    win.classList.add('is-focused');

    const rect = win.getBoundingClientRect();
    if (rect.top < 60 || rect.bottom > window.innerHeight + 80) {
        win.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (winId === 'hero-win-vlc') {
        const vid = win.querySelector('.vlc-video-element');
        if (vid) {
            vid.play().catch(() => {});
        }
    }
}

// --------------- Hero TOC Window Triggers ------------------
function bindHeroTocLinks() {
    document.querySelectorAll('.fg-toc-win-trigger').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.dataset.target;
            if (targetId) {
                openAndFocusWindow(targetId);
                if (targetId === 'hero-win-projects' && typeof link.dataset.folder !== 'undefined') {
                    const fIdx = parseInt(link.dataset.folder, 10);
                    if (window.selectHomeProjectsFolder) {
                        window.selectHomeProjectsFolder(fIdx);
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

// --------------- Hero Center Logo -------------------------
function initHeroLogoCenter() {
    const centerLink = document.querySelector('.fg-hero-center-logo-link, .nb-nav-logo-link');
    if (centerLink) {
        centerLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// --------------- Projects File Manager Controller ----------
function initHomeProjectsFileManager() {
    const win = document.getElementById('hero-win-projects');
    if (!win) return;

    const foldersList = document.getElementById('home-pd-folders-list');
    const filesList = document.getElementById('home-pd-files-list');
    const pathLabel = document.getElementById('home-pd-path-label');
    const btnBack = document.getElementById('home-pd-btn-back');
    const btnFwd = document.getElementById('home-pd-btn-forward');

    // Inspector elements
    const previewImg = document.getElementById('home-pd-preview-img');
    const previewTitle = document.getElementById('home-pd-preview-title');
    const previewSub = document.getElementById('home-pd-preview-sub');
    const filenameLabel = document.getElementById('home-pd-filename-label');
    const metaSize = document.getElementById('home-pd-meta-size');
    const previewLink = document.getElementById('home-pd-preview-link');

    let activeFolderIdx = 0;
    let activeFileIdx = 0;
    let history = [0];
    let historyIdx = 0;

    function updateHistoryButtons() {
        if (btnBack) btnBack.disabled = (historyIdx <= 0);
        if (btnFwd) btnFwd.disabled = (historyIdx >= history.length - 1);
    }

    function renderFoldersList() {
        if (!foldersList) return;
        foldersList.innerHTML = HOME_PROJECT_FOLDERS.map((f, idx) => `
            <div class="pd-folder-row ${idx === activeFolderIdx ? 'active' : ''}" data-idx="${idx}" tabindex="0" role="button" aria-selected="${idx === activeFolderIdx ? 'true' : 'false'}">
                <span class="pd-folder-name">${escapeHTML(f.name)}</span>
                <span class="pd-pill-count">${f.files.length}</span>
            </div>
        `).join('');

        foldersList.querySelectorAll('.pd-folder-row').forEach(row => {
            const handleSelect = () => {
                const idx = parseInt(row.dataset.idx, 10);
                if (idx !== activeFolderIdx) {
                    history = history.slice(0, historyIdx + 1);
                    history.push(idx);
                    historyIdx = history.length - 1;
                    selectFolder(idx);
                }
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

    function selectFile(fileIdx) {
        const folder = HOME_PROJECT_FOLDERS[activeFolderIdx];
        if (!folder || !folder.files || !folder.files[fileIdx]) return;

        activeFileIdx = fileIdx;
        const file = folder.files[fileIdx];

        if (filesList) {
            const rows = filesList.querySelectorAll('.pd-file-row');
            rows.forEach((r, idx) => {
                if (idx === fileIdx) {
                    r.classList.add('active');
                    r.setAttribute('aria-selected', 'true');
                    r.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                } else {
                    r.classList.remove('active');
                    r.setAttribute('aria-selected', 'false');
                }
            });
        }

        if (previewImg) {
            previewImg.src = file.src;
            previewImg.alt = file.name;
        }
        if (previewTitle) {
            previewTitle.textContent = folder.name;
        }
        if (previewSub) {
            previewSub.textContent = file.caption || folder.category || 'COLORWAY EXPLORATION';
        }
        if (filenameLabel) {
            filenameLabel.textContent = file.name;
        }
        if (metaSize) {
            const dims = file.dimensions ? ` &bull; ${file.dimensions}` : '';
            metaSize.innerHTML = `${escapeHTML(file.size || '1.3 MB')}${dims}`;
        }

        if (previewLink) {
            previewLink.href = folder.portfolioLink || 'harp-chair.html';
        }
    }

    function renderFilesList(folder) {
        if (!filesList) return;
        filesList.innerHTML = folder.files.map((file, idx) => `
            <div class="pd-file-row ${idx === activeFileIdx ? 'active' : ''}" data-file-idx="${idx}" tabindex="0" role="button" aria-selected="${idx === activeFileIdx ? 'true' : 'false'}" title="${escapeHTML(file.name)}">
                <div class="pd-file-left">
                    <span class="pd-file-icon" aria-hidden="true">
                        <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
                            <path d="M14 2H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zm-1 9.5-3-3.8-2 2.5-1.5-1.9L4 12h9v-.5zM5 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                        </svg>
                    </span>
                    <span class="pd-file-name">${escapeHTML(file.name)}</span>
                </div>
                <span class="pd-file-arrow" aria-hidden="true">&#9654;</span>
            </div>
        `).join('');

        filesList.querySelectorAll('.pd-file-row').forEach(row => {
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
        if (idx < 0 || idx >= HOME_PROJECT_FOLDERS.length) return;
        activeFolderIdx = idx;
        activeFileIdx = 0;
        const folder = HOME_PROJECT_FOLDERS[idx];

        if (pathLabel) pathLabel.textContent = folder.name;

        renderFoldersList();
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

    // Expose selectFolder globally so TOC or other controls can switch folders directly
    window.selectHomeProjectsFolder = (folderIdx) => {
        history = history.slice(0, historyIdx + 1);
        history.push(folderIdx);
        historyIdx = history.length - 1;
        selectFolder(folderIdx);
    };

    // Initial selection: folder 0 (HARP CHAIR) and file 0
    selectFolder(0);
}

// --------------- Desktop Projects Folder -------------------
let wasDesktopIconDragged = false;

function initDesktopProjectsFolder() {
    const icon = document.getElementById('desktop-icon-projects');
    if (!icon) return;

    let lastTap = 0;

    function openProjects() {
        openAndFocusWindow('hero-win-projects');
        const win = document.getElementById('hero-win-projects');
        if (win) {
            win.classList.add('fg-win-pulse');
            setTimeout(() => win.classList.remove('fg-win-pulse'), 800);
        }
    }

    icon.addEventListener('click', (e) => {
        if (wasDesktopIconDragged) return;

        const now = Date.now();
        const isDouble = (now - lastTap) < 350;
        lastTap = now;

        document.querySelectorAll('.kali-desktop-icon').forEach(ic => ic.classList.remove('is-selected'));
        icon.classList.add('is-selected');

        if (isDouble || window.innerWidth <= 768) {
            openProjects();
        }
    });

    icon.addEventListener('dblclick', () => {
        if (wasDesktopIconDragged) return;
        openProjects();
    });

    icon.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            icon.classList.add('is-selected');
            openProjects();
        }
    });

    // Deselect when clicking desktop background
    document.addEventListener('pointerdown', (e) => {
        if (!e.target.closest('.kali-desktop-icon') && !e.target.closest('.fg-hero-window')) {
            document.querySelectorAll('.kali-desktop-icon').forEach(ic => ic.classList.remove('is-selected'));
        }
    });

    // Desktop Icon Dragging
    setupDesktopIconDragging(icon);
}

// --------------- Desktop Contact Text File -----------------
function initDesktopContactFile() {
    const icon = document.getElementById('desktop-icon-contact');
    if (!icon) return;

    let lastTap = 0;

    function openContact() {
        openAndFocusWindow('hero-win-contact');
        const win = document.getElementById('hero-win-contact');
        if (win) {
            win.classList.add('fg-win-pulse');
            setTimeout(() => win.classList.remove('fg-win-pulse'), 800);
        }
    }

    icon.addEventListener('click', () => {
        if (wasDesktopIconDragged) return;

        const now = Date.now();
        const isDouble = (now - lastTap) < 350;
        lastTap = now;

        document.querySelectorAll('.kali-desktop-icon').forEach(ic => ic.classList.remove('is-selected'));
        icon.classList.add('is-selected');

        if (isDouble || window.innerWidth <= 768) {
            openContact();
        }
    });

    icon.addEventListener('dblclick', () => {
        if (wasDesktopIconDragged) return;
        openContact();
    });

    icon.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            icon.classList.add('is-selected');
            openContact();
        }
    });

    setupDesktopIconDragging(icon);
}

function setupDesktopIconDragging(iconEl) {
    let isDragging = false;
    let startX = 0, startY = 0;
    let startLeft = 0, startTop = 0;
    let moved = false;

    iconEl.addEventListener('pointerdown', (e) => {
        if (window.innerWidth <= 768) return; // Keep clean inline on mobile
        if (e.button !== undefined && e.button > 0) return; // Only primary button
        isDragging = true;
        moved = false;
        startX = e.clientX;
        startY = e.clientY;

        const r = iconEl.getBoundingClientRect();
        startLeft = r.left;
        startTop = r.top;
        try { iconEl.setPointerCapture(e.pointerId); } catch (_) {}
    });

    const onPointerMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            moved = true;
            iconEl.classList.add('is-dragging');
            iconEl.style.position = 'fixed';
            iconEl.style.right = 'auto';
            iconEl.style.bottom = 'auto';

            // Free placement anywhere across viewport, clamped so it cannot get lost outside
            const maxLeft = Math.max(10, window.innerWidth - iconEl.offsetWidth - 10);
            const maxTop = Math.max(10, window.innerHeight - iconEl.offsetHeight - 10);
            const curLeft = Math.max(10, Math.min(maxLeft, startLeft + dx));
            const curTop = Math.max(10, Math.min(maxTop, startTop + dy));

            iconEl.style.left = `${curLeft}px`;
            iconEl.style.top = `${curTop}px`;
            iconEl.style.zIndex = '999999';
        }
    };

    const onPointerUp = (e) => {
        if (!isDragging) return;
        isDragging = false;
        iconEl.classList.remove('is-dragging');
        if (moved) {
            iconEl.classList.add('is-moved');
            wasDesktopIconDragged = true;
            setTimeout(() => { wasDesktopIconDragged = false; }, 140);
        }
        try { iconEl.releasePointerCapture(e.pointerId); } catch (_) {}
    };

    iconEl.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointermove', onPointerMove);

    iconEl.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointerup', onPointerUp);

    iconEl.addEventListener('pointercancel', onPointerUp);
}

// --------------- Hero Desktop Windows Drag & Resize -------
function initHeroWindowsInteractive() {
    const windows = document.querySelectorAll('.fg-hero-window');
    if (!windows.length) return;

    // Helper: recalculate workspace height based on window positions
    function updateWorkspaceHeight() {
        const container = document.querySelector('.fg-hero-windows');
        if (!container || window.innerWidth <= 900) return;
        const allWins = container.querySelectorAll('.fg-hero-window:not(.is-closed):not(.is-minimized)');
        let maxBottom = 580;
        allWins.forEach(w => {
            const y = typeof w._winY === 'number' ? w._winY : 0;
            const bottom = w.offsetTop + y + w.offsetHeight;
            if (bottom > maxBottom) maxBottom = bottom;
        });
        container.style.minHeight = `${maxBottom + 40}px`;
    }

    // Toggle Maximize / Restore
    function toggleMaximize(win) {
        const isMax = win.classList.contains('is-maximized');
        if (!isMax) {
            win._prevGeometry = {
                width: win.style.width,
                height: win.style.height,
                maxWidth: win.style.maxWidth,
                maxHeight: win.style.maxHeight,
                minWidth: win.style.minWidth,
                minHeight: win.style.minHeight,
                transform: win.style.transform,
                x: win._winX || 0,
                y: win._winY || 0
            };
            win.classList.add('is-maximized');
        } else {
            win.classList.remove('is-maximized');
            if (win._prevGeometry) {
                const g = win._prevGeometry;
                if (g.width) win.style.setProperty('width', g.width, 'important'); else win.style.removeProperty('width');
                if (g.height) win.style.setProperty('height', g.height, 'important'); else win.style.removeProperty('height');
                if (g.maxWidth) win.style.maxWidth = g.maxWidth; else win.style.removeProperty('max-width');
                if (g.maxHeight) win.style.maxHeight = g.maxHeight; else win.style.removeProperty('max-height');
                if (g.minWidth) win.style.minWidth = g.minWidth; else win.style.removeProperty('min-width');
                if (g.minHeight) win.style.minHeight = g.minHeight; else win.style.removeProperty('min-height');
                win.style.transform = g.transform || '';
                win._winX = g.x;
                win._winY = g.y;
            }
        }
        updateWorkspaceHeight();
    }

    // Active pointer interaction states
    let activeDrag = null;
    let dragRaf = null;
    let lastDragEvent = null;

    let activeResize = null;
    let resizeRaf = null;
    let lastResizeEvent = null;

    const cursorMap = {
        'nw': 'nwse-resize', 'se': 'nwse-resize',
        'ne': 'nesw-resize', 'sw': 'nesw-resize',
        'n': 'ns-resize', 's': 'ns-resize',
        'e': 'ew-resize', 'w': 'ew-resize'
    };

    // Global drag handlers
    function onGlobalDragMove(e) {
        if (!activeDrag) return;
        lastDragEvent = e;
        if (!dragRaf) {
            dragRaf = requestAnimationFrame(renderDrag);
        }
    }

    function renderDrag() {
        dragRaf = null;
        if (!activeDrag || !lastDragEvent) return;
        const e = lastDragEvent;
        const dx = e.clientX - activeDrag.startPointerX;
        const dy = e.clientY - activeDrag.startPointerY;
        const newX = activeDrag.startX + dx;
        const newY = activeDrag.startY + dy;

        activeDrag.win._winX = newX;
        activeDrag.win._winY = newY;
        activeDrag.win.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
    }

    function onGlobalDragEnd() {
        if (!activeDrag) return;
        if (dragRaf) {
            cancelAnimationFrame(dragRaf);
            dragRaf = null;
        }
        if (lastDragEvent) renderDrag();

        window.removeEventListener('pointermove', onGlobalDragMove);
        window.removeEventListener('pointerup', onGlobalDragEnd);
        window.removeEventListener('pointercancel', onGlobalDragEnd);

        activeDrag.win.classList.remove('is-dragging');
        document.body.classList.remove('is-window-dragging');
        document.body.style.cursor = '';

        activeDrag = null;
        lastDragEvent = null;
        updateWorkspaceHeight();
    }

    // Global resize handlers
    function onGlobalResizeMove(e) {
        if (!activeResize) return;
        lastResizeEvent = e;
        if (!resizeRaf) {
            resizeRaf = requestAnimationFrame(renderResize);
        }
    }

    function renderResize() {
        resizeRaf = null;
        if (!activeResize || !lastResizeEvent) return;
        const e = lastResizeEvent;
        const { win, dir, startPointerX, startPointerY, startW, startH, startX, startY, minW, minH, maxW, maxH } = activeResize;
        const dx = e.clientX - startPointerX;
        const dy = e.clientY - startPointerY;

        let newW = startW;
        let newH = startH;
        let newX = startX;
        let newY = startY;

        if (dir.includes('e')) {
            newW = Math.max(minW, Math.min(maxW, startW + dx));
        } else if (dir.includes('w')) {
            newW = Math.max(minW, Math.min(maxW, startW - dx));
            newX = startX + (startW - newW);
        }

        if (dir.includes('s')) {
            newH = Math.max(minH, Math.min(maxH, startH + dy));
        } else if (dir.includes('n')) {
            newH = Math.max(minH, Math.min(maxH, startH - dy));
            newY = startY + (startH - newH);
        }

        win.style.setProperty('width', `${newW}px`, 'important');
        win.style.setProperty('height', `${newH}px`, 'important');
        win.style.setProperty('max-width', 'none', 'important');
        win.style.setProperty('max-height', 'none', 'important');
        win.style.setProperty('min-width', '0', 'important');
        win.style.setProperty('min-height', '0', 'important');

        win._winX = newX;
        win._winY = newY;
        win.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
    }

    function onGlobalResizeEnd() {
        if (!activeResize) return;
        if (resizeRaf) {
            cancelAnimationFrame(resizeRaf);
            resizeRaf = null;
        }
        if (lastResizeEvent) renderResize();

        window.removeEventListener('pointermove', onGlobalResizeMove);
        window.removeEventListener('pointerup', onGlobalResizeEnd);
        window.removeEventListener('pointercancel', onGlobalResizeEnd);

        activeResize.win.classList.remove('is-resizing');
        document.body.classList.remove('is-window-resizing');
        document.body.style.cursor = '';

        activeResize = null;
        lastResizeEvent = null;
        updateWorkspaceHeight();
    }

    // Attach listeners to each window
    windows.forEach(win => {
        win._winX = win._winX || 0;
        win._winY = win._winY || 0;

        const titlebar = win.querySelector('.kali-titlebar');
        const closeBtn = win.querySelector('.kali-btn-close');
        const minBtn = win.querySelector('.kali-btn-min');
        const maxBtn = win.querySelector('.kali-btn-max');
        const resizeHandles = win.querySelectorAll('.fg-win-resize-handle, .kali-resize-grip');

        // Bring to front on pointerdown anywhere on the window
        win.addEventListener('pointerdown', () => {
            highestDesktopZ++;
            win.style.zIndex = highestDesktopZ;
            windows.forEach(w => w.classList.remove('is-focused'));
            win.classList.add('is-focused');
        });

        // 1. Titlebar Dragging
        if (titlebar) {
            titlebar.addEventListener('pointerdown', (e) => {
                if (e.target.closest('.kali-controls') || e.target.closest('.kali-btn') || e.target.closest('button') || e.target.closest('a')) return;
                if (win.classList.contains('is-maximized')) return;
                if (e.button !== 0) return; // Only primary button

                activeDrag = {
                    win,
                    startPointerX: e.clientX,
                    startPointerY: e.clientY,
                    startX: win._winX || 0,
                    startY: win._winY || 0
                };

                win.classList.add('is-dragging');
                document.body.classList.add('is-window-dragging');
                document.body.style.cursor = 'grabbing';

                window.addEventListener('pointermove', onGlobalDragMove, { passive: false });
                window.addEventListener('pointerup', onGlobalDragEnd);
                window.addEventListener('pointercancel', onGlobalDragEnd);

                e.preventDefault();
            });

            // Double click titlebar to toggle maximize
            titlebar.addEventListener('dblclick', (e) => {
                if (e.target.closest('.kali-controls') || e.target.closest('.kali-btn') || e.target.closest('button') || e.target.closest('a')) return;
                toggleMaximize(win);
            });
        }

        // 2. Resizing via 8 Handles & Grips
        resizeHandles.forEach(handle => {
            handle.addEventListener('pointerdown', (e) => {
                if (win.classList.contains('is-maximized')) return;
                if (e.button !== 0) return; // Only primary button

                const dir = handle.dataset.direction || 'se';
                const cursor = cursorMap[dir] || 'nwse-resize';

                activeResize = {
                    win,
                    dir,
                    cursor,
                    startPointerX: e.clientX,
                    startPointerY: e.clientY,
                    startW: win.offsetWidth,
                    startH: win.offsetHeight,
                    startX: win._winX || 0,
                    startY: win._winY || 0,
                    minW: win.id === 'hero-win-projects' ? 380 : (win.id === 'hero-win-vlc' ? 280 : 300),
                    minH: win.id === 'hero-win-projects' ? 260 : (win.id === 'hero-win-vlc' ? 180 : 200),
                    maxW: Math.max(900, Math.floor(window.innerWidth * 0.95)),
                    maxH: Math.max(700, Math.floor(window.innerHeight * 0.92))
                };

                win.classList.add('is-resizing');
                document.body.classList.add('is-window-resizing');
                document.body.style.cursor = cursor;

                window.addEventListener('pointermove', onGlobalResizeMove, { passive: false });
                window.addEventListener('pointerup', onGlobalResizeEnd);
                window.addEventListener('pointercancel', onGlobalResizeEnd);

                e.preventDefault();
                e.stopPropagation();
            });
        });

        // 3. Maximize Button
        if (maxBtn) {
            maxBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMaximize(win);
            });
        }

        // 4. Close Button
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                win.classList.add('is-closed');
                const vid = win.querySelector('video');
                if (vid) vid.pause();
                updateWorkspaceHeight();
            });
        }

        // 5. Minimize Button
        if (minBtn) {
            minBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                win.classList.toggle('is-minimized');
                updateWorkspaceHeight();
            });
        }
    });

    window.addEventListener('resize', updateWorkspaceHeight, { passive: true });
    updateWorkspaceHeight();
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

// --------------- Project Windows Carousel & Info -----------
function initProjectWindowsCarousel() {
    PROJECTS.forEach((proj, pIdx) => {
        const win = document.getElementById(`hero-win-${pIdx}`);
        if (!win) return;

        const slides = win.querySelectorAll('.fg-slide-img');
        const counterCur = win.querySelector('.fg-cur-idx');
        const badgeIdx = win.querySelector('.fg-badge-idx');
        const badgeCap = win.querySelector('.fg-badge-cap');
        const prevBtn = win.querySelector('.fg-win-prev-btn');
        const nextBtn = win.querySelector('.fg-win-next-btn');
        const infoBtn = win.querySelector('.fg-win-info-btn');
        const infoDrawer = win.querySelector('.fg-win-info-drawer');
        const contentArea = win.querySelector('.fg-hero-window-content');

        const items = proj.items || [];
        if (!items.length) return;

        let currentIndex = 0;
        let autoplayTimer = null;

        function showImage(idx) {
            if (idx < 0) idx = items.length - 1;
            if (idx >= items.length) idx = 0;
            currentIndex = idx;

            if (slides.length > 0) {
                slides.forEach((s, i) => {
                    if (i === currentIndex) {
                        s.classList.add('is-active');
                    } else {
                        s.classList.remove('is-active');
                    }
                });
            }

            const item = items[currentIndex];
            if (counterCur) counterCur.textContent = (currentIndex + 1);
            if (badgeIdx) badgeIdx.textContent = `${currentIndex + 1}/${items.length}`;
            if (badgeCap) badgeCap.textContent = item.caption || proj.title;
        }

        // Automatic fade-in / fade-out slideshow
        function startAutoplay() {
            if (items.length <= 1) return;
            stopAutoplay();
            autoplayTimer = setInterval(() => {
                showImage(currentIndex + 1);
            }, 3200);
        }

        function stopAutoplay() {
            if (autoplayTimer) {
                clearInterval(autoplayTimer);
                autoplayTimer = null;
            }
        }

        startAutoplay();

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                stopAutoplay();
                showImage(currentIndex - 1);
                startAutoplay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                stopAutoplay();
                showImage(currentIndex + 1);
                startAutoplay();
            });
        }

        if (contentArea) {
            // Pause slideshow on hover to invite clicking "SEE MORE"
            contentArea.addEventListener('mouseenter', () => {
                stopAutoplay();
            });

            contentArea.addEventListener('mouseleave', () => {
                startAutoplay();
            });

            contentArea.addEventListener('click', (e) => {
                // Ignore click if clicking "SEE MORE" button or Info drawer
                if (e.target.closest('.fg-see-more-btn') || e.target.closest('.fg-win-info-drawer') || e.target.closest('.fg-win-info-btn')) return;
                stopAutoplay();
                showImage(currentIndex + 1);
                startAutoplay();
            });
        }

        if (infoBtn && infoDrawer) {
            infoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = infoDrawer.classList.toggle('is-open');
                infoBtn.classList.toggle('is-active', isOpen);
                infoDrawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
            });
        }
    });
}

// --------------- Contact Window Actions --------------------
function initContactWindow() {
    const copyBtn = document.getElementById('copy-email-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText('lorenzokraja99@gmail.com').then(() => {
                copyBtn.textContent = 'COPIATO!';
                setTimeout(() => {
                    copyBtn.textContent = 'COPIA';
                }, 2000);
            }).catch(() => {});
        });
    }
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

    // Contact window focus for desktop
    const contactDesktopLink = document.querySelector(".nb-nav-contact-link");
    if (contactDesktopLink) {
        contactDesktopLink.addEventListener("click", (e) => {
            e.preventDefault();
            if (typeof openAndFocusWindow === 'function') {
                openAndFocusWindow('hero-win-contact');
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
                if (typeof openAndFocusWindow === 'function') {
                    openAndFocusWindow('hero-win-contact');
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
        document.querySelector(".nb-nav-center-logo"),
        document.querySelector(".nb-nav-col-3"),
        document.querySelector(".nb-nav-col-4")
    ];

    let ticking = false;

    function checkContrast() {
        const mediaElements = document.querySelectorAll(
            ".nb-media-box, .nb-reel, .nb-media-item img, .nb-reel video, .fg-hero-window-content img, .vlc-video-element"
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
