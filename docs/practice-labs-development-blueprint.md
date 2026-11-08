# Practice Labs development blueprint (master execution specification)

**Status:** research and planning complete (2026-11-08). **No development has started under this blueprint.**

**Repository state:**

- Branch `feature/unified-ecosystem-workspace` at `9b6e7e9` when the research began; it is clean.
- `main` is at `637ae76`.
- Hostinger is untouched.

**Purpose:** a later single development prompt can say "execute the approved blueprint". The work then proceeds wave by wave without new research or planning rounds, except the per-wave Requirements step defined here.

**Ownership:**

- This file owns the execution specification.
- The detailed specifications live in `docs/practice-labs/` (documents 01 to 13 and 15) and are linked below.
- Product rules stay in `docs/product-decision-rules.md`.
- The built platform is described in `docs/practice-labs-platform.md`.

| # | Required content | Where |
|---|---|---|
| 1 | Final department taxonomy | [04](practice-labs/04-department-taxonomy.md) |
| 2 | Complete learning-path catalogue (44 paths) | [05](practice-labs/05-learning-path-catalogue.md) |
| 3 | Complete curriculum outline | [05](practice-labs/05-learning-path-catalogue.md) (modules, all paths), [06](practice-labs/06-curriculum-specifications.md) (lessons, W1–W5) |
| 4 | Lesson-level requirements | [06](practice-labs/06-curriculum-specifications.md), [10](practice-labs/10-content-quality-standard.md) section 1 |
| 5 | Interactive tool catalogue | [07](practice-labs/07-interactive-tools-catalogue.md) |
| 6 | Shared component specifications | [08](practice-labs/08-ui-ux-specification.md) section 5, [09](practice-labs/09-technical-architecture.md) sections 4–5 |
| 7 | UI/UX specification | [08](practice-labs/08-ui-ux-specification.md) |
| 8 | Desktop and mobile specifications | [08](practice-labs/08-ui-ux-specification.md) sections 3–4 |
| 9 | Technical architecture | [09](practice-labs/09-technical-architecture.md) |
| 10 | Runtime and dependency decisions | [09](practice-labs/09-technical-architecture.md) section 7 |
| 11 | Content production standards | [10](practice-labs/10-content-quality-standard.md) |
| 12 | SEO specifications | [11](practice-labs/11-seo-strategy.md) |
| 13 | Development sequence | Section 13 below, [12](practice-labs/12-prioritized-roadmap.md) section 2 |
| 14 | Feature dependencies | Section 14 below |
| 15 | Priority ranking | [12](practice-labs/12-prioritized-roadmap.md) section 1 |
| 16 | Acceptance criteria | [13](practice-labs/13-acceptance-criteria.md) |
| 17 | Feature-specific sanity checks | [13](practice-labs/13-acceptance-criteria.md) section 3, [09](practice-labs/09-technical-architecture.md) section 11 |
| 18 | Known limitations and deferred decisions | Sections 18 and 20 below |
| 19 | Sources and research evidence | [15](practice-labs/15-source-register.md), [01](practice-labs/01-market-research.md), [02](practice-labs/02-competitor-matrix.md), [03](practice-labs/03-user-needs.md) |

---

## 1. Key research findings (summary of [01](practice-labs/01-market-research.md))

1. **AI is absorbing explanation traffic.**
   - 44% of developers learn with AI tools [S02].
   - AI Overviews cut organic clicks on informational queries by roughly 35 to 58% [S05–S07].
   - **Therefore:** every page must let the learner *do* something checked; explanation alone is not a product.
2. **Completion is the industry's failure point** (under 13%; 4.6% on SWAYAM) [S08].
   - **Therefore:** short lessons, immediate feedback, milestone projects, and no gates.
3. **Free, structured, checked practice for testers barely exists** [S26, S20, hypothesis].
   - **Therefore:** testers are the launch audience.
4. **SQL (58.6%) and Python (57.9%; 71.8% of learners) are universal** [S01]. Playwright leads testing-tool adoption [S09]. Indian postings bundle Playwright, SQL and API testing [S11]. India is the fastest-growing developer community (about 21.9M) [S03].
5. **In-browser runtimes are viable without servers:**

   | Runtime | Size |
   |---|---|
   | SQLite | 0.7 MB (built) |
   | Python | about 5.3 MB |
   | PostgreSQL | about 3.7 MB |
   | javac (author's claim) | about 6 MB |

   Playwright cannot run in a page, and AI must not depend on runtime models [S40–S46].
6. **The approachable pattern is proven:** W3Schools and SQLBolt show a left tree, a runnable example first, tasks beside the explanation, the solution on request, and previous and next [S20, S22].

## 2. Final department structure ([04](practice-labs/04-department-taxonomy.md))

| Id | Department | Home paths |
|---|---|---|
| D1 | Software Testing and Quality | 6 |
| D2 | Test Automation Engineering | 4 |
| D3 | Programming and Developer Foundations (owns Git and the command line) | 8 |
| D4 | Web Development and Frontend | 4 |
| D5 | Databases, Backend and APIs (owns SQL) | 5 |
| D6 | AI and Machine Learning (GenAI, LLMs, apps, agents, ML, deep learning, evaluation, responsible AI) | 6 |
| D7 | Data Analytics and Data Engineering | 6 |
| D8 | DevOps, Cloud and Security (security is a subdepartment) | 5 |

- **Totals:** 44 paths.
- **One home per path.** Cross-listing is a link, never a copy.
- **Department is not in path URLs,** so existing SQL URLs never change.

## 3. Recommended initial audience

Testers and testing job-seekers (manual, moving to automation), with SQL as the first technical skill. India-first, but written for everyone. Data analysts are the secondary audience, served by the existing SQL, Excel and Power BI assets. Reasons and evidence: [03](practice-labs/03-user-needs.md), section 3.

## 4–12. Specifications

See the table at the top. Two points from them matter for every wave:

- **The honesty labels** are "Simulated", "Needs local setup", "Needs Power BI Desktop" and "Recorded example, not live". Wherever execution is not real, the page says so ([08](practice-labs/08-ui-ux-specification.md) section 5; [09](practice-labs/09-technical-architecture.md) section 7).
- **The shared practice target ShopLite** (E5), with its mock API (E6), is the backbone of D1, D2 and parts of D4 and D8. It is built once, in W2.

## 13. Development sequence

The per-wave process (owner's rules) is:

1. **Requirements:** for W6 to W9 paths, the lesson table per [06](practice-labs/06-curriculum-specifications.md), section 9; for all waves, a check of open decisions.
2. **Architecture:** the deltas only.
3. **Development.**
4. **Feature-specific sanity checks** ([13](practice-labs/13-acceptance-criteria.md), section 3).
5. **Documentation.**
6. **Commit.**
7. **Push to `feature/unified-ecosystem-workspace`.**
8. **Pages preview, verified live.**
9. **Report.**
10. **The next item.**

| Wave | Content | Gate before starting |
|---|---|---|
| W0 | Platform foundations (registries, departments, block model, quiz engine, generalised challenge engine, search, phone lesson card, department breadcrumb) | D2 approved |
| W1 | SQL complete (6 lessons, 6 projects, interview, JOIN Visualizer, Query Explainer) | W0 |
| W2 | ShopLite, writing labs, Bug Hunting Simulator, Manual Testing, Test Design, Interview index | W0 |
| W3 | API Workbench and mock API, API Testing | W2 |
| W4 | Locator evaluator, Playwright | W2, W3 |
| W5 | Git simulator, Git and GitHub; JS engine, JavaScript Fundamentals | W0 |
| W6 | Python (Pyodide), Excel and Power BI paths | D3 |
| W7 | Prompt Evaluation Lab, AI Foundations, Prompt Engineering, Testing AI Systems | W2 |
| W8 | LLM Apps, ML Foundations, Responsible AI, API Test Automation, Java | W5–W7; D4 for Java |
| W9 | All remaining catalogue paths, re-scored with measured demand | data from W1–W8 |

**Within a wave:** engines and shared components first, then content, then standalone tool pages. Each meaningful feature is its own delivery: commit, push and report.

**Stop conditions** (pause and ask the owner): production or `main` changes; paid services; external runtime dependencies or cloud AI; sensitive data or accounts; significant architecture changes beyond this blueprint; a rule conflict that cannot be resolved; and the open decisions in section 20 that gate a wave.

## 14. Feature dependencies

```
W0 registries/blocks/quiz/challenge ─┬─> W1 SQL (blocks, quiz, visualizers)
                                     ├─> W2 ShopLite ─┬─> W3 API workbench ─> W4 Playwright (locators on ShopLite, API tests on mock)
                                     │                └─> W7 AI testing (testing vocabulary, rubric engine from E4)
                                     ├─> W5 JS engine ─> W4 code checks reuse tokenizer; W8 API automation
                                     │   W5 Git simulator ─> W9 CI simulator
                                     └─> W6 Pyodide (D3) ─> W8 ML (optional Python), W9 pandas
E4 rubric engine (W2) ─> E10 prompt evaluation (W7)
```

## 15. Priority ranking

| Rank | Candidate | Score |
|---|---|---|
| 1 | SQL completion | 4.05 |
| 2 | Testing foundations | 3.90 |
| 3 | API Testing | 3.80 |
| 4 | Playwright | 3.75 |
| 5 | JavaScript | 3.65 |
| 6 | Python | 3.60 |
| 7 (tie) | Git | 3.50 |
| 7 (tie) | Excel and Power BI paths | 3.50 |
| 9 | AI foundations | 3.30 |
| 10 | Java | 2.90 |

Reasons and evidence labels are in [12](practice-labs/12-prioritized-roadmap.md). Waves group them by dependency and audience coherence, so the order differs slightly: AI comes before Java, and Git and JS come after Playwright.

## 16–17. Acceptance and sanity checks

See [13](practice-labs/13-acceptance-criteria.md). Full regression is reserved for the final stage, on explicit owner authorisation.

## 18. Known limitations

- **Unknown data:** search volumes and keyword difficulty are **unknown** (no keyword data was available). Priorities are partly hypothesis and are re-scored with GSC data before W9.
- **Unread competitors:** about 20 competitor sites were not opened this session. The matrix marks them "not re-verified" ([15](practice-labs/15-source-register.md)).
- **Unconfirmed runtime facts:** runtime sizes are second-hand (Pyodide, PGlite, TeaVM) and must be measured at build time. Licences (Pyodide, TeaVM) must be confirmed.
- **Simulated work:** Playwright, Selenium, Docker, Kubernetes, cloud, CI and GitHub are simulated or local-download in the page. That limits "real" practice, and the pages say so.
- **No retention mechanisms** beyond reusable tools, unless D1 is approved.
- **Maintenance:** about 44 paths is a long-term maintenance commitment. Fast-moving subjects (Playwright, AI, cloud) need 6-monthly reviews ([10](practice-labs/10-content-quality-standard.md), section 5). W9 is explicitly re-prioritised by measured demand instead of being built blindly.
- **Writing-lab rubrics** check structure and coverage, not judgement; the pages say so.

## 19. Sources

See [15 source register](practice-labs/15-source-register.md) (ids S01–S46 plus repository facts, each with class and reliability).

## 20. Decisions requiring owner approval

Recommended answers are in **bold**. Until a decision is approved, the gated work does not start; other waves proceed.

| Id | Decision | Why it needs approval | Recommendation | Gates |
|---|---|---|---|---|
| **D1** | Exception to rule 7.7: opt-in, device-only learning progress (completion ticks, resume) | Contradicts rule 7.7 without an exception | **Approve**, scoped exactly as [09](practice-labs/09-technical-architecture.md) section 8 (the flashcards precedent): off by default, local only, no streaks or points | Progress features only; W0 to W8 proceed without it |
| **D2** | Adopt the 8-department taxonomy: department pages, the learning-paths home reorganised, the department step in breadcrumbs, rule 4.10 extended | Changes the information architecture and a rule | **Approve** as in [04](practice-labs/04-department-taxonomy.md) | W0 |
| **D3** | Vendor Pyodide (and later pandas, scikit-learn and PGlite), loaded only on request, with the size stated | A new large third-party runtime (5 to 16 MB) | **Approve**, on-request only, licence verified, same-origin | W6, parts of W8 and W9 |
| **D4** | Java execution: TeaVM javac in WASM (if the licence is permissive and a phone run works) vs non-executed predict-and-fix exercises | Runtime dependency plus honesty trade-off | **Approve the attempt, with an automatic fallback** if the licence, size or phone test fails | W8 (Java) |
| **D5** | Browser-local AI models (Transformers.js) for live demos | Large downloads; the AI-dependency boundary | **Not now.** Recorded outputs and visualizers first; revisit after W8 | Optional, none |
| **D7** | Consent-based GA4 custom events (Run, Check, Hint, Solution, Export; no learner input) | Rulebook 8.8 analytics scope | **Approve**: only way to measure practice engagement | Metrics in [12](practice-labs/12-prioritized-roadmap.md), section 4 |
| **D8** | Monetisation (ads per 6.8, an offline bundle, sponsorship) | Revenue and policy decision | **Defer**; keep everything free | None |
| **D10** | Confirm the launch audience and order (testers plus SQL first; AI in W7) | Strategy | **Confirm** | Ordering of W2 to W7 |

**Resolved by engineering judgement (no approval needed):**

- Plain textarea editor first; a code-editor library only if usability evidence requires it.
- ShopLite has no payment-card fields.
- `Course` structured data only on complete paths.
- No FAQ schema on interview pages.
- Department not in URLs.
- CheerpJ rejected.
- isomorphic-git not used.
- Service Worker mock with an in-page fallback.

## 21. Status register (updated by every development delivery)

| Item | Status | Commit |
|---|---|---|
| Platform v1 (paths, roadmap, lesson pages) | built | `9b6e7e9` |
| SQL path | building: 18 of 24 lessons, 0 of 6 projects | `9b6e7e9` |
| Blueprint | complete, awaiting owner decisions D1–D10 | this commit |
| W0–W9 | not started | |
