# 14. Technical feasibility and module boundaries

Everything fits the existing architecture: static pages, one ES module per tool, pure engines, the catalog as the single source of truth. No framework, no dependency, no backend, no API, no storage.

## 1. What to preserve

The Workbench compiler and blueprint contract; the brief engine and the six older tools' compose functions; the claim and compare engines; the directory data rules; catalog ids and routes; the shared page shell, sidebar, workspace navigation; all existing tests (only extended, not rewritten).

## 2. New and changed modules

| Module | Kind | Responsibility | Used by |
| --- | --- | --- | --- |
| `ai-tools/common/pack-format.js` | new, pure | write and read the metadata block; validate; migrate formats; parse Markdown headings as a fallback | Workbench, Context Bridge, Reviewer, AI Home |
| `ai-tools/common/handoff.js` | new, tiny | in-memory `put(kind, payload)` / `take(kind)` (take clears); no storage, no globals beyond the module | Workbench, Context Bridge, Reviewer, AI Home |
| `ai-workbench/task-index.js` | new, pure | synonyms and the matcher | Workbench, AI Home |
| `ai-workbench/playbooks.js` | new, data | starters | Workbench |
| `ai-workbench/blueprints/content.js`, `research.js` | changed | `email-message`, `doc-summary` | Workbench |
| `ai-workbench/taxonomy.js` | changed | two tasks added; `suggestOutcome` kept for compatibility, superseded by the index | Workbench |
| `ai-workbench/compiler.js` | changed, additive | project context block, de-duplication, generic conflicts, stage header, consistency block, metadata in the download only | Workbench |
| `ai-workbench/index.js` | changed | describe box, query params, open file, playbooks, view switch, collapsed stages, review out | Workbench |
| `context-pack-builder/index.js` + `ai-tools/common/context-engine.js` (new, pure) | changed / new | modes, new fields, extraction prompt, heading parser, versioning, staleness, secret warning | Context Bridge |
| `ai-answer-checklist/index.js` + `ai-tools/common/review-engine.js` (new, pure) | changed / new | request coverage, format, leftovers, contradictions, review types, follow-up prompt; uses `claim-engine.js` | Output Reviewer |
| `data/ai-directory.js` | changed | `tasks`, `inputs`, `outputs`, `limits`, `docsUrl` | Directory, Workbench products |
| `entries/ai-directory.js` | changed | new filters, query state, Workbench links | Directory |
| AI Home launcher (`ai-tools/home-launcher.js` + a section-scoped include) | new | describe box and results on `/ai-tools.html` | section page (D1) |
| `components/section-switcher.js` | changed (data only) | AI group labels | sidebar |
| `data/tools.js` | changed (catalog) | titles (D2, D3), aliases, SEO text | catalog-driven pages |

## 3. The portable format

Every AI file is readable Markdown. Download (not Copy) appends one HTML comment at the end:

```
<!-- toolzenhub:{"kind":"work-pack","format":1,"version":2,"date":"2026-11-16","task":"test-plan","answers":{...},"role":"","experience":"","depth":"standard","product":"","context":"","consistency":{},"steps":[]} -->
```

- `kind`: `work-pack`, `playbook`, `context-pack`, `review`. `format` is the schema version; `version` is the user's document version.
- Reading: find the last `<!-- toolzenhub:` comment; `JSON.parse` inside `try`; file at most 200 kB; validate against a per-kind allow-list of keys and types; strings capped at their field limits; unknown keys ignored and reported; task ids checked against the taxonomy. Values are only ever written into form controls (rule 8.7).
- Without the comment (older files, hand-edited files): parse by the known headings; whatever cannot be placed goes to a "Notes to sort" field.
- Copy actions never include the comment (it would be noise in an AI chat).

## 4. In-memory hand-off

`handoff.js` holds one payload per kind in a module variable. Workspace navigation keeps the document, so the payload survives a move between AI pages opened from in-ecosystem links; a reload, a new tab or a direct visit loses it, by design. The receiving tool calls `take()` once on mount, fills its fields, announces the source, and the payload is cleared. Every receiver also accepts paste and file. Risk: if a future change makes AI pages full loads, the hand-off degrades to paste; tests cover both paths.

## 5. AI Home launcher on the generated section page

The section page is one shared template. Least-risk option: an optional per-section include slot (data in `categories.js`: `launcher: "ai"`) rendered only for AI Tools, with its own small script loaded only there. No change for other sections' output (verified by their built HTML being byte-identical, the only cross-section check needed). Needs D1.

## 6. Performance budgets (raw / gzip, checked at build)

| Page | Budget for added JavaScript |
| --- | --- |
| AI Home | launcher + task index ≤ 12 kB / 5 kB, loaded only on `/ai-tools.html` |
| Workbench | + task index, pack format, playbooks ≤ 25 kB / 9 kB; blueprints stay lazy per family |
| Context Bridge | context engine + pack format ≤ 15 kB / 6 kB |
| Reviewer | review engine ≤ 15 kB / 6 kB |
| Directory | data growth ≤ 15 kB / 4 kB |

Work is synchronous and bounded (input caps in each spec); no timers while idle beyond the existing debounce.

## 7. Risks and how they are contained

| Risk | Containment |
| --- | --- |
| Matcher misleads | confirmation always; golden table; ambiguity shown |
| Imported file is malicious | parse in `try`, allow-list, caps, values only into controls |
| Reviewer's heuristics read as verdicts | wording rules (`09` section 5); tests forbid verdict words |
| Retitled tools lose search continuity | ids and URLs unchanged; old titles as aliases; owner decides (D2, D3) |
| Directory data goes stale | six-month re-check (existing), new fields only from official pages |
| Scope creep into storage | storage only via D6 and a Privacy change |
| Shared template change affects other sections | section-scoped slot; built HTML of other section pages compared unchanged |
