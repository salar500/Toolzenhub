# 18 Consolidated owner approval

**STATUS: SCOPE BASELINE APPROVED WITH CONDITIONS (owner, 2026-10-28). NOT APPROVED: implementation, push, deployment. Implementation waits for Master Prompt 2.**

Practice Labs & Smart Flashcards ecosystem, Prompt 1 of 3 (research and requirements). Written 2026-10-28. Nothing here is a rule, a build queue or an approval; the rulebook is `docs/product-decision-rules.md`.

Evidence labels used throughout: **OBSERVED** (seen on a public page or in the repository this session), **CLAIMED** (stated by the source about itself, not verified), **INFERRED** (reasoned from observations), **UNKNOWN** (not established). **VERIFIED/HYPOTHESIS** follow rulebook 12.

Nothing in this package is approved. One decision is requested, in ten parts. Each part gives a recommendation, the alternatives, and what stays uncertain. A single answer such as "approve all as recommended" is enough; any part may be changed.

| Part | Decision | Recommendation | Alternatives | Main uncertainty |
|---|---|---|---|---|
| A | Scope | **Option B**: Smart Flashcards (3 decks) plus 4 labs (JSON Error-Fixing, JSONPath, Cron, Test Design), about 174 authored items | A: flashcards (1 deck) plus JSON lab, about 52 items; C: about 9 experiences including SQL, about 362 items | Demand is unmeasured (RISK 14) |
| B | Taxonomy | Place all five in **Developer Tools**, one shared engine with subject packs; no new section, no navigation change | A separate Learning section (needs rule 4.7 case) | Developer Tools becomes mixed; revisit if non-developer subjects are added |
| C | P0 labs | JSON Error-Fixing, JSONPath Challenge, Cron Challenge, Test Design | Fewer (Option A) | Test Design wording must match the public syllabus (RISK 04) |
| D | P0 flashcards | One page, 3 decks: JSON and data formats, HTTP and APIs, Software testing; about 36 cards each; recall and single-answer choice cards | Single deck; per-deck pages now (thin-page risk) | Second-reviewer capacity for 108 cards |
| E | Shared engine | Pure learning modules, extracted when the second consumer exists (rule 9.4); Leitner 5-box scheduler (1, 3, 7, 14, 30 days); engines for JSON, JSONPath, cron imported unchanged | Build the shell first; FSRS | Simple scheduler has no measured effect; FSRS deferred |
| F | Progress storage and rule exception | Opt-in, default off, one key `tz-learn-v1` (at most 100 KB), reset, export and import; **requires a scoped exception to rule 7.7** (spaced repetition needs memory across days). Labs save nothing | Export and import only: no exception needed, less convenient | Users may not understand opt-in wording |
| G | Security-sensitive execution | **None approved**: no visitor JavaScript, HTML or CSS execution or rendering; SQL deferred behind a separate spike | Approve a SQL feasibility spike | Production headers and CSP were not inspected |
| H | New dependencies | **None.** sql.js only if SQL is later pursued, with its own approval | Approve a SQL spike now | sql.js size is unknown |
| I | Development sequence | LP-1 flashcards core and JSON deck, LP-2 two decks, LP-3 lab shell and JSON lab, LP-4 JSONPath and Cron labs, LP-5 Test Design Lab, LP-6 integration and consolidated checkpoint; one local commit per pack; sequential focused testing | A different order; Option A only | Content review time |
| J | Material unresolved risks | Accept proceeding with RISK 14 (demand), RISK 11 (only Chrome available), RISK 13 (no screen-reader test yet) open, to be reported honestly at the checkpoint | Pause until demand is measured | These cannot be closed from here |

## The single question

Do you approve, as one decision, parts A to J as recommended (or with the changes you name), so that Master Prompt 2 may begin development with: Option B scope, placement in Developer Tools, the five P0 experiences, the shared engine and Leitner scheduler, opt-in progress saving with a scoped rule 7.7 exception, no code-execution features, no new dependency, and the LP-1 to LP-6 sequence?

## What approval would and would not do

It would authorise Prompt 2 to write code, record the 7.7 exception in the rulebook and privacy page, and make one local commit per pack as that prompt specifies. It would not authorise a push, a deployment, Hostinger changes or any deferred item.

Per-candidate and per-risk detail: docs 06, 07, 16.


## Owner decision record (2026-10-28)

The owner approved Option B and parts A to J as recommended, with these conditions, recorded as given:

1. Five user-facing experiences are approved: Smart Flashcards, JSON Error-Fixing Lab, JSONPath Challenge Lab, Cron Challenge Lab, Test Design Lab.
2. They stay within the existing Developer Tools section.
3. The shared learning-engine architecture is approved, reusing existing verified engines wherever suitable.
4. The deterministic Leitner-style scheduler is approved. Its intervals (1, 3, 7, 14, 30 days) are a design choice, not a scientifically guaranteed optimal schedule, and page wording must say so (FR-FC-026).
5. A narrowly scoped exception to rule 7.7 is approved for optional, browser-local learning progress. Saving must be off by default, explicitly enabled by the visitor, limited to the documented data and size, resettable, exportable, free from external synchronisation, and protected against malformed imported data (FR-FC-015 to 023, AC-SEC-05, AC-SEC-06).
6. The LP-1 to LP-6 sequence is approved (doc 17).
7. The roughly 174 educational items (doc 08) are a **planning target, not a mandatory quantity**. Priority is original questions, accurate answers, clear explanations, meaningful difficulty and independent content validation. No filler to reach a number; a launch with fewer items is acceptable. Wherever docs 08, 10, 11, 17 and 18 give an item count as a minimum, read it as this target. Requirement minimums for exercise counts (for example FR-JEF-001 "at least 16") are likewise targets until Master Prompt 2 confirms the final counts against this condition.
8. No unsafe visitor-code execution, external APIs, paid services or unnecessary dependencies.
9. Deferred: SQL execution, arbitrary JavaScript execution, advanced gamification, FSRS.
10. Existing architecture, accessibility, performance, privacy and risk-based testing policies apply.
11. The authoritative rulebook is to be updated only for the approved scoped storage exception, avoiding conflicting rules. **That edit has not been made in this phase**; it is scheduled for Master Prompt 2 together with the privacy-page wording, since this phase only records the approval in the research documentation.
12. Local development and coherent local commits are approved for the selected scope.
13. No push, deployment, PR, publishing or Hostinger changes are authorised.
14. Ordinary engineering decisions are handled autonomously within this scope.
15. Stop and ask only for genuine security, permission, destructive-action or material scope decisions.

This approval is the baseline for Master Prompt 2 (architecture, design and full development). Implementation has not begun.
