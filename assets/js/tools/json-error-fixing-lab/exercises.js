/* =========================================================
   ToolZen Hub
   JSON Error-Fixing Lab: the exercises

   Plain data (see learning/content-schema.js, validateExerciseSet).
   Each exercise has broken text to repair (`starting`), the value the
   repaired text must have (`expected`), one accepted solution and the
   reasoning. The instructions always say which of two possible repairs
   is wanted, so the exercise has one correct value.

   Difficulty: beginner = one fault, intermediate = one fault that
   needs a decision or two faults, advanced = three or more faults or a
   rule with an exception.
========================================================= */

export const set = {
    id: "json-error-fixing",
    version: "1.0.0",
    title: "JSON Error-Fixing Lab",
    description: "Eighteen exercises in repairing invalid JSON, from a trailing comma to a truncated log line, each checked by a strict validator.",
    reviewed: {
        date: "2026-10-29",
        method: "Written by the author. Every starting text was run through Python's json module (strict mode, with NaN and duplicate keys refused) to confirm it is invalid or ambiguous, and every solution to confirm it parses to the expected value. No second reviewer yet."
    },
    exercises: [
        {
            id: "jef-trailing-comma", title: "A comma too many", difficulty: "beginner",
            objective: "Spot and remove a trailing comma, which strict JSON does not allow.",
            instructions: "This text should describe one person, but it will not parse. Repair it so it is valid JSON with the same two keys and values.",
            starting: '{"name": "Asha", "age": 31,}',
            expected: { name: "Asha", age: 31 },
            solution: '{"name": "Asha", "age": 31}',
            hints: [
                "Read the message from the Check answer button. It gives a line and a column.",
                "Look at what comes after the last value in the object.",
                "A comma separates two members. After the last member there is nothing to separate."
            ],
            explanation: "In JSON a comma goes between two values, never after the last one. JavaScript object literals and some config formats allow a trailing comma, which is why it is such a common slip, but the JSON grammar does not.",
            source: "RFC 8259 section 4 (objects)",
            tool: "json-formatter"
        },
        {
            id: "jef-single-quotes", title: "Quotes of the wrong kind", difficulty: "beginner",
            objective: "Replace single quotes with double quotes and keep a text value as text.",
            instructions: "Repair this text so it is valid JSON. The pin is a code, so it must stay a string and keep its quotes.",
            starting: "{'city': 'Pune', 'pin': '411001'}",
            expected: { city: "Pune", pin: "411001" },
            solution: '{"city": "Pune", "pin": "411001"}',
            hints: [
                "JSON strings and keys use one kind of quote only.",
                "Replace every single quote with a double quote.",
                "Do not remove the quotes round the pin: 411001 and \"411001\" are different values in JSON."
            ],
            explanation: "JSON strings, and every key, must be wrapped in double quotes. Single quotes are valid in JavaScript and Python, so text copied from code often has them. The answer must also keep the pin as a string, because a number and a string with the same digits are different JSON values.",
            source: "RFC 8259 section 7 (strings)",
            tool: "json-formatter"
        },
        {
            id: "jef-unquoted-key", title: "Keys without quotes", difficulty: "beginner",
            objective: "Quote object keys.",
            instructions: "Repair this text so it is valid JSON with the same two keys and values.",
            starting: '{status: "active", retries: 3}',
            expected: { status: "active", retries: 3 },
            solution: '{"status": "active", "retries": 3}',
            hints: [
                "The message refers to the first key.",
                "In JSON every key is a string.",
                "Wrap both keys in double quotes."
            ],
            explanation: "A JSON object key is always a string, so it needs double quotes. A JavaScript object literal lets simple names stand without quotes, which looks the same at a glance and is the usual source of this error.",
            source: "RFC 8259 section 4 (objects)",
            tool: "json-formatter"
        },
        {
            id: "jef-missing-comma", title: "Two values, no comma", difficulty: "beginner",
            objective: "Find a missing comma between array items.",
            instructions: "Repair this text so it is valid JSON, with the same id and the same two tags in the same order.",
            starting: '{"id": 7, "tags": ["red" "blue"]}',
            expected: { id: 7, tags: ["red", "blue"] },
            solution: '{"id": 7, "tags": ["red", "blue"]}',
            hints: [
                "The message says what the parser expected to find.",
                "Look inside the array.",
                "Two items next to each other need a comma between them."
            ],
            explanation: "Members of an object and items of an array are separated by commas. When one is missing the parser finds a value where it expected a comma or a closing bracket, and reports the position of that second value.",
            source: "RFC 8259 section 5 (arrays)",
            tool: "json-formatter"
        },
        {
            id: "jef-missing-brace", title: "Not closed", difficulty: "beginner",
            objective: "Match opening and closing brackets.",
            instructions: "This text ends too early. Repair it so it is valid JSON and keeps the same nesting: user is an object that holds id and roles.",
            starting: '{"user": {"id": 5, "roles": ["admin", "dev"]}',
            expected: { user: { id: 5, roles: ["admin", "dev"] } },
            solution: '{"user": {"id": 5, "roles": ["admin", "dev"]}}',
            hints: [
                "Count the opening braces and the closing braces.",
                "There are two opening braces and one closing brace.",
                "Add the missing closing brace at the end."
            ],
            explanation: "Every opening brace or bracket needs its closing partner. Text that stops early, for example a cut-off log line or a copy that missed the last character, is reported as an unexpected end of input.",
            source: "RFC 8259 section 4 (objects)",
            tool: "json-formatter"
        },
        {
            id: "jef-comment", title: "A comment in the data", difficulty: "beginner",
            objective: "Remove a comment, which JSON does not have.",
            instructions: "Repair this text so it is valid JSON with the single key max and the value 10. Comments are not part of JSON, so remove it.",
            starting: '{\n  // the largest allowed size\n  "max": 10\n}',
            expected: { max: 10 },
            solution: '{\n  "max": 10\n}',
            hints: [
                "The message refers to the slashes.",
                "JSON has no comment syntax at all.",
                "Delete the whole comment line."
            ],
            explanation: "The JSON grammar has no comments, either with two slashes or with slash and star. Some tools accept them as an extension and some config formats are built on JSON with comments added, but a strict JSON parser refuses them.",
            source: "RFC 8259 section 2 (JSON grammar)",
            tool: "json-formatter"
        },
        {
            id: "jef-extra-comma", title: "A doubled comma", difficulty: "intermediate",
            objective: "Remove an empty slot between two commas.",
            instructions: "Repair this array so it is valid JSON and holds the numbers 1, 2 and 3 in that order, with nothing else.",
            starting: "[1, 2,, 3]",
            expected: [1, 2, 3],
            solution: "[1, 2, 3]",
            hints: [
                "The message refers to the second comma.",
                "Between two commas the parser expects a value, and finds none.",
                "Delete one of the two commas. Do not add a value."
            ],
            explanation: "A JavaScript array literal can contain an empty slot, but JSON cannot. Each comma must have a value on both sides, so two commas in a row are an error and the repair is to remove one.",
            source: "RFC 8259 section 5 (arrays)",
            tool: "json-formatter"
        },
        {
            id: "jef-not-a-number", title: "Values JSON cannot hold", difficulty: "intermediate",
            objective: "Replace NaN, Infinity and undefined, which JSON does not define.",
            instructions: "Repair this text so it is valid JSON and keeps all three keys. JSON has no way to write these three values, so give each key the value null.",
            starting: '{"ratio": NaN, "limit": Infinity, "note": undefined}',
            expected: { ratio: null, limit: null, note: null },
            solution: '{"ratio": null, "limit": null, "note": null}',
            hints: [
                "The message refers to the first word that is not a JSON value.",
                "The only words JSON allows as values are true, false and null.",
                "Replace each of the three words with null."
            ],
            explanation: "JSON values are objects, arrays, strings, numbers and the three names true, false and null. NaN and Infinity are JavaScript numbers that JSON cannot write, and undefined is not a value in JSON at all. Programs that serialise data usually turn them into null, or leave the key out.",
            source: "RFC 8259 section 6 (numbers) and section 3 (values)",
            tool: "json-formatter"
        },
        {
            id: "jef-leading-zero", title: "A leading zero", difficulty: "intermediate",
            objective: "Tell a number from a code that only looks like one.",
            instructions: "Repair this text so it is valid JSON. The zip is a code whose zeros matter, so keep it as the text 07030. The qty is a count and must be the number 7.",
            starting: '{"zip": 07030, "qty": 007}',
            expected: { zip: "07030", qty: 7 },
            solution: '{"zip": "07030", "qty": 7}',
            hints: [
                "A JSON number cannot start with a zero unless it is just 0 or has a decimal point straight after it.",
                "A code with meaningful leading zeros is text. Numbers are for counting and arithmetic.",
                "Put the zip in quotes, and write the qty as 7."
            ],
            explanation: "The JSON number grammar does not allow leading zeros, partly to avoid confusion with the octal notation some languages use. Identifiers such as zip codes, phone numbers and account numbers are better stored as strings, so that no digit is ever dropped.",
            source: "RFC 8259 section 6 (numbers)",
            tool: "json-formatter"
        },
        {
            id: "jef-bad-escape", title: "Backslashes in a path", difficulty: "intermediate",
            objective: "Escape a backslash inside a string.",
            instructions: "Repair this text so it is valid JSON. The value of path must be exactly the text C:\\Users\\amy\\notes.txt, with single backslashes.",
            starting: '{"path": "C:\\Users\\amy\\notes.txt"}',
            expected: { path: "C:\\Users\\amy\\notes.txt" },
            solution: '{"path": "C:\\\\Users\\\\amy\\\\notes.txt"}',
            hints: [
                "In a JSON string a backslash starts an escape such as \\n or \\t.",
                "Only a few letters can follow a backslash. U and a are not among them.",
                "To write one backslash inside a string, write two."
            ],
            explanation: "A backslash in a JSON string begins an escape. The valid escapes are backslash, slash, quote, b, f, n, r, t and u followed by four hex digits. To keep a literal backslash you write two. The common failure is a Windows path pasted straight into a JSON string. Note that fixing only the invalid escapes is not enough here: the \n in notes.txt is a valid escape and would silently become a line break.",
            source: "RFC 8259 section 7 (strings)",
            tool: "json-formatter"
        },
        {
            id: "jef-raw-newline", title: "A line break inside a string", difficulty: "intermediate",
            objective: "Use an escape for a line break inside a string.",
            instructions: "Repair this text so it is valid JSON. The value of msg must be two lines of text: Line one, then a line break, then line two.",
            starting: '{"msg": "Line one\nline two"}',
            expected: { msg: "Line one\nline two" },
            solution: '{"msg": "Line one\\nline two"}',
            hints: [
                "The message refers to the place where the line breaks inside the quotes.",
                "A string must stay on one line of the text.",
                "Write the line break as the two characters backslash and n."
            ],
            explanation: "Control characters, including the line break, may not appear raw inside a JSON string. They must be written as escapes, and the line break is the two-character escape backslash n. The text is then one line, and the parsed value contains the real line break.",
            source: "RFC 8259 section 7 (strings)",
            tool: "json-formatter"
        },
        {
            id: "jef-curly-quotes", title: "Quotes from a document", difficulty: "intermediate",
            objective: "Replace typographic quotes pasted from a document or chat.",
            instructions: "Repair this text so it is valid JSON with the key name and the value Ravi. The quotes look right but are not the quote characters JSON needs.",
            starting: "{\u201Cname\u201D: \u201CRavi\u201D}",
            expected: { name: "Ravi" },
            solution: '{"name": "Ravi"}',
            hints: [
                "The message refers to the very first quote.",
                "Word processors and chat apps replace the plain quote with a curly one.",
                "Delete the curly quotes and type plain double quotes."
            ],
            explanation: "JSON uses the plain ASCII double quote. The curly quotes that editors insert automatically are different characters, so the parser sees an unexpected character where a string should begin. Pasting code through a document or a chat message is the usual cause.",
            source: "RFC 8259 section 7 (strings)",
            tool: "json-formatter"
        },
        {
            id: "jef-two-faults", title: "Two faults in one object", difficulty: "intermediate",
            objective: "Repair more than one fault, one after another.",
            instructions: "Repair this text so it is valid JSON with the same keys and values. Fixing one fault shows the next.",
            starting: "{'items': [1, 2, 3,], 'ok': true}",
            expected: { items: [1, 2, 3], ok: true },
            solution: '{"items": [1, 2, 3], "ok": true}',
            hints: [
                "Fix the first error that the message reports, then check again.",
                "There are single quotes and a trailing comma.",
                "Use double quotes for the keys, and remove the comma after 3."
            ],
            explanation: "Real broken JSON often has several faults and a parser reports only the first. Fixing them one at a time, and checking after each, is the usual way to work. Here the quotes come first and the trailing comma second.",
            source: "RFC 8259 section 2 (JSON grammar)",
            tool: "json-formatter"
        },
        {
            id: "jef-python-literals", title: "Python values", difficulty: "advanced",
            objective: "Convert Python literals to their JSON equivalents.",
            instructions: "This text was printed from a Python dictionary. Repair it so it is valid JSON that keeps all three keys, with True as true and None as null.",
            starting: "{'active': True, 'owner': None, 'tags': ['a', 'b']}",
            expected: { active: true, owner: null, tags: ["a", "b"] },
            solution: '{"active": true, "owner": null, "tags": ["a", "b"]}',
            hints: [
                "Printing a Python dictionary does not produce JSON.",
                "Three things differ: the quotes, True and None.",
                "JSON writes the names in lower case: true, false and null."
            ],
            explanation: "The text printed by Python for a dictionary uses single quotes, True, False and None. JSON uses double quotes and the lower case names true, false and null. A serialiser such as Python's json.dumps produces the right form, so this repair is best done by a program, not by hand.",
            source: "RFC 8259 section 3 (values)",
            tool: "json-formatter"
        },
        {
            id: "jef-config-faults", title: "A configuration file", difficulty: "advanced",
            objective: "Repair four different faults in one text.",
            instructions: "Repair this text so it is valid JSON with the keys host (the text db1) and port (the number 5432), and nothing else.",
            starting: '{\n  // database settings\n  host: "db1"\n  "port": 5432,\n}',
            expected: { host: "db1", port: 5432 },
            solution: '{\n  "host": "db1",\n  "port": 5432\n}',
            hints: [
                "Fix the first error that is reported, then check again.",
                "There is a comment, an unquoted key, a missing comma and a trailing comma.",
                "Delete the comment, quote host, add a comma after \"db1\", and remove the comma after 5432."
            ],
            explanation: "Hand-edited configuration files often mix habits from several formats. Each fault is easy on its own. The skill is to work through them one at a time and re-check, because the parser stops at the first one.",
            source: "RFC 8259 section 2 (JSON grammar)",
            tool: "json-formatter"
        },
        {
            id: "jef-duplicate-key", title: "A key that appears twice", difficulty: "advanced",
            objective: "Notice that valid syntax can still be ambiguous.",
            instructions: "This text parses, but the key id appears twice. Rewrite it so each key appears once, and the value kept for id is the one that comes last, which is what most parsers keep.",
            starting: '{"id": 1, "name": "x", "id": 2}',
            expected: { id: 2, name: "x" },
            solution: '{"id": 2, "name": "x"}',
            hints: [
                "The text is valid syntax, so look at what the checker says about the keys.",
                "The same key name should not appear twice in one object.",
                "Remove the first id. Keep name, and keep the value 2."
            ],
            explanation: "The JSON standard says key names within an object should be unique, and that the behaviour of software that receives duplicates is unpredictable. Many parsers keep the last value, but some report an error or return every pair, so duplicates are a real source of bugs and of security problems.",
            source: "RFC 8259 section 4 (objects)",
            tool: "json-formatter"
        },
        {
            id: "jef-truncated", title: "A cut-off log line", difficulty: "advanced",
            objective: "Close several nested brackets in the right order.",
            instructions: "This text was cut off at the end of a log line. Complete it so it is valid JSON that closes the second event, the events array and the outer object, and adds no new values.",
            starting: '{"events": [{"type": "click", "x": 10}, {"type": "scroll", "y": 200',
            expected: { events: [{ type: "click", x: 10 }, { type: "scroll", y: 200 }] },
            solution: '{"events": [{"type": "click", "x": 10}, {"type": "scroll", "y": 200}]}',
            hints: [
                "The message says the text ended while a value was still open.",
                "Close the innermost open bracket first.",
                "You need a closing brace, then a closing square bracket, then a closing brace."
            ],
            explanation: "Brackets must close in the reverse order to which they opened: the last one opened is the first one closed. Log lines, network captures and pasted fragments are often truncated, and the repair is to close whatever is open, from the inside out, only when you know nothing else was lost.",
            source: "RFC 8259 section 2 (JSON grammar)",
            tool: "json-formatter"
        },
        {
            id: "jef-number-forms", title: "Numbers written four ways", difficulty: "advanced",
            objective: "Write numbers in the forms JSON allows.",
            instructions: "Repair this text so it is valid JSON with the same four numbers: a is one half, b is one, c is three and d is thirty-one (the hexadecimal 0x1F).",
            starting: '{"a": .5, "b": 1., "c": +3, "d": 0x1F}',
            expected: { a: 0.5, b: 1, c: 3, d: 31 },
            solution: '{"a": 0.5, "b": 1, "c": 3, "d": 31}',
            hints: [
                "Fix the first error that is reported, then check again.",
                "JSON numbers need a digit on each side of a decimal point, allow no plus sign, and are written in decimal.",
                "Write 0.5, then 1, then 3, then convert 0x1F to decimal."
            ],
            explanation: "A JSON number is an optional minus sign, an integer part, an optional fraction and an optional exponent. A leading dot, a trailing dot, a plus sign and hexadecimal are all accepted by some languages and refused by the JSON grammar.",
            source: "RFC 8259 section 6 (numbers)",
            tool: "json-formatter"
        }
    ]
};
