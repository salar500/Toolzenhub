# 12 Shared learning-engine requirements

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

**Owner decision recorded 2026-10-28:** the Option B scope baseline in doc 18 was approved with conditions. Only what doc 18 records as approved is approved; everything else in this document remains a proposal for Master Prompt 2 to develop. No implementation has started.

Practice Labs & Smart Flashcards ecosystem, Prompt 1 of 3 (research and requirements). Written 2026-10-28. Nothing here is a rule, a build queue or an approval; the rulebook is `docs/product-decision-rules.md`.

Evidence labels used throughout: **OBSERVED** (seen on a public page or in the repository this session), **CLAIMED** (stated by the source about itself, not verified), **INFERRED** (reasoned from observations), **UNKNOWN** (not established). **VERIFIED/HYPOTHESIS** follow rulebook 12.

## Principle: share only real duplication (rulebook 9.4)

Nothing is extracted before a second consumer exists. The flashcard code lives with the first tool until the labs (four consumers) need the same content schema and validators; the lab shell is extracted when the second lab is built. The shared layer wires presentation and validation; each tool owns its domain logic (evaluators, wording).

## Modules (proposed paths and responsibilities)

| Module (proposed path) | Responsibility | Pure? | Consumers |
|---|---|---|---|
| `assets/js/learning/content-schema.js` | Content module shape and validators (FR-LRN-001 to 003) | pure | flashcards, four labs, build tests |
| `assets/js/learning/scheduler.js` | Leitner-style box scheduler (FR-FC-016 to 018), integer day numbers, no clock access | pure | flashcards |
| `assets/js/learning/progress-store.js` | Opt-in storage adapter, schema validation, size cap, reset, export, import (FR-FC-015 to 024) | adapter around pure validators | flashcards |
| `assets/js/learning/session.js` | Deck session: order, shuffle with injected seed, grades, summary (FR-FC-006 to 013) | pure | flashcards |
| `assets/js/learning/lab-shell.js` | Exercise list, field, Check, hints, solution, retry, completion counts (FR-LAB-001 to 014) | DOM wrapper over pure verdict logic | four labs |
| `assets/js/tools/<tool>/` | Tool page, its content data and its own evaluator | evaluator pure | one tool each |

The engines of JSON, JSONPath and cron are imported unchanged (FR-INT-003).

## Content structure (proposal)

```json
{
  "id": "http-apis",
  "version": "1.0.0",
  "title": "HTTP and APIs",
  "reviewed": {"date": "YYYY-MM-DD", "method": "second reviewer; sources checked"},
  "topics": [{"id": "status-classes", "title": "Status code classes"}],
  "cards": [
    {"id": "http-001", "topic": "status-classes", "kind": "choice",
      "prompt": "...", "options": ["...", "..."], "answer": 1,
      "explanation": "...", "source": "RFC 9110 section 15", "tool": "json-formatter"}
  ]
}
```

Lab exercises use the same envelope with `kind`, a `starter` text, an `evaluator` key naming the tool's own function, `expected` data, `hints` (at most three), `explanation`, `source` and `difficulty`. All text is data, never HTML (FR-LRN-004).

## Saved-state structure (only when the learner opts in; proposal)

```json
{
  "v": 1,
  "decks": {
    "http-apis": {"version": "1.0.0", "cards": {"http-001": {"box": 2, "day": 20357}}}
  }
}
```

One localStorage key `tz-learn-v1`, at most 100 KB. `day` is a whole local calendar-day number; `box` is 1 to 5. No free text is stored. Export is this object plus a format marker; import validates it exactly like a read (FR-FC-019, 023).

## Scheduler specification

| Box after grading | Next review (days after the review day) |
|---|---|
| 1 | 1 |
| 2 | 3 |
| 3 | 7 |
| 4 | 14 |
| 5 | 30 |

Known: box = min(box + 1, 5). Not known: box = 1. A card is **due** when today's day number is at least the last review day plus the interval of its current box. A last review day in the future is treated as due today. Expected table for a card first graded known on day 100: reviews on days 100, 103, 110, 124, 154 give boxes 2, 3, 4, 5, 5 and next-due days 103, 110, 124, 154, 184; a not-known grade on day 184 gives box 1 and next-due day 185 (AC-FC-016, computed independently).

## Shared requirements

### Shared learning experience (content, structure and quality)

- **Intended learner:** All learners; also maintainers of the content.
- **User input:** Content modules (data), the learner's actions.
- **Accessibility (applies to every requirement below):** As stated in FR-LRN-006 to FR-LRN-010.
- **Privacy (applies to every requirement below):** As stated in FR-LRN-014.


| ID | Requirement (interaction, expected behaviour, output, validation, error handling) | Priority | Depends on | Acceptance |
|---|---|---|---|---|
| FR-LRN-001 | Content (decks and exercise sets) is plain data with a schema: ids, version, topics, prompt, answer or evaluator data, explanation, source and review record. A unit test validates every module and fails the build on an error; the page also refuses invalid data at run time with a plain message. | P0 | None | AC-LRN-001 |
| FR-LRN-002 | Ids are stable and unique within a module; a module has a version string; an id is never reused for different content. | P0 | FR-LRN-001 | AC-LRN-002 |
| FR-LRN-003 | Every item records its source (a standard section or official documentation page) and a review record (date and method). Items with no source cannot be published. | P0 | FR-LRN-001 | AC-LRN-003 |
| FR-LRN-004 | Content and visitor text are placed with textContent or as control values, never as HTML. Code is shown in pre and code elements. | P0 | None | AC-LRN-004 |
| FR-LRN-005 | A page loads only its own module. Decks and exercise sets load on demand. Proposed budgets (to be measured): page engine and interface at most 30 KB gzip, each deck at most 25 KB gzip, each exercise set at most 20 KB gzip. | P0 | None | AC-LRN-005 |
| FR-LRN-006 | Tab order follows reading order; focus is always visible; focus moves only after an explicit action, to a defined target, and never on a timer. | P0 | None | AC-LRN-006 |
| FR-LRN-007 | One polite status region announces the outcome of explicit actions (Check, reveal, Next, import, reset). It is never used for typing. | P0 | None | AC-LRN-007 |
| FR-LRN-008 | At 320, 360 and 390 px there is no page-level horizontal scroll; controls are at least 44 px tall; text inputs are at least 16 px; code scrolls in its own region. | P0 | None | AC-LRN-008 |
| FR-LRN-009 | No animation is required to use any page; any transition is removed under prefers-reduced-motion. | P0 | None | AC-LRN-009 |
| FR-LRN-010 | Every state (correct, not yet, cannot check, due, completed, solution viewed) is stated in words as well as any colour or icon. | P0 | None | AC-LRN-010 |
| FR-LRN-011 | A failed content load, a failed validation or an unexpected error shows a plain message and a way to reload; the rest of the page stays usable; no raw error text is shown. | P0 | None | AC-LRN-011 |
| FR-LRN-012 | Every input has a stated maximum; no page says unlimited. | P0 | None | AC-LRN-012 |
| FR-LRN-013 | Page and content wording follows a banned list: mastery, mastered, certified, guaranteed, proven, exam-ready, and any invented statistic. There are no streaks, points, badges, rankings or notifications. | P0 | None | AC-LRN-013 |
| FR-LRN-014 | Apart from the page's own files, no network request is made by the new code; no analytics event is sent; the only storage is the opt-in key of FR-FC-015; each page states exactly what it stores. | P0 | None | AC-LRN-014 |

## Dependencies

None added. Dependencies on existing code: the JSON validator, the JSONPath engine, the cron engine, the escape helper, the dialog helper, the catalog and the related-tools component. A new dependency would need the owner's approval (rulebook 9.1).
