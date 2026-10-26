# 06. Nonfunctional and security requirements

PROJECT: ToolZenHub
ECOSYSTEM: Developer Tools
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASES: 0, 1 AND 2 (Ecosystem 2.0 revision, 2026-10-26)
PURPOSE: Research and requirements baseline

Applies to the three P0 tools (JSON Compare, JSONPath Tester, URL Parser & Encoder), the Base64URL enhancement and, as defaults, to any later Developer Tool. IDs: `NFR-nnn`, `SEC-nnn`. Tool-specific limits are in 05 and are not generalized: the limits differ on purpose.

## 1. Nonfunctional requirements

| ID | Area | Requirement |
| --- | --- | --- |
| NFR-001 | Correctness | Each engine is a pure module (no DOM, storage, network, clock or randomness) checked by a banned-token scan in its unit test, as the Time Tools engines are. Expected results come from an independent method (rule 8.2): for JSON Compare, hand-derived goldens, the property "applying the generated patch to the first document yields the second" evaluated by a **separate** minimal patch applier written in the test, and a Python `json`/`decimal` reference for the number cases; for JSONPath, the RFC 9535 §1.5 Table 2 and §2.7.1 Table 18 expectations and, if its licence permits, the JSONPath compliance suite run as a dev-time reference |
| NFR-002 | Performance | Limits are those in FR-JC-004, FR-JC-016, FR-JC-020, FR-JP-012, FR-JP-016 and FR-JP-017. Above the auto-run size nothing runs until the user asks. A timing measurement on a 1,000,000-character fixture is **recorded** during development (as the formatter's tests do); no millisecond guarantee is promised on the page. If a measured main-thread block exceeds one second, the architecture phase must choose chunking or a Worker; this is an open item (OPEN-02 in 09) |
| NFR-003 | Browser support | Current evergreen Chrome, Edge, Firefox and Safari; features used are ES modules and standard JS only (no `Array.prototype.group`, no `Uint8Array.toHex`). **Verified in this program only in Chrome (headless, desktop and mobile emulation)**; Safari, Firefox and real Android are unverified until the owner confirms |
| NFR-004 | Mobile | No horizontal page scroll at 320, 360 and 390 px; stacked inputs; touch targets of at least 44 px; long values wrap or scroll inside their own region; text size at least 16 px in inputs (avoids iOS zoom) |
| NFR-005 | Accessibility | Every control has a visible label and a programmatic name; errors set `aria-invalid` and `aria-describedby`; results are in a polite live region with a clear-then-set pattern so repeats are announced; focus is visible; the result list has semantic structure; meaning is never colour-only; contrast follows the site tokens; Reset returns focus to the first field; no keyboard trap |
| NFR-006 | Privacy | All processing is in the browser; no network request is made by either tool after the page loads (asserted by a browser test that records requests); no cookie, `localStorage`, `sessionStorage` or IndexedDB write by the tool; no URL or hash state; analytics follow the existing consent rule and receive no user input |
| NFR-007 | Reliability | An exception inside an engine is caught at the module boundary and shown as a generic "This input could not be processed" with the input left intact; an engine never throws to the page for ordinary invalid input (it returns a typed result) |
| NFR-008 | Resource limits | Two trees of up to 1,000,000 characters each are the memory ceiling for JSON Compare; trees are released on Reset and when new input arrives; no unbounded recursion (depth 500 is enforced and recursion is iterative or depth-guarded) |
| NFR-009 | Maintainability | One engine file per tool plus one shared JSON-tree module if the architecture phase approves it (S2 in 08); no new dependency without the audit in 09; the module follows the existing contract; no generic framework layer (rule 9.4) |
| NFR-010 | Dependencies | **Zero new runtime dependencies** for P0. Any later dependency (for example for C3) needs a recorded audit of licence, size, CSP-safety, maintenance and conformance before code |
| NFR-011 | Usability and visual consistency | Reuse the existing tool page layout, field, result and button styles; no new colours outside the tokens; the page reads correctly before the script runs (the static HTML carries the title, the h1 and the help content) |
| NFR-012 | Content quality | Real explanation, exact rules, a computed example and honest limits; no keyword stuffing; no claim of being best, fastest or 100% accurate; the claims "runs in your browser" and "nothing is uploaded" are kept narrow and true |
| NFR-013 | Error recovery | Every error state is recoverable by editing the input; no state requires a reload |
| NFR-014 | Large-output safety | Rendering is capped (1,000 rows) and truncation is stated; long values are truncated for display only, never in copied text |
| NFR-015 | Tool-specific limits | Limits differ on purpose and are listed in section 4; none is generalized to another tool. Each limit is a **proposed acceptance threshold** to be validated by measurement during implementation, not a measured promise |
| NFR-016 | Independent reference, URL tool | The URL tool delegates parsing to the browser's `URL`, so its expected values must **not** come from the browser: use hand-derived cases from the URL Standard and RFC 3986, and a Python `urllib.parse` reference only for cases where the two standards agree (the disagreement cases, such as backslashes and stripped whitespace, are pinned by hand and documented). The web-platform-tests URL test data may serve as a dev-time reference if its licence permits (OPEN-09) |
| NFR-017 | Independent reference, Base64URL | RFC 4648 section 10 vectors, plus Python `base64.urlsafe_b64encode` / `urlsafe_b64decode` and a round-trip property over a seeded corpus; the existing standard-alphabet tests must pass unchanged except the one hint-wording assertion (FR-B64-005) |
| NFR-018 | Browser API use | Use the `URL` constructor inside `try/catch`; do **not** rely on `URL.canParse` or `URL.parse` (uneven support, E12) |
| NFR-019 | Local processing after load | After the page and its scripts load, every tool completes its work with no network access; no service worker or offline cache is proposed |
| NFR-020 | Dependency licensing | **Zero new runtime dependencies** in P0. Any dev-time reference file (a test suite, a data set) has its licence recorded before use and is kept out of the shipped site |
| NFR-021 | Trustworthy result explanations | Every result says what was and was not done: the URL tool does not check reachability or safety; JSON Compare does not validate a schema; JSONPath names its standard and its exclusion; the Base64 tool keeps "Base64 is not encryption"; no output uses words such as "secure", "verified" or "safe" for something that was not verified |

## 2. Security requirements

| ID | Threat | Requirement and control |
| --- | --- | --- |
| SEC-001 | HTML or script injection | All user text, all JSON strings and all object keys are written with `textContent` or as control values, never as HTML (rule 8.7). Tests include `<script>`, `<img onerror>`, quotes, backslashes and Unicode in keys, values and queries |
| SEC-002 | Prototype pollution | Parsed objects use `Map` or null-prototype objects; keys `__proto__`, `constructor`, `prototype` and `hasOwnProperty` are ordinary keys; nothing is merged into a shared object; a test compares `{"__proto__":1}` documents and confirms `Object.prototype` is unchanged afterwards |
| SEC-003 | Code execution | No `eval`, `new Function`, `setTimeout(string)`, dynamic `import()` of user data, or script-expression support in JSONPath; a unit test scans the engines for these tokens |
| SEC-004 | Regular-expression denial of service | No user-supplied regular expression is executed in v1 (DEC-JP-1). Any later reintroduction needs a time-boxed Worker and an I-Regexp syntax check, decided separately |
| SEC-005 | Memory and CPU exhaustion | Hard limits in 05 are enforced **before** parsing (length) and during parsing (depth); the working-set cap in FR-JP-016 stops a runaway descendant query; limits are stated on the page |
| SEC-006 | Sensitive data exposure | No URL state, no storage, no network, no logging of input; the pages carry the existing "nothing is uploaded" statement only if the network test passes; copying is user-initiated only |
| SEC-007 | Clipboard handling | Copy only on a user action; on failure show a selectable text area, never silently succeed (the existing tools' pattern); no read of the clipboard |
| SEC-008 | Malicious or malformed structured data | Deep nesting, very long strings, huge numbers (`1e999999`), duplicate keys, lone surrogates and invalid UTF-16 are handled per 05 without a crash; huge exponents are processed as digits and exponent without expanding the full number (see RISK-DT-03) |
| SEC-009 | Misleading output | Never imply validation beyond what was done: JSON Compare does not validate against a schema; JSONPath names the standard and its single exclusion; the existing JWT page's "not verified" statement is untouched; no link transfers a token or any text between tools |
| SEC-010 | Link safety | Related links are same-origin relative routes from the catalog only; no user text becomes a link or a URL |
| SEC-011 | CSV formula injection (P1 only, recorded for C5) | Any future CSV output must state and apply a policy for cells beginning with `=`, `+`, `-`, `@`, tab or carriage return; not a P0 requirement |
| SEC-012 | Supply chain | Any future dependency is pinned to an exact version, licence-checked and size-checked; a downloaded dev reference (for example the JSONPath suite) is treated as untrusted data, kept outside the shipped site and not executed |
| SEC-013 | Navigation and execution via URLs | The URL tool renders a URL only as text (never as a link or an image source), never fetches, opens, previews or pings it, and shows `javascript:`, `data:` and `vbscript:` URLs with a visible warning; no `location`, `window.open`, `fetch` or `<a href>` is built from user text (a unit test scans the module for them) |
| SEC-014 | Secrets in URLs | A URL may hold tokens or credentials: no URL or hash state, no storage, no automatic transfer to another tool, copy only on a user action; a credentials warning is shown (FR-UP-009) |
| SEC-015 | Invalid text and bytes | Lone surrogates cannot be UTF-8 encoded and invalid UTF-8 cannot be decoded: both are errors with positions; **no replacement character is ever substituted** (rule 8.5) |
| SEC-016 | Deceptive hosts | Non-ASCII host names are shown in their `xn--` form with a warning so a look-alike name is visible; the tool does not resolve or classify hosts |
| SEC-017 | Base64URL | Decoded output is only ever written as text (`textContent` or a control value); invalid UTF-8 is an error, not a lossy decode; the page never implies Base64 protects data |
| SEC-018 | Enhancement safety | The Base64URL mode and the related links change no existing tool's validation, limits, security behaviour or storage; any existing assertion changed is listed in the pack |

## 3. Privacy decision (explicit)

No feature of the P0 scope sends user input externally. A feature that would (for example resolving a remote `$ref` for C3, or fetching a URL for C4) is **not proposed**, and would need a separate explicit product decision (rule 8.8).

## 4. Tool-specific limits (proposed acceptance thresholds)

| Tool | Input limits | Output and work limits | Auto-run rule |
| --- | --- | --- | --- |
| JSON Compare | 1,000,000 chars per side; depth 500 | 1,000 rows rendered, all copied; a 1,000,000-char timing is recorded, not promised | automatic up to 100,000 combined chars, otherwise the Compare button |
| JSONPath Tester | document 1,000,000 chars, depth 500; query 1,000 chars | 1,000 rows rendered; 100,000 working nodes between segments | automatic up to a 200,000-char document, otherwise Evaluate or Enter |
| URL Parser & Encoder | parse 100,000 chars; encode/decode 1,000,000 chars; build 100 rows | 500 parameter rows rendered | automatic (small inputs) |
| Base64 (existing, unchanged) | encode 1,000,000 bytes; decode 1,333,336 chars | unchanged | unchanged |

**Why these numbers:** each is derived from the tool's work, not from a uniform rule. The JSON limits are half the formatter's 2,000,000 because two trees are held at once; the URL limits reflect that real URLs are short (a 100,000-character URL is already abnormal) while encode and decode are plain text transforms; the Base64 limits are the existing, approved ones. The 100,000 and 200,000 auto-run thresholds are proposals to be checked against measured timings on the 4 GB machine (OPEN-02).
