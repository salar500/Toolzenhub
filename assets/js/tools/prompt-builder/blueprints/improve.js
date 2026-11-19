/* =========================================================
   ToolZen Hub
   AI Prompt Builder blueprints: improving existing work

   A draft is reviewed before it is rewritten, so the visitor
   decides which changes to accept, and nothing true is lost.
========================================================= */

import { text, area, choose } from "./shared.js";

const CATS = [{ id: "assistants" }, { id: "writing" }];

const work = area("work", "The work", { essential: true, long: true, rows: 8, hint: "Paste the draft, document or text." });

export const BLUEPRINTS = {

    "review-draft": {
        deliverable: "a reviewed and improved draft",
        categories: CATS,
        depth: "standard",
        questions: [
            work,
            text("purpose", "What it is for", { essential: true, placeholder: "A proposal to a client" }),
            text("audience", "Who reads it", { placeholder: "A busy finance director" }),
            choose("depth", "How much may change", ["Light edit: wording only", "Moderate: wording and structure", "Heavy: rewrite where needed"], { essential: true })
        ],
        brief: (a) => ({
            goal: `Review this draft (it is for: ${a.purpose}) and then improve it.`,
            context: [["Reader", a.audience], ["Allowed changes", a.depth], ["Draft", a.work]],
            requirements: ["Review first: list the main problems in order of importance, each with an example from the text.", "Then improve it within the allowed changes, keeping every fact as it is.", "Mark any sentence where you changed the meaning, so I can check it."],
            format: ["The review, then the improved version, then a short list of what changed."],
            avoid: ["New facts or claims."]
        }),
        stages: [
            { at: "standard", name: "Review", objective: "See the problems first.", submit: "The main prompt with the draft.", ask: () => "Give only the review: the main problems, in order, with examples.", expect: "A review.", done: "You agree which problems to fix." },
            { at: "standard", name: "Improve", objective: "The better version.", submit: "Which problems to fix.", ask: () => "Improve the draft, fixing only the problems I chose.", expect: "The improved draft.", done: "It reads better and says the same things." }
        ],
        refine: ["clarity", "style", "consistency"],
        quality: ["Every fact in the original is still there and still true.", "Nothing changed beyond what you allowed.", "It still sounds like you."],
        prepare: { required: ["The draft.", "What it is for."], optional: ["Feedback you already received."] },
        next: ["Compare the two versions side by side before accepting."]
    },

    "fix-accuracy": {
        deliverable: "an accuracy and clarity check",
        categories: CATS,
        depth: "standard",
        noFabrication: true,
        questions: [work, area("sources", "Sources to check against", { long: true, rows: 4, hint: "The documents or data the text should agree with." }), text("audience", "Who reads it")],
        brief: (a) => ({
            goal: "Check this text for accuracy and clarity.",
            context: [["Reader", a.audience], ["Sources to check against", a.sources], ["Text", a.work]],
            requirements: [a.sources ? "Compare every claim with the sources and mark it supported, contradicted or not covered." : "List every factual claim and say what kind of source would confirm it; do not judge claims you cannot check.", "List unclear sentences with a clearer version.", "Do not rewrite the whole text."],
            format: ["A table of claims with their status, then the clarity fixes."]
        }),
        stages: [
            { at: "standard", name: "Claims", objective: "Know what to trust.", submit: "The main prompt.", ask: () => "Give the claims table only.", expect: "A claims table.", done: "Each claim has a status." },
            { at: "standard", name: "Clarity", objective: "Easier to read.", submit: "Nothing new.", ask: () => "Now list the unclear sentences with clearer versions.", expect: "Fixes.", done: "You accepted or rejected each." }
        ],
        refine: ["evidence", "clarity"],
        quality: ["You checked each contradicted claim yourself.", "Claims the AI could not check are still marked unchecked."],
        prepare: { required: ["The text."], optional: ["The sources it should agree with."] },
        next: ["Fix the contradicted claims first."]
    },

    "adapt-audience": {
        deliverable: "an adapted version",
        categories: CATS,
        depth: "short",
        questions: [work, text("audience", "New audience", { essential: true, placeholder: "Students new to the topic" }), choose("format", "New format", [
            { value: "an email", label: "Email" },
            { value: "a summary", label: "Summary" },
            { value: "a slides outline", label: "Slides outline" },
            { value: "an FAQ", label: "FAQ" },
            { value: "a social post", label: "Social post" }
        ], { empty: "Same format" }), text("length", "Length", { placeholder: "Half as long" })],
        brief: (a) => ({
            goal: `Adapt this for ${a.audience}${a.format ? `, as ${a.format}` : ""}.`,
            context: [["Length", a.length], ["Original", a.work]],
            requirements: ["Keep the meaning and facts; change vocabulary, examples and depth for the new readers.", "Explain terms the new readers will not know."],
            format: ["The adapted version only."],
            avoid: ["New claims."]
        }),
        stages: [],
        refine: ["clarity", "accuracy"],
        quality: ["Someone from the new audience understands it on first reading.", "No fact was changed."],
        prepare: { required: ["The original."], optional: ["An example of writing for the new audience."] },
        next: ["Ask someone from the new audience to read it."]
    }

};
