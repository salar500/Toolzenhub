/* =========================================================
   ToolZen Hub
   Smart Flashcards deck: JSON and data formats

   Plain data (see learning/content-schema.js). Original questions
   and explanations; the sources are the standards named on each card.
   Every example text that is claimed valid or invalid is checked by
   the strict JSON engine in tests/unit/flashcards-content.test.mjs.
========================================================= */

export const deck = {
    id: "json",
    version: "1.0.0",
    title: "JSON",
    description: "What strict JSON allows and rejects, how strings and numbers behave, how JSON differs from a JavaScript object, and what a valid response still does not prove.",
    reviewed: {
        date: "2026-10-28",
        method: "Each answer was checked against RFC 8259 and, for example texts, run through the strict JSON engine of the JSON Formatter."
    },
    topics: [
        { id: "values", title: "Value types" },
        { id: "syntax", title: "Syntax errors" },
        { id: "strings", title: "Strings and escaping" },
        { id: "numbers", title: "Numbers" },
        { id: "json-vs-js", title: "JSON and JavaScript" },
        { id: "keys", title: "Keys and duplicates" },
        { id: "apis", title: "JSON in API responses" }
    ],
    cards: [
        {
            id: "json-value-kinds", topic: "values", kind: "recall", difficulty: "beginner",
            prompt: "Which kinds of value can a JSON document contain?",
            answer: "Objects, arrays, strings and numbers, plus the three literal names true, false and null.",
            explanation: "RFC 8259 section 3 defines a value as an object, array, number or string, or one of the literals false, null and true. There is no date, no undefined and no function: dates travel as strings or numbers by agreement.",
            source: "RFC 8259 section 3", tool: "json-formatter"
        },
        {
            id: "json-top-level-number", topic: "values", kind: "choice", difficulty: "intermediate",
            prompt: "Is the text below, on its own, a valid JSON document?",
            code: "42",
            options: [
                "No. The top level of every JSON text must be an object or an array, never a bare number.",
                "No. A number must be inside quotation marks.",
                "Yes. Since RFC 8259, any JSON value may stand alone at the top level.",
                "Yes, but only if it ends with a semicolon."
            ],
            correct: 2,
            explanation: "The older RFC 4627 required an object or an array at the top level, which is why this is a common mistake. RFC 8259 allows any value, so 42, \"text\", true and null are all complete documents. Some older tools still refuse them, so API designers usually return an object anyway.",
            source: "RFC 8259 section 2", tool: "json-formatter"
        },
        {
            id: "json-trailing-comma", topic: "syntax", kind: "choice", difficulty: "beginner",
            prompt: "Is this valid JSON?",
            code: "{\"name\":\"Alex\",\"age\":25,}",
            options: [
                "No. A comma must be followed by another member.",
                "Yes. A single trailing comma after the last member is ignored by JSON parsers.",
                "Yes, but only in arrays.",
                "No. Numbers cannot be last."
            ],
            correct: 0,
            explanation: "The grammar puts commas between members, never after the last one. The fix is to delete the final comma: {\"name\":\"Alex\",\"age\":25}. Trailing commas are accepted by JavaScript object literals and by some lenient parsers, which is why the mistake survives until a strict parser reads it.",
            source: "RFC 8259 section 4", tool: "json-formatter"
        },
        {
            id: "json-single-quotes", topic: "syntax", kind: "choice", difficulty: "beginner",
            prompt: "Is this valid JSON?",
            code: "{'city':'Pune'}",
            options: [
                "Yes. Single and double quotes are interchangeable.",
                "Yes, as long as the whole document is written on a single line without spaces.",
                "No. Strings and keys must use double quotation marks.",
                "No. Keys must not be strings."
            ],
            correct: 2,
            explanation: "JSON strings are delimited by double quotation marks only, and object keys are strings. Python dictionaries printed with str() and JavaScript object literals often use single quotes, so copying them into JSON fails.",
            source: "RFC 8259 sections 7 and 4", tool: "json-formatter"
        },
        {
            id: "json-unquoted-key", topic: "keys", kind: "choice", difficulty: "beginner",
            prompt: "Why is this not valid JSON?",
            code: "{name: \"Alex\"}",
            options: [
                "The value should be written as a number, because names are always text values.",
                "A JSON object cannot have only one member.",
                "The braces should be square brackets.",
                "The key name must be a double-quoted string."
            ],
            correct: 3,
            explanation: "In JSON every member name is a string in double quotation marks. JavaScript allows bare identifiers as keys in an object literal, but that is JavaScript syntax, not JSON.",
            source: "RFC 8259 section 4", tool: "json-formatter"
        },
        {
            id: "json-comments", topic: "syntax", kind: "choice", difficulty: "beginner",
            prompt: "What does JSON say about comments such as // note or /* note */?",
            options: [
                "JSON has no comment syntax, so a strict parser rejects them.",
                "Both forms are allowed anywhere whitespace is allowed, as in many programming languages.",
                "Only the // form is allowed, and only at the end of a line of the document.",
                "Comments are allowed only inside arrays."
            ],
            correct: 0,
            explanation: "The JSON grammar has no comments. Configuration formats that look like JSON but allow comments (often called JSONC or JSON5) are different formats and need their own parsers. If you need a note inside real JSON, use a normal member such as \"_note\" and agree what it means.",
            source: "RFC 8259 section 2", tool: "json-formatter"
        },
        {
            id: "json-missing-comma", topic: "syntax", kind: "choice", difficulty: "beginner",
            prompt: "What is wrong with this text?",
            code: "{\"a\":1 \"b\":2}",
            options: [
                "The key b must not be quoted.",
                "Numbers must be written in quotation marks.",
                "Nothing; it is valid.",
                "A comma is missing between the two members."
            ],
            correct: 3,
            explanation: "Members of an object are separated by a comma. A strict parser stops at the second quotation mark, where it expected a comma or a closing brace. The fix is {\"a\":1,\"b\":2}.",
            source: "RFC 8259 section 4", tool: "json-formatter"
        },
        {
            id: "json-mismatched-bracket", topic: "syntax", kind: "choice", difficulty: "intermediate",
            prompt: "What is wrong with this text?",
            code: "{\"items\":[1,2,3}",
            options: [
                "Arrays cannot hold numbers.",
                "The array is closed with } instead of ].",
                "The key items must not be quoted.",
                "There should be a comma after 3."
            ],
            correct: 1,
            explanation: "Every opening bracket needs its own matching closer. The array opened with [ must end with ], and only then can the object close with }. Counting openers and closers, or letting a formatter point at the first mismatch, is the quickest way to find this.",
            source: "RFC 8259 sections 4 and 5", tool: "json-formatter"
        },
        {
            id: "json-two-documents", topic: "syntax", kind: "choice", difficulty: "intermediate",
            prompt: "Is this one valid JSON document?",
            code: "{\"a\":1}{\"b\":2}",
            options: [
                "Yes. Several objects can be placed one after another in a single JSON document.",
                "Yes, as long as there is no whitespace between the closing and the opening brace.",
                "No. Objects must contain arrays.",
                "No. A JSON text is one value; two values need a wrapper such as an array."
            ],
            correct: 3,
            explanation: "A JSON text contains exactly one top-level value. Two objects in a row are two texts. Wrap them in an array ([{\"a\":1},{\"b\":2}]) or, for streams, use a line-based convention such as JSON Lines where each line is its own complete document.",
            source: "RFC 8259 section 2", tool: "json-formatter"
        },
        {
            id: "json-empty-input", topic: "syntax", kind: "choice", difficulty: "beginner",
            prompt: "Is an empty string (no characters at all) a valid JSON document?",
            options: [
                "Yes. It means an empty object.",
                "Yes. It means null.",
                "No. A document must contain exactly one value.",
                "Only if it is followed by a newline."
            ],
            correct: 2,
            explanation: "Nothing is not a value. An empty response body from an API therefore cannot be parsed as JSON, and JSON.parse(\"\") throws. A server that means \"no data\" should send null, {} or [] explicitly, or use a status such as 204 with no body.",
            source: "RFC 8259 section 2", tool: "json-formatter"
        },
        {
            id: "json-whitespace", topic: "syntax", kind: "choice", difficulty: "intermediate",
            prompt: "Which characters count as insignificant whitespace between JSON tokens?",
            options: [
                "Space, tab, line feed and carriage return.",
                "Only the space character.",
                "Any Unicode whitespace, including the non-breaking space.",
                "None; JSON must be minified."
            ],
            correct: 0,
            explanation: "RFC 8259 lists exactly four: space, horizontal tab, line feed and carriage return. A non-breaking space pasted from a web page or a word processor looks like a space but is not allowed, and is a classic cause of an error that is invisible on screen.",
            source: "RFC 8259 section 2", tool: "json-formatter"
        },
        {
            id: "json-escape-quote", topic: "strings", kind: "choice", difficulty: "intermediate",
            prompt: "How should the inner quotation marks be written so this becomes valid JSON?",
            code: "{\"quote\":\"She said \"hi\"\"}",
            options: [
                "Replace the inner double quotation marks with single quotation marks and keep the outer ones.",
                "Put a backslash before each inner quotation mark: \"She said \\\"hi\\\"\".",
                "Double each inner quotation mark, writing two in a row, as spreadsheets and CSV files do.",
                "Wrap the text in square brackets."
            ],
            correct: 1,
            explanation: "Inside a string, a double quotation mark must be escaped with a backslash, otherwise it ends the string early. Doubling the quote is the CSV convention, not JSON. Replacing with single quotes is valid JSON, but it changes the text rather than escaping it.",
            source: "RFC 8259 section 7", tool: "json-formatter"
        },
        {
            id: "json-raw-newline", topic: "strings", kind: "choice", difficulty: "advanced",
            prompt: "A string contains a real line break typed between its quotation marks. Is that valid JSON?",
            code: "{\"text\":\"line one\nline two\"}",
            options: [
                "Yes. Strings may span lines.",
                "Yes, but only when the file uses Windows (CRLF) line endings and nowhere else.",
                "No. Control characters such as a line break must be escaped, for example as \\n.",
                "No. A string may never contain the letter n."
            ],
            correct: 2,
            explanation: "Characters from U+0000 to U+001F must not appear raw inside a string. Write the line break as the two characters \\n. Multi-line text pasted straight into a quoted value is one of the most frequent causes of a parse error.",
            source: "RFC 8259 section 7", tool: "json-formatter"
        },
        {
            id: "json-unicode-escape", topic: "strings", kind: "recall", difficulty: "intermediate",
            prompt: "How can the character é (U+00E9) be written inside a JSON string using an escape sequence?",
            answer: "As \\u00e9: a backslash, the letter u, and four hexadecimal digits.",
            explanation: "The \\uXXXX escape names a UTF-16 code unit. Characters outside the Basic Multilingual Plane, such as many emoji, are written as two escapes (a surrogate pair). You never have to escape é at all if the document is encoded as UTF-8: it may simply appear as itself.",
            source: "RFC 8259 section 7"
        },
        {
            id: "json-encoding", topic: "strings", kind: "choice", difficulty: "advanced",
            prompt: "Which character encoding does RFC 8259 require for JSON exchanged between systems?",
            options: [
                "UTF-16 only",
                "UTF-8",
                "ISO-8859-1 (Latin-1)",
                "Whatever the sender prefers, with no rule"
            ],
            correct: 1,
            explanation: "JSON text exchanged between systems that are not part of a closed ecosystem must be encoded as UTF-8. Earlier versions allowed UTF-16 and UTF-32 as well. A writer must not add a byte order mark at the start; a parser may ignore one rather than report an error.",
            source: "RFC 8259 section 8.1"
        },
        {
            id: "json-leading-zero", topic: "numbers", kind: "choice", difficulty: "intermediate",
            prompt: "Is this valid JSON?",
            code: "{\"id\":007}",
            options: [
                "Yes. Leading zeros are ignored, so 007 is read as the number 7 everywhere.",
                "Yes, and it means the octal number 7, which is the same as the decimal number 7.",
                "No. The name id is a reserved word in JSON and cannot be used.",
                "No. A number cannot have leading zeros; 0 may only stand alone before a fraction or exponent."
            ],
            correct: 3,
            explanation: "The number grammar does not allow leading zeros, which avoids the ambiguity of 007 being read as octal by one parser and as decimal by another. If the leading zeros matter, such as in a code or a postcode, the value is an identifier and belongs in a string: \"007\".",
            source: "RFC 8259 section 6", tool: "json-formatter"
        },
        {
            id: "json-valid-number", topic: "numbers", kind: "choice", difficulty: "intermediate",
            prompt: "Which of these is a valid JSON number?",
            options: [
                "-0.5e3",
                ".5",
                "+5",
                "0x1F"
            ],
            correct: 0,
            explanation: "A JSON number is an optional minus, an integer part, an optional fraction and an optional exponent. A leading plus, a missing integer part (.5) and hexadecimal notation are all rejected. -0.5e3 is minus, 0, fraction .5 and exponent e3, which equals -500.",
            source: "RFC 8259 section 6"
        },
        {
            id: "json-nan-infinity", topic: "numbers", kind: "choice", difficulty: "intermediate",
            prompt: "Can JSON write NaN or Infinity as a number?",
            options: [
                "Yes, as NaN and Infinity.",
                "No. Such values are not part of JSON, so they are usually sent as null or as strings by agreement.",
                "Yes, but only inside arrays.",
                "Yes, as long as they are written inside single quotation marks instead of double ones."
            ],
            correct: 1,
            explanation: "The number grammar has no name for NaN or infinity. JavaScript's JSON.stringify turns both into null, which silently loses information. Agree with the other side how such values are sent, for example null or an explicit string.",
            source: "RFC 8259 section 6", tool: "json-formatter"
        },
        {
            id: "json-big-integer", topic: "numbers", kind: "choice", difficulty: "advanced",
            prompt: "The number 12345678901234567890 appears in a JSON document that is read with JavaScript's JSON.parse. What can happen?",
            options: [
                "Nothing; every integer is kept exactly.",
                "JSON.parse always throws an error for a number with more than fifteen digits in it.",
                "It is rounded to the nearest double-precision value, so low digits are lost.",
                "The number is converted to a string automatically, with all its digits kept as they were."
            ],
            correct: 2,
            explanation: "The JSON grammar puts no limit on the number of digits, but JavaScript stores numbers as 64-bit floating point, which is exact only up to 9007199254740991. The text above becomes 12345678901234567000. RFC 8259 warns that interoperability is only certain within that range, so large identifiers are safer as strings.",
            source: "RFC 8259 section 6", tool: "json-formatter"
        },
        {
            id: "json-boolean-case", topic: "values", kind: "choice", difficulty: "beginner",
            prompt: "Is this valid JSON?",
            code: "{\"active\":True}",
            options: [
                "Yes. True is accepted and means the same as the lowercase literal true in JSON.",
                "Yes, but only when it is the value of the first member and not of any later one.",
                "No. Booleans are not allowed in JSON.",
                "No. The literal names are lowercase: true, false and null."
            ],
            correct: 3,
            explanation: "The three literal names must be written in lowercase exactly. True and None are Python spellings, and a Python value printed with print() or str() is not valid JSON.",
            source: "RFC 8259 section 3", tool: "json-formatter"
        },
        {
            id: "json-null-vs-missing", topic: "values", kind: "recall", difficulty: "intermediate",
            prompt: "How does a member whose value is null differ from a member that is left out?",
            answer: "With null the key is present and its value is the null literal; when it is left out the key does not exist at all.",
            explanation: "JSON itself treats the two as different texts. Whether they mean the same thing is decided by the API: some treat a missing field as \"unchanged\" and null as \"clear this value\", especially in partial updates. Do not assume the two are interchangeable; read the contract.",
            source: "RFC 8259 section 3"
        },
        {
            id: "json-undefined", topic: "json-vs-js", kind: "choice", difficulty: "intermediate",
            prompt: "Is undefined a JSON value? What does JSON.stringify do with a property whose value is undefined?",
            options: [
                "It writes the word undefined in the output text, exactly as it is spelled in JavaScript.",
                "It is not a JSON value; JSON.stringify leaves that property out of an object.",
                "It writes null in place of the value for that property inside an object.",
                "It throws an error."
            ],
            correct: 1,
            explanation: "undefined exists only in JavaScript. JSON.stringify({a: undefined}) gives {} and the key disappears, while inside an array JSON.stringify([undefined]) gives [null]. That difference is a common cause of a field that silently vanishes between a client and a server.",
            source: "ECMAScript JSON.stringify; RFC 8259 section 3"
        },
        {
            id: "json-vs-js-object", topic: "json-vs-js", kind: "recall", difficulty: "intermediate",
            prompt: "Name two things that are allowed in a JavaScript object literal but not in JSON.",
            answer: "Any two of: unquoted keys, single-quoted strings, trailing commas, comments, and values such as undefined, functions or NaN.",
            explanation: "JSON was derived from JavaScript object literal syntax but is a stricter, language-independent data format. A JavaScript object also has methods and a prototype; JSON carries only data. Pasting an object literal from source code into a JSON field is therefore the usual way to produce invalid JSON.",
            source: "RFC 8259 section 1; ECMAScript object literals", tool: "json-formatter"
        },
        {
            id: "json-parse-result", topic: "json-vs-js", kind: "choice", difficulty: "beginner",
            prompt: "In JavaScript, what does JSON.parse('{\"a\":1}') return?",
            options: [
                "A JavaScript object with a property a equal to 1.",
                "The same text, left unchanged, returned to the caller as one long string.",
                "A Map with one entry.",
                "Nothing is returned; it only checks the syntax and then discards the result."
            ],
            correct: 0,
            explanation: "JSON.parse turns text into a value: here an ordinary object. The reverse, JSON.stringify, turns a value into text. Confusing the text with the object is why code sometimes tries to read a property from a string and gets undefined.",
            source: "ECMAScript JSON.parse"
        },
        {
            id: "json-key-type", topic: "keys", kind: "choice", difficulty: "beginner",
            prompt: "What type must the name of an object member have in JSON?",
            options: [
                "Any JSON value, including numbers.",
                "A number only.",
                "A string in double quotation marks.",
                "A bare identifier with no quotation marks."
            ],
            correct: 2,
            explanation: "Member names are always strings. A key that looks like a number, such as \"1\", is still the string 1. In JavaScript, obj[1] and obj[\"1\"] reach the same property; other languages may treat an integer key and a text key as different, so a key from JSON is always text.",
            source: "RFC 8259 section 4"
        },
        {
            id: "json-duplicate-keys", topic: "keys", kind: "choice", difficulty: "advanced",
            prompt: "What happens with duplicate member names in one object?",
            code: "{\"a\":1,\"a\":2}",
            options: [
                "It is a syntax error in every parser, so the text can never be read at all by any program that follows the specification.",
                "Parsers always merge the two values into an array, here [1, 2], to keep both, in the order in which they appear.",
                "The first value always wins, because the specification says so explicitly, which is why every parser agrees.",
                "The syntax is accepted, but parsers differ: many keep the last value, others reject the text or report every pair."
            ],
            correct: 3,
            explanation: "RFC 8259 says member names SHOULD be unique and that the behaviour of software receiving duplicates is unpredictable. JavaScript's JSON.parse keeps the last value, which is common, but other software may do something else. Treat duplicates as a defect in the data because two systems can read the same text differently.",
            source: "RFC 8259 section 4", tool: "json-formatter"
        },
        {
            id: "json-valid-empty", topic: "values", kind: "choice", difficulty: "beginner",
            prompt: "Which of these is valid JSON?",
            options: [
                "{}",
                "{,}",
                "[,]",
                "{\"a\"}"
            ],
            correct: 0,
            explanation: "{} is an empty object and [] is an empty array, and both are valid. A comma needs a value on each side, and a member needs both a name and a value separated by a colon, so {,} and [,] and {\"a\"} are all rejected.",
            source: "RFC 8259 sections 4 and 5"
        },
        {
            id: "json-content-type", topic: "apis", kind: "recall", difficulty: "intermediate",
            prompt: "Which media type labels a JSON body in an HTTP request or response?",
            answer: "application/json",
            explanation: "RFC 8259 registers application/json. A client that sends a JSON body with the wrong Content-Type, such as text/plain, may have it ignored or rejected by the server, and a server that labels JSON as text/html may be handled as a web page. Always label what you send.",
            source: "RFC 8259 section 11; RFC 9110 section 8.3", tool: "json-formatter"
        },
        {
            id: "json-type-mismatch", topic: "apis", kind: "choice", difficulty: "intermediate",
            prompt: "An API document says price is a number, but a response contains {\"price\":\"12.50\"}. What kind of problem is this?",
            options: [
                "Invalid JSON syntax.",
                "Valid JSON, but the value has the wrong type for the contract.",
                "Valid JSON and correct, because numbers are always written as strings.",
                "A duplicate key."
            ],
            correct: 1,
            explanation: "The text parses without any error: \"12.50\" is a perfectly good string. The problem is that the agreed type is a number. Syntax checks cannot see this; it needs a check against the contract, such as a schema or a test on the field.",
            source: "RFC 8259 section 3"
        },
        {
            id: "json-parse-not-proof", topic: "apis", kind: "recall", difficulty: "advanced",
            prompt: "A response body parses without error. Does that prove the data is correct?",
            answer: "No. Parsing proves only that the text is well-formed JSON.",
            explanation: "Well-formed JSON can still miss required fields, hold the wrong types, contain values out of range or describe the wrong record. Checking the data against the contract is a separate step from checking the syntax, and both belong in API tests.",
            source: "RFC 8259 section 2"
        }
    ]
};
