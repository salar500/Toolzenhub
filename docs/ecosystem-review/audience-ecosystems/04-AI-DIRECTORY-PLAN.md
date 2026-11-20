# 04. AI tools directory: taxonomy, data model, candidates and verification

Owner direction (2026-11-15): about 40–60 carefully verified products, quality over count. Placement and rules: decision D2 in `03`.

## 1. Taxonomy (14 categories)

Merged from the brief and checked against Futurepedia's observed top-level categories. Categories with too few useful products for us are merged rather than left thin.

| Category id | Label | Main audiences |
| --- | --- | --- |
| assistants | Assistants and chat | all |
| coding | Coding assistants and AI IDEs | developers |
| testing | Testing and QA | qa, developers |
| research | Research and search | all |
| writing | Writing and editing | all |
| images | Images (generate and edit) | — |
| video | Video | — |
| audio | Audio, voice and transcription | — |
| design | Presentations and design | — |
| data | Data, spreadsheets and BI | data |
| productivity | Meetings and productivity | all |
| automation | Agents and automation | developers, qa |
| learning | Learning | all |
| apis | Models, APIs and open source | developers |

An entry may have up to two categories. Audiences are `developers`, `qa` and `data` (none means general).

## 2. Entry schema (`assets/js/data/ai-directory.js`)

```js
{
  id: "github-copilot",                 // unique, kebab-case, permanent
  name: "GitHub Copilot",
  officialUrl: "https://github.com/features/copilot",   // https, the product's own domain
  kind: "product",                      // product | feature-in-product | api-platform | open-source
  categories: ["coding"],
  audiences: ["developers"],
  summary: "…",                         // our own words, ≤ 160 characters, what it does
  goodFor: ["…", "…"],                  // 1–3 concrete jobs
  notFor: "…",                          // optional honest limit, only if verified
  access: ["ide", "web"],               // only values seen on the official site
  pricing: { model: "freemium", checkedOn: "2026-11-…" } | { model: "unknown" },
  verifiedOn: "2026-11-…",              // date the official page was read for this entry
  source: "https://…"                   // the official page the facts came from
}
```

Validation (unit test): unique ids, names and URL hosts; https only; no query string with `ref`, `utm_`, `aff` or `via`; `summary` ≤ 160; every category and audience known; `pricing.model` not `unknown` requires `checkedOn`; `verifiedOn` is a valid date not in the future. A separate **staleness report** (`scripts/ai-directory-report.mjs`, not part of the test gate) lists entries older than 180 days.

## 3. Page design

`/ai-tools/directory/` is static HTML of every entry, so it works without script and is crawlable, enhanced by a small filter script:
- search (name, summary, jobs);
- category chips;
- audience segmented control (All, Developers, QA testers, Data analysts), mirrored in `?audience=` so the hubs link to a filtered view;
- kind and pricing-model filters.

The result count is announced through the polite status region. Cards are text-only: name, kind badge ("Product", "Feature inside Microsoft Excel", "Open source", "API"), summary, "Good for" tags, pricing model and check date (or "Check the official site for pricing"), "Checked on <date>" and an "Official site ↗" link that opens in a new tab with `rel="noopener noreferrer"`. The page says how entries are chosen and checked, that listing is not an endorsement, and that nothing is sponsored. Hubs show at most eight entries for their audience plus a "See all for <audience>" link, never a copy of the list.

## 4. Candidate check (2026-11-15)

Method: one sequential HTTP GET per official URL with a 12 s timeout, following redirects, recording the status and final URL. This verifies **only** that the official address resolves to the product. Descriptions, access and pricing are verified per entry in Prompt 2 by reading the official page.

| Status | Count | Entries |
| --- | --- | --- |
| Resolves (200) to the product | 55 | ChatGPT; Gemini; Microsoft Copilot (now copilot.com); GitHub Copilot; Cursor; Replit; Claude Code (now claude.com/product/claude-code); Amazon Q Developer; Qodo; testRigor; mabl; Applitools; Testim; Katalon; Functionize; Playwright MCP (GitHub); Elicit; Consensus; NotebookLM (now notebook.google.com); Semantic Scholar; Grammarly; DeepL Write; Notion AI; Adobe Firefly; Canva; Ideogram; Leonardo.Ai; remove.bg; Runway (now runway.com); Descript; Synthesia; HeyGen; ElevenLabs; Otter.ai; Whisper (GitHub); Suno; Beautiful.ai; Figma AI; Fireflies.ai; Zapier; n8n; Make; Julius AI; Copilot in Excel (Microsoft Support); Copilot in Power BI (Microsoft Learn); Rows; Hex; Khanmigo; Claude API (now platform.claude.com); Google AI Studio; Hugging Face; Ollama; Mistral AI; LangChain; CrewAI |
| Blocked automated check (403 / no answer): verify by hand | 6 | Claude (claude.ai → login), Perplexity, QuillBot, Gamma, OpenAI Platform, Midjourney |
| **Redirected to something else: do not list until re-researched** | 5 | Windsurf → devin.ai/desktop; Tabnine → tricentis.com product page; Gemini Code Assist (individuals) → a deprecation notice; JetBrains AI → jetbrains.com/air/; Postman Postbot → postman.com "agent mode" |

The five redirects show why every entry carries a check date: in one pass, 8 % of a carefully chosen list had moved. We do not guess at why (rebrand, acquisition or retirement); that is read from the official pages in Prompt 2.

## 5. Proposed launch set (about 50)

All 55 resolving entries except Leonardo.Ai, Suno, HeyGen, Synthesia and Make (lower relevance to the three audiences; categories stay covered), **plus** Claude, Perplexity and OpenAI Platform once checked by hand. That gives 53 entries; drop any whose official page cannot support a factual summary. Coverage per audience (before per-entry verification): developers about 18, QA 9 (Qodo, testRigor, mabl, Applitools, Testim, Katalon, Functionize, Playwright MCP, plus Postman if re-verified), data 8 (Julius AI, Copilot in Excel, Copilot in Power BI, Rows, Hex, and the three general assistants).

Batch 2 (after launch, same method): Midjourney, QuillBot and Gamma once checked by hand; the redirected five once re-researched; QA additions (visual testing and API-mocking products); data additions (notebook and BI assistants).

## 6. Acceptance criteria

1. Every listed entry has `verifiedOn` within the release month and a `source` that is the official page read.
2. No pricing claim without `checkedOn`; no "free" text anywhere except the `pricing.model` value.
3. Unit validation passes (section 2). A sequential link check (≤ 1 request per second) of every `officialUrl` returns 2xx/3xx to the same host family, or the entry is marked for manual check and not published.
4. The filters work with keyboard only; the count is announced; with script off, all entries are visible.
5. At 390 px: no horizontal overflow, cards one column, filters reachable without scrolling past more than one screen.
6. Hubs show only their audience's slice and link to `?audience=`.
