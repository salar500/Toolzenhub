/* =========================================================
   ToolZen Hub
   JSONPath Challenge Lab: the exercises

   Plain data (see learning/content-schema.js, validateExerciseSet).
   Every exercise queries the same built-in document. An exercise has:
     expected  the Normalized Paths the query must select, written by
               hand as lists of segments (names and array indexes)
     values    the values at those paths, shown to the learner
     ordered   true when the order of the selected nodes matters
     solution  one accepted query (others that select the same nodes
               are accepted too)
   The test file checks these against an independent Python evaluator.

   Difficulty: beginner = one selector, intermediate = two concepts
   (for example a filter with a comparison), advanced = a logical
   operator, a function, or a rule with an exception.
========================================================= */

const LIBRARY = {
    library: {
        name: "City Library",
        books: [
            { id: 1, title: "Rivers of Ink", year: 1998, price: 12.5, tags: ["travel", "history"], available: true },
            { id: 2, title: "Quiet Code", year: 2015, price: 30, tags: ["tech"], available: false },
            { id: 3, title: "Salt Roads", year: 2008, price: 18.75, tags: ["travel"], available: true },
            { id: 4, title: "Small Loops", year: 2021, price: 45, tags: ["tech", "teaching"], available: true, isbn: "978-1" },
            { id: 5, title: "Old Maps", year: 1975, price: 9, tags: [], available: false }
        ],
        staff: [
            { name: "Mira", role: "librarian", years: 12 },
            { name: "Dev", role: "assistant", years: 3 },
            { name: "Lena", role: "librarian", years: 6 }
        ],
        location: { city: "Pune", floors: 3 }
    }
};

export const DOCUMENT = JSON.stringify(LIBRARY, null, 2);

const book = (i, member) => (member === undefined ? ["library", "books", i] : ["library", "books", i, member]);
const staff = (i, member) => ["library", "staff", i, member];

const note = (values, ordered) =>
    `The query must select exactly ${values.length === 1 ? "this value" : `these ${values.length} values`}, each once${values.length > 1 ? (ordered ? ", in this order" : ", in any order") : ""}: ${values.map((v) => JSON.stringify(v)).join(", ")}.`;

function exercise(e) {
    return { starting: "$", document: DOCUMENT, ordered: false, tool: "jsonpath-tester", ...e, requirement: note(e.values, e.ordered ?? false) };
}

export const set = {
    id: "jsonpath-challenge",
    version: "1.0.0",
    title: "JSONPath Challenge Lab",
    description: "Nineteen exercises in writing JSONPath queries against one built-in document, checked by the same RFC 9535 engine as the JSONPath Tester.",
    reviewed: {
        date: "2026-10-29",
        method: "Written by the author. Expected paths were written by hand and then compared with the results of an independent evaluator written in Python for the subset of RFC 9535 the exercises use. No second reviewer yet."
    },
    exercises: [
        exercise({
            id: "jpc-child-name", title: "A name inside a name", difficulty: "beginner",
            objective: "Select a single value by walking down through member names.",
            instructions: "Write a query that selects the name of the library.",
            values: ["City Library"],
            expected: [["library", "name"]],
            solution: "$.library.name",
            hints: ["Every query starts with $, which stands for the whole document.", "Follow the structure: the document has a member library, and library has a member name.", "Join the member names with dots after the $."],
            explanation: "A name selector picks the member of an object with that name, and a query can chain them to walk down. The dot form $.library.name is shorthand for the bracket form $['library']['name'].",
            source: "RFC 9535 section 2.3.1 (name selector)"
        }),
        exercise({
            id: "jpc-first-title", title: "The first one", difficulty: "beginner",
            objective: "Select an array item by its index.",
            instructions: "Write a query that selects the title of the first book.",
            values: ["Rivers of Ink"],
            expected: [book(0, "title")],
            solution: "$.library.books[0].title",
            hints: ["The books are in an array. Array items are selected with square brackets.", "Counting starts at 0, not at 1.", "Use [0] after books, then .title."],
            explanation: "An index selector picks one item of an array, and indexes start at 0. The first book is books[0].",
            source: "RFC 9535 section 2.3.3 (index selector)"
        }),
        exercise({
            id: "jpc-all-titles", title: "Every title", difficulty: "beginner",
            objective: "Select the same member from every item with a wildcard.",
            instructions: "Write a query that selects the title of every book, in the order they appear.",
            ordered: true,
            values: ["Rivers of Ink", "Quiet Code", "Salt Roads", "Small Loops", "Old Maps"],
            expected: [0, 1, 2, 3, 4].map((i) => book(i, "title")),
            solution: "$.library.books[*].title",
            hints: ["You need to select every item of the books array.", "The wildcard * selects every child of an object or array.", "Put [*] after books."],
            explanation: "The wildcard selector selects every item of an array, or every member of an object, in order. Following it with .title takes the title of each one.",
            source: "RFC 9535 section 2.3.2 (wildcard selector)"
        }),
        exercise({
            id: "jpc-last-title", title: "Counting from the end", difficulty: "beginner",
            objective: "Select an array item by a negative index.",
            instructions: "Write a query that selects the title of the last book, without using the number of books.",
            values: ["Old Maps"],
            expected: [book(4, "title")],
            solution: "$.library.books[-1].title",
            hints: ["An index can count from the end of the array.", "-1 means the last item, -2 the one before it.", "Use [-1] after books."],
            explanation: "A negative index counts back from the end, so -1 is the last item whatever the length of the array. This is why it is preferred over a fixed index when the array can grow.",
            source: "RFC 9535 section 2.3.3 (index selector)"
        }),
        exercise({
            id: "jpc-slice-middle", title: "A slice of the shelf", difficulty: "beginner",
            objective: "Select a range of array items with a slice.",
            instructions: "Write a query that selects the titles of the second and third books.",
            ordered: true,
            values: ["Quiet Code", "Salt Roads"],
            expected: [book(1, "title"), book(2, "title")],
            solution: "$.library.books[1:3].title",
            hints: ["A slice has the form start:end.", "The start is included and the end is not.", "The second book has index 1 and the third has index 2, so the end is 3."],
            explanation: "A slice start:end selects the items from start up to, but not including, end. It is the same rule as slicing in Python, so 1:3 selects the items at index 1 and 2.",
            source: "RFC 9535 section 2.3.4 (array slice selector)"
        }),
        exercise({
            id: "jpc-object-values", title: "Everything in one object", difficulty: "beginner",
            objective: "Use a wildcard on an object to select all of its members.",
            instructions: "Write a query that selects every value inside the location object.",
            values: ["Pune", 3],
            expected: [["library", "location", "city"], ["library", "location", "floors"]],
            solution: "$.library.location.*",
            hints: ["You want all of the members of location, whatever their names.", "The wildcard works on objects as well as arrays.", "End the query with .* after location."],
            explanation: "On an object the wildcard selector selects the value of every member. The order is the order of the members in the document, which is how this query returns the city before the floors.",
            source: "RFC 9535 section 2.3.2 (wildcard selector)"
        }),
        exercise({
            id: "jpc-descendant-name", title: "Anywhere in the document", difficulty: "intermediate",
            objective: "Find a member at any depth with the descendant segment.",
            instructions: "Write a query that selects every value of a member called name, wherever it is in the document.",
            values: ["City Library", "Mira", "Dev", "Lena"],
            expected: [["library", "name"], staff(0, "name"), staff(1, "name"), staff(2, "name")],
            solution: "$..name",
            hints: ["The members called name are at different depths.", "Two dots in a row search the node and everything below it.", "Write $..name."],
            explanation: "The descendant segment .. looks at the node and at every node below it, however deep. $..name therefore finds the name of the library and the name of each staff member in one query.",
            source: "RFC 9535 section 2.5.2 (descendant segment)"
        }),
        exercise({
            id: "jpc-filter-price", title: "Cheaper than twenty", difficulty: "intermediate",
            objective: "Filter array items with a comparison.",
            instructions: "Write a query that selects the title of each book that costs less than 20.",
            values: ["Rivers of Ink", "Salt Roads", "Old Maps"],
            expected: [book(0, "title"), book(2, "title"), book(4, "title")],
            solution: "$.library.books[?@.price<20].title",
            hints: ["A filter selector starts with ? inside the square brackets.", "Inside a filter, @ stands for the item being tested.", "Write [?@.price<20] after books."],
            explanation: "A filter selector keeps the items for which its expression is true. @ is the current item, so @.price<20 is true for the books priced below 20: 12.5, 18.75 and 9.",
            source: "RFC 9535 section 2.3.5 (filter selector)"
        }),
        exercise({
            id: "jpc-filter-exists", title: "Only some have an isbn", difficulty: "intermediate",
            objective: "Test whether a member exists.",
            instructions: "Write a query that selects the title of each book that has an isbn member.",
            values: ["Small Loops"],
            expected: [book(3, "title")],
            solution: "$.library.books[?@.isbn].title",
            hints: ["You are not comparing the isbn to anything, only checking it is there.", "A filter with just @ and a path is true when that path selects something.", "Write [?@.isbn] after books."],
            explanation: "A query on its own inside a filter is an existence test: it is true when the query finds at least one node. It does not look at the value, so an isbn of false or 0 would also count as existing.",
            source: "RFC 9535 section 2.3.5.2 (existence tests)"
        }),
        exercise({
            id: "jpc-filter-boolean", title: "On the shelf now", difficulty: "intermediate",
            objective: "Compare a member with a boolean.",
            instructions: "Write a query that selects the id of each book whose available member is true.",
            values: [1, 3, 4],
            expected: [book(0, "id"), book(2, "id"), book(3, "id")],
            solution: "$.library.books[?@.available==true].id",
            hints: ["true is written without quotes in a comparison.", "Use == to compare for equality.", "Write [?@.available==true] after books, then .id."],
            explanation: "The comparison @.available==true is true when the member exists and holds the boolean true. Books 1, 3 and 4 qualify; books 2 and 5 have false.",
            source: "RFC 9535 section 2.3.5.2 (comparisons)"
        }),
        exercise({
            id: "jpc-filter-string", title: "Matching a string", difficulty: "intermediate",
            objective: "Compare a member with a string literal.",
            instructions: "Write a query that selects the name of each staff member whose role is librarian.",
            values: ["Mira", "Lena"],
            expected: [staff(0, "name"), staff(2, "name")],
            solution: "$.library.staff[?@.role=='librarian'].name",
            hints: ["A string literal in a query is wrapped in quotes.", "Either single or double quotes will do.", "Write [?@.role=='librarian'] after staff, then .name."],
            explanation: "A string literal in a filter needs quotes, and the comparison is exact: 'librarian' matches the role librarian and not assistant. Single quotes are used in the example because the whole query may later be put inside a double-quoted string.",
            source: "RFC 9535 section 2.3.5.2 (comparisons)"
        }),
        exercise({
            id: "jpc-union-indexes", title: "Choosing three", difficulty: "intermediate",
            objective: "Select several named items with one selector list.",
            instructions: "Write a query that selects the titles of the first, third and fifth books, in that order, using one pair of square brackets for the choice.",
            ordered: true,
            values: ["Rivers of Ink", "Salt Roads", "Old Maps"],
            expected: [book(0, "title"), book(2, "title"), book(4, "title")],
            solution: "$.library.books[0,2,4].title",
            hints: ["A bracket can hold several selectors separated by commas.", "The results come in the order the selectors are written.", "Write [0,2,4] after books."],
            explanation: "A bracketed selection can contain a comma-separated list of selectors, and each selector adds its nodes in turn, so the order of the list is the order of the results. Index 0, 2 and 4 are the first, third and fifth books.",
            source: "RFC 9535 section 2.5.1 (child segment)"
        }),
        exercise({
            id: "jpc-descendant-price", title: "Every price", difficulty: "intermediate",
            objective: "Combine the descendant segment with a name.",
            instructions: "Write a query that selects every price in the document without naming the books array.",
            values: [12.5, 30, 18.75, 45, 9],
            expected: [0, 1, 2, 3, 4].map((i) => book(i, "price")),
            solution: "$..price",
            hints: ["You do not want to say where the prices are.", "Use the segment that searches at any depth.", "Write $..price."],
            explanation: "$..price finds every member called price below the root, in document order. It is shorter than naming the path, and it also finds prices that appear in new places later, which is both its use and its risk.",
            source: "RFC 9535 section 2.5.2 (descendant segment)"
        }),
        exercise({
            id: "jpc-and", title: "Recent and available", difficulty: "advanced",
            objective: "Combine two conditions with &&.",
            instructions: "Write a query that selects the title of each book published in the year 2000 or later that is available (available is true).",
            values: ["Salt Roads", "Small Loops"],
            expected: [book(2, "title"), book(3, "title")],
            solution: "$.library.books[?@.year>=2000 && @.available==true].title",
            hints: ["Two conditions that must both hold are joined with &&.", "Quiet Code is from 2015 but is not available.", "Write [?@.year>=2000 && @.available==true]."],
            explanation: "&& is true only when both sides are true. Three books are from 2000 or later, and one of those (Quiet Code) is not available, so two remain.",
            source: "RFC 9535 section 2.3.5.1 (filter syntax)"
        }),
        exercise({
            id: "jpc-or", title: "Dear or old", difficulty: "advanced",
            objective: "Combine two conditions with ||.",
            instructions: "Write a query that selects the title of each book that costs more than 40 or was published before 1980.",
            values: ["Small Loops", "Old Maps"],
            expected: [book(3, "title"), book(4, "title")],
            solution: "$.library.books[?@.price>40 || @.year<1980].title",
            hints: ["Either condition is enough, so join them with ||.", "Only one book costs more than 40, and only one is from before 1980.", "Write [?@.price>40 || @.year<1980]."],
            explanation: "|| is true when at least one side is true. Small Loops costs 45 and Old Maps is from 1975, and no other book meets either condition.",
            source: "RFC 9535 section 2.3.5.1 (filter syntax)"
        }),
        exercise({
            id: "jpc-not-available", title: "Not on the shelf", difficulty: "advanced",
            objective: "Avoid the existence-test trap: a bare member test checks that it exists, not that it is true.",
            instructions: "Write a query that selects the title of each book whose available member is false. Be careful: the shortcut that looks right does not select what you want in this document.",
            values: ["Quiet Code", "Old Maps"],
            expected: [book(1, "title"), book(4, "title")],
            solution: "$.library.books[?@.available==false].title",
            hints: ["Try [?!@.available] and look at the result.", "@.available on its own asks whether the member exists, and every book has one, so ! makes it false for all of them.", "Compare the value instead: @.available==false."],
            explanation: "In a filter, @.available alone is an existence test, not a test of truth. Every book has an available member, so !@.available is false for every book and selects nothing. To select the books where it is false, compare the value with false.",
            source: "RFC 9535 section 2.3.5.2 (existence tests and negation)"
        }),
        exercise({
            id: "jpc-count", title: "Counting inside a filter", difficulty: "advanced",
            objective: "Use the count() function inside a filter.",
            instructions: "Write a query that selects the title of each book that has more than one tag.",
            values: ["Rivers of Ink", "Small Loops"],
            expected: [book(0, "title"), book(3, "title")],
            solution: "$.library.books[?count(@.tags[*])>1].title",
            hints: ["count() returns how many nodes a query selects.", "@.tags[*] selects every tag of the current book.", "Write [?count(@.tags[*])>1]."],
            explanation: "count() takes a query and returns the number of nodes it selects. Here it counts the tags of each book, and the filter keeps the books with more than one. The book with an empty tags array selects no nodes, so its count is 0.",
            source: "RFC 9535 section 2.4.4 (count function)"
        }),
        exercise({
            id: "jpc-reverse", title: "Back to front", difficulty: "advanced",
            objective: "Reverse the order of results with a negative slice step.",
            instructions: "Write a query that selects the titles of all books, last book first.",
            ordered: true,
            values: ["Old Maps", "Small Loops", "Salt Roads", "Quiet Code", "Rivers of Ink"],
            expected: [4, 3, 2, 1, 0].map((i) => book(i, "title")),
            solution: "$.library.books[::-1].title",
            hints: ["A slice can have a third part, the step.", "A negative step walks the array backwards.", "Write [::-1] after books."],
            explanation: "A slice start:end:step walks the array by the step, and a step of -1 goes backwards. Leaving the start and end empty means the whole array, so [::-1] returns every item in reverse order.",
            source: "RFC 9535 section 2.3.4 (array slice selector)"
        }),
        exercise({
            id: "jpc-experienced-librarians", title: "Two conditions on staff", difficulty: "advanced",
            objective: "Combine a string comparison and a number comparison.",
            instructions: "Write a query that selects the name of each librarian who has worked at least 6 years.",
            values: ["Mira", "Lena"],
            expected: [staff(0, "name"), staff(2, "name")],
            solution: "$.library.staff[?@.role=='librarian' && @.years>=6].name",
            hints: ["Dev is an assistant with 3 years, so he fails both tests.", "Both conditions must hold, so use &&.", "Write [?@.role=='librarian' && @.years>=6]."],
            explanation: "Mira has 12 years and Lena has 6, and both are librarians. The comparison >= includes 6 itself, so Lena is selected. If the query used > instead, only Mira would remain: a good boundary to check.",
            source: "RFC 9535 section 2.3.5.1 (filter syntax)"
        })
    ]
};
