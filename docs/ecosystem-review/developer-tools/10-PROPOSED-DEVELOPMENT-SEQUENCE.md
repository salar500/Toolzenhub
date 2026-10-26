# 10. Proposed development sequence

PROJECT: ToolZenHub
ECOSYSTEM: Developer Tools
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASES: 0, 1 AND 2 (Ecosystem 2.0 revision, 2026-10-26)
PURPOSE: Research and requirements baseline

A dependency-ordered plan. It is a proposal: each pack still needs its own specification before code (rule 9.5) and **no step is authorized by this document**. Pack numbers continue after Tool Pack 34 (Time Tools) and are provisional. The aim is complete, reliable workflows, not the largest number of tools. Every pack runs on the 4 GB laptop with one worker, focused specs and sequential commands; every pack ends with its own commit only if the owner has approved commits for that phase (rule 11), and **no pack pushes or deploys**.

## 1. Order and dependencies

| Release | Pack | Work | Depends on |
| --- | --- | --- | --- |
| 1 | DP-0 Preparation | shared prerequisites and the specs | none |
| 1 | DP-1 JSON Compare (Tool Pack 35) | new tool | DP-0 |
| 1 | DP-2 JSONPath Tester (Tool Pack 36) | new tool | DP-0 (DP-1 if the JSON tree is shared) |
| 1 | DP-3 URL Parser & Encoder (Tool Pack 37) | new tool | DP-0 |
| 1 | DP-4 Base64URL mode (Tool Pack 38) | existing-tool enhancement | owner approval (OPEN-10) |
| 1 | DP-5 Integration and checkpoint (Tool Pack 39) | related metadata, pilot if approved, final checks | DP-1 to DP-4 |
| 2 | DP-6 onward, one pack per P1 item | List Comparer, UUID Generator, JSON ⇄ CSV, JSON Schema Validator (after audit), Text Diff options, JSON Formatter indentation | Release 1 verified, owner go decision per item |

DP-1, DP-2, DP-3 and DP-4 may be done in any order after DP-0; the recommended order is DP-4 (smallest, proves the process), DP-3, DP-1, DP-2 (DP-1 first among the JSON tools because its lossless tree may be reused).

## 2. Per-pack definition

Each row gives purpose, scope, acceptance (the ACs in 07), affected consumers, tests, risk, completion and rollback.

### DP-0 Preparation

| Field | Content |
| --- | --- |
| Purpose | Remove blocking unknowns and add the one shared helper before any tool is built |
| Dependencies | Owner approval of the baseline |
| Scope | Close OPEN-03, 04, 05 (RFC 9535 ABNF, errata, suite licence), OPEN-08, 09 (URL Standard serializer, test-data licence), OPEN-01, 02, 07 (architecture); write Tool Packs 35 to 38 from the template; add `assets/js/ui/clipboard.js` with a unit test; decide the shared JSON tree (S2) |
| Acceptance | AC-SHR-006 (the shared helper); each pack spec traceable to its FR and AC ids |
| Affected consumers | none (new module only; no existing tool imports it) |
| Tests | the clipboard unit test; `npm run build:all` unchanged |
| Risk | RISK-DT-04, 15, 20 |
| Completion | open items closed or explicitly deferred in writing; specs reviewed |
| Rollback | delete the new files; nothing else depends on them |

### DP-1 JSON Compare (Tool Pack 35)

| Field | Content |
| --- | --- |
| Purpose | Structural JSON comparison with JSON Patch output |
| Scope | FR-JC-001 to 026: engine (with the independent patch applier and Python number reference living in tests), page, styles, catalog entry, aliases, ledger entry, consumers, specs |
| Acceptance | AC-JC-001 to 039, AC-SHR-001 to 003 |
| Affected consumers | 01 section 4 list: search and sections unit tests, the "6 tools" browser assertions, navigation counts, DOM/links/SEO/visual baselines for `tools` and `developer-tools`, the inventory, the Growth ledger |
| Tests | engine unit and reference tests; browser, security and mobile specs; focused regressions of the formatter and text-diff specs; baselines only after inspection |
| Risk | RISK-DT-01, 02, 03, 06 to 10, 16 |
| Completion | all AC green; page looked at on desktop and 390 px; counts consistent |
| Rollback | revert the pack's commit; catalog, ledger, inventory and baselines return together |

### DP-2 JSONPath Tester (Tool Pack 36)

| Field | Content |
| --- | --- |
| Purpose | RFC 9535 query evaluation with exact paths |
| Scope | FR-JP-001 to 022: evaluator, page, styles, catalog, aliases, ledger, consumers, specs; the compliance suite as a dev-time reference only if licensed |
| Acceptance | AC-JP-001 to 030, AC-SHR-001 to 003 |
| Affected consumers | as DP-1, recounted after DP-1 if it is already in |
| Tests | RFC table tests, security tests (no `eval`, prototype keys), browser and mobile specs |
| Risk | RISK-DT-03 to 07, 13 to 16 |
| Completion | all AC green; the page states the standard and the single exclusion |
| Rollback | revert the commit |

### DP-3 URL Parser & Encoder (Tool Pack 37)

| Field | Content |
| --- | --- |
| Purpose | Parse and explain URLs; strict encode, decode and query building, locally |
| Scope | FR-UP-001 to 026: engine, page, styles, catalog, aliases, ledger, consumers, specs |
| Acceptance | AC-UP-001 to 035, AC-SHR-001 to 003 |
| Affected consumers | as DP-1 |
| Tests | hand-derived and Python references; a network recorder; a module scan for forbidden navigation tokens; mobile and keyboard specs |
| Risk | RISK-DT-23 to 26, 29 |
| Completion | all AC green; OPEN-08 closed in the pack text |
| Rollback | revert the commit |

### DP-4 Base64URL mode (Tool Pack 38)

| Field | Content |
| --- | --- |
| Purpose | Let the Base64 tool read and write the URL-safe alphabet |
| Scope | FR-B64-001 to 009 in the Base64 module only; one hint wording change; catalog alias `base64url`; an addendum to `docs/tool-packs/27-base64-encoder-decoder.md` replacing the "out of V1" wording (rule 15: replace, not add beside) |
| Acceptance | AC-B64-001 to 010 |
| Affected consumers | the Base64 unit and browser specs (one assertion), search alias tests, DOM/SEO baselines for the Base64 page |
| Tests | RFC 4648 vectors, the Python round-trip corpus, the full existing Base64 suites, JWT specs unchanged |
| Risk | RISK-DT-27 |
| Completion | default behaviour proven unchanged; `git diff` shows nothing in the JWT directory |
| Rollback | revert the commit |

### DP-5 Integration and checkpoint (Tool Pack 39)

| Field | Content |
| --- | --- |
| Purpose | Connect the tools and verify the section as a whole |
| Scope | reciprocal `relatedTools` metadata (FR-REL); only if approved, the related-tools pilot on the nine pages; final alias review; documentation of verified versus unverified |
| Acceptance | AC-REL-001 to 003, AC-SHR-004 to 006, AC-ECO-001 |
| Affected consumers | the nine Developer Tool pages, Time Tools related lists (must not change), listing pages, search, sitemap, Growth export |
| Tests | related-link tests, both-direction search tests, focused regression of the nine specs, navigation, smoke, build, static checks, growth check |
| Risk | RISK-DT-11, 12, 17, 18 |
| Completion | AMBER or better stated honestly; Android acceptance prepared for the owner |
| Rollback | revert the pack; relations return to the previous metadata |

## 3. Visual review checkpoints

After each new tool: the page is looked at on desktop and at 390 px (not only snapshotted); the changed listing pages are compared with their baselines; unrelated baselines stay untouched.

## 4. Documentation dependencies

Each tool's Tool Pack is written before its code; the Growth manifest and ledger move with the pack; the rulebook changes only if the owner approves a durable decision (for example the Developer Tools pilot). Articles are not part of this sequence; opportunities are only recorded.

## 5. Not sequenced

P2 and deferred items are backlog. Nothing here touches Hostinger production or recommends deploying to it; any production decision is a separate owner step after the preview and the owner's device acceptance.
