# Tool Pack 55: Power BI Practice Lab (research and specification)

Status: specification, written 2026-11-04 before any code. Implementation follows in the same programme; the record of what was built replaces nothing here, it is added under "Implementation record" at the end.

Research basis (read 2026-11-04, Microsoft Learn): "Understand star schema and the importance for Power BI" (power-bi/guidance/star-schema), "DAX overview" (dax/dax-overview), "What is Power Query?" (power-query/power-query-what-is-power-query). Everything below is written for this site in original words. No course material is copied. The lab is independent of the SQL and Excel research; it reuses only the shared lab shell (`learning/lab-page.js`, `lab-shell.js`), which is infrastructure, not research.

## 1. Learners and outcomes

Target learner: a person in India starting a data or analyst role, or an Excel user moving to Power BI, with no Power BI Desktop installed and no Microsoft account. Prior SQL or Excel helps but is not assumed.

After the lab a learner can: (1) describe the Power BI workflow (get data, prepare, model, calculate, report); (2) clean a raw table with Power Query style steps and explain why each step was needed; (3) classify tables as fact or dimension, choose keys, set one-to-many relationships and explain filter direction; (4) write and read basic DAX measures and explain row context against filter context and what CALCULATE changes; (5) choose a chart for a question, design a KPI card, and spot a misleading visual; (6) carry one dataset from raw file to a report of measures by category and month.

## 2. What is real, what is simulated, what is conceptual

This is the central honesty rule of the lab and is printed on the page.

| Part | Kind | Detail |
|---|---|---|
| Power Query steps | Real calculation of an educational subset | Each step (remove duplicates, trim, change type, replace values, remove blanks, filter rows, split column, merge columns, fill down, rename, group by, append, merge as left join, unpivot) is implemented in plain JavaScript on the learner's table. The result table is real. The step names and settings mirror Power Query's, but the lab does not run M, has no data source connectors and does not claim M compatibility. |
| Model checks | Real calculation | Key uniqueness, relationship cardinality, orphan keys (fact values with no match in the dimension) and ambiguous paths are computed from the data. The diagram is a simple form (choose from, to, direction), not a drag-and-drop canvas. |
| DAX | Real calculation of a subset | A tokenizer, parser and evaluator for a documented subset, with filter context over a small model. No eval. Functions outside the list return an explained "not supported in this lab" message, never a guessed value. |
| Charts | Real drawing of real results | Bar, column and line charts drawn from measure results as accessible SVG with a data table. The lab does not reproduce Power BI visuals, formatting panes or interactions. |
| Report design, KPI choice, storytelling | Conceptual with checked answers | Choice and critique items; there is no report canvas. |
| Power BI Service, gateways, refresh schedules, row-level security, Copilot, Fabric | Not covered, mentioned only as "outside this lab" | |

Nothing here needs Power BI Desktop or a Microsoft account. Optional external activity: a closing page suggests repeating the project in the free Power BI Desktop, clearly marked optional and unchecked.

## 3. DAX subset (supported, verified against the documented behaviour of each function)

Values: numbers, text in double quotes, TRUE/FALSE, BLANK(). Column references `Table[Column]`, measure references `[Measure]`. Operators `+ - * / ^ & = <> < <= > >= && ||` and NOT.
Aggregation: SUM, AVERAGE, MIN, MAX, COUNT, COUNTA, COUNTROWS, DISTINCTCOUNT. Iterators: SUMX, AVERAGEX, MAXX, MINX, COUNTX.
Logic and maths: IF, SWITCH (with TRUE() pattern), AND, OR, NOT, ISBLANK, DIVIDE (with alternate result), ROUND, ABS, COALESCE.
Filter: CALCULATE (boolean column filters, FILTER, ALL, ALLEXCEPT, REMOVEFILTERS, KEEPFILTERS not supported), FILTER, ALL, ALLEXCEPT, VALUES, SELECTEDVALUE.
Relationship: RELATED (many side to one side), RELATEDTABLE not supported.
Variables: VAR ... RETURN.
Time intelligence (needs a marked date table with continuous days): TOTALYTD, DATESYTD, SAMEPERIODLASTYEAR, DATEADD with month/year, PREVIOUSMONTH. Anything else in the family is reported as not supported.
Not supported: user-defined functions, calculation groups, EARLIER (explained conceptually), table constructors beyond what FILTER/VALUES need, DEFINE/EVALUATE queries, visual calculations.

Evaluation model: a measure is evaluated in a filter context (a set of allowed values per column, from the report's rows and slicers and from CALCULATE). The lab shows the context as a table so the learner sees why a number changed. Calculated columns are evaluated per row (row context) at load time.

## 4. Curriculum (13 lessons, original text)

Foundations: (1) The Power BI workflow and what a semantic model is; (2) Tables, columns, data types. Power Query: (3) Cleaning basics (types, trim, blanks, duplicates, replace); (4) Reshaping (split, merge columns, fill down, unpivot); (5) Combining (append and merge) and the repeatable-steps idea. Modelling: (6) Fact and dimension tables, grain; (7) Relationships, cardinality, filter direction, orphans; (8) The date table. DAX: (9) Measures against calculated columns, and implicit against explicit; (10) Filter context and row context; (11) CALCULATE, ALL and FILTER; (12) Time intelligence. Reporting: (13) Choosing visuals, KPI cards, slicers, misleading charts and report layout.

Each lesson: a short explanation, 1 to 3 editable examples that run, common mistakes, and links to exercises. Beginner: 1 to 3, 6 and 13 (first half). Intermediate: 4, 5, 7, 8, 9. Advanced: 10 to 12.

## 5. Exercises and assessment

About 50 exercises in five families, each with objective, instructions, 1 to 3 hints, a worked explanation, source and review record (the shared exercise schema).

- Clean (Power Query): given a raw table and a target, build the step list (order and settings). Checked by comparing the resulting table with the expected table cell by cell, so any valid step list passes. Includes data cleaning on messy customer, order and product tables.
- Model: choose the fact table, the keys and the relationships; repair a broken model (duplicate keys on the "one" side, a text key against a number key, an orphan key). Checked by the model checker against a stated end state.
- DAX: write a measure; the result is compared in several filter contexts (total, by category, by month, with a slicer), so a hard-coded number fails. Includes CALCULATE/ALL percentage of total, distinct customers, year to date, and previous-year comparison.
- Visual: choose a chart or KPI for a question; spot what is misleading in a described chart (truncated axis, pie with many slices, dual axes). Choice items with explanations.
- Project: "Sakhi Stores sales report": a six-stage project from the raw order export to a report page. Stage 1 clean orders; stage 2 clean customers; stage 3 model; stage 4 measures (Total Sales, Orders, Average Order Value, Sales YTD, Sales vs last year); stage 5 verify totals against the raw data; stage 6 build the report summary (chart by category and by month drawn from the learner's own measures, with the stated insight to choose). Each stage is checked on its own and the stages carry forward the learner's own result when they pass.

Verdicts follow the shared lab convention (correct, not yet, cannot check). The lab never shows the expected answer in feedback; it shows what the learner's step list, model or measure produced.

## 6. Data and cross-lab continuity

The datasets are small (up to a few hundred rows), invented, rupee-denominated and shared in spirit with the SQL shop and Excel exercises (the same store theme: products, customers, orders), so the journey raw data, SQL analysis, spreadsheet modelling, Power BI model, report is coherent. Data quality faults are deliberate and listed: leading/trailing spaces, inconsistent capitalisation, duplicate rows, blanks, text numbers, mixed date formats, a misspelt category, and an order with a customer key that does not exist. No real personal data.

## 7. Architecture and dependencies

Pure ES modules under `assets/js/tools/power-bi-practice-lab/`: `pq/engine.js` (steps), `dax/parser.js`, `dax/engine.js`, `model.js`, `datasets.js`, `exercises.js`, `lessons.js`, `evaluator.js`, `charts.js`, `index.js`. No third-party library, no network, no eval, no Function constructor, no storage except the shared opt-in progress. Bundle impact: loaded only on the lab page. Licence: none to track (original code); Microsoft documentation is cited as source, not copied. Limits: tables up to 2,000 rows, formula text 800 characters, nesting 32, at most 40 steps, iterator work capped at 200,000 row visits, so a hostile formula cannot hang the page.

## 8. Security, privacy, accessibility, performance

Everything runs in the page; data typed in stays in the page; nothing is sent. Text from data is always inserted as text. Tables are real `<table>` elements with captions and scope; charts are SVG with a role, a title and a visible data table; every control is labelled; targets are at least 44 px on touch widths; layouts are tested at 320, 390, 820 and 1180 px. Performance: engines are synchronous and small; no worker is needed given the caps.

## 9. Browser limitations and honesty items

Not a Power BI replacement. No M, no connectors, no visual formatting, no Service features. Behaviours that differ from Power BI (for example the lab's own error wording, and the absence of automatic date hierarchies) are stated on the page. The lab was written against Microsoft's documentation and never compared with a running Power BI Desktop; no second reviewer yet. These statements stay visible until an independent review happens.

## 10. Testing strategy

Unit: every Power Query step has hand-worked cases; DAX parser and engine have hand-worked cases for each supported function and for each documented limitation; the model checker is tested on good and broken models; every exercise's stated solution is accepted and a set of wrong attempts (hard-coded numbers, wrong order of steps, wrong filter) is refused. Independent values: expected tables and measure results for the datasets are produced by a separate Python script (pandas not required; plain Python), not by the lab's engines. Browser: shared lab contract, every solution on the real page, lessons run, project stages, axe in several states, layout widths, no console errors, no network requests. Static: catalog, sections, search, sitemap, SEO baselines.

## 11. Maintenance

Add a function by adding it to the engine, the supported-function list on the page, a hand-worked unit test and a lesson or exercise that uses it; the unit test that compares the on-page list with the engine's list fails otherwise. Datasets change only with the generator and the expected values together.

## Implementation record

(Appended when built.)
