const fs = require('fs');
const zlib = require('zlib');

const buf = fs.readFileSync('C:/Users/lory/.gemini/antigravity/brain/180e8f8a-f0bc-44a9-8e86-be276ad1a9dc/.user_uploaded/media_1792772982527_38671e91.png');

let offset = 8;
const idatChunks = [];
let width = 0;
let height = 0;

while (offset < buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    if (type === 'IHDR') {
        width = buf.readUInt32BE(offset + 8);
        height = buf.readUInt32BE(offset + 12);
    } else if (type === 'IDAT') {
        idatChunks.push(buf.slice(offset + 8, offset + 8 + len));
    } else if (type === 'IEND') {
        break;
    }
    offset += 12 + len;
}

const idat = Buffer.concat(idatChunks);
const raw = zlib.inflateSync(idat);
const stride = 1 + width * 4;

function getPixel(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return { r: 0, g: 0, b: 0, a: 0 };
    const idx = y * stride + 1 + x * 4;
    return { r: raw[idx], g: raw[idx + 1], b: raw[idx + 2], a: raw[idx + 3] };
}

// Windows starting points near close buttons:
// 1. VLC: close dot x=224, y=14
// 2. NOMOD: close dot x=697, y=46
// 3. HARP: close dot x=139, y=284
// 4. LUCA: close dot x=538, y=279

const seeds = [
    { name: 'VLC (reel.mp4)', dotX: 224, dotY: 14 },
    { name: 'NOMOD', dotX: 697, dotY: 46 },
    { name: 'HARP CHAIR', dotX: 139, dotY: 284 },
    { name: 'LUCA', dotX: 538, dotY: 279 }
];

seeds.forEach(s => {
    // Trace titlebar to left and right:
    // Titlebar has gray background around y = dotY
    let left = s.dotX;
    while (left > 0) {
        const p = getPixel(left, s.dotY);
        // Page background has noise or white, window border has a dark gray border line
        if (p.r > 240 && p.g > 240 && p.b > 240) {
            break;
        }
        left--;
    }

    let right = s.dotX;
    while (right < width - 1) {
        const p = getPixel(right, s.dotY);
        if (p.r > 240 && p.g > 240 && p.b > 240 && right > s.dotX + 50) {
            break;
        }
        right++;
    }

    let top = s.dotY;
    while (top > 0) {
        const p = getPixel(s.dotX, top);
        if (p.r > 240 && p.g > 240 && p.b > 240) {
            break;
        }
        top--;
    }

    let bottom = s.dotY;
    // Trace down along center of window
    const midX = Math.round((left + right) / 2);
    while (bottom < height - 10) {
        const p = getPixel(midX, bottom);
        // When bottom border is passed, page background is reached
        if (p.r > 242 && p.g > 242 && p.b > 242 && bottom > s.dotY + 100) {
            // Check if next 3 pixels are also background
            const p2 = getPixel(midX, bottom + 2);
            if (p2.r > 242 && p2.g > 242 && p2.b > 242) {
                break;
            }
        }
        bottom++;
    }

    const w = right - left;
    const h = bottom - top;
    console.log(`=== ${s.name} ===`);
    console.log(`Left: ${left}px (${(left/width*100).toFixed(1)}%), Top: ${top}px (${(top/height*100).toFixed(1)}%)`);
    console.log(`Width: ${w}px (${(w/width*100).toFixed(1)}%), Height: ${h}px (${(h/height*100).toFixed(1)}%)`);
    console.log(`Right: ${right}px (${(right/width*100).toFixed(1)}%), Bottom: ${bottom}px (${(bottom/height*100).toFixed(1)}%)`);
});
