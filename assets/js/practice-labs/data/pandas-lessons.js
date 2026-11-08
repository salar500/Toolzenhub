/* =========================================================
   ToolZen Hub
   Data Analysis with pandas path: lessons (original to this site; behaviour as in the pandas 2.2 documentation).
   pandas does not run in the page; prediction exercises use outputs recorded by running pandas, and the Python path's
   exercises run real Python for the language itself.
========================================================= */

export const lessons = [
    { id: "pd-intro", title: "DataFrames, Series and first questions", level: "intermediate", prerequisite: "Python Programming (beginner level) and the Statistics path's first lessons.",
        objectives: ["Explain DataFrames and Series", "Load data from CSV", "Inspect shape, types and summaries"],
        intro: "pandas is Python's main library for tabular data. A DataFrame is a table of named columns; each column is a Series of one type (int64, float64, object for text, datetime64). pd.read_csv loads a file; head, shape, dtypes, describe and info answer the first questions about any dataset.",
        blocks: [
            { type: "example", title: "Loading and inspecting", text: "import pandas as pd\norders = pd.read_csv(\"orders.csv\", parse_dates=[\"order_date\"])\norders.head()        # first rows\norders.shape         # (rows, columns)\norders.dtypes        # type of each column\norders.describe()    # count, mean, quartiles of numeric columns" },
            { type: "predict", heading: "Your turn: shape, sums and distinct values", exercise: "pd-p-shape" }
        ],
        why: "pandas is used across data analysis, data engineering, testing of data pipelines and machine learning.",
        analogy: "A DataFrame is a spreadsheet you control with code: every step is written down and repeatable.",
        mistakes: ["Not checking dtypes after loading.", "Looping over rows instead of using column operations.", "Ignoring the index."],
        check: [{ q: "DataFrame versus Series?", a: "A DataFrame is a table; a Series is one column (or one row) of it." }, { q: "Which method summarises numeric columns?", a: "describe()." }],
        summary: "Load data into DataFrames, check shape and dtypes first, and use column operations." },
    { id: "pd-select", title: "Selecting, filtering and sorting", level: "intermediate",
        objectives: ["Select columns and rows", "Filter with boolean masks", "Sort and take the top rows"],
        intro: "orders[\"total\"] selects a column; orders[[\"order\", \"total\"]] several. A comparison produces a boolean mask, and orders[mask] keeps the matching rows; combine masks with & and |, each in brackets. loc selects by labels and iloc by positions. sort_values orders rows and head(n) takes the top n.",
        blocks: [
            { type: "predict", heading: "Your turn: filters", exercise: "pd-p-filter" },
            { type: "predict", heading: "Your turn: a top-n list", exercise: "pd-p-sort-top" }
        ],
        why: "Filtering and sorting answer most everyday questions: which orders, which customers, which days.",
        analogy: "A boolean mask is a stencil laid over the table: only rows under the holes show through.",
        mistakes: ["and / or instead of & / |.", "Missing brackets around each condition.", "Chained indexing that modifies a copy."],
        check: [{ q: "How do you combine two conditions?", a: "(cond1) & (cond2), each in brackets." }, { q: "loc versus iloc?", a: "loc uses labels; iloc uses integer positions." }],
        summary: "Select columns by name, filter rows with bracketed boolean masks and sort with sort_values." },
    { id: "pd-cleaning", title: "Cleaning: missing values, text and types", level: "intermediate",
        objectives: ["Find and handle missing values", "Clean text with the str accessor", "Convert types safely"],
        intro: "Real data has gaps and inconsistencies. isna finds missing values; fillna or dropna handle them, deliberately. The .str accessor applies string methods such as strip, lower and replace to a whole column. Numbers stored as text (object dtype) must be cleaned and converted with astype or pd.to_numeric before arithmetic.",
        blocks: [
            { type: "predict", heading: "Your turn: missing values", exercise: "pd-p-missing" },
            { type: "predict", heading: "Your turn: messy names", exercise: "pd-p-clean-text" },
            { type: "predict", heading: "Your turn: numbers stored as text", exercise: "pd-p-text-numbers" }
        ],
        why: "Cleaning takes most of the time in real analysis, and mistakes here distort every result.",
        analogy: "Cleaning is checking every ingredient before cooking: one bad egg spoils the dish.",
        mistakes: ["fillna(0) without thinking about averages.", "Comparing names before normalising case and spaces.", "Arithmetic on object columns."],
        check: [{ q: "Does mean() include NaN?", a: "No, it skips missing values by default." }, { q: "How do you convert '1,299' to a number?", a: "Remove the comma with str.replace, then astype(int) or pd.to_numeric." }],
        summary: "Find and handle missing values deliberately, normalise text with .str and convert types before calculating." },
    { id: "pd-grouping", title: "Grouping, merging and pivoting", level: "advanced",
        objectives: ["Aggregate with groupby", "Join tables with merge", "Reshape with pivot_table"],
        intro: "groupby splits rows by a key, applies an aggregation (sum, mean, count) and combines the results, like SQL's GROUP BY. merge joins DataFrames on keys like a SQL join (how='left', 'inner', 'outer'). pivot_table builds spreadsheet-style pivots with index, columns, values and an aggregation, with fill_value for empty cells.",
        blocks: [
            { type: "predict", heading: "Your turn: totals per city", exercise: "pd-p-groupby" },
            { type: "predict", heading: "Your turn: a left merge", exercise: "pd-p-merge" },
            { type: "predict", heading: "Your turn: a pivot table", exercise: "pd-p-pivot" }
        ],
        why: "Grouped summaries and joins are the core of reporting, whether in SQL, Excel, Power BI or pandas.",
        analogy: "groupby is sorting receipts into envelopes by city, then adding up each envelope.",
        mistakes: ["Merging on keys with different spellings or types.", "Unexpected row multiplication from duplicate keys.", "Forgetting that groupby sorts keys."],
        check: [{ q: "What does how='left' keep?", a: "Every row of the left table, with NaN where no match exists." }, { q: "What is pivot_table's fill_value for?", a: "Replacing empty combinations, such as with 0." }],
        summary: "Aggregate with groupby, join with merge (checking keys and row counts) and reshape with pivot_table." },
    { id: "pd-dates-reporting", title: "Dates, time series and reporting", level: "advanced",
        objectives: ["Parse dates and use the dt accessor", "Resample time series", "Export results"],
        intro: "pd.to_datetime turns text into dates; the .dt accessor gives year, month, weekday and formatting; subtracting dates gives durations. With a date index, resample('M') groups by month for time series. Results are exported with to_csv or to_excel, and charts are drawn with the plot method (matplotlib) in a notebook.",
        blocks: [
            { type: "predict", heading: "Your turn: dates", exercise: "pd-p-dates" },
            { type: "quiz", questions: [
                { q: "Monthly revenue from daily orders with a date index:", options: ["orders.resample('MS')['total'].sum()", "orders.sum()"], answer: 0, explain: "resample groups by calendar periods; 'MS' labels each month by its start." },
                { q: "Why parse dates when loading (parse_dates)?", options: ["So date operations and sorting work correctly", "To save disk space"], answer: 0, explain: "Text dates sort and compare as text." }
            ] }
        ],
        why: "Trends over time are what most stakeholders ask for first.",
        analogy: "resample is folding a long daily calendar into monthly pages.",
        mistakes: ["Dates left as text.", "Mixing time zones.", "Exporting with the index when it is not wanted (index=False)."],
        check: [{ q: "How do you get the month of a date column?", a: "df['date'].dt.month." }, { q: "What does resample do?", a: "Groups a time series into regular periods such as months." }],
        summary: "Parse dates, use .dt for parts and durations, resample time series and export clean results." }
];

export const interview = {
    howTo: "Answer each question before opening the explanation.",
    description: "8 pandas interview questions with explained answers: DataFrames, filtering, missing values, types, groupby, merge, pivot tables and dates.",
    coding: [],
    quiz: [
        { q: "DataFrame versus Series?", options: ["Table versus single column", "The same"], answer: 0, explain: "Columns are Series." },
        { q: "How to combine filters?", options: ["& and | with brackets", "and / or"], answer: 0, explain: "Element-wise operators." },
        { q: "loc versus iloc?", options: ["Labels versus positions", "The same"], answer: 0, explain: "iloc[0] is the first row." },
        { q: "Does mean skip NaN?", options: ["Yes by default", "No"], answer: 0, explain: "skipna=True." },
        { q: "Why is a numeric column object dtype?", options: ["Values are stored as text", "It is faster"], answer: 0, explain: "Clean and convert." },
        { q: "merge how='left'?", options: ["Keeps all left rows", "Keeps only matches"], answer: 0, explain: "Like LEFT JOIN." },
        { q: "groupby is like?", options: ["SQL GROUP BY", "SQL ORDER BY"], answer: 0, explain: "Split, apply, combine." },
        { q: "How to group daily data by month?", options: ["resample on a date index", "sort_values"], answer: 0, explain: "Time-series grouping." }
    ]
};
