import os
from PIL import Image

frames_dir = 'scratch/gif_frames'
frame_files = sorted([f for f in os.listdir(frames_dir) if f.startswith('frame_') and f.endswith('.png')])

print(f"Processing {len(frame_files)} frames with clean palette...")

pil_frames = []
for f in frame_files:
    # Read the raw rendered frame (which was rendered on white in Chrome)
    img = Image.open(os.path.join(frames_dir, f)).convert('RGB')
    # Quantize to 16 grayscale colors with NO dither (super clean solid black & white)
    p_img = img.quantize(colors=16, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pil_frames.append(p_img)

out_path = 'assets/lorenzo-spinning.gif'
pil_frames[0].save(
    out_path,
    save_all=True,
    append_images=pil_frames[1:],
    duration=65,  # 65ms * 96 = ~6.24s
    loop=0,
    optimize=True
)

print(f"Saved clean {out_path}, size: {os.path.getsize(out_path)} bytes")
