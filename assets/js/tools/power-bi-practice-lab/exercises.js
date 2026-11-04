/* =========================================================
   ToolZen Hub
   Power BI Practice Lab: the exercises

   Plain data. Query exercises give an input table (and other tables to append or merge) and the expected result of the learner's
   steps; model exercises give tables and the expected relationships; DAX exercises give a target measure, provided helper
   measures and the expected value in several filter contexts. The expected values were calculated by a separate Python script,
   not by the lab's engines.
========================================================= */

export const set = {
    "id": "power-bi-practice",
    "version": "1.0.0",
    "title": "Power BI Practice Lab",
    "description": "43 exercises on cleaning data with query steps, building a star-schema model and writing DAX measures, with a six-part project, checked by an educational simulation in your browser.",
    "reviewed": {
        "date": "2026-11-04",
        "method": "Written by the author against Microsoft Learn. Expected values were calculated in Python, independently of the lab's engines, and the engines were tested against hand-worked values. Not compared with Power BI Desktop. No second reviewer yet."
    },
    "exercises": [
        {
            "id": "pq-trim",
            "topic": "power-query",
            "title": "Remove stray spaces",
            "difficulty": "beginner",
            "objective": "Use trim to clean text that has extra spaces.",
            "instructions": "The Name column has spaces at the start, at the end and doubled in the middle. Write the step that cleans it.",
            "hints": [
                "Steps are written one per line. The step for spaces is called trim.",
                "Give the column name after it: trim Name",
                "Look at each name in the table: spaces can be at the start, at the end and between the words."
            ],
            "explanation": "trim removes spaces at the start and end and reduces runs of spaces inside to one, as Power Query's Trim and Clean steps do for typical data. Stray spaces make two identical names look different, so a lookup or a relationship would fail to match them.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "trim Name",
            "input": {
                "name": "Customers_raw",
                "table": {
                    "columns": [
                        "ID",
                        "Name"
                    ],
                    "rows": [
                        [
                            1,
                            "  Asha Rao"
                        ],
                        [
                            2,
                            "Bilal  Khan "
                        ],
                        [
                            3,
                            "Chitra Iyer  "
                        ],
                        [
                            4,
                            "Dev Kumar"
                        ]
                    ]
                }
            },
            "tables": {},
            "expected": {
                "columns": [
                    "ID",
                    "Name"
                ],
                "rows": [
                    [
                        1,
                        "Asha Rao"
                    ],
                    [
                        2,
                        "Bilal Khan"
                    ],
                    [
                        3,
                        "Chitra Iyer"
                    ],
                    [
                        4,
                        "Dev Kumar"
                    ]
                ]
            },
            "ordered": false
        },
        {
            "id": "pq-proper",
            "topic": "power-query",
            "title": "Fix capital letters",
            "difficulty": "beginner",
            "objective": "Use proper to standardise capitals in a text column.",
            "instructions": "City is typed in every style. Make each city start with a capital letter and continue in lower case.",
            "hints": [
                "The step is called proper.",
                "proper City"
            ],
            "explanation": "proper makes the first letter of each word a capital and the rest lower case. Standardising text before grouping matters: PUNE, Pune and pune are three different groups until they are made the same.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "proper City",
            "input": {
                "name": "Customers_raw",
                "table": {
                    "columns": [
                        "ID",
                        "City"
                    ],
                    "rows": [
                        [
                            1,
                            "PUNE"
                        ],
                        [
                            2,
                            "delhi"
                        ],
                        [
                            3,
                            "Chennai"
                        ],
                        [
                            4,
                            "mUMBAI"
                        ]
                    ]
                }
            },
            "tables": {},
            "expected": {
                "columns": [
                    "ID",
                    "City"
                ],
                "rows": [
                    [
                        1,
                        "Pune"
                    ],
                    [
                        2,
                        "Delhi"
                    ],
                    [
                        3,
                        "Chennai"
                    ],
                    [
                        4,
                        "Mumbai"
                    ]
                ]
            },
            "ordered": false
        },
        {
            "id": "pq-number",
            "topic": "power-query",
            "title": "Text to number",
            "difficulty": "beginner",
            "objective": "Change a column that holds text to the number type.",
            "instructions": "Amount was imported as text, with a thousands comma in one value and an empty cell. Change its type to number.",
            "hints": [
                "The step is: change type <column> as number",
                "change type Amount as number"
            ],
            "explanation": "Until the type is a number, Amount cannot be summed or averaged. The comma is accepted as a thousands separator and the empty cell becomes blank (null) rather than zero: a blank is not the same as a zero, and the difference matters in averages.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "change type Amount as number",
            "input": {
                "name": "Sales_raw",
                "table": {
                    "columns": [
                        "ID",
                        "Amount"
                    ],
                    "rows": [
                        [
                            1,
                            "1,250"
                        ],
                        [
                            2,
                            "300"
                        ],
                        [
                            3,
                            "45.5"
                        ],
                        [
                            4,
                            ""
                        ]
                    ]
                }
            },
            "tables": {},
            "expected": {
                "columns": [
                    "ID",
                    "Amount"
                ],
                "rows": [
                    [
                        1,
                        1250
                    ],
                    [
                        2,
                        300
                    ],
                    [
                        3,
                        45.5
                    ],
                    [
                        4,
                        null
                    ]
                ]
            },
            "ordered": false
        },
        {
            "id": "pq-dedupe",
            "topic": "power-query",
            "title": "Remove repeated rows",
            "difficulty": "beginner",
            "objective": "Remove duplicate rows from an export.",
            "instructions": "The export repeated some orders. Keep one row for each distinct order, the first one.",
            "hints": [
                "The step is remove duplicates.",
                "With no column named it compares the whole row."
            ],
            "explanation": "remove duplicates keeps the first row of each distinct combination and drops the rest. Left in, repeated orders would be counted twice in a total.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "remove duplicates",
            "input": {
                "name": "Orders_raw",
                "table": {
                    "columns": [
                        "OrderID",
                        "CustomerID",
                        "Amount"
                    ],
                    "rows": [
                        [
                            1001,
                            "C1",
                            500
                        ],
                        [
                            1002,
                            "C2",
                            300
                        ],
                        [
                            1001,
                            "C1",
                            500
                        ],
                        [
                            1003,
                            "C1",
                            200
                        ],
                        [
                            1002,
                            "C2",
                            300
                        ]
                    ]
                }
            },
            "tables": {},
            "expected": {
                "columns": [
                    "OrderID",
                    "CustomerID",
                    "Amount"
                ],
                "rows": [
                    [
                        1001,
                        "C1",
                        500
                    ],
                    [
                        1002,
                        "C2",
                        300
                    ],
                    [
                        1003,
                        "C1",
                        200
                    ]
                ]
            },
            "ordered": false
        },
        {
            "id": "pq-blanks",
            "topic": "power-query",
            "title": "Drop rows with a missing key",
            "difficulty": "beginner",
            "objective": "Remove rows where a required column is blank.",
            "instructions": "Orders without a CustomerID cannot be linked to a customer. Remove them.",
            "hints": [
                "The step is remove blanks, then the column.",
                "remove blanks CustomerID"
            ],
            "explanation": "remove blanks drops the rows where that column is empty. An empty text and a missing value both count as blank here. Whether to drop or repair such rows is a business decision: dropping them changes the totals.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "remove blanks CustomerID",
            "input": {
                "name": "Orders_raw",
                "table": {
                    "columns": [
                        "OrderID",
                        "CustomerID",
                        "Amount"
                    ],
                    "rows": [
                        [
                            1,
                            "C1",
                            100
                        ],
                        [
                            2,
                            "",
                            250
                        ],
                        [
                            3,
                            null,
                            75
                        ],
                        [
                            4,
                            "C2",
                            60
                        ]
                    ]
                }
            },
            "tables": {},
            "expected": {
                "columns": [
                    "OrderID",
                    "CustomerID",
                    "Amount"
                ],
                "rows": [
                    [
                        1,
                        "C1",
                        100
                    ],
                    [
                        4,
                        "C2",
                        60
                    ]
                ]
            },
            "ordered": false
        },
        {
            "id": "pq-replace",
            "topic": "power-query",
            "title": "Correct misspelt values",
            "difficulty": "beginner",
            "objective": "Use replace to correct values that are spelt wrongly.",
            "instructions": "Category has two misspellings: Electronic and Grocry. Correct both, with one step each.",
            "hints": [
                "replace <column> \"find\" \"with\" — text is in double quotes.",
                "Two lines, one for each misspelling."
            ],
            "explanation": "replace changes a cell only when it equals the whole text you ask for, which is how Replace Values behaves when you do not tick the whole-cell option off. Fix typos at the source of the query, so every refresh repeats the fix.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "replace Category \"Electronic\" \"Electronics\"\nreplace Category \"Grocry\" \"Grocery\"",
            "input": {
                "name": "Products_raw",
                "table": {
                    "columns": [
                        "ID",
                        "Category"
                    ],
                    "rows": [
                        [
                            1,
                            "Electronic"
                        ],
                        [
                            2,
                            "Grocry"
                        ],
                        [
                            3,
                            "Grocery"
                        ],
                        [
                            4,
                            "Electronics"
                        ],
                        [
                            5,
                            "Stationery"
                        ]
                    ]
                }
            },
            "tables": {},
            "expected": {
                "columns": [
                    "ID",
                    "Category"
                ],
                "rows": [
                    [
                        1,
                        "Electronics"
                    ],
                    [
                        2,
                        "Grocery"
                    ],
                    [
                        3,
                        "Grocery"
                    ],
                    [
                        4,
                        "Electronics"
                    ],
                    [
                        5,
                        "Stationery"
                    ]
                ]
            },
            "ordered": false
        },
        {
            "id": "pq-replace-blanks",
            "topic": "power-query",
            "title": "Label missing values",
            "difficulty": "beginner",
            "objective": "Fill blanks with a clear label instead of leaving them empty.",
            "instructions": "Some customers have no City. Show them as Unknown.",
            "hints": [
                "replace blanks <column> \"with\"",
                "replace blanks City \"Unknown\""
            ],
            "explanation": "Replacing blanks with a visible label keeps those rows in a chart or a slicer instead of leaving a mysterious empty group. Use a label only for text; for numbers, a blank is usually better than a made-up zero.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "replace blanks City \"Unknown\"",
            "input": {
                "name": "Customers_raw",
                "table": {
                    "columns": [
                        "ID",
                        "City"
                    ],
                    "rows": [
                        [
                            1,
                            "Pune"
                        ],
                        [
                            2,
                            ""
                        ],
                        [
                            3,
                            null
                        ],
                        [
                            4,
                            "Delhi"
                        ]
                    ]
                }
            },
            "tables": {},
            "expected": {
                "columns": [
                    "ID",
                    "City"
                ],
                "rows": [
                    [
                        1,
                        "Pune"
                    ],
                    [
                        2,
                        "Unknown"
                    ],
                    [
                        3,
                        "Unknown"
                    ],
                    [
                        4,
                        "Delhi"
                    ]
                ]
            },
            "ordered": false
        },
        {
            "id": "pq-filter",
            "topic": "power-query",
            "title": "Keep valid rows",
            "difficulty": "beginner",
            "objective": "Filter rows with a condition.",
            "instructions": "Quantity should always be at least 1. Keep only the rows that are.",
            "hints": [
                "The step is filter <column> <operator> <value>.",
                "filter Quantity >= 1"
            ],
            "explanation": "A filter keeps the rows that satisfy the condition. Filtering out bad rows in the query, rather than hiding them in a report, means every visual and measure sees the same clean data.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "filter Quantity >= 1",
            "input": {
                "name": "Orders_raw",
                "table": {
                    "columns": [
                        "OrderID",
                        "Quantity"
                    ],
                    "rows": [
                        [
                            1,
                            2
                        ],
                        [
                            2,
                            0
                        ],
                        [
                            3,
                            5
                        ],
                        [
                            4,
                            -1
                        ],
                        [
                            5,
                            3
                        ]
                    ]
                }
            },
            "tables": {},
            "expected": {
                "columns": [
                    "OrderID",
                    "Quantity"
                ],
                "rows": [
                    [
                        1,
                        2
                    ],
                    [
                        3,
                        5
                    ],
                    [
                        5,
                        3
                    ]
                ]
            },
            "ordered": false
        },
        {
            "id": "pq-split",
            "topic": "power-query",
            "title": "Split a column",
            "difficulty": "intermediate",
            "objective": "Split one column into two with a delimiter.",
            "instructions": "FullName holds first and last name. Split it at the space into First and Last. A name with more than two parts keeps the rest in Last.",
            "hints": [
                "split <column> by \"delimiter\" into <name>, <name>",
                "split FullName by \" \" into First, Last"
            ],
            "explanation": "Splitting at a delimiter turns one overloaded column into separate ones. When there are more parts than new columns, the extra text stays together in the last column, so no part of a name is lost.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "split FullName by \" \" into First, Last",
            "input": {
                "name": "Customers_raw",
                "table": {
                    "columns": [
                        "ID",
                        "FullName"
                    ],
                    "rows": [
                        [
                            1,
                            "Asha Rao"
                        ],
                        [
                            2,
                            "Bilal Khan"
                        ],
                        [
                            3,
                            "Chitra Iyer"
                        ],
                        [
                            4,
                            "Dev Kumar Singh"
                        ]
                    ]
                }
            },
            "tables": {},
            "expected": {
                "columns": [
                    "ID",
                    "First",
                    "Last"
                ],
                "rows": [
                    [
                        1,
                        "Asha",
                        "Rao"
                    ],
                    [
                        2,
                        "Bilal",
                        "Khan"
                    ],
                    [
                        3,
                        "Chitra",
                        "Iyer"
                    ],
                    [
                        4,
                        "Dev",
                        "Kumar Singh"
                    ]
                ]
            },
            "ordered": false
        },
        {
            "id": "pq-merge-columns",
            "topic": "power-query",
            "title": "Merge two columns",
            "difficulty": "intermediate",
            "objective": "Combine two text columns into one.",
            "instructions": "Join First and Last into a column called FullName, separated by a space. The two original columns are removed by the merge.",
            "hints": [
                "merge <column>, <column> with \"separator\" as <name>",
                "merge First, Last with \" \" as FullName"
            ],
            "explanation": "Merge Columns replaces the chosen columns with one new column that joins their text. The new column is added at the end of the table.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "merge First, Last with \" \" as FullName",
            "input": {
                "name": "Customers_raw",
                "table": {
                    "columns": [
                        "ID",
                        "First",
                        "Last"
                    ],
                    "rows": [
                        [
                            1,
                            "Asha",
                            "Rao"
                        ],
                        [
                            2,
                            "Bilal",
                            "Khan"
                        ],
                        [
                            3,
                            "Chitra",
                            "Iyer"
                        ]
                    ]
                }
            },
            "tables": {},
            "expected": {
                "columns": [
                    "ID",
                    "FullName"
                ],
                "rows": [
                    [
                        1,
                        "Asha Rao"
                    ],
                    [
                        2,
                        "Bilal Khan"
                    ],
                    [
                        3,
                        "Chitra Iyer"
                    ]
                ]
            },
            "ordered": false
        },
        {
            "id": "pq-fill-down",
            "topic": "power-query",
            "title": "Fill down",
            "difficulty": "intermediate",
            "objective": "Fill a group label that appears only on the first row of its group.",
            "instructions": "Region is written once at the top of each group and left empty below. Fill it down so every row has its region.",
            "hints": [
                "The step is fill down <column>.",
                "fill down Region"
            ],
            "explanation": "Reports exported from spreadsheets often show a group label once. Fill Down copies the last non-empty value into the empty cells beneath it. The first row must have a value, or there is nothing to copy.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "fill down Region",
            "input": {
                "name": "Stores_raw",
                "table": {
                    "columns": [
                        "Store",
                        "Region"
                    ],
                    "rows": [
                        [
                            "S1",
                            "North"
                        ],
                        [
                            "S2",
                            null
                        ],
                        [
                            "S3",
                            null
                        ],
                        [
                            "S4",
                            "South"
                        ],
                        [
                            "S5",
                            null
                        ]
                    ]
                }
            },
            "tables": {},
            "expected": {
                "columns": [
                    "Store",
                    "Region"
                ],
                "rows": [
                    [
                        "S1",
                        "North"
                    ],
                    [
                        "S2",
                        "North"
                    ],
                    [
                        "S3",
                        "North"
                    ],
                    [
                        "S4",
                        "South"
                    ],
                    [
                        "S5",
                        "South"
                    ]
                ]
            },
            "ordered": false
        },
        {
            "id": "pq-date",
            "topic": "power-query",
            "title": "Dates in three styles",
            "difficulty": "intermediate",
            "objective": "Convert mixed date formats into real dates.",
            "instructions": "OrderDate was typed in three styles, with the day first in the slashed one (7 March 2024). Change its type to date.",
            "hints": [
                "change type <column> as date",
                "change type OrderDate as date"
            ],
            "explanation": "A real date column sorts, groups by month and works with time intelligence; text does not. The lab reads dates written as 2024-03-08, 07/03/2024 (day first) and 9-Mar-2024 and shows them as YYYY-MM-DD. In Power BI the result depends on the locale you set, which is why ambiguous slashed dates need care.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "change type OrderDate as date",
            "input": {
                "name": "Orders_raw",
                "table": {
                    "columns": [
                        "OrderID",
                        "OrderDate"
                    ],
                    "rows": [
                        [
                            1,
                            "07/03/2024"
                        ],
                        [
                            2,
                            "2024-03-08"
                        ],
                        [
                            3,
                            "9-Mar-2024"
                        ]
                    ]
                }
            },
            "tables": {},
            "expected": {
                "columns": [
                    "OrderID",
                    "OrderDate"
                ],
                "rows": [
                    [
                        1,
                        "2024-03-07"
                    ],
                    [
                        2,
                        "2024-03-08"
                    ],
                    [
                        3,
                        "2024-03-09"
                    ]
                ]
            },
            "ordered": false
        },
        {
            "id": "pq-add-column",
            "topic": "power-query",
            "title": "Add a calculated column",
            "difficulty": "intermediate",
            "objective": "Add a column that multiplies two others.",
            "instructions": "Add a column called Total that is Qty times Price.",
            "hints": [
                "add column <name> = <column> <operator> <column>",
                "add column Total = Qty * Price"
            ],
            "explanation": "A custom column in Power Query is computed once per row when the data is loaded. Spaces around the operator are needed in this lab. Totals that depend on the report's filters belong in a measure, not here.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "add column Total = Qty * Price",
            "input": {
                "name": "Orders_raw",
                "table": {
                    "columns": [
                        "OrderID",
                        "Qty",
                        "Price"
                    ],
                    "rows": [
                        [
                            1,
                            3,
                            40
                        ],
                        [
                            2,
                            5,
                            10
                        ],
                        [
                            3,
                            2,
                            300
                        ]
                    ]
                }
            },
            "tables": {},
            "expected": {
                "columns": [
                    "OrderID",
                    "Qty",
                    "Price",
                    "Total"
                ],
                "rows": [
                    [
                        1,
                        3,
                        40,
                        120
                    ],
                    [
                        2,
                        5,
                        10,
                        50
                    ],
                    [
                        3,
                        2,
                        300,
                        600
                    ]
                ]
            },
            "ordered": false
        },
        {
            "id": "pq-group",
            "topic": "power-query",
            "title": "Summarise with group by",
            "difficulty": "intermediate",
            "objective": "Group rows and add up a column.",
            "instructions": "Summarise Amount by Category into a table with the columns Category and Sales, in the order each category first appears.",
            "hints": [
                "group by <column> sum <column> as <name>",
                "group by Category sum Amount as Sales"
            ],
            "explanation": "Group By collapses many rows into one per group. The result is a new, smaller table, so details are gone. Usually it is better to keep the detail and let measures summarise, unless the table is huge.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "group by Category sum Amount as Sales",
            "input": {
                "name": "Sales_raw",
                "table": {
                    "columns": [
                        "Category",
                        "Amount"
                    ],
                    "rows": [
                        [
                            "Grocery",
                            600
                        ],
                        [
                            "Electronics",
                            500
                        ],
                        [
                            "Grocery",
                            300
                        ],
                        [
                            "Stationery",
                            200
                        ],
                        [
                            "Electronics",
                            400
                        ]
                    ]
                }
            },
            "tables": {},
            "expected": {
                "columns": [
                    "Category",
                    "Sales"
                ],
                "rows": [
                    [
                        "Grocery",
                        900
                    ],
                    [
                        "Electronics",
                        900
                    ],
                    [
                        "Stationery",
                        200
                    ]
                ]
            },
            "ordered": false
        },
        {
            "id": "pq-append",
            "topic": "power-query",
            "title": "Stack two months",
            "difficulty": "intermediate",
            "objective": "Append one table under another.",
            "instructions": "January and February orders are in two tables with the same columns. Put February under January.",
            "hints": [
                "append <Table>",
                "append Feb_orders"
            ],
            "explanation": "Append adds the rows of the second table under the first. Columns are matched by name, and a column missing from one table is filled with blanks. Use it when tables describe the same thing split by period or branch.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "append Feb_orders",
            "input": {
                "name": "Jan_orders",
                "table": {
                    "columns": [
                        "OrderID",
                        "CustomerID",
                        "Amount"
                    ],
                    "rows": [
                        [
                            1,
                            "C1",
                            100
                        ],
                        [
                            2,
                            "C2",
                            200
                        ]
                    ]
                }
            },
            "tables": {
                "Feb_orders": {
                    "columns": [
                        "OrderID",
                        "CustomerID",
                        "Amount"
                    ],
                    "rows": [
                        [
                            3,
                            "C1",
                            50
                        ],
                        [
                            4,
                            "C3",
                            75
                        ]
                    ]
                }
            },
            "expected": {
                "columns": [
                    "OrderID",
                    "CustomerID",
                    "Amount"
                ],
                "rows": [
                    [
                        1,
                        "C1",
                        100
                    ],
                    [
                        2,
                        "C2",
                        200
                    ],
                    [
                        3,
                        "C1",
                        50
                    ],
                    [
                        4,
                        "C3",
                        75
                    ]
                ]
            },
            "ordered": false
        },
        {
            "id": "pq-merge-queries",
            "topic": "power-query",
            "title": "Look up a column from another table",
            "difficulty": "advanced",
            "objective": "Merge queries to bring in a column from a lookup table.",
            "instructions": "Add the Category from the Products table to each order, matching on ProductID. An order whose product is not in Products gets a blank category.",
            "hints": [
                "merge queries <Table> on <column> = <column> add <column>",
                "merge queries Products on ProductID = ProductID add Category"
            ],
            "explanation": "Merge Queries is a join. Here it is a left join: every order stays, and the matching Category is added. P9 is not in the product list, so its Category is blank, which is the sign of a missing dimension row that a relationship would show as a blank group.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "merge queries Products on ProductID = ProductID add Category",
            "input": {
                "name": "Orders_raw",
                "table": {
                    "columns": [
                        "OrderID",
                        "ProductID",
                        "Qty"
                    ],
                    "rows": [
                        [
                            1,
                            "P3",
                            2
                        ],
                        [
                            2,
                            "P5",
                            1
                        ],
                        [
                            3,
                            "P9",
                            4
                        ],
                        [
                            4,
                            "P1",
                            5
                        ]
                    ]
                }
            },
            "tables": {
                "Products": {
                    "columns": [
                        "ProductID",
                        "Name",
                        "Category"
                    ],
                    "rows": [
                        [
                            "P1",
                            "Notebook",
                            "Stationery"
                        ],
                        [
                            "P2",
                            "Pen",
                            "Stationery"
                        ],
                        [
                            "P3",
                            "Rice 5 kg",
                            "Grocery"
                        ],
                        [
                            "P4",
                            "Tea",
                            "Grocery"
                        ],
                        [
                            "P5",
                            "Earphones",
                            "Electronics"
                        ],
                        [
                            "P6",
                            "Charger",
                            "Electronics"
                        ]
                    ]
                }
            },
            "expected": {
                "columns": [
                    "OrderID",
                    "ProductID",
                    "Qty",
                    "Category"
                ],
                "rows": [
                    [
                        1,
                        "P3",
                        2,
                        "Grocery"
                    ],
                    [
                        2,
                        "P5",
                        1,
                        "Electronics"
                    ],
                    [
                        3,
                        "P9",
                        4,
                        null
                    ],
                    [
                        4,
                        "P1",
                        5,
                        "Stationery"
                    ]
                ]
            },
            "ordered": false
        },
        {
            "id": "pq-unpivot",
            "topic": "power-query",
            "title": "Unpivot month columns",
            "difficulty": "advanced",
            "objective": "Turn columns into rows.",
            "instructions": "Sales has one column per month. Unpivot Jan, Feb and Mar into two columns called Month and Sales.",
            "hints": [
                "unpivot <column>, <column> into <attribute>, <value>",
                "unpivot Jan, Feb, Mar into Month, Sales"
            ],
            "explanation": "Reports and models want one value per row, with the month as a column, not as a header. Unpivoting turns the three month columns into rows, so a chart can put Month on an axis.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "unpivot Jan, Feb, Mar into Month, Sales",
            "input": {
                "name": "Sales_wide",
                "table": {
                    "columns": [
                        "Region",
                        "Jan",
                        "Feb",
                        "Mar"
                    ],
                    "rows": [
                        [
                            "North",
                            100,
                            120,
                            90
                        ],
                        [
                            "South",
                            80,
                            70,
                            60
                        ]
                    ]
                }
            },
            "tables": {},
            "expected": {
                "columns": [
                    "Region",
                    "Month",
                    "Sales"
                ],
                "rows": [
                    [
                        "North",
                        "Jan",
                        100
                    ],
                    [
                        "North",
                        "Feb",
                        120
                    ],
                    [
                        "North",
                        "Mar",
                        90
                    ],
                    [
                        "South",
                        "Jan",
                        80
                    ],
                    [
                        "South",
                        "Feb",
                        70
                    ],
                    [
                        "South",
                        "Mar",
                        60
                    ]
                ]
            },
            "ordered": false
        },
        {
            "id": "pq-columns",
            "topic": "power-query",
            "title": "Rename and remove columns",
            "difficulty": "beginner",
            "objective": "Keep only the columns you need and give them clear names.",
            "instructions": "Remove the column Notes, and rename Cust to Customer.",
            "hints": [
                "Two steps: remove columns, then rename.",
                "remove columns Notes"
            ],
            "explanation": "Fewer, clearly named columns make a model smaller and easier to use. Remove what no report needs and rename cryptic headers before they reach the model.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "remove columns Notes\nrename Cust to Customer",
            "input": {
                "name": "Orders_raw",
                "table": {
                    "columns": [
                        "ID",
                        "Cust",
                        "Notes",
                        "Amount"
                    ],
                    "rows": [
                        [
                            1,
                            "Asha",
                            "x",
                            5
                        ],
                        [
                            2,
                            "Bilal",
                            "y",
                            7
                        ]
                    ]
                }
            },
            "tables": {},
            "expected": {
                "columns": [
                    "ID",
                    "Customer",
                    "Amount"
                ],
                "rows": [
                    [
                        1,
                        "Asha",
                        5
                    ],
                    [
                        2,
                        "Bilal",
                        7
                    ]
                ]
            },
            "ordered": false
        },
        {
            "id": "pq-sort",
            "topic": "power-query",
            "title": "Sort descending",
            "difficulty": "beginner",
            "objective": "Sort a table by one column.",
            "instructions": "Sort by Amount from the largest to the smallest.",
            "hints": [
                "sort <column> ascending | descending",
                "sort Amount descending"
            ],
            "explanation": "Sorting in a query changes only the order of the stored rows. It does not control the order of a visual, which has its own sort setting.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "sort Amount descending",
            "input": {
                "name": "Sales_raw",
                "table": {
                    "columns": [
                        "Name",
                        "Amount"
                    ],
                    "rows": [
                        [
                            "A",
                            300
                        ],
                        [
                            "B",
                            900
                        ],
                        [
                            "C",
                            150
                        ]
                    ]
                }
            },
            "tables": {},
            "expected": {
                "columns": [
                    "Name",
                    "Amount"
                ],
                "rows": [
                    [
                        "B",
                        900
                    ],
                    [
                        "A",
                        300
                    ],
                    [
                        "C",
                        150
                    ]
                ]
            },
            "ordered": true
        },
        {
            "id": "pq-errors",
            "topic": "power-query",
            "title": "Remove the errors a type change causes",
            "difficulty": "advanced",
            "objective": "Handle errors caused by a type change.",
            "instructions": "Change Amount to number. Two cells are not numbers and become errors. Remove the rows with an error.",
            "hints": [
                "First change the type, then remove errors.",
                "change type Amount as number\nremove errors Amount"
            ],
            "explanation": "A cell that cannot be converted becomes an error, not a blank. Removing errors drops those rows silently, so first check what is being dropped: here a note \"n/a\" and a dash. Replacing them with a blank would keep the rows.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "change type Amount as number\nremove errors Amount",
            "input": {
                "name": "Sales_raw",
                "table": {
                    "columns": [
                        "ID",
                        "Amount"
                    ],
                    "rows": [
                        [
                            1,
                            "120"
                        ],
                        [
                            2,
                            "n/a"
                        ],
                        [
                            3,
                            "75"
                        ],
                        [
                            4,
                            "-"
                        ]
                    ]
                }
            },
            "tables": {},
            "expected": {
                "columns": [
                    "ID",
                    "Amount"
                ],
                "rows": [
                    [
                        1,
                        120
                    ],
                    [
                        3,
                        75
                    ]
                ]
            },
            "ordered": false
        },
        {
            "id": "pq-dedupe-key",
            "topic": "power-query",
            "title": "Deduplicate on a key",
            "difficulty": "advanced",
            "objective": "Standardise a key, then remove duplicates on it.",
            "instructions": "The same email appears in different capitals and with spaces. Make Email lower case and trimmed, then keep one row for each Email.",
            "hints": [
                "Clean first, then remove duplicates: the order matters.",
                "trim Email\nlowercase Email\nremove duplicates Email"
            ],
            "explanation": "Duplicates are found by comparing exact values, so A@X.IN and a@x.in look different until they are cleaned. Standardise the key first, then remove duplicates on it. Remove duplicates keeps the first row of each key.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "trim Email\nlowercase Email\nremove duplicates Email",
            "input": {
                "name": "Contacts_raw",
                "table": {
                    "columns": [
                        "Email",
                        "ID"
                    ],
                    "rows": [
                        [
                            "a@x.in",
                            1
                        ],
                        [
                            "A@X.IN ",
                            2
                        ],
                        [
                            "b@x.in",
                            3
                        ],
                        [
                            "a@x.in",
                            4
                        ]
                    ]
                }
            },
            "tables": {},
            "expected": {
                "columns": [
                    "Email",
                    "ID"
                ],
                "rows": [
                    [
                        "a@x.in",
                        1
                    ],
                    [
                        "b@x.in",
                        3
                    ]
                ]
            },
            "ordered": false
        },
        {
            "id": "pq-project-orders",
            "topic": "project",
            "title": "Project 1: clean the order export",
            "difficulty": "advanced",
            "objective": "Clean a raw order export step by step, as the first stage of the Sakhi Stores project.",
            "instructions": "The export has stray spaces in CustomerID, three date styles (day first when slashed), numbers stored as text (one with a comma), repeated orders and an order with no customer. Produce a clean table: trimmed CustomerID, OrderDate as dates, Qty and Amount as numbers, no repeated rows, no row without a customer.",
            "hints": [
                "Trim before you remove duplicates, or repeats that differ only by a space survive.",
                "Change the types of OrderDate, Qty and Amount; then remove blanks in CustomerID.",
                "Order: trim CustomerID, change types, remove blanks, remove duplicates."
            ],
            "explanation": "Each fault would distort a report: a space hides a customer match, a text date cannot be grouped by month, text amounts cannot be summed, a repeated order doubles its sales, and an order with no customer would appear under a blank customer. A clean order table is the foundation of the later stages.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "trim CustomerID\nchange type OrderDate as date\nchange type Qty as number\nchange type Amount as number\nremove blanks CustomerID\nremove duplicates",
            "input": {
                "name": "Orders_export",
                "table": {
                    "columns": [
                        "OrderID",
                        "OrderDate",
                        "CustomerID",
                        "ProductID",
                        "Qty",
                        "Amount"
                    ],
                    "rows": [
                        [
                            "1001",
                            "07/11/2023",
                            " C1",
                            "P3",
                            "2",
                            "1,200"
                        ],
                        [
                            "1002",
                            "2023-11-20",
                            "C2 ",
                            "P5",
                            "1",
                            "500"
                        ],
                        [
                            "1003",
                            "10-Dec-2023",
                            "C1",
                            "P1",
                            "5",
                            "200"
                        ],
                        [
                            "1002",
                            "2023-11-20",
                            "C2 ",
                            "P5",
                            "1",
                            "500"
                        ],
                        [
                            "1004",
                            "2023-12-24",
                            "C3",
                            "P4",
                            "2",
                            "300"
                        ],
                        [
                            "1005",
                            "2024-01-08",
                            "",
                            "P2",
                            "10",
                            "100"
                        ],
                        [
                            "1006",
                            "15/01/2024",
                            "C4",
                            "P6",
                            "1",
                            "400"
                        ],
                        [
                            "1001",
                            "07/11/2023",
                            " C1",
                            "P3",
                            "2",
                            "1,200"
                        ]
                    ]
                }
            },
            "tables": {},
            "expected": {
                "columns": [
                    "OrderID",
                    "OrderDate",
                    "CustomerID",
                    "ProductID",
                    "Qty",
                    "Amount"
                ],
                "rows": [
                    [
                        "1001",
                        "2023-11-07",
                        "C1",
                        "P3",
                        2,
                        1200.0
                    ],
                    [
                        "1002",
                        "2023-11-20",
                        "C2",
                        "P5",
                        1,
                        500.0
                    ],
                    [
                        "1003",
                        "2023-12-10",
                        "C1",
                        "P1",
                        5,
                        200.0
                    ],
                    [
                        "1004",
                        "2023-12-24",
                        "C3",
                        "P4",
                        2,
                        300.0
                    ],
                    [
                        "1006",
                        "2024-01-15",
                        "C4",
                        "P6",
                        1,
                        400.0
                    ]
                ]
            },
            "ordered": false
        },
        {
            "id": "pq-project-customers",
            "topic": "project",
            "title": "Project 2: clean the customer list",
            "difficulty": "advanced",
            "objective": "Clean a raw customer list, as the second stage of the Sakhi Stores project.",
            "instructions": "Names and cities are in mixed capitals with stray spaces, one customer is repeated, and one has no city. Produce a clean list: trimmed and properly capitalised Name and City, no repeated rows, and Unknown where City is empty.",
            "hints": [
                "Clean the text first (trim, then proper), then fill the blanks, then remove duplicates.",
                "trim and proper for both Name and City; replace blanks City \"Unknown\"; remove duplicates.",
                "Order matters: the repeated customer only becomes an exact repeat after cleaning."
            ],
            "explanation": "A dimension table needs one row per customer with consistent text. Capitals and spaces would split one city into several groups in a chart, and a repeated customer would break the one-to-many relationship, which needs a unique key on the dimension side.",
            "source": "Microsoft Learn: What is Power Query?",
            "kind": "query",
            "solution": "trim Name\nproper Name\ntrim City\nproper City\nreplace blanks City \"Unknown\"\nremove duplicates",
            "input": {
                "name": "Customers_export",
                "table": {
                    "columns": [
                        "CustomerID",
                        "Name",
                        "City"
                    ],
                    "rows": [
                        [
                            "C1",
                            "asha rao",
                            "PUNE"
                        ],
                        [
                            "C2",
                            "BILAL KHAN",
                            "delhi"
                        ],
                        [
                            "C3",
                            "Chitra  Iyer",
                            "Pune "
                        ],
                        [
                            "C2",
                            "BILAL KHAN",
                            "delhi"
                        ],
                        [
                            "C4",
                            "Dev Kumar",
                            ""
                        ],
                        [
                            "C5",
                            "esha nair",
                            "DELHI"
                        ]
                    ]
                }
            },
            "tables": {},
            "expected": {
                "columns": [
                    "CustomerID",
                    "Name",
                    "City"
                ],
                "rows": [
                    [
                        "C1",
                        "Asha Rao",
                        "Pune"
                    ],
                    [
                        "C2",
                        "Bilal Khan",
                        "Delhi"
                    ],
                    [
                        "C3",
                        "Chitra Iyer",
                        "Pune"
                    ],
                    [
                        "C4",
                        "Dev Kumar",
                        "Unknown"
                    ],
                    [
                        "C5",
                        "Esha Nair",
                        "Delhi"
                    ]
                ]
            },
            "ordered": false
        },
        {
            "id": "model-one-link",
            "topic": "modelling",
            "title": "Link a fact to a dimension",
            "difficulty": "beginner",
            "objective": "Write one relationship from the many side to the one side.",
            "instructions": "Orders is a fact table and Products is a dimension. Write the relationship that lets a product category filter the orders. Write it as: Table[Column] -> Table[Column], from the many side to the one side.",
            "hints": [
                "The key column in Products is ProductID, and Orders has the same one.",
                "Orders[ProductID] -> Products[ProductID]"
            ],
            "explanation": "Each product appears once in Products (the one side) and many times in Orders (the many side). The arrow runs from many to one. A filter on Products[Category] then flows to the orders of those products. If the arrow were reversed, the lab would refuse it because Orders[ProductID] is not unique.",
            "source": "Microsoft Learn: Understand star schema and the importance for Power BI",
            "kind": "model",
            "solution": "Orders[ProductID] -> Products[ProductID]",
            "tables": {
                "Orders": {
                    "columns": [
                        "OrderID",
                        "OrderDate",
                        "CustomerID",
                        "ProductID",
                        "Qty",
                        "Amount"
                    ],
                    "rows": [
                        [
                            1,
                            "2023-11-05",
                            "C1",
                            "P3",
                            2,
                            600
                        ],
                        [
                            2,
                            "2023-11-20",
                            "C2",
                            "P5",
                            1,
                            500
                        ],
                        [
                            3,
                            "2023-12-10",
                            "C1",
                            "P1",
                            5,
                            200
                        ],
                        [
                            4,
                            "2023-12-24",
                            "C3",
                            "P4",
                            2,
                            300
                        ],
                        [
                            5,
                            "2024-01-08",
                            "C2",
                            "P2",
                            10,
                            100
                        ],
                        [
                            6,
                            "2024-01-15",
                            "C4",
                            "P6",
                            1,
                            400
                        ],
                        [
                            7,
                            "2024-01-28",
                            "C1",
                            "P5",
                            1,
                            500
                        ],
                        [
                            8,
                            "2024-02-03",
                            "C3",
                            "P3",
                            1,
                            300
                        ]
                    ]
                },
                "Products": {
                    "columns": [
                        "ProductID",
                        "Name",
                        "Category"
                    ],
                    "rows": [
                        [
                            "P1",
                            "Notebook",
                            "Stationery"
                        ],
                        [
                            "P2",
                            "Pen",
                            "Stationery"
                        ],
                        [
                            "P3",
                            "Rice 5 kg",
                            "Grocery"
                        ],
                        [
                            "P4",
                            "Tea",
                            "Grocery"
                        ],
                        [
                            "P5",
                            "Earphones",
                            "Electronics"
                        ],
                        [
                            "P6",
                            "Charger",
                            "Electronics"
                        ]
                    ]
                }
            },
            "expected": [
                {
                    "from": "Orders[ProductID]",
                    "to": "Products[ProductID]",
                    "active": true
                }
            ]
        },
        {
            "id": "model-two-links",
            "topic": "modelling",
            "title": "Two dimensions",
            "difficulty": "beginner",
            "objective": "Relate a fact table to two dimension tables.",
            "instructions": "Write the two relationships that connect Orders to Products and to Customers, one line each.",
            "hints": [
                "Each dimension has its own key, which Orders also holds.",
                "Orders[ProductID] -> Products[ProductID]\nOrders[CustomerID] -> Customers[CustomerID]"
            ],
            "explanation": "A star schema has one fact table in the middle and a dimension for each way of slicing it. Both relationships run from the fact table (many) to the dimension (one).",
            "source": "Microsoft Learn: Understand star schema and the importance for Power BI",
            "kind": "model",
            "solution": "Orders[ProductID] -> Products[ProductID]\nOrders[CustomerID] -> Customers[CustomerID]",
            "tables": {
                "Orders": {
                    "columns": [
                        "OrderID",
                        "OrderDate",
                        "CustomerID",
                        "ProductID",
                        "Qty",
                        "Amount"
                    ],
                    "rows": [
                        [
                            1,
                            "2023-11-05",
                            "C1",
                            "P3",
                            2,
                            600
                        ],
                        [
                            2,
                            "2023-11-20",
                            "C2",
                            "P5",
                            1,
                            500
                        ],
                        [
                            3,
                            "2023-12-10",
                            "C1",
                            "P1",
                            5,
                            200
                        ],
                        [
                            4,
                            "2023-12-24",
                            "C3",
                            "P4",
                            2,
                            300
                        ],
                        [
                            5,
                            "2024-01-08",
                            "C2",
                            "P2",
                            10,
                            100
                        ],
                        [
                            6,
                            "2024-01-15",
                            "C4",
                            "P6",
                            1,
                            400
                        ],
                        [
                            7,
                            "2024-01-28",
                            "C1",
                            "P5",
                            1,
                            500
                        ],
                        [
                            8,
                            "2024-02-03",
                            "C3",
                            "P3",
                            1,
                            300
                        ]
                    ]
                },
                "Products": {
                    "columns": [
                        "ProductID",
                        "Name",
                        "Category"
                    ],
                    "rows": [
                        [
                            "P1",
                            "Notebook",
                            "Stationery"
                        ],
                        [
                            "P2",
                            "Pen",
                            "Stationery"
                        ],
                        [
                            "P3",
                            "Rice 5 kg",
                            "Grocery"
                        ],
                        [
                            "P4",
                            "Tea",
                            "Grocery"
                        ],
                        [
                            "P5",
                            "Earphones",
                            "Electronics"
                        ],
                        [
                            "P6",
                            "Charger",
                            "Electronics"
                        ]
                    ]
                },
                "Customers": {
                    "columns": [
                        "CustomerID",
                        "Name",
                        "City"
                    ],
                    "rows": [
                        [
                            "C1",
                            "Asha Rao",
                            "Pune"
                        ],
                        [
                            "C2",
                            "Bilal Khan",
                            "Delhi"
                        ],
                        [
                            "C3",
                            "Chitra Iyer",
                            "Pune"
                        ],
                        [
                            "C4",
                            "Dev Kumar",
                            "Chennai"
                        ],
                        [
                            "C5",
                            "Esha Nair",
                            "Delhi"
                        ]
                    ]
                }
            },
            "expected": [
                {
                    "from": "Orders[ProductID]",
                    "to": "Products[ProductID]",
                    "active": true
                },
                {
                    "from": "Orders[CustomerID]",
                    "to": "Customers[CustomerID]",
                    "active": true
                }
            ]
        },
        {
            "id": "model-star",
            "topic": "modelling",
            "title": "Complete the star",
            "difficulty": "intermediate",
            "objective": "Build a full star schema including the date table.",
            "instructions": "Connect Orders to Products, Customers and Date so that every dimension can filter the orders. Orders[OrderDate] holds the date.",
            "hints": [
                "The date table's key is its Date column.",
                "Three lines. The date relationship uses OrderDate."
            ],
            "explanation": "A date table with one row per day, related to the fact table's date column, is what makes time intelligence and month-by-month reports work. All three relationships run from Orders (many) to the dimension (one).",
            "source": "Microsoft Learn: Understand star schema and the importance for Power BI",
            "kind": "model",
            "solution": "Orders[ProductID] -> Products[ProductID]\nOrders[CustomerID] -> Customers[CustomerID]\nOrders[OrderDate] -> Date[Date]",
            "tables": {
                "Orders": {
                    "columns": [
                        "OrderID",
                        "OrderDate",
                        "CustomerID",
                        "ProductID",
                        "Qty",
                        "Amount"
                    ],
                    "rows": [
                        [
                            1,
                            "2023-11-05",
                            "C1",
                            "P3",
                            2,
                            600
                        ],
                        [
                            2,
                            "2023-11-20",
                            "C2",
                            "P5",
                            1,
                            500
                        ],
                        [
                            3,
                            "2023-12-10",
                            "C1",
                            "P1",
                            5,
                            200
                        ],
                        [
                            4,
                            "2023-12-24",
                            "C3",
                            "P4",
                            2,
                            300
                        ],
                        [
                            5,
                            "2024-01-08",
                            "C2",
                            "P2",
                            10,
                            100
                        ],
                        [
                            6,
                            "2024-01-15",
                            "C4",
                            "P6",
                            1,
                            400
                        ],
                        [
                            7,
                            "2024-01-28",
                            "C1",
                            "P5",
                            1,
                            500
                        ],
                        [
                            8,
                            "2024-02-03",
                            "C3",
                            "P3",
                            1,
                            300
                        ]
                    ]
                },
                "Products": {
                    "columns": [
                        "ProductID",
                        "Name",
                        "Category"
                    ],
                    "rows": [
                        [
                            "P1",
                            "Notebook",
                            "Stationery"
                        ],
                        [
                            "P2",
                            "Pen",
                            "Stationery"
                        ],
                        [
                            "P3",
                            "Rice 5 kg",
                            "Grocery"
                        ],
                        [
                            "P4",
                            "Tea",
                            "Grocery"
                        ],
                        [
                            "P5",
                            "Earphones",
                            "Electronics"
                        ],
                        [
                            "P6",
                            "Charger",
                            "Electronics"
                        ]
                    ]
                },
                "Customers": {
                    "columns": [
                        "CustomerID",
                        "Name",
                        "City"
                    ],
                    "rows": [
                        [
                            "C1",
                            "Asha Rao",
                            "Pune"
                        ],
                        [
                            "C2",
                            "Bilal Khan",
                            "Delhi"
                        ],
                        [
                            "C3",
                            "Chitra Iyer",
                            "Pune"
                        ],
                        [
                            "C4",
                            "Dev Kumar",
                            "Chennai"
                        ],
                        [
                            "C5",
                            "Esha Nair",
                            "Delhi"
                        ]
                    ]
                },
                "Date": {
                    "columns": [
                        "Date",
                        "Year",
                        "Month"
                    ],
                    "rows": [
                        [
                            "2023-11-05",
                            2023,
                            11
                        ],
                        [
                            "2023-11-20",
                            2023,
                            11
                        ],
                        [
                            "2023-12-10",
                            2023,
                            12
                        ],
                        [
                            "2023-12-24",
                            2023,
                            12
                        ],
                        [
                            "2024-01-08",
                            2024,
                            1
                        ],
                        [
                            "2024-01-15",
                            2024,
                            1
                        ],
                        [
                            "2024-01-28",
                            2024,
                            1
                        ],
                        [
                            "2024-02-03",
                            2024,
                            2
                        ]
                    ]
                }
            },
            "expected": [
                {
                    "from": "Orders[ProductID]",
                    "to": "Products[ProductID]",
                    "active": true
                },
                {
                    "from": "Orders[CustomerID]",
                    "to": "Customers[CustomerID]",
                    "active": true
                },
                {
                    "from": "Orders[OrderDate]",
                    "to": "Date[Date]",
                    "active": true
                }
            ]
        },
        {
            "id": "model-role-playing",
            "topic": "modelling",
            "title": "One date table, two roles",
            "difficulty": "advanced",
            "objective": "Handle a role-playing date dimension with one active relationship.",
            "instructions": "Shipments has an OrderDate and a ShipDate, and both should relate to the Date table. Only one relationship between two tables can be active. Make the order date active and the ship date inactive by adding the word inactive at the end of its line.",
            "hints": [
                "Both lines point to Date[Date].",
                "Shipments[OrderDate] -> Date[Date]\nShipments[ShipDate] -> Date[Date] inactive"
            ],
            "explanation": "Power BI allows several relationships between two tables but only one is active at a time. The inactive one is used only by a measure that asks for it with USERELATIONSHIP (not supported in this lab). Another approach is a second date table for each role.",
            "source": "Microsoft Learn: Understand star schema and the importance for Power BI",
            "kind": "model",
            "solution": "Shipments[OrderDate] -> Date[Date]\nShipments[ShipDate] -> Date[Date] inactive",
            "tables": {
                "Shipments": {
                    "columns": [
                        "ShipmentID",
                        "OrderDate",
                        "ShipDate"
                    ],
                    "rows": [
                        [
                            1,
                            "2024-01-09",
                            "2024-01-11"
                        ],
                        [
                            2,
                            "2024-01-16",
                            "2024-01-20"
                        ],
                        [
                            3,
                            "2024-01-29",
                            "2024-02-01"
                        ]
                    ]
                },
                "Date": {
                    "columns": [
                        "Date",
                        "Year",
                        "Month"
                    ],
                    "rows": [
                        [
                            "2024-01-09",
                            2024,
                            1
                        ],
                        [
                            "2024-01-11",
                            2024,
                            1
                        ],
                        [
                            "2024-01-16",
                            2024,
                            1
                        ],
                        [
                            "2024-01-20",
                            2024,
                            1
                        ],
                        [
                            "2024-01-29",
                            2024,
                            1
                        ],
                        [
                            "2024-02-01",
                            2024,
                            2
                        ]
                    ]
                }
            },
            "expected": [
                {
                    "from": "Shipments[OrderDate]",
                    "to": "Date[Date]",
                    "active": true
                },
                {
                    "from": "Shipments[ShipDate]",
                    "to": "Date[Date]",
                    "active": false
                }
            ]
        },
        {
            "id": "model-snowflake",
            "topic": "modelling",
            "title": "A snowflake",
            "difficulty": "advanced",
            "objective": "Chain relationships through a normalised dimension.",
            "instructions": "Products links to a Subcategories table through SubcategoryID. Connect Orders to Products and Products to Subcategories.",
            "hints": [
                "The second relationship goes from Products (many subcategory repeats) to Subcategories (one).",
                "Orders[ProductID] -> Products[ProductID]\nProducts[SubcategoryID] -> Subcategories[SubcategoryID]"
            ],
            "explanation": "Splitting a dimension into linked tables is a snowflake. It works, but filters travel a longer path and the field list shows more tables. Microsoft's guidance generally prefers merging them into one dimension table, unless there is a reason not to.",
            "source": "Microsoft Learn: Understand star schema and the importance for Power BI",
            "kind": "model",
            "solution": "Orders[ProductID] -> Products[ProductID]\nProducts[SubcategoryID] -> Subcategories[SubcategoryID]",
            "tables": {
                "Orders": {
                    "columns": [
                        "OrderID",
                        "ProductID",
                        "Amount"
                    ],
                    "rows": [
                        [
                            1,
                            "P1",
                            200
                        ],
                        [
                            2,
                            "P3",
                            300
                        ],
                        [
                            3,
                            "P2",
                            100
                        ]
                    ]
                },
                "Products": {
                    "columns": [
                        "ProductID",
                        "Name",
                        "SubcategoryID"
                    ],
                    "rows": [
                        [
                            "P1",
                            "Notebook",
                            "S1"
                        ],
                        [
                            "P2",
                            "Pen",
                            "S1"
                        ],
                        [
                            "P3",
                            "Rice",
                            "S2"
                        ]
                    ]
                },
                "Subcategories": {
                    "columns": [
                        "SubcategoryID",
                        "Name",
                        "Category"
                    ],
                    "rows": [
                        [
                            "S1",
                            "Writing",
                            "Stationery"
                        ],
                        [
                            "S2",
                            "Staples",
                            "Grocery"
                        ]
                    ]
                }
            },
            "expected": [
                {
                    "from": "Orders[ProductID]",
                    "to": "Products[ProductID]",
                    "active": true
                },
                {
                    "from": "Products[SubcategoryID]",
                    "to": "Subcategories[SubcategoryID]",
                    "active": true
                }
            ]
        },
        {
            "id": "dax-total-sales",
            "topic": "dax",
            "title": "Total Sales",
            "difficulty": "beginner",
            "objective": "Write a measure that adds a column.",
            "instructions": "Write a measure called Total Sales that adds up Orders[Amount].",
            "hints": [
                "A measure is written Name = expression.",
                "Total Sales = SUM(Orders[Amount])"
            ],
            "explanation": "SUM adds the Amount of the rows that are visible in the current filter context. That is why the same measure shows the grand total in a card and a different figure for each category in a chart.",
            "source": "Microsoft Learn: DAX overview",
            "kind": "dax",
            "solution": "Total Sales = SUM(Orders[Amount])",
            "target": "Total Sales",
            "helpers": {},
            "contexts": [
                {
                    "label": "All data",
                    "filters": [],
                    "expected": 6800
                },
                {
                    "label": "Category = Electronics",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Electronics"
                            ]
                        }
                    ],
                    "expected": 3300
                },
                {
                    "label": "Category = Grocery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Grocery"
                            ]
                        }
                    ],
                    "expected": 2550
                },
                {
                    "label": "Category = Stationery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Stationery"
                            ]
                        }
                    ],
                    "expected": 950
                },
                {
                    "label": "City = Delhi",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Delhi"
                            ]
                        }
                    ],
                    "expected": 2250
                },
                {
                    "label": "City = Pune",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Pune"
                            ]
                        }
                    ],
                    "expected": 2850
                },
                {
                    "label": "Month = 2024-03",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-03"
                            ]
                        }
                    ],
                    "expected": 1650
                }
            ]
        },
        {
            "id": "dax-order-count",
            "topic": "dax",
            "title": "Number of orders",
            "difficulty": "beginner",
            "objective": "Count rows with COUNTROWS.",
            "instructions": "Write a measure called Orders that counts the rows of the Orders table.",
            "hints": [
                "COUNTROWS takes a table.",
                "Orders = COUNTROWS(Orders)"
            ],
            "explanation": "COUNTROWS counts the rows that survive the current filters. It is the right choice for counting facts such as orders, where each row is one order.",
            "source": "Microsoft Learn: DAX overview",
            "kind": "dax",
            "solution": "Orders = COUNTROWS(Orders)",
            "target": "Orders",
            "helpers": {},
            "contexts": [
                {
                    "label": "All data",
                    "filters": [],
                    "expected": 17
                },
                {
                    "label": "Category = Electronics",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Electronics"
                            ]
                        }
                    ],
                    "expected": 6
                },
                {
                    "label": "Category = Grocery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Grocery"
                            ]
                        }
                    ],
                    "expected": 6
                },
                {
                    "label": "Category = Stationery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Stationery"
                            ]
                        }
                    ],
                    "expected": 5
                },
                {
                    "label": "City = Delhi",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Delhi"
                            ]
                        }
                    ],
                    "expected": 6
                },
                {
                    "label": "City = Pune",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Pune"
                            ]
                        }
                    ],
                    "expected": 8
                },
                {
                    "label": "Month = 2024-03",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-03"
                            ]
                        }
                    ],
                    "expected": 3
                }
            ]
        },
        {
            "id": "dax-customers",
            "topic": "dax",
            "title": "Distinct customers",
            "difficulty": "beginner",
            "objective": "Count different values with DISTINCTCOUNT.",
            "instructions": "Write a measure called Customers that counts how many different customers placed orders.",
            "hints": [
                "Count distinct values in the CustomerID column of Orders.",
                "Customers = DISTINCTCOUNT(Orders[CustomerID])"
            ],
            "explanation": "COUNT or COUNTROWS would count orders. DISTINCTCOUNT counts each customer once however many orders they placed. When there are no orders in a filter, it counts zero.",
            "source": "Microsoft Learn: DAX overview",
            "kind": "dax",
            "solution": "Customers = DISTINCTCOUNT(Orders[CustomerID])",
            "target": "Customers",
            "helpers": {},
            "contexts": [
                {
                    "label": "All data",
                    "filters": [],
                    "expected": 5
                },
                {
                    "label": "Category = Electronics",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Electronics"
                            ]
                        }
                    ],
                    "expected": 4
                },
                {
                    "label": "Category = Grocery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Grocery"
                            ]
                        }
                    ],
                    "expected": 4
                },
                {
                    "label": "Category = Stationery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Stationery"
                            ]
                        }
                    ],
                    "expected": 2
                },
                {
                    "label": "City = Delhi",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Delhi"
                            ]
                        }
                    ],
                    "expected": 2
                },
                {
                    "label": "City = Pune",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Pune"
                            ]
                        }
                    ],
                    "expected": 2
                },
                {
                    "label": "Month = 2024-03",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-03"
                            ]
                        }
                    ],
                    "expected": 3
                }
            ]
        },
        {
            "id": "dax-aov",
            "topic": "dax",
            "title": "Average order value",
            "difficulty": "intermediate",
            "objective": "Divide one measure by another safely.",
            "instructions": "Using the measures [Total Sales] and [Orders] (provided), write a measure called Average Order Value that divides sales by orders. It must show blank rather than an error when there are no orders.",
            "hints": [
                "DIVIDE does the division and handles zero.",
                "Average Order Value = DIVIDE([Total Sales], [Orders])"
            ],
            "explanation": "DIVIDE(a, b) returns blank when b is zero, while a plain / would raise an error. Building a measure from other measures keeps each definition in one place.",
            "source": "Microsoft Learn: DAX overview",
            "kind": "dax",
            "solution": "Average Order Value = DIVIDE([Total Sales], [Orders])",
            "target": "Average Order Value",
            "helpers": {
                "Total Sales": "SUM(Orders[Amount])",
                "Orders": "COUNTROWS(Orders)"
            },
            "contexts": [
                {
                    "label": "All data",
                    "filters": [],
                    "expected": 400.0
                },
                {
                    "label": "Category = Electronics",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Electronics"
                            ]
                        }
                    ],
                    "expected": 550.0
                },
                {
                    "label": "Category = Grocery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Grocery"
                            ]
                        }
                    ],
                    "expected": 425.0
                },
                {
                    "label": "Category = Stationery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Stationery"
                            ]
                        }
                    ],
                    "expected": 190.0
                },
                {
                    "label": "City = Delhi",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Delhi"
                            ]
                        }
                    ],
                    "expected": 375.0
                },
                {
                    "label": "City = Pune",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Pune"
                            ]
                        }
                    ],
                    "expected": 356.25
                },
                {
                    "label": "Month = 2024-03",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-03"
                            ]
                        }
                    ],
                    "expected": 550.0
                }
            ]
        },
        {
            "id": "dax-electronics",
            "topic": "dax",
            "title": "A fixed filter with CALCULATE",
            "difficulty": "intermediate",
            "objective": "Change the filter context with CALCULATE.",
            "instructions": "Write a measure called Electronics Sales that always shows the sales of the Electronics category, whatever else is filtered in the report. Use [Total Sales] (provided).",
            "hints": [
                "CALCULATE takes an expression, then filters.",
                "Electronics Sales = CALCULATE([Total Sales], Products[Category] = \"Electronics\")"
            ],
            "explanation": "CALCULATE evaluates its first argument after changing the filter context. A column filter inside it replaces any existing filter on that column, so even when a slicer shows Grocery, the measure still shows Electronics. A different filter on another column, such as City, still applies.",
            "source": "Microsoft Learn: DAX overview",
            "kind": "dax",
            "solution": "Electronics Sales = CALCULATE([Total Sales], Products[Category] = \"Electronics\")",
            "target": "Electronics Sales",
            "helpers": {
                "Total Sales": "SUM(Orders[Amount])"
            },
            "contexts": [
                {
                    "label": "All data",
                    "filters": [],
                    "expected": 3300
                },
                {
                    "label": "Category = Electronics",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Electronics"
                            ]
                        }
                    ],
                    "expected": 3300
                },
                {
                    "label": "Category = Grocery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Grocery"
                            ]
                        }
                    ],
                    "expected": 3300
                },
                {
                    "label": "Category = Stationery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Stationery"
                            ]
                        }
                    ],
                    "expected": 3300
                },
                {
                    "label": "City = Delhi",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Delhi"
                            ]
                        }
                    ],
                    "expected": 500
                },
                {
                    "label": "City = Pune",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Pune"
                            ]
                        }
                    ],
                    "expected": 1400
                },
                {
                    "label": "Month = 2024-03",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-03"
                            ]
                        }
                    ],
                    "expected": 1000
                }
            ]
        },
        {
            "id": "dax-percent-total",
            "topic": "dax",
            "title": "Percentage of all sales",
            "difficulty": "advanced",
            "objective": "Use ALL to remove a filter and build a share.",
            "instructions": "Write a measure called Share of Sales: the sales in the current filter divided by the sales of everything with the Products filters removed. Use [Total Sales] (provided) and DIVIDE.",
            "hints": [
                "The denominator removes the Products filters: CALCULATE([Total Sales], ALL(Products)).",
                "Share of Sales = DIVIDE([Total Sales], CALCULATE([Total Sales], ALL(Products)))"
            ],
            "explanation": "ALL(Products) clears every filter on the Products table inside that CALCULATE. A category's share is its sales divided by the sales of all products, but a city filter still applies to both parts. This is the standard way to build a percentage of total.",
            "source": "Microsoft Learn: DAX overview",
            "kind": "dax",
            "solution": "Share of Sales = DIVIDE([Total Sales], CALCULATE([Total Sales], ALL(Products)))",
            "target": "Share of Sales",
            "helpers": {
                "Total Sales": "SUM(Orders[Amount])"
            },
            "contexts": [
                {
                    "label": "All data",
                    "filters": [],
                    "expected": 1.0
                },
                {
                    "label": "Category = Electronics",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Electronics"
                            ]
                        }
                    ],
                    "expected": 0.485294
                },
                {
                    "label": "Category = Grocery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Grocery"
                            ]
                        }
                    ],
                    "expected": 0.375
                },
                {
                    "label": "Category = Stationery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Stationery"
                            ]
                        }
                    ],
                    "expected": 0.139706
                },
                {
                    "label": "City = Delhi",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Delhi"
                            ]
                        }
                    ],
                    "expected": 1.0
                },
                {
                    "label": "City = Pune",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Pune"
                            ]
                        }
                    ],
                    "expected": 1.0
                },
                {
                    "label": "Month = 2024-03",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-03"
                            ]
                        }
                    ],
                    "expected": 1.0
                }
            ]
        },
        {
            "id": "dax-big-orders",
            "topic": "dax",
            "title": "Count with FILTER",
            "difficulty": "intermediate",
            "objective": "Count only the rows that meet a condition.",
            "instructions": "Write a measure called Big Orders that counts the orders with an Amount of 500 or more.",
            "hints": [
                "COUNTROWS of a FILTER over Orders.",
                "Big Orders = COUNTROWS(FILTER(Orders, Orders[Amount] >= 500))"
            ],
            "explanation": "FILTER walks through the table one row at a time (a row context) and keeps the rows where the condition is true. The surrounding filters, such as the selected category, still apply to those rows first.",
            "source": "Microsoft Learn: DAX overview",
            "kind": "dax",
            "solution": "Big Orders = COUNTROWS(FILTER(Orders, Orders[Amount] >= 500))",
            "target": "Big Orders",
            "helpers": {},
            "contexts": [
                {
                    "label": "All data",
                    "filters": [],
                    "expected": 6
                },
                {
                    "label": "Category = Electronics",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Electronics"
                            ]
                        }
                    ],
                    "expected": 4
                },
                {
                    "label": "Category = Grocery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Grocery"
                            ]
                        }
                    ],
                    "expected": 2
                },
                {
                    "label": "Category = Stationery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Stationery"
                            ]
                        }
                    ],
                    "expected": 0
                },
                {
                    "label": "City = Delhi",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Delhi"
                            ]
                        }
                    ],
                    "expected": 2
                },
                {
                    "label": "City = Pune",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Pune"
                            ]
                        }
                    ],
                    "expected": 3
                },
                {
                    "label": "Month = 2024-03",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-03"
                            ]
                        }
                    ],
                    "expected": 2
                }
            ]
        },
        {
            "id": "dax-sumx-related",
            "topic": "dax",
            "title": "Sales from quantity and price",
            "difficulty": "advanced",
            "objective": "Use an iterator with RELATED.",
            "instructions": "Orders has Qty but no price. Write a measure called Computed Sales that multiplies Qty by the product's Price (a column of Products) on each order row, and adds them up. Use SUMX and RELATED.",
            "hints": [
                "SUMX walks the rows of Orders; RELATED reads a column from the one side.",
                "Computed Sales = SUMX(Orders, Orders[Qty] * RELATED(Products[Price]))"
            ],
            "explanation": "SUMX evaluates the expression once for each row of Orders and adds the results. RELATED follows the relationship to the Products row of that order. The result equals Total Sales here, which is a useful reconciliation check.",
            "source": "Microsoft Learn: DAX overview",
            "kind": "dax",
            "solution": "Computed Sales = SUMX(Orders, Orders[Qty] * RELATED(Products[Price]))",
            "target": "Computed Sales",
            "helpers": {},
            "contexts": [
                {
                    "label": "All data",
                    "filters": [],
                    "expected": 6800
                },
                {
                    "label": "Category = Electronics",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Electronics"
                            ]
                        }
                    ],
                    "expected": 3300
                },
                {
                    "label": "Category = Grocery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Grocery"
                            ]
                        }
                    ],
                    "expected": 2550
                },
                {
                    "label": "Category = Stationery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Stationery"
                            ]
                        }
                    ],
                    "expected": 950
                },
                {
                    "label": "City = Delhi",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Delhi"
                            ]
                        }
                    ],
                    "expected": 2250
                },
                {
                    "label": "City = Pune",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Pune"
                            ]
                        }
                    ],
                    "expected": 2850
                },
                {
                    "label": "Month = 2024-03",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-03"
                            ]
                        }
                    ],
                    "expected": 1650
                }
            ]
        },
        {
            "id": "dax-excl-grocery",
            "topic": "dax",
            "title": "Exclude a category",
            "difficulty": "intermediate",
            "objective": "Filter with a not-equal condition.",
            "instructions": "Write a measure called Non Grocery Sales: the sales of every category except Grocery. Use [Total Sales] (provided).",
            "hints": [
                "Use <> inside CALCULATE.",
                "Non Grocery Sales = CALCULATE([Total Sales], Products[Category] <> \"Grocery\")"
            ],
            "explanation": "A boolean filter inside CALCULATE replaces the filter on that column. So even when Grocery is selected, the measure ignores that selection and shows all other categories, which is why the Grocery row shows the same figure as the grand total.",
            "source": "Microsoft Learn: DAX overview",
            "kind": "dax",
            "solution": "Non Grocery Sales = CALCULATE([Total Sales], Products[Category] <> \"Grocery\")",
            "target": "Non Grocery Sales",
            "helpers": {
                "Total Sales": "SUM(Orders[Amount])"
            },
            "contexts": [
                {
                    "label": "All data",
                    "filters": [],
                    "expected": 4250
                },
                {
                    "label": "Category = Electronics",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Electronics"
                            ]
                        }
                    ],
                    "expected": 4250
                },
                {
                    "label": "Category = Grocery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Grocery"
                            ]
                        }
                    ],
                    "expected": 4250
                },
                {
                    "label": "Category = Stationery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Stationery"
                            ]
                        }
                    ],
                    "expected": 4250
                },
                {
                    "label": "City = Delhi",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Delhi"
                            ]
                        }
                    ],
                    "expected": 1200
                },
                {
                    "label": "City = Pune",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Pune"
                            ]
                        }
                    ],
                    "expected": 1650
                },
                {
                    "label": "Month = 2024-03",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-03"
                            ]
                        }
                    ],
                    "expected": 1050
                }
            ]
        },
        {
            "id": "dax-ytd",
            "topic": "dax",
            "title": "Sales year to date",
            "difficulty": "advanced",
            "objective": "Use a time intelligence function.",
            "instructions": "Write a measure called Sales YTD: the sales from 1 January of the year up to the last date in the current filter. Use [Total Sales] (provided) and the date column Date[Date].",
            "hints": [
                "TOTALYTD takes an expression and a date column.",
                "Sales YTD = TOTALYTD([Total Sales], Date[Date])"
            ],
            "explanation": "TOTALYTD accumulates from the start of the year to the last visible date. It needs a date table with one row for every day, related to the fact table. For March 2024 it adds January, February and March. Other filters, such as a category, still apply to the accumulated period.",
            "source": "Microsoft Learn: DAX overview",
            "kind": "dax",
            "solution": "Sales YTD = TOTALYTD([Total Sales], Date[Date])",
            "target": "Sales YTD",
            "helpers": {
                "Total Sales": "SUM(Orders[Amount])"
            },
            "contexts": [
                {
                    "label": "Month = 2024-01",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-01"
                            ]
                        }
                    ],
                    "expected": 1000
                },
                {
                    "label": "Month = 2024-02",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-02"
                            ]
                        }
                    ],
                    "expected": 2150
                },
                {
                    "label": "Month = 2024-03",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-03"
                            ]
                        }
                    ],
                    "expected": 3800
                },
                {
                    "label": "Month = 2024-04",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-04"
                            ]
                        }
                    ],
                    "expected": 4200
                },
                {
                    "label": "Month = 2023-12",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2023-12"
                            ]
                        }
                    ],
                    "expected": 2600
                },
                {
                    "label": "Month = 2024-03, Category = Electronics",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-03"
                            ]
                        },
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Electronics"
                            ]
                        }
                    ],
                    "expected": 1900
                },
                {
                    "label": "Month = 2024-02, City = Pune",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-02"
                            ]
                        },
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Pune"
                            ]
                        }
                    ],
                    "expected": 800
                }
            ]
        },
        {
            "id": "dax-sply",
            "topic": "dax",
            "title": "Sales in the same period last year",
            "difficulty": "advanced",
            "objective": "Compare with the previous year.",
            "instructions": "Write a measure called Sales Last Year: the sales for the same period one year earlier. Use [Total Sales] (provided) and SAMEPERIODLASTYEAR.",
            "hints": [
                "CALCULATE with SAMEPERIODLASTYEAR(Date[Date]).",
                "Sales Last Year = CALCULATE([Total Sales], SAMEPERIODLASTYEAR(Date[Date]))"
            ],
            "explanation": "SAMEPERIODLASTYEAR shifts every visible date back one year. For March 2024 it looks at March 2023. Where the earlier period has no sales the measure is blank, not zero, which is why a growth figure built on it needs care.",
            "source": "Microsoft Learn: DAX overview",
            "kind": "dax",
            "solution": "Sales Last Year = CALCULATE([Total Sales], SAMEPERIODLASTYEAR(Date[Date]))",
            "target": "Sales Last Year",
            "helpers": {
                "Total Sales": "SUM(Orders[Amount])"
            },
            "contexts": [
                {
                    "label": "Month = 2024-01",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-01"
                            ]
                        }
                    ],
                    "expected": 200
                },
                {
                    "label": "Month = 2024-02",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-02"
                            ]
                        }
                    ],
                    "expected": 300
                },
                {
                    "label": "Month = 2024-03",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-03"
                            ]
                        }
                    ],
                    "expected": 500
                },
                {
                    "label": "Month = 2024-04",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-04"
                            ]
                        }
                    ],
                    "expected": null
                },
                {
                    "label": "Month = 2023-12",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2023-12"
                            ]
                        }
                    ],
                    "expected": null
                },
                {
                    "label": "Month = 2024-03, Category = Electronics",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-03"
                            ]
                        },
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Electronics"
                            ]
                        }
                    ],
                    "expected": 500
                },
                {
                    "label": "Month = 2024-02, City = Pune",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-02"
                            ]
                        },
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Pune"
                            ]
                        }
                    ],
                    "expected": null
                }
            ]
        },
        {
            "id": "dax-growth",
            "topic": "dax",
            "title": "Growth against last year",
            "difficulty": "advanced",
            "objective": "Combine variables, a prior-period measure and safe division.",
            "instructions": "Using [Total Sales] and [Sales Last Year] (both provided), write a measure called Growth Percent: (this period minus last year's period) divided by last year's period, as a fraction (0.5 means 50 percent). Use VAR and RETURN, and show blank when there is no last-year figure.",
            "hints": [
                "Store each measure in a variable, then DIVIDE the difference by last year.",
                "Growth Percent =\nVAR Current = [Total Sales]\nVAR Previous = [Sales Last Year]\nRETURN DIVIDE(Current - Previous, Previous)"
            ],
            "explanation": "Variables are calculated once and give the parts a name, which makes a formula easier to read and check. DIVIDE returns blank when the previous-year figure is blank or zero, so a month with no history shows no growth instead of an error or a misleading infinity.",
            "source": "Microsoft Learn: DAX overview",
            "kind": "dax",
            "solution": "Growth Percent =\nVAR Current = [Total Sales]\nVAR Previous = [Sales Last Year]\nRETURN DIVIDE(Current - Previous, Previous)",
            "target": "Growth Percent",
            "helpers": {
                "Total Sales": "SUM(Orders[Amount])",
                "Sales Last Year": "CALCULATE([Total Sales], SAMEPERIODLASTYEAR(Date[Date]))"
            },
            "contexts": [
                {
                    "label": "Month = 2024-01",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-01"
                            ]
                        }
                    ],
                    "expected": 4.0
                },
                {
                    "label": "Month = 2024-02",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-02"
                            ]
                        }
                    ],
                    "expected": 2.833333
                },
                {
                    "label": "Month = 2024-03",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-03"
                            ]
                        }
                    ],
                    "expected": 2.3
                },
                {
                    "label": "Month = 2024-04",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-04"
                            ]
                        }
                    ],
                    "expected": null
                },
                {
                    "label": "Month = 2023-12",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2023-12"
                            ]
                        }
                    ],
                    "expected": null
                },
                {
                    "label": "Month = 2024-03, Category = Electronics",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-03"
                            ]
                        },
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Electronics"
                            ]
                        }
                    ],
                    "expected": 1.0
                },
                {
                    "label": "Month = 2024-02, City = Pune",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-02"
                            ]
                        },
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Pune"
                            ]
                        }
                    ],
                    "expected": null
                }
            ]
        },
        {
            "id": "dax-avg-customer",
            "topic": "dax",
            "title": "Average sales per customer",
            "difficulty": "advanced",
            "objective": "Use an iterator over a dimension with context transition.",
            "instructions": "Write a measure called Sales per Customer that averages [Total Sales] (provided) over the customers: AVERAGEX over the Customers table. Customers with no sales in the current filter are left out of the average.",
            "hints": [
                "AVERAGEX walks the rows of Customers and evaluates a measure for each.",
                "Sales per Customer = AVERAGEX(Customers, [Total Sales])"
            ],
            "explanation": "Inside AVERAGEX each customer becomes the current row, and calling a measure there turns that row into a filter (context transition), so [Total Sales] is that customer's sales. A customer with no sales gives blank, and blanks are ignored by an average.",
            "source": "Microsoft Learn: DAX overview",
            "kind": "dax",
            "solution": "Sales per Customer = AVERAGEX(Customers, [Total Sales])",
            "target": "Sales per Customer",
            "helpers": {
                "Total Sales": "SUM(Orders[Amount])"
            },
            "contexts": [
                {
                    "label": "All data",
                    "filters": [],
                    "expected": 1360.0
                },
                {
                    "label": "Category = Electronics",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Electronics"
                            ]
                        }
                    ],
                    "expected": 825.0
                },
                {
                    "label": "Category = Grocery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Grocery"
                            ]
                        }
                    ],
                    "expected": 637.5
                },
                {
                    "label": "Category = Stationery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Stationery"
                            ]
                        }
                    ],
                    "expected": 475.0
                },
                {
                    "label": "City = Delhi",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Delhi"
                            ]
                        }
                    ],
                    "expected": 1125.0
                },
                {
                    "label": "City = Pune",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Pune"
                            ]
                        }
                    ],
                    "expected": 1425.0
                },
                {
                    "label": "Month = 2024-03",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-03"
                            ]
                        }
                    ],
                    "expected": 550.0
                }
            ]
        },
        {
            "id": "dax-size-band",
            "topic": "dax",
            "title": "A size band with SWITCH",
            "difficulty": "intermediate",
            "objective": "Classify with SWITCH(TRUE(), ...).",
            "instructions": "Write a measure called Band that shows the text \"High\" when [Total Sales] is 2000 or more, \"Medium\" when it is 1000 or more, and \"Low\" otherwise (provided: [Total Sales]).",
            "hints": [
                "SWITCH(TRUE(), test1, result1, test2, result2, else)",
                "Band = SWITCH(TRUE(), [Total Sales] >= 2000, \"High\", [Total Sales] >= 1000, \"Medium\", \"Low\")"
            ],
            "explanation": "SWITCH(TRUE(), ...) checks the conditions in order and returns the result of the first that is true; the last value is used when none is. The order matters: testing >= 1000 first would label every high value as medium.",
            "source": "Microsoft Learn: DAX overview",
            "kind": "dax",
            "solution": "Band = SWITCH(TRUE(), [Total Sales] >= 2000, \"High\", [Total Sales] >= 1000, \"Medium\", \"Low\")",
            "target": "Band",
            "helpers": {
                "Total Sales": "SUM(Orders[Amount])"
            },
            "contexts": [
                {
                    "label": "All data",
                    "filters": [],
                    "expected": "High"
                },
                {
                    "label": "Category = Electronics",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Electronics"
                            ]
                        }
                    ],
                    "expected": "High"
                },
                {
                    "label": "Category = Grocery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Grocery"
                            ]
                        }
                    ],
                    "expected": "High"
                },
                {
                    "label": "Category = Stationery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Stationery"
                            ]
                        }
                    ],
                    "expected": "Low"
                },
                {
                    "label": "City = Delhi",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Delhi"
                            ]
                        }
                    ],
                    "expected": "High"
                },
                {
                    "label": "City = Pune",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Pune"
                            ]
                        }
                    ],
                    "expected": "High"
                },
                {
                    "label": "Month = 2024-03",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-03"
                            ]
                        }
                    ],
                    "expected": "Medium"
                }
            ]
        },
        {
            "id": "dax-check",
            "topic": "project",
            "title": "Reconcile to the source",
            "difficulty": "advanced",
            "objective": "Prove a measure agrees with an independent calculation.",
            "instructions": "Write a measure called Check that returns [Total Sales] minus the sum of Qty times Price computed row by row (use SUMX with RELATED). It should be 0 in every filter, which proves the model and the measure agree. Provided: [Total Sales].",
            "hints": [
                "Compare two ways of getting the same total.",
                "Check = [Total Sales] - SUMX(Orders, Orders[Qty] * RELATED(Products[Price]))"
            ],
            "explanation": "A reconciliation measure that should always be zero catches broken relationships, duplicate rows and wrong types before anyone reads the report. In a real project you would also compare with the source system's total.",
            "source": "Microsoft Learn: DAX overview",
            "kind": "dax",
            "solution": "Check = [Total Sales] - SUMX(Orders, Orders[Qty] * RELATED(Products[Price]))",
            "target": "Check",
            "helpers": {
                "Total Sales": "SUM(Orders[Amount])"
            },
            "contexts": [
                {
                    "label": "All data",
                    "filters": [],
                    "expected": 0
                },
                {
                    "label": "Category = Electronics",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Electronics"
                            ]
                        }
                    ],
                    "expected": 0
                },
                {
                    "label": "Category = Grocery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Grocery"
                            ]
                        }
                    ],
                    "expected": 0
                },
                {
                    "label": "Category = Stationery",
                    "filters": [
                        {
                            "table": "Products",
                            "col": "Category",
                            "values": [
                                "Stationery"
                            ]
                        }
                    ],
                    "expected": 0
                },
                {
                    "label": "City = Delhi",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Delhi"
                            ]
                        }
                    ],
                    "expected": 0
                },
                {
                    "label": "City = Pune",
                    "filters": [
                        {
                            "table": "Customers",
                            "col": "City",
                            "values": [
                                "Pune"
                            ]
                        }
                    ],
                    "expected": 0
                },
                {
                    "label": "Month = 2024-03",
                    "filters": [
                        {
                            "table": "Date",
                            "col": "YearMonth",
                            "values": [
                                "2024-03"
                            ]
                        }
                    ],
                    "expected": 0
                }
            ]
        }
    ]
};
