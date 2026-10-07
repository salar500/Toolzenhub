/**
 * Text Diff engine (Tool Pack 18). Pure engine only: no DOM, no other tool.
 *
 * Many different diffs can be equally good, so exact output is pinned only for canonical
 * small cases. Everything else is an invariant: the rows rebuild both texts exactly, the
 * number of unchanged lines equals an independent exact LCS (tests/fixtures/text-diff-golden.py),
 * the output is deterministic, and the copied unified diff applies cleanly.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  LIMITS, EXAMPLE, CONTEXT_LINES, normalizeNewlines, splitLines, whitespaceKey, checkLimits,
  matchSequences, tokenize, wordDiff, compare, reconstruct, describeSummary, collapseRows, toUnifiedDiff,
} from "../../assets/js/tools/text-diff/text-diff-engine.js";

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const golden = JSON.parse(fs.readFileSync(path.join(PROJECT, "tests", "fixtures", "text-diff-golden.json"), "utf8"));

const kinds = (r) => r.rows.map((row) => row.kind);
const sum = (r) => `${r.summary.added}/${r.summary.removed}/${r.summary.changed}/${r.summary.unchanged}`;

/* a tiny independent patch applier: applies a unified diff to a list of lines */
function applyPatch(patch, lines) {
  const out = [];
  let at = 0; // next line of `lines` to copy
  const text = patch.split("\n");
  let i = 0;
  assert.match(text[i++], /^--- /);
  assert.match(text[i++], /^\+\+\+ /);
  while (i < text.length && text[i] !== "") {
    const header = /^@@ -(\d+),(\d+) \+(\d+),(\d+) @@$/.exec(text[i++]);
    assert.ok(header, "hunk header");
    const aStart = Number(header[1]);
    const aCount = Number(header[2]);
    const start = aCount === 0 ? aStart : aStart - 1; // 0-based index of the first old line
    assert.ok(start >= at, "hunks are in order");
    while (at < start) out.push(lines[at++]);
    let seenOld = 0;
    while (i < text.length && !text[i].startsWith("@@") && text[i] !== "") {
      const tag = text[i][0];
      const body = text[i].slice(1);
      i++;
      if (tag === " ") { assert.equal(lines[at++], body, "context line matches"); seenOld++; out.push(body); }
      else if (tag === "-") { assert.equal(lines[at++], body, "removed line matches"); seenOld++; }
      else if (tag === "+") out.push(body);
      else assert.fail(`bad patch line ${text[i - 1]}`);
    }
    assert.equal(seenOld, aCount, "old line count in the header");
  }
  while (at < lines.length) out.push(lines[at++]);
  return out;
}

function assertInvariants(a, b, options, label) {
  const r = compare(a, b, options);
  assert.equal(r.ok, true, label);
  const la = splitLines(a);
  const lb = splitLines(b);
  // the rows rebuild both texts exactly (no lost, changed or reordered characters)
  assert.deepEqual(reconstruct(r, "a"), la, `${label}: original`);
  assert.deepEqual(reconstruct(r, "b"), lb, `${label}: changed`);
  // counters match the rows and the line counts
  const s = r.summary;
  assert.equal(s.originalLines, la.length, label);
  assert.equal(s.changedLines, lb.length, label);
  assert.equal(s.unchanged + s.removed + s.changed, la.length, `${label}: original line accounting`);
  assert.equal(s.unchanged + s.added + s.changed, lb.length, `${label}: changed line accounting`);
  assert.equal(s.identical, s.added + s.removed + s.changed === 0, label);
  // numbering: increasing on each side, one row per line
  let lastA = 0;
  let lastB = 0;
  for (const row of r.rows) {
    if (row.a !== null) { assert.equal(row.a, lastA + 1, `${label}: old numbering`); lastA = row.a; }
    if (row.b !== null) { assert.equal(row.b, lastB + 1, `${label}: new numbering`); lastB = row.b; }
  }
  return r;
}

describe("lines and line endings", () => {
  test("CRLF and a lone CR become LF for comparison; nothing else is touched", () => {
    assert.equal(normalizeNewlines("a\r\nb\rc\nd"), "a\nb\nc\nd");
    assert.equal(normalizeNewlines("  a\t \r\n"), "  a\t \n");
  });

  test("one final newline ends the last line; two make a blank last line; the empty text has no lines", () => {
    assert.deepEqual(splitLines(""), []);
    assert.deepEqual(splitLines("a"), ["a"]);
    assert.deepEqual(splitLines("a\n"), ["a"]);
    assert.deepEqual(splitLines("a\nb"), ["a", "b"]);
    assert.deepEqual(splitLines("a\nb\n"), ["a", "b"]);
    assert.deepEqual(splitLines("a\n\n"), ["a", ""]);
    assert.deepEqual(splitLines("\n"), [""]);
    assert.deepEqual(splitLines("a\r\n\r\nb"), ["a", "", "b"]);
  });

  test("LF, CRLF and mixed endings of the same content report no differences", () => {
    for (const other of ["a\r\nb\r\nc\r\n", "a\nb\r\nc\n", "a\rb\rc", "a\nb\nc"]) {
      const r = compare("a\nb\nc\n", other);
      assert.equal(r.summary.identical, true, JSON.stringify(other));
      assert.equal(describeSummary(r.summary), "No differences found.");
    }
  });

  test("a missing final newline is not a difference, but a real blank last line is", () => {
    assert.equal(compare("a\nb", "a\nb\n").summary.identical, true);
    assert.equal(compare("a\nb\n", "a\nb\n\n").summary.identical, false);
    const r = compare("a\nb\n", "a\nb\n\n");
    assert.deepEqual(kinds(r), ["same", "same", "add"]);
    assert.equal(r.rows[2].bText, "");
  });

  test("the rows keep the text as typed: a CRLF input is not rewritten into the rows", () => {
    const r = compare("one\r\ntwo\r\n", "one\r\nTWO\r\n");
    assert.deepEqual(reconstruct(r, "a"), ["one", "two"]);
    assert.deepEqual(reconstruct(r, "b"), ["one", "TWO"]);
    for (const row of r.rows) assert.equal(`${row.aText}${row.bText}`.includes("\r"), false);
  });
});

describe("canonical small cases (exact)", () => {
  test("both empty and identical", () => {
    assert.deepEqual(compare("", "").rows, []);
    assert.equal(compare("", "").summary.identical, true);
    const r = compare("x\ny\n", "x\ny\n");
    assert.deepEqual(kinds(r), ["same", "same"]);
    assert.equal(sum(r), "0/0/0/2");
  });

  test("one-line addition at the end, the start and the middle", () => {
    assert.deepEqual(kinds(compare("a\nb", "a\nb\nc")), ["same", "same", "add"]);
    assert.deepEqual(kinds(compare("b\nc", "a\nb\nc")), ["add", "same", "same"]);
    const mid = compare("a\nc", "a\nb\nc");
    assert.deepEqual(kinds(mid), ["same", "add", "same"]);
    assert.deepEqual([mid.rows[1].a, mid.rows[1].b, mid.rows[1].bText], [null, 2, "b"]);
  });

  test("one-line deletion at the end, the start and the middle", () => {
    assert.deepEqual(kinds(compare("a\nb\nc", "a\nb")), ["same", "same", "del"]);
    assert.deepEqual(kinds(compare("a\nb\nc", "b\nc")), ["del", "same", "same"]);
    const mid = compare("a\nb\nc", "a\nc");
    assert.deepEqual(kinds(mid), ["same", "del", "same"]);
    assert.deepEqual([mid.rows[1].a, mid.rows[1].b, mid.rows[1].aText], [2, null, "b"]);
  });

  test("a similar replaced line is Changed; an unrelated one is Removed and Added", () => {
    const similar = compare("keep\nthe quick brown fox\nkeep", "keep\nthe quick red fox\nkeep");
    assert.deepEqual(kinds(similar), ["same", "mod", "same"]);
    assert.deepEqual(similar.rows[1].aWords, [["the quick ", false], ["brown", true], [" fox", false]]);
    assert.deepEqual(similar.rows[1].bWords, [["the quick ", false], ["red", true], [" fox", false]]);
    const unrelated = compare("keep\nalpha beta gamma\nkeep", "keep\n12345 67890\nkeep");
    assert.deepEqual(kinds(unrelated), ["same", "del", "add", "same"]);
  });

  test("multi-line insertion, multi-line deletion and adjacent edits", () => {
    assert.equal(sum(compare("a\nd", "a\nb\nc\nd")), "2/0/0/2");
    assert.equal(sum(compare("a\nb\nc\nd", "a\nd")), "0/2/0/2");
    const adjacent = compare("a\nb\nc\nd\ne", "a\nB1\nc\nd2\ne");
    assert.deepEqual(kinds(adjacent), ["same", "del", "add", "same", "del", "add", "same"]);
  });

  test("an edit on the first line and on the last line", () => {
    assert.deepEqual(kinds(compare("one two three\nz", "one TWO three\nz")), ["mod", "same"]);
    assert.deepEqual(kinds(compare("z\none two three", "z\none TWO three")), ["same", "mod"]);
  });

  test("blank lines are lines", () => {
    assert.deepEqual(kinds(compare("a\n\nb", "a\nb")), ["same", "del", "same"]);
    assert.deepEqual(kinds(compare("a\nb", "a\n\n\nb")), ["same", "add", "add", "same"]);
  });

  test("one side empty is a valid comparison: all added, or all removed", () => {
    const added = compare("", "x\ny\nz");
    assert.deepEqual(kinds(added), ["add", "add", "add"]);
    assert.equal(describeSummary(added.summary), "3 added, 0 unchanged");
    const removed = compare("x\ny\nz", "");
    assert.deepEqual(kinds(removed), ["del", "del", "del"]);
    assert.equal(describeSummary(removed.summary), "3 removed, 0 unchanged");
  });

  test("the summary says exactly what is rendered", () => {
    const r = compare(EXAMPLE.original, EXAMPLE.changed);
    assert.equal(sum(r), "1/1/2/2");
    assert.equal(describeSummary(r.summary), "1 added, 1 removed, 2 changed, 2 unchanged");
    assert.equal(kinds(r).filter((k) => k === "mod").length, r.summary.changed);
  });

  test("repeated identical lines are matched without losing any", () => {
    const r = compare("x\nx\nx\nx", "x\nx");
    assert.equal(sum(r), "0/2/0/2");
    assertInvariants("x\nx\nx\nx", "x\nx", {}, "repeat");
    assertInvariants("a\nx\nx\nb", "a\nx\nx\nx\nx\nb", {}, "repeat 2");
  });
});

describe("whitespace", () => {
  test("by default tabs, spaces and trailing spaces are differences", () => {
    assert.equal(compare("a b", "a  b").summary.identical, false);
    assert.equal(compare("a\tb", "a b").summary.identical, false);
    assert.equal(compare("a ", "a").summary.identical, false);
    assert.equal(compare("  a", "a").summary.identical, false);
    assert.equal(compare("\ta", "    a").summary.identical, false);
  });

  test("ignore whitespace: only whitespace-only changes are ignored", () => {
    const ignore = { ignoreWhitespace: true };
    assert.equal(whitespaceKey("  a \t b  "), "a b");
    for (const [a, b] of [["a b", "a  b"], ["a\tb", "a b"], ["a ", "a"], ["  a", "a"], ["\ta", "    a"], ["a b", "a b"]]) {
      assert.equal(compare(a, b, ignore).summary.identical, true, JSON.stringify([a, b]));
    }
  });

  test("ignore whitespace never removes whitespace: 'hello world' is not 'helloworld'", () => {
    assert.equal(compare("hello world", "helloworld", { ignoreWhitespace: true }).summary.identical, false);
    assert.equal(compare("a b c", "abc", { ignoreWhitespace: true }).summary.identical, false);
  });

  test("ignore whitespace still sees a blank line added or removed", () => {
    const r = compare("a\nb", "a\n\nb", { ignoreWhitespace: true });
    assert.equal(sum(r), "1/0/0/2");
  });

  test("whitespace-only differences are flagged so the page can say they were ignored", () => {
    assert.equal(compare("a  b", "a b", { ignoreWhitespace: true }).whitespaceOnly, true);
    assert.equal(compare("a b", "a b", { ignoreWhitespace: true }).whitespaceOnly, false);
    assert.equal(compare("a  b", "a b").whitespaceOnly, false);
  });

  test("with the option on, equal lines show the Changed text and the original text is kept on the other side", () => {
    const r = compare("  x = 1", "x = 1", { ignoreWhitespace: true });
    assert.equal(r.rows[0].kind, "same");
    assert.equal(r.rows[0].aText, "  x = 1");
    assert.equal(r.rows[0].bText, "x = 1");
  });

  test("a line that differs by a word AND whitespace is still a real change", () => {
    const r = compare("a  b", "a c", { ignoreWhitespace: true });
    assert.deepEqual(kinds(r), ["mod"]);
  });
});

describe("words", () => {
  test("tokens are words, whitespace runs and single other characters (a code point each)", () => {
    assert.deepEqual(tokenize("foo(a, b)  😀"), ["foo", "(", "a", ",", " ", "b", ")", "  ", "😀"]);
    assert.deepEqual(tokenize("héllo wörld"), ["héllo", " ", "wörld"]);
    assert.deepEqual(tokenize("日本語 text"), ["日本語", " ", "text"]);
    assert.deepEqual(tokenize(""), []);
  });

  test("word segments cover each line exactly and mark only the changed words", () => {
    const w = wordDiff("The quick brown fox", "The slow brown dog");
    assert.equal(w.old.map((s) => s[0]).join(""), "The quick brown fox");
    assert.equal(w.new.map((s) => s[0]).join(""), "The slow brown dog");
    assert.deepEqual(w.old.filter((s) => s[1]).map((s) => s[0]), ["quick", "fox"]);
    assert.deepEqual(w.new.filter((s) => s[1]).map((s) => s[0]), ["slow", "dog"]);
    assert.equal(w.similarity, (2 * 2) / (4 + 4));
  });

  test("identical lines are fully similar; lines with nothing in common are not", () => {
    assert.equal(wordDiff("a b c", "a b c").similarity, 1);
    assert.equal(wordDiff("a b c", "x y z").similarity, 0);
    assert.equal(wordDiff("", "").similarity, 0);
  });

  test("a refined line is deterministic and never invents text", () => {
    const a = "if (user.isAdmin && !user.locked) { grant(user, role); }";
    const b = "if (user.isAdmin && user.verified) { grant(user, role, scope); }";
    const one = wordDiff(a, b);
    assert.deepEqual(one, wordDiff(a, b));
    assert.equal(one.old.map((s) => s[0]).join(""), a);
    assert.equal(one.new.map((s) => s[0]).join(""), b);
  });

  test("pairing stays inside a block: a similar line far away across an unchanged line is not paired", () => {
    const r = compare("the quick brown fox\nkeep\nzzz", "zzz\nkeep\nthe quick red fox");
    assert.equal(r.rows.some((row) => row.kind === "mod"), false);
  });

  test("pairing keeps order and never crosses", () => {
    const r = compare("one two three\nfour five six", "four five SIX\none two THREE");
    const mods = r.rows.filter((row) => row.kind === "mod");
    for (let i = 1; i < mods.length; i++) {
      assert.ok(mods[i].a > mods[i - 1].a && mods[i].b > mods[i - 1].b);
    }
    assertInvariants("one two three\nfour five six", "four five SIX\none two THREE", {}, "cross");
  });

  test("a block over 60 lines is not paired (bounded), and lines over 20,000 characters are not paired", () => {
    const a = Array.from({ length: 61 }, (_, i) => `item number ${i} alpha`).join("\n");
    const b = Array.from({ length: 61 }, (_, i) => `item number ${i} beta`).join("\n");
    assert.equal(compare(a, b).summary.changed, 0);
    assert.equal(compare(a.split("\n").slice(0, 60).join("\n"), b.split("\n").slice(0, 60).join("\n")).summary.changed, 60);
    const long = `${"word ".repeat(5000)}end`;
    assert.equal(compare(long, `${long}!`).summary.changed, 0);
  });
});

describe("invariants against an independent reference", () => {
  test("the independent reference has the expected shape", () => {
    assert.ok(golden.cases.length >= 150);
    assert.ok(golden.cases.some((c) => c.ignoreWhitespace) && golden.cases.some((c) => !c.ignoreWhitespace));
  });

  test("every case: line counts, rebuilt texts and the unchanged-line count equal the exact LCS", () => {
    let checked = 0;
    for (const [index, c] of golden.cases.entries()) {
      const r = assertInvariants(c.original, c.changed, { ignoreWhitespace: c.ignoreWhitespace }, `golden #${index}`);
      assert.equal(r.approximate, false, `golden #${index}: not approximate`);
      assert.equal(r.summary.originalLines, c.originalLines, `golden #${index}: original lines`);
      assert.equal(r.summary.changedLines, c.changedLines, `golden #${index}: changed lines`);
      assert.equal(r.summary.unchanged, c.shared, `golden #${index}: the shared lines are the exact LCS`);
      checked++;
    }
    assert.equal(checked, golden.cases.length);
  });

  test("the same comparison gives the same rows every time", () => {
    for (const c of golden.cases.slice(0, 80)) {
      const options = { ignoreWhitespace: c.ignoreWhitespace };
      assert.deepEqual(compare(c.original, c.changed, options), compare(c.original, c.changed, options));
    }
  });

  test("swapping the sides swaps added and removed, and keeps the shared lines", () => {
    for (const c of golden.cases) {
      const options = { ignoreWhitespace: c.ignoreWhitespace };
      const forward = compare(c.original, c.changed, options);
      const back = compare(c.changed, c.original, options);
      assert.equal(back.summary.unchanged, forward.summary.unchanged);
      assert.equal(back.summary.originalLines, forward.summary.changedLines);
      // lines only in one text are the same set of lines either way round
      assert.equal(back.summary.added + back.summary.changed, forward.summary.removed + forward.summary.changed);
      assert.equal(back.summary.removed + back.summary.changed, forward.summary.added + forward.summary.changed);
    }
  });

  test("swapping turns every addition into a removal in the right place", () => {
    const forward = compare("a\nb\nc", "a\nc\nd");
    const back = compare("a\nc\nd", "a\nb\nc");
    assert.deepEqual(kinds(forward), ["same", "del", "same", "add"]);
    assert.deepEqual(kinds(back), ["same", "add", "same", "del"]);
  });

  test("the copied unified diff applies cleanly to the Original and gives the Changed text", () => {
    for (const [index, c] of golden.cases.entries()) {
      if (c.ignoreWhitespace) continue;
      const r = compare(c.original, c.changed);
      const patch = toUnifiedDiff(r);
      const rebuilt = patch === "" ? splitLines(c.original) : applyPatch(patch, splitLines(c.original));
      assert.deepEqual(rebuilt, splitLines(c.changed), `golden #${index}`);
    }
  });
});

describe("unified diff", () => {
  test("canonical output, with the standard header and hunk header", () => {
    const r = compare("a\nb\nc\nd\ne\nf\ng\nh\ni\nj", "a\nb\nc\nd\nE\nf\ng\nh\ni\nj");
    assert.equal(toUnifiedDiff(r), [
      "--- Original", "+++ Changed", "@@ -2,7 +2,7 @@",
      " b", " c", " d", "-e", "+E", " f", " g", " h", "",
    ].join("\n"));
  });

  test("identical texts give an empty diff", () => {
    assert.equal(toUnifiedDiff(compare("a\nb", "a\nb\n")), "");
  });

  test("an empty side uses the standard 0 start", () => {
    assert.equal(toUnifiedDiff(compare("", "x\ny")), "--- Original\n+++ Changed\n@@ -0,0 +1,2 @@\n+x\n+y\n");
    assert.equal(toUnifiedDiff(compare("x\ny", "")), "--- Original\n+++ Changed\n@@ -1,2 +0,0 @@\n-x\n-y\n");
  });

  test("far-apart changes are separate hunks; close ones are one", () => {
    const base = Array.from({ length: 30 }, (_, i) => `line ${i + 1}`);
    const far = base.slice();
    far[2] = "changed three";
    far[26] = "changed twenty-seven";
    const patch = toUnifiedDiff(compare(base.join("\n"), far.join("\n")));
    assert.equal(patch.split("\n").filter((l) => l.startsWith("@@")).length, 2);
    const near = base.slice();
    near[2] = "changed three";
    near[6] = "changed seven";
    assert.equal(toUnifiedDiff(compare(base.join("\n"), near.join("\n"))).split("\n").filter((l) => l.startsWith("@@")).length, 1);
    assert.deepEqual(applyPatch(patch, base), far);
  });

  test("hostile-looking text is copied as plain text, unchanged", () => {
    const r = compare("<script>alert(1)</script>", "<img src=x onerror=alert(1)>");
    const patch = toUnifiedDiff(r);
    assert.ok(patch.includes("-<script>alert(1)</script>") && patch.includes("+<img src=x onerror=alert(1)>"));
  });
});

describe("collapsing unchanged runs", () => {
  const lines = (n, prefix = "u") => Array.from({ length: n }, (_, i) => `${prefix}${i}`);

  test("no differences: nothing to show", () => {
    assert.deepEqual(collapseRows(compare("a\nb", "a\nb").rows), []);
  });

  test("a long unchanged run keeps three lines of context beside a change and hides the rest", () => {
    const body = lines(20);
    const changed = body.slice();
    changed[10] = "CHANGED";
    const r = compare(body.join("\n"), changed.join("\n"));
    const items = collapseRows(r.rows);
    const gaps = items.filter((i) => i.type === "gap");
    assert.equal(gaps.length, 2);
    assert.equal(gaps[0].rows.length, 7); // 10 before the change, 3 kept
    assert.equal(gaps[1].rows.length, 6); // 9 after the change, 3 kept
    assert.equal(items.filter((i) => i.type === "row").length, 3 + 1 + 1 + 3);
  });

  test("a short run (up to 7 between changes) is never hidden", () => {
    const a = ["x1", ...lines(7), "x2"].join("\n");
    const b = ["y1", ...lines(7), "y2"].join("\n");
    assert.equal(collapseRows(compare(a, b).rows).some((i) => i.type === "gap"), false);
    const a8 = ["x1", ...lines(8), "x2"].join("\n");
    const b8 = ["y1", ...lines(8), "y2"].join("\n");
    assert.equal(collapseRows(compare(a8, b8).rows).filter((i) => i.type === "gap").length, 1);
  });

  test("hidden lines are never fewer than two, and every row is accounted for", () => {
    const a = lines(40);
    const b = a.slice();
    b[0] = "first";
    b[39] = "last";
    const r = compare(a.join("\n"), b.join("\n"));
    const items = collapseRows(r.rows);
    let total = 0;
    for (const item of items) {
      if (item.type === "gap") { assert.ok(item.rows.length >= 2); total += item.rows.length; }
      else total += 1;
    }
    assert.equal(total, r.rows.length);
    assert.equal(CONTEXT_LINES, 3);
  });
});

describe("Unicode", () => {
  test("accents, non-Latin scripts and emoji survive and compare exactly", () => {
    const a = "héllo wörld\n日本語のテキスト\nemoji 😀 line\né composed\n";
    const b = "héllo wörld\n日本語のテキスト!\nemoji 😀 line\né composed\n";
    const r = assertInvariants(a, b, {}, "unicode");
    assert.equal(r.summary.unchanged, 2);
    assert.equal(r.summary.changed, 2);
  });

  test("a different emoji or a combining mark is a visible change, not corruption", () => {
    const r = compare("ok 😀 done", "ok 😃 done");
    assert.deepEqual(kinds(r), ["mod"]);
    assert.deepEqual(r.rows[0].aWords.filter((s) => s[1]).map((s) => s[0]), ["😀"]);
    assert.deepEqual(r.rows[0].bWords.filter((s) => s[1]).map((s) => s[0]), ["😃"]);
  });

  test("text that looks like HTML is just text to the engine", () => {
    const r = compare("<script>alert(1)</script>\n<b>x</b>", "<img src=x onerror=alert(1)>\n<b>x</b>");
    assert.equal(r.rows[0].aText, "<script>alert(1)</script>");
    assert.equal(r.rows[r.rows.length - 1].aText, "<b>x</b>");
  });
});

describe("size, long lines and the safety budget", () => {
  test("limits are stated and enforced without truncating", () => {
    assert.equal(LIMITS.maxChars, 300000);
    assert.equal(LIMITS.maxLines, 20000);
    assert.equal(checkLimits("a".repeat(300000), "x"), null);
    const tooMany = checkLimits("a".repeat(300001), "x");
    assert.equal(tooMany.side, "Original");
    assert.match(tooMany.message, /over the limit of 300,000 characters per side/);
    const lines = checkLimits("x", "\n".repeat(20001));
    assert.equal(lines.side, "Changed");
    assert.match(lines.message, /over the limit of 20,000 lines per side/);
    const refused = compare("a".repeat(300001), "b");
    assert.equal(refused.ok, false);
    assert.equal(refused.rows, undefined);
  });

  test("one very long line compares quickly and stays one row", () => {
    const long = "word ".repeat(40000);
    const started = performance.now();
    const same = compare(long, long);
    const different = compare(long, `${long}extra`);
    assert.ok(performance.now() - started < 1500);
    assert.equal(same.summary.identical, true);
    assert.equal(different.rows.length, 2);
    assert.deepEqual(reconstruct(different, "b"), [`${long}extra`]);
  });

  test("a moderately long line is refined word by word", () => {
    const base = Array.from({ length: 800 }, (_, i) => `w${i}`);
    const edited = base.slice();
    edited[400] = "CHANGED";
    const r = compare(base.join(" "), edited.join(" "));
    assert.deepEqual(kinds(r), ["mod"]);
    assert.deepEqual(r.rows[0].bWords.filter((s) => s[1]).map((s) => s[0]), ["CHANGED"]);
  });

  test("unrelated large texts are almost free and exact", () => {
    const a = Array.from({ length: 5000 }, (_, i) => `a-${i}`).join("\n");
    const b = Array.from({ length: 5000 }, (_, i) => `b-${i}`).join("\n");
    const started = performance.now();
    const r = compare(a, b);
    assert.ok(performance.now() - started < 500);
    assert.equal(sum(r), "5000/5000/0/0");
    assert.equal(r.approximate, false);
  });

  test("a large realistic edit set is minimal and rebuilds both texts", () => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
    const base = Array.from({ length: 4000 }, (_, i) => `row ${i} ${(rnd() * 1e6) | 0}`);
    const edited = [];
    for (const line of base) {
      const r = rnd();
      if (r < 0.03) continue;
      edited.push(r < 0.06 ? `${line} edited` : line);
      if (r > 0.97) edited.push(`inserted ${(rnd() * 1e6) | 0}`);
    }
    const r = assertInvariants(base.join("\n"), edited.join("\n"), {}, "large");
    assert.equal(r.approximate, false);
  });

  test("when the work budget runs out the result is still a valid diff, flagged not minimal", () => {
    const a = Array.from({ length: 3000 }, (_, i) => i % 7);
    const b = Array.from({ length: 3000 }, (_, i) => (i * 5 + 3) % 7);
    const tight = matchSequences(a, b, { left: 2000 });
    assert.equal(tight.complete, false);
    // still a valid common subsequence: both position lists strictly increase and the items agree
    for (let t = 0; t < tight.a.length; t++) {
      assert.equal(a[tight.a[t]], b[tight.b[t]]);
      if (t) assert.ok(tight.a[t] > tight.a[t - 1] && tight.b[t] > tight.b[t - 1]);
    }
    const full = matchSequences(a, b, { left: 1e9 });
    assert.equal(full.complete, true);
    assert.ok(full.a.length >= tight.a.length);
  });

  test("matchSequences finds a longest common subsequence (checked against a table on small random inputs)", () => {
    let seed = 99;
    const rnd = (n) => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % n; };
    for (let trial = 0; trial < 300; trial++) {
      const a = Array.from({ length: rnd(14) }, () => rnd(4));
      const b = Array.from({ length: rnd(14) }, () => rnd(4));
      const table = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
      for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
        table[i][j] = a[i - 1] === b[j - 1] ? table[i - 1][j - 1] + 1 : Math.max(table[i - 1][j], table[i][j - 1]);
      }
      const found = matchSequences(a, b);
      assert.equal(found.a.length, table[a.length][b.length], JSON.stringify([a, b]));
      for (let t = 0; t < found.a.length; t++) assert.equal(a[found.a[t]], b[found.b[t]]);
    }
  });

  test("the built-in example is small and shows added, removed and changed lines", () => {
    assert.ok(EXAMPLE.original.length < 400 && EXAMPLE.changed.length < 400);
    const r = compare(EXAMPLE.original, EXAMPLE.changed);
    assert.ok(r.summary.added > 0 && r.summary.removed > 0 && r.summary.changed > 0);
  });
});
