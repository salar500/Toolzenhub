/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata lives in data/articles.js.

   Article:
   How to Give an AI Assistant Your Project's Context

   Category:
   AI

   The question: why does an assistant that helped yesterday behave like a stranger today, and what is the smallest
   set of facts that fixes it? The guide describes a reusable context pack, which the Project Context Pack Builder
   writes; no usage figures are quoted.
========================================================= */


const article = {

    introduction:
        "Every new chat with an assistant starts from zero. It does not remember your project, the decision you made last week, the file that must not be touched or the test that fails for an odd reason. People compensate by explaining again, badly, or by not explaining and correcting afterwards. A context pack is the third option: the facts written once, pasted at the start of every chat, and updated as the work moves.",

    author: { name: "ToolZen Hub", type: "Organization", role: "AI Workflow Guides" },

    tags: ["Project Context", "Claude Code", "Copilot", "Working with AI"],

    keyTakeaways: [
        "An assistant forgets everything between chats; a context pack is the project explained once and reused.",
        "The pack has two kinds of content: facts that rarely change (purpose, stack, key files, rules) and facts that change every day (current state, completed work, the next task).",
        "\"Completed work, do not redo\" prevents the most expensive mistake: an assistant rebuilding something finished last week.",
        "Known traps are the lessons that cost you time; each one written down is a mistake the assistant does not repeat.",
        "End the pack with how the assistant should respond: confirm in three lines, ask first, or start.",
        "Keep the pack in the project and refresh three sections before each chat."
    ],

    calculator: {
        description:
            "Describe the project once (purpose, stack, key files, what is done, traps, rules, the next task) and copy a context pack you can paste into any chat or save as project instructions."
    },

    tableOfContents: [
        { id: "why-the-assistant-is-a-stranger", label: "Why the Assistant Is a Stranger" },
        { id: "the-facts-that-rarely-change", label: "The Facts That Rarely Change" },
        { id: "the-facts-that-change-every-day", label: "The Facts That Change Every Day" },
        { id: "traps-and-rules", label: "Traps and Rules" },
        { id: "how-to-respond", label: "How to Respond" },
        { id: "keeping-the-pack-alive", label: "Keeping the Pack Alive" },
        { id: "article-faq-title", label: "Frequently Asked Questions" }
    ],

    sections: [
        {
            id: "why-the-assistant-is-a-stranger",
            heading: "1. Why the Assistant Is a Stranger",
            paragraphs: [
                "An assistant reads what is in the current chat and, where a tool allows it, the files it is given. It does not carry your project between conversations, and a long chat eventually loses its own beginning. So the help you get depends on what the chat contains, and most chats contain a question and nothing about the project the question lives in.",
                "The symptoms are familiar: a fix that uses a library the project does not have, a rewrite of something already finished, a change that breaks a rule everyone on the team knows and nobody wrote down. None of these is a reasoning failure. Each is a missing fact."
            ]
        },
        {
            id: "the-facts-that-rarely-change",
            heading: "2. The Facts That Rarely Change",
            paragraphs: [
                "Four things describe a project well enough to start work in it. What it does and for whom, in two or three sentences. How it is built: languages, framework, build tool, where it runs, how it is tested. Where things are: the key files and folders, one per line with a few words each. And the rules a reviewer would enforce.",
                "Written once, these take fifteen minutes and save them in every chat afterwards. Keep them short: a pack is a map, not the documentation. If a section grows past ten lines, it is probably two sections, or it belongs in a document the pack can point to."
            ]
        },
        {
            id: "the-facts-that-change-every-day",
            heading: "3. The Facts That Change Every Day",
            paragraphs: [
                "Three sections move with the work. The current state: which branch, what works, what is half done. The completed work that must not be redone. And the next task, written as a deliverable with its boundaries and the checks that decide whether it is done.",
                "The \"do not redo\" list earns its place the first time an assistant rebuilds a finished feature because nothing told it the feature existed. The verification line earns its place because a task with a named check tends to be finished, and one without tends to be \"mostly done\"."
            ]
        },
        {
            id: "traps-and-rules",
            heading: "4. Traps and Rules",
            paragraphs: [
                "Known traps are the things that look wrong but are intended, the check that fails for an odd reason, the machine's limits. \"The link checker fails the build on any link with an empty tool id\" or \"the laptop has 4 GB of memory: run one browser test project at a time\" are each a mistake you have already paid for once.",
                "Rules are the must and never: \"never push to main\", \"no new dependency without asking\", \"every bug fix comes with a test that fails first\", \"British English in all text\". A rule in the pack is enforced before the work; a rule in a review comment is enforced after it, at the cost of a rewrite."
            ]
        },
        {
            id: "how-to-respond",
            heading: "5. How to Respond",
            paragraphs: [
                "The last line of the pack says what should happen first. \"Reply with three lines: what the project is, what the next task is, what you will do first; then wait\" catches a misreading in seconds. \"Ask every question whose answer would change how you do the task\" suits an unfamiliar area. \"Start straight away and state assumptions as you make them\" suits a small, well-defined task.",
                "The three-line confirmation is the default worth adopting. It costs almost nothing, and when the three lines are wrong, you have saved the whole task."
            ]
        },
        {
            id: "keeping-the-pack-alive",
            heading: "6. Keeping the Pack Alive",
            paragraphs: [
                "Save the pack as a file in the project. Tools that read project instructions (a CLAUDE.md, a .cursorrules file, a GPT's instructions, a Gemini Gem) can read it from there; for a plain chat, paste it as the first message. Before each new chat, refresh the current state, the completed work and the next task; the rest rarely changes.",
                "In a long piece of work, a fresh chat with a current pack usually beats an old chat with a long memory: the assistant starts from accurate facts instead of a half-remembered thread."
            ]
        }
    ],

    example: {
        heading: "Example: Two Ways to Ask for the Same Change",
        paragraphs: [
            "Without a pack: \"Add an AI Tools card to the home page.\" The assistant must guess the framework, find the home page, guess the card's markup and style, and may well add a card by hand next to six that come from a catalog.",
            "With a pack: the assistant already knows the site is static, that the home cards are rendered from the tool catalog in one component, that the catalog is the single source of sections, that nothing is pushed to main, and that the check is one unit test and one browser test at two widths. The same request now has one reasonable interpretation, and the first attempt is usually the right one."
        ]
    },

    biggerPicture: {
        heading: "The Bigger Picture",
        text:
            "A context pack is onboarding for a colleague who forgets everything overnight. It is also, read back, a surprisingly good description of your own project: if you cannot fill in the purpose, the rules or the next task, that is worth knowing before anyone writes code. The pack costs fifteen minutes once and three edits a day; the alternative is explaining, correcting and rebuilding, every day, for as long as the project lasts."
    },

    considerations: [
        "Write the stable facts once: purpose, stack, key files, rules.",
        "Keep the current state, completed work and next task up to date.",
        "Record every trap you have already paid for.",
        "End with how the assistant should respond.",
        "Save it in the project and paste it at the start of each chat."
    ],

    faq: [
        {
            question: "How is a context pack different from a prompt?",
            answer: "A prompt asks for one result; a context pack describes the project so that every prompt after it is shorter and better. You write the pack once and reuse it, and write a new prompt for each task."
        },
        {
            question: "How long should it be?",
            answer: "As long as the facts need and no longer. Most packs are 250 to 600 words. A pack that tries to be the documentation stops being read; point to the documentation instead."
        },
        {
            question: "Can I use it with Claude Code, Cursor, Copilot or ChatGPT?",
            answer: "Yes. The pack is plain Markdown. Those tools read project instruction files, and the pack is a good first version of one; the next task section is the part you change each time. In a plain chat, paste it as the first message."
        },
        {
            question: "Does the pack replace the question I ask?",
            answer: "No. The pack sets the scene; the next task section states what you want now. For anything bigger than a one-line task, write the task itself with the AI Prompt Builder and paste it after the pack."
        },
        {
            question: "Is my project information stored by the Context Pack Builder?",
            answer: "No. The pack is composed in your browser and nothing is kept when you leave the page. Download it or copy it into your project to keep it."
        }
    ]

};

export default article;
