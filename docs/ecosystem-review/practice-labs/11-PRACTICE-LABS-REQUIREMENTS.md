# 11 Practice labs requirements

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

**Owner decision recorded 2026-10-28:** the Option B scope baseline in doc 18 was approved with conditions. Only what doc 18 records as approved is approved; everything else in this document remains a proposal for Master Prompt 2 to develop. No implementation has started.

Practice Labs & Smart Flashcards ecosystem, Prompt 1 of 3 (research and requirements). Written 2026-10-28. Nothing here is a rule, a build queue or an approval; the rulebook is `docs/product-decision-rules.md`.

Evidence labels used throughout: **OBSERVED** (seen on a public page or in the repository this session), **CLAIMED** (stated by the source about itself, not verified), **INFERRED** (reasoned from observations), **UNKNOWN** (not established). **VERIFIED/HYPOTHESIS** follow rulebook 12.

## What is recommended

Four labs on one shared lab shell. Each lab has the flow the rulebook describes for practice tools: objective, brief introduction, worked example, task, response, deterministic check, feedback, explanation, retry, optional card link and optional tool link (rulebook 7.8).

| Lab | User problem | Input | Validation approach | Feedback model | Security risk | Feasibility |
|---|---|---|---|---|---|---|
| JSON Error-Fixing | repair invalid JSON | edited JSON text | existing strict validator, then parsed value equals the expected value | validator message with position; differing paths without values | none: no execution, input is data | high: engine exists |
| JSONPath Challenge | select the right nodes | a query | existing RFC 9535 engine; selected Normalized Paths equal the expected set | extra and missing paths | none: engine is bounded | high |
| Cron Challenge | write a schedule | a five-field expression | existing cron engine; parsed schedule equals target | next three real runs versus the requirement in words | none: input 256 characters | high |
| Test Design (boundary and partition) | design test values | integers, or partition choices | pure function over a declarative rule; checked against an independent oracle | which required roles are missing, extra values noted | none | high |

### Difficulty rubric (FR-LAB-001)

Difficulty is defined by content, not by taste: **Beginner** = one concept and one fault or selector; **Intermediate** = two concepts combined or two faults; **Advanced** = three or more concepts, or a rule with an exception. Each exercise records the concepts it uses so the label can be checked.

### Exercises that reward memorising an answer

Labs avoid it by (a) accepting every equivalent correct response, (b) giving feedback about the failed condition rather than the answer, and (c) providing at least two exercises per concept at the same level so repeating one does not complete the skill. This is a design intent; whether it works in practice is UNKNOWN until used.

### Exclusions

No code execution, no HTML or CSS rendering, no free-text grading, no timed or scored tests, no leaderboards, no saved lab progress, no accounts.

## Requirements

### Shared Practice Lab experience (used by the four labs)

- **Intended learner:** The same learners, practising one skill at a time.
- **User input:** A text response in a labelled field (or a few controls), the Check, Hint, Solution, Retry, Reset and Next actions.
- **Accessibility (applies to every requirement below):** Labelled field with a visible character limit, one polite status region for the result, errors linked to the field, focus moves only after an explicit action.
- **Privacy (applies to every requirement below):** Responses stay in the page; labs keep no saved progress in this scope.


| ID | Requirement (interaction, expected behaviour, output, validation, error handling) | Priority | Depends on | Acceptance |
|---|---|---|---|---|
| FR-LAB-001 | Each lab lists its exercises with a title, a difficulty label and a one-sentence learning objective. Difficulty follows one written rubric (concepts combined and faults present), stored with the content. | P0 | FR-LRN-001 | AC-LAB-001 |
| FR-LAB-002 | Before the first exercise the lab shows a short introduction of at most 80 words and at least one fully worked example that shows the reasoning step by step and cannot be submitted. | P0 | FR-LRN-001 | AC-LAB-002 |
| FR-LAB-003 | The response field is labelled, shows a character counter against its limit, and holds the supplied starting text, which the learner may edit. The page never rewrites what the learner typed; Reset exercise restores the starting text. | P0 | None | AC-LAB-003 |
| FR-LAB-004 | Checking is an explicit Check answer action, not live. Any edit after a check removes the displayed result and says the earlier result no longer applies. (Documented reason: live checking would reveal the answer while typing.) | P0 | FR-LAB-003 | AC-LAB-004 |
| FR-LAB-005 | The evaluator is a pure function of the response and the exercise data: same input, same result, with no clock, no randomness and no network. It returns a verdict (Correct, Not yet, Cannot check), a list of findings and a list of hints. | P0 | FR-LRN-001 | AC-LAB-005 |
| FR-LAB-006 | Correct means every required condition of the exercise holds. Not yet means a condition fails. Cannot check means the response is empty, over the limit or not in the expected form; it gives its own message and is not counted as an attempt. | P0 | FR-LAB-005 | AC-LAB-006 |
| FR-LAB-007 | Feedback for Not yet names the failed condition in plain words without giving the answer. Show hint reveals up to three hints one at a time. Show solution reveals one accepted solution with the explanation, and marks the exercise Solution viewed (not Completed). | P0 | FR-LAB-006 | AC-LAB-007 |
| FR-LAB-008 | Every exercise has an explanation of the reasoning of at least one sentence, with a source reference where a standard applies. | P0 | FR-LRN-003 | AC-LAB-008 |
| FR-LAB-009 | Try again clears the feedback and keeps the response; Reset exercise restores the starting text and clears feedback; Next exercise and Previous exercise move through the list. Each exercise keeps its response in memory for the rest of the visit. | P0 | FR-LAB-003 | AC-LAB-009 |
| FR-LAB-010 | Pressing Check repeatedly with an unchanged response gives the same result, renders once and is announced once. | P0 | FR-LAB-004 | AC-LAB-010 |
| FR-LAB-011 | An exercise is Completed when its verdict is Correct and its solution was not viewed. The lab shows counts only: completed, solution viewed, not started. Nothing is saved between visits. | P0 | FR-LAB-007 | AC-LAB-011 |
| FR-LAB-012 | Each response has a stated maximum length (20,000 characters unless the lab states less). Beyond it the Check action is refused with the limit stated; the evaluator never receives more. | P0 | FR-LAB-003 | AC-LAB-012 |
| FR-LAB-013 | An exercise may link to the existing tool that does the same operation. The link is a plain anchor with no values in the address; the page states that the learner can copy the starting text into the tool. | P0 | FR-INT-004 | AC-LAB-013 |
| FR-LAB-014 | If an evaluator throws, the lab shows Something went wrong while checking this answer, keeps the response, and shows no stack or internal text. | P0 | FR-LAB-005 | AC-LAB-014 |

### JSON Error-Fixing Lab (tool id json-error-fixing-lab)

- **Intended learner:** Developers and testers who meet invalid JSON from APIs, config files and logs.
- **User input:** Broken JSON text to be edited.
- **Accessibility (applies to every requirement below):** Error line and column are given as text; the editing field is a plain labelled text area.
- **Privacy (applies to every requirement below):** The text is processed in the browser by the existing strict validator.


| ID | Requirement (interaction, expected behaviour, output, validation, error handling) | Priority | Depends on | Acceptance |
|---|---|---|---|---|
| FR-JEF-001 | The lab has at least 16 exercises over three difficulty levels. Together they cover: trailing comma, single quotes, unquoted key, missing comma, missing closing bracket or brace, comment, NaN or Infinity or undefined, leading zero, malformed escape, raw line break in a string, and a mix of two faults. | P0 | FR-LAB-001 | AC-JEF-001 |
| FR-JEF-002 | Check parses the response with the existing strict JSON validator. The answer is Correct only if it is valid JSON and its parsed value equals the exercise's expected value. Formatting and key order do not matter. | P0 | FR-LAB-005 | AC-JEF-002, AC-JEF-008 |
| FR-JEF-003 | When the response is still invalid, the feedback gives the validator's message with line and column and one plain-language hint, as text. | P0 | FR-JEF-002 | AC-JEF-003 |
| FR-JEF-004 | When the response is valid but differs from the expected value, the feedback says so and lists up to five paths that differ, without the expected values; the hints may reveal them. | P0 | FR-JEF-002 | AC-JEF-004 |
| FR-JEF-005 | Each exercise links to the JSON Formatter and Validator (plain link) and cites the RFC 8259 section it illustrates. | P0 | FR-LAB-013 | AC-JEF-005 |
| FR-JEF-006 | The lab inherits the validator's limits (depth 500) and caps the response at 20,000 characters. | P0 | FR-LAB-012 | AC-JEF-006 |

### JSONPath Challenge Lab (tool id jsonpath-challenge-lab)

- **Intended learner:** Developers, testers and analysts who query JSON with JSONPath.
- **User input:** A JSONPath query typed against a fixed read-only document.
- **Accessibility (applies to every requirement below):** The document sits in a labelled, scrollable region; results are text lists of paths.
- **Privacy (applies to every requirement below):** The query runs in the browser on a built-in document.


| ID | Requirement (interaction, expected behaviour, output, validation, error handling) | Priority | Depends on | Acceptance |
|---|---|---|---|---|
| FR-JPC-001 | The lab has at least 16 exercises over three difficulty levels covering: child and index selection, wildcard, negative index and slice, descendant, filter with comparison, filter with logical and, or and not. Each shows a built-in document and the list of values the query must select. | P0 | FR-LAB-001 | AC-JPC-001 |
| FR-JPC-002 | Check evaluates the query with the existing RFC 9535 engine on the exercise document. Correct means the selected Normalized Paths equal the expected paths, as a set unless the exercise marks order as required. | P0 | FR-LAB-005 | AC-JPC-002, AC-JPC-006 |
| FR-JPC-003 | A query the engine refuses (syntax error, unsupported match() or search(), script expression) gives the engine's message with position as Cannot check; no exercise requires an unsupported function. | P0 | FR-JPC-002 | AC-JPC-003 |
| FR-JPC-004 | A query that selects different nodes lists up to five extra and up to five missing Normalized Paths, so the learner sees what changed without seeing the query. | P0 | FR-JPC-002 | AC-JPC-004 |
| FR-JPC-005 | The query is limited to 1,000 characters and the engine's work bound applies; if the bound is reached the lab says the query does more work than the lab allows. | P0 | FR-LAB-012 | AC-JPC-005 |
| FR-JPC-006 | The document is shown read-only in a scrollable, labelled region and is never editable. | P0 | FR-LAB-003 | AC-JPC-007 |

### Cron Challenge Lab (tool id cron-challenge-lab)

- **Intended learner:** Developers and operators who write cron schedules.
- **User input:** A five-field cron expression for a described schedule.
- **Accessibility (applies to every requirement below):** Run times are given as plain text lists.
- **Privacy (applies to every requirement below):** The expression is parsed in the browser by the existing cron engine.


| ID | Requirement (interaction, expected behaviour, output, validation, error handling) | Priority | Depends on | Acceptance |
|---|---|---|---|---|
| FR-CRN-001 | The lab has at least 14 exercises over three difficulty levels. Each describes a schedule in words and asks for a five-field cron expression in the dialect the existing Cron Expression Explainer states (Cronie). | P0 | FR-LAB-001 | AC-CRN-001 |
| FR-CRN-002 | Check parses the response with the existing cron engine. Correct means the parsed schedule equals the target schedule (same value sets for minute, hour, day of month, month and day of week, and the same day-of-month versus day-of-week rule), whatever the text. | P0 | FR-LAB-005 | AC-CRN-002 |
| FR-CRN-003 | A wrong but valid expression shows its next three run times from a fixed reference date given in the exercise, and the described requirement in words, never the target expression. | P0 | FR-CRN-002 | AC-CRN-003 |
| FR-CRN-004 | An invalid expression shows the engine's message as Cannot check. Input is limited to 256 characters. | P0 | FR-LAB-012 | AC-CRN-004 |
| FR-CRN-005 | The page states the dialect and that Quartz, AWS and other schedulers use different syntax; no claim is made for them. | P0 | FR-LRN-013 | AC-CRN-005 |
| FR-CRN-006 | At least one exercise covers the combined day-of-month and day-of-week rule, with an explanation that follows the engine's stated behaviour. | P0 | FR-CRN-002 | AC-CRN-006 |

### Test Design Lab (tool id test-design-lab), modes Boundary Value Analysis and Equivalence Partitioning

- **Intended learner:** Testers and developers learning or revising test design.
- **User input:** Integer test values (boundary mode) or partition choices for given values (partition mode).
- **Accessibility (applies to every requirement below):** Each value and its choice have a visible label; result lines name the value and the verdict in words.
- **Privacy (applies to every requirement below):** Values are evaluated in the browser against a built-in rule.


| ID | Requirement (interaction, expected behaviour, output, validation, error handling) | Priority | Depends on | Acceptance |
|---|---|---|---|---|
| FR-TDL-001 | The lab has at least 10 boundary value exercises and at least 10 equivalence partitioning exercises over three difficulty levels. Each specification is plain English, says inclusive or exclusive for every limit, and is checked by a second reviewer for ambiguity. | P0 | FR-LAB-001 | AC-TDL-001 |
| FR-TDL-002 | In boundary mode the learner enters integers separated by commas, spaces or line breaks: at most 30 values, each between -1,000,000,000 and 1,000,000,000. A token that is not an integer is named in the error and nothing is checked. | P0 | FR-LAB-003 | AC-TDL-002 |
| FR-TDL-003 | Each boundary exercise states whether it uses two values or three values per boundary. The evaluator computes the required set from the stated rule. Correct means every required value is present; extra values are listed as extra (neither wrong nor needed); missing values are named by role, not by number. | P0 | FR-LAB-005 | AC-TDL-003 |
| FR-TDL-004 | In partition mode each exercise gives a rule, the partitions and a list of sample values, and the learner chooses one partition per value from a labelled select. Feedback gives one line per value in words (Correct or Not yet) and a count. | P0 | FR-LAB-005 | AC-TDL-004 |
| FR-TDL-005 | The evaluator reads a declarative rule (integer type, minimum, maximum, inclusive flags) held in the exercise data. It is verified against an independent Python oracle over a generated corpus before any release. | P0 | FR-LRN-001 | AC-TDL-005 |
| FR-TDL-006 | Only whole-number ranges are in scope. The page states that text, dates and combinations of fields are not assessed. | P0 | FR-LRN-013 | AC-TDL-006 |
| FR-TDL-007 | Each explanation names the kind of defect the technique targets (for example an off-by-one error) and may show a short code line as text. The code is never executed. | P0 | FR-LAB-008 | AC-TDL-007 |
| FR-TDL-008 | The page claims no certification, exam readiness or coverage of any syllabus; it may name the technique as commonly taught. | P0 | FR-LRN-013 | AC-TDL-008 |

## Content-correctness method (all labs)

1. Each exercise cites the standard it rests on (RFC 8259, RFC 9535, the Cronie dialect as the existing tool states it, the technique as commonly taught).
2. The expected answer is **computed** by an independent method and compared with the evaluator: JSON by Python's `json`, JSONPath expected paths by the compliance-suite style computation and by hand, cron by an independent Python implementation, boundaries by an independent Python oracle over a generated corpus (AC-TDL-005).
3. A second reviewer reads every specification for ambiguity (inclusive or exclusive, dialect) and every explanation for accuracy.
4. Content is original: no competitor exercise, no verbatim standard text, no copied syllabus wording.
