/* =========================================================
   ToolZen Hub
   Excel Practice Lab: the exercises

   Plain data. `sheet.cells` is what the learner sees; `sheet.answer` is where the learner's formula goes; `fill` copies it down
   and right like dragging the fill handle. `expected` is the value of the answer cell (or of each filled cell, row by row) and
   `variants` gives the same for a second set of numbers. A formula is accepted only if it is right on both, so a typed-in answer
   fails. The expected values were calculated by Python, not by the formula engine.
========================================================= */

export const set = {
    "id": "excel-practice",
    "version": "1.0.0",
    "title": "Excel Practice Lab",
    "description": "Fifty-five formula exercises on small sheets, from cell references and SUM to lookups, data cleaning and a budget project, checked by an educational spreadsheet simulation in your browser.",
    "reviewed": {
        "date": "2026-11-04",
        "method": "Written by the author. Expected values were calculated in Python, independently of the formula engine, and the engine's functions were tested against hand-worked values. Not compared with Microsoft Excel. No second reviewer yet."
    },
    "exercises": [
        {
            "id": "xl-multiply",
            "topic": "arithmetic",
            "title": "Price times quantity",
            "difficulty": "beginner",
            "objective": "Write a first formula that uses cell references.",
            "instructions": "Cell B2 holds the unit price and B3 holds the quantity. In B4 enter a formula that shows the total cost (price times quantity).",
            "solution": "=B2*B3",
            "hints": [
                "A formula starts with =.",
                "Refer to the cells B2 and B3 instead of typing their numbers.",
                "The multiplication sign is *."
            ],
            "explanation": "The formula =B2*B3 multiplies whatever is in B2 and B3. If the price or quantity changes, the total changes with it. Typing the numbers (=450*3) would give the same answer today and the wrong one tomorrow, which is why the lab tries your formula on a second set of numbers.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A2": "Unit price",
                    "B2": 450,
                    "A3": "Quantity",
                    "B3": 3,
                    "A4": "Total"
                },
                "answer": "B4",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B2": 120,
                        "B3": 7
                    },
                    "expected": [
                        840
                    ]
                }
            ],
            "expected": [
                1350
            ]
        },
        {
            "id": "xl-precedence",
            "topic": "arithmetic",
            "title": "Brackets and order",
            "difficulty": "beginner",
            "objective": "Control the order of calculation with brackets.",
            "instructions": "B2 is a price, B3 is the tax added to each item, and B4 is the number of items. In B5 enter one formula for (price + tax) times the number of items.",
            "solution": "=(B2+B3)*B4",
            "hints": [
                "Multiplication is done before addition unless you use brackets.",
                "Put the price and tax in brackets first."
            ],
            "explanation": "Excel works out brackets first, then powers, then multiplication and division, then addition and subtraction. =B2+B3*B4 would multiply the tax by the number of items and add the price once, which is a common mistake.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A2": "Price",
                    "B2": 200,
                    "A3": "Tax per item",
                    "B3": 36,
                    "A4": "Items",
                    "B4": 5,
                    "A5": "Total"
                },
                "answer": "B5",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B2": 75,
                        "B3": 9,
                        "B4": 12
                    },
                    "expected": [
                        1008
                    ]
                }
            ],
            "expected": [
                1180
            ]
        },
        {
            "id": "xl-percent-off",
            "topic": "arithmetic",
            "title": "A price after a discount",
            "difficulty": "beginner",
            "objective": "Use a percentage stored in a cell.",
            "instructions": "B2 is the price and B3 is the discount (15% is stored as 0.15). In B4 enter a formula for the price after the discount.",
            "solution": "=B2*(1-B3)",
            "hints": [
                "The customer pays 100% minus the discount.",
                "Use brackets around 1-B3."
            ],
            "explanation": "A discount of 15% means the customer pays 85% of the price, so the formula multiplies the price by (1 - discount). The discount lives in its own cell, so changing it recalculates every price that uses it.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A2": "Price",
                    "B2": 2000,
                    "A3": "Discount",
                    "B3": 0.15,
                    "A4": "Sale price"
                },
                "answer": "B4",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {
                    "B3": "percent"
                }
            },
            "variants": [
                {
                    "cells": {
                        "B2": 840,
                        "B3": 0.25
                    },
                    "expected": [
                        630.0
                    ]
                }
            ],
            "expected": [
                1700.0
            ]
        },
        {
            "id": "xl-absolute",
            "topic": "arithmetic",
            "title": "Copy down with an absolute reference",
            "difficulty": "intermediate",
            "objective": "Keep a reference fixed with $ while a formula is copied down.",
            "instructions": "The tax rate is in B1. The prices are in A4:A8. In B4 enter a formula for the tax on the price in A4 that stays correct when you copy it down to B8. The lab copies it down for you.",
            "solution": "=A4*$B$1",
            "hints": [
                "The price reference should move down as you copy; the rate reference must not.",
                "A dollar sign before the column letter and the row number fixes a reference."
            ],
            "explanation": "Copying =A4*B1 down changes B1 to B2, B3 and so on, and the rate would be read from the wrong, empty cells. Writing $B$1 fixes both the column and the row. This is the most common reference mistake in spreadsheets.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Tax rate",
                    "B1": 0.18,
                    "A3": "Price",
                    "B3": "Tax",
                    "A4": 100,
                    "A5": 250,
                    "A6": 80,
                    "A7": 1200,
                    "A8": 45
                },
                "answer": "B4",
                "fill": {
                    "down": 4,
                    "right": 0
                },
                "formats": {
                    "B1": "percent"
                }
            },
            "variants": [
                {
                    "cells": {
                        "B1": 0.05,
                        "A4": 40,
                        "A6": 999
                    },
                    "expected": [
                        2.0,
                        12.5,
                        49.95,
                        60.0,
                        2.25
                    ]
                }
            ],
            "expected": [
                18.0,
                45.0,
                14.4,
                216.0,
                8.1
            ]
        },
        {
            "id": "xl-mixed",
            "topic": "arithmetic",
            "title": "A multiplication table",
            "difficulty": "intermediate",
            "objective": "Use a mixed reference ($A2 and B$1) to fill a grid with one formula.",
            "instructions": "Row 1 (B1:E1) holds quantities and column A (A2:A4) holds prices. In B2 enter one formula that gives price times quantity and works when copied across to E2 and down to E4. The lab copies it for you.",
            "solution": "=$A2*B$1",
            "hints": [
                "The price column must stay A when copied across.",
                "The quantity row must stay row 1 when copied down.",
                "Use $ before the column letter in one reference and before the row number in the other."
            ],
            "explanation": "$A2 fixes the column but lets the row move, and B$1 fixes the row but lets the column move. One formula then fills the whole table. With =A2*B1 the references would drift into empty cells.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Price \\ Qty",
                    "B1": 1,
                    "C1": 5,
                    "D1": 10,
                    "E1": 20,
                    "A2": 15,
                    "A3": 40,
                    "A4": 120
                },
                "answer": "B2",
                "fill": {
                    "down": 2,
                    "right": 3
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B1": 2,
                        "E1": 3,
                        "A3": 7
                    },
                    "expected": [
                        30,
                        75,
                        150,
                        45,
                        14,
                        35,
                        70,
                        21,
                        240,
                        600,
                        1200,
                        360
                    ]
                }
            ],
            "expected": [
                15,
                75,
                150,
                300,
                40,
                200,
                400,
                800,
                120,
                600,
                1200,
                2400
            ]
        },
        {
            "id": "xl-share",
            "topic": "arithmetic",
            "title": "Share of the total",
            "difficulty": "intermediate",
            "objective": "Combine a relative and an absolute range in one formula.",
            "instructions": "B2:B6 hold sales of five products. In C2 enter a formula for each product's share of total sales (a fraction, not rounded) that works when copied down to C6. The lab copies it down for you.",
            "solution": "=B2/SUM($B$2:$B$6)",
            "hints": [
                "Divide the product's sales by the total of all five.",
                "The total range must not move when the formula is copied."
            ],
            "explanation": "The numerator B2 should move down with each row, the denominator range should not, so it is written $B$2:$B$6. Format the result as a percentage to read it as one.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Product",
                    "B1": "Sales",
                    "A2": "Pens",
                    "B2": 1200,
                    "A3": "Books",
                    "B3": 3400,
                    "A4": "Bags",
                    "B4": 2500,
                    "A5": "Lamps",
                    "B5": 800,
                    "A6": "Boxes",
                    "B6": 2100
                },
                "answer": "C2",
                "fill": {
                    "down": 4,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B2": 700,
                        "B5": 1900,
                        "B6": 400
                    },
                    "expected": [
                        0.0786516853933,
                        0.38202247191,
                        0.280898876404,
                        0.213483146067,
                        0.0449438202247
                    ]
                }
            ],
            "expected": [
                0.12,
                0.34,
                0.25,
                0.08,
                0.21
            ]
        },
        {
            "id": "xl-sum",
            "topic": "summaries",
            "title": "Add up a column",
            "difficulty": "beginner",
            "objective": "Total a range with SUM.",
            "instructions": "B2:B7 hold six monthly sales figures. In B8 enter a formula for the total.",
            "solution": "=SUM(B2:B7)",
            "hints": [
                "SUM adds the numbers in a range.",
                "A range is written first cell, colon, last cell."
            ],
            "explanation": "SUM(B2:B7) adds every number from B2 down to B7. A range keeps working when a value changes, and is shorter and safer than B2+B3+B4+B5+B6+B7.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Month",
                    "B1": "Sales",
                    "A2": "Jan",
                    "B2": 12000,
                    "A3": "Feb",
                    "B3": 9500,
                    "A4": "Mar",
                    "B4": 14200,
                    "A5": "Apr",
                    "B5": 11800,
                    "A6": "May",
                    "B6": 15750,
                    "A7": "Jun",
                    "B7": 10300
                },
                "answer": "B8",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B2": 8000,
                        "B5": 18000,
                        "B7": 5000
                    },
                    "expected": [
                        70450
                    ]
                }
            ],
            "expected": [
                73550
            ]
        },
        {
            "id": "xl-average",
            "topic": "summaries",
            "title": "The average",
            "difficulty": "beginner",
            "objective": "Find an average with AVERAGE.",
            "instructions": "In B8 enter a formula for the average monthly sales in B2:B7.",
            "solution": "=AVERAGE(B2:B7)",
            "hints": [
                "There is a function named AVERAGE."
            ],
            "explanation": "AVERAGE adds the numbers and divides by how many there are. It ignores empty cells and text in the range, so a blank month is not counted as zero.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Month",
                    "B1": "Sales",
                    "A2": "Jan",
                    "B2": 12000,
                    "A3": "Feb",
                    "B3": 9500,
                    "A4": "Mar",
                    "B4": 14200,
                    "A5": "Apr",
                    "B5": 11800,
                    "A6": "May",
                    "B6": 15750,
                    "A7": "Jun",
                    "B7": 10300
                },
                "answer": "B8",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B2": 8000,
                        "B5": 18000,
                        "B7": 5000
                    },
                    "expected": [
                        11741.6666667
                    ]
                }
            ],
            "expected": [
                12258.3333333
            ]
        },
        {
            "id": "xl-max-min",
            "topic": "summaries",
            "title": "The spread",
            "difficulty": "beginner",
            "objective": "Combine MAX and MIN.",
            "instructions": "In B8 enter a formula for the difference between the best and the worst month in B2:B7.",
            "solution": "=MAX(B2:B7)-MIN(B2:B7)",
            "hints": [
                "MAX gives the largest, MIN the smallest.",
                "Subtract one from the other."
            ],
            "explanation": "MAX and MIN each return one number, so they can be used inside a larger formula. The result is the range of the data: how far apart the best and worst months are.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Month",
                    "B1": "Sales",
                    "A2": "Jan",
                    "B2": 12000,
                    "A3": "Feb",
                    "B3": 9500,
                    "A4": "Mar",
                    "B4": 14200,
                    "A5": "Apr",
                    "B5": 11800,
                    "A6": "May",
                    "B6": 15750,
                    "A7": "Jun",
                    "B7": 10300
                },
                "answer": "B8",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B2": 8000,
                        "B5": 18000,
                        "B7": 5000
                    },
                    "expected": [
                        13000
                    ]
                }
            ],
            "expected": [
                6250
            ]
        },
        {
            "id": "xl-count-vs-counta",
            "topic": "summaries",
            "title": "How many marks were entered",
            "difficulty": "beginner",
            "objective": "Count numbers with COUNT.",
            "instructions": "B2:B7 hold marks. Some students have no marks yet. In B8 enter a formula for how many marks have been entered.",
            "solution": "=COUNT(B2:B7)",
            "hints": [
                "COUNT counts cells that hold numbers.",
                "COUNTA would count any non-empty cell, text included."
            ],
            "explanation": "COUNT counts numbers only; COUNTA counts every cell that is not empty, and COUNTBLANK counts empty cells. For a column of numbers, COUNT answers how many values have been entered.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Student",
                    "B1": "Marks",
                    "A2": "Asha",
                    "B2": 78,
                    "A3": "Bilal",
                    "A4": "Chitra",
                    "B4": 91,
                    "A5": "Divya",
                    "B5": 66,
                    "A6": "Farhan",
                    "A7": "Gita",
                    "B7": 85
                },
                "answer": "B8",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B3": 70,
                        "B6": 55
                    },
                    "expected": [
                        6
                    ]
                }
            ],
            "expected": [
                4
            ]
        },
        {
            "id": "xl-countblank",
            "topic": "summaries",
            "title": "Who is missing",
            "difficulty": "beginner",
            "objective": "Count empty cells with COUNTBLANK.",
            "instructions": "In B8 enter a formula for the number of students in B2:B7 who have no marks yet.",
            "solution": "=COUNTBLANK(B2:B7)",
            "hints": [
                "There is a function that counts empty cells."
            ],
            "explanation": "COUNTBLANK counts the empty cells in a range, which makes it a quick check of missing data. A cell holding a formula that returns empty text is also counted.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Student",
                    "B1": "Marks",
                    "A2": "Asha",
                    "B2": 78,
                    "A3": "Bilal",
                    "A4": "Chitra",
                    "B4": 91,
                    "A5": "Divya",
                    "B5": 66,
                    "A6": "Farhan",
                    "A7": "Gita",
                    "B7": 85
                },
                "answer": "B8",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B3": 70,
                        "B6": 55
                    },
                    "expected": [
                        0
                    ]
                }
            ],
            "expected": [
                2
            ]
        },
        {
            "id": "xl-median",
            "topic": "summaries",
            "title": "The middle value",
            "difficulty": "beginner",
            "objective": "Find the median.",
            "instructions": "In B8 enter a formula for the median of the monthly sales in B2:B7.",
            "solution": "=MEDIAN(B2:B7)",
            "hints": [
                "MEDIAN is the middle value when the numbers are sorted."
            ],
            "explanation": "With an even number of values the median is the average of the two middle ones. The median is less affected by one very large or very small value than the average is.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Month",
                    "B1": "Sales",
                    "A2": "Jan",
                    "B2": 12000,
                    "A3": "Feb",
                    "B3": 9500,
                    "A4": "Mar",
                    "B4": 14200,
                    "A5": "Apr",
                    "B5": 11800,
                    "A6": "May",
                    "B6": 15750,
                    "A7": "Jun",
                    "B7": 10300
                },
                "answer": "B8",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B2": 8000,
                        "B5": 18000,
                        "B7": 5000
                    },
                    "expected": [
                        11850.0
                    ]
                }
            ],
            "expected": [
                11900.0
            ]
        },
        {
            "id": "xl-round",
            "topic": "numbers",
            "title": "Round money",
            "difficulty": "beginner",
            "objective": "Round a result to two decimals with ROUND.",
            "instructions": "B2 is a price and B3 is a quantity that can be a fraction of a kilo. In B4 enter a formula for the amount to pay, rounded to 2 decimals.",
            "solution": "=ROUND(B2*B3,2)",
            "hints": [
                "ROUND needs the number and how many decimals to keep.",
                "Put the multiplication inside ROUND."
            ],
            "explanation": "ROUND changes the value itself, not only how it is displayed. Number formatting alone would show 2 decimals but keep the longer value behind it, which can make totals differ by a paisa from the numbers people see.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A2": "Price per kg",
                    "B2": 83.35,
                    "A3": "Kilograms",
                    "B3": 2.5,
                    "A4": "Amount"
                },
                "answer": "B4",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B2": 49.99,
                        "B3": 1.35
                    },
                    "expected": [
                        67.49
                    ]
                }
            ],
            "expected": [
                208.38
            ]
        },
        {
            "id": "xl-roundup",
            "topic": "numbers",
            "title": "Boxes needed",
            "difficulty": "intermediate",
            "objective": "Round up with ROUNDUP.",
            "instructions": "B2 is the number of items to pack and B3 is how many fit in a box. In B4 enter a formula for the number of boxes needed (a part box still needs a whole box).",
            "solution": "=ROUNDUP(B2/B3,0)",
            "hints": [
                "Divide the items by the box size.",
                "ROUNDUP always rounds away from zero."
            ],
            "explanation": "ROUND would round 4.2 boxes down to 4 and leave items without a box. ROUNDUP(x,0) always goes up to the next whole number, which is what a real-world count of containers needs.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A2": "Items",
                    "B2": 250,
                    "A3": "Per box",
                    "B3": 12,
                    "A4": "Boxes"
                },
                "answer": "B4",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B2": 96,
                        "B3": 24
                    },
                    "expected": [
                        4
                    ]
                }
            ],
            "expected": [
                21
            ]
        },
        {
            "id": "xl-mod",
            "topic": "numbers",
            "title": "What is left over",
            "difficulty": "intermediate",
            "objective": "Find a remainder with MOD.",
            "instructions": "B2 is the number of pencils and B3 is the number of pencils in a pack. In B4 enter a formula for how many pencils are left over after making full packs.",
            "solution": "=MOD(B2,B3)",
            "hints": [
                "MOD gives the remainder after division."
            ],
            "explanation": "MOD(250,12) is 10 because 12 goes into 250 twenty times (240) with 10 left. It is useful for leftovers, for alternating rows (MOD(row,2)) and for cycles such as days of a week.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A2": "Pencils",
                    "B2": 250,
                    "A3": "Per pack",
                    "B3": 12,
                    "A4": "Left over"
                },
                "answer": "B4",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B2": 97,
                        "B3": 10
                    },
                    "expected": [
                        7
                    ]
                }
            ],
            "expected": [
                10
            ]
        },
        {
            "id": "xl-int",
            "topic": "numbers",
            "title": "Whole weeks",
            "difficulty": "beginner",
            "objective": "Drop the decimals with INT.",
            "instructions": "B2 is a number of days. In B3 enter a formula for the number of complete weeks (7 days) in it.",
            "solution": "=INT(B2/7)",
            "hints": [
                "Divide by 7, then keep only the whole part."
            ],
            "explanation": "INT rounds down to the nearest whole number. For positive numbers it simply drops the decimals, so 45/7 = 6.43 becomes 6 complete weeks.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A2": "Days",
                    "B2": 45,
                    "A3": "Complete weeks"
                },
                "answer": "B3",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B2": 100
                    },
                    "expected": [
                        14
                    ]
                }
            ],
            "expected": [
                6
            ]
        },
        {
            "id": "xl-if",
            "topic": "decisions",
            "title": "Pass or fail",
            "difficulty": "beginner",
            "objective": "Choose between two results with IF.",
            "instructions": "B2 holds a student's marks. In C2 enter a formula that shows Pass if the marks are 40 or more and Fail otherwise.",
            "solution": "=IF(B2>=40,\"Pass\",\"Fail\")",
            "hints": [
                "IF has three parts: a test, the result if true, the result if false.",
                "Text results go in double quotes."
            ],
            "explanation": "IF(test, if true, if false) checks the test and returns one of two values. Note >= (greater than or equal to): using > would fail a student who scored exactly 40.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Student",
                    "B1": "Marks",
                    "A2": "Asha",
                    "B2": 40
                },
                "answer": "C2",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B2": 39
                    },
                    "expected": [
                        "Fail"
                    ]
                }
            ],
            "expected": [
                "Pass"
            ]
        },
        {
            "id": "xl-if-and",
            "topic": "decisions",
            "title": "Both conditions",
            "difficulty": "intermediate",
            "objective": "Combine two conditions with AND.",
            "instructions": "B2 is the sales and C2 is the number of complaints. In D2 enter a formula that shows Bonus when sales are at least 100000 and complaints are below 3, otherwise No.",
            "solution": "=IF(AND(B2>=100000,C2<3),\"Bonus\",\"No\")",
            "hints": [
                "AND(test1, test2) is true only when both are true.",
                "Put AND inside the first part of IF."
            ],
            "explanation": "AND returns TRUE only when every condition is true. Its result is a test that IF can use. OR would give a bonus when either condition was met.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Sales",
                    "B2": 120000,
                    "C2": 1
                },
                "answer": "D2",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B2": 99000
                    },
                    "expected": [
                        "No"
                    ]
                }
            ],
            "expected": [
                "Bonus"
            ]
        },
        {
            "id": "xl-if-or",
            "topic": "decisions",
            "title": "Either condition",
            "difficulty": "intermediate",
            "objective": "Combine two conditions with OR.",
            "instructions": "B2 is a city. In C2 enter a formula that shows Metro for Mumbai or Delhi and Other for any other city.",
            "solution": "=IF(OR(B2=\"Mumbai\",B2=\"Delhi\"),\"Metro\",\"Other\")",
            "hints": [
                "OR is true when at least one condition is true.",
                "Each comparison needs the cell on the left: B2=\"Mumbai\"."
            ],
            "explanation": "A comparison such as B2=\"Mumbai\" is not case sensitive in Excel, so 'mumbai' also matches. Each city needs its own comparison; OR(B2=\"Mumbai\",\"Delhi\") would not do what it seems to say.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A2": "City",
                    "B2": "Delhi"
                },
                "answer": "C2",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B2": "Pune"
                    },
                    "expected": [
                        "Other"
                    ]
                }
            ],
            "expected": [
                "Metro"
            ]
        },
        {
            "id": "xl-ifs",
            "topic": "decisions",
            "title": "A grade from marks",
            "difficulty": "intermediate",
            "objective": "Choose among several bands with IFS.",
            "instructions": "B2 holds marks out of 100. In C2 enter a formula giving A for 80 or more, B for 60 to 79, C for 40 to 59 and D below 40.",
            "solution": "=IFS(B2>=80,\"A\",B2>=60,\"B\",B2>=40,\"C\",TRUE,\"D\")",
            "hints": [
                "Test the highest band first.",
                "The last pair can use TRUE as a catch-all."
            ],
            "explanation": "IFS checks the conditions in order and returns the value of the first true one, so the order matters. TRUE as the last test works as 'otherwise'. Older Excel versions do not have IFS and use nested IF instead.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A2": "Marks",
                    "B2": 72
                },
                "answer": "C2",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B2": 38
                    },
                    "expected": [
                        "D"
                    ]
                }
            ],
            "expected": [
                "B"
            ]
        },
        {
            "id": "xl-iferror",
            "topic": "decisions",
            "title": "Hide a division error",
            "difficulty": "intermediate",
            "objective": "Replace an error with IFERROR.",
            "instructions": "B2 is the total sales and B3 is the number of sales people (it can be 0). In B4 enter a formula for sales per person that shows 0 instead of an error when B3 is 0.",
            "solution": "=IFERROR(B2/B3,0)",
            "hints": [
                "IFERROR(value, what to show if it is an error).",
                "Dividing by zero gives #DIV/0!."
            ],
            "explanation": "IFERROR returns the second argument whenever the first is an error of any kind. That also hides real mistakes, such as a wrong cell reference, so use it only where an error is expected and explain what the replacement means.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A2": "Sales",
                    "B2": 50000,
                    "A3": "People",
                    "B3": 4,
                    "A4": "Per person"
                },
                "answer": "B4",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B3": 0
                    },
                    "expected": [
                        0
                    ]
                }
            ],
            "expected": [
                12500.0
            ]
        },
        {
            "id": "xl-sumif",
            "topic": "conditional",
            "title": "Total for one region",
            "difficulty": "intermediate",
            "objective": "Add only the rows that match with SUMIF.",
            "instructions": "A2:A7 hold regions and C2:C7 hold amounts. In C9 enter a formula for the total amount for the North region.",
            "solution": "=SUMIF(A2:A7,\"North\",C2:C7)",
            "hints": [
                "SUMIF(range to test, condition, range to add).",
                "The condition is text, so it goes in quotes."
            ],
            "explanation": "SUMIF looks at the first range, picks the rows that meet the condition and adds the matching cells in the third range. The test is not case sensitive.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Region",
                    "B1": "Product",
                    "C1": "Amount",
                    "A2": "North",
                    "B2": "Pen",
                    "C2": 120,
                    "A3": "South",
                    "B3": "Book",
                    "C3": 340,
                    "A4": "North",
                    "B4": "Book",
                    "C4": 210,
                    "A5": "East",
                    "B5": "Pen",
                    "C5": 90,
                    "A6": "South",
                    "B6": "Pen",
                    "C6": 150,
                    "A7": "North",
                    "B7": "Pen",
                    "C7": 60
                },
                "answer": "C9",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "A3": "North",
                        "C4": 500,
                        "B6": "Book",
                        "A5": "south",
                        "C5": 130,
                        "C2": 200
                    },
                    "expected": [
                        1100
                    ]
                }
            ],
            "expected": [
                390
            ]
        },
        {
            "id": "xl-countif",
            "topic": "conditional",
            "title": "Count above a limit",
            "difficulty": "intermediate",
            "objective": "Count with a comparison criterion.",
            "instructions": "In C9 enter a formula for the number of amounts in C2:C7 that are greater than 100.",
            "solution": "=COUNTIF(C2:C7,\">100\")",
            "hints": [
                "The comparison goes inside the quotes: \">100\".",
                "COUNTIF needs the range and the condition."
            ],
            "explanation": "In COUNTIF and SUMIF the criterion is text such as \">100\", \"<=50\" or \"<>0\". To compare with a value in a cell, join them: \">\"&E1.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Region",
                    "B1": "Product",
                    "C1": "Amount",
                    "A2": "North",
                    "B2": "Pen",
                    "C2": 120,
                    "A3": "South",
                    "B3": "Book",
                    "C3": 340,
                    "A4": "North",
                    "B4": "Book",
                    "C4": 210,
                    "A5": "East",
                    "B5": "Pen",
                    "C5": 90,
                    "A6": "South",
                    "B6": "Pen",
                    "C6": 150,
                    "A7": "North",
                    "B7": "Pen",
                    "C7": 60
                },
                "answer": "C9",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "A3": "North",
                        "C4": 500,
                        "B6": "Book",
                        "A5": "south",
                        "C5": 130,
                        "C2": 200
                    },
                    "expected": [
                        5
                    ]
                }
            ],
            "expected": [
                4
            ]
        },
        {
            "id": "xl-sumifs",
            "topic": "conditional",
            "title": "Two conditions",
            "difficulty": "intermediate",
            "objective": "Add the rows that meet two conditions with SUMIFS.",
            "instructions": "In C9 enter a formula for the total amount of Pen sales in the North region.",
            "solution": "=SUMIFS(C2:C7,A2:A7,\"North\",B2:B7,\"Pen\")",
            "hints": [
                "SUMIFS starts with the range to add.",
                "Then come pairs of a range and its condition."
            ],
            "explanation": "In SUMIFS the range to add comes first, unlike SUMIF where it comes last. A row is added only when every pair of range and condition is met.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Region",
                    "B1": "Product",
                    "C1": "Amount",
                    "A2": "North",
                    "B2": "Pen",
                    "C2": 120,
                    "A3": "South",
                    "B3": "Book",
                    "C3": 340,
                    "A4": "North",
                    "B4": "Book",
                    "C4": 210,
                    "A5": "East",
                    "B5": "Pen",
                    "C5": 90,
                    "A6": "South",
                    "B6": "Pen",
                    "C6": 150,
                    "A7": "North",
                    "B7": "Pen",
                    "C7": 60
                },
                "answer": "C9",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "A3": "North",
                        "C4": 500,
                        "B6": "Book",
                        "A5": "south",
                        "C5": 130,
                        "C2": 200
                    },
                    "expected": [
                        260
                    ]
                }
            ],
            "expected": [
                180
            ]
        },
        {
            "id": "xl-countifs",
            "topic": "conditional",
            "title": "Count with two conditions",
            "difficulty": "intermediate",
            "objective": "Count rows meeting two conditions.",
            "instructions": "In C9 enter a formula for the number of South rows with an amount of 150 or more.",
            "solution": "=COUNTIFS(A2:A7,\"South\",C2:C7,\">=150\")",
            "hints": [
                "COUNTIFS takes pairs of a range and a condition."
            ],
            "explanation": "COUNTIFS needs every condition to be true for a row to count. The ranges must be the same size, otherwise the result is #VALUE!.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Region",
                    "B1": "Product",
                    "C1": "Amount",
                    "A2": "North",
                    "B2": "Pen",
                    "C2": 120,
                    "A3": "South",
                    "B3": "Book",
                    "C3": 340,
                    "A4": "North",
                    "B4": "Book",
                    "C4": 210,
                    "A5": "East",
                    "B5": "Pen",
                    "C5": 90,
                    "A6": "South",
                    "B6": "Pen",
                    "C6": 150,
                    "A7": "North",
                    "B7": "Pen",
                    "C7": 60
                },
                "answer": "C9",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "A3": "North",
                        "C4": 500,
                        "B6": "Book",
                        "A5": "south",
                        "C5": 130,
                        "C2": 200
                    },
                    "expected": [
                        1
                    ]
                }
            ],
            "expected": [
                2
            ]
        },
        {
            "id": "xl-averageif",
            "topic": "conditional",
            "title": "Average for one product",
            "difficulty": "intermediate",
            "objective": "Average only matching rows.",
            "instructions": "In C9 enter a formula for the average amount of the Book rows.",
            "solution": "=AVERAGEIF(B2:B7,\"Book\",C2:C7)",
            "hints": [
                "AVERAGEIF(range to test, condition, range to average)."
            ],
            "explanation": "AVERAGEIF works like SUMIF, but returns the average of the matching rows. It gives #DIV/0! when nothing matches, so it is often wrapped in IFERROR.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Region",
                    "B1": "Product",
                    "C1": "Amount",
                    "A2": "North",
                    "B2": "Pen",
                    "C2": 120,
                    "A3": "South",
                    "B3": "Book",
                    "C3": 340,
                    "A4": "North",
                    "B4": "Book",
                    "C4": 210,
                    "A5": "East",
                    "B5": "Pen",
                    "C5": 90,
                    "A6": "South",
                    "B6": "Pen",
                    "C6": 150,
                    "A7": "North",
                    "B7": "Pen",
                    "C7": 60
                },
                "answer": "C9",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "A3": "North",
                        "C4": 500,
                        "B6": "Book",
                        "A5": "south",
                        "C5": 130,
                        "C2": 200
                    },
                    "expected": [
                        330
                    ]
                }
            ],
            "expected": [
                275
            ]
        },
        {
            "id": "xl-wildcard",
            "topic": "conditional",
            "title": "Names that start with a letter",
            "difficulty": "intermediate",
            "objective": "Use a wildcard in a criterion.",
            "instructions": "A2:A7 hold names. In C9 enter a formula for how many names start with the letter S.",
            "solution": "=COUNTIF(A2:A7,\"S*\")",
            "hints": [
                "* stands for any run of characters.",
                "S* means S followed by anything."
            ],
            "explanation": "In a criterion, * matches any number of characters and ? matches exactly one. \"S*\" counts every name that starts with S, whatever follows.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Name",
                    "A2": "Sana",
                    "A3": "Ravi",
                    "A4": "Sumit",
                    "A5": "Asha",
                    "A6": "Sarita",
                    "A7": "Bilal"
                },
                "answer": "C9",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "A3": "Seema",
                        "A4": "Tara",
                        "A7": "Sam"
                    },
                    "expected": [
                        4
                    ]
                }
            ],
            "expected": [
                3
            ]
        },
        {
            "id": "xl-sumproduct",
            "topic": "conditional",
            "title": "Total value of an order",
            "difficulty": "advanced",
            "objective": "Multiply two columns and add with SUMPRODUCT.",
            "instructions": "B2:B5 hold quantities and C2:C5 hold unit prices. In C7 enter one formula for the total value of the order without helper columns.",
            "solution": "=SUMPRODUCT(B2:B5,C2:C5)",
            "hints": [
                "SUMPRODUCT multiplies matching cells of its ranges and adds the results."
            ],
            "explanation": "SUMPRODUCT does in one formula what a helper column of =B2*C2 followed by SUM would do. The ranges must be the same size.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Item",
                    "B1": "Qty",
                    "C1": "Price",
                    "A2": "Pen",
                    "B2": 10,
                    "C2": 12,
                    "A3": "Book",
                    "B3": 3,
                    "C3": 150,
                    "A4": "Bag",
                    "B4": 1,
                    "C4": 899,
                    "A5": "Lamp",
                    "B5": 2,
                    "C5": 450
                },
                "answer": "C7",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B2": 4,
                        "C4": 500,
                        "B5": 7
                    },
                    "expected": [
                        4148
                    ]
                }
            ],
            "expected": [
                2369
            ]
        },
        {
            "id": "xl-left",
            "topic": "text",
            "title": "The first letters",
            "difficulty": "beginner",
            "objective": "Take the start of a text with LEFT.",
            "instructions": "A2 holds a product code such as ELE-0425. In B2 enter a formula for its first three letters.",
            "solution": "=LEFT(A2,3)",
            "hints": [
                "LEFT(text, number of characters)."
            ],
            "explanation": "LEFT returns characters from the start, RIGHT from the end, and MID from any position. They always return text, even when the characters are digits.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Code",
                    "A2": "ELE-0425"
                },
                "answer": "B2",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "A2": "STA-0131"
                    },
                    "expected": [
                        "STA"
                    ]
                }
            ],
            "expected": [
                "ELE"
            ]
        },
        {
            "id": "xl-mid",
            "topic": "text",
            "title": "A part from the middle",
            "difficulty": "intermediate",
            "objective": "Take characters from the middle with MID.",
            "instructions": "A2 holds a code like ELE-0425. In B2 enter a formula for the 4 digits after the hyphen.",
            "solution": "=MID(A2,5,4)",
            "hints": [
                "MID(text, start position, how many characters).",
                "The first character is position 1."
            ],
            "explanation": "In ELE-0425 the digits start at position 5. MID is also the usual way to cut text apart when a separator position is known; combined with FIND it works for text of changing length.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Code",
                    "A2": "ELE-0425"
                },
                "answer": "B2",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "A2": "STA-0131"
                    },
                    "expected": [
                        "0131"
                    ]
                }
            ],
            "expected": [
                "0425"
            ]
        },
        {
            "id": "xl-concat",
            "topic": "text",
            "title": "A full name",
            "difficulty": "beginner",
            "objective": "Join text with &.",
            "instructions": "A2 holds a first name and B2 a last name. In C2 enter a formula for the full name with one space between them.",
            "solution": "=A2&\" \"&B2",
            "hints": [
                "The & joins text.",
                "A space is the text \" \"."
            ],
            "explanation": "& (or CONCAT) joins values. The space has to be added yourself as \" \". Without it the names would run together.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "First",
                    "B1": "Last",
                    "A2": "Asha",
                    "B2": "Rao"
                },
                "answer": "C2",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "A2": "Bilal",
                        "B2": "Khan"
                    },
                    "expected": [
                        "Bilal Khan"
                    ]
                }
            ],
            "expected": [
                "Asha Rao"
            ]
        },
        {
            "id": "xl-substitute",
            "topic": "text",
            "title": "Remove hyphens",
            "difficulty": "intermediate",
            "objective": "Replace text with SUBSTITUTE.",
            "instructions": "A2 holds a phone number such as 98-76-54-3210. In B2 enter a formula that shows it without the hyphens.",
            "solution": "=SUBSTITUTE(A2,\"-\",\"\")",
            "hints": [
                "SUBSTITUTE(text, old text, new text).",
                "The new text can be empty: \"\"."
            ],
            "explanation": "SUBSTITUTE replaces every occurrence of the old text. It is case sensitive. REPLACE works by position instead.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Phone",
                    "A2": "98-76-54-3210"
                },
                "answer": "B2",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "A2": "12-34-56-7890"
                    },
                    "expected": [
                        "1234567890"
                    ]
                }
            ],
            "expected": [
                "9876543210"
            ]
        },
        {
            "id": "xl-length",
            "topic": "text",
            "title": "Is the code the right length",
            "difficulty": "intermediate",
            "objective": "Check text length with LEN.",
            "instructions": "A2 holds an item code that must be exactly 8 characters. In B2 enter a formula that shows OK if it is 8 characters and Check otherwise.",
            "solution": "=IF(LEN(A2)=8,\"OK\",\"Check\")",
            "hints": [
                "LEN counts the characters, spaces included."
            ],
            "explanation": "LEN counts every character, including spaces, which is why a code with a trailing space fails a length check. Cleaning with TRIM first usually fixes that.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Code",
                    "A2": "ELE-0425"
                },
                "answer": "B2",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "A2": "ELE-04252"
                    },
                    "expected": [
                        "Check"
                    ]
                }
            ],
            "expected": [
                "OK"
            ]
        },
        {
            "id": "xl-date-add",
            "topic": "dates",
            "title": "A due date",
            "difficulty": "beginner",
            "objective": "Add days to a date.",
            "instructions": "B2 holds an invoice date. In B3 enter a formula for the date 30 days later.",
            "solution": "=B2+30",
            "hints": [
                "A date is a number of days, so you can add to it."
            ],
            "explanation": "Excel stores a date as a serial number (1 January 2024 is 45292), so adding 30 adds 30 days. If the cell shows a number instead of a date, change its format to a date.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A2": "Invoice date",
                    "B2": 45322,
                    "A3": "Due date"
                },
                "answer": "B3",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {
                    "B2": "date",
                    "B3": "date"
                }
            },
            "variants": [
                {
                    "cells": {
                        "B2": 45342
                    },
                    "expected": [
                        45372
                    ]
                }
            ],
            "expected": [
                45352
            ]
        },
        {
            "id": "xl-edate",
            "topic": "dates",
            "title": "Three months later",
            "difficulty": "intermediate",
            "objective": "Move a date by whole months with EDATE.",
            "instructions": "In B3 enter a formula for the date 3 months after the date in B2.",
            "solution": "=EDATE(B2,3)",
            "hints": [
                "EDATE(start date, months)."
            ],
            "explanation": "EDATE keeps the day of the month when it can and uses the last day of a shorter month when it cannot, so 31 January plus 1 month is 29 February 2024. Adding 90 days would not do the same.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A2": "Invoice date",
                    "B2": 45322,
                    "A3": "Renewal"
                },
                "answer": "B3",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {
                    "B2": "date",
                    "B3": "date"
                }
            },
            "variants": [
                {
                    "cells": {
                        "B2": 45626
                    },
                    "expected": [
                        45716
                    ]
                }
            ],
            "expected": [
                45412
            ]
        },
        {
            "id": "xl-eomonth",
            "topic": "dates",
            "title": "The last day of the month",
            "difficulty": "intermediate",
            "objective": "Find a month end with EOMONTH.",
            "instructions": "In B3 enter a formula for the last day of the month of the date in B2.",
            "solution": "=EOMONTH(B2,0)",
            "hints": [
                "EOMONTH(date, months to move). Use 0 for the same month."
            ],
            "explanation": "EOMONTH returns the last day of the month that is the given number of months away, so you never need to know whether the month has 28, 29, 30 or 31 days.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A2": "Invoice date",
                    "B2": 45322,
                    "A3": "Month end"
                },
                "answer": "B3",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {
                    "B2": "date",
                    "B3": "date"
                }
            },
            "variants": [
                {
                    "cells": {
                        "B2": 45342
                    },
                    "expected": [
                        45351
                    ]
                }
            ],
            "expected": [
                45322
            ]
        },
        {
            "id": "xl-year-month",
            "topic": "dates",
            "title": "Year and month as text",
            "difficulty": "intermediate",
            "objective": "Take parts of a date with YEAR and MONTH.",
            "instructions": "B2 holds a date. In B3 enter a formula that shows its year and month as text like 2024-1 (year, a hyphen, then the month number without a leading zero).",
            "solution": "=YEAR(B2)&\"-\"&MONTH(B2)",
            "hints": [
                "YEAR and MONTH return numbers.",
                "Join the parts with &."
            ],
            "explanation": "YEAR, MONTH and DAY each return one part of a date as a number. Joining them with & turns them into text, which is handy for grouping by month. TEXT(B2,\"yyyy-mm\") would add a leading zero, but TEXT is not part of this lab.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A2": "Invoice date",
                    "B2": 45322,
                    "A3": "Period"
                },
                "answer": "B3",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {
                    "B2": "date"
                }
            },
            "variants": [
                {
                    "cells": {
                        "B2": 45601
                    },
                    "expected": [
                        "2024-11"
                    ]
                }
            ],
            "expected": [
                "2024-1"
            ]
        },
        {
            "id": "xl-vlookup",
            "topic": "lookups",
            "title": "Find a price by code",
            "difficulty": "intermediate",
            "objective": "Look up a value with VLOOKUP and an exact match.",
            "instructions": "A2:C5 is a price list. E2 holds a code. In F3 enter a formula for the price of that code. A wrong code must not return a nearby price.",
            "solution": "=VLOOKUP(E2,A2:C5,3,FALSE)",
            "hints": [
                "VLOOKUP(what to find, table, column number, match type).",
                "FALSE as the last argument means an exact match."
            ],
            "explanation": "VLOOKUP looks in the first column of the table and returns a value from the column number you give. The last argument decides everything: FALSE means exact match, while TRUE (or leaving it out) looks for the closest smaller value in sorted data, which can return a wrong price for a code that is not in the list.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Code",
                    "B1": "Product",
                    "C1": "Price",
                    "A2": 101,
                    "B2": "Pen",
                    "C2": 12,
                    "A3": 102,
                    "B3": "Book",
                    "C3": 150,
                    "A4": 105,
                    "B4": "Bag",
                    "C4": 899,
                    "A5": 110,
                    "B5": "Lamp",
                    "C5": 450,
                    "E1": "Code to find",
                    "E2": 105,
                    "E3": "Price"
                },
                "answer": "F3",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "E2": 101
                    },
                    "expected": [
                        12
                    ]
                }
            ],
            "expected": [
                899
            ]
        },
        {
            "id": "xl-index-match",
            "topic": "lookups",
            "title": "Look up to the left",
            "difficulty": "advanced",
            "objective": "Combine INDEX and MATCH.",
            "instructions": "A2:C5 is a price list with the product in column B. E2 now holds a product name. In F3 enter a formula for its code in column A, which VLOOKUP cannot return because it lies to the left.",
            "solution": "=INDEX(A2:A5,MATCH(E2,B2:B5,0))",
            "hints": [
                "MATCH finds the position of the name in B2:B5.",
                "INDEX returns the cell at that position from A2:A5.",
                "0 in MATCH means an exact match."
            ],
            "explanation": "MATCH(E2,B2:B5,0) returns the position of the name (3 for Bag). INDEX(A2:A5,3) then returns the third code. The two functions together can look in any direction, and do not break when columns are inserted.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Code",
                    "B1": "Product",
                    "C1": "Price",
                    "A2": 101,
                    "B2": "Pen",
                    "C2": 12,
                    "A3": 102,
                    "B3": "Book",
                    "C3": 150,
                    "A4": 105,
                    "B4": "Bag",
                    "C4": 899,
                    "A5": 110,
                    "B5": "Lamp",
                    "C5": 450,
                    "E1": "Product to find",
                    "E2": "Bag",
                    "E3": "Code"
                },
                "answer": "F3",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "E2": "Lamp"
                    },
                    "expected": [
                        110
                    ]
                }
            ],
            "expected": [
                105
            ]
        },
        {
            "id": "xl-xlookup",
            "topic": "lookups",
            "title": "A friendly not found",
            "difficulty": "advanced",
            "objective": "Use XLOOKUP with a result for a missing value.",
            "instructions": "E2 holds a code that may not be in the list. In F3 enter a formula for its price with the text Not listed when the code does not exist.",
            "solution": "=XLOOKUP(E2,A2:A5,C2:C5,\"Not listed\")",
            "hints": [
                "XLOOKUP(what to find, where to look, what to return, if not found).",
                "The fourth argument is shown when nothing matches."
            ],
            "explanation": "XLOOKUP is the modern replacement for VLOOKUP: it needs no column number, can return from the left and has a built-in not-found result. It needs a recent Excel version (2021 or Microsoft 365).",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Code",
                    "B1": "Product",
                    "C1": "Price",
                    "A2": 101,
                    "B2": "Pen",
                    "C2": 12,
                    "A3": 102,
                    "B3": "Book",
                    "C3": 150,
                    "A4": 105,
                    "B4": "Bag",
                    "C4": 899,
                    "A5": 110,
                    "B5": "Lamp",
                    "C5": 450,
                    "E1": "Code to find",
                    "E2": 107,
                    "E3": "Price"
                },
                "answer": "F3",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "E2": 102
                    },
                    "expected": [
                        150
                    ]
                }
            ],
            "expected": [
                "Not listed"
            ]
        },
        {
            "id": "xl-vlookup-approx",
            "topic": "lookups",
            "title": "A commission band",
            "difficulty": "advanced",
            "objective": "Use an approximate match on sorted bands.",
            "instructions": "A2:B5 list sales bands (the lowest sales for each band, sorted ascending) and the commission rate. D2 holds a salesperson's sales. In E2 enter a formula that returns the rate for their band.",
            "solution": "=VLOOKUP(D2,A2:B5,2,TRUE)",
            "hints": [
                "With sorted bands, TRUE finds the largest band start that is not above the value."
            ],
            "explanation": "For bands, an approximate match is the right tool: the table must be sorted ascending, and VLOOKUP returns the row of the largest value that does not exceed the lookup value. A sale below the first band gives #N/A.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "From",
                    "B1": "Rate",
                    "A2": 0,
                    "B2": 0.02,
                    "A3": 50000,
                    "B3": 0.04,
                    "A4": 100000,
                    "B4": 0.06,
                    "A5": 250000,
                    "B5": 0.08,
                    "D1": "Sales",
                    "D2": 130000
                },
                "answer": "E2",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {
                    "B2": "percent",
                    "B3": "percent",
                    "B4": "percent",
                    "B5": "percent"
                }
            },
            "variants": [
                {
                    "cells": {
                        "D2": 49999
                    },
                    "expected": [
                        0.02
                    ]
                }
            ],
            "expected": [
                0.06
            ]
        },
        {
            "id": "xl-clean-trim",
            "topic": "cleaning",
            "title": "Clean a name",
            "difficulty": "intermediate",
            "objective": "Remove spaces and fix capitals with TRIM and PROPER.",
            "instructions": "A2:A5 hold names typed in by hand with extra spaces and mixed capitals. In B2 enter a formula that cleans A2 so that it works when copied down to B5. The lab copies it down for you.",
            "solution": "=PROPER(TRIM(A2))",
            "hints": [
                "TRIM removes extra spaces.",
                "PROPER makes the first letter of each word a capital.",
                "Nest one inside the other."
            ],
            "explanation": "Imported or typed data often has spaces at the ends and between words, and mixed capitals. TRIM removes leading, trailing and repeated spaces; PROPER capitalises each word. Two values that look alike but differ by a space are different to Excel, which breaks lookups and counts.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Raw name",
                    "A2": "  asha   RAO ",
                    "A3": "bilal khan",
                    "A4": "CHITRA iyer",
                    "A5": " divya  nair"
                },
                "answer": "B2",
                "fill": {
                    "down": 3,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "A3": "  FARHAN   ali  ",
                        "A5": "gita SHARMA"
                    },
                    "expected": [
                        "Asha Rao",
                        "Farhan Ali",
                        "Chitra Iyer",
                        "Gita Sharma"
                    ]
                }
            ],
            "expected": [
                "Asha Rao",
                "Bilal Khan",
                "Chitra Iyer",
                "Divya Nair"
            ]
        },
        {
            "id": "xl-clean-value",
            "topic": "cleaning",
            "title": "Numbers stored as text",
            "difficulty": "intermediate",
            "objective": "Turn text that looks like a number into a number with VALUE.",
            "instructions": "B2:B5 hold amounts that were imported as text (SUM ignores them). In B7 enter a formula that adds them up correctly in one cell, using VALUE.",
            "solution": "=VALUE(B2)+VALUE(B3)+VALUE(B4)+VALUE(B5)",
            "hints": [
                "VALUE converts number-like text to a number.",
                "SUM(B2:B5) would give 0 here."
            ],
            "explanation": "Text that looks like a number is a classic import problem: SUM(B2:B5) returns 0 because SUM skips text in a range. VALUE converts each item. In real Excel you can also multiply by 1, use Text to Columns or the green warning triangle's Convert to Number.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Item",
                    "B1": "Amount (text)",
                    "A2": "Rent",
                    "B2": "12000",
                    "A3": "Power",
                    "B3": "1450",
                    "A4": "Water",
                    "B4": "320",
                    "A5": "Net",
                    "B5": "999"
                },
                "answer": "B7",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B2": "800",
                        "B4": "55"
                    },
                    "expected": [
                        3304.0
                    ]
                }
            ],
            "expected": [
                14769.0
            ]
        },
        {
            "id": "xl-clean-duplicates",
            "topic": "cleaning",
            "title": "Flag a repeat",
            "difficulty": "advanced",
            "objective": "Mark the second and later copies of a value with COUNTIF.",
            "instructions": "A2:A7 hold email addresses with some repeats. In B2 enter a formula that shows Duplicate when the address already appeared in the cells above it (including itself) and Unique otherwise, so that it works when copied down to B7. The lab copies it down for you.",
            "solution": "=IF(COUNTIF($A$2:A2,A2)>1,\"Duplicate\",\"Unique\")",
            "hints": [
                "Count how many times the value has appeared from A2 down to the current row.",
                "Start the range with an absolute reference and end it with a relative one: $A$2:A2."
            ],
            "explanation": "The expanding range $A$2:A2 grows as the formula is copied down, so each row counts only the appearances up to itself. The first copy gives 1 (Unique) and every later copy gives 2 or more (Duplicate). Counting the whole column instead would flag the first copy as well.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Email",
                    "A2": "asha@example.com",
                    "A3": "bilal@example.com",
                    "A4": "asha@example.com",
                    "A5": "chitra@example.com",
                    "A6": "bilal@example.com",
                    "A7": "asha@example.com"
                },
                "answer": "B2",
                "fill": {
                    "down": 5,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "A3": "asha@example.com",
                        "A5": "divya@example.com",
                        "A7": "gita@example.com"
                    },
                    "expected": [
                        "Unique",
                        "Duplicate",
                        "Duplicate",
                        "Unique",
                        "Unique",
                        "Unique"
                    ]
                }
            ],
            "expected": [
                "Unique",
                "Unique",
                "Duplicate",
                "Unique",
                "Duplicate",
                "Duplicate"
            ]
        },
        {
            "id": "xl-clean-standardise",
            "topic": "cleaning",
            "title": "One spelling for Yes",
            "difficulty": "intermediate",
            "objective": "Standardise inconsistent entries.",
            "instructions": "A2:A5 hold answers typed as yes, Y, YES or y (sometimes with spaces), and anything else means no. In B2 enter a formula that shows Yes for those answers and No for everything else, so it works when copied down. The lab copies it down.",
            "solution": "=IF(OR(LOWER(TRIM(A2))=\"yes\",LOWER(TRIM(A2))=\"y\"),\"Yes\",\"No\")",
            "hints": [
                "Clean the answer first with TRIM and LOWER.",
                "OR checks the two accepted spellings."
            ],
            "explanation": "Clean first, then compare: TRIM removes spaces and LOWER removes the capital letter differences, so five spellings reduce to two values. Repeating LOWER(TRIM(A2)) is long; in newer Excel the LET function can name it once, but LET is not part of this lab.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Answer",
                    "A2": "yes",
                    "A3": " Y ",
                    "A4": "NO",
                    "A5": "YES"
                },
                "answer": "B2",
                "fill": {
                    "down": 3,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "A2": "n",
                        "A4": "y",
                        "A5": "maybe "
                    },
                    "expected": [
                        "No",
                        "Yes",
                        "Yes",
                        "No"
                    ]
                }
            ],
            "expected": [
                "Yes",
                "Yes",
                "No",
                "Yes"
            ]
        },
        {
            "id": "xl-pmt",
            "topic": "finance",
            "title": "A loan instalment",
            "difficulty": "advanced",
            "objective": "Calculate a monthly loan payment with PMT.",
            "instructions": "B1 is the loan amount, B2 the yearly interest rate (as a percentage stored as a decimal) and B3 the term in months. In B4 enter a formula for the monthly payment, rounded to 2 decimals and shown as a positive number.",
            "solution": "=ROUND(-PMT(B2/12,B3,B1),2)",
            "hints": [
                "PMT needs the monthly rate, the number of payments and the amount borrowed.",
                "PMT returns a negative number for money you pay out; put a minus in front.",
                "Divide the yearly rate by 12."
            ],
            "explanation": "PMT(rate, nper, pv) assumes the rate matches the period, so a yearly rate is divided by 12 for monthly payments. The sign is negative because it is cash going out. The inputs sit in cells so that a different rate or term can be tried without editing the formula.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Loan",
                    "B1": 500000,
                    "A2": "Rate (a year)",
                    "B2": 0.09,
                    "A3": "Months",
                    "B3": 60,
                    "A4": "Payment"
                },
                "answer": "B4",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {
                    "B2": "percent"
                }
            },
            "variants": [
                {
                    "cells": {
                        "B1": 120000,
                        "B2": 0.115,
                        "B3": 24
                    },
                    "expected": [
                        5620.84
                    ]
                }
            ],
            "expected": [
                10379.18
            ]
        },
        {
            "id": "xl-fv",
            "topic": "finance",
            "title": "A savings goal",
            "difficulty": "advanced",
            "objective": "Find a future value with FV.",
            "instructions": "B1 is a monthly saving, B2 the yearly return and B3 the number of months. In B4 enter a formula for the value at the end, rounded to 2 decimals (payments at the end of each month).",
            "solution": "=ROUND(FV(B2/12,B3,-B1),2)",
            "hints": [
                "FV(rate per period, periods, payment).",
                "The payment is money you pay in, so it is negative; the result then comes back positive."
            ],
            "explanation": "FV compounds each deposit at the monthly rate. Money paid in is entered as a negative payment, and the value you would receive comes back positive. Real returns vary; the model only shows what a fixed assumed rate would give.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Monthly saving",
                    "B1": 5000,
                    "A2": "Return (a year)",
                    "B2": 0.12,
                    "A3": "Months",
                    "B3": 12,
                    "A4": "Value"
                },
                "answer": "B4",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {
                    "B2": "percent"
                }
            },
            "variants": [
                {
                    "cells": {
                        "B1": 2000,
                        "B2": 0.06,
                        "B3": 36
                    },
                    "expected": [
                        78672.21
                    ]
                }
            ],
            "expected": [
                63412.52
            ]
        },
        {
            "id": "xl-fix-na",
            "topic": "errors",
            "title": "A lookup that fails on a space",
            "difficulty": "advanced",
            "objective": "Find why a lookup returns #N/A and fix it.",
            "instructions": "The price list is in A2:B4 and E2 holds a code typed with a stray space at the end (for example \"B02 \"). In F2 enter a formula that still finds the price, with an exact match.",
            "solution": "=VLOOKUP(TRIM(E2),A2:B4,2,FALSE)",
            "hints": [
                "The code in E2 has an extra space, so it does not equal any code in the list.",
                "TRIM removes the space."
            ],
            "explanation": "The lookup value \"B02 \" is a different text from \"B02\", so an exact lookup returns #N/A. This is by far the most common reason for a lookup that 'should work'. Clean the lookup value with TRIM, and clean the list too if the stray space might be there.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A1": "Code",
                    "B1": "Price",
                    "A2": "A01",
                    "B2": 120,
                    "A3": "B02",
                    "B3": 340,
                    "A4": "C03",
                    "B4": 560,
                    "E1": "Typed code",
                    "E2": "B02 "
                },
                "answer": "F2",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "E2": "C03  "
                    },
                    "expected": [
                        560
                    ]
                }
            ],
            "expected": [
                340
            ]
        },
        {
            "id": "xl-fix-div0",
            "topic": "errors",
            "title": "Percentage change without errors",
            "difficulty": "advanced",
            "objective": "Prevent #DIV/0! with a test before dividing.",
            "instructions": "B2 is last year's sales and B3 this year's. In B4 enter a formula for the percentage change as a fraction ((this year - last year) / last year), showing the text n/a when last year's sales are 0.",
            "solution": "=IF(B2=0,\"n/a\",(B3-B2)/B2)",
            "hints": [
                "Test B2 before dividing by it.",
                "Percentage change = (new - old) / old."
            ],
            "explanation": "Testing the denominator first is more precise than IFERROR, because it only changes the result for the case you expect. A change from zero has no percentage, so the formula says so in words instead of showing an error or a misleading zero.",
            "source": "Microsoft Support: Excel functions (by category)",
            "sheet": {
                "cells": {
                    "A2": "Last year",
                    "B2": 80000,
                    "A3": "This year",
                    "B3": 92000,
                    "A4": "Change"
                },
                "answer": "B4",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {
                    "B4": "percent"
                }
            },
            "variants": [
                {
                    "cells": {
                        "B2": 0
                    },
                    "expected": [
                        "n/a"
                    ]
                }
            ],
            "expected": [
                0.15
            ]
        },
        {
            "id": "xl-project-budget-1",
            "topic": "projects",
            "title": "Budget 1: total income",
            "difficulty": "beginner",
            "objective": "Project, step 1 of 4. Add up the income rows.",
            "instructions": "The first two rows (B2:B3) are income and B4:B6 are spending. In B9 enter a formula for total income.",
            "solution": "=SUM(B2:B3)",
            "hints": [
                "Income is rows 2 and 3."
            ],
            "explanation": "Step 1 adds the income. Keep each result in its own labelled cell so later steps can refer to it.",
            "source": "Original exercise",
            "sheet": {
                "cells": {
                    "A1": "Item",
                    "B1": "Amount",
                    "A2": "Salary",
                    "B2": 52000,
                    "A3": "Freelance",
                    "B3": 8000,
                    "A4": "Rent",
                    "B4": 16000,
                    "A5": "Food",
                    "B5": 9000,
                    "A6": "Travel",
                    "B6": 3500,
                    "A7": "Savings goal",
                    "B7": 12000,
                    "A9": "Total income",
                    "A10": "Total spending",
                    "A11": "Left over",
                    "A12": "Savings rate"
                },
                "answer": "B9",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B2": 40000,
                        "B3": 0,
                        "B5": 14000
                    },
                    "expected": [
                        40000
                    ]
                }
            ],
            "expected": [
                60000
            ]
        },
        {
            "id": "xl-project-budget-2",
            "topic": "projects",
            "title": "Budget 2: total spending",
            "difficulty": "beginner",
            "objective": "Project, step 2 of 4. Add up the spending rows.",
            "instructions": "In B10 enter a formula for total spending (rent, food and travel, B4:B6).",
            "solution": "=SUM(B4:B6)",
            "hints": [
                "Spending is rows 4 to 6."
            ],
            "explanation": "Step 2 adds the spending rows. The savings goal in row 7 is a target, not spending, so it is left out.",
            "source": "Original exercise",
            "sheet": {
                "cells": {
                    "A1": "Item",
                    "B1": "Amount",
                    "A2": "Salary",
                    "B2": 52000,
                    "A3": "Freelance",
                    "B3": 8000,
                    "A4": "Rent",
                    "B4": 16000,
                    "A5": "Food",
                    "B5": 9000,
                    "A6": "Travel",
                    "B6": 3500,
                    "A7": "Savings goal",
                    "B7": 12000,
                    "A9": "Total income",
                    "A10": "Total spending",
                    "A11": "Left over",
                    "A12": "Savings rate"
                },
                "answer": "B10",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B2": 40000,
                        "B3": 0,
                        "B5": 14000
                    },
                    "expected": [
                        33500
                    ]
                }
            ],
            "expected": [
                28500
            ]
        },
        {
            "id": "xl-project-budget-3",
            "topic": "projects",
            "title": "Budget 3: what is left",
            "difficulty": "intermediate",
            "objective": "Project, step 3 of 4. Use the results of the earlier steps.",
            "instructions": "B9 and B10 now hold total income and total spending. In B11 enter a formula for the amount left over, using B9 and B10 instead of the original rows.",
            "solution": "=B9-B10",
            "hints": [
                "Subtract spending from income, using the cells B9 and B10."
            ],
            "explanation": "Building on cells that hold earlier results keeps the model readable. If a row changes, every result that depends on it changes.",
            "source": "Original exercise",
            "sheet": {
                "cells": {
                    "A1": "Item",
                    "B1": "Amount",
                    "A2": "Salary",
                    "B2": 52000,
                    "A3": "Freelance",
                    "B3": 8000,
                    "A4": "Rent",
                    "B4": 16000,
                    "A5": "Food",
                    "B5": 9000,
                    "A6": "Travel",
                    "B6": 3500,
                    "A7": "Savings goal",
                    "B7": 12000,
                    "A9": "Total income",
                    "A10": "Total spending",
                    "A11": "Left over",
                    "A12": "Savings rate",
                    "B9": 60000,
                    "B10": 28500
                },
                "answer": "B11",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B9": 40000,
                        "B10": 21000
                    },
                    "expected": [
                        19000
                    ]
                }
            ],
            "expected": [
                31500
            ]
        },
        {
            "id": "xl-project-budget-4",
            "topic": "projects",
            "title": "Budget 4: savings rate and goal",
            "difficulty": "advanced",
            "objective": "Project, step 4 of 4. Compare what is left with the savings goal.",
            "instructions": "B9 is total income, B11 is the amount left and B7 is the savings goal. In B12 enter a formula that shows Goal met if the amount left is at least the goal and Short by followed by the shortfall otherwise (for example Short by 2500).",
            "solution": "=IF(B11>=B7,\"Goal met\",\"Short by \"&(B7-B11))",
            "hints": [
                "Compare B11 with B7.",
                "Join text and a number with &."
            ],
            "explanation": "The formula checks the condition and builds a message with the difference. In a real model the savings rate (B11/B9) is also useful; here the message is the point: results of calculations feeding a decision.",
            "source": "Original exercise",
            "sheet": {
                "cells": {
                    "A1": "Item",
                    "B1": "Amount",
                    "A2": "Salary",
                    "B2": 52000,
                    "A3": "Freelance",
                    "B3": 8000,
                    "A4": "Rent",
                    "B4": 16000,
                    "A5": "Food",
                    "B5": 9000,
                    "A6": "Travel",
                    "B6": 3500,
                    "A7": "Savings goal",
                    "B7": 12000,
                    "A9": "Total income",
                    "A10": "Total spending",
                    "A11": "Left over",
                    "A12": "Savings rate",
                    "B9": 60000,
                    "B10": 28500,
                    "B11": 31500
                },
                "answer": "B12",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B11": 9500,
                        "B7": 12000
                    },
                    "expected": [
                        "Short by 2500"
                    ]
                }
            ],
            "expected": [
                "Goal met"
            ]
        },
        {
            "id": "xl-project-payroll-1",
            "topic": "projects",
            "title": "Payroll 1: gross pay",
            "difficulty": "intermediate",
            "objective": "Project, step 1 of 2. Pay with overtime.",
            "instructions": "Gross pay is base pay plus overtime hours times the hourly rate. In E2 enter that formula for the employee in row 2.",
            "solution": "=B2+C2*D2",
            "hints": [
                "Overtime pay is hours times rate.",
                "Multiplication happens before addition."
            ],
            "explanation": "Gross pay is the amount before deductions. The formula uses cell references for every number so that a new month only needs new inputs.",
            "source": "Original exercise",
            "sheet": {
                "cells": {
                    "A1": "Employee",
                    "B1": "Base pay",
                    "C1": "Overtime hours",
                    "D1": "Hourly rate",
                    "A2": "Asha",
                    "B2": 40000,
                    "C2": 10,
                    "D2": 250,
                    "F1": "Tax limit",
                    "F2": 50000
                },
                "answer": "E2",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "B2": 31000,
                        "C2": 22,
                        "D2": 180
                    },
                    "expected": [
                        34960
                    ]
                }
            ],
            "expected": [
                42500
            ]
        },
        {
            "id": "xl-project-payroll-2",
            "topic": "projects",
            "title": "Payroll 2: tax and net pay",
            "difficulty": "advanced",
            "objective": "Project, step 2 of 2. Apply a rule to a result.",
            "instructions": "E2 holds gross pay and F2 holds the tax limit. In G2 enter net pay: tax is 10% of gross pay when gross pay is above the limit and 0 otherwise. Net pay is gross pay minus tax.",
            "solution": "=E2-IF(E2>F2,E2*0.1,0)",
            "hints": [
                "Decide the tax with IF first.",
                "Net pay = gross - tax."
            ],
            "explanation": "IF decides the tax and the subtraction gives net pay in one formula. The 0.1 is typed into the formula here for simplicity; in a real model the rate would sit in its own labelled cell.",
            "source": "Original exercise",
            "sheet": {
                "cells": {
                    "A1": "Employee",
                    "B1": "Base pay",
                    "C1": "Overtime hours",
                    "D1": "Hourly rate",
                    "A2": "Asha",
                    "B2": 40000,
                    "C2": 10,
                    "D2": 250,
                    "F1": "Tax limit",
                    "F2": 50000,
                    "E2": 42500
                },
                "answer": "G2",
                "fill": {
                    "down": 0,
                    "right": 0
                },
                "formats": {}
            },
            "variants": [
                {
                    "cells": {
                        "E2": 61000,
                        "F2": 60000
                    },
                    "expected": [
                        54900.0
                    ]
                }
            ],
            "expected": [
                42500
            ]
        }
    ]
};
