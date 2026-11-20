/* =========================================================
   ToolZen Hub
   AI Prompt Builder methods: writing and improving content (D19)

   See method.js for the contract. Covers the content and improve
   families. Facts, figures, quotes and claims come from the
   visitor; anything else is marked for checking.
========================================================= */

const AUDIENCE = {
    id: "audience", at: "detailed", title: "Audience and message",
    lines: [
        "Write for one named reader: what they already know, what they want, and what they should think or do after reading.",
        "One main message; every section supports it or is cut."
    ]
};

const ACCURACY = {
    id: "accuracy", at: "detailed", title: "Accuracy",
    lines: ["Use only facts, figures, names, quotes and claims from my material; mark anything else [check] instead of stating it, and never invent statistics, testimonials or sources."]
};

export const FAMILIES = {
    content: {
        review: "Every claim about a product, a result or a person must be one I can support; mark anything that needs checking or approval before publishing.",
        sections: [
            AUDIENCE,
            ACCURACY,
            {
                id: "edit", at: "comprehensive", kind: "steps", title: "Writing process",
                lines: [
                    "Outline: the headline, the main message and the sections, for my approval.",
                    "Draft: each section with its key point first.",
                    "Edit: cut repetition, filler and jargon; check every claim against my material.",
                    "Finish: headline and opening options, calls to action, and the final read-through."
                ]
            },
            {
                id: "variants", at: "comprehensive", kind: "examples", title: "Options to give",
                lines: ["Two or three headline or opening options with the angle of each, and one call to action per audience intent."]
            }
        ]
    },
    /* the video and audio planning tasks with a labelled brief (concept, storyboard, podcast) */
    video: { sections: [AUDIENCE, ACCURACY] },
    audio: { sections: [AUDIENCE, ACCURACY] },
    improve: {
        review: "Keep my meaning and my facts: show what you changed and why, and do not add new claims.",
        sections: [
            ACCURACY,
            {
                id: "changes", at: "detailed", kind: "deliverables", title: "Show your changes",
                lines: ["List each significant change with the reason (clarity, accuracy, structure, tone), so I can accept or reject it."]
            }
        ]
    }
};

const job = (role, approach, sections = []) => ({ role, approach, sections });

export const METHODS = {
    article: job("Act as an experienced editor and writer who produces clear, well-structured articles for a defined audience.", [
        "Agree the angle and the outline before drafting.",
        "Open with why the reader should care, then deliver on it section by section.",
        "Support claims with the material I give; end with a useful next step for the reader."
    ], [
        { at: "detailed", title: "Article method", lines: [
            "Identify the reader's question and the search intent behind it (to learn, to compare, to decide), and answer it early.",
            "Plan the structure as headings a reader can scan; each section makes one point, supported by an example, data or a step from my material.",
            "Use the main topic and its related terms naturally in the title, the first paragraph and the headings, never by repeating keywords."
        ] },
        { at: "comprehensive", kind: "edges", title: "Before publishing", lines: ["Every fact and figure checked against a source I can open; quotes exact and attributed; nothing presented as current that may have changed; internal links to related pages suggested; images with alt text."] },
        { at: "comprehensive", kind: "deliverables", title: "Deliverables", lines: ["The outline, the full draft with subheadings, a meta description of about 150 characters if it is for the web, and a list of claims to check."] }
    ]),
    "social-posts": job("Act as an experienced social media editor who writes posts that suit each platform.", [
        "Adapt length, format and tone to each platform I name.",
        "One idea per post, with a hook in the first line and one call to action.",
        "No claims, statistics or testimonials I have not given you."
    ], [
        { at: "comprehensive", kind: "deliverables", title: "Visual for each post", lines: ["Describe the image or video for each post: what it shows, the size for the platform (checked, not assumed), the little text it carries, and alt text."] },
        { when: (a) => /linkedin|several/i.test(a.platform), at: "detailed", title: "For LinkedIn", lines: ["A professional, first-person voice; the first two lines must make people expand the post, because only the start is shown; short paragraphs with line breaks; an insight, a lesson or a concrete example from my material; a question or a clear next step at the end."] },
        { when: (a) => /instagram|several/i.test(a.platform), at: "detailed", title: "For Instagram", lines: ["The post is carried by the image or video: describe the visual, then a caption whose first line works on its own, a few relevant hashtags, and alt text for the image."] },
        { when: (a) => /x (twitter)|several/i.test(a.platform), at: "detailed", title: "For X", lines: ["Keep each post within the character limit of my account type (280 for a standard account); for more, write a thread where each post stands on its own."] },
        { at: "comprehensive", kind: "edges", title: "Before publishing", lines: ["Character limits, hashtags that are relevant rather than many, accessibility (alt text for images, camel-case hashtags), and anything that could be misread out of context."] }
    ]),
    "marketing-copy": job("Act as an experienced conversion copywriter who writes honest, specific copy.", [
        "Lead with the customer's problem and the specific benefit, not features.",
        "Back each claim with a fact I gave you; no superlatives I cannot prove.",
        "One clear call to action."
    ], [
        { at: "detailed", title: "Copy brief", lines: [
            "Before writing, state the brief in a few lines: the marketing objective, the audience and their problem, the value proposition, the offer, what sets it apart from the alternatives, and the one action wanted.",
            "List every claim the copy will make and the fact from my material behind it; a claim without one is cut or rewritten as something I can support."
        ] },
        { at: "detailed", title: "Message hierarchy and structure", lines: [
            "Order the message: the headline (the main benefit or the problem), the support (how it delivers, with evidence), the answer to the main objection, then the call to action.",
            "Keep to my brand voice and tone, and to the placement's constraints: length, what is visible before a reader scrolls or expands, and any character limits of the channel (checked, not assumed)."
        ] },
        { when: (a) => /landing page/i.test(a.placement), at: "detailed", title: "For a landing page", lines: ["A headline and subheading that match the advert or link that brings people there, sections that each answer one question, proof near the claim it supports, and the call to action repeated after the main sections."] },
        { when: (a) => /^email/i.test(a.placement), at: "detailed", title: "For an email", lines: ["A subject line and preview text that work together, one main message, one call to action as a button and a text link, and a plain-text version."] },
        { when: (a) => /advert/i.test(a.placement), at: "detailed", title: "For an advert", lines: ["Several headline and description variants within the platform's limits, each testing one different angle, and a landing page that keeps the advert's promise."] },
        { at: "comprehensive", kind: "deliverables", title: "Deliverables", lines: ["The copy, two alternative headlines with the angle of each, a claims table (claim, supporting fact, needs checking), and how to measure whether it worked (the metric, the comparison, and what result would count as better)."] },
        { at: "comprehensive", kind: "edges", title: "Compliance and trust", lines: ["Claims about price, results, health, money or comparisons with competitors need evidence and may be regulated where you advertise; mark each for checking."] }
    ]),
    script: job((a) => /short vertical/i.test(a.medium) ? "Act as an experienced short-form video producer who writes vertical videos that hold attention from the first second." : /podcast/i.test(a.medium) ? "Act as an experienced podcast producer and scriptwriter." : "Act as an experienced video scriptwriter who writes for the ear and the screen.", [
        "Write to the length and format given, with timings.",
        "Short spoken sentences; visuals and directions kept apart from the spoken words.",
        "A clear opening, one message, and an ending that tells the viewer what to do."
    ], [
        { when: (a) => /youtube|explainer/i.test(a.medium), at: "detailed", title: "Structure for a longer video", lines: [
            "Open with a hook that states the viewer's problem or payoff within the first seconds, then say what the video will show.",
            "Structure the body as chapters with a clear title each, so the video can be navigated; put a reason to keep watching before each change of section.",
            "For every section give: the spoken words, the visuals (on camera, screen recording, B-roll, graphics), on-screen text, and the time it takes."
        ] },
        { when: (a) => /youtube/i.test(a.medium), at: "comprehensive", kind: "deliverables", title: "Deliverables for YouTube", lines: ["The script as a two-column table (spoken words | visuals and on-screen text) with timestamps; three title options and the thumbnail idea each matches; chapter titles with start times; a description opening of two or three lines."] },
        { when: (a) => /short vertical/i.test(a.medium), at: "detailed", title: "Short vertical video method", lines: [
            "The first one to two seconds carry the hook as both words and a visual; no introduction or greeting.",
            "One idea only, with a visual change every few seconds; frame everything for a vertical 9:16 screen with the subject in the centre.",
            "Write captions as on-screen text, because many people watch without sound; check the platform's current length limit rather than assuming one.",
            "End on the call to action, or on a line that loops back to the opening."
        ] },
        { when: (a) => /short vertical/i.test(a.medium), at: "comprehensive", kind: "deliverables", title: "Deliverables for a short video", lines: ["A shot list with second-by-second timing: visual, spoken line or voiceover, on-screen caption, and sound; the post caption; two alternative hooks to test."] },
        { when: (a) => /podcast/i.test(a.medium), at: "detailed", title: "Podcast method", lines: ["Segments with timings (cold open, introduction, main segments, close), the questions or talking points for each, transitions, and the facts and names to check before recording."] },
        { when: (a) => /presentation|talk/i.test(a.medium), at: "detailed", title: "Talk method", lines: ["Speaker notes per slide, in spoken words, with timing; a pause or question every few minutes; the one sentence the audience should remember, said at the start and the end."] }
    ]),
    repurpose: job("Act as an experienced content strategist who adapts one piece for different formats without losing its meaning.", [
        "Pick the key points worth reusing.",
        "Rewrite for each format's length, structure and audience.",
        "Keep facts and claims exactly as in the original."
    ]),
    "email-message": job("Act as an experienced professional communicator who writes clear, courteous emails.", [
        "Put the purpose and any request in the first two lines.",
        "Give the context needed and nothing more.",
        "End with the next step, the owner and any date."
    ]),
    "review-draft": job("Act as an experienced editor giving a candid, constructive review.", [
        "Judge the draft against its purpose and audience first.",
        "Separate major issues (argument, structure, accuracy) from line edits.",
        "Give each issue a location and a suggested fix."
    ]),
    "fix-accuracy": job("Act as a careful fact-checker.", [
        "List every checkable claim: facts, figures, names, dates, quotes.",
        "Mark each as supported by my material, needs a source, or likely wrong, with why.",
        "Never confirm a claim from memory as verified; say what source would confirm it."
    ]),
    "video-concept": job("Act as an experienced video producer who develops concepts that can be made within the budget given.", [
        "Start from the audience, the platform and the one message.",
        "Propose a concept with its hook, structure and visual style.",
        "Check it can be produced with the time, people and budget I named."
    ]),
    storyboard: job("Act as an experienced storyboard artist and director.", [
        "Break the script into shots with their framing, action and duration.",
        "Keep continuity of characters, props and direction from shot to shot.",
        "Note sound, text on screen and transitions for each shot."
    ]),
    podcast: job("Act as an experienced podcast producer.", [
        "Define the episode's audience, purpose and length.",
        "Structure it as segments with timings, questions and transitions.",
        "Prepare the facts and introductions to be checked before recording."
    ]),
    "adapt-audience": job("Act as an experienced editor who adapts content for a different audience.", [
        "Identify what the new audience knows and needs.",
        "Change vocabulary, examples, depth and order to fit them.",
        "Keep every fact; list anything removed and why."
    ])
};

/* Sections added after the D21 coverage audit (24-STRATEGY-ENGINE.md section 5): tasks that had only a role and an
   approach now carry their own professional method. */
METHODS["repurpose"].sections = [...(METHODS["repurpose"].sections ?? []),
    { at: "detailed", title: "Repurposing method", lines: [
        "List the source's key points and match each to the format it suits best; not every point belongs everywhere.",
        "For each target format, change the structure, length, opening and call to action rather than cutting the original down.",
        "Keep facts, figures and quotes exactly as in the source, and link back to it where the platform allows."
    ] }
];
METHODS["email-message"].sections = [...(METHODS["email-message"].sections ?? []),
    { at: "detailed", title: "Email method", lines: [
        "A subject line that states the purpose; the request or the news in the first sentence; the context in short paragraphs; one next step with an owner and a date.",
        "Check every name, number, date and attachment the email mentions against my notes."
    ] },
    { at: "comprehensive", kind: "edges", title: "Before sending", lines: [
        "Bad news or a refusal stated plainly with the reason and an alternative; nothing in it that would cause harm if forwarded; the right people in To and Cc."
    ] }
];
METHODS["video-concept"].sections = [...(METHODS["video-concept"].sections ?? []),
    { at: "detailed", title: "Concept method", lines: [
        "A one-sentence premise, the audience and platform, and the single feeling or action the video should leave.",
        "The hook, then the structure beat by beat, with the visual style described in words.",
        "What it needs to make: people, locations, footage, music, time and budget, checked against what I said is available."
    ] },
    { at: "comprehensive", kind: "edges", title: "Production risks", lines: [
        "Rights to music, footage and people's images; locations needing permission; weather or light for outdoor shots; anything that cannot be made within the budget."
    ] }
];
METHODS["storyboard"].sections = [...(METHODS["storyboard"].sections ?? []),
    { at: "detailed", title: "Shot method", lines: [
        "For each shot: number, framing (wide, medium or close-up), camera movement, action, dialogue or voiceover, on-screen text, sound and duration.",
        "Mark the continuity items (costume, props, direction of movement) that must match between shots."
    ] },
    { at: "comprehensive", kind: "deliverables", title: "Deliverables", lines: [
        "The storyboard as a table, one row per shot, with the running time; a list of locations, props and people per shot; the shots to capture first if time runs short."
    ] }
];
METHODS["podcast"].sections = [...(METHODS["podcast"].sections ?? []),
    { at: "detailed", title: "Episode method", lines: [
        "The episode's single question or promise, then segments with timings, the talking points or questions for each, and transitions.",
        "Introductions and facts about guests or topics listed for checking before recording.",
        "A close that summarises and tells listeners what to do next."
    ] }
];
METHODS["review-draft"].sections = [...(METHODS["review-draft"].sections ?? []),
    { at: "detailed", title: "Review method", lines: [
        "Read once for purpose and audience, once for structure and argument, once for sentences and errors.",
        "Rank the issues by how much each would affect the reader."
    ] },
    { at: "detailed", kind: "deliverables", title: "Deliverables", lines: [
        "A short verdict, then the issues by severity with their location, and a suggested rewrite for the three most important."
    ] }
];
METHODS["fix-accuracy"].sections = [...(METHODS["fix-accuracy"].sections ?? []),
    { at: "detailed", kind: "deliverables", title: "Claims table", lines: [
        "A table: claim, where it appears, status (supported by my material, needs a source, likely wrong), the evidence or reason, and the correction."
    ] }
];
METHODS["adapt-audience"].sections = [...(METHODS["adapt-audience"].sections ?? []),
    { at: "detailed", title: "Adaptation method", lines: [
        "Profile the new audience: what they know, what they need, the words they use.",
        "Map each concept to that vocabulary, replace examples with ones from their world, and reorder for their priorities.",
        "Keep a list of points simplified or removed, so nothing important is lost by accident."
    ] }
];
