const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../css/style.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replacement 1: Replace Desktop Windows Workspace with clean staggered windows
const startMarker1 = '/* --- Desktop Windows Workspace (Projects File Manager + VLC Media Player) --- */';
const endMarker1 = '/* ============================================================\r\n   SIDE FLOATING ABOUT BUTTON (Right Edge, Mid-Height)';
const endMarker1Alt = '/* ============================================================\n   SIDE FLOATING ABOUT BUTTON (Right Edge, Mid-Height)';

const cleanWindowsCSS = `/* --- Row 2: Staggered Asymmetrical Windows matching Allegato 1 --- */
.fg-hero-windows {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0 4vw;
    margin: 36px 0 48px 0;
    min-height: auto;
}

.fg-hero-window {
    background: var(--win-bg);
    border: 1px solid var(--win-border);
    border-radius: 8px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.14), 0 2px 6px rgba(0, 0, 0, 0.06);
    transition: box-shadow 0.25s ease, transform 0.25s ease,
        background-color 0.25s ease, border-color 0.25s ease;
}

/* Left window (Harp Chair) - sitting lower down on the left, smaller */
.fg-hero-window-left {
    width: 29vw;
    max-width: 410px;
    min-width: 270px;
    margin-top: 80px; /* Staggered downwards matching Allegato 1 */
    margin-left: 2vw;
    z-index: 5;
}

/* Right window (NOMOD) - sitting higher up on the right, slightly wider */
.fg-hero-window-right {
    width: 33vw;
    max-width: 470px;
    min-width: 300px;
    margin-top: 0; /* Sits higher up matching Allegato 1 */
    margin-right: 3vw;
    z-index: 6;
}

.fg-hero-window:hover {
    box-shadow: 0 22px 54px rgba(0, 0, 0, 0.22), 0 4px 10px rgba(0, 0, 0, 0.08);
    transform: translateY(-3px);
}

.fg-hero-window .kali-titlebar {
    height: 30px;
}

.fg-hero-window .kali-menubar {
    height: 24px;
    font-size: 11px;
}

.fg-hero-window .kali-nav-toolbar {
    height: 32px;
    display: flex;
    align-items: center;
    padding: 0 10px;
    background: var(--win-toolbar-bg);
    border-bottom: 1px solid var(--win-toolbar-border);
    font-size: 11px;
}

/* Content Area — Image Preview (More compact / smaller) */
.fg-hero-window-content {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--media-bg);
    height: 230px !important;
    max-height: 230px !important;
    min-height: 230px !important;
    flex: none !important;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.25s ease;
}

.fg-hero-window-content img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    user-select: none;
    -webkit-user-drag: none;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.fg-hero-window:hover .fg-hero-window-content img {
    transform: scale(1.03);
}

.fg-hero-window-placeholder {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.fg-window-badge {
    position: absolute;
    bottom: 10px;
    right: 10px;
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    background: rgba(0, 0, 0, 0.78);
    color: #ffffff;
    padding: 3px 7px;
    border-radius: 4px;
    letter-spacing: 0.04em;
    backdrop-filter: blur(4px);
    pointer-events: none;
    transition: background 0.2s ease, transform 0.2s ease;
}

.fg-hero-window:hover .fg-window-badge {
    background: #0000ff;
    transform: scale(1.05);
}

body.dark-theme .fg-window-badge {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.25);
}

body.dark-theme .fg-hero-window:hover .fg-window-badge {
    background: #3b82f6;
    border-color: #60a5fa;
}

.fg-hero-window .kali-statusbar {
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    background: var(--win-status-bg);
    border-top: 1px solid var(--win-border);
    font-family: 'Space Mono', monospace;
    font-size: 9.5px;
    color: var(--win-status-color);
}

\n`;

const idx1 = css.indexOf(startMarker1);
let idx2 = css.indexOf(endMarker1);
if (idx2 === -1) idx2 = css.indexOf(endMarker1Alt);

if (idx1 !== -1 && idx2 !== -1) {
    css = css.substring(0, idx1) + cleanWindowsCSS + css.substring(idx2);
    console.log('Replaced desktop windows block successfully');
} else {
    console.error('Failed to locate block 1', { idx1, idx2 });
}

// Replacement 2: Remove desktop icons on index
const startMarker2 = '/* --- Desktop Icons on Index (Projects Folder) --- */';
const endMarker2 = '@media (max-width: 768px) {';

const idx3 = css.indexOf(startMarker2);
const idx4 = css.indexOf(endMarker2, idx3);

if (idx3 !== -1 && idx4 !== -1) {
    css = css.substring(0, idx3) + css.substring(idx4);
    console.log('Removed desktop icons block successfully');
} else {
    console.error('Failed to locate block 2', { idx3, idx4 });
}

fs.writeFileSync(cssPath, css, 'utf8');
console.log('CSS updated successfully. New size:', css.length);
