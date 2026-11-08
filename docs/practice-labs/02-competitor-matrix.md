# 02. Competitor feature and UX matrix

The ✓, ~ and ✗ marks describe the free experience. "nr" means not re-verified this session: these are general, well-known characteristics, used only as context ([source register](15-source-register.md), "Not researched"). Rows backed by a page read this session cite their source id. No branding, text or layout is to be copied. The columns compare *patterns*.

**Second pass (2026-11-08):** 21 of these sites were examined directly in a real phone-sized browser (measurements, screenshots, free-vs-paid, user feedback): [17 competitor experience audit](17-competitor-experience-audit.md). Where 17 and this table differ, 17 is the more direct evidence. Codecademy's free tier was verified on its pricing page (no assessments, projects, challenges or interview prep on Basic; S56).

## 1. Learning platforms

| Platform | Primary audience | Beginner entry | Lesson pattern | Editor in lesson | Checked exercises | Hints / solution | Projects | Interview prep | Mobile | Account needed for core use | Model | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| W3Schools | Absolute beginners, reference look-ups | ✓ very low friction | Short concept, example, "Try it" link, operator tables | ~ separate editor page | ~ separate exercises and quizzes | ~ | ~ paid | ✗ | ✓ readable | ✗ (progress needs sign-in) | Ads plus upsell | S20, S21 |
| SQLBolt | SQL beginners | ✓ | Explanation, table, editor and tasks on one page | ✓ | ✓ task list | ✓ solution on request | ✗ | ✗ | ~ | ✗ | Donations | S22 |
| freeCodeCamp | Career-switchers (web) | ✓ | Step-by-step challenges | ✓ | ✓ tests | ~ forum | ✓ certification projects | ~ | ~ | ✓ for progress | Nonprofit | S24, nr |
| The Odin Project | Self-directed web developers | ~ | Reading links, then projects | ✗ (local setup) | ✗ | ✗ | ✓ core | ✗ | ~ | ✓ for progress | Open source | S23 |
| Codecademy | Beginners | ✓ | Text plus editor side by side | ✓ | ✓ | ✓ | ~ paid | ~ paid | ~ | ✓ | Subscription | S27, nr |
| DataCamp | Data learners | ✓ | Video plus editor exercises | ✓ | ✓ | ✓ | ~ paid | ~ | ~ | ✓ | Subscription | S27, nr |
| Exercism | Practising programmers | ✗ ("not for beginners") | Exercise-first | ✓ | ✓ tests | ✓ mentoring | ✗ | ✗ | ~ | ✓ | Free nonprofit | S25 |
| roadmap.sh | Everyone choosing a direction | ✓ | Roadmap nodes linking out | ✗ | ✗ | n/a | ~ project ideas | ~ question lists | ✓ | ✗ to browse | Free plus pro | S28 |
| LeetCode / HackerRank / Codewars / CodeSignal | Interview candidates | ✗ | Problem-first | ✓ | ✓ hidden tests | ~ | ✗ | ✓ core | ~ | ✓ | Freemium | nr |
| GeeksforGeeks / Programiz | Students (India-heavy) | ✓ | Article plus examples | ~ online compiler | ~ | ✓ | ~ | ✓ question lists | ✓ | ✗ | Ads plus courses | nr |
| Test Automation University | Testers | ~ | Video courses plus quizzes | ✗ | ~ quizzes | ✗ | ✗ | ✗ | ~ | ✓ | Free (vendor) | S26 |
| Ministry of Testing | Testers (community) | ~ | Articles, talks, courses | ✗ | ✗ | ✗ | ~ | ~ | ✓ | ✓ for most | Membership | nr |
| Learn Git Branching | Git learners | ✓ | Level, commands, live commit graph | ✓ terminal | ✓ goal-graph match | ✓ | ✗ | ✗ | ~ | ✗ | Open source (MIT) | S30 |
| GitHub Skills | Git and GitHub learners | ~ | Steps run inside a real repository | n/a (real GitHub) | ✓ by Actions | ~ | ~ | ✗ | ~ | ✓ GitHub account | Free | nr |
| Kaggle Learn / DeepLearning.AI / Google MLCC / fast.ai | AI and ML learners | ~ | Notebooks or video | ✓ (cloud notebook) | ~ | ~ | ✓ competitions | ✗ | ✗ | ✓ | Free plus paid | S29, nr |
| AWS Skill Builder / Google Cloud Skills Boost | Cloud learners | ~ | Video plus real cloud labs | ✓ real console | ✓ lab checks | ~ | ✓ | ~ cert prep | ✗ | ✓ | Freemium | nr |
| **ToolZenHub (now)** | Beginners to job-seekers | ✓ | 13-section lesson, runnable examples | ✓ SQL | ✓ exact result check | ✓ hints, then solution | ~ 3 exercises | ✗ | ✓ designed for it | ✗ | Free | repo |

## 2. Patterns to adopt, adapt or avoid

| Pattern | Seen in | Decision | Why |
|---|---|---|---|
| Left tree of lessons, current lesson marked, previous and next at top and bottom | W3Schools, SQLBolt | **Adopt** (already built: roadmap sidebar and pager) | The fastest way to find "where am I" and "what next" |
| Example before theory, small and runnable | W3Schools, SQLBolt | **Adopt** | Lowers the entry barrier and gives a quick win |
| Editor, tasks and data on the same page as the explanation | SQLBolt, Codecademy | **Adopt** on desktop (context panel only where the lesson needs it); stacked on phones | Avoids context switching; separate pages lose learners |
| Several small tasks per lesson, increasing difficulty | SQLBolt | **Adopt** (2 to 6 checked tasks per lesson) | Practice volume without long exercises |
| Solution on request, hint first | SQLBolt, Codecademy | **Adopt** (built) | Productive struggle without dead ends |
| "Solve all to continue" gating | SQLBolt | **Avoid** | Gating without persistence frustrates; hurts SEO entry from any page |
| XP, streaks, leagues | W3Schools, LeetCode | **Avoid** | Rule 7.7; extrinsic and needs an account |
| Sign-in to save progress | most | **Avoid unless an exception is approved**; at most opt-in, local-only progress (owner decision D1) | Rule 7.7 |
| Live visual state (commit graph, join diagram) updating as you type | Learn Git Branching | **Adopt** for git, joins and query steps | Turns abstract state into something visible |
| Real external environment (GitHub repository, cloud console) | GitHub Skills, Skill Builder | **Adapt**: simulate in the browser, plus downloadable starter projects for the local real thing | No accounts and no costs; honest about what is simulated |
| Video-first lessons | TAU, DataCamp | **Avoid** as core | Heavy on mobile data; no practice; slow to update |
| Problem-first algorithm banks | LeetCode | **Adapt** only for the interview modules, with explained solutions | Hidden-test-only grading teaches little to beginners |
| Separate exercise pages | W3Schools | **Adopt for challenge sets and projects only** | Lessons keep their own tasks; challenge banks get their own search-friendly pages |
| Ads in content | W3Schools, GeeksforGeeks | **Defer** (rulebook 6.8: ads need their own approval) | |

## 3. Visual hierarchy observations (pattern level)

- **One H1, short intro, then the first example "above the fold".** W3Schools puts a runnable example within the first screen [S20]. ToolZenHub lessons put "What you will learn" and "Before you start" first. **Change:** move the first example higher on phones by collapsing objectives and prerequisites into a compact "Lesson card" ([UI/UX](08-ui-ux-specification.md), section 4).
- **Monospace code on a tinted background, with the result table directly under it.** This is universal, and ToolZenHub already does it.
- **Consistent "Try it" affordance next to every example.** ToolZenHub has "Run this example". Keep the label identical everywhere.
- **Plain progress text ("Lesson 5 of 18").** Better than a percentage bar alone without an account. Built.
