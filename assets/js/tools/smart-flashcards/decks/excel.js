/* =========================================================
   ToolZen Hub
   Smart Flashcards deck: Excel formulas

   Plain data (see learning/content-schema.js). Original questions and explanations, written against the function descriptions
   in Microsoft's documentation ("Excel functions (by category)"). Every card whose answer is a calculated result is listed with
   its formula in tests/unit/flashcards-content.test.mjs and calculated by the Excel Practice Lab's engine, whose functions were
   in turn tested against hand-worked values. The cards describe behaviour the lab supports; they make no claim about Excel
   features outside it.
========================================================= */

export const deck = {
    id: "excel",
    version: "1.0.0",
    title: "Excel formulas",
    description: "Cell references, the everyday functions, conditional totals, text and date handling, lookups, data cleaning, error values and a loan payment.",
    reviewed: {
        date: "2026-11-04",
        method: "Written by the author against Microsoft's function documentation. Calculated answers were checked by the lab's engine and by values worked out separately. Not compared with a copy of Excel. No second reviewer yet."
    },
    topics: [
        { id: "basics", title: "Formulas and references" },
        { id: "summaries", title: "Summaries and rounding" },
        { id: "logic", title: "Decisions and conditions" },
        { id: "text-dates", title: "Text and dates" },
        { id: "lookups", title: "Lookups" },
        { id: "cleaning-errors", title: "Cleaning data and errors" },
        { id: "finance", title: "Finance" }
    ],
    cards: [
        {
            id: "xl-formula-start", topic: "basics", kind: "recall", difficulty: "beginner",
            prompt: "How does a spreadsheet know that what you typed in a cell is a formula and not text?",
            answer: "A formula starts with an equals sign. Without it the cell keeps what you typed as text.",
            explanation: "=B2*B3 is calculated, but B2*B3 is only text. The cell shows the result of the formula; the formula itself is shown in the formula bar.",
            source: "Microsoft Support: Overview of formulas in Excel"
        },
        {
            id: "xl-absolute-reference", topic: "basics", kind: "choice", difficulty: "beginner",
            prompt: "What does the dollar sign do in the reference $B$1?",
            options: [
                "It marks the cell as holding an amount of money in rupees.",
                "It keeps the reference from changing when the formula is copied.",
                "It rounds the value in the cell to two decimal places.",
                "It tells the formula to skip the cell when it adds up."
            ],
            correct: 1,
            explanation: "A dollar sign pins the part of the reference that follows it. $B$1 pins both the column and the row, so copying the formula down or across still refers to B1. Use it for a single cell such as a rate.",
            source: "Microsoft Support: Switch between relative, absolute and mixed references"
        },
        {
            id: "xl-copy-relative", topic: "basics", kind: "choice", difficulty: "beginner",
            prompt: "The formula =A1*B1 is in C1. It is copied to C2. What does the formula in C2 say?",
            options: [
                "=A1*B1, because a copied formula never changes at all.",
                "=A2*B2, because the relative references moved down one row.",
                "=A1*B2, because only the last reference is moved.",
                "=A2*B1, because only the first reference is moved."
            ],
            correct: 1,
            explanation: "Relative references move by the same distance as the formula. One row down changes A1 to A2 and B1 to B2. A reference that must not move needs dollar signs.",
            source: "Microsoft Support: Switch between relative, absolute and mixed references"
        },
        {
            id: "xl-mixed-reference", topic: "basics", kind: "recall", difficulty: "intermediate",
            prompt: "What is the difference between $A1 and A$1 when a formula is copied?",
            answer: "$A1 keeps column A fixed but lets the row change. A$1 keeps row 1 fixed but lets the column change.",
            explanation: "Mixed references let one formula fill a whole table: prices down column A and quantities across row 1 can be combined with =$A2*B$1 copied in both directions.",
            source: "Microsoft Support: Switch between relative, absolute and mixed references"
        },
        {
            id: "xl-order-of-operations", topic: "basics", kind: "choice", difficulty: "beginner",
            prompt: "What does =2+3*4 give?",
            options: ["20", "14", "24", "9"],
            correct: 1,
            explanation: "Multiplication is done before addition, so the result is 2 + 12 = 14. Brackets change the order: =(2+3)*4 gives 20.",
            source: "Microsoft Support: Calculation operators and precedence in Excel"
        },
        {
            id: "xl-count-functions", topic: "summaries", kind: "recall", difficulty: "beginner",
            prompt: "What is the difference between COUNT, COUNTA and COUNTBLANK?",
            answer: "COUNT counts cells that hold numbers. COUNTA counts every cell that is not empty, text included. COUNTBLANK counts the empty cells.",
            explanation: "For a column holding 10, the word text, an empty cell and 30: COUNT is 2, COUNTA is 3 and COUNTBLANK is 1.",
            source: "Microsoft Support: COUNT, COUNTA and COUNTBLANK functions"
        },
        {
            id: "xl-average-ignores", topic: "summaries", kind: "choice", difficulty: "intermediate",
            prompt: "B2:B4 hold 10, an empty cell and 20. What does AVERAGE(B2:B4) return?",
            options: [
                "10, because the empty cell counts as zero.",
                "15, because the empty cell is not counted.",
                "30, because AVERAGE adds the values.",
                "An error, because the range has an empty cell."
            ],
            correct: 1,
            explanation: "AVERAGE ignores empty cells and text inside a range, so it divides 30 by 2. A cell that contains the number 0 would be counted. This is why blank and zero are not the same in a report.",
            source: "Microsoft Support: AVERAGE function"
        },
        {
            id: "xl-round-vs-format", topic: "summaries", kind: "choice", difficulty: "intermediate",
            prompt: "What is the difference between ROUND(B2,2) and formatting a cell to show 2 decimals?",
            options: [
                "There is none: both change the stored number.",
                "ROUND changes the stored number; formatting changes only what is shown.",
                "Formatting changes the stored number; ROUND changes only what is shown.",
                "ROUND works on text and formatting works on numbers."
            ],
            correct: 1,
            explanation: "A format changes how the number is displayed and keeps the full value behind it. ROUND really changes the value, which matters when rounded amounts must add up to a printed total.",
            source: "Microsoft Support: ROUND function"
        },
        {
            id: "xl-round-half", topic: "summaries", kind: "recall", difficulty: "intermediate",
            prompt: "What do =ROUND(2.5,0) and =ROUND(-2.5,0) return?",
            answer: "3 and -3. ROUND rounds halves away from zero.",
            explanation: "ROUNDUP always rounds away from zero and ROUNDDOWN always toward zero. =ROUNDUP(250/12,0) is 21 whole boxes for 250 items that fit 12 to a box.",
            source: "Microsoft Support: ROUND, ROUNDUP and ROUNDDOWN functions"
        },
        {
            id: "xl-mod", topic: "summaries", kind: "recall", difficulty: "intermediate",
            prompt: "What does MOD(250,12) return, and what is it used for?",
            answer: "10. MOD returns the remainder after division: 12 goes into 250 twenty times (240) with 10 left. It is used for leftovers and for cycles.",
            explanation: "MOD(row,2) alternates between 0 and 1, which is a way to shade every second row. MOD(5,0) gives #DIV/0!.",
            source: "Microsoft Support: MOD function"
        },
        {
            id: "xl-if-structure", topic: "logic", kind: "recall", difficulty: "beginner",
            prompt: "What are the three parts of IF?",
            answer: "IF(test, value if true, value if false): a test that is true or false, the result when it is true, and the result when it is false.",
            explanation: "Text results go in double quotes. If the third part is left out and the test is false, IF returns FALSE. A boundary such as 40 marks needs >= in the test to be included.",
            source: "Microsoft Support: IF function"
        },
        {
            id: "xl-and-or", topic: "logic", kind: "choice", difficulty: "intermediate",
            prompt: "A bonus is paid when sales are at least 100000 and complaints are below 3. Which test is right?",
            options: [
                "AND(B2>=100000,C2<3)",
                "OR(B2>=100000,C2<3)",
                "IF(B2>=100000,C2<3)",
                "NOT(B2>=100000,C2<3)"
            ],
            correct: 0,
            explanation: "AND is true only when every condition is true. OR is true when any one is, which would pay a bonus for high sales alone. NOT takes a single condition.",
            source: "Microsoft Support: AND function"
        },
        {
            id: "xl-iferror-caution", topic: "logic", kind: "choice", difficulty: "intermediate",
            prompt: "What is the main risk of wrapping a whole formula in IFERROR?",
            options: [
                "It makes the formula run slower than a macro would.",
                "It stops the formula from being copied to other cells.",
                "It hides real mistakes, because every kind of error is replaced.",
                "It turns every result of the formula into plain text."
            ],
            correct: 2,
            explanation: "IFERROR replaces any error with the value you give, including a wrong cell reference or a misspelled name. Use it where a specific error is expected, and test the cause first when you can, for example IF(B3=0,\"n/a\",B2/B3).",
            source: "Microsoft Support: IFERROR function"
        },
        {
            id: "xl-countif-criteria", topic: "logic", kind: "recall", difficulty: "intermediate",
            prompt: "How do you write the condition 'greater than 100' in COUNTIF, and what do * and ? mean in a condition?",
            answer: "As text: COUNTIF(C2:C7,\">100\"). In a text condition * matches any run of characters and ? matches exactly one character.",
            explanation: "\"S*\" matches every text that starts with S. To compare with a cell, join the operator and the cell: \">\"&E1. The text match ignores capital letters.",
            source: "Microsoft Support: COUNTIF function"
        },
        {
            id: "xl-sumif-order", topic: "logic", kind: "choice", difficulty: "advanced",
            prompt: "Where does the range to add go in SUMIF and in SUMIFS?",
            options: [
                "Last in SUMIF, first in SUMIFS.",
                "First in both functions.",
                "Last in both functions.",
                "First in SUMIF, last in SUMIFS."
            ],
            correct: 0,
            explanation: "SUMIF(range to test, condition, range to add) puts the range to add last, while SUMIFS(range to add, range1, condition1, ...) puts it first so that more pairs can follow. Mixing them up is a common mistake.",
            source: "Microsoft Support: SUMIF and SUMIFS functions"
        },
        {
            id: "xl-text-functions", topic: "text-dates", kind: "recall", difficulty: "beginner",
            prompt: "What do LEFT(A2,3) and MID(A2,5,4) return for A2 = ELE-0425?",
            answer: "ELE for the first three characters, and 0425 for four characters starting at position 5.",
            explanation: "LEFT takes characters from the start, RIGHT from the end and MID from a position. All three return text, even when the characters are digits; VALUE converts the text back to a number.",
            source: "Microsoft Support: LEFT, MID and RIGHT functions"
        },
        {
            id: "xl-trim", topic: "text-dates", kind: "choice", difficulty: "intermediate",
            prompt: "What does TRIM do to the text '  a   b  '?",
            options: [
                "It removes only the spaces at the start of the text.",
                "It removes all spaces, including all of those between words.",
                "It removes the outer spaces and reduces spaces between words to one.",
                "It removes only the spaces at the end of the text."
            ],
            correct: 2,
            explanation: "TRIM removes leading and trailing spaces and collapses repeated spaces inside to a single space, so the result is 'a b'. It is the first step in cleaning imported text.",
            source: "Microsoft Support: TRIM function"
        },
        {
            id: "xl-find-search", topic: "text-dates", kind: "choice", difficulty: "intermediate",
            prompt: "What is the difference between FIND and SEARCH?",
            options: [
                "FIND respects capital letters; SEARCH does not.",
                "SEARCH respects capital letters; FIND does not.",
                "FIND works on numbers; SEARCH works on text.",
                "FIND returns text; SEARCH returns a number."
            ],
            correct: 0,
            explanation: "FIND(\"b\",\"abcB\") is 2 and FIND(\"B\",\"abcB\") is 4, while SEARCH(\"B\",\"abcB\") is 2. Both return #VALUE! when the text is not found.",
            source: "Microsoft Support: FIND and SEARCH functions"
        },
        {
            id: "xl-date-serial", topic: "text-dates", kind: "recall", difficulty: "intermediate",
            prompt: "How does a spreadsheet store a date, and what follows from that?",
            answer: "As a serial number, the count of days since the start of 1900 (1 January 2024 is 45292). So adding 30 to a date gives the date 30 days later.",
            explanation: "A cell shows a number such as 45292 when its format is not a date format. Dates typed as text cannot be used in date arithmetic.",
            source: "Microsoft Support: Date and time functions"
        },
        {
            id: "xl-edate-eomonth", topic: "text-dates", kind: "choice", difficulty: "intermediate",
            prompt: "What does EDATE(DATE(2024,1,31),1) give?",
            options: [
                "2 March 2024, because 31 days are simply added on.",
                "31 February 2024, which Excel then shows as an error.",
                "29 February 2024, the same day clamped to the month's end.",
                "1 February 2024, the first day of the next month."
            ],
            correct: 2,
            explanation: "EDATE moves by whole months and keeps the day when it can. February 2024 has 29 days, so it gives the last day. EOMONTH(date,0) gives the last day of the month without needing to know its length.",
            source: "Microsoft Support: EDATE and EOMONTH functions"
        },
        {
            id: "xl-vlookup-last-argument", topic: "lookups", kind: "choice", difficulty: "intermediate",
            prompt: "In VLOOKUP, what does the last argument decide, and which value finds an exact code in a product list?",
            options: [
                "It decides the column to return; 0 finds an exact code.",
                "It decides the match type; FALSE finds an exact code.",
                "It decides the sort order; TRUE finds an exact code.",
                "It decides the table size; FALSE finds an exact code."
            ],
            correct: 1,
            explanation: "FALSE asks for an exact match. TRUE, or leaving the argument out, assumes the first column is sorted and returns the closest smaller value, which is right for bands and can return a wrong row silently for codes.",
            source: "Microsoft Support: VLOOKUP function"
        },
        {
            id: "xl-vlookup-left", topic: "lookups", kind: "recall", difficulty: "advanced",
            prompt: "VLOOKUP cannot return a value from a column to the left of the key. What can you use instead?",
            answer: "INDEX with MATCH, for example INDEX(A2:A5,MATCH(E2,B2:B5,0)), or XLOOKUP in recent versions.",
            explanation: "MATCH finds the position of the key and INDEX returns the cell at that position from any column. The pair keeps working when columns are inserted, unlike a typed column number.",
            source: "Microsoft Support: INDEX and MATCH functions"
        },
        {
            id: "xl-na-causes", topic: "lookups", kind: "choice", difficulty: "intermediate",
            prompt: "An exact VLOOKUP returns #N/A for a code that looks as if it is in the list. What is the most likely cause?",
            options: [
                "The list has more rows than VLOOKUP is able to search.",
                "The lookup column is the third one in the table range.",
                "The formula was copied from another cell in the sheet.",
                "A stray space or a number stored as text makes them differ."
            ],
            correct: 3,
            explanation: "'B02 ' with a trailing space is a different text from 'B02', and the text '102' is not equal to the number 102. TRIM on the lookup value, or cleaning the list, usually fixes it.",
            source: "Microsoft Support: How to correct a #N/A error"
        },
        {
            id: "xl-xlookup-not-found", topic: "lookups", kind: "recall", difficulty: "advanced",
            prompt: "What are the first four arguments of XLOOKUP?",
            answer: "What to find, where to look, what to return, and what to show if nothing is found.",
            explanation: "XLOOKUP needs no column number, can return from the left of the key and has a built-in not-found result. It needs a recent version of Excel, so older workbooks use VLOOKUP or INDEX with MATCH.",
            source: "Microsoft Support: XLOOKUP function"
        },
        {
            id: "xl-number-as-text", topic: "cleaning-errors", kind: "choice", difficulty: "intermediate",
            prompt: "Imported amounts are stored as text, and SUM of the range returns 0. Why?",
            options: [
                "SUM only works when every number in the range is a whole number.",
                "SUM skips text in a range, even text that looks like a number.",
                "SUM cannot add more than three cells in a single range at once.",
                "SUM needs all of the cells in the range to be sorted first."
            ],
            correct: 1,
            explanation: "Text in a range is skipped. VALUE converts number-like text, and in Excel itself Text to Columns or multiplying by 1 do too. Cleaning data before calculating avoids totals that are silently wrong.",
            source: "Microsoft Support: Convert numbers stored as text to numbers"
        },
        {
            id: "xl-duplicates-countif", topic: "cleaning-errors", kind: "recall", difficulty: "advanced",
            prompt: "How can COUNTIF flag the second and later copies of a value, but not the first?",
            answer: "With an expanding range: =IF(COUNTIF($A$2:A2,A2)>1,\"Duplicate\",\"Unique\"), copied down.",
            explanation: "The range starts at a fixed cell and ends at the current row, so each row counts only the appearances up to itself. Counting the whole column would flag the first copy too.",
            source: "Microsoft Support: COUNTIF function"
        },
        {
            id: "xl-error-values", topic: "cleaning-errors", kind: "choice", difficulty: "intermediate",
            prompt: "Which pairing of an error value and its usual cause is right?",
            options: [
                "#N/A: a division by zero or by an empty cell.",
                "#DIV/0!: a lookup that found nothing to return.",
                "#VALUE!: a number that has too many decimal places.",
                "#NAME?: a function name that is misspelled or not known."
            ],
            correct: 3,
            explanation: "#DIV/0! is division by zero or by an empty cell, #N/A is a lookup that found nothing, #VALUE! is a value of the wrong kind such as text where a number is needed, #REF! is a reference to a cell that does not exist, and #NUM! is a number that is not valid for the calculation.",
            source: "Microsoft Support: Error values in Excel"
        },
        {
            id: "xl-keep-raw", topic: "cleaning-errors", kind: "recall", difficulty: "intermediate",
            prompt: "Why keep the raw data when you clean a column?",
            answer: "So that a mistake in the cleaning can be seen and undone, and the result can be checked against the original.",
            explanation: "Write cleaned values in a new column or sheet, for example =PROPER(TRIM(A2)) in B2. Overwriting the original removes the evidence of what was wrong.",
            source: "Original card"
        },
        {
            id: "xl-pmt-units", topic: "finance", kind: "choice", difficulty: "advanced",
            prompt: "A loan has a yearly rate in B2, a term in months in B3 and an amount in B1. Which formula gives the monthly payment as a positive number?",
            options: [
                "=PMT(B2,B3,B1)",
                "=-PMT(B2/12,B3,B1)",
                "=PMT(B2/12,B3/12,B1)",
                "=-PMT(B2*12,B3,B1)"
            ],
            correct: 1,
            explanation: "The rate and the number of periods must use the same unit: a yearly rate is divided by 12 for monthly payments. PMT returns money paid out as a negative number, so a minus sign shows it as positive.",
            source: "Microsoft Support: PMT function"
        },
        {
            id: "xl-fv-sign", topic: "finance", kind: "recall", difficulty: "advanced",
            prompt: "Why is the payment negative in FV(0.01,12,-1000), and what does the formula give?",
            answer: "Money you pay in is entered as negative. The result is 12,682.50, the value after 12 monthly deposits of 1,000 at 1% a month.",
            explanation: "Spreadsheet finance functions treat money you pay out as negative and money you receive as positive. The result is only what an assumed, fixed rate would give; it is not a forecast.",
            source: "Microsoft Support: FV function"
        },
        {
            id: "xl-no-typed-numbers", topic: "finance", kind: "choice", difficulty: "intermediate",
            prompt: "Why do good models keep rates and amounts in their own cells instead of typing them into formulas?",
            options: [
                "Numbers typed into a formula are not accepted by the spreadsheet.",
                "A formula that contains typed numbers is rejected as an error.",
                "Typed numbers make a workbook calculate noticeably more slowly.",
                "A cell input can be seen, changed once and reused by every formula."
            ],
            correct: 3,
            explanation: "A rate buried inside =B2*0.18 is easy to miss and has to be edited in every formula that uses it. In a labelled cell it is changed once.",
            source: "Original card"
        }
    ]
};
