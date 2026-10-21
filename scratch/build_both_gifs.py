import os
from PIL import Image, ImageOps

frames_dir = 'scratch/gif_frames'
frame_files = sorted([f for f in os.listdir(frames_dir) if f.startswith('frame_') and f.endswith('.png')])

print(f"Generating true transparent GIFs for {len(frame_files)} frames...")

light_frames = []
dark_frames = []

for f in frame_files:
    raw = Image.open(os.path.join(frames_dir, f)).convert('RGB')
    
    # 1. LIGHT FRAME: make near-white pure (255, 255, 255)
    data = list(raw.getdata())
    clean_light = [(255, 255, 255) if (p[0] > 225 and p[1] > 225 and p[2] > 225) else p for p in data]
    img_l = Image.new('RGB', raw.size)
    img_l.putdata(clean_light)
    p_light = img_l.quantize(colors=16, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    
    # Find white index
    pal_l = p_light.getpalette()
    white_idx = 0
    for i in range(0, len(pal_l), 3):
        if pal_l[i] == 255 and pal_l[i+1] == 255 and pal_l[i+2] == 255:
            white_idx = i // 3
            break
    p_light.info['transparency'] = white_idx
    light_frames.append(p_light)

    # 2. DARK FRAME: invert text to white, background to #202020 (32, 32, 32)
    # Background in clean_light is (255, 255, 255), foreground is black / dark gray
    clean_dark = [(32, 32, 32) if (p[0] > 225 and p[1] > 225 and p[2] > 225) else (255 - p[0], 255 - p[1], 255 - p[2]) for p in data]
    img_d = Image.new('RGB', raw.size)
    img_d.putdata(clean_dark)
    p_dark = img_d.quantize(colors=16, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    
    # Find bg index (32, 32, 32)
    pal_d = p_dark.getpalette()
    bg_idx = 0
    for i in range(0, len(pal_d), 3):
        if pal_d[i] == 32 and pal_d[i+1] == 32 and pal_d[i+2] == 32:
            bg_idx = i // 3
            break
    p_dark.info['transparency'] = bg_idx
    dark_frames.append(p_dark)

# Save light GIF
out_light = 'assets/lorenzo-spinning.gif'
light_frames[0].save(
    out_light,
    save_all=True,
    append_images=light_frames[1:],
    duration=65,
    loop=0,
    transparency=light_frames[0].info['transparency'],
    disposal=2,
    optimize=True
)
print(f"Saved light GIF: {out_light}, size: {os.path.getsize(out_light)}")

# Save dark GIF
out_dark = 'assets/lorenzo-spinning-dark.gif'
dark_frames[0].save(
    out_dark,
    save_all=True,
    append_images=dark_frames[1:],
    duration=65,
    loop=0,
    transparency=dark_frames[0].info['transparency'],
    disposal=2,
    optimize=True
)
print(f"Saved dark GIF: {out_dark}, size: {os.path.getsize(out_dark)}")
