# 19 Risks and dependencies

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

UI/UX Design System 2.0, Prompt 1 of 3. Written 2026-10-29.

## Rulebook conflicts and tensions (reported, not silently overridden; rulebook 15.5)

| ID | Rule | Tension with this proposal | Handling |
| --- | --- | --- | --- |
| C-1 | 1.10: "there is no broad redesign"; existing tools are improved incrementally from evidence of real user friction | The owner's directive is a full UI/UX programme. It is not incremental in scope, although it is staged in ten milestones and preserves every URL, function and verified behaviour | Owner decision needed (doc 20, item 16). If approved, rule 1.10's sentence is replaced (not supplemented) in the phase that approves it (rulebook 15 maintenance process), stating that a design-system programme is permitted when approved as milestones |
| C-2 | 4.8: no sidebar exists; a site-wide sidebar only after a same-section pilot; a desktop sidebar must not take phone screen space | The All Tools rail (GL-04) is a sidebar on one page | Argued to be a directory index, not ecosystem navigation; owner to confirm (doc 08). If the owner reads 4.8 strictly, GL-04 becomes P1 and chips carry all widths |
| C-3 | 7.1: "no redesign of unrelated pages as part of a feature" | A system-wide redesign touches unrelated pages | Satisfied only because it is its own programme with its own approvals; every milestone is a separate phase (11.7) |
| C-4 | 10.5: baselines regenerate only for surfaces that changed | The redesign changes most of the 95 baselines | Regenerate per milestone, only the changed surfaces, each reviewed by eye; report the count; no baseline is regenerated to pass a test |
| C-5 | 6.4: imagery must explain | The current hero art and stock photographs do not | The proposal conforms (DS-01, DS-04); no conflict going forward |
| C-6 | 3.1 and 3.2: no popularity or social proof | Competitors use both | Not adopted anywhere |
| C-7 | 7.7: no persistence unless justified | A dark-mode toggle would persist a preference | DEFER (BR-08) |
| C-8 | 4.5: header stays uncluttered | A header search or extra links would add clutter | Not proposed |
| C-9 | 8.8: privacy claims are narrow and true | The Privacy page does not mention Google Fonts although it loads on 18 of 20 pages; self-hosting removes the request | Reported (F-09). Any Privacy wording change is an owner decision |

No conflict was resolved silently; none of the above changes a rule until the owner approves.

## Delivery risks

| ID | Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- | --- |
| R-1 | A token change silently breaks a surface on one of 54 tools | medium | high | mapping layer; family-by-family migration; eight-tool focused tests per shared milestone; visual review by eye |
| R-2 | Self-hosted font exceeds the 70 KB budget or has a licence problem | low | medium | fall back to the system stack (T3); decision rule written in advance |
| R-3 | Rupee sign or numerals render differently in the new font | low | medium | explicit check on EMI, SIP, Gratuity, Salary pages |
| R-4 | Sticky header hides focused elements | medium | medium | `scroll-padding-top`; keyboard pass at the checkpoint |
| R-5 | Rail or menu JavaScript introduces a regression | low | medium | links work without script; under 1 KB observer; focused specs |
| R-6 | 95 baselines need review on a 4 GB machine | high | medium | regenerate per milestone, one project at a time, GitHub-hosted runner where memory is short |
| R-7 | Scope creep: a milestone grows into a redesign of tool logic | medium | high | protected-path diff gate (QA-08); rulebook 10.13 hotfix limits |
| R-8 | Search or SEO regression from template changes | low | high | URL, title, canonical, JSON-LD and heading diffs (QA-04) |
| R-9 | Owner colour preference differs from the recommendation | medium | low | tokens only; switching palettes changes values, not structure |
| R-10 | Real-device and Safari behaviour differ | medium | medium | reported as unverified until the owner tests (rulebook 10.8) |
| R-11 | Core Web Vitals were not measured, so a "no regression" budget has no number | certain | medium | UI-0 records the baseline first |
| R-12 | Concept board is mistaken for implemented work | low | low | banner "PROPOSED — NOT APPROVED" on the page; the file lives under `docs/` and is not built |

## Dependencies

| Dependency | Needed by | Status |
| --- | --- | --- |
| Owner approval of doc 20 | start of UI-0 | pending |
| Owner choice of palette, logo concept and favicon concept | UI-0, UI-1 | pending |
| Owner confirmation of the sidebar reading of rulebook 4.8 | UI-4 | pending |
| Inter licence check and font-size measurement | UI-1 | not done; T3 fallback ready |
| Icon source decision and licence | UI-1 | not done |
| Lighthouse baseline (LCP, CLS) | UI-0 | not measured in this research |
| Existing browser, unit and static tests | every milestone | exist (74 browser specs, 133 unit files, static checks); not re-run here |
| GitHub-hosted runner for heavy runs | UI-0, UI-9 | available as a workflow pattern; no workflow was created |

## Unknowns carried forward

Core Web Vitals; screen-reader behaviour; real Android behaviour and Safari; where home search results appear on a phone; whether focus is trapped in other dialogs; the production host's HTTP protocol; Inter's measured file size and licence; the visual properties of every public reference (text-only retrieval).
