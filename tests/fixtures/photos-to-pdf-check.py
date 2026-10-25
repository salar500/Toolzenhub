"""Second, independent reading of a generated PDF (Tool Pack 31), standard library only.

    python tests/fixtures/photos-to-pdf-check.py file.pdf expected.json

expected.json: {"images": [{"width": 64, "sha256": "..."} ...]} in page order. Checks the classic
cross-reference table (every offset points at 'N 0 obj'), the page count, that page i holds an
image of the expected width (widths are all different, so this proves the ORDER) and that each
embedded image stream is byte for byte the expected JPEG when a sha256 is given.
Exit status 0 and one JSON line on success; an AssertionError otherwise.
"""
import hashlib, json, re, sys

data = open(sys.argv[1], "rb").read()
expect = json.load(open(sys.argv[2]))["images"]

m = re.search(rb"startxref\s+(\d+)\s+%%EOF\s*$", data)
assert m, "no startxref"
xpos = int(m.group(1))
assert data[xpos:xpos + 4] == b"xref"
lines = data[xpos:].split(b"\n")
first, count = map(int, lines[1].split())
offsets = {}
for i in range(count):
    off, gen, kind = lines[2 + i].split()[:3]
    if kind == b"n":
        offsets[first + i] = int(off)
objs = {}
for num, off in offsets.items():
    assert re.match(rb"%d 0 obj" % num, data[off:off + 24]), "bad offset for object %d" % num
    objs[num] = data[off:data.index(b"endobj", off)]

tree = next(b for b in objs.values() if re.search(rb"/Type\s*/Pages", b))
kids = [int(x) for x in re.findall(rb"(\d+) 0 R", re.search(rb"/Kids\s*\[(.*?)\]", tree, re.S).group(1))]
assert int(re.search(rb"/Count\s+(\d+)", tree).group(1)) == len(kids) == len(expect), "page count"

name = rb"/[^\s/<>]+\s+(\d+) 0 R"
for index, page in enumerate(kids):
    body = objs[page]
    res = re.search(rb"/Resources\s+(\d+) 0 R", body)
    scope = objs[int(res.group(1))] if res else body
    image = objs[int(re.search(name, re.search(rb"/XObject\s*<<(.*?)>>", scope, re.S).group(1)).group(1))]
    assert int(re.search(rb"/Width\s+(\d+)", image).group(1)) == expect[index]["width"], "page %d holds the wrong image" % (index + 1)
    if expect[index].get("sha256"):
        length = int(re.search(rb"/Length\s+(\d+)", image).group(1))
        s = image.index(b"stream") + 6
        s += 2 if image[s:s + 2] == b"\r\n" else 1 if image[s:s + 1] == b"\n" else 0
        assert hashlib.sha256(image[s:s + length]).hexdigest() == expect[index]["sha256"], "image bytes changed on page %d" % (index + 1)
print(json.dumps({"ok": True, "pages": len(kids), "objects": len(offsets)}))
