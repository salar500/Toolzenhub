/* =========================================================
   ToolZen Hub
   Regular Expressions path: exercises and their checker. Patterns are real JavaScript regular expressions; in the
   browser they run in regex-worker.js under a time limit, so a pattern that backtracks catastrophically cannot freeze
   the page. kind "match": each text must (or must not) match; kind "extract": the global matches must equal the list.
   Each model passes and each weak pattern fails (tests/unit/regex.test.mjs).
========================================================= */

/** { error?, results: [{ text, ok, got, want }], passed, total } */
export function runRegex(exercise, pattern, flags = "") {
    let re;
    try { re = new RegExp(pattern, flags.replace(/[^dgimsuy]/g, "")); } catch (error) { return { error: `Invalid pattern: ${error.message}`, results: [], passed: 0, total: exercise.tests.length }; }
    const results = exercise.tests.map((t) => {
        if (exercise.kind === "extract") {
            const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
            const got = [...t.text.matchAll(g)].map((m) => (exercise.group ? m[exercise.group] ?? "" : m[0]));
            return { text: t.text, ok: JSON.stringify(got) === JSON.stringify(t.want), got: JSON.stringify(got), want: JSON.stringify(t.want) };
        }
        re.lastIndex = 0;
        const got = re.test(t.text);
        return { text: t.text, ok: got === t.want, got: got ? "matches" : "no match", want: t.want ? "matches" : "no match" };
    });
    return { results, passed: results.filter((r) => r.ok).length, total: results.length };
}

export const REGEX = Object.freeze([
    { id: "rx-digits", kind: "match", task: "Match a ShopLite order number: SL- followed by exactly four digits, and nothing else.",
        tests: [{ text: "SL-1004", want: true }, { text: "SL-99", want: false }, { text: "SL-12345", want: false }, { text: "sl-1004", want: false }, { text: "Order SL-1004", want: false }],
        model: "^SL-\\d{4}$", flags: "", weak: ["SL-\\d+", "SL-\\d{4}"],
        explain: "^ and $ anchor the whole text; \\d{4} is exactly four digits. Without anchors, SL-\\d{4} also matches inside SL-12345 and 'Order SL-1004'." },
    { id: "rx-pincode", kind: "match", task: "Match an Indian PIN code: six digits, not starting with 0.",
        tests: [{ text: "411001", want: true }, { text: "110001", want: true }, { text: "011001", want: false }, { text: "41100", want: false }, { text: "4110012", want: false }, { text: "41 1001", want: false }],
        model: "^[1-9]\\d{5}$", flags: "", weak: ["^\\d{6}$"],
        explain: "A character class [1-9] restricts the first digit, then \\d{5} the rest." },
    { id: "rx-case", kind: "match", task: "Match the coupon code SAVE10 typed in any mix of upper and lower case, with nothing around it. Use a flag.",
        tests: [{ text: "SAVE10", want: true }, { text: "save10", want: true }, { text: "Save10", want: true }, { text: "SAVE100", want: false }, { text: " SAVE10", want: false }],
        model: "^save10$", flags: "i", weak: [{ pattern: "^SAVE10$", flags: "" }],
        explain: "The i flag makes letters case-insensitive. Anchors still reject extra characters, including spaces (trim input separately)." },
    { id: "rx-alternation", kind: "match", task: "Match an order status that is exactly delivered, shipped or pending.",
        tests: [{ text: "delivered", want: true }, { text: "shipped", want: true }, { text: "pending", want: true }, { text: "cancelled", want: false }, { text: "undelivered", want: false }, { text: "shipped!", want: false }],
        model: "^(delivered|shipped|pending)$", flags: "", weak: ["delivered|shipped|pending", "^delivered|shipped|pending$"],
        explain: "Group the alternatives: ^(a|b|c)$. Without the group, ^delivered|shipped|pending$ means '^delivered' or 'shipped' anywhere or 'pending$'." },
    { id: "rx-extract-prices", kind: "extract", task: "Extract every rupee amount (the digits after ₹, with optional thousands commas) from the text.",
        tests: [{ text: "Lamp ₹1,299, mug ₹349 and bottle ₹499.", want: ["1,299", "349", "499"] }, { text: "No prices here", want: [] }, { text: "Bundle ₹12,499 saves ₹1,000", want: ["12,499", "1,000"] }],
        model: "₹(\\d{1,3}(?:,\\d{3})*)", flags: "g", group: 1, weak: ["₹(\\d+)"],
        explain: "Capture group 1 holds the number; (?:,\\d{3})* repeats comma groups without capturing them separately." },
    { id: "rx-extract-emails", kind: "extract", task: "Extract the email addresses from a log line (a practical pattern, not a complete RFC 5322 validator).",
        tests: [{ text: "from asha@example.com to ravi.k@shop.example.in", want: ["asha@example.com", "ravi.k@shop.example.in"] }, { text: "contact: none", want: [] }],
        model: "[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+", flags: "g", weak: ["\\w+@\\w+\\.\\w+"],
        explain: "Allow dots and plus signs before @, and one or more dot-separated parts after it. Real email validation is best done by sending a confirmation email." },
    { id: "rx-greedy", kind: "extract", task: "Extract the text inside each pair of square brackets, such as the log levels in \"[INFO] started [WARN] slow\". Use a lazy quantifier.",
        tests: [{ text: "[INFO] started [WARN] slow", want: ["INFO", "WARN"] }, { text: "[ERROR] gateway [timeout]", want: ["ERROR", "timeout"] }],
        model: "\\[(.+?)\\]", flags: "g", group: 1, weak: ["\\[(.+)\\]"],
        explain: "Greedy .+ runs to the last ] in the line; lazy .+? stops at the first. A negated class [^\\]]+ is an even clearer alternative." },
    { id: "rx-lookahead", kind: "match", task: "Match a password of at least 8 characters that contains at least one digit and one capital letter (use lookaheads).",
        tests: [{ text: "Shoplite1", want: true }, { text: "shoplite1", want: false }, { text: "Shoplite", want: false }, { text: "Sh1", want: false }, { text: "A1bcdefg", want: true }],
        model: "^(?=.*\\d)(?=.*[A-Z]).{8,}$", flags: "", weak: ["^[A-Za-z\\d]{8,}$"],
        explain: "Each (?=...) checks a condition from the start without consuming characters; .{8,} then checks the length." },
    { id: "rx-dates", kind: "extract", task: "Extract the year, month and day as one match per ISO date (YYYY-MM-DD) in the text, using named groups is optional: return the whole date.",
        tests: [{ text: "Ordered 2026-11-08, delivered 2026-11-12.", want: ["2026-11-08", "2026-11-12"] }, { text: "Bad: 2026-13-40 and 26-11-08", want: [] }],
        model: "\\b\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])\\b", flags: "g", weak: ["\\d{4}-\\d{2}-\\d{2}"],
        explain: "Restrict month to 01–12 and day to 01–31 with alternations; \\b stops matches inside longer numbers. Regex cannot check that 31 February is invalid: parse dates for that." }
]);

export function validateRegexExercise(ex) {
    const problems = [];
    const m = runRegex(ex, ex.model, ex.flags);
    if (m.error || m.passed !== m.total) problems.push(`model fails: ${m.error ?? m.results.filter((r) => !r.ok).map((r) => r.text).join(", ")}`);
    /* a weak entry is a pattern (tried with the model's flags) or { pattern, flags } */
    for (const w of ex.weak) {
        const [pattern, flags] = typeof w === "string" ? [w, ex.flags] : [w.pattern, w.flags];
        const r = runRegex(ex, pattern, flags);
        if (!r.error && r.passed === r.total) problems.push(`weak pattern passes: ${pattern}`);
    }
    return problems;
}
