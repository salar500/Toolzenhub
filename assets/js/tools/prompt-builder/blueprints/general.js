/* =========================================================
   ToolZen Hub
   AI Prompt Builder blueprints: any other task (D22)

   One well-built prompt for a task none of the other tasks
   covers: the former standalone AI Prompt Builder, as a task of
   the central product. The visitor names the result, the reader,
   the rules and how the result is judged; a kind of task adds the
   rules and checks that usually matter for it, only where the
   visitor wrote none. Nothing about the subject is assumed.
========================================================= */

import { text, area, choose, more, TONES } from "./shared.js";

const CATS = [{ id: "assistants" }];

/* the rules and checks a kind of task usually needs (the old Prompt Builder's suggestions), used only when the visitor gave none */
const KINDS = {
    "Write or draft a text": {
        rules: ["Write for the reader named above, in their words.", "No filler phrases and no padding.", "One idea per paragraph."],
        success: ["A reader gets the point in the first two sentences.", "Nothing in it would make the reader ask \"what do you mean?\".", "It is the length the situation needs and no longer."]
    },
    "Summarise or explain something": {
        rules: ["Keep every number and name exactly as in the source.", "Say what is uncertain or missing in the source.", "No new claims that are not in the source."],
        success: ["Someone who has not read the source could act on the summary.", "Every figure can be traced back to the source.", "The main point comes first."]
    },
    "Analyse data or a document": {
        rules: ["State the method before the findings.", "Show the figures behind each finding.", "Separate what the data shows from what you infer."],
        success: ["Each finding names the numbers it rests on.", "Assumptions and gaps in the data are listed.", "It ends with the two or three findings that matter most."]
    },
    "Write or fix code": {
        rules: ["Use only the language, framework and versions I name.", "Do not add dependencies.", "Explain any change outside the file I asked about."],
        success: ["It runs as written, with the command to run it shown.", "Edge cases are handled or named as unhandled.", "Nothing unrelated was changed."]
    },
    "Plan or decide something": {
        rules: ["Give options before a recommendation.", "Name the trade-off of each option in one line.", "Say what information would change the recommendation."],
        success: ["I can see why the recommended option wins.", "Each step of the plan has an owner or a next action.", "Risks are listed with what to do about them."]
    },
    "Generate ideas or options": {
        rules: ["Quantity first, then mark the three strongest.", "Mix safe and unusual ideas.", "One line per idea, no explanation unless asked."],
        success: ["At least ten distinct ideas, none a rewording of another.", "The three marked ones come with one reason each."]
    },
    "Rewrite, translate or adapt a text": {
        rules: ["Keep the meaning; change only what the task asks.", "Keep names, numbers and quotations exact.", "Mark anything you could not render faithfully."],
        success: ["A reader of the result would not know it was adapted.", "Nothing from the original is lost or added."]
    },
    "Teach me a topic": {
        rules: ["Start from what I said I already know.", "One concept at a time, each with one concrete example.", "Ask me a question at the end of each part before moving on."],
        success: ["I can explain each concept back in my own words.", "I can do the small exercise you set without looking at the answer."]
    }
};

const FORMATS = {
    "Plain paragraphs": "Short paragraphs of plain prose.",
    "Bullet list": "A bullet list, one point per line.",
    "Numbered steps": "Numbered steps in the order they are done.",
    "Table": "A Markdown table.",
    "Document with headings": "A Markdown document with headings.",
    "JSON only": "Valid JSON only, with no text before or after it.",
    "Code only": "Code only, in one block, with no explanation unless I ask.",
    "Email": "An email, ready to send."
};

const UNCLEAR = {
    "Ask me first, then wait": "Before you answer, ask me any question whose answer would change the result. Then wait.",
    "State assumptions and continue": "Do not ask questions. State every assumption you make in a short list at the top, then answer.",
    "Give two versions": "If one choice would change the result, give me the two versions and say which you would pick and why."
};

/* one item per line, without the list marker the visitor typed, each ending as a sentence */
const lines = (value) => String(value ?? "").split(/\r?\n/).map((l) => l.trim().replace(/^[-*•]\s*/, "")).filter(Boolean).map((l) => (/[.!?:]$/.test(l) ? l : `${l}.`));

export const BLUEPRINTS = {

    "general-prompt": {
        deliverable: "a result for any task",
        categories: CATS,
        depth: "short",
        questions: [
            area("goal", "What should the AI produce?", { essential: true, rows: 3, hint: "One or two sentences. Name the thing itself: a plan, a reply, a table, a function, a summary.", placeholder: "A one-page summary of our customer survey for Monday's leadership meeting." }),
            choose("kind", "Kind of task", Object.keys(KINDS), { hint: "Adds the rules and checks that usually matter for it, where you wrote none." }),
            text("actas", "Who should the AI act as?", { hint: "A role sets the knowledge and the tone. Leave it empty if it does not matter.", placeholder: "an experienced customer-research analyst" }),
            text("audience", "Who is the result for?", { placeholder: "senior managers with no research background" }),
            area("background", "Background the AI needs", { rows: 4, hint: "What exists, what happened, what was tried. Facts, not opinions.", placeholder: "We sent a 12-question survey to 2,000 customers in October; 420 answered." }),
            area("success", "How you will judge the result", { essential: true, rows: 3, hint: "One per line. The AI checks its answer against these before it replies.", placeholder: "A manager can read it in two minutes\nEvery claim has a number or a quote behind it" }),
            more(area("material", "Material you will paste after the prompt", { rows: 2, hint: "Name each thing and its form, so the AI knows what to expect.", placeholder: "The survey export as CSV, 420 rows" })),
            more(area("rules", "Rules and limits", { rows: 3, hint: "One per line: length, language, what to leave out, what must be true.", placeholder: "No more than 400 words\nBritish English\nDo not invent numbers that are not in the data" })),
            more(choose("format", "Format of the answer", Object.keys(FORMATS))),
            more(choose("tone", "Tone", TONES)),
            more(area("example", "An example of what good looks like", { rows: 2, hint: "A short sample, or a description of one you liked." })),
            more(choose("unclear", "If something is unclear", Object.keys(UNCLEAR)))
        ],
        brief: (a) => {
            const kind = KINDS[a.kind];
            const rules = lines(a.rules);
            const success = lines(a.success);
            return {
                goal: `${a.actas ? `Act as ${a.actas.replace(/[.\s]+$/, "")}.\n\n` : ""}${a.kind ? `${a.kind}: ` : ""}${a.goal}`,
                context: [["The result is for", a.audience], ["Background", a.background], ["Material I will provide after this prompt", a.material], ["An example of a good result", a.example]],
                requirements: [
                    ...(rules.length ? rules : kind?.rules ?? []),
                    a.tone ? `Tone: ${a.tone}.` : "",
                    UNCLEAR[a.unclear] ?? ""
                ],
                format: [FORMATS[a.format] ?? "", ...(success.length || kind ? [`Before you reply, check your answer against each of these: ${(success.length ? success : kind.success).join(" ")}`] : [])]
            };
        },
        stages: [],
        refine: ["completeness", "clarity", "missing"],
        quality: ["The answer is the thing you asked for, in the form you asked for.", "It meets each of your success criteria.", "Anything it assumed is listed."],
        prepare: { required: ["What you want produced, in one or two sentences."], optional: ["The material the AI should work from.", "An example of a result you liked."] },
        next: ["Check the answer with the AI Answer Checker against this prompt.", "If one of the other tasks fits better next time, choose it: it asks the questions that matter for that work."]
    }

};
