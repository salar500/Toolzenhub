# Tool Pack 54: Excel Practice Lab (research and specification)

Status: specification written 2026-11-04 before any code. Owner delegation: master prompt of 2026-11-04 (flagship Practice Labs). Section: Practice Labs (rule 4.10). Not approved by a second reviewer; the lab and its content say so.

## 1. Research report

Sources read for this specification: Microsoft Support, "Excel functions (by category)" (fetched 2026-11-04; it tags functions by the Excel version that introduced them, which decides what is safe to teach as "works in every current Excel") and the behaviour of the functions as documented on Microsoft Support function pages and the OpenFormula/ECMA-376 definitions of the same functions (criteria matching, text comparison, rounding). No competitor exercise or course text was copied; every exercise below is original.

What the research settled:

1. **A beginner needs these first**: what a cell, row, column, sheet and workbook are; typing a number, text and a formula (a formula starts with `=`); reading the result and the formula separately; relative, absolute and mixed references (the single most common source of error when copying a formula); SUM, AVERAGE, MIN, MAX, COUNT; number, percentage and date formatting as display, not value.
2. **An intermediate learner needs**: IF with AND/OR, IFERROR, SUMIF(S), COUNTIF(S), AVERAGEIF, text functions (LEFT, RIGHT, MID, LEN, TRIM, UPPER, LOWER, PROPER, SUBSTITUTE, CONCAT, TEXTJOIN), date functions (DATE, YEAR, MONTH, DAY, EDATE, EOMONTH, WEEKDAY), lookups (VLOOKUP exact match, INDEX with MATCH, XLOOKUP), rounding (ROUND, ROUNDUP, ROUNDDOWN, INT, MOD), and data cleaning.
3. **What repeatedly goes wrong**: copying a formula without `$`; numbers stored as text; trailing spaces that make a lookup fail; VLOOKUP approximate match by default behaviour (the fourth argument); a range that stops one row short; COUNTIF criteria written as text (`">50"`); dates shown as numbers; dividing by zero; typing `=SUM(A1:A5` with a missing bracket; a hard-coded number inside a formula that should be a reference.
4. **Browser feasibility**: spreadsheet evaluation is deterministic and small. A purpose-written evaluator for a documented subset is more reliable, smaller and safer than a general library (see section 7), and it lets every exercise be checked against **changed inputs**, which is how the lab tells a formula that uses references from one that hard-codes the answer.
5. **What cannot be taught by execution here**: pivot tables, charts, conditional formatting, data validation dialogs, named ranges across workbooks, macros, Power Query, volatile functions (TODAY, NOW, RAND) because the answer changes. These are taught in lessons and knowledge checks, labelled "explained, not simulated".

## 2. Target learners

| Learner | Needs |
|---|---|
| Never used a spreadsheet beyond typing | Orientation, references, SUM, formatting, reading errors |
| Uses Excel at work for lists and totals | Conditional totals, lookups, text and date cleanup, avoiding reference mistakes |
| Prepares reports and models | Nested formulas, financial functions (PMT, FV), scenario thinking, auditing errors |

## 3. Learning objectives

After the whole lab a learner can: (a) explain cell, range, sheet and formula; (b) write correct relative, absolute and mixed references and predict what a copied formula becomes; (c) summarise data with aggregate and conditional functions; (d) make decisions with IF, AND, OR and IFERROR; (e) clean text, numbers and dates; (f) look up values with VLOOKUP, INDEX/MATCH and XLOOKUP and explain why a lookup returns #N/A; (g) calculate a loan payment and a future value; (h) diagnose the common error values; (i) build a small budget, sales report, payroll and inventory sheet.

## 4. Curriculum (modules) and concept map

| # | Module | Level | Executable | Concepts |
|---|---|---|---|---|
| 1 | Orientation: workbook, sheet, cell, formula | beginner | explained + first formulas | `=`, cell addresses, values vs formulas |
| 2 | Arithmetic and references | beginner | yes | operators and precedence, relative / absolute / mixed |
| 3 | Summaries | beginner | yes | SUM, AVERAGE, MIN, MAX, COUNT, COUNTA, COUNTBLANK, MEDIAN |
| 4 | Rounding and numbers | beginner | yes | ROUND, ROUNDUP, ROUNDDOWN, INT, MOD, ABS, percentages |
| 5 | Decisions | intermediate | yes | IF, AND, OR, NOT, IFS, IFERROR |
| 6 | Conditional summaries | intermediate | yes | SUMIF(S), COUNTIF(S), AVERAGEIF, SUMPRODUCT, criteria strings and wildcards |
| 7 | Text | intermediate | yes | LEFT, RIGHT, MID, LEN, FIND, SUBSTITUTE, TRIM, UPPER, LOWER, PROPER, CONCAT, TEXTJOIN, `&` |
| 8 | Dates | intermediate | yes (fixed dates only) | DATE, YEAR, MONTH, DAY, EDATE, EOMONTH, WEEKDAY, date arithmetic |
| 9 | Lookups | intermediate | yes | VLOOKUP, HLOOKUP, INDEX, MATCH, XLOOKUP, exact vs approximate |
| 10 | Data cleaning | intermediate | yes | TRIM, numbers stored as text (VALUE), duplicates (COUNTIF), standardising categories |
| 11 | Finance and modelling | advanced | yes | PMT, FV, scenario inputs in cells, no hard-coded numbers |
| 12 | Error auditing | intermediate | yes | #DIV/0!, #N/A, #VALUE!, #REF!, #NAME?, circular reference, how to read them |
| 13 | Explained, not simulated | all | no | sorting and filtering, tables, named ranges, conditional formatting, data validation, pivot tables, charts, dashboards, dynamic arrays (FILTER, SORT, UNIQUE), volatile functions |
| 14 | Projects | advanced | yes | monthly budget, sales report, payroll, inventory, attendance, cleaning and reporting |

Prerequisites: none. Module 1 and 2 are the entry; 3 and 4 follow; 5 to 10 can be taken in order; 11 and 14 need 5 to 9.

## 5. Exercise catalogue (target 44)

Each exercise: a small sheet (values and, where stated, formulas already present), a task ("in B8 enter a formula that shows ..."), a checking method, hints (1 to 3), an explanation of why the answer works and of the common wrong answer.

Checking method (the key design decision): the learner's formula is evaluated by the lab's engine on the sheet **and on a second variant of the same sheet whose input values differ**. The exercise is solved only if the result matches the expected value on both. A hard-coded answer (`=250`) matches the first sheet and fails the second, and the feedback says so. Expected values are computed independently of the engine, by a separate Python implementation in the generator, and recorded in the exercise data.

Planned exercises by module (ids are final once built): M2 six (add two cells, precedence, relative copy result, absolute reference to a rate, mixed reference in a multiplication table, percentage of total); M3 five; M4 four; M5 five; M6 seven; M7 five; M8 four; M9 five; M10 four (TRIM, numbers as text, duplicate flag, standardise category) ; M11 two; M12 three (diagnose by writing the formula that fixes each error); projects: five guided steps in two scenarios.

Difficulty progression is by module order and a `difficulty` field; the exercise list is grouped by module.

## 6. Assessment strategy

* Practice exercises: a verdict (Correct / Not yet / Cannot check), hints, solution view; viewing the solution marks "solution viewed", not completed (existing shared lab rule).
* Knowledge checks: the Excel flashcard deck (one concept per card, wrong-answer explanation).
* Completion is never claimed by a badge; progress is the existing opt-in, on-device store (`tz-learn-v1`) and says only what was completed.
* Independent review: not done. The exercise set and deck state "no second reviewer yet".

## 7. Technical architecture, dependency review

Decision: **a purpose-written evaluator, no library.**

| Option | Formula coverage | Licence / size | Risk | Verdict |
|---|---|---|---|---|
| HyperFormula | very wide | GPL-3.0 or paid commercial licence, about 1 MB | licence incompatible with a closed free site, or paid | rejected |
| SheetJS community | reads and writes files, little calculation | Apache-2.0, large | wrong tool | rejected |
| formula.js / similar | many functions, no grid or parser | MIT, medium | would still need the parser and reference rules; unmaintained branches | not selected |
| Own evaluator | the documented subset only | none added, estimated 30 KB | all behaviour is ours to test | **selected** |

Safety: no `eval`, no `Function`. A tokenizer and a recursive-descent parser produce a syntax tree; a separate evaluator walks it. A formula is limited to 500 characters, nesting to 32 levels, and a range to 2,000 cells; evaluation is synchronous and bounded by those limits, so no worker is needed. Circular references are detected (a cell being evaluated is marked) and give `#CIRCULAR`-style error text as an explanation (Excel shows a warning, not a cell error; the lab says that). Unsupported functions give `#NAME?` plus an explicit "this lab does not support FUNCTION" message, never a wrong value. Text, numbers, booleans, blanks and the errors `#DIV/0!`, `#N/A`, `#VALUE!`, `#REF!`, `#NAME?`, `#NUM!` are values.

Supported grammar: numbers, text in double quotes (`""` escapes a quote), TRUE/FALSE, cell references (`A1`, `$A$1`, `A$1`, `$A1`), ranges (`A1:B5`), operators `+ - * / ^ & = <> < <= > >=` and `%` postfix, unary minus, brackets, function calls with a comma separator. One sheet. Locale: English function names, comma separator, dot decimal (stated on the page).

Supported functions (the "supported list", shown on the page and checked by tests): SUM, AVERAGE, MIN, MAX, COUNT, COUNTA, COUNTBLANK, MEDIAN, PRODUCT, ROUND, ROUNDUP, ROUNDDOWN, INT, MOD, ABS, POWER, SQRT, IF, IFS, AND, OR, NOT, IFERROR, IFNA, ISNUMBER, ISTEXT, ISBLANK, ISERROR, SUMIF, SUMIFS, COUNTIF, COUNTIFS, AVERAGEIF, AVERAGEIFS, SUMPRODUCT, MAXIFS, MINIFS, LEFT, RIGHT, MID, LEN, FIND, SEARCH, SUBSTITUTE, TRIM, UPPER, LOWER, PROPER, CONCAT, CONCATENATE, TEXTJOIN, VALUE, REPT, EXACT, DATE, YEAR, MONTH, DAY, WEEKDAY, EDATE, EOMONTH, DAYS, VLOOKUP, HLOOKUP, INDEX, MATCH, XLOOKUP, CHOOSE, PMT, FV, PV.

Not supported and said so: TODAY, NOW, RAND (volatile), dynamic arrays and spilling (FILTER, SORT, UNIQUE, SEQUENCE, LET, LAMBDA), TEXT format strings, array formulas, structured table references, defined names, other sheets, OFFSET, INDIRECT.

Honest labelling: the lab is "an educational spreadsheet simulation, not Microsoft Excel". Results of the supported subset follow the documented Excel behaviour; edge cases (for example how TEXT formats or locale affect a result) are not claimed.

Performance and memory: sheets are at most 30 rows by 12 columns; evaluation is memoised per recalculation. Mobile: the grid scrolls horizontally inside its own region; the formula bar is a normal labelled input.

## 8. User interface

* A grid (`role="grid"`) with column letters and row numbers, keyboard movement (arrows, Enter, Tab, F2 to edit is not required), a labelled **formula bar** showing the selected cell's address and its formula, and a result line showing the value and its type.
* The learner edits only the cells the exercise unlocks; locked cells are read-only and marked.
* A **References demo** panel: shows what a formula becomes when copied one cell right or down (relative/absolute/mixed) computed by the lab's own reference-shifting function.
* **Error diagnosis**: when a formula gives an error value or cannot be parsed, a plain-language explanation of that error and its common causes is shown.
* The checking panel reuses the shared lab shell (verdict, hints, solution, progress) through the async evaluator contract.

## 9. Privacy, security, accessibility, SEO

No upload, no network, no storage unless the learner turns on the existing opt-in progress. All formula text is rendered with `textContent`. Grid is keyboard-operable, has a text alternative of the selected cell, passes axe at 320, 390, 820 and 1180 px. Page is a normal catalog tool (`excel-practice-lab`) with title, description, canonical, breadcrumb Home > Practice Labs > Excel Practice Lab, related tools (SQL Practice Lab, Smart Flashcards), sitemap entry.

## 10. Testing strategy

Unit: tokenizer, parser (every grammar form and every malformed form), each function with normal, edge and error cases against hand-computed values; reference shifting; circular detection; limits. Contract: every exercise's reference solution evaluates to the independently computed expected value on both variants, and a hard-coded answer is rejected. Browser: the shared lab contract, every solution accepted by the real page, a wrong formula, a hard-coded answer, an error value, keyboard navigation, axe, mobile widths. Static: catalog, ledger, inventory, baselines.

## 11. Implementation plan

1. `assets/js/tools/excel-practice-lab/formula/` : tokenizer, parser, evaluator, functions (pure, no DOM), with tests.
2. Exercise data generated from a Python generator with independent expected values.
3. Grid UI and evaluator adapter for the shared shell.
4. Lessons and the references demo.
5. Excel flashcard deck.
6. Catalog, styles, ledger, inventory, tests, baselines, docs.

## 12. Limitations (shown on the page)

Not Excel; subset of functions; one sheet; English locale; no volatile functions; no charts, pivot tables, tables, named ranges, conditional formatting or macros; the dynamic-array functions are explained only.
