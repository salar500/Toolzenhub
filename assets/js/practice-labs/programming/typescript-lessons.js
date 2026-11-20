/* =========================================================
   ToolZen Hub
   TypeScript path: lessons (original to this site; behaviour as in the TypeScript handbook). TypeScript is not compiled
   in the page: exercises ask the learner to predict the compiler's verdict or the program's output, and every answer
   was produced by the real compiler (tsc --strict).
========================================================= */

export const lessons = [
    { id: "ts-why", title: "Why TypeScript: types, inference and the compiler", level: "beginner", prerequisite: "The JavaScript Programming path up to functions and objects.",
        objectives: ["Explain what TypeScript adds to JavaScript", "Annotate variables and functions", "Rely on inference"],
        intro: "TypeScript is JavaScript with static types. The compiler (tsc) checks the types and then removes them, producing plain JavaScript, so types cost nothing at run time. You annotate where intent matters, such as function parameters, and let TypeScript infer the rest. Most mistakes it catches would otherwise appear only when a user hits them.",
        blocks: [
            { type: "example", title: "Annotations and inference", text: "let shop = \"ShopLite\";              // inferred: string\nfunction lineTotal(price: number, qty: number): number {\n  return price * qty;\n}\nlineTotal(499, \"2\");                 // error: string is not assignable to number" },
            { type: "predict", heading: "Your turn: inference", exercise: "ts-p-inference" },
            { type: "predict", heading: "Your turn: a typed function", exercise: "ts-p-function" }
        ],
        why: "Most large JavaScript codebases, frameworks and Playwright suites now use TypeScript; types catch bugs and make code easier to change.",
        analogy: "Types are labels on wires: the compiler stops you plugging the speaker cable into the power socket.",
        mistakes: ["Annotating everything, including obvious values.", "Thinking types exist at run time.", "Ignoring compiler errors with any."],
        check: [{ q: "What happens to types when TypeScript is compiled?", a: "They are removed; the output is plain JavaScript." }, { q: "What is type inference?", a: "TypeScript working out a type from the value or usage." }],
        summary: "TypeScript adds compile-time types to JavaScript; annotate parameters and intent, and let inference do the rest." },
    { id: "ts-objects", title: "Objects, interfaces and optional properties", level: "beginner",
        objectives: ["Describe object shapes with interfaces and type aliases", "Use optional and readonly properties", "Handle possibly missing values"],
        intro: "An interface (or a type alias) describes the shape of an object: required properties, optional ones marked with ?, and readonly ones that cannot be reassigned. With strict mode, an optional property's type includes undefined, so the compiler makes you handle the missing case.",
        blocks: [
            { type: "predict", heading: "Your turn: a missing property", exercise: "ts-p-interface" },
            { type: "predict", heading: "Your turn: an optional property", exercise: "ts-p-optional" },
            { type: "predict", heading: "Your turn: readonly", exercise: "ts-p-readonly" }
        ],
        why: "API responses, page objects and configuration are all objects; describing them precisely is most of everyday TypeScript.",
        analogy: "An interface is a form template: which boxes must be filled, which may be left blank and which are printed in ink.",
        mistakes: ["Optional properties used without a check.", "Huge interfaces nobody keeps current.", "Mutating values that should be readonly."],
        check: [{ q: "What does ? mean on a property?", a: "It is optional, so its type includes undefined." }, { q: "Interface or type alias?", a: "Both describe object shapes; interfaces can be extended and merged, aliases can also name unions." }],
        summary: "Describe objects with interfaces, mark optional and readonly properties, and handle undefined under strict mode." },
    { id: "ts-unions", title: "Union types and narrowing", level: "intermediate",
        objectives: ["Write union and literal types", "Narrow with typeof, in and equality checks", "Make switches exhaustive with never"],
        intro: "A union type allows several types: number | string. Literal unions allow specific values: \"pending\" | \"shipped\". Narrowing is how TypeScript works out which member applies after a check such as typeof or a comparison. Assigning the leftover value to never in a default branch makes the compiler list every unhandled case.",
        blocks: [
            { type: "predict", heading: "Your turn: narrowing", exercise: "ts-p-narrowing" },
            { type: "predict", heading: "Your turn: a literal union", exercise: "ts-p-union-literal" },
            { type: "predict", heading: "Your turn: exhaustive checks", exercise: "ts-p-exhaustive" }
        ],
        why: "Statuses, API results and events are naturally unions; narrowing makes handling every case checkable.",
        analogy: "A union is a parcel that may hold a book or a mug; narrowing is opening it before deciding how to use it.",
        mistakes: ["Strings where a literal union would catch typos.", "Switches without an exhaustive default.", "Casting with as instead of narrowing."],
        check: [{ q: "What is narrowing?", a: "TypeScript refining a union to a specific member after a check." }, { q: "Why assign to never in a default branch?", a: "So adding a new union member causes a compile error until it is handled." }],
        summary: "Model alternatives with unions and literal types, narrow them with checks and enforce exhaustive handling with never." },
    { id: "ts-generics", title: "Generics and utility types", level: "intermediate",
        objectives: ["Write generic functions", "Use built-in utility types", "Prefer unknown over any"],
        intro: "Generics let one function or type work with many types while keeping them connected: first<T>(items: T[]): T returns the same type it receives. Utility types derive new types: Partial<T> makes properties optional, Pick<T, K> selects some, Readonly<T> freezes them and Record<K, V> builds maps. unknown is the safe top type: it must be narrowed before use, whereas any switches checking off.",
        blocks: [
            { type: "predict", heading: "Your turn: a generic function", exercise: "ts-p-generic" },
            { type: "predict", heading: "Your turn: unknown", exercise: "ts-p-unknown" },
            { type: "example", title: "Utility types", text: "interface Product { id: number; name: string; price: number }\ntype ProductUpdate = Partial<Omit<Product, \"id\">>;   // { name?: string; price?: number }\ntype PriceList = Record<string, number>;               // { [code: string]: number }" }
        ],
        why: "Libraries, API clients and test fixtures rely on generics; utility types avoid duplicating shapes.",
        analogy: "A generic is a container with a label slot: whatever you put in, the label says what comes out.",
        mistakes: ["any for data from JSON.parse or APIs.", "Generics that add complexity without connecting types.", "Copy-pasted near-identical interfaces."],
        check: [{ q: "unknown versus any?", a: "unknown must be narrowed before use; any disables checking." }, { q: "What does Partial<T> do?", a: "Makes every property of T optional." }],
        summary: "Use generics to keep input and output types connected, derive types with utilities and treat outside data as unknown." },
    { id: "ts-tooling", title: "Configuration, strictness and TypeScript in practice", level: "advanced",
        objectives: ["Read a tsconfig.json", "Explain strict mode options", "Validate data at runtime boundaries"],
        intro: "tsconfig.json configures the compiler: target and module output, which files to include and strictness. strict turns on strictNullChecks, noImplicitAny and related checks, and is the right default for new code. Types vanish at run time, so data arriving from APIs, files or users must still be validated, for example with a schema library, at the boundary.",
        blocks: [
            { type: "example", title: "A typical tsconfig.json", text: "{\n  \"compilerOptions\": {\n    \"target\": \"ES2022\",\n    \"module\": \"NodeNext\",\n    \"strict\": true,\n    \"noUncheckedIndexedAccess\": true,\n    \"outDir\": \"dist\"\n  },\n  \"include\": [\"src\"]\n}" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "An API returns { total: \"1848\" } but the interface says total: number. What happens at run time?", options: ["Nothing stops it: types are erased; validate the response", "TypeScript throws an error"], answer: 0, explain: "Types are compile-time only; validate data at the boundary." },
                { q: "What does strictNullChecks change?", options: ["null and undefined must be handled explicitly", "Nothing"], answer: 0, explain: "It is part of strict mode." },
                { q: "Migrating a JavaScript project gradually, a sensible first step?", options: ["Enable allowJs and checkJs, then convert files one at a time", "Rewrite everything at once"], answer: 0, explain: "Incremental migration keeps the project working." }
            ] }
        ],
        why: "Configuration decides how much protection TypeScript gives; boundary validation covers what types cannot.",
        analogy: "Types guard the inside of the building; validation is the security desk at the door.",
        mistakes: ["strict off in new projects.", "Trusting API types without validation.", "Silencing errors with // @ts-ignore."],
        check: [{ q: "What does strict mode enable?", a: "A set of checks including strictNullChecks and noImplicitAny." }, { q: "Why validate API data in TypeScript code?", a: "Types are erased, so wrong data is only caught by runtime checks." }],
        summary: "Configure tsc with strict mode, keep checks on and validate outside data at run time." }
];

export const interview = {
    howTo: "Answer each question before opening the explanation.",
    description: "8 TypeScript interview questions with explained answers: inference, interfaces, unions, narrowing, generics, unknown, strict mode and runtime validation.",
    coding: [],
    quiz: [
        { q: "Do TypeScript types exist at run time?", options: ["No, they are erased", "Yes"], answer: 0, explain: "Validate data at boundaries." },
        { q: "interface versus type?", options: ["Both describe shapes; interfaces merge and extend, aliases also name unions", "Identical in every way"], answer: 0, explain: "Pick one convention per codebase." },
        { q: "unknown versus any?", options: ["unknown must be narrowed; any disables checks", "The same"], answer: 0, explain: "Prefer unknown." },
        { q: "What is narrowing?", options: ["Refining a union after a check", "Shortening names"], answer: 0, explain: "typeof, in, equality." },
        { q: "What is never for?", options: ["Values that cannot exist; exhaustive checks", "Errors only"], answer: 0, explain: "Unhandled cases fail to compile." },
        { q: "What do generics do?", options: ["Connect input and output types across many types", "Make code slower"], answer: 0, explain: "first<T>(xs: T[]): T." },
        { q: "What does Partial<T> do?", options: ["Makes all properties optional", "Removes properties"], answer: 0, explain: "Utility types." },
        { q: "Why strict mode?", options: ["Catches null and implicit any mistakes", "Faster builds"], answer: 0, explain: "Default for new code." }
    ]
};
