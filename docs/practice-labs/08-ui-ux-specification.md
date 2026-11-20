# 08. Practice Labs UI/UX specification

The baseline is the existing ToolZenHub visual system: tokens in `base/variables.css`, the header and footer, the ecosystem page frame (`docs/ecosystem-workspace.md`, section 14), the sidebar and phone bar and drawer (rule 4.8), and the lesson page already built (`assets/css/pages/learn.css`). Everything below **extends** that baseline. Nothing replaces global navigation.

Patterns come from [02](02-competitor-matrix.md), section 2.

## 1. Information architecture

```
Home
└─ Practice Labs (hub, /practice-labs.html: standalone labs + "Learning paths")
   └─ Learning paths (/practice-labs/): 8 department cards
      └─ Department (/practice-labs/<dept>/): its paths (home + cross-listed), its tools, its projects
         └─ Path (/practice-labs/<path>/): roadmap, outcomes, start button
            └─ Level → Module → Lesson | Project | Interview module
```

Rules:

- **Three clicks from the Practice Labs hub to the first lesson** of any path (hub, then department, then path "Start").
- The **breadcrumb** includes the department: Home › Practice Labs › Department › Path › Level › Module › Lesson. On phones, the existing trimming rule shows Home, Practice Labs and the last two steps.
- **Search:**
  - The roadmap search filters the lessons of the current path (built).
  - A Practice Labs-wide search (paths, lessons and tools by title and keywords) is a W2 deliverable on `/practice-labs/`. It uses a static JSON index generated at build time and is client-side only.

## 2. Page types

| Page | Purpose | Must contain | Must not |
|---|---|---|---|
| Learning-paths home | Choose a department | 8 department cards (title, one-line promise, number of published paths, "start here" path); "New to tech? Start here" guide; the Practice Labs search | Planned paths shown as links |
| Department | Choose a path | Intro (who it is for); a recommended order (a numbered route); path cards (status, lessons, level span, runtime note); tools; cross-listed paths labelled with their home | More than one H1; promotional filler |
| Path | Commit to a path | Outcomes, audience, prerequisites, roadmap by level, module lessons, projects, "Still to come" while building, a start button | Claims of completeness while building |
| Level, module | Navigate | Summary, lessons with one-sentence descriptions and objectives | Thin text: at least 150 words of unique module text ([11 SEO](11-seo-strategy.md), section 4) |
| Lesson | Learn and practise | Sections per [10](10-content-quality-standard.md); practice; pager | Walls of text without an example in the first screen |
| Project | Build an artefact | Brief, dataset, milestones, checks, export, reference | |
| Interview module | Rehearse | Checked questions, explained answers, a filter by level | Unchecked lists of questions only |
| Standalone tool | Repeat use | Tool first; short how-to; links to the lessons that use it | Duplicate lesson text |

## 3. Desktop lesson layout (≥ 1000 px wide, fine pointer: the existing `WIDE` rule)

```
┌ breadcrumb row ─────────────────────────────────────────────────────────┐
│ ROADMAP (260 px, existing sidebar) │ LESSON (reading column ≤ 780 px)   │ PRACTICE PANEL (optional) │
│  path overview link                │ eyebrow · H1 · Lesson n of N       │ only when the lesson sets │
│  search lessons                    │ lesson card (objectives, prereq,   │ layout: "panel" — editor, │
│  level: module groups (current open│ time)                              │ data preview, output,     │
│  lesson links, current marked)     │ idea → example (Run) → practice…   │ sticky within viewport    │
└────────────────────────────────────┴────────────────────────────────────┴───────────────────────────┘
```

- **Two panels by default** (roadmap and lesson). The third panel exists only when a lesson declares `layout: "panel"`: SQL lessons whose tasks share one dataset, the Playwright locator lessons and git lessons.
- **With a panel at < 1280 px,** the roadmap collapses to its "Show lessons" button (the built "Hide" mechanism) so the reading column keeps at least 560 px.
- **Panel width:** 380 to 460 px, resizable with a keyboard-accessible splitter (deferred: fixed widths first).

## 4. Mobile lesson layout (< 1000 px, or a coarse pointer on a phone: existing rule)

- **Top:** the existing sticky 44 px bar ("Menu | lesson title"). It opens the roadmap drawer (current lesson in view, search, 44 px rows).
- **Lesson card** (new, replaces the separate "What you will learn" and "Before you start" headings on phones):
  - a compact box with three objectives, the prerequisite link and an estimated time;
  - always shown, compact (about 120 px). It does not remember being collapsed, because that would need persistence (rule 7.7).
- **First example within the first screen-and-a-half** on a 390 × 844 viewport. **Acceptance:** the example's code block top is < 1.5 × the viewport height.
- **Practice:**
  - It stacks: task, editor (16 px, full width, 5 to 8 rows), a **sticky action bar** (Run / Check / Hint) that stays above the on-screen keyboard while the editor is focused (with `position: sticky` and `visualViewport` resize handling), and the output below.
  - Output tables scroll inside their own box. A "Show output" jump link appears when the output is off-screen.
- **Projects and long practice:** "Focus mode" hides the roadmap bar and footer links and keeps only the task and the editor. It is a CSS state toggled by a button and is not stored.
- **Pager:** previous and next stacked full width (built).
- **Never:**
  - horizontal page scroll (tables, code and graphs scroll inside their own boxes);
  - hover-only information;
  - targets under 44 px.

## 5. Shared components (built once, used by all departments)

| Component | Status | Notes |
|---|---|---|
| Roadmap sidebar/drawer (`section-switcher` markup, `data-rail-noun`) | Built | Department-level variant: groups = paths |
| Lesson header (eyebrow, H1, progress text and bar) | Built | |
| Lesson card | New | Phone-compact; desktop: two columns |
| Callouts: Note, Tip, Warning, "Needs local setup", "Needs Power BI Desktop", "Simulated" | New | Icons plus text, never colour alone |
| Code block with copy button and language label | Partly built (`lx-code`) | Copy button new; `aria-live` "Copied" |
| Result table | Built (`lx-table`) | |
| Practice block: task, editor, actions, feedback, hints, solution | Built for SQL | Generalised to E1 and E2 engines |
| Quiz block | New (E3) | |
| Writing-lab form plus rubric result | New (E4) | |
| Visualizer frame (SVG plus controls plus text description) | New (E8) | Every visual has a text equivalent |
| Pager, related links | Built | |
| Department card, path card | New | Reuse `learn-card` |
| "Simulated" badge | New | Mandatory wherever execution is simulated |

## 6. Subject-specific interfaces

| Subject | Specific UI | Why it cannot be shared |
|---|---|---|
| Testing (D1) | ShopLite in an iframe with a "Report a bug" side form (desktop) or bottom sheet (phone) | Testing needs the app and the report together |
| Playwright (D2) | Code editor plus an iframe of ShopLite with locator highlights | Locators are visual |
| Git (D3) | Terminal input plus SVG commit graph plus file panel | State is a graph |
| Python, JS, Java | Editor plus console | |
| AI (D6) | Rubric tables and recorded-output cards; visual sliders | |
| Data (D7) | Grid view (the Excel engine's sheet view), DAX editor | |

## 7. Typography and readability

- **Body:** 16 px, line-height 1.65, measure ≤ 75 characters (780 px column). **H2:** 22 px (20 on phones). **H3:** 17 px.
- **Code:** monospace 14 px on desktop, 13 px on phones; inside the editor, 16 px on phones (prevents iOS zoom).
- **Contrast:** at least 4.5:1 for text and 3:1 for UI. Feedback colours (success, warning, info tokens) are always accompanied by a text label ("Correct.", "Not yet.").

## 8. Accessibility

- **Keyboard:** every control is reachable; Ctrl/Cmd+Enter runs; Esc closes the drawer and panels (built); the focus moves to feedback after Check (`role=status`, polite).
- **Screen readers:** headings are hierarchical; code regions are labelled; visualizers have `aria-describedby` text summaries; the git graph has a text list of commits as an alternative.
- **Reduced motion:** no animated transitions in visualizers without a "step" control; `prefers-reduced-motion` respected.
- **Without JavaScript:** the lesson text, examples, expected results, hints and solutions are all readable (built pattern); interactive parts are hidden until scripts run.

## 9. Loading and performance

| Runtime | When it loads | How the learner is told |
|---|---|---|
| Lesson page JS | Under 30 KB besides the shared ones | |
| sql.js | On the first Run or Check | |
| Pyodide and Java | Only after the learner presses "Load Python (about 6 MB)" | The size is stated, and a note recommends Wi-Fi |

- Runtimes run in Workers, so the page never freezes.
- **Budgets:** a lesson page's first contentful paint is not slowed by any runtime, and no runtime is downloaded on page load.
