"""A second, independent reader for the PDF tools tests. Usage: python pdf-tools-check.py <file.pdf>
Prints one JSON object: pages (label, width, height, rotate, annotations) and outline length.
Exits 3 when pypdf is not installed, so the test can skip."""
import json, sys

try:
    from pypdf import PdfReader
except Exception:
    sys.exit(3)

r = PdfReader(sys.argv[1])
print(json.dumps({
    "pages": [{"label": p.extract_text().strip(), "width": round(float(p.mediabox.width)), "height": round(float(p.mediabox.height)), "rotate": int(p.get("/Rotate", 0)), "annotations": len(p.get("/Annots", []))} for p in r.pages],
    "outline": len(r.outline),
    "encrypted": r.is_encrypted,
}))
