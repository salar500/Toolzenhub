# 07. Acceptance criteria and traceability

PROJECT: ToolZenHub
ECOSYSTEM: Developer Tools
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASES: 0, 1 AND 2 (Ecosystem 2.0 revision, 2026-10-26)
PURPOSE: Research and requirements baseline

**No test has been written or run for these criteria; none is claimed to pass.** Test categories: **UT** engine unit, **REF** independent reference, **BR** browser (tool journeys), **SEC** security and malformed input, **A11Y** keyboard and accessibility, **MOB** narrow viewport, **REL** related-tools and navigation, **SHR** affected shared consumers, **VIS** visual inspection, **ECO** final ecosystem regression. Development packs (proposed numbering after Tool Pack 34): **DP-0** shared prerequisites, **DP-1** JSON Compare (Tool Pack 35), **DP-2** JSONPath Tester (Tool Pack 36), **DP-3** URL Parser & Encoder (Tool Pack 37), **DP-4** Base64URL mode (Tool Pack 38), **DP-5** Developer Tools integration and final checkpoint (Tool Pack 39). Risk ids are in 09.

## 1. Acceptance criteria: JSON Compare

| AC | Req | Given / When / Then | Cat |
| --- | --- | --- | --- |
| AC-JC-001 | FR-JC-001 | Given the page, when it loads, then two labelled fields exist, spellcheck/autocorrect/autocapitalize are off, and pasted text with leading spaces is stored unchanged | BR |
| AC-JC-002 | FR-JC-002 | Given First `{"a":1,}` and Second `{}`, when compared, then the result names "First JSON", gives line 1 and a column, nothing is compared, and both fields keep their text | UT BR |
| AC-JC-003 | FR-JC-002 | Given both sides invalid, when compared, then both errors are shown with their side names | BR |
| AC-JC-004 | FR-JC-002 | Given First starting with U+FEFF, when compared, then a specific BOM error appears and the text is not stripped | UT |
| AC-JC-005 | FR-JC-003 | Given First has text and Second is empty or whitespace, when viewed, then the prompt names the Second field and no error style is used | BR |
| AC-JC-006 | FR-JC-004 | Given a side of exactly 1,000,000 characters, when compared, then it is accepted; at 1,000,001 it is refused naming the side and the limit; at depth 500 accepted, at depth 501 refused | UT |
| AC-JC-007 | FR-JC-005 | Given `{"a":1,"b":2}` and `{"b":2,"a":1}`, when compared, then "No differences." | UT REF |
| AC-JC-008 | FR-JC-006 | Given `[1,2]` and `[1,2,3]`, when compared, then one row: Added, `$[2]`, 3 | UT |
| AC-JC-009 | FR-JC-006 | Given `[1,2,3]` and `[1,2]`, when compared, then one row: Removed, `$[2]`, 3 | UT |
| AC-JC-010 | FR-JC-007 | Given `[1,2,3]` and `[3,2,1]` with Ignore array order on, then "No differences." and Copy JSON Patch is disabled with the stated reason; with it off, rows show two Changed values (`$[0]` 1→3 and `$[2]` 3→1) | UT BR |
| AC-JC-011 | FR-JC-008 | Given values `1`, `1.0`, `1e0`, `10e-1`, `0.10` vs `0.1`, `-0` vs `0`, when compared pairwise, then all pairs equal (Python `decimal.Decimal` reference agrees) | UT REF |
| AC-JC-012 | FR-JC-008 | Given `9007199254740993` and `9007199254740992`, when compared, then **Changed** (they are equal as doubles but different integers) | UT REF |
| AC-JC-013 | FR-JC-008 | Given `1e400` and `1` followed by 400 zeros, then equal; given `1e999999999` vs `1e999999998`, then Changed and the page remains responsive (no expansion of the full number) | UT SEC |
| AC-JC-014 | FR-JC-009 | Given `1` vs `"1"`, `true` vs `1`, `null` vs `0`, when compared, then each is Type changed | UT |
| AC-JC-015 | FR-JC-010 | Given `"é"` (U+00E9) vs `"é"` (e + U+0301), then Changed with the note "Differs only by Unicode normalization"; given `"A"` vs `"a"`, then Changed with no note | UT REF |
| AC-JC-016 | FR-JC-010 | Given `"😀"` and `"😀"`, then equal | UT |
| AC-JC-017 | FR-JC-011 | Given First `{"a":1,"a":2}` and Second `{"a":2}`, then "No differences." plus a note on the First side naming `$['a']` and the count (last wins) | UT BR |
| AC-JC-018 | FR-JC-012 | Given an integer of 16+ digits, then a precision note appears on its side and the comparison remains exact | UT |
| AC-JC-019 | FR-JC-013 FR-JC-014 FR-JC-015 | Given First `{"a":1,"b":[1,2,3],"d":"x"}` and Second `{"b":[1,2,4],"a":1.0,"c":true,"d":1}`, then the summary reads "3 differences: 1 added, 0 removed, 1 changed, 1 type changed." and the rows are, in order, `$['b'][2]` Changed 3→4, `$['d']` Type changed "x"→1, `$['c']` Added true | UT BR REF |
| AC-JC-020 | FR-JC-014 | Given a difference, then each row has the kind in words and a path; the table has header cells; removing all CSS colour does not remove any information | A11Y |
| AC-JC-021 | FR-JC-014 | Given a string value of 300 characters, then the display is truncated at 200 with "…" and a control shows the full value; the copied text contains the full value | BR |
| AC-JC-022 | FR-JC-015 | Given a whole added subtree, then one Added row for its root, not one per leaf | UT |
| AC-JC-023 | FR-JC-016 | Given 1,500 differences, then 1,000 rows render, the text "Showing the first 1,000 of 1500 differences" appears, and Copy differences contains 1,500 | BR |
| AC-JC-024 | FR-JC-017 | Given the clipboard API unavailable or rejecting, when Copy differences is pressed, then a selectable text area with the same text appears, focus moves to it and a message says why | BR SEC |
| AC-JC-025 | FR-JC-018 FR-JC-019 | Given the example in 05 A.4, then Copy JSON Patch equals `[{"op":"replace","path":"/b/2","value":4},{"op":"replace","path":"/d","value":1},{"op":"add","path":"/c","value":true}]` | UT REF |
| AC-JC-026 | FR-JC-018 | Given keys `a/b` and `m~n`, then pointers read `/a~1b` and `/m~0n` | UT REF |
| AC-JC-027 | FR-JC-018 | Given `[1,2,3,4]` vs `[1]`, then removals are emitted `/3`, `/2`, `/1` in that order; applied by an independent applier the result equals the second document | UT REF |
| AC-JC-028 | FR-JC-019 | Over a generated corpus of random JSON pairs (seeded, fixed seed recorded), applying the patch with an independent applier to the first yields the second in every case; any failure is a defect | REF |
| AC-JC-029 | FR-JC-020 | Given a combined 100,000 characters, then comparison runs after the debounce without pressing Compare; at 100,001 it runs only after Compare is pressed, and Compare always works | BR |
| AC-JC-030 | FR-JC-021 | When Swap is pressed, then the fields exchange and the result is recomputed; when Reset is pressed, then fields, notes, result and status clear and focus is in First JSON | BR A11Y |
| AC-JC-031 | FR-JC-021 | When Example is pressed, then the 05 A.4 pair loads and yields the AC-JC-019 result | BR |
| AC-JC-032 | FR-JC-022 | When a result appears, then the summary is in a polite live region and is announced once; an error is announced with its side name | A11Y |
| AC-JC-033 | FR-JC-023 | Given keyboard only, then every control is reachable in logical order, focus is visible, Enter in a field does not submit or clear, Space and Enter activate Compare | A11Y |
| AC-JC-034 | FR-JC-024 NFR-004 | Given 320, 360 and 390 px viewports, then no horizontal page scroll, controls at least 44 px, inputs stacked, long paths contained | MOB |
| AC-JC-035 | FR-JC-025 NFR-006 | When the page is used, then no network request follows the initial load and no storage key is written | BR SEC |
| AC-JC-036 | FR-JC-026 | The page has the how-to, rules, example, limits and FAQ; no text matches /best\|100% accurate\|most accurate/i | BR |
| AC-JC-037 | SEC-001 | Given keys and values of `<script>alert(1)</script>`, `"><img src=x onerror=alert(1)>`, `\`, quotes and RTL text, then they appear as text and no script runs | SEC |
| AC-JC-038 | SEC-002 | Given `{"__proto__":{"x":1}}` vs `{}`, then one Removed row for `$['__proto__']` and `Object.prototype.x` is undefined afterwards | SEC |
| AC-JC-039 | FR-JC-014 | Given a key containing `'`, `\` and a control character, then the path uses RFC 9535 escapes (`\'`, `\\`, `\u0001`) | UT REF |

## 2. Acceptance criteria: JSONPath Tester

| AC | Req | Given / When / Then | Cat |
| --- | --- | --- | --- |
| AC-JP-001 | FR-JP-001 | Given the page, then both fields are labelled, the query field is empty with a `$` hint, and spellcheck/autocorrect are off | BR |
| AC-JP-002 | FR-JP-002 | Given an invalid document, when evaluated, then a located error appears and the query is not evaluated | BR |
| AC-JP-003 | FR-JP-003 | Given the §1.5 document, `$.store.book[*].author` returns 4 nodes: Nigel Rees, Evelyn Waugh, Herman Melville, J. R. R. Tolkien | UT REF |
| AC-JP-004 | FR-JP-003 | Same document: `$..author` returns the same 4; `$.store.*` returns 2 nodes (the book array, the bicycle); `$.store..price` returns 5 nodes (8.95, 12.99, 8.99, 22.99, 399) | UT REF |
| AC-JP-005 | FR-JP-003 FR-JP-011 | Same document: `$..book[2]` returns the Moby Dick object; `$..book[-1]` the Tolkien object; `$..book[0,1]` and `$..book[:2]` the first two books | UT REF |
| AC-JP-006 | FR-JP-003 | Same document: `$..book[?@.isbn]` returns books 3 and 4; `$..book[?@.price<10]` returns books 1 and 3; `$..*` returns every member value and array element | UT REF |
| AC-JP-007 | FR-JP-013 | Same document: `$..book[2].publisher` returns "The query is valid and matched 0 nodes." and the trace marks the `.publisher` segment as where it became empty | UT BR |
| AC-JP-008 | FR-JP-010 | Normalized paths: `$.a` → `$['a']`; `$[-3]` on a length-5 array → `$[2]`; `$["\u000B"]` → `$['\u000b']`; `$["a"]` → `$['a']` | UT REF |
| AC-JP-009 | FR-JP-003 | Slices: `$[1:3]`, `$[::2]`, `$[::-1]`, `$[3:0:-1]`, `$[::0]` on `[0,1,2,3,4]` give `[1,2]`, `[0,2,4]`, `[4,3,2,1,0]`, `[3,2,1]`, and an empty result for step 0 (RFC 9535 §2.3.4: a step of 0 selects nothing) | UT REF |
| AC-JP-010 | FR-JP-003 FR-JP-006 | Functions: `$[?length(@.a)>2]`, `$[?count(@.*)==2]`, `$[?value(@..x)==1]` give the nodes the RFC defines; `$[?length(@.*)>0]` (a non-singular query where a value is required) and `$[?count(1)>0]` (a value where a node list is required) are refused as ill-typed with the function named | UT REF |
| AC-JP-011 | FR-JP-004 | Given `$[?match(@.a,"x")]` or `search(...)`, then the message "match() and search() are not supported in this version." appears and the page text states the RFC 9535 exclusion | UT BR |
| AC-JP-012 | FR-JP-005 | Given `$.`, `$[`, `$[?@.a`, `$..`, `$[1:2:3:4]`, `$.a b`, then each is refused, with a position and a caret, and nothing is evaluated | UT |
| AC-JP-013 | FR-JP-005 | Given `$[(@.length-1)]`, then it is refused as "not part of RFC 9535"; given `$.a.length`, then it is evaluated as a member name | UT |
| AC-JP-014 | FR-JP-007 | Given `$[9007199254740991]` accepted (no match on a short array) and `$[9007199254740992]` refused | UT REF |
| AC-JP-015 | FR-JP-008 | Given `$['😀']` against `{"😀":1}`, then 1 node; given an unpaired `\uD800`, then an error | UT |
| AC-JP-016 | FR-JP-009 | Given 1 match, then "1 node matched."; given 4, "4 nodes matched." | BR |
| AC-JP-017 | FR-JP-012 | Given 1,500 matches, then 1,000 rows render with the "Showing the first 1,000 of 1500 nodes" text and the copy actions contain all | BR |
| AC-JP-018 | FR-JP-014 | Given any valid query, when the trace is opened, then it lists each segment with its kind in words and "N nodes in, M nodes out" | BR A11Y |
| AC-JP-019 | FR-JP-015 | When Copy values is pressed, then the clipboard holds a JSON array in result order; when Copy paths is pressed, normalized paths one per line; with the clipboard unavailable a selectable text area appears and takes focus | BR SEC |
| AC-JP-020 | FR-JP-016 | Given a query of 1,000 characters accepted and 1,001 refused; a document of 1,000,000 accepted and 1,000,001 refused; `$..*..*..*` on a document exceeding 100,000 working nodes stops with the stated message and the page stays responsive | UT SEC |
| AC-JP-021 | FR-JP-017 | Given a document of 200,000 characters, then edits re-run automatically after the debounce; above it only Evaluate or Enter runs | BR |
| AC-JP-022 | FR-JP-018 | When Example is pressed, then the §1.5 document and `$..book[?@.price<10]` load and AC-JP-006's second result appears; Reset clears all and focuses the document field | BR A11Y |
| AC-JP-023 | FR-JP-019 FR-JP-020 | The count or error is announced once politely; the trace is not announced; keyboard order is logical and focus visible | A11Y |
| AC-JP-024 | FR-JP-020 NFR-004 | At 320, 360 and 390 px there is no horizontal page scroll and controls are at least 44 px | MOB |
| AC-JP-025 | FR-JP-021 NFR-006 | After load there is no network request and no storage write | BR SEC |
| AC-JP-026 | FR-JP-022 | The page states the standard and the exclusion, lists only supported syntax, shows a computed example and limits, and has no superlative claims | BR |
| AC-JP-027 | SEC-001 | Queries and members containing script text, quotes and backslashes appear only as text | SEC |
| AC-JP-028 | SEC-002 | Given `{"__proto__":1,"constructor":2}` and `$.__proto__`, then 1 node (value 1) and `Object.prototype` is unchanged | SEC |
| AC-JP-029 | NFR-001 | If the licence permits, every case of the JSONPath compliance suite that the tool claims to support passes; unsupported-feature cases (regex functions) are recorded as intentionally refused, never skipped silently | REF |
| AC-JP-030 | FR-JP-003 | Filter semantics: `$[?@.a==@.b]` with both missing is **true** per RFC 9535 (Nothing equals Nothing); `$[?@.a==1]` over a node lacking `a` is false; comparing different types is false; (expected values to be re-read from RFC 9535 §2.3.5.2 when the Tool Pack is written) | UT REF |

## 2b. Acceptance criteria: URL Parser & Encoder (added in Ecosystem 2.0)

Expected values are derived from the WHATWG URL Standard, RFC 3986 and Python `urllib.parse` where they agree; WHATWG-specific rules are pinned by hand (NFR-016).

| AC | Req | Given / When / Then | Cat |
| --- | --- | --- | --- |
| AC-UP-001 | FR-UP-001 | Given input `" https://example.com "` (leading and trailing space), when parsed, then the components are those of `https://example.com/`, the note "Leading or trailing spaces were ignored." appears and the field text is unchanged | BR |
| AC-UP-002 | FR-UP-002 | Given `example.com/path` and no Base URL, then the message "This is not an absolute URL. Add a scheme such as https:// or give a Base URL." appears and nothing is guessed | UT BR |
| AC-UP-003 | FR-UP-002 | Given `../x` and Base URL `https://example.com/a/b/c`, then the path is `/a/x` and the host `example.com` (RFC 3986 section 5.2) | UT REF |
| AC-UP-004 | FR-UP-003 | Given `https://exa mple.com` then the failure message plus the hint about a space in the host; given `http://a:99999` the hint about the port range; given `http://` the failure message with **no** hint | UT |
| AC-UP-005 | FR-UP-004 FR-UP-006 | Given the D.4 parse example, then the components, the segments `a` and `c d`, the normalized URL and the change list (host lowercased, default port removed, dot segments resolved) are exactly as D.4 states | UT REF BR |
| AC-UP-006 | FR-UP-004 | Given `HTTP://EXAMPLE.com:80/`, then scheme `http`, host `example.com`, port shown as "default for the scheme", origin `http://example.com` | UT |
| AC-UP-007 | FR-UP-004 FR-UP-009 | Given `https://bücher.de/`, then the host reads `xn--bcher-kva.de` and the internationalized-name warning appears | UT |
| AC-UP-008 | FR-UP-005 | Given the path `/a%20b/%FF`, then the segments are `a b` and `%FF` with the note "not valid UTF-8" | UT |
| AC-UP-009 | FR-UP-006 | Given `https://example.com/a?x=1`, then "Your input was already in normalized form." | UT |
| AC-UP-010 | FR-UP-007 | Given `?a=1&a=2&b&c=%20&d=x+y`, then rows: `a`=`1` repeated, `a`=`2` repeated, `b` empty with "no =", `c`=a single space, `d`=`x y` | UT REF |
| AC-UP-011 | FR-UP-007 | Given 501 parameters, then 500 rows render with "Showing the first 500 of 501 parameters" and the copy action holds all 501 | BR |
| AC-UP-012 | FR-UP-008 | Given `https://e.com/%zz?q=%4&r=100%`, then a malformed sequence is flagged with its position in the path, the query (twice) and no change is made to the text | UT |
| AC-UP-013 | FR-UP-009 FR-UP-010 | Given `javascript:alert(1)`, then it parses (scheme `javascript`, opaque path), the executable-content warning appears, **no element with an `href` built from the input exists** and nothing runs | UT SEC |
| AC-UP-014 | FR-UP-009 | Given `https://u:p@example.com/`, then the credentials warning appears | UT |
| AC-UP-015 | FR-UP-009 | Given `?v=%2520`, then the decoded value is `%20` and the "may be encoded twice" warning appears | UT |
| AC-UP-016 | FR-UP-010 SEC-013 | After any parse, no network request is recorded and no navigation occurs | BR SEC |
| AC-UP-017 | FR-UP-011 | Given 100,000 characters, then it is parsed (or fails as a URL); at 100,001 it is refused with the limit and nothing is parsed | UT |
| AC-UP-018 | FR-UP-013 | Percent-encode `a b&c=d/é` → `a%20b%26c%3Dd%2F%C3%A9`; `!'()*` → `%21%27%28%29%2A`; `-._~` unchanged; hex digits uppercase; with "Keep ! ' ( ) *" on, those five stay (Python `quote(s, safe='')` agrees on the first three) | UT REF |
| AC-UP-019 | FR-UP-014 | Form-encode `a b*c-d.e_f~g` → `a+b*c-d.e_f%7Eg` (a WHATWG-specific result that Python's `quote_plus` does not produce; **confirm against the URL Standard text**, OPEN-08) | UT |
| AC-UP-020 | FR-UP-015 | Percent-decode `%41%42` → `AB`; `a+b` stays `a+b`; `100%` is an error at position 3; `%zz` an error at position 0; `%4` an error; `%C3%28` an error "not valid UTF-8" at byte 0; no replacement character appears anywhere | UT REF |
| AC-UP-021 | FR-UP-015 | Given a decode error, then the input is unchanged and no output is shown | BR |
| AC-UP-022 | FR-UP-016 | Form-decode `a+b%20c` → `a b c` | UT |
| AC-UP-023 | FR-UP-017 | Percent-decode `%2541` → `%41` with the double-encoding note; pressing "Decode again" gives `A`; nothing decodes a second time by itself | UT BR |
| AC-UP-024 | FR-UP-012 FR-UP-018 | Given `é`, percent-encode output is `%C3%A9`, the counts read 1 character in, 6 characters out and 6 bytes; the four operations are offered as a labelled radio group; an input of 1,000,000 characters is accepted and 1,000,001 is refused with the limit | UT BR |
| AC-UP-025 | FR-UP-019 | Given three rows with the second blank, then "1 blank rows skipped"; given a value with no name in row 2, then an error naming row 2 | UT BR |
| AC-UP-026 | FR-UP-020 | Rows `q`=`a b`, `tag`=`x&y`, `tag`=`é` → `q=a%20b&tag=x%26y&tag=%C3%A9` (percent style) and `q=a+b&tag=x%26y&tag=%C3%A9` (form style), in row order | UT REF |
| AC-UP-027 | FR-UP-021 | Base URL `https://e.com/p?old=1#f` with rows `q`=`1` → `https://e.com/p?q=1#f`; an invalid base is an error naming the field | UT |
| AC-UP-028 | FR-UP-022 | Given `?a=1&a=2` in "Query string to edit", then two rows `a`=`1`, `a`=`2`; the replace warning appears when rows already exist | BR |
| AC-UP-029 | FR-UP-023 | When Reset is pressed, then all three modes clear, Parse mode is selected and focus is in the URL field; each Example button loads the D.4 input and produces the D.4 result | BR A11Y |
| AC-UP-030 | FR-UP-024 | The mode radios are operable by arrow keys; focus order is logical; at 320, 360 and 390 px there is no horizontal page scroll, the tables stack with labels and controls are at least 44 px | A11Y MOB |
| AC-UP-031 | FR-UP-025 NFR-006 | During and after use there is no network request, no storage write and no change to the page's own URL or hash | BR SEC |
| AC-UP-032 | FR-UP-026 NFR-021 | The page states the parser authority, the WHATWG versus RFC 3986 differences, the limits and that reachability and safety are not checked; no text matches /safe\b\|secure\b\|verified\|best\|100% accurate/i except in a sentence that says the tool does **not** check them | BR |
| AC-UP-033 | SEC-001 | Script text, quotes and backslashes in the URL, in parameter names and in values appear only as text | SEC |
| AC-UP-034 | SEC-015 | Percent-encoding input containing a lone surrogate gives an error naming the position and produces no output | UT SEC |
| AC-UP-035 | NFR-018 | With `URL.canParse` and `URL.parse` removed from the page environment, every parse result is unchanged | BR |

## 2c. Acceptance criteria: Base64URL mode (added in Ecosystem 2.0)

| AC | Req | Given / When / Then | Cat |
| --- | --- | --- | --- |
| AC-B64-001 | FR-B64-001 | Given the page loads, then Alphabet is Standard and every existing Base64 unit and browser test passes unchanged (except AC-B64-005's one assertion) | SHR BR |
| AC-B64-002 | FR-B64-002 | Encode URL-safe: `???` → `Pz8_`; `>>>` → `Pj4-`; `fo` → `Zm8`; with "Keep = padding" `fo` → `Zm8=`; Standard still gives `Pz8/`, `Pj4+`, `Zm8=` (derived bit-by-bit by hand) | UT REF |
| AC-B64-003 | FR-B64-003 | Decode URL-safe: `Zm8` → `fo`; `Zm8=` → `fo`; `Zm9vYg` and `Zm9vYg==` → `foob`; `Zm9vYg=` refused (wrong padding); `Z` and `Zm9vY` refused (remainder of one); `Zm9=` refused (non-canonical last character) | UT REF |
| AC-B64-004 | FR-B64-004 | Decode `Pz8/` in URL-safe mode is refused at position 3 with "This looks like standard Base64. Switch the alphabet to Standard." | UT BR |
| AC-B64-005 | FR-B64-005 | Decode `Pz8_` in Standard mode is refused with the updated hint "this looks like base64url; switch the alphabet to URL-safe"; this is the only existing assertion changed | UT BR |
| AC-B64-006 | NFR-017 | Over a seeded random corpus of UTF-8 strings (seed recorded), URL-safe encode then decode returns the original, and the encoded text equals Python's `urlsafe_b64encode` with padding stripped | REF |
| AC-B64-007 | FR-B64-006 | Limits are unchanged: 1,000,000 bytes encode and 1,333,336 characters decode accepted, one more refused, in both alphabets | UT |
| AC-B64-008 | FR-B64-007 | The page explains the two alphabets, that JWT segments use URL-safe without padding, and keeps the "not encryption" section | BR |
| AC-B64-009 | FR-B64-008 SEC-018 | `git diff` shows no change under `assets/js/tools/jwt-decoder/` or `tests/**/jwt-decoder*`; the JWT specs pass unchanged | SHR |
| AC-B64-010 | FR-B64-009 | The Alphabet control is keyboard operable and labelled, and at 320 px nothing overflows | A11Y MOB |

## 3. Acceptance criteria: metadata enhancement and shared integration

| AC | Req | Given / When / Then | Cat |
| --- | --- | --- | --- |
| AC-REL-001 | FR-REL-001 FR-REL-002 | When the catalog loads, then each Developer Tool's `relatedTools` equals the 04 section 5 list and every related id is in `developer-tools` | UT |
| AC-REL-002 | FR-REL-003 | If the pilot is not approved, then no Developer Tool page renders a related block and `git diff` shows no change under `assets/js/tools/<existing>/` | SHR |
| AC-REL-003 | FR-REL-004 | When any related link is followed, then the destination is a plain route with no query string or hash | REL |
| AC-SHR-001 | SH-001 SH-002 | After adding the three catalog entries, every consumer in 01 section 4 is updated in the same phase and the focused specs listed there pass | SHR |
| AC-SHR-002 | SH-003 | Search for `json formatter`, `json validator` and `format json` still returns the JSON Formatter first; `json compare`, `json diff` return JSON Compare first; `jsonpath` returns JSONPath Tester first; `url parser`, `url encode`, `percent encoding` return URL Parser & Encoder first and `base64` keeps the Base64 tool first; `compare text`, `text diff` return Text Diff first | UT BR |
| AC-SHR-003 | SH-004 | The sitemap lists each new URL once; each canonical is on `https://toolzenhub.in`; a preview build uses `/Toolzenhub/` paths | SHR |
| AC-SHR-004 | SH-005 | If approved, each of the 9 Developer Tool pages renders "Related Developer Tools" with only same-section cards in the 04 order; Time Tools pages are unchanged | REL |
| AC-SHR-005 | SH-006 | `node scripts/growth-manifest/export.mjs --check`, `inventory:check`, links, assets and SEO static checks pass | SHR |
| AC-SHR-006 | SH-016 | Visual inspection records the three new pages at desktop and 390 px; no accepted baseline is changed without inspection | VIS |
| AC-ECO-001 | all | At the final checkpoint, the focused specs for the three new tools, the six existing Developer Tool specs (Base64 included, with its one changed assertion), navigation and smoke, accessibility and build pass on subpath-desktop and subpath-mobile with one worker; failures that predate the work are listed separately | ECO |

## 4. Traceability matrix

| User problem | Proposed feature | Requirements | Acceptance | Test categories | Risks | Pack |
| --- | --- | --- | --- | --- | --- | --- |
| Line diffs are noisy for JSON | JSON Compare structural diff | FR-JC-005 to FR-JC-016 | AC-JC-007 to AC-JC-023 | UT REF BR | RISK-DT-01, 02, 09, 16 | DP-1 |
| Cannot tell `1` from `"1"` | Type-changed rows | FR-JC-009 | AC-JC-014 | UT | RISK-DT-01 | DP-1 |
| Need an exact change list or patch | Copy differences, JSON Patch with self-check | FR-JC-017 to FR-JC-019 | AC-JC-024 to AC-JC-028 | UT REF SEC | RISK-DT-02 | DP-1 |
| Bad JSON gives no location | Located per-side errors | FR-JC-002 to FR-JC-004 | AC-JC-002 to AC-JC-006 | UT BR | RISK-DT-16 | DP-1 |
| Large or hostile input freezes the tab | Limits, caps, auto-run threshold | FR-JC-004, 016, 020 NFR-002 NFR-008 SEC-005 SEC-008 | AC-JC-006, 013, 023, 029 | UT SEC BR | RISK-DT-03, 06 | DP-1 |
| Unsafe rendering or hidden leakage | Text-only output, no network or storage | SEC-001, 002, 006, 007 NFR-006 FR-JC-025 | AC-JC-024, 035, 037, 038 | SEC BR | RISK-DT-07, 08 | DP-1 |
| Hard to use by keyboard or phone | A11Y and mobile rules | FR-JC-014, 022 to 024 NFR-004 NFR-005 | AC-JC-020, 030 to 034 | A11Y MOB | RISK-DT-10 | DP-1 |
| Queries copied from libraries behave differently | RFC 9535 evaluator | FR-JP-003 to FR-JP-008 | AC-JP-003 to AC-JP-015, 030 | UT REF | RISK-DT-04, 05, 13, 15 | DP-2 |
| An empty result gives no clue | Per-segment trace | FR-JP-013, FR-JP-014 | AC-JP-007, 018 | UT BR A11Y | RISK-DT-05 | DP-2 |
| Need exact paths and values | Normalized paths, copy | FR-JP-009 to FR-JP-012, FR-JP-015 | AC-JP-008, 016, 017, 019 | UT REF BR | RISK-DT-05 | DP-2 |
| Regex functions can hang the tab | v1 refuses them and says so | FR-JP-004 SEC-004 | AC-JP-011 | UT BR | RISK-DT-13, 14 | DP-2 |
| Hostile queries or documents | Limits, working-set cap, no eval | FR-JP-016 SEC-003 SEC-005 SEC-008 | AC-JP-020, 027, 028 | SEC UT | RISK-DT-03, 06, 08 | DP-2 |
| Related tools are invisible on Developer Tools pages | Reciprocal relations, optional pilot | FR-REL-001 to FR-REL-004, SH-005 | AC-REL-001 to 003, AC-SHR-004 | UT REL SHR | RISK-DT-11, 17 | DP-5 |
| New entries break counts and search | Update every consumer in the same phase | SH-001 to SH-007 | AC-SHR-001 to 006, AC-ECO-001 | SHR VIS ECO | RISK-DT-11, 12 | DP-0, DP-5 |
| Query strings and URLs are unreadable | Parse a URL into parts, decoded ordered parameters and a normalization list | FR-UP-001 to FR-UP-011 | AC-UP-001 to AC-UP-017 | UT REF BR | RISK-DT-23, 24 | DP-3 |
| Some online encoders send input to a server | Local strict encode and decode, no network | FR-UP-012 to FR-UP-018, FR-UP-025 NFR-006 NFR-019 | AC-UP-018 to AC-UP-024, AC-UP-031 | UT REF BR SEC | RISK-DT-25 | DP-3 |
| Hand-building a query string is error-prone | Build mode with encoding style | FR-UP-019 to FR-UP-022 | AC-UP-025 to AC-UP-028 | UT BR | RISK-DT-23 | DP-3 |
| A pasted URL could execute or leak secrets | Text-only display, warnings, no state | FR-UP-009 FR-UP-010 SEC-013 SEC-014 SEC-016 | AC-UP-007, 013, 014, 016, 033 | SEC UT BR | RISK-DT-26 | DP-3 |
| URL tool is hard to use on a phone or by keyboard | Radios, stacked tables, 44 px targets | FR-UP-023 FR-UP-024 NFR-004 NFR-005 | AC-UP-029, 030 | A11Y MOB | RISK-DT-10 | DP-3 |
| Base64URL values (JWT segments, API tokens) cannot be decoded | URL-safe alphabet mode | FR-B64-001 to FR-B64-005 | AC-B64-002 to AC-B64-005 | UT REF BR | RISK-DT-27 | DP-4 |
| An enhancement must not disturb the existing tool | Default unchanged, one assertion changed, JWT untouched | FR-B64-006 to FR-B64-009 SEC-018 | AC-B64-001, 007 to 010 | SHR BR A11Y | RISK-DT-27, 11 | DP-4 |

Unresolved technical decisions are in 09 (OPEN-xx) and 11.
