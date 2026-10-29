# 14 Accessibility and performance

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

UI/UX Design System 2.0, Prompt 1 of 3. Written 2026-10-29. No accessibility compliance is claimed. What was and was not evidenced is stated per row. Requirement IDs refer to doc 17.

## Accessibility: WCAG 2.2 AA targets and evidence

| Topic | Target | Evidence today | Requirement and measurable check |
| --- | --- | --- | --- |
| Text contrast (1.4.3) | 4.5:1 (3:1 large) | brand green text 3.43:1 (fails); body ink and muted pass; footer text not computed | BR-01, BR-09: scripted pass over shared CSS finds no text below 4.5:1 |
| Non-text contrast (1.4.11) | 3:1 for control boundaries, focus, icons that carry meaning | form border `#d0d5dd` 1.47:1 (fails); focus rings restored in `accessibility.css` (not measured) | IX-04, IX-05: border and ring at least 3:1 against card and page background |
| Keyboard (2.1.1, 2.1.2) | all functions by keyboard, no trap | mobile menu: Escape works and focus returns (VERIFIED); focus is **not** contained while open (VERIFIED); other tools covered by existing browser specs (RECORDED, not re-run) | GL-03, QA-01 |
| Focus visible and not obscured (2.4.7, 2.4.11) | visible ring; not hidden under a sticky header | rings exist; sticky header proposed at 960 px and wider | IX-05, QA-01: `scroll-padding-top` equals header height; tab through the page set |
| Target size (2.5.8 AA minimum 24 px; rulebook 7.2 asks 44 px for controls) | 24 px minimum, 44 px primary | menu toggle 40 px; 19 to 84 interactive elements per page measured under 44 px height (screening figure, includes inline links) | GL-03, IX-01, QA-01: controls at least 44 px; no non-inline target under 24 px |
| Labels and instructions (1.3.1, 3.3.2) | programmatic labels, linked hints | shared field helpers link hints and errors (RECORDED in shared-tool-ux) | IX-04 |
| Error identification (3.3.1, 3.3.3) | text, located, suggestion | rulebook 8.6 already requires it | IX-04, IX-08: icon plus text; never colour alone |
| Consistent navigation (3.2.3) | same order across pages | one header component | GL-01 |
| Landmarks (1.3.1, 2.4.1) | one banner, main, contentinfo; navigation labelled | `main` and `footer` on every sampled page; `header` element absent on two sampled pages (banner NOT VERIFIED); `nav` count 3 to 4 | GL-01: exactly one banner and one main per page; each `nav` labelled |
| Zoom and reflow (1.4.4, 1.4.10) | 400% zoom, 320 px, no two-direction scroll | no horizontal scroll on 20 of 20 pages at 320, 390 and 1280 px (VERIFIED) | QA-02: same sample passes after each layout milestone |
| Reduced motion (2.3.3 is AAA; rulebook 7.3 requires it) | no non-essential motion | one rule block in `accessibility.css` (RECORDED) | IX-06: with reduced motion no transition above 0 ms |
| Screen reader | names, roles, states, live regions | not tested | QA-01: owner or tester pass on NVDA with Chrome and TalkBack at the checkpoint; reported as unverified until done |
| Authentication (3.3.8) | no cognitive test | there is no login | not applicable |
| Dragging alternatives (2.5.7) | non-drag path | file drag and drop where used; the button path is required | TX-05 |

**Meaning never by colour alone:** every state has a word or icon (success lead word, error text, selected check mark).

**Acceptance for the programme (measurable):** zero known failures of the table's targets on the representative set (home, All Tools, a calculator, a time tool, a developer tool, a file tool, flashcards, a lab, an article, a legal page, the 404); automated checks and manual keyboard pass reported separately; real-device and screen-reader checks reported as owner-verified or unverified (rulebook 10.8). An automated scan is a proxy and is labelled so.

## Performance: current state (VERIFIED unless marked)

| Metric | Home | All Tools | EMI | JSON Formatter | World Clock | Article | Privacy |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Stylesheet requests | 24 | 16 | 23 | 23 | 23 | 25 | 5 |
| CSS transfer (KB, from headers) | 25 | 18 | 23 | 24 | 26 | 23 | 7 |
| Script requests / transfer (KB) | 32 / 64 | 7 / 8 | 17 / 43 | 11 / 42 | 17 / 93 | 6 / 7 | 32 / 64 |
| Image transfer (KB) | 338 | 0 | 0 | 0 | 0 | 3 | 0 |
| DOM nodes | 269 | 396 | 460 | 277 | 3,370 | 365 | 144 |
| Third-party hosts | Google Fonts, Unsplash | Google Fonts | Google Fonts | Google Fonts | Google Fonts | Google Fonts | none |

Script counts include the module graph the page loads (the shared entry plus its imports); the privacy page loads the full shared bundle (32 requests, 64 KB). **Not measured:** Largest Contentful Paint, Cumulative Layout Shift, Interaction to Next Paint, Total Blocking Time, memory, and rendering cost on a mid-range Android. The Lighthouse baseline in `tests/baselines/lighthouse` exists (RECORDED) but was not re-run, so **Core Web Vitals are NOT VERIFIED**. HTTP/2 on GitHub Pages makes 24 small requests cheaper than on an HTTP/1.1 host; the production host's protocol is UNKNOWN.

## Performance requirements (QA-03 and others)

| Area | Requirement |
| --- | --- |
| CSS | transfer at most today's value plus 10% per page type; requests at most 12 per page; consolidation by family at build time is a Prompt 2 option, not a rewrite (rulebook 9.3) |
| JavaScript | at most 3 KB gzip added across the programme (menu containment, rail observer); no framework; no animation library |
| Fonts | one self-hosted file at most 70 KB; `font-display: swap` with size-adjusted fallback; zero third-party font requests (BR-04) |
| Images | no third-party images; explicit `width` and `height`; lazy below the fold; hero art removed (DS-01, DS-04) |
| Icons | one sprite under 8 KB gzip (BR-06) |
| Layout shift | no shift from font swap, image load or live clocks; Stopwatch shows 0 shift in a one-minute run (TX-04) |
| Rendering | animations only on transform and opacity; no scroll handlers (IntersectionObserver only); `content-visibility: auto` may be used below the fold on All Tools if measured to help |
| Large content | World Clock DOM must not exceed 3,370 nodes; editors keep bounded inputs as already specified per tool |
| Sidebar cost | one observer, five links, under 1 KB gzip (doc 08) |
| Targets to be measured at the checkpoint | Lighthouse mobile performance not below the recorded baseline; LCP at most 2.5 s and CLS at most 0.1 on the representative set on a throttled mid-range profile; if the baseline is already worse the budget is "no regression" |
| Test discipline | one Playwright worker, one project at a time, focused specs (rulebook 10.3); Lighthouse run on a GitHub-hosted runner if local memory is below the browser's needs |

## Framework and dependency position

No framework (rulebook 9.1). Eleventy, plain HTML, CSS and ES modules are sufficient for every requirement in doc 17. No runtime API call, animation library, icon library import, CSS framework or font service is recommended.
