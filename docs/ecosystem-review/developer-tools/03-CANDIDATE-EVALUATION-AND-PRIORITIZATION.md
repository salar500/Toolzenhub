# 03. Candidate evaluation and prioritization

PROJECT: ToolZenHub
ECOSYSTEM: Developer Tools
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASES: 0, 1 AND 2 (Ecosystem 2.0 revision, 2026-10-26)
PURPOSE: Research and requirements baseline

Method: rulebook section 12 exactly (six weighted dimensions 25/25/20/10/10/10, mandatory gates, verdicts A to D). **No replacement weights were invented.** Scores are judgment, not data; the total is `sum(weight x score) / 5` and is not a measurement. Evidence ids E1 to E14 are in sections 1 to 6 of `02-RESEARCH-EVIDENCE-AND-COMPETITOR-REVIEW.md`, E15 to E26 in its "Ecosystem 2.0 additions". Every S (search demand) and R (repeat use) score is a **hypothesis**: no search, trend, Search Console or usage data was obtainable (02 section 8). Scores differing by one or two points are **not** treated as meaningful.

## 1. Mandatory gates (rulebook section 12)

A candidate fails if it: solves no meaningful problem; only duplicates an existing tool without a real improvement; can give unreliable or misleading output; carries a disproportionate maintenance burden; needs a paid external API; creates an unacceptable privacy or security risk; cannot deliver an acceptable mobile experience; or exists only to raise the tool count. A failed gate means reject or defer however high the score.

## 2. Complete candidate inventory

Decision classes: P0 core ecosystem recommendation, P1 valuable subsequent work, P2 conditional or optional, DEFER, REJECT, EXISTING ENHANCEMENT (a change to a published tool; each needs the owner's approval because earlier specs excluded it, rule 9.3).

| # | Candidate | Family | Gates | S R U D F T | Total | Verdict | Decision | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C1 | **JSON Compare** (structural diff, JSON Patch out) | JSON | pass | 3 3 4 3 4 5 | **70** | A | **P0** | A line diff cannot ignore key order or tell `1` from `"1"`; the richest competitor read (E6) and JSONLint's own link to a compare tool (E22) show the job exists; fully checkable by applying the patch |
| X1 | **Base64URL mode** (existing Base64 tool) | Encoding | pass | 3 3 4 2 5 5 | **70** | A | **P0 existing enhancement** | JWTs and many APIs use base64url; the tool refuses it with a hint by decision (spec 27); RFC 4648 has independent vectors; default behaviour unchanged |
| C4 | **URL Parser & Encoder** (parse, build query, encode, decode) | Web | pass | 3 3 3 3 5 5 | **68** | A | **P0** | One observed competitor says its standard encoding goes through its servers (E26); DevToys ships URL tools (E21); the platform parses URLs natively (E12), so the value is explanation and safe display, and the risk is low. D is rated 3 on **one** competitor's statement |
| C2 | **JSONPath Tester (RFC 9535)** | JSON | pass, with the regex-function condition (DEC-JP-1) | 2 3 4 4 3 5 | 65 | A | **P0** | A 2024 standard with a published compliance suite; one tester uses a non-standard engine (E3, secondary); DevToys ships a JSONPath tester (E21); shares a JSON path engine with C1; an independent oracle exists |
| C3 | JSON Schema Validator | JSON | **conditional**: validator audit (licence, size, CSP-safety, conformance) and no in-house validator | 3 3 4 3 2 4 | 64 | B | P1 | Strong fit and already named in the roadmap; blocked by the audit (E13 incomplete) |
| X2 | Text Diff options: ignore case, show only changes with context | Text | pass | 3 3 3 2 4 5 | 64 | B | P1 existing enhancement | Listed on one competitor page (E23); excluded by spec 18; demand unmeasured |
| X3 | JSON Formatter: indentation choice (2/4/tab) | JSON | pass | 3 3 3 1 5 5 | 64 | B | P1 existing enhancement | Basic expectation (reasoned); no competitor evidence read; excluded by spec 15 |
| C19 | **List Comparer** (items only in A, only in B, in both; duplicates) | Text | pass | 2 3 3 3 5 5 | 63 | B | P1 | Newly found (E21 "List Comparer"); a different job from Text Diff (set membership, not line order); trivially checkable against Python sets |
| C6 | UUID Generator (v4, v7, bulk) | Identifiers | pass | 3 2 3 2 5 5 | 61 | B | P1 | RFC 9562 recommends v7 (E11); the observed competitor shows ad cookies (E9); native `crypto.randomUUID` covers v4 only, so v7 needs an implementation checked against RFC 9562 examples |
| C5 | JSON ⇄ CSV | JSON, data | conditional on nested-value rules and CSV formula-injection policy | 3 2 4 2 3 4 | 59 | B | P1 | A long-lived free tool exists (E8); DevToys has JSON Array to CSV (E21) |
| C13 | Unicode / whitespace inspector | Text | pass | 2 2 3 3 4 5 | 56 | C | P2 | Natural companion to Text Diff; demand unknown |
| X4 | JSON Formatter tree view | JSON | pass but heavy (rule 9.6: strong keyboard and mobile design needed) | 3 3 3 2 2 3 | 56 | C | P2 existing enhancement | JSON Crack shows graph value (E17); "deferred, not rejected" in spec 15 |
| C14 | Case converter / text cleanup | Text | commodity; overlaps the planned Text Cleaning Workbench (P2) | 3 2 2 1 5 5 | 55 | C | P2 | Ad-supported commodity (E25); evaluate with the workbench |
| C7 | Hash / checksum generator | Identifiers | pass; **secure-context only** (E10) and no native MD5 | 3 2 3 1 4 4 | 55 | C | P2 | Commodity; DevToys includes it (E21) |
| C10 | XML formatter / validator | Config | pass (`DOMParser`), error text differs per browser | 3 2 3 1 4 4 | 55 | C | P2 | Commodity |
| C20 | Number base converter | Encoding | pass | 2 2 3 1 5 5 | 54 | C | P2 | Small, deterministic, low differentiation |
| X5 | Base64 file / image input | Encoding | memory and privacy review needed | 3 2 3 2 3 3 | 53 | C | P2 existing enhancement | DevToys has "Base64 Image and Text" (E21); large-input risk |
| C8 | cURL command explainer | API | **at risk**: shell-quoting grammar; a wrong parse misleads | 2 2 4 3 2 3 | 52 | C | DEFER | Grammar large, not researched |
| X6 | Cron Explainer: next runs in a chosen zone | Time | would change an approved design (UTC only) | 2 2 3 2 3 4 | 50 | C | P2 existing enhancement | No evidence of need; DST rules are the risk |
| X7 | JWT Decoder: per-claim copy | Security | pass | 2 2 2 1 5 5 | 50 | C | P2 existing enhancement | No evidence; current page is already complete |
| C9 | YAML validator / formatter; JSON ⇄ YAML | Config | **fails reliable-output gate without a library**; none audited | not scored | — | C | DEFER | Needs a dependency decision |
| C16 | HTTP status reference | Web | static reference, no computation; an article, not a tool | not scored | — | C | DEFER | |
| C21 | SQL formatter, Markdown preview, certificate/ASN.1 decoder, GZIP | various | heavy parsers or sanitization risk | not scored | — | C | DEFER | Each needs a library or a large grammar and its own audit |
| C15 | Regex Tester | Text | **excluded** (factory line 275; roadmap R1) and a ReDoS risk | not scored | — | D | **REJECT** (binding) | DevToys includes one (E21); re-opening is an owner decision only (DEC-OWN-4) |
| C17 | Password generator, colour tools, lorem ipsum | misc | Password Generator is excluded by the factory; the rest are not developer workflows of this program | not scored | — | D | REJECT / out of scope | |
| E1 | Reciprocal curated related links, six existing tools | existing | pass | metadata | — | A | **P0 (metadata only)** | Fixes D2 of the earlier review |
| E2 | Developer Tools related-tools pilot (same-section list) | shared | needs its own approved step (rule 4.8) | shared | — | A | **P0 shared, only if approved** | Today no Developer Tool shows a related list |

Existing tools with **no** proposed change (class A): Unix Timestamp Converter, JWT Decoder, Cron Explainer (apart from links). See 01 section 8.

## 3. Close calls and judgment

| Question | Resolution |
| --- | --- |
| JSONPath 65 is below the P1 items at 64 only by one point | The ranking is not decisive. JSONPath is **P0** because it shares an engine with C1, has an independent oracle (RFC tables and suite), and needs no existing-tool change. Schema (64) is blocked by an audit; X2 and X3 each reverse an approved exclusion in an existing tool and rest on weaker evidence |
| URL Parser (68) versus JSONPath (65) | Both P0. The earlier package ranked the URL tool P1 because **no competitor page had been read**; E26 and E21 now supply one |
| Base64URL (70) ties JSON Compare | It is an enhancement to a published tool, so it needs approval to reverse the spec-27 decision; its risk is low and its oracle is RFC 4648 |
| List Comparer (63) versus UUID (61) versus JSON/CSV (59) | All P1; the 2 to 4 point gaps are inside the noise of S and R, which are hypotheses |

## 4. Alternatives considered

Merging JSON Compare into the JSON Formatter, or a JSON mode in Text Diff, was rejected: it would change existing tools (rule 9.3), blur search intent and the formatter's spec excludes diff. A combined "JSON Toolkit" page was rejected (one primary page per intent, rule 6.5). Putting URL encode and URL parse on separate pages was rejected: one intent family, one tool. Adding the Regex Tester to match DevToys was not done (binding exclusion).
