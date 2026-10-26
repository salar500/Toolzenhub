# 02. Research evidence and competitor review

PROJECT: ToolZenHub
ECOSYSTEM: Developer Tools
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASES: 0, 1 AND 2
PURPOSE: Research and requirements baseline

Research date: **2026-10-26**. Method follows rulebook section 12 (evidence classes: verified data, public evidence, reasoned hypothesis, unknown). Tools used: page fetches (`WebFetch`, which converts a page to text and answers a question about it with a small model) and `WebSearch` result summaries. Nothing was exercised interactively in a browser, so **no competitor feature below was tested by use**; "observed" means "stated on the fetched page text".

## 1. What could not be obtained (UNKNOWN, stays unknown)

| Item | Status |
| --- | --- |
| Search volume, keyword difficulty, trend direction for any candidate | **UNKNOWN.** No Google Trends, Keyword Planner or Search Console data was reachable or supplied. Nothing is estimated |
| ToolZenHub's own Search Console or GA4 data for the six existing tools | **UNKNOWN** (none supplied; GA4 is consent-based and undercounts, rule 8.8) |
| Stack Overflow view counts | **UNKNOWN.** A search aimed at them returned tutorials, not question pages |
| Repeat-use and retention for any tool | **HYPOTHESIS** only |
| Real-world complaint rates about competitors | **UNKNOWN** (no review or issue data was gathered) |

## 2. Evidence register

| ID | Source (date read 2026-10-26) | Class | Finding |
| --- | --- | --- | --- |
| E1 | https://www.rfc-editor.org/rfc/rfc9535.html | PUBLIC (standard) | JSONPath is **RFC 9535**, IETF Standards Track, February 2024. Selectors: name, wildcard, index (negative allowed), slice, filter; child and descendant segments; function extensions `length()`, `count()`, `match()`, `search()`, `value()`. An implementation **must** raise an error for a malformed query and must not silently malfunction; integers must be within the I-JSON range. Section 1.5 holds an example document and Table 2 of queries with intended results; section 2.7 defines Normalized Paths. The last ~31,000 characters of the page were not read |
| E2 | https://github.com/jsonpath-standard/jsonpath-compliance-test-suite | PUBLIC | A **compliance test suite** for RFC 9535 exists: cases in a `tests` directory built into `cts.json`, with a `cts.schema.json`; non-deterministic cases list all valid results. The licence file exists but **its type was not visible**; the test count and last update were not visible |
| E3 | Search summary, "JSONPath online evaluator RFC 9535" | PUBLIC (secondary) | One browser tester (Codeshack) says it uses the `jsonpath-plus` engine, which is **not** described as RFC 9535-compliant. Some libraries claim RFC 9535 compliance (an Elixir package says it passes the compliance suite; a .NET package self-reports 324 of its own tests). **No independent review of any online tester's conformance was found.** The Codeshack page itself returned HTTP 403 when fetched, so its features are from the search summary only |
| E4 | https://jsonpath.com/ | not observable | The fetched text held only the title (the page is script-rendered). **No features recorded** |
| E5 | https://www.jsonschemavalidator.net/ | PUBLIC (page text) | Built with Json.NET Schema and C#; drafts 3, 4, 6, 7, 2019-09, 2020-12; "Saved URL" with a Save button; no statement on how input is handled; "View source code" link points to a placeholder; two unlabeled "Format" controls |
| E6 | https://coderspace.io/en/tools/json-diff/ | PUBLIC (page text) | Two inputs with file pickers; array matching by position or by key; options: only differences, ignore array order, ignore key order, treat numbers and text alike; counters for added, removed, value changed, **type changed**, moved, unchanged; collapsible tree, key path copy; **RFC 6902 JSON Patch export** with copy and download and a self-check that applies the patch; invalid JSON reported with line and column; repeated keys flagged as warnings; states data is not uploaded. The page also carries a Log In link and promotions for a paid product and a course |
| E7 | Search summary, "online JSON diff compare tool" | PUBLIC (secondary) | Several vendor pages describe structural comparison that ignores key order; one flags type changes separately; one has paid features ($10/month, per its own page); most say processing is local, **not independently verified** |
| E8 | https://konklone.io/json/ | PUBLIC (page text) | JSON to CSV: paste or drop; table preview of the first rows and a row count; CSV download; comma, tab or semicolon; says data is never sent to servers; warns very large files may fail; **page text does not say how nested objects are handled** |
| E9 | https://www.uuidgenerator.net/ | PUBLIC (page text) | UUID versions 1, 4, 7, Nil and GUID; bulk count with download; states a secure random generator; **uses cookies for personalised content and ads**; no maximum count stated |
| E10 | https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest | PUBLIC (documentation) | Algorithms: SHA-1, SHA-256, SHA-384, SHA-512. **MD5 is not supported.** Secure contexts only (HTTPS). Whole input must be in memory (no streaming). Baseline widely available since January 2020 |
| E11 | https://www.rfc-editor.org/rfc/rfc9562.html | PUBLIC (standard) | UUID v1 to v8 defined; applications without legacy needs **should use v7** (Unix-time ordered); v4 is random and a cryptographic generator is recommended. UUIDs should not be treated as security capabilities. The last ~19,500 characters were not read |
| E12 | https://developer.mozilla.org/en-US/docs/Web/API/URL | PUBLIC (documentation) | `URL` and `URLSearchParams` follow the WHATWG URL Standard and are widely available; the constructor throws on invalid input; `URL.canParse` and `URL.parse` have uneven support; relative URLs need a base; percent-encoding and IDN conversion are automatic. The page does not itself document the parser internals |
| E13 | https://github.com/cfworker/cfworker (json-schema package) | PUBLIC (page text) | A JSON Schema validator supporting drafts 4, 7, 2019-09 and 2020-12 that **avoids `eval` / `new Function`** (it states Cloudflare Workers lack those APIs for Ajv). **Licence, size and dependency figures were not visible on the page**; the error format was not shown |
| E14 | Repository: `docs/ecosystem-review/02`, `05`, `12`, `docs/tool-pack-factory.md` | VERIFIED | JSON Schema & JSONPath Lab is the only Developer Tools item in an authoritative planning list (P1, "extend JSON Formatter, do not duplicate", needs a library audit); Regex Tester excluded; the rest are "unevaluated commodities" |

## 3. Observed developer problems (what the sources support)

| Problem | Support | Class |
| --- | --- | --- |
| "What exactly changed between these two JSON payloads?" when key order, whitespace and number formatting differ | E6, E7 show several tools exist because a text diff is noisy for JSON | PUBLIC; the **size of the need is UNKNOWN** |
| "Does my JSONPath do what I think?" with a standard now published (2024) while an observed tester uses a non-standard engine | E1, E3 | PUBLIC for the standard and the tester's engine claim; "users are hurt by this" is a **HYPOTHESIS** |
| Validate a payload against a JSON Schema | E5 (the tool exists), E14 | PUBLIC existence; demand UNKNOWN |
| Parse and re-encode URLs and query strings | E12 (the platform already does it natively) | PUBLIC; competitor audit **not done** |
| Convert JSON to CSV | E8 (a long-lived free tool exists) | PUBLIC; nested-object handling is the unresolved quality question |
| Generate UUIDs and hashes | E9, E10, E11 | PUBLIC; both are commodities with native browser support (`crypto.randomUUID`, SubtleCrypto), so differentiation is weak (**HYPOTHESIS**) |

## 4. Competitor observations relevant to differentiation

| Competitor | What it does that matters | What the page text does not show |
| --- | --- | --- |
| coderspace JSON Diff (E6) | the richest feature set observed: key matching, move detection, JSON Patch with self-check | how numbers like `1` and `1.0` are treated beyond a "Treat numbers and text alike" option; mobile layout; behaviour on 1 MB inputs; accessibility. Header login link and promotions are present |
| jsonschemavalidator.net (E5) | six drafts; saved URLs | privacy statement for input; labels for its controls; error presentation |
| Codeshack JSONPath tester (E3, secondary) | match counts, highlighted data, paths or JSON Pointers | RFC 9535 conformance (its engine is not described as compliant) |
| konklone JSON to CSV (E8) | preview, delimiters, local processing | nested object handling |
| uuidgenerator.net (E9) | v1/v4/v7 and bulk | uses advertising cookies |

"No login" and "private" are **not** treated as differentiators (rule 12 item 5): several observed tools already state local processing.

## 5. Technical feasibility findings (PUBLIC, from E1, E10 to E13)

- RFC 9535 is a closed specification with a published compliance suite, so an in-house evaluator can be **checked independently** (the suite and the RFC's own tables).
- JSON Schema validation needs a validator whose **licence, size and conformance are not yet known** (E13); writing one in-house would risk unreliable output and fails the "reliable output" gate.
- SHA family hashing is native; MD5 would need a bundled implementation.
- `URL`/`URLSearchParams` and `crypto.randomUUID` are native, so a tool around them is mostly presentation.

## 6. Research limitations

Single-session, text-only, no interactive use of any competitor; two key pages were unreadable or only partly read (E4, E1 tail, E11 tail); no demand data of any kind; vendor claims of local processing were not verified; the licence of the JSONPath compliance suite is unknown. **Full market validation was not achieved**, and every demand-dependent score in 03 is labelled a hypothesis.

---

# Ecosystem 2.0 additions (research date 2026-10-26)

Second research pass for Developer Tools Ecosystem 2.0. Same method and limits as sections 1 to 6; the earlier evidence E1 to E14 stands. **No competitor was exercised interactively**: every "observed" item is text stated on the fetched page, which is a claim by that site, not a tested behaviour.

## 7. Additional evidence register

| ID | Source | Class | Finding |
| --- | --- | --- | --- |
| E15 | https://jwt.io/ | PUBLIC (page text) | Decoder and Encoder tabs; signature verification is optional (enter a secret, the page then shows "Signature Verified"); the page text shows **no explicit warning that decoding is not verification**; no statement on whether pasted tokens or secrets are stored or transmitted (its privacy text covers ad cookies and email lists); promotions for a handbook, an Auth0 account and other products |
| E16 | https://crontab.guru/ | not observable | The fetched text contained only "loading..." and Cronitor promotions (monitoring, a dashboard). **No editor features recorded** |
| E17 | https://jsoncrack.com/ | PUBLIC (page text) | JSON, YAML, CSV and XML to an interactive graph; exports PNG, JPEG, SVG; file or URL upload; "approximately 300 KB"; states data is processed in the browser and not stored; free and open source with premium features moved to another site (ToDiagram) |
| E18 | https://jsoneditoronline.org/ | not observable | HTTP 403 |
| E19 | https://it-tools.tech/ and https://github.com/CorentinTh/it-tools | PUBLIC | The site text held only its title; the repository shows **41.0k stars**, 5.5k forks, GPL-3.0, "Collection of handy online tools for developers, with great UX." The tool list was not shown |
| E20 | https://gchq.github.io/CyberChef/ and https://github.com/gchq/CyberChef | PUBLIC | Chained "recipes" run entirely in the browser with no server component (three named exceptions that make external calls); a "Magic" operation suggests decodings; recipe and input can be shared as a URL; files up to roughly 2 GB depending on the browser; Apache-2.0; repository **36.2k stars**, 4.2k forks |
| E21 | https://github.com/DevToys-app/DevToys and https://devtoys.app/ | PUBLIC | MIT; **32.1k stars**; a desktop app with **30 default offline tools**: Converters (Cron Parser, Date, JSON Array to Table/CSV, JSON to YAML, Number Base), Text (Escape/Unescape, List Comparer, Markdown Preview, Analyzer & Utilities, Text Comparer), Encoders/Decoders (Base64 Image and Text, Certificate, GZIP, HTML, JWT, QR Code, URL), Formatters (JSON, SQL, XML), Generators (Hash/Checksum, Lorem Ipsum, Password, UUID), Graphic (Color Blind Simulator, Image Converter), Testers (JSONPath, Regular Expression, XML/XSD) |
| E22 | https://jsonlint.com/ | PUBLIC (page text) | "Single-pass" engine that reports every error and warning at once; line numbers; documents common mistakes (trailing commas, unquoted keys); a Compress/minify button; loads JSON from a URL via `?url=`; links to a Compare tool, a schema validator, a JSONPath page, a JWT decoder, a tree viewer and converters; no stated limits; no privacy statement on the page |
| E23 | https://www.diffchecker.com/ | PUBLIC (page text) | Side-by-side default; unified view; options to hide or ignore whitespace and case, custom ignore rules (for example timestamps), precision Smart / word / character, hide unchanged lines, merge, inline comments; separate image, document and spreadsheet comparisons; unified view and word/character precision are "free to try and unlimited on Pro", an AI summary is a Pro feature; no sign-up for text, an account to save or share; says comparison runs in the browser; states ISO/IEC 27001 certification |
| E24 | https://www.freeformatter.com/ | not observable | Text held no tool names; an ad or tracking pixel request is visible in the page text |
| E25 | https://convertcase.net/ | PUBLIC (page text) | Seven case types; a sentence-case term list of about 3,000 terms with user additions; many unrelated text-style tools; a "Remove ads" paid link |
| E26 | https://www.urlencoder.org/ | PUBLIC (page text) | Encode and decode with many character sets (UTF-8 default), per-line and chunking options, newline choice; file upload up to 100 MB; **its page states that standard (non-live) encoding communicates with its servers over SSL, while live mode uses the browser's built-in JavaScript and sends nothing**; "we do not keep or inspect" submitted data; cookie notice mentions ads |

## 8. Demand evidence and what it does and does not show

| Signal | Class | What it supports | What it does not support |
| --- | --- | --- | --- |
| Three open-source developer-tool collections have 32.1k (DevToys), 36.2k (CyberChef) and 41.0k (IT Tools) GitHub stars (read 2026-10-26) | PUBLIC | There is substantial interest in **collections of local developer utilities**, so a coherent set is a plausible product | Demand for any **single** tool, for search traffic, or for repeat use. Stars measure interest in a repository, not usage |
| DevToys ships 30 default tools, including JSONPath, URL, UUID, Hash, List Comparer, Number Base, Cron and JWT (E21) | PUBLIC | The usual contents of such a toolkit; useful for candidate discovery | That ToolZenHub visitors want the same set |
| Google Trends | **UNKNOWN** | The Trends page returned HTTP 429 (rate limited); no trend or relative-interest data was obtained | Anything |
| Stack Overflow questions | **UNKNOWN** | The research tools could not access `stackoverflow.com` (the search API reports the domain is not accessible to its user agent); no question counts or views | Anything |
| ToolZenHub Search Console or GA4 | **UNKNOWN** | No such file is in the repository and none was supplied | Anything |
| India versus worldwide demand | **UNKNOWN** | No geographic data was available | Anything |

Repeat-use potential for every candidate remains a **hypothesis**.

## 9. Structured competitor comparison (observed page text only)

| Capability | JSONLint | JSON Crack | coderspace Diff | Diffchecker | jwt.io | urlencoder.org | CyberChef | DevToys |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Located JSON errors | stated | not stated | stated | n/a | n/a | n/a | n/a | n/a |
| Structural JSON compare | linked tool, undescribed | n/a | stated (key or position matching, patch) | text only | n/a | n/a | n/a | n/a |
| Local processing statement | not on page | stated | stated | stated (browser) | not stated | live mode only | stated | offline app |
| Account or login prompt | no | premium elsewhere | login link | needed to save/share | optional prompts | no | no | no |
| Ads or promotions visible | promotions | premium elsewhere | promotions | pricing | promotions | cookie/ads notice | none stated | none stated |
| Decode vs verify warning | n/a | n/a | n/a | n/a | **not stated** | n/a | n/a | not stated |

Blank or "not stated" means **the fetched text did not say**, not that the feature is absent.

## 10. What the second pass changes

1. **URL Parser & Encoder is promoted from P1 to P0.** A direct competitor's page (E26) says its standard encoding sends data to its servers; DevToys includes URL tools (E21); and the platform parses URLs natively (E12). The differentiation is now a **PUBLIC-supported claim about one competitor**, not a general one (see 03).
2. **A Base64URL mode for the existing Base64 tool becomes a P0 enhancement**: the JWT tool already handles base64url, the Base64 tool refuses it with a hint (spec 27 decision), and RFC 4648 gives independent test vectors.
3. **List Comparer** is a newly discovered candidate (E21), distinct from Text Diff, listed at P1.
4. The Regex Tester remains excluded; it appears in DevToys' tester set (E21), which is noted for the owner (DEC-OWN-4) and changes nothing.
5. **Not found:** no evidence was gathered that any existing tool is broken. Existing behaviour was checked in the repository (01 section 7).
