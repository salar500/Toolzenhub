# 04. Proposed ecosystem scope

PROJECT: ToolZenHub
ECOSYSTEM: Developer Tools
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASES: 0, 1 AND 2 (Ecosystem 2.0 revision, 2026-10-26)
PURPOSE: Research and requirements baseline

Everything below is a recommendation. The authoritative roadmap (`docs/tool-pack-factory.md`) is **not** changed by this package. The owner's planning reference of about 12 to 18 tools is a reference, not a target (rulebook rule 1.2).

## 1. Three scope options compared

Counts include the six existing tools, which are preserved in every option.

| | **A. Focused** | **B. Balanced (recommended)** | **C. Expanded** |
| --- | --- | --- | --- |
| New tools | P0 only: JSON Compare, URL Parser & Encoder, JSONPath Tester | A plus P1: List Comparer, UUID Generator, JSON ⇄ CSV, JSON Schema Validator (**only if its library audit passes**) | B plus P2: Unicode Inspector, Case/Text Cleanup, Hash Generator, XML Formatter, Number Base Converter |
| Total tools | **9** | **13** (12 if the Schema audit fails) | **18** |
| Existing-tool enhancements | Base64URL mode; related links | A plus Text Diff options, JSON Formatter indentation | B plus tree view, Base64 file input, Cron zone display, JWT per-claim copy |
| User value | the three strongest evidenced jobs | covers JSON, web debugging, text sets, identifiers and data conversion workflows | adds commodities that strong free alternatives already serve (hypothesis) |
| Completeness as an ecosystem | JSON and web families only | JSON, web, text, identifiers, data | broad, but several pages exist mainly to be present |
| Differentiation | highest per tool | high for P0, moderate for P1 | diluted: P2 items score 50 to 56 with differentiation 1 to 3 (03) |
| Complexity | low to medium | medium; one audit-dependent tool | high |
| Development and test burden | 3 packs plus an enhancement | about 8 packs in two releases | about 14 packs; each needs deep tests and baselines |
| Maintenance | low | medium | high (more engines and more spec drift) |
| Browser-local feasibility | all feasible | all feasible; Schema depends on a library | Hash needs a secure context; XML error text varies by browser |
| Resource constraints (4 GB laptop, under 1 GB free at times) | comfortable | workable if packs run one at a time with focused tests | strains the test cycle; many baselines |
| SEO discoverability (hypothesis only) | each page targets a distinct intent | more intents covered | more intents, but several are crowded commodities |
| Risk | lowest | low to medium (audit; scope growth) | highest (commodity pages, shared-consumer breakage, more unverified browsers) |

### Recommendation: Option B, delivered in two releases

**Release 1 (P0, 9 tools):** JSON Compare, URL Parser & Encoder, JSONPath Tester, the Base64URL mode, the related links (and the pilot if approved). **Release 2 (P1, up to 13 tools):** List Comparer, UUID Generator, JSON ⇄ CSV, JSON Schema Validator (only after its audit), and the two low-risk enhancements (Text Diff options, JSON Formatter indentation); each P1 tool needs its own specification and a go decision after Release 1 is verified.

Why B and not A or C: A is the smallest set that passes every gate but leaves obvious workflows (set comparison, identifiers, data conversion) to other sites for no stated reason; C adds five commodity tools whose scores sit at 54 to 56 with differentiation of 1 to 3, which the rulebook treats as the pattern to avoid (rule 1.2, counts are not a goal). B's 13 is the number of tools that **passed the gates with a score of 59 or more**, not a target; if the Schema audit fails the answer is 12, and if P1 evidence weakens it can stay at 9.

## 2. Scope table (recommended option B)

| Group | Items | Status |
| --- | --- | --- |
| Preserve unchanged (6) | JSON Formatter & Validator, Unix Timestamp Converter, Text Diff, JWT Decoder, Cron Expression Explainer, Base64 Encoder & Decoder | Existing, published; routes, engines and modules unchanged except where an enhancement below is approved |
| Existing enhancement, P0 (1 + metadata) | X1 Base64URL mode (needs approval to reverse spec-27 decision); E1 reciprocal related links (catalog metadata only) | PROPOSED |
| New P0 tools (3) | C1 **JSON Compare** (`json-compare`), C4 **URL Parser & Encoder** (`url-parser`), C2 **JSONPath Tester** (`jsonpath-tester`) | PROPOSED |
| Shared P0 | S1 shared clipboard module (new tools only); S2 optional shared JSON tree and path module; S3 Developer Tools related-tools pilot (own approval, rule 4.8) | PROPOSED |
| P1 new tools (4) | C19 List Comparer, C6 UUID Generator, C5 JSON ⇄ CSV, C3 JSON Schema Validator (audit first) | PROPOSED, lighter sketches below |
| P1 enhancements (2) | X2 Text Diff options (ignore case, show only changes); X3 JSON Formatter indentation choice | PROPOSED |
| P2 backlog | C13 Unicode Inspector, C14 case/text cleanup, C7 Hash, C10 XML, C20 Number Base; X4 tree view, X5 Base64 file input, X6 Cron zone display, X7 JWT per-claim copy | Backlog, no requirements |
| Deferred | C8 cURL, C9 YAML / JSON ⇄ YAML, C16 HTTP status reference, C21 SQL, Markdown, certificate, GZIP | Insufficient evidence or a dependency decision |
| Rejected / out of scope | C15 Regex Tester (**binding exclusion**), C17, other sections' tools | Not proposed |

## 3. Binding exclusions and protected decisions

Regex Tester stays excluded (`docs/tool-pack-factory.md` line 275, `docs/ecosystem-review/02-PENDING-AND-DEFERRED-INVENTORY.md` line 48). Currency, Password Generator and the other factory exclusions stay. Cron Explainer's cronie-only, UTC-only scope and JWT's "decoding is not verification" statement are preserved. The Time Tools related-tools pilot is preserved unchanged.

## 4. Expected user workflows

1. **Compare two API responses:** JSON Compare gives a short list of paths that differ, copyable, with an optional patch.
2. **Find a value in a large payload:** JSONPath Tester shows the matched nodes with exact paths and, for an empty result, the segment that emptied it.
3. **Debug a request URL:** URL Parser & Encoder splits a URL into parts, lists decoded query parameters in order (repeated keys kept), and encodes or decodes a component without a server round trip.
4. **Read a token or an encoded value:** Base64 (with the URL-safe mode) → JWT Decoder → Unix Timestamp Converter, as links. **No data is transferred between tools.**
5. **Debug a payload end to end (links only):** JSON Formatter → JSONPath Tester → JSON Compare.

## 5. Explicit non-goals for the P0 tools

No JSON repair, JSON5, comments or trailing commas (strict stays strict, rule 8.4); no file upload or download in v1; no tree editor; no history, accounts, sharing link or server; no user regular expressions in JSONPath v1 (DEC-JP-1); no key matching, move detection or three-way merge in JSON Compare v1; no fetching, following or opening of any URL in the URL tool; no schema validation; no change to an existing tool other than the approved enhancements; no new section, header item or category; no articles (opportunities are recorded only).

## 6. P1 sketches (lighter than requirements; each needs its own audit and a go decision)

| Candidate | Job | Key design constraints | Open research before a spec |
| --- | --- | --- | --- |
| C19 List Comparer | compare two lists of lines: only in A, only in B, in both, duplicates, with options for case and trimming that are **visible**, never silent | set semantics defined exactly (multiset or set, order of output); limits; no network; reference: Python sets | decide the option set; relation to Text Diff on the page |
| C6 UUID Generator | generate UUID v4 and v7 (and nil), single or bulk (stated maximum), formatting (case, braces, hyphens) | v4 from `crypto.getRandomValues` / `randomUUID`; v7 per RFC 9562 with a monotonic counter rule stated; the page says a UUID is an identifier, not a secret; never claims uniqueness guarantees beyond the RFC | v7 clock and counter behaviour; bulk limit |
| C5 JSON ⇄ CSV | arrays of objects to CSV and back with an explicit nested-value rule | RFC 4180 quoting; **formula-injection policy** (SEC-011); delimiter choice; no silent flattening | the nested rule; comparison with E8 |
| C3 JSON Schema Validator | validate a document against a schema and list every error with instance path and keyword | one draft first (2020-12); no remote `$ref` (refused with a message); **library audit first** (licence, size, CSP-safety, conformance, maintenance) | the audit; error wording |
| X2 Text Diff options | ignore case; show only changes with N lines of context | defaults unchanged; options visible; result states what was ignored | context semantics; how the unified-diff copy changes |
| X3 JSON Formatter indentation | choice of 2 spaces (default), 4 spaces, tab | the default output is byte-identical to today's; an option is never silent | none |

## 7. Related-tools proposal (links only, same section, rules 4.2 and 6.3)

| Page | Related, in order | Reason |
| --- | --- | --- |
| JSON Formatter | JSONPath Tester, JSON Compare, Unix Timestamp Converter | JSON workflow; keep the existing link |
| JSON Compare | JSON Formatter, Text Diff | format first; Text Diff is the plain-text alternative |
| JSONPath Tester | JSON Formatter, JSON Compare | format, then query; compare |
| URL Parser & Encoder | Base64 Encoder & Decoder, JSON Formatter | query values are often Base64 or JSON |
| Base64 Encoder & Decoder | JWT Decoder, JSON Formatter, URL Parser & Encoder | existing links plus URL-encoded Base64 |
| JWT Decoder | Unix Timestamp Converter, JSON Formatter | existing |
| Text Diff | JSON Formatter, JSON Compare | existing link plus the structural alternative |
| Unix Timestamp Converter | JWT Decoder, Cron Explainer | reciprocal of existing links |
| Cron Explainer | Unix Timestamp Converter | existing |

No cross-section list is proposed (a Cron Explainer ↔ Time Zone Converter link would cross sections, rule 4.2). The Time Tools pilot is unchanged.

## 8. Dependencies between items

S1 (clipboard) and, if approved, S2 (JSON tree) precede C1 and C2; C4 is independent; X1 is independent and the smallest; E1 and the pilot need the new tools for their final lists; every P1 item needs its audit. Order in 10.
