# 00. Verified baseline, method and limits

Universal Ecosystem Expansion, Master Prompt 1 of 3 (research, requirements, prioritization, architecture). Written 2026-10-31. **Nothing here is a rule, a build queue or an approval.** The rulebook is `docs/product-decision-rules.md`. This phase changed no application code, no baseline and no catalog.

## How this relates to earlier research

`docs/ecosystem-review/` already holds numbered research for the whole site (00 to 17, older) and per-ecosystem packages (calculators, time-tools, developer-tools, image-pdf-tools, practice-labs, ui-ux-design-system). This package **builds on them and does not repeat them**. Where an earlier document is now out of date (for example `02-PENDING-AND-DEFERRED-INVENTORY.md` still lists Meeting Planner, Pomodoro and Shift Planner as unbuilt, and they are published) this package says so. The Practice Labs decisions of 2026-10-28 (`practice-labs/18-CONSOLIDATED-OWNER-APPROVAL.md`) are binding history and are cited, not re-decided.

## Verified repository state (this session)

| Fact | Value | Evidence class |
|---|---|---|
| Branch / HEAD | `main` / `650aa44`, one commit ahead of `origin/main` (`4716c48`); working tree clean | verified (git) |
| Latest preview checkpoint | `4716c48` on GitHub Pages, workflow run 41169733577 succeeded, 107 sitemap routes returned 200 (earlier phase, recorded in the UI/UX ledger) | verified in an earlier phase; not re-run |
| Published tools | 54 = Calculators 19, Time Tools 13, Developer Tools 17, Image Tools 2, PDF Tools 3 | verified (catalog dump) |
| Learning experiences | 5, all inside Developer Tools: Smart Flashcards, JSON Error-Fixing Lab, JSONPath Challenge Lab, Cron Challenge Lab, Test Design Lab | verified |
| Coming-soon calculators | 11: personal-loan, loan-eligibility, interest, bmi, calorie, bmr, roi, ratio, age, unit-converter, currency | verified |
| Articles | 34 published, 6 coming-soon (not shown on the Articles page, not in the sitemap) | verified |
| Sections / routes | 5 sections; Calculators route to `/calculators/<id>/`, the other four to `/tools/<id>/` (`pathPrefix`) | verified |
| Production | not touched; `toolzenhub.in` not requested | verified |

## What was done and not done

Done: rulebook read (sections 1 to 15), repository and catalog inspection, CSS and JS reading, built-HTML inspection (`dist`, `dist-ghpages`), asset inspection, five public searches, HTTP timing of the live preview, static analysis of the module and stylesheet graph.

**NOT RUN, with the reason:** every in-browser check (rendered focus ring, screenshots of cards, Lighthouse, long-task traces, real-device date pickers). Free memory was about 436 MB with other Chrome processes belonging to the owner running, and rulebook 10.3 says not to exhaust local RAM. These are listed as Phase 2 or checkpoint tasks, never reported as passed.

## Evidence classes (rulebook 12.4)

**verified data** (a measurement or an observation in this repository or on the live preview), **public evidence** (a cited public page; here the five searches, all secondary sources), **reasoned hypothesis**, **unknown**. No search volume, traffic, retention or market figure exists in the repository or was found, and none is invented. Every demand and repeat-use score in doc 03 is a hypothesis.

## Public sources consulted (2026-10-31, search results, not primary documents unless stated)

- Gratuity and the Code on Social Security 2020: factohr, omnihr, Lakshmikumaran and Sridharan (`employmentlaw.lkslaw.com/gratuity-guide-2025`), Bhatt and Joshi, courtkutchehry. **They conflict** on whether the Code's central rules are in force from 21 November 2025. No Gazette notification was retrieved.
- Adobe Acrobat online tools (`adobe.com/acrobat/online`, `helpx.adobe.com` PDF Pack help): merge (500-page limit stated), split, organize pages, compress, export, convert, crop, delete pages.
- Date inputs: web-platform-dx feature explorer (Baseline widely available since 2023-10-26), WebKit bug 119175, adactio.com (min/max behaviour disputed). MDN was not returned by the search.
- sql.js: README statements (SQLite compiled to WebAssembly, MIT licence, in-memory database, worker build). Download size not found.
- Risk-reward formulas: Groww, TradeZella, Liberated Stock Trader, hakaru, TradingView open scripts.
- Playwright: its README describes a Node.js library; a GitHub issue explains tests run in Node and actions in the browser.
- GitHub Pages headers: a hosting-tools page and a 2013 Stack Overflow answer say the 600-second cache header cannot be changed. **Not confirmed in GitHub's own documentation.** Measured on the live preview: `Cache-Control: max-age=600`.
- SQLBolt and W3Schools structure: third-party descriptions only.

## Limits of this package

The Phase 1 prompt was received in two parts and the first part was cut off inside section G; the continuation supplied sections G to I. This package follows both. Competitor workflow was not tested hands-on; claims about competitors are only what the cited pages state about themselves.
