const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const buf = fs.readFileSync('C:/Users/lory/.gemini/antigravity/brain/180e8f8a-f0bc-44a9-8e86-be276ad1a9dc/.user_uploaded/media_1792776036477_939d34b6.png');
let offset = 8, idatChunks = [], width = 0, height = 0;
while (offset < buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    if (type === 'IHDR') {
        width = buf.readUInt32BE(offset + 8);
        height = buf.readUInt32BE(offset + 12);
    } else if (type === 'IDAT') {
        idatChunks.push(buf.slice(offset + 8, offset + 8 + len));
    } else if (type === 'IEND') break;
    offset += 12 + len;
}
const raw = zlib.inflateSync(Buffer.concat(idatChunks));
const stride = 1 + width * 4;

function getPixel(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return { r: 0, g: 0, b: 0, a: 0 };
    const idx = y * stride + 1 + x * 4;
    return { r: raw[idx], g: raw[idx + 1], b: raw[idx + 2], a: raw[idx + 3] };
}

// In the reference screenshot, each window has traffic light controls on top-left:
// 1. VLC: red dot at x=222, y=14
// 2. NOMOD: red dot at x=694, y=46
// 3. HARP CHAIR: red dot at x=139, y=281
// 4. LUCA: red dot at x=535, y=278

// Let's trace each window's exact 4 borders: [left, top, right, bottom]
// For any window, let's find the window outline:
// The titlebar is uniform light gray (#e5e5e5 to #eeeeee), while the page background is textured noise.
// Also, each window casts a drop shadow, and has a 1px border.

function measureWindow(dotX, dotY, name) {
    // 1. Top border: scan up from dotY around x = dotX + 30
    let top = dotY;
    while (top > 0) {
        // check if row top has titlebar color
        let p = getPixel(dotX + 30, top);
        let pAbove = getPixel(dotX + 30, top - 1);
        // titlebar has smooth gray, above border is noise/background
        if (pAbove.r < 150 || Math.abs(pAbove.r - p.r) > 20 || top < 2) {
            break;
        }
        top--;
    }

    // 2. Left border: scan left from dotX at dotY
    let left = dotX;
    while (left > 0) {
        let p = getPixel(left, dotY);
        let pLeft = getPixel(left - 1, dotY);
        if (left < dotX - 8) {
            // border is usually around left = dotX - 12 to dotX - 16
            if (pLeft.r < 120 || Math.abs(pLeft.r - p.r) > 25) {
                break;
            }
        }
        left--;
    }

    // 3. Right border: scan right from dotX at dotY + 4
    let right = dotX + 50;
    while (right < width - 1) {
        let p = getPixel(right, dotY + 4);
        let pNext = getPixel(right + 1, dotY + 4);
        // titlebar continues smoothly until right border
        // right border is dark line, or sharp contrast with background
        if (right > dotX + 180) {
            // check if we hit the border or shadow
            if (Math.abs(pNext.r - p.r) > 30 || pNext.r < 100) {
                break;
            }
        }
        right++;
    }

    // 4. Bottom border: scan down from dotY at dotX + 50
    let bottom = dotY + 50;
    while (bottom < height - 1) {
        let p = getPixel(dotX + 50, bottom);
        let pBelow = getPixel(dotX + 50, bottom + 1);
        if (bottom > dotY + 120) {
            // window bottom has statusbar (light gray) or controls (light gray), then border / shadow / background
            if (Math.abs(pBelow.r - p.r) > 30 || pBelow.r < 100) {
                break;
            }
        }
        bottom++;
    }

    return {
        name,
        dot: { x: dotX, y: dotY },
        approx: { left, top, right, bottom, width: right - left, height: bottom - top }
    };
}

console.log(JSON.stringify([
    measureWindow(222, 14, 'VLC (reel.mp4)'),
    measureWindow(694, 46, 'NOMOD'),
    measureWindow(139, 281, 'HARP CHAIR'),
    measureWindow(535, 278, 'LUCA')
], null, 2));
