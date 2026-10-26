# 05. P0 functional requirements

PROJECT: ToolZenHub
ECOSYSTEM: Developer Tools
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASES: 0, 1 AND 2 (Ecosystem 2.0 revision, 2026-10-26)
PURPOSE: Research and requirements baseline

All requirements are PROPOSED. IDs are stable: `FR-JC-nnn` (JSON Compare), `FR-JP-nnn` (JSONPath Tester), `FR-REL-nnn` (existing-tool metadata enhancement), `FR-UP-nnn` (URL Parser & Encoder, section D) and `FR-B64-nnn` (Base64URL mode, section E). Shared and nonfunctional IDs are in 06 and 08; acceptance criteria are in 07. "Must" is a requirement; a **decision** (DEC-) is a choice made here that the owner may reverse.

Common conventions for the new tools: user text is data, never markup (rule 8.7); nothing is sent anywhere and nothing is stored; no URL or hash state; an invalid input is never altered; the result region is a polite live region; Reset returns focus to the first field; the page follows the existing tool page contract (breadcrumb first, help sections, FAQ, trust card).

---

## A. JSON Compare (C1)

### A.1 Identity

| Item | Value |
| --- | --- |
| Name / slug / route | JSON Compare / `json-compare` / `/tools/json-compare/` (proposed) |
| Section | Developer Tools, flat (no category) |
| Audience | Developers and QA engineers comparing two API responses, fixtures, configs or logs that are JSON |
| Problem | A line diff reports noise when key order, whitespace or number formatting differ, and cannot say that `1` became `"1"` |
| Outcome | A short, exact list of what is added, removed, changed or changed in type, with the path of each, and an optional RFC 6902 patch |
| Differentiation (stated, not marketed) | strict grammar with located per-side errors; exact number equality; duplicate-key and precision notes; type changes named; accessible text results (not colour-only); patch generated and self-checked |
| Related existing tools | JSON Formatter, Text Diff |

### A.2 Functional requirements

| ID | Requirement |
| --- | --- |
| FR-JC-001 | Two labelled multi-line inputs, "First JSON" and "Second JSON". Spellcheck, autocorrect and autocapitalize off. Pasted text is kept exactly (no trimming of the stored value) |
| FR-JC-002 | Each input is parsed with the **strict RFC 8259 grammar** (no comments, no trailing commas, no single quotes, no NaN). A parse error names the side, the line, the column and a message in the same wording style as the JSON Formatter; nothing is compared while either side is invalid; both inputs stay intact and editable; if both are invalid both errors are shown |
| FR-JC-003 | Empty state: when a side is empty (after trimming whitespace for this test only) the tool shows "Paste the second JSON to compare." naming the empty side, not an error style |
| FR-JC-004 | Limits (DEC-JC-2): at most **1,000,000 characters per side** and nesting depth at most **500**. Over either limit: a specific message naming the side and the limit, nothing is compared, nothing is truncated |
| FR-JC-005 | Objects are compared as **unordered** sets of members; a different key order is never a difference. The page states this |
| FR-JC-006 | Arrays are compared **by position** by default. Two arrays are compared element by element up to the shorter length; extra elements in the second are "added", in the first "removed" |
| FR-JC-007 | Optional checkbox "Ignore array order", default off. When on, each array is compared as a **multiset** of canonical element forms (canonical form: members sorted by key, numbers by exact value); the result lists removed and added elements only (no nested differences) and the patch output is disabled with the reason "A patch cannot express an ignored order" |
| FR-JC-008 | **Numbers** are equal when they have the same exact decimal value: `1`, `1.0`, `1e0` and `10e-1` are equal; `0.1` and `0.10` are equal; `-0` and `0` are equal; `1e400` equals `1` followed by 400 zeros; integers beyond 2^53 are compared exactly, **not** as floating point. Equality is computed from the digits, never via a double |
| FR-JC-009 | A difference in JSON **type** (object, array, string, number, boolean, null) is "type changed", never "changed". `1` versus `"1"` is a type change; `true` versus `1` is a type change; `null` versus `0` is a type change |
| FR-JC-010 | Strings are compared by Unicode code points exactly, with no normalization, case folding or trimming. If two strings differ but are canonically equivalent (NFC equal), the row adds the note "Differs only by Unicode normalization" |
| FR-JC-011 | **Duplicate keys** (DEC-JC-1): the last occurrence wins, as in `JSON.parse` and Python's `json.loads`. Each side that contains a duplicate shows a visible note naming the first few paths and the count; the notes appear above the result and are included in the copied text |
| FR-JC-012 | Numbers with more than 15 significant digits get a precision note on each side, as the JSON Formatter does; the comparison itself remains exact (FR-JC-008) |
| FR-JC-013 | Result summary (always the first line of the result): "No differences. Compared N values on each side." or "N differences: a added, r removed, c changed, t type changed." Counts are of leaf-level rows listed. When the arrays option is on the summary says so |
| FR-JC-014 | Result list: one row per difference with **kind written in words** ("Added", "Removed", "Changed", "Type changed"), the **path** as an RFC 9535 Normalized Path (for example `$['b'][2]`), the first value and the second value as compact JSON, each truncated for display at 200 characters with a visible "…" and a control to show the full value. The list is a real table (or list) with headers for assistive technology; kind is never conveyed by colour alone |
| FR-JC-015 | **Order of rows** is deterministic: depth-first in the order of the first document (objects by that document's key order, arrays by index); members present only in the second document follow their parent's other members in the second document's key order. Added and removed containers are one row each (the whole subtree), not one row per leaf |
| FR-JC-016 | At most **1,000 rows** are rendered; if there are more the result says "Showing the first 1,000 of N differences" and the copy actions still include all |
| FR-JC-017 | "Copy differences" copies the summary, notes and rows as plain text (one row per line: kind, path, first, second). If the clipboard is unavailable a selectable text area appears with the same text and a message; focus moves to it |
| FR-JC-018 | "Copy JSON Patch" copies an **RFC 6902** array of `add`, `remove` and `replace` operations with **RFC 6901** pointers (`~0` for `~`, `~1` for `/`) that transform the first document into the second when applied in order. Array removals are emitted from the highest index to the lowest so indices stay valid; array additions are emitted in ascending order. Disabled with a reason when "Ignore array order" is on |
| FR-JC-019 | **Self-check:** before the patch is offered, the tool applies it to the first document in memory and confirms it equals the second by FR-JC-008 rules. If the check fails the patch is withheld with the message "The patch could not be verified, so it is not offered." and the failure is treated as a defect |
| FR-JC-020 | Comparison runs automatically (debounced 300 ms) while the **combined** size of both inputs is at most 100,000 characters, and otherwise only when the user presses **Compare** (the button is always present and always works) |
| FR-JC-021 | "Swap" exchanges the two inputs and recomputes; "Reset" clears both inputs, notes, result and status and focuses the first field; "Example" fills both fields with a small pair that demonstrates one added, one changed and one type-changed value |
| FR-JC-022 | Status messages: parse state per side (valid / invalid) is announced politely; the summary is announced when a result is computed; errors are announced with the side name |
| FR-JC-023 | Keyboard: every control reachable by Tab in a logical order; Enter in a field never submits or clears; the Compare button works with Enter and Space; focus is visible |
| FR-JC-024 | Mobile: at a 320 px viewport the two inputs stack, no horizontal scroll of the page, long paths wrap or scroll inside the result region, controls are at least 44 px high |
| FR-JC-025 | No file upload, download, URL state or storage in v1 |
| FR-JC-026 | The page has: a how-to, the exact comparison rules (FR-JC-005 to FR-JC-012 in plain words), a worked example computed from the same engine, honest limits and an FAQ; no claim that the output is "the best" or "100% accurate" |

### A.3 Validation matrix (JSON Compare)

| Case | Required behaviour |
| --- | --- |
| Valid input | compared |
| Invalid input (either/both) | located error(s), side named, no comparison |
| Missing input (one side empty) | neutral prompt naming the side |
| Malformed (unterminated string, trailing comma, `NaN`, `'x'`, comments, BOM) | invalid per strict grammar; a leading U+FEFF is an error with a specific message (never silently stripped) |
| Boundary (exactly 1,000,000 chars; depth exactly 500) | accepted; 1,000,001 chars or depth 501 refused |
| Oversized | refused with the limit and the side |
| Unexpected characters (lone surrogate escapes `\ud800`, control characters in strings) | control characters are invalid per RFC 8259; an escaped lone surrogate is valid JSON and is kept and compared by code unit value, with a note that the string is not valid Unicode text |
| Unicode | astral characters and escapes (`😀` equals `😀`) compare equal after decoding |
| Whitespace | irrelevant outside strings |
| Encoding failures | not applicable (input is a JS string); clipboard failure handled by FR-JC-017 |
| Partial parsing | never: a document is compared only if the whole of it is valid |
| Unsupported features | JSON5, JSONC, NDJSON, multiple top-level values: reported as invalid with a hint |

### A.4 Worked example (also the Example loader)

First `{"a":1,"b":[1,2,3],"d":"x"}`, second `{"b":[1,2,4],"a":1.0,"c":true,"d":1}`.
Rows in order: `$['b'][2]` Changed 3 → 4; `$['d']` Type changed "x" → 1; `$['c']` Added true. Summary "3 differences: 1 added, 0 removed, 1 changed, 1 type changed." Patch: `[{"op":"replace","path":"/b/2","value":4},{"op":"replace","path":"/d","value":1},{"op":"add","path":"/c","value":true}]`. (`a` is equal by FR-JC-008.) Derived by hand from RFC 6902 and RFC 9535 §2.7.

---

## B. JSONPath Tester (C2)

### B.1 Identity

| Item | Value |
| --- | --- |
| Name / slug / route | JSONPath Tester / `jsonpath-tester` / `/tools/jsonpath-tester/` (proposed) |
| Section | Developer Tools, flat |
| Audience | Developers and QA engineers extracting values from JSON, writing API test assertions, or checking a query copied from a library |
| Problem | Query syntax varies between libraries; the standard (RFC 9535, 2024) now defines it, and an empty result gives no hint where the query stopped matching |
| Outcome | The exact nodes the standard says a query selects, each with its normalized path and value, and for an empty result the segment that emptied it |
| Differentiation | Conformance to a published standard, named; per-segment explanation; unsupported or non-standard syntax refused with a reason instead of guessed; accessible text results |
| Related existing tools | JSON Formatter; proposed JSON Compare |

### B.2 Functional requirements

| ID | Requirement |
| --- | --- |
| FR-JP-001 | Inputs: a multi-line "JSON document" field and a single-line "JSONPath query" field. The query field has no default value; a hint shows `$` as the start. Spellcheck, autocorrect and autocapitalize off |
| FR-JP-002 | The document is parsed with the strict RFC 8259 grammar; errors are located (line, column, message) and the input stays intact. The query is not evaluated while the document is invalid |
| FR-JP-003 | The query must be a **well-formed RFC 9535 query**: root `$`, segments with child `[...]`, shorthand `.name`, `.*`, descendant `..`, selectors name, wildcard, index (negative allowed), slice `start:end:step` (including negative step), filter `?expr` with `@`, `$`, comparison operators `== != < <= > >=`, logical `&& || !`, parentheses, existence tests, literals (string, number, `true`, `false`, `null`), and the functions `length()`, `count()` and `value()` |
| FR-JP-004 | **`match()` and `search()` are not supported in v1 (DEC-JP-1).** A query using them is refused with the message "match() and search() are not supported in this version." and the page says the tool implements RFC 9535 **except** these two functions. The tool must never claim full RFC 9535 conformance while they are missing |
| FR-JP-005 | A malformed query is never evaluated. The message gives the character position, a short description of what was found and what was expected, and shows the query with a caret. Implementation-specific syntax from other libraries (for example script expressions `[(@.length-1)]` and a bare `$..` with nothing after it; note `$.a.length` is valid and selects a member named `length`) is refused with the reason "not part of RFC 9535" |
| FR-JP-006 | Well-typedness per RFC 9535 is enforced: a function used with an argument of the wrong type, or a non-singular query used where a singular one is required, is an error with a message naming the function or operator |
| FR-JP-007 | Integers in an index or slice must be within ±(2^53 − 1) (the I-JSON range); outside it is an error, never a silent clamp |
| FR-JP-008 | Name selectors compare by code points exactly; quoted names support the RFC escapes (`\b \f \n \r \t \/ \\ \" \'` and `\uXXXX` including surrogate pairs); an unpaired surrogate escape is an error |
| FR-JP-009 | Result header: "N nodes matched." (singular "1 node matched."); then the list |
| FR-JP-010 | Each node is one row: its **Normalized Path** exactly as RFC 9535 §2.7 defines (single-quoted names, escapes, non-negative indices), and its value as compact JSON, truncated for display at 200 characters with a control to show the full value |
| FR-JP-011 | Nodes are listed in the order the standard defines for the query (document order for the segments used; the order for descendant segments follows the standard's rules) |
| FR-JP-012 | At most **1,000 rows** are rendered ("Showing the first 1,000 of N nodes"); copy actions include all |
| FR-JP-013 | **Empty result** is not an error: "The query is valid and matched 0 nodes." followed by a per-segment trace (FR-JP-014) |
| FR-JP-014 | **Per-segment trace**, always available (collapsed by default, one row per segment): the segment as written, its kind in words ("child segment, name selector"), and "N nodes in, M nodes out". For an empty result the first segment whose output is empty is marked in words ("This is where the result became empty") |
| FR-JP-015 | "Copy values" copies a JSON array of the matched values in result order; "Copy paths" copies the normalized paths one per line; both fall back to a selectable text area if the clipboard is unavailable (focus moves to it) |
| FR-JP-016 | Limits: query at most **1,000 characters**; document at most **1,000,000 characters** and depth at most **500**; the working set between segments at most **100,000 nodes** (a query that exceeds it stops with "The query selected more than 100,000 nodes at segment N; narrow it."); nothing is truncated silently |
| FR-JP-017 | Evaluation runs when the user presses **Evaluate** or presses Enter in the query field; it also re-runs automatically (debounced 300 ms) when the query or document changes and the document is at most 200,000 characters |
| FR-JP-018 | "Reset" clears both fields, result and status and focuses the document field; "Example" fills the RFC 9535 §1.5 store document and the query `$..book[?@.price<10]` |
| FR-JP-019 | Announcements: the node count or the error is announced politely; the trace is not announced automatically |
| FR-JP-020 | Keyboard and mobile requirements are identical to FR-JC-023 and FR-JC-024 |
| FR-JP-021 | No file upload, download, URL state or storage in v1 |
| FR-JP-022 | The page has: a how-to, a short syntax reference table limited to what the tool supports, a statement of the standard and the exclusion in FR-JP-004, a worked example computed by the same engine, honest limits, and an FAQ |

### B.3 Validation matrix (JSONPath Tester)

| Case | Required behaviour |
| --- | --- |
| Valid input | evaluated |
| Invalid document | located error, no evaluation |
| Missing input | empty document or empty query: neutral prompt naming which, not an error |
| Malformed query (`$.`, `$[`, `$[?@.a`, `$..`, `$[1:2:3:4]`, `$.a b`, leading or trailing whitespace inside the segment rules of the grammar) | error with position per FR-JP-005. Leading/trailing whitespace around the whole query is **rejected** because the RFC 9535 grammar, as understood here, allows whitespace only between segments and inside brackets (DEC-JP-3; **to be confirmed against the RFC ABNF and the compliance suite when the Tool Pack is written**, and changed to match them), with a hint to remove it |
| Boundary (query 1,000 chars; document 1,000,000 chars; depth 500; integer 2^53−1) | accepted; one over each refused |
| Oversized | refused with the limit |
| Unexpected characters | non-ASCII in names accepted; control characters in a quoted name refused as the grammar requires |
| Unicode | astral names and surrogate-pair escapes equal |
| Unsupported features | `match()`, `search()`, script expressions, non-standard operators: refused per FR-JP-004 and FR-JP-005 |
| Prototype-like names (`__proto__`, `constructor`, `hasOwnProperty`) | treated as ordinary member names (see SEC-002) |

### B.4 Worked examples (verified against RFC 9535 §1.5 Table 2 and §2.7.1 Table 18, read 2026-10-26)

On the §1.5 document: `$.store.book[*].author` → 4 nodes, the four authors; `$..book[2]` → the third book (Moby Dick); `$..book[2].publisher` → 0 nodes (trace: segment `.publisher` is where the result became empty); `$..book[-1]` → the last book; `$..book[0,1]` and `$..book[:2]` → the first two books; `$..book[?@.isbn]` → books 3 and 4; `$..book[?@.price<10]` → books 1 and 3; `$.store..price` → 8.95, 12.99, 8.99, 22.99, 399 (five nodes). Normalized paths: `$.a` → `$['a']`; `$[-3]` on an array of length 5 → `$[2]`; `$["\u000B"]` → `$['\u000b']`.

---

## C. Existing-tool metadata enhancement (E1)

| ID | Requirement |
| --- | --- |
| FR-REL-001 | Set curated `relatedTools` in the catalog entries as in 04 section 7 (catalog metadata only; no change to any existing tool module, engine or URL) |
| FR-REL-002 | Links connect only tools in the Developer Tools section |
| FR-REL-003 | If the Developer Tools related-tools pilot (S3, 08) is **not** approved, the relations remain catalog metadata with no visible effect and nothing else changes |
| FR-REL-004 | No data of any kind (a token, a JSON text, a timestamp) is passed from one tool to another by any link |

## D. URL Parser & Encoder (C4) — added in Ecosystem 2.0

### D.1 Identity

| Item | Value |
| --- | --- |
| Name / slug / route | URL Parser & Encoder / `url-parser` / `/tools/url-parser/` (proposed) |
| Section | Developer Tools, flat |
| Audience | Developers, QA and support engineers debugging request URLs, redirects, callbacks and query strings |
| Problem | A long URL hides its structure; query values are percent-encoded (sometimes twice); `+` versus `%20` and the parts the browser changes are easy to misread; some online encoders send input to a server (E26) |
| Outcome | The parts of a URL, its decoded query parameters in order, a plain statement of what the browser normalized, and strict encode and decode of text, with nothing sent anywhere |
| Differentiation (stated, not marketed) | local processing that the page can prove with a no-network test; the WHATWG parser named as the authority; a plain-words list of what normalization changed; strict decode errors with positions; warnings for credentials and executable schemes; never opens or fetches a URL |
| Related existing tools | Base64 Encoder & Decoder, JSON Formatter |

### D.2 Functional requirements

Three modes selected by a labelled radio group "What do you want to do?": **Parse a URL** (default), **Encode or decode text**, **Build a query string**. Switching mode keeps each mode's inputs.

| ID | Requirement |
| --- | --- |
| FR-UP-001 | **Parse input:** one labelled multi-line field "URL". Spellcheck, autocorrect and autocapitalize off. Leading or trailing whitespace is ignored **for parsing only**, and when it was present the result says "Leading or trailing spaces were ignored." The field's own text is never changed |
| FR-UP-002 | **Parser authority:** the browser's `URL` constructor (WHATWG URL Standard) is the parser and the page says so. An input without a scheme is not guessed: a relative reference needs the optional **Base URL** field (collapsed by default, must itself be an absolute URL); without it the message is "This is not an absolute URL. Add a scheme such as https:// or give a Base URL." |
| FR-UP-003 | **Invalid input:** when the parser rejects the input the message is "The browser could not parse this as a URL." plus at most one **deterministic hint** from the tool's own checks, in this priority: no scheme, a port outside 0 to 65535, a space or other forbidden character in the host, an unmatched `[` in the host. No hint is shown when none applies; the tool never claims to know the exact reason beyond these checks |
| FR-UP-004 | **Components table** (rows: Scheme, Username, Password, Host, Port, Path, Query, Fragment, Origin). Host is shown exactly as the parser returns it (lowercase ASCII, with `xn--` punycode for non-ASCII names, and the page says so). Port shows the explicit port or "default for the scheme" when none remains. Origin is shown only for special schemes (`http`, `https`, `ws`, `wss`, `ftp`); otherwise "opaque" |
| FR-UP-005 | **Path segments:** the path is also listed as numbered segments, each percent-decoded for display; a segment that cannot be decoded as UTF-8 is shown raw with the note "not valid UTF-8" |
| FR-UP-006 | **Normalized URL:** shown with a Copy button, and a line "Your input was already in normalized form." or "The parser changed your input:" followed by the applicable items from this closed list, in words: scheme lowercased; host lowercased; default port removed; dot segments resolved; characters percent-encoded; non-ASCII host converted to punycode; backslashes treated as slashes; tabs or newlines removed. The detection compares components and is deterministic |
| FR-UP-007 | **Query parameters table** in the order they appear: row number, name, value, both percent-decoded with `+` read as a space (the page states this is `application/x-www-form-urlencoded` reading); a name with no `=` shows an empty value and the note "no `=`"; repeated names are kept as separate rows and marked "repeated". At most **500 rows** are shown ("Showing the first 500 of N parameters"); copy actions include all |
| FR-UP-008 | **Malformed percent sequences** in the path, query or fragment (a `%` not followed by two hexadecimal digits) are flagged in words per component, with their position; the parser leaves them as they are and so does the tool |
| FR-UP-009 | **Warnings**, each in words and never colour-only: a username or password is present ("This URL contains credentials"); the scheme is not `http` or `https` (named); a scheme of `javascript`, `data` or `vbscript` ("This URL can run or embed content. It is shown as text and is never opened."); a decoded parameter value still contains a valid `%XX` ("This value may be encoded twice"); an `xn--` label in the host ("Contains an internationalized name"); a bracketed IPv6 host (named) |
| FR-UP-010 | **No navigation:** a URL is never rendered as a link, never fetched, opened, previewed or pinged, and no request for a favicon or image is made; copy buttons exist per component and for the normalized URL |
| FR-UP-011 | **Parse limits:** input at most **100,000 characters** (refused with the limit stated, nothing parsed) |
| FR-UP-012 | **Encode or decode input:** a labelled multi-line field "Text" and a radio group with four operations: "Percent-encode (RFC 3986)", "Percent-decode", "Form-encode (space as +)", "Form-decode (+ as space)". Input limit **1,000,000 characters** |
| FR-UP-013 | **Percent-encode (DEC-UP-1):** the text is encoded as UTF-8 and every byte other than the RFC 3986 unreserved characters (`A-Z a-z 0-9 - . _ ~`) becomes `%` plus two **uppercase** hexadecimal digits. This encodes `! ' ( ) *` too. A checkbox "Keep ! ' ( ) * as they are (like JavaScript's encodeURIComponent)", **off by default**, leaves those five characters unencoded |
| FR-UP-014 | **Form-encode:** UTF-8 bytes; ASCII letters, digits and `* - . _` are left as they are; a space becomes `+`; every other byte becomes `%XX`. (Rule to be re-read in the URL Standard's `application/x-www-form-urlencoded` serializer when the Tool Pack is written, OPEN-08) |
| FR-UP-015 | **Percent-decode** is **strict**: a `%` not followed by two hexadecimal digits is an error naming the position and the sequence; `+` is left as `+`; the decoded bytes must be valid UTF-8, otherwise an error names the byte offset of the first invalid sequence and **no replacement character is ever substituted** (rule 8.5). On error the input stays intact and no output is shown |
| FR-UP-016 | **Form-decode** is the same as FR-UP-015 except `+` becomes a space before decoding |
| FR-UP-017 | **Double-encoding note:** when a successful decode produces text that still contains a valid `%XX` sequence, the result says "The result still contains percent-encoding. It may have been encoded twice." and offers a **Decode again** button that acts only when pressed |
| FR-UP-018 | **Result display:** a read-only output region with Copy, the input and output character counts and the output byte count in UTF-8; the output is exact (no trimming) |
| FR-UP-019 | **Build mode rows:** up to **100** name/value rows, "Add parameter" and a "Remove" button per row whose accessible name includes the row number; fully blank rows are skipped and the output states "N blank rows skipped"; a row with a value and no name is an error naming the row |
| FR-UP-020 | **Build output:** a query string without a leading `?`, rows joined by `&`, in row order, repeated names kept, names and values encoded by the chosen style: "Percent-encoding (space as %20)" (default, FR-UP-013 without the keep option) or "Form encoding (space as +)" (FR-UP-014) |
| FR-UP-021 | **Full URL (optional):** if a Base URL (absolute) is given in Build mode the tool also shows the full URL formed by setting that URL's query to the built string; an existing query on the base is replaced and the fragment is kept; an invalid base is an error naming the field |
| FR-UP-022 | **Edit an existing query:** a field "Query string to edit" accepts a query with or without a leading `?` and fills the rows by the same reading as FR-UP-007; pressing the button replaces the current rows (the page says so first if rows exist) |
| FR-UP-023 | **Reset** clears all three modes, returns to Parse mode and moves focus to the URL field. A **mode switch** keeps focus on the mode radio, so the arrow keys keep cycling the modes (a deviation found by the keyboard test; Tab reaches the first field). Each mode has an Example button: Parse loads the D.4 URL; Encode loads `a b&c=d/é`; Build loads the D.4 rows |
| FR-UP-024 | Announcements, keyboard and mobile follow FR-JC-022 to FR-JC-024 (the result summary is a polite live region; no hover is needed; the radio groups are native and arrow-key operable; at 320 px the tables become labelled stacked rows) |
| FR-UP-025 | **No state, no network, no storage:** no URL or hash state of any kind (a URL may contain tokens), no storage, no request after load |
| FR-UP-026 | The page has: a how-to, the exact rules in plain words including how the WHATWG parser differs from a strict RFC 3986 reading (backslashes, stripped whitespace, default ports), worked examples computed by the same engine, honest limits (the tool does not check that a URL exists, is reachable or is safe), and an FAQ |

### D.3 Validation matrix (URL Parser & Encoder)

| Case | Required behaviour |
| --- | --- |
| Valid | parsed, components and normalization shown |
| Invalid (`http://`, `https://exa mple.com`, `http://a:99999`) | FR-UP-003 message with the applicable hint |
| Missing input | neutral prompt, not an error |
| Malformed percent (`%zz`, `%4`, a trailing `%`) | flagged in Parse; an error in strict decode |
| Boundary (100,000 chars parse; 1,000,000 chars encode; 500 and 501 parameters; 100 and 101 build rows) | exact limit accepted, one over refused or capped as stated |
| Oversized | refused with the limit |
| Unexpected characters (control characters, lone surrogates in the input) | a lone surrogate cannot be UTF-8 encoded: percent-encode refuses with an error naming the position (no replacement) |
| Unicode | UTF-8 bytes; astral characters encode to four bytes |
| Whitespace | see FR-UP-001; inside the text it is data |
| Encoding failures | invalid UTF-8 after decode: FR-UP-015 |
| Unsupported | opaque `mailto:`, `data:` and `javascript:` URLs are parsed per the standard (path is opaque) and warned about |

### D.4 Worked examples (derived by hand from the WHATWG URL Standard and RFC 3986; to be re-verified when the Tool Pack is written)

- **Parse** `https://user:pw@Example.COM:443/a/./b/../c%20d?x=1&x=2&y=a+b&z=%E4%BD%A0#frag`: scheme `https`; username `user`; password `pw`; host `example.com`; port "default for the scheme" (443 is removed); path `/a/c%20d` (segments `a`, `c d`); query rows `x`=`1`, `x`=`2` (both marked repeated), `y`=`a b`, `z`=`你`; fragment `frag`; normalized `https://user:pw@example.com/a/c%20d?x=1&x=2&y=a+b&z=%E4%BD%A0#frag`; the changes list names host lowercased, default port removed and dot segments resolved; a credentials warning appears.
- **Percent-encode** `a b&c=d/é` → `a%20b%26c%3Dd%2F%C3%A9`; **form-encode** → `a+b%26c%3Dd%2F%C3%A9`; with the keep option off, `!` → `%21` and `*` → `%2A` (form-encode leaves `*`).
- **Strict decode** of `100%` is an error at position 3 ("incomplete percent sequence"); of `%C3%28` is an error at byte 0 (not valid UTF-8).
- **Build** rows `q` = `a b`, `tag` = `x&y`, `tag` = `é` → percent style `q=a%20b&tag=x%26y&tag=%C3%A9`; form style `q=a+b&tag=x%26y&tag=%C3%A9`.

---

## E. Base64URL mode for the Base64 Encoder & Decoder (X1) — existing-tool enhancement, added in Ecosystem 2.0

**This reverses the "out of V1" decision in `docs/tool-packs/27-base64-encoder-decoder.md` and needs the owner's approval (rule 9.3).** The default behaviour, limits, UTF-8 handling and every existing message stay as they are, except the single hint described in FR-B64-005.

| ID | Requirement |
| --- | --- |
| FR-B64-001 | A labelled control "Alphabet" with two choices: **Standard** (default, the current behaviour, unchanged) and **URL-safe (RFC 4648 section 5)**. A change of alphabet is handled exactly as a change of direction is handled today |
| FR-B64-002 | **Encode, URL-safe:** the output uses `-` for `+` and `_` for `/`; the `=` padding is **omitted by default**; a checkbox "Keep = padding", off by default, keeps it |
| FR-B64-003 | **Decode, URL-safe:** accepts `A-Z a-z 0-9 - _`; padding is **optional**: absent is accepted, present must be correct (the same strictness as today's rules for `=`); a remainder of one character is refused; the last character must be canonical (decision D3 of spec 27 is kept) |
| FR-B64-004 | In URL-safe mode a `+` or `/` is refused with the hint "This looks like standard Base64. Switch the alphabet to Standard." and its position |
| FR-B64-005 | In Standard mode the existing refusal for `-` or `_` stays, but its text changes from "this looks like base64url; V1 reads standard Base64 only" to "this looks like base64url; switch the alphabet to URL-safe". This is the **only** changed existing message and the one existing assertion that must be updated |
| FR-B64-006 | Limits and encoding: unchanged (1,000,000 bytes to encode; 1,333,336 characters to decode; UTF-8 text only) |
| FR-B64-007 | The page text explains the difference, that JWT segments use the URL-safe alphabet without padding, and keeps the "Base64 is not encryption" section |
| FR-B64-008 | The JWT Decoder is **not changed** and still uses its own routine; the two tools are not merged |
| FR-B64-009 | Keyboard, accessibility and mobile behaviour follow the existing tool; the Alphabet control is a native, labelled radio group or select reachable in the logical order |

Worked examples (derived by hand, bit-by-bit, and to be checked against RFC 4648 section 10 when the pack is written): the RFC 4648 test vectors in the Standard alphabet are unchanged (`foobar` → `Zm9vYmFy`); the text `???` (bytes 3F 3F 3F) encodes to `Pz8/` in Standard and `Pz8_` in URL-safe; `>>>` (3E 3E 3E) to `Pj4+` and `Pj4-`; `fo` to `Zm8=` Standard and `Zm8` URL-safe by default.

## Decisions recorded here (reversible by the owner)

| ID | Decision | Alternative |
| --- | --- | --- |
| DEC-JC-1 | Duplicate keys: last wins, visible warning | refuse the document |
| DEC-JC-2 | Limit 1,000,000 characters per side (half of the formatter's 2,000,000, because two trees are held and compared) | match the formatter's limit |
| DEC-JP-1 | v1 omits `match()` and `search()` (user-supplied regular expressions on the main thread risk catastrophic backtracking, and the Regex Tester is an excluded product); the page says so | include them with an I-Regexp syntax check and a time-boxed Worker |
| DEC-UP-1 | URL percent-encoding follows the strict RFC 3986 unreserved set (`! ' ( ) *` are encoded) with a visible option to keep them like `encodeURIComponent` | match `encodeURIComponent` by default |
| DEC-UP-2 | The URL tool never links, fetches, opens or previews a URL, and has no URL or hash state | clickable links (rejected: executable schemes and tokens) |
| DEC-B64-1 | Base64URL is an explicit mode, default unchanged; padding omitted by default in URL-safe encoding | always keep padding |
| DEC-JP-3 | Whole-query whitespace is rejected, as the grammar requires | trim silently (rejected: rule 8.5 no silent coercion) |
