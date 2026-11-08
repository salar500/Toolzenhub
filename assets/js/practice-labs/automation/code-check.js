/* =========================================================
   ToolZen Hub
   Automation: static checks of test code (pure, no DOM)

   Reads a learner's Playwright test code and checks it against explicit rules. It does not run the code: the page says
   "checked by reading your code, not by running it". Rules:
     awaitActions   every Playwright action or web-first assertion line starts with await
     noSleep        no page.waitForTimeout(...) or setTimeout-style fixed waits
     userFacing     at least one getByRole / getByLabel / getByText / getByPlaceholder, and no XPath
     must           the code matches `pattern` (a regular expression source), e.g. a required call
     mustNot        the code does not match `pattern`
========================================================= */

const ACTION = /\.(goto|click|dblclick|fill|press|check|uncheck|selectOption|setInputFiles|hover|waitForResponse|waitForURL)\(|\bexpect\([^)]*\)\.(not\.)?to[A-Z]\w*\(/;

const code = (text) => String(text ?? "").replace(/\/\/.*$/gm, "");

const TESTS = {
    awaitActions: (_, text) => {
        const lines = code(text).split(/\r?\n/).map((l) => l.trim()).filter((l) => ACTION.test(l));
        return lines.length > 0 && lines.every((l) => /^(await |const \w+ = await |return await )/.test(l) || /^\.\w+\(/.test(l));
    },
    noSleep: (_, text) => !/waitForTimeout\s*\(|new Promise\s*\(\s*\w*\s*=>\s*setTimeout/.test(code(text)),
    userFacing: (_, text) => /getBy(Role|Label|Text|Placeholder)\(/.test(code(text)) && !/xpath=|\/\/\w+\[/.test(code(text)),
    must: (rule, text) => new RegExp(rule.pattern).test(code(text)),
    mustNot: (rule, text) => !new RegExp(rule.pattern).test(code(text))
};

/** { items: [{ id, label, met, advice }], met, total } */
export function checkCode(exercise, text) {
    const items = exercise.rules.map((rule) => {
        if (!TESTS[rule.type]) throw new Error(`unknown rule ${rule.type}`);
        return { id: rule.id, label: rule.label, met: TESTS[rule.type](rule, text), advice: rule.advice };
    });
    return { items, met: items.filter((i) => i.met).length, total: items.length };
}

export function validateCodeExercise(exercise) {
    const problems = [];
    if (!exercise.id || !exercise.task || !exercise.rules?.length || !exercise.model) problems.push(`${exercise.id}: incomplete`);
    const model = checkCode(exercise, exercise.model);
    if (model.met !== model.total) problems.push(`${exercise.id}: model misses ${model.items.filter((i) => !i.met).map((i) => i.id).join(",")}`);
    for (const weak of exercise.weak ?? []) {
        const missing = checkCode(exercise, weak.code).items.filter((i) => !i.met).map((i) => i.id).sort();
        if (JSON.stringify(missing) !== JSON.stringify([...weak.missing].sort())) problems.push(`${exercise.id}: weak "${weak.name}" misses ${missing} instead of ${weak.missing}`);
    }
    return problems;
}
