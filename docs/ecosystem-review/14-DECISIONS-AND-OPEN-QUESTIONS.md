# 14. Decisions and open questions

Updated 2026-10-25 after the owner's continuation instruction (resolve routine decisions, keep material ones pending). Evidence labels: **VERIFIED** (read or fetched), **REASONED PROPOSAL** (an inference, not measured), **UNVERIFIED HYPOTHESIS** (demand, retention, search). Nothing in this file edits the rulebook or the factory.

## Resolved

| ID | Resolution | Basis |
|---|---|---|
| D1 | **Batch 2 is owner-authorized for implementation:** International Meeting Planner, Pomodoro Focus Timer, Shift Schedule Planner. Authorization means permission to specify and build under the factory lifecycle, **not** that anything exists. VERIFIED today: none is in the catalog, none has a module or a Tool Pack spec, and HEAD has no commit for them. The authorization carries the owner's own condition that the Meeting Planner must add a genuinely distinct multi-person scheduling workflow (see D2) | Owner statements in the prompts of 2026-10-25, repeated in the continuation. The factory roadmap rows were not edited in this phase (the continuation limits edits to this folder); recording the authorization in `docs/tool-pack-factory.md` is the first step of the Batch 2 phase |
| D2 | **Time Zone Converter is preserved unchanged.** The earlier review was wrong that the converter has no meeting feature: Tool Pack 19 already contains "Meeting overlap" (preferred hours per zone, meeting length, up to 6 zones, DST-exact windows, shareable URL). Overlap analysis and the required distinction for the Meeting Planner are in 04. The cross-section catalog relation (to the Unix Timestamp Converter) is a deliberate, one-sentence text link in spec 19; this review recommends **no change to the converter or its link**. Related navigation: when related tools are displayed, the component should show only same-section relations (rulebook 4.2), so the dormant cross-section catalog entry never renders and nothing needs to be deleted. That is an enforcement of an existing rule, not a policy change; adding World Clock as a same-section reciprocal relation is a routine data change for Phase A | VERIFIED (spec 19, 28, `tools.js`); REASONED PROPOSAL (the display filter) |
| D3 | **Pilot family for related-tools display: Developer Tools** (cleanest data), Time Tools second. The pilot itself is a shared-UX phase and still needs its own approval (see P2) | REASONED PROPOSAL |
| D4 (documentation part) | A **do-not-include list for production packages** (Gratuity, Salary, and any tool whose spec says release is not approved) is recorded in 15. The release itself stays pending (P1) | VERIFIED facts; the list is documentation |
| D6 | **Pomodoro versus Countdown.** The Countdown Timer already answers "focus timer" and "study timer" queries (spec 13 aliases), so a Pomodoro tool must not take the lead on those queries (rulebook 5.2) and must pass the duplicate gate (12). Spec condition: a Pomodoro tool is justified only by what Countdown lacks, namely automatic focus/break cycles, a configurable long break, a session count or summary, and notification or tab-title cues for each phase. If the spec cannot show that, it becomes a mode of Countdown, not a new page | REASONED PROPOSAL, applying existing rules |
| D7 | **Prioritization method: rulebook section 12** (six weighted dimensions plus gates). The 13-criteria lists in the requests are used as notes only. Already the authoritative rule, no decision needed | VERIFIED rulebook |
| D9 | **Android acceptance recorded as owner-reported PASS** for Photos to PDF and the PDF batch (Merge, Split, Extract/Reorder/Rotate), in 01, 06, 07 and 00. The owner did not supply device, browser, date or per-check results, so none is recorded and none is invented. Specs 31 and 33 are outside this phase's edit scope and still lack the entry | Owner statements; no checklist artifact |

## Genuinely pending (owner)

| ID | Decision | Why it stays pending | Recommended default |
|---|---|---|---|
| P1 (D4) | Production release of Gratuity and Salary | Specs 29 and 30 say release is not approved; legal and financial assumptions are involved (spec 29 open items: ceiling verification, independent legal review recommended) | Keep unreleased until each spec's gates close |
| P2 (D3) | Approval to build related-tools display on non-calculator pages (any family) | Shared UX change to site navigation, rulebook 4.8: each step is its own approved phase | Approve Developer Tools as the pilot |
| P3 (D5) | Whether body-text mentions across sections are allowed (rulebook 4.9 wording was written by Claude during the PDF batch, not separately reviewed) | Touches section-isolation governance | Allow body-text mentions, never related lists. Until decided, add no new cross-section mention |
| P4 (D8) | Documentation drift fixes outside this folder: Tool Pack 23 and 26 status lines, the vendored pdf-lib `NOTICE.txt` "Used by" line, `docs/design-follow-ups.md` (articles 36, 37, 38, 40), and recording D1 and D9 in the factory and specs 31 and 33 | The continuation limits edits to this folder; a vendor notice also carries integrity data | Approve one docs-only commit touching exactly those lines |
| P5 (D10) | World Map | No repository record; the owner calls it deferred. Not promoted | Leave deferred and unrecorded |
| P6 | Whether the Meeting Planner proceeds as a new tool or becomes an enhancement of the Time Zone Converter, once its spec shows (or fails to show) the distinct workflow in 04 | Decided by the spec evidence, then the owner's call | Spec first; owner chooses |

## Open questions (not decisions)

Demand for every candidate is an UNVERIFIED HYPOTHESIS; the first measurable step is a Search Console export of non-branded queries per tool. Whether to run the Safari and real-device portfolio checkpoint now is the owner's call.
