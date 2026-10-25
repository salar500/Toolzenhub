# 00. Executive summary: ToolZenHub ecosystem review

Status: **documentation only, 2026-10-25, repository `8ece03a`.** Nothing here changes the rulebook, the roadmap, a Tool Pack approval or any application code. Everything in it is a finding or a proposal until the owner approves it; decisions are in `14`. Where this package and `docs/product-decision-rules.md` differ, the rulebook wins.

## Package map

Two review requests were received on 2026-10-25 (a 17-phase ecosystem audit and a "master five-ecosystem blueprint"). They overlap, so one folder serves both:

| Blueprint file requested | Where it lives here |
|---|---|
| Master ecosystem blueprint | this file, plus 03 to 07 |
| Complete tool portfolio | 01 (built) and 02 (pending) |
| Existing-tool assessment | 01, section "Existing-tool assessment" |
| New-tool opportunity register | 02 (candidates) and 12 (scores) |
| Ecosystem workflow maps | 10 |
| Open-source reference register | 17 |
| Articles and guides blueprint | 09 |
| Prioritized backlog | 12 |
| Development batch plan | 13 |
| Implementation governance | 15 |
| Evidence and open decisions | 14 and 16 |

SEO and performance findings are in 11; navigation is in 08.

## True current state

| Fact | Value | Label |
|---|---|---|
| Published tools | **36**: Calculators 18, Time Tools 7, Developer Tools 6, Image Tools 2, PDF Tools 3 | verified |
| Coming-soon catalog entries | 11 (calculators only, no pages) | verified |
| Published articles | 34 (plus 6 coming-soon entries) | verified |
| Live URLs in the inventory | 89 | verified |
| On production (HTTP 200) | 81 of those 89 | verified (status only) |
| Not on production (404) | Gratuity, Salary, World Clock, Photos to PDF, Merge PDF, Split PDF, Extract/Reorder/Rotate PDF Pages, and `/pdf-tools.html` | verified |
| Time Tools Batch 2 (Meeting Planner, Pomodoro, Shift Planner) | **not built, not specified, not recorded as approved in any repository document** | verified |
| Gratuity, Salary | built and on the preview; their specs say release is NOT approved | verified |
| Device acceptance on record in the repository | Image Compressor (Android pass, spec 20). Photos to PDF and the PDF batch: owner-reported pass, no record | verified |

## Main findings

1. **The biggest gap is not a missing tool.** All 21 non-calculator tool pages suppress the related-tools component, so a visitor who finishes a task sees no next step except a sentence of text. The data for related tools exists. Showing it is an approved direction (rulebook 4.8) that nobody has built. (08, N1)
2. **One curated relation breaks section isolation**: Time Zone Converter to Unix Timestamp Converter. It must be settled before related tools are displayed. (14, D2)
3. **Built does not mean releasable.** Two published-in-catalog tools (Gratuity, Salary) are gated only by process. (14, D4)
4. **24 of 36 tools have no guide**, and non-calculator tools could not display one. Guides worth writing are few and specific; rule-dependent ones are blocked on verified sources. (09)
5. **Small documentation drifts** exist (Tool Pack 23 and 26 status lines, a vendor notice, a design follow-up). (14, D8)
6. **Time Tools Batch 2 should be recorded before it is built**, and Pomodoro has an unresolved differentiation gate against Countdown. (14, D1, D6)

## Top opportunities (provisional; scores are hypotheses)

1. Phase A and B navigation work (reciprocal relations, then one pilot family). 2. International Meeting Planner, the strongest candidate new tool. 3. Image Compressor target size as an enhancement. 4. A handful of distinct guides. See 12 and 13.

## Unresolved risks

Demand for every candidate is unmeasured (no Search Console exports per tool, no competitor review). Phone limits for the file tools are provisional. Safari, Firefox, screen readers and Lighthouse are unverified for the whole portfolio. No production state beyond HTTP status was checked.

## What this review did not do

It did not read article bodies, run tests or builds, research GitHub or competitors, or change production, the rulebook or the roadmap.
