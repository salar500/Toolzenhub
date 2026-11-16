/* =========================================================
   ToolZen Hub
   AI Workbench blueprints: creating content (Stage 8)

   Articles, social posts, marketing copy, scripts and repurposing.
   The facts are the visitor's: the AI is told not to invent
   statistics, quotes or claims, and to mark what needs a source.
========================================================= */

import { text, area, choose, more, TONES } from "./shared.js";

const CATS = [{ id: "assistants" }, { id: "writing" }];

const topic = area("topic", "Topic and main point", { essential: true, rows: 3, placeholder: "Why small online shops should offer a guest checkout" });
const audience = text("audience", "Who it is for", { essential: true, placeholder: "Owners of small online shops, not technical" });
const tone = choose("tone", "Tone", TONES);
const facts = area("facts", "Facts, examples or sources to use", { long: true, rows: 4, hint: "Only what you know is true. The AI is told not to add statistics of its own." });

const NO_FAKE_FACTS = "Statistics, quotes, studies or claims I did not give you. Where a claim needs a source, mark it [source needed].";

export const BLUEPRINTS = {

    article: {
        deliverable: "an article",
        categories: CATS,
        depth: "standard",
        questions: [
            topic,
            audience,
            choose("purpose", "Purpose", ["Explain or teach", "Persuade", "Compare options", "Tell a story", "Answer a question people search for"]),
            text("length", "Length", { placeholder: "About 1,200 words" }),
            tone,
            facts,
            more(text("keywords", "Words people use to search for it", { hint: "Use them naturally; the AI is told not to stuff them.", placeholder: "guest checkout, checkout without account" }))
        ],
        brief: (a) => ({
            goal: `Write an article about: ${a.topic}`,
            context: [["Readers", a.audience], ["Purpose", a.purpose], ["Length", a.length], ["Tone", a.tone], ["Facts and sources to use", a.facts], ["Search words", a.keywords]],
            requirements: [
                "Open with the reader's problem and answer it early; every section must earn its place.",
                "Use concrete examples a reader of this audience would recognise.",
                a.keywords ? "Use the search words where they read naturally, never repeated for their own sake." : "",
                "End with a clear next step for the reader."
            ],
            format: ["A title, a short introduction, headed sections, and a conclusion.", "Headings that say what the section answers."],
            avoid: [NO_FAKE_FACTS, "Filler openings such as \"In today's fast-paced world\"."]
        }),
        stages: [
            { at: "standard", name: "Outline", objective: "Agree the structure.", submit: "The master prompt.", ask: () => "Give a title and an outline with one line per section saying what it answers. No article yet.", expect: "Title and outline.", done: "The outline answers the reader's question." },
            { at: "standard", name: "Draft", objective: "The full article.", submit: "Your changes to the outline.", ask: () => "Write the article from the approved outline.", expect: "The article.", done: "It reads well aloud and keeps to the length." },
            { at: "detailed", name: "Fact pass", objective: "Make it trustworthy.", submit: "Nothing new.", ask: () => "List every factual claim in the article and whether it came from my facts, is common knowledge, or needs a source. Mark the last kind [source needed].", expect: "A claim list.", done: "Each claim is supported or removed." }
        ],
        refine: ["accuracy", "clarity", "style", "structure"],
        quality: ["Every statistic and claim is yours or has a source you checked.", "The first paragraph tells the reader what they will get.", "It fits the length.", "Nothing reads like filler."],
        prepare: { required: ["Your main point in one sentence.", "Who the reader is."], optional: ["Facts, numbers and examples you can stand behind.", "An article whose style you like."] },
        next: ["Check every [source needed] mark before publishing.", "Read it aloud once; cut what you skip.", "Repurpose it later with the Workbench task \"repurpose content\"."]
    },

    "social-posts": {
        deliverable: "social media posts",
        categories: CATS,
        depth: "short",
        questions: [
            topic,
            choose("platform", "Platform", ["LinkedIn", "Instagram", "X (Twitter)", "Facebook", "YouTube community", "Several"], { essential: true }),
            audience,
            text("count", "How many posts", { placeholder: "3 variations" }),
            tone,
            text("cta", "What readers should do", { placeholder: "Visit the shop, comment, sign up" })
        ],
        brief: (a) => ({
            goal: `Write ${a.count || "3"} ${a.platform} post${/^1\b/.test(a.count) ? "" : "s"} about: ${a.topic}`,
            context: [["Audience", a.audience], ["Tone", a.tone], ["Call to action", a.cta]],
            requirements: ["Fit the platform's usual length and style.", "Lead with a line that makes this audience stop scrolling, without clickbait.", a.cta ? "End with the call to action." : "", "Vary the angle between posts."],
            format: ["Each post separately, with suggested hashtags only where the platform uses them."],
            avoid: [NO_FAKE_FACTS, "Promises the product cannot keep."]
        }),
        stages: [
            { at: "standard", name: "Angles", objective: "Pick the strongest angle.", submit: "The master prompt.", ask: () => "Give five different angles, one line each, before writing.", expect: "Angles.", done: "You picked the angles." },
            { at: "standard", name: "Posts", objective: "Ready-to-post text.", submit: "Your chosen angles.", ask: () => "Write the posts for the chosen angles.", expect: "Posts.", done: "You would post them." }
        ],
        refine: ["style", "clarity"],
        quality: ["Each post makes sense without the others.", "No claim you cannot back up.", "It fits the platform's length."],
        prepare: { required: ["The one thing you want people to know or do."], optional: ["A post that worked for you before."] },
        next: ["Post one and see how people respond before posting the rest.", "Keep the ones that worked as examples for next time."]
    },

    "marketing-copy": {
        deliverable: "marketing copy",
        categories: CATS,
        depth: "standard",
        questions: [
            area("product", "Product or service", { essential: true, rows: 3 }),
            audience,
            choose("placement", "Where it appears", ["Landing page", "Product description", "Email", "Advert", "Brochure"], { essential: true }),
            area("benefits", "Real benefits and proof", { rows: 4, hint: "What it does for the customer, and any proof you can show (reviews, numbers you measured)." }),
            tone,
            area("rules", "Brand or legal rules", { rows: 2, placeholder: "Never say \"cheapest\"; mention the 30-day return policy" })
        ],
        brief: (a) => ({
            goal: `Write ${a.placement.toLowerCase()} copy for: ${a.product}`,
            context: [["Audience", a.audience], ["Benefits and proof", a.benefits], ["Tone", a.tone], ["Rules", a.rules]],
            requirements: ["Lead with the customer's benefit, not the feature.", "Use only the proof I gave.", "One clear call to action.", a.rules ? "Follow the brand and legal rules exactly." : ""],
            format: ["Headline, supporting copy and call to action, plus two alternative headlines."],
            avoid: [NO_FAKE_FACTS, "Superlatives such as best, cheapest or number one unless I gave the proof."]
        }),
        stages: [
            { at: "standard", name: "Messages", objective: "Find the message.", submit: "The master prompt.", ask: () => "List the three strongest messages for this audience, with the proof for each.", expect: "Messages.", done: "One message is clearly strongest." },
            { at: "standard", name: "Copy", objective: "The copy.", submit: "The chosen message.", ask: () => "Write the copy around the chosen message.", expect: "Copy with alternatives.", done: "It fits the space it will appear in." }
        ],
        refine: ["style", "accuracy", "clarity"],
        quality: ["Every claim has proof you can show.", "No banned or risky words.", "The call to action is clear."],
        prepare: { required: ["What the product does and costs.", "Your brand or legal rules."], optional: ["Customer reviews you may quote."] },
        next: ["Have someone outside the team read it in ten seconds and say what it offers.", "Test two headlines if the channel allows."]
    },

    script: {
        deliverable: "a script",
        categories: [{ id: "assistants" }, { id: "writing" }, { id: "video" }],
        depth: "standard",
        questions: [
            topic,
            choose("medium", "For", ["A YouTube video", "A short vertical video", "A podcast", "A presentation or talk", "An explainer"], { essential: true }),
            text("duration", "Length", { essential: true, placeholder: "8 minutes" }),
            audience,
            tone,
            facts
        ],
        brief: (a) => ({
            goal: `Write a script for ${a.medium.charAt(0).toLowerCase()}${a.medium.slice(1)} about: ${a.topic}`,
            context: [["Length", a.duration], ["Audience", a.audience], ["Tone", a.tone], ["Facts to use", a.facts]],
            requirements: ["A hook in the first lines, then a clear structure.", "Write for the ear: short sentences, natural speech.", "Mark timing for each part so it fits the length.", /video/i.test(a.medium) ? "Add brief visual notes in [brackets] next to the lines they go with." : ""],
            format: ["Sections with approximate timings."],
            avoid: [NO_FAKE_FACTS]
        }),
        stages: [
            { at: "standard", name: "Structure", objective: "Agree the flow.", submit: "The master prompt.", ask: () => "Give the structure with timings only.", expect: "A timed outline.", done: "It fits the length." },
            { at: "standard", name: "Script", objective: "The full script.", submit: "Changes to the outline.", ask: () => "Write the full script.", expect: "The script.", done: "Read aloud, it fits the time." }
        ],
        refine: ["style", "clarity", "accuracy"],
        quality: ["Read aloud at a normal pace, it fits the length.", "The opening gives a reason to keep watching or listening.", "Every fact is yours or checked."],
        prepare: { required: ["The main point and the length."], optional: ["Facts and examples.", "A script or video whose style you like."] },
        next: ["Read it aloud with a timer.", "Plan the visuals with the Workbench task \"a storyboard and shot list\", or record it with \"narration or a voiceover\"."]
    },

    repurpose: {
        deliverable: "repurposed content",
        categories: CATS,
        depth: "short",
        questions: [
            area("source", "The original content", { essential: true, long: true, rows: 8 }),
            choose("target", "Turn it into", ["Social posts", "A newsletter", "A short video script", "A summary", "Slides outline", "A thread"], { essential: true }),
            audience,
            text("length", "Length", { placeholder: "5 posts, or 300 words" })
        ],
        brief: (a) => ({
            goal: `Turn the content below into ${a.target.toLowerCase()}.`,
            context: [["Audience", a.audience], ["Length", a.length], ["Original", a.source]],
            requirements: ["Keep the original meaning and facts; do not add new claims.", "Adapt the structure and wording to the new format, not just shorten it."],
            format: ["Ready-to-use text in the new format."],
            avoid: [NO_FAKE_FACTS]
        }),
        stages: [
            { at: "standard", name: "Key points", objective: "Choose what carries over.", submit: "The master prompt.", ask: () => "List the key points worth carrying over, in order of importance.", expect: "Key points.", done: "You agree with the order." },
            { at: "standard", name: "New version", objective: "The new piece.", submit: "Your changes.", ask: () => "Write the new version from the approved points.", expect: "The repurposed content.", done: "It works on its own." }
        ],
        refine: ["accuracy", "style"],
        quality: ["Nothing in the new version contradicts the original.", "It stands alone for someone who never saw the original."],
        prepare: { required: ["The original content."], optional: ["An example of the target format you like."] },
        next: ["Link back to the original where the format allows."]
    },

    /* AI ecosystem programme 16 D4: writing on the user's own text leads work use of assistants (research 01, S25) */
    "email-message": {
        deliverable: "an email or message",
        categories: CATS,
        depth: "short",
        questions: [
            choose("kind", "New message or a reply", ["A new message", "A reply to a message I received"]),
            area("received", "The message you are replying to", { essential: true, long: true, rows: 6, showIf: (a) => /reply/i.test(a.kind), hint: "Paste it as received. Remove anything confidential first." }),
            area("goal", "What it must achieve", { essential: true, rows: 3, hint: "The one outcome you want: a decision, a meeting, a payment, a polite no.", placeholder: "Agree a new delivery date of 28 November without losing the order" }),
            text("recipient", "Who it is to", { essential: true, hint: "Their role and your relationship, not their name.", placeholder: "A long-standing customer, the purchasing manager" }),
            choose("tone", "Tone", TONES),
            choose("length", "Length", ["Short (under 100 words)", "Medium (100 to 200 words)", "As long as it needs"]),
            area("include", "Points it must include", { rows: 3, hint: "One per line. Only facts you know are true.", placeholder: "The delay is caused by our supplier\nWe can offer 5% off this order" }),
            more(area("avoid", "Anything it must not say", { rows: 2, placeholder: "Do not promise a date before the 28th" }))
        ],
        brief: (a) => ({
            goal: /reply/i.test(a.kind) ? `Write a reply to the message below. It must achieve this: ${a.goal}` : `Write a message that achieves this: ${a.goal}`,
            context: [["Recipient", a.recipient], ["Tone", a.tone], ["Length", a.length], ["Points to include", a.include], ["Message received", a.received]],
            requirements: [
                "Put the request or the answer in the first two sentences.",
                "Include every point I listed, and no fact I did not give you.",
                a.avoid ? `Do not say: ${a.avoid}` : "",
                "End with one clear next step for the recipient."
            ],
            format: ["A subject line (for an email), then the message, ready to send.", "Plain sentences; no headings."],
            avoid: ["Promises, dates or figures I did not give you.", "Filler such as \"I hope this email finds you well\"."]
        }),
        conflicts: (a) => {
            const out = [];
            if (/short/i.test(a.length) && String(a.include).split("\n").filter((l) => l.trim()).length > 5) out.push("You chose a short message but listed more than five points. Choose a longer length or fewer points.");
            return out;
        },
        stages: [
            { at: "standard", name: "Points to make", objective: "Agree what the message says before the wording.", submit: "The master prompt.", ask: () => "List, in order, the points the message will make and the next step it asks for. No message yet.", expect: "An ordered list of points.", done: "Nothing is missing and nothing is extra." },
            { at: "standard", name: "Draft", objective: "The message itself.", submit: "Your changes to the points.", ask: () => "Write the message from the approved points.", expect: "The message, ready to send.", done: "You would send it as it is." },
            { at: "detailed", name: "Tone check", objective: "Make sure it reads as intended.", submit: "Nothing new.", ask: (a) => `Read the message as the recipient (${a.recipient}) would. Point out anything that could read as rude, vague or more certain than I am, and suggest the smallest change for each.`, expect: "A short list of wording changes.", done: "You agree with each change or reject it." }
        ],
        refine: ["clarity", "style", "completeness"],
        quality: ["The first two sentences say what you want.", "Every fact, date and figure is one you gave.", "It asks for one clear next step.", "You would be comfortable if it were forwarded."],
        prepare: { required: ["The outcome you want, in one sentence."], optional: ["The message you are replying to.", "An earlier message of yours whose tone you like."] },
        next: ["Read it once aloud before sending.", "Check every date and figure against your own records."]
    }

};
