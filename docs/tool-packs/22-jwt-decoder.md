# Tool Pack 22: JWT Decoder (Developer Tools)

Status: built locally and verified in Chrome (desktop and the mobile emulation project); not yet committed. Android real-device verification: **PENDING USER VERIFICATION**. Safari/WebKit: **UNVERIFIED** (not available).      Base commit: 835d1e2
Id and slug: `jwt-decoder` (route `/tools/jwt-decoder/`)
Section: **Developer Tools** (`developer-tools`, flat, no subcategory). Fourth tool after the JSON Formatter, the Unix Timestamp Converter and Text Diff.

## Selection record

Chosen under rulebook section 12 after the Photos to PDF feasibility audit, which scored four candidates and found this one highest (3.75 of 5, against 3.35 for Photos to PDF), with the lowest implementation risk. **All demand, retention and competition judgements behind those scores are hypotheses**: no keyword volumes, traffic or usage data were available and none are claimed. The case rests on what is verified: the job is real for developers, the logic is small and deterministic, nothing needs a backend, and the two natural neighbours (JSON, Unix times) already exist.

**AI-era test (rule 1.4).** An assistant can explain a JWT, but pasting a live credential into one is exactly what a careful developer avoids. This tool decodes in the browser, gives the same exact result every time, shows located errors and the times as dates, and says plainly what it does not do.

**Honest differentiation.** Decoding a JWT is a commodity and well-served by established tools; this one is not expected to out-rank them. Its value is the privacy boundary stated and tested, strict JSON with located errors, the time claims explained (UTC, device zone, relative, a milliseconds hint) and wording that never mistakes decoding for verifying.

## Problem

A developer meets a token in a log, a header or a support ticket and needs to see what it says: the algorithm it declares, the claims, when it was issued and when it says it expires. The tool shows that. It is **not** an authenticator: it never claims a token is valid, trusted, genuine or verified.

## V1 scope

Paste a token, press **Decode**; see a structure summary, the formatted header and payload (each with an explicit Copy), the registered claims (`iss`, `sub`, `aud`, `exp`, `nbf`, `iat`, `jti`) with what each means, the time claims as UTC, the device's zone and a relative time, informational status lines, and a permanent "Signature: not verified" card. Clear, a clearly fake example, a character count, accessible errors and status.

**Excluded (by decision):** signature verification or algorithm checking, signing or generating tokens, any key or secret input, JWKS fetching, OAuth, token storage or history, URL state, API calls, JWE decryption, other claim vocabularies (OIDC, scopes, roles), non-JSON payloads, automatic decoding on paste, reading the clipboard, copying the raw token or signature, articles and imagery, any dependency, and any change to the JSON Formatter, the Unix Timestamp Converter or the shared article code.

## Architecture

- `assets/js/tools/jwt-decoder/jwt-engine.js`: the pure engine (no DOM, no network, no storage, no clock of its own; the time and zone are arguments).
- `assets/js/tools/jwt-decoder/index.js`: the page (`markup()`, `render()`, `init()`, like the other tools).
- `assets/css/tools/jwt-decoder.css`: only what the shared tool styles do not provide.
- **Read-only reuse, neither file changed:** `json-formatter/json-engine.js` (`analyze(text, "format")`: strict JSON, the place of an error, notes for repeated keys and large integers, and a formatted copy that keeps every number and string exactly as written) and `unix-timestamp-converter/timestamp-engine.js` (`formatUtcIso`, `describeInZone`, `localZone`, `relativeText`, `inRange`). The JWT engine's tests pin the behaviour it relies on, and each engine keeps its own tests.
- Catalog: one entry in `assets/js/data/tools.js` (`autoRelated: false`, related tools `json-formatter` and `unix-timestamp-converter`, one way), a style entry in `src/_data/toolStyles.json`, and the Developer Tools section text in `assets/js/data/categories.js` (it named three tools).

## Parsing contract

`decodeToken(text, { nowMs, zone })` returns one of `empty`, `too-large`, `jwe`, `invalid` or `decoded`.

- **Input.** More than 100,000 characters is refused before anything is read. The ends are trimmed. A leading `Bearer` (any case) is ignored with a visible note, and spaces or line breaks inside the token are removed with a visible note. Nothing after `Bearer` is an error.
- **Structure.** Exactly three dot-separated parts are a compact token. Five parts is recognised as an encrypted token (JWE) and refused with an explanation; any other count is invalid input and says how many parts were found. An empty header or payload part is invalid; an empty signature part is allowed.
- **Base64url.** Alphabet `A-Z a-z 0-9 - _`. Up to two trailing `=` on a part are ignored with a note. `+` and `/` are refused with a hint about base64url, an `=` anywhere else, quotation marks and any other character are refused with the part, position and code point. A part of 1 modulo 4 characters is refused. Unused trailing bits that are not zero are a note, not an error.
- **UTF-8.** Strict (`fatal`). A byte order mark is passed on to the JSON check and fails there.
- **JSON.** The decoded header and payload go through the JSON Formatter's engine: invalid JSON is reported with the part, line, column and surrounding text. Each must be a JSON object; every other JSON type is refused by name. The displayed JSON is the formatter's output, so numbers and strings are exactly as the token wrote them (no rounding, no rewriting of escapes); duplicate keys and integers beyond 15 digits are shown as notes. A single `JSON.parse` is used only to read claim types; a `__proto__` key stays an ordinary key. **Whole numbers beyond 2^53 - 1 (9007199254740991) are never printed as if exact:** JavaScript can only hold a rounded stand-in, so a claim value (or a value inside an array or object) that is such a number is replaced by "a number larger than JavaScript can hold exactly (see the payload above, which shows it as written)", and a time claim of that size gets no date and the status "too large to read exactly, so no date is shown". The formatted payload keeps the exact digits.
- **Claims.** `iss`, `sub`, `jti`: string. `aud`: string or array of strings. `exp`, `nbf`, `iat`: JSON number. A wrong type is reported ("Unexpected type: expected X, found Y"), shown as written and never converted or interpreted, and never blocks the decode. Every other claim is left to the payload view.
- **Header declarations.** `alg`, `typ`, `kid`, `cty` are listed as declared by the token (untrusted), a non-string is flagged. Facts are stated, never judged: `alg: none`, an empty signature next to another algorithm, a signature next to `alg: none`, a missing `alg`.

## Time contract

- A NumericDate is a count of **seconds**. A value is never converted from milliseconds. A value of 100 billion or more is read as seconds, shown that way, and gets an information-only hint with the milliseconds reading ("Nothing was converted").
- Shown: the value in seconds, UTC, the device's zone (name, offset and abbreviation where the browser gives one), and the time from now. A fraction is kept to the millisecond and cannot round into the wrong second. Years 1 to 9999 are supported; outside that, the value is stated as out of range.
- **Status is informational.** `exp` at or before the device's time: "The expiry time has passed (...)"; after it: "has not passed yet (...)". `nbf` after the time: "has not been reached yet"; otherwise "has been reached". `iat` in the future: "...in the future ... The clocks may differ." A missing `exp` is stated, `exp` earlier than `iat` or `nbf` is noted, and every result carries the device-clock caveat (the checking service uses its own clock and may allow leeway). The words valid, invalid, trusted, genuine, authentic and verified are never used about a decoded token (a unit test scans every string of several results); "invalid" appears only for input that cannot be read.

## Privacy and security boundaries

- Decoding happens only on **Decode** or Ctrl/Cmd + Enter. Pasting, typing and loading the example do not decode. The clipboard is never read.
- Everything from a token is placed with `textContent` or as a value, never as HTML, and never as a link (an `iss` that is an address stays text). Control, zero-width, line-separator and bidirectional-override characters are written as visible escapes (for example U+202E becomes a backslash-u escape in the text); inside a JSON string that is the same character, so the shown JSON stays equivalent.
- Copy offers only the decoded header or payload text, only on a click. The raw token and the signature are never copied.
- No network request, no `localStorage`, `sessionStorage`, IndexedDB or cookie, no URL or title change and no logging of token text; the textarea has `spellcheck="false"`, `autocomplete="off"`, `autocapitalize="off"` and `autocorrect="off"`.
- **Third-party scripts inspected.** The built page loads exactly one script, the site's own module (`entries/tool.js`), plus a non-executable JSON-LD block. Its only external resource is the Google Fonts stylesheet (CSS, which cannot read the page). No analytics code exists in the assets or source. The page therefore says the token is decoded in the browser and not sent, uploaded, stored or put in the address. It does **not** promise anything about browser extensions, clipboard history or other software on the device, and the FAQ says so.
- Whether a browser restores textarea contents after a reload despite `autocomplete="off"` was not tested in more than Chrome.

## Trust limitations (stated on the page)

A decoded token is only text someone wrote in the right shape. The page keeps a standing notice ("Signature not verified"), a "Decoding Is Not Verifying" section, a "Signature: not verified" card in the results and an "untrusted data" line, and treats `alg`, `typ`, `kid` and every other value as the token's own declarations.

## Search and integration

Aliases: jwt decoder, decode jwt, jwt parser, jwt viewer, jwt payload viewer, jwt claims, jwt expiry, json web token decoder, jwt exp. Not "checker" or "validator", because the tool does not check validity. SEO title "JWT Decoder: Read a Token's Header and Claims | ToolZen Hub". Present in Developer Tools, All Tools and global search; absent from Calculators, Time Tools and Image Tools. Related tools (catalog, one way): JSON Formatter and Unix Timestamp Converter; the page also links to both in its text. The JSON Formatter and Unix pages are unchanged and do not mention the tool. No articles and no imagery: none would add explanatory value that the page does not already give.

## UX and accessibility

One column on a phone (16 px input text, 44 px buttons), results in two columns from 900 px. Labelled textarea with a character count, polite live announcements, a status that is not itself live, errors with the part and place, focus moved to the results heading after a decode, keyboard operation throughout, visible focus, no animation, long values wrap (`overflow-wrap: anywhere`) so the page never scrolls sideways.

## Test evidence (risk-based, nothing broader than the change)

- **Unit, `tests/unit/jwt-decoder.test.mjs`: 41 tests.** Reference vectors from `tests/fixtures/jwt-golden.py` (Python standard library only: base64, json, datetime) cover the example token, three padding cases, raw and escaped Unicode and NumericDate values (UTC, fixed-offset local text, a winter and a summer New York instant). Structure, base64url, UTF-8, JSON, every claim type, time boundaries (`exp` equal to now, `nbf` and `iat`, the year 9999 and the second after it, 0, negatives, fractions, 99,999,999,999 and 100,000,000,000), the wording scan, hostile text, determinism and the beyond-2^53 disclosure (the boundary 9007199254740991 and the next integer). Five deliberate mutations of the engine (a comparison, the milliseconds threshold, the length rule, the byte-order-mark handling, the 2^53 limit) were each caught, then reverted.
- **Pinned catalog tests updated deliberately:** catalog, sections, relationships (including that the new tool is not added to any other tool's list), search (the alias list and counts) and tool-capabilities; the URL inventory was regenerated (76 live pages). Those, the page-shell, build-output, design-token and button-contrast unit tests pass.
- **Browser, `tests/browser/jwt-decoder.spec.js`: 23 tests per project**, run on `subpath-desktop` and `subpath-mobile` with one worker: initial state and attributes, example and "no auto-decode", Decode and Ctrl+Enter, six kinds of unreadable input with located errors, `Bearer` and wrapped lines, hostile script-like text (nothing runs, nothing is created, no link), visible escapes for bidirectional characters, explicit copy (stubbed clipboard: only decoded text, never the token or signature, never read), Clear, the stale-results note, privacy (no non-GET or fetch/XHR/beacon request, empty storage, unchanged address and title, nothing logged), keyboard path, accessibility semantics, 320, 360 and 390 px with 8,000-character values (no page-level overflow, readable text, 44 px buttons), Developer Tools listing, related links, and global search. Two page-level mutations (inserting HTML instead of text, decoding on every keystroke) were each caught, then reverted.
- **Existing specs updated:** the Developer Tools count (3 to 4) and the All Tools group count (14 to 15) in the JSON Formatter, Text Diff, Unix Timestamp, Time Zone, Image Compressor and navigation specs, plus the stale calculator counts above; the affected tests pass.
- **Visual baselines:** only the All Tools and Developer Tools listing pages changed (a new card), on desktop and mobile; each was reviewed. No baseline was created for the new tool page.
- **Static:** inventory, links, assets and SEO checks pass for both builds.

## Known limitations

- Compact tokens with a JSON object header and payload only; no JWE, no non-JSON payloads, no other claim types interpreted.
- A fraction in a NumericDate is shown to the millisecond.
- The status lines use the device clock; a wrong device clock gives wrong lines, and the page says so.
- An integer claim beyond 2^53 - 1 is disclosed rather than shown (the formatted payload keeps its exact digits); a fraction in a NumericDate is shown to the millisecond.
- **Stale counts found and corrected in the same phase (not caused by this tool):** the catalog at HEAD already had 26 calculator entries (14 published, 12 Coming Soon) since the SWP pack, so two `navigation.spec.js` assertions that expected 25 (13 built) and one `percentage.spec.js` assertion that expected 13 Coming Soon were out of date. They now read 26 (14 built) and 12; the JWT Decoder does not appear on the calculators page.

## Verification status

- **Android (real device): PENDING USER VERIFICATION.** Not done. It should cover pasting a long token from the clipboard, Decode, Copy header and Copy payload, a long unbroken value, and the keyboard covering the input.
- **Safari/WebKit: UNVERIFIED.** Not available here. The page uses nothing exotic (`textContent`, `navigator.clipboard` with an `execCommand` fallback, `Intl.DateTimeFormat`), but this is not evidence.
- Chrome desktop and the mobile emulation project: verified as above. A screen reader was not used; the accessibility checks are semantic assertions.
