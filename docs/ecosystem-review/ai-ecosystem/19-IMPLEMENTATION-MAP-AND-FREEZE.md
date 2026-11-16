# 19. Implementation map, design-freeze report and programme checkpoint

## 1. Design-freeze gate (Phase 1 exit)

| Gate item | Where | Status |
| --- | --- | --- |
| Target users defined | `17` §1, `04` | done |
| Positioning final | `17` §2, `05` §4 | done |
| Feature scope final | `17` §2, `16` | done |
| Information architecture final | `17` §3, `16` D1, D7 | done |
| Journeys complete | `06` §3 (A-J; J and B now by file, C by the extraction panel) | done |
| Core features specified | `17` §4-8 | done |
| Workbench inputs and outputs, compiler | `17` §5.3-5.5 | done |
| Prompt and task permutations | `12`, `18` | done |
| Edge cases and states | `17` §5.2, §6, §7 | done |
| UI hierarchy, layouts, responsive, themes | `17` §4-8, §5.6 | done |
| Interactions and microcopy | `17` §5.2, §11, `13` §1 | done |
| Privacy | `17` §10 | done (nothing stored) |
| Technical architecture and file map | section 2 below, `14` | done |
| AI-only testing | `15` §4, section 3 below | done |
| Routine owner decisions resolved | `16` | done (D1-D16) |

**Design frozen on 2026-11-16.** Phase 2 builds `17` exactly; a deviation is recorded in section 4 with its evidence.

## 2. Implementation map (batches, files, checks)

| Batch | Files | Checks |
| --- | --- | --- |
| B1 shared modules | new `assets/js/tools/ai-tools/common/pack-format.js`, `handoff.js`; new `tests/unit/ai-ecosystem.test.mjs` | unit |
| B2 Workbench logic | `ai-workbench/task-index.js` (new), `playbooks.js` (new), `compiler.js`, `taxonomy.js`, `blueprints/content.js`, `blueprints/research.js`, `blueprints.js` (if family map changes) | unit (existing `ai-workbench.test.mjs` unchanged + new) |
| B3 Workbench UI | `ai-workbench/index.js`, `assets/css/tools/ai-workbench.css` | unit (markup), browser `ai-workbench.spec.js` (extended) |
| B4 brief page hooks | `ai-tools/common/brief-tool.js`, `brief-engine.js` (`buildBrief` passes a context) | existing `ai-tools.test.mjs` unchanged |
| B5 Context Bridge | `context-pack-builder/index.js`, new `ai-tools/common/context-engine.js` | unit, browser |
| B6 Output Reviewer | `ai-answer-checklist/index.js`, new `ai-tools/common/review-engine.js` | unit, browser |
| B7 AI Home and Directory | `pages/directory/directory-html.js` (`aiHomeStartHtml`), `assets/css/pages/directory.css` (scoped `.ai-start`), `entries/ai-directory.js` or `src/ai-directory` markup (card link) | unit (HTML string), build, other section pages unchanged |
| B8 catalog and navigation | `data/tools.js` (titles, aliases, SEO), `data/categories.js` (AI section text), `components/section-switcher.js` (groups), AI articles naming the tools | unit (`sections`, `section-groups`, `ai-tools`), inventory |
| B9 documents | Tool Packs 56 and 58, `docs/product-decision-rules.md` rule 4.11, this file's checkpoint | review |
| T Phase 3 | `tests/browser/ai-*.spec.js`, privacy spec, mobile project runs, static checks, both builds, visual review | `15` §4 |

## 3. Phase 3 test architecture (AI only)

As `15` §4, with these concrete files: `tests/unit/ai-ecosystem.test.mjs` (pack format, hand-off, task index golden table, playbooks, compiler additions, context engine, review engine, home start HTML); extended `tests/unit/ai-workbench.test.mjs` only where a pinned value legitimately changes (reviewed edits); `tests/browser/ai-workbench.spec.js` and `ai-tools.spec.js` extended; new `tests/browser/ai-ecosystem.spec.js` (AI Home links, Bridge, Reviewer, hand-offs, privacy: no cross-origin request, no storage writes). Browser runs: Playwright `--workers=1`, desktop then mobile project, only these specs.

## 4. Programme checkpoint log

| Date | Step | Result | Next |
| --- | --- | --- | --- |
| 2026-11-16 | Phase 1 research (`00`-`15`) | committed 5e8c39ee | design freeze |
| 2026-11-16 | Phase 1 design freeze (`16`-`19`) | 230d2e0d | B1 |
| 2026-11-16 | B1-B2 file format, hand-off, task index, playbooks, compiler, two tasks | 2037a41f | B3 |
| 2026-11-16 | B3 Workbench UI | d58822d4 | B4 |
| 2026-11-16 | B4-B6 brief page hooks, Context Bridge, Output Reviewer | 977e1776 | B7 |
| 2026-11-16 | B7-B8 AI Home, Directory links, catalog, sidebar | 41888734 | B9 |
| 2026-11-16 | B9 rulebook 4.11, Tool Packs 56 and 58, this log | c43edfb8 | Phase 3 |
| 2026-11-17 | Phase 3 tests, fixes, baselines, inventory | next commit | owner review, push decision |

## 5. Deviations from the frozen design (recorded with their evidence)

| Design | Built | Why |
| --- | --- | --- |
| `17` §4: a common start "Which AI product?" linking the Directory | replaced by "Write or reply to an email" | an owner decision of 2026-11-16, pinned in `tests/unit/ai-directory.test.mjs`, allows the AI Tools page to link the Directory only by its card and sidebar entry |
| `17` §7: any pasted request gives the "Review of an AI answer" | the review sections appear when the request has requested items (Requirements or Format lines, bullets, or must/should sentences) or a format, leftover, contradiction or review-type finding; otherwise the output is the old evidence checklist | a plain question has nothing to check against; keeps the tool's verified behaviour for that case |
| `17` §6: mode as a radio group | a select, the first field | the shared brief page draws selects; same choices and wording |
| `17` §6: "Use in the Workbench" button | "Copy and use in the Workbench" action plus a link line to the Workbench | the shared page's actions copy; the hand-off is put on the same click |
| `17` §5.2: matches announce "N tasks match." | "N tasks match. Choose one." | clearer next step |
| `14` §6: performance budgets | **exceeded** (measured, section 6) | the features were kept; every module loads only on its own page; a later pass can trim the task index and the Workbench markup |

## 6. Phase 3 results (2026-11-17)

| Check | Result |
| --- | --- |
| AI unit tests (`ai-ecosystem` 26, `ai-workbench` 16, `ai-tools` 27, `ai-directory`) and the affected shared ones (catalog, search, sections, section groups, relationships, SEO keyword map, tool catalog) | pass (126 in the final focused run; 194 in the wider catalog run) |
| Whole unit suite, once | all pass except `static-checkers.test.mjs` (fault-injection self-test of the checkers over a copy of the build): **not completed**, it timed out at 280 s on this 4 GB machine; the checkers themselves were not changed and the real checks below passed |
| Browser, subpath-desktop: `ai-ecosystem`, `ai-workbench`, `ai-tools` specs | 21 pass |
| Browser, subpath-mobile (same specs, `@desktop-only` excluded) | 19 pass |
| Browser, root-desktop (`@portable`) | 4 pass |
| Static checks: inventory (regenerated: the two retitled pages only), links, assets, SEO on both builds | pass |
| Dark visual baselines `ai-tools` and `prompt-builder` (desktop, mobile, tablet) | changed on purpose, reviewed by eye, re-recorded |
| Visual review by eye | AI Tools page (desktop dark, mobile dark), Workbench start panel and Context Bridge panel (phone) |

Defects found and fixed in Phase 3: (1) a click on a link or button in the Work Pack straight after typing was lost, because the field's change event on blur redrew the pack under the pointer; the pack now redraws only when it changed; (2) the Context Bridge overflowed at 1280 px because its third action button did not wrap; (3) the consistency sheet shared the `wb-context` class, making "Your context" ambiguous; (4) playbook and match labels of testing tasks started in lower case.

Measured added JavaScript (raw / gzip): Workbench page about 46 kB / 16 kB (task index 11.1 / 4.3, playbooks 4.3 / 1.3, file format 6.8 / 2.6, hand-off 1.1 / 0.6, page and compiler growth about 23 raw) against a budget of 25 / 9; Context Bridge about 28 kB raw (engine 9.6 / 3.7, page growth 12) against 15; Output Reviewer about 16.5 kB raw (engine 12.3 / 4.6) against 15 / 6.

Not verified: the in-tab hand-offs on phones (the two journeys are tagged `@desktop-only`; on a full page load the hand-off is lost by design and paste works), real Android and Safari devices, an automated accessibility scan (keyboard and focus are asserted in the specs), light-theme visual baselines for AI pages (none exist), Lighthouse.
