# Tool Pack 15: JSON Formatter & Validator (the first Developer Tools tool)

Status: built and verified      Base commit: 916f3a9
Id and slug: `json-formatter` (route `/tools/json-formatter/`)
Section: **Developer Tools** (`developer-tools`, landing `/developer-tools.html`), new in this pack.
Spec follows `docs/tool-packs/_spec-template.md`; lifecycle and gate in `docs/tool-pack-factory.md`; the previous pack is `14-stopwatch.md`.

## Does it earn its place? (checked before building)

- **Recurring pain.** Reading an API response or webhook that arrives on one line, checking a config before deploying, finding the one stray comma in a document. Daily work for anyone who touches an API.
- **Why not just ask an AI.** A validator gives an *exact, deterministic* yes or no and the exact line and column, instantly, with no prompt and no chance of a plausible-sounding wrong answer. The text is also private: API payloads often hold keys and customer data, and here they stay in the browser. And the input is increasingly *produced by* an AI or an API (a trailing comma, a comment or single quotes in generated JSON are common), which makes a deterministic checker more useful, not less.
- **Not "paste, click Format".** What makes it a debugging tool: an own strict scanner that reports the same error and position in every browser; the surrounding lines with a marker; Go to error; notes for valid-but-risky JSON (duplicate keys, integers JavaScript would round); format and minify that never change the data.
- **Repeat use.** A bookmark-and-return tool. Retention comes from speed, trust and privacy. No account, history, streaks or points.
- **Browser-native, no dependency.** Plain JavaScript, no library, no API. Maintenance is low: the format is a fixed standard.
- **Discovery.** "json formatter", "json validator", "format json", "minify json" are everyday queries.
- **Verdict: passes.** It would not have passed as "a textarea and JSON.stringify"; it passes because of the exact errors and the data-preserving layout.

## Does the section earn its place?

Developer Tools is a distinct user job (working with data and code) that is not a calculator and not a time utility. It becomes a real top-level section the way Time Tools did: its tools sit **directly under the section, with no subcategory**. One tool does not need a grouping layer. Header navigation is unchanged (All Tools stays the global path). No fake cards for future tools.

## Hierarchy and routes

Home → All Tools → **Developer Tools** → JSON Formatter & Validator.
- Section landing: `/developer-tools.html` (breadcrumb Home › All Tools › Developer Tools).
- Tool: `/tools/json-formatter/` (the generalized non-calculator route: the section's `pathPrefix` is `tools`, like Time Tools); breadcrumb Home › Developer Tools › JSON Formatter & Validator, from the central breadcrumb component.
- Never under `/calculators/`.

## Strict JSON scope (decided before coding)

RFC 8259 JSON only. Rejected, each with its own message and position: trailing commas, single quotes, unquoted keys, comments, `undefined`, `NaN`, `Infinity`, leading zeros, `+1`, `.5`, `1.`, hex, malformed escapes, raw line breaks or tabs inside strings, a missing or misplaced comma, colon, bracket or brace, an unclosed string or container, a second root value, a byte order mark, non-breaking spaces and curly quotes (named as such, since they come from pasting). Any value may be the root (object, array, string, number, boolean, null). No repair, no guessing, no JSON5, no schema validation.

## Validation semantics

The engine (`assets/js/tools/json-formatter/json-engine.js`) is its own iterative scanner, not `JSON.parse`, because native error text and positions differ by browser (and some have none). It reports the same message, offset, line and column everywhere. Its valid/invalid answer is cross-checked against `JSON.parse` in the tests, on a hand corpus and on 20,000 seeded mutations. No recursion; nesting is capped at 500 levels (stated on the page).

## Formatting and minify semantics

Format and minify are **not** `JSON.stringify(JSON.parse(x))`, which would silently change data: `1.0` becomes `1`, long integers round, `1e999` becomes `null`, `"é"` is rewritten, duplicate keys vanish, and keys like `"10"` jump ahead of `"b"`. The layout is rebuilt from the scanned tokens, so numbers and strings are copied exactly as written and key order and duplicates are kept; only the whitespace between tokens changes. Format: two-space indentation, `"key": value`, empty `{}` and `[]` kept compact, `\n` line breaks. Minify: no insignificant whitespace. No indentation setting in v1. The input is never rewritten by Format or Minify; they write to the Output box.

## Number precision and duplicate keys

Because numbers are never converted, nothing is rounded by this tool. An integer beyond 15 digits that JavaScript could not hold exactly, and a number outside JavaScript's range, produce a **note** ("kept as written, but JavaScript would round it"). A duplicate key in one object is also a **note**: it is valid JSON, and most parsers keep only the last value. Notes list the first three with their line and column, then "and N more". Neither is an error and neither claims semantic validation.

## Error-location strategy

Offset (UTF-16 position), 1-based line (a line break is `\n`; `\r\n` counts once) and a column that counts characters, not code units (so astral characters like emoji count once). The panel shows the message, "Line L, column C (character N)", and the lines around it with a gutter and a `^` marker under the exact spot (a long line is clipped around the error). For an unclosed container the error names where it was opened. Go to error focuses the input, selects the character and scrolls it into view. Limitation: the marker assumes a monospace font and one-column characters (wide CJK characters or combining marks can look a column off); the line, column and character number are exact.

## UI states

`empty` (hint, example offered), `valid` (status: "Valid JSON · Object with N keys, D levels deep · N characters", plus notes), `invalid` (error panel, `aria-invalid`, output cleared, Copy disabled), `unchecked` (large input: press a button), `too-large` (over the limit). The panel can be `stale` (dashed border, "checked before your last edit") while the user edits.

## Workspace

Input box (left), Output box (right, read-only) from 1000 px; stacked below that: input, buttons, status, output. Buttons: Format (primary), Minify, Validate, Copy output (disabled until there is output), Clear. Monospace textareas with `wrap="off"`, so a long line scrolls inside its own box and never widens the page; 16 px text on phones to avoid the browser's focus zoom.

## Live validation decision

Both. Explicit actions (the three buttons, Ctrl or ⌘ + Enter) show the full error and announce. While typing, after a 600 ms pause, **only the one-line status** refreshes, never the error panel and never an announcement, and only up to 200,000 characters (above that: "press Validate, Format or Minify"). A typed edit marks an existing error panel as out of date at once; when the pause finds the text valid, the panel clears.

## Large payloads

Soft limit **2,000,000 characters** (refused with a message above it); live checking to 200,000; nesting to 500. Measured: a 1.2 MB document checks, formats and minifies in a fraction of a second in Node; in the browser a 250 KB payload formats in well under the 4 s test bound. No claim of unlimited size; the page says very large documents suit a command-line tool.

## Copy

User-triggered. Uses the Clipboard API where it exists and falls back to selecting the output and `execCommand("copy")`. The result message ("Copied to the clipboard." or "Could not copy automatically. Select the output and copy it yourself.") reports what actually happened and is announced politely. Tested both ways.

## Clear

Clears input, output, error, notes and status, returns focus to the input. No confirmation dialog (the data is the user's paste, and the control is a secondary button away from Format); reassess only if testing shows accidental clears.

## Example

"Load an example" appears only while the input is empty (it would overwrite text), loads a realistic compact order object with no personal data, and moves focus to Format. Clear brings the offer back.

## Keyboard

Ctrl or ⌘ + Enter in the input formats. Nothing else is intercepted; plain Enter types a line break.

## Security and privacy

User text is only ever set as a textarea `value` or via `textContent`; no `innerHTML` receives it. Tested with `<script>`, `<img onerror>`, quotes, backslashes and Unicode: they stay inert text in the output, the error message and its context, and notes. No network request is made by the tool (asserted in the tests) and nothing is stored (`localStorage` and `sessionStorage` stay empty). Microcopy: "Your JSON is processed in your browser." No overclaim beyond that.

## Accessibility

Visible labels for both boxes; native buttons with visible focus; a polite status region announces only meaningful results (valid, error with line and column, formatted, minified, copied or failed, cleared, example loaded) and is never driven by typing; the visible status line is not a live region; the input is `aria-invalid` and described by the error message when invalid; valid and invalid are words ("Valid JSON", "Not valid JSON"), never colour alone; the error context is a focusable, named `<pre>`; buttons are at least 44 px tall.

## Search aliases

json formatter, json validator, format json, pretty json, pretty print json, beautify json, minify json, validate json, json viewer. `json` and each of these lead with this tool; the other tools keep their queries; it is absent from every calculator-scoped search.

## Related tools and articles

None. No live tool genuinely relates yet (do not relate it to Time Tools or calculators); the page opts out of both related sections. Reassess when Unix Timestamp, Base64 or URL tools exist. No article: nothing would be added beyond the page's own explanation.

## Platform changes (small)

`data/categories.js` (the section), `routes.js` (`developerTools`), `data/tools.js` (the entry), `src/_data/toolStyles.json`, the tool's module, engine and CSS; `data/relationships.js`: tools in different sections are never grouped just because neither has a category (without this, the new tool would have been "related" to the date tools); the inventory generator knows the new landing page. **Featured Tools, the Home hero and the header are unchanged.** Home's Explore Tools, All Tools and the sitemap pick the section up from the catalog.

## Exclusions

Tree view, syntax highlighting, line numbers, search inside JSON, JSON repair, JSON5, schema validation, file upload or download, indentation settings, diff, history, accounts, any API or backend, an editor library. Deferred, not rejected: a tree view (needs strong keyboard and mobile design), line numbers (fragile beside a textarea), a one-click "sort keys" or "tab indent" if asked for.

## Verification

- **Unit** (`tests/unit/json-formatter.test.mjs`): hand-written golden input/output; every root type; 40 invalid cases with exact offset, line, column and message; format/minify goldens, idempotence and data preservation; notes; limits and a timing bound on a 1 MB document; the agreement with `JSON.parse` described above. Plus the shared catalog, section, taxonomy, search, relationship and capability tests, updated for the third section.
- **Browser** (`tests/browser/json-formatter.spec.js`, desktop and mobile projects): the full workflow, the failing-copy path, the invalid-then-fix path, strict cases, preservation and notes, XSS, live validation, keyboard, example, empty input, large and oversized input, no network or storage, accessibility semantics, 320/360/390 px, the section page, All Tools, Time Tools isolation, the Home-to-tool click path, JSON and unchanged-tool search rankings, calculator-search isolation.
- Static links, assets, SEO and inventory; root and preview builds; DOM, links and SEO baselines; visual baselines for the tool, the section page and All Tools. No calculator formula or full regression was run.

## Acceptance criteria

Every item above holds; `json`, `json formatter`, `json validator` and `format json` return the tool first; the tool is in Developer Tools and All Tools only; Calculators, Time Tools and Loans searches never show it; no input is ever sent anywhere; Hostinger is untouched.

## Known limitations

Needs the page open (nothing is saved). The caret marker is exact for monospace single-column characters. 2,000,000 characters and 500 levels. No schema validation, repair or tree view. A browser may still be slow to scroll a very large output box.
