# 09. Risks, rulebook impact and the consolidated approval boundary

## Risks and dependencies

| ID | Risk | Evidence class | Effect | Mitigation |
|---|---|---|---|---|
| R1 | No demand data exists; every demand and repeat-use score is a hypothesis | verified absence | Ranking could change; effort may go to the wrong item | Get Search Console non-branded queries before choosing new tools; until then favour fixes to verified defects |
| R2 | Only one browser (Chrome) and a 4 GB laptop; no Safari, real Android, iOS or screen-reader testing has ever been done; about 436 MB free RAM now | verified (ledger, this session) | Date pickers (U3), search focus (U2) and sliders (U9) cannot be called verified | Report NOT RUN honestly; owner manual pass on devices at a checkpoint (rule 10.13) |
| R3 | Gratuity legal basis: public sources conflict on whether the central rules took effect on 21 November 2025; no primary notification retrieved | public evidence, conflicting | A wrong legal statement on a money page | Re-verify from the Gazette or Labour Ministry before any legal wording changes; U5 changes no formula |
| R4 | SQL adds the first third-party runtime and runs visitor text | reasoned | Size, memory, runaway queries, supply chain | Spike first; worker with a time limit; self-hosted vendored copy; owner approval O-3; drop on failure |
| R5 | U1 and U2 are shared components with many consumers | verified (all pages) | Many visual baselines change; regression risk across 54 tools | Rule 10.11: verify through affected consumers now; review every baseline by eye (rule 10.5); one project at a time |
| R6 | World Clock progressive-render flake is not proven fixed; Categories CLS about 0.075 | ledger | Noise in test runs | Do not repeat reruns hoping for green; record as pre-existing |
| R7 | Performance cause is inferred from request counts, not from a trace | inference | A build change could miss the real cause | Trace first (doc 08); change only measured paths |
| R8 | Content maintenance: images, datasets, lessons need an owner over time | reasoned | Stale or wrong learning content | Small verified sets; source, date and licence recorded per item; no changing-data products |
| R9 | Scope sprawl: 24 observations, five ecosystems | reasoned | Quality loss | One workstream at a time; the staged scope below; stop when the approved scope is done |
| R10 | No working report channel | verified | Users cannot reach the owner | O-2 |
| R11 | Learning content correctness rests on one author and one reviewer | reasoned | Wrong answers teach wrongly | Independent expected answers; exercises validated by a second implementation or reference; release fewer items rather than unchecked ones |
| R12 | The earlier research documents are partly out of date (Time Tools, rule 4.8 text) | verified | Wrong planning input | Corrections listed below under rulebook impact |

## Existing rulebook impact (rule changes made in this phase: **none**)

The rulebook was read, not edited. A proposal is not a rule (section 15.3). If the owner approves, the Phase 2 or later phase records each in the document that owns it.

1. **Rule 4.8 wording is out of date.** It says the Time Tools pilot "is built locally and not released"; 13 Time Tools are in the catalog and published on the preview, and Meeting Planner, Pomodoro, Interval Timer and Shift Planner now exist. The statement should be checked and corrected. *Owner to confirm what "released" means for production before rewording.*
2. **Rule 4.2 (section isolation) relaxation** only if O-4 is approved: a single curated pair of links between a learning page and the tool it teaches.
3. **Rule 7.7 extension** only if O-6 is approved: saving for new learning subjects. Today the exception covers Smart Flashcards only.
4. **A new rule beside 4.9** only if P2 (a Practice Labs section) is approved, mirroring how PDF Tools was recorded.
5. **Section 12** (scoring) and the verdict letters are used as written. The request's A to D labels map onto them in doc 03.
6. `docs/ecosystem-review/02-PENDING-AND-DEFERRED-INVENTORY.md` should be marked as superseded where it lists built tools as unbuilt (not rulebook content).

## Material decisions for the owner (all optional, all with a recommendation)

| ID | Decision | Recommended answer | Alternatives |
|---|---|---|---|
| O-1 | How to present Practice Labs | **P1**: a hub page now, no new section; decide P2 together with the first non-developer subject | P0 do nothing; P2 new section now (no URL change; costs same-section related links) |
| O-2 | Real issue-reporting channel | Publish one monitored email address on the Contact page and use a `mailto:` link with a prefilled subject and a "copy diagnostics" button (no data leaves the browser, no backend) | A third-party form service (external service, needs separate approval); keep GitHub only |
| O-3 | SQL spike, then a vendored `sql.js` dependency | Approve the **spike only** (no product code, no dependency committed until it passes) | Skip SQL; or approve the whole vertical now |
| O-4 | Relax rule 4.2 for learning page and tool pairs | No: use text links in page bodies, which are already allowed | Approve one curated pair of links |
| O-5 | "Coming soon: Health, Converter" lines on All Tools | Hide them from All Tools; keep the catalog records | Keep as is |
| O-6 | Progress saving for new learning subjects | Not now; labs save nothing in the first version | Extend the Smart Flashcards exception |
| O-7 | Guides for tools outside Calculators | Allow an article topic to name a section, only when at least four approved guides exist | Keep articles calculator-only |

## Proposed staged development scope (for Master Prompt 2)

Stage 0, no product code: browser traces (doc 08), search-focus render check, calculator field inventory, gratuity primary-source check, and (if O-3) the SQL spike.
Stage 1, UX foundations: U1, U2, U3, U4, U5, U6.
Stage 2, content quality: U7, and only those N18 guides that pass rule 6.1.
Stage 3, one new tool: N1, after its Tool Pack spec.
Stage 4, Practice Labs hub: U8, only if O-1 is P1 (or P2 with its own approval).
Stage 5, SQL vertical: only if the spike passes and O-3 is extended.
Conditional, only when their gate opens: U9 sliders (after the inventory), U10 reporting (after O-2), U11 build-time speed work (after a trace), N2 PDF page numbers and watermark (after its spec), N4 PDF to images (after its spike).
Not in scope: every C and D item, the Currency Converter, any changing-data product, health or finance reference content, Excel, Power BI, resume guidance.

## One consolidated approval boundary

**One question:** do you approve Stages 0 to 4 as listed (excluding the conditional items), with the recommended answers to O-1 to O-7, so Master Prompt 2 may begin development, one coherent workstream at a time, with local commits per stage?

This approval would **not** authorise: any push, deployment, pull request or Hostinger change; a new dependency (the SQL spike has its own line in O-3); a new section; a rule change beyond those named in O-4 and O-6 if approved; any changing-data product; backend services; paid services. A "yes, as recommended" answer is enough; any item may be changed.

Master Prompt 2 itself says that without an approved scope it must not launch an unbounded expansion. Until this decision is given, Master Prompts 2 and 3 have nothing approved to implement or verify.
