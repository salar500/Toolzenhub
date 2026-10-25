"""Second half of pdf-tools-fixtures.mjs: adds the variants only an independent library should make
(bookmarks, a link annotation, a page that is already turned, three kinds of protection) and writes the
JSON manifest. Usage: python pdf-tools-fixtures.py <dir with a.pdf b.pdf c.pdf> <out.json>
Requires pypdf and cryptography."""
import base64, hashlib, json, os, sys

from pypdf import PdfReader, PdfWriter
from pypdf.annotations import Link

src, out = sys.argv[1], sys.argv[2]
p = lambda n: os.path.join(src, n)

# a page that is already turned, an outline and an external link
w = PdfWriter(clone_from=PdfReader(p("a.pdf")))
w.add_outline_item("Chapter 1", 0)
w.add_outline_item("Chapter 2", 2)
w.add_annotation(page_number=0, annotation=Link(rect=(10, 10, 100, 40), url="https://example.org/"))
w.pages[1].rotate(90)
w.write(p("a-deco.pdf"))

# three kinds of protection; the last opens in readers without a password but has restrictions
base = PdfReader(p("a.pdf"))
w = PdfWriter(clone_from=base); w.encrypt("pw", algorithm="AES-256"); w.write(p("enc-aes256.pdf"))
w = PdfWriter(clone_from=base); w.encrypt("pw", algorithm="RC4-128"); w.write(p("enc-rc4.pdf"))
w = PdfWriter(clone_from=base); w.encrypt("", owner_password="own", algorithm="AES-128"); w.write(p("enc-owner-only.pdf"))

items = []
for name in ["a", "b", "c", "a-deco", "enc-aes256", "enc-rc4", "enc-owner-only"]:
    data = open(p(name + ".pdf"), "rb").read()
    item = {"name": name, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(), "base64": base64.b64encode(data).decode()}
    if not name.startswith("enc-"):
        r = PdfReader(p(name + ".pdf"))
        item["pages"] = [{"label": pg.extract_text().strip(), "width": round(float(pg.mediabox.width)), "height": round(float(pg.mediabox.height)), "rotate": int(pg.get("/Rotate", 0))} for pg in r.pages]
        item["outline"] = len(r.outline)
        item["annotations"] = sum(len(pg.get("/Annots", [])) for pg in r.pages)
    items.append(item)

with open(out, "w", newline="\n") as f:
    json.dump({"note": "Synthetic, disposable PDFs. Made by tests/fixtures/pdf-tools-fixtures.mjs and .py. Never put a real document here.", "items": items}, f, indent=1)
    f.write("\n")

print("wrote", out, [(i["name"], i["bytes"]) for i in items])
