# 11. UX, accessibility, performance and SEO audit

Method limits first: this is a **document and source audit**. No Lighthouse run, no screen-reader pass, no new browser run and no screenshots were made for this review (laptop limits and the documentation-only scope). Items below are labelled **verified** (read or fetched this session), **recorded** (stated in a repository document, not re-measured) or **NOT VERIFIED**.

## Shared design defects (affect many pages)

| ID | Defect | Label | Evidence | Recommendation | Priority | Approval |
|---|---|---|---|---|---|---|
| U1 | Brand green `#0b9f58` is used as small text at about 3.43:1 on white, below WCAG AA for normal text | recorded | `docs/design-follow-ups.md` section 1; `tests/README.md` (105 elements at M9) | The follow-up's own plan: a per-use audit, action green `#087f47` (5.08:1) for text, brand green for fills and rings, then baseline updates. Do as its own checkpoint, not in a tool pack | Medium | Owner |
| U2 | `design-tokens` unit test fails today on `assets/css/calculators/gratuity.css` (`#667085`) | verified | seen failing in the PDF phase's full unit run; file unchanged by that work | A localized fix in the Gratuity stylesheet token usage | Low | Within a Gratuity fix |
| U3 | Hotlinked Unsplash card images on 6 articles; 5 articles without hero images | verified (data scan) | `articles.js`; design-follow-ups 2 and 3 | See A2 in 09 | Low | Owner |
| U4 | A shared link colour (`.calculator-page a`) beat single-class button styles, making a Download button's text green on green on two pages; fixed in the PDF batch for Photos to PDF and PDF Tools | verified | spec 33 ledger, defect 3 | Any new tool with link-styled buttons must restate colours for every state (add to the handoff checklist) | Done for current tools | none |

## Tool-specific or intentional behaviour

Non-calculator tools deliberately omit the related sections (module flags). That is shared (N1 in 08), not tool-specific. File tools use explicit "Create" actions and an inert editing area while working (intentional, spec 33). Calculators update live where `realtime` is set.

## Accessibility

Verified: a shared `tests/browser/accessibility.spec.js` exists, plus per-tool browser specs for most tools. Recorded: M9 added modal focus handling (`tests/README.md`). NOT VERIFIED per tool: contrast of every tool page, keyboard reachability of every control, screen-reader output, touch-target sizes on a phone. A real-device and screen-reader pass is the portfolio checkpoint's job (rulebook 10).

## Performance

Recorded only: the M0 Lighthouse baseline (informational, same-machine comparison only) listed large PNG hero images, un-minified assets and many stylesheet requests. It is old and was not re-run. File tools' memory limits are provisional (specs 31 and 33). NOT VERIFIED: current page weight, core web vitals, large-file behaviour on 4 GB class phones.

## SEO and discoverability

| Check | Result | Label |
|---|---|---|
| Static HTML | Built tool and article pages contain one `h1`, a canonical link and JSON-LD in the generated HTML (checked on Merge PDF, EMI and one article in `dist-ghpages/`) | verified |
| Canonical origin | Canonical URLs point to `https://toolzenhub.in/...` even in the preview build, by design (`assets/js/site-config.js`) | verified |
| Sitemap | `dist` and `dist-ghpages` each list 89 URLs, equal to the live inventory. Production's sitemap currently lists **81** URLs and none of the eight unreleased pages | verified |
| robots.txt | Allow all; sitemap is the production one | verified |
| Orphan or duplicate content | not assessed | NOT VERIFIED |
| Titles and descriptions uniqueness | SEO baseline tests exist (`tests/baselines/seo`); not re-read | recorded |
| Ranking, traffic, AdSense, revenue | **No claim.** Search Console data exists only in the owner's memory notes (Oct 2026: homepage indexed; about 49 clicks and 1,500 impressions over three months, mostly branded queries); no keyword volume data was gathered | not evidence for any ranking claim |

Missing evidence: external keyword research, Search Console query exports per tool, competitor review for any candidate. These are listed as gaps, not filled.

## Prioritized shared improvements (none approved)

1. N1 and N2 (08): display related tools on non-calculator pages after the cross-section relation is resolved.
2. U1: the brand-green text-contrast checkpoint.
3. A3 (09): audit the article bodies.
4. Device and screen-reader acceptance at the portfolio checkpoint.
