"""Synthetic images with metadata for the Image Metadata tool (Tool Pack 57).

    python tests/fixtures/images/make-image-metadata-fixtures.py

Made with Pillow, independently of the tool under test; every value is invented (no real photograph, person or
place). Writes, next to this script:

  md-gps-rot6.jpg   JPEG 64x48 with Exif: make, model, software, date, date taken, orientation 6, GPS
                    latitude/longitude/altitude; plus an XMP packet (APP1) and a comment (COM).
  md-text.png       PNG 40x30 with tEXt (Author), iTXt (Description), an eXIf chunk with GPS and a tIME chunk.
  md-plain.png      PNG 40x30 with no metadata at all.
  md-expected.json  what Pillow reads back from those files: the oracle the unit tests compare with.
"""
import io, json, os, struct, zlib
from fractions import Fraction
from PIL import Image, ImageDraw, PngImagePlugin
from PIL.TiffImagePlugin import IFDRational

HERE = os.path.dirname(os.path.abspath(__file__))

def picture(w, h):
    im = Image.new("RGB", (w, h), (240, 240, 240))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, w // 2 - 1, h // 2 - 1], fill=(200, 30, 30))
    d.rectangle([w // 2, h // 2, w - 1, h - 1], fill=(30, 60, 200))
    return im

def dms(value):
    deg = int(value)
    minutes_full = (value - deg) * 60
    minutes = int(minutes_full)
    seconds = round((minutes_full - minutes) * 60, 2)
    return (IFDRational(deg, 1), IFDRational(minutes, 1), IFDRational(Fraction(seconds).limit_denominator(100)))

def exif_with_gps(orientation):
    ex = Image.Exif()
    ex[0x010F] = "ZZ-MAKE"
    ex[0x0110] = "ZZ-MODEL-42"
    ex[0x0131] = "ZZ-EDITOR 1.0"
    ex[0x0132] = "2031:02:03 04:05:06"
    if orientation:
        ex[0x0112] = orientation
    # sub-IFDs are written only when assigned as dicts (changes to get_ifd() results are not kept)
    ex[0x8769] = {0x9003: "2031:02:03 04:05:06"}
    ex[0x8825] = {1: "N", 2: dms(12.3456), 3: "W", 4: dms(65.4321), 5: b"\x00", 6: IFDRational(123, 1)}
    return ex

def jpeg_with_extras(im, exif):
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=90, exif=exif.tobytes(), comment=b"ZZ-COMMENT")
    data = buf.getvalue()
    xmp = b"http://ns.adobe.com/xap/1.0/\x00" + b'<x:xmpmeta xmlns:x="adobe:ns:meta/"><ZZ-XMP-OWNER/></x:xmpmeta>'
    seg = b"\xff\xe1" + struct.pack(">H", len(xmp) + 2) + xmp
    return data[:2] + seg + data[2:]

def png_chunk(kind, payload):
    return struct.pack(">I", len(payload)) + kind + payload + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)

def png_with_text(im):
    info = PngImagePlugin.PngInfo()
    info.add_text("Author", "ZZ-AUTHOR")
    info.add_itxt("Description", "ZZ-DESCRIPTION")
    buf = io.BytesIO()
    im.save(buf, "PNG", pnginfo=info, exif=exif_with_gps(None).tobytes())
    data = buf.getvalue()
    # add a tIME chunk just before IEND (Pillow does not write one)
    t = png_chunk(b"tIME", struct.pack(">HBBBBB", 2031, 2, 3, 4, 5, 6))
    return data[:-12] + t + data[-12:]

def read_back(path):
    im = Image.open(path)
    ex = im.getexif()
    gps = ex.get_ifd(0x8825)
    out = {
        "size": list(im.size),
        "orientation": ex.get(0x0112),
        "make": ex.get(0x010F),
        "model": ex.get(0x0110),
        "software": ex.get(0x0131),
        "dateTime": ex.get(0x0132),
        "dateTaken": ex.get_ifd(0x8769).get(0x9003),
        "gps": None,
        "text": {k: v for k, v in im.info.items() if isinstance(v, str) and k not in ("exif",)},
    }
    if gps:
        def dec(v, ref):
            d = float(v[0]) + float(v[1]) / 60 + float(v[2]) / 3600
            return round(-d if ref in ("S", "W") else d, 6)
        out["gps"] = {"latitude": dec(gps[2], gps[1]), "longitude": dec(gps[4], gps[3]), "altitude": float(gps[6])}
    return out

files = {
    "md-gps-rot6.jpg": jpeg_with_extras(picture(64, 48), exif_with_gps(6)),
    "md-text.png": png_with_text(picture(40, 30)),
}
plain = io.BytesIO()
picture(40, 30).save(plain, "PNG")
files["md-plain.png"] = plain.getvalue()

for name, data in files.items():
    with open(os.path.join(HERE, name), "wb") as f:
        f.write(data)

expected = {name: read_back(os.path.join(HERE, name)) for name in files}
with open(os.path.join(HERE, "md-expected.json"), "w", encoding="utf-8") as f:
    json.dump(expected, f, indent=2, sort_keys=True)
print(json.dumps(expected, indent=1))
