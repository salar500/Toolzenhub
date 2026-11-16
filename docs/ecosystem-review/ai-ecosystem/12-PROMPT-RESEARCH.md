# 12. Prompt engineering research: structures, permutations, failure conditions

Evidence: vendor guidance (S21, S22, S23), peer-reviewed input-length research (S20), usability research on articulation (S17, S18), and the existing compiler rules (Tool Pack 58 section 8), which this research confirms. Where a statement is practitioner judgment it is labelled **H**.

## 1. Prompt dimensions and when each earns its place

| Dimension | Useful when | Adds only length when | Compiler source |
| --- | --- | --- | --- |
| Objective / task | always | never | `brief.goal` |
| Deliverable | always (names the thing to return) | never | `deliverable` |
| Context | the AI cannot know it (project, audience, constraints) | it repeats the request | `brief.context` |
| Role of the user | it changes vocabulary or depth (experience rules) | as decoration | `aboutMe` |
| Role for the AI ("act as…") | rarely; vendor guides list persona as optional (S22) | inflated ("world-class") | forbidden inflation (existing) |
| Audience | output is for someone else | the user is the reader | `audience` |
| Inputs / material | the task transforms given material | material is not attached | fenced material |
| Constraints | they change the output (length, must-keep, banned) | generic ("be accurate") | `requirements`, `avoid` |
| Method | professional tasks with known methods (test design, research method) | simple tasks | blueprint requirements |
| Output format | always for work deliverables | casual questions | `format` |
| Examples | style must be matched | they bias content | optional field per blueprint |
| Success criteria | multi-stage or delivered work | one-off questions | `quality`, stage `done` |
| Uncertainty handling | always one line (ask or list assumptions) | repeated | closing line (existing) |
| Review requirement | detailed and multi depth | short tasks | FINAL_REVIEW stage |
| Follow-up instructions | stages and refinements | in the master prompt | stages, refinements |

## 2. Permutations: what changes the prompt materially

| Axis | Change that helps | Evidence |
| --- | --- | --- |
| Simple vs complex | simple: one prompt (Short); complex: master + stages, one deliverable per stage | S20 (shorter input reasons better), H |
| Beginner vs expert | beginner: explanations, glossary, fewer stages; expert: trade-offs, rejected alternatives, decision records | existing EXPERIENCE_RULES, H |
| Exploratory vs precise | exploratory: ask for options with trade-offs, no format lock; precise: exact format, acceptance checks | H |
| Creative vs technical | creative: one descriptive paragraph, keep and avoid lists, consistency sheet; technical: labelled sections, "do not assume stack" | existing `style: descriptive`, S11-S13 |
| Single vs multi-stage | multi: each stage restates its deliverable; "wait for my answers" at scoping stages | H |
| Text vs image vs video vs audio | media: subject, composition, lighting, style, motion or voice; no invented parameters; product docs decide syntax | S11-S14 |
| Known vs incomplete requirements | incomplete: `[add: …]` and "ask me before you start" | existing |
| Consistent vs conflicting inputs | conflicting: listed above the pack; never silently resolved | S21 |
| One product vs neutral | neutral by default; product-specific only from directory data | rule 4.11 |
| With vs without project context | with: context first, fenced, then instructions; without: no empty context block | H (placement), existing |

Conclusion: length should follow complexity and missing information, not "detail level" alone. A detailed pack adds stages and checks, not adjectives.

## 3. Failure conditions and compiler handling

| Condition | Detection (deterministic) | Handling |
| --- | --- | --- |
| Missing context | essential unanswered | `[add: …]`, listed, prompt asks AI to ask (existing) |
| Ambiguous requirement | vague words in an essential ("etc", "and so on", "some", "various", "good", under 4 words) | warning beside the field (reuse `clarityCheck` patterns) |
| Contradictory instructions | blueprint `conflicts` + generic rules (`07` section 3) | "Check this first" list; nothing resolved silently |
| Excessive constraints | more than 12 requirement lines | note: "Long lists of rules are followed less reliably; keep the ones that matter." (S20, S21) |
| Conflicting output formats | two format choices that exclude each other (JSON only + table; code only + explanation) | conflict listed |
| Missing references | the task needs material (edit, summarise, repurpose) and none is described | preparation item "Have ready" + placeholder |
| Unsupported assumptions | research or data tasks | `NO_FABRICATION` (existing) |
| Overly broad task | goal over 2 outcomes' words (matcher hits in 3+ outcomes) | suggest Multi-stage or splitting |
| Overly narrow task | Multi-stage chosen for a Short-default task | note: "This task usually needs one prompt." |
| Poor stage transitions | each stage `next` and `done` (existing) | tests ensure each stage has both |
| Repeated instructions | duplicate lines across requirements, avoid, experience rules | de-duplicate by normalised text (new compiler step) |
| Inconsistent terminology | not detectable reliably | consistency refinement prompt (existing) |
| Unclear completion | missing `done` | test failure (blueprint lint) |

## 4. Output quality per task family (what good and bad look like)

| Family | Good output | Common failure | Check | Clarify first | Refinement |
| --- | --- | --- | --- | --- | --- |
| Content | answers the brief's goal for its audience; length and structure as asked | generic padding, invented facts | headings, length, figures | audience, goal, length | clarity, accuracy, style |
| Images | subject, framing and keep-list honoured | drift, wrong text in image | brief items one by one | text in image, format | visual |
| Video | shots consistent; durations add up | continuity breaks | continuity list | total length, shot count | continuity |
| Audio | voice, pace, pronunciation | mispronounced names | pronunciation list | names, target length | audio |
| Software | builds on the named stack; edge cases; tests | assumed stack, "almost right" code (S19) | language, tests, TODOs | stack, constraints | technical, missing |
| Testing | traceability; checkable expected results | vague "works correctly" | ids, expected results, AC references | requirements | completeness, structure |
| Research | sources separated from interpretation | fabricated citations (S26) | every citation opened | question, scope, sources | evidence, accuracy |
| Improve | meaning kept, changes listed | rewrites what should stay | diff by eye; keep-list | what must not change | consistency |
| Plan | stages with owners and checks | generic plans | each step has a done-when | constraints, dates | completeness |

## 5. Reusable prompt components (specification, not a prompt library)

Components the compiler composes, each a pure function with tests: `goalLine`, `aboutMe`, `contextBlock`, `projectContextBlock` (new), `requirementList` (de-duplicated, new), `formatList`, `avoidList`, `uncertaintyLine`, `stageHeader` (new: restates deliverable), `consistencyBlock` (new), `finalReview`, `refinement(id)`. No component may emit: requests for hidden reasoning, role inflation, invented product syntax, invented facts.
