# 17 Acceptance criteria and traceability

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

UI/UX Design System 2.0, Prompt 1 of 3 (research and requirements). Written 2026-10-29. Nothing here is a rule, a build queue or an approval. This is the single place where requirements and acceptance criteria are defined; the other documents cite them by ID.

## Counts (validated by script before this file was written)

| Item | Count |
| --- | --- |
| Requirements | 62 |
| Acceptance criteria | 120 |
| of which assigned to milestones | 118 (the rest sit on deferred items: BR-08, TX-09) |
| P0 | 50 |
| P1 | 9 |
| P2 | 1 |
| DEFER | 2 |
| REJECT (as requirements) | 0 (rejected proposals are recorded in doc 16, not as requirements) |

Validation performed: unique requirement IDs; unique acceptance IDs (`<requirement ID>.<n>`, unique by construction); every requirement has at least one acceptance criterion; no dangling dependency; no dependency cycle; no P0 requirement depends on a P1, P2 or DEFER one; no DEFER item is assigned to a milestone; every P0, P1 and P2 requirement is assigned to exactly one milestone; and no dependency points to a later milestone.

Columns: **Desktop** and **Mobile** are the expected behaviour at 960 px and wider and below 640 px. **A11y / Perf** states the accessibility and performance condition. Priority classes follow the task: P0 essential, P1 valuable follow-up, P2 optional, DEFER not justified yet. Rulebook section 12's six-dimension scoring is applied to the alternatives in doc 16, not here.

## Brand

| ID | Pri | Component | Requirement and expected behaviour | Desktop | Mobile | A11y / Perf | Depends on | Milestone |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BR-01 | P0 | Design tokens (assets/css/base/variables.css) | Replace the brand-green-led palette with the approved semantic token set (bg, surface, border, divider, ink, muted, primary, primary-hover, accent, link, success, error, warning, info, focus, disabled). Existing literal hex values in shared CSS are mapped to tokens; tool CSS keeps only layout. | Same tokens at all widths. | Same tokens. | Every text/background pair in the token table meets 4.5:1; non-text 3:1. No runtime cost (static custom properties). | none | UI-0 |
| BR-02 | P0 | Logo (header, footer) | One SVG logo symbol and wordmark replaces the text-glyph mark. The same symbol file feeds header, footer and favicon. | Symbol 32 px plus wordmark; subtitle optional. | Symbol 28 px plus wordmark; subtitle hidden below 360 px. | Inline or single-file SVG under 2 KB; decorative symbol is aria-hidden, link keeps an accessible name; no image request on first paint beyond the SVG. | BR-01 | UI-1 |
| BR-03 | P0 | Favicon and touch icon | A purpose-drawn compact symbol (not the wordmark) as SVG favicon, plus 32 px and 180 px PNG fallbacks. Colour matches the logo symbol exactly. | Tab icon legible at 16 and 32 px. | Home-screen icon 180 px on the safe area. | Total icon payload under 6 KB; SVG favicon supports a prefers-color-scheme rule. | BR-02 | UI-1 |
| BR-04 | P0 | Typography | One sans family (Inter, self-hosted variable, Latin plus the rupee sign U+20B9) with a system fallback that has size-adjusted metrics; system monospace for code. The Georgia serif in the header and the unstyled Times serif on legal pages are removed. Google Fonts requests are removed. | Body 16 px / 1.6; h1 clamp(2rem, 1.4rem + 2vw, 2.75rem). | Body 16 px minimum in controls (no iOS focus zoom); h1 about 2 rem. | Font file at most 70 KB transferred, font-display swap with size-adjust fallback, zero third-party font requests; tabular-nums on results and clocks. | BR-01 | UI-1 |
| BR-05 | P1 | Brand asset variants | Monochrome, light-background and dark-background logo variants; a local default Open Graph image (1200x630) generated from the logo, replacing any hotlinked default. | n/a | n/a | Each variant under 3 KB as SVG; OG image under 60 KB. | BR-02 | UI-1 |
| BR-06 | P0 | Iconography | A single inline SVG icon set on a 24 px grid with consistent stroke, about 30 meaning-bearing icons (sections, actions, status). Text-glyph and emoji icons used as pictograms are replaced. | Icons 20 to 24 px next to text. | Icons 24 px; touch target stays 44 px. | Icons are decorative (aria-hidden) when a text label is present; sprite under 8 KB gzip; no icon font. | BR-01 | UI-1 |
| BR-07 | P2 | Section tint tokens | Optional five subtle section accents (Calculators, Time, Developer, Image, PDF) used only for a small eyebrow dot or card edge; never the only carrier of meaning. | Applied to section headers. | Same. | Each tint meets 3:1 against its surface if it carries information. | BR-01 | UI-1 |
| BR-08 | DEFER | Dark mode | Not implemented in the first programme. The token structure must not prevent a later dark theme (all colours via tokens, no hard-coded literals in shared CSS). A persisted theme toggle conflicts with rulebook 7.7 and needs its own approval. | n/a | n/a | Dark token set is pre-validated in 05 so a later phase starts from known-good values. | BR-01 | none (deferred) |
| BR-09 | P0 | Contrast conformance | Replace uses of the brand green (3.43:1 on white) as small text, per docs/design-follow-ups.md section 1; control borders reach 3:1. | n/a | n/a | Closes follow-up 1 and U1; form borders today are #d0d5dd (1.47:1 on white). | BR-01 | UI-0 |

## Global layout

| ID | Pri | Component | Requirement and expected behaviour | Desktop | Mobile | A11y / Perf | Depends on | Milestone |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GL-01 | P0 | Header | Compact header: logo plus the existing four links (Home, All Tools, Articles, About). No new header items (rulebook 4.5). Header height 64 px desktop, 56 px mobile. Sticky at 960 px and wider only; not sticky on phones so the working area keeps its height. | Sticky, 64 px, links with visible active state. | Static, 56 px, menu button 44x44. | One banner landmark per page; active link carries aria-current='page'; no layout shift on load. | BR-02, BR-04 | UI-3 |
| GL-02 | P0 | Footer | Footer lists the five sections (from the catalog), legal pages and contact. The four placeholder social links (href='#') are removed unless real destinations exist. Dark surface stays AA. | Five columns or two rows. | Single column, 44 px link rows. | No empty links; no external requests. | BR-01, BR-02 | UI-3 |
| GL-03 | P0 | Mobile menu drawer | Keep the verified disclosure pattern (button with aria-expanded, Escape closes, focus returns to the button). Today the toggle is 40 px and Tab leaves the open menu (verified): make the toggle 44 px, add a backdrop, 48 px rows, a visible Close, scroll lock and focus containment while open, and close on navigation. | Hidden at 960 px and wider (inline links). | Panel under the header with backdrop; opens in 200 ms or less. | Focus stays inside while open or the page behind is inert; no gesture-only path; reduced motion removes the slide. | GL-01 | UI-3 |
| GL-04 | P0 | All Tools category rail (desktop) | At 960 px and wider the All Tools page shows a sticky left rail: Search, then the five sections with published-tool counts, scrolling to anchors in the same page. It is a directory aid on one route, not a site-wide sidebar. Rail is real links in the static HTML. | Rail 240 px, sticky under the header, own scroll if taller than the viewport; content grid keeps at least 600 px (two columns) at 960 px and at least 720 px at 1280 px. | Not shown (see GL-05). | Counts derive from the catalog; links are crawlable anchors; no JS needed for the links; current section marked with aria-current. | GL-08, DS-06 | UI-4 |
| GL-05 | P0 | All Tools section navigation (mobile) | Below 960 px the same section links appear as a horizontally scrollable chip row (each chip 44 px tall) above the list, plus a visible 'Sections' disclosure for narrow screens. No permanent sidebar on phones. | n/a | Chip row under the search field; works at 320 px. | Chips are links (not gesture-only); scroll region is keyboard reachable and labelled. | GL-04 | UI-4 |
| GL-06 | P1 | Related-tools panel on tool pages | Render the existing curated related-tools component (same section only, rulebook 4.2 and 6.3) as an in-flow panel after the working area. Needs its own approved phase (rulebook 4.8, 11.7). Pilot on one family first. | In-flow, two-column list. | In-flow, single-column list. | No layout shift; keyboard order follows the DOM; absent when a tool has no genuine relation. | BR-01, DS-07 | UI-6 |
| GL-07 | P0 | Breadcrumbs | Keep the single central component. Fix the lowercase category label seen on calculator pages ('loans'), wrap long titles without overflow at 320 px, and keep the current page as plain text with aria-current. | Single line, truncation not used. | Wraps to two lines. | Navigation landmark labelled 'Breadcrumb'; separators are decorative. | BR-04 | UI-3 |
| GL-08 | P0 | Content widths and gutters | Three width classes: reading 720 px (articles, legal), standard 1120 px (calculators, listings), workspace up to 1440 px fluid (editors, diff, JSON compare, tables). Page gutters 16 px below 640, 24 px to 960, 32 px above. | As stated. | 16 px gutters. | Wide workspaces do not exceed 1440 px. | BR-01 | UI-0 |
| GL-09 | P0 | Breakpoints | Canonical breakpoints 640, 960 and 1280 px (mobile base from 320). The current mix of 380, 400, 480, 600, 650, 900 and 1200 px values is migrated only where a file is touched. | n/a | n/a | Fewer media-query variants reduce CSS size and test matrix. | BR-01 | UI-0 |
| GL-10 | P1 | Search behaviour and semantics | Audit then align the single shared search with the pattern users expect: visible results region, polite result count, no-results message and keyboard selection. No second search implementation. | Results below the field. | Results below the field, full width, 48 px rows. | Today the field exposes no combobox or listbox attributes and no results were visible in the first viewport on the 390 px home page after typing 'json' (the results location is not verified). | DS-06 | UI-4 |

## Discovery

| ID | Pri | Component | Requirement and expected behaviour | Desktop | Mobile | A11y / Perf | Depends on | Milestone |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DS-01 | P0 | Homepage hero | Compact hero: one H1, one sentence, the shared search field and no stock illustration. The 3D calculator-and-coins artwork is removed (rulebook 6.4). Existing H1 copy is kept unless the owner approves a change. | Hero 280 to 360 px tall. | Hero fits within the first 844 px with search visible. | Removes about 190 KB (hero-calculators.webp) from the first view. | BR-04 | UI-4 |
| DS-02 | P0 | Section cards (home) | Five section cards in a balanced grid (no orphan slot) showing name, one-line purpose and a catalog-derived count. On phones they stack; the cropped horizontal carousel is removed. | Five across at 1200 px and up, three-plus-two spanning below. | Single column list, 56 px minimum height. | Cards are single links; counts come from the catalog; no JS carousel. | BR-06, DS-07 | UI-4 |
| DS-03 | P0 | Featured tools | Keep the curated list (rulebook 3.2) but present it as a readable list of cards with full descriptions; no truncation to three-word lines. | Three columns. | Single column. | No popularity wording. | DS-07 | UI-4 |
| DS-04 | P0 | Latest articles | Article cards use a locally hosted explanatory diagram thumbnail or no image. The hotlinked Unsplash photographs are removed from the home and articles pages. | Three columns. | Single column, thumbnails optional. | Removes one third-party host and about 300 KB of photographs. | BR-01, DS-07 | UI-4 |
| DS-05 | P0 | Trust strip | A short strip stating only true, narrow claims (inputs processed in the browser, no sign-up) linking to the Privacy page. No user counts, ratings or awards (rulebook 3.1). | One row. | Stacked list. | Text only. | BR-01 | UI-4 |
| DS-06 | P0 | All Tools directory | Keep the route /tools.html. Structure: search, sections in catalog order with count and one-line purpose, tool cards. Search reuses the central catalog. Only published tools are rendered. | Rail plus grid (GL-04). | Chips plus single column (GL-05). | 396 DOM nodes today; must stay under 600 on this page. | DS-07, DS-08 | UI-4 |
| DS-07 | P0 | Tool card | One card system: name (h3), one-line purpose, section label as text, whole card is one link with a visible focus ring. Same anatomy for tools, categories and articles, with a different meta line. | Min 72 px tall; hover raises border only. | Min 64 px tall, full width. | No nested interactive elements; hover uses border and background, not layout. | BR-01, IX-05 | UI-2 |
| DS-08 | P0 | Empty and no-result states | Search with no match shows a message, the query echoed as text, and links to the five sections. | Inline. | Inline. | Status is polite; echoed query is text, never markup (rulebook 8.7). | BR-01 | UI-4 |
| DS-09 | P1 | Section landing pages | Fix the h1-to-h3 heading jump measured on the Time Tools and Developer Tools pages; list tools with the shared card. | Grid. | Single column. | One h1, no skipped levels. | DS-07 | UI-4 |
| DS-10 | P0 | Coming-soon handling | Catalog entries without pages stay catalog data. They are never rendered as cards, links or counts (rulebook 4.4). | n/a | n/a | n/a | none | UI-4 |

## Tool experience

| ID | Pri | Component | Requirement and expected behaviour | Desktop | Mobile | A11y / Perf | Depends on | Milestone |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TX-01 | P0 | Shared tool page frame | Consistent frame: breadcrumb, eyebrow, h1, one-line description, narrow privacy note, workspace, explanation. The generic '100% Free to Use' badge is replaced by a per-tool privacy statement that is true of that tool (rulebook 3.4). | Header block on the left, privacy note on the right at 960 px and up. | Stacked, privacy note below the description. | One h1; frame CSS lives in the shared layer only. | GL-07, BR-01 | UI-5 |
| TX-02 | P0 | Calculator layout | Inputs and results in one standard-width layout; at 960 px and up the result panel sits beside the inputs and stays in view; on phones the result follows the inputs with a 'Jump to result' link. Result figures use tabular numbers and the headline result is the largest element. | Two columns. | Single column. | No financial formula or validation changes; results announced through the existing polite region. | TX-01, IX-04 | UI-5 |
| TX-03 | P0 | Developer editor layout | Workspace width class; two panes side by side at 960 px and up; action bar immediately under the input; textareas use a bounded height so the primary action is visible without scrolling at 1280x800 and 390x844 (today Format sits at the bottom edge of the first viewport on a phone). | Two panes, actions beneath the input. | Stacked, input height clamp(160px, 28vh, 320px). | Monospace stack; no syntax-highlighting library; DOM unchanged for large inputs. | GL-08, IX-01 | UI-6 |
| TX-04 | P0 | Time Tools layout | Live clocks, timers and stopwatches use tabular numerals and fixed-width digit groups so ticking does not shift layout; no animation beyond a state colour change; honour reduced motion. | Standard width, World Clock may use workspace width. | Single column, 44 px controls. | No timers while paused or hidden (existing rule 7.4 preserved); World Clock DOM was 3,370 nodes and must not grow. | BR-04, IX-06 | UI-5 |
| TX-05 | P0 | Image and PDF tool layout | A visible 'Choose files' button (never drop-zone only), file list with remove buttons, explicit action ('Create', 'Merge'), progress, and a result block. Honest local-processing statement per tool. Processing engines are untouched. | Drop zone plus button; list beside the action. | Button first; list full width. | Download buttons look enabled when available; focus is not moved on updates; memory limits shown as already specified. | IX-01, IX-02 | UI-7 |
| TX-06 | P0 | Practice Labs layout | Task statement, input or editor, a single Check action, and a feedback region with a text verdict (Correct, Not yet, Error) plus icon; never colour alone. Evaluation logic is untouched. | Task and workspace side by side at 960 px. | Stacked; Check visible after the input. | Feedback region is polite; no focus movement on check. | IX-01, IX-08 | UI-6 |
| TX-07 | P0 | Smart Flashcards layout | Deck chooser, card with 'Show answer' reveal (no 3D flip), progress text, and the existing opt-in saving panel with its disabled controls still looking unavailable only when truly disabled. No streaks or points (rulebook 7.7). | Card up to 720 px wide. | Full-width card; rating buttons 48 px. | Reveal is a content change with no animation under reduced motion; storage contract (tz-learn-v1, 100 KB) unchanged. | IX-01, IX-02 | UI-6 |
| TX-08 | P0 | Tool CSS ownership | Tool CSS files keep only layout the tool alone needs; buttons, focus, headings, spacing and tokens come from the shared layer (rulebook 7.5). | n/a | n/a | Prevents a second design layer. | BR-01, IX-01 | UI-2 |
| TX-09 | DEFER | Contextual same-section tool rail | Idea only: a collapsible same-section list beside the working area at 1280 px and wider. DEFERRED to its own phase; it is the next step of rulebook 4.8 and needs a pilot and approval. | Not built. | Not built. | Would take 240 px from the workspace. | none | none (deferred) |

## Content

| ID | Pri | Component | Requirement and expected behaviour | Desktop | Mobile | A11y / Perf | Depends on | Milestone |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CT-01 | P1 | Article layout | Reading column 720 px (about 68 characters), 18 px body, 1.7 line height; table of contents collapsed in a details element on phones; sticky TOC only at 1100 px and wider. | Reading column with optional TOC rail. | TOC collapsed. | Static HTML headings preserved; anchors preserved. | GL-08, BR-04 | UI-8 |
| CT-02 | P1 | Article hero visual | Hero diagram sized to its content (the current diagram card is mostly empty), explanatory, with real numbers; no stock photographs. | Beside the title. | Below the title, full width. | SVG or WebP under 40 KB; width and height attributes set. | BR-01 | UI-8 |
| CT-03 | P0 | Tables | Real tables in a labelled scroll region (role='region', tabindex='0', aria-label) with sticky header only when it helps; numeric columns right-aligned with tabular numerals. | Table fills the container. | Scrolls inside its own region. | No page-level horizontal scroll. | BR-01 | UI-5 |
| CT-04 | P1 | FAQ and accordions | Native details/summary with a 44 px summary, visible focus and an icon that rotates under reduced-motion-safe rules. Answers stay in the static HTML. | Single column. | Single column. | Content indexable without JS. | IX-09 | UI-8 |
| CT-05 | P0 | Legal and information pages | Privacy, Terms and Disclaimer join the design system. Today they load five stylesheets, no reset and no font, and render in the browser's default serif; Contact and About get the standard frame. Wording is not changed in this programme. | Reading width. | Reading width. | One banner and one main landmark per page. | BR-04, GL-08 | UI-8 |
| CT-06 | P0 | Error page | The 404 page gets the standard header, a search field and the five section links so a lost visitor can recover. Status stays 404. | Centered column. | Full width. | Keeps noindex behaviour; no external font request. | GL-01 | UI-4 |

## Interaction

| ID | Pri | Component | Requirement and expected behaviour | Desktop | Mobile | A11y / Perf | Depends on | Milestone |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IX-01 | P0 | Button system | Four variants: primary (filled ink), secondary (outlined, 3:1 border), tertiary (text link-button), destructive (outlined error). Minimum height 44 px, padding 16 px, label weight 600, radius 10 px. Destructive actions sit away from primary ones. | Inline groups with 12 px gaps. | Full-width stacked when more than two. | One shared stylesheet; no tool restates colours for states (closes U4). | BR-01 | UI-2 |
| IX-02 | P0 | Control states | Defined states for every variant: default, hover, active, focus-visible, disabled, loading, success. Enabled secondary actions (Reset, Download, Copy) never use the disabled look; disabled look is reserved for truly unavailable controls. | Hover shown. | No hover dependence; active state visible. | Disabled text exempt from contrast but visibly distinct; loading state uses a text label, not only a spinner. | IX-01 | UI-2 |
| IX-03 | P0 | Automatic results | No Calculate button is added to a tool that already updates automatically (rulebook 7.9). Explicit-action tools (file, staged, long-running) keep their action buttons. | n/a | n/a | No behaviour change. | none | UI-2 |
| IX-04 | P0 | Form controls | Label above control, linked hint, linked error, 44 px height, 16 px font, border at 3:1 or better (current #d0d5dd is 1.47:1), unit adornments inside the field, invalid state shows text and icon. | Two-column groups allowed. | Single column. | Meaning never by colour alone; errors named and located (rulebook 8.6). | BR-01, BR-04 | UI-2 |
| IX-05 | P0 | Focus indicator | A 2 px accent ring with 2 px offset on every interactive element, visible on both light surfaces and the dark footer; never removed. | Keyboard visible. | Visible on external keyboard. | Ring at least 3:1 against adjacent colours; not clipped by overflow. | BR-01 | UI-2 |
| IX-06 | P0 | Motion | Durations 120 ms (hover, press) and 200 ms (drawer, accordion, reveal), ease-out; only transform and opacity; no animation on result updates; honour prefers-reduced-motion everywhere; no animation library. | As stated. | As stated. | No layout-affecting animation; no long tasks. | BR-01 | UI-2 |
| IX-07 | P1 | Dialogs | Restyle dialogs on the existing activateDialog mechanics: focus in, Tab contained, Escape closes, focus returns, background inert. | Centered, 560 px max. | Bottom sheet or full width, safe-area aware. | Behaviour untouched. | IX-01 | UI-2 |
| IX-08 | P0 | Feedback and status | Success, error, warning and info messages use one alert component: icon, bold lead word, text; polite region for changes; copy buttons show 'Copied' text for 2 seconds. | Inline under the action. | Inline, full width. | Never announce per keystroke (rulebook 7.3). | BR-01 | UI-2 |
| IX-09 | P1 | Tabs and accordions | Shared tab and accordion styles with roving focus for tabs; underline indicator; 44 px targets. | Horizontal tabs. | Scrollable tabs. | Arrow-key navigation for tabs. | IX-01 | UI-2 |

## Quality

| ID | Pri | Component | Requirement and expected behaviour | Desktop | Mobile | A11y / Perf | Depends on | Milestone |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| QA-01 | P0 | WCAG 2.2 AA conformance | Target size at least 24 px everywhere and 44 px for primary controls; visible focus; no focus obscured by sticky header; consistent navigation; accessible authentication not applicable. | n/a | n/a | Targets the criteria in 14-ACCESSIBILITY-AND-PERFORMANCE.md. | IX-05 | UI-9 |
| QA-02 | P0 | Reflow and zoom | No page-level horizontal scroll at 320 px or at 400% zoom on a 1280 px window; long content scrolls inside its own region. | 400% zoom ok. | 320 px ok. | Measured today: 20 of 20 sampled pages pass at 320, 390 and 1280 px. | GL-09 | UI-9 |
| QA-03 | P0 | Performance budget | Per page type: CSS transfer at most the current value plus 10%, CSS requests at most 12 (today 23 to 25 on tool pages), no web-font blocking, no third-party requests, JavaScript growth at most 3 KB gzip across the programme. | n/a | Tested on a throttled mid-range Android profile. | Largest Contentful Paint and Cumulative Layout Shift are measured with Lighthouse at the checkpoint (not measured in this research). | none | UI-0 |
| QA-04 | P0 | SEO preservation | Routes, canonicals, titles, descriptions, JSON-LD, sitemap entries, heading text and article anchors are unchanged unless an owner-approved reason exists. Navigation links are in the static HTML. | n/a | n/a | Static checks cover this. | none | UI-9 |
| QA-05 | P0 | Privacy and third parties | No new third-party requests. Google Fonts and Unsplash requests are removed. Consent-based analytics code and wording are untouched. The Privacy page gains no new claim without owner approval. | n/a | n/a | Reduces the external hosts per page from three to zero. | BR-04, DS-04 | UI-9 |
| QA-06 | P0 | Security | No new inline scripts or event-handler attributes; visitor text stays text (rulebook 8.7); no new dependency. | n/a | n/a | Compatible with a strict script-src. | none | UI-9 |
| QA-07 | P0 | Browser compatibility | Current Chrome, Edge, Firefox and Safari 16 or later. CSS limited to custom properties, grid, flex, clamp and focus-visible; newer features only as progressive enhancement. | n/a | n/a | Safari and real-device behaviour are not verified in this research. | none | UI-9 |
| QA-08 | P0 | Functional preservation | No change to formulas, calculation modules, PDF engines, JSON evaluators, learning-answer evaluation, storage contracts or published URLs. A diff gate lists the protected paths. | n/a | n/a | Protects rulebook 9.3. | none | UI-0 |
| QA-09 | P0 | Visual regression discipline | Baselines regenerate only for surfaces a milestone changed, each image reviewed by eye (rulebook 10.5); one Playwright worker, one project at a time. | n/a | n/a | Respects the 4 GB machine limit. | none | UI-0 |

## Acceptance criteria

Each criterion is observable and checkable by the owner, a focused test or a measurement. A criterion that needs a real device or a browser not available locally is reported as unverified until someone does it (rulebook 10.8).

| Acceptance ID | Requirement | Criterion |
| --- | --- | --- |
| BR-01.1 | BR-01 | Token file defines every role in 05-COLOUR-AND-TYPOGRAPHY-OPTIONS.md with the approved HEX values. |
| BR-01.2 | BR-01 | The design-tokens unit test passes; no shared-layer CSS file introduces a new literal colour outside the token file. |
| BR-02.1 | BR-02 | No text glyph is used as a logo anywhere in generated HTML. |
| BR-02.2 | BR-02 | Logo link has accessible name 'ToolZen Hub home' and the symbol reads clearly at 24 px on white and on the dark footer. |
| BR-03.1 | BR-03 | Favicon colours are identical to the logo symbol colours (today they differ: #14B8A6 favicon against #0b9f58 header). |
| BR-03.2 | BR-03 | The symbol is distinguishable at 16 px in a rendered check on a light and a dark tab strip. |
| BR-03.3 | BR-03 | Owner condition: logo Concept 2 and favicon Concept 3 are both rendered at 16 and 32 px in a browser tab strip and the clearer one is chosen; the choice and the comparison are recorded. |
| BR-04.1 | BR-04 | No generated page requests fonts.googleapis.com or fonts.gstatic.com. |
| BR-04.2 | BR-04 | The rupee sign renders in the self-hosted font on the EMI and SIP pages. |
| BR-04.3 | BR-04 | Owner condition: before the font is included, its licence file, its measured transferred size (at most 70 KB) and its U+20B9 glyph coverage are checked and recorded; otherwise the system stack is used. |
| BR-04.4 | BR-04 | Computed font-family of the header, legal pages and body resolves to the same family. |
| BR-05.1 | BR-05 | Three logo variants exist and pass a visual check on #ffffff, #fafaf9 and #1c1917. |
| BR-05.2 | BR-05 | The default OG image is served locally and every page's og:image resolves with HTTP 200. |
| BR-06.1 | BR-06 | No emoji or Unicode symbol glyph (for example the abacus, calendar, picture and page emoji on the home cards) is used as an icon in generated HTML. |
| BR-06.2 | BR-06 | Icon-only buttons have an accessible name. |
| BR-07.1 | BR-07 | Section meaning is still readable in greyscale (a word, not only a colour). |
| BR-08.1 | BR-08 | Shared CSS contains no literal colour that would be wrong on a dark surface (checked by the token test). |
| BR-09.1 | BR-09 | A scripted pass over the shared layer finds no text colour below 4.5:1 and no control border below 3:1 against its surface. |
| BR-09.2 | BR-09 | Brand-green-as-text occurrences listed in design-follow-ups.md section 1 are all resolved or recorded as large text or non-text. |
| GL-01.1 | GL-01 | Every generated page has exactly one banner landmark and one main landmark. |
| GL-01.2 | GL-01 | The active section link has aria-current and a non-colour cue (underline or weight). |
| GL-01.3 | GL-01 | Header height at 320, 390 and 1280 px matches the specified values within 2 px. |
| GL-02.1 | GL-02 | Generated HTML contains no href='#' in the footer. |
| GL-02.2 | GL-02 | Footer section links equal the catalog sections with no hard-coded list. |
| GL-02.3 | GL-02 | Owner condition: any social link that remains points to a destination the owner has verified; no account or URL is invented, and unsupported links are removed. |
| GL-03.1 | GL-03 | The menu button is at least 44x44 px. |
| GL-03.2 | GL-03 | With the keyboard: Enter opens, Tab stays within the panel (or the page behind is inert), Escape closes and focus returns to the button. |
| GL-03.3 | GL-03 | aria-expanded reflects state; the panel is not reachable by Tab when closed. |
| GL-03.4 | GL-03 | At 320 px no link text is clipped. |
| GL-04.1 | GL-04 | Rail section counts equal the catalog counts (19, 13, 17, 2, 3). |
| GL-04.2 | GL-04 | Keyboard Tab order is rail then content; pressing a rail link moves focus to the section heading. |
| GL-04.3 | GL-04 | At 1280 px the card grid is at least 720 px wide. |
| GL-05.1 | GL-05 | At 320 px every section is reachable by tap and by keyboard without horizontal page scroll. |
| GL-05.2 | GL-05 | Chip hit areas are at least 44 px tall. |
| GL-06.1 | GL-06 | On the pilot family the panel lists only same-section tools. |
| GL-06.2 | GL-06 | A tool with no curated relation renders no empty panel. |
| GL-07.1 | GL-07 | EMI Calculator breadcrumb shows 'Loans' (title case) in generated HTML. The matching BreadcrumbList label change is authorised by the QA-04.2 exception. |
| GL-07.2 | GL-07 | At 320 px the breadcrumb does not cause horizontal page scroll on any tool page. |
| GL-08.1 | GL-08 | Article text measure is between 60 and 75 characters at 1280 px. |
| GL-08.2 | GL-08 | Text Diff and JSON Compare use the workspace width class; calculators use standard. |
| GL-09.1 | GL-09 | New and touched shared CSS uses only the three breakpoints. |
| GL-09.2 | GL-09 | No page-level horizontal scroll at 320, 360, 390, 640, 960 and 1280 px on the milestone's pages. |
| GL-10.1 | GL-10 | Typing 'json' lists the JSON Formatter first (rulebook 5.2). |
| GL-10.2 | GL-10 | A polite status announces the count; a no-results message appears for an unmatched query. |
| DS-01.1 | DS-01 | Search field is inside the first viewport at 390x844 and 1280x800. |
| DS-01.2 | DS-01 | No decorative raster image loads on the home page above the fold. |
| DS-02.1 | DS-02 | No third card is cropped at 390 px; no horizontal scroll container on the home page. |
| DS-02.2 | DS-02 | Counts shown equal the catalog. |
| DS-03.1 | DS-03 | No Featured card text wraps below 20 characters per line at 1280 px. |
| DS-03.2 | DS-03 | No 'popular', 'trending' or ranking wording exists on the page. |
| DS-04.1 | DS-04 | No request to images.unsplash.com from any page. |
| DS-04.2 | DS-04 | Every remaining article image has alt text that states what it explains. |
| DS-05.1 | DS-05 | Every claim in the strip is traceable to rulebook 8.8 or a tool spec. |
| DS-05.2 | DS-05 | No numeric usage claim appears. |
| DS-06.1 | DS-06 | Rendered tool count equals 54. |
| DS-06.2 | DS-06 | No coming-soon entry is rendered or linked. |
| DS-06.3 | DS-06 | The sitemap and canonical for /tools.html are unchanged. |
| DS-07.1 | DS-07 | Cards contain exactly one link. |
| DS-07.2 | DS-07 | Card hover and focus states do not change card dimensions. |
| DS-08.1 | DS-08 | Searching '<b>x' shows the characters literally. |
| DS-08.2 | DS-08 | The no-result state offers all five section links. |
| DS-09.1 | DS-09 | The heading outline of every section page has no skipped level. |
| DS-10.1 | DS-10 | No generated page links to a non-existent tool or article route. |
| TX-01.1 | TX-01 | Every tool page shows exactly one h1 and a privacy note reviewed against its spec. |
| TX-01.2 | TX-01 | Frame renders without horizontal scroll at 320 px for all 54 tools (sampled by family at the checkpoint). |
| TX-02.1 | TX-02 | Calculators' outputs for the golden test values are unchanged. |
| TX-02.2 | TX-02 | The headline result is visually first in the result panel. |
| TX-02.3 | TX-02 | Jump link moves keyboard focus to the result heading. |
| TX-03.1 | TX-03 | The primary action of JSON Formatter, Text Diff and JSONPath Tester is inside the first viewport at 390x844 and 1280x800 without scrolling. |
| TX-03.2 | TX-03 | JSON, diff and path evaluators produce identical outputs on the existing unit fixtures. |
| TX-04.1 | TX-04 | Cumulative layout shift during one minute of a running Stopwatch is 0. |
| TX-04.2 | TX-04 | World Clock DOM node count does not exceed its current value. |
| TX-05.1 | TX-05 | Merge PDF, Split PDF, PDF Pages, Photos to PDF and the Image Compressor can complete their primary journey with the keyboard only. |
| TX-05.2 | TX-05 | Byte-for-byte output of the PDF engines is unchanged on the existing fixtures. |
| TX-06.1 | TX-06 | Every verdict has a text label. |
| TX-06.2 | TX-06 | Existing lab answer-evaluation unit tests pass unchanged. |
| TX-07.1 | TX-07 | Spaced-repetition scheduling and storage tests pass unchanged. |
| TX-07.2 | TX-07 | Export, Import and Reset look enabled once saving is on. |
| TX-08.1 | TX-08 | A touched tool stylesheet contains no new colour literal and no button rule that duplicates the shared button. |
| TX-09.1 | TX-09 | Not applicable in this programme: the item stays DEFER and is excluded from every P0 milestone. |
| CT-01.1 | CT-01 | Heading ids and article URLs are unchanged. |
| CT-01.2 | CT-01 | Measure at 1280 px is 60 to 75 characters. |
| CT-02.1 | CT-02 | Each article hero has alt text that states what it explains. |
| CT-02.2 | CT-02 | No article hero has more than 40% empty area in a visual review. |
| CT-03.1 | CT-03 | At 320 px every table scrolls inside its region and the page does not. |
| CT-03.2 | CT-03 | Amortization tables remain keyboard scrollable. |
| CT-04.1 | CT-04 | Collapsed answers are present in the generated HTML. |
| CT-04.2 | CT-04 | Summary is operable by Enter and Space. |
| CT-05.1 | CT-05 | Computed font-family on Privacy, Terms and Disclaimer matches the site body font. |
| CT-05.2 | CT-05 | Page text is byte-identical apart from markup structure (no wording change). |
| CT-06.1 | CT-06 | Requesting a missing URL returns 404 and the page contains a navigation landmark and a search field. |
| IX-01.1 | IX-01 | Every button in the shared layer is at least 44 px tall. |
| IX-01.2 | IX-01 | Primary and secondary are distinguishable in greyscale (fill versus outline). |
| IX-02.1 | IX-02 | No enabled button uses the disabled token pair. |
| IX-02.2 | IX-02 | Each variant has all listed states in the component sheet. |
| IX-03.1 | IX-03 | The set of tools with a Calculate button is identical before and after the programme. |
| IX-04.1 | IX-04 | Input border contrast against its surface is at least 3:1. |
| IX-04.2 | IX-04 | Every invalid field has aria-invalid and an error message linked by aria-describedby. |
| IX-05.1 | IX-05 | Tabbing through the home page shows a visible ring on every stop. |
| IX-05.2 | IX-05 | Ring contrast is at least 3:1 on page background, card and footer. |
| IX-06.1 | IX-06 | With reduced motion enabled no transition longer than 0 ms runs. |
| IX-06.2 | IX-06 | No animation uses width, height, top or left. |
| IX-07.1 | IX-07 | Loan Comparison modal keyboard behaviour passes the existing dialog tests. |
| IX-08.1 | IX-08 | Each alert type has an icon and a lead word, so greyscale still conveys meaning. |
| IX-09.1 | IX-09 | Tabs expose tablist, tab and tabpanel roles with arrow-key support where tabs exist. |
| QA-01.1 | QA-01 | Automated and manual checks in the checkpoint list no AA failure on the representative page set. |
| QA-01.2 | QA-01 | Focused elements are not hidden behind the sticky header (scroll-padding set). |
| QA-01.3 | QA-01 | Owner condition: contrast is verified on the built components (buttons, inputs, alerts, cards, selected states, footer) as rendered, not only on the palette pairs. |
| QA-02.1 | QA-02 | The same 20-page sample passes after every milestone that touches layout. |
| QA-03.1 | QA-03 | Measured transfer and request counts are within budget for home, All Tools, a calculator, a developer tool, an article and a legal page. |
| QA-03.2 | QA-03 | Lighthouse mobile performance is not lower than the recorded baseline on those pages. |
| QA-04.1 | QA-04 | The URL inventory check passes with 107 sitemap URLs. |
| QA-04.2 | QA-04 | A diff of titles, descriptions, canonicals and JSON-LD across all generated pages is empty. Narrow owner-approved exception (2026-10-30): the category step name in BreadcrumbList on tool pages changes from the lowercase id to its title-case display label (for example "loans" to "Loans") so it matches the visible breadcrumb; no other JSON-LD field, URL, canonical or hierarchy changes. |
| QA-05.1 | QA-05 | No generated page contacts a host other than the site itself (analytics after consent excepted). |
| QA-05.2 | QA-05 | assets/js/analytics.js and src/_data/site.js are unchanged. |
| QA-06.1 | QA-06 | package.json dependencies are unchanged. |
| QA-06.2 | QA-06 | Existing security cases for user text pass. |
| QA-07.1 | QA-07 | Playwright Chrome passes the checkpoint set; Safari and real Android are reported as owner-verified or unverified, never assumed. |
| QA-08.1 | QA-08 | Protected-path diff (assets/js/calculators, tools logic, pdf engines, learning evaluators) is empty for every milestone commit. |
| QA-09.1 | QA-09 | Each milestone report lists regenerated baselines by name and the review outcome. |

## Traceability: milestone to requirements

| Milestone | Name | Requirements | Acceptance criteria |
| --- | --- | --- | --- |
| UI-0 | Baseline, gates and design-token foundation | BR-01, BR-09, GL-08, GL-09, QA-03, QA-08, QA-09 | 12 |
| UI-1 | Brand identity: logo, favicon, typography, icons | BR-02, BR-03, BR-04, BR-05, BR-06, BR-07 | 14 |
| UI-2 | Shared components: buttons, forms, cards, states | IX-01, IX-02, IX-03, IX-04, IX-05, IX-06, IX-07, IX-08, IX-09, DS-07, TX-08 | 17 |
| UI-3 | Header, footer, mobile menu, breadcrumbs | GL-01, GL-02, GL-03, GL-07 | 12 |
| UI-4 | Homepage, All Tools directory, section pages, search, 404 | DS-01, DS-02, DS-03, DS-04, DS-05, DS-06, DS-08, DS-09, DS-10, GL-04, GL-05, GL-10, CT-06 | 25 |
| UI-5 | Calculators and Time Tools layouts | TX-01, TX-02, TX-04, CT-03 | 9 |
| UI-6 | Developer Tools, Practice Labs, Flashcards (and related-tools pilot) | TX-03, TX-06, TX-07, GL-06 | 8 |
| UI-7 | Image and PDF tool layouts | TX-05 | 2 |
| UI-8 | Articles and informational pages | CT-01, CT-02, CT-04, CT-05 | 8 |
| UI-9 | Integration checkpoint and conformance verification | QA-01, QA-02, QA-04, QA-05, QA-06, QA-07 | 11 |

Deferred and not assigned: BR-08, TX-09.

## Source of each requirement

| Requirement group | Evidence it answers | Document |
| --- | --- | --- |
| Brand (BR) | Header glyph logo, teal favicon against green header, Georgia/Times serif, 3.43:1 green text, 1.47:1 input border, Google Fonts on every page | 02, 04, 05, 06 |
| Global layout (GL) | Verified mobile menu behaviour, no sidebar, placeholder footer links, lowercase breadcrumb | 02, 07, 08, 09 |
| Discovery (DS) | Home layout, cropped carousel, stock illustration, Unsplash cards, All Tools structure | 02, 10 |
| Tool experience (TX) | Per-family screenshots and measurements | 02, 11 |
| Content (CT) | Article and legal page captures | 02, 13 |
| Interaction (IX) | Button, state and form audit | 02, 12 |
| Quality (QA) | Measurements, rulebook sections 7, 8, 9 and 10 | 14, 15 |
