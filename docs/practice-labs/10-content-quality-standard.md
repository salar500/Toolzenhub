# 10. Content quality and research standard

This applies to every lesson, project, interview module and tool text in Practice Labs. It extends `docs/practice-labs-platform.md`, section 4 (the lesson template) and rulebook sections 3 (honesty), 6 (content and SEO) and 8 (correctness).

## 1. Lesson elements

**Required in every lesson:**

1. Title (states the skill).
2. Objectives (2 to 4, action verbs).
3. Prerequisite (a linked lesson, or "None").
4. Simple explanation (plain words, under 120 words before the first example).
5. At least one worked example with its expected output.
6. At least one checked practice task.
7. Common mistakes (2 or more).
8. Knowledge check (2 or more questions, with explained answers).
9. Summary (3 sentences or fewer).
10. Previous and next.

**Required where they apply:**

- why it matters (real-world application);
- an analogy (only if it clarifies, never forced);
- technical depth (a "Deeper" section for intermediate and advanced lessons);
- a diagram (when a relationship, flow or state change is involved);
- syntax (for languages);
- a line-by-line explanation (for code over 3 lines);
- hints (at least 1, and progressive);
- an explained solution (always, for every checked task).

**Size guide:**

- **Time:** a lesson takes 10 to 20 minutes, with 600 to 1,500 words of teaching text.
- **Practice:** 2 to 6 tasks.
- **When to split:** a lesson that grows past 20 minutes is split.

**Substance test:** a lesson must teach something a learner can *do* afterwards, demonstrated by its practice. A lesson without checked practice needs a written reason in its data (`practiceExemption`).

## 2. Writing rules

- **Language:** everyday English, short sentences, a term defined at first use, and one idea per paragraph.
- **Order:** why, then a small example, then the rule, then a bigger example.
- **Examples:** original, realistic and India-neutral but globally understood names and data (the existing shop data is the model). No real people's data. Health and finance data are synthetic and labelled so.
- **Tone:** no hype, no "in today's fast-paced world", no filler (rulebook 6.2). Never state uncertain facts as certain.
- **Inclusive and neutral:** they/them for unspecified people.
- **Versions:** any tool-specific page states the version it was written for.

## 3. Technical verification

| Content | Verification |
|---|---|
| SQL examples and expected results | Produced by an independent SQLite build (Python `sqlite3`), then the browser engine must match (existing method) |
| Code in executable languages | Each example and solution runs in the page's engine and in a reference local runtime with the same output; recorded in `reviewed` |
| Playwright code | Run locally against ShopLite (the starter project) with the version stated; locator tasks verified with the evaluator and with real Playwright locally |
| Non-executable claims (concepts, process) | Checked against the official documentation or a standard (ISTQB syllabus *concepts*, not text; WCAG; OWASP; RFC 9110 for HTTP) and listed in `sources` |
| Seeded bugs | Reproduction steps recorded, and the "stable" release verified free of them |
| Numbers about the world (adoption, salaries) | Avoided in lessons. If used, they cite the source and date (rulebook 3) |

## 4. Sources, attribution and copyright

- **Allowed sources:** official documentation (PostgreSQL, SQLite, Playwright, MDN, Python, Oracle and dev.java, Git, Microsoft Learn, OWASP, W3C), standards and the original research of respected educators. They are used to **verify**, never to copy.
- **Recording:** each lesson lists the sources consulted in `sources`. A path page shows "Written for this site; checked against: …" with links (rulebook 3, honesty).
- **No copying:**
  - no text, exercise wording, datasets, diagrams or layouts copied from any learning platform;
  - no paraphrase that follows another site's structure point by point;
  - code snippets that are generic idioms (e.g. `SELECT * FROM t`) are fine.
- **Names:** ISTQB terms are used as industry vocabulary; the syllabus text is not reproduced. No claim of certification or of endorsement by any vendor.
- **Licences:** third-party code (runtimes) is vendored with its licence ([09](09-technical-architecture.md), section 7.1). Datasets are original or under an open licence, recorded with the licence.

## 5. Review and maintenance

1. **Author self-review checklist** (stored in the lesson's `reviewed` block):
   - objectives met by the practice;
   - every example verified;
   - mistakes realistic;
   - no undefined jargon;
   - mobile check at 390 px.
2. **Automated gates:** the schema validation and the curriculum integrity test ([09](09-technical-architecture.md), section 2), and expected-result re-runs.
3. **Freshness:**
   - Each path has `reviewDue` dates.
   - Fast-moving subjects (Playwright, AI and LLMs, cloud) are reviewed every 6 months or on a major release.
   - Stable subjects (SQL, testing fundamentals, Git) are reviewed every 18 months.
   - A page past its review date shows nothing extra; the date is a maintenance queue, not a visitor warning, unless content is known to be stale.
4. **Corrections:** a reported error is fixed in the source data, and its expected results are regenerated.

## 6. AI-assisted drafting

Drafts may be AI-assisted in the development session. Every fact, example and output is verified by the methods in section 3 before publication, and no unverified AI-generated claim is published. The runtime site never calls AI (rule 1.5).
