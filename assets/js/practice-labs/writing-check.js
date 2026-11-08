/* =========================================================
   ToolZen Hub
   Structured writing labs: the checker (pure, no DOM)

   Test cases, bug reports, requirement questions and test plans are written in fields. A deterministic rubric checks the
   things a reviewer looks for first: required fields are filled, steps are separate single actions, expected results are
   observable rather than vague, test data is concrete, the choice fields fit the scenario and the facts of the scenario
   are covered. It checks structure and coverage, not judgement, and the page says so; a model answer is shown after an
   attempt. Each rule returns met or missing with advice.

   rule = { id, label, advice, type, field?, fields?, min?, words?, groups?, allowed? }
     required      field is not empty
     minLines      field has at least `min` non-empty lines
     oneAction     no line of `field` chains actions ("and then", "then", ";", or more than one " and " joining verbs)
     noVague       none of VAGUE (or `words`) appears in `fields`
     concrete      field contains a number, a quoted value, an email address or an amount
     covers        every group in `groups` has a word in `fields` (synonyms per group)
     choice        field's value is one of `allowed`
========================================================= */

export const VAGUE = Object.freeze(["works", "working", "work fine", "properly", "correctly", "fine", "ok", "okay", "as expected", "normal", "normally", "should be good", "no issues", "etc"]);

const text = (answer, field) => String(answer?.[field] ?? "").trim();
const lines = (value) => value.split(/\r?\n/).map((l) => l.replace(/^\s*(\d+[.)]|[-*•])\s*/, "").trim()).filter(Boolean);
const words = (value) => ` ${value.toLowerCase().replace(/[^\p{L}\p{N}@.₹'"%-]+/gu, " ")} `;
const has = (value, word) => words(value).includes(` ${word.toLowerCase()} `) || (word.includes(" ") && value.toLowerCase().includes(word.toLowerCase()));

const TESTS = {
    required: (rule, answer) => text(answer, rule.field).length > 0,
    minLines: (rule, answer) => lines(text(answer, rule.field)).length >= (rule.min ?? 1),
    oneAction: (rule, answer) => {
        const all = lines(text(answer, rule.field));
        return all.length > 0 && all.every((line) => !/\band then\b|\bthen\b|;/i.test(line) && (line.toLowerCase().match(/\band\b/g) ?? []).length <= 1);
    },
    noVague: (rule, answer) => {
        const value = (rule.fields ?? [rule.field]).map((f) => text(answer, f)).join(" ");
        return value.length > 0 && !(rule.words ?? VAGUE).some((w) => has(value, w));
    },
    concrete: (rule, answer) => /\d|["'][^"']+["']|\S+@\S+|₹/.test(text(answer, rule.field)),
    covers: (rule, answer) => {
        const value = (rule.fields ?? [rule.field]).map((f) => text(answer, f)).join(" ").toLowerCase();
        return rule.groups.every((group) => group.some((w) => value.includes(w.toLowerCase())));
    },
    choice: (rule, answer) => rule.allowed.includes(text(answer, rule.field))
};

/** { items: [{ id, label, met, advice }], met, total } */
export function checkWriting(exercise, answer) {
    const items = exercise.rules.map((rule) => {
        const test = TESTS[rule.type];
        if (!test) throw new Error(`unknown rule type ${rule.type}`);
        return { id: rule.id, label: rule.label, met: test(rule, answer), advice: rule.advice };
    });
    return { items, met: items.filter((i) => i.met).length, total: items.length };
}

/** problems with an exercise definition (used by the unit test) */
export function validateWritingExercise(exercise) {
    const problems = [];
    const names = new Set((exercise.fields ?? []).map((f) => f.name));
    if (!exercise.id || !exercise.task || !exercise.fields?.length || !exercise.rules?.length || !exercise.model) problems.push(`${exercise.id}: incomplete`);
    for (const rule of exercise.rules ?? []) {
        if (!TESTS[rule.type]) problems.push(`${exercise.id}/${rule.id}: unknown type`);
        for (const f of [rule.field, ...(rule.fields ?? [])].filter(Boolean)) if (!names.has(f)) problems.push(`${exercise.id}/${rule.id}: unknown field ${f}`);
        if (!rule.label || !rule.advice) problems.push(`${exercise.id}/${rule.id}: label and advice needed`);
    }
    const model = checkWriting(exercise, exercise.model);
    if (model.met !== model.total) problems.push(`${exercise.id}: the model answer does not meet its own rubric (${model.items.filter((i) => !i.met).map((i) => i.id).join(", ")})`);
    for (const weak of exercise.weak ?? []) {
        const r = checkWriting(exercise, weak.answer);
        const missing = r.items.filter((i) => !i.met).map((i) => i.id).sort();
        if (JSON.stringify(missing) !== JSON.stringify([...weak.missing].sort())) problems.push(`${exercise.id}: weak answer "${weak.name}" misses ${missing.join(",")} instead of ${weak.missing.join(",")}`);
    }
    return problems;
}
