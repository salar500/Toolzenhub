# 12. Development progress ledger

PROJECT: ToolZenHub
ECOSYSTEM: Developer Tools
PURPOSE: Durable continuation record for Ecosystem 2.0 development (survives restarts and context resets)
STATES: NOT_STARTED, IN_PROGRESS, BLOCKED, IMPLEMENTED, VERIFIED, COMPLETED
LIFECYCLE OF THE PLANS: PROPOSED, APPROVED, IMPLEMENTED, VERIFIED, PREVIEW_RELEASED, PRODUCTION_RELEASED. Nothing here is above VERIFIED-locally.

## 1. Authorization as interpreted on 2026-10-26 (HEAD 0dc368b = origin/main)

The owner answered the single approval question in 11 with the Developer Tools Ecosystem 2.0 development master prompt. That is read as approval of **DEC-OWN-1** (Option B baseline) and of the Release 1 tools that the prompt names as independent work. It is **not** read as any of the following, each of which stays blocked until the owner says so in words:

| Item | State | Reason |
| --- | --- | --- |
| P0 new tools: JSON Compare, URL Parser & Encoder, JSONPath Tester | AUTHORIZED | not conditional in 04 |
| Base64URL mode (DP-4) | BLOCKED | DEC-OWN-5 / OPEN-10: reversing the spec-27 exclusion was never explicitly approved; the prompt requires explicit approval |
| Developer Tools related-tools pilot | BLOCKED | DEC-OWN-3 not approved (rule 4.8); only invisible catalog metadata is done |
| Release 2 (List Comparer, UUID, JSON/CSV, JSON Schema, Text Diff options, JSON Formatter indent) | NOT_STARTED | each needs its own go decision after Release 1 is verified, and Schema needs its library audit |
| Regex Tester | EXCLUDED | binding |
| Push, preview deploy, Hostinger | NOT AUTHORIZED | |

Commits: one local commit per bounded Tool Pack (factory section 2a). The planning package in this folder is committed together with the first pack so it is not left untracked; no push.

## 2. Tool Pack states

| Pack | Tool | State | Commit | Notes |
| --- | --- | --- | --- | --- |
| DP-0 | Preparation | COMPLETED (reduced) | | no shared clipboard module (L1); open items for DP-1 and DP-2 (OPEN-03/04/05) are closed inside those packs |
| DP-3 | URL Parser & Encoder (Tool Pack 37) | VERIFIED (local, AMBER) | see git log | spec `docs/tool-packs/37-url-parser-encoder.md`. FR-UP-001..026 implemented; AC-UP-001..035 covered by 31 unit + 18 browser tests (desktop and mobile projects pass). Older specs: 278 pass, 5 fail, all 5 the known stale tests (Image Tools page, Image Tools All Tools, All Tools in json-formatter, text-diff, unix-timestamp). Unit suite 3118 pass, 1 fail (known gratuity colour token). Static: inventory, links, assets, SEO pass. AMBER because Safari, Firefox, Android, screen reader, root-desktop project and the `tools` visual baseline (pre-existing mismatch, left untouched) were not verified |
| DP-1 | JSON Compare (Tool Pack 35) | VERIFIED (local, AMBER) | see git log | spec `docs/tool-packs/35-json-compare.md`. FR-JC-001..026 implemented; 34 unit + 21 browser tests (desktop and mobile projects pass). Shared tree module `json-tree` reuses the formatter scanner unchanged (L3). Not verified: Safari, Firefox, real Android, screen reader |
| DP-2 | JSONPath Tester (Tool Pack 36) | VERIFIED (local, AMBER) | see git log | spec `docs/tool-packs/36-jsonpath-tester.md`. FR-JP-001..022 implemented; 43 unit + 22 browser tests (desktop and mobile projects pass). Compliance suite NOT run (AC-JP-029, L4); RFC-derived vectors used. Not verified: Safari, Firefox, real Android, screen reader |
| DP-4 | Base64URL | VERIFIED (local) | aac1108 | owner-approved 2026-10-27; addendum §15 in pack 27; 7 unit + 5 browser tests |
| X3 | JSON Formatter indentation | VERIFIED (local) | 773995d | owner-approved; addendum in pack 15; 6 unit + 4 browser tests; default output byte-identical |
| X2 | Text Diff: ignore case, unchanged-lines setting | VERIFIED (local) | see git log | addendum in pack 18; 11 unit + 6 browser tests; keyboard-order assertion in text-diff.spec.js updated for the two new controls |
| DP-6 | List Comparer (Tool Pack 38) | VERIFIED (local) | see git log | spec `docs/tool-packs/38-list-comparer.md`; 14 unit + 15 browser tests (desktop and mobile pass); screenshots inspected at 1180 and 375 px; counts pinned: tools 57, Developer Tools 10, directory groups 33 |
| DP-7 | UUID Generator (Tool Pack 39) | VERIFIED (local) | see git log | spec `docs/tool-packs/39-uuid-generator.md`; RFC 9562 layouts checked against the RFC text; 13 unit + 14 browser tests (desktop and mobile pass); screenshot inspected at 375 px; counts pinned: tools 58, Developer Tools 11, directory groups 34. The "no uuid on the Developer Tools page" assertions in three older browser specs were stale once this tool is live and were narrowed to "coming soon / regex" |
| DP-8 | JSON and CSV Converter (Tool Pack 40) | VERIFIED (local) | see git log | spec `docs/tool-packs/40-json-csv-converter.md`; 21 unit tests (Python csv oracle, 150 seeded tables) + 14 browser tests (desktop and mobile pass); screenshot inspected at 375 px; counts pinned: tools 59, Developer Tools 12, directory groups 35 |
| DP-9 | JSON Schema Validator (Tool Pack 41) | BLOCKED (library gate) | none | spec and audit in `docs/tool-packs/41-json-schema-validator.md`. Licence, provenance, size, static security and reference-loading checks pass; spec coverage (no draft 6, no `$dynamicRef`) and maintenance are AMBER; the hostile-pattern risk needs a Worker with a time limit. Conformance, timeout and browser gates need the vendored library to be run, which the permission classifier refused; owner decision needed. No page, catalog entry or substitute was built |
| DP-10 | Developer Tools related-tools pilot | VERIFIED (local) | see git log | owner-approved 2026-10-27. `showRelatedCalculators = true` on the twelve Developer Tool modules (one-line change in each older module); curated same-section `relatedTools` lists in the catalog; Time Tools pilot unchanged |
| DP-5 | Integration / checkpoint | NOT_STARTED | | metadata only |

## 3. Decisions made during development

| ID | Decision | Why |
| --- | --- | --- |
| L1 | No new shared clipboard module; new tools reuse the established per-page copy pattern | The 04/08 proposal (SH-004) was optional "when reuse justifies it" (Block 1 section 10); a new shared file with no consumer in existing tools adds an untested abstraction. SH-004 is therefore not implemented; recorded here instead of silently dropped |
| L2 | A mode switch keeps focus on the radio instead of moving to the first field (deviates from FR-UP-023 wording) | Found by the keyboard test: moving focus on `change` stops the arrow keys cycling the three modes, which FR-UP-024 requires. Tab reaches the first field; FR-UP-023 is corrected in doc 05 |
| L3 | JSON Compare imports `validate` from the JSON Formatter engine and adds a separate `json-tree` module instead of editing the formatter | Rule 9.3 (no changes to existing tools without approval); the tree is also what JSONPath Tester needs |
| L4 | The JSONPath compliance suite was not vendored; independent RFC 9535 vectors are used and conformance beyond them is not claimed (AC-JP-029, OPEN-03) | Licence and offline availability were not verified in this phase; adding unverified third-party test data would be worse than a stated gap |
| L5 | JSONPath adds a 4,000,000-visit work bound beside the 100,000-node working-set cap | Nested filters over a large document can be quadratic without touching the working-set cap |
| L6 | The JSON Schema Validator is not shipped while its library gates are open; no hand-written partial validator is offered | A tool that claims JSON Schema validation but implements part of it would mislead (owner instruction: no misleading substitute) |
| L7 | The Developer Tools related lists are curated per tool and one-way (a tool lists what it names, same section only) | Keeps each page's links relevant and testable; asserted in `relationships.test.mjs` and `developer-tools-related.spec.js` |
