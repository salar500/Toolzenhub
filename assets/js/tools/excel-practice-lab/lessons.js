/* =========================================================
   ToolZen Hub
   Excel Practice Lab: the lessons

   Plain data. An example is { says, cells, formula, at, fill? }: the formula is calculated at `at` on `cells` by the lab's engine
   (an educational simulation, not Microsoft Excel), once when the page is built and again, on request, in the browser, where the
   learner can edit the formula. tests/unit/excel-lessons.test.mjs pins each example's result with a value worked out by hand.
   `practise` lists exercise ids.
========================================================= */

export const lessons = [
    {
        id: "orientation", title: "Workbooks, sheets, cells and formulas", level: "beginner",
        intro: "A spreadsheet is a grid. Each box in the grid is a cell, named by its column letter and row number: B3 is column B, row 3. A file is a workbook and holds one or more sheets. This lab uses one small sheet at a time.",
        points: [
            "A cell holds a value (a number, text, a date) or a formula. A formula always starts with an equals sign. What you see in the cell is the result; the formula itself is shown in the formula bar.",
            "A range is a block of cells written from its first to its last cell: A1:A5 is the five cells in column A, rows 1 to 5.",
            "The power of a spreadsheet is that a formula refers to cells instead of typing numbers, so it recalculates when the data changes. Typing =450*3 works today and goes wrong tomorrow; =B2*B3 keeps working."
        ],
        examples: [
            { says: "A formula can be plain arithmetic.", cells: {}, formula: "=2+3*4", at: "A1" },
            { says: "More usefully it refers to cells. Change the formula or the numbers in your head and see what happens.", cells: { B2: 450, B3: 3 }, formula: "=B2*B3", at: "B4" }
        ],
        mistakes: [
            "Forgetting the = sign, so Excel keeps the text instead of calculating.",
            "Typing a number into a formula that should point to a cell."
        ],
        practise: ["xl-multiply", "xl-precedence", "xl-percent-off"]
    },
    {
        id: "references", title: "Relative, absolute and mixed references", level: "beginner",
        intro: "When you copy a formula to another cell, Excel moves its references by the same distance. That is usually what you want, and sometimes exactly what you do not. A dollar sign pins part of a reference.",
        points: [
            "A relative reference (A1) moves when copied: copied one row down it becomes A2, one column right it becomes B1.",
            "An absolute reference ($A$1) never moves. Use it for a single cell that every row must use, such as a tax rate or an interest rate.",
            "A mixed reference pins only one part: $A1 keeps column A but lets the row move, A$1 keeps row 1 but lets the column move. One formula can then fill a whole table.",
            "Operators work in a set order: brackets, then powers, then multiplication and division, then addition and subtraction. Use brackets to say what you mean."
        ],
        examples: [
            { says: "The rate is pinned with $B$1 and the price moves down. The lab copies the formula from B4 to B6, as dragging the fill handle would.", cells: { B1: 0.18, A4: 100, A5: 250, A6: 80 }, formula: "=A4*$B$1", at: "B4", fill: { down: 2, right: 0 } },
            { says: "Without the dollar signs the rate reference slides down into empty cells, and the tax becomes zero.", cells: { B1: 0.18, A4: 100, A5: 250, A6: 80 }, formula: "=A4*B1", at: "B4", fill: { down: 2, right: 0 } }
        ],
        mistakes: [
            "Copying a formula that refers to a fixed cell without pinning it. The first row looks right and the rest are wrong.",
            "Pinning too much: =$A$1 everywhere, so nothing moves when it should."
        ],
        practise: ["xl-absolute", "xl-mixed", "xl-share"]
    },
    {
        id: "summaries", title: "Summarising numbers", level: "beginner",
        intro: "Most reports start with a total, an average or a count. These functions read a whole range at once.",
        points: [
            "SUM adds, AVERAGE gives the mean, MIN and MAX give the smallest and largest, MEDIAN the middle value. Text and empty cells inside a range are ignored.",
            "COUNT counts cells that hold numbers, COUNTA counts every cell that is not empty, COUNTBLANK counts empty cells.",
            "A function can be used inside another formula: MAX(B2:B7)-MIN(B2:B7) is the spread of the data."
        ],
        examples: [
            { says: "Six monthly sales with one month still empty.", cells: { B2: 12000, B3: 9500, B4: "", B5: 11800, B6: 15750, B7: 10300 }, formula: "=AVERAGE(B2:B7)", at: "B8" },
            { says: "The same range counted three ways.", cells: { A1: 10, A2: "text", A3: "", A4: 30 }, formula: "=COUNT(A1:A4)&\" / \"&COUNTA(A1:A4)&\" / \"&COUNTBLANK(A1:A4)", at: "B1" }
        ],
        mistakes: [
            "A range that stops one row short, such as SUM(B2:B6) when the data runs to B7.",
            "Numbers stored as text, which SUM and AVERAGE skip without warning."
        ],
        practise: ["xl-sum", "xl-average", "xl-max-min", "xl-count-vs-counta", "xl-countblank", "xl-median"]
    },
    {
        id: "numbers", title: "Rounding and whole numbers", level: "beginner",
        intro: "Calculations produce long decimals. Rounding changes the value itself, which is different from changing how a number is displayed.",
        points: [
            "ROUND(x, 2) rounds to two decimals, halves away from zero. ROUNDUP and ROUNDDOWN always go away from or toward zero. A negative second argument rounds to tens, hundreds and so on.",
            "INT drops everything after the decimal point (rounding down), MOD gives the remainder after division, ABS removes a minus sign.",
            "Formatting a cell to show two decimals does not change the number underneath, so totals can differ from the visible values by a small amount. When money must add up exactly, round with ROUND."
        ],
        examples: [
            { says: "Halves round away from zero.", cells: {}, formula: "=ROUND(2.5,0)&\" \"&ROUND(-2.5,0)", at: "A1" },
            { says: "How many full boxes of 12 can 250 items fill, and how many items are left?", cells: { A1: 250, B1: 12 }, formula: "=INT(A1/B1)&\" boxes, \"&MOD(A1,B1)&\" left\"", at: "C1" }
        ],
        mistakes: [
            "Relying on the display format for money instead of rounding the value.",
            "Using ROUND when a count of containers needs ROUNDUP."
        ],
        practise: ["xl-round", "xl-roundup", "xl-mod", "xl-int"]
    },
    {
        id: "decisions", title: "Decisions with IF, AND and OR", level: "intermediate",
        intro: "IF lets a formula choose. It is the basis of most grading, flagging and rule-based calculations.",
        points: [
            "IF(test, value if true, value if false). The test is usually a comparison: =, <>, <, <=, >, >=.",
            "AND(test1, test2) is true only when all tests are true; OR is true when any is; NOT reverses a test. They are used inside IF.",
            "IFS checks several conditions in order and returns the first match, which avoids long nests of IF. Put the most specific condition first.",
            "IFERROR(value, replacement) swaps any error for something else. Use it where an error is expected, not to hide mistakes."
        ],
        examples: [
            { says: "A grade band chosen by marks.", cells: { B2: 72 }, formula: "=IFS(B2>=80,\"A\",B2>=60,\"B\",B2>=40,\"C\",TRUE,\"D\")", at: "C2" },
            { says: "A division that could be by zero.", cells: { B2: 50000, B3: 0 }, formula: "=IFERROR(B2/B3,\"no data\")", at: "B4" }
        ],
        mistakes: [
            "Using > when the boundary value should be included (>=).",
            "Putting the bands in the wrong order, so a broad test hides the narrow ones.",
            "Wrapping everything in IFERROR, which hides real mistakes."
        ],
        practise: ["xl-if", "xl-if-and", "xl-if-or", "xl-ifs", "xl-iferror"]
    },
    {
        id: "conditional", title: "Totals and counts with conditions", level: "intermediate",
        intro: "SUMIF, COUNTIF and their relatives summarise only the rows that meet a condition. They replace filtering and adding by hand.",
        points: [
            "SUMIF(range to test, condition, range to add), COUNTIF(range, condition), AVERAGEIF(range, condition, range to average).",
            "SUMIFS, COUNTIFS, AVERAGEIFS, MAXIFS and MINIFS take several conditions. In SUMIFS the range to add comes first.",
            "A condition is text such as \"North\", \">100\", \"<>0\" or \"S*\". * matches any run of characters and ? matches one character. To compare with a cell, join it: \">\"&E1.",
            "Text matching ignores capitals. SUMPRODUCT multiplies matching cells of several ranges and adds the results."
        ],
        examples: [
            { says: "Amounts for the North region.", cells: { A2: "North", A3: "South", A4: "North", A5: "East", C2: 120, C3: 340, C4: 210, C5: 90 }, formula: "=SUMIF(A2:A5,\"North\",C2:C5)", at: "C7" },
            { says: "How many amounts are above 100?", cells: { C2: 120, C3: 340, C4: 210, C5: 90 }, formula: "=COUNTIF(C2:C5,\">100\")", at: "C7" }
        ],
        mistakes: [
            "Writing the condition without quotes, or a number comparison as plain text.",
            "Ranges of different sizes in the *IFS functions, which gives #VALUE!."
        ],
        practise: ["xl-sumif", "xl-countif", "xl-sumifs", "xl-countifs", "xl-averageif", "xl-wildcard", "xl-sumproduct"]
    },
    {
        id: "text", title: "Working with text", level: "intermediate",
        intro: "Names, codes and addresses are text, and most real spreadsheets are full of it. A few functions cut text apart, join it together and tidy it up.",
        points: [
            "LEFT, RIGHT and MID take characters from the start, end or middle. LEN counts characters, spaces included. FIND and SEARCH give the position of some text (FIND respects capitals, SEARCH does not).",
            "& and CONCAT join text; TEXTJOIN joins a range with a separator and can skip empty cells. SUBSTITUTE replaces text.",
            "UPPER, LOWER and PROPER change capitals; TRIM removes spaces from the ends and repeated spaces inside.",
            "Functions that work on text return text, even if it looks like a number. Convert it back with VALUE."
        ],
        examples: [
            { says: "Pick parts of a product code.", cells: { A1: "ELE-0425" }, formula: "=LEFT(A1,3)&\" / \"&MID(A1,5,4)", at: "B1" },
            { says: "Join names, separated by a comma, skipping the empty cell.", cells: { A1: "Asha", A2: "", A3: "Bilal" }, formula: "=TEXTJOIN(\", \",TRUE,A1:A3)", at: "B1" }
        ],
        mistakes: [
            "Expecting LEFT(A1,3) to be a number when the characters are digits.",
            "Forgetting the space when joining a first and last name."
        ],
        practise: ["xl-left", "xl-mid", "xl-concat", "xl-substitute", "xl-length"]
    },
    {
        id: "dates", title: "Dates", level: "intermediate",
        intro: "Excel stores a date as a number: the count of days since the start of 1900. 1 January 2024 is 45292. The cell's format decides whether you see 45292 or a date.",
        points: [
            "Because a date is a number, you can add days (=B2+30) and subtract dates to get a number of days (DAYS(end, start)).",
            "DATE(year, month, day) builds a date; YEAR, MONTH and DAY take it apart; WEEKDAY gives the day of the week (1 is Sunday unless you choose another type).",
            "EDATE moves a date by whole months, keeping the day when it can. EOMONTH gives the last day of a month. Neither needs you to know how long the month is.",
            "This lab supports dates from 1 March 1900, and does not include TODAY or NOW because their answer changes every day."
        ],
        examples: [
            { says: "The serial number of a date, and what it is two months later.", cells: {}, formula: "=DATE(2024,1,31)&\" -> \"&EDATE(DATE(2024,1,31),1)", at: "A1" },
            { says: "The last day of the month of 20 February 2024 is a leap-year 29 February.", cells: { B2: 45342 }, formula: "=DAY(EOMONTH(B2,0))", at: "B3" }
        ],
        mistakes: [
            "A cell that shows 45292 because it is formatted as a number, not a date.",
            "Dates typed as text, which cannot be used in date arithmetic."
        ],
        practise: ["xl-date-add", "xl-edate", "xl-eomonth", "xl-year-month"]
    },
    {
        id: "lookups", title: "Looking things up", level: "intermediate",
        intro: "A lookup finds a row in a table by a key, such as a product code, and returns another column from that row.",
        points: [
            "VLOOKUP(what, table, column number, FALSE) searches the first column of the table. The last argument matters: FALSE means exact match. TRUE (or leaving it out) assumes sorted data and finds the closest smaller value, which is right for bands and wrong for codes.",
            "INDEX returns the cell at a position; MATCH finds the position of a value in a range. INDEX(result column, MATCH(what, key column, 0)) can look in any direction and survives inserted columns.",
            "XLOOKUP(what, where to look, what to return, if not found) is the modern form. It needs a recent Excel; the older functions work everywhere.",
            "#N/A means nothing was found. The usual causes are a stray space, a number stored as text on one side, a different spelling, or an exact match used where the data is sorted."
        ],
        examples: [
            { says: "An exact price lookup.", cells: { A2: 101, B2: "Pen", C2: 12, A3: 102, B3: "Book", C3: 150, A4: 105, B4: "Bag", C4: 899 }, formula: "=VLOOKUP(102,A2:C4,3,FALSE)", at: "E2" },
            { says: "A code that is not in the list gives #N/A.", cells: { A2: 101, B2: "Pen", C2: 12, A3: 102, B3: "Book", C3: 150 }, formula: "=VLOOKUP(103,A2:C3,3,FALSE)", at: "E2" },
            { says: "Look up to the left with INDEX and MATCH.", cells: { A2: 101, B2: "Pen", A3: 102, B3: "Book", A4: 105, B4: "Bag" }, formula: "=INDEX(A2:A4,MATCH(\"Bag\",B2:B4,0))", at: "E2" }
        ],
        mistakes: [
            "Leaving out the last argument of VLOOKUP and getting the wrong row with no error.",
            "A key that is text in one table and a number in the other.",
            "A column number that no longer matches the right column after columns are inserted."
        ],
        practise: ["xl-vlookup", "xl-index-match", "xl-xlookup", "xl-vlookup-approx"]
    },
    {
        id: "cleaning", title: "Cleaning data", level: "intermediate",
        intro: "Imported and hand-typed data is untidy, and untidy data breaks lookups, counts and totals. Clean first, then calculate.",
        points: [
            "TRIM removes extra spaces, UPPER, LOWER and PROPER make capitals consistent, SUBSTITUTE removes characters, VALUE turns number-like text into a number.",
            "Duplicates: COUNTIF with an expanding range ($A$2:A2) counts how many times a value has appeared so far, so the second and later copies can be flagged.",
            "Standardise categories: clean the value (TRIM and LOWER) and then compare it with the spellings you accept.",
            "Keep the raw data in its own column or sheet and write the cleaned result next to it, so a mistake can be undone and checked."
        ],
        examples: [
            { says: "Spaces and capitals fixed together.", cells: { A2: "  asha   RAO " }, formula: "=PROPER(TRIM(A2))", at: "B2" },
            { says: "The second copy of an address is flagged. The lab copies the formula down.", cells: { A2: "a@x.com", A3: "b@x.com", A4: "a@x.com" }, formula: "=IF(COUNTIF($A$2:A2,A2)>1,\"Duplicate\",\"Unique\")", at: "B2", fill: { down: 2, right: 0 } }
        ],
        mistakes: [
            "Overwriting the raw data so the original cannot be checked.",
            "Counting duplicates over the whole column, which flags the first copy too."
        ],
        practise: ["xl-clean-trim", "xl-clean-value", "xl-clean-duplicates", "xl-clean-standardise"]
    },
    {
        id: "finance", title: "Loans, savings and simple models", level: "advanced",
        intro: "A model is a sheet where the inputs sit in labelled cells and the results are formulas. Changing an input changes every result.",
        points: [
            "PMT(rate per period, number of periods, amount borrowed) gives the payment of a loan with equal instalments. The rate and the periods must use the same unit: for monthly payments divide a yearly rate by 12 and use months.",
            "FV gives the value of regular savings at an assumed rate, PV the amount that a future stream of payments is worth today. Money you pay out is negative and money you receive is positive.",
            "A good model has no typed-in numbers inside formulas. Rates, terms and amounts live in their own cells so that they can be changed and checked.",
            "A model shows what follows from its assumptions. It does not predict returns, and a rate that is assumed is not a rate that will happen."
        ],
        examples: [
            { says: "A monthly instalment of a loan of 5,00,000 over 60 months at 9% a year, shown as a positive number.", cells: { B1: 500000, B2: 0.09, B3: 60 }, formula: "=ROUND(-PMT(B2/12,B3,B1),2)", at: "B4" },
            { says: "Saving 1,000 a month for 12 months at 12% a year (1% a month).", cells: {}, formula: "=ROUND(FV(0.01,12,-1000),2)", at: "A1" }
        ],
        mistakes: [
            "Using a yearly rate with monthly periods.",
            "Forgetting the sign, so a payment comes out negative or a future value looks like a debt."
        ],
        practise: ["xl-pmt", "xl-fv", "xl-project-budget-1", "xl-project-budget-2", "xl-project-budget-3", "xl-project-budget-4", "xl-project-payroll-1", "xl-project-payroll-2"]
    },
    {
        id: "errors", title: "Reading error values", level: "intermediate",
        intro: "An error in a cell is Excel telling you what went wrong. Each code has a small set of usual causes.",
        points: [
            "#DIV/0!: dividing by zero or by an empty cell. #N/A: a lookup found nothing. #VALUE!: the wrong kind of value, such as text where a number is needed. #REF!: a reference to a cell that does not exist. #NAME?: a name Excel does not know, such as a misspelled function. #NUM!: a number that is not valid for the calculation.",
            "Find the cause before hiding it. Check the cells the formula uses, one at a time. IFERROR is for results you expect, such as a division by an empty month.",
            "A circular reference (a formula that depends on its own cell) is a warning in Excel and an error in this lab. Rebuild the formula so that it does not use its own result."
        ],
        examples: [
            { says: "A misspelled function name.", cells: {}, formula: "=SUMM(1,2)", at: "A1" },
            { says: "Text where a number is needed.", cells: { A1: "ten" }, formula: "=A1*2", at: "A2" }
        ],
        mistakes: [
            "Hiding an error with IFERROR before finding out why it appears.",
            "Reading #N/A as 'the formula is wrong' when the data has a stray space."
        ],
        practise: ["xl-fix-na", "xl-fix-div0"]
    },
    {
        id: "beyond", title: "What this lab explains but does not run", level: "intermediate",
        intro: "Real spreadsheets have far more than formulas. These topics matter, but they need Excel itself. This lesson explains them; the lab does not simulate them.",
        points: [
            "Sorting and filtering reorder or hide rows without changing the data. Always keep a header row, and sort the whole table together so that rows stay intact.",
            "Excel Tables (Insert > Table) give a range a name, automatic filters and formulas that use column names. Named ranges give a cell or range a readable name such as TaxRate.",
            "Conditional formatting colours cells by a rule (for example values below zero in red). Data validation limits what can be typed, such as a list of allowed cities or a date range.",
            "PivotTables summarise a table by dragging fields; they replace many SUMIFS formulas and must be refreshed when the data changes. Charts show trends and comparisons; choose the type by the question, and start bar charts at zero.",
            "Newer dynamic array functions (FILTER, SORT, UNIQUE, SEQUENCE, LET, LAMBDA) return several values at once. They need Excel 2021 or Microsoft 365 and are not part of this lab.",
            "TODAY, NOW and RAND are volatile: they change every time the sheet recalculates, so the lab cannot check answers that use them."
        ],
        examples: [],
        mistakes: ["Sorting only one column, which breaks the link between a value and its row."],
        practise: []
    }
];
