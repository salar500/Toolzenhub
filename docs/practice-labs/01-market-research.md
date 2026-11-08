# 01. Practice Labs market research

Evidence ids refer to [the source register](15-source-register.md). Labels follow rulebook 12: **[V]** verified, **[P]** public evidence, **[E]** estimate, **[H]** reasoned hypothesis, **[U]** unknown.

## 1. Seven findings that shape the blueprint

1. **Explanations are being absorbed by AI; practice is not.**
   - 44% of developers now use AI tools to learn, up from 37% [S02, P].
   - Studies of Google AI Overviews report click-through falls of roughly 35% to 58% on informational queries [S05, S06, S07, P].
   - Stack Overflow's question volume has fallen steeply [S04, P].
   - A page that only explains "what is a LEFT JOIN" now competes with an answer shown on the results page.
   - An AI summary cannot replace a page where the learner runs a query, gets an answer checked, finds bugs in a real app, or resolves a merge conflict [H, consistent with rulebook 1.4].
   - **Decision:** every published lesson carries a checked exercise or an interactive element, and the platform invests first in engines and simulators, not in prose volume.

2. **Completion is the industry's failure point.**
   - Typical MOOC completion is under 13%, and about 4.6% on India's SWAYAM [S08, P].
   - The causes cited are lack of time, motivation, isolation, little interactivity and missing background.
   - **Decision:** short lessons (10 to 20 minutes), immediate feedback, visible position in the path, and projects broken into checked milestones. Nothing is gated behind an account.

3. **The free tier of paid platforms is thin, and the free platforms target developers.**
   - Codecademy and DataCamp keep most content behind US$15 to 50 a month; DataCamp's free tier is mostly first chapters [S27, E].
   - freeCodeCamp and The Odin Project are free and project-based, but aim at web developers [S23, S24, P].
   - Exercism is free but says it is "not for beginners" [S25, P].
   - Free, structured, interactive practice for **testers** is sparse: Test Automation University is video courses (about 100k enrolled by 2021) [S26, P], and W3Schools has no testing track [H].
   - **This is the clearest gap.**

4. **SQL and Python are universal; testing tools are shifting to Playwright.**
   - SQL is used by 58.6% of all respondents and Python by 57.9%; among learners Python is 71.8% [S01, V].
   - Playwright passed Cypress in npm downloads in 2024 and leads usage at work in State of JS [S09, E/P].
   - Indian automation-tester postings repeatedly ask for Playwright, SQL and API testing together [S11, P].

5. **India is the largest growth market, and ToolZenHub is an Indian-domain site.**
   - India has about 21.9M developers on GitHub and is the fastest-growing community, projected past 57.5M by 2030 [S03, P].
   - Indian learners' job routes heavily include QA and service-company roles [S11, P; H for the share].

6. **Interactivity in the browser is now technically cheap.**
   - SQLite WASM: 728 KB, already shipped [S40, V].
   - Pyodide: about 5.3 MB core [S41, P].
   - PostgreSQL WASM: about 3.7 MB gzipped [S44, P].
   - javac in WASM: about 6 MB, author's claim [S43, P].
   - Pure-JS git [S46, P].
   - Browser-local ML [S45, P].
   - None of these needs a server, an account or a paid API (rulebook 1.5).

7. **The simple reference layout wins on approachability.**
   - W3Schools' structure is plain [S20, P]: a left tree, one concept per page, an example before theory, previous and next, a "Try it" next to every example, and exercises one click away.
   - SQLBolt shows the same idea at the lesson level: explanation, table, editor and tasks on one page, with the solution on request [S22, P].
   - These two patterns underpin the [UI/UX specification](08-ui-ux-specification.md).

## 2. Market map

| Segment | Leaders (public evidence) | Model | What they do well | Where the gap is |
|---|---|---|---|---|
| Reference and tutorials | W3Schools, MDN, GeeksforGeeks, Programiz | Free, ad- or upsell-funded | Instant answers, simple navigation, "Try it" | Thin practice and feedback; progress needs sign-in; AI Overviews absorb the reference queries [S05, S20] |
| Structured courses | Codecademy, DataCamp, Coursera | Subscription | Guided paths, in-browser editors | Paywall; beginner-friendly but expensive for Indian learners [S27, H] |
| Free curricula | freeCodeCamp, The Odin Project | Nonprofit or open source | Full curricula, projects | Web-dev focus; no testing curriculum [S23, S24] |
| Practice and interviews | LeetCode, HackerRank, Codewars, Exercism | Freemium | Graded challenges, community | Algorithm focus; little SQL depth and none for testing practice; Exercism not for beginners [S25] |
| Roadmaps | roadmap.sh | Free plus pro | Discovery: "what to learn next", about 3M users [S28] | Links out for the learning itself |
| SQL-specific | SQLBolt, Mode, SQLZoo | Free | Interactive exercises on one page [S22] | Small, rarely updated, no projects or interview sets [H] |
| Testing-specific | Test Automation University, Ministry of Testing, vendor blogs | Free video, membership | Expert content | Video-first; no checked practice; no practice app to test [S26, H] |
| AI and data | DeepLearning.AI, Kaggle, Hugging Face, fast.ai, Google MLCC | Free plus paid | Notebooks, competitions, about 23M Kaggle accounts [S29] | Steep for beginners; heavy downloads or cloud notebooks [H] |
| Cloud and DevOps | AWS Skill Builder, Google Cloud Skills Boost, Docker and Kubernetes docs | Free plus paid labs | Real cloud sandboxes | Vendor lock-in; real labs cost money or need accounts [H] |

## 3. Demand signals (no invented volumes)

| Topic | Signal | Class |
|---|---|---|
| SQL | 58.6% of developers use it; 45.4% of learners [S01] | V |
| Python | 57.9% of all respondents, 71.8% of learners [S01] | V |
| Java | 29.4% of all respondents, 40.8% of learners (high in Indian curricula) [S01] | V |
| Playwright | Leading npm downloads; Indian postings [S09, S11] | E/P |
| API testing | In Indian automation postings [S11] | P |
| AI in testing | 45.65% not yet using it (PractiTest); 60% using it (Applause) [S10] | P (vendor) |
| Git | Universal; Learn Git Branching has about 29.7k stars [S30] | P |
| Search volume per keyword | Not measured | **U**: measure in GSC and Keyword Planner ([SEO](11-seo-strategy.md), section 6) |

## 4. Traction mechanics observed in leaders

| Mechanic | Example | Applicable here? |
|---|---|---|
| Search-led discovery of one concept per page | W3Schools [S20, S21] | Yes: one intent per page, but every page carries practice (finding 1) |
| Path and roadmap discovery | roadmap.sh [S28] | Yes: department and path pages answer "what next" |
| Daily challenge and streaks | W3Schools and LeetCode | No accounts or persistence: rule 7.7. Not without an approved exception, and streaks are rejected (rule 7.7 also names gamification) |
| Certificates | freeCodeCamp, W3Schools (paid) | No: needs identity. Deferred ([roadmap](12-prioritized-roadmap.md), D-section) |
| Mentoring and community | Exercism, Odin | Out of scope (moderation and accounts) |
| Projects as portfolio | Odin, freeCodeCamp | Yes: projects produce files the learner keeps (a test plan, a SQL report, a Playwright repository) |
| Interview question banks | LeetCode, InterviewBit, GeeksforGeeks | Yes, as checked practice, not lists |

## 5. Implications

- **Position:**
  - "Free, practical, checked practice for software careers, in your browser, without sign-up."
  - Starting with testers and SQL, the gap with the strongest evidence.
  - Expanding into automation, programming, APIs, AI and data.
- **Differentiators, stated as user reasons (rulebook 12.5):**
  - Practise against a real, deliberately buggy web app and API.
  - Get answers checked exactly.
  - Every lesson is runnable.
  - It works on a phone.
  - Nothing to install for most paths.
  - Free.
- **Risks:**
  - AI-era traffic compression (finding 1).
  - The large content-maintenance load.
  - Download size of the Python and Java runtimes on phones.
  - No retention hooks while rule 7.7 stands.
  - Competing with free incumbents on generic topics.

The [roadmap](12-prioritized-roadmap.md) sequences around these risks.
