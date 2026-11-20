# 15. Source register (Practice Labs research)

Every external fact in the Practice Labs research documents cites an entry here by its id, for example [S07]. All entries were consulted on **2026-11-08** through web search summaries or a direct page fetch. Nothing was copied: sources inform decisions, never content.

Evidence classes follow rulebook 12 (evidence and uncertainty):

- **Verified data**: a measured figure from a first-party source, read directly.
- **Public evidence**: a first-party page, press release or official documentation read through a search summary, or a reputable secondary report.
- **Estimate**: a third-party traffic or market estimate. These often disagree, so treat them as an order of magnitude only.
- **Unknown**: no source. It stays unknown and is never filled in.

**Reliability:** H = first-party or primary research. M = reputable secondary or vendor self-report. L = aggregator or unsourced blog. Only H and M sources may drive a decision; L is context only.

## Market and developer behaviour

| Id | Source | What it supports | Class | Rel. | How read |
|---|---|---|---|---|---|
| S01 | Stack Overflow Developer Survey 2025, Technology section, survey.stackoverflow.co/2025/technology | Language use, all respondents: JavaScript 66%, HTML/CSS 61.9%, SQL 58.6%, Python 57.9%, Bash 48.7%, TypeScript 43.6%, Java 29.4%. Language use, learners: Python 71.8%, HTML/CSS 66.6%, JavaScript 62.8%, SQL 45.4%, Java 40.8%. Databases, all respondents: PostgreSQL 55.6%, MySQL 40.5%, SQLite 37.5%, SQL Server 30.1%. Learners' community platforms: Stack Overflow 75.4%, YouTube 70.1%, GitHub 69.6% | Verified data | H | Direct fetch |
| S02 | Stack Overflow 2025 survey, as reported by HPCwire/BigDataWire, IT Brief and Hack Reactor | Learning resources: technical documentation 68%, online resources 59%, Stack Overflow 51%; 44% use AI tools to learn (37% the year before) | Public evidence | M | Search summary, three outlets agree |
| S03 | GitHub Octoverse 2025, as reported by Business Standard, YourStory, OpenSourceForU and It's FOSS | India: about 21.9M developers on GitHub, about 5.2M added in the year, fastest-growing community; GitHub projects more than 57.5M by 2030; India passed the US in open-source contributors | Public evidence | M | Search summary, several outlets agree |
| S04 | The Pragmatic Engineer, "Are LLMs making StackOverflow irrelevant?" | Stack Overflow question volume falling since 2020, sped up by ChatGPT; search still brings most of its traffic | Public evidence | M | Search summary |
| S05 | Pew Research Center (2025), via Search Engine Land and SISTRIX | About 15% of searches without an AI Overview lead to an organic click, against about 8% when one is shown; links inside AI Overviews get about 1% of clicks. Google disputes the method | Public evidence | H (study) / M (reporting) | Search summary |
| S06 | Ahrefs, "AI Overviews reduce clicks" (April 2025) and its update (Feb 2026) | CTR down about 34.5% (300k keywords), then about 58% for top-ranking pages (December 2025 data); 99.2% of AI Overview keywords are informational | Public evidence | M | Search summary |
| S07 | Authoritas (Press Gazette) and Amsive studies | CTR down 47.5% on desktop and 37.7% on mobile (Authoritas); down 15.49% on average (Amsive) | Public evidence | M | Search summary |
| S08 | MOOC completion research: Warwick (WRAP 65543); NCERT IJET (SWAYAM); Khalil and Ebner (2014) via TU Graz review | Completion usually under 13% (Warwick); about 4.6% on SWAYAM in India. Causes: lack of time, low motivation, isolation and little interactivity, missing background, long lectures | Public evidence | H | Search summary |
| S09 | Testing-framework trends: TestDino (npm 5-year data), Checkly via getpanto.ai, Agileway | Playwright weekly npm downloads passed Cypress in mid-2024 (roughly 20 to 33M a week in early 2026, against about 6.5M for Cypress); selenium-webdriver npm about 1.7 to 2.1M a week (excludes Java and Python installs); State of JS 2024: Playwright used at work by 3,674 respondents, Cypress 3,603, Selenium 1,130 | Estimate | M/L | Search summary; figures differ by snapshot |
| S10 | PractiTest State of Testing 2025 (CIO Influence), Katalon State of Software Quality 2025, Applause 2025 | 45.65% of testers have not added AI tools yet (PractiTest); 61% of QA teams adopting AI-driven testing (Katalon); AI use in testing 30% to 60% (Applause). Vendor surveys | Public evidence | M | Search summary |
| S11 | Indian QA job postings (Deloitte, Cognizant, Iris Software, GlobalLogic, Birlasoft) and the Weekday.works aggregator | Playwright (with TypeScript or Java), SQL and API testing (Postman, REST Assured) appear again and again in Indian automation-tester postings in 2025-26. This is a sample, not a market measure | Public evidence | M (postings) / L (aggregator) | Search summary |

## Competitors

| Id | Source | What it supports | Class | Rel. | How read |
|---|---|---|---|---|---|
| S20 | w3schools.com/sql/sql_where.asp | Lesson UX: left tutorial tree with a "Code Challenge" under each lesson; previous and next at the top and bottom; short example then "Try it Yourself" (opens a separate editor); demo-database excerpt; exercises and quizzes on separate pages; sign-in for progress (XP, streaks); ads with a paid ad-free tier | Public evidence | H | Direct fetch (structure only) |
| S21 | Semrush and Similarweb pages for w3schools.com | About 27 to 34M visits a month in late 2025 (Semrush); Similarweb: 5.67 pages per visit, about 5:54 per visit, more visits than Codecademy. Estimates disagree | Estimate | L/M | Search summary |
| S22 | sqlbolt.com, lesson 1 | Lesson UX: one page holds the explanation, a table preview, an editor and about 5 numbered tasks; a solution is shown only on request; "solve all tasks to continue"; 20 lessons plus 3 extra topics; no account | Public evidence | H | Direct fetch |
| S23 | theodinproject.com/paths | Foundations, then one chosen specialised path (Full Stack JavaScript in 7 courses, Ruby on Rails in 8), taken in order; sign-in exists | Public evidence | H | Direct fetch |
| S24 | freeCodeCamp news and forum (2025) | Certifications being restructured (Full Stack curriculum, new certifications through 2026); 129 free video courses in a year. No current learner total found | Public evidence | M | Search summary |
| S25 | Exercism (exercism.org pages, Trustpilot replies) | About 65 to 76 language tracks, free, human mentoring; tracks show about 194k students (C++) and 54k (PHP); Exercism itself says it is "not for beginners" | Public evidence | H | Search summary |
| S26 | Test Automation University (Applitools press releases 2019-2021) | Free testing education: 20k to 100k enrolled (2021), about 54 courses. Self-reported | Public evidence | M | Search summary |
| S27 | Codecademy and DataCamp pricing (aggregators: Capterra, Toolradar, others) | Free tier is limited (DataCamp: mostly the first chapter); paid plans roughly US$15 to 50 a month. Figures disagree, so see the vendors | Estimate | L | Search summary |
| S28 | roadmap.sh profile pages | About 360k+ GitHub stars, among the most-starred projects; about 2.8 to 3.2M registered users. Self-reported, snapshot | Public evidence | M | Search summary |
| S29 | Kaggle (Wikipedia, citing Kaggle) | 23.29M accounts on 2 April 2025; claims of 32M+ in 2026 not verified | Public evidence | M | Search summary |
| S30 | Learn Git Branching (github.com/pcottle/learnGitBranching) | Open-source visual git sandbox, MIT licence, about 29.7k stars (2024 snapshot): the commit graph updates as you type | Public evidence | M | Search summary |

## Runtimes and technology

| Id | Source | What it supports | Class | Rel. | How read |
|---|---|---|---|---|---|
| S40 | Repository: assets/js/vendor/sql-js (measured 2026-11-08) | sql.js (SQLite as WebAssembly) already vendored, 728 KB on disk, runs in a Worker | Verified data | H | Measured |
| S41 | Pyodide 0.23 release notes (blog.pyodide.org) and pyodide-pack (PyPI) | Python with its standard library about 5.3 MB (Brotli) and cold start about 0.9 to 1.3 s on desktop at 100 Mbps; numpy plus pandas add about 10.5 MB compressed. Older version, so measure the current one on a mid-range phone | Public evidence | H | Search summary |
| S42 | CheerpJ (cheerpj.com docs and pricing) | A WebAssembly JVM; proprietary; free tier for personal use, paid for commercial use. Ruled out (rule 1.5, cost) | Public evidence | H | Search summary |
| S43 | TeaVM 0.13.0 release notes and teavm-javac (GitHub) | javac 21 compiled to WebAssembly runs in the browser offline; the author says about 6 MB. Repository ownership and licence still to verify | Public evidence | M | Search summary |
| S44 | PGlite (npm, Simon Willison) | PostgreSQL as WebAssembly in the browser, about 3.7 MB gzipped (about 13 MB on disk) | Public evidence | M | Search summary |
| S45 | Transformers.js (Hugging Face docs) | Runs ONNX models in the browser; WebGPU is optional and still experimental in Firefox and Safari; model sizes vary and were not measured | Public evidence | H | Search summary |
| S46 | isomorphic-git (isomorphic-git.org) | Pure-JS git for the browser, with a pluggable file system (LightningFS); cloning a remote needs a CORS proxy | Public evidence | H | Search summary |

## Direct examination and user feedback (added 2026-11-08, second research pass)

| Id | Source | What it supports | Class | Rel. | How read |
|---|---|---|---|---|---|
| S55 | Direct examination of 21 competitor pages plus ToolZenHub's own lesson in real Chrome at 390 × 844 (URLs in [17](17-competitor-experience-audit.md), section 2), measured 2026-11-08 | Requests, third-party domains, overflow, position of first code, editors, ads, overlays, sign-up walls; phone screenshots inspected | Verified data | H | Measured (Playwright, system Chrome) |
| S56 | codecademy.com/pricing (INR), read 2026-11-08 | Basic is free with limited courses and no assessments, projects, code challenges, interview prep or certificates; Plus ₹300/mo yearly or ₹600 monthly; Pro ₹600/mo yearly or ₹1,200 monthly | Verified data | H | Direct fetch |
| S57 | W3Schools vs MDN feedback: forum.freecodecamp.org/t/is-w3schools-not-good/162957; Mozilla Learning Area survey 2014 (wiki.mozilla.org); r/learnprogramming threads via mirrors | Beginners value plain English and "Try it"; criticised for stale pages and missing gotchas | Opinion (users) | M | Search summary |
| S58 | Codecademy reviews: coursereport.com/schools/codecademy-pro, skillscouter.com/codecademy-review, checkthat.ai/brands/codecademy/reviews | Price vs value, free-tier limits, fill-in-the-blank hand-holding; Trustpilot around 2.6 driven by billing complaints (aggregator claim) | Opinion / Estimate | L–M | Search summary |
| S59 | DataCamp reviews: trustpilot.com/review/www.datacamp.com, coursereport.com/schools/datacamp | Cancellation and billing complaints; content "decent"; limited depth for advanced learners | Opinion (users) | M | Search summary |
| S60 | r/SQL and r/learnSQL threads (2024–2025, via mirror sites) | Learners recommend high-volume hands-on practice (SQLZoo, StrataScratch, LearnSQL.com) | Opinion (users) | M | Search summary |
| S61 | r/softwaretesting (via mirrors), club.ministryoftesting.com threads 68705 and 86924 | Beginners ask where to practise manual testing; answers: crowdtesting, demo sites, Guru99 | Opinion (users) | M | Search summary |
| S62 | bugbug.io "Best websites with bugs for testing" (updated 4 Nov 2026), read 2026-11-08 | Guru99 Live Testing Project is the only listed site with intentional bugs; other options are real products or bounty programs | Source | M | Direct fetch |
| S63 | testquality.com "5 favorite web apps for practicing test automation"; automationpanda.com | SauceDemo, The Internet and Restful Booker (resets every 10 min, "loaded with bugs"); public demo sites "remain elusive" | Source | M | Search summary |
| S64 | Central Square Foundation BaSE 2025 report (edtechbase.centralsquarefoundation.org); ASER 2024 via Business Today and Deccan Herald | 90% of low-income households own a smartphone; 95% of children with access share it; practice and doubt-solving is the top EdTech use (77%); rural 14–16: about 89% access, just over half use it for learning | Source | M (full text not read) | Search summary |

## Label legend used across the Practice Labs documents

The owner asked for facts, estimates, opinions and recommendations to be clearly distinguished. The documents use two compatible label sets:

| Owner's term | Labels in 01–13 (rulebook 12 classes) | Labels in 16–18 |
|---|---|---|
| Verified fact | **[V]** verified data (measured or read first-hand); **[P]** public evidence (a cited first-party or reputable page, reported) | **[Fact]**, **[Source]** |
| Estimate | **[E]** third-party estimate | **[Estimate]** |
| Opinion | **[H]** reasoned hypothesis (my judgement); user reviews are tagged "Opinion (users)" in this register | **[Opinion]** |
| Recommendation | "Decision:", "Recommendation:" or "**Recommended**" in decision tables | **Recommendation** |
| Unknown | **[U]** | "unknown" |

## Repository facts used (verified 2026-11-08, this session)

Branch `feature/unified-ecosystem-workspace` at `9b6e7e9` (clean, in sync with origin). `main` is at `637ae76`.

Practice Labs inventory:

| Lab | Exercises | Lessons |
|---|---|---|
| SQL | 49 | 18 |
| Excel | 55 | 13 |
| Power BI | 43 | 13 |
| JSON Error-Fixing | 18 | 0 |
| JSONPath | 19 | 0 |
| Cron | 19 | 0 |
| Test Design | 20 | 0 |

Smart Flashcards decks:

| Deck | Cards |
|---|---|
| Excel | 31 |
| HTTP APIs | 28 |
| JSON | 30 |
| Power BI | 33 |
| Software testing | 29 |
| SQL | 30 |

The Power BI lab has its own DAX and Power Query engines. The Excel lab has a formula engine.

SQL audit facts:

- no recursive query anywhere;
- EXPLAIN appears once;
- 3 "sales report" project exercises are not attached to any lesson;
- date and text functions are practised (both exercises sit on the "Calculations" lesson), but no lesson teaches dates.

## Not researched (stated, not hidden)

- **Search volumes and keyword difficulty:** no Keyword Planner, Search Console or Trends export was available. They stay unknown until measured ([11 SEO](11-seo-strategy.md), section 6).
- **Competitors examined directly (S55, second pass):**
  - W3Schools, SQLBolt, Programiz, GeeksforGeeks, Mode, Kaggle Learn, Codecademy, DataCamp, freeCodeCamp, Exercism;
  - Learn Git Branching, Playwright docs, Test Automation University, Software Testing Help, Ministry of Testing;
  - Postman Learning Center, GitHub Skills, roadmap.sh, Google ML Crash Course, Microsoft Learn (Power BI), HackerRank.

  Lessons behind sign-in were not entered.
- **Still not examined:** Scrimba, LeetCode, Codewars, CodeSignal, InterviewBit, BrowserStack Guide, DeepLearning.AI, Hugging Face Learn, fast.ai, AWS Skill Builder, Google Cloud Skills Boost, the Docker, Kubernetes, Selenium and Cypress docs, StrataScratch, SQLZoo and LearnSQL.com. The matrix rows that rely on general knowledge stay marked "nr".
- **Licences to confirm before vendoring:** Pyodide (MPL-2.0, as I understand it) and TeaVM (Apache-2.0, as I understand it). Both must be confirmed from the repositories before any build.
