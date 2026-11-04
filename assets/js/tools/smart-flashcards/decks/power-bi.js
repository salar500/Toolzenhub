/* =========================================================
   ToolZen Hub
   Smart Flashcards deck: Power BI

   Plain data (see learning/content-schema.js). Original questions and explanations, written against Microsoft Learn: "What is
   Power Query?", "Understand star schema and the importance for Power BI" and "DAX overview". Cards about calculated results
   match the behaviour of the Power BI Practice Lab, whose supported subset is stated on the lab page; they make no claim about
   features outside it. Report design and visual choice are taught only through these cards and the lab's lessons.
========================================================= */

export const deck = {
    id: "power-bi",
    version: "1.0.0",
    title: "Power BI",
    description: "The Power BI workflow, Power Query steps, star schemas and relationships, DAX measures and filter context, and choosing honest visuals.",
    reviewed: {
        date: "2026-11-04",
        method: "Written by the author against Microsoft Learn. Not compared with Power BI Desktop. No second reviewer yet."
    },
    topics: [
        { id: "foundations", title: "The workflow" },
        { id: "power-query", title: "Power Query" },
        { id: "modelling", title: "Modelling" },
        { id: "dax", title: "DAX" },
        { id: "reporting", title: "Reports and visuals" },
        { id: "project", title: "Project habits" }
    ],
    cards: [
        {
            id: "pb-workflow", topic: "foundations", kind: "recall", difficulty: "beginner",
            prompt: "What are the five steps of the Power BI workflow?",
            answer: "Get the data, prepare it (Power Query), model it (tables and relationships), calculate (DAX measures), and report (visuals).",
            explanation: "Knowing which step a problem belongs to saves time: a wrong total with duplicate rows is a preparation problem, a slicer that changes nothing is a modelling problem, and a number that is wrong only in some cells is usually a DAX filter problem.",
            source: "Microsoft Learn: What is Power Query?"
        },
        {
            id: "pb-semantic-model", topic: "foundations", kind: "recall", difficulty: "beginner",
            prompt: "What is a semantic model?",
            answer: "The prepared tables, the relationships between them and the measures defined on them, which reports then use.",
            explanation: "Many reports can share one model. Time spent getting the model right (clean tables, a star schema, tested measures) pays back in every report built on it.",
            source: "Microsoft Learn: Understand star schema and the importance for Power BI"
        },
        {
            id: "pb-report-dashboard", topic: "foundations", kind: "choice", difficulty: "beginner",
            prompt: "Which description fits a report best?",
            options: [
                "One or more pages of visuals that readers can filter and explore.",
                "A raw table of data exported from a source system, with no visuals.",
                "A formula that is stored in the model and has no visuals on any page.",
                "A single saved chart with the filters and slicers switched off."
            ],
            correct: 0,
            explanation: "A report has pages of visuals, slicers and filters. A dashboard is a separate idea: tiles from reports pinned together to watch key numbers. The distinction matters when you decide what to build.",
            source: "Microsoft Learn: Power BI documentation"
        },
        {
            id: "pb-pq-repeatable", topic: "power-query", kind: "recall", difficulty: "beginner",
            prompt: "Why are transformations recorded as steps instead of being edited into the data?",
            answer: "The steps are a repeatable recipe: they run again on every refresh, can be read and changed, and the source data is left untouched.",
            explanation: "Cleaning by hand in a spreadsheet has to be repeated for every new export. A query step list repeats itself, so a monthly refresh gives the same clean shape.",
            source: "Microsoft Learn: What is Power Query?"
        },
        {
            id: "pb-blank-zero", topic: "power-query", kind: "choice", difficulty: "beginner",
            prompt: "An Amount column holds 100, a blank and 200. What does AVERAGE give?",
            options: [
                "100, because the blank counts as zero.",
                "150, because the blank is ignored.",
                "300, because AVERAGE adds the values.",
                "An error, because the column has a blank."
            ],
            correct: 1,
            explanation: "An average ignores blanks and divides 300 by 2. A zero would be counted. This is why turning blanks into zeros in a query can change an average and a count.",
            source: "Microsoft Learn: DAX overview"
        },
        {
            id: "pb-type-first", topic: "power-query", kind: "recall", difficulty: "beginner",
            prompt: "Why change a column's type to number or date early in a query?",
            answer: "Only numbers can be summed and only real dates can be grouped by month or used in time intelligence. Text that looks like a number or a date is still text.",
            explanation: "A cell that cannot be converted becomes an error rather than a blank, so check what the type change drops or breaks.",
            source: "Microsoft Learn: What is Power Query?"
        },
        {
            id: "pb-clean-order", topic: "power-query", kind: "choice", difficulty: "intermediate",
            prompt: "Orders repeat with a stray space in the customer code. Which order of steps removes the repeats?",
            options: [
                "Remove duplicates, then trim the customer code.",
                "Remove duplicates twice and skip the trim.",
                "Trim the customer code, then remove duplicates.",
                "Sort the table and leave the spaces in place."
            ],
            correct: 2,
            explanation: "Duplicates are found by exact comparison, so \"C1\" and \"C1 \" are different until the space is removed. Standardise first, then remove duplicates.",
            source: "Microsoft Learn: What is Power Query?"
        },
        {
            id: "pb-append-merge", topic: "power-query", kind: "choice", difficulty: "intermediate",
            prompt: "January and February orders are in two tables with the same columns. Which operation puts them together?",
            options: [
                "Merge queries, which adds new columns by matching a key between tables.",
                "Unpivot, which turns the columns of a table into rows of values.",
                "Group by, which collapses the rows into one total for each group.",
                "Append queries, which stacks the rows of one under the other."
            ],
            correct: 3,
            explanation: "Append stacks tables of the same shape. Merge adds columns from another table, like a lookup. They solve different problems and are often confused.",
            source: "Microsoft Learn: What is Power Query?"
        },
        {
            id: "pb-unpivot", topic: "power-query", kind: "recall", difficulty: "intermediate",
            prompt: "A table has one column per month (Jan, Feb, Mar). What does Unpivot do and why?",
            answer: "It turns the month columns into rows with two columns, Month and Value, so Month can be used on a chart axis and in a relationship to a date table.",
            explanation: "Reports need one fact per row. A wide table with a column for each month is easy to read in a spreadsheet and awkward to model.",
            source: "Microsoft Learn: What is Power Query?"
        },
        {
            id: "pb-fact-dimension", topic: "modelling", kind: "choice", difficulty: "beginner",
            prompt: "Which table is a fact table?",
            options: [
                "Orders, one row for each order line with an amount.",
                "Products, one row for each product with its category.",
                "Customers, one row for each customer with a city.",
                "Date, one row for each calendar day with a year."
            ],
            correct: 0,
            explanation: "A fact table records events and holds numbers to summarise. Dimensions describe the things involved and are used to filter and group. Facts grow with time; dimensions are comparatively small.",
            source: "Microsoft Learn: Understand star schema and the importance for Power BI"
        },
        {
            id: "pb-one-many", topic: "modelling", kind: "recall", difficulty: "beginner",
            prompt: "In a one-to-many relationship, which side is the dimension and in which direction does the filter flow?",
            answer: "The one side is the dimension. A filter flows from the one side to the many side (the fact table).",
            explanation: "A filter on Products[Category] reaches the orders of those products. A filter on the fact table does not flow back to the dimension by default.",
            source: "Microsoft Learn: Understand star schema and the importance for Power BI"
        },
        {
            id: "pb-unique-key", topic: "modelling", kind: "choice", difficulty: "intermediate",
            prompt: "A relationship cannot be made to the one side because a key is repeated. What is the likely cause?",
            options: [
                "The fact table has too many rows for the relationship to be made.",
                "The dimension table has the same key on more than one row.",
                "The date table is missing from the model, so no key can be used.",
                "The measure uses a function that is not allowed in a relationship."
            ],
            correct: 1,
            explanation: "The one side needs unique, non-blank keys. Duplicates usually come from rows that were not de-duplicated or keys that differ only by case or a space. Fix it in the query.",
            source: "Microsoft Learn: Understand star schema and the importance for Power BI"
        },
        {
            id: "pb-orphans", topic: "modelling", kind: "recall", difficulty: "intermediate",
            prompt: "What is an orphan row and how does it show up?",
            answer: "A fact row whose key does not exist in the dimension. Its sales appear under a blank member, so category or product totals do not add up to the grand total.",
            explanation: "Compare a total with the sum of its groups to catch orphans, then find the missing or mistyped keys.",
            source: "Microsoft Learn: Understand star schema and the importance for Power BI"
        },
        {
            id: "pb-key-types", topic: "modelling", kind: "choice", difficulty: "intermediate",
            prompt: "The fact table key is the number 101 and the dimension key is the text \"101\". What happens?",
            options: [
                "Power BI matches them because they look exactly the same on screen.",
                "The relationship is made but is treated as read only in the model.",
                "They never match, because a number and a text are different.",
                "The dimension key is converted when the report is opened by a reader."
            ],
            correct: 2,
            explanation: "Keys must be the same data type. Change one of them in the query so both are numbers or both are text.",
            source: "Microsoft Learn: Understand star schema and the importance for Power BI"
        },
        {
            id: "pb-date-table", topic: "modelling", kind: "recall", difficulty: "intermediate",
            prompt: "What does a date table need so that time intelligence works?",
            answer: "One row for every day with no gaps, from the first to the last date in the data, related to the fact table's date and marked as the date table.",
            explanation: "A date table built only from the days that have sales misses days, and a year-to-date or same-period comparison can then give blank or wrong results.",
            source: "Microsoft Learn: DAX overview"
        },
        {
            id: "pb-role-playing", topic: "modelling", kind: "recall", difficulty: "advanced",
            prompt: "A fact table has an order date and a ship date, both related to the date table. How many relationships can be active?",
            answer: "Only one between the same two tables. The others are inactive and are used only by a measure that asks for them, or you use a second copy of the date table.",
            explanation: "This is called a role-playing dimension. The design choice is between inactive relationships with measures and a date table for each role.",
            source: "Microsoft Learn: Understand star schema and the importance for Power BI"
        },
        {
            id: "pb-measure-column", topic: "dax", kind: "choice", difficulty: "beginner",
            prompt: "What is the main difference between a measure and a calculated column?",
            options: [
                "A measure is stored per row; a column is worked out when asked.",
                "A measure can only add numbers; a column can use any function.",
                "There is no difference; both give the same result in a chart.",
                "A column is computed at load and stored; a measure reacts to filters."
            ],
            correct: 3,
            explanation: "A calculated column is computed once per row and stored in the model. A measure is computed when the report asks, in the filter context of each cell, and stores nothing. Totals and ratios belong in measures.",
            source: "Microsoft Learn: DAX overview"
        },
        {
            id: "pb-divide", topic: "dax", kind: "recall", difficulty: "beginner",
            prompt: "Why use DIVIDE(a, b) instead of a / b?",
            answer: "DIVIDE returns blank, or a value you give, when b is zero or blank. The / operator raises a division error.",
            explanation: "A report cell that is empty for a group with no orders is better than an error that spreads. Choose the alternative result deliberately.",
            source: "Microsoft Learn: DAX overview"
        },
        {
            id: "pb-sum-vs-count", topic: "dax", kind: "choice", difficulty: "beginner",
            prompt: "Which function counts how many different customers placed orders?",
            options: [
                "DISTINCTCOUNT(Orders[CustomerID]), which counts each once.",
                "COUNTROWS(Orders), which counts every order line in the filter.",
                "SUM(Orders[CustomerID]), which adds the customer codes together.",
                "COUNT(Orders[Amount]), which counts the cells that hold numbers."
            ],
            correct: 0,
            explanation: "COUNTROWS counts orders, so a customer with three orders is counted three times. DISTINCTCOUNT counts each distinct customer once.",
            source: "Microsoft Learn: DAX overview"
        },
        {
            id: "pb-filter-context", topic: "dax", kind: "recall", difficulty: "intermediate",
            prompt: "Why does the same measure show a different number in each cell of a report?",
            answer: "Each cell has its own filter context, the rows allowed by the slicers, the row and column fields and any filters. The measure is evaluated again in each.",
            explanation: "A measure has no value of its own until it is placed in a context. This is the idea that most DAX confusion comes from.",
            source: "Microsoft Learn: DAX overview"
        },
        {
            id: "pb-row-context", topic: "dax", kind: "choice", difficulty: "advanced",
            prompt: "Inside an iterator such as SUMX over Customers, what does a plain SUM(Orders[Amount]) return?",
            options: [
                "The sales of the current customer only.",
                "The total of all orders in the current filter context.",
                "Blank, because there is no row context for Orders.",
                "An error, because SUM cannot be used inside SUMX."
            ],
            correct: 1,
            explanation: "A row context does not filter other tables. To get the current customer's sales, call a measure or wrap SUM in CALCULATE, which turns the current row into a filter (context transition).",
            source: "Microsoft Learn: DAX overview"
        },
        {
            id: "pb-calculate", topic: "dax", kind: "recall", difficulty: "intermediate",
            prompt: "What does CALCULATE do, and what happens to an existing filter on the same column?",
            answer: "It changes the filter context and then evaluates an expression. A filter on a column inside CALCULATE replaces the existing filter on that column.",
            explanation: "So CALCULATE(SUM(Orders[Amount]), Products[Category] = \"Grocery\") shows Grocery whatever category the report has selected, while a filter on another column stays.",
            source: "Microsoft Learn: DAX overview"
        },
        {
            id: "pb-all-share", topic: "dax", kind: "choice", difficulty: "advanced",
            prompt: "Which measure gives a category's share of all sales?",
            options: [
                "DIVIDE([Total Sales], [Total Sales]) with nothing else in the formula",
                "DIVIDE([Total Sales], COUNTROWS(Products)) with no filter change at all",
                "DIVIDE([Total Sales], CALCULATE([Total Sales], ALL(Products)))",
                "CALCULATE([Total Sales], Products[Category]) with no value to compare to"
            ],
            correct: 2,
            explanation: "ALL(Products) removes the product filters in the denominator so it holds the sales of everything, while the numerator keeps the selected category. The first option always gives 1.",
            source: "Microsoft Learn: DAX overview"
        },
        {
            id: "pb-ytd-needs", topic: "dax", kind: "recall", difficulty: "advanced",
            prompt: "Why can TOTALYTD give blank or wrong values?",
            answer: "The date table has gaps, is not related to the fact table's date, or the fact table's dates are not real dates.",
            explanation: "Time intelligence functions work by choosing dates from the date table. If the days are missing or not linked, they select nothing.",
            source: "Microsoft Learn: DAX overview"
        },
        {
            id: "pb-var", topic: "dax", kind: "recall", difficulty: "intermediate",
            prompt: "What are VAR and RETURN for?",
            answer: "VAR stores the result of an expression under a name once, and RETURN gives the final expression that uses those names.",
            explanation: "Variables make long measures readable and avoid repeating a calculation. A growth measure can store this year's and last year's sales and then divide the difference by last year's.",
            source: "Microsoft Learn: DAX overview"
        },
        {
            id: "pb-chart-compare", topic: "reporting", kind: "choice", difficulty: "beginner",
            prompt: "You want to compare sales across six product categories. Which visual reads best?",
            options: [
                "A pie chart with six slices of similar size.",
                "A line chart joining the six categories together.",
                "A card showing one number for all of them.",
                "A sorted bar chart with the categories on one axis."
            ],
            correct: 3,
            explanation: "Bars are easy to compare by length. A line suggests a trend between categories that does not exist. A pie is hard to read when slices are close in size.",
            source: "Microsoft Learn: Power BI documentation"
        },
        {
            id: "pb-chart-time", topic: "reporting", kind: "recall", difficulty: "beginner",
            prompt: "Which visual shows how a measure changes over months, and what must the axis be?",
            answer: "A line (or column) chart, with a real date or an ordered month field on the axis.",
            explanation: "A month shown as text sorts alphabetically (April, August, December). Sort by a month number or use a date hierarchy so the order is the calendar's.",
            source: "Microsoft Learn: Power BI documentation"
        },
        {
            id: "pb-kpi", topic: "reporting", kind: "recall", difficulty: "intermediate",
            prompt: "What makes a KPI card useful rather than decorative?",
            answer: "It shows one number that matters, a comparison (a target or last period) and the meaning of the number, so the reader knows whether it is good.",
            explanation: "A bare 6,800 says little. 6,800, up 12 percent on last year, against a target of 6,500, tells the reader what to think.",
            source: "Microsoft Learn: Power BI documentation"
        },
        {
            id: "pb-misleading", topic: "reporting", kind: "choice", difficulty: "intermediate",
            prompt: "A bar chart's axis starts at 95 instead of 0, so a small difference looks large. What is wrong?",
            options: [
                "The truncated axis exaggerates the difference between bars.",
                "The bars are the wrong colour for the kind of data they show.",
                "The chart should have used a pie so that the slices add up.",
                "The data should be sorted alphabetically before it is plotted."
            ],
            correct: 0,
            explanation: "Bar length encodes the value, so a bar chart should start at zero. A line chart can start higher because it shows change, not length.",
            source: "Microsoft Learn: Power BI documentation"
        },
        {
            id: "pb-dual-axis", topic: "reporting", kind: "recall", difficulty: "advanced",
            prompt: "Why can two measures on dual axes mislead?",
            answer: "The two axes can be scaled so the lines cross or move together by choice, which suggests a link that is not in the data.",
            explanation: "Two small charts, aligned on the same time axis, show the same facts without implying anything about cause.",
            source: "Microsoft Learn: Power BI documentation"
        },
        {
            id: "pb-slicers", topic: "reporting", kind: "recall", difficulty: "intermediate",
            prompt: "What is a good rule for slicers on a report page?",
            answer: "Few, relevant and clearly labelled, with the reader's likely questions in mind: a period and one or two ways to cut the data.",
            explanation: "Too many slicers hide what the page is for, and each one adds filter combinations to test.",
            source: "Microsoft Learn: Power BI documentation"
        },
        {
            id: "pb-reconcile", topic: "project", kind: "recall", difficulty: "intermediate",
            prompt: "How do you check that a model and its measures can be trusted?",
            answer: "Reconcile: compare totals with the source, and check that the groups add up to the grand total. A blank group means orphan keys.",
            explanation: "A check measure that must be zero (for example Total Sales minus an independent calculation) catches broken relationships and duplicates before anyone reads the report.",
            source: "Original card"
        },
        {
            id: "pb-keep-source", topic: "project", kind: "choice", difficulty: "beginner",
            prompt: "Where should data cleaning be done in a Power BI project?",
            options: [
                "In each visual, so every chart can be tuned separately.",
                "In the query, so every report and refresh uses clean data.",
                "In the measures, by writing special cases into each formula.",
                "Nowhere, because Power BI cleans data automatically."
            ],
            correct: 1,
            explanation: "Fixing data in a visual or a measure repeats the fix everywhere and hides it. A query step is written once, can be read and runs on every refresh.",
            source: "Original card"
        }
    ]
};
