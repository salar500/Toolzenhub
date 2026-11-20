/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata lives in data/articles.js.

   Article:
   How to Write Instructions an AI Assistant Can Act On

   Category:
   AI

   The question: why does the same assistant give a weak answer to one person and a usable one to another, and what
   does a request have to contain? No statistics are quoted; the claims are about the structure of a request, and
   every example can be tried in any assistant with the AI Prompt Builder.
========================================================= */


const article = {

    introduction:
        "Most disappointing answers from ChatGPT, Claude or Copilot were not the assistant's failure. They were requests that left out the one thing the answer needed: what exactly to produce, who it was for, or how it would be judged. This guide shows what a request has to contain, in the order that matters, with the same example written badly and then well.",

    author: { name: "ToolZen Hub", type: "Organization", role: "AI Workflow Guides" },

    tags: ["Prompts", "ChatGPT", "Claude", "Working with AI"],

    keyTakeaways: [
        "Name the deliverable first: a plan, a reply, a table, a function. An assistant shapes its answer like the first thing you ask for.",
        "Say who the result is for. The reader decides the level of detail and the words, more than the topic does.",
        "Give the facts the assistant cannot know: what exists, what was tried, what you will paste next.",
        "Write the rules you would give a colleague, one per line: length, language, tone, what to leave out.",
        "State how you will judge the result, and ask the assistant to check its answer against that list before replying.",
        "Decide what should happen when something is unclear: ask first, state assumptions, or give two versions."
    ],

    calculator: {
        description:
            "Fill in what you want, the context, the rules and how you will judge the result, and copy a complete prompt. The check above the prompt names anything still missing or vague."
    },

    tableOfContents: [
        { id: "the-deliverable-first", label: "The Deliverable First" },
        { id: "who-it-is-for", label: "Who It Is For" },
        { id: "what-the-assistant-cannot-know", label: "What the Assistant Cannot Know" },
        { id: "rules-one-per-line", label: "Rules, One Per Line" },
        { id: "how-you-will-judge-it", label: "How You Will Judge It" },
        { id: "when-something-is-unclear", label: "When Something Is Unclear" },
        { id: "article-faq-title", label: "Frequently Asked Questions" }
    ],

    sections: [
        {
            id: "the-deliverable-first",
            heading: "1. The Deliverable First",
            paragraphs: [
                "Compare two openings. \"We ran a customer survey in October and got 420 responses, and leadership wants to know whether to fund a redesign.\" and \"Write a one-page summary of our October customer survey for Monday's leadership meeting.\" The first is background; an assistant will summarise the background. The second names the thing to produce, and the answer arrives shaped like it.",
                "The deliverable is a noun: a summary, a reply, a checklist, a function, a table. If you cannot name it, you are not ready to ask, and the first thing to ask the assistant is to help you decide what the deliverable should be."
            ]
        },
        {
            id: "who-it-is-for",
            heading: "2. Who It Is For",
            paragraphs: [
                "\"Explain how compound interest works\" is a different task for a new customer, for a finance team and for a ten-year-old. The topic is the same; the reader sets the vocabulary, the depth and the examples. One line, \"the result is for senior managers with no research background\", does more for the answer than three paragraphs of extra background.",
                "A role for the assistant (\"act as an experienced customer-research analyst\") sets its knowledge and tone in the same way. Use it when the tone matters; leave it out when it does not."
            ]
        },
        {
            id: "what-the-assistant-cannot-know",
            heading: "3. What the Assistant Cannot Know",
            paragraphs: [
                "An assistant knows a great deal in general and nothing about your situation. It does not know what already exists, what was tried last quarter, what the data looks like or what you will paste after the prompt. Everything it does not know, it fills in with a guess, and a guess inside a confident answer is invisible.",
                "Give facts, not opinions: \"420 of 2,000 customers answered; three questions were free text; the meeting decides whether to fund a redesign.\" Then name the material you will provide, with its form: \"the export as CSV, 420 rows\". An assistant that knows a CSV is coming plans for it instead of asking what to do with it."
            ]
        },
        {
            id: "rules-one-per-line",
            heading: "4. Rules, One Per Line",
            paragraphs: [
                "Most answers that miss the mark broke a rule that was never written down: too long, the wrong language, a figure invented to fill a gap, a tone the reader would not accept. Write the rules the way you would brief a capable colleague, one per line: \"no more than 400 words\", \"British English\", \"quote at least two customers word for word\", \"do not invent numbers that are not in the data\".",
                "Add the shape of the answer: paragraphs, a bullet list, numbered steps, a table, a Markdown document, JSON only, code only. The shape is a rule too, and it is the one most often left to chance."
            ]
        },
        {
            id: "how-you-will-judge-it",
            heading: "5. How You Will Judge It",
            paragraphs: [
                "This is the part almost every request leaves out, and it does two jobs. Writing \"a manager can read it in two minutes; every claim has a number or a quote behind it; it ends with one recommendation\" makes you decide what matters before you ask. It also gives the assistant a checklist: end the prompt with \"check your answer against each of these before you reply\", and the first draft is usually closer.",
                "Criteria are not the same as rules. A rule is a constraint on the work (\"400 words\"); a criterion is how the result will be tested (\"a manager can act on it without asking a follow-up question\")."
            ]
        },
        {
            id: "when-something-is-unclear",
            heading: "6. When Something Is Unclear",
            paragraphs: [
                "Every request has a gap somewhere. Decide in advance what the assistant should do when it finds one: ask you before answering and wait; state every assumption in a short list at the top and continue; or, when one choice would change the result, give two versions and say which it would pick. Without this instruction the assistant guesses, and the guess is the part you will not notice until it is too late.",
                "For a quick task, \"state assumptions and continue\" is the fastest. For anything you will act on, \"ask me first\" costs one round trip and saves a rewrite."
            ]
        }
    ],

    example: {
        heading: "Example: The Same Request, Twice",
        paragraphs: [
            "Weak: \"Can you help me with our customer survey results for the leadership meeting?\" The assistant does not know what to produce, for whom, from what data, how long, or how you will judge it. It will produce a generic plan for analysing surveys.",
            "Strong: \"Write a one-page summary (under 400 words, British English) of our October customer survey for senior managers with no research background. I will paste the export as CSV, 420 rows, and the free-text answers as a list. Quote at least two customers word for word; do not invent numbers that are not in the data. Success: a manager can read it in two minutes, every claim has a number or a quote behind it, and it ends with one recommendation about the redesign. Before you answer, ask me any question whose answer would change the result.\" Every sentence of the strong version is one field of the AI Prompt Builder."
        ]
    },

    biggerPicture: {
        heading: "The Bigger Picture",
        text:
            "A good request is not clever wording; it is the information a capable stranger would need to do the job well. Deliverable, reader, facts, rules, criteria and what to do when unsure. Write it once, keep it, and the next time change two fields instead of starting from nothing. The assistant did not get smarter; you stopped making it guess."
    },

    considerations: [
        "Start with the deliverable, not the background.",
        "Say who the result is for.",
        "Give facts and name the material you will paste.",
        "Write the rules and the shape of the answer, one per line.",
        "State how you will judge it and ask for a self-check.",
        "Decide what should happen when something is unclear."
    ],

    faq: [
        {
            question: "Does a longer prompt always give a better answer?",
            answer: "No. A longer prompt with the same gaps gives a longer version of the same weak answer. What helps is the missing information, not more words: the deliverable, the reader, the facts, the rules and the criteria."
        },
        {
            question: "Should I use a role (\"act as an expert\") every time?",
            answer: "Only when the knowledge or tone it sets matters. \"Act as an experienced analyst\" changes how a summary is written; it does nothing for \"convert this list to JSON\". An unnecessary role is harmless but adds nothing."
        },
        {
            question: "Is this different for ChatGPT, Claude, Copilot or other assistants?",
            answer: "The structure is the same for all of them: they all answer better when the deliverable, the context, the rules and the criteria are stated. The differences between assistants are smaller than the difference between a vague request and a complete one."
        },
        {
            question: "What if I do not know how I will judge the result?",
            answer: "Then ask the assistant for that first: \"before you write it, list five ways a good summary of this survey could be judged\". Pick the ones you agree with and put them in the prompt. Deciding the criteria is part of the work, not a formality."
        },
        {
            question: "Does the AI Prompt Builder send my text to an AI service?",
            answer: "No. It composes the prompt in your browser from what you type and stores nothing. You decide where to paste it."
        }
    ]

};

export default article;
