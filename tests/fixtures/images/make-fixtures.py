"""
Small test images for the Image Compressor & Resizer (Tool Pack 20), made with Pillow.

Run:  python tests/fixtures/images/make-fixtures.py        (rewrites the files next to this script)

Deterministic (seeded). Large images are NOT committed: the browser tests generate them in the page. The script
also writes expected.json: what Pillow itself reads from each file (format, stored size, mode, whether any pixel is
transparent). The unit tests compare the engine's header parsing with that, so the engine is checked against a
reader that shares none of its code.
"""
import io
import json
import os

import numpy as np
from PIL import Image, ImageDraw

here = os.path.dirname(os.path.abspath(__file__))
rng = np.random.default_rng(20261007)


def photo(w, h, grain=10):
    y, x = np.mgrid[0:h, 0:w]
    base = np.stack([128 + 100 * np.sin(x / 90.0), 128 + 90 * np.sin(y / 70.0 + x / 200.0), 128 + 80 * np.cos((x + y) / 120.0)], axis=-1)
    img = np.clip(base + rng.normal(0, grain, (h, w, 1)) + rng.normal(0, grain / 2, (h, w, 3)), 0, 255).astype(np.uint8)
    return Image.fromarray(img)


def quadrants(w, h):
    im = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, w // 2 - 1, h // 2 - 1], fill=(255, 0, 0))          # top-left red
    d.rectangle([w // 2, 0, w - 1, h // 2 - 1], fill=(0, 255, 0))          # top-right green
    d.rectangle([0, h // 2, w // 2 - 1, h - 1], fill=(0, 0, 255))          # bottom-left blue
    d.rectangle([w // 2, h // 2, w - 1, h - 1], fill=(255, 255, 0))        # bottom-right yellow
    return im


def save(name, data):
    with open(os.path.join(here, name), "wb") as f:
        f.write(data)


def encode(im, fmt, **kw):
    buf = io.BytesIO()
    im.save(buf, fmt, **kw)
    return buf.getvalue()


files = {}
p = photo(640, 480)
files["photo.jpg"] = encode(p, "JPEG", quality=85)
files["lowq.jpg"] = encode(p, "JPEG", quality=35, optimize=True, progressive=True)
exif = Image.Exif(); exif[0x0112] = 6
files["portrait-exif6.jpg"] = encode(quadrants(320, 240), "JPEG", quality=92, exif=exif)
secret = Image.Exif(); secret[0x010E] = "SECRET-GPS-MARKER-12.97N-77.59E"; secret[0x0110] = "ACME-CAMERA-9000"
files["exif-secret.jpg"] = encode(photo(320, 240), "JPEG", quality=85, exif=secret)

logo = Image.new("RGBA", (200, 100), (0, 0, 0, 0))
ld = ImageDraw.Draw(logo); ld.ellipse([10, 10, 190, 90], fill=(220, 40, 60, 255)); ld.ellipse([60, 30, 140, 70], fill=(255, 255, 255, 140))
files["logo-alpha.png"] = encode(logo, "PNG", optimize=True)
opaque = Image.new("RGBA", (200, 100), (30, 120, 200, 255)); ImageDraw.Draw(opaque).ellipse([20, 20, 180, 80], fill=(250, 200, 20, 255))
files["opaque-rgba.png"] = encode(opaque, "PNG", optimize=True)

shot = Image.new("RGB", (400, 300), (245, 247, 250)); sd = ImageDraw.Draw(shot)
for i in range(0, 300, 30):
    sd.rectangle([10, i + 4, 390, i + 24], fill=(255, 255, 255), outline=(220, 224, 230)); sd.text((16, i + 8), "Row %d  The quick brown fox 0123456789" % i, fill=(30, 41, 59))
files["screenshot.png"] = encode(shot, "PNG", optimize=True)
files["photo.webp"] = encode(photo(320, 240), "WEBP", quality=80)
awebp = Image.new("RGBA", (200, 100), (0, 0, 0, 0)); ImageDraw.Draw(awebp).ellipse([10, 10, 190, 90], fill=(20, 160, 90, 255))
files["alpha.webp"] = encode(awebp, "WEBP", quality=80)
files["lossless.webp"] = encode(photo(160, 120), "WEBP", lossless=True)

files["png-named-jpg.jpg"] = files["screenshot.png"]
files["not-an-image.jpg"] = b"This is plain text, not an image.\n" * 4
files["truncated.jpg"] = files["photo.jpg"][:600]
files["empty.jpg"] = b""
frames = [Image.new("P", (32, 32), 1), Image.new("P", (32, 32), 2)]
buf = io.BytesIO(); frames[0].save(buf, "GIF", save_all=True, append_images=frames[1:], duration=100, loop=0); files["anim.gif"] = buf.getvalue()
files["heic-stub.heic"] = bytes([0, 0, 0, 24]) + b"ftypheic" + bytes([0, 0, 0, 0]) + b"mif1heic" + bytes(64)
files["avif-stub.avif"] = bytes([0, 0, 0, 24]) + b"ftypavif" + bytes([0, 0, 0, 0]) + b"avifmif1" + bytes(64)
files["icon.svg"] = b'<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="red"/></svg>\n'

expected = {}
for name, data in files.items():
    save(name, data)
    try:
        im = Image.open(io.BytesIO(data)); im.load()
    except Exception:
        continue
    if im.format not in ("JPEG", "PNG", "WEBP"):
        continue
    alpha = False
    if "A" in im.getbands():
        alpha = int(np.asarray(im.convert("RGBA"))[:, :, 3].min()) < 255
    orient = im.getexif().get(0x0112, 1)
    expected[name] = {"format": im.format, "width": im.size[0], "height": im.size[1], "mode": im.mode, "hasTransparentPixel": alpha, "exifOrientation": orient, "bytes": len(data)}
with open(os.path.join(here, "expected.json"), "w") as f:
    json.dump(expected, f, indent=1, sort_keys=True)
for name in sorted(files):
    print(name.ljust(22), len(files[name]), "bytes")
