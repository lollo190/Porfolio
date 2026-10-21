import os
from PIL import Image, ImageOps

frames_dir = 'scratch/gif_frames'
frame_files = sorted([f for f in os.listdir(frames_dir) if f.startswith('frame_') and f.endswith('.png')])

print(f"Creating dark version for {len(frame_files)} frames...")

dark_frames = []
for f in frame_files:
    img = Image.open(os.path.join(frames_dir, f)).convert('L') # grayscale
    # Invert grayscale: black becomes white, white becomes black
    inv = ImageOps.invert(img)
    # Now white text is 255, black background is 0
    # Map 0 to dark theme bg #202020 (RGB 32, 32, 32)
    # Using point transform: val = 32 + (val / 255.0) * (255 - 32)
    mapped = inv.point(lambda v: int(32 + (v / 255.0) * (255 - 32)))
    # Quantize to 16 colors
    p_img = mapped.convert('RGB').quantize(colors=16, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    dark_frames.append(p_img)

out_dark = 'assets/lorenzo-spinning-dark.gif'
dark_frames[0].save(
    out_dark,
    save_all=True,
    append_images=dark_frames[1:],
    duration=65,
    loop=0,
    optimize=True
)

print(f"Saved dark {out_dark}, size: {os.path.getsize(out_dark)} bytes")
