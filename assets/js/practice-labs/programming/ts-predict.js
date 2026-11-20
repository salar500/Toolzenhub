/* =========================================================
   ToolZen Hub
   TypeScript path: prediction exercises for the predict block. TypeScript is not compiled in the page; every expected
   answer was produced by the real compiler (tsc --strict, TypeScript 4.9) and, for output tasks, by running the result
   with Node.js (pinned by tests/unit/predict.test.mjs). check "compile": answer "compiles" or "line N" (the first error).
========================================================= */

const COMPILE = "Does this compile with strict mode on? Type compiles, or the line number of the first error, such as: line 3";

export const TS_PREDICT = Object.freeze([
    { id: "ts-p-inference", lang: "typescript", check: "compile", prompt: COMPILE,
        code: "let total = 499;\ntotal = total + 49;\ntotal = \"free\";",
        output: "line 3", hint: "TypeScript infers the type from the first value.",
        explain: "total is inferred as number from 499, so assigning a string is an error (TS2322). Inference means you rarely need to write simple types." },
    { id: "ts-p-function", lang: "typescript", check: "compile", prompt: COMPILE,
        code: "function deliveryFee(total: number): number {\n  return total > 999 ? 0 : 49;\n}\nconst fee = deliveryFee(\"1000\");",
        output: "line 4", hint: "Look at the argument's type.",
        explain: "The parameter is number but \"1000\" is a string. In JavaScript this would silently compare a string; TypeScript stops it at compile time." },
    { id: "ts-p-interface", lang: "typescript", check: "compile", prompt: COMPILE,
        code: "interface Product {\n  id: number;\n  name: string;\n  price: number;\n}\nconst lamp: Product = { id: 1, name: \"LED Desk Lamp\" };",
        output: "line 6", hint: "Compare the object with every required property.",
        explain: "price is required by the interface and missing from the object. Mark optional properties with ?, as in price?: number." },
    { id: "ts-p-optional", lang: "typescript", check: "compile", prompt: COMPILE,
        code: "interface Customer {\n  name: string;\n  phone?: string;\n}\nfunction call(c: Customer): string {\n  return c.phone.trim();\n}",
        output: "line 6", hint: "An optional property may be undefined.",
        explain: "With strict null checks, c.phone is string | undefined, so calling trim needs a check first, for example c.phone?.trim() ?? \"no phone\"." },
    { id: "ts-p-narrowing", lang: "typescript", check: "compile", prompt: COMPILE,
        code: "function label(qty: number | string): string {\n  if (typeof qty === \"number\") {\n    return qty.toFixed(0);\n  }\n  return qty.toUpperCase();\n}",
        output: "compiles", hint: "typeof checks narrow a union.",
        explain: "Inside the if, qty is number; after it, TypeScript knows only string is left. This is narrowing." },
    { id: "ts-p-union-literal", lang: "typescript", check: "compile", prompt: COMPILE,
        code: "type Status = \"pending\" | \"shipped\" | \"delivered\";\nlet s: Status = \"pending\";\ns = \"shipped\";\ns = \"lost\";",
        output: "line 4", hint: "A literal union allows only the listed strings.",
        explain: "\"lost\" is not one of the allowed values. Literal unions catch typos in statuses and other codes." },
    { id: "ts-p-exhaustive", lang: "typescript", check: "compile", prompt: COMPILE,
        code: "type Status = \"pending\" | \"shipped\" | \"delivered\";\nfunction icon(s: Status): string {\n  switch (s) {\n    case \"pending\": return \"clock\";\n    case \"shipped\": return \"truck\";\n    default: {\n      const unreachable: never = s;\n      return unreachable;\n    }\n  }\n}",
        output: "line 7", hint: "Which status is not handled before the default?",
        explain: "\"delivered\" reaches the default, so s is not never there. Assigning to never makes TypeScript report every unhandled case when a new status is added." },
    { id: "ts-p-generic", lang: "typescript", check: "output", prompt: "What does this program print after compiling and running it?",
        code: "function first<T>(items: T[], fallback: T): T {\n  return items.length > 0 ? items[0] : fallback;\n}\nconsole.log(first([\"Lamp\", \"Mug\"], \"none\"));\nconsole.log(first<number>([], 0));",
        output: "Lamp\n0", hint: "The second call passes an empty array.",
        explain: "The generic T is inferred as string in the first call and given as number in the second. Types are erased when compiling; the output is plain JavaScript behaviour." },
    { id: "ts-p-unknown", lang: "typescript", check: "compile", prompt: COMPILE,
        code: "const data: unknown = JSON.parse('{\"qty\": 2}');\nconsole.log(data.qty);",
        output: "line 2", hint: "unknown must be narrowed before use; any would not complain.",
        explain: "unknown forces a check (for example with a type guard or a schema validator) before reading properties. any would compile and hide the risk." },
    { id: "ts-p-readonly", lang: "typescript", check: "compile", prompt: COMPILE,
        code: "interface Order {\n  readonly id: string;\n  total: number;\n}\nconst o: Order = { id: \"SL-1004\", total: 1848 };\no.total = 1900;\no.id = \"SL-9999\";",
        output: "line 7", hint: "One property is marked readonly.",
        explain: "Changing total is allowed; id is readonly, so reassigning it is a compile error. readonly documents and enforces intent." }
]);
