/* =========================================================
   ToolZen Hub
   Statistics and Data Analysis path: lessons (original to this site). Calculations are checked in the browser against
   answers computed from the same data (data/stats.js); Excel function names follow Microsoft's documentation.
========================================================= */

export const lessons = [
    {
        id: "st-data-basics", title: "Data, variables and types", level: "beginner", prerequisite: "None. Basic arithmetic is enough.",
        objectives: ["Describe a dataset as rows and columns", "Tell categorical and numerical variables apart", "Pick summaries that suit each type"],
        intro: "A dataset is a table: each row is one thing observed (an order, a customer, a week) and each column is a variable measured about it. Variables are categorical (a city, a status) or numerical (a price, a count of days). The type decides what you can calculate: you can average prices but not cities.",
        blocks: [
            { type: "example", title: "ShopLite orders, as a dataset", text: "Order    City     Items  Value (₹)  Delivery days\nSL-1001  Pune     2      1299       3\nSL-1002  Delhi    1      499        2\n...\nRows: orders.  Columns: variables.\nCity is categorical; Items, Value and Delivery days are numerical." },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Which variable is categorical?", options: ["Order value", "Payment method (UPI, card, cash on delivery)", "Delivery days"], answer: 1, explain: "Payment method names groups; you count it, you do not average it." },
                { q: "What is a sensible summary of the City column?", options: ["Its mean", "The number of orders per city"], answer: 1, explain: "Count categorical variables by group; average numerical ones." },
                { q: "A rating from 1 to 5 stars is:", options: ["Ordinal: categories with an order", "Purely numerical with equal gaps"], answer: 0, explain: "Ratings have an order, but the gap between 1 and 2 stars need not equal the gap between 4 and 5; medians and counts are safer than means." }
            ] }
        ],
        why: "Every analysis starts by knowing what each column is. Treating codes or categories as numbers gives nonsense results, such as an 'average PIN code'.",
        analogy: "A dataset is a register: one line per visitor (rows), with the same questions asked of each (columns).",
        mistakes: ["Averaging identifiers or codes.", "Mixing units in one column (rupees and thousands).", "Treating ratings as exact measurements."],
        check: [
            { q: "What is one row in an orders dataset?", a: "One order." },
            { q: "Name a numerical and a categorical variable for orders.", a: "For example value (numerical) and city (categorical)." }
        ],
        summary: "Datasets are rows of observations and columns of variables; categorical variables are counted by group, numerical ones can be summed and averaged."
    },
    {
        id: "st-averages", title: "Averages: mean, median and mode", level: "beginner",
        objectives: ["Calculate the mean, median and mode", "Explain how an outlier affects the mean", "Choose the right average"],
        intro: "The mean adds the values and divides by how many there are. The median is the middle value once they are sorted (the average of the two middle values when the count is even). The mode is the most common value. When a few values are extreme, the mean moves towards them and the median does not.",
        blocks: [
            { type: "numeric", heading: "Your turn: calculate", dataset: "orders", exercises: ["st-n-mean-value", "st-n-median-value", "st-n-mode-days"] },
            { type: "quiz", questions: [
                { q: "Which better describes a 'typical' ShopLite order here?", options: ["The mean, ₹1,859", "The median, ₹1,090"], answer: 1, explain: "One ₹8,990 order pulls the mean up; most orders are well below it, and the median shows that." }
            ] }
        ],
        why: "Averages are the most reported numbers in business, and choosing the wrong one misleads: average salaries and house prices are classic examples where the median tells the truer story.",
        analogy: "If a billionaire walks into a café, the mean wealth of the customers soars; the median customer is no richer than before.",
        mistakes: ["Reporting only the mean of skewed data.", "Forgetting to sort before finding the median.", "Using the mode for values that rarely repeat."],
        check: [
            { q: "With an even number of values, how is the median found?", a: "Average the two middle values after sorting." },
            { q: "Which average resists outliers?", a: "The median." }
        ],
        summary: "Mean, median and mode answer different questions; with skewed data or outliers, report the median alongside the mean."
    },
    {
        id: "st-spread", title: "Spread: range and standard deviation", level: "beginner",
        objectives: ["Calculate the range", "Calculate a sample standard deviation", "Explain what spread tells you that an average does not"],
        intro: "Two shops can both deliver in 3 days on average, while one always takes 3 days and the other takes anywhere from 1 to 8. Spread measures that difference. The range is the largest minus the smallest value. The standard deviation measures the typical distance from the mean; for a sample, divide by n − 1, as Excel's STDEV.S does.",
        blocks: [
            { type: "numeric", heading: "Your turn: calculate", dataset: "orders", exercises: ["st-n-range-days", "st-n-stdev-days"] },
            { type: "quiz", questions: [
                { q: "Why divide by n − 1 for a sample?", options: ["A sample's values sit closer to their own mean than to the population's, so n − 1 corrects the underestimate", "It is a typing convention"], answer: 0, explain: "This is Bessel's correction; STDEV.P divides by n when you have the whole population." }
            ] }
        ],
        why: "Customers feel spread more than averages: a delivery that is usually fast but sometimes very late generates complaints. Spread also underpins every statistical test.",
        analogy: "The average is where the darts land on the whole; the spread is how tightly they are grouped.",
        mistakes: ["Reporting an average with no measure of spread.", "Using STDEV.P on a sample.", "Letting one extreme value set the range without saying so."],
        check: [
            { q: "What does a small standard deviation mean?", a: "Values are close to the mean: the process is consistent." },
            { q: "Which Excel function gives a sample standard deviation?", a: "STDEV.S." }
        ],
        summary: "Range and standard deviation describe how much values vary; use the sample standard deviation (n − 1) when your data is a sample."
    },
    {
        id: "st-percentiles", title: "Percentiles, quartiles and outliers", level: "beginner",
        objectives: ["Calculate a percentile", "Calculate the interquartile range", "Flag outliers with the 1.5 × IQR rule"],
        intro: "A percentile is the value below which a given share of the data falls: the 90th percentile of delivery time is the time 90% of orders beat. Quartiles are the 25th, 50th and 75th percentiles. The interquartile range (Q3 − Q1) is the spread of the middle half, and values more than 1.5 × IQR beyond the quartiles are commonly flagged as outliers to investigate.",
        blocks: [
            { type: "numeric", heading: "Your turn: calculate", dataset: "orders", exercises: ["st-n-p90-value", "st-n-iqr-value"] },
            { type: "quiz", questions: [
                { q: "Q1 = 574 and Q3 = 1,850, so the IQR is 1,276. Is the ₹8,990 order an outlier by the 1.5 × IQR rule?", options: ["Yes: it is above Q3 + 1.5 × 1,276 = 3,764", "No"], answer: 0, explain: "Flag it, then investigate: it may be a real bulk order (keep it) or an entry error (fix it)." }
            ] }
        ],
        why: "Service targets are written as percentiles ('95% of pages load in under 2 seconds'), and outlier checks are the first step of cleaning data.",
        analogy: "Percentiles are finishing positions in a race: the 90th percentile runner beat 90% of the field.",
        mistakes: ["Deleting outliers without investigating them.", "Mixing PERCENTILE.INC and PERCENTILE.EXC results.", "Treating a percentile target as an average."],
        check: [
            { q: "What does the 90th percentile of delivery time tell you?", a: "90% of orders arrived within that time." },
            { q: "What should you do with a flagged outlier?", a: "Investigate it: correct it if it is an error, keep it (and report it) if it is real." }
        ],
        summary: "Percentiles and quartiles describe positions in the data; the IQR measures the middle half and the 1.5 × IQR rule flags values to investigate."
    },
    {
        id: "st-grouping", title: "Counting, grouping and pivot summaries", level: "intermediate",
        objectives: ["Count and average by group", "Calculate a percentage of a total", "Read a pivot table"],
        intro: "Most business questions are grouped: orders per city, average value per channel, share of orders above a threshold. In Excel, COUNTIF, SUMIF and AVERAGEIF answer one group at a time, and a pivot table answers them for every group at once. In SQL the same idea is GROUP BY.",
        blocks: [
            { type: "numeric", heading: "Your turn: calculate", dataset: "orders", exercises: ["st-n-count-pune", "st-n-mean-delhi", "st-n-share-free"] },
            { type: "callout", kind: "tip", text: "Small groups are fragile: Delhi's average rests on three orders, one of them very large. Always show the count next to a group's average." }
        ],
        why: "Reports and dashboards are mostly grouped summaries. Getting them right, and showing how many records sit behind each number, is the daily work of an analyst.",
        analogy: "Grouping is sorting the post into pigeonholes before counting each one.",
        mistakes: ["Comparing averages of groups with very different sizes without showing the counts.", "Percentages that do not say what they are a percentage of.", "Off-by-one thresholds: 'above ₹999' versus '₹999 or more'."],
        check: [
            { q: "Which Excel function averages only the rows that meet a condition?", a: "AVERAGEIF (or AVERAGEIFS for several conditions)." },
            { q: "What is the SQL equivalent of a pivot by city?", a: "GROUP BY city with aggregate functions such as COUNT and AVG." }
        ],
        summary: "Group with COUNTIF, AVERAGEIF, pivot tables or GROUP BY; show counts alongside averages and state exactly what each percentage is of."
    },
    {
        id: "st-cleaning", title: "Cleaning data before analysis", level: "intermediate",
        objectives: ["Recognise common data-quality problems", "Order the steps of a cleaning pass", "Document what you changed"],
        intro: "Real data arrives messy: duplicates, blanks, inconsistent spellings ('Bengaluru', 'Bangalore', 'bangalore '), numbers stored as text, impossible values and mixed date formats. Cleaning makes the data fit for analysis, and every change should be recorded so others can trust and repeat it.",
        blocks: [
            { type: "example", title: "A messy extract", text: "Order    City         Value    Date\nSL-2001  Bengaluru    1,299    2026-03-04\nSL-2002  bangalore    499      04/03/2026\nSL-2001  Bengaluru    1,299    2026-03-04   <- duplicate\nSL-2003  Pune         (blank)  2026-03-05\nSL-2004  Pune         -350     2026-03-05   <- impossible value" },
            { type: "order", heading: "Your turn: a cleaning pass", prompt: "Put the steps of a careful cleaning pass in order.", items: ["Keep the raw file unchanged and work on a copy", "Remove exact duplicate rows", "Standardise text values (trim spaces, one spelling per city)", "Convert types: numbers stored as text, one date format", "Investigate blanks and impossible values, and decide per rule", "Record every change and the row counts before and after"], explain: "Protect the original, remove duplicates, standardise, fix types, handle blanks and errors by rule, and document it all." },
            { type: "quiz", questions: [
                { q: "A value is blank. What is the right first step?", options: ["Find out why it is missing before deciding to drop, fill or keep it", "Always fill it with zero"], answer: 0, explain: "Zero is a value; filling blanks with zero silently changes averages and totals." }
            ] }
        ],
        why: "Analysts often spend more time cleaning than analysing, and most wrong reports trace back to dirty data. Power Query exists largely for this work.",
        analogy: "Cleaning data is washing vegetables before cooking: skipped, it spoils everything that follows.",
        mistakes: ["Editing the raw file directly.", "Filling blanks with zero.", "Not recording row counts before and after each step."],
        check: [
            { q: "Why keep the raw file unchanged?", a: "So every cleaning step can be checked, reversed or repeated from the original." },
            { q: "Name three common data-quality problems.", a: "For example duplicates, inconsistent spellings, blanks, numbers stored as text and impossible values." }
        ],
        summary: "Clean on a copy: remove duplicates, standardise text, fix types, handle blanks and impossible values by rule, and document every change with row counts."
    },
    {
        id: "st-correlation", title: "Correlation and simple regression", level: "intermediate",
        objectives: ["Calculate and interpret a correlation coefficient", "Read the slope of a regression line", "Explain why correlation is not causation"],
        intro: "Correlation (Pearson's r, from −1 to +1) measures how closely two numerical variables follow a straight line together. A regression line puts that relationship into an equation: the slope says how much one variable changes, on average, for each unit of the other. Neither shows that one causes the other.",
        blocks: [
            { type: "numeric", heading: "Your turn: calculate", dataset: "ads", exercises: ["st-n-correlation", "st-n-slope"] },
            { type: "quiz", questions: [
                { q: "Ice-cream sales and drowning incidents are strongly correlated. Why?", options: ["Ice cream causes drowning", "Both rise in hot weather: a third variable drives both"], answer: 1, explain: "A confounding variable can create correlation without causation." },
                { q: "Using the slope, what would sales be at ₹60 thousand of ad spend?", options: ["We cannot trust that: spend in the data only ranges from 5 to 20", "Exactly 5.3 × 60 more"], answer: 0, explain: "Extrapolating far beyond the observed range is unreliable." }
            ] }
        ],
        why: "Marketing, pricing and operations questions are relationship questions. Analysts must quantify them and also stop others from reading cause into correlation.",
        analogy: "Correlation says two dancers move together; it does not say which one leads, or whether both follow the music.",
        mistakes: ["Claiming causation from correlation.", "Extrapolating a line far beyond the data.", "Using r for relationships that are clearly curved."],
        check: [
            { q: "What does r = −0.9 mean?", a: "A strong negative straight-line relationship: as one rises, the other tends to fall." },
            { q: "What could make two variables correlate without cause?", a: "A third (confounding) variable, coincidence, or reverse causation." }
        ],
        summary: "Correlation measures straight-line association and the slope quantifies it; neither proves cause, and lines should not be extended far beyond the data."
    },
    {
        id: "st-ab-testing", title: "Samples, A/B tests and significance", level: "advanced",
        objectives: ["Explain sampling and sampling error", "Describe an A/B test", "Interpret a p-value and a confidence interval correctly"],
        intro: "We usually study a sample, not everyone, so results vary by chance. An A/B test shows two versions to randomly chosen groups and compares an outcome, such as conversion rate. A p-value is the probability of seeing a difference at least this large if there were really no difference; a small one suggests the difference is not just chance. A confidence interval gives a range of plausible values for the true difference.",
        blocks: [
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Version B converts 5.2% and version A 5.0%, from 200 visitors each. What is the honest conclusion?", options: ["B is better", "The sample is far too small to tell; the difference could easily be chance"], answer: 1, explain: "With 200 visitors, 5.0% versus 5.2% is a difference of less than one conversion." },
                { q: "p = 0.03 means:", options: ["There is a 3% chance B is not better", "If there were no real difference, a result at least this extreme would occur about 3% of the time"], answer: 1, explain: "The p-value is about the data assuming no effect, not the probability the hypothesis is true." },
                { q: "Why assign visitors to A or B at random?", options: ["So the groups differ only by the version, not by who chose it", "It is cheaper"], answer: 0, explain: "Randomisation removes systematic differences between groups." },
                { q: "The team checks results every hour and stops as soon as p < 0.05. The problem?", options: ["Repeated peeking raises the chance of a false positive", "None"], answer: 0, explain: "Decide the sample size in advance, or use methods designed for sequential testing." }
            ] }
        ],
        why: "Product teams make decisions from experiments every week. Analysts who read significance correctly prevent expensive changes based on noise.",
        analogy: "Tossing a coin ten times and getting six heads does not prove the coin is biased; sampling error is that natural wobble.",
        mistakes: ["Declaring winners from small samples.", "Reading the p-value as the probability the result is true.", "Stopping a test the moment it looks significant."],
        check: [
            { q: "What does a 95% confidence interval for a difference that includes 0 suggest?", a: "The data is consistent with no real difference." },
            { q: "Why fix the sample size before an A/B test?", a: "Stopping when results look good inflates false positives." }
        ],
        summary: "Samples vary by chance; A/B tests compare randomised groups, and p-values and confidence intervals describe how surprising and how precise a difference is, never certainty."
    },
    {
        id: "st-presenting", title: "Choosing charts and presenting findings", level: "advanced",
        objectives: ["Choose a chart for the question", "Avoid misleading charts", "Structure a finding for decision-makers"],
        intro: "A chart should answer one question at a glance. Compare categories with bars, show change over time with lines, show distribution with a histogram or box plot, and show a relationship with a scatter plot. Present findings as answer, evidence and recommendation, with the uncertainty stated.",
        blocks: [
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Monthly revenue over two years:", options: ["Line chart", "Pie chart"], answer: 0, explain: "Lines show trends over time." },
                { q: "Order value distribution, to show the outlier:", options: ["Box plot or histogram", "Line chart"], answer: 0, explain: "Distributions are shown with histograms or box plots." },
                { q: "A bar chart's axis starts at 95 instead of 0, making a 2% difference look huge. What is wrong?", options: ["A truncated axis exaggerates the difference; bars should start at zero", "Nothing"], answer: 0, explain: "Bar lengths encode values, so their baseline must be zero." },
                { q: "Ad spend versus sales by week:", options: ["Scatter plot", "Pie chart"], answer: 0, explain: "Scatter plots show relationships between two numerical variables." },
                { q: "Which opening suits a busy manager?", options: ["'Free delivery above ₹999 lifted average order value by about 12%; we recommend keeping it.'", "A list of every query you ran"], answer: 0, explain: "Lead with the answer, then the evidence and the recommendation." }
            ] }
        ],
        why: "Analysis only matters if someone acts on it. Clear charts and a short, honest story are what get decisions made.",
        analogy: "A good chart is a signpost: you understand it while walking past.",
        mistakes: ["Pie charts with many slices.", "Truncated bar axes.", "Burying the conclusion after the method."],
        check: [
            { q: "Which chart shows a relationship between two numerical variables?", a: "A scatter plot." },
            { q: "What order should a finding follow?", a: "Answer, evidence, recommendation, with the uncertainty stated." }
        ],
        summary: "Match the chart to the question (bars, lines, histograms, scatter plots), keep scales honest and lead with the answer."
    }
];

export const interview = {
    howTo: "Answer each question before opening the explanation. Analyst interviews test judgement as much as formulas, so read the reasoning.",
    description: "10 statistics and data-analysis interview questions with explained answers: averages, spread, outliers, grouping, cleaning, correlation, A/B tests and charts.",
    coding: [],
    quiz: [
        { q: "When is the median better than the mean?", options: ["When the data is skewed or has outliers", "Never"], answer: 0, explain: "The median resists extreme values." },
        { q: "STDEV.S or STDEV.P for a sample of orders?", options: ["STDEV.S", "STDEV.P"], answer: 0, explain: "The sample version divides by n − 1." },
        { q: "How do you flag outliers simply?", options: ["Values beyond 1.5 × IQR from the quartiles", "Any value above the mean"], answer: 0, explain: "Then investigate before removing." },
        { q: "Blanks in a value column: fill with zero?", options: ["Not by default: find out why they are missing first", "Yes, always"], answer: 0, explain: "Zero changes totals and averages." },
        { q: "What is a pivot table?", options: ["A grouped summary of data by one or more fields", "A chart type"], answer: 0, explain: "The spreadsheet equivalent of GROUP BY." },
        { q: "r = 0.95 between spend and sales proves spend causes sales?", options: ["No: correlation does not prove causation", "Yes"], answer: 0, explain: "Confounders and reverse causation are possible." },
        { q: "What is a p-value?", options: ["The probability of a result at least this extreme if there were no real effect", "The probability the hypothesis is true"], answer: 0, explain: "A common interview trap." },
        { q: "Why randomise in an A/B test?", options: ["To make the groups comparable", "To save time"], answer: 0, explain: "Randomisation removes selection bias." },
        { q: "Best chart for a trend over time?", options: ["Line chart", "Pie chart"], answer: 0, explain: "Lines show change over time." },
        { q: "Why show counts next to group averages?", options: ["Small groups give unstable averages", "For decoration"], answer: 0, explain: "Readers need to know how much data stands behind each number." }
    ]
};
