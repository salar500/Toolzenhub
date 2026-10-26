# Tool Pack 37: URL Parser & Encoder

STATUS: IMPLEMENTED locally (not pushed, not deployed)
TIER: MEDIUM (fast tool pack, factory section 2a). Pure string transforms; the parser is the browser's own.
REQUIREMENTS: `docs/ecosystem-review/developer-tools/05` section D (FR-UP-001..026), `06` (SEC-013..016, NFR-016, 018, 019, 021), `07` (AC-UP-001..035). Those are the specification; this file records what was built and how it deviates.

## Decision

A Developer Tools page for people debugging request URLs. Route `/tools/url-parser/`, id `url-parser`, section `developer-tools`. Three modes: parse a URL, encode or decode text, build a query string. Everything runs in the browser; a URL is only ever shown as text (never an `href`, image source or navigation), never fetched, and no URL or hash state or storage exists because a URL can hold a token.

## Files

- `assets/js/tools/url-parser/url-engine.js`: pure engine (parse and explain, percent/form encode, strict decode, query read and build). No DOM, network, storage or clock; a unit test scans it for those tokens.
- `assets/js/tools/url-parser/index.js`: page (`markup`, `render`, `init`; related blocks off, like the other Developer Tools).
- `assets/css/tools/url-parser.css`, entry in `src/_data/toolStyles.json`, catalog entry in `assets/js/data/tools.js`, Growth ledger entry.
- `tests/unit/url-parser.test.mjs` (31 tests, hand-derived vectors), `tests/browser/url-parser.spec.js` (18 tests across three phone widths).

## Rules as built

- Parsing: `new URL` in try/catch (no `URL.canParse`). Input limit 100,000 characters. Leading and trailing C0/space ignored with a note. No scheme and no Base URL is refused, not guessed. At most one deterministic hint on failure (no scheme, port over 65535, forbidden host character, unmatched `[`).
- "What changed" is a closed list computed by comparing components with the raw text: scheme lowercased, host lowercased, default port removed, dot segments resolved, characters percent-encoded, non-ASCII host converted to punycode, backslashes treated as slashes, tabs or newlines removed. Not computed when a Base URL is used (the page says it resolved against it).
- Percent-encode keeps `A-Z a-z 0-9 - . _ ~` and writes uppercase `%XX`; an option keeps `! ' ( ) *`. Form-encode is the WHATWG serializer (`* - . _` kept, space to `+`, `~` to `%7E`). Decoding is strict with positions; invalid UTF-8 is detected by a well-formed-table validator (RFC 3629) and never replaced; lone surrogates are errors.
- Query rows keep order, repeats, empty values and a missing `=`. 500 rows shown at most; builder accepts 100 rows.
- Small inputs (20,000 characters or fewer) update as you type; larger ones wait for the button.

## Deviations from the planning documents (recorded, not silent)

1. **Focus on mode switch.** FR-UP-023 said a mode switch moves focus to the mode's first field. The keyboard test showed that stops the arrow keys cycling the three modes (FR-UP-024). Focus now stays on the radio. Doc 05 and the progress ledger (L2) are corrected.
2. **No shared clipboard module.** SH-004 proposed one; each page keeps the established per-page copy code (ledger L1).
3. **Related-tools block off.** The Developer Tools pilot is not approved (DEC-OWN-3). The catalog `relatedTools` metadata is set; the page text links the Base64 and JSON tools.

## Verification (this machine, Chrome only)

Unit: 31 new tests pass. Browser: `url-parser.spec.js` 18 of 18 pass on subpath-desktop and on subpath-mobile; `root-desktop` does not select this spec (NOT RUN). Static: inventory, links, assets and SEO checks pass. Visual: the Developer Tools listing baselines were inspected and updated (one extra card); the new page was looked at on desktop and at 390 px. Not verified: Safari, Firefox, real Android, a screen reader.

## Rollback

Revert the pack's commit: catalog entry, ledger entry, style entry, inventory, the edited counts in older specs and the three baselines return together.
