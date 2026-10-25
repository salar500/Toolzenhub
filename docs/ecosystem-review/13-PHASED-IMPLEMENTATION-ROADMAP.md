# 13. Phased implementation roadmap (PROPOSED, not approved)

This is a proposal. It changes no rulebook, roadmap or Tool Pack, schedules nothing, assigns no dates and sets no tool-count target. Every phase needs the owner's approval before work starts (rulebook 11, item 7; factory: R1, R2, P1 and P2 "authorize nothing"). Phases are ordered by value and risk, not by section.

## Phase A: low-risk discovery and navigation repairs

| Item | Detail |
|---|---|
| Why | 21 non-calculator tool pages show no related tools; the relation data is uneven and contains one rule conflict |
| User value | A visible next step after finishing a task; no dead ends in tool families |
| Scope | (1) Keep the Time Zone Converter and its link unchanged (14, D2); the dormant cross-section catalog entry is handled by the display rule in Phase B. (2) Add reciprocal curated relations listed in 12.A. (3) Update the relationship tests. No display change yet |
| Dependencies | none open (14, D2 resolved) |
| Acceptance | Relationship unit tests pass with no cross-section relation; no URL, title or calculation changes; only catalog data and tests change |
| Risk | Low |
| Verification | `node --test` on the relationship, catalog, taxonomy and search tests; no browser suite needed |
| Approval | Owner |

## Phase B: one pilot journey

| Item | Detail |
|---|---|
| Why | Rulebook 4.8: small steps, pilot one family before any wider change |
| Scope | Render the existing related-tools component on the pages of **one** family (proposal per 14, D3: Developer Tools; Time Tools second), showing same-section relations only. Flip the two module flags for that family only. Mobile layout without a sidebar |
| Acceptance | Related tools appear only from the same section; keyboard order and focus are sensible; no horizontal scroll at 320 to 430 px; baselines updated only for the intended DOM diff; existing tests for the family pass |
| Risk | Low to medium (shared component, DOM baselines) |
| Verification | The family's browser specs, `navigation`, DOM and visual baselines on desktop and mobile emulation, one worker, zero retries |
| Approval | Owner |

## Phase C: highest-value gaps in existing tools

Candidates, in no fixed order, each its own approval: Image Compressor target size and output format; Snowball versus Avalanche as a Credit Card Payoff mode; Date Calculator modes (business days, week number) if an evaluation supports them; Gratuity and Salary release readiness (their open items are in specs 29 and 30). Each follows the factory lifecycle with its own oracle tests.

## Phase D: missing tools, in cohesive approved batches

The three Time Tools are owner-authorized (14, D1); each still needs a spec before code. Order of specs: **International Meeting Planner** first, but only with the multi-person model in 04 (the Time Zone Converter already has a meeting-overlap section); if the spec cannot show it, it becomes a converter enhancement. Pomodoro Focus Timer follows the D6 spec condition (cycles, long break, session summary; no lead on Countdown queries). Shift Schedule Planner follows once its use case is confirmed in the spec. A JSON Schema and JSONPath tool needs a library audit first. A batch is 1 to 3 tools; complex ones are alone. The PDF Tools section stays small until the first three tools have device evidence.

## Phase E: distinct guides

Only guides that pass rulebook 6.1 and `docs/content-clusters.md`; rule-dependent topics wait for dated sources. After Phase B so that guides can be displayed on tool pages. Candidates are in 09.

## Phase F: consolidated quality and release checkpoint

Consolidated regression, Safari/WebKit, Firefox, real Android and iOS, screen readers, Lighthouse and the brand-green contrast checkpoint, then the owner's release decisions per environment. Runs at an agreed portfolio checkpoint, not after every tool. Production remains the owner's separate manual step.

## Ordering rationale and what is not proposed

Navigation repair (A, B) is cheaper than any new tool and benefits 21 existing pages, which is why it comes before Phase D. No sidebar, no new section and no migration of URLs is proposed. QR Code, PDF to Images, OCR and every deferred item stay as they are.
