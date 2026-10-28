# 09 Information architecture

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

**Owner decision recorded 2026-10-28:** the Option B scope baseline in doc 18 was approved with conditions. Only what doc 18 records as approved is approved; everything else in this document remains a proposal for Master Prompt 2 to develop. No implementation has started.

Practice Labs & Smart Flashcards ecosystem, Prompt 1 of 3 (research and requirements). Written 2026-10-28. Nothing here is a rule, a build queue or an approval; the rulebook is `docs/product-decision-rules.md`.

Evidence labels used throughout: **OBSERVED** (seen on a public page or in the repository this session), **CLAIMED** (stated by the source about itself, not verified), **INFERRED** (reasoned from observations), **UNKNOWN** (not established). **VERIFIED/HYPOTHESIS** follow rulebook 12.

## Options considered

| Option | Description | For | Against |
|---|---|---|---|
| A | Place the practice tools in the existing **Developer Tools** section | No new section; no navigation change (rulebook 4.5); related lists can link labs and the tools they teach (rule 4.2 allows same-section links); routes already `/tools/<id>/` | The section mixes tools that process data with tools that teach; its description and listing grow from 12 to 17 |
| B | One new **Learning and Practice** section | A distinct identity | Rule 4.7 requires a clear audience, several useful products, evidence of demand and a credible strategy; only five products and no demand data; related lists could not link a lab to the tool it teaches (rule 4.2) |
| C | **Two** new sections (Practice Labs; Flashcards) | Clear split | Two sections for five pages; heavier navigation; worst on 4.7 |
| D | **Hybrid**: one shared learning engine with subject-oriented pages | One engine, subject packs, no near-identical pages | An architecture, not a placement; needs a section |

## Recommendation: Option D, placed in Developer Tools (Option A for placement)

- **Architecture (D):** one shared learning layer and subject packs. **Placement (A):** the five tools go in Developer Tools. This is the smallest change that keeps the lab-to-tool relationships legal and adds nothing to the header or Home (rule 4.5).
- Evidence: all five P0 experiences serve developers and testers; three of them import Developer Tools engines; section isolation (rule 4.2) makes same-section placement the only way to curate related links in both directions.
- **When to reconsider:** only if the practice set grows to include non-developer subjects such as the Excel, Workplace English and Quantitative Aptitude candidates already on the planning list, which would not fit Developer Tools. Because every non-calculator tool is routed `/tools/<id>/`, moving the tools into a future Practice section would **not change their URLs**. Creating or moving into a section needs the owner's approval (rule 4.7, 11.7); none is requested now.
- This recommendation does not change the header, Home copy, breadcrumbs, search structure or any existing tool.

## Proposed pages (all PROPOSED, ids are provisional)

| Tool | Route | Distinct intent | Proposed aliases (true and specific; must be tested both directions) | Proposed curated related tools (same section) |
|---|---|---|---|---|
| Smart Flashcards | `/tools/smart-flashcards/` | revise concepts on a schedule | flashcards, study flashcards, spaced repetition flashcards | json-formatter, jsonpath-tester |
| JSON Error-Fixing Lab | `/tools/json-error-fixing-lab/` | practise repairing invalid JSON | json practice, json error practice | json-formatter, json-compare |
| JSONPath Challenge Lab | `/tools/jsonpath-challenge-lab/` | practise JSONPath queries | jsonpath practice, jsonpath exercises | jsonpath-tester, json-formatter |
| Cron Challenge Lab | `/tools/cron-challenge-lab/` | practise cron schedules | cron practice, cron exercises | cron-expression-explainer |
| Test Design Lab | `/tools/test-design-lab/` | practise boundary and partition test design | boundary value analysis, equivalence partitioning, test design practice | smart-flashcards |

Constraints on aliases: the queries `json`, `jsonpath` and `cron` must keep leading JSON Formatter, JSONPath Tester and Cron Explainer (rule 5.2), so no alias is the bare name of an existing tool. Adding the labs to the curated lists of the **existing** tools is an optional, small catalog edit (rule 9.3) and is not assumed.

## Discoverability and thin-page tradeoff

Per-deck pages (a JSON flashcards page, an HTTP flashcards page) would match more specific searches but would be near-identical pages sharing one engine (RISK 17; rulebook 6.2). The recommendation is **one Smart Flashcards page with three decks**; per-deck pages are deferred until Search Console shows demand and each deck has enough unique introductory content. This trades some discoverability for a thin-page risk avoided. It is a HYPOTHESIS that this is the right balance.

## Navigation impact

- Header: unchanged. Home: unchanged. All Tools search: the five tools appear by catalog. Developer Tools landing: its description and seoDescription (which currently list the tools by name) are updated minimally.
- Breadcrumbs: the central component only.
- No coming-soon or placeholder entries for deferred candidates (rule 4.4).

## Integration requirements (FR-INT)

### Integration with the existing site

- **Intended learner:** All visitors; also the existing tools' users, who must not be affected.
- **User input:** Catalog data, links, routes.
- **Accessibility (applies to every requirement below):** No change to the existing navigation patterns.
- **Privacy (applies to every requirement below):** No change to the privacy statements except the wording described in doc 13.


| ID | Requirement (interaction, expected behaviour, output, validation, error handling) | Priority | Depends on | Acceptance |
|---|---|---|---|---|
| FR-INT-001 | Each of the five tools has one catalog entry with id, status, section, title, description, true and specific aliases, curated related tools inside the same section, SEO text and capabilities that describe only what is built. | P0 | None | AC-INT-001 |
| FR-INT-002 | There are no duplicate ids or URLs. Routes are /tools/<id>/. Every page works under the /Toolzenhub/ subpath and at the root path. | P0 | FR-INT-001 | AC-INT-002 |
| FR-INT-003 | Existing tools keep their behaviour: their engines are imported, not copied or edited (a minimal export is allowed only if reviewed), and their existing tests still pass. | P0 | None | AC-INT-003 |
| FR-INT-004 | All links from labs and cards to tools, and between labs and decks, resolve to published pages. A link to a page in another section appears only inside the page text, never in a related list. | P0 | FR-INT-001 | AC-INT-004 |
| FR-INT-005 | The new tools are found by their own names; the existing queries json, jsonpath and cron still lead their existing tools; the search-index budgets still pass. | P0 | FR-INT-001 | AC-INT-005 |
| FR-INT-006 | The Developer Tools section text and listing are updated minimally; the header, the Home hero and the other sections are unchanged. | P0 | FR-INT-001 | AC-INT-006 |
| FR-INT-007 | Coming-soon items stay non-routed; the sitemap lists only the new real pages; canonical URLs use the production origin in every build. | P0 | FR-INT-001 | AC-INT-007 |
| FR-INT-008 | The Growth identity ledger records the new tool ids and implementation modules in the same change as the catalog entries. | P0 | FR-INT-001 | AC-INT-008 |
| FR-INT-009 | Each lab exercise that has a related deck topic links to that topic; each topic id used by a link exists in the deck data. | P0 | FR-INT-004, FR-FC-001 | AC-INT-009 |
