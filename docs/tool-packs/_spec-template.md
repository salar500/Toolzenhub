# Tool Pack NN: <Tool name>  (spec template)

Copy this file to `docs/tool-packs/NN-<id>.md` and fill it in **before any code**. Every section needs an answer.
"NOT NEEDED" is an answer if it comes with a one-line reason; blank or "TBD" is not. The spec is approved
before implementation, and after the build an "Implementation notes" section records every deviation.
See `docs/tool-pack-factory.md` for the lifecycle and the quality gate.

Status: draft | approved | built      Base commit: <hash>      Reserved id and slug: <id> (route `/calculators/<id>/`)

## 1. Tool identity
Catalog id (existing, kept), display title, section, category, subcategory (usually none), `toolType`,
description (one sentence), aliases that are true.

## 2. User problem
The decision or question, who has it, when, and what they do today without a good tool. One paragraph.

## 3. Primary jobs to be done
3 to 5 questions the user wants answered, in their words.

## 4. Target users
Who, and who it is *not* for.

## 5. Inputs
Table: label, unit, default, min, max, step, hint, why it is needed. Say what was left out and why.

## 6. Outputs
The primary result (the answer to the first job), supporting results, and what is deliberately not shown.

## 7. Calculation / model rules
Formulas, conventions (timing, compounding, rounding), the order of operations. Name the independent method
that will verify it (closed form, second implementation, hand calculation) and the golden scenarios.

## 8. Assumptions
Plain-language statements shown on the page next to the results. List anything that depends on a lender, a
rule, a rate or a date, and whether the user supplies it or the site would have to maintain it.

## 9. Edge cases
Each with the expected behaviour and wording (zero, extreme, equal, impossible, "no benefit", "never").

## 10. Validation
Limits, messages, cross-field rules, empty versus error states.

## 11. UX flow
Order of the page, shared components used, what updates live, what needs an action, the primary action (or
why there is none).

## 12. Result hierarchy
What the eye reads first, second, third; how an unfavourable result is shown without advice.

## 13. Comparison, table or schedule decision
Needed or NOT NEEDED. If needed: which view is the default, what the columns are, how the detail is reached,
what keeps it from dumping hundreds of rows on the page.

## 14. Chart decision
Needed or NOT NEEDED. A chart is justified only if it shows something the numbers and text do not.

## 15. Export decision
Needed or NOT NEEDED, with the user reason (would someone keep or share this?). CSV only for a detailed
schedule; no PDF engine.

## 16. Print decision
Needed or NOT NEEDED. If needed: what prints and what is hidden (native browser print).

## 17. Mobile behaviour
At about 390px: field layout, result cards, tables, action rows, tap targets.

## 18. Accessibility requirements
Labels, linked errors, keyboard, live region, table semantics, contrast, focus, reduced motion, no colour-only
meaning, anything specific to this tool.

## 19. Search keywords and aliases
Only aliases that are true names for this tool; the queries to check.

## 20. Related calculators
Related tool ids in order; the reason for each.

## 21. Article cluster
Needed or NOT NEEDED. Each article: the distinct question it answers, the intent type (explanation, comparison,
decision guide, scenario, mistake avoidance, interpretation), the numbers it needs from the tool, the primary
tool link. Say what is deferred and why (rule-dependent articles wait). No forced count.

## 22. Imagery plan
Per image: the concept it explains and how it is drawn (diagram or chart from the tool's numbers), or none.
Nothing generic.

## 23. SEO plan
Title, description, canonical, headings, internal links, what is in the static HTML.

## 24. Performance constraints
Gzipped budget for the tool JS and CSS; what must not load on other pages; no new dependency.

## 25. Tests
Unit (golden, invariants, validation), browser (flows, errors, reset, keyboard, mobile), accessibility, visual,
the pinned expectations that change (see the factory touch-list).

## 26. Quality gate
Tick against the factory quality gate; list any item that is NOT NEEDED with its reason.

## 27. Deferred items
What is out of v1 and the condition for revisiting it.

## 28. Commit checkpoint
The commit subject, and the exact-tree verification to run afterwards.
