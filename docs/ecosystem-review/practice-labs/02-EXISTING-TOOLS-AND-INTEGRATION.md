# 02 Existing tools and integration audit

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

**Owner decision recorded 2026-10-28:** the Option B scope baseline in doc 18 was approved with conditions. Only what doc 18 records as approved is approved; everything else in this document remains a proposal for Master Prompt 2 to develop. No implementation has started.

Practice Labs & Smart Flashcards ecosystem, Prompt 1 of 3 (research and requirements). Written 2026-10-28. Nothing here is a rule, a build queue or an approval; the rulebook is `docs/product-decision-rules.md`.

Evidence labels used throughout: **OBSERVED** (seen on a public page or in the repository this session), **CLAIMED** (stated by the source about itself, not verified), **INFERRED** (reasoned from observations), **UNKNOWN** (not established). **VERIFIED/HYPOTHESIS** follow rulebook 12.

## Purpose

To decide, tool by tool, whether a learning connection is genuinely useful, supported by what the tool really does, allowed by the navigation rules, and not a duplicate. The rulebook says not to assume every developer tool needs a lab and not to add pages to raise a count (rules 1.2, 1.6, 4.2).

## What each existing tool really supports (OBSERVED from its specification and engine)

| Tool (id) | What the engine does | Standard or limit stated | Reusable engine API (OBSERVED) |
|---|---|---|---|
| JSON Formatter and Validator (`json-formatter`) | Strict RFC 8259 parsing, errors with line and column, format and minify | RFC 8259 only; rejects trailing commas, single quotes, unquoted keys, comments, NaN, Infinity, undefined, leading zeros; depth 500; 2,000,000 characters | `validate`, `analyze`, `locate`, `contextOf` in `json-engine.js`; no DOM use in the engine |
| JSON Compare (`json-compare`) | Structural comparison of two JSON documents, RFC 6902 patch | strict JSON; 1,000,000 characters per side | `json-compare-engine.js`, `json-tree.js` |
| JSONPath Tester (`jsonpath-tester`) | RFC 9535 JSONPath evaluation with Normalized Paths | RFC 9535 except `match()` and `search()`; 715-test compliance suite kept in `tests/fixtures`; query 1,000 characters; work bound 4,000,000 steps; node bound 100,000 | `evaluateQuery(documentText, queryText)`, `parseQuery` |
| JWT Decoder (`jwt-decoder`) | Decodes header and payload; never verifies a signature | decode only; no keys; no JWE | `jwt-engine.js` |
| Base64 Encoder/Decoder (`base64-encoder-decoder`) | RFC 4648 section 4 Base64, strict decoding | RFC 4648 vectors tested | `encodeText`, `decodeBase64` |
| URL Parser and Encoder (`url-parser`) | Parses a URL and percent-encodes | RFC 3986 based | `url-engine.js` |
| Unix Timestamp Converter (`unix-timestamp-converter`) | Converts between epochs and dates | ranges stated in the tool | `timestamp-engine.js` |
| Cron Expression Explainer (`cron-expression-explainer`) | Parses a five-field Cronie crontab expression, explains it, lists next runs | Cronie five fields; input 256 characters | `parseCron`, `nextRuns(parsed, nowMs, count)`, `matchesDate`, `explainCron` in `cron-engine.js` |
| Text Diff (`text-diff`) | Line and character diff | stated limits | `text-diff-engine.js` |
| JSON and CSV Converter (`json-csv-converter`) | Converts between JSON and CSV | stated limits | `assets/js/tools/json-csv/` |
| UUID Generator (`uuid-generator`) | Generates UUIDs | stated versions | `uuid-engine.js` |
| List Comparer (`list-comparer`) | Compares two lists | stated limits | `list-engine.js` |

## Connection assessment

| Concept the learner studies | Existing tool that demonstrates it | Supports the operation? | Genuinely useful? | Navigation rule | Duplication risk | Safe to reuse the engine? | Decision |
|---|---|---|---|---|---|---|---|
| Valid JSON syntax and how to repair errors | JSON Formatter and Validator | Yes: strict validation with positions | Yes: learners fix real faults and see the validator's own message | Same section if the lab sits in Developer Tools: a curated related link is allowed (rule 4.8) | Low: the tool validates, the lab teaches and checks a repair | Yes: pure module, no DOM | **Connect: JSON Error-Fixing Lab** |
| Selecting data with JSONPath | JSONPath Tester | Yes: returns exact Normalized Paths | Yes: a path set is an objective answer, and any equivalent query is accepted | Same section | Low | Yes: `evaluateQuery` is pure, with work bounds | **Connect: JSONPath Challenge Lab** |
| Writing a cron schedule | Cron Expression Explainer | Yes: parses and lists runs | Yes: a wrong answer can be shown the runs it actually produces | Same section | Low | Yes: pure, input capped at 256 characters | **Connect: Cron Challenge Lab** |
| Comparing JSON | JSON Compare | Yes | Limited: little to practise beyond using the tool | Same section | High (a lab would repeat the tool) | n/a | No lab (item 4 is P2); cards may link to the tool |
| Reading a JWT | JWT Decoder | Yes (decode only) | Moderate, but only with invented sample tokens and a firm "not verified" framing | Same section | Medium | Yes | P2 (item 13); cards link to the tool |
| Base64 and percent-encoding | Base64, URL Parser | Yes | Low as a lab; useful as cards | Same section | High | Yes | Cards only (items 6, 7) |
| Epoch time | Unix Timestamp Converter | Yes | Low as a lab | Same section | High | Yes | P2 (item 33) |
| Text and list comparison, UUIDs, JSON and CSV conversion | Text Diff, List Comparer, UUID Generator, JSON and CSV Converter | Yes | No learning task that the tool does not already complete | Same section | High | n/a | **No lab** |
| HTTP, APIs, testing, accessibility concepts | none | n/a | Yes, as revision cards | n/a | none | n/a | Smart Flashcards decks with optional tool links |

Result: of the 12 existing Developer Tools, **three** have a genuinely useful teaching connection (JSON Formatter, JSONPath Tester, Cron Explainer); **five** (JSON Compare, JWT Decoder, Base64, URL Parser, Unix Timestamp) are better served by cards that link to the tool; the remaining **four** (Text Diff, List Comparer, UUID Generator, JSON and CSV Converter) need nothing. No separate practice page is proposed for any tool merely to add a page.

## Navigation and catalog implications

- Same-section placement keeps related lists legal: a lab can name its tool and the tool can name the lab in curated `relatedTools`. Editing an existing tool's curated list is a small catalog edit (rulebook 9.3 allows registration and catalog changes); it is optional and is recorded as an integration decision in doc 09, not assumed.
- If the labs were in a different section than the tools they teach, a related list could not link them (rule 4.2). They could only be linked from page text (as rule 4.9 allows for neighbouring sections), which is weaker. This is one of the reasons doc 09 recommends the Developer Tools section.
- Lab to flashcard links are within the same new tools; they carry a topic id in a fragment, never visitor data.
- Search: aliases must be true and specific (rule 5.3), and the existing queries `json`, `jsonpath` and `cron` must still lead their existing tools (rule 5.2). Proposed aliases are listed in doc 09.

## Shared engines that can be reused safely

JSON validator (`validate`), JSONPath (`evaluateQuery`), cron (`parseCron`, `nextRuns`). They are imported unchanged. A reviewed minimal export may be needed if an engine hides a function the lab needs; that is the only permitted touch (rulebook 9.3, FR-INT-003). None of the labs needs to modify an engine's logic.

## What was not checked

The tools were read from their specifications and exported function lists; the engines' internals were not re-audited here (they were verified in their own packs). Whether `evaluateQuery` and `parseCron` return structures that are convenient for a path-set comparison is an implementation detail for Prompt 2 and is covered by FR-JPC-002 and FR-CRN-002.
