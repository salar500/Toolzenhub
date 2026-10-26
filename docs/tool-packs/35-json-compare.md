# Tool Pack 35: JSON Compare

STATUS: IMPLEMENTED locally (not pushed, not deployed)
TIER: MEDIUM (fast tool pack, factory section 2a). Pure data comparison; validation reuses the JSON Formatter's scanner without changing it.
REQUIREMENTS: `docs/ecosystem-review/developer-tools/05` section A (FR-JC-001..026), `06` (security and NFR), `07` (AC-JC-001..039). Those are the specification; this file records what was built and where it deviates.

## Decision

A Developer Tools page that compares two JSON documents as data. Route `/tools/json-compare/`, id `json-compare`, section `developer-tools`.

## Files

- `assets/js/tools/json-tree/json-tree.js`: shared lossless tree (exact number text and canonical decimal keys, duplicate keys last-wins, RFC 9535 Normalized Paths, RFC 6901 pointers). Built on `validate` from the formatter engine, which is imported and unchanged. JSONPath Tester (Tool Pack 36) reuses it.
- `assets/js/tools/json-compare/json-compare-engine.js`: pure engine (compare, ignore-order multiset, rows, summary, patch with a self-check).
- `assets/js/tools/json-compare/index.js`: page. `assets/css/tools/json-compare.css`, entries in `src/_data/toolStyles.json`, the catalog and the Growth ledger.
- `tests/unit/json-compare.test.mjs` (34 tests), `tests/browser/json-compare.spec.js` (21 tests including three phone widths).

## Rules as built

- Strict RFC 8259 through the formatter scanner; errors name the side, line and column. 1,000,000 characters per side, depth 500. Nothing is compared while a side is empty, too large, invalid or refused.
- Objects unordered; arrays by position; optional "Ignore array order" compares arrays as multisets (removed and added only; patch withheld with its reason).
- Numbers compare by exact decimal value (digits and a BigInt exponent, never floats); an exponent with more than 1,000 digits is refused rather than expanded. Different JSON types are "type changed". Strings compare by code point, with a note when only Unicode normalization differs.
- Duplicate keys, numbers over 15 significant digits and lone surrogate escapes produce per-side notes, included in the copied text.
- Rows: depth-first in the first document's order, then members only in the second; an added or removed container is one row. 1,000 rows shown, copy includes all; values truncated at 200 characters with a show-full control.
- JSON Patch (add, remove, replace; array removals high to low) is applied back to the first document by the engine and withheld if it does not equal the second.
- Documents of 100,000 combined characters or fewer compare as you type (300 ms pause); larger ones wait for Compare.
- No network, storage, URL or title change, or logging; text is written with `textContent` only.

## Deviations (recorded, not silent)

1. **Related-tools block off.** The pilot is not approved (DEC-OWN-3). Catalog `relatedTools` is metadata only; the page text links the JSON Formatter and Text Diff.
2. **No shared clipboard module** (ledger L1).
3. **Search tests.** The Developer Tools browser spec asserts discovery of JSON Compare's own names only; the older-tool search intents are asserted in `search.test.mjs`, where the ranking is deterministic.

## Verification (this machine, Chrome only)

Unit: 34 new tests pass (hand-derived goldens, an independent RFC 6902 applier over a 400-case seeded corpus, number and escaping tables, hostile exponent, limits, banned-token scan); affected catalog, relationships, search, sections, capabilities and build-output suites pass. Browser: `json-compare.spec.js` 21 of 21 on subpath-desktop and subpath-mobile; `root-desktop` NOT RUN. Static: inventory, links, assets, SEO pass. DOM, links baselines and the Developer Tools mobile visual baseline were updated after inspecting the diffs (one added card/row). Not verified: Safari, Firefox, a real Android device, a screen reader.

## Rollback

Revert the pack's commit; catalog, ledger, style entries, inventory, edited counts and baselines return together.
