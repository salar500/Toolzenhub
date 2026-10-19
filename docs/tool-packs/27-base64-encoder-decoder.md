# Tool Pack 27: Base64 Encoder & Decoder (Developer Tools)

Status: **approved 2026-10-13 (decisions D1 to D7)** and implemented as one bounded scope under factory section 2a (compact format); see section 14 for the implementation notes. The roadmap was not changed by this pack when it was implemented; it was updated afterward, in a separate documentation phase (2026-10-19), to record this pack as completed.
Roadmap: R1 item 5 (it was a candidate, not an authorization, when this pack was specified: this specification and its approval are what authorized the build). R1 now records it as completed (5 of 8).
Tier: **LOW** (a text converter with fixed, public rules; no money, tax or legal content, no stored data).
Id, slug and route: `base64-encoder-decoder`, `/tools/base64-encoder-decoder/` (decision D1). Section: **Developer Tools** (`developer-tools`, flat, no category), the sixth tool after the JSON Formatter, Unix Timestamp Converter, Text Diff, JWT Decoder and Cron Expression Explainer.

## 1. Identity check (verified 2026-10-13)
- No Base64 tool, alias, route, article or Coming Soon entry exists (searched the catalog, `src/_data`, the URL inventory and the docs). The JWT Decoder contains a private base64url routine for tokens; it is not a Base64 tool and is **not changed**.
- Convention in use: catalog id = slug; Developer Tools tools live at `/tools/<slug>/`; module `assets/js/tools/<slug>/index.js`, CSS `assets/css/tools/<slug>.css`, style entry in `src/_data/toolStyles.json`, one Growth ledger record, `autoRelated: false` with a curated `relatedTools` list.
- Title (D1): **Base64 Encoder & Decoder** (the catalog writes "&", as in "JSON Formatter & Validator").

## 2. Decision and scope
**The decision it supports:** "What is this Base64 text, or what is the Base64 of this text, right now, without sending it anywhere?" Developers meet Base64 in config values, headers, data URIs, e-mail and tokens, and often paste data they would rather not upload.
**In V1:** encode text to standard Base64; decode standard Base64 to text; mode switch; strict, specific validation; copy; reset; one example per mode.
**Out of V1 (deliberate):** file or image conversion, drag and drop, URL-safe Base64 as a mode (the JWT Decoder covers base64url tokens), MIME line wrapping on output, hex or binary display, other encodings (Base32, Base58, hex), charset choices other than UTF-8, download or export, history, any stored data, any network call.

## 3. Behaviour
**Layout:** shared calculator-page shell (intro, form card, result, assumptions, static sections, FAQ). A radio group "Direction": **Encode text to Base64** (default) and **Decode Base64 to text**. One multi-line input (label follows the mode: "Text to encode" / "Base64 to decode") and one action button whose label follows the mode (**Encode** / **Decode**). **Ctrl/Cmd+Enter** in the input runs it; plain Enter inserts a newline. Nothing converts while typing (the result area would otherwise change under a screen reader on every key). Buttons: the action, **Copy result**, **Load example**, **Reset**.
**Switching direction:** keeps the input text, clears the result and any error, announces the new mode.
**Result:** a read-only, selectable, focusable text region plus one metadata line ("12 bytes of text, 20 characters of Base64" / "Decoded 13 bytes as UTF-8 text"). **Copy result** sits with the result, so it is not offered (hidden) until a result exists; it copies exactly the result text, announces "Copied" (or "Copy was not available; select the text and copy it yourself" when the clipboard call fails). The result is shown with `textContent` only, never as markup.
**Stale marker:** editing the input or switching mode after a result marks the shown result "out of date" until the action runs again (the Credit Card Payoff pattern).
**Reset:** clears input, result and errors, returns to Encode, focuses the input, announces "Reset."
**Examples:** Encode: `Hello, World!`. Decode: `SGVsbG8sIFdvcmxkIQ==`. "Load example" fills the input for the current mode and does not run it.

### Encoding rules (D2)
- The text is converted to UTF-8 bytes exactly as typed (no trimming; line breaks as the browser's text box holds them, `\n`), then to standard Base64 (RFC 4648 section 4 alphabet `A-Z a-z 0-9 + /`) **with `=` padding and no line breaks**.
- Empty input is an error ("Enter some text to encode."), not a result.
- A string with an unpaired surrogate (which UTF-8 cannot represent) is refused with the position, not silently changed to U+FFFD.
- Limit: **1,000,000 bytes of UTF-8**, measured after encoding to UTF-8 (D5).

### Decoding rules (D3, the part that must not be ambiguous)
1. **Whitespace:** space, tab, CR and LF are ignored anywhere in the input (pasted MIME and PEM-style blocks carry line breaks). Any other whitespace or control character (for example a no-break space) is an error naming the character and its 1-based position. The metadata line says when whitespace was ignored.
2. **Alphabet:** only `A-Z a-z 0-9 + /` and trailing `=`. `-` or `_` gets the specific hint "this looks like base64url; V1 reads standard Base64 only". Any other character is an error naming the character and its position (in the input as typed).
3. **Padding:** `=` may appear only at the end, at most two. With padding present, the cleaned length must be a multiple of 4. **Missing padding is accepted** when the cleaned length leaves a remainder of 2 or 3 (the usual state of a copied value), and the metadata line says "Padding was missing and is assumed." A remainder of 1 is always an error ("a single leftover character cannot encode a byte; the text is probably truncated").
4. **Canonical last character:** the unused low bits of the last character must be zero (RFC 4648 section 3.5 permits rejecting otherwise). `QR==` is an error ("the last character carries extra bits; this is not how an encoder writes it"); common libraries accept it, this tool reports it because it usually means a typo or truncation (D3).
5. **Result must be UTF-8 text:** the bytes are decoded as strict UTF-8 (a leading byte-order mark is kept, not dropped, so the round trip is exact). If they are not valid UTF-8 the tool shows no garbled text: "These N bytes are valid Base64 but not UTF-8 text (they look like binary data). V1 shows text only." No hex view (out of scope).
6. **Empty input** (or only whitespace) is an error ("Enter some Base64 to decode.").
7. Limit (D5, clarified at approval): **1,333,336 submitted characters, whitespace included** (the padded Base64 size of 1,000,000 bytes). Encoding is limited to **1,000,000 UTF-8 bytes** (measured in bytes, not characters). Over the limit: an error with the limit, nothing is processed.
8. Errors are never partial results: one specific message at a time (the first problem found, with its position), shown in the linked error element; the result area is cleared.

## 4. Engine (pure module)
`assets/js/tools/base64-encoder-decoder/base64-engine.js`: `encodeText(text)`, `decodeBase64(input)`, limits as exported constants, structured results `{ok, value, notes}` / `{ok:false, code, message, position?}`. No DOM, network, storage or `Date`. It implements the Base64 table itself (strict validation needs control `atob` does not give) and uses `TextEncoder`/`TextDecoder({fatal:true, ignoreBOM:true})` for UTF-8. It does **not** import the JWT engine, and the JWT Decoder is not edited. Chunked work, so a 1 MB input does not build one giant intermediate string.

## 5. Accessibility and mobile
Labelled fields; hint and error linked with `aria-describedby`/`aria-invalid` (shared `setFieldsInvalid`); one polite live region (one sentence per action: mode change, result summary, error, copied, reset); a visible focus ring on every control including the result region; radio group with a legend, arrow-key navigation and a 44px target; no meaning by colour alone; reduced motion respected; heading order h1, h2. Mobile: single column at 320, 360 and 390 px, no page-level horizontal scroll, inputs 16px (no zoom on focus), result text wraps (`overflow-wrap: anywhere`) and never widens the page, buttons at least 44px high and not clipped at 200% text. The shared-layer green-contrast observations are not re-litigated.

## 6. Search, relationships, SEO
Aliases (all true, no invented ones): `base64 encoder`, `base64 decoder`, `base64 encode`, `base64 decode`, `base64 converter`, `text to base64`, `base64 to text`. Queries to check: "base64", "base64 decode", "text to base64", "decode base64 string".
`autoRelated: false`; `relatedTools: ["jwt-decoder", "json-formatter"]` (a token's parts are Base64 text; JSON often travels as Base64). One-way: the JWT and JSON pages are **not** edited, so their related lists do not change. No related articles, no articles (none are proposed; any later article needs separate approval and ledger ids).
SEO title "Base64 Encoder & Decoder: Convert Text Online | ToolZen Hub" (D1); description: "Encode text to Base64 or decode Base64 back to text, with UTF-8 support and clear errors for invalid input. It runs in your browser: nothing is uploaded." Canonical `https://toolzenhub.in/tools/base64-encoder-decoder/`; one h1; headings: How to Use; What Base64 Is and Is Not (an encoding, **not encryption**: it hides nothing); How This Tool Reads Your Input (rules 1 to 7 above in plain words); FAQ (3 to 5 items). No keyword-volume or ranking claims. Capabilities: `reset, copy, validation, explanation, examples, localProcessing` (as the JWT Decoder).

## 7. Integration touch-list (from factory section 7 and the Cron Explainer commit `571194a`, the nearest precedent)
**New:** `assets/js/tools/base64-encoder-decoder/index.js` and `base64-engine.js`; `assets/css/tools/base64-encoder-decoder.css`; `tests/unit/base64-encoder-decoder.test.mjs`; `tests/browser/base64-encoder-decoder.spec.js`.
**Edited:** `assets/js/data/tools.js` (new published entry after the Cron Explainer); `assets/js/data/categories.js` (Developer Tools `seoDescription` and `summary` name the new tool); `src/_data/toolStyles.json`; `scripts/growth-manifest/identity-ledger.json` (one record: module `assets/js/tools/base64-encoder-decoder/index.js`, provenance `added`, state `active`, same commit as the catalog entry); `tests/inventory/url-inventory.json` (regenerate: one more live page, 81 from 80).
**Pinned expectations expected to move** (edit deliberately, named by running the focused unit suites first): `catalog`, `sections`, `relationships`, `search`, `tool-capabilities` and, if its counts are pinned, `growth-manifest-ledger` unit tests; the Developer Tools counts in `navigation`, `json-formatter`, `text-diff`, `unix-timestamp-converter`, `time-zone-converter` and `image-compressor-resizer` browser specs.
**Baselines expected to change** (review each by eye; update only those): DOM `home-main` and `tools-directory`, links summary, SEO baseline; visual `developer-tools` (desktop, mobile), `tools` (desktop, mobile) and `home` (tablet), if they differ. The known unrelated failures stay untouched: the image-compressor smoke failure and the `home-loan` tablet baseline.
**Not touched:** the engine or page of any other tool, articles, rulebooks, the roadmap (marking item 5 implemented is a separate docs commit after approval).

## 8. Correctness vectors (independent of the code under test)
Written into the unit test as literals. Values were computed with Python's `base64` module (not the JavaScript) and the RFC 4648 section 10 test vectors; the unit test also cross-checks a few against Node's `Buffer` as a second, independent implementation.
- **RFC 4648 section 10:** `""`→`""`; `f`→`Zg==`; `fo`→`Zm8=`; `foo`→`Zm9v`; `foob`→`Zm9vYg==`; `fooba`→`Zm9vYmE=`; `foobar`→`Zm9vYmFy`.
- **ASCII:** `Hello, World!`→`SGVsbG8sIFdvcmxkIQ==`; `Hello, ToolZen Hub!`→`SGVsbG8sIFRvb2xaZW4gSHViIQ==`; `a⏎b` (LF)→`YQpi`; NUL→`AA==`.
- **Unicode (UTF-8 bytes in brackets):** `é` (C3 A9)→`w6k=`; `€` (E2 82 AC)→`4oKs`; `😀` (F0 9F 98 80)→`8J+YgA==`; `日本語`→`5pel5pys6Kqe`; `नमस्ते`→`4KSo4KSu4KS44KWN4KSk4KWH`; `é€😀`→`w6nigqzwn5iA`; BOM + `A` (EF BB BF 41)→`77u/QQ==` (decodes back with the BOM kept).
- **Alphabet edge:** bytes FB FF → `+/8=`; FF FE FD → `//79` (the `+` and `/` characters).
- **Decode acceptance:** `SGVsbG8sIFdvcmxkIQ` (padding missing, accepted with the note); `SGVs\nbG8s\r\nIFdv cmxkIQ==` (whitespace ignored); `Zg` → `f`.
- **Decode refusal** (specific message and position): `Zg=` (bad padding); `Zg===`, `Z=g=`, `=Zg=` (misplaced or excess `=`); `Z` and `Zm9vY` (remainder 1); `QR==` (non-canonical last character); `Zm9v!` (position 5); `Zm9v ` (no-break space); `-_8=` (base64url hint); empty and whitespace-only; `/w==` (byte FF) and `gA==` (byte 80) → valid Base64 but not UTF-8; over-limit input.
- **Round trips:** for every vector above and 200 pseudo-random strings (fixed seed, including astral characters), `decode(encode(x)) === x` and `encode` output is canonical (a multiple of 4 characters, only the alphabet and trailing `=`); the encoded length is `4*ceil(n/3)`.
- **Limits:** 1,000,000 bytes encodes; 1,000,001 is refused; 1,333,336 characters (whitespace included) decodes; 1,333,337 is refused. Timing: a 1,000,000-byte encode and decode complete well under a second (asserted loosely, not as a benchmark).

## 9. Focused test plan (LOW tier, run once at the end; focused runs during development)
- **Unit** `tests/unit/base64-encoder-decoder.test.mjs`: section 8 in full; validation messages and positions; no `Date`, network or storage in the module; purity and determinism.
- **Browser** `tests/browser/base64-encoder-decoder.spec.js`, one worker, subpath-desktop and subpath-mobile: page, breadcrumb (Home, Tools or Developer Tools as the existing tools show it), both modes, example and result, Ctrl+Enter, specific errors with linked `aria-invalid`, stale marker, Reset and focus, Copy (granted, and the failure message when the clipboard is unavailable), a Unicode round trip through the UI, non-UTF-8 message, keyboard path and arrow keys on the radios, live-region sentences, privacy (no request, no storage, no console echo of the input), 320/360/390 px with a 100,000-character input, 200% text, listing in Developer Tools and All Tools, search by alias, related tools (JWT Decoder, JSON Formatter), direct URL and refresh.
- **Shared and static:** the focused unit suites named in section 7, the Developer Tools listing and navigation specs, `inventory:check`, links, assets, SEO, both builds, `export.mjs --check` **after** the commit, and the affected visual comparisons (section 7), reviewed by eye before any baseline is updated. No full regression. Root-desktop only for the portable smoke and link crawl of the new page.
- **Not tested, said plainly:** real Android, Safari and WebKit (unverified until the R1 milestone); no Lighthouse run unless asked.

## 10. Acceptance criteria
1. Every vector in section 8 passes, and the three-way agreement (literals from Python and the RFC, Node `Buffer`, the engine) holds.
2. Every decoding rule in section 3 has a test and a user-facing message; no input produces a silent substitution, a partial result or an exception.
3. Nothing is sent, stored or logged; the result is never injected as markup.
4. The page, catalog, route, aliases, breadcrumbs, SEO and sitemap follow the existing conventions; no equivalent route exists; the Growth record is in the same commit and the post-commit check passes.
5. Mobile and keyboard checks of section 5 pass at 320, 360 and 390 px.
6. Pinned tests and baselines change only where this tool genuinely changes them, each reviewed; unrelated tools' behaviour is unchanged.
7. One local commit for the bounded scope; nothing pushed or deployed; the report states what was and was not run.

## 11. Risks and stop conditions
- **Risks:** users treating Base64 as secrecy (mitigated by the "not encryption" section); a 1 MB textarea on a low-end phone (mitigated by the limit and chunked work; a slow case is reported, not hidden); strictness (rule 4) rejecting a non-canonical value that other tools accept (the message says why; decision D3 can relax it); clipboard availability.
- **Stop and report:** an unexpected change in the working tree; a vector the engine and an independent method disagree on; a visual difference the new card does not explain; a failing required check; any need to edit another tool or a rule. If any of these needs a rule change, ask separately.

## 12. Decisions (all approved 2026-10-13)
- **D1** Id/slug/route `base64-encoder-decoder`, title "Base64 Encoder & Decoder" (the roadmap writes "Encoder/Decoder"; the catalog writes "&").
- **D2** Encode output is padded, standard-alphabet, with no line wrapping; empty input is an error.
- **D3** Decode accepts missing padding and ignores **only** ASCII space, tab, CR and LF; rejects everything else, including non-canonical trailing bits (`QR==`), which many decoders accept. The page explains the strictness in the hint, the error text, the "How This Tool Reads Your Input" section and the FAQ.
- **D4** Non-UTF-8 decoded bytes show an explanation, not garbled text and not a hex view.
- **D5** Limits: 1,000,000 UTF-8 bytes to encode; 1,333,336 submitted characters (whitespace included) to decode.
- **D6** Explicit Encode/Decode action (button and Ctrl/Cmd+Enter), no convert-as-you-type.
- **D7** One-way related tools (JWT Decoder, JSON Formatter); no article; no edit to other tools.
- Tier **LOW**, independently checked literal vectors, no separate Python oracle (factory section 2a).

## 13. Efficiency benchmark (first pack under the fast workflow; recorded, not assumed)
- **Baseline, PPF (Tool Pack 26):** about five approval rounds (specification, three phases, a visual-baseline correction), then a separate governance commit. Elapsed time and token usage were not recorded.
- **Target for Tool Pack 27:** one specification approval and one bounded implementation approval, one implementation commit.
- **Recorded so far:** specification stage = **1 user prompt** and 1 Claude run; elapsed wall time is filled in below when the specification is delivered.
- **To record at the end** (no tracking framework: a line in the implementation notes): number of user approvals and Claude runs, elapsed time from the command timestamps where observable, and tests run versus reused. **Token usage will be recorded only if the session exposes reliable usage data; otherwise it is stated as not measured.** No saving is claimed without these numbers.
- Specification stage elapsed time: about 2 minutes of command time (first command to file written; thinking time between commands is not observable). Token usage: not available to this session, not measured.

## 14. Implementation notes (2026-10-13)
Facts only. Tier LOW; one bounded scope; one local commit (`feat: add Base64 encoder and decoder`).

**Architecture.** `assets/js/tools/base64-encoder-decoder/base64-engine.js` (pure; own Base64 table, strict rules of section 3, `TextEncoder`/`TextDecoder({fatal, ignoreBOM})`); `index.js` (markup, `render`, `init`; `showRelatedCalculators` and `showRelatedArticles` false; related tools linked from the text through the catalog); `assets/css/tools/base64-encoder-decoder.css`; catalog entry after the Cron Explainer (`autoRelated: false`, related `jwt-decoder`, `json-formatter`); `categories.js` Developer Tools text; `toolStyles.json`; Growth ledger record (provenance `added`). The JWT Decoder and every other tool are unchanged.

**Correctness evidence.** `tests/unit/base64-encoder-decoder.test.mjs` (19 tests): the RFC 4648 section 10 vectors and the Python `base64` values of section 8 as literals; Node's `Buffer` as a second independent implementation (including 200 seeded random strings with astral characters); every refusal with its code and position; the limits at and over the boundary; BOM kept; purity of the module. No separate Python oracle (LOW tier).

**Page and integration evidence.** `tests/browser/base64-encoder-decoder.spec.js` (21 tests) passes on subpath-desktop and subpath-mobile (both directions, Ctrl+Enter, specific refusals with linked errors, limits in the page, direction switch, out-of-date marker, Reset, Copy including a refusing clipboard, privacy, hostile text, keyboard, 320/360/390 px, 200% text, listing, search, related links, refresh). Root-desktop: smoke for the new page and the rendered-link crawl pass. Static checks (inventory 81 pages, links, assets, SEO) pass on both builds. Unit suite: 2,452 tests, 0 failures in the final run (one earlier full run reported one failure that did not recur in two reruns and was not identified; the only timing-based assertion, the 1,000,000-byte round trip, was loosened from 1.5 s to 5 s as a precaution).
Pinned expectations changed: the catalog, sections, relationships, search and tool-capabilities unit tests, and the Developer Tools counts (5 to 6; 17 to 18 directory groups) in the json-formatter, text-diff, unix-timestamp-converter, time-zone-converter, image-compressor-resizer and navigation browser specs; the "no base64" placeholder check in three specs now allows the live tool. Those specs pass on desktop (and on mobile for the changed tests).
Baselines refreshed after reviewing each by eye: DOM `home-main` and `tools-directory`, links summary, SEO; visual `developer-tools`, `tools` and `home` on mobile (the new card adds about 140 to 150 px; the longer Developer Tools summary wraps one more line on the home page). The desktop and tablet visual comparisons for these pages pass without change (the card is within the tolerance).

**Growth.** `node scripts/growth-manifest/export.mjs --check` is run after the commit (result in the final report).

**Deviations from the specification.**
1. Copy result is hidden until a result exists (it sits with the result block) instead of disabled.
2. A browser text box turns CRLF into LF, so a pasted two-character line break counts as one ignored whitespace character in the page; the engine counts what it is given (the unit test counts CRLF as two).
3. The result block is a labelled, focusable `pre` (not a landmark region).

**Known limitations.** Text only (no files); standard Base64 only (base64url is refused with a hint); UTF-8 only; strict last-character check (decision D3); real Android, Safari and WebKit are UNVERIFIED (R1 milestone); no Lighthouse run. Known unrelated failures left alone: the image-compressor smoke test (images without `src`) and the `home-loan` tablet visual baseline.

**Efficiency measurements (first pack under section 2a of the factory).**
- Approval rounds: 2 (specification, then one bounded implementation), against about 5 for PPF. One local commit for the implementation.
- Elapsed wall time for the implementation run: about 94 minutes from the first command to the last test, of which roughly 24 minutes was one broad browser batch (a wider shared-spec selection than needed: it ran 11 spec files including the unrelated Cron and JWT specs, and the baselines specs, to catch the pinned counts) and about 10 minutes the unit and static runs; the rest was writing and focused reruns. A narrower first run (`-g` on the Developer Tools listing and count tests only) would have found the same 16 failures in a few minutes: the single most useful saving for the next pack.
- Tests run versus reused: the unit suite was run in full 4 times (twice more than needed); the new spec ran on desktop and mobile once each after fixes; earlier PPF evidence was not reused for anything here (different tool).
- Token usage: not available to the session; not measured. No saving is claimed.
