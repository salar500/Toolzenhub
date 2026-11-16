# 15. Production scope, owner decisions, Phase 2 and Phase 3 handoffs

## 1. Owner decisions (recommendations; none is approved until the owner says so)

| Id | Decision | Recommendation | If declined |
| --- | --- | --- | --- |
| D1 | Add the AI Home launcher to `/ai-tools.html` through a section-scoped slot in the shared section template | **Yes**: it is the "describe what you need" start the programme asks for; other sections' output stays byte-identical | The launcher lives only at the top of the Workbench |
| D2 | Retitle "Project Context Pack Builder" to "AI Context Bridge" (id, URL unchanged; old name an alias) | **Yes**: the new modes make it a bridge, and the name says the job | Ship the capability under the old title |
| D3 | Retitle "AI Answer Evidence Checklist" to "AI Output Reviewer" (id, URL unchanged; old name an alias) | **Yes** | Ship under the old title |
| D4 | Add two Workbench tasks: `email-message`, `doc-summary` | **Yes** (evidence S25) | Keep 44 tasks |
| D5 | Directory: new fields; hand-check Perplexity, Midjourney, Kling, Google Flow, Suno, Windsurf | **Yes** | Workbench keeps category mapping |
| D6 | Opt-in browser-local saving of packs and context profiles (needs a Privacy page change) | **Not in initial production**; revisit with usage evidence | n/a |
| D7 | Sidebar group labels for AI Tools (`06` section 1) | **Yes** (presentation only) | Current labels |

Rulebook impact when approved: rule 4.11 gains the AI Home launcher, the two retitles and the file-based reuse principle (one edit replacing the relevant wording, rule 15).

## 2. Production scope

| Tier | Contents |
| --- | --- |
| **Must have for initial production** | pack format and hand-off modules; Workbench: task index and describe box, `?task`/`?outcome`/`?product`, open a saved pack (round trip), two new tasks, project context in, review out, generic conflict checks, de-duplication, stage header, collapsed stages and Prompts-only view; Context Bridge: modes, new fields, extraction prompt and parser, open/update/version, staleness hints, secret warning; Output Reviewer: request coverage, format, leftovers, contradictions, review types, follow-up prompt, limits statement; AI Home launcher (if D1); catalog titles and aliases (if D2, D3); spec updates (Tool Packs 56 and 58) |
| **Important shortly after** | playbook starters (10); consistency sheet; Directory fields, filters and verified additions; Workbench links from directory cards |
| **Future enhancement** | Prompt check in Prompt Builder; three-answer comparison; opt-in saving (D6) |
| **Not recommended** | chatbot UI, AI APIs, auto-submission, conversation import by extension, rankings, prompt library, engagement mechanics, profession pages |

Production readiness also needs: AI articles reviewed for changed tool names; the production zip rebuilt (the current one is outdated) only when the owner asks; Hostinger never touched by Claude.

## 3. Phase 2 handoff: build sequence

Each step is specified in the named document; each ends with its focused tests and one commit on the development branch (rulebook 11.2; push only as the Phase 2 prompt authorises).

| Step | Build | Spec | Depends on | Done when |
| --- | --- | --- | --- | --- |
| P2-1 | `pack-format.js`, `handoff.js` + unit tests | `14` §3-4 | none | round-trip and validation tests pass |
| P2-2 | task index + golden table; describe box; query params | `07` §1-2 | P2-1 | golden table passes; params work |
| P2-3 | compiler additions (context block, de-dup, generic conflicts, stage header, consistency block, metadata on download) | `07` §3-4, §10; `12` §3 | P2-1 | existing compiler tests unchanged and passing; new tests pass |
| P2-4 | two new blueprints | `07` §5 | P2-3 | compile with empty answers and examples |
| P2-5 | Workbench UI: open pack, context in, review out, view switch, collapsed stages | `07` §7-9; `13` | P2-1..4 | journeys B, E, J pass by hand and in the browser spec |
| P2-6 | Context Bridge (`context-engine.js` + UI) | `08` | P2-1 | `08` §9 criteria |
| P2-7 | Output Reviewer (`review-engine.js` + UI) | `09` | P2-1 | `09` §7 criteria |
| P2-8 | AI Home launcher (D1) | `06` §2; `14` §5 | P2-2 | other sections' built pages unchanged |
| P2-9 | playbook starters; consistency sheet UI | `10`; `07` §10 | P2-5 | `10` §7 criteria |
| P2-10 | Directory fields, filters, links; hand verification of candidates | `11` | none | `11` §6 criteria |
| P2-11 | catalog titles, aliases, SEO text, sidebar labels; Tool Pack 56 and 58 specs and rulebook 4.11 updated with approved decisions | `06`; D1-D7 | all | specs match the code |

Data structures, wording, limits and acceptance criteria are in the referenced documents; Phase 2 should not need further research. Privacy: no storage, no network, no user text in URLs. Accessibility and performance: `13`, `14` §6.

## 4. Phase 3 handoff: AI-only test architecture

Scope: the AI Tools pages and their direct integration points (catalog entries, sidebar group data, section page slot, workspace navigation between AI pages, the global search finding AI tools). No regression of the other six ecosystems beyond confirming their section pages' built HTML is unchanged by the D1 slot.

### 4.1 Unit (pure modules, Node test runner)

| Area | Tests |
| --- | --- |
| Pack format | write/read round trip per kind; tampered JSON, unknown keys, oversize, wrong types, unknown task; heading-parse fallback; migration |
| Task index | golden table (≥ 60 phrases, written first); ambiguity; empty; utilities |
| Compiler | all 46 tasks with empty answers and examples; field preservation (every answered field appears verbatim once); placeholders; conflicts (blueprint and generic); de-duplication; context block once and before requirements; stage headers; depth scaling; determinism; forbidden phrases |
| Context engine | modes from the same fields; extraction parse variants; versioning and changed list; staleness rules; short-handoff budget; secret patterns do not alter text |
| Review engine | per review type fixtures; coverage wording; JSON validity with position; leftovers; contradictions; no verdict words; caps |
| Directory | `tasks` ids valid; required fields; filters logic |
| Playbooks | each starter compiles; steps valid; no personal facts |

### 4.2 Browser (Playwright, one worker, one project at a time; rulebook 10.3)

| Spec | Journeys |
| --- | --- |
| `ai-home.spec.js` | describe → matches → Workbench with task; no match → outcomes; keyboard only |
| `ai-workbench.spec.js` (extend) | query params; open saved pack → identical master prompt; context in from the Bridge (same tab) and by paste; review out to the Reviewer (same tab) and after reload by paste; view switch; collapsed stages; copy fallback |
| `ai-context-bridge.spec.js` | extraction paste → fields; open → edit → download version +1; mode switching keeps fields |
| `ai-output-reviewer.spec.js` | answer + request → findings and follow-up; JSON-only case; limits text present |
| `ai-directory.spec.js` | task / input / output filters; card → Workbench with product |
| `ai-privacy.spec.js` | on every AI page through the main journeys: zero requests to other origins (route interception), no `localStorage`/`sessionStorage`/IndexedDB/cookie writes by the tools, no user text in the URL |
| Mobile project | each journey's main path at 320 and 390 px; no page-level horizontal scroll; 44 px targets |

### 4.3 Accessibility, visual, performance

- Accessibility: keyboard paths per journey; focus after actions as specified; one live region per tool and announcements not per keystroke; labels and errors linked; an automated axe-style scan if available, otherwise semantic assertions reported as a proxy (rule 10.8).
- Visual: new or changed AI surfaces only (AI Home, Workbench states, Bridge, Reviewer, Directory filters), desktop, tablet and mobile, light and dark; each changed baseline reviewed by eye.
- Performance: added JavaScript within `14` §6 budgets (raw and gzip); no timers while idle; largest pack renders without long tasks over 200 ms on the test machine (measured, reported as that machine only).

### 4.4 Production acceptance (AI ecosystem)

1. All journeys A to J complete in the browser specs or by a recorded manual check.
2. Unit, browser (desktop and mobile), privacy and accessibility checks pass; visual baselines reviewed; budgets met.
3. No AI page claims execution, verification or ranking; wording audit against `13` §1.
4. Every AI route loads; links between AI tools work in both workspace navigation and full loads; the AI tools are found by the global search with their new titles and old aliases.
5. Other sections' built pages unchanged by the AI Home slot.
6. Real-device Android and Safari checks reported as done or as not done (never assumed).
7. Owner approval before any production deployment (rulebook 11.4); Hostinger untouched by Claude.
