# 14 Accessibility and performance

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

**Owner decision recorded 2026-10-28:** the Option B scope baseline in doc 18 was approved with conditions. Only what doc 18 records as approved is approved; everything else in this document remains a proposal for Master Prompt 2 to develop. No implementation has started.

Practice Labs & Smart Flashcards ecosystem, Prompt 1 of 3 (research and requirements). Written 2026-10-28. Nothing here is a rule, a build queue or an approval; the rulebook is `docs/product-decision-rules.md`.

Evidence labels used throughout: **OBSERVED** (seen on a public page or in the repository this session), **CLAIMED** (stated by the source about itself, not verified), **INFERRED** (reasoned from observations), **UNKNOWN** (not established). **VERIFIED/HYPOTHESIS** follow rulebook 12.

## Accessibility requirements

These restate the rulebook's rule 7.3 for this ecosystem; each is a requirement with a test.

| Need | Requirement | Test |
|---|---|---|
| 320 px screens | no page-level horizontal scroll at 320, 360, 390 px; long code scrolls in its own region | FR-LRN-008, AC-LRN-008 |
| Touch | controls at least 44 px; **no swipe gesture exists**, so no alternative is needed; no drag | FR-LRN-008, AC-A11Y-05 |
| Keyboard | every function by Tab, Enter and Space; arrows only inside the card region; no single-key shortcuts (avoids a single-character-shortcut conflict) | FR-FC-014, AC-A11Y-01 |
| Screen readers | labelled controls, one polite status region for explicit actions, results stated in words | FR-LRN-007, AC-A11Y-02, AC-A11Y-07 |
| Focus | visible always; moves only after an explicit action to a defined target; never on a timer | FR-LRN-006 |
| Reduced motion | no required animation; **flashcards have no flip**, so the answer is a normal reveal that works without any animation | FR-FC-003, FR-LRN-009 |
| Contrast | 4.5:1 text and controls, 3:1 outlines and focus | AC-A11Y-04 |
| Large text | usable at 200 percent text size | AC-A11Y-06 |
| Colour independence | correct, not yet, due, completed, solution viewed are all words | FR-LRN-010 |
| Long questions and explanations | wrap; code blocks scroll in place | FR-FC-002 |
| Errors | specific, near the field, linked to it | FR-LAB-006, AC-A11Y-02 |

**Not claimed:** no screen-reader verification, no real-device verification and no automated accessibility scan has been done (nothing is built). AC-A11Y-07 passes only if a real screen reader is used.

## Performance requirements

- Framework-free plain modules; a page loads only its own tool; decks and exercise sets load on demand (rulebook 7.4, FR-LRN-005).
- **Measured baselines in the repository (raw and gzip):** JSONPath Tester page module 28,135 and 7,046 bytes, its engine 39,161 and 9,262; JSON Formatter engine 25,996 and 7,451 and page module 30,696 and 7,203; shared JSON tree 9,549 and 3,083.
- **Proposed budgets (HYPOTHESIS until measured, FR-LRN-005):** page engine and interface at most 30 KB gzip, each deck at most 25 KB gzip, each exercise set at most 20 KB gzip. A deck of about 36 cards with explanations is estimated at tens of kilobytes raw; this is an estimate, not a measurement.
- Bounded DOM: one card or exercise at a time; no per-card listeners kept after leaving; no timers or frame loops while idle (rule 7.4).
- Memory on the 4 GB laptop: pure modules and one card in the DOM; the testing approach is sequential and focused (doc 17).
- Storage use: at most 100 KB in one key; nothing is written unless the learner opts in.

## Performance cases (proposed tests)

Large decks (AC-PERF-02), repeated submissions (AC-PERF-06), long sessions and listener growth (AC-PERF-03), progress calculation (AC-PERF-05), exercise transitions (AC-PERF-07), initial load and dependency list (AC-PERF-01, AC-PERF-04).

## Offline

The pages work without a network after they have loaded (the new code makes no network calls: AC-SEC-08). A real offline capability needs a service worker, which the site does not have; that is candidate 54 and is DEFER.
