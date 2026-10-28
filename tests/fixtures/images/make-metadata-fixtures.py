"""Synthetic JPEGs that carry test-only metadata (Tool Pack 44, Photos to PDF).

    python tests/fixtures/images/make-metadata-fixtures.py

Made with Pillow plus hand-written APP segments, so they do not depend on the tool under test.
No real photograph, person or place is involved: every marker below is an invented string.

  meta-keep.jpg   orientation 1 (an upright JPEG the tool embeds as it is), with Exif text and a
                  GPS block, an XMP packet (APP1), an IPTC block (APP13), an ICC profile (APP2) and
                  a comment (COM).
  meta-rot6.jpg   the same metadata, but Exif orientation 6 (the tool redraws it).
"""
import io, os, struct
from PIL import Image, ImageCms, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))

MARK_EXIF = "ZZ-EXIF-MARKER-LAT-12.9716N-LON-77.5946E"
MARK_XMP = "ZZ-XMP-MARKER-OWNER-TEST"
MARK_IPTC = "ZZ-IPTC-MARKER-CAPTION-TEST"
MARK_COM = "ZZ-COM-MARKER"


def picture():
    im = Image.new("RGB", (320, 240), (240, 240, 240))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 159, 119], fill=(200, 30, 30))
    d.rectangle([160, 0, 319, 119], fill=(30, 160, 60))
    d.rectangle([0, 120, 159, 239], fill=(30, 60, 200))
    d.rectangle([160, 120, 319, 239], fill=(230, 200, 30))
    return im


def segment(marker, payload):
    return b"\xff" + bytes([marker]) + struct.pack(">H", len(payload) + 2) + payload


def build(orientation):
    exif = Image.Exif()
    exif[0x0112] = orientation
    exif[0x010E] = MARK_EXIF
    exif[0x0110] = "ZZ-CAMERA-TEST"
    gps = exif.get_ifd(0x8825)
    gps[1] = "N"
    gps[2] = (12.0, 58.0, 18.0)
    gps[3] = "E"
    gps[4] = (77.0, 35.0, 40.0)
    profile = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()

    buf = io.BytesIO()
    picture().save(buf, "JPEG", quality=85, exif=exif, icc_profile=profile)
    data = buf.getvalue()
    assert data[:2] == b"\xff\xd8"

    xmp = segment(0xE1, b"http://ns.adobe.com/xap/1.0/\x00<x:xmpmeta>" + MARK_XMP.encode() + b"</x:xmpmeta>")
    iptc = segment(0xED, b"Photoshop 3.0\x008BIM\x04\x04" + MARK_IPTC.encode())
    com = segment(0xFE, MARK_COM.encode())

    # after SOI and JFIF (APP0, which comes first): our extra segments, then the rest of what Pillow wrote
    assert data[2:4] == bytes([0xFF, 0xE0])
    cut = 4 + struct.unpack(">H", data[4:6])[0]
    return data[:cut] + xmp + iptc + com + data[cut:]


for name, orientation in (("meta-keep.jpg", 1), ("meta-rot6.jpg", 6)):
    with open(os.path.join(HERE, name), "wb") as f:
        f.write(build(orientation))
    print("wrote", name)
