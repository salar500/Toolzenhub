# Tool Pack 18: Text Diff / Compare (the third Developer Tools tool)

Status: built and verified      Base commit: 0e80ca5
Id and slug: `text-diff` (route `/tools/text-diff/`)
Section: **Developer Tools** (`developer-tools`), flat, no subcategory.
Previous pack: `17-income-tax-regime-comparison.md`. Lifecycle: `docs/tool-pack-factory.md`.

## Does it earn its place?

- **Recurring pain.** Two versions of something and the question "what exactly changed?": an AI rewrite against the original, prompt v1 against v2, a config before and after a deploy, two drafts of an email or a contract clause, a copied web page against the last copy, generated code against the code it replaced.
- **Why not just ask an AI.** A diff is exact, instant, visual and reproducible. A model asked "what changed?" can miss a one-word edit or report one that never happened, and it needs a prompt each time. Here the text also stays in the browser, which matters for prompts, configs and drafts.
- **Not "two textareas".** What makes it a working tool: a real minimal line diff (Myers) with a safety budget, changed lines paired with word-level highlighting, tidy handling of line endings and the final newline, a narrow "ignore whitespace-only changes" option, swap, a unified-diff copy that other tools can read, collapsed unchanged runs, and a layout that does not break on a phone.
- **Repeat use.** Bookmark-and-return, like the JSON Formatter. No account, history or tracking.
- **No dependency.** Plain JavaScript. See "Dependency decision".
- **Discovery.** "diff checker", "compare text", "text diff", "compare two texts" are everyday queries.
- **AI-era note.** It does not call an AI or any API and is not described as AI-powered.
- **Verdict: passes.**

## Hierarchy, route, name

Home → All Tools → Developer Tools → Text Diff / Compare. Route `/tools/text-diff/` (the section's `tools` path prefix). Public name: **Text Diff / Compare** (H1 and catalog title). SEO title leads with the search words: "Text Diff Checker: Compare Two Texts". Never under `/calculators/`. No subcategory.

## Primary job and workflow

Paste **Original**, paste **Changed**, see the differences. Two labelled boxes (side by side from 900 px, stacked below that), a short options row, the result below. Actions: Swap, Reset, Copy diff, Try an example (shown only while both boxes are empty).

## Comparison trigger

Automatic after a 400 ms pause when the combined size is at most 60,000 characters (a typical prompt, config or page of prose compares instantly); above that the result waits for the **Compare** button (also Ctrl or ⌘ + Enter in either box) and the page says so. The Compare button exists at every size so the keyboard shortcut has a visible control. Before running a comparison the page shows "Comparing…" and yields to the browser once, so a large comparison never freezes controls without explanation.

## Model

Everything is line-level first.

1. **Line endings.** `\r\n` and a lone `\r` become `\n` for comparison only. Nothing else is changed, and the boxes keep what the user typed. LF and CRLF versions of the same text report "No differences found."
2. **Lines.** The text is split on `\n`. **Trailing newline:** one final `\n` ends the last line and does not start another, so `a\nb` and `a\nb\n` are identical. Two final newlines are one real empty last line. The empty text has zero lines. A missing final newline is therefore never reported.
3. **Whitespace (default: preserved).** Tabs, spaces and trailing spaces are meaningful, as in code and config.
4. **Ignore whitespace-only changes (option, off by default).** Two lines are equal when they are equal after trimming both ends and turning every run of whitespace (JavaScript `\s`, so spaces, tabs and non-breaking spaces) into one space. So `a  b` equals ` a b`, but `hello world` does **not** equal `helloworld` (whitespace is not removed). An added or removed blank line is still a line change. Equal lines are shown with the Changed side's text. The copied diff uses the Original's text on context lines, so the patch applies to the Original.
5. **No ignore-case option, no syntax highlighting, no format detection.** Case is meaningful in code and config; JSON users have the JSON Formatter.
6. **Algorithm.** Myers O(ND) in linear space (the divide-at-the-middle-snake form), so no D-by-D table is kept. Lines are mapped to integers first. Lines present on only one side are set aside before the search (they can never match), which makes unrelated texts almost free. Common prefix and suffix are trimmed. A work budget bounds the search: if it runs out, the unfinished region is reported as removed-then-added and `approximate` is set (the page says "Very different texts: shown as a replaced block, not a minimal diff"). Results are deterministic.
7. **Dependency decision.** No library. A mature diff library (for example jsdiff, BSD-3, roughly 20 KB gzipped) would add a dependency to keep updated, and its output still needs the pairing, the whitespace rule, the budget and the unified-diff format written by us. The engine is about 350 lines, is verified against an independent dynamic-programming LCS in Python, and its correctness reduces to checkable invariants.
8. **Rows.** The result is a list of rows: `same`, `add` (Added), `del` (Removed), `mod` (Changed). A `mod` is a removed line and an added line that were paired.
9. **Pairing (Changed).** Inside one contiguous block of removed and added lines only (never across an unchanged line, never document-wide): for each removed line in order, look at the next 8 unused added lines after the previous pairing and take the most similar one if its similarity is at least 0.5. Similarity is 2 × (shared non-space word tokens) / (total non-space word tokens on both sides), taken from a word-level diff. Blocks over 60 lines on a side, lines over 20,000 characters, and a total pairing budget are not paired (they stay Removed and Added). Pairing is deterministic and monotone (pairs never cross).
10. **Word-level refinement.** Only inside a Changed pair. Tokens are runs of letters/digits/marks/underscore, runs of whitespace, and single other characters (so an emoji or a punctuation mark is one token). A Myers diff over the tokens marks the removed words on the old line and the added words on the new line. Not characters: character-level is noisy.
11. **Summary** (exactly what is rendered): `N added`, `N removed`, `N changed` (a changed line is a pair), `N unchanged`. Added counts lines shown as Added, Removed counts lines shown as Removed, Changed counts pairs (each shown as one old line and one new line). "No differences found." when no row is add/del/mod. **No similarity percentage** (it depends on tokenization and would mislead).
12. **Unified diff (Copy diff).** Standard format: `--- Original`, `+++ Changed`, `@@ -a,b +c,d @@` hunks with 3 lines of context, ` `, `-`, `+` prefixes; a Changed pair is a `-` line then a `+` line. Standard hunk-start rules for empty ranges. No "\ No newline" lines, because the final newline is not significant. Copy uses the clipboard API and falls back to selecting a hidden textarea; nothing is downloaded.

## Result view

**One view: unified**, deliberately. Side-by-side doubles the width needed for every line and fails on a phone, and the diff is already readable in one column with word highlights. Each row has a small line-number gutter (Original number, Changed number; secondary, muted) and a marker column: `+` Added, `−` Removed. A Changed pair is one block with a `−` line over a `+` line, with removed words struck through and added words underlined plus tinted. Every row carries a visually hidden label ("Added:", "Removed:", "Changed, old:", "Changed, new:", "Unchanged:") so meaning never depends on colour. Unchanged runs longer than 7 lines collapse to 3 lines of context around each change and a button "Show N unchanged lines" that expands that one gap. **Wrap long lines** (on by default): when off, the result block scrolls horizontally inside itself; the page never does. Long results render in chunks of 500 rows with a "Show more" button, so the DOM stays small. No virtualization.

## Empty and edge states

Both empty: "Paste text into both boxes to compare, or try an example." Only one side filled: a valid comparison (all added, or all removed). Identical: "No differences found." with no rows. Whitespace ignored and the only differences were whitespace: "No differences found" plus the note "Whitespace-only differences are ignored." Over the limit: refused with the limit stated, nothing truncated, nothing compared.

## Limits

Provisional until benchmarked; frozen in the implementation notes below. Per side: **300,000 characters** and **20,000 lines** (the page states them next to the boxes). Input over a limit shows the message and compares nothing.

## State

No URL state, no history entries, no localStorage, sessionStorage, cookies or any network request carrying the text. Reloading clears everything. Native textarea undo only. Swap exchanges the two values; Reset clears both, restores the options (ignore whitespace off, wrap on), clears the result and puts focus in Original.

## Security

Both inputs are untrusted. Everything is placed with `textContent` or as a textarea value, never `innerHTML` with user text. Tested with `<script>`, `<img onerror>` and `<svg onload>` strings.

## Accessibility

Visible labels bound to both boxes; a character and line count per box described by `aria-describedby`; one polite live region announcing the settled summary (never per row); result inside a labelled region; the diff is an ordered list in document order; every change type has words and a symbol, not only colour; visible 3 px focus on every control; controls at least 44 px tall on phones; 16 px inputs on phones so the browser does not zoom; reduced motion respected (nothing animates). Collapsed-gap and show-more controls are real buttons.

## Mobile

Boxes stack; options and actions wrap; the result is one column, wraps by default and, when wrapping is off, scrolls inside its own container; no element widens the page at 320, 360 and 390 px.

## Related tools and relations

Text Diff relates to the JSON Formatter (format two JSON documents, then compare them), shown as one sentence on the page and in the catalog `relatedTools`. The JSON Formatter page is **not changed** in this pack (one-way link), to keep the working tool untouched. Not related to the Unix Timestamp Converter (same section is not a relation).

## Search

Aliases: text diff, diff checker, compare text, text compare, compare two texts, difference between two texts, code diff, prompt comparison, compare versions. Not "compare" alone. Required: "text diff", "compare text", "diff checker" put Text Diff first; "json", "unix timestamp", "countdown timer", "income tax", "stopwatch" keep their first results. Present in global search, All Tools and Developer Tools; absent from Calculator Categories, All Calculators, Loans and Time Tools.

## Not in v1 (decisions)

File upload, download, drag and drop, side-by-side result, character-level diff, ignore case, regex or ignore-lines filters, syntax highlighting, merge, three-way diff, similarity percentage, saved comparisons, share links, Web Worker (decided by the benchmark below), virtual scrolling, articles, imagery. Featured Tools unchanged (curated, not popular; one release is not a reason to churn it). Home unchanged except the metadata-derived section summary. No issue-report block (not a high-stakes tool).

## Verification plan

- Unit (engine only): canonical small cases with exact output; invariants on hundreds of seeded random cases (rows reconstruct Original and Changed exactly, minimality equals an independent Python DP LCS, determinism, no lost characters, swap symmetry); line endings; trailing newline; whitespace option semantics; Unicode; long line; budget fallback; limits; word segments; unified-diff reconstruction by applying the patch.
- Independent reference: `tests/fixtures/text-diff-golden.py` computes line counts and the exact LCS length by dynamic programming for seeded cases; the engine's unchanged-line count must equal it whenever the result is not approximate. Python's `difflib` is not used for expected grouping because several equal-length diffs are valid.
- Browser (focused, `--workers=1`): workflow, empty and identical states, swap, reset, ignore whitespace, wrap toggle, hostile HTML, copy, limit refusal, large input, no network, no storage, accessibility, three widths; Developer Tools, All Tools, search and isolation; JSON Formatter and Unix Timestamp Converter load sanity.
- Visual: the tool at desktop and mobile; Developer Tools and All Tools if they visibly change.
- Static: links, assets, SEO, inventory; root and preview builds. No full regression.

## Acceptance

The manual checks A to I of the brief pass; the benchmark is reported; existing tools are unchanged.

## Implementation notes

Deviations from the plan above, and what was measured.

- **Automatic comparison needs both boxes filled.** With one box empty the page waits and offers Compare (an empty side is still a valid comparison: all added or all removed). This keeps a half-finished paste from flashing "everything added".
- **Limits frozen:** 300,000 characters and 20,000 lines per side; automatic comparison up to 60,000 characters combined.
- **No Web Worker, no virtualization.** Measured on this 2-core laptop (Node, engine only; changed content in every case): 100 lines about 8 ms; 1,000 lines about 12 to 20 ms (50 ms at 50% changed); 5,000 lines about 25 ms at 5% changed and 100 ms at 30%; 3,000 lines of about 100 characters 17 ms (40 ms ignoring whitespace); unrelated 5,000 against 5,000 lines about 20 ms. Worst cases at the limit: 20,000 lines with 60% of them edited about 700 ms; 20,000 lines drawn from 20 distinct lines (nothing to anchor on) about 770 ms and flagged approximate by the 25-million-step budget. In the browser, 5,000 lines from the Compare click to the rendered first chunk took about 0.5 s with the page responsive. That is acceptable behind "Comparing…", so a worker was not added. Rows are built 500 at a time.
- **Memory:** 40 repeated 3,000-line comparisons kept the DOM at a constant 4,372 elements and the JS heap at 3.0 MB (2.9 MB before), after garbage collection.
- **Related tools:** the catalog entry sets `autoRelated: false`, so the section does not fill it with the Unix converter; its only relation is the curated, one-way JSON Formatter link (the JSON Formatter page is unchanged).
- **Copy diff:** the plain-http test origin has no `navigator.clipboard`, so the hidden-textarea fallback path is exercised there; the API path is tested with a stub.
- **Result status line:** with a result, the chips carry the summary and the status line is visually hidden but still read by a screen reader.
- **Independent reference:** `tests/fixtures/text-diff-golden.py` (exact dynamic-programming LCS, 176 seeded cases with and without ignoring whitespace) pins the number of shared lines; the engine matches on every case, and also rebuilds both texts from its rows and applies its own unified diff.
- **Test-environment note:** Playwright's `fill()` of several thousand lines takes many seconds on this machine (the JSON Formatter page behaves the same), so the large-input tests set the value directly and dispatch one input event, as a paste would.
