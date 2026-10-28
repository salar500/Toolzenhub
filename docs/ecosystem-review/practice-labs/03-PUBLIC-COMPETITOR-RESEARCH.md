# 03 Public competitor research

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

**Owner decision recorded 2026-10-28:** the Option B scope baseline in doc 18 was approved with conditions. Only what doc 18 records as approved is approved; everything else in this document remains a proposal for Master Prompt 2 to develop. No implementation has started.

Practice Labs & Smart Flashcards ecosystem, Prompt 1 of 3 (research and requirements). Written 2026-10-28. Nothing here is a rule, a build queue or an approval; the rulebook is `docs/product-decision-rules.md`.

Evidence labels used throughout: **OBSERVED** (seen on a public page or in the repository this session), **CLAIMED** (stated by the source about itself, not verified), **INFERRED** (reasoned from observations), **UNKNOWN** (not established). **VERIFIED/HYPOTHESIS** follow rulebook 12.

## Method and limits

Public pages were fetched on 2026-10-28 with a text-only fetch tool, one or two pages per site, respecting HTTP errors and not retrying blocked pages. Authentication, paid content and private areas were not touched. Interactive features were **not exercised**: a page being read as text proves what it says, not that its exercises work. No competitor question, illustration, algorithm or course material was copied; only short factual statements were noted. Mobile experience and accessibility were **UNKNOWN for every site** (no device, no screen reader, no automated scan was used on them).

Sites examined: 26. Sites that could not be inspected (HTTP 403, 404 or empty content), recorded as UNKNOWN: Quizlet, freeCodeCamp, Codewars, SQL Murder Mystery, Frontend Mentor.

## Findings by site

### 1. Anki (documentation)

- **URL:** https://docs.ankiweb.net/studying.html and https://docs.ankiweb.net/deck-options.html; **date accessed:** 2026-10-28
- **OBSERVED:** Answer buttons Again, Hard, Good, Easy (keys 1 to 4; Space or Enter gives Good); each button shows the next interval; review answers get random fuzz. FSRS is documented as an alternative to the legacy SM-2 scheduler: it needs all clients to support it, fits its parameters to the learner's review history, uses a default desired retention of 90 percent, and the docs say low review counts (under a few hundred) are a common reason it may not perform well.
- **CLAIMED:** FSRS is said to estimate forgetting more accurately (the project's own statement).
- **UNKNOWN / not verifiable:** Mobile experience, accessibility, pricing and deck sharing (not on the pages read).
- **Learning approach:** Self-graded spaced repetition with a four-grade scale.
- **Feedback quality:** Feedback is only the next interval; no explanations of why.
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** Anki is far more powerful as a scheduler; ToolZenHub should not compete on scheduling. The difference to offer: no install, no account, original technical content with explanations and links to working tools.


### 2. Quizlet

- **URL:** https://quizlet.com/features; **date accessed:** 2026-10-28
- **OBSERVED:** Nothing: the request returned HTTP 403.
- **CLAIMED:** Nothing.
- **UNKNOWN / not verifiable:** Everything (not inspectable).
- **Learning approach:** UNKNOWN
- **Feedback quality:** UNKNOWN
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** No claim is made.


### 3. RemNote (help centre)

- **URL:** https://help.remnote.com/en/articles/6026144-the-anki-sm-2-spaced-repetition-algorithm; **date accessed:** 2026-10-28
- **OBSERVED:** Default scheduler is described as Anki SM-2 with minor changes: a learning phase with fixed steps, an exponential phase with an interval factor starting at 230 percent and a floor of 130 percent, and a relearning phase with a lapse multiplier of 0.1. A separate FSRS article is linked.
- **CLAIMED:** Says the changes are 'intended to maximize your long-term learning'.
- **UNKNOWN / not verifiable:** How FSRS compares (not on this page); everything else.
- **Learning approach:** Notes-integrated spaced repetition.
- **Feedback quality:** UNKNOWN
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** Shows the SM-2 family is the common baseline, which supports a simple scheduler here.


### 4. Mochi

- **URL:** https://mochi.cards/; **date accessed:** 2026-10-28
- **OBSERVED:** Free plan at $0 with no sign-up and unlimited offline use; Pro at $5 a month adds sync, publishing, dynamic fields, AI and support; Markdown cards.
- **CLAIMED:** 'Smart review schedules' (the algorithm is not described on the page).
- **UNKNOWN / not verifiable:** The actual scheduling method.
- **Learning approach:** Markdown flashcards with spaced repetition.
- **Feedback quality:** UNKNOWN
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** Local-first and free is not unique; the differentiator is content plus tool connection.


### 5. Brainscape

- **URL:** https://www.brainscape.com/ (the academy page returned HTTP 404); **date accessed:** 2026-10-28
- **OBSERVED:** Users rate confidence per card (an image mentions a 1 to 5 scale); cards are scheduled with spaced repetition; a progress dashboard is shown in an image. Free: create, import, share, study with spaced repetition, try AI features, reminders. Paid: unlimited AI creation, certified content, private content, advanced stats.
- **CLAIMED:** The algorithm is 'proven', applies 'decades of cognitive science research' and is better than alternatives. None of this is evidenced on the page.
- **UNKNOWN / not verifiable:** How ratings map to scheduling; prices.
- **Learning approach:** Confidence-based spaced repetition.
- **Feedback quality:** UNKNOWN
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** A warning example: claims of proof without evidence are what rulebook 3.3 forbids.


### 6. freeCodeCamp

- **URL:** https://www.freecodecamp.org/learn; **date accessed:** 2026-10-28
- **OBSERVED:** Nothing: the fetch returned empty content.
- **CLAIMED:** Nothing.
- **UNKNOWN / not verifiable:** Everything (not inspectable by this method).
- **Learning approach:** UNKNOWN
- **Feedback quality:** UNKNOWN
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** No claim is made.


### 7. Codecademy

- **URL:** https://www.codecademy.com/pricing; **date accessed:** 2026-10-28
- **OBSERVED:** Pricing shown in rupees: Basic free; Plus Rs 300 a month billed annually (Rs 600 monthly); Pro Rs 600 a month billed annually (Rs 1,200 monthly). Free plan has limited courses and a limited AI assistant, and excludes skill paths, personalised practice, assessments, certificates, code challenges and interview prep.
- **CLAIMED:** Feature names such as adaptive lessons.
- **UNKNOWN / not verifiable:** How the exercises behave.
- **Learning approach:** Course-based guided learning, with practice and assessments behind a paid plan.
- **Feedback quality:** UNKNOWN
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** Practice and assessments are paid there; a free, private, original set can be a real alternative for the narrow topics chosen.


### 8. Exercism

- **URL:** https://exercism.org/about; **date accessed:** 2026-10-28
- **OBSERVED:** Describes itself as a UK not-for-profit; tracks for many languages (the page gives two different counts, 85 and 65 or more); mentoring; a CLI walkthrough link.
- **CLAIMED:** '100% free, forever'.
- **UNKNOWN / not verifiable:** Whether there is an online editor; whether exercises are test-driven (not mentioned on the page).
- **Learning approach:** Mentored, track-based practice.
- **Feedback quality:** UNKNOWN
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** Human mentoring is out of scope; the lab feedback here is deterministic and instant.


### 9. Codewars

- **URL:** https://docs.codewars.com/gamification/kata (HTTP 404); **date accessed:** 2026-10-28
- **OBSERVED:** Nothing.
- **CLAIMED:** Nothing.
- **UNKNOWN / not verifiable:** Everything.
- **Learning approach:** UNKNOWN
- **Feedback quality:** UNKNOWN
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** No claim is made.


### 10. HackerRank (SQL domain)

- **URL:** https://www.hackerrank.com/domains/sql; **date accessed:** 2026-10-28
- **OBSERVED:** A list of SQL challenges with difficulty tags, skill level, a maximum score of 10 to 30 and a success rate, with filters by status, skill, difficulty and subdomain. Log In and Sign Up links are shown.
- **CLAIMED:** None beyond the listing.
- **UNKNOWN / not verifiable:** The editor, whether an account is needed to attempt a challenge, how answers are checked.
- **Learning approach:** Scored challenge catalogue.
- **Feedback quality:** UNKNOWN
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** Scores and success rates are gamification; rulebook 7.7 does not allow it by default.


### 11. SQLBolt

- **URL:** https://sqlbolt.com/; **date accessed:** 2026-10-28
- **OBSERVED:** 18 numbered lessons, each ending with an interactive exercise; learning is 'right in your browser'.
- **CLAIMED:** None.
- **UNKNOWN / not verifiable:** How answers are checked, any progress or account, pricing.
- **Learning approach:** Short lessons each ending in an exercise.
- **Feedback quality:** UNKNOWN
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** Shows the lesson-then-exercise shape that the labs also use.


### 12. SQLZoo

- **URL:** https://sqlzoo.net/wiki/SQL_Tutorial; **date accessed:** 2026-10-28
- **OBSERVED:** Step-by-step tutorials, multiple-choice quizzes, longer assessments on case-study databases (15 questions at three difficulty levels each), reference pages, optional login (visitor shown as Anonymous).
- **CLAIMED:** None.
- **UNKNOWN / not verifiable:** Whether there is a query box and how answers are verified; whether progress is saved. (The page text also contained a note addressed to AI assistants; it was ignored as not part of the task.)
- **Learning approach:** Tutorials plus assessments.
- **Feedback quality:** UNKNOWN
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** Optional login confirms that useful practice without an account is normal.


### 13. SQL Murder Mystery

- **URL:** https://mystery.knightlab.com/; **date accessed:** 2026-10-28
- **OBSERVED:** Nothing: HTTP 403.
- **CLAIMED:** Nothing.
- **UNKNOWN / not verifiable:** Everything.
- **Learning approach:** UNKNOWN
- **Feedback quality:** UNKNOWN
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** No claim is made.


### 14. W3Schools (SQL exercises)

- **URL:** https://www.w3schools.com/sql/sql_exercises.asp; **date accessed:** 2026-10-28
- **OBSERVED:** Multiple-choice and fill-in-the-blank exercises; 60 categories of 3 to 9 questions; wrong answers can try again or Show Answer; a '0/60 done' counter; free sign-up earns points.
- **CLAIMED:** Points (their scoring is not described).
- **UNKNOWN / not verifiable:** How typed answers are matched.
- **Learning approach:** Short fill-in exercises with a show-answer option.
- **Feedback quality:** Explanations are the tutorial chapter, not shown with the answer.
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** ToolZenHub can show the reasoning with the answer.


### 15. MDN Learn Web Development

- **URL:** https://developer.mozilla.org/en-US/docs/Learn_web_development; **date accessed:** 2026-10-28
- **OBSERVED:** Modules (Getting started, Core, Extension); assessments called Test your skills (one isolated feature) and Challenges (several features together); exercises run in the MDN Playground with a Reset button; solutions at the bottom of each question; content under a Creative Commons licence (version not named on the page); no progress tracking mentioned.
- **CLAIMED:** The goal 'beginner to comfortable'.
- **UNKNOWN / not verifiable:** Accessibility of the Playground; progress storage.
- **Learning approach:** Read, try in a playground, compare with a posted solution.
- **Feedback quality:** Self-checked against a posted solution; no automatic check.
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** Automatic, deterministic checking of an answer is the gap this ecosystem can fill for narrow topics.


### 16. web.dev Learn

- **URL:** https://web.dev/learn; **date accessed:** 2026-10-28
- **OBSERVED:** Twelve courses including Accessibility, Forms, Performance, Privacy and Testing.
- **CLAIMED:** Courses were written by experts with help from the Chrome team.
- **UNKNOWN / not verifiable:** Whether quizzes, interactive code or progress exist (not stated on the page).
- **Learning approach:** Reading courses.
- **Feedback quality:** UNKNOWN
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** A source for accurate content; not a competitor for interactive checking.


### 17. Frontend Mentor

- **URL:** https://www.frontendmentor.io/about; **date accessed:** 2026-10-28
- **OBSERVED:** Nothing: HTTP 404.
- **CLAIMED:** Nothing.
- **UNKNOWN / not verifiable:** Everything.
- **Learning approach:** UNKNOWN
- **Feedback quality:** UNKNOWN
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** No claim is made.


### 18. CSSBattle

- **URL:** https://cssbattle.dev/; **date accessed:** 2026-10-28
- **OBSERVED:** Recreate a target image in CSS; shorter code scores higher; Daily Targets without leaderboards, Battles with leaderboards, Versus rooms; the footer shows 451,197 players; sign-in exists.
- **CLAIMED:** '400K+ web designers and developers' (the page's own figure).
- **UNKNOWN / not verifiable:** How match is measured; what an account unlocks; any pricing.
- **Learning approach:** Competitive code-golf style.
- **Feedback quality:** Score only
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** Competition and ranking are not what this research recommends (rulebook 7.7).


### 19. Postman Learning Center

- **URL:** https://learning.postman.com/docs/getting-started/overview/; **date accessed:** 2026-10-28
- **OBSERVED:** The page read did not describe the learning resources.
- **CLAIMED:** Nothing.
- **UNKNOWN / not verifiable:** Tutorials, sandbox, certification (not on this page).
- **Learning approach:** UNKNOWN
- **Feedback quality:** UNKNOWN
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** No claim is made.


### 20. MDN HTTP status codes

- **URL:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Status; **date accessed:** 2026-10-28
- **OBSERVED:** Codes grouped in five classes (1xx to 5xx); the listed codes are defined by RFC 9110; unlisted codes are non-standard; each code has a short meaning (for example 404 and 503).
- **CLAIMED:** None.
- **UNKNOWN / not verifiable:** Any interactive element.
- **Learning approach:** Reference.
- **Feedback quality:** n/a
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** A primary source for an HTTP deck.


### 21. HTTP Cats

- **URL:** https://http.cat/; **date accessed:** 2026-10-28
- **OBSERVED:** A cat image for each status code, a `.jpg` and `.json` suffix, credits to the developer and the original image artist; no licence stated; it does not explain the codes.
- **CLAIMED:** None.
- **UNKNOWN / not verifiable:** Licence of the images.
- **Learning approach:** Image reference.
- **Feedback quality:** n/a
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** Not educational; images must not be copied.


### 22. W3C WAI tutorials

- **URL:** https://www.w3.org/WAI/tutorials/; **date accessed:** 2026-10-28
- **OBSERVED:** Six tutorial sets: Page Structure, Menus, Images, Tables, Forms, Carousels; the page mentions full and working examples; no quiz or interactive practice mentioned.
- **CLAIMED:** None.
- **UNKNOWN / not verifiable:** Whether examples are interactive.
- **Learning approach:** Reading tutorials.
- **Feedback quality:** n/a
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** A primary source for an accessibility deck; text must be paraphrased, not copied.


### 23. WebAIM

- **URL:** https://webaim.org/articles/; **date accessed:** 2026-10-28
- **OBSERVED:** WCAG 2 Checklist, Colour Contrast Checker, articles on headings, forms, alt text and screen reader testing, WAVE (external), training, an AI chatbot; no interactive practice described.
- **CLAIMED:** None.
- **UNKNOWN / not verifiable:** Any exercise content.
- **Learning approach:** Articles and tools.
- **Feedback quality:** n/a
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** A primary source for an accessibility deck.


### 24. Accessibility Insights for Web

- **URL:** https://accessibilityinsights.io/docs/web/overview/; **date accessed:** 2026-10-28
- **OBSERVED:** FastPass (quick automated checks and tab stops) and Assessment (WCAG 2.1 AA with automated and guided manual checks); the automated checks cover 'approximately 50 accessibility requirements'.
- **CLAIMED:** None.
- **UNKNOWN / not verifiable:** Which requirements are covered.
- **Learning approach:** Tooling that guides manual testing.
- **Feedback quality:** n/a
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** Supports a cautious statement: automated checks do not cover everything.


### 25. Ministry of Testing

- **URL:** https://www.ministryoftesting.com/; **date accessed:** 2026-10-28
- **OBSERVED:** Courses, four certifications, recorded talks, collections, articles, a glossary, community, jobs; no practice exercises mentioned; free versus paid is not stated.
- **CLAIMED:** None.
- **UNKNOWN / not verifiable:** Pricing and free scope.
- **Learning approach:** Community and training.
- **Feedback quality:** n/a
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** A practice gap for testers is plausible but unproven (INFERRED).


### 26. ISTQB Certified Tester Foundation Level

- **URL:** https://istqb.org/certifications/certified-tester-foundation-level/; **date accessed:** 2026-10-28
- **OBSERVED:** Syllabus v4.0.1 is available as a PDF (the page shows 827,889 downloads); the exam is listed as 40 questions, pass score 26, 60 minutes.
- **CLAIMED:** None.
- **UNKNOWN / not verifiable:** The syllabus licence terms (none stated on the page).
- **Learning approach:** Syllabus and exam.
- **Feedback quality:** n/a
- **Progress model, mobile, accessibility, pricing:** progress and pricing only as listed under OBSERVED; mobile experience UNKNOWN; accessibility evidence UNKNOWN.
- **Differentiation opportunity (INFERRED):** A proxy for how many people study software testing; the syllabus text must not be copied, and no exam-readiness claim may be made.


## What the evidence supports (and does not)

- **OBSERVED:** the common learner experiences are self-graded spaced repetition (Anki, RemNote, Mochi, Brainscape), reading plus a self-checked playground (MDN), lesson-then-exercise sequences (SQLBolt, W3Schools), and scored challenge catalogues (HackerRank, CSSBattle). Several sites put practice and assessments behind a paid plan (Codecademy) or an account (Mochi sync, Brainscape upgrades).
- **INFERRED:** none of the pages read showed free-form technical answers (a JSON fix, a JSONPath query, a cron expression) being checked automatically by equivalence and then explained with the reasoning. That is a hypothesis about a possible gap, **not a finding that no such site exists**: only the pages above were inspected, and several could not be read.
- **INFERRED:** explanations next to answers and links from a concept to a working tool were not visible on the pages read, but those pages were summaries of landing or documentation pages, not the exercises.
- **UNKNOWN:** pricing and limits for most sites, mobile and accessibility quality, and how any of the interactive exercises behave.
- Rulebook 12.5 warns that "no login" and "private" are not differentiators unless research supports them. Here the supported differences are narrower: deterministic checking of answers that have several correct forms, instant explanation of the reasoning, and direct links to the verified ToolZenHub tools.
