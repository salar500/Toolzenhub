# Tool Pack 32: QR Code Generator (Image Tools; Roadmap R1 item 8)

Status: **DRAFT — IMPLEMENTATION NOT APPROVED.** Feasibility and specification written 2026-10-25 (documentation only; no code, no catalog entry, no route, no dependency added). The Roadmap R1 row for this candidate is **unchanged** ("Feasibility-dependent: audit first (verifying an encoder)").
Tier: **MEDIUM** (a deterministic encoder with a public standard; no money, tax or legal content; but a wrong code is silently useless, so the output is verified by an independent decoder).
Proposed id, slug and route: `qr-code-generator`, `/tools/qr-code-generator/`. Section: **Image Tools** (`image-tools`, flat), as R1 lists it. Tool Pack number 32 was verified unused. Nothing named `qr-code` exists in `assets/`, `src/` or `tests/`.
Evidence labels: **VERIFIED** (observed this session), **PUBLIC** (a vendor or standards statement, cited, not independently verified), **HYPOTHESIS**, **UNKNOWN**.

## 1. Feasibility verdict and the rulebook section 12 review

Verdict: **C, future opportunity** (upgradable to **B** if the owner picks a differentiator, see below). It is technically easy and fully browser-local, but it is a commodity, and no differentiator is proven.

| Dimension (weight) | Score | Reason (label) |
| --- | --- | --- |
| Search demand (25%) | 4 | Many free generators exist, which implies steady demand (PUBLIC, below). **No volume known (UNKNOWN)**; the score is a hypothesis. |
| Repeat use (25%) | 2 | Most people make a code once per link or event (HYPOTHESIS). |
| Practical usefulness (20%) | 3 | Real but low-effort, and phones and many apps already create QR codes (HYPOTHESIS). |
| Differentiation (10%) | 1 | Competitors already offer no-signup, in-browser, PNG and SVG, and several advertise static, non-expiring codes (PUBLIC). "Private" and "no login" are not a differentiator (rulebook 12, item 5). |
| Feasibility and upkeep (10%) | 5 | A small, well-documented encoder; the standard does not change often (HYPOTHESIS). |
| Trust, privacy, performance (10%) | 5 | Pure computation in the browser; no network. |

Mandatory gates: meaningful problem (pass, weakly); **not a duplicate "without a real improvement" (AT RISK: no improvement is proven)**; reliable output (pass if the independent decoder test passes); maintenance (pass); no paid API (pass); privacy (pass); mobile (expected pass, see section 8); not added for tool count (**AT RISK**: R1 lists it, but the rulebook says a roadmap entry is not approval and that tools must earn their place).

Competitor evidence (PUBLIC, vendor claims, not verified; one search, 2026-10-25): [Landerlab](https://landerlab.io/tools/qr-code-generator) (links, text, email, Wi-Fi; PNG or SVG; says processing is in the browser), [QRtor](https://hunted.space/product/qrtor) (adds a logo; says many "free" tools use dynamic links that lapse), [QRToolset](https://peerlist.io/code_kartik/project/free-qr-code-generator-no-signup--qrtoolset) (URL, Wi-Fi, WhatsApp, UPI; static, non-expiring), [QRigin](https://peerlist.io/krishav/project/qrigin) (1200 px PNG, SVG; paid logo option). Pricing, accounts and complaints were not researched in depth (UNKNOWN).

**Possible differentiators, all HYPOTHESES for the owner to judge, none assumed:** (a) a code that is **proven readable before download** (the tool decodes its own output with a decoder and shows "Verified: scans as ..."; this needs an in-browser decoder, which is a dependency decision, D3); (b) clear, correct guidance on size, error correction and print contrast; (c) an Indian-use content type such as a UPI payment QR (**not verified**: the payment-link format and any rules would have to be checked against NPCI sources first, and it touches money, so it needs its own approval and is **excluded from this specification**). Without one of these the recommendation is C.

## 2. The decision and scope

**The decision it supports:** "Give me a QR code for this text or link that any phone camera will read, that I can download."

### P0 (essential for V1)
- One **Content** field (multi-line allowed), plain text or a website link. The code updates automatically as the content is entered (no Generate button, like every current calculator).
- Live preview of the code.
- Error correction choice: Low 7%, Medium 15% (default), Quartile 25%, High 30% (the percentages are the standard's approximate recovery capacities, PUBLIC).
- Size for download: Small, Medium, Large (module-based output size, section 3).
- Download **PNG** and **SVG**.
- Colours: fixed dark-on-light by default. A foreground and background choice is P1, with the contrast safeguard in section 3.
- Reset; specific validation messages; a character and byte counter.

### P1
Foreground and background colours with the contrast safeguard; Copy image to clipboard (where supported); **Wi-Fi** content type (the "WIFI:T:...;S:...;P:...;;" form) only if the owner sees value; a printed-size hint.

### P2 (deferred; not built to imitate marketing QR sites)
Logos or images inside the code, dynamic or tracked codes, redirects, scan statistics, bulk generation, vCard/e-mail/SMS/geo/calendar types, PDF output, UPI/payment codes (separate approval and verification), history, saved designs, any account or backend.

## 3. Behaviour and rules

**Content.** Treated as UTF-8 text. The encoder picks the smallest QR version (1 to 40) that holds the text at the chosen error-correction level, in the most compact mode that fits (numeric, alphanumeric or byte). Empty content shows no code and the hint "Enter text or a link to make a code."
**Limit.** A hard limit of **2,000 bytes of UTF-8** (**PROVISIONAL**): well below the format's maximum (byte-mode capacity at version 40, level Low is 2,953 bytes, PUBLIC from the standard's tables, **not re-read this session; the standard is paywalled, the encoder reference and the test vectors will confirm it**), because dense codes fail on phone cameras. Between 1,000 and 2,000 bytes the page warns that the code will be dense and hard to scan. Over the limit: a specific error and no code.
**Links.** Content that starts with `http://` or `https://` is a link and is encoded exactly as typed (no trimming of the middle, no rewriting, no shortening, no redirect). Content that looks like a bare host (for example `example.com`) gets a note: "Phones may read this as text. Add https:// to open it as a link." The text is not changed for the user. The tool never fetches the link.
**No tracking.** No redirect service, no analytics event carrying the content, nothing stored or sent.
**Quiet zone.** The output always includes a quiet zone of **4 modules** on every side (the standard's minimum, PUBLIC); the user cannot remove it.
**Download sizes.** The PNG is drawn at an integer number of pixels per module (for example 8, 12 or 16), so edges are crisp and never smoothed. The SVG uses one path per row run or one `<path>` with `shape-rendering="crispEdges"`, a `viewBox` in modules and no external references.
**Contrast safeguard (P1 colours).** Light-on-dark codes (inverted) are refused by default because many readers do not support them (PUBLIC, widely documented; not tested here); a foreground/background pair below a contrast ratio threshold (**PROVISIONAL 4:1**) is refused with the ratio shown. Default dark-on-white always passes.
**Errors.** Specific and in a polite live region; the preview is cleared on an error, never left showing the previous code.
**Reset.** Clears content, restores Medium level and Medium size, removes the preview and the messages, and focuses the content field.

## 4. UX and design (existing system only)

| Control | Purpose and label | Default | Validation / disabled | Feedback | Keyboard and mobile |
| --- | --- | --- | --- | --- | --- |
| Content (textarea) | "Text or link" | empty | length counter; over the limit shows an error linked by `aria-describedby` | the code updates as typed (debounced); a polite announcement of "Code updated" is NOT made on every key (it would be noisy); only errors and the density warning are announced | the on-screen keyboard must not hide the preview: the preview sits above the settings on a phone |
| Error correction | select with the four levels and their percentages | Medium | | the code updates | native select |
| Size | select | Medium | | the download size is shown ("About 480 px") | |
| Preview | the QR code (an `img` with a text alternative describing what it encodes, truncated for long content) | empty state | | | |
| Download PNG / Download SVG | save the file | `aria-disabled` while there is no valid code | | "Downloaded" confirmation (best effort) | buttons at least 44 px |
| Reset | clears all | enabled | | announces "Reset." | |

Empty state: one sentence plus an example link that "Load example" can fill. The shell, tokens and result block follow existing tool pages; the global design system is not modified.

## 5. Privacy, security, dependencies

- Everything is computed in the browser; no network call; no storage; no analytics event with the content.
- The SVG is built from numbers only (no user text is ever placed inside it), so it cannot carry markup from the content. The alternative text uses `textContent`, not HTML.
- **Encoder dependency:** see section 7. The recommendation adds **no runtime dependency**.
- **Decoder for tests:** one **dev-only** dependency is proposed (section 9), which needs the owner's approval (D2). It never ships to visitors.

## 6. Architecture

- `assets/js/tools/qr-code-generator/qr-encoder.js`: a pure module (no DOM) with `encode(text, level) -> { version, size, modules[][] }` and `toSvg(modules, options)`.
- `.../index.js`: the page; PNG drawing through a canvas at an integer scale; downloads through a Blob.
- Catalog: id `qr-code-generator`, section `image-tools`, `autoRelated: false`, `relatedTools: []` at first (no natural link yet; the rulebook says links are not forced); search aliases (proposed): qr code generator, qr code, create qr code, qr code maker, text to qr code, link to qr code. CSS, `toolStyles.json` entry and Growth ledger record per the usual touch list. **None is registered in this phase.**
- Static hosting: no server side; works under both base paths and offline after the first load.

## 7. Reference research (GitHub; licence data VERIFIED from the API and the repository files on 2026-10-25)

| Repository | Licence | Last push | Notes and decision |
| --- | --- | --- | --- |
| [nayuki/QR-Code-generator](https://github.com/nayuki/QR-Code-generator) | **MIT** (stated in the Readme and the licence header of `typescript-javascript/qrcodegen.ts`; the API's licence field is empty, so the files are the evidence) | 2026-08-31 | **Recommended basis.** The encoder is a single documented file (`qrcodegen.ts`, about 41 KB including comments, VERIFIED size) covering all versions, the four levels, mask selection and segment modes. Its test coverage was **not inspected** (the `typescript-javascript` folder holds only the library, a build script and demos, VERIFIED listing), so correctness is established by our own independent tests (section 9). Reuse is permitted if the copyright and permission notice is kept in the file. The repository has no plain-JavaScript file at `javascript/qrcodegen.js` (VERIFIED 404), only TypeScript; ToolZenHub has no TypeScript step, so the code would be **ported by hand to a JavaScript module** (types removed), with the notice retained. |
| [kazuhikoarase/qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) | MIT | 2026-02-14 | Alternative. The repository has a `js` folder (file sizes and test coverage **not inspected**, UNVERIFIED). Not preferred: documentation and tests not inspected. |
| [soldair/node-qrcode](https://github.com/soldair/node-qrcode) | MIT | 2024-08-23 | Reference only (Node-oriented, stale). |
| [cozmo/jsQR](https://github.com/cozmo/jsQR) | **Apache-2.0** (LICENSE file VERIFIED), v1.4.0 in `package.json` | 2026-05-15 | **Dev-only decoder oracle.** An independent decoder is exactly what "audit first (verifying an encoder)" requires. Apache-2.0 obligations (licence text, notices) apply if redistributed; used only in tests it ships nothing. The repository has a `tests` folder with end-to-end test files (VERIFIED listing, not read or run). Its `package.json` lists no runtime dependencies in the fields I checked (devDependencies only). |

Direct reuse of Nayuki's code is permitted under MIT with attribution; copying from any repository without a licence is not done. Writing an encoder from scratch is rejected as higher risk than porting a documented, tested one.

## 8. Mobile behaviour

One column; the preview above the settings so the code stays visible while typing with the on-screen keyboard open; the preview at least 240 CSS px wide on a phone where the width allows; buttons at least 44 px. Real-device scanning of the downloaded PNG and of the on-screen code is part of acceptance (see section 11).

## 9. Independent test design

- **Encoder correctness (the audit gate):** (1) *Independent decoder:* a table of fixed payloads (ASCII, a long URL, digits only, alphanumeric uppercase, UTF-8 with accented letters and a non-Latin script, a near-limit string, newline-containing text) is encoded at each of the four levels; each module matrix is rendered to an RGBA image at several scales, **with and without** a 4-module quiet zone, and decoded with jsQR; the decoded string must equal the payload **exactly**. (2) *Independent encoder:* if the Python `qrcode` or `segno` package is available (**UNVERIFIED on this machine**), the same payloads are encoded by it and the module matrices compared bit for bit for the same version, level and mask; otherwise this check is skipped and recorded as skipped, not passed. (3) *Reference vectors* from the Nayuki repository's tests may be used for known matrices if their licence allows (MIT, with attribution).
- **Properties:** the chosen version is the smallest that fits (checked against the capacity table); the quiet zone is present in the PNG and SVG; the SVG parses as XML, has only the expected elements and no script or external reference; the PNG dimensions are an exact multiple of the module count.
- **Validation:** empty, whitespace-only, over the limit, exactly at the limit, content with lone surrogate characters, 1,000–2,000 bytes (warning), bare-host note.
- **Contrast safeguard (P1):** known good and bad colour pairs and their ratios.
- **State:** Reset clears everything; an error clears the preview; level and size changes update the code and the download size.
- **Browser:** one focused Chrome spec: type a link, change the level, download the PNG and SVG, decode the downloaded PNG with the same oracle and compare. Appearance alone is never accepted as proof.
- **Real devices:** scan the on-screen and the printed code with at least one Android phone camera app (and an iPhone if available; **UNKNOWN**).

## 10. Search, relationships, SEO (planned only)

Title and description in the existing style. A related-tool link is **not** planned at launch (no natural fit among current tools). No article is planned for V1.

## 11. Quality gate and exit criteria (if later approved)

Factory section 4. In particular: every payload in the table decodes exactly with the independent decoder at every level; the owner scans the code on a real phone; no network request is made by the page.

## 12. Open decisions for the owner

| # | Decision | Recommendation |
| --- | --- | --- |
| D1 | Is there a differentiator worth building for (verified-readable, guidance, a content type)? | Without one, defer (verdict C) |
| D2 | Approve **jsQR** (Apache-2.0) as a dev-only test dependency? | Yes, if QR is approved |
| D3 | Ship an in-browser decoder so the page can show "verified readable"? | Only if D1 chooses it; adds a runtime dependency and size |
| D4 | Encoder: hand-port Nayuki's MIT encoder with attribution | Yes |
| D5 | Content limit 2,000 bytes; contrast 4:1; default level Medium | Keep as provisional |
| D6 | Wi-Fi type in V1? | No; P1 on demand |
| D7 | UPI/payment codes | Out of this pack; would need its own verified specification and approval |

## 13. Deferred items
Everything in P2 above. Nothing here changes Roadmap R1.
