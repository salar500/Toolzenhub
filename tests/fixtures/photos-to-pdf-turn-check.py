"""Independent check that a turned page shows the photo turned the right way (Tool Pack 44).

    python tests/fixtures/photos-to-pdf-turn-check.py file.pdf TURN

TURN is the clockwise quarter-turns (0 to 3) the photo on page 1 must show. The photo must have four
differently coloured quadrants (tests/fixtures/images/meta-keep.jpg). The script reads the PDF with
its own small parser (standard library plus Pillow), takes the transformation matrix from the page's
content stream and the JPEG from the image stream, then PAINTS the page at 1 point per pixel by
inverse-mapping each page pixel into the picture. The painted quadrants are compared with Pillow's
own rotation of the same picture. Prints one JSON line on success, raises AssertionError otherwise.
"""
import io, json, re, sys, zlib
from PIL import Image

data = open(sys.argv[1], "rb").read()
turn = int(sys.argv[2])


def stream_of(obj_body):
    m = re.search(rb"stream\r?\n", obj_body)
    start = m.end()
    end = obj_body.rindex(b"endstream")
    raw = obj_body[start:end].rstrip(b"\r\n")
    return zlib.decompress(raw) if b"/FlateDecode" in obj_body[:m.start()] else raw


objs = {int(n): body for n, body in re.findall(rb"(?:^|\n)(\d+) 0 obj(.*?)endobj", data, re.S)}
image_body = next(b for b in objs.values() if b"/Subtype" in b and b"/Image" in b and b"/DCTDecode" in b)
picture = Image.open(io.BytesIO(stream_of(image_body))).convert("RGB")

page = next(b for b in objs.values() if re.search(rb"/Type\s*/Page\b", b))
content_ref = int(re.search(rb"/Contents\s*(?:\[\s*)?(\d+) 0 R", page).group(1))
ops = stream_of(objs[content_ref]).decode("latin1")
ops = ops[: ops.index(" Do")]
ctm = (1, 0, 0, 1, 0, 0)
for m in re.finditer(r"([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+) cm", ops):
    a, b, c, d, e, f = map(float, m.groups())
    A, B, C, D, E, F = ctm  # new matrix applied first: result = new x old
    ctm = (a * A + b * C, a * B + b * D, c * A + d * C, c * B + d * D, e * A + f * C + E, e * B + f * D + F)
a, b, c, d, e, f = ctm

xs = [e, e + a, e + c, e + a + c]
ys = [f, f + b, f + d, f + b + d]
x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
W, H = x1 - x0, y1 - y0
det = a * d - b * c
assert abs(det) > 1e-6


def paint(px, py):
    """page point -> colour of the picture there (nearest pixel); the picture's unit square is (0,0)-(1,1), v up"""
    dx, dy = px - e, py - f
    u = (d * dx - c * dy) / det
    v = (-b * dx + a * dy) / det
    assert -1e-6 <= u <= 1 + 1e-6 and -1e-6 <= v <= 1 + 1e-6, "sample outside the picture"
    ix = min(picture.width - 1, int(u * picture.width))
    iy = min(picture.height - 1, int((1 - v) * picture.height))
    return picture.getpixel((ix, iy))


expected_img = picture.transpose([None, Image.ROTATE_270, Image.ROTATE_180, Image.ROTATE_90][turn]) if turn else picture
ew, eh = expected_img.size
assert abs(ew / eh - W / H) < 0.01, "the turned box has the wrong shape: %s vs %s" % (ew / eh, W / H)

checked = []
for qx in (0.25, 0.75):
    for qy in (0.25, 0.75):
        # qy counts from the TOP of the painted box
        got = paint(x0 + qx * W, y1 - qy * H)
        want = expected_img.getpixel((int(qx * ew), int(qy * eh)))
        assert all(abs(g - w) <= 40 for g, w in zip(got, want)), "quadrant (%s,%s): got %s want %s" % (qx, qy, got, want)
        checked.append([qx, qy, list(got)])

print(json.dumps({"turn": turn, "box": [round(W, 2), round(H, 2)], "quadrants": checked}))
