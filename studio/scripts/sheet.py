"""Arma una hoja de contactos con los fotogramas de una carpeta. Uso: python3 sheet.py <carpeta> [cols]"""
import sys, glob, os
from PIL import Image
d = sys.argv[1]
cols = int(sys.argv[2]) if len(sys.argv) > 2 else 6
fs = sorted(glob.glob(os.path.join(d, "f*.jpg")))
W, H = 324, 576
rows = (len(fs) + cols - 1) // cols
out = Image.new("RGB", (cols * (W + 10), rows * (H + 10)), (255, 255, 255))
for i, f in enumerate(fs):
    out.paste(Image.open(f).convert("RGB").resize((W, H)), ((i % cols) * (W + 10), (i // cols) * (H + 10)))
out.save(os.path.join(d, "sheet.jpg"), quality=85)
print(os.path.join(d, "sheet.jpg"), len(fs))
