/* =========================================================
   ToolZen Hub
   Power BI Practice Lab: the lessons

   Plain data, original text. Every example is run by the lab's own engines when the page is built and again when the learner
   presses Run; lessons.test.mjs pins each result with a value worked out by hand. An example is one of:
     { kind: "query", says, input: { name, table }, tables?, script }       query steps on a table
     { kind: "model", says, tables, script }                               relationships
     { kind: "dax", says, script, target?, helpers?, context?, contextLabel? }   a measure on the Sakhi Stores model
========================================================= */

const T = (columns, rows) => ({ columns, rows });

const RAW_PEOPLE = T(["ID", "Name", "City"], [[1, "  asha  rao", "PUNE"], [2, "Bilal Khan ", "delhi"], [3, "chitra iyer", "Pune"]]);
const RAW_AMOUNTS = T(["OrderID", "Amount"], [[1, "1,200"], [2, "300"], [3, ""], [4, "n/a"]]);
const RAW_FULL = T(["ID", "FullName"], [[1, "Asha Rao"], [2, "Bilal Khan"], [3, "Dev Kumar Singh"]]);
const ORDERS_P = T(["OrderID", "ProductID", "Qty"], [[1, "P3", 2], [2, "P5", 1], [3, "P9", 4]]);
const PRODUCTS_P = T(["ProductID", "Name", "Category"], [["P3", "Rice 5 kg", "Grocery"], ["P5", "Earphones", "Electronics"]]);

const FACT = T(["OrderID", "ProductID", "Amount"], [[1, "P3", 600], [2, "P5", 500], [3, "P3", 300]]);
const DIM = T(["ProductID", "Name", "Category"], [["P3", "Rice 5 kg", "Grocery"], ["P5", "Earphones", "Electronics"], ["P6", "Charger", "Electronics"]]);
const FACT_ORPHAN = T(["OrderID", "ProductID"], [[1, "P3"], [2, "P5"], [3, "P9"]]);

export const lessons = [
    {
        id: "workflow", title: "The Power BI workflow", level: "beginner",
        intro: "Power BI turns raw data into a report in five steps: get the data, prepare it, model it, calculate on it and show it. Knowing which step a problem belongs to is half of fixing it.",
        points: [
            "Get data: connect to a file, a database or a service. This lab uses small tables that are already loaded.",
            "Prepare (Power Query): clean and reshape each table. The steps are recorded and repeat on every refresh.",
            "Model: decide which tables are facts and which are dimensions, and connect them with relationships. The result is called a semantic model.",
            "Calculate (DAX): write measures such as total sales or sales compared with last year.",
            "Report: choose visuals, slicers and a layout that answers the reader's questions. A dashboard is a report page (or several) pinned together to be watched.",
            "In this lab the first four steps are real calculations on small data; the report step is practised with a chart preview and questions. It is not Power BI, and it needs no installation or account."
        ],
        examples: [],
        mistakes: ["Fixing a data problem in a report visual instead of in the query, so it has to be fixed again for every visual.", "Skipping the model and relating nothing, then wondering why a slicer changes nothing."],
        practise: ["pq-trim", "model-one-link"]
    },
    {
        id: "types", title: "Tables, columns and data types", level: "beginner",
        intro: "Every column has a type: text, number, date or true/false. The type decides what you can do: numbers can be summed, dates can be grouped by month, text cannot.",
        points: [
            "Amounts that arrive as text (\"1,200\") cannot be added until they are changed to a number type.",
            "A blank (empty) value is not the same as zero: an average ignores blanks but counts zeros.",
            "A value that cannot be converted becomes an error, and the rows with errors usually need a decision: remove them, or replace the value.",
            "Dates written in different styles must become real dates before they can be grouped by month or compared."
        ],
        examples: [
            { kind: "query", says: "Change Amount to a number. 1,200 becomes 1200, the empty cell stays blank, and n/a becomes an error.", input: { name: "Sales_raw", table: RAW_AMOUNTS }, script: "change type Amount as number" }
        ],
        mistakes: ["Treating a blank as zero.", "Leaving numbers as text and finding that totals are blank or wrong."],
        practise: ["pq-number", "pq-date", "pq-errors"]
    },
    {
        id: "cleaning", title: "Cleaning data with query steps", level: "beginner",
        intro: "Real data is untidy. Cleaning means making equal things look equal: same capitals, no stray spaces, no repeated rows, no missing keys. Each cleaning action is a step you can see and repeat.",
        points: [
            "Trim removes spaces at the ends and doubled spaces; proper, uppercase and lowercase standardise capitals.",
            "Replace corrects a known wrong value. Replace blanks gives missing text a clear label.",
            "Remove duplicates keeps the first of each repeated row. Clean the text first, or rows that differ only by a space survive.",
            "Remove blanks drops rows missing a required key, but check how many you are dropping and why.",
            "Keep the original table untouched and do the cleaning in steps: you can read the steps, change them and run them again.",
            "The same journey appears in the SQL Practice Lab (TRIM, LOWER, GROUP BY) and the Excel Practice Lab (TRIM, PROPER, COUNTIF): keep the raw data, clean the text first, then remove duplicates, then check the counts."
        ],
        examples: [
            { kind: "query", says: "Trim the spaces and standardise capitals in Name and City.", input: { name: "Customers_raw", table: RAW_PEOPLE }, script: "trim Name\nproper Name\nproper City" }
        ],
        mistakes: ["Removing duplicates before cleaning the text.", "Deleting rows to hide a problem without recording why."],
        practise: ["pq-trim", "pq-proper", "pq-dedupe", "pq-blanks", "pq-replace", "pq-replace-blanks", "pq-filter", "pq-dedupe-key", "pq-project-orders", "pq-project-customers"]
    },
    {
        id: "reshaping", title: "Reshaping: split, merge, fill and unpivot", level: "intermediate",
        intro: "Sometimes the shape is wrong, not the values. A column may hold two facts, a label may appear only once for a group, or months may be spread across columns.",
        points: [
            "Split a column at a delimiter into several; merge columns to build one.",
            "Fill down copies a group label into the empty cells below it.",
            "Unpivot turns columns such as Jan, Feb and Mar into rows, so Month becomes a column you can put on a chart axis.",
            "Add a column to calculate a value per row. Anything that must respond to the report's filters belongs in a measure instead.",
            "Group by summarises rows, and the detail is gone. Prefer to keep the detail and let measures summarise."
        ],
        examples: [
            { kind: "query", says: "Split FullName into First and Last. The third name has three parts; the extra part stays in Last.", input: { name: "Customers_raw", table: RAW_FULL }, script: "split FullName by \" \" into First, Last" }
        ],
        mistakes: ["Unpivoting the key columns as well as the value columns.", "Using group by when a measure would keep the detail."],
        practise: ["pq-split", "pq-merge-columns", "pq-fill-down", "pq-add-column", "pq-group", "pq-unpivot", "pq-columns", "pq-sort"]
    },
    {
        id: "combining", title: "Combining tables: append and merge", level: "intermediate",
        intro: "Append stacks tables with the same columns (January under February). Merge adds columns from another table by matching a key, like a lookup or a left join.",
        points: [
            "Append matches columns by name; a column missing from one table is filled with blanks.",
            "Merge queries here is a left join: every row of the first table stays, and a row with no match gets a blank.",
            "A blank after a merge is a warning: the key is missing in the other table, or differs by a space or a type.",
            "Prefer relationships between tables in the model to merging everything into one wide table."
        ],
        examples: [
            { kind: "query", says: "Add Category from Products to each order. Order 3 has product P9, which is not in Products, so its Category is blank.", input: { name: "Orders_raw", table: ORDERS_P }, tables: { Products: PRODUCTS_P }, script: "merge queries Products on ProductID = ProductID add Category" }
        ],
        mistakes: ["Merging on keys that differ in type or spacing.", "Appending tables whose columns are named differently, which creates extra columns."],
        practise: ["pq-append", "pq-merge-queries"]
    },
    {
        id: "star", title: "Fact tables, dimension tables and the star schema", level: "beginner",
        intro: "A fact table records events with numbers, such as one row per order. A dimension table describes the things involved, such as products and customers. A star schema puts one fact table in the middle with dimensions around it.",
        points: [
            "Dimensions are for filtering and grouping; facts are for summarising.",
            "The grain of a fact table is what one row means (one order line, one day). Keep it consistent.",
            "A dimension has a unique key; the fact table holds that key.",
            "Write a relationship from the many side to the one side: Orders[ProductID] -> Products[ProductID].",
            "Microsoft's guidance is to prefer star schemas for Power BI models because filters flow simply and the model stays small and fast."
        ],
        examples: [
            { kind: "model", says: "Connect the fact table to the dimension. The check confirms ProductID is unique in Products.", tables: { Orders: FACT, Products: DIM }, script: "Orders[ProductID] -> Products[ProductID]" }
        ],
        mistakes: ["Putting descriptive text such as category names into the fact table and repeating it on every row.", "Mixing facts and dimensions in one table."],
        practise: ["model-one-link", "model-two-links", "model-star"]
    },
    {
        id: "relationships", title: "Relationships, direction and orphans", level: "intermediate",
        intro: "A relationship lets a filter on one table reach another. The usual kind is one-to-many, and a filter flows from the one side (the dimension) to the many side (the fact table).",
        points: [
            "The one side must hold unique, non-blank keys. If it does not, the relationship cannot be one-to-many.",
            "Both key columns must be the same kind (number or text), or they will never match.",
            "An orphan is a fact row whose key is not in the dimension. It shows up under a blank member in visuals, and totals may look right while categories are wrong.",
            "Only one relationship between two tables can be active. A role-playing dimension, such as order date and ship date, uses one active and one inactive relationship, or two copies of the date table.",
            "A snowflake chains dimensions together. It works, but one merged dimension table is usually simpler."
        ],
        examples: [
            { kind: "model", says: "Order 3 has product P9 that is not in the dimension. The relationship is valid, and the check warns about the orphan.", tables: { Orders: FACT_ORPHAN, Products: DIM }, script: "Orders[ProductID] -> Products[ProductID]" }
        ],
        mistakes: ["Writing the arrow the wrong way round.", "Ignoring orphan warnings."],
        practise: ["model-role-playing", "model-snowflake"]
    },
    {
        id: "dates", title: "The date table", level: "intermediate",
        intro: "A date table has one row for every day, with columns such as year and month. It is related to the fact table's date, and it is what time intelligence relies on.",
        points: [
            "It must cover every day from the first to the last date in the data, with no gaps.",
            "Group and filter by columns of the date table (Year, Month), not by the fact table's date.",
            "Mark it as the date table in Power BI so that time functions work as expected. In this lab the Sakhi Stores date table is already set up.",
            "Dates of the fact table must be real dates, or the relationship will not match."
        ],
        examples: [
            { kind: "dax", says: "The date table has one row per day from 1 January 2022 to 30 June 2024: 912 days.", script: "Days = COUNTROWS(Date)" }
        ],
        mistakes: ["A date table with missing days.", "Using the fact table's date column on an axis and losing months that have no sales."],
        practise: ["model-star", "dax-ytd"]
    },
    {
        id: "measures", title: "Measures and calculated columns", level: "intermediate",
        intro: "A calculated column is computed once per row when the data loads and is stored. A measure is computed when the report asks, for whatever filters are active, and nothing is stored.",
        points: [
            "Use a measure for totals, ratios and anything that must change with slicers.",
            "Use a calculated column for a value that belongs to the row, such as quantity times price, or for grouping and filtering.",
            "A measure is written Name = expression. A measure can use other measures: write [Total Sales].",
            "Columns are written Table[Column]. A column on its own does not give one value in a measure: summarise it, for example SUM(Orders[Amount]).",
            "DIVIDE(a, b) is safer than a / b: it returns blank instead of an error when b is zero."
        ],
        examples: [
            { kind: "dax", says: "A first measure: the sum of all order amounts. Change the context to see it respond.", script: "Total Sales = SUM(Orders[Amount])", contextLabel: "Category = Grocery", context: [{ table: "Products", col: "Category", values: ["Grocery"] }] },
            { kind: "dax", says: "A ratio built from two measures. DIVIDE returns blank when there are no orders.", script: "Average Order Value = DIVIDE(SUM(Orders[Amount]), COUNTROWS(Orders))" }
        ],
        mistakes: ["Dividing with / and getting an error for an empty group.", "Putting a total in a calculated column, where it cannot react to slicers."],
        practise: ["dax-total-sales", "dax-order-count", "dax-customers", "dax-aov", "dax-sumx-related", "dax-size-band"]
    },
    {
        id: "context", title: "Filter context and row context", level: "advanced",
        intro: "Every number in a report is computed in a filter context: the set of rows allowed by the slicers, the visual's rows and columns and the filters. The same measure gives different numbers in different cells because the context is different.",
        points: [
            "Filter context comes from the report (category on rows, a slicer on city) and from CALCULATE.",
            "Row context means \"the current row\". Calculated columns and iterators such as SUMX have it. A plain SUM inside an iterator does not filter by the current row.",
            "Calling a measure inside an iterator turns the current row into a filter. This is called context transition, and CALCULATE does the same.",
            "A filter on a dimension reaches the fact table through the relationship, so a city filter changes the sales."
        ],
        examples: [
            { kind: "dax", says: "The same formula in the context of one city. Only the customers of Pune count.", script: "Total Sales = SUM(Orders[Amount])", contextLabel: "City = Pune", context: [{ table: "Customers", col: "City", values: ["Pune"] }] },
            { kind: "dax", says: "SUMX has a row context for each order and RELATED reads the price from Products.", script: "Computed = SUMX(Orders, Orders[Qty] * RELATED(Products[Price]))" }
        ],
        mistakes: ["Expecting a plain SUM inside AVERAGEX to sum only the current customer.", "Reading Table[Column] as a single value in a measure."],
        practise: ["dax-sumx-related", "dax-avg-customer", "dax-big-orders"]
    },
    {
        id: "calculate", title: "CALCULATE, FILTER and ALL", level: "advanced",
        intro: "CALCULATE changes the filter context and then evaluates an expression. It is the most important function in DAX.",
        points: [
            "CALCULATE(expression, filter1, filter2, ...). A filter such as Products[Category] = \"Grocery\" replaces any filter on that column.",
            "ALL(Table) or ALL(Table[Column]) removes filters, which is how you build a percentage of total.",
            "ALLEXCEPT(Table, Table[Column]) removes all filters on a table except those on the columns listed.",
            "FILTER(table, condition) tests each row and returns the rows that pass. Use it when the condition is more than one column against a value.",
            "A filter on a different column or table is kept, so CALCULATE does not clear everything."
        ],
        examples: [
            { kind: "dax", says: "Electronics sales, whatever category is selected. With Grocery selected the answer is still the Electronics total.", script: "Electronics Sales = CALCULATE(SUM(Orders[Amount]), Products[Category] = \"Electronics\")", contextLabel: "Category = Grocery", context: [{ table: "Products", col: "Category", values: ["Grocery"] }] },
            { kind: "dax", says: "Share of all sales: the sales in the current filter divided by the sales with the product filters removed.", script: "Share = DIVIDE(SUM(Orders[Amount]), CALCULATE(SUM(Orders[Amount]), ALL(Products)))", contextLabel: "Category = Electronics", context: [{ table: "Products", col: "Category", values: ["Electronics"] }] }
        ],
        mistakes: ["Forgetting that a filter on the same column replaces the report's filter.", "Using ALL on the wrong table, so the denominator is not what you intended."],
        practise: ["dax-electronics", "dax-excl-grocery", "dax-percent-total", "dax-big-orders"]
    },
    {
        id: "time", title: "Time intelligence", level: "advanced",
        intro: "Time intelligence functions work on the date table to build running totals and comparisons with earlier periods.",
        points: [
            "TOTALYTD(expression, Date[Date]) accumulates from 1 January to the last visible date.",
            "SAMEPERIODLASTYEAR(Date[Date]) shifts the visible dates back a year; DATEADD shifts by months or years; PREVIOUSMONTH gives the month before.",
            "They need a complete date table related to the facts. Without it the results are wrong or blank.",
            "If the earlier period has no data, the answer is blank, so a growth percentage must be written with DIVIDE.",
            "This lab supports TOTALYTD, DATESYTD, SAMEPERIODLASTYEAR, DATEADD (MONTH, YEAR) and PREVIOUSMONTH. Other time functions are not supported."
        ],
        examples: [
            { kind: "dax", says: "Sales from 1 January 2024 to the end of March: January, February and March added.", script: "Sales YTD = TOTALYTD(SUM(Orders[Amount]), Date[Date])", contextLabel: "Month = 2024-03", context: [{ table: "Date", col: "YearMonth", values: ["2024-03"] }] },
            { kind: "dax", says: "March 2023 sales, for comparison with March 2024.", script: "Last Year = CALCULATE(SUM(Orders[Amount]), SAMEPERIODLASTYEAR(Date[Date]))", contextLabel: "Month = 2024-03", context: [{ table: "Date", col: "YearMonth", values: ["2024-03"] }] }
        ],
        mistakes: ["Using the fact table's date instead of the date table.", "Expecting zero where the answer is blank."],
        practise: ["dax-ytd", "dax-sply", "dax-growth", "dax-check"]
    },
    {
        id: "reporting", title: "Reports: choosing visuals and telling the story", level: "beginner",
        intro: "A report answers questions. Pick the visual that fits the question, keep it honest, and put the most important number first.",
        points: [
            "Compare categories: bars or columns, sorted. Show change over time: a line. Show one key number against a target: a KPI card. Show exact values: a table.",
            "A pie or donut is only readable for a few slices that add up to a whole; bars are easier to compare.",
            "A bar chart's axis should start at zero. A truncated axis makes a small difference look large.",
            "Two different measures on dual axes can suggest a link that is not there; use two charts.",
            "Slicers let the reader choose a period or a region; a few well-chosen ones are better than many.",
            "Use colour to mean something, label clearly, and give the page a title that states the insight, not just the topic.",
            "In this lab, the report preview below draws charts from real measures on the Sakhi Stores data. It does not reproduce the Power BI report canvas, and report design is practised through the flashcard deck."
        ],
        examples: [],
        mistakes: ["Charting everything because it is possible.", "A title that says what the chart is rather than what it shows."],
        practise: []
    }
];
