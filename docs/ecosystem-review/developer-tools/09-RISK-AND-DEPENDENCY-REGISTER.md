# 09. Risk and dependency register

PROJECT: ToolZenHub
ECOSYSTEM: Developer Tools
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASES: 0, 1 AND 2 (Ecosystem 2.0 revision, 2026-10-26)
PURPOSE: Research and requirements baseline

Likelihood is **uncertainty-based judgment**, not a measured probability. Severity: High (wrong or unsafe output, data exposure, a frozen tab), Medium (a feature fails safely or a test breaks), Low (cosmetic or wording).

## 1. Risks

| ID | Risk | Tools | Likelihood | Severity | Detection | Mitigation | Fallback | Release impact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RISK-DT-01 | Number equality is wrong (floats used, exponents mishandled, `-0`, huge integers) | JC | Medium | High | AC-JC-011, 012, 013 against Python `decimal` | compare digits and exponent exactly, never via `Number` | refuse numbers whose exponent exceeds a stated bound with a message | blocks release |
| RISK-DT-02 | Patch is wrong for arrays, escaped pointers or ordering | JC | Medium | High | AC-JC-025 to 028 with an independent applier and a seeded random corpus | emit removals high-to-low; self-check before offering (FR-JC-019) | withhold the patch, keep the list | blocks the patch feature only |
| RISK-DT-03 | A hostile exponent (`1e999999999`) or deep nesting exhausts CPU or memory | JC, JP | Medium | High | AC-JC-013, AC-JP-020 | normalize to digits and an exponent without expanding; length and depth checks before and during parsing | lower the limits | blocks release |
| RISK-DT-04 | JSONPath conformance gaps (a case the standard defines differently from the implementation) | JP | Medium | High | RFC tables, compliance suite (licence unknown, OPEN-03) | implement from the RFC ABNF; test every RFC table; run the suite as a dev reference if licensed | state the exclusions precisely; never claim full conformance | blocks "conformant" wording, not the tool |
| RISK-DT-05 | Order of nodes for descendant segments or nested filters differs from the standard | JP | Medium | Medium | AC-JP-004 to 006 and suite cases | follow RFC 9535 §2.5.2 ordering rules; golden cases | document any ordering caveat | fix before release |
| RISK-DT-06 | The main thread freezes on a 1,000,000-character input | JC, JP | Medium | Medium | recorded timing test (NFR-002) | auto-run threshold; working-set cap; Compare/Evaluate button | chunking or a Worker chosen in architecture (OPEN-02); lower limits | decide before release |
| RISK-DT-07 | Unsafe rendering of keys or values | JC, JP | Low | High | AC-JC-037, AC-JP-027 | `textContent` only; no HTML building from user data | none needed if tests pass | blocks release |
| RISK-DT-08 | Prototype pollution through keys | JC, JP | Low | High | AC-JC-038, AC-JP-028 | `Map` / null-prototype objects | none needed | blocks release |
| RISK-DT-09 | A note or warning misleads (duplicate keys last-wins, precision) | JC | Low | Medium | AC-JC-017, 018 | visible notes included in copies; page states the rule | switch DEC-JC-1 to refuse | fix wording |
| RISK-DT-10 | The result list is not accessible (colour-only, no headers) | JC, JP | Medium | Medium | AC-JC-020, AC-JP-018, A11Y checks | words for kinds; table semantics; live region | simplify to a list | fix before release |
| RISK-DT-11 | New entries break hardcoded counts in older specs | shared | High (already seen in the Time Tools program) | Medium | AC-SHR-001 | update all listed consumers in the same phase | none | blocks the phase until green |
| RISK-DT-12 | New aliases steal an existing intent in search | shared | Medium | Medium | AC-SHR-002 | alias list in SH-003; two-way tests | remove the alias | fix before release |
| RISK-DT-13 | The page overstates conformance ("full RFC 9535") while `match()`/`search()` are missing | JP | Medium | Medium | AC-JP-011, 026 | page wording fixed by requirement | add the functions later | fix before release |
| RISK-DT-14 | Adding regex functions later reintroduces ReDoS | JP | Low | High | design review | Worker with time box and I-Regexp check (SEC-004) | keep refusing | future |
| RISK-DT-15 | The RFC or its errata change a rule after the spec is written | JP | Low | Medium | re-read the RFC and errata when the Tool Pack is written | cite section numbers; confirm OPEN-04 | adjust the pack | pre-code |
| RISK-DT-16 | Unicode edge cases (lone surrogates, normalization, BOM) | JC, JP | Medium | Medium | AC-JC-004, 015, 016, AC-JP-015 | explicit rules in 05 | note instead of fail where the standard allows | fix before release |
| RISK-DT-17 | Related links cross a section or imply data transfer | shared | Low | Medium | AC-REL-003, AC-SHR-004 | catalog-only relations; filter by section | remove the link | fix before release |
| RISK-DT-18 | Safari or Firefox behave differently | all | Medium | Medium | not testable here (no device) | standard JS only; owner device checks | document as unverified | preview risk |
| RISK-DT-19 | Scope creep (key matching, regex, upload, trees) | all | Medium | Medium | review against 04 section 3 | exclusions list | defer the item | schedule |
| RISK-DT-20 | Library licence or size (C3 only) | C3 | High | Medium | audit before code | pinned version; licence and size recorded | defer C3 | none for P0 |
| RISK-DT-21 | Stale research (the market moves, competitors change) | all | Medium | Low | revisit before each pack | re-read competitors at the pack stage | adjust scope | none |
| RISK-DT-22 | Test runs exhaust the 4 GB laptop | all | Medium | Low | out-of-memory kills | one worker, focused specs, sequential runs | split runs | schedule |
| RISK-DT-23 | The URL tool misreads the WHATWG URL Standard versus RFC 3986 (backslashes, stripped whitespace, default ports, encode sets) and tells the user something wrong | UP | Medium | High | AC-UP-003, 005, 019 with hand-derived and Python-agreeing expectations (NFR-016) | state the parser authority on the page; pin every disagreement case by hand; re-read the URL Standard when the pack is written (OPEN-08) | narrow the encoder to the RFC 3986 operations only | blocks release of the affected feature |
| RISK-DT-24 | The "what the parser changed" list is wrong or incomplete | UP | Medium | Medium | AC-UP-005, 009 | a closed list of items detected by deterministic component comparison; no free-text claims | show the normalized URL without the list | fix before release |
| RISK-DT-25 | The page claims nothing is sent but something leaks (an image, a favicon, a link prefetch) | UP, all | Low | High | AC-UP-016, AC-UP-031 network recorder | never render a URL as a link or image; the no-network test is a release gate | remove the privacy sentence until the test passes | blocks release |
| RISK-DT-26 | A pasted `javascript:` or `data:` URL executes or is opened | UP | Low | High | AC-UP-013 (no `href` built from input) | text-only rendering; module scan for `location`, `open`, `fetch`, `href` assignment (SEC-013) | none needed if tests pass | blocks release |
| RISK-DT-27 | The Base64URL mode changes the existing tool's behaviour or breaks its tests beyond the single hint | X1 | Medium | Medium | AC-B64-001, 005, 009 | default alphabet unchanged; the one hint wording change is declared; the JWT tool is untouched | revert the enhancement | fix before release |
| RISK-DT-28 | The demand evidence is missing or blocked (no Trends, no Stack Overflow, no Search Console), so priorities rest on hypotheses | all | High | Medium | stated in 02 section 8 | keep P0 small and each tool independently useful; revisit with Search Console data after the preview and production period | reorder P1 | none for P0 |
| RISK-DT-29 | A competitor's page text changes or a claim (for example urlencoder.org's server-side encoding) is no longer true | UP | Medium | Low | re-read before the pack and before any marketing wording | the page never mentions competitors; the claim is used only to justify priority | drop the differentiation claim | none |
| RISK-DT-30 | The P1 pack count grows faster than verification capacity on a 4 GB laptop | P1 | Medium | Low | schedule review after Release 1 | one pack at a time; focused tests; a go decision per P1 tool | stay at Release 1 (9 tools) | schedule |

JC = JSON Compare, JP = JSONPath Tester.

## 2. Open technical items (unresolved)

| ID | Question | Needed before |
| --- | --- | --- |
| OPEN-01 | Share a JSON tree module between the two tools, or let each own its parser | architecture phase |
| OPEN-02 | Is a Worker or chunking needed for 1,000,000-character inputs (depends on the measured timing) | JC and JP specs |
| OPEN-03 | The JSONPath compliance suite's licence (not visible on the page read) and whether its cases may be copied into the repo | JP spec |
| OPEN-04 | Exact whitespace rules at the start and end of a query (RFC ABNF and the suite) | JP spec |
| OPEN-05 | The precise ordering and result rules for descendant segments and for filter comparisons involving missing members (RFC 9535 §2.3.5.2 and §2.5.2) | JP spec |
| OPEN-06 | Whether to approve the Developer Tools related-tools pilot (rule 4.8) | integration pack |
| OPEN-07 | The shared announcer: copy the Time Tools pattern into each new tool, or share a helper | architecture phase |
| OPEN-08 | Re-read the URL Standard's `application/x-www-form-urlencoded` serializer and the component percent-encode set to confirm FR-UP-014 (for example `~` becoming `%7E`) | URL tool spec |
| OPEN-09 | Licence of the web-platform-tests URL test data and whether any cases may be committed; otherwise use hand-derived and Python references only | URL tool spec |
| OPEN-10 | Owner approval to change the one existing Base64 hint (FR-B64-005) and to reverse the spec-27 "out of V1" decision | Base64URL pack |
| OPEN-11 | UUID v7 timestamp and counter behaviour per RFC 9562 (the unread tail of the RFC) | P1 UUID spec |
| OPEN-12 | List Comparer option set and set-versus-multiset semantics | P1 List Comparer spec |

## 3. Dependencies between items

DP-0 (clipboard module, optional JSON tree, spec writing, closing OPEN-03, 04, 05, 08, 09) precedes DP-1 to DP-3. DP-1 and DP-2 are independent except for the optional shared tree; DP-3 (URL Parser & Encoder) and DP-4 (Base64URL mode) are independent of them and of each other, and DP-4 needs the owner's approval to reverse the spec-27 decision (OPEN-10). DP-5 (related metadata, the pilot if approved, search aliases, final checkpoint) needs DP-1 to DP-4 for its final lists. P1 items each depend on their own audit (C3: library audit; C5: nested-value rule; C6: OPEN-11; C19: OPEN-12). No P0 item depends on a backend, an external API or a paid service.

## 4. Browser and data-processing limits that shape the design

Very large inputs are bounded by the limits in 05; the browser's JavaScript string size and memory are the hard ceiling; `crypto`-dependent features (C7) are secure-context only and are not in P0; clipboard writes may be refused and are handled by the fallback; real-device behaviour is unverified until the owner checks it.
