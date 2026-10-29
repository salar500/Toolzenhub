/* =========================================================
   ToolZen Hub
   Test Design Lab: the exercises

   Plain data (see learning/content-schema.js, validateExerciseSet).
   Two kinds of exercise, both about whole numbers only:

   mode "bva" (boundary values)
     rule      the VALID whole numbers: { min, max, minInclusive,
               maxInclusive }. min or max may be null (no limit on
               that side). The evaluator works out the required test
               values from the rule; nothing is keyed by hand.
     values    2 or 3 values per boundary (stated in the task)

   mode "ep" (equivalence partitions)
     partitions  consecutive whole-number intervals { id, label,
               min, max } (null = no limit) that cover every whole
               number exactly once
     samples   the values the learner assigns to a partition

   The technique names are used as commonly taught. Nothing here is
   a syllabus, a course or an exam.
========================================================= */

const range = (min, max, minInclusive = true, maxInclusive = true) => ({ min, max, minInclusive, maxInclusive });

const SOURCE_BVA = "Boundary value analysis, as commonly taught";
const SOURCE_EP = "Equivalence partitioning, as commonly taught";

const withDefect = (e) => `${e.explanation} The kind of defect this finds: ${e.defect}.`;

const inPartition = (partitions, x) => partitions.find((p) => (p.min === null || x >= p.min) && (p.max === null || x <= p.max));

const bva = (e) => ({
    mode: "bva", starting: "", tool: "smart-flashcards",
    ...e,
    explanation: withDefect(e),
    instructions: `${e.instructions} Whole numbers only. ${e.perBoundary === 3 ? "Use three values at each boundary: the value below it, on it and above it." : "Use two values at each boundary: the boundary value of the valid range and the nearest value outside it."} Enter your values separated by commas, spaces or line breaks.`,
    source: SOURCE_BVA
});

const ep = (e) => ({
    mode: "ep", tool: "smart-flashcards",
    ...e,
    explanation: withDefect(e),
    solution: e.samples.map((x) => `${x}: ${inPartition(e.partitions, x).label}`).join(String.fromCharCode(10)),
    instructions: `${e.instructions} Whole numbers only. Choose the partition each value belongs to.`,
    source: SOURCE_EP
});

export const set = {
    id: "test-design",
    version: "1.0.0",
    title: "Test Design Lab",
    description: "Twenty exercises in test design with whole numbers: ten on boundary values and ten on equivalence partitions, each with an explicit specification and a worked explanation.",
    reviewed: {
        date: "2026-10-29",
        method: "Written by the author. Every specification states whether each limit is inclusive or exclusive and which form of boundary value analysis is meant. The evaluator was checked against an independent Python oracle over a generated corpus of two thousand rules. No second reviewer yet."
    },
    exercises: [
        /* ---------- boundary values ---------- */
        bva({
            id: "tdl-bva-age", title: "Boundary: an age limit", difficulty: "beginner", perBoundary: 2,
            objective: "Find the boundary values of a range that includes both of its limits.",
            instructions: "A form accepts an age from 18 to 65, and both 18 and 65 are accepted.",
            rule: range(18, 65),
            hints: ["There are two boundaries, one at each end of the accepted range.", "At each boundary take the last accepted value and the nearest value that is not accepted.", "At the lower end that is 18 and the value just under it."],
            solution: "17, 18, 65, 66",
            explanation: "The accepted ages are 18 to 65. The lower boundary is between 17 (refused) and 18 (accepted), and the upper boundary is between 65 (accepted) and 66 (refused). A defect such as writing > 18 instead of >= 18 is found by 18 and not by 17 or 40.",
            defect: "an off-by-one error in a comparison (for example > instead of >=)"
        }),
        bva({
            id: "tdl-bva-quantity", title: "Boundary: items per order", difficulty: "beginner", perBoundary: 2,
            objective: "Find the boundary values of an order quantity.",
            instructions: "An order may contain from 1 to 100 items, and both 1 and 100 are allowed.",
            rule: range(1, 100),
            hints: ["The accepted values start at 1, so the lowest refused value is 0.", "At the upper end the last accepted value is 100.", "Two boundaries, two values at each."],
            solution: "0, 1, 100, 101",
            explanation: "The lower boundary lies between 0 (refused) and 1 (accepted). The upper boundary lies between 100 (accepted) and 101 (refused). Zero is also a classic source of defects, because code often treats 0 as no value at all.",
            defect: "a limit that is one too high or too low, or a zero that is treated as missing"
        }),
        bva({
            id: "tdl-bva-score", title: "Boundary: a percentage score", difficulty: "intermediate", perBoundary: 3,
            objective: "Use three values at each boundary.",
            instructions: "A score is accepted from 0 to 100, and both 0 and 100 are accepted.",
            rule: range(0, 100),
            hints: ["With three values you take the value below the boundary, the boundary value itself and the value above it.", "At the lower boundary: the value under 0, 0 and the value above 0.", "Do the same at 100. That makes six values in all."],
            solution: "-1, 0, 1, 99, 100, 101",
            explanation: "Three-value analysis tests each boundary value and both of its neighbours: -1, 0 and 1 at the lower end, and 99, 100 and 101 at the upper end. It catches the same defects as two-value analysis, and also a boundary that has been moved by one in either direction.",
            defect: "a boundary that is off by one in either direction"
        }),
        bva({
            id: "tdl-bva-password", title: "Boundary: password length", difficulty: "intermediate", perBoundary: 2,
            objective: "Apply boundary values to a length.",
            instructions: "A password must have from 8 to 64 characters, and passwords of exactly 8 and exactly 64 characters are accepted. The value is the number of characters.",
            rule: range(8, 64),
            hints: ["The thing being tested is a count of characters, a whole number.", "The shortest accepted length is 8 and the longest is 64.", "Test lengths 7 and 8 at the bottom and 64 and 65 at the top."],
            solution: "7, 8, 64, 65",
            explanation: "The length is a whole number, so the boundaries are 7 and 8 at the lower end and 64 and 65 at the upper end. The same technique applies to counts, sizes and lengths of any kind.",
            defect: "a length check that uses < where <= is meant, or the reverse"
        }),
        bva({
            id: "tdl-bva-discount", title: "Boundary: one limit in, one out", difficulty: "advanced", perBoundary: 2,
            objective: "Read a range that includes one limit and excludes the other.",
            instructions: "A discount applies when the order total is greater than 100 and at most 500, in whole currency units. A total of 100 gets no discount, and a total of 500 does.",
            rule: range(100, 500, false, true),
            hints: ["Work out the first and last whole totals that get the discount.", "More than 100 means the first discounted total is 101. At most 500 means the last is 500.", "At the lower boundary take 100 and 101. At the upper boundary take 500 and 501."],
            solution: "100, 101, 500, 501",
            explanation: "Greater than 100 excludes 100, so the discounted totals are 101 to 500. The lower boundary is between 100 (no discount) and 101 (discount), the upper boundary between 500 (discount) and 501 (no discount). Reading greater than and at most carefully is the whole skill here.",
            defect: "confusing an exclusive limit with an inclusive one"
        }),
        bva({
            id: "tdl-bva-temperature", title: "Boundary: a temperature range", difficulty: "advanced", perBoundary: 2,
            objective: "Handle negative numbers and an exclusive upper limit.",
            instructions: "A sensor reading in whole degrees is valid when it is at least -20 and below 40. A reading of -20 is valid, and a reading of 40 is not.",
            rule: range(-20, 40, true, false),
            hints: ["The last valid reading is the one just below 40.", "At least -20 means -20 is valid.", "The boundaries are -21 and -20 at the bottom, and 39 and 40 at the top."],
            solution: "-21, -20, 39, 40",
            explanation: "At least -20 includes -20, so the lowest valid reading is -20 and -21 is the nearest invalid one. Below 40 excludes 40, so the highest valid reading is 39 and 40 is the nearest invalid one. Negative numbers often expose defects that the positive range hides.",
            defect: "a wrong comparison at a limit, or a sign error with negative values"
        }),
        bva({
            id: "tdl-bva-seats", title: "Boundary: a small range", difficulty: "intermediate", perBoundary: 3,
            objective: "Use three values at each boundary when the range is small.",
            instructions: "A booking may reserve from 1 to 6 seats, and both 1 and 6 are allowed.",
            rule: range(1, 6),
            hints: ["Three values per boundary: below, on and above.", "At the lower boundary that is 0, 1 and 2.", "At the upper boundary that is 5, 6 and 7."],
            solution: "0, 1, 2, 5, 6, 7",
            explanation: "The lower boundary needs 0, 1 and 2, and the upper boundary needs 5, 6 and 7. With only six valid values the two groups are close but do not overlap, so six test values are needed.",
            defect: "a limit that is one off at either end of a short range"
        }),
        bva({
            id: "tdl-bva-shipping", title: "Boundary: a limit on one side only", difficulty: "intermediate", perBoundary: 2,
            objective: "Recognise a range with only one boundary.",
            instructions: "Shipping is free when the order total is at least 50, in whole currency units, and there is no upper limit. A total of 50 ships free.",
            rule: range(50, null),
            hints: ["There is only one boundary here.", "The lowest total that ships free is 50.", "Take 50 and the value just under it."],
            solution: "49, 50",
            explanation: "Only the lower end has a boundary: 49 pays for shipping and 50 does not. There is no upper limit, so there is no upper boundary to test. Adding an unrelated large number is still useful, but it is a different test and does not test a boundary.",
            defect: "an off-by-one error on a single threshold"
        }),
        bva({
            id: "tdl-bva-shift", title: "Boundary: hours worked", difficulty: "advanced", perBoundary: 3,
            objective: "Combine an exclusive lower limit with three-value analysis.",
            instructions: "A shift may be logged for more than 0 and at most 12 whole hours. A shift of 0 hours is not accepted, and a shift of 12 hours is.",
            rule: range(0, 12, false, true),
            hints: ["More than 0 means the first valid value is 1.", "The valid values are 1 to 12.", "Three values at each boundary: 0, 1, 2 and 11, 12, 13."],
            solution: "0, 1, 2, 11, 12, 13",
            explanation: "Because the lower limit is exclusive, the lowest valid value is 1 and the boundary lies between 0 and 1. The three values at that boundary are 0, 1 and 2, and at the upper boundary 11, 12 and 13.",
            defect: "treating zero as valid when the specification says it is not"
        }),
        bva({
            id: "tdl-bva-balance", title: "Boundary: a balance that can be negative", difficulty: "advanced", perBoundary: 2,
            objective: "Apply the technique to a range that crosses zero.",
            instructions: "An account balance is accepted from -500 up to, but not including, 10000, in whole currency units. A balance of -500 is accepted and a balance of 10000 is not.",
            rule: range(-500, 10000, true, false),
            hints: ["The lowest accepted balance is -500.", "The highest accepted balance is 9999.", "Test -501 and -500 at the bottom, and 9999 and 10000 at the top."],
            solution: "-501, -500, 9999, 10000",
            explanation: "The lower boundary is between -501 (refused) and -500 (accepted), the upper boundary between 9999 (accepted) and 10000 (refused). A range that crosses zero is also a reason to try zero itself, but zero is not a boundary here.",
            defect: "a sign error or an inclusive limit that should be exclusive"
        }),
        /* ---------- equivalence partitions ---------- */
        ep({
            id: "tdl-ep-age", title: "Partitions: an age limit", difficulty: "beginner",
            objective: "Place values in the three partitions of a simple range.",
            instructions: "A form accepts ages from 18 to 65 inclusive.",
            partitions: [
                { id: "low", label: "Too low (17 or less)", min: null, max: 17 },
                { id: "valid", label: "Accepted (18 to 65)", min: 18, max: 65 },
                { id: "high", label: "Too high (66 or more)", min: 66, max: null }
            ],
            samples: [17, 18, 40, 65, 66, 0],
            hints: ["Compare each value with 18 and 65.", "18 and 65 are inside the accepted range.", "0 is below the range, so it is in the lowest partition."],
            explanation: "A range with two limits splits all whole numbers into three partitions: below, inside and above. Every value in a partition is expected to be treated the same way, so one value from each is enough in principle. Values at the edges, such as 17, 18, 65 and 66, are the ones to check closely.",
            defect: "a limit that puts a value in the wrong partition"
        }),
        ep({
            id: "tdl-ep-quantity", title: "Partitions: items per order", difficulty: "beginner",
            objective: "Place values in the partitions of a quantity.",
            instructions: "An order may contain from 1 to 10 items, inclusive.",
            partitions: [
                { id: "low", label: "Too few (0 or less)", min: null, max: 0 },
                { id: "valid", label: "Accepted (1 to 10)", min: 1, max: 10 },
                { id: "high", label: "Too many (11 or more)", min: 11, max: null }
            ],
            samples: [0, 1, 5, 10, 11, -3],
            hints: ["Zero and negative numbers are not accepted.", "1 and 10 are both inside.", "-3 is less than 1."],
            explanation: "The accepted partition is 1 to 10. Zero and negative quantities are in the lowest partition, which is a partition worth testing in its own right, because negative input is a common source of errors.",
            defect: "missing validation of zero or negative input"
        }),
        ep({
            id: "tdl-ep-weight", title: "Partitions: shipping tiers", difficulty: "intermediate",
            objective: "Place values in a range with several accepted partitions.",
            instructions: "A parcel is priced by weight in whole kilograms. 1 to 5 kg is Light, 6 to 20 kg is Medium, 21 to 50 kg is Heavy. A parcel of 0 kg or less, or over 50 kg, is refused.",
            partitions: [
                { id: "refused-low", label: "Refused (0 or less)", min: null, max: 0 },
                { id: "light", label: "Light (1 to 5)", min: 1, max: 5 },
                { id: "medium", label: "Medium (6 to 20)", min: 6, max: 20 },
                { id: "heavy", label: "Heavy (21 to 50)", min: 21, max: 50 },
                { id: "refused-high", label: "Refused (51 or more)", min: 51, max: null }
            ],
            samples: [5, 6, 20, 21, 50, 51, 0],
            hints: ["Each tier includes both of the numbers it names.", "Values next to a tier limit, such as 5 and 6, are in different tiers.", "50 is still Heavy, and 51 is refused."],
            explanation: "Here there are five partitions: two refused and three accepted tiers. The values chosen sit on either side of each tier limit, which is where an off-by-one defect would show a parcel in the wrong tier and charge the wrong price.",
            defect: "a parcel priced in the wrong tier because a limit is off by one"
        }),
        ep({
            id: "tdl-ep-discount", title: "Partitions: quantity discounts", difficulty: "intermediate",
            objective: "Place values in discount bands.",
            instructions: "A bulk order earns no discount for 1 to 9 units, 5 percent for 10 to 49 units and 10 percent for 50 units or more. An order of 0 units or fewer is invalid.",
            partitions: [
                { id: "invalid", label: "Invalid (0 or less)", min: null, max: 0 },
                { id: "none", label: "No discount (1 to 9)", min: 1, max: 9 },
                { id: "five", label: "5 percent (10 to 49)", min: 10, max: 49 },
                { id: "ten", label: "10 percent (50 or more)", min: 50, max: null }
            ],
            samples: [1, 9, 10, 49, 50, 200, 0],
            hints: ["There is no upper limit on the last band.", "10 is the first unit that earns a discount, and 50 is the first for the larger one.", "200 is far above 50 but is still in the same partition."],
            explanation: "A partition with no upper limit holds every larger value, so 50 and 200 behave alike: both earn 10 percent. The boundary values 9 and 10, and 49 and 50, are where a wrong comparison would give the wrong discount.",
            defect: "the wrong discount near a band limit"
        }),
        ep({
            id: "tdl-ep-grade", title: "Partitions: grade bands", difficulty: "advanced",
            objective: "Place values in several bands and in the invalid partitions around them.",
            instructions: "A mark from 0 to 100 gives a grade: 0 to 39 is Fail, 40 to 59 is Pass, 60 to 74 is Merit, and 75 to 100 is Distinction. A mark below 0 or above 100 is invalid.",
            partitions: [
                { id: "invalid-low", label: "Invalid (-1 or less)", min: null, max: -1 },
                { id: "fail", label: "Fail (0 to 39)", min: 0, max: 39 },
                { id: "pass", label: "Pass (40 to 59)", min: 40, max: 59 },
                { id: "merit", label: "Merit (60 to 74)", min: 60, max: 74 },
                { id: "distinction", label: "Distinction (75 to 100)", min: 75, max: 100 },
                { id: "invalid-high", label: "Invalid (101 or more)", min: 101, max: null }
            ],
            samples: [39, 40, 59, 60, 74, 75, 100, 101, -1],
            hints: ["Each band includes both numbers it names.", "0 and 100 are valid marks.", "-1 and 101 are the nearest invalid marks."],
            explanation: "Six partitions cover every whole number: two invalid ones and four grade bands. The nine values chosen are the last value of one partition and the first of the next. A comparison written with the wrong operator, such as < where <= is meant, gives a wrong grade at exactly these values.",
            defect: "a band limit written with the wrong comparison operator"
        }),
        ep({
            id: "tdl-ep-password", title: "Partitions: password length", difficulty: "intermediate",
            objective: "Place lengths in partitions.",
            instructions: "A password must have from 8 to 64 characters, inclusive. The value is the number of characters.",
            partitions: [
                { id: "short", label: "Too short (7 or fewer)", min: null, max: 7 },
                { id: "ok", label: "Accepted (8 to 64)", min: 8, max: 64 },
                { id: "long", label: "Too long (65 or more)", min: 65, max: null }
            ],
            samples: [7, 8, 20, 64, 65, 0],
            hints: ["8 is the shortest accepted length.", "A length of 0 is an empty password.", "65 is one more than the longest accepted length."],
            explanation: "Lengths in the same partition should be treated alike: 8 and 20 and 64 are all accepted. An empty password, length 0, is in the too-short partition and is worth its own test because code often treats an empty value specially.",
            defect: "an empty value handled differently from other too-short values"
        }),
        ep({
            id: "tdl-ep-temperature", title: "Partitions: a temperature range", difficulty: "advanced",
            objective: "Place values around a range with an exclusive upper limit and negative numbers.",
            instructions: "A reading in whole degrees is valid when it is at least -20 and below 40.",
            partitions: [
                { id: "low", label: "Too cold (-21 or less)", min: null, max: -21 },
                { id: "valid", label: "Valid (-20 to 39)", min: -20, max: 39 },
                { id: "high", label: "Too hot (40 or more)", min: 40, max: null }
            ],
            samples: [-21, -20, 0, 39, 40, 100],
            hints: ["At least -20 includes -20.", "Below 40 does not include 40.", "0 is inside the valid range."],
            explanation: "-20 is valid because the limit is inclusive, and 40 is not valid because that limit is exclusive. Zero sits in the middle of the valid partition, and is not special here, although it often is in code that divides or compares with zero.",
            defect: "an inclusive limit written where an exclusive one is meant"
        }),
        ep({
            id: "tdl-ep-seats", title: "Partitions: seats in a booking", difficulty: "beginner",
            objective: "Place values in the partitions of a short range.",
            instructions: "A booking may reserve from 1 to 6 seats, inclusive.",
            partitions: [
                { id: "low", label: "Too few (0 or less)", min: null, max: 0 },
                { id: "valid", label: "Accepted (1 to 6)", min: 1, max: 6 },
                { id: "high", label: "Too many (7 or more)", min: 7, max: null }
            ],
            samples: [0, 1, 6, 7, 3, -1],
            hints: ["1 and 6 are both accepted.", "3 is well inside the range.", "-1 is less than any seat count."],
            explanation: "With a range this short, most of the accepted values are boundaries. The partition view still helps: it reminds you to test values outside the range on both sides, including zero and negative numbers.",
            defect: "an unvalidated lower or upper limit"
        }),
        ep({
            id: "tdl-ep-parking", title: "Partitions: parking fees", difficulty: "advanced",
            objective: "Place values in a rule with an invalid partition at each end and three fee bands.",
            instructions: "Parking is booked in whole hours, from 1 to 24. 1 to 2 hours are Free, 3 to 6 hours are Standard, and 7 to 24 hours are Daily cap. A booking of 0 hours or less, or of more than 24, is invalid.",
            partitions: [
                { id: "invalid-low", label: "Invalid (0 or less)", min: null, max: 0 },
                { id: "free", label: "Free (1 to 2)", min: 1, max: 2 },
                { id: "standard", label: "Standard (3 to 6)", min: 3, max: 6 },
                { id: "cap", label: "Daily cap (7 to 24)", min: 7, max: 24 },
                { id: "invalid-high", label: "Invalid (25 or more)", min: 25, max: null }
            ],
            samples: [0, 1, 2, 3, 6, 7, 24, 25],
            hints: ["Each band includes both numbers it names.", "24 hours is still a valid booking.", "25 is one more than the longest booking."],
            explanation: "Five partitions: an invalid one at each end and three fee bands. Eight sample values are chosen on both sides of every limit. Having each limit in the data lets a single wrong comparison show as a wrong fee or a wrong refusal.",
            defect: "the wrong fee or a wrongly refused booking at a band limit"
        }),
        ep({
            id: "tdl-ep-quarter", title: "Partitions: months and quarters", difficulty: "intermediate",
            objective: "Place month numbers in the quarter they belong to.",
            instructions: "A month number from 1 to 12 belongs to a quarter: 1 to 3 is Q1, 4 to 6 is Q2, 7 to 9 is Q3, and 10 to 12 is Q4. A number below 1 or above 12 is not a month.",
            partitions: [
                { id: "invalid-low", label: "Not a month (0 or less)", min: null, max: 0 },
                { id: "q1", label: "Q1 (1 to 3)", min: 1, max: 3 },
                { id: "q2", label: "Q2 (4 to 6)", min: 4, max: 6 },
                { id: "q3", label: "Q3 (7 to 9)", min: 7, max: 9 },
                { id: "q4", label: "Q4 (10 to 12)", min: 10, max: 12 },
                { id: "invalid-high", label: "Not a month (13 or more)", min: 13, max: null }
            ],
            samples: [0, 1, 3, 4, 6, 7, 9, 10, 12, 13],
            hints: ["Each quarter is three months, and each range includes both of its ends.", "3 and 4 are in different quarters.", "13 is one more than the last month."],
            explanation: "Here the partitions are the same size, which makes a pattern easy to see and easy to get wrong at a limit. The values 3 and 4, 6 and 7, and 9 and 10 are the places where a quarter changes.",
            defect: "a month assigned to the wrong quarter at a quarter limit"
        })
    ]
};
