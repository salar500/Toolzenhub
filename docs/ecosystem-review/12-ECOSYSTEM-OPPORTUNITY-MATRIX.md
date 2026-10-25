# 12. Ecosystem opportunity matrix

Method: the rulebook's own framework (section 12): six dimensions scored 0 to 5 with the stated weights (search 25%, repeat use 25%, usefulness 20%, differentiation 10%, feasibility 10%, trust and performance 10%), the mandatory gates, and a verdict. The 13-criterion list in the review request is **not** used as a second scoring system, to avoid two competing methods (see 14, D7). A weighted total is decision support, not a measurement (12.3).

**Evidence quality for every score below: reasoned hypothesis.** No Search Console export, keyword data, competitor review or usage data was gathered, so search and repeat scores are guesses from general knowledge and the existing catalog. They are conservative and are the place a later audit must test.

## A. Improvements to existing assets (not scored; ranked by value and cost)

| Rank | ID | Change | Class | Value | Cost and risk | Approval |
|---|---|---|---|---|---|---|
| 1 | N2 then N1 | Resolve the cross-section relation, then display related tools on non-calculator pages (pilot one family) | IMPROVE RELATED NAVIGATION | High: 21 tool pages have no next step | Low to medium; a shared component change with baseline diffs | Owner (rulebook 4.8, 11) |
| 2 | C1, N3, I1, T2 | Reciprocal curated relations (SIP/SWP, CAGR/FD, compressor/Photos to PDF, Date Calculator/Date Difference, World Clock/Time Zone Converter, JSON/Text Diff, Unix/JWT) | IMPROVE RELATED NAVIGATION | Medium | Low (catalog data and relationship tests) | Owner, as part of the same phase |
| 3 | C3 and D4 | A written release gate for built-but-unapproved tools (Gratuity, Salary) | process | High risk control | Low | Owner |
| 4 | A3 | Read and audit the 34 article bodies | IMPROVE EXISTING GUIDE | Medium | Medium effort, no code | Owner |
| 5 | U1 | Brand-green text contrast checkpoint | shared UX | Medium | Medium, many baselines | Owner |
| 6 | Docs drift | Update stale status lines in Tool Packs 23 and 26 and the design follow-up for articles 36, 37, 38, 40 | documentation | Low | Trivial | Owner (existing documents, outside this phase's scope) |

## B. Scored candidates

| Rank | Candidate | Section | Decision class | Search | Repeat | Useful | Diff | Feasible | Trust | Weighted /100 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Pomodoro Focus Timer | Time Tools | new tool or mode of Countdown | 4 | 4 | 3 | 1 | 4 | 4 | 70 |
| 2 | International Meeting Planner | Time Tools | new tool | 3 | 3 | 4 | 3 | 3 | 4 | 66 |
| 3 | JSON Schema & JSONPath Lab | Developer Tools | extend JSON Formatter or new tool | 3 | 3 | 4 | 3 | 2 | 4 | 64 |
| 4 | Image Compressor: target size and output format | Image Tools | ENHANCE existing tool | 4 | 2 | 4 | 2 | 3 | 4 | 64 |
| 5 | Debt Snowball vs Avalanche (extends Credit Card Payoff) | Calculators | MODE of existing tool | 2 | 3 | 3 | 3 | 4 | 4 | 59 |
| 6 | Guide: reading JWT exp, iat, nbf | Developer Tools | new guide | 3 | 1 | 3 | 3 | 5 | 5 | 58 |
| 7 | Guide: cron time-zone mistakes | Developer Tools | new guide | 3 | 1 | 3 | 3 | 5 | 5 | 58 |
| 8 | Shift Schedule Planner | Time Tools | new tool | 2 | 3 | 3 | 2 | 3 | 4 | 55 |
| 9 | PDF page numbers / watermark (pdf-lib) | PDF Tools | new tool or mode | 3 | 2 | 3 | 2 | 4 | 3 | 55 |
| 10 | Guide: what a merged PDF keeps and loses | PDF Tools | new guide | 2 | 1 | 3 | 3 | 5 | 5 | 53 |

## Reading the table

- **Ranking is not a recommendation.** Pomodoro scores highest because search and repeat use are guessed high for a commodity, but its differentiation is 1 and a mandatory gate ("only duplicates an existing tool without a real improvement") is unresolved against the Countdown Timer. It cannot be treated as cleared.
- **International Meeting Planner** is the strongest tool candidate on usefulness and differentiation, because it builds on the existing time-zone engine and does a job the Time Zone Converter and World Clock deliberately do not (rulebook R2 text). Its correctness risk (DST, cross-midnight) needs an independent oracle.
- **JSON Schema & JSONPath Lab** needs a validator library chosen by audit (size, licence, maintenance); not researched here.
- **Image Compressor target size** is an ENHANCE of an existing tool, not a new page. It must never promise an exact size.
- **Guides** score low on repeat use by nature; they are cheap and carry little risk. They are not a substitute for N1.
- **Shift Schedule Planner** is lowest confidence; confirm the job before specifying.

## Verdicts (rulebook 12.7 classes)

| Candidate | Verdict | Reason |
|---|---|---|
| International Meeting Planner | B (needs validation) | Owner stated approval; evidence is hypothesis; spec and spike still needed |
| Pomodoro Focus Timer | B | Gate against Countdown unresolved |
| Shift Schedule Planner | B to C | Use case unconfirmed |
| JSON Schema & JSONPath Lab | B | Library audit needed |
| Compressor target size | B | Enhancement; needs a feasibility note on encoder behaviour |
| PDF page numbers / watermark | C | Future opportunity |
| Snowball vs Avalanche | C | Extension of an existing tool; check demand |
| The three guides | B | Candidate guides; demand unknown |

## Deferred and rejected (unchanged by this review)

QR Code Generator: DEFERRED (spec 32). PDF to Images, Blank PDF Page Remover, Document Format Converter, Document Comparison, Duplicate File Finder: DEFERRED. Regex Tester, Currency, Unit Converter, Health tools, ROI, Ratio, Age, Loan Eligibility, Personal Loan, Interest, Password Generator, Inflation, EXIF: excluded by the factory. World Map: no repository record; owner says deferred.

## What would change these scores

Search Console non-branded query data per tool, competitor reviews for the shortlisted tools (rulebook 12.5), a measured Android pass of the file tools, and the owner's usage evidence. Until then the order is provisional.
