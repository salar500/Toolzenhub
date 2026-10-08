"""
Draws the diagram of the first SWP article ("How a Systematic Withdrawal Plan Works"): one month of the baseline plan,
Rs 1 crore, a Rs 80,000 withdrawal at the start of the month, an assumed 8% a year.

Development-only. It is not part of the site, the build or the tests, and the site gains no dependency: it needs Python 3
with Pillow (`pip install pillow`) and writes two files next to the other article images:

    assets/Images/articles/how-a-systematic-withdrawal-plan-works.png   (palette PNG, 1200 x 675)
    assets/Images/articles/how-a-systematic-withdrawal-plan-works.webp  (lossy WebP, the smaller of the pair)

Every number in the picture is read from the independent reference (tests/fixtures/swp-golden.py, article_figures()),
never typed in, so the picture cannot drift from the maths. The text in the picture and the alt text in
assets/js/data/articles.js must say the same thing; tests/unit/swp-articles.test.mjs checks the alt text against the reference.

The five rows sit in the middle band of the canvas (y 112 to 563) on purpose: the shared Related Articles thumbnail on the
calculator page is a fixed 150 px high and crops a 16:9 image to about 2.6:1, and the article hero crops the sides at 16:10.
Fonts come from the machine (Arial, else DejaVu Sans), so a re-run on another system can differ by a few pixels.

Run:  python tests/fixtures/swp-article-diagram.py
"""
import importlib.util
import os
import sys

sys.dont_write_bytecode = True  # keep the repository free of __pycache__

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(ROOT, "assets", "Images", "articles", "how-a-systematic-withdrawal-plan-works")

spec = importlib.util.spec_from_file_location("swp_golden", os.path.join(HERE, "swp-golden.py"))
golden = importlib.util.module_from_spec(spec)
spec.loader.exec_module(golden)
period = golden.article_figures()["period"]


def indian(n):
    s = str(int(round(float(n))))
    head, tail, parts = s[:-3], s[-3:], []
    while len(head) > 2:
        parts.insert(0, head[-2:])
        head = head[:-2]
    if head:
        parts.insert(0, head)
    return ",".join(parts + [tail]) if parts or head else s


def rupees(n):
    return "\u20b9" + indian(n)


ROWS = [
    ("Opening", rupees(period["opening"]), "plain"),
    ("\u2212 Withdrawal", rupees(period["withdrawal"]), "out"),
    ("= Remaining", rupees(period["remaining"]), "plain"),
    ("+ Modeled growth", rupees(period["growth"]), "in"),
    ("= Closing", rupees(period["closing"]), "close"),
]

K = 2  # draw at twice the size, then reduce, for smooth edges
W, H = 1200 * K, 675 * K


def font(names, size):
    for name in names:
        for folder in ("C:/Windows/Fonts/", "/usr/share/fonts/truetype/dejavu/", "/Library/Fonts/", ""):
            try:
                return ImageFont.truetype(folder + name, size * K)
            except OSError:
                continue
    raise SystemExit("no usable font found (looked for Arial and DejaVu Sans)")


REGULAR = ["arial.ttf", "Arial.ttf", "DejaVuSans.ttf"]
BOLD = ["arialbd.ttf", "Arial Bold.ttf", "DejaVuSans-Bold.ttf"]

img = Image.new("RGB", (W, H), "#f6faf9")
d = ImageDraw.Draw(img)
d.rounded_rectangle([40 * K, 40 * K, 1160 * K, 635 * K], radius=28 * K, fill="#ffffff", outline="#e4e7ec", width=2 * K)

x0, x1 = 90 * K, 1110 * K
row_h, gap, y = 76 * K, 14 * K, 112 * K
label_font, closing_label_font, value_font = font(REGULAR, 56), font(BOLD, 56), font(BOLD, 62)
bounds = []
for label, value, kind in ROWS:
    fill, outline, width = {"plain": ("#ffffff", "#98a2b3", 2), "out": ("#fef3c7", "#d97706", 3),
                            "in": ("#ecfdf3", "#087f47", 3), "close": ("#ffffff", "#087f47", 5)}[kind]
    d.rounded_rectangle([x0, y, x1, y + row_h], radius=16 * K, fill=fill, outline=outline, width=width * K)
    mid = y + row_h / 2
    d.text((x0 + 34 * K, mid), label, font=closing_label_font if kind == "close" else label_font, fill="#101828", anchor="lm")
    d.text((x1 - 34 * K, mid), value, font=value_font, fill="#101828", anchor="rm")
    bounds.append((y, y + row_h))
    y += row_h + gap

# a small arrow between rows: the order of the cycle
cx = (x0 + x1) // 2
for (_, a1), (b0, _) in zip(bounds, bounds[1:]):
    d.polygon([(cx - 9 * K, a1 + 2 * K), (cx + 9 * K, a1 + 2 * K), (cx, b0 - 1 * K)], fill="#475467")

img = img.resize((1200, 675), Image.LANCZOS)
img.convert("RGB").quantize(colors=96, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(OUT + ".png", optimize=True)
img.save(OUT + ".webp", "WEBP", quality=80, method=6)
print("wrote", OUT + ".png /.webp")
print("rows:", [(label, value) for label, value, _ in ROWS])
