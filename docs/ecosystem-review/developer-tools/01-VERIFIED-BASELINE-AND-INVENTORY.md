# 01. Developer Tools: verified baseline and existing inventory

PROJECT: ToolZenHub
ECOSYSTEM: Developer Tools
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASES: 0, 1 AND 2
PURPOSE: Research and requirements baseline

Research and planning only, 2026-10-26. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed. Evidence labels: **VERIFIED** (read or run in this session), **PUBLIC** (a cited external page), **HYPOTHESIS** (reasoned, not measured), **UNKNOWN**. Authority: `docs/product-decision-rules.md` (sections 8, 9, 10, 11, 12), `docs/tool-pack-factory.md`, `docs/shared-tool-ux.md`.

## 1. Repository baseline (VERIFIED)

| Fact | Value |
| --- | --- |
| Branch / HEAD | `main` at `0dc368b`; `origin/main` is the same commit (the Time Tools program was pushed and the GitHub Pages preview is live) |
| Working tree | clean at the start of this phase |
| Stack | Eleventy 3.1.6, vanilla ES modules, `package.json` has **no runtime dependencies** (dev only: Eleventy, Playwright 1.63.0, Lighthouse 12.8.2) |
| Environments | GitHub Pages preview deploys from any push to `main` (`.github/workflows/pages.yml`); Hostinger production is manual and was not touched |
| Time Tools state | 13 tools implemented; **Android acceptance is still pending** (owner); production not approved |

## 2. Existing Developer Tools inventory (VERIFIED from `assets/js/data/tools.js`, modules, specs and tests)

Section `developer-tools`, landing `/developer-tools.html`, flat (no categories). Exactly **6** tools are catalog-`published`; there are no `coming-soon` Developer Tools entries.

| Tool | Route | Spec | Engine and module size | Hard limits (from the engine) | Unit / browser tests (counted) |
| --- | --- | --- | --- | --- | --- |
| JSON Formatter & Validator | `/tools/json-formatter/` | `15-json-formatter-validator.md` | `json-engine.js` + `index.js`, ~2,100 lines | 2,000,000 chars, live check to 200,000, depth 500 | 39 / 20 |
| Unix Timestamp Converter | `/tools/unix-timestamp-converter/` | `16-unix-timestamp-converter.md` | ~3,100 lines | to 9999-12-31T23:59:59Z; batch 200 entries or 100,000 chars | 54 / 25 |
| Text Diff / Compare | `/tools/text-diff/` | `18-text-diff.md` | ~2,100 lines | 300,000 chars and 20,000 lines per side; auto-compare to 60,000 chars | 55 / 28 |
| JWT Decoder | `/tools/jwt-decoder/` | `22-jwt-decoder.md` | ~1,800 lines | 100,000 chars | 41 / 19 |
| Cron Expression Explainer | `/tools/cron-expression-explainer/` | `25-cron-expression-explainer.md` | ~2,300 lines | 256 chars; next five times in **UTC** | 66 / 28 |
| Base64 Encoder & Decoder | `/tools/base64-encoder-decoder/` | `27-base64-encoder-decoder.md` | ~1,300 lines | encode 1,000,000 bytes; decode 1,333,336 chars | 19 / 19 |

Counts of `test(` blocks in `tests/unit/<tool>*.test.mjs` and `tests/browser/<tool>.spec.js`; they are counts of cases, not of passes.

### Capabilities (VERIFIED by the modules' own controls and the specs)

| Tool | Verified capabilities | Limitations (from its spec or code) | Action |
| --- | --- | --- | --- |
| JSON Formatter | Strict RFC 8259 check with offset, line, column and message; format; minify; duplicate-key and over-15-digit-integer **notes** (never silently changed); example; copy; reset | Spec 15 **excludes** tree view, syntax highlighting, schema validation, repair, JSON5, file upload/download, diff. "Deferred, not rejected": tree view | Preserve. No change proposed |
| Unix Timestamp Converter | seconds / ms / µs / ns detection and conversion both ways, zone-aware, DST gap and overlap explained, batch mode | Range to year 9999; no URL state | Preserve. Reciprocal related link (section 08) |
| Text Diff | line diff with changed words marked, swap, example, limits stated | Text only; not keyed or structural | Preserve |
| JWT Decoder | Decodes header and payload, explains claims, shows times as dates; **does not check the signature** (stated) | Never verifies; 100,000 chars | Preserve. Never transfer tokens between tools |
| Cron Explainer | cronie five-field syntax, plain-language summary, next five times in UTC | UTC only; one dialect | Preserve |
| Base64 Encoder/Decoder | UTF-8 text, clear invalid-input messages | Text only, no files | Preserve |

All six: copy and reset controls exist; **no download**, **no URL/hash state**, **no `localStorage`/`sessionStorage`**, **no Web Worker** (grep of each `index.js`). Every module exports `showRelatedCalculators = false`, so **no related-tools block renders on any Developer Tool** (D1 in `docs/ecosystem-review/05-DEVELOPER-TOOLS-ECOSYSTEM.md`).

Not verified this session: engine correctness was **not re-tested here** (the unit tests exist; the last full unit run for the Time Tools program, `node --test tests/unit/`, gave 3,087 pass, 1 fail, 4 skipped, and the one failure is the known `gratuity.css` colour token, not a Developer Tools test); real-device, Safari and Firefox behaviour of these six tools; Search Console or Analytics data for them (none was available).

## 3. Shared architecture (VERIFIED) and reuse opportunities

| Area | Finding | Reuse for new tools |
| --- | --- | --- |
| Tool contract | each tool is `assets/js/tools/<id>/{index.js, *-engine.js}`; the engine is pure, the module owns the DOM; exports `markup`, `render`, `init`, `showRelatedCalculators`, `showRelatedArticles` | Follow it |
| Catalog | one entry per tool in `assets/js/data/tools.js`; routes, listings, search and sitemap derive from it; styles in `src/_data/toolStyles.json`; Growth `identity-ledger.json` (tools sorted by id) | Follow it |
| Shared UI | `assets/js/ui/{field,result,escape,dialog-focus}.js` | Reuse |
| Clipboard | the copy-with-fallback logic exists as **separate copies** in at least 9 modules (`grep` of `navigator.clipboard`) including `time-ui/time-ui.js` | A single new `assets/js/ui/clipboard.js` for **new** tools only; do not refactor old tools (rule 9.3) |
| JSON parsing | `json-engine.js` is a text-to-text engine (`analyze` returns formatted text and notes), **not a value tree**; it exports `locate`, `contextOf`, `analyze`, `format`, `minify`, `validate`, `MAX_CHARS`, `MAX_DEPTH` | A new tool that needs a tree needs its own tree parser; it may call `validate` for located errors without modifying the old file |
| Related tools | `renderRelatedSectionTools` (added in the Time Tools program) renders a same-section list for sections without categories | A Developer Tools pilot is possible but is its own approved step (rule 4.8) |
| Time helpers | `time-ui` helpers are Time-Tools specific | Do not import across sections |

## 4. Test baseline and affected consumers (VERIFIED by `grep` of `tests/`)

New Developer Tools catalog entries change counts asserted by existing tests. These must be updated **in the same phase** and listed in the pack:

| Consumer | Hardcoded value |
| --- | --- |
| `tests/unit/search.test.mjs:64` | index counts `[8, 0, 53, 40]` (tools = 53); also a size ceiling |
| `tests/unit/sections.test.mjs:56` | the exact ordered list of Developer Tools ids; `catalog`, `relationships` and `tool-capabilities` tests pin tool lists and relations too (not individually re-read) |
| `tests/browser/json-formatter.spec.js` 347, 361; `text-diff.spec.js` 486, 496; `unix-timestamp-converter.spec.js` 498, 508; `time-zone-converter.spec.js` 574; `image-compressor-resizer.spec.js` 940 | "6 tools" / `toHaveCount(6)` for the Developer Tools listing |
| `tests/browser/navigation.spec.js` 494, 580 | `.directory-group` count 29; section counts `13/6/2/3` |
| Baselines | DOM `tools-directory`, links summary, SEO baseline, visual `tools`, `developer-tools` |
| Generated | `tests/inventory/url-inventory.json`; Growth `identity-ledger.json` and `export.mjs --check` |

**Existing failures that are not caused by this planning (do not count them against new work):** World Clock "rows arriving later" (desktop) and "Add puts the city" (mobile); World Clock 320/390 px row tests flaky at both commits; five All Tools / Image Tools tests stale since the PDF Tools batch (the section list now includes PDF Tools, Image Tools has 2 tools); SIP, FD, CAGR, calculators and tools visual baselines; the `gratuity.css` colour-token unit test. Recorded in `docs/tool-packs/34-time-tools-ecosystem.md` section 12.

## 5. Constraints and dependency register (VERIFIED)

No backend, database, paid API or account; processing stays in the browser (rule 8.8; analytics only after consent on production); a dependency needs a compelling product reason (rule 9.1); old tools are preserved (rule 9.3); heavy extras are deferred (rule 9.6); the machine has about 4 GB RAM (rule 10.3); Regex Tester is excluded for R1 and **re-opening needs an explicit owner decision** (`docs/tool-pack-factory.md` line 275; `docs/ecosystem-review/02-PENDING-AND-DEFERRED-INVENTORY.md` line 48).

## 6. Integration opportunities

The strongest connections are within the JSON family (Formatter → compare → query) and token debugging (JWT ↔ Unix timestamp). Both are links between **existing or proposed tools in the same section**; none transfers data. Details in 04 and 08.

---

# Ecosystem 2.0 additions (verified 2026-10-26, HEAD `0dc368b`, package still uncommitted)

## 7. Feature-by-feature capability matrix (VERIFIED by reading each module, engine and spec; not by running the pages)

"Yes" means the code or spec shows the feature. "No" means a search of the module found none **and** the spec excludes or does not mention it. The counts in the last row are lines in each spec file that mention a mobile width, a script-injection case, a network check or keyboard use (a rough presence check, not a pass result).

| Capability | JSON Formatter | Unix Timestamp | Text Diff | JWT Decoder | Cron Explainer | Base64 |
| --- | --- | --- | --- | --- | --- | --- |
| Core job | strict validate, format, minify | timestamp ⇄ date, zone-aware, batch | line diff of two texts | decode header and payload, explain claims | explain a five-field cron expression, next five UTC runs | UTF-8 text ⇄ standard Base64 |
| Located errors | yes (offset, line, column) | yes | n/a | yes | yes | yes (position) |
| Standards basis | RFC 8259 (strict) | ISO 8601 and RFC 2822 input; zone data from the browser | unified diff | RFC 7519 claims; base64url inside the engine | cronie crontab, pinned | RFC 4648 standard alphabet, strict |
| Example loader | yes | one | yes | yes | yes (examples list) | yes |
| Copy | yes | yes (many outputs) | yes (including as a unified diff) | yes | yes | yes |
| Download | **no** | **no** | **no** | **no** | **no** | **no** |
| Reset or clear | yes | yes | yes | yes | yes | yes |
| URL or hash state | no | no | no | no | no | no |
| Storage | none | none | none | none | none | none |
| Options | none (fixed two-space indent) | zone choice, ambiguity choice | **Ignore whitespace-only changes**; swap | none | none | encode or decode |
| Result layout | text boxes with a caret marker | result panels and a zone board | one unified list (removed, added, changed words marked) | header, payload, claims and status lines | field table and summary | text box |
| Time or clock use | none | "now" | none | device-clock status lines (stated) | UTC | none |
| Security behaviours | text only, notes for duplicate keys and precision | text only | text only | `alg: none` and signature-presence handled in the engine; never verifies, and says so | refuses unsupported syntax | refuses non-canonical input |
| Limits | 2,000,000 chars | year 9999; batch 200 or 100,000 chars | 300,000 chars, 20,000 lines per side | 100,000 chars | 256 chars | 1,000,000 bytes encode |
| Related block rendered | no | no | no | no | no | no |
| Spec lines mentioning 320/360/390; script-injection cases; network checks; keyboard (browser spec) | 1; 2; 4; 6 | 1; 3; 4; 16 | 1; 6; 7; 5 | 1; 2; 5; 10 | 3; 1; 5; 38 | 3; 0; 4; 6 |

Not verified this session: real-device, Safari and Firefox behaviour; screen-reader behaviour; whether any of the browser specs currently pass (the last full run is recorded in 01 section 2 and in `docs/tool-packs/34-time-tools-ecosystem.md` section 12).

## 8. Existing-tool feature-gap assessment (enhancement review)

Classes (from the 2.0 brief): **A** preserve unchanged, **B** enhance for genuine user value, **C** repair a confirmed problem, **D** consolidate where safe, **E** defer. A change to an existing tool is only proposed where the evidence below supports it; each existing spec's "excluded" lists are decisions the owner approved, so reversing one is stated as such.

| Tool | Existing strengths (VERIFIED) | Gaps and evidence | Proposed enhancement | Class | Priority | Complexity |
| --- | --- | --- | --- | --- | --- | --- |
| JSON Formatter | strict grammar, located errors, notes instead of silent changes, 2 MB limit | fixed two-space indent (code constant); no download; no tree view (excluded in spec 15, "deferred, not rejected"); JSON Crack shows a graph view (E17). No evidence that the strict core is lacking | (1) an indentation choice (2 spaces default, 4 spaces, tab), a **reasoned** basic expectation with no competitor evidence read; (2) **tree view deferred** (rule 9.6) | B for (1); E for the tree | P1 | Low (1); High (tree) |
| Unix Timestamp Converter | zone-aware, DST gap and overlap explained, batch, ISO 8601 and RFC 2822 input | none found. Out-of-scope by spec: log extraction beyond the batch, leap seconds | none; reciprocal related links only | A | none (links in P0 metadata) | none |
| Text Diff | unified list, changed words marked, ignore whitespace-only, copy as unified diff, 300,000-char limit | **ignore case**, **hide unchanged lines**, custom ignore rules and a side-by-side view are listed on one competitor page (E23); all are excluded in spec 18 ("Not in v1"). Whether users need them is unmeasured | ignore case and a "show only changes with context" option; side-by-side deferred (mobile cost) | B | P1 | Low to medium |
| JWT Decoder | decodes safely, handles `alg: none`, device-clock status with the caveat, never claims verification | the competitor page read (E15) shows no explicit decode-versus-verify warning, so the current statement is a **strength to keep**, not a gap. Per-claim copy is not present (not evidenced as needed) | none required; per-claim copy is a P2 idea | A | none | none |
| Cron Explainer | pinned cronie dialect, refuses unsupported syntax, next five UTC runs, examples | UTC only and one dialect are **approved decisions** (spec 25 sections 20 and 21); the best-known competitor page could not be read (E16). DevToys ships a Cron Parser (E21) | none now; time-zone display of next runs is P2 and must not change engine semantics | A (E for the P2 idea) | P2 | Medium |
| Base64 | strict, canonical, UTF-8, refuses non-standard input with a helpful hint | Base64URL is refused by design with a hint pointing at the JWT tool (spec 27 section "Out of V1"); JWT tokens and many APIs use base64url, so developers meet it daily (reasoned). RFC 4648 gives independent vectors. File/image to Base64 is offered by DevToys ("Base64 Image and Text", E21) | **Base64URL mode** as an explicit option (default unchanged); file/image input is P2 (memory and privacy review needed) | B | **P0** | Low |

**Nothing is proposed as a repair (C): no defect was found in these six tools in this review.** "Not found" does not mean "none": the engines were not re-tested here (their unit tests exist).

## 9. Consolidation check (D)

No existing tool is redundant with another. The JWT decoder's private base64url routine and the Base64 tool's strict standard-alphabet decoder are deliberately separate (spec 27); merging them is **not** proposed.
