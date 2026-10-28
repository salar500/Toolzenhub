# 17 Proposed development sequence

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

**Owner decision recorded 2026-10-28:** the Option B scope baseline in doc 18 was approved with conditions. Only what doc 18 records as approved is approved; everything else in this document remains a proposal for Master Prompt 2 to develop. No implementation has started.

Practice Labs & Smart Flashcards ecosystem, Prompt 1 of 3 (research and requirements). Written 2026-10-28. Nothing here is a rule, a build queue or an approval; the rulebook is `docs/product-decision-rules.md`.

Evidence labels used throughout: **OBSERVED** (seen on a public page or in the repository this session), **CLAIMED** (stated by the source about itself, not verified), **INFERRED** (reasoned from observations), **UNKNOWN** (not established). **VERIFIED/HYPOTHESIS** follow rulebook 12.

This is a development **proposal** for Prompt 2 only. No application code is written in this phase. Pack ids are provisional (`LP-n`, learning pack) to avoid colliding with the calculators packs 45 to 50.

## Why this order

1. The flashcard engine is built inside its first tool, and shared modules are extracted only when a second consumer needs them (rulebook 9.4).
2. Storage (decision F) is needed only by flashcards, so it is isolated in LP-1.
3. The lab shell is introduced by the lab with the simplest check (JSON), then reused by the engine-reuse labs and the Test Design Lab.
4. Cross-links, curated lists and the consolidated checkpoint come last (LP-6), when all five tools exist.

## Sequence

LP-1 (flashcards core and JSON deck) then LP-2 (two more decks), LP-3 (lab shell and JSON lab), LP-4 (JSONPath and Cron labs), LP-5 (Test Design Lab), LP-6 (integration and checkpoint). LP-2 and LP-3 are independent after LP-1 and could be reordered.

## Testing policy for the development phase (rulebook 10)

- The laptop has about 4 GB RAM: run builds once per pack, run browser tests with `--workers=1`, one project at a time, with focused spec files and `-g` filters; never in parallel; clear stale test processes first; commands over about two minutes go to the background.
- Per pack: unit tests for new pure logic (deep), a focused browser spec for the tool's own journeys, the static checks (inventory, assets, SEO, links) when pages change, and the existing engine suites for any engine a lab reuses. Previously passing evidence for unchanged areas is carried forward and stated.
- **No full regression after each pack.** One consolidated checkpoint in LP-6 selects what it needs: correctness, routing, search, related content, mobile, accessibility, browser compatibility, SEO, visual and performance, and real-device checks by the owner. Firefox, WebKit and a real screen reader are reported NOT VERIFIED unless actually used.
- If local memory is too low, run the focused browser specs on a GitHub-hosted runner as rulebook 10.3 allows (a temporary branch, read-only permissions, no deployment); that is for the owner to authorise.
- Commits: one local commit per pack, authorised in Prompt 2; no push or deployment is implied.

## Packs

### LP-1: Smart Flashcards core and the JSON deck

1. **Pack ID and title:** LP-1: Smart Flashcards core and the JSON deck
2. **Objective:** Build the flashcard engine, scheduler and opt-in progress store with the first deck.
3. **User value:** A learner can revise JSON concepts with explanations, review missed cards, and optionally keep progress.
4. **Functional requirements:** FR-FC-001 to FR-FC-026, FR-LRN-001 to FR-LRN-014 (as they apply), FR-INT-001, FR-INT-002
5. **Technical dependencies:** Owner decision F (storage) before saving is built; content schema before the deck
6. **Expected components:** scheduler, progress store, session logic, flashcard page, JSON deck data, catalog entry
7. **Existing files potentially affected:** assets/js/data/tools.js, src/_data/toolStyles.json, assets/css (new tool css), scripts/growth-manifest/identity-ledger.json, tests/unit and tests/browser (new files), section text in categories.js
8. **Shared modules:** content-schema.js, scheduler.js, progress-store.js, session.js (first consumer; extract only when a lab needs them)
9. **Security considerations:** textContent only; import validation; no eval; size caps; AC-SEC-04 to AC-SEC-06
10. **Accessibility expectations:** AC-A11Y-01 to 06; no flip; no single-key shortcuts
11. **Acceptance criteria:** AC-FC-001 to AC-FC-026, AC-LRN-001 to 014
12. **Focused testing:** unit tests for schema, scheduler (independent table), progress validation; one focused browser spec on subpath-desktop; static checks; no full regression
13. **Performance limits:** FR-LRN-005 budgets reported; AC-PERF-02, 03, 05, 06
14. **Completion conditions:** all acceptance criteria above executed and reported; deck reviewed by a second reviewer; wording scan passes; catalog, inventory, SEO and link checks pass
15. **Rollback approach:** one local commit; revert it; the catalog entry and identity-ledger record are in the same commit, so revert removes all traces

### LP-2: Flashcard decks: HTTP and APIs, Software testing

1. **Pack ID and title:** LP-2: Flashcard decks: HTTP and APIs, Software testing
2. **Objective:** Add two reviewed content packs to the same engine.
3. **User value:** Broader revision value with scenario and code-output cards.
4. **Functional requirements:** FR-FC-001, FR-FC-005, FR-FC-024, FR-LRN-001 to 003
5. **Technical dependencies:** LP-1
6. **Expected components:** two deck data modules, topic ids
7. **Existing files potentially affected:** deck data only; tests/unit content tests
8. **Shared modules:** none new
9. **Security considerations:** content is data; AC-SEC-04
10. **Accessibility expectations:** same as LP-1
11. **Acceptance criteria:** AC-FC-001, AC-FC-005, AC-FC-024, AC-LRN-001 to 003
12. **Focused testing:** content validation test; one focused browser check of deck selection; link check
13. **Performance limits:** each deck within the 25 KB gzip budget or the miss reported
14. **Completion conditions:** second-reviewer sign-off recorded for every card; sources recorded; budgets measured
15. **Rollback approach:** one local commit; revert it

### LP-3: Lab shell and JSON Error-Fixing Lab

1. **Pack ID and title:** LP-3: Lab shell and JSON Error-Fixing Lab
2. **Objective:** Introduce the shared lab shell with the first lab.
3. **User value:** A learner repairs invalid JSON and learns why from the validator's own message.
4. **Functional requirements:** FR-LAB-001 to FR-LAB-014, FR-JEF-001 to FR-JEF-006, FR-LRN (as applicable), FR-INT-001, FR-INT-002
5. **Technical dependencies:** LP-1 (content schema); the JSON validator engine, imported unchanged
6. **Expected components:** lab shell, JSON lab page, 16 exercises, catalog entry
7. **Existing files potentially affected:** tools.js, toolStyles.json, new css, identity ledger, tests (new)
8. **Shared modules:** lab-shell.js extracted when this second consumer needs content-schema.js; content-schema.js shared
9. **Security considerations:** responses are data; 20,000-character cap; AC-SEC-07
10. **Accessibility expectations:** AC-A11Y-01 to 06
11. **Acceptance criteria:** AC-LAB-001 to AC-LAB-014, AC-JEF-001 to AC-JEF-008
12. **Focused testing:** unit tests with an independent Python check of expected values; one focused browser spec; static checks
13. **Performance limits:** AC-PERF-06, AC-PERF-07
14. **Completion conditions:** acceptance criteria executed; exercise review done; existing JSON Formatter tests still pass (AC-INT-003)
15. **Rollback approach:** one local commit; revert it

### LP-4: JSONPath Challenge Lab and Cron Challenge Lab

1. **Pack ID and title:** LP-4: JSONPath Challenge Lab and Cron Challenge Lab
2. **Objective:** Two engine-reuse labs on the same shell.
3. **User value:** A learner practises JSONPath and cron with exact, explained feedback.
4. **Functional requirements:** FR-JPC-001 to FR-JPC-006, FR-CRN-001 to FR-CRN-006, FR-INT-001, FR-INT-002
5. **Technical dependencies:** LP-3 (lab shell); the JSONPath and cron engines, imported unchanged
6. **Expected components:** two lab pages, 16 and 14 exercises, catalog entries
7. **Existing files potentially affected:** tools.js, toolStyles.json, new css, identity ledger, tests (new); a reviewed minimal engine export only if unavoidable
8. **Shared modules:** lab-shell.js, content-schema.js
9. **Security considerations:** engine work bounds retained; AC-SEC-07
10. **Accessibility expectations:** AC-A11Y-01 to 06
11. **Acceptance criteria:** AC-JPC-001 to AC-JPC-007, AC-CRN-001 to AC-CRN-006
12. **Focused testing:** unit tests against independent expected sets (Python for cron); focused browser specs; existing JSONPath and cron suites
13. **Performance limits:** check returns within 2 seconds on the reference laptop
14. **Completion conditions:** acceptance criteria executed; existing engine tests pass unchanged
15. **Rollback approach:** one local commit per lab if practical; revert it

### LP-5: Test Design Lab

1. **Pack ID and title:** LP-5: Test Design Lab
2. **Objective:** A boundary value and equivalence partitioning lab with its own pure evaluators.
3. **User value:** A tester practises test design with deterministic feedback.
4. **Functional requirements:** FR-TDL-001 to FR-TDL-008
5. **Technical dependencies:** LP-3 (lab shell)
6. **Expected components:** lab page, 20 exercises, evaluators, independent Python oracle test
7. **Existing files potentially affected:** tools.js, toolStyles.json, new css, identity ledger, tests (new)
8. **Shared modules:** lab-shell.js, content-schema.js
9. **Security considerations:** integer parsing limits; AC-SEC-07
10. **Accessibility expectations:** AC-A11Y-01 to 06
11. **Acceptance criteria:** AC-TDL-001 to AC-TDL-008
12. **Focused testing:** unit test of 400 generated rules against the oracle; one focused browser spec
13. **Performance limits:** no heavy computation
14. **Completion conditions:** 400 of 400 oracle cases equal; technique definitions checked against the public ISTQB syllabus; reviewer sign-off
15. **Rollback approach:** one local commit; revert it

### LP-6: Integration and consolidated checkpoint

1. **Pack ID and title:** LP-6: Integration and consolidated checkpoint
2. **Objective:** Connect labs and decks, update section text, run the consolidated checks.
3. **User value:** A learner can move from a lab explanation to the matching deck topic and to the tool.
4. **Functional requirements:** FR-INT-001 to FR-INT-009, FR-LRN-013, FR-LRN-014
5. **Technical dependencies:** LP-1 to LP-5
6. **Expected components:** topic links, curated related lists, section text, search tests, sitemap check
7. **Existing files potentially affected:** tools.js (curated lists, optional edit of existing tools' lists), categories.js text, search and relationship tests, tests/inventory
8. **Shared modules:** none
9. **Security considerations:** AC-SEC-03, AC-SEC-08
10. **Accessibility expectations:** AC-A11Y-07 (real screen reader, if available)
11. **Acceptance criteria:** AC-INT-001 to AC-INT-009, cross-cutting AC-SEC, AC-A11Y, AC-PERF as applicable
12. **Focused testing:** unit tests for catalog, relationships, search; inventory, assets, SEO and link checks; one focused browser spec per tool; Firefox and WebKit if available; no unnecessary full regression
13. **Performance limits:** FR-LRN-005 budgets reported
14. **Completion conditions:** every acceptance criterion reported as Pass, Fail, Blocked or Not run, with evidence; owner manual review on real devices (rulebook 10.13)
15. **Rollback approach:** revert the integration commit; the tools remain independently usable


## Not in this sequence

SQL, HTTP lab, Accessibility lab, Git, SQL, JavaScript and Accessibility decks, saved lab progress, an offline layer, per-deck pages and any new section. They are P1, P2, DEFER or REJECT in doc 07 and are not planned here.
