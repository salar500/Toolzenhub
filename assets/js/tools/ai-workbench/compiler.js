/* =========================================================
   ToolZen Hub
   AI Workbench: the Work Pack compiler (Tool Pack 58, section 8)

   compileWorkPack(blueprint, input) turns a task blueprint
   (blueprints/<family>.js) and the visitor's answers into a Work
   Pack: overview, preparation, the master prompt, the stages, the
   refinement prompts, the quality checklist and the next steps,
   plus the whole pack as Markdown. Pure and deterministic: no DOM,
   no clock, no network. The visitor's text is data; nothing is
   invented in its place: a missing essential is listed and written
   as a bracketed placeholder for the visitor to fill.

   Blueprint contract
     deliverable   noun phrase ("a test plan")
     depth         default depth: short | standard | detailed | multi
     style         "brief" (labelled sections, default) or
                   "descriptive" (one paragraph, for image, video
                   and audio generators)
     questions     [{ key, label, kind: text|textarea|select,
                      options?, essential?, hint?, placeholder?,
                      long?, showIf?(answers) }]
     brief(a, x)   { goal, context: [[label, value]], requirements,
                     format, avoid, text? (descriptive), keep? }
     stages        [{ name, objective, submit, ask, expect, done,
                      at: standard|detailed|multi }]  ask/submit may
                   be functions of (a, x)
     refine        ids of REFINEMENTS that apply, in order
     quality       [text | (a, x) => text|null]
     prepare       { required: [...], optional: [...] } (texts or
                   functions)
     next          [text | fn]
     conflicts(a)  [text]  (optional)
     noFabrication true for research and data work
   a = the answers (trimmed strings), x = the context
   { role, experience, depth, product, deliverable }.
========================================================= */

const DEPTH_ORDER = ["short", "standard", "detailed", "multi"];

export const PLACEHOLDER = (label) => `[add: ${label.toLowerCase()}]`;

/* shown when no AI Directory product fits the task (spec section 9) */
export const NOT_VERIFIED = "Tool suitability not verified. Choose your preferred AI tool.";

/* written into every research and data brief (spec section 8) */
export const NO_FABRICATION = "Invented sources, citations, quotations, data or results. If you do not know something, say so.";

/* Experience changes what is asked for and how the work is reviewed, not the tone (spec section 6). */
export const EXPERIENCE_RULES = Object.freeze({
    beginner: {
        label: "beginner",
        requirements: ["Explain each step in plain words and define any term I may not know the first time you use it."],
        quality: ["You can explain every part of the result in your own words; ask the AI to explain anything you cannot."]
    },
    intermediate: {
        label: "intermediate",
        requirements: ["Where there is a real choice to make, name the main trade-off in one line."],
        quality: []
    },
    experienced: {
        label: "experienced",
        requirements: ["Skip the basics. State the assumptions you make and the main trade-offs."],
        quality: ["The assumptions and trade-offs are stated and you agree with them."]
    },
    senior: {
        label: "senior",
        requirements: ["Skip the basics. For each significant choice, give the trade-offs, the risks and the alternative you rejected, and what should be checked before relying on it."],
        quality: ["Each significant choice has its trade-offs, risks and a rejected alternative.", "The risks are ones you would accept, or they are handled."]
    },
    specialist: {
        label: "specialist or architect",
        requirements: ["Skip the basics. Record each significant decision with its context, the options considered, the choice and its consequences, and flag where the usual approach does not fit this case and why."],
        quality: ["Each significant decision is recorded with options and consequences.", "Places where the usual approach does not fit are flagged and justified."]
    }
});

/* The follow-up prompts. Each blueprint picks the ones that fit its work; a refinement never asks for hidden reasoning. */
export const REFINEMENTS = Object.freeze({
    accuracy: {
        title: "Check accuracy",
        prompt: (x) => `Check every fact, figure, name and date in your last answer. List each one you are not certain of and why, correct what is wrong, and do not add any new claim without saying where it comes from. Then give the corrected ${x.deliverableShort} in full.`
    },
    completeness: {
        title: "Fill what is missing",
        prompt: (x) => `Go through my requirements above one by one and say, for each, whether your answer meets it fully, partly or not at all. Then give the ${x.deliverableShort} again with every gap filled.`
    },
    clarity: {
        title: "Make it clearer",
        prompt: (x) => `Rewrite the parts of the ${x.deliverableShort} that are hard to follow${x.audience ? ` for ${x.audience}` : ""}: shorter sentences, one idea per sentence, and each term defined the first time it is used. Keep the meaning and the structure.`
    },
    structure: {
        title: "Fix the structure",
        prompt: (x) => `Reorganise the ${x.deliverableShort} so the most important information comes first and each section does one job. Keep the content; tell me what you moved and why.`
    },
    style: {
        title: "Adjust the style",
        prompt: (x) => `Adjust the wording of the ${x.deliverableShort} to ${x.tone ? `a ${x.tone} tone` : "the tone I asked for"}. Change wording only: keep every fact, step and section.`
    },
    consistency: {
        title: "Make it consistent",
        prompt: (x) => `Check the ${x.deliverableShort} against itself: names, numbers, terms, formatting and style must be the same throughout. List each inconsistency with where it is, then fix it.`
    },
    technical: {
        title: "Check technical quality",
        prompt: (x) => `Review the ${x.deliverableShort} for technical correctness: edge cases, error handling, security, performance and anything that would fail in real use. List each issue with its location, why it matters and the fix. Do not rewrite parts that are correct.`
    },
    missing: {
        title: "Ask what you needed",
        prompt: () => "List the information you needed from me but did not have, and every assumption you made because of it. I will answer, and then you will revise the answer."
    },
    visual: {
        title: "Match the brief (visual)",
        prompt: () => "Compare the result with my brief point by point: subject, composition, framing, lighting, style, colours, text and anything that had to stay unchanged. List each difference, then write a corrected prompt that fixes only those."
    },
    continuity: {
        title: "Keep continuity",
        prompt: () => "Check continuity across the scenes: the same characters, clothing, props, colours, lighting and direction of movement from shot to shot. List each break and give the corrected scene descriptions."
    },
    audio: {
        title: "Match the sound",
        prompt: () => "Compare the result with my brief: voice or instruments, mood, pacing, pronunciation, length and format. List each difference and give corrected settings or text that fix only those."
    },
    evidence: {
        title: "Separate evidence from interpretation",
        prompt: () => "Go through your answer and mark each statement as one of: from a source I gave you (name it), from a source you can name and I can check, your own interpretation, or uncertain. Remove or flag anything that is none of these. Do not invent sources, citations, quotations or figures."
    }
});

const tidy = (value) => String(value ?? "").replace(/\r\n?/g, "\n").trim();

const valueOf = (item, a, x) => typeof item === "function" ? item(a, x) : item;

const present = (list, a, x) => (list ?? []).map((item) => valueOf(item, a, x)).filter((t) => typeof t === "string" ? t.trim() !== "" : Boolean(t));

const visible = (question, a) => !question.showIf || question.showIf(a);

/* requirements said twice (a blueprint line and an experience line, say) are written once; the first wording wins */
const normal = (t) => String(t).toLowerCase().replace(/\s+/g, " ").replace(/[.\s]+$/, "").trim();
function unique(items) {
    const seen = new Set();
    return items.filter((t) => {
        const k = normal(t);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
}

/* text in a fence that its own backticks cannot close */
function fence(text) {
    const longest = Math.max(2, ...(String(text).match(/`+/g) ?? []).map((m) => m.length));
    const bar = "`".repeat(longest + 1);
    return `${bar}text\n${text}\n${bar}`;
}

/* AI ecosystem programme 17 §5.4 rule 4: text that is still a placeholder is not an answer */
const PLACEHOLDER_TEXT = /\[add\b|\bTODO\b|\bTBD\b|\blorem\b|\bxxx\b/i;

/* the consistency sheet of image, video and audio work (17 §5.4 rule 7), in this order */
export const CONSISTENCY = Object.freeze([
    { key: "subject", label: "Subject or character" },
    { key: "look", label: "Look and style" },
    { key: "colours", label: "Colours" },
    { key: "lighting", label: "Lighting" },
    { key: "camera", label: "Camera and framing" },
    { key: "voice", label: "Voice and pronunciation" },
    { key: "never", label: "Never change" }
]);

export const CONTEXT_LIMIT = 8000;
export const LONG_PROMPT_WORDS = 600;

function consistencyLine(sheet) {
    const items = CONSISTENCY.map((c) => [c.label, tidy(sheet?.[c.key]).replace(/\s*\n\s*/g, "; ")]).filter(([, v]) => v);
    return items.length ? `Keep the same in every output: ${items.map(([l, v]) => `${l}: ${v}`).join("; ")}.` : "";
}

/* a downloaded pack pasted back as project context: its data comment is not context */
const withoutMeta = (text) => String(text ?? "").replace(/<!-- toolzenhub:[\s\S]*?-->/g, "");

export const wordsIn = (text) => (String(text).match(/\S+/g) ?? []).length;


/** The questions that apply to the current answers (a question may depend on another's answer). */
export function activeQuestions(blueprint, answers = {}) {

    const a = cleanAnswers(blueprint, answers);
    return blueprint.questions.filter((q) => visible(q, a));

}

/** Trimmed answers for the blueprint's own keys only; a select left at its first (empty) option is unanswered. */
export function cleanAnswers(blueprint, answers = {}) {

    const a = {};

    for (const q of blueprint.questions) {
        a[q.key] = tidy(answers[q.key]);
    }

    return a;

}

/** The depth used: the visitor's choice, or the blueprint's default moved by experience (senior work gets more control). */
export function resolveDepth(blueprint, depth, experience) {

    if (DEPTH_ORDER.includes(depth)) {
        return depth;
    }

    const base = blueprint.depth ?? "standard";

    if ((experience === "senior" || experience === "specialist") && base === "standard") {
        return "detailed";
    }

    if (experience === "beginner" && base === "multi") {
        return "standard";
    }

    return base;

}

function stagesFor(blueprint, depth) {

    const level = DEPTH_ORDER.indexOf(depth);

    if (level === 0) {
        return [];
    }

    return (blueprint.stages ?? []).filter((s) => DEPTH_ORDER.indexOf(s.at ?? "standard") <= level);

}

function bulletList(items) {

    return items.map((t) => `- ${t}`).join("\n");

}

function contextLines(pairs) {

    return pairs
        .filter(([, value]) => value)
        .map(([label, value]) => value.includes("\n") ? `- ${label}:\n${value.split("\n").map((l) => `  ${l}`).join("\n")}` : `- ${label}: ${value}`);

}


/* ---------- the master prompt ---------- */

function aboutMe(x) {

    if (!x.role && !x.experience) {
        return "";
    }

    const level = x.experience ? EXPERIENCE_RULES[x.experience]?.label : "";

    return x.role
        ? `I work as a ${x.role.charAt(0).toLowerCase()}${x.role.slice(1)}${level ? ` (${level} level)` : ""}.`
        : `My experience with this kind of work: ${level}.`;

}

function masterPrompt(blueprint, a, x, missing) {

    const b = blueprint.brief(a, x);
    const exp = x.experience ? EXPERIENCE_RULES[x.experience] : null;
    const me = aboutMe(x);

    if (blueprint.style === "descriptive") {

        const parts = [b.text];

        if (x.consistencyLine) {
            parts.push(x.consistencyLine);
        }

        if (b.keep?.length) {
            parts.push(`Keep unchanged: ${b.keep.join("; ")}.`);
        }

        if (b.avoid?.length) {
            parts.push(`Avoid: ${b.avoid.join("; ")}.`);
        }

        return parts.filter(Boolean).join("\n\n");

    }

    const blocks = [b.goal];

    if (x.context) blocks.push(`Project context (from my notes, use it; do not repeat it back):\n${fence(x.context)}`);

    const context = contextLines([...(me ? [["About me", me]] : []), ...(b.context ?? [])]);
    if (context.length) blocks.push(`Context:\n${context.join("\n")}`);

    const requirements = unique([...present(b.requirements, a, x), ...(exp?.requirements ?? [])]);
    if (requirements.length) blocks.push(`Requirements:\n${bulletList(requirements)}`);

    if (x.consistencyLine) blocks.push(x.consistencyLine);

    const format = present(b.format, a, x);
    if (format.length) blocks.push(`Format of your answer:\n${bulletList(format)}`);

    const avoid = [...present(b.avoid, a, x), ...(blueprint.noFabrication ? [NO_FABRICATION] : [])];
    if (avoid.length) blocks.push(`Avoid:\n${bulletList(avoid)}`);

    blocks.push(missing.length
        ? `Some details are still marked [add: ...]. Before you start, ask me for them; do not fill them in yourself.`
        : "If anything essential is missing or unclear, ask me before you start. If you must assume something, list each assumption at the top of your answer.");

    return blocks.filter(Boolean).join("\n\n");

}


/* ---------- the pack ---------- */

/**
 * input: { answers, role, experience, depth, product }  (product: { name, summary } or null)
 * returns the Work Pack object, with `markdown` the whole pack as text.
 */
export function compileWorkPack(blueprint, task, input = {}) {

    const raw = cleanAnswers(blueprint, input.answers);
    const questions = blueprint.questions.filter((q) => visible(q, raw));

    /* an unanswered essential becomes a placeholder, never a guess */
    const missing = questions.filter((q) => q.essential && !raw[q.key]).map((q) => q.label);
    const a = { ...raw };
    for (const q of questions) {
        if (q.essential && !a[q.key]) a[q.key] = PLACEHOLDER(q.label);
    }
    /* a hidden question's answer is not used */
    for (const q of blueprint.questions) {
        if (!questions.includes(q)) a[q.key] = "";
    }

    const answered = questions.some((q) => raw[q.key]);
    const depth = resolveDepth(blueprint, input.depth, input.experience);
    const x = {
        role: tidy(input.role),
        experience: EXPERIENCE_RULES[input.experience] ? input.experience : "",
        depth,
        product: input.product ?? null,
        noProductLine: input.noProductLine,
        deliverable: blueprint.deliverable,
        deliverableShort: blueprint.deliverable.replace(/^(a|an|the) /, ""),
        audience: raw.audience || "",
        tone: raw.tone || "",
        /* project context is for labelled briefs; a one-paragraph image, video or audio prompt gets the consistency sheet instead (16 D12) */
        context: blueprint.style === "descriptive" ? "" : tidy(withoutMeta(input.context)).slice(0, CONTEXT_LIMIT),
        consistencyLine: consistencyLine(input.consistency)
    };

    const placeholders = questions
        .filter((q) => raw[q.key] && PLACEHOLDER_TEXT.test(raw[q.key]))
        .map((q) => `${q.label} still contains placeholder text: replace it or leave the field empty.`);
    const conflicts = [...(blueprint.conflicts ? blueprint.conflicts(raw).filter(Boolean) : []), ...placeholders];
    const prompt = masterPrompt(blueprint, a, x, missing);

    const plan = stagesFor(blueprint, depth);
    const withReview = depth === "detailed" || depth === "multi";
    const stageList = [...plan, ...(withReview ? [FINAL_REVIEW] : [])];

    const stages = stageList.map((s, i) => ({
        n: i + 1,
        name: s.name,
        objective: valueOf(s.objective, a, x),
        submit: valueOf(s.submit, a, x),
        prompt: `Stage ${i + 1} of ${stageList.length}: ${s.name}. (Part of the work on ${blueprint.deliverable}.)\n\n${valueOf(s.ask, a, x)}${x.consistencyLine ? `\n\n${x.consistencyLine}` : ""}`,
        expect: valueOf(s.expect, a, x),
        done: valueOf(s.done, a, x),
        next: i + 1 < stageList.length ? `Go to stage ${i + 2}: ${stageList[i + 1].name}.` : "Use the refinement prompts for anything that still falls short, then the quality checklist."
    }));

    const refineIds = depth === "short" ? (blueprint.refine ?? []).slice(0, 2) : (blueprint.refine ?? []);
    const refinements = refineIds.filter((id) => REFINEMENTS[id]).map((id) => ({ id, title: REFINEMENTS[id].title, prompt: REFINEMENTS[id].prompt(x) }));

    const quality = [
        "Every requirement in the master prompt is met, or you know which one is not and why.",
        ...present(blueprint.quality, a, x),
        ...(blueprint.noFabrication ? ["Every source, citation and figure exists and says what the answer claims; open each one."] : []),
        ...(x.experience ? EXPERIENCE_RULES[x.experience].quality : [])
    ];

    const prepare = blueprint.prepare ?? {};
    const preparation = {
        required: present(prepare.required, a, x),
        optional: present(prepare.optional, a, x),
        missing
    };

    const b = blueprint.brief(a, x);
    const overview = {
        task: task.title,
        objective: blueprint.style === "descriptive" ? task.title : b.goal,
        deliverable: blueprint.deliverable,
        success: quality.slice(0, 3),
        constraints: present(b.avoid, a, x),
        depth
    };

    const pack = {
        taskId: task.id,
        state: !answered ? "empty" : missing.length ? "incomplete" : "ready",
        depth,
        overview,
        product: {
            chosen: input.product ?? null,
            alternatives: (input.alternatives ?? []).filter((name) => name !== input.product?.name)
        },
        preparation,
        missing,
        conflicts,
        masterPrompt: prompt,
        stages,
        refinements,
        quality,
        nextSteps: present(blueprint.next, a, x),
        promptWords: wordsIn(prompt),
        notes: wordsIn(prompt) > LONG_PROMPT_WORDS ? ["A long prompt is followed less reliably. Consider Standard depth or a shorter project context."] : []
    };

    pack.markdown = toMarkdown(pack, x);

    return pack;

}

/* the last stage of a detailed or multi-stage pack: one review against the brief before the work is used */
const FINAL_REVIEW = Object.freeze({
    name: "Final review",
    objective: "Check the finished work against the brief before you use it.",
    submit: "Nothing new: ask in the same conversation.",
    ask: (a, x) => `Review the finished ${x.deliverableShort} against my original brief, requirement by requirement. Give a table with three columns: requirement, met (yes, partly or no) and what is missing. Then list anything you are unsure of. Do not rewrite the work yet.`,
    expect: "A requirement-by-requirement table and a list of uncertainties.",
    done: "Every row says yes, or you have decided how to handle each gap."
});


/* ---------- the pack as Markdown (Copy all, Download) ---------- */

function toMarkdown(pack, x) {

    const lines = [`# AI Work Pack: ${pack.overview.task}`, ""];

    lines.push("## Overview", "", `- Objective: ${pack.overview.objective}`, `- Deliverable: ${pack.overview.deliverable}`, `- Depth: ${pack.depth}`, "");

    const chosen = pack.product.chosen;
    lines.push("## AI product", "");
    if (chosen?.name) {
        lines.push(`- ${chosen.name}${chosen.own ? " (your choice)" : ""}`);
        if (chosen.summary) lines.push(`- What its official site said${chosen.checked ? ` on ${chosen.checked}` : ""}: ${chosen.summary}`);
        if (chosen.reason) lines.push(`- Why it is listed here: ${chosen.reason}`);
    } else {
        lines.push(`- ${x.noProductLine ?? "No product chosen yet."}`);
    }
    if (pack.product.alternatives.length) lines.push(`- Other products listed for this task (not a ranking): ${pack.product.alternatives.join(", ")}`);
    lines.push("");

    if (pack.conflicts.length) lines.push("## Check these first", "", bulletList(pack.conflicts), "");

    lines.push("## Prepare", "");
    if (pack.preparation.required.length) lines.push("Needed:", bulletList(pack.preparation.required), "");
    if (pack.preparation.optional.length) lines.push("Helpful:", bulletList(pack.preparation.optional), "");
    if (pack.missing.length) lines.push("Still missing from your answers:", bulletList(pack.missing), "");

    lines.push("## Master prompt", "", "```text", pack.masterPrompt, "```", "");

    if (pack.stages.length) {
        lines.push("## Stages", "");
        for (const s of pack.stages) {
            lines.push(`### ${s.n}. ${s.name}`, "", `- Objective: ${s.objective}`, `- Submit: ${s.submit}`, `- Expect: ${s.expect}`, `- Done when: ${s.done}`, `- Next: ${s.next}`, "", "```text", s.prompt, "```", "");
        }
    }

    if (pack.refinements.length) {
        lines.push("## Refinement prompts", "");
        for (const r of pack.refinements) lines.push(`### ${r.title}`, "", "```text", r.prompt, "```", "");
    }

    lines.push("## Quality checklist", "", pack.quality.map((q) => `- [ ] ${q}`).join("\n"), "");

    if (pack.nextSteps.length) lines.push("## Next steps", "", bulletList(pack.nextSteps), "");

    lines.push("Prepared with the ToolZen Hub AI Workbench in the browser; no AI service was called.");

    return lines.join("\n");

}
