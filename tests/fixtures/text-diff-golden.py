"""
Independent reference for the Text Diff engine (Tool Pack 18).

Written from the spec in docs/tool-packs/18-text-diff.md, NOT from the
JavaScript. It does the one thing that must be exactly right and that has
exactly one correct answer: the NUMBER of lines the two texts share, found by
the textbook dynamic-programming longest common subsequence (O(n*m), exact,
nothing clever). Many different diffs can be equally good, so the grouping of
changes is not compared; the engine's invariants cover it (tests/unit).

For every case it records the line counts after the spec's normalisation and
the exact LCS length, with and without "ignore whitespace-only changes".

Run:  python tests/fixtures/text-diff-golden.py > tests/fixtures/text-diff-golden.json
Deterministic (seeded). Python 3.8+.
"""
import json
import sys
import random
import re


def normalize(text):
    # CRLF and a lone CR are line breaks; nothing else changes
    return text.replace("\r\n", "\n").replace("\r", "\n")


def split_lines(text):
    t = normalize(text)
    if t == "":
        return []
    lines = t.split("\n")
    if lines[-1] == "":
        lines.pop()  # one final newline ends the last line; it does not start another
    return lines


def ws_key(line):
    # trim both ends, every run of whitespace becomes one space (never removed)
    return re.sub(r"\s+", " ", line, flags=re.UNICODE).strip()


def lcs_length(a, b):
    n, m = len(a), len(b)
    prev = [0] * (m + 1)
    for i in range(1, n + 1):
        cur = [0] * (m + 1)
        ai = a[i - 1]
        for j in range(1, m + 1):
            if ai == b[j - 1]:
                cur[j] = prev[j - 1] + 1
            else:
                cur[j] = cur[j - 1] if cur[j - 1] >= prev[j] else prev[j]
        prev = cur
    return prev[m]


VOCAB = [
    "alpha", "beta", "gamma", "delta", "epsilon", "x = 1", "y = 2", "return x",
    "}", "{", "", "  indent", "\tindent", "end", "héllo wörld", "日本語のテキスト",
    "emoji 😀 line", "a  b", "a b", "trailing ", "trailing", "The quick brown fox",
    "the quick brown fox", "key: value", "key:  value", "SELECT 1;", "<b>tag</b>",
]


def make_text(rng, n):
    lines = [rng.choice(VOCAB) for _ in range(n)]
    ending = rng.choice(["\n", "\r\n", "\n"])
    text = ending.join(lines)
    r = rng.random()
    if r < 0.5 and lines:
        text += ending  # final newline
    elif r < 0.6 and lines:
        text += ending + ending  # a real blank last line
    if rng.random() < 0.08 and len(lines) > 2:
        text = text.replace(ending, "\r", 1)  # a stray old-Mac break
    return text


def mutate(rng, text):
    lines = split_lines(text)
    out = []
    for line in lines:
        r = rng.random()
        if r < 0.12:
            continue
        if r < 0.25:
            out.append(line + rng.choice(["", " ", "  x"]))
            continue
        if r < 0.32:
            out.append(rng.choice(VOCAB))
        out.append(line)
    if rng.random() < 0.3:
        out.append(rng.choice(VOCAB))
    ending = rng.choice(["\n", "\r\n"])
    s = ending.join(out)
    if rng.random() < 0.5 and out:
        s += ending
    return s


def case(original, changed, ignore):
    ka = [ws_key(x) if ignore else x for x in split_lines(original)]
    kb = [ws_key(x) if ignore else x for x in split_lines(changed)]
    return {
        "original": original,
        "changed": changed,
        "ignoreWhitespace": ignore,
        "originalLines": len(ka),
        "changedLines": len(kb),
        "shared": lcs_length(ka, kb),
    }


def main():
    rng = random.Random(20261007)
    cases = []

    # hand-picked canonical cases
    fixed = [
        ("", ""),
        ("", "a\nb\n"),
        ("a\nb\n", ""),
        ("a\nb", "a\nb\n"),
        ("a\nb\n", "a\r\nb\r\n"),
        ("a\nb\n\n", "a\nb\n"),
        ("\n", ""),
        ("hello world", "helloworld"),
        ("a  b", " a b"),
        ("a\tb", "a b"),
        ("same\nsame\nsame", "same\nsame"),
        ("x\ny\nz", "z\ny\nx"),
        ("<script>alert(1)</script>", "<img src=x onerror=alert(1)>"),
        ("héllo 😀\n日本語", "héllo 😀\n日本語\n"),
    ]
    for a, b in fixed:
        for ignore in (False, True):
            cases.append(case(a, b, ignore))

    # seeded random cases, near-duplicates and unrelated
    for _ in range(150):
        a = make_text(rng, rng.randint(0, 40))
        b = mutate(rng, a) if rng.random() < 0.8 else make_text(rng, rng.randint(0, 40))
        cases.append(case(a, b, rng.random() < 0.5))

    # larger, so the divide-and-conquer path is exercised
    for _ in range(12):
        a = make_text(rng, rng.randint(200, 400))
        b = mutate(rng, a)
        cases.append(case(a, b, rng.random() < 0.5))

    out = json.dumps({"generator": "tests/fixtures/text-diff-golden.py", "cases": cases}, ensure_ascii=False, indent=0)
    sys.stdout.buffer.write((out + "\n").encode("utf-8"))


if __name__ == "__main__":
    main()
