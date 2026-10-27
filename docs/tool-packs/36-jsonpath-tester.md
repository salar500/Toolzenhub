# Tool Pack 36: JSONPath Tester

STATUS: IMPLEMENTED locally (not pushed, not deployed)
TIER: MEDIUM (fast tool pack, factory section 2a). A pure evaluator over the shared JSON tree; no regular expressions are run.
REQUIREMENTS: `docs/ecosystem-review/developer-tools/05` section B (FR-JP-001..022, validation matrix B.3, examples B.4), `06` (SEC-001..008), `07` (AC-JP-001..030). Those are the specification; this file records what was built and where it deviates.

## Decision

A Developer Tools page that runs an RFC 9535 JSONPath query on a JSON document. Route `/tools/jsonpath-tester/`, id `jsonpath-tester`, section `developer-tools`. Conformance statement: RFC 9535 **except `match()` and `search()`** (DEC-JP-1); the page never claims full conformance.

## Files

- `assets/js/tools/jsonpath-tester/jsonpath-engine.js`: hand-written parser following the RFC 9535 ABNF, and the evaluator. Reuses `json-tree.js` (Tool Pack 35) for the document and `sideNotes` from the JSON Compare engine for the duplicate-key, precision and lone-surrogate notes (that function is now exported; no behaviour change).
- `assets/js/tools/jsonpath-tester/index.js`: page. `assets/css/tools/jsonpath-tester.css`, entries in `src/_data/toolStyles.json`, the catalog and the Growth ledger.
- `tests/unit/jsonpath-tester.test.mjs` (43 tests), `tests/browser/jsonpath-tester.spec.js` (22 tests including three phone widths).

## Rules as built

- Grammar: root `$`; child `[...]`, `.name`, `.*`, descendant `..`; name, wildcard, index (negative), slice (negative step; step 0 selects nothing), filter selectors; `== != < <= > >=`, `&& || !`, parentheses, existence tests; literals; `length()`, `count()`, `value()`. Whitespace is allowed between segments and inside brackets; leading or trailing whitespace on the whole query is refused with a hint (DEC-JP-3, confirmed against the ABNF: `segments = *(S segment)`).
- Typing: ill-typed function use, a non-singular query where one value is needed, a value-returning function used as a test, `!` on a comparison, and literals used as tests are all refused, naming the function or operator. Integers must be within ±(2^53 − 1); no leading zeros, no `-0` index.
- Strings: RFC escapes, surrogate-pair `\uXXXX`, lone surrogates and control characters refused; ordering compares by code point. Numbers compare by exact decimal value through the shared canonical key (never floats), so a 20-digit integer or `1e400` compares exactly.
- Comparison semantics from RFC 9535 2.3.5.2: Nothing equals Nothing; different types never equal or order; objects and arrays compare structurally.
- Descendant order: a node before its descendants, array elements in order, object members in document order. Results carry Normalized Paths (RFC 9535 2.7).
- `match()` and `search()`: refused with "match() and search() are not supported in this version."; other unknown functions are refused by name. Script expressions and a bare `..` are refused as "not part of RFC 9535".
- Limits: query 1,000 characters; document 1,000,000 characters and depth 500; 100,000 nodes at any one segment ("The query selected more than 100,000 nodes at segment N; narrow it."). Added safety bound (not in the planning documents): 4,000,000 node visits in total, so nested filters over a large document cannot hang the tab; it stops with a similar message. 1,000 rows rendered, copy includes all.
- Per-segment trace (collapsed unless the result is empty, never announced) marks the segment where the result became empty.
- Auto-evaluates (300 ms) for documents of 200,000 characters or fewer; otherwise Evaluate or Enter. No network, storage, URL or title change, or logging; text is written with `textContent` only.

## Deviations (recorded, not silent)

1. **Compliance suite (AC-JP-029 / OPEN-03), updated 2026-10-27.** The community JSONPath Compliance Test Suite (BSD-2, commit `20ebdcce5008c8a777ee9c80ad853ecf606950b5`, 715 tests) is kept as data in `tests/fixtures/jsonpath-cts/` and run by `tests/unit/jsonpath-cts.test.mjs`. Result: **659 pass, 0 fail, 56 skipped**. The 56 skipped tests are exactly those whose selector uses `match()` or `search()`, which this tool refuses on purpose (the page says so). Each test checks the matched values, the normalized paths (including the alternative orderings the suite allows) and that invalid selectors are refused. This is evidence of conformance for everything except those two functions; it is NOT a claim of full RFC 9535 compliance. Not covered by the suite: the tool's own limits (100,000 nodes, the work bound) and numbers beyond what `JSON.stringify` writes back.
2. **Total work bound** (4,000,000 visits) is an addition to FR-JP-016 for safety.
3. **A hostile exponent cannot be reached through a query** (the 1,000-character limit comes first); it is refused where it can occur, in the document (tested).
4. **Related-tools block off.** The pilot is not approved (DEC-OWN-3). Catalog `relatedTools` is metadata only; the page text links the JSON Formatter and JSON Compare.
5. **No shared clipboard module** (ledger L1).

## Verification (this machine, Chrome only)

Unit: 43 new tests pass; the affected catalog, relationships, search, sections, capabilities and build-output suites pass. Browser: `jsonpath-tester.spec.js` 22 of 22 on subpath-desktop and subpath-mobile; `root-desktop` NOT RUN. Static: inventory, links, assets, SEO pass. DOM, links and SEO baselines and the Developer Tools mobile visual baseline were updated after inspecting the diffs (one added card or row). Not verified: Safari, Firefox, a real Android device, a screen reader.

## Rollback

Revert the pack's commit; catalog, ledger, style entries, inventory, edited counts and baselines return together. The `sideNotes` export in the JSON Compare engine is harmless if left.
