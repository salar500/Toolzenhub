# 02. Existing AI ecosystem audit (HEAD 7b339d7f, 2026-11-16)

Everything below was read from the repository, not from earlier reports. Counts were recounted.

## 1. Inventory

| Item | Route | Code | Spec | Tests |
| --- | --- | --- | --- | --- |
| AI Tools section page (generated) | `/ai-tools.html` | `src/section-pages.njk` (shared template, no AI-specific branch) | rulebook 4.11 | `sections.test.mjs`, `ai-tools.spec.js` (section page, home card) |
| AI Workbench | `/tools/ai-workbench/` | `assets/js/tools/ai-workbench/` (index 605 lines, compiler 435, taxonomy 148, products 51, 9 blueprint modules 1,593 lines) | Tool Pack 58 | `ai-workbench.test.mjs` (17 tests), `ai-workbench.spec.js` |
| AI Prompt Builder | `/tools/prompt-builder/` | `tools/prompt-builder/` on `ai-tools/common/brief-engine.js` + `brief-tool.js` | Tool Pack 56 | `ai-tools.test.mjs`, `ai-tools.spec.js` |
| Bug Report to Debugging Prompt | `/tools/bug-report-prompt/` | same engine | Tool Pack 56 | same |
| Project Context Pack Builder | `/tools/context-pack-builder/` | same engine | Tool Pack 56 | same |
| AI Answer Evidence Checklist | `/tools/ai-answer-checklist/` | `claim-engine.js` | Tool Pack 56 notes | same |
| Compare Two AI Answers | `/tools/ai-answer-compare/` | `compare-engine.js` | Tool Pack 56 notes | same |
| Meeting Notes to Action Plan | `/tools/meeting-notes-action-plan/` | `notes-engine.js` | Tool Pack 56 notes | same |
| AI products directory | `/ai-tools/directory/` | `data/ai-directory.js` (49 products, 14 categories, 5 audience tags), `entries/ai-directory.js`, `src/ai-directory.njk` | rulebook 4.11; `audience-ecosystems/04-AI-DIRECTORY-PLAN.md` | `ai-directory.test.mjs`; `scripts/ai-directory-report.mjs` (overdue re-checks) |
| AI articles | `/articles/...` | `data/articles/ai/` (3 guides) | Tool Pack 56 section 21 | content checks |

Unit tests in `ai-tools.test.mjs` plus `ai-directory.test.mjs`: 35. Sidebar groups (`components/section-switcher.js`): Plan with AI; Briefs for an assistant; Checking an answer; Work and productivity; AI products.

## 2. The Workbench, verified

- **Outcome choices: 9** (8 outcomes plus "I'm not sure. Help me choose"). **Tasks: 44**: content 5, images 5, video 4, audio 4, software 7, testing 7 (listed under Build software), research 5, improve 3, plan 4. **Blueprint families: 9.** The earlier report ("nine outcome categories and 44 tasks") is correct if "I'm not sure" is counted as a category.
- **Compiler** (`compiler.js`): pure and deterministic; missing essentials become `[add: …]` placeholders and are listed; per-blueprint conflict rules; four depths with the final review stage at detailed and multi; 12 refinement prompts; experience rules change requirements and checks, not tone; `NO_FABRICATION` for research and data; Markdown export. This is a strong, well-tested core and must be preserved.
- **Blueprints**: data with questions (essential, `more` disclosure, `showIf`), brief, stages, refinements, quality, preparation, next steps, directory categories. The testing blueprints read well (traceability, risk priority, "do not assume a stack").
- **Products** come only from the directory; "Tool suitability not verified" when none fits.
- **UI**: one page, four revealed parts, a progress list, live pack, one polite status region, Copy the whole pack, Download .md, per-prompt Copy, quality ticks "for this visit only".

## 3. Findings (what to preserve, improve, fix)

| # | Finding | Evidence | Severity | Phase 2 action |
| --- | --- | --- | --- | --- |
| F1 | "I'm not sure" matches **outcomes**, not tasks, by a small word list; a tie is silently won by list order (for example "bug in my Excel formula": software 1, research 1, software wins) | `taxonomy.js` `suggestOutcome` | medium | Task-level matcher with explicit ambiguity (`07` section 2) |
| F2 | No way back into a pack: a reload or a new visit starts from nothing; the downloaded `.md` cannot be reopened | `index.js` has no import, no URL state | high for repeat use | Pack round-trip (`10`) and `?task=` deep links |
| F3 | Tools do not hand work to each other: a Work Pack cannot carry project context in, nor its requirements to a review | no shared hand-off module | high | Context in, review out (`07`, `09`, `14`) |
| F4 | Two composition systems: `brief-engine.js` (six older tools) and the Workbench compiler, each with its own `tidy` | code | low | Keep both (rule 9.3); share only the new pack format module |
| F5 | Overlapping intents: Workbench `debug` versus Bug Report to Debugging Prompt; Workbench `review-draft`/`fix-accuracy` versus the Evidence Checklist; Workbench Short depth versus Prompt Builder | taxonomy and catalog | medium (confusing choice) | Position each (`06` section 1); cross-link where the other fits better; no removal |
| F6 | The Context Pack Builder has no update path: a project changes weekly, but the pack is retyped | `context-pack-builder/index.js` | high for its job | Context Bridge (`08`) |
| F7 | The Evidence Checklist does not know what was asked, so it cannot check completeness or format | `claim-engine.js` | high for its job | Output Reviewer (`09`) |
| F8 | Directory entries carry category and audience, not task, input or output; the Workbench maps tasks to categories by hand | `ai-directory.js`, blueprints `categories` | medium | Task and modality fields (`11`) |
| F9 | Directory gaps by verification failure: Perplexity, Windsurf, Midjourney and others are absent | header of `ai-directory.js` | medium | Re-check by hand; add only what verifies |
| F10 | The section page is the generic generated listing; nothing on it helps a visitor say what they need | `section-pages.njk` | medium | AI Home launcher (`06` section 2), owner decision D1 |
| F11 | No measurement of usefulness exists (by design: no events) | rulebook 8.8 | info | Measure by consented page views only |

Nothing in the audit is a correctness or privacy defect; no network call and no storage were found in AI tool code (searched for `localStorage`, `sessionStorage`, `fetch` in the AI tool folders).

## 4. Shared dependencies (inspected, not to be changed except where named)

- Tool mounting and workspace navigation: `ui/tool-mount.js`, `ui/workspace-nav.js`, `ui/tool-scope.js`. Workspace navigation replaces the page content **inside the same document**, so ES module state survives a move between AI pages opened from the sidebar or in-ecosystem links, and is lost on reload or a direct visit. The in-memory hand-off in `14` relies on exactly this and states the limit.
- Catalog and routes: `data/tools.js`, `data/categories.js` (`ai-tools` with `pages` for the directory), `routes.js` (`aiDirectory`).
- Shared field shell, escape, jump link: `ui/field.js`, `ui/escape.js`, `ui/jump-link.js`.
- Section page template: `src/section-pages.njk` (shared by all sections; D1 decides whether an AI-only block may be added).
