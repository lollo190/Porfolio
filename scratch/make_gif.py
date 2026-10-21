import os
from PIL import Image

frames_dir = 'scratch/gif_frames'
frame_files = sorted([f for f in os.listdir(frames_dir) if f.startswith('frame_') and f.endswith('.png')])

print(f"Found {len(frame_files)} frames")

pil_frames = []
for f in frame_files:
    img = Image.open(os.path.join(frames_dir, f)).convert('RGB')
    p_img = img.quantize(colors=16, method=Image.Quantize.MEDIANCUT)
    pil_frames.append(p_img)

out_path = 'assets/lorenzo-spinning.gif'
pil_frames[0].save(
    out_path,
    save_all=True,
    append_images=pil_frames[1:],
    duration=40,
    loop=0,
    optimize=True
)

print(f"Saved {out_path}, file size: {os.path.getsize(out_path)} bytes")
