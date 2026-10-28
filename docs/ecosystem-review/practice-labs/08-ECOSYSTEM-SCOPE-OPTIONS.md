# 08 Ecosystem scope options

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

**Owner decision recorded 2026-10-28:** the Option B scope baseline in doc 18 was approved with conditions. Only what doc 18 records as approved is approved; everything else in this document remains a proposal for Master Prompt 2 to develop. No implementation has started.

Practice Labs & Smart Flashcards ecosystem, Prompt 1 of 3 (research and requirements). Written 2026-10-28. Nothing here is a rule, a build queue or an approval; the rulebook is `docs/product-decision-rules.md`.

Evidence labels used throughout: **OBSERVED** (seen on a public page or in the repository this session), **CLAIMED** (stated by the source about itself, not verified), **INFERRED** (reasoned from observations), **UNKNOWN** (not established). **VERIFIED/HYPOTHESIS** follow rulebook 12.

## Options compared

All item counts are **planning minimums, not measurements**: they are the smallest sets that make each scope coherent (decks of 36 cards, labs of 14 to 20 exercises).

| | Option A: Focused | Option B: Balanced (recommended) | Option C: Expanded |
|---|---|---|---|
| User-facing experiences | 2 (Smart Flashcards with one deck; JSON Error-Fixing Lab) | 5 (Smart Flashcards with 3 decks; JSON Error-Fixing, JSONPath Challenge, Cron Challenge, Test Design labs) | about 9 (B plus SQL, HTTP and Accessibility labs, and a section landing change) |
| Shared engines | content schema and validators; flashcard session, scheduler and progress store; a lab shell | the same three, with the lab shell used by four labs | the same, plus a SQL worker runner |
| Flashcard decks (subject packs) | 1 | 3 (JSON and data formats; HTTP and APIs; Software testing) | 7 (B plus SQL, Git, Accessibility, JavaScript) |
| Labs | 1 | 4 | 7 |
| Authored items (minimum) | 52 (36 cards, 16 exercises) | 174 (108 cards, 66 exercises: JSON 16, JSONPath 16, Cron 14, Test Design 20) | 362 (7 decks of 36, the 4 labs, plus SQL 20, HTTP 12, Accessibility 12) |
| Expected complexity | low | moderate | high |
| Security risks | none beyond input handling | the same (no code execution, no rendering of visitor markup) | adds SQL execution in a worker (RISK 02) |
| Content-review burden | 52 items | 174 items, plus an independent oracle for three evaluators | 362 items, plus SQL datasets and an accessibility reviewer |
| Maintenance cost | low | moderate, mostly content | high; a database engine to keep current |
| Differentiation | one lab and one deck: little | the tool-connected, deterministic labs plus the lab-to-card loop | broader but dilutes the deterministic-checking story |
| Dependencies | none | none new | a WebAssembly SQLite (sql.js) and an owner dependency approval |
| Benefits | quickest to learn from real use | enough breadth to test the whole loop (apply, explain, revise) at low risk | widest topic coverage |
| Tradeoffs | cannot test the lab-to-card loop across subjects; one lab does not justify a shared lab shell (rule 9.4: share only real duplication) | more content to review; five pages must each stay non-thin | large content and security burden before any demand is measured; contradicts "start narrow" (rule 1.8) |

## Recommendation: Option B

Reasons, each tied to a rulebook rule or to observed evidence:

1. **Real shared duplication appears only at four labs.** One lab does not justify a shared shell (rule 9.4); four labs that all need a field, a Check action, deterministic verdicts, hints and an explanation do.
2. **It reuses three verified engines and adds no dependency** (rule 9.1) and no code execution (rulebook 8.7, doc 13).
3. **It tests the differentiator end to end** (apply a skill, get a precise explanation, revise it) without committing to demand that is unmeasured (RISK 14).
4. **It keeps the first release small enough to review.** 174 items is a heavy but bounded review; 362 is not.
5. Option A remains the fallback if the owner prefers the smallest possible first step; the engines are the same, so A can grow into B.

## How this relates to earlier planning

The factory roadmap lists a QA Testing Practice Lab and a SQL Practice Lab as P1 candidates with "no section fits". This research splits the QA lab into a deterministic **Test Design Lab** (boundary values and equivalence classes) and a **Software testing** deck, because open-ended test-case writing and exploratory testing cannot be checked automatically (candidates 22 and 27). SQL stays P1 behind a separate feasibility spike and dependency decision. Interview preparation is a tag on cards, not a deck (candidate 43). No rulebook rule is changed by this recommendation.
