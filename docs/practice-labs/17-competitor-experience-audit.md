# 17. Competitor experience audit: direct examination and user feedback

**Date of examination:** 2026-11-08.

**Labels:**

| Label | Meaning |
|---|---|
| **[Fact]** | Measured or seen directly in this session |
| **[Source]** | Stated by a cited page; ids from the [source register](15-source-register.md) |
| **[Estimate]** | A third-party figure |
| **[Opinion]** | Users' views, or my own judgement, said so |
| **Recommendation** | What ToolZenHub should do |

## 1. Method (reproducible)

- **Browser:** each page was loaded in real Chrome (Playwright 1.63, system Chrome).
- **Viewport:** a phone at 390 × 844, touch on, Android Chrome user agent.
- **Timing:** one page at a time, with 6 s allowed after DOMContentLoaded.
- **Measured per page:** request count, third-party domains, declared response bytes (a **lower bound**: responses without a length header count as 0), horizontal overflow, the vertical position of the first code block or editor, whether an editor exists, iframes, ad-slot markers, large fixed or sticky overlays (over 25% of the screen, which includes cookie banners), sign-up wording in the first screen, paid wording on the page, and word count.
- **Screenshots:** a phone screenshot of every page was taken and inspected (contact sheets, scratchpad; not committed).
- **Same treatment for ToolZenHub:** the measurement was also run on its own SQL JOIN lesson (local preview build).

**Limits:**

- The editor detector misses editors behind a "Try it" link (W3Schools) and unclassed textareas (ToolZenHub).
- The "paid wording" detector is a word match and can misfire (playwright.dev mentions no plan).
- The overlay count includes consent banners shown to a first-time visitor.
- Pages that need sign-in (Codecademy, DataCamp and Exercism lessons, Kaggle notebooks, HackerRank editor) were examined only up to the point where sign-in is required.

## 2. Measurements [Fact]

| Site (page) | Requests | Third-party domains | Declared KB (lower bound) | Horizontal overflow (px) | First code/editor y (px) | Editor detected | Iframes | Ad slots | Large fixed overlays | Sign-up text in first screen | Paid wording | Words |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w3schools.com `/sql/sql_join.asp` | 608 | 96 | 932 | 0 | 371 | no (separate "Try it") | 16 | 0 | 0 | no | no | 588 |
| sqlbolt.com lesson 6 (joins) | 58 | 11 | 1041 | 0 | 1027 | yes | 7 | 2 | 0 | no | no | 819 |
| programiz.com `/sql/join` | 459 | 92 | 1938 | 0 | 536 | no | 12 | 12 | 6 | no | no | 786 |
| geeksforgeeks.org SQL joins | 143 | 13 | 3951 | 0 | 1775 | no | 14 | 3 | 2 | yes | no | 904 |
| mode.com SQL joins | 269 | 42 | 5019 | 0 | 2537 | yes | 1 | 0 | 1 | no | no | 1783 |
| kaggle.com Learn: Intro to SQL | 51 | 5 | 3087 | 0 | none | no | 2 | 0 | 1 | yes | no | 202 |
| codecademy.com Learn SQL | 129 | 23 | 9589 | 0 | none | no | 1 | 0 | 0 | yes | yes | 1235 |
| datacamp.com Introduction to SQL | 116 | 13 | 1154 | 0 | none | no | 4 | 0 | 0 | yes | no | 1040 |
| freecodecamp.org Relational Databases | 57 | 6 | 321 | 0 | none | no | 2 | 0 | 0 | no | no | 525 |
| exercism.org Python track | 178 | 7 | 1293 | 0 | 1818 | no | 1 | 0 | 0 | yes | yes | 925 |
| learngitbranching.js.org | 12 | 2 | 821 | 0 | n/a (terminal) | no | 0 | 0 | 2 | no | no | 294 |
| playwright.dev `/docs/locators` | 45 | 0 | 502 | 0 | 859 | no | 0 | 0 | 0 | no | (misfire) | 2992 |
| testautomationu.applitools.com | 1380 | 22 | 9939 | 0 | none | no | 0 | 0 | 1 | yes | no | 2207 |
| softwaretestinghelp.com (test cases) | 50 | 0 | 177 | 0 | none near top | no | 0 | 0 | 0 | no | no | 5148 |
| ministryoftesting.com | 205 | 16 | 29225 | 0 | none | no | 10 | 5 | 0 | no | yes | 700 |
| learning.postman.com overview | 141 | 3 | 58 | 0 | none | no | 0 | 0 | 2 | yes | no | 548 |
| skills.github.com | 34 | 2 | 508 | 0 | none | no | 0 | 0 | 0 | no | no | 780 |
| roadmap.sh `/sql` | 304 | 14 | 1071 | 0 | none | no | 5 | 4 | 1 | yes | yes | 426 |
| developers.google.com ML Crash Course | 89 | 8 | 3004 | 0 | none | no | 1 | 0 | 1 | yes | no | 546 |
| learn.microsoft.com Power BI training | 35 | 2 | 1435 | 0 | none | no | 0 | 0 | 0 | yes | no | 353 |
| hackerrank.com `/domains/sql` | 117 | 14 | 3375 | 0 | none | no | 2 | 0 | 2 | no | no | 194 |
| **ToolZenHub** SQL lesson "Joining tables" | 38 | **0** | n/a | 0 | **1770** | yes (unclassed) | 0 | 0 | 0 | no | no | 862 |

## 3. What the screens showed [Fact, visual inspection of phone screenshots]

| Site | First phone screen | Learning simplicity | Practice | Mobile problems seen |
|---|---|---|---|---|
| W3Schools | Title, Previous/Next buttons, a one-sentence definition, the list of JOIN types | Very simple: one idea, bullet list | "Try it" opens a separate editor; exercises on other pages | 16 iframes and 96 third-party domains (heavy tracking and ad tech) |
| SQLBolt | Lesson heading and prose about normalisation | Clear, but prose-first | Editor and tasks on the same page, about 1.2 screens down | Text-only first screen |
| Programiz | A large blank area (reserved ad space), then the title and the first example | Simple | Code example; no checked practice on the page | 12 ad slots, 6 large overlays; the code block is clipped at the right edge (internal scroll) |
| GeeksforGeeks | Title, last-updated date, bullets | Medium; long article | Code far down (1,775 px) | An ad banner overlapping the content |
| Mode | A promo banner, then a dark lesson hero with an outline | Clear outline | Editor far down (2,537 px) | Promo banner over the content |
| Codecademy | Course landing: "Free course", 4.6 ★ (27,672 ratings), "Start", feature list | Polished | Lessons need an account | Sign-up first |
| DataCamp | Course landing: "Free course", 4.8 ★ (67,131 reviews), 2 hours, then **"Create your free account" (Google or email)** in the first screen | Polished | Account wall before any lesson | Countdown promo bar |
| freeCodeCamp | Certification page: "Start Learning"; the certification needs **5 projects plus an exam** | Clear | Projects (account for progress) | none seen |
| Exercism | "146 exercises, 17 concepts, mentoring, 100% free", Sign up | Clear | Requires an account and a local CLI or online editor | none seen |
| Learn Git Branching | A desktop terminal dialog **cut off** on the phone; "mobile alert" in the terminal text | Playful, visual | Strong (live commit graph) | **Not designed for phones** |
| Playwright docs | Breadcrumb, "Locators", a quick guide listing getByRole and the others | Reference-clear | No practice | none |
| Software Testing Help | Long article (5,148 words), interview-question format | Wordy | No practice | none (no ads detected at load) |
| roadmap.sh SQL | "37,227+ tracking this roadmap", an AI tutor box, a roadmap image; a **cookie sheet covering half the screen** | Visual roadmap | Links out; projects tab | Consent sheet |
| Kaggle Intro to SQL | "3 hours to go", Begin Course, lessons as "Tutorial" and "Exercise" (BigQuery notebooks) | Clear | Cloud notebooks (account) | Cookie bar |
| HackerRank SQL | A challenge list with difficulty, max score and success rate (95.88%…) | Problem-first | Editor behind sign-in | A cookie banner covering the bottom third |
| ToolZenHub | Breadcrumb, Menu bar, eyebrow, H1, "Lesson 10 of 18", objectives | Simple | Runnable examples and checked tasks, **but practice starts at 1,770 px** | none; no ads, no third parties |

## 4. Free versus paid (verified where marked)

| Platform | Free | Paid | Evidence |
|---|---|---|---|
| Codecademy | Basic: limited courses; **no** assessments, certificates, portfolio projects, code challenges, skills tracking, personalised practice or interview prep; limited AI help; mobile app | Plus ₹300/mo yearly (₹600 monthly); Pro ₹600/mo yearly (₹1,200 monthly): career paths, interview prep, code challenges, certifications | [Fact] codecademy.com/pricing, read 2026-11-08 (S56) |
| DataCamp | A free course page shows 4.8 ★ and a free course, but an account is required first; third parties say the free tier is mostly first chapters | Subscription | [Fact] account wall seen (S55); [Estimate] tier detail (S27) |
| W3Schools | All tutorials free with ads; progress (XP, streaks) needs sign-in | Ad-free and paid courses | [Fact] S20 |
| freeCodeCamp, The Odin Project, SQLBolt, Learn Git Branching, Playwright docs, GitHub Skills | Free | none (donations) | [Fact] pages examined |
| Exercism | 100% free; mentoring | Optional "Insiders" (not examined) | [Fact] page text; [Source] S25 |

**Implication [Opinion]:** the features Codecademy reserves for paid plans (assessments, projects, code challenges, interview prep, certificates) are exactly the ones ToolZenHub can offer free, except certificates (no accounts). This is the core differentiation for Indian learners, for whom ₹600 to ₹1,200 a month is a meaningful cost.

## 5. Retention mechanisms observed

| Mechanism | Where | Needs an account | Usable by ToolZenHub? |
|---|---|---|---|
| XP, streaks, leagues | W3Schools | yes | **No** (rule 7.7 names streaks and gamification) |
| "N people tracking this roadmap" | roadmap.sh | yes | No (needs accounts) |
| Certificates after projects plus exam | freeCodeCamp | yes | No (identity) |
| Human mentoring | Exercism | yes | No (moderation, accounts) |
| Ratings counts as social proof | Codecademy, DataCamp | n/a | No (no reviews system; never fabricate) |
| Success rate per challenge | HackerRank | yes | No (needs submission data) |
| Short time-boxed course promise ("2 hours", "3 hours to go") | DataCamp, Kaggle | no | **Yes**: an honest time estimate per lesson and path |
| Free full content as the hook | freeCodeCamp, SQLBolt | no | **Yes** (already the model) |
| Reference value that brings people back | Playwright docs, W3Schools | no | **Yes**: standalone tools and cheat-sheet sections |
| Opt-in local progress | ToolZenHub flashcards | no (device) | **Yes, if D1 is approved** |

## 6. Real user feedback [Opinion, third-party, cited]

| Theme | What users say | Source | Implication for ToolZenHub (Recommendation) |
|---|---|---|---|
| Plain wording beats completeness for beginners | W3Schools liked for "easy straight-to-the-point English"; MDN "hard to understand" for beginners; criticised for missing "gotchas" and stale pages | Mozilla learning-area survey 2014; freeCodeCamp forum (S57) | Plain first explanation, then a "Deeper" section with the gotchas; review dates ([10](10-content-quality-standard.md), section 5) |
| "Try it" tinkering matters | MDN lacks the "tinkering" of W3Schools' Try it | Reddit and freeCodeCamp forum (S57) | A Run button on every example (built) |
| Paid platforms: billing and cancellation pain | Codecademy's Trustpilot around 2.6 (billing complaints); DataCamp cancellation "unclear and unnecessarily difficult", auto-reactivation | Review aggregators, Course Report, Trustpilot (S58, S59) | No subscriptions; nothing to cancel. State "free, no account" plainly |
| Fill-in-the-blank is too hand-holding | Experienced learners find Codecademy's style too guided | Review blogs (S58) | Tasks write whole queries or code, not blanks; hints instead of scaffolds |
| SQL practice: "practise a lot" | r/SQL and r/learnSQL recommend volume of hands-on exercises (SQLZoo, StrataScratch, LearnSQL.com) | Reddit via mirrors (S60) | Many small checked tasks per lesson, plus challenge sets |
| Testers lack a place to practise | Beginners ask where to practise manual testing; answers point to crowdtesting (uTest), demo shops and Guru99's live project | r/softwaretesting via mirrors; Ministry of Testing club threads (S61) | ShopLite with seeded bugs and a checked bug report (E5) |
| Existing practice targets have limits | Guru99 is the only listed site with intentional seeded bugs; SauceDemo and The Internet have no feedback or bug list; Restful Booker is "loaded with bugs" and resets every 10 minutes; Automation Panda notes public demo sites "remain elusive" | bugbug.io (updated 4 Nov 2026), TestQuality, Automation Panda (S62, S63) | ShopLite's difference: checked findings, explained bug list, versioned releases, and a mock API that never resets mid-session (in-memory per tab) |

## 7. Mobile context (India)

**[Source]**

- BaSE 2025 (Central Square Foundation, low-income households, data collected July 2025 to January 2026): 90% of households own a smartphone; 95% of children with access *share* the device; among EdTech-using children, practice and doubt-solving is the top use (77%) (S64).
- ASER 2024 (rural, aged 14 to 16): about 89% have smartphone access; just over half used it for learning in the reference week (S64).

**Recommendation:**

- Phone-first practice.
- No downloads larger than needed before the learner asks.
- No persistence by default: on **shared devices** this is also a privacy *benefit*, and it strengthens the case for D1 being opt-in only.

## 8. Conclusions for the blueprint

1. **Speed to practice is the measurable gap.**
   - Most free reference pages show an example quickly (W3Schools 371 px, Programiz 536 px) but have no checked practice.
   - Practice platforms put practice behind an account.
   - ToolZenHub has checked practice without an account, but at 1,770 px.
   - **Recommendation:** first runnable example at 1.5 screens or less, and a first checked task at 3 screens or less on a phone ([13](13-acceptance-criteria.md), lesson criterion 5).
2. **Weight and privacy are a real differentiator** [Fact]. ToolZenHub's lesson makes 38 requests and contacts 0 third-party domains. W3Schools makes 608 requests to 96 domains, and Programiz 459 to 92.
3. **Learn Git Branching is the best Git learning experience and is not built for phones** [Fact]. E7 git must be designed for touch and narrow screens from the start.
4. **Testing practice is the weakest-served area** [Opinion, supported by S61 to S63]. This confirms the launch audience.
5. **Free equals paid features elsewhere** [Fact for Codecademy]. Projects, assessments, challenges and interview prep are the free hook.
