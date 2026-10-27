# Tool Pack 38: List Comparer

STATUS: IMPLEMENTED locally (not pushed, not deployed)
TIER: MEDIUM (fast tool pack, factory section 2a). A pure set comparison of two pasted lists.
REQUIREMENTS: owner authorization of 2026-10-27 (the 13-tool Balanced scope, C19); `docs/ecosystem-review/developer-tools/04` section 6 (sketch). This file is the specification and records what was built.

## Decision

A Developer Tools page for comparing two lists of items, one per line: only in A, only in B, in both, and repeated items. Route `/tools/list-comparer/`, id `list-comparer`, section `developer-tools`. It is not the Text Diff: it compares sets, not the order of lines, and it says so with a link.

## Files

- `assets/js/tools/list-comparer/list-engine.js`: pure engine (no DOM, network, storage, clock or randomness; a unit test scans it for those).
- `assets/js/tools/list-comparer/index.js`: page (`markup`, `render`, `init`; related blocks off, like the other Developer Tools).
- `assets/css/tools/list-comparer.css`, entry in `src/_data/toolStyles.json`, catalog entry in `assets/js/data/tools.js`, Growth ledger entry.
- `tests/unit/list-comparer.test.mjs` (14 tests), `tests/browser/list-comparer.spec.js` (15 tests, desktop and mobile).

## Rules as built (the engine header states them exactly)

- Items are lines (LF, CRLF or CR). One empty last line is the usual final line break and is not an item.
- Comparison key = the line, then, only when the option is on, trimmed (`String.prototype.trim`) and lower-cased (`toLowerCase`, not locale-sensitive, so ß and SS stay different). No sorting, no Unicode normalization, no other change.
- Options are visible, never silent: Ignore case (off), Ignore spaces at the start and end (off), Skip empty lines (on; the count skipped is reported). The result lists what each option did.
- Set semantics: each item appears once per group in the order of its first appearance in its own list. "In both" shows A's first spelling. Repeats are counted and shown separately.
- Limits: 100,000 lines and 1,000,000 characters per list, refused with the size and the limit. Up to 20,000 combined lines compare as you type; larger pairs wait for Compare. Each group shows 1,000 items and a Show more button; Copy always uses every item.
- Output is built with `textContent` only. Nothing is stored or sent, and the page address never changes.

## Known limits

- No normalization: visually identical Unicode that differs in composition is two items (stated on the page).
- Matching is exact line equality; there is no fuzzy or numeric matching.
