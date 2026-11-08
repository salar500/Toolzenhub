/* =========================================================
   ToolZen Hub
   JavaScript exercises: run the learner's code against an exercise's test cases. Pure apart from executing the code;
   in the browser it runs only inside js-worker.js (a Web Worker with network access removed and a time limit); the unit
   test runs it in Node to pin each exercise's model and buggy versions.
========================================================= */

const MAX_LOG = 50;

const show = (value) => {
    if (value === undefined) return "undefined";
    if (typeof value === "string") return JSON.stringify(value);
    try { return JSON.stringify(value) ?? String(value); } catch { return String(value); }
};
const same = (a, b) => show(a) === show(b);

/** { error?, results: [{ call, ok, got, want }], passed, total, logs } */
export function runTests(code, exercise) {
    const logs = [];
    const fakeConsole = { log: (...parts) => { if (logs.length < MAX_LOG) logs.push(parts.map((p) => (typeof p === "string" ? p : show(p))).join(" ")); } };
    fakeConsole.info = fakeConsole.warn = fakeConsole.error = fakeConsole.log;
    if (/\bimport\s*[(\s{*]/.test(code)) return { error: "import is not available in these exercises: write the code in the editor.", results: [], passed: 0, total: exercise.tests.length, logs };
    let fn;
    try {
        fn = new Function("console", `"use strict";\n${code}\nreturn typeof ${exercise.fn} === "function" ? ${exercise.fn} : undefined;`)(fakeConsole);
    } catch (error) {
        return { error: `${error.name}: ${error.message}`, results: [], passed: 0, total: exercise.tests.length, logs };
    }
    if (!fn) return { error: `No function named ${exercise.fn} was found. Keep the name from the starter code.`, results: [], passed: 0, total: exercise.tests.length, logs };
    const results = exercise.tests.map((t) => {
        const call = `${exercise.fn}(${t.args.map(show).join(", ")})`;
        const args = structuredClone(t.args);
        try {
            const got = fn(...args);
            if ("throws" in t) return { call, ok: false, got: show(got), want: `an error "${t.throws}"` };
            return { call, ok: same(got, t.expect), got: show(got), want: show(t.expect) };
        } catch (error) {
            if ("throws" in t) return { call, ok: error?.message === t.throws, got: `error "${error?.message}"`, want: `an error "${t.throws}"` };
            return { call, ok: false, got: `error: ${error?.name}: ${error?.message}`, want: show(t.expect) };
        }
    });
    return { results, passed: results.filter((r) => r.ok).length, total: results.length, logs };
}

/** problems with an exercise definition: the model must pass every test and each buggy version must fail at least one */
export function validateJsExercise(exercise) {
    const problems = [];
    const model = runTests(exercise.model, exercise);
    if (model.error || model.passed !== model.total) problems.push(`model fails: ${model.error ?? model.results.filter((r) => !r.ok).map((r) => r.call).join(", ")}`);
    for (const bug of exercise.buggy ?? []) {
        const r = runTests(bug, exercise);
        if (!r.error && r.passed === r.total) problems.push(`buggy version passes: ${bug.slice(0, 60)}`);
    }
    const starter = runTests(exercise.starter, exercise);
    if (!starter.error && starter.passed === starter.total) problems.push("starter already passes");
    return problems;
}
