# 11. Open decisions and owner approval summary

PROJECT: ToolZenHub
ECOSYSTEM: Developer Tools
STATUS: OWNER SCOPE DECISION RECORDED 2026-10-27 (see section 0); the rest of this document is the original proposal text
PHASES: 0, 1 AND 2 (Ecosystem 2.0 revision, 2026-10-26)
PURPOSE: Research and requirements baseline

## 0. Owner decisions recorded (2026-10-27)

The owner approved, in the continuation authorization of 2026-10-27: **the Balanced scope of 13 tools** (DEC-OWN-1), the three P0 tools (earlier approval), the four P1 tools **List Comparer, UUID Generator, JSON ⇄ CSV and JSON Schema Validator** (the Schema Validator only if its library audit and the technical gates pass; a failed gate is recorded as a blocker, never replaced by a misleading substitute), **the Base64URL enhancement** (reversing the spec-27 "Out of V1" item for this functionality only; DEC-OWN-5), **the Developer Tools related-tools pilot** limited to genuinely relevant published tools (DEC-OWN-3), **Text Diff "ignore case" and "show only changes"**, and **the JSON Formatter indentation choice**. DEC-OWN-2 stays P0 (URL Parser built). DEC-OWN-4 is unchanged: the Regex Tester stays excluded. Production, push, PR and deployment remain unauthorized. The earlier "NOT AUTHORIZED" statements below are superseded by this section.

## 1. What is being asked (one consolidated decision)

Approve, or change, this proposed baseline for the architecture, design and development phases that follow:

- **Recommended scope: Option B, Balanced, 13 tools in two releases** (04).
- **Release 1, P0:** three new tools, **JSON Compare**, **URL Parser & Encoder** and **JSONPath Tester (RFC 9535)**; one meaningful enhancement to an existing tool, a **Base64URL mode** for the Base64 Encoder & Decoder (default unchanged); reciprocal related links among the existing tools; shared prerequisites (a new clipboard module for new tools only, optionally a shared JSON tree module). Ecosystem size after Release 1: **9 Developer Tools** (6 existing plus 3).
- **Release 2, P1, each behind its own audit and a go decision:** List Comparer, UUID Generator, JSON ⇄ CSV, JSON Schema Validator (only if its library audit passes), and two low-risk enhancements (Text Diff ignore case and show-only-changes; JSON Formatter indentation choice). Ecosystem size: **13** (12 if the Schema audit fails).
- **Unchanged (class A):** Unix Timestamp Converter, JWT Decoder, Cron Explainer, apart from related links.
- **P2 backlog, deferred, rejected:** in 03. The Regex Tester stays rejected under its binding exclusion.

Approval authorizes **planning, architecture and specification only**; it does not authorize code, a commit, a push or a deployment. Each existing-tool change (Base64URL, Release 2 enhancements) reverses an earlier "not in V1" decision and is flagged as such.

## 2. Most important tradeoffs

| # | Tradeoff | Recommendation | Alternative |
| --- | --- | --- | --- |
| T1 | **Scope size.** B (13) versus A (9) versus C (18). Counts are not a goal; B is what passed the gates at a score of 59 or more | B, with Release 1 first and Release 2 only after verification | A, if you prefer the smallest set; C is not recommended |
| T2 | **JSONPath v1 omits `match()` and `search()`** so no user-supplied regular expression runs (ReDoS; Regex Tester is an excluded product). The page says "RFC 9535 except these two functions" | Omit in v1 (DEC-JP-1) | Include them with an I-Regexp check and a time-boxed Worker |
| T3 | **URL Parser & Encoder is P0**, promoted because one competitor's page says its standard encoding uses its servers and DevToys includes URL tools. Differentiation rests on one public claim | P0 | Keep it P1 (DEC-OWN-2) |
| T4 | **JSON Compare limits**: 1,000,000 characters per side; duplicate keys last wins with a warning | As written (DEC-JC-1, DEC-JC-2) | Match 2,000,000; refuse duplicate keys |
| T5 | **Reversing the spec-27 Base64URL exclusion** and changing its one hint message | Approve (OPEN-10) | Leave Base64 as is and drop DP-4 |
| T6 | **Developer Tools related-tools pilot** makes a visible one-line change to the nine pages | Approve as its own later step | Keep relations as invisible metadata |
| T7 | **No demand data.** Every search and repeat-use score is a hypothesis; Trends, Stack Overflow and Search Console were unavailable | Accept, keep Release 1 small and checkable | Obtain Search Console data first |

## 3. Security concerns the owner should know

User-supplied regular expressions are not executed; huge numbers and deep nesting are bounded before they can freeze the tab; no input is stored, sent or placed in a URL; the URL tool never opens, fetches or links a URL, so `javascript:` URLs are shown as text; invalid UTF-8 is an error, never replaced; the JWT page's "not verified" statement is preserved and no link transfers tokens or text. Detail in 06.

## 4. Research gaps (unresolved, stated plainly)

No search-volume, trend, Stack Overflow, Search Console or India-specific data; no competitor was used interactively (only fetched page text was read); several competitor pages were unobservable (jsoneditoronline.org, crontab.guru, freeformatter.com, it-tools.tech); the JSONPath compliance suite's licence and the tails of RFC 9535 and RFC 9562 were not read; the JSON Schema library is unaudited. Full market validation was **not** achieved. Nothing was run in a real browser other than the repository's own Chrome-based tests, and no test was run in this planning phase.

## 5. Implementation feasibility

Feasible inside the current architecture: pure engines, the existing page contract, no new dependency, no backend. The unknowns are the main-thread cost at 1,000,000 characters (OPEN-02) and the Schema library audit.

## 6. Recommended next engineering phase

If approved: DP-0 (close the open items, write the Tool Packs, add the clipboard module). Separately and **still pending**: the owner's combined Android acceptance of the Time Tools preview. **No production deployment is recommended**; production is a separate owner decision.

## 7. Open decisions for the owner

| ID | Decision | Default if not answered |
| --- | --- | --- |
| DEC-OWN-1 | Approve Option B as the baseline (this document's one question) | none: nothing proceeds |
| DEC-OWN-2 | Keep URL Parser & Encoder as P0 or move it to P1 | P0 |
| DEC-OWN-3 | Approve the Developer Tools related-tools pilot as a later step | not approved |
| DEC-OWN-4 | Reopen the Regex Tester exclusion | stays excluded |
| DEC-OWN-5 | Approve reversing the Base64URL exclusion (OPEN-10) | not approved; DP-4 does not start |

Routine design choices (layout, labels, wording, interactions) are made in the specification phase and need no separate approval (rule 7.8).
