"""
Independent reference for the JSON <-> CSV engine (Tool Pack 40).

Uses Python's standard csv module (an RFC 4180 implementation that shares no code with the
JavaScript) to produce, for seeded random tables:
  - "write":  rows of string cells and the exact CSV text csv.writer makes (LF line ends,
              minimal quoting) for each delimiter; the engine's JSON -> CSV output must equal it
              (formula guard off, so the cells are byte-exact);
  - "read":   the CSV text and the records csv.reader reads back; the engine's parser must equal it.
Cells hold delimiters, quotes, line breaks (LF, CRLF), leading/trailing spaces and non-ASCII text.

Run:  python tests/fixtures/json-csv-golden.py > tests/fixtures/json-csv-golden.json
Deterministic (seeded 40). Python 3.8+.
"""
import csv
import io
import json
import random

random.seed(40)
POOL = ["", "a", "b c", "x,y", "p;q", "t\tu", "pi|pe", '"quoted"', 'say "hi", ok', "line1\nline2",
        "win\r\nline", " lead", "trail ", "é", "日本", "😀", "=1+1", "-5", "@x", "0123", "'single"]
DELIMS = [",", ";", "\t", "|"]
cases = []
for n in range(150):
    d = random.choice(DELIMS)
    cols = random.randint(2, 5)
    rows = random.randint(1, 6)
    header = [f"h{i}" for i in range(cols)]
    body = [[random.choice(POOL) for _ in range(cols)] for _ in range(rows)]
    out = io.StringIO()
    w = csv.writer(out, delimiter=d, lineterminator="\n")
    w.writerow(header)
    w.writerows(body)
    text = out.getvalue()
    back = list(csv.reader(io.StringIO(text, newline=""), delimiter=d))
    assert back == [header] + body
    cases.append({"delimiter": d, "header": header, "rows": body, "csv": text.rstrip("\n")})
import sys
sys.stdout.buffer.write(json.dumps(cases, ensure_ascii=False).encode("utf-8"))
