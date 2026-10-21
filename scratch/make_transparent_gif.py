import os
from PIL import Image

frames_dir = 'scratch/gif_frames'
frame_files = sorted([f for f in os.listdir(frames_dir) if f.startswith('frame_') and f.endswith('.png')])

print(f"Processing {len(frame_files)} frames for transparent GIF...")

def process_frame(img):
    rgba = img.convert('RGBA')
    datas = rgba.getdata()
    new_data = []
    for item in datas:
        # Near-white is background -> fully transparent
        if item[0] > 235 and item[1] > 235 and item[2] > 235:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    rgba.putdata(new_data)
    
    alpha = rgba.split()[-1]
    mask = Image.eval(alpha, lambda a: 255 if a < 128 else 0)
    
    p = rgba.convert('RGB').quantize(colors=127)
    p.paste(255, mask)
    p.info['transparency'] = 255
    return p

pil_frames = []
for f in frame_files:
    raw = Image.open(os.path.join(frames_dir, f))
    pil_frames.append(process_frame(raw))

out_path = 'assets/lorenzo-spinning.gif'
pil_frames[0].save(
    out_path,
    save_all=True,
    append_images=pil_frames[1:],
    duration=65,  # 65ms per frame * 96 frames = ~6.24 seconds (slow, majestic spin)
    loop=0,
    transparency=255,
    disposal=2,
    optimize=True
)

print(f"Saved {out_path}, size: {os.path.getsize(out_path)} bytes")
