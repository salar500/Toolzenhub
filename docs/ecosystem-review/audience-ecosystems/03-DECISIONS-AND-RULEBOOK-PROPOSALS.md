# 03. Decisions D1–D6 and proposed rulebook changes

The owner asked (2026-11-15) for each decision to be made on the evidence, with alternatives and trade-offs, and not to wait. The decisions below are **Claude's recommendations, made under that delegation**. The owner gave three working directions the same day: an audience discovery layer at `/for/...`; a directory of about 40–60 verified AI products; and image/PDF expansion only where browser output is reliable. Those are recorded as the owner's direction.

Several recommendations need a rulebook sentence to change. Rulebook section 15 says a rule changes only on the owner's approval and is never smuggled into an unrelated change. So the exact wording is proposed here (R1–R7), and **the rulebook file itself is not edited in this phase.** The proposals are small and amend existing rules; they add no new principles.

---

## D1. How the three audiences fit the architecture

> **Withdrawn by the owner, 2026-11-15:** no audience pages and no audience navigation. Audiences are discovery tags inside the AI Tools directory only. R1, R2 and R4 are therefore not applied. The analysis below is kept as the record of what was considered.

| Option | For | Against |
| --- | --- | --- |
| A. Audiences replace sections as primary navigation | Strongest identity | Breaks the route, breadcrumb, workspace-sidebar and sitemap model; hides the 30 calculators and 13 time tools (57 % of tools) that serve none of the three audiences; contradicts the owner's "keep categories intact" |
| **B. Audience hubs as a discovery layer** (`/for/developers/`, `/for/qa-testers/`, `/for/data-analysts/`) over unchanged sections | Same pattern as the Practice Labs departments, already proven in this codebase; no URL changes; tools, paths, articles and AI entries can all be gathered for one role | A tool appears in two places (its section and one or more hubs), which needs a rule amendment |
| C. Only an audience filter on All Tools | Cheapest | No "where do I start" journey; learning paths and AI entries are not tools, so they would not appear |

**Decision: B**, with C later as a cheap addition (an audience chip on All Tools reusing the same data).

Scope validated (see `02` section 1): QA, Data Analyst and BI Analyst are recognised roles (roadmap.sh, observed); our paths and labs already cluster there (verified). Overlap is many-to-many: SQL is in all three hubs; JSON, JWT, URL and diff tools in Developers and QA; Playwright in QA and Developers. Calculators and time tools stay the site's general audience. A fourth hub ("everyday money and time") is **not** proposed now: those users arrive through search on a single tool and already have sections.

Membership is curated in one place, `assets/js/data/audiences.js` (groups ordered by job). Tool entries are not edited. A unit test resolves every reference to a published item.

**R1 (amends rule 4.2, add one sentence):** "Discovery pages that are not sections (the Practice Labs departments and the audience hubs under `/for/`) may list published items from several sections. Each item keeps its one section, canonical route and breadcrumb, and a discovery page never changes a section's listings, scoped search or counts."

**R2 (amends rule 4.8 or 4.10, Practice Labs departments, to name the second discovery layer):** "Audience hubs (owner direction 2026-11-15): `/for/developers/`, `/for/qa-testers/` and `/for/data-analysts/` gather tools, learning paths, articles and AI directory entries for one role, curated in `assets/js/data/audiences.js`. A hub is published only when every group on it has real items. It is not a section and adds no header item."

## D2. Where the AI product directory lives, and how it stays true

| Option | For | Against |
| --- | --- | --- |
| A. A new eighth section | Clean separation | A section of links, not tools; rule 4.7 bar; more navigation |
| **B. One page in the AI Tools section, `/ai-tools/directory/`** | Users looking for AI help land in one place: our prompt tools beside the products they paste into; no new section | Rule 4.11 defines the section as browser utilities, so it needs one sentence |
| C. Hand-written lists inside each hub | No new page | Duplicates data three times; no search; drifts |

**Decision: B.** One data file, `assets/js/data/ai-directory.js`, feeds the page and the hubs' filtered slices.

Freshness (rulebook section 13 applies: this is changing information): model A/B, manual verification with a date per entry. A build-time **report** (not a failing test, so builds stay reproducible) lists entries whose `verifiedOn` is older than 180 days, and the release checklist re-verifies those. Pricing is shown only as a model (free / freemium / paid / trial) with its check date, never a price. No logos (no third-party image requests, rule 6.4). No ratings, "popular" or "best" labels (rules 3.1–3.3). No referral parameters. Links are marked as external.

Expansion later: add entries in batches of 10–20 when a hub has a real job without a product (for example API mocking, data cleaning), each batch with the same verification. Re-verify all entries every 6 months. Retire an entry whose official URL redirects to a different product: this already happened for 5 of 66 candidates in this research (see `04`).

**R3 (amends rule 4.11, append):** "The section also holds one directory page, `/ai-tools/directory/`, of external AI products (owner direction 2026-11-15). Every entry is checked on the product's official site and carries the date it was checked; pricing is shown only as a model with its check date; entries are text only, with no ranking, paid placement, referral link or logo; an entry whose official site no longer describes the product is removed. Section 13's freshness rules apply."

## D3. Home page changes

| Option | For | Against |
| --- | --- | --- |
| A. Replace the ecosystem cards with three audience cards | Strong identity | Loses the calculators, which bring most search arrivals (hypothesis) |
| **B. Add a compact "Choose your path" row of three audience cards between the hero and the ecosystem cards; compact the hero art on narrow screens** | Recognisable entry for the three roles; nothing removed | Home grows by one row (about 140 px desktop; on phones the cards become a 3-item horizontal row or a stacked list of about 3×64 px) |
| C. No change | No risk | Audience hubs would be undiscoverable |

**Decision: B.** Mobile hero: keep the order (headline, actions, search, art). At widths below 600 px, cap the art at 160 px height, and hide it when the viewport height is below 700 px, so the audience row is visible on the first screen of a typical phone.

**R4 (amends rule 7.12):** replace "the six ecosystem cards follow directly" with "a row of the three audience hubs follows, then the ecosystem cards; on narrow screens the illustration is reduced so the first screen shows the search and the start of the audience row."

## D4. Theme palettes

| Option | For | Against |
| --- | --- | --- |
| A. Keep light/dark only | Zero risk | The owner wants an optional choice; no accessible alternative today |
| **B. Two optional palettes beside Standard: High contrast and Warm** (each with light and dark), chosen in a small popover on the existing theme button | High contrast has a real accessibility purpose; Warm lowers glare for long reading and lab sessions; only token overrides are needed | One more stored word; 26 hard-coded colours in 8 stylesheets must move to tokens first |
| C. Free colour customiser | Maximum choice | Contrast cannot be guaranteed; large UI; maintenance |

**Decision: B**, with at most three palettes in total. High contrast targets at least 7:1 for body text and a 3 px focus ring. Warm keeps at least 4.5:1. Both are verified with a contrast unit test computed from the token values.

**R5 (amends the theme exception in rule 7.7, append):** "The same control offers a small set of palettes (Standard, High contrast and Warm, each with light and dark). The chosen palette's single word is kept under `tz-palette` on the same terms as the theme; no other data is stored. Every palette is a set of token overrides in `variables.css`, and each meets the contrast in rule 7.3."

## D5. Saved progress in the labs and paths

| Option | For | Against |
| --- | --- | --- |
| A. Nothing saved (today) | Simplest; matches every "nothing is stored" promise | Progress bars and "completed" states vanish on reload, which is misleading for a 24-lesson path; learners expect saving (Excel Easy saves automatically, Microsoft Learn tracks progress, observed) |
| **B. Opt-in local progress, the Flashcards model** | Off by default; stores only completed exercise/lesson ids; reset and export; no account | Privacy page and lab copy must change; a rule exception |
| C. Accounts | Cross-device | Forbidden (rule 7.11); backend |

**Decision: B, delivered last (Stage D)**, after the lab layout work, so the saved data has a settled shape. Key `tz-learn-progress-v1`, at most 50 KB, ids only, never answers, validated on load.

**R6 (amends the learning-tools exception in rule 7.7):** "Practice Labs and learning paths may also keep the ids of completed exercises and lessons under `tz-learn-progress-v1` (at most 50 KB), only after the visitor turns saving on, with reset and export; answers and typed text are never stored." The rule 10 statement that "the Practice Labs save nothing" is updated to match.

## D6. PDF to images (pdf.js)

| Option | For | Against |
| --- | --- | --- |
| A. Do not offer PDF to images | No dependency | One of the most prominent PDF jobs at both iLovePDF and PDF24 (observed) stays missing |
| **B. Vendor pdf.js (Mozilla, Apache-2.0), lazy-loaded only on the new tool page, rendering in its worker** | Reliable rendering (it is the PDF renderer of Firefox); local; output via canvas to PNG/JPEG, then a ZIP | Weight (to be measured before vendoring; the page loads it only on that tool); fonts in unusual PDFs may render imperfectly, so this is stated on the page |
| C. Server conversion | Best fidelity | Uploads, backend, cost, against rule 1.5 |

**Decision: B**, conditional on the measured gzip weight being acceptable for one tool page and a per-file page cap (for example 200 pages, 150 dpi default) keeping memory bounded on phones. This is a dependency approval under rule 9.1, recorded in the tool's spec, so it needs no rulebook sentence beyond the spec.

## D7. Tool-to-knowledge links across sections

The global tool-to-knowledge requirement means a JSON tool should point to the JSON lessons, and an EMI calculator to an official RBI page. Rules 4.2 and 4.10 keep *related lists* inside one section, so a "Learn and check" block that links a tool page to a Practice Labs lesson would break them as written.

| Option | For | Against |
| --- | --- | --- |
| A. Keep links in-section; mention lessons only in prose | No rule change | Not metadata-driven; cannot be audited; the owner's requirement is centralised |
| **B. Keep "Related tools" in-section as today; add a separate "Learn and check" block that may link learning paths, lessons, articles and official sources from anywhere** | Tools never leak into another section's tool lists (the intent of 4.2); learning and sources become discoverable | One sentence of rule change |

**Decision: B.**

**R7 (amends rule 6.3, append):** "Separately from Related Tools, a page may carry one 'Learn and check' block generated from `assets/js/data/knowledge.js`. It links learning paths, lessons, labs, articles and official sources relevant to that page's job, from any section, with a one-line reason each and at most six items. It never lists another section's tools, which stay in their own Related Tools."

## Other decisions made in this phase (no rule change needed)

| Topic | Decision | Reason |
| --- | --- | --- |
| Compress PDF | **Deferred (Future)** | Browser-only compression of image-heavy PDFs means rasterising, which can make text non-selectable and degrade quality; fails the "reliable output" gate |
| Protect/unlock PDF | Deferred | pdf-lib does not write encryption; a new crypto dependency is not justified yet |
| Background removal, OCR, PDF→Word | Deferred / rejected | ML model weight on phones; server-class work |
| Image crop/rotate, metadata viewer and remover | **Build (P1)** | Canvas only, no dependency, strong privacy value |
| Bank FD rates | Link each bank's own rate page with a check date; **copy no rate values** | Rule 13.2; a tracker needs its own selection (section 13) |
| Knowledge links storage | A separate `assets/js/data/knowledge.js` keyed by item id, read by `relationships.js` | Keeps 75 tool entries untouched (rule 9.3) and gives one place to audit coverage |
| AI directory size | 50 entries at launch (within the owner's 40–60) | Covers 14 categories with 2–6 each; all three audiences get at least 8 |

## What genuinely still needs the owner

1. **Approve R1–R7** (rule wording only). Stage A (defect fixes) needs none of them. Stage B (knowledge layer) can start with official sources and articles without approval; its lesson links need R7. Stage C needs R1–R4, and Stage D needs R5–R6. This is the only blocking item: rule changes are owner-only by the rulebook's own section 15.
2. **Pushing to the preview and the final package** stay as already authorised (development branch only; production never touched).

Nothing here involves cost, credentials or an irreversible step.
