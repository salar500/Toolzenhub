# 05 User problems and search demand

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

**Owner decision recorded 2026-10-28:** the Option B scope baseline in doc 18 was approved with conditions. Only what doc 18 records as approved is approved; everything else in this document remains a proposal for Master Prompt 2 to develop. No implementation has started.

Practice Labs & Smart Flashcards ecosystem, Prompt 1 of 3 (research and requirements). Written 2026-10-28. Nothing here is a rule, a build queue or an approval; the rulebook is `docs/product-decision-rules.md`.

Evidence labels used throughout: **OBSERVED** (seen on a public page or in the repository this session), **CLAIMED** (stated by the source about itself, not verified), **INFERRED** (reasoned from observations), **UNKNOWN** (not established). **VERIFIED/HYPOTHESIS** follow rulebook 12.

## Verified search data

**None.** Google Trends was requested for the three queries "sql practice", "json formatter" and "http status codes" (India, 12 months) and returned **HTTP 429 Too Many Requests**. It was not retried (rate-limit respect). No other keyword-volume source (Search Console, Keyword Planner) is available in this session. **No search volume, trend, competition or click-through figure is stated anywhere in this package**, and none should be inferred from it. India versus worldwide demand is **UNKNOWN**.

## Proxy indicators (OBSERVED, and they are not demand for ToolZenHub)

| Indicator | Where seen | What it can and cannot say |
|---|---|---|
| ISTQB Foundation Level syllabus v4.0.1 shows 827,889 downloads | ISTQB page, 2026-10-28 | A sign that many people study software testing; says nothing about interactive practice demand or about ToolZenHub |
| CSSBattle shows 451,197 players | CSSBattle footer, 2026-10-28 | A sign that competitive CSS practice has an audience; it is the site's own figure |
| Several free interactive SQL sites exist (SQLBolt, SQLZoo, W3Schools exercises) | pages read, 2026-10-28 | SQL practice has audience and strong free incumbents; it also means a new entrant faces competition |
| Anki, RemNote, Mochi, Brainscape all provide spaced repetition | pages read, 2026-10-28 | Spaced-repetition flashcards are a known need; the audience is already served |
| ToolZenHub has no usage data for the existing tools | rulebook 3.1, 12.2 | Nothing about repeat use of the developer tools can be claimed from this site |

## Hypothesised user problems (HYPOTHESIS; to be tested only through the owner's own Search Console later)

1. **A developer or tester has just met invalid JSON and wants to understand why.** Existing tools show the error; a learner wants to practise repairing it. (JSON Error-Fixing Lab.)
2. **Someone writing a JSONPath query is unsure of the rules.** (JSONPath Challenge Lab.)
3. **Someone must write a cron schedule and is afraid of getting it wrong.** The cron engine can show the real next runs. (Cron Challenge Lab.)
4. **A tester preparing for interviews wants practice on boundary values and equivalence classes** with feedback; free-text exercises cannot be checked automatically, structured ones can. (Test Design Lab.)
5. **A learner wants short, repeatable revision of HTTP, JSON and testing concepts** without an account. (Smart Flashcards.)

## Search intent

HYPOTHESIS, not measured: "quick answer" intent (what does status 422 mean) is served by reference pages and by the existing tools; "structured practice" intent (practise JSONPath, practise boundary values) is the only intent a practice page serves better than a reference. For that reason the recommended scope has few pages with distinct intents and no per-deck pages (doc 09).

## Which candidates are most likely to attract the intended audience (judgment)

Ranking by plausibility, all HYPOTHESIS: JSON and HTTP flashcards (broad everyday topics), JSON error-fixing (a daily pain), test design and QA flashcards (a large audience that studies for interviews, per the ISTQB proxy), cron (a common stumble), JSONPath (narrower). SQL is the largest topic but the most contested.

## Repeat-use assumptions (HYPOTHESIS)

Flashcards can bring a learner back on a schedule by design; labs are used when a learner has a new need. Neither claim is measured, and rulebook 7.7 forbids retention gimmicks (streaks, notifications), so return visits would depend on usefulness.

## Consequences for the scores

All demand and repeat-use scores in doc 07 are conservative hypotheses. Risk 14 (unverified demand) stays high until the owner measures it, and the scope was kept small partly for this reason.
