# 11. AI Directory research

## 1. Today (verified)

`/ai-tools/directory/`: 49 products in 14 categories, 5 audience tags, each with official URL, maker, kind, summary from the official page on 2026-11-15, access platforms, a fixed pricing label, no ranking, no logo, no affiliate; a six-month re-check with `scripts/ai-directory-report.mjs`. Left out after failed checks: Canva, Julius AI, OpenAI API, Perplexity, Windsurf, Tabnine, Gemini Code Assist for individuals, JetBrains AI, Postman Postbot. Not checked at all: Midjourney, Kling, Google Flow, Suno, Higgsfield and others named in `03`.

## 2. What discovery products do (S28) and what ToolZenHub should do

Large directories offer natural-language task search over tens of thousands of entries, category filters, attribute filters (API, mobile, open source), "verified" marks, editor picks and visible prices. Their weakness for ToolZenHub's users is volume and promotion, not missing features. ToolZenHub's directory should stay **small, dated, unranked and tied to tasks**: it answers "which products are made for this task, according to their own sites?", then hands the visitor to the Workbench.

## 3. Metadata additions (all from the official page, dated)

| Field | Values | Purpose |
| --- | --- | --- |
| `tasks` | Workbench task ids the official page describes (for example `image-to-video`, `voiceover`) | task filter; replaces the hand mapping in blueprints over time (F8) |
| `inputs` | text, image, video, audio, document, code, data, URL | "What do you have?" filter |
| `outputs` | text, image, video, audio, code, slides, spreadsheet, document | "What do you need?" filter |
| `limits` | short official statements (for example "available in some countries") | shown only when the page states them |
| `docsUrl` | official documentation or help URL | for product-specific syntax |
| `confidence` | `stated` (the page says it) only; no inferred values | rule 13.2 |

Existing fields and filters are preserved; no entry is duplicated for spelling or keyword variants; no ranking.

## 4. Page additions

- Filters: Task (grouped by outcome), "I have" (inputs), "I need" (outputs), alongside the existing category and audience filters; all client-side over the static data; filter state in the query string with fixed values only.
- Each card gains "Plan a task with this product" → `/tools/ai-workbench/?product=<id>` (and `&task=` when the card was reached through a task filter).
- The empty state: "No listed product matches all of these. Remove a filter, or use any capable assistant: the Workbench prompts are product-neutral."

## 5. Verification method (unchanged rule, extended fields)

Open the official page (and docs page), record the date, write only what the page says, reduce pricing to a label, fill `tasks`, `inputs`, `outputs` only where stated. Candidates to check by hand first, because Workbench tasks lack listed products: Perplexity (research), Midjourney (images), Kling and Google Flow (video), Suno (music), Windsurf (coding). An entry that fails is left out and recorded in the file's header.

## 6. Acceptance criteria

1. Every `tasks` value is a real Workbench task id (unit test); every entry has `verifiedOn`; the report lists overdue entries.
2. Filters combine with AND; the count announces once; no ranking or sorting by anything but the existing directory order.
3. Workbench recommendations use `tasks` when present, else the blueprint categories (backward compatible).
