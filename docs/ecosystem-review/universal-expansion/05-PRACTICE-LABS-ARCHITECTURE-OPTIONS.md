# 05. Practice Labs: taxonomy and discoverability options (B17, B24)

## Verified starting point

- The five learning pages (Smart Flashcards, JSON Error-Fixing Lab, JSONPath Challenge Lab, Cron Challenge Lab, Test Design Lab) are **published inside Developer Tools**, routes `/tools/<id>/`. This was approved by the owner on 2026-10-28 (`practice-labs/18`, conditions 1 and 2) with the note in `practice-labs/09` that placement should be **reconsidered "if the practice set grows to include non-developer subjects such as Excel"**. The new learning ecosystems in B18 are exactly that trigger.
- "Practice lab" or "learning" appears **zero** times on the built Home, All Tools, Developer Tools and Articles pages. A visitor finds a lab only by browsing Developer Tools or searching.
- Rule 4.2 isolates sections; rule 4.3 derives routes from the catalog; rule 4.5 keeps the header uncluttered; rule 4.7 and 11.7 require owner approval to create, rename or restructure a section. Non-calculator sections share the `/tools/` prefix, so a new section can keep **every existing URL unchanged** (verified: `pathPrefix: "tools"` for all four).
- The shared learning engine (`assets/js/learning/`, with `lab-shell`, `scheduler`, `session`, `progress-store`) already exists. Progress saving is an approved exception only for Smart Flashcards (rule 7.7); the labs save nothing.

## Options

| Option | What changes | Pros | Cons and rule impact |
|---|---|---|---|
| **P0. Do nothing structural.** Improve search aliases and add text links | No catalog or navigation change | Zero risk | Does not meet the owner's stated goal; discoverability defect D11 stays |
| **P1. A "Practice Labs" hub page, no new section.** One page under the existing structure that presents the five (later more) learning pages as a path, linked from Developer Tools, All Tools and Home text | Presentation only; tools stay in Developer Tools | Smallest change; all URLs and catalog records unchanged; reversible | A hub that lists learning pages from several future subjects would list tools from one section only until subjects widen; Excel or SQL would still sit in Developer Tools (taxonomy strain, already flagged in 2026-10-28) |
| **P2. A new "Practice Labs" section** (catalog section, landing page, same `/tools/<id>/` URLs) holding the five | Moves five catalog records to a new section; needs landing page, counts, breadcrumbs, search scope, sitemap entry | Clear identity; fits future SQL, Excel, QA subjects; no URL change | Section creation needs approval (4.7, 11.7); Developer Tools loses the labs from its listing and from same-section related links to the tools they teach (JSON Formatter, JSONPath Tester, Cron Explainer), which rule 4.2 would forbid in related lists, so each tool-to-lab link becomes text only unless O-4 relaxes it |
| **P3. Two sections** (Practice Labs and Flashcards) | As P2 plus another | None here | Two sections for five pages; worst on rule 4.7 |

## Recommendation (an inference, not a decision)

**P1 now, P2 only when a second subject exists and is real.** Reason: today there are five pages in one subject area serving developers and testers. A hub (P1) fixes the verified discoverability gap (D11) at the lowest cost and keeps the earlier approved placement intact. The moment the SQL vertical (doc 06) is built, the Developer Tools placement is no longer defensible, so P2 should be decided **together with** the first non-developer lab, not before: that is the point rule 4.7 asks for ("several genuinely useful products"). If the owner prefers a clean identity now, P2 is feasible without URL changes; the cost is the related-list rule (O-4).

## What the hub (P1) contains, if approved

1. A landing page `/practice-labs.html` (a page, not a section) explaining: practise, not just read; what is a lab, what is a flashcard deck; what runs in the browser and what does not; privacy ("the labs save nothing; flashcard saving is optional, off by default").
2. Entries grouped by **skill and level** (Beginner, Intermediate), each entry showing its subject, what you practise, number of items and estimated time, **only counts that are true** (derived from the content registry, not typed in).
3. A path per role described in doc 06, shown only when its pages exist.
4. Links from: the Developer Tools section text, the All Tools directory (a short line and link), the Home page text only where a count updates itself (rule 4.5), the five pages' breadcrumbs unchanged, and the learning pages' related blocks.
5. Header: **no new item** (rule 4.5); All Tools stays the global path.
6. Search: aliases "practice", "lab", "exercise", "quiz", "flashcards", each true and tested in both directions (rule 5.3 and 5.4); "SQL practice" appears only when it exists.

## Contextual connections (B24)

Small contextual blocks beat global navigation: on a lab, "Learn the tool" (the JSONPath Tester) and, on the tool, "Practise this" (the lab). Today they are legal as text links and, within one section, as related lists. Across sections they need rule 4.2 relaxed. Proposed minimal rule text for the owner to consider (not recorded as policy): "A learning page and the tool it teaches may link to each other with one curated pair of links even across sections; no other cross-section related lists." Owner decision **O-4**.

## Do not

Create duplicate catalog records for the same page; move any route; rename a section without approval; present a lab count that is not computed; or describe a simulation as a real runtime.
